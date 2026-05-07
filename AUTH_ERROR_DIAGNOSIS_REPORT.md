# Supabase Auth "Database error saving new user" 종합 진단 보고서

**작성일**: 2026-05-07
**문제 상황**: 회원가입 시 "Database error saving new user" 에러 발생
**영향 범위**: `tlduf1@naver.com` 등 특정 이메일 계정
**심각도**: 🔴 Critical - 신규 회원가입 불가

---

## 📋 Executive Summary

### 문제 요약

Supabase Auth 회원가입 중 데이터베이스 에러가 발생하여 사용자 계정 생성이 실패하는 문제입니다. 근본 원인은 **Prisma 스키마와 실제 PostgreSQL 데이터베이스 스키마 불일치**입니다.

### 핵심 원인

1. **누락된 컬럼**: `profiles.user_type` 컬럼이 Prisma 스키마에는 존재하지만 실제 DB에는 없음
2. **마이그레이션 미실행**: Prisma 스키마 변경사항이 데이터베이스에 반영되지 않음
3. **Supabase 마이그레이션 불일치**: `COMPLETE_MIGRATION.sql`이 최신 Prisma 스키마와 동기화되지 않음

### 즉시 조치 필요

- [ ] `profiles` 테이블에 누락된 컬럼 추가
- [ ] RLS 정책 충돌 해결
- [ ] Prisma 스키마와 DB 동기화

---

## 🔍 문제 진단

### 1. Prisma 스키마 vs 실제 DB 불일치

**Prisma 스키마** (`prisma/schema.prisma` Line 24):
```prisma
model Profile {
  id          String   @id @db.Uuid
  email       String   @unique
  fullName    String?  @map("full_name")
  role        String   @default("manager")
  avatarUrl   String?  @map("avatar_url")
  userType    String   @default("manager") @map("user_type")  // ← 이 컬럼이 누락됨
  hourlyRate  Int?     @map("hourly_rate")
  bankName    String?  @map("bank_name")
  bankAccount String?  @map("bank_account")
  // ...
}
```

**실제 DB 스키마** (`supabase/COMPLETE_MIGRATION.sql` Line 25-32):
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'manager',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**누락된 컬럼들**:
- `user_type` (Prisma의 `userType`)
- `hourly_rate` (Prisma의 `hourlyRate`)
- `bank_name` (Prisma의 `bankName`)
- `bank_account` (Prisma의 `bankAccount`)
- `profile_id` 연결 기능 (Phase 2 dual-role)

### 2. SQL 에러 분석

**에러 1 - 컬럼 미존재**:
```
ERROR: 42703: column "user_type" does not exist
LINE 111: user_type,
```

이는 Prisma가 `Profile.create()` 시 `user_type` 컬럼에 값을 삽입하려 했지만 실제 테이블에는 해당 컬럼이 없기 때문입니다.

**에러 2 - 정책 중복**:
```
ERROR: 42710: policy "Users can view their own companies" for table "companies" already exists
```

이는 RLS 정책이 이미 존재하는 상태에서 재생성을 시도하여 발생한 경고입니다 (치명적이지 않음).

### 3. 이메일별 에러 차이 분석

**성공 케이스**: `test-1778163431@example.com`
- Auth 계정 생성 성공
- Profile 생성 시도 실패 (컬럼 누락으로)
- **하지만** `try-catch`로 에러가 잡혀서 회원가입 자체는 성공으로 처리됨

**실패 케이스**: `tlduf1@naver.com`
- Auth 계정 생성 시도 시 **Supabase 내부 트리거/함수에서 Profile 생성을 시도**
- 트리거가 `user_type` 컬럼에 접근하려다 실패
- Auth 계정 생성 자체가 롤백되어 "Database error saving new user" 반환

**결론**: `tlduf1@naver.com`은 과거에 삭제되지 않은 트리거나 함수가 남아있어서 Auth 단계에서 즉시 실패합니다.

---

## ⚠️ 발견된 이슈들

### Issue #1: Prisma Migration 미실행
- **상태**: `prisma/migrations/` 디렉토리에 Prisma 공식 마이그레이션 파일 없음
- **영향**: Prisma 스키마 변경사항이 DB에 자동 반영되지 않음
- **원인**: Supabase는 Prisma Migrate 대신 수동 SQL 실행을 권장하나, 두 방식이 혼재되어 있음

