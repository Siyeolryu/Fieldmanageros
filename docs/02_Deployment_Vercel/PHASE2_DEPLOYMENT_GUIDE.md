# Phase 2 Dual-Role 지원 배포 가이드

**작성일**: 2026-04-21
**작업 완료 항목**: Phase 2 데이터베이스 스키마 확장 완료

---

## ✅ 완료된 작업

### 1. 데이터베이스 마이그레이션
- **파일**: `supabase/migrations/003_add_dual_role_support.sql`
- **변경**:
  - `workers` 테이블에 `profile_id`, `is_owner` 컬럼 추가
  - 인덱스 생성 (성능 최적화)
  - RLS 정책 업데이트 (dual-role 접근 권한)
  - `workers_with_profile` 뷰 생성 (조회 편의성)
  - `is_user_worker_in_site()` 함수 생성 (헬퍼 함수)

### 2. TypeScript 타입 정의 업데이트
- **파일**: `types/supabase.ts`
- **변경**:
  - `workers.Row/Insert/Update`에 `profile_id`, `is_owner` 추가
  - `workers_with_profile` 뷰 타입 추가
  - `is_user_worker_in_site` 함수 타입 추가
  - Relationships에 `profile_id` 외래키 관계 추가

### 3. Seed 데이터 업데이트
- **파일**: `supabase/seed.sql`
- **변경**:
  - 테스트 관리자를 근로자로도 등록 (Dual-Role 예시)
  - 모든 workers INSERT에 `profile_id`, `is_owner` 컬럼 추가
  - 테스트 관리자 출근 기록 추가

---

## 🎯 Dual-Role 개념

### 소규모 시공팀장의 현실
- **관리자 역할**: 현장 운영, 인력 배치, 자재 발주
- **근로자 역할**: 직접 작업에 투입 (타일 시공, 철근 작업 등)
- **세무 특징**: 사업소득 + 근로소득 동시 발생

### 데이터 구조
```sql
-- 예시: 박팀장 (profile_id 보유)
profiles (id: uuid-1234, email: 'park@example.com', role: 'manager')
   ↓ 연결
workers (
  id: uuid-worker-1,
  profile_id: uuid-1234,  -- profiles와 연결
  is_owner: TRUE,         -- 현장 소유자 표시
  name: '박팀장',
  hourly_rate: 250000
)

-- 예시: 김기사 (프로필 없는 일반 근로자)
workers (
  id: uuid-worker-2,
  profile_id: NULL,    -- 시스템 미사용
  is_owner: FALSE,     -- 일반 근로자
  name: '김기사',
  hourly_rate: 220000
)
```

---

## 🚀 배포 단계

### Step 1: 로컬 테스트 (개발 환경)

#### 1-1. 개발 서버 실행 확인
```bash
npm run dev
```

서버가 정상 실행되는지 확인 (TypeScript 컴파일 에러 없어야 함).

---

### Step 2: Supabase 마이그레이션 적용

#### 방법 A: Supabase Dashboard (추천)

1. **Supabase Dashboard 접속**
   ```
   https://app.supabase.com
   ```

2. **프로젝트 선택**
   - Your Project → SQL Editor

3. **마이그레이션 실행**
   - "New query" 클릭
   - `supabase/migrations/003_add_dual_role_support.sql` 파일 내용 복사
   - 붙여넣기 후 "Run" 클릭

4. **성공 확인**
   ```
   NOTICE: ✅ Dual-role support migration completed successfully
   NOTICE: 📋 Added columns: profile_id, is_owner
   NOTICE: 🔐 Updated RLS policies for dual-role access
   NOTICE: 👁️  Created workers_with_profile view
   NOTICE: 🔧 Created helper function: is_user_worker_in_site()
   ```

#### 방법 B: Supabase CLI (선택적)

```bash
# Supabase CLI가 설치되어 있다면
npx supabase migration up

# 또는
npx supabase db push
```

---

### Step 3: Seed 데이터 재적용 (선택적)

기존 seed 데이터를 삭제하고 새로운 dual-role 예시를 포함한 데이터를 삽입합니다.

**⚠️ 주의**: 기존 데이터가 삭제됩니다! 개발 환경에서만 실행하세요.

