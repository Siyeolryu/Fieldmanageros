# Phase 1 긴급 수정 배포 가이드

**작성일**: 2026-04-21
**작업 완료 항목**: Phase 1 모든 작업 완료

---

## ✅ 완료된 작업

### 1. Mock User 데이터 제거
- **파일**: `lib/store.ts`
- **변경**: `user: null`로 초기화 (기존 mock 데이터 제거)
- **효과**: 모든 사용자가 비로그인 상태로 시작

### 2. 랜딩페이지 자동 리디렉션 제거
- **파일**: `app/page.tsx`
- **변경**:
  - Auto-redirect useEffect 제거
  - 로그인 사용자에게 "대시보드로 가기" 버튼 표시
  - 비로그인 사용자에게 "로그인" 링크 표시
- **효과**: 모든 사용자가 랜딩페이지를 볼 수 있음

### 3. Post-Auth 리디렉션 통일
- **파일**: `app/auth/login/page.tsx`
- **변경**: `/dashboard` → `/home`으로 변경
- **효과**: 모든 인증 성공 시 `/home`으로 일관되게 이동

### 4. 용어 통일
- **파일**: `app/auth/login/page.tsx`
- **변경**: "현장 관리자 등록" → "회원가입"
- **효과**: 더 친근하고 일반적인 용어 사용

### 5. 자동 프로필 생성 트리거
- **파일**: `supabase/migrations/002_auto_profile_creation.sql`
- **내용**: auth.users에 사용자 생성 시 자동으로 profiles 레코드 생성
- **효과**: 회원가입 시 프로필이 자동으로 생성됨

---

## 🚀 배포 단계

### Step 1: 로컬 테스트

#### 1-1. 개발 서버 시작
```bash
npm run dev
```

#### 1-2. 브라우저에서 확인
```
http://localhost:3000
```

**확인 사항**:
- ✅ 랜딩페이지가 정상적으로 보이는가?
- ✅ "로그인" 링크가 헤더에 표시되는가?
- ✅ 회원가입 폼이 보이는가?
- ✅ 사용자 후기 섹션이 보이는가?

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
   - `supabase/migrations/002_auto_profile_creation.sql` 파일 내용 복사
   - 붙여넣기 후 "Run" 클릭

4. **성공 확인**
   ```
   NOTICE: Auto profile creation trigger installed successfully
   ```

#### 방법 B: Supabase CLI (선택적)

```bash
# Supabase CLI가 설치되어 있다면
npx supabase migration up

# 또는 특정 마이그레이션만
npx supabase db push
```

---

### Step 3: 테스트 사용자 생성

#### 방법 A: 회원가입 페이지 사용 (추천)

1. **회원가입 페이지 접속**
   ```
   http://localhost:3000/auth/signup
   ```

2. **정보 입력**
   - 회사명: `테스트 건설`
   - 이메일: `test@example.com`
   - 비밀번호: `test123456`
   - 비밀번호 확인: `test123456`

3. **회원가입 완료**
   - "회원가입 완료!" 메시지 확인
   - 이메일 확인 안내 (Supabase 설정에 따라)

4. **로그인 테스트**
   ```
   http://localhost:3000/auth/login
   ```
   - 위에서 생성한 이메일/비밀번호로 로그인
   - `/home`으로 리디렉션되는지 확인

#### 방법 B: Supabase Dashboard에서 직접 생성

1. **Supabase Dashboard → Authentication → Users**

2. **"Add User" 클릭**

3. **정보 입력**
   - Email: `test@example.com`
   - Password: `test123456`
   - Auto Confirm User: **ON** (이메일 인증 건너뛰기)

4. **Create User 클릭**

5. **프로필 자동 생성 확인**
   - Dashboard → Table Editor → profiles
   - 방금 생성한 사용자의 이메일이 있는지 확인

---

### Step 4: 전체 Flow 테스트

#### 시나리오 1: 신규 사용자 (비로그인)

```
1. http://localhost:3000 접속
   → 랜딩페이지 정상 표시 ✅

2. 헤더의 "로그인" 클릭
   → /auth/login 이동 ✅

3. 하단의 "회원가입" 클릭
   → /auth/signup 이동 ✅

4. 회원가입 완료
   → "회원가입 완료!" 화면 ✅
   → 3초 후 /auth/login으로 리디렉션 ✅

5. 로그인
   → /home으로 리디렉션 ✅
```