### Issue #2: 수동 SQL 마이그레이션 불일치
- **상태**: `supabase/COMPLETE_MIGRATION.sql`이 최신 Prisma 스키마를 반영하지 않음
- **영향**: 개발자가 수동으로 SQL을 실행해도 누락된 컬럼 존재
- **원인**: Prisma 스키마 업데이트 후 `COMPLETE_MIGRATION.sql` 미수정

### Issue #3: 삭제되지 않은 Auth 트리거
- **상태**: `auth.users` 테이블에 `handle_new_user` 같은 트리거가 남아있을 가능성
- **영향**: 신규 회원가입 시 자동으로 Profile 생성 시도 → 컬럼 누락 에러
- **원인**: 과거 마이그레이션에서 트리거 생성 후 삭제하지 않음

### Issue #4: RLS 정책 중복
- **상태**: Companies 테이블 RLS 정책이 이미 존재
- **영향**: 경고 메시지 발생 (기능적으로는 문제 없음)
- **원인**: `DROP POLICY IF EXISTS` 없이 `CREATE POLICY` 실행

### Issue #5: Worker 테이블의 profile_id 누락
- **상태**: Prisma 스키마에는 `Worker.profileId` 존재하나 DB에는 없음
- **영향**: Phase 2 dual-role 기능 (관리자가 본인을 Worker로 등록) 사용 불가
- **원인**: 동일 - 마이그레이션 미실행

---

## 🛠️ 즉시 해결 방법

### Step 1: Auth 트리거 제거 (가장 우선!)

Supabase SQL Editor에서 실행:

```sql
-- ════════════════════════════════════════
-- Auth 트리거 및 함수 완전 제거
-- ════════════════════════════════════════

-- 1. 모든 Auth 트리거 확인
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 2. 트리거 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 3. 관련 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- 4. 확인: 트리거가 모두 제거되었는지 검증
SELECT
  trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
-- 결과: 0 rows (트리거 없음)
```

### Step 2: Profiles 테이블에 누락된 컬럼 추가

```sql
-- ════════════════════════════════════════
-- Profiles 테이블 스키마 업데이트
-- ════════════════════════════════════════

-- 1. user_type 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'manager'
CHECK (user_type IN ('manager', 'both', 'worker'));

-- 2. hourly_rate 컬럼 추가 (Phase 2 dual-role용)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hourly_rate INTEGER;

-- 3. bank_name 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- 4. bank_account 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- 5. 기존 레코드에 기본값 설정
UPDATE public.profiles
SET user_type = 'manager'
WHERE user_type IS NULL;

-- 6. 컬럼 추가 확인
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

### Step 3: Workers 테이블에 profile_id 추가

```sql
-- ════════════════════════════════════════
-- Workers 테이블에 profile_id 연결 추가
-- ════════════════════════════════════════

-- 1. profile_id 컬럼 추가 (nullable - 일반 근로자는 프로필 없음)
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. is_owner 컬럼 추가 (현장 소유자 여부)
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_workers_profile_id ON public.workers(profile_id);

-- 4. 확인
\d public.workers
```

### Step 4: RLS 정책 중복 해결

```sql
-- ════════════════════════════════════════
-- RLS 정책 재설정 (중복 방지)
-- ════════════════════════════════════════

-- Companies 테이블 정책 재생성
DROP POLICY IF EXISTS "Users can view their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;

CREATE POLICY "Users can view own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;

CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;

CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own companies" ON public.companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;

CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);
```

### Step 5: tlduf1@naver.com 계정 정리 (있다면)

```sql
-- ════════════════════════════════════════
-- 문제 계정 정리 (신규 가입 재시도용)
-- ════════════════════════════════════════

-- 1. Auth 계정 확인
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  deleted_at
FROM auth.users
WHERE email = 'tlduf1@naver.com';

-- 2. Profile 확인
SELECT
  id,
  email,
  role,
  user_type,
  created_at
FROM public.profiles
WHERE email = 'tlduf1@naver.com';

