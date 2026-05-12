# 랜딩 페이지 이슈 리포트

**작성일**: 2026-05-03
**URL**: https://dev3nomu.vercel.app

---

## 🐛 발견된 문제점

### 1. "둘러보기" 버튼 작동 문제

**위치**: 헤더 오른쪽 상단

**현재 동작**:
```typescript
// app/page.tsx:124-133
<button
  onClick={() => {
    const { setGuestMode } = useAuthStore.getState()
    setGuestMode(true)
    router.push('/home')
    toast.success('게스트 모드로 입장했습니다...')
  }}
>
  둘러보기
</button>
```

**문제**:
- 버튼 클릭 시 작동하지 않음
- `useAuthStore.getState()` 호출 방식이 컴포넌트 외부에서 실행될 수 있음
- 게스트 모드 상태가 제대로 설정되지 않을 가능성

**제안 수정**:
```typescript
const { setGuestMode } = useAuthStore()

<button
  onClick={() => {
    setGuestMode(true)
    router.push('/home')
    toast.success('게스트 모드로 입장했습니다. 데이터는 브라우저에만 저장됩니다.')
  }}
>
  둘러보기
</button>
```

---

### 2. "시작하기" 버튼 UX 개선 필요

**현재 동작**:
```typescript
// app/page.tsx:134-142
<button
  onClick={() => {
    document.getElementById('quick-signup')?.scrollIntoView({ behavior: 'smooth' })
  }}
>
  시작하기
</button>
```

**문제**:
- 단순 스크롤만 수행
- 사용자가 무엇을 해야 하는지 명확하지 않음
- 클릭 후 피드백 부족

**제안 개선**:

**Option 1: 이메일 입력 필드 포커스**
```typescript
<button
  onClick={() => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement
    emailInput?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => emailInput?.focus(), 500)
  }}
>
  시작하기
</button>
```

**Option 2: 회원가입 페이지로 이동**
```typescript
<button onClick={() => router.push('/auth/signup')}>
  시작하기
</button>
```

**Option 3: 온보딩 페이지 생성** (권장)
- `/onboarding` 페이지 생성
- 3단계 안내: 이메일 입력 → 이메일 확인 → 프로필 설정

---

### 3. 🔴 이메일 확인 링크가 전송되지 않음 (Critical)

**증상**:
- 이메일 입력 후 "3분 만에 무료 시작" 클릭
- `https://dev3nomu.vercel.app/auth/confirm-email?email=xxx` 페이지로 이동 ✅
- **하지만 실제 이메일에 확인 링크가 오지 않음** ❌

**원인 분석**:

#### 1. Supabase 이메일 설정 확인 필요

**확인 항목**:
```
Supabase Dashboard → Authentication → Email Templates
```

- [ ] "Confirm signup" 템플릿 활성화 여부
- [ ] SMTP 설정 완료 여부
- [ ] 테스트 이메일 전송 성공 여부

**기본 설정**:
- Supabase는 기본적으로 이메일 확인을 **비활성화** 상태로 시작
- 이메일 확인을 활성화하려면 수동 설정 필요

#### 2. 코드 레벨 문제

**현재 코드** (`app/api/auth/quick-signup/route.ts`):
```typescript
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password: tempPassword,
  options: {
    emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
  },
})
```

**문제**:
1. `emailRedirectTo`는 설정되어 있지만, Supabase의 이메일 확인 설정이 꺼져있으면 이메일이 전송되지 않음
2. 임시 비밀번호를 생성하지만, 사용자에게 전달되지 않음
3. 이메일 템플릿에서 사용할 수 있는 메타데이터가 부족함

---

## 🔧 해결 방법

### 3-1. Supabase 이메일 설정 (필수)

#### Step 1: Supabase 대시보드 접속
```
https://supabase.com/dashboard
→ 프로젝트 선택
→ Authentication
→ Settings
```

#### Step 2: 이메일 확인 활성화
```
Email → Enable email confirmations: ON
```

#### Step 3: SMTP 설정 (선택)

**Option A: Supabase 기본 SMTP 사용** (권장 - 테스트용)
- Supabase에서 제공하는 기본 이메일 서비스 사용
- 제한: 하루 4개 이메일까지 무료

**Option B: 커스텀 SMTP 설정** (프로덕션 권장)
```
Settings → SMTP Settings

Host: smtp.gmail.com (또는 다른 SMTP 서버)
Port: 587
Username: your-email@gmail.com
Password: app-specific-password
```

**Gmail 사용 시**:
1. Google 계정에서 2단계 인증 활성화
2. 앱 비밀번호 생성: https://myaccount.google.com/apppasswords
3. 생성된 16자리 비밀번호를 Supabase에 입력

#### Step 4: 이메일 템플릿 설정
```
Authentication → Email Templates → Confirm signup
```

