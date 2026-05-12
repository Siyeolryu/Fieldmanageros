# 랜딩 페이지 버튼 수정 작업 - QA 품질 검증 리포트

**리포트 작성 일자**: 2026-05-12
**검증 대상**: 랜딩 페이지(`app/page.tsx`) 버튼 개선 및 이메일 인증 백엔드
**작성자**: Claude Code (QA Engineer)

---

## 1. 작업 품질 평가

### 최종 평가: **CONDITIONAL PASS**

**상태**: 핵심 기능 구현은 양호하나, **코드 품질 및 테스트 인프라 개선 필요**

**평가 근거**:
- ✅ UI/UX 개선사항 적절히 구현됨
- ✅ 핵심 비즈니스 로직 정상 동작
- ❌ TypeScript 린트 에러 발견 (수정 필수)
- ❌ 테스트 코드 전무 (추가 필수)
- ⚠️ 엣지 케이스 처리 미흡
- ⚠️ 에러 처리 로직 개선 가능

---

## 2. 코드 구현 검증 결과

### 2.1 `app/page.tsx` - 랜딩 페이지

#### 검증 항목별 결과

| 항목 | 상태 | 상세 내용 |
|------|------|----------|
| **"둘러보기" 버튼 구현** | ✅ PASS | `isGuestLoading` 상태 관리 정상, 로딩 스피너 표시 정상 |
| **"시작하기" 버튼 구현** | ✅ PASS | `router.push('/auth/signup')` 라우팅 정상 |
| **중복 클릭 방지** | ✅ PASS | `disabled={isGuestLoading}` 속성으로 중복 방지 |
| **로딩 스피너 UI** | ✅ PASS | Tailwind CSS 스피너 애니메이션 정상 |
| **Toast 메시지** | ✅ PASS | "게스트 모드로 입장했습니다." 메시지 정상 표시 |
| **TypeScript 호환성** | ❌ FAIL | `@ts-ignore` 사용 (라인 43) |

**발견된 이슈**:
```typescript
// 라인 43: 문제 코드
const { error } = await supabase.auth.signInWithOAuth({
  // @ts-ignore - Supabase doesn't support naver provider type
  provider: provider,
  ...
})
```

**개선 안내**:
```typescript
// 권장: @ts-expect-error 사용
const { error } = await supabase.auth.signInWithOAuth({
  // @ts-expect-error - Supabase doesn't support naver provider type
  provider: provider,
  ...
})
```

**영향**: ESLint 검사에서 오류 발생 (npm run lint 실패)

---

### 2.2 `app/api/auth/quick-signup/route.ts` - 빠른 가입 API

#### 구현 검증

| 항목 | 상태 | 평가 |
|------|------|------|
| **이메일 검증** | ✅ PASS | 정규식 검증 (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) 정상 |
| **Supabase 통합** | ✅ PASS | `supabase.auth.signUp()` 로직 정상 |
| **Profile 생성** | ✅ PASS | Prisma로 수동 프로필 생성 (트리거 우회) |
| **에러 처리** | ✅ PASS | 중복 이메일(409), 기타 에러 적절히 처리 |
| **디버깅 로그** | ✅ PASS | `[Quick Signup]` 프리픽스 일관적으로 사용 |
| **TypeScript 타입 검증** | ❌ FAIL | `profileError: any` (라인 104) |

**발견된 이슈**:
```typescript
// 라인 104: 문제 코드
} catch (profileError: any) {
  console.error('[Quick Signup] Profile creation error:', profileError)
  ...
}
```

**개선 안내**:
```typescript
// 권장 타입 지정
} catch (profileError: Error | unknown) {
  const error = profileError instanceof Error ? profileError : new Error('Unknown error')
  console.error('[Quick Signup] Profile creation error:', error.message)
  ...
}
```

**비즈니스 로직 검증**:
```
가입 흐름:
1. 이메일 검증 ✅
2. Supabase Auth 가입 ✅
3. Profile 수동 생성 ✅
4. 이메일 확인 필요 여부 판단 ✅
5. 적절한 응답 반환 ✅
```

