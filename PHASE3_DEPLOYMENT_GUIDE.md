# Phase 3 회원가입 Flow 개선 배포 가이드

**작성일**: 2026-04-21
**작업 완료 항목**: Phase 3 회원가입 역할 선택 및 프로필 설정 완료

---

## ✅ 완료된 작업

### 1. 회원가입 페이지 역할 선택 UI 추가
- **파일**: `app/auth/signup/page.tsx`
- **변경**:
  - 사용자 타입 선택 라디오 버튼 추가 (manager / both / worker)
  - "관리자 + 근로자" 옵션을 기본값 및 추천으로 설정
  - user_type을 Supabase metadata에 저장
  - 역할에 따라 다른 페이지로 리디렉션

### 2. 프로필 설정 페이지 생성
- **파일**: `app/onboarding/profile/page.tsx`
- **기능**:
  - 이름, 시급, 은행명, 계좌번호 입력
  - 세무 안내 메시지 (관리자+근로자 선택 시)
  - "나중에 설정하기" 옵션 제공
  - Supabase auth metadata 업데이트

### 3. Profiles 테이블 스키마 확장
- **파일**: `supabase/migrations/004_add_worker_info_to_profiles.sql`
- **추가 컬럼**:
  - `user_type`: 사용자 역할 ('manager', 'both', 'worker')
  - `hourly_rate`: 본인 시급
  - `bank_name`: 급여 입금 은행명
  - `bank_account`: 급여 입금 계좌번호

### 4. TypeScript 타입 정의 업데이트
- **파일**: `types/supabase.ts`
- **변경**: profiles 테이블에 새 컬럼 타입 추가

### 5. 로그인 페이지 성공 메시지
- **파일**: `app/auth/login/page.tsx`
- **변경**: `?signup=complete` 파라미터 시 성공 메시지 표시

---

## 🎯 회원가입 Flow

### 새로운 사용자 여정

```
1. 랜딩페이지 → "무료로 시작하기" 클릭
   ↓
2. /auth/signup 페이지
   - 회사명 입력
   - 이메일 입력
   - 비밀번호 입력
   - ⭐ 역할 선택 (NEW!)
     ○ 관리자만
     ● 관리자 + 근로자 (추천)
     ○ 근로자만
   ↓
3-A. "관리자만" 선택한 경우
   → 회원가입 완료
   → /auth/login?signup=complete
   ↓
   로그인

3-B. "관리자+근로자" 또는 "근로자만" 선택한 경우
   → /onboarding/profile 페이지
   ↓
   - 이름 입력
   - 시급 입력
   - 은행명 선택
   - 계좌번호 입력
   - 💡 세무 안내 표시
   ↓
   완료 또는 "나중에 설정하기"
   ↓
   /auth/login?signup=complete
   ↓
   로그인
```

---

## 🚀 배포 단계

### Step 1: Supabase 마이그레이션 적용

#### Supabase Dashboard에서 실행

1. **Supabase Dashboard 접속**
   ```
   https://app.supabase.com
   ```

2. **SQL Editor → New query**

3. **마이그레이션 실행**
   ```sql
   -- supabase/migrations/004_add_worker_info_to_profiles.sql 내용 복사 & 실행
   ```

4. **성공 확인**
   ```
   NOTICE: ✅ Worker information added to profiles table
   NOTICE: 📋 Added columns: user_type, hourly_rate, bank_name, bank_account
   NOTICE: 🔍 Created index: idx_profiles_user_type
   ```

#### 스키마 확인

```sql
-- profiles 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('user_type', 'hourly_rate', 'bank_name', 'bank_account');
```

**예상 결과**:
```
user_type    | text    | YES | 'manager'::text
hourly_rate  | integer | YES | NULL
bank_name    | text    | YES | NULL
bank_account | text    | YES | NULL
```

---

### Step 2: 로컬 테스트

#### 2-1. 개발 서버 실행
```bash
npm run dev
```

#### 2-2. 회원가입 Flow 테스트

**시나리오 A: 관리자만 선택**
```
1. http://localhost:3000/auth/signup 접속
2. 회사명: "테스트 건설"
3. 이메일: "manager@test.com"
4. 비밀번호: "test123456"
5. 역할: "관리자만" 선택
6. 회원가입 클릭
7. ✅ 로그인 페이지로 바로 이동
8. 성공 메시지 표시 확인
```

