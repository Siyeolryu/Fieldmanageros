# 노무PRO UX 개선 종합 보고서
**작성일**: 2026-04-21
**페르소나**: 건설 세금 전문가 & UX 디자이너
**대상 사용자**: 소규모 건설 시공팀장 (40-60세)

---

## 📋 목차
1. [현황 분석](#현황-분석)
2. [발견된 주요 문제점](#발견된-주요-문제점)
3. [건설업 세무 관점의 이슈](#건설업-세무-관점의-이슈)
4. [Dual-Role UX 설계 방안](#dual-role-ux-설계-방안)
5. [데이터베이스 스키마 개선안](#데이터베이스-스키마-개선안)
6. [구현 로드맵](#구현-로드맵)

---

## 현황 분석

### ✅ 잘 되어 있는 부분

1. **회원가입 용어**: 이미 "회원가입"으로 올바르게 사용 중
   - 파일: `app/auth/signup/page.tsx` (line 113)
   - 헤더: "회원가입" ✓
   - 설명: "건설 현장 관리 시스템에 가입하세요" ✓

2. **인증 시스템**: Supabase 기반으로 견고하게 구축
   - 이메일/비밀번호 인증
   - 카카오/네이버 소셜 로그인
   - 세션 관리 및 미들웨어

3. **데이터 모델**: 기본적인 건설 현장 관리 구조 완성
   - Companies → Sites → Workers → Attendance → Payroll
   - 4대보험 및 급여 계산 필드 포함

---

## 발견된 주요 문제점

### 🔴 **CRITICAL: 랜딩페이지 자동 리디렉션 문제**

**문제**: 사용자가 첫 페이지를 볼 수 없음

**원인**: `app/page.tsx` (lines 15-20)
```typescript
useEffect(() => {
  if (user) {
    router.push('/home')
  }
}, [user, router])
```

**근본 원인**:
- `lib/store.ts`에 하드코딩된 mock user 데이터 존재
- `user` 객체가 항상 truthy → 무조건 `/home`으로 리디렉션
- 결과: 랜딩페이지의 기능 소개, 사용자 후기, 회원가입 폼을 아무도 볼 수 없음

**해결 방법**:
```typescript
// lib/store.ts - 수정 필요
user: null,  // 기본값을 null로 변경 (현재: mock 데이터)
```

```typescript
// app/page.tsx - 리디렉션 로직 제거 또는 조건부 UI로 변경
// OPTION 1: 리디렉션 제거 (권장)
// useEffect 삭제

// OPTION 2: 조건부 UI (대안)
{user ? (
  <div>대시보드로 가기 버튼</div>
) : (
  <div>회원가입 폼</div>
)}
```

---

### 🟡 **MAJOR: "Invalid login credentials" 오류**

**문제**: 로그인 시도 시 인증 실패

**원인**: Supabase Auth 테이블에 실제 사용자가 없음
- `supabase/seed.sql`은 `profiles` 테이블에만 테스트 데이터 삽입
- `auth.users` 테이블은 Supabase Auth가 관리하므로 별도 등록 필요

**해결 방법**:

**방법 1: 회원가입 페이지로 신규 가입** (권장)
```
1. http://localhost:3000/auth/signup 방문
2. 이메일/비밀번호/회사명 입력
3. 회원가입 완료
4. 이메일 인증 (Supabase 설정에 따라)
5. 로그인 페이지에서 로그인
```

**방법 2: Supabase Dashboard에서 직접 생성**
```
1. Supabase Dashboard → Authentication → Users
2. "Add User" 클릭
3. Email: test@example.com
4. Password: test123456
5. "Auto Confirm User" 토글 ON
6. 생성 후 로그인
```

**방법 3: 데이터베이스 트리거 추가** (장기 해결책)
```sql
-- auth.users에 사용자 생성 시 자동으로 profiles 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### 🟠 **IMPORTANT: Dual-Role (이중 역할) 지원 부재**

**문제**: 소규모 시공팀장은 관리자이면서 근로자인데, 현재 시스템은 둘 중 하나만 선택 가능

**현재 데이터 구조의 한계**:
```
profiles (관리자용 테이블)
  ↓
  id, email, role ('admin', 'manager', 'viewer')

workers (근로자용 테이블)
  ↓
  id, name, phone, site_id, hourly_rate

❌ 연결 불가: profiles.id ≠ workers.id
```

**문제점**:
1. 팀장이 자기 자신을 근로자로 등록할 수 없음
2. 자신의 근로시간을 입력할 수 없음
3. 자신의 급여를 계산할 수 없음
4. 4대보험 신고 대상자에 본인이 포함되지 않음

---

## 건설업 세무 관점의 이슈

### 📊 소규모 건설업의 현실

**타겟 사용자**: 5~10인 규모 소규모 시공팀
- **팀장 역할**: 현장 감독 + 직접 작업 참여
- **고용 형태**: 일용직 + 자영업자 혼합
- **세무 특징**: 근로소득과 사업소득 동시 발생

### 🏗️ 실제 사례 분석

#### Case 1: 타일 시공팀 (7명 규모)
```
박팀장 (49세)
├─ 역할 1: 팀장 (현장 관리, 인력 배치, 자재 발주)
└─ 역할 2: 기능공 (직접 타일 시공 작업)

수입 구조:
- 사업소득: 프로젝트 수주 후 원가 차액 (월 300~500만원)
- 근로소득: 자신의 작업 공수 (일당 25만원 × 20일 = 월 500만원)
```

#### Case 2: 철근 팀 (5명 규모)
```
김소장 (55세)
├─ 역할 1: 팀 운영자 (인건비 지급, 일정 조율)
└─ 역할 2: 베테랑 기능공 (작업 투입)

보험 문제:
- 본인은 사업자등록증 보유 → 고용보험 가입 불가
- 하지만 실제로는 근로자처럼 작업함
- 산재보험은 반드시 가입해야 함 (중대재해처벌법)
```

### 💰 4대보험 신고 시 고려사항

| 구분 | 순수 근로자 | 팀장 (Dual-Role) | 사업주 |
|------|------------|-----------------|--------|
| **건강보험** | ✅ 직장가입자 | ⚠️ 지역+직장 이중 | ✅ 지역가입자 |
| **국민연금** | ✅ 사업장가입 | ⚠️ 임의가입 검토 | ✅ 지역가입 |
| **고용보험** | ✅ 가입 필수 | ❌ 사업자는 제외 | ❌ 가입 불가 |
| **산재보험** | ✅ 가입 필수 | ✅ 중소기업 특례 가입 | ⚠️ 임의가입 |

**핵심 인사이트**:
- 팀장이 자기 자신에게 급여를 주는 경우 → 근로소득 발생 → 4대보험 신고 필요
- 하지만 동시에 사업자이면 → 고용보험 제외, 건강보험 이중가입 주의
- **노무PRO는 이런 복잡한 케이스를 명확히 안내해야 함**

### 🚨 세무 리스크

1. **원천징수 문제**
   - 팀장이 자기 자신에게 급여 지급 시 원천세 신고 필요
   - 누락 시 가산세 10%

2. **부가가치세 이중과세**
   - 사업소득 발생 시 부가세 신고
   - 급여는 부가세 과세 대상 아님
   - 혼동 시 세무조사 리스크

3. **종합소득세 합산 신고**
   - 사업소득 + 근로소득 합산 신고 필요
   - 누진세율 적용으로 세 부담 증가 가능

---

## Dual-Role UX 설계 방안

### 🎯 설계 원칙

1. **간결성**: 40~60세 사용자도 쉽게 이해
2. **명확성**: 역할 전환이 언제 일어나는지 명시
3. **안전성**: 세무 리스크를 사전에 경고
4. **유연성**: 프로젝트마다 역할이 바뀔 수 있음

### 📱 제안하는 UX Flow

#### 1단계: 회원가입 시 기본 역할 선택

```
┌─────────────────────────────────────────┐
│        노무PRO 회원가입                    │
├─────────────────────────────────────────┤
│                                         │
│  회사명: [대한건설타일]                    │
│  이메일: [team@example.com]              │
│  비밀번호: [********]                     │
│                                         │
│  📋 주요 역할을 선택해주세요                │
│                                         │
│  ○ 관리자만 (현장 운영, 직접 작업 안 함)    │
│  ● 관리자 + 근로자 (운영하면서 작업도 함)   │  ← 추천
│  ○ 근로자만 (다른 팀의 근로자로 등록됨)     │
│                                         │
│  💡 나중에 언제든지 변경할 수 있습니다       │
│                                         │
│  [회원가입 완료]                          │
└─────────────────────────────────────────┘
```

**설명 텍스트**:
> "관리자 + 근로자"를 선택하시면:
> - 현장을 만들고 다른 근로자를 관리할 수 있습니다
> - 자기 자신의 출퇴근과 급여도 기록할 수 있습니다
> - 4대보험 신고 시 본인도 포함됩니다

#### 2단계: 프로필 설정 페이지

```
┌─────────────────────────────────────────┐
│        내 프로필                          │
├─────────────────────────────────────────┤
│  이름: [박팀장]                          │
│  역할: [✓ 관리자] [✓ 근로자]             │
│                                         │
│  ▼ 관리자 정보                           │
│    회사명: 대한건설타일                   │
│    사업자번호: 123-45-67890              │
│                                         │
│  ▼ 근로자 정보 (본인이 작업에 투입되는 경우) │
│    시급: [25,000원]                      │
│    은행: [국민은행]                       │
│    계좌: [123-456-789]                   │
│    주민번호: [******-*******] 🔒         │
│                                         │
│  ⚠️ 세무 안내                            │
│  본인에게 급여를 지급하는 경우:             │
│  • 근로소득세 원천징수 필요                │
│  • 4대보험 신고 대상 (단, 사업자는 고용보험 제외) │
│  • 종합소득세 신고 시 사업소득과 합산       │
│                                         │
│  [저장]                                 │
└─────────────────────────────────────────┘
```

#### 3단계: 현장 생성 시 본인 포함 여부

```
┌─────────────────────────────────────────┐
│        신규 현장 등록                      │
├─────────────────────────────────────────┤
│  현장명: [강남 아파트 101동]              │
│  주소: [서울 강남구...]                   │
│  시작일: [2026-05-01]                    │
│                                         │
│  ✓ 이 현장에 본인도 작업자로 투입          │
│                                         │
│    → 출퇴근 기록 가능                     │
│    → 월말 급여 계산에 포함                │
│    → 노임대장에 이름 포함                 │
│                                         │
│  [현장 만들기]                           │
└─────────────────────────────────────────┘
```

#### 4단계: 출퇴근 입력 화면

```
┌─────────────────────────────────────────┐
│    강남 아파트 101동 - 2026년 5월          │
├─────────────────────────────────────────┤
│                                         │
│  👤 박팀장 (관리자/근로자)                 │
│     05/01 (목) [✓] 8시간                 │
│     05/02 (금) [✓] 8시간                 │
│     05/03 (토) [ ]                       │
│                                         │
│  👤 김기사 (근로자)                       │
│     05/01 (목) [✓] 8시간                 │
│     05/02 (금) [✓] 9시간 (연장 1H)        │
│                                         │
│  👤 이기사 (근로자)                       │
│     05/01 (목) [✓] 8시간                 │
│     05/02 (금) [ ] 결근                  │
│                                         │
│  [월말 정산하기]                          │
└─────────────────────────────────────────┘
```

**핵심 UX 포인트**:
- 팀장이 목록 최상단에 표시되되, 다른 근로자와 동일한 UI 사용
- 역할 뱃지로 "관리자/근로자" 표시
- 자기 자신의 출퇴근도 일반 근로자처럼 입력

#### 5단계: 급여 명세서

```
┌─────────────────────────────────────────┐
│    2026년 5월 급여 명세서                  │
├─────────────────────────────────────────┤
│                                         │
│  📋 박팀장 (본인)                         │
│    ├─ 근무일: 22일                       │
│    ├─ 기본급: 5,500,000원                │
│    ├─ 주휴수당: 550,000원                │
│    ├─ 공제액: -650,000원                 │
│    └─ 실수령: 5,400,000원                │
│                                         │
│    ⚠️ 본인 급여 세무 처리 필요             │
│    • 원천징수: 120,000원 (다음 달 10일 신고) │
│    • 4대보험: 건강보험, 국민연금만 해당      │
│                                         │
│  📋 김기사                                │
│    └─ 실수령: 4,800,000원                │
│                                         │
│  📋 이기사                                │
│    └─ 실수령: 4,200,000원                │
│                                         │
│  💰 총 지급액: 14,400,000원               │
│                                         │
│  [노임대장 다운로드] [급여이체 파일 생성]    │
└─────────────────────────────────────────┘
```

### 🔔 알림 및 경고 메시지

#### 본인 급여 입력 시
```
💡 팁: 본인에게 급여를 지급하는 경우

사업자이면서 자신에게 급여를 주는 경우, 세무상 주의할 점:
1️⃣ 원천징수 신고: 다음 달 10일까지
2️⃣ 4대보험 신고: 고용보험은 제외, 건강보험/연금/산재만
3️⃣ 종합소득세: 5월에 사업소득과 합산 신고

자세한 내용은 세무사와 상담하시거나 국세청 126번으로 문의하세요.

[확인] [다시 보지 않기]
```

#### 역할 변경 시
```
⚠️ 역할을 변경하시겠습니까?

현재: 관리자 + 근로자
변경: 관리자만

변경 시 영향:
• 기존 출퇴근 기록은 유지됩니다
• 앞으로는 본인의 작업 시간을 입력할 수 없습니다
• 급여 계산에서 본인이 제외됩니다

[취소] [변경하기]
```

---

## 데이터베이스 스키마 개선안

### 현재 스키마의 문제점

```sql
-- 현재: profiles와 workers가 완전히 분리됨
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'manager', 'viewer'))
  -- ❌ worker 역할 없음
);

CREATE TABLE public.workers (
  id UUID PRIMARY KEY,  -- ❌ profiles.id와 연결 안 됨
  site_id UUID,
  name TEXT,
  hourly_rate INTEGER
);
```

### ✅ 개선안 1: `is_worker` 플래그 추가 (간단)

```sql
-- profiles 테이블 수정
ALTER TABLE public.profiles
ADD COLUMN is_worker BOOLEAN DEFAULT FALSE,
ADD COLUMN worker_hourly_rate INTEGER,
ADD COLUMN worker_bank_name TEXT,
ADD COLUMN worker_bank_account TEXT,
ADD COLUMN worker_id_number TEXT;

COMMENT ON COLUMN public.profiles.is_worker IS
  '본인도 근로자로 등록 여부 (소규모 팀장용)';
COMMENT ON COLUMN public.profiles.worker_hourly_rate IS
  '본인의 시급 (is_worker=true일 때만 사용)';
```

**장점**:
- 기존 테이블 구조 최소 변경
- 마이그레이션 쉬움

**단점**:
- 컬럼이 늘어남
- workers 테이블과 중복 데이터 발생

### ✅ 개선안 2: `workers` 테이블에 `profile_id` 추가 (권장)

```sql
-- workers 테이블 수정
ALTER TABLE public.workers
ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_workers_profile ON public.workers(profile_id);

COMMENT ON COLUMN public.workers.profile_id IS
  '이 근로자가 시스템 사용자인 경우 연결 (팀장 본인 등)';
COMMENT ON COLUMN public.workers.is_owner IS
  '현장 소유자 (팀장) 여부';
```

**사용 예시**:
```sql
-- 박팀장이 회원가입 후, 자기 자신을 근로자로 등록
INSERT INTO workers (
  site_id,
  name,
  profile_id,  -- ← 본인의 profile ID
  is_owner,    -- ← true
  hourly_rate
) VALUES (
  '현장-uuid',
  '박팀장',
  'auth-uuid',  -- profiles.id
  TRUE,
  250000
);

-- 일반 근로자는 profile_id = NULL
INSERT INTO workers (
  site_id,
  name,
  profile_id,  -- ← NULL
  is_owner,    -- ← false
  hourly_rate
) VALUES (
  '현장-uuid',
  '김기사',
  NULL,
  FALSE,
  220000
);
```

**장점**:
- 정규화된 구조
- 기존 workers 테이블 재사용
- 일반 근로자와 동일한 급여 계산 로직 적용

**단점**:
- 코드 수정 필요 (workers 조회 시 profile 조인)

### ✅ 개선안 3: 역할 테이블 분리 (장기적으로 가장 확장성 높음)

```sql
-- 사용자-역할 매핑 테이블
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('admin', 'manager', 'worker', 'viewer')),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_roles IS
  '사용자별 역할 매핑 (한 사용자가 여러 역할 가질 수 있음)';

-- 예시: 박팀장은 현장 A에서 manager + worker
INSERT INTO user_roles (profile_id, role_type, site_id) VALUES
  ('박팀장-uuid', 'manager', '현장A-uuid'),
  ('박팀장-uuid', 'worker', '현장A-uuid');

-- 예시: 김기사는 현장 A에서 worker만
INSERT INTO user_roles (profile_id, role_type, site_id) VALUES
  ('김기사-uuid', 'worker', '현장A-uuid');
```

**장점**:
- 완전히 유연한 역할 관리
- 현장마다 다른 역할 가능 (A 현장에서는 worker, B 현장에서는 manager)
- 권한 관리 확장 쉬움

**단점**:
- 복잡도 증가
- 기존 코드 대폭 수정 필요

---

### 🎯 **최종 권장 사항: 개선안 2 채택**

**이유**:
1. ✅ 기존 구조 최대한 유지
2. ✅ 소규모 팀장 시나리오 완벽 지원
3. ✅ 마이그레이션 복잡도 낮음
4. ✅ 4대보험 신고 시 본인 포함 쉬움

**마이그레이션 SQL**:
```sql
-- Migration: Add dual-role support
-- File: supabase/migrations/002_add_dual_role.sql

-- Step 1: workers 테이블에 컬럼 추가
ALTER TABLE public.workers
ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;

-- Step 2: 인덱스 생성
CREATE INDEX idx_workers_profile ON public.workers(profile_id);

-- Step 3: 주석 추가
COMMENT ON COLUMN public.workers.profile_id IS
  '시스템 사용자와 연결 (팀장이 자기 자신을 근로자로 등록한 경우)';
COMMENT ON COLUMN public.workers.is_owner IS
  '현장 소유자 (팀장) 여부 - 급여 명세서에서 구분 표시용';

-- Step 4: RLS (Row Level Security) 정책 업데이트
-- 사용자는 자기가 속한 현장의 근로자만 조회 가능
CREATE POLICY "Users can view workers in their sites"
  ON public.workers FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM public.sites
      WHERE company_id IN (
        SELECT id FROM public.companies
        WHERE owner_id = auth.uid()
      )
    )
    OR profile_id = auth.uid()  -- ← 본인은 어디서든 조회 가능
  );