#### 시나리오 2: 로그인 사용자

```
1. http://localhost:3000 접속 (로그인 상태)
   → 랜딩페이지 정상 표시 ✅
   → 헤더에 "대시보드로 가기" 버튼 표시 ✅

2. "대시보드로 가기" 클릭
   → /home 이동 ✅
```

#### 시나리오 3: 로그인 오류 해결 확인

```
1. /auth/login 접속

2. 존재하지 않는 이메일로 로그인 시도
   → "Invalid login credentials" 오류 표시 ✅
   (이전에는 Supabase 연결 문제로 오해했지만, 실제로는 사용자가 없었던 것)

3. 회원가입 후 로그인 재시도
   → 정상 로그인 ✅
```

---

## 📊 변경 사항 요약

| 파일 | 변경 내용 | 이유 |
|------|-----------|------|
| `lib/store.ts` | user 초기값을 null로 | Mock 데이터로 인한 자동 리디렉션 방지 |
| `app/page.tsx` | useEffect 리디렉션 제거 | 모든 사용자가 랜딩페이지 볼 수 있게 |
| `app/page.tsx` | 조건부 헤더 버튼 | 로그인 여부에 따라 다른 UI |
| `app/auth/login/page.tsx` | /dashboard → /home | 통일된 post-auth 경로 |
| `app/auth/login/page.tsx` | "현장 관리자 등록" → "회원가입" | 더 일반적인 용어 |
| `supabase/migrations/002_*.sql` | 자동 프로필 생성 트리거 | 회원가입 시 profiles 자동 생성 |

---

## 🐛 트러블슈팅

### 문제 1: 여전히 랜딩페이지가 안 보임

**원인**: 브라우저 캐시

**해결**:
```
1. 개발자 도구 열기 (F12)
2. Network 탭
3. "Disable cache" 체크
4. 페이지 새로고침 (Ctrl+Shift+R)
```

### 문제 2: "Invalid login credentials" 여전히 발생

**원인**: 아직 회원가입을 안 했거나, 마이그레이션이 적용 안 됨

**해결**:
```
1. Supabase Dashboard → Authentication → Users 확인
2. 사용자가 있는지 확인
3. 없다면 회원가입 또는 Dashboard에서 직접 생성
4. profiles 테이블에도 같은 id가 있는지 확인
```

### 문제 3: 마이그레이션 실행 오류

**에러**:
```
ERROR: trigger "on_auth_user_created" already exists
```

**해결**:
```sql
-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- 그 다음 마이그레이션 파일 다시 실행
```

### 문제 4: 프로필이 자동 생성 안 됨

**확인 사항**:
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM public.profiles;
SELECT * FROM auth.users;

-- 트리거 존재 확인
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**수동 프로필 생성**:
```sql
-- auth.users에는 있는데 profiles에 없는 경우
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'manager'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

---

## ✨ 다음 단계 (Phase 2)

Phase 1이 성공적으로 완료되면 Phase 2로 진행:

### Phase 2: Dual-Role 지원 (예상 2일)

1. **데이터베이스 스키마 확장**
   - `workers` 테이블에 `profile_id`, `is_owner` 추가
   - 팀장이 자기 자신을 근로자로 등록 가능

2. **회원가입 Flow 개선**
   - 역할 선택 UI 추가 (관리자만 / 관리자+근로자 / 근로자만)
   - 프로필 설정 페이지 생성

3. **세무 안내 문구**
   - 본인 급여 지급 시 세무 리스크 안내

자세한 내용은 `UX_IMPROVEMENT_REPORT.md` 참고.

---

## 📝 체크리스트

배포 전 최종 확인:

- [ ] `lib/store.ts` 변경사항 커밋
- [ ] `app/page.tsx` 변경사항 커밋
- [ ] `app/auth/login/page.tsx` 변경사항 커밋
- [ ] 마이그레이션 파일 커밋
- [ ] Supabase에 마이그레이션 적용
- [ ] 테스트 사용자 생성
- [ ] 로그인/회원가입 Flow 테스트
- [ ] 랜딩페이지 정상 표시 확인
- [ ] Git commit & push
- [ ] Vercel 재배포 (자동 또는 수동)

---

**작성자**: Claude Sonnet 4.5
**검토 필요**: 개발팀, QA 팀