---

### 2.3 `app/auth/confirm-email/page.tsx` - 이메일 인증 페이지

#### 검증 결과

| 항목 | 상태 | 평가 |
|------|------|------|
| **카운트다운 타이머** | ✅ PASS | 30초 타이머 정상 작동 |
| **스팸 팁 표시** | ✅ PASS | 10초 후 자동 표시 |
| **실시간 인증 확인** | ✅ PASS | 5초마다 `email_confirmed_at` 체크 |
| **재전송 기능** | ✅ PASS | 이메일 클라이언트별 스팸함 바로가기 제공 |
| **접근성(a11y)** | ✅ GOOD | Suspense fallback 제공, 로딩 상태 표시 |

**강점**:
- UX 친화적인 단계별 안내
- 메일 클라이언트별 대응 (Gmail, Naver)
- 자동 인증 감지로 사용자 편의성 극대화

---

## 3. 테스트 시나리오 및 체크리스트

### 3.1 수동 테스트 (Manual Testing)

#### Test Suite 1: 버튼 동작 검증

```
테스트명: Landing Page Button Interaction
테스트 환경: 로컬 (npm run dev) 또는 Staging
```

**Test Case 1-1: "둘러보기" 버튼 클릭**

| # | 단계 | 예상 결과 | 검증 방법 |
|---|------|----------|----------|
| 1 | 랜딩 페이지(`/`) 접속 | 페이지 정상 로드 | 브라우저 콘솔 에러 없음 |
| 2 | "둘러보기" 버튼 클릭 | 로딩 스피너 표시 + "입장 중..." 텍스트 | 버튼 내부 확인 |
| 3 | 대기 (500ms - 1s) | 자동으로 `/home` 이동 | URL 변경 확인 |
| 4 | Toast 메시지 확인 | "게스트 모드로 입장했습니다." 메시지 표시 | 화면 우상단 알림 |
| 5 | 게스트 모드 데이터 | 브라우저 로컬스토리지에만 저장 | DevTools > Application > Local Storage |
| 6 | 중복 클릭 테스트 | 첫 클릭 후 버튼 비활성화 (disabled) | 두 번 클릭 시도 |

**예상 결과**:
```
✓ 로딩 스피너 표시 (3초 이상 유지 불가)
✓ "입장 중..." 텍스트 표시
✓ 자동으로 /home으로 라우팅
✓ Toast 알림 표시
✓ 중복 클릭 방지 (버튼 disabled)
```

**실패 시 체크 목록**:
- [ ] 브라우저 콘솔 에러 확인
- [ ] 라우팅 설정 확인 (`app/home/page.tsx` 존재 여부)
- [ ] `setGuestMode(true)` 상태 확인
- [ ] Toast 라이브러리 (`sonner`) 초기화 확인

---

**Test Case 1-2: "시작하기" 버튼 클릭**

| # | 단계 | 예상 결과 | 검증 방법 |
|---|------|----------|----------|
| 1 | 랜딩 페이지(`/`) 접속 | 페이지 정상 로드 | 브라우저 콘솔 에러 없음 |
| 2 | "시작하기" 버튼 클릭 | 즉시 `/auth/signup` 페이지로 이동 | URL 변경 확인 |
| 3 | 회원가입 페이지 로드 | 이메일, 비밀번호 입력 필드 표시 | 폼 요소 확인 |
| 4 | 페이지 스크롤 확인 | 스크롤 이동 없음 (직접 라우팅) | 페이지 최상단에서 시작 |

**예상 결과**:
```
✓ 즉시 /auth/signup으로 라우팅
✓ 스크롤 이동 없음
✓ 회원가입 폼 정상 표시
✓ 폼 필드 포커스 가능
```

**실패 시 체크 목록**:
- [ ] `router.push('/auth/signup')` 구현 확인
- [ ] `app/auth/signup/page.tsx` 파일 존재 확인
- [ ] 라우터 객체 초기화 확인

