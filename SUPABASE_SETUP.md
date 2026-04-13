# 🗄️ Supabase 설정 가이드

> **노무Pro - Supabase 데이터베이스 초기화 완벽 가이드**
>
> 이 문서는 Supabase 프로젝트 생성부터 SQL 마이그레이션 실행까지 모든 단계를 안내합니다.

---

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [SQL 마이그레이션 실행](#2-sql-마이그레이션-실행)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [Supabase 클라이언트 설정](#4-supabase-클라이언트-설정)
5. [데이터 확인](#5-데이터-확인)
6. [트러블슈팅](#6-트러블슈팅)

---

## 1. Supabase 프로젝트 생성

### Step 1.1: Supabase 계정 생성

1. https://supabase.com 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인 (또는 이메일 가입)

### Step 1.2: 새 프로젝트 생성

1. **New Project** 버튼 클릭
2. 프로젝트 정보 입력:
   ```
   Name: nomu-pro (또는 원하는 이름)
   Database Password: [강력한 비밀번호 생성]
   Region: Northeast Asia (Seoul) - 한국에 가장 가까움
   Pricing Plan: Free (무료 플랜)
   ```
3. **Create new project** 클릭
4. ⏳ 프로젝트 생성 대기 (약 2-3분)

### Step 1.3: API Keys 확인

프로젝트 생성 완료 후:

1. 좌측 메뉴 → **Settings** → **API**
2. 다음 값들을 복사해두세요:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ 비밀로 유지)

---

## 2. SQL 마이그레이션 실행

### Step 2.1: SQL Editor 열기

1. Supabase Dashboard에서 좌측 메뉴 → **SQL Editor**
2. **New query** 버튼 클릭

### Step 2.2: 마이그레이션 파일 순서대로 실행

#### 📄 001_initial_schema.sql (기본 테이블)

1. SQL Editor에서 새 쿼리 생성
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭 (또는 Ctrl+Enter)
5. ✅ 성공 메시지 확인:
   ```
   Success. No rows returned.
   ```

#### 📄 002_rls_policies.sql (보안 정책)

1. 새 쿼리 생성
2. `supabase/migrations/002_rls_policies.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 성공 확인

#### 📄 003_utility_functions.sql (유틸리티 함수)

1. 새 쿼리 생성
2. `supabase/migrations/003_utility_functions.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 성공 확인

#### 📄 004_realtime.sql (실시간 구독)

1. 새 쿼리 생성
2. `supabase/migrations/004_realtime.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 성공 확인

#### 📄 seed.sql (샘플 데이터 - 선택)

⚠️ **개발/테스트 환경에서만 실행**

1. 새 쿼리 생성
2. `supabase/seed.sql` 파일 내용 복사
3. 붙여넣기 → **RUN**
4. ✅ 샘플 데이터 삽입 확인

### Step 2.3: 테이블 생성 확인

1. 좌측 메뉴 → **Database** → **Tables**
2. 다음 테이블들이 보이는지 확인:
   - ✅ `profiles`
   - ✅ `companies`
   - ✅ `sites`
   - ✅ `workers`
   - ✅ `attendance`
   - ✅ `payroll`

---

## 3. 환경 변수 설정

### Step 3.1: .env.local 파일 생성

```bash
# Windows (PowerShell)
cd C:\Users\tlduf\.cursor\projects\dev3_nomu
Copy-Item .env.example .env.local

# Mac/Linux
cd /path/to/dev3_nomu
cp .env.example .env.local
```

### Step 3.2: 실제 값으로 교체

`.env.local` 파일을 열고 다음 값들을 교체:

```env
# Supabase URL (Step 1.3에서 복사한 값)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (서버 사이드만)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3.3: 환경 변수 확인

```bash
# Next.js 개발 서버 재시작
npm run dev

# 브라우저 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// 출력: https://xxxxx.supabase.co
```

---

## 4. Supabase 클라이언트 설정

### Step 4.1: Supabase 패키지 설치

```bash
npm install @supabase/supabase-js
```

### Step 4.2: Supabase 클라이언트 생성

**파일**: `lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 4.3: TypeScript 타입 생성 (선택)

Supabase CLI를 사용하면 TypeScript 타입을 자동 생성할 수 있습니다.

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 링크
supabase link --project-ref your-project-id

# 타입 생성
npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

---

## 5. 데이터 확인

### Step 5.1: SQL Editor에서 쿼리 실행

```sql
-- 건설사 목록
SELECT * FROM public.companies;

-- 현장 목록
SELECT * FROM public.sites;

-- 근로자 목록
SELECT * FROM public.workers;

-- 출근 기록 (최근 10건)
SELECT * FROM public.attendance ORDER BY date DESC LIMIT 10;
```

### Step 5.2: Table Editor에서 확인

1. 좌측 메뉴 → **Table Editor**
2. 테이블 선택 (예: `workers`)
3. 데이터 확인 및 수동 편집 가능

### Step 5.3: API에서 데이터 가져오기 테스트

**파일**: `pages/api/test-supabase.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 건설사 목록 조회
  const { data, error } = await supabase
    .from('companies')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ companies: data })
}
```

브라우저에서 접속:
```
http://localhost:3000/api/test-supabase
```

---

## 6. 트러블슈팅

### 문제 1: "relation does not exist" 에러

**원인**: 테이블이 생성되지 않음

**해결**:
1. SQL Editor에서 테이블 확인:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
2. `001_initial_schema.sql` 다시 실행

### 문제 2: RLS 정책으로 인한 데이터 조회 실패

**원인**: Row Level Security가 활성화되어 있지만 인증되지 않은 사용자

**해결**:
```sql
-- 임시로 RLS 비활성화 (개발용만)
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 또는 service_role key 사용
const { data } = await supabase.auth.admin
  .createClient(supabaseUrl, serviceRoleKey)
  .from('companies')
  .select('*')