```sql
-- Supabase SQL Editor

-- Step 1: 기존 데이터 삭제 (역순으로)
DELETE FROM public.attendance;
DELETE FROM public.payroll;
DELETE FROM public.workers;
DELETE FROM public.sites;
DELETE FROM public.companies;
-- profiles는 auth.users와 연결되어 있으므로 삭제 안 함

-- Step 2: seed.sql 파일 내용 복사 & 실행
-- supabase/seed.sql 파일 내용 전체 복사 후 실행
```

---

### Step 4: 데이터 확인

#### 4-1. workers 테이블 확인

```sql
-- Supabase SQL Editor
SELECT
  id,
  name,
  profile_id,
  is_owner,
  hourly_rate,
  site_id
FROM public.workers
ORDER BY is_owner DESC, name;
```

**예상 결과**:
```
테스트 관리자 | profile_id: uuid | is_owner: TRUE  | hourly_rate: 250000
홍길동       | profile_id: NULL | is_owner: FALSE | hourly_rate: 15000
김철수       | profile_id: NULL | is_owner: FALSE | hourly_rate: 16000
...
```

#### 4-2. workers_with_profile 뷰 확인

```sql
SELECT
  name,
  is_owner,
  is_system_user,
  profile_email,
  profile_full_name
FROM public.workers_with_profile
ORDER BY is_owner DESC;
```

**예상 결과**:
```
name         | is_owner | is_system_user | profile_email       | profile_full_name
테스트 관리자 | TRUE     | TRUE           | test@example.com    | 테스트 관리자
홍길동       | FALSE    | FALSE          | NULL                | NULL
```

#### 4-3. 헬퍼 함수 테스트

```sql
-- 테스트 관리자가 곤지암삼리 현장에 근로자로 등록되어 있는지 확인
SELECT public.is_user_worker_in_site(
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::UUID,  -- test_user_id
  '33333333-3333-3333-3333-333333333333'::UUID   -- 곤지암삼리 현장 ID
);

-- 예상 결과: TRUE
```

---

### Step 5: RLS 정책 테스트

#### 5-1. 사용자 컨텍스트로 조회 테스트

```sql
-- 특정 사용자로 로그인한 것처럼 테스트
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"}';

-- 조회 가능한 근로자 확인
SELECT name, is_owner FROM public.workers;

-- 기대: 자기가 소유한 현장의 근로자 + 본인이 등록된 근로자
```

**⚠️ 중요**: 실제 로그인 기반 테스트는 애플리케이션에서 수행해야 합니다.

---

## 📊 변경 사항 요약

| 항목 | 변경 내용 |
|------|-----------|
| **DB 스키마** | `workers` 테이블에 `profile_id`, `is_owner` 추가 |
| **인덱스** | `idx_workers_profile`, `idx_workers_owner` 생성 |
| **RLS 정책** | 본인이 등록된 경우 조회 가능하도록 업데이트 |
| **뷰** | `workers_with_profile` 뷰 생성 (조인 편의성) |
| **함수** | `is_user_worker_in_site()` 헬퍼 함수 생성 |
| **TypeScript** | `types/supabase.ts`에 새 컬럼 및 뷰/함수 타입 추가 |
| **Seed** | Dual-role 예시 데이터 추가 (테스트 관리자) |

---

## 🔍 사용 예시

### 애플리케이션에서 Dual-Role 체크

```typescript
// lib/helpers/workers.ts
import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * 현재 로그인한 사용자가 특정 현장에 근로자로 등록되어 있는지 확인
 */
export async function isCurrentUserWorkerInSite(siteId: string): Promise<boolean> {
  const supabase = createSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .rpc('is_user_worker_in_site', {
      user_id: user.id,
      site_id: siteId
    })

  if (error) {
    console.error('Error checking worker status:', error)
    return false
  }

  return data === true
}
```

### 근로자 목록 조회 (프로필 정보 포함)

```typescript
// app/api/workers/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient()

  // workers_with_profile 뷰 사용
  const { data: workers, error } = await supabase
    .from('workers_with_profile')
    .select('*')
    .eq('site_id', siteId)
    .order('is_owner', { ascending: false })  // 팀장 먼저 표시
    .order('name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ workers })
}
```

### 본인 근로자 데이터 생성

```typescript
// app/api/sites/route.ts
export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ... 현장 생성 로직 ...

  // 옵션: 현장 생성 시 본인을 근로자로 추가
  if (includeMyself) {
    await supabase
      .from('workers')
      .insert({
        site_id: newSite.id,
        name: profile.full_name,
        profile_id: user.id,       // 본인과 연결
        is_owner: true,             // 현장 소유자 표시
        hourly_rate: profile.hourly_rate || 250000
      })
  }
}
```