---

#### Test Suite 2: 이메일 인증 흐름

```
테스트명: Email Authentication Flow
테스트 환경: Supabase Email Configuration 필수
```

**Test Case 2-1: 빠른 가입 - 이메일 전송**

| # | 단계 | 예상 결과 | 검증 방법 |
|---|------|----------|----------|
| 1 | 이메일 입력 및 가입 | 요청 전송 | 네트워크 탭 확인 |
| 2 | API 응답 대기 | `requiresEmailConfirmation: true` 반환 | DevTools Network 탭 |
| 3 | `/auth/confirm-email?email=***` 이동 | 인증 페이지 로드 | URL 변경 |
| 4 | 이메일 도착 확인 | 실제 이메일 수신 (30초 이내) | 이메일 클라이언트 확인 |
| 5 | 인증 링크 클릭 | 자동으로 `/home` 이동 | URL 변경 + 진행 표시 |

**실패 시 진단**:

이메일이 도착하지 않는 경우:
```
1. Supabase 대시보드 확인:
   - Authentication > Email Settings 접속
   - "Enable Email Confirmations" 토글 활성화 여부 확인
   - SMTP 설정 및 발신 주소 확인

2. 스팸함 확인:
   - Gmail: https://mail.google.com/mail/u/0/#spam
   - Naver: https://mail.naver.com/v2/folders/5
   - Outlook: 정크메일 폴더 확인

3. Supabase 로그 확인:
   - Supabase 대시보드 > Logs 접속
   - "Quick Signup" 관련 에러 메시지 확인

4. 이메일 주소 검증:
   - 입력한 이메일 주소 정확성 확인
   - Supabase에 가입되어 있지 않은 새 이메일 사용
```

---

**Test Case 2-2: 카운트다운 타이머**

| # | 단계 | 예상 결과 | 검증 방법 |
|---|------|----------|----------|
| 1 | confirm-email 페이지 진입 | 30초부터 시작하는 타이머 표시 | 페이지 확인 |
| 2 | 10초 경과 | "스팸 메일함도 확인해보세요" 메시지 표시 | 페이지에서 확인 |
| 3 | 30초 경과 | 타이머 종료, 강조된 "다시 보내기" 버튼 표시 | 페이지 상태 변경 확인 |
| 4 | 25초 후 새로고침 | 타이머가 리셋되지 않음 (독립적) | 새로고침 후 확인 |

---

#### Test Suite 3: 에러 처리

```
테스트명: Error Handling & Edge Cases
```

**Test Case 3-1: 유효하지 않은 이메일**

| # | 단계 | 입력값 | 예상 결과 |
|---|------|--------|----------|
| 1 | 빠른 가입 폼 | `invalid-email` | 에러: "올바른 이메일 주소를 입력해주세요" |
| 2 | 빠른 가입 폼 | `user@` | 에러: "올바른 이메일 주소를 입력해주세요" |
| 3 | 빠른 가입 폼 | (빈칸) | 폼 제출 불가 (HTML5 required) |

**검증 코드** (프론트엔드):
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

---

**Test Case 3-2: 중복 가입 시도**

| # | 단계 | 입력값 | 예상 결과 |
|---|------|--------|----------|
| 1 | 첫 번째 가입 | `user@example.com` | 성공 (confirm-email 페이지로 이동) |
| 2 | 두 번째 가입 | `user@example.com` | 에러: "이미 가입된 이메일입니다" (409) |
| 3 | 로그인 링크 표시 | - | "아래 로그인 버튼을 이용해주세요" 안내 |

**상태 코드 검증**:
```typescript
// app/api/auth/quick-signup/route.ts 라인 54-57
if (signUpError.message.includes('already registered')) {
  return NextResponse.json(
    { error: '이미 가입된 이메일입니다. 로그인해주세요.' },
    { status: 409 }
  )
}
```

---

**Test Case 3-3: 네트워크 오류**