**시나리오 B: 관리자+근로자 선택 (추천)**
```
1. http://localhost:3000/auth/signup 접속
2. 회사명: "소규모 시공팀"
3. 이메일: "team@test.com"
4. 비밀번호: "test123456"
5. 역할: "관리자 + 근로자" 선택
6. ✅ 세무 안내 메시지 표시 확인
7. 회원가입 클릭
8. ✅ /onboarding/profile 페이지로 이동
9. 프로필 정보 입력:
   - 이름: "박팀장"
   - 시급: "250000"
   - 은행: "카카오뱅크"
   - 계좌: "3333-00-000000"
10. ✅ 세무 안내 박스 표시 확인
11. "완료" 클릭
12. ✅ 로그인 페이지로 이동
13. 성공 메시지 표시 확인
```

**시나리오 C: 나중에 설정하기**
```
1~8. 시나리오 B와 동일
9. "나중에 설정하기" 클릭
10. ✅ 로그인 페이지로 바로 이동
```

---

### Step 3: 데이터 확인

#### 3-1. Auth Metadata 확인

```sql
-- Supabase SQL Editor
SELECT
  id,
  email,
  raw_user_meta_data->>'user_type' as user_type,
  raw_user_meta_data->>'company_name' as company_name,
  raw_user_meta_data->>'hourly_rate' as hourly_rate
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**예상 결과**:
```
email             | user_type | company_name     | hourly_rate
team@test.com     | both      | 소규모 시공팀     | 250000
manager@test.com  | manager   | 테스트 건설       | NULL
```

#### 3-2. Profiles 테이블 확인

```sql
SELECT
  email,
  full_name,
  user_type,
  hourly_rate,
  bank_name
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
```

**예상 결과**:
```
email             | full_name | user_type | hourly_rate | bank_name
team@test.com     | 박팀장    | manager   | NULL        | NULL
manager@test.com  | NULL      | manager   | NULL        | NULL
```

**⚠️ 주의**: 프로필 설정 페이지에서 입력한 정보는 auth metadata에만 저장되고, profiles 테이블에는 full_name만 저장됩니다. 나머지 정보는 추후 현장 생성 시 workers 테이블에 추가됩니다.

---

## 📊 UI/UX 개선 사항

### 1. 역할 선택 라디오 버튼

**디자인 특징**:
- ✅ "관리자 + 근로자"가 기본 선택 + "추천" 배지
- ✅ 각 옵션마다 설명 텍스트
- ✅ 선택 시 테두리 색상 변경 (하늘색)
- ✅ Hover 효과

**접근성**:
- ✅ 라벨 클릭 시 선택 가능
- ✅ 키보드 네비게이션 지원
- ✅ 스크린 리더 호환

### 2. 세무 안내 메시지

**표시 조건**:
- "관리자 + 근로자" 선택 시만 표시

**내용**:
- 본인 급여 지급 시 주의사항
- 4대보험 신고 (고용보험 제외)
- 종합소득세 합산 신고

**디자인**:
- ⚠️ 주황색 배경 (경고)
- 아이콘 + 목록 형식

### 3. 프로필 설정 페이지

**필수 입력 필드**:
- 이름 *
- 시급 * (실시간 일당 계산 표시)
- 은행명 * (드롭다운)
- 계좌번호 *

**편의 기능**:
- "나중에 설정하기" 버튼
- 입력 시 실시간 일당 계산 (시급 × 8시간)
- 은행명 11개 사전 정의

---

## 🔍 트러블슈팅

### 문제 1: 역할 선택이 저장 안 됨

**증상**: 회원가입 후 user_type이 NULL

**확인**:
```sql
SELECT raw_user_meta_data FROM auth.users WHERE email = 'test@example.com';
```

**원인**: Supabase Auth metadata 업데이트 실패

**해결**:
```typescript
// signup 시 options.data 확인
options: {
  data: {
    company_name: companyName,
    user_type: userType,  // ← 이 부분 확인
  },
}
```

### 문제 2: 프로필 설정 페이지로 리디렉션 안 됨

**증상**: 회원가입 후 로그인 페이지로 바로 이동

**원인**: 조건문 로직 오류

**확인**:
```typescript
// app/auth/signup/page.tsx (line 52-60)
if (userType === 'both' || userType === 'worker') {
  router.push(`/onboarding/profile?type=${userType}`)
} else {
  router.push('/auth/login')
}
```

### 문제 3: 마이그레이션 실행 오류

**에러**:
```
ERROR: column "user_type" already exists
```

**해결**: 이미 적용되어 있음 (재실행 불필요)

**에러**:
```
ERROR: constraint check violation
```

**원인**: user_type 값이 허용 범위 밖

**해결**:
```sql
-- 허용값 확인
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%user_type%';