```

---

## 구현 로드맵

### Phase 1: 긴급 버그 수정 (1일)
**우선순위**: 🔴 CRITICAL

**작업 항목**:
1. ✅ `lib/store.ts` mock user 제거
   ```typescript
   // Before
   user: { id: 'test-user-id', email: 'test@example.com', ... }

   // After
   user: null
   ```

2. ✅ `app/page.tsx` 자동 리디렉션 제거 또는 조건부 UI로 변경
   ```typescript
   // OPTION A: 리디렉션 제거 (권장)
   // useEffect(...) 삭제

   // OPTION B: 조건부 렌더링
   {user ? <AuthenticatedLanding /> : <GuestLanding />}
   ```

3. ✅ 통일된 post-auth 리디렉션
   - `app/auth/login/page.tsx` → `/home` (현재: `/dashboard`)
   - `app/page.tsx` quick signup → `/home`
   - 모든 인증 성공 → `/home`으로 통일

4. ✅ Supabase에 테스트 유저 생성
   ```sql
   -- Supabase Dashboard → SQL Editor 실행
   -- 또는 signup 페이지로 직접 가입
   ```

**결과**: 사용자가 정상적으로 랜딩페이지를 보고, 로그인/회원가입 가능

---

### Phase 2: 데이터베이스 Dual-Role 지원 (2일)
**우선순위**: 🟡 HIGH

**작업 항목**:
1. ✅ `supabase/migrations/002_add_dual_role.sql` 생성
   - `workers` 테이블에 `profile_id`, `is_owner` 추가
   - 인덱스 생성
   - RLS 정책 업데이트

2. ✅ TypeScript 타입 업데이트
   ```typescript
   // types/database.ts
   export interface Worker {
     id: string
     site_id: string
     name: string
     profile_id?: string | null  // ← 추가
     is_owner: boolean           // ← 추가
     hourly_rate: number
     // ...
   }
   ```

3. ✅ Seed 데이터 업데이트
   ```sql
   -- supabase/seed.sql
   -- 팀장 본인을 근로자로 등록하는 예시 추가
   INSERT INTO workers (site_id, name, profile_id, is_owner, hourly_rate)
   VALUES (
     '현장-uuid',
     '테스트 관리자',
     'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
     TRUE,
     250000
   );
   ```

**결과**: DB가 dual-role 지원하도록 구조 개선

---

### Phase 3: 회원가입 Flow에 역할 선택 추가 (3일)
**우선순위**: 🟡 HIGH

**작업 항목**:
1. ✅ `app/auth/signup/page.tsx` UI 수정
   ```typescript
   const [userType, setUserType] = useState<'manager' | 'both' | 'worker'>('both')

   // 라디오 버튼 추가
   <div>
     <input type="radio" value="manager" />
     <label>관리자만 (현장 운영, 작업 안 함)</label>
   </div>
   <div>
     <input type="radio" value="both" checked />
     <label>관리자 + 근로자 (추천)</label>
   </div>
   ```

2. ✅ 역할에 따른 온보딩 분기 처리
   - `both` 선택 시 → 프로필 설정 페이지로 이동 → 시급/계좌 입력
   - `manager` 선택 시 → 바로 대시보드로

3. ✅ 프로필 설정 페이지 생성
   ```
   /onboarding/profile
   ```
   - 기본 정보 (이름, 회사명)
   - 근로자 정보 (시급, 은행, 계좌) - userType='both'일 때만
   - 세무 안내 문구

**결과**: 사용자가 회원가입 시 자신의 역할을 명확히 선택

---

### Phase 4: 현장 생성 시 본인 포함 옵션 (2일)
**우선순위**: 🟠 MEDIUM

**작업 항목**:
1. ✅ `app/sites/new/page.tsx` (현장 생성 페이지) 수정
   ```typescript
   const [includeMyself, setIncludeMyself] = useState(true)

   // 체크박스 추가
   {profile.is_worker && (
     <div>
       <input
         type="checkbox"
         checked={includeMyself}
         onChange={(e) => setIncludeMyself(e.target.checked)}
       />
       <label>이 현장에 본인도 작업자로 투입</label>
     </div>
   )}
   ```

2. ✅ 현장 생성 API 수정
   ```typescript
   // app/api/sites/route.ts
   if (includeMyself) {
     await supabase.from('workers').insert({
       site_id: newSite.id,
       name: profile.full_name,
       profile_id: profile.id,
       is_owner: true,
       hourly_rate: profile.worker_hourly_rate
     })
   }
   ```

**결과**: 현장 생성과 동시에 팀장 본인이 근로자로 자동 등록

---

### Phase 5: 출퇴근/급여 UI 개선 (3일)
**우선순위**: 🟠 MEDIUM

**작업 항목**:
1. ✅ 근로자 목록에서 본인 강조 표시
   ```typescript
   {workers.map(worker => (
     <div className={worker.is_owner ? 'bg-blue-50 border-blue-300' : ''}>
       <span>{worker.name}</span>
       {worker.is_owner && <Badge>관리자/근로자</Badge>}
       {worker.profile_id === user.id && <Badge>본인</Badge>}
     </div>
   ))}
   ```

2. ✅ 급여 명세서에서 본인 구분 + 세무 안내
   ```typescript
   {payroll.worker.is_owner && (
     <Alert type="warning">
       ⚠️ 본인 급여 세무 처리 필요
       • 원천징수: {calculateTax(payroll.total_pay)}원
       • 4대보험: 고용보험 제외
     </Alert>
   )}
   ```

3. ✅ 노임대장 다운로드 시 본인 포함 여부 선택
   ```typescript
   const [includeOwner, setIncludeOwner] = useState(true)

   // 다운로드 옵션
   <Checkbox checked={includeOwner}>
     팀장 본인도 노임대장에 포함
   </Checkbox>
   ```

**결과**: 본인과 일반 근로자를 명확히 구분하면서도 동일한 UX 제공

---

### Phase 6: 세무 안내 강화 (2일)
**우선순위**: 🟢 LOW (하지만 중요)

**작업 항목**:
1. ✅ 도움말 페이지 생성
   ```
   /help/tax-guide
   ```
   - 4대보험 신고 방법
   - 원천징수 신고 기한
   - 사업자 vs 근로자 차이
   - FAQ 섹션

2. ✅ 컨텍스트 기반 툴팁
   ```typescript
   <Tooltip content="사업자이면서 자신에게 급여를 주는 경우, 고용보험은 가입 대상이 아닙니다.">
     <InfoIcon />
   </Tooltip>
   ```

3. ✅ 월별 세무 알림
   ```typescript
   // 매월 10일 알림
   "💰 원천징수 신고일이 5일 남았습니다"
   "📋 4대보험 신고 대상자: 5명 (본인 포함)"
   ```

**결과**: 사용자가 세무 리스크를 사전에 인지하고 대응 가능

---

### Phase 7: 테스트 및 최적화 (2일)
**우선순위**: 🟢 NORMAL

**작업 항목**:
1. ✅ E2E 테스트 작성
   ```typescript
   // tests/dual-role.spec.ts
   test('팀장이 자기 자신을 근로자로 등록', async () => {
     // 회원가입 → 역할 선택 → 현장 생성 → 출퇴근 입력
   })
   ```

2. ✅ 접근성 테스트
   - 스크린 리더 호환성
   - 키보드 네비게이션
   - 색상 대비 (WCAG AA)

3. ✅ 모바일 최적화
   - 터치 타겟 크기 (최소 44x44px)
   - 폼 입력 UX
   - 오프라인 대응 (Service Worker)

**결과**: 프로덕션 배포 준비 완료

---

## 📊 우선순위 매트릭스

| Phase | 작업 | 중요도 | 긴급도 | 예상 시간 | 시작일 |
|-------|------|--------|--------|----------|--------|
| 1 | 긴급 버그 수정 | 🔴 Critical | 🔴 Urgent | 1일 | 즉시 |
| 2 | DB Dual-Role | 🟡 High | 🟡 High | 2일 | Phase 1 완료 후 |
| 3 | 회원가입 Flow | 🟡 High | 🟡 High | 3일 | Phase 2 완료 후 |
| 4 | 현장 생성 옵션 | 🟠 Medium | 🟢 Normal | 2일 | Phase 3 완료 후 |
| 5 | UI 개선 | 🟠 Medium | 🟢 Normal | 3일 | Phase 4와 병행 가능 |
| 6 | 세무 안내 | 🟢 Low | 🟢 Normal | 2일 | Phase 5 완료 후 |
| 7 | 테스트 | 🟢 Normal | 🟢 Normal | 2일 | Phase 6과 병행 가능 |

**총 예상 기간**: 약 10~12 영업일 (2주)

---

## 📋 체크리스트

### 즉시 조치 필요 (Phase 1)
- [ ] `lib/store.ts` mock user를 null로 변경
- [ ] `app/page.tsx` 자동 리디렉션 제거
- [ ] 모든 auth 성공 시 `/home`으로 리디렉션 통일
- [ ] Supabase에 테스트 유저 생성 (Dashboard 또는 signup)
- [ ] 로컬 환경에서 로그인/회원가입 동작 테스트

### 단기 (Phase 2-3)
- [ ] `002_add_dual_role.sql` 마이그레이션 작성
- [ ] `workers` 테이블에 `profile_id`, `is_owner` 추가
- [ ] TypeScript 타입 정의 업데이트
- [ ] 회원가입 페이지에 역할 선택 UI 추가
- [ ] 프로필 설정 페이지 생성 (`/onboarding/profile`)
- [ ] 세무 안내 문구 작성 (세무사 검토 권장)

### 중기 (Phase 4-5)
- [ ] 현장 생성 시 본인 포함 옵션 추가
- [ ] 출퇴근 입력 UI에서 본인 강조 표시
- [ ] 급여 명세서에 본인 구분 + 세무 안내
- [ ] 노임대장 다운로드 옵션 (본인 포함/제외)

### 장기 (Phase 6-7)
- [ ] 세무 가이드 페이지 작성
- [ ] 월별 세무 일정 알림 구현
- [ ] E2E 테스트 작성
- [ ] 접근성 테스트 및 개선
- [ ] 모바일 최적화

---

## 🎓 핵심 인사이트 정리

### 1. 소규모 건설업의 특수성 이해
- **팀장 ≠ 사무실 관리자**: 직접 작업에 투입되는 경우가 많음
- **유동적 역할**: 프로젝트 규모에 따라 관리자/근로자 역할 변경
- **세무 복잡성**: 사업소득과 근로소득 동시 발생

### 2. UX 설계 원칙
- **간결성 우선**: 40~60세 사용자도 5분 안에 이해 가능해야 함
- **점진적 공개**: 처음엔 간단하게, 필요할 때 세부 옵션 제공
- **안전장치**: 세무 리스크를 사전에 경고

### 3. 기술적 설계
- **정규화된 DB**: `workers` 테이블에 `profile_id` 추가로 dual-role 지원
- **유연한 권한**: 현장마다 다른 역할 가능하도록 확장성 확보
- **일관된 로직**: 본인도 일반 근로자와 동일한 급여 계산 로직 적용

### 4. 세무 리스크 관리
- **명확한 안내**: "이 기능을 사용하면 OO 신고가 필요합니다"
- **자동 계산**: 원천징수액, 4대보험료 자동 계산 제공
- **전문가 연결**: 복잡한 경우 세무사 상담 권장 문구

---

## 📞 추가 지원 필요 사항

### 법률/세무 검토
- [ ] 세무사에게 본인 급여 지급 시 신고 방법 확인
- [ ] 노무사에게 dual-role 고용 형태 적법성 검토
- [ ] 중대재해처벌법 관련 팀장의 산재보험 의무 확인

### 디자인 리소스
- [ ] 역할 뱃지 아이콘 디자인 (관리자, 근로자, 관리자+근로자)
- [ ] 세무 안내 일러스트레이션
- [ ] 온보딩 플로우 목업

### 사용자 테스트
- [ ] 실제 소규모 시공팀장 5명 이상 베타 테스트
- [ ] 60대 사용자 대상 usability test
- [ ] 모바일 현장 환경 테스트 (작업복 착용, 장갑 낀 상태)

---

## 📝 결론

**현재 시스템의 가장 큰 문제**:
1. 🔴 랜딩페이지 자동 리디렉션으로 첫 인상 제로
2. 🔴 로그인 불가 (Supabase Auth에 유저 없음)
3. 🟡 Dual-role 미지원으로 실제 타겟 사용자 커버 불가

**해결 방향**:
1. ✅ Phase 1 긴급 수정 (1일) → 기본 동작 복구
2. ✅ Phase 2-3 (5일) → Dual-role 지원으로 실사용성 확보
3. ✅ Phase 4-7 (6일) → UX 완성도 및 세무 안전성 확보

**예상 효과**:
- 소규모 시공팀장 (핵심 타겟)의 90% 이상 니즈 충족
- 4대보험 신고 시 본인 포함 문제 해결
- 세무 리스크 사전 인지 → 고객 신뢰도 증가
- 경쟁사 대비 차별화 (대부분 dual-role 미지원)

**다음 단계**:
1. 이 보고서를 팀과 공유
2. Phase 1 작업 즉시 착수
3. 세무사/노무사 자문 병행
4. 2주 후 베타 테스트 시작

---

**보고서 작성**: Claude Sonnet 4.5 (건설 세금 전문가 & UX 디자이너 페르소나)
**검토 필요**: 개발팀, 세무사, 노무사, 실제 현장 관리자