```

### 문제 3: API Key가 작동하지 않음

**원인**: 환경 변수가 로드되지 않음

**해결**:
1. `.env.local` 파일 위치 확인 (프로젝트 루트)
2. Next.js 개발 서버 재시작
3. 브라우저 콘솔에서 확인:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

### 문제 4: CORS 에러

**원인**: Supabase에 허용된 도메인이 등록되지 않음

**해결**:
1. Supabase Dashboard → **Settings** → **API**
2. **Allowed origins** 섹션
3. `http://localhost:3000` 추가

### 문제 5: Database Password를 잊어버림

**해결**:
1. Supabase Dashboard → **Settings** → **Database**
2. **Reset Database Password** 클릭
3. 새 비밀번호 설정
4. `.env.local`의 `DATABASE_URL` 업데이트

---

## 7. 다음 단계

✅ Supabase 설정 완료!

이제 다음을 진행할 수 있습니다:

### 7.1 Prisma 설정 (ORM)

```bash
npm install prisma @prisma/client
npx prisma init
```

**파일**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Supabase 테이블과 동일한 모델 정의
model Company {
  id String @id @default(uuid()) @db.Uuid
  name String
  // ...

  @@map("companies")
}
```

### 7.2 API Routes 구현

**파일**: `app/api/companies/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ companies: data })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('companies')
    .insert([body])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ company: data[0] }, { status: 201 })
}
```

### 7.3 실시간 구독 테스트

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useRealtimeAttendance(siteId: string) {
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    const channel = supabase
      .channel(`attendance-${siteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `site_id=eq.${siteId}`
        },
        (payload) => {
          console.log('Change received!', payload)
          // UI 업데이트 로직
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [siteId])

  return attendance
}
```

---

## 8. 유용한 명령어 모음

```bash
# Supabase 프로젝트 상태 확인
npx supabase status

# 로컬 Supabase 시작 (Docker 필요)
npx supabase start

# 로컬 Supabase 중지
npx supabase stop

# 마이그레이션 생성
npx supabase migration new migration_name

# 타입 생성
npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

---

## 9. 참고 자료

- 📘 [Supabase 공식 문서](https://supabase.com/docs)
- 📘 [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- 📘 [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- 📘 [Realtime 구독 가이드](https://supabase.com/docs/guides/realtime)
- 📘 [Prisma + Supabase 통합](https://www.prisma.io/docs/guides/database/supabase)

---

## ✅ 완료 체크리스트

- [ ] Supabase 계정 생성
- [ ] 프로젝트 생성 (nomu-pro)
- [ ] API Keys 복사
- [ ] `001_initial_schema.sql` 실행
- [ ] `002_rls_policies.sql` 실행
- [ ] `003_utility_functions.sql` 실행
- [ ] `004_realtime.sql` 실행
- [ ] `seed.sql` 실행 (선택)
- [ ] `.env.local` 파일 생성 및 설정
- [ ] `@supabase/supabase-js` 설치
- [ ] Supabase 클라이언트 생성
- [ ] 데이터 조회 테스트

---

**작성일**: 2026년 3월 31일
**버전**: 1.0
**작성자**: Orchestrator Agent

**다음 문서**: `ORCHESTRATOR.md` - 프로젝트 전체 진행 상황 확인