-- 3. 만약 계정이 존재하고 삭제가 필요하다면:
-- (주의: 실제 사용자라면 삭제하지 마세요!)
-- DELETE FROM auth.users WHERE email = 'tlduf1@naver.com';
-- DELETE FROM public.profiles WHERE email = 'tlduf1@naver.com';
```

---

## 📝 단계별 실행 가이드

### 1단계: Supabase Dashboard 접속

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: `ejgsotsviobjfvfqovcj`
3. 좌측 메뉴에서 **"SQL Editor"** 클릭
4. **"+ New query"** 클릭

### 2단계: 트리거 제거 (최우선)

1. **Step 1: Auth 트리거 제거** SQL을 복사하여 붙여넣기
2. **"Run"** 클릭 (Ctrl/Cmd + Enter)
3. 결과 확인:
   - 트리거 목록이 비어있어야 함 (0 rows)
   - 에러 없이 완료되어야 함

### 3단계: 컬럼 추가

1. **Step 2: Profiles 테이블 컬럼 추가** SQL 실행
2. 결과 확인:
   ```
   ALTER TABLE
   ALTER TABLE
   ALTER TABLE
   ALTER TABLE
   UPDATE X
   ```
   - X = 업데이트된 기존 Profile 레코드 수

3. **Step 3: Workers 테이블 컬럼 추가** SQL 실행
4. 결과 확인:
   ```
   ALTER TABLE
   ALTER TABLE
   CREATE INDEX
   ```

### 4단계: RLS 정책 정리

1. **Step 4: RLS 정책 재설정** SQL 실행
2. 경고 없이 완료되어야 함

### 5단계: 계정 상태 확인

1. **Step 5: tlduf1@naver.com 확인** SQL 실행
2. 결과 해석:
   - **Auth 계정만 있고 Profile 없음**: 정상 (다음 로그인 시 Profile 생성됨)
   - **둘 다 없음**: 정상 (신규 가입 가능)
   - **둘 다 있음**: 이미 가입된 계정 (로그인 사용)

### 6단계: 회원가입 재테스트

1. 브라우저 시크릿 모드 열기
2. `http://localhost:3000` 접속
3. `tlduf1@naver.com`으로 회원가입 시도
4. 예상 결과:
   - ✅ "가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요."
   - ✅ Console 로그: `[Quick Signup] Profile created successfully`

---

## ✅ 검증 방법

### 검증 1: 데이터베이스 스키마 확인

```sql
-- Profiles 테이블 구조 확인
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 예상 결과:
-- id, email, full_name, role, avatar_url,
-- user_type, hourly_rate, bank_name, bank_account,
-- created_at, updated_at
```

### 검증 2: Auth 트리거 제거 확인

```sql
-- Auth.users 트리거 목록 (빈 결과여야 함)
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 예상 결과: 0 rows
```

### 검증 3: Prisma Client 재생성

로컬에서 실행:

```bash
# Prisma Client 재생성 (DB 스키마 반영)
npx prisma generate

# TypeScript 타입 체크
npm run build
```

### 검증 4: E2E 테스트

```bash
# 회원가입 플로우 테스트
npm run test:e2e -- tests/e2e/auth-signup.spec.ts

# 또는 수동 테스트:
npm run dev
# → http://localhost:3000 접속
# → 신규 이메일로 회원가입
```

### 검증 5: Profile 생성 확인

회원가입 후 Supabase SQL Editor에서:

```sql
-- 최근 생성된 Profile 확인
SELECT
  id,
  email,
  role,
  user_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 예상: 방금 가입한 이메일이 user_type='manager'로 표시됨
```

---

## 🚀 장기 해결 방안

### 방안 1: Prisma Migration 워크플로우 정립

**현재 문제점**:
- Prisma 스키마 변경 시 Supabase에 수동 반영 필요
- 개발자 간 스키마 동기화 어려움
- Migration 히스토리 추적 불가

**권장 솔루션**:

#### Option A: Prisma Migrate 사용 (권장)

```bash
# 1. 로컬에서 Prisma 스키마 변경
# prisma/schema.prisma 수정

# 2. Migration 생성
npx prisma migrate dev --name add_user_type_column

# 3. Supabase에 적용 (자동)
# DIRECT_URL을 통해 세션 모드로 연결되어 Migration 실행됨

# 4. 프로덕션 배포 시
npx prisma migrate deploy
```