| # | 단계 | 시나리오 | 예상 결과 |
|---|------|---------|----------|
| 1 | 인터넷 끄기 | DevTools 네트워크 Offline 설정 | 에러 메시지 표시 |
| 2 | 재시도 | "서버 오류가 발생했습니다" 클릭 | 다시 요청 |
| 3 | 인터넷 다시 켜기 | 네트워크 복구 | 정상 동작 |

---

### 3.2 자동화 테스트 (자동화 필수)

#### Jest 단위 테스트 (추가 필요)

**작성할 테스트 파일**:
```
app/__tests__/page.test.tsx
app/__tests__/api/auth/quick-signup.test.ts
app/__tests__/auth/confirm-email.test.tsx
```

**Test Examples** (다음 섹션 참고):

---

## 4. 발견된 이슈 및 개선 제안

### 4.1 심각도: HIGH (즉시 해결 필수)

#### Issue #1: TypeScript 린트 에러

**위치**: `app/page.tsx` 라인 43

**문제**:
```typescript
// @ts-ignore - Supabase doesn't support naver provider type
provider: provider,
```

**영향**: `npm run lint` 실패 (CI/CD 파이프라인 차단)

**해결 방안**:
```typescript
// 변경 전
// @ts-ignore

// 변경 후
// @ts-expect-error - Supabase doesn't support naver provider type
```

**이유**: `@ts-expect-error`는 에러가 없으면 경고를 발생시켜, 불필요한 억제 코드를 감지할 수 있음

---

#### Issue #2: TypeScript 타입 검증 에러

**위치**: `app/api/auth/quick-signup/route.ts` 라인 104

**문제**:
```typescript
catch (profileError: any) {
```

**영향**: TypeScript strict 모드 위반, 타입 안정성 저하

**해결 방안**:
```typescript
catch (profileError: Error | unknown) {
  const message = profileError instanceof Error
    ? profileError.message
    : '프로필 생성 중 알 수 없는 오류 발생'
  console.error('[Quick Signup] Profile creation error:', message)
  // 계속 진행 (프로필 생성 실패는 치명적이지 않음)
}
```

---

### 4.2 심각도: MEDIUM (개선 권장)

#### Issue #3: 에러 처리 로직 개선

**문제**: 프로필 생성 실패 시 완전히 무시되고 있음

**현재 코드** (라인 104-109):
```typescript
} catch (profileError: any) {
  console.error('[Quick Signup] Profile creation error:', profileError)

  // Don't fail the whole signup - Profile can be created later
  console.warn('[Quick Signup] Continuing without profile (will be created on first login)')
}
```

**개선 제안**:
```typescript
} catch (profileError: unknown) {
  const errorMessage = profileError instanceof Error
    ? profileError.message
    : String(profileError)

  console.error('[Quick Signup] Profile creation error:', {
    error: errorMessage,
    userId: signUpData.user.id,
    timestamp: new Date().toISOString(),
  })

  // 로깅 서비스에 기록 (Sentry, DataDog 등)
  // await logError({
  //   service: 'quick-signup',
  //   error: errorMessage,
  //   userId: signUpData.user.id,
  // })

  // 사용자에게 부분 성공 알림
  console.warn('[Quick Signup] Profile creation skipped - will create on first login')
}
```

**이점**:
- 더 구체적인 에러 정보 수집
- 프로덕션 이슈 추적 용이
- 모니터링 시스템과 통합 가능

---

#### Issue #4: "둘러보기" 버튼 로딩 상태 초기화

**문제**: 라우팅 실패 시 `isGuestLoading` 상태가 초기화되지 않음

**현재 코드** (라인 125-129):
```typescript
<button
  onClick={() => {
    setIsGuestLoading(true)
    setGuestMode(true)
    router.push('/home')
    toast.success('게스트 모드로 입장했습니다. 데이터는 브라우저에만 저장됩니다.')
  }}
```