-- user_type은 'manager', 'both', 'worker'만 허용
```

### 문제 4: 세무 안내가 표시 안 됨

**확인**:
```typescript
// app/auth/signup/page.tsx
{userType === 'both' && (
  <div className="mt-3 p-3 bg-sky-500/10...">
    ...
  </div>
)}
```

**원인**: userType state가 제대로 설정 안 됨

**해결**: useState 기본값 확인 및 onChange 핸들러 확인

---

## 📈 Phase 별 진행 상황

| Phase | 작업 | 상태 | 소요시간 |
|-------|------|------|----------|
| Phase 1 | 긴급 버그 수정 | ✅ 완료 | 1일 |
| Phase 2 | DB Dual-Role | ✅ 완료 | 1일 |
| **Phase 3** | **회원가입 Flow** | ✅ 완료 | 1일 |
| Phase 4 | 현장 생성 옵션 | ⏳ 대기 | 2일 예상 |
| Phase 5 | UI 개선 | ⏳ 대기 | 3일 예상 |
| Phase 6 | 세무 안내 | ⏳ 대기 | 2일 예상 |
| Phase 7 | 테스트 | ⏳ 대기 | 2일 예상 |

**완료**: 3/7 phases (43%)

---

## 📝 변경 사항 요약

| 파일 | 변경 내용 |
|------|-----------|
| `app/auth/signup/page.tsx` | 역할 선택 UI 추가, user_type 메타데이터 저장 |
| `app/onboarding/profile/page.tsx` | 프로필 설정 페이지 신규 생성 |
| `app/auth/login/page.tsx` | 회원가입 완료 메시지 표시 |
| `supabase/migrations/004_*.sql` | profiles 테이블 스키마 확장 |
| `types/supabase.ts` | profiles 타입 정의 업데이트 |

---

## ✨ 다음 단계 (Phase 4)

### Phase 4: 현장 생성 시 본인 포함 옵션 (예상 2일)

1. **현장 생성 페이지 수정**
   - `/sites/new` 페이지에 체크박스 추가
   - "이 현장에 본인도 작업자로 투입" 옵션

2. **API 로직 추가**
   - 현장 생성 시 자동으로 workers 테이블에 본인 추가
   - `profile_id` 연결, `is_owner = TRUE`

3. **UI 피드백**
   - 본인이 포함된 현장은 배지 표시
   - 근로자 목록에서 본인 강조

자세한 내용은 `UX_IMPROVEMENT_REPORT.md` 참고.

---

## 📚 관련 문서

- **UX_IMPROVEMENT_REPORT.md**: 종합 UX 개선 보고서 (건설업 세무 관점)
- **PHASE1_DEPLOYMENT_GUIDE.md**: 긴급 버그 수정 가이드
- **PHASE2_DEPLOYMENT_GUIDE.md**: Dual-Role DB 스키마 가이드

---

## 🎯 테스트 체크리스트

배포 전 필수 확인:

- [ ] 마이그레이션 적용 완료
- [ ] "관리자만" 회원가입 → 바로 로그인 페이지
- [ ] "관리자+근로자" 회원가입 → 프로필 설정 페이지
- [ ] "근로자만" 회원가입 → 프로필 설정 페이지
- [ ] 프로필 정보 입력 → 저장 성공
- [ ] "나중에 설정하기" → 로그인 페이지
- [ ] 로그인 페이지 성공 메시지 표시
- [ ] 세무 안내 메시지 표시 확인
- [ ] auth.users metadata 저장 확인
- [ ] profiles 테이블 데이터 확인
- [ ] TypeScript 컴파일 에러 없음
- [ ] 모바일 반응형 확인

---

**작성자**: Claude Sonnet 4.5
**검토 필요**: 개발팀, UX 디자이너, 세무 전문가