**기본 템플릿**:
```html
<h2>이메일 주소를 확인해주세요</h2>

<p>안녕하세요,</p>

<p>노무PRO 회원가입을 완료하려면 아래 버튼을 클릭하여 이메일 주소를 확인해주세요.</p>

<a href="{{ .ConfirmationURL }}">이메일 확인하기</a>

<p>감사합니다.<br>노무PRO 팀</p>
```

**사용 가능한 변수**:
- `{{ .Email }}`: 사용자 이메일
- `{{ .ConfirmationURL }}`: 확인 링크
- `{{ .Token }}`: 인증 토큰
- `{{ .Data.quick_signup }}`: 커스텀 메타데이터

#### Step 5: 테스트
```
Supabase Dashboard → Authentication → Users
→ "Invite user" 클릭
→ 테스트 이메일 입력
→ 이메일 수신 확인
```

---

### 3-2. 코드 개선 (선택)

**더 나은 에러 메시지 제공**:

```typescript
// app/api/auth/quick-signup/route.ts

// 이메일 전송 상태 확인 추가
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password: tempPassword,
  options: {
    data: {
      quick_signup: true,
      signup_source: 'landing_page',
      signup_method: 'email_only',
    },
    emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
  },
})

// 디버깅 로그 추가
console.log('Signup result:', {
  hasUser: !!signUpData.user,
  hasSession: !!signUpData.session,
  userId: signUpData.user?.id,
  emailConfirmationSent: signUpData.user && !signUpData.session,
})

if (signUpData.user && !signUpData.session) {
  return NextResponse.json({
    success: true,
    user: signUpData.user,
    message: '가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.',
    requiresEmailConfirmation: true,
    debugInfo: {
      emailSent: true,
      checkSpamFolder: true,
    },
  })
}
```

**confirm-email 페이지 개선**:

```typescript
// app/auth/confirm-email/page.tsx

<div className="space-y-4">
  <h1>이메일을 확인해주세요</h1>

  <p>{email}로 확인 링크를 보냈습니다.</p>

  <div className="bg-yellow-50 p-4 rounded-lg">
    <p className="font-bold">이메일이 오지 않나요?</p>
    <ul className="list-disc pl-5 space-y-1">
      <li>스팸 메일함을 확인해주세요</li>
      <li>이메일 주소가 정확한지 확인해주세요</li>
      <li>최대 5분 정도 소요될 수 있습니다</li>
    </ul>
  </div>

  <button onClick={handleResendEmail}>
    이메일 다시 보내기
  </button>
</div>
```

---

## 📋 수정 우선순위

### Priority 1 (즉시)
1. ✅ **Supabase 이메일 설정 확인 및 활성화**
   - 이메일 확인 활성화
   - SMTP 설정 (기본 또는 Gmail)
   - 이메일 템플릿 설정

### Priority 2 (단기)
2. ⬜ **"둘러보기" 버튼 수정**
   - `useAuthStore.getState()` → `useAuthStore()` 훅 사용
   - 게스트 모드 상태 확인 로직 추가

3. ⬜ **이메일 재전송 기능 추가**
   - confirm-email 페이지에 재전송 버튼
   - API 엔드포인트: `POST /api/auth/resend-confirmation`

### Priority 3 (중기)
4. ⬜ **"시작하기" 버튼 UX 개선**
   - Option 1: 이메일 필드 포커스
   - Option 2: 온보딩 페이지 생성

5. ⬜ **에러 메시지 개선**
   - 더 구체적인 안내 메시지
   - 스팸 메일함 확인 안내

---

## 🧪 테스트 체크리스트

### 이메일 전송 테스트
- [ ] Supabase 이메일 확인 활성화 완료
- [ ] SMTP 설정 완료
- [ ] 테스트 이메일로 회원가입 시도
- [ ] 이메일 수신 확인 (5분 이내)
- [ ] 스팸 메일함 확인
- [ ] 확인 링크 클릭 시 정상 작동

### 버튼 기능 테스트
- [ ] "둘러보기" 클릭 → 게스트 모드로 /home 이동
- [ ] "시작하기" 클릭 → 이메일 필드로 스크롤/포커스
- [ ] 이메일 입력 후 "3분 만에 무료 시작" → confirm-email 페이지 이동

### 통합 테스트
- [ ] 신규 사용자 회원가입 전체 플로우
- [ ] 게스트 모드 → 회원 전환 플로우
- [ ] 소셜 로그인 (카카오, 네이버) 플로우

---

## 📚 참고 문서

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Setup Guide](https://supabase.com/docs/guides/auth/auth-smtp)

---

**다음 액션**:
1. Supabase 대시보드에서 이메일 설정 확인
2. 이메일 확인 활성화
3. 테스트 이메일 전송
4. 결과에 따라 코드 수정