---

## 🐛 트러블슈팅

### 문제 1: 마이그레이션 실행 오류

**에러**:
```
ERROR: column "profile_id" of relation "workers" already exists
```

**원인**: 이미 마이그레이션이 적용되어 있음

**해결**:
```sql
-- 이미 적용되었는지 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workers'
AND column_name IN ('profile_id', 'is_owner');

-- 결과가 있으면 이미 적용됨 (추가 조치 불필요)
```

### 문제 2: RLS 정책으로 데이터 조회 안 됨

**증상**: 근로자 목록이 비어있음 (실제로는 데이터 있음)

**원인**: RLS 정책이 너무 엄격하거나 잘못 설정됨

**디버깅**:
```sql
-- RLS 비활성화 후 테스트 (개발 환경만!)
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;

-- 데이터 조회 확인
SELECT * FROM public.workers;

-- 다시 활성화
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
```

**해결**: RLS 정책을 마이그레이션 파일대로 재생성

### 문제 3: TypeScript 타입 에러

**에러**:
```
Property 'profile_id' does not exist on type 'Worker'
```

**원인**: `types/supabase.ts` 업데이트가 반영 안 됨

**해결**:
```bash
# TypeScript 서버 재시작
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 개발 서버 재시작
npm run dev
```

### 문제 4: 뷰 조회 권한 오류

**에러**:
```
permission denied for view workers_with_profile
```

**원인**: RLS 정책이 뷰에 적용되지 않음

**해결**:
```sql
-- 뷰에 RLS 정책 추가
ALTER VIEW public.workers_with_profile SET (security_invoker = on);

-- 또는 뷰 대신 직접 조인 사용
SELECT w.*, p.email, p.full_name
FROM public.workers w
LEFT JOIN public.profiles p ON w.profile_id = p.id;
```

---

## 📈 성능 고려사항

### 인덱스 활용
- `profile_id`에 인덱스가 생성되어 빠른 조인 가능
- `is_owner = TRUE`인 경우만 필터링하는 부분 인덱스 생성됨

### 쿼리 최적화 팁
```sql
-- ✅ 좋은 예: 인덱스 활용
SELECT * FROM workers WHERE profile_id = 'uuid-1234';

-- ✅ 좋은 예: 뷰 사용
SELECT * FROM workers_with_profile WHERE is_system_user = TRUE;

-- ❌ 나쁜 예: 불필요한 조인
SELECT w.*, p.*, c.*, s.*
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
LEFT JOIN sites s ON w.site_id = s.id
LEFT JOIN companies c ON s.company_id = c.id;
-- 필요한 컬럼만 SELECT하세요!
```

---

## ✨ 다음 단계 (Phase 3)

Phase 2가 성공적으로 완료되면 Phase 3로 진행:

### Phase 3: 회원가입 Flow 개선 (예상 3일)

1. **역할 선택 UI 추가**
   - `app/auth/signup/page.tsx` 수정
   - 라디오 버튼: "관리자만" / "관리자+근로자" / "근로자만"

2. **프로필 설정 페이지 생성**
   - `/onboarding/profile` 경로
   - 시급, 은행, 계좌번호 입력 (근로자 역할 선택 시만)

3. **세무 안내 문구**
   - 본인 급여 지급 시 주의사항
   - 4대보험 신고 안내

자세한 내용은 `UX_IMPROVEMENT_REPORT.md` 참고.

---

## 📝 체크리스트

배포 전 최종 확인:

- [ ] `supabase/migrations/003_add_dual_role_support.sql` 파일 생성 확인
- [ ] `types/supabase.ts` 업데이트 확인
- [ ] `supabase/seed.sql` 업데이트 확인
- [ ] Supabase에 마이그레이션 적용
- [ ] workers 테이블에 새 컬럼 추가 확인
- [ ] workers_with_profile 뷰 생성 확인
- [ ] is_user_worker_in_site 함수 생성 확인
- [ ] Seed 데이터 재적용 (선택적)
- [ ] TypeScript 컴파일 에러 없음 확인
- [ ] Git commit & push

---

**작성자**: Claude Sonnet 4.5
**검토 필요**: 개발팀, 데이터베이스 관리자