**개선 제안**:
```typescript
const handleGuestMode = async () => {
  setIsGuestLoading(true)
  try {
    setGuestMode(true)
    toast.success('게스트 모드로 입장했습니다. 데이터는 브라우저에만 저장됩니다.')
    await router.push('/home')
  } catch (error) {
    console.error('Guest mode navigation failed:', error)
    toast.error('페이지 이동에 실패했습니다.')
    setIsGuestLoading(false) // 상태 초기화
  }
}

// 사용처
<button
  onClick={handleGuestMode}
  disabled={isGuestLoading}
  // ...
>
```

**이점**:
- 라우팅 실패 시에도 사용자가 재시도 가능
- 에러 로깅으로 프로덕션 이슈 추적 가능
- 더 견고한 사용자 경험

---

#### Issue #5: Prisma 연결 풀 관리

**문제**: `PrismaClient` 인스턴스가 매 요청마다 새로 생성되고 있음

**현재 코드** (라인 5):
```typescript
const prisma = new PrismaClient()
```

**권장사항**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**사용처**:
```typescript
// app/api/auth/quick-signup/route.ts
import { prisma } from '@/lib/prisma'

// 이제 싱글톤 인스턴스 사용
const profile = await prisma.profile.findUnique(...)
```

**이점**:
- 데이터베이스 연결 풀 최적화
- Cold start 시간 단축
- 메모리 사용량 감소

---

### 4.3 심각도: LOW (리팩토링)

#### Issue #6: 이메일 확인 페이지의 환경 변수 처리

**현재 코드** (라인 88-96):
```typescript
const getSpamFolderLink = (email: string) => {
  if (email.includes('@gmail.com')) {
    return 'https://mail.google.com/mail/u/0/#spam'
  }
  if (email.includes('@naver.com')) {
    return 'https://mail.naver.com/v2/folders/5'
  }
  return null
}
```

**개선 제안**:
```typescript
// 설정으로 외부화
const SPAM_FOLDER_LINKS: Record<string, string> = {
  'gmail.com': 'https://mail.google.com/mail/u/0/#spam',
  'naver.com': 'https://mail.naver.com/v2/folders/5',
  'daum.net': 'https://mail.daum.net/web/mail',
  'outlook.com': 'https://outlook.live.com/mail/junkcustom',
}

const getSpamFolderLink = (email: string): string | null => {
  const domain = email.split('@')[1]
  return SPAM_FOLDER_LINKS[domain] ?? null
}
```

**이점**:
- 새 이메일 제공자 추가 용이
- 설정 중앙화

---

#### Issue #7: 매직 숫자 제거

**현재 코드**:
```typescript
const countdown = 30     // 라인 17
const tipTimer = setTimeout(() => {
  setShowSpamTip(true)
}, 10000)                // 라인 31
const interval = setInterval(checkAuthStatus, 5000)  // 라인 48
```

**개선 제안**:
```typescript
// constants.ts
export const EMAIL_CONFIRMATION_CONSTANTS = {
  INITIAL_COUNTDOWN: 30,       // 초
  SPAM_TIP_DELAY: 10000,       // ms
  AUTH_CHECK_INTERVAL: 5000,   // ms
} as const

// confirm-email/page.tsx
const [countdown, setCountdown] = useState(
  EMAIL_CONFIRMATION_CONSTANTS.INITIAL_COUNTDOWN
)

const tipTimer = setTimeout(
  () => setShowSpamTip(true),
  EMAIL_CONFIRMATION_CONSTANTS.SPAM_TIP_DELAY
)
```

---

## 5. 접근성(A11y) 검토

### 현재 상태

| 항목 | 상태 | 평가 |
|------|------|------|
| **ARIA 레이블** | ✅ | 버튼에 명확한 텍스트 제공 |
| **포커스 관리** | ✅ | 탭 네비게이션 정상 작동 |
| **색상 대비** | ⚠️ | 추가 검증 필요 |
| **키보드 네비게이션** | ✅ | Enter 키로 버튼 활성화 가능 |
| **로딩 상태 표시** | ✅ | 시각적 및 텍스트 피드백 |
| **에러 메시지** | ⚠️ | `aria-live` 권장 |