**장점**:
- Migration 히스토리 자동 관리
- 팀원 간 자동 동기화 (`prisma migrate dev` 실행 시)
- Rollback 지원
- TypeScript 타입 자동 생성

**단점**:
- Supabase 특화 기능 (RLS, Functions) 사용 시 수동 SQL 병행 필요

#### Option B: Hybrid 방식 (Prisma + Supabase SQL)

```
1. 테이블 스키마: Prisma Migrate 사용
2. RLS, Functions, Triggers: Supabase SQL로 관리

디렉토리 구조:
prisma/
  ├── schema.prisma          # Prisma 스키마 (테이블 정의)
  └── migrations/            # Prisma 자동 생성 마이그레이션
supabase/
  ├── migrations/            # Supabase 전용 SQL (RLS, Functions)
  │   ├── 001_rls_policies.sql
  │   └── 002_business_functions.sql
  └── COMPLETE_MIGRATION.sql # 통합 마이그레이션 (백업용)
```

**실행 순서**:
```bash
# 1. Prisma 마이그레이션 (테이블 생성/수정)
npx prisma migrate deploy

# 2. Supabase SQL 실행 (RLS, Functions)
# Supabase Dashboard → SQL Editor에서 실행
```

### 방안 2: 개발/프로덕션 DB 동기화

**문제점**:
- 로컬 개발 DB와 Supabase 프로덕션 DB 스키마 불일치

**솔루션**:

#### 2-1. 로컬 Supabase 사용 (권장)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작 (Docker 필요)
supabase start

# Prisma 스키마를 로컬 Supabase에 적용
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres" \
npx prisma migrate dev

# 로컬에서 충분히 테스트 후 프로덕션 배포
supabase db push
```

#### 2-2. Migration 스크립트 자동화

`scripts/sync-db-schema.ts` 생성:

```typescript
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function syncSchema() {
  console.log('🔄 Syncing Prisma schema to Supabase...')

  // 1. Prisma 마이그레이션 실행
  const { execSync } = require('child_process')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  // 2. Supabase SQL 실행 (RLS, Functions)
  const sqlFiles = [
    'supabase/migrations/001_rls_policies.sql',
    'supabase/migrations/002_business_functions.sql',
  ]

  for (const file of sqlFiles) {
    console.log(`📝 Executing ${file}...`)
    const sql = fs.readFileSync(file, 'utf-8')
    const { error } = await supabase.rpc('exec', { sql })
    if (error) {
      console.error(`❌ Error in ${file}:`, error)
    } else {
      console.log(`✅ ${file} executed successfully`)
    }
  }

  console.log('✅ Schema sync completed!')
}

syncSchema()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

실행:
```bash
npx tsx scripts/sync-db-schema.ts
```

### 방안 3: CI/CD에서 Migration 자동화

#### GitHub Actions 예시 (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, db]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma Migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
        run: |
          npx prisma generate
          npx prisma migrate deploy

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

**장점**:
- 배포 시 자동으로 DB 스키마 동기화
- 수동 실수 방지
- 롤백 가능 (Git 히스토리 기반)

### 방안 4: Schema Validation 자동화