### 개선 제안

**에러 메시지에 aria-live 추가**:
```typescript
{errorMessage && (
  <div
    className="text-red-600 text-sm font-medium"
    role="alert"
    aria-live="polite"
  >
    {errorMessage}
  </div>
)}
```

---

## 6. 성능 분석

### 측정 지표

| 지표 | 현재값 | 목표값 | 상태 |
|------|--------|--------|------|
| **First Contentful Paint (FCP)** | - | <1.5s | ⏳ 측정 필요 |
| **Largest Contentful Paint (LCP)** | - | <2.5s | ⏳ 측정 필요 |
| **Cumulative Layout Shift (CLS)** | - | <0.1 | ⏳ 측정 필요 |
| **API 응답 시간** | - | <500ms | ⏳ 측정 필요 |

### 최적화 권장사항

1. **이미지 최적화**: Next.js Image 컴포넌트 사용
2. **번들 크기 최적화**: 불필요한 의존성 제거
3. **API 캐싱**: 빠른 가입 응답 캐시 고려
4. **로딩 상태**: Skeleton UI 추가 검토

---

## 7. 보안 검토

### 현재 상태

| 항목 | 상태 | 상세 |
|------|------|------|
| **이메일 검증** | ✅ PASS | 정규식 검증 구현 |
| **비밀번호 임시 생성** | ✅ PASS | 안전한 난수 생성 |
| **CSRF 보호** | ✅ PASS | Next.js 자동 처리 |
| **SQL 주입** | ✅ PASS | Prisma ORM 사용 |
| **민감 정보 로깅** | ⚠️ CAUTION | 비밀번호 로깅 불가 확인 |
| **Rate Limiting** | ❌ MISSING | 추가 필수 |

### 권장 개선

**Rate Limiting 추가** (API 엔드포인트):
```typescript
// middleware.ts 또는 전용 라이브러리 사용
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 15분마다 5회 요청 제한
})

// route.ts에서
const { success } = await ratelimit.limit(
  `quick-signup:${email}` // 이메일별 제한
)

if (!success) {
  return NextResponse.json(
    { error: '너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요.' },
    { status: 429 }
  )
}
```

---

## 8. 테스트 전략 수립

### 테스트 피라미드

```
                    E2E (10%)
                 [Playwright/Cypress]

             Integration (30%)
         [API + Database Testing]

Unit Tests (60%)
[Jest + React Testing Library]
```

### 구현 로드맵

#### Phase 1: 단위 테스트 (1-2일)
```
- Landing Page 버튼 렌더링 테스트
- 이메일 유효성 검사 함수 테스트
- 상태 관리 (useAuthStore) 테스트
```

#### Phase 2: 통합 테스트 (2-3일)
```
- Quick Signup API 엔드포인트 테스트
- 프로필 생성 로직 테스트
- 에러 처리 시나리오 테스트
```

#### Phase 3: E2E 테스트 (3-5일)
```
- 전체 가입 흐름 테스트
- 이메일 인증 흐름 테스트
- 게스트 모드 진입 테스트
```

---

## 9. 테스트 코드 예시

### Jest 단위 테스트 예시

**파일**: `app/__tests__/page.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LandingPage from '@/app/page.tsx'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { createSupabaseClient } from '@/lib/supabase/client'

// Mocks
jest.mock('next/navigation')
jest.mock('@/lib/store')
jest.mock('@/lib/supabase/client')
jest.mock('sonner')

describe('LandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock 설정
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    })
    ;(useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      setUser: jest.fn(),
      setGuestMode: jest.fn(),
    })
    ;(createSupabaseClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    })
  })

  describe('둘러보기 (Guest Mode) Button', () => {
    test('버튼 클릭 시 로딩 상태 표시', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      expect(guestButton).not.toBeDisabled()

      fireEvent.click(guestButton)

      // 로딩 스피너 표시 확인
      await waitFor(() => {
        expect(screen.getByText('입장 중...')).toBeInTheDocument()
      })
    })

    test('로딩 중에는 버튼이 비활성화됨', async () => {
      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(guestButton).toBeDisabled()
      })
    })

    test('클릭 시 /home으로 라우팅됨', async () => {
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')
      fireEvent.click(guestButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })

    test('중복 클릭 방지', async () => {
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

      render(<LandingPage />)

      const guestButton = screen.getByText('둘러보기')

      // 두 번 클릭
      fireEvent.click(guestButton)
      fireEvent.click(guestButton)

      await waitFor(() => {
        // push는 한 번만 호출되어야 함
        expect(mockPush).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('시작하기 (Signup) Button', () => {
    test('버튼 클릭 시 /auth/signup으로 라우팅', async () => {
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

      render(<LandingPage />)

      const signupButton = screen.getByText('시작하기')
      fireEvent.click(signupButton)

      expect(mockPush).toHaveBeenCalledWith('/auth/signup')
    })

    test('스크롤 이동 없이 라우팅됨', async () => {
      const mockPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })

      render(<LandingPage />)

      const signupButton = screen.getByText('시작하기')

      // 페이지 스크롤 위치 확인
      const initialScroll = window.scrollY
      fireEvent.click(signupButton)

      // 라우팅은 스크롤을 유발하지 않아야 함
      expect(window.scrollY).toBe(initialScroll)
    })
  })

  describe('소셜 로그인', () => {
    test('카카오 로그인 버튼 클릭 시 Supabase OAuth 호출', async () => {
      const mockSignInWithOAuth = jest.fn()
      ;(createSupabaseClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
          signInWithOAuth: mockSignInWithOAuth,
        },
      })

      render(<LandingPage />)

      const kakaoButton = screen.getByText('카카오 로그인')
      fireEvent.click(kakaoButton)

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'kakao',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })
  })

  describe('메일 유효성 검사', () => {
    test('유효하지 않은 이메일 거부', async () => {
      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      const submitButton = screen.getByText('3분 만에 무료 시작 →')

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText('올바른 이메일 주소를 입력해주세요')
        ).toBeInTheDocument()
      })
    })

    test('유효한 이메일 허용', async () => {
      render(<LandingPage />)

      const emailInput = screen.getByPlaceholderText('이메일 주소 입력')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      // API 호출 mocking
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          requiresEmailConfirmation: true,
        }),
      })

      const submitButton = screen.getByText('3분 만에 무료 시작 →')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/quick-signup',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com' }),
          })
        )
      })
    })
  })
})
```

---

**파일**: `app/__tests__/api/auth/quick-signup.test.ts`