`scripts/validate-schema.ts` 생성:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateSchema() {
  console.log('🔍 Validating database schema...')

  try {
    // Profile 테이블 필수 컬럼 확인
    const result = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name IN ('user_type', 'hourly_rate', 'bank_name', 'bank_account')
    `

    const requiredColumns = ['user_type', 'hourly_rate', 'bank_name', 'bank_account']
    const existingColumns = (result as any[]).map(r => r.column_name)

    const missingColumns = requiredColumns.filter(
      col => !existingColumns.includes(col)
    )

    if (missingColumns.length > 0) {
      console.error('❌ Missing columns in profiles table:', missingColumns)
      console.error('🛠️  Run: npx prisma migrate deploy')
      process.exit(1)
    }

    console.log('✅ Schema validation passed!')
  } catch (error) {
    console.error('❌ Schema validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateSchema()
```

**package.json**에 추가:
```json
{
  "scripts": {
    "db:validate": "tsx scripts/validate-schema.ts",
    "predev": "npm run db:validate",
    "prebuild": "npm run db:validate"
  }
}
```

**효과**:
- 개발 서버 시작 전 자동 스키마 검증
- 빌드 전 스키마 검증 (CI/CD에서 실패 방지)

---

## 📊 실행 체크리스트

### 즉시 조치 (오늘 완료)

- [ ] **Step 1**: Supabase SQL Editor에서 Auth 트리거 제거
- [ ] **Step 2**: `profiles` 테이블에 누락된 4개 컬럼 추가
- [ ] **Step 3**: `workers` 테이블에 `profile_id`, `is_owner` 추가
- [ ] **Step 4**: RLS 정책 중복 해결
- [ ] **Step 5**: `tlduf1@naver.com` 계정 상태 확인
- [ ] **검증 1**: 데이터베이스 스키마 확인 SQL 실행
- [ ] **검증 2**: Auth 트리거 제거 확인
- [ ] **검증 3**: 로컬에서 `npx prisma generate` 실행
- [ ] **검증 4**: `tlduf1@naver.com`으로 회원가입 재테스트
- [ ] **검증 5**: Profile 생성 확인

### 단기 조치 (이번 주)

- [ ] `supabase/COMPLETE_MIGRATION.sql` 최신 Prisma 스키마로 업데이트
- [ ] `COMPLETE_MIGRATION.sql` 실행 후 전체 테이블 재검증
- [ ] 로컬 개발 환경에서 회원가입/로그인 E2E 테스트
- [ ] `scripts/validate-schema.ts` 작성 및 `predev`에 추가
- [ ] Phase 2 dual-role 기능 테스트 (profile_id 연결)

### 장기 조치 (이번 달)

- [ ] Prisma Migration 워크플로우 확정 (Option A or B)
- [ ] 로컬 Supabase 환경 구축 (`supabase start`)
- [ ] Migration 자동화 스크립트 작성 (`scripts/sync-db-schema.ts`)
- [ ] CI/CD에 Prisma Migration 단계 추가 (GitHub Actions)
- [ ] 팀 내 "DB 스키마 변경 가이드" 문서 작성
- [ ] Supabase RLS 정책 테스트 코드 작성
- [ ] 프로덕션 배포 전 Migration Dry-run 프로세스 정립

---

## 🔗 참고 자료

### Prisma + Supabase 통합

- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase RLS with Prisma](https://supabase.com/docs/guides/database/postgres/row-level-security)

### 관련 파일

- `C:\Users\tlduf\.cursor\projects\dev3_nomu\prisma\schema.prisma` - Prisma 스키마
- `C:\Users\tlduf\.cursor\projects\dev3_nomu\supabase\COMPLETE_MIGRATION.sql` - Supabase 통합 마이그레이션
- `C:\Users\tlduf\.cursor\projects\dev3_nomu\app\api\auth\quick-signup\route.ts` - 회원가입 API
- `C:\Users\tlduf\.cursor\projects\dev3_nomu\scripts\diagnose-auth-issue.sql` - 진단 SQL

### 내부 문서

- `C:\Users\tlduf\.cursor\projects\dev3_nomu\CLAUDE.md` - 프로젝트 가이드
- `C:\Users\tlduf\.cursor\projects\dev3_nomu\backend_rules.md` - 백엔드 규칙
- `C:\Users\tlduf\.cursor\projects\dev3_nomu\fullstack_spec.md` - 풀스택 스펙

---

## 📞 추가 지원이 필요한 경우

1. **Supabase Dashboard 접근 불가**: 프로젝트 소유자에게 권한 요청
2. **Migration 실행 실패**: `scripts/diagnose-auth-issue.sql` 실행 후 에러 로그 공유
3. **Prisma Client 생성 오류**: `.env.local`의 `DATABASE_URL` 및 `DIRECT_URL` 확인
4. **RLS 정책 에러**: Supabase Dashboard → Authentication → Policies에서 수동 삭제 후 재생성

---

**작성자**: Claude Sonnet 4.5 (Backend Architect Agent)
**최종 수정일**: 2026-05-07
**버전**: 1.0