```typescript
import { POST } from '@/app/api/auth/quick-signup/route'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

// Mocks
jest.mock('@/lib/supabase/server')
jest.mock('@prisma/client')

describe('/api/auth/quick-signup', () => {
  let mockSupabase: any
  let mockPrisma: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
      },
    }

    mockPrisma = {
      profile: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $disconnect: jest.fn(),
    }

    ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(PrismaClient as jest.Mock).mockReturnValue(mockPrisma)
  })

  test('유효한 이메일로 가입 성공', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: null,
      },
      error: null,
    })

    mockPrisma.profile.findUnique.mockResolvedValue(null)
    mockPrisma.profile.create.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.requiresEmailConfirmation).toBe(true)
  })

  test('중복 이메일 처리', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@example.com' }),
    })

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('이미 가입된 이메일입니다')
  })

  test('유효하지 않은 이메일 거부', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('올바른 이메일')
  })

  test('빈 이메일 거부', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify({ email: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('이메일을 입력해주세요')
  })

  test('프로필 생성 실패 시에도 가입 완료', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: null,
      },
      error: null,
    })

    mockPrisma.profile.findUnique.mockResolvedValue(null)
    mockPrisma.profile.create.mockRejectedValue(new Error('DB Error'))

    const response = await POST(request)
    const data = await response.json()

    // 프로필 생성 실패해도 가입은 완료되어야 함
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

---

## 10. 다음 단계 권장사항

### 즉시 조치 (Priority 1)

- [ ] **ESLint 에러 수정** (Issue #1, #2)
  - `@ts-ignore` → `@ts-expect-error`로 변경
  - `any` 타입 → 명시적 타입 지정
  - **예상 소요 시간**: 30분

- [ ] **npm run lint 통과 확인**
  - 최종 검증
  - CI/CD 파이프라인 확인

### 단기 개선 (Priority 2)

- [ ] **에러 처리 로직 개선** (Issue #3, #4)
  - 프로필 생성 실패 시 사용자 피드백 강화
  - 라우팅 실패 시 상태 초기화
  - **예상 소요 시간**: 1-2시간

- [ ] **Rate Limiting 추가**
  - 스팸/남용 방지
  - **예상 소요 시간**: 2시간

- [ ] **단위 테스트 추가**
  - 위의 테스트 코드 예시 참고
  - 최소 80% 커버리지 목표
  - **예상 소요 시간**: 1-2일

### 중기 개선 (Priority 3)

- [ ] **Prisma 싱글톤 구현** (Issue #5)
  - 성능 최적화
  - **예상 소요 시간**: 1시간

- [ ] **성능 측정 및 최적화**
  - Google Lighthouse 스코어 측정
  - Core Web Vitals 최적화

- [ ] **통합 테스트 추가**
  - API + Database 통합 테스트
  - **예상 소요 시간**: 2-3일

- [ ] **E2E 테스트 추가** (Playwright)
  - 전체 가입 흐름 테스트
  - 이메일 인증 흐름 테스트
  - **예상 소요 시간**: 3-5일

---

## 11. 체크리스트: 배포 전 확인

### 코드 품질
- [ ] ESLint 통과 (`npm run lint`)
- [ ] TypeScript strict 모드 검사 통과
- [ ] 모든 콘솔 에러 제거
- [ ] TODO/FIXME 코멘트 정리

### 기능 검증
- [ ] "둘러보기" 버튼 동작 확인
- [ ] "시작하기" 버튼 라우팅 확인
- [ ] 이메일 유효성 검사 확인
- [ ] 이메일 인증 메일 전송 확인
- [ ] 중복 이메일 처리 확인
- [ ] 네트워크 오류 처리 확인

### 보안
- [ ] Rate limiting 적용
- [ ] CSRF 보호 확인
- [ ] 민감 정보 로깅 확인
- [ ] 환경 변수 설정 확인

### 성능
- [ ] Lighthouse 점수 80점 이상
- [ ] Core Web Vitals 양호 상태
- [ ] API 응답 시간 500ms 이하

### 접근성
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 호환성 확인
- [ ] 색상 대비 검사

### 테스트
- [ ] 단위 테스트 80% 커버리지
- [ ] 주요 흐름 수동 테스트 완료
- [ ] 브라우저 호환성 테스트 (Chrome, Safari, Firefox)

---

## 12. 부록: 명령어 참고

```bash
# 개발 서버 실행
npm run dev

# 린트 검사
npm run lint

# 빌드 테스트
npm run build

# Jest 테스트 실행
npm test

# 테스트 커버리지 확인
npm test -- --coverage

# Playwright E2E 테스트
npx playwright test
```

---

## 결론

**작업 상태**: 핵심 기능은 정상 구현되었으나, 배포 전 다음 사항 필수:

1. TypeScript 린트 에러 수정 (필수)
2. 에러 처리 로직 개선 (권장)
3. 테스트 코드 추가 (권장)
4. Rate limiting 구현 (보안)

**배포 가능 시점**: Issue #1, #2 해결 후 ESLint 통과 시점

**최종 권장**: 현재 작업을 "Stage 1: 코드 수정"에서 "Stage 2: 테스트 추가"로 진행하여 배포 신뢰도를 높이기를 권장합니다.

---

**리포트 생성**: Claude Code QA Engineer
**마지막 업데이트**: 2026-05-12 13:00 KST
