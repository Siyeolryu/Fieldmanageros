# 랜딩 페이지 버튼 수정 - 테스트 실행 가이드

**작성 일자**: 2026-05-12
**대상**: 개발팀 및 QA팀

---

## 목차

1. [테스트 환경 설정](#테스트-환경-설정)
2. [단위 테스트 (Jest)](#단위-테스트-jest)
3. [통합 테스트 (API)](#통합-테스트-api)
4. [E2E 테스트 (Playwright)](#e2e-테스트-playwright)
5. [수동 테스트 (Manual QA)](#수동-테스트-manual-qa)
6. [테스트 결과 분석](#테스트-결과-분석)
7. [이슈 보고 템플릿](#이슈-보고-템플릿)

---

## 테스트 환경 설정

### 필수 요구사항

```bash
# Node.js 버전 확인
node --version  # v18+ 권장

# npm 버전 확인
npm --version   # v9+ 권장

# 의존성 설치
npm install

# .env.local 설정 확인
cat .env.local
```

### 환경 변수 확인

```bash
# Supabase 관련
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nomupro
```

### 개발 서버 실행

```bash
# 터미널 1: 개발 서버 시작
npm run dev

# 터미널 2: 브라우저에서 접속
open http://localhost:3000
```

---

## 단위 테스트 (Jest)

### 테스트 파일 위치

```
__tests__/
├── page.test.tsx                 # 랜딩 페이지 컴포넌트 테스트
├── api/auth/quick-signup.test.ts # 가입 API 테스트
└── auth/confirm-email.test.tsx   # 이메일 확인 페이지 테스트 (예정)
```

### 단위 테스트 실행

#### 1. 모든 테스트 실행

```bash
# 모든 Jest 테스트 실행
npm test

# 또는
npm run test
```

#### 2. 특정 테스트 파일만 실행

```bash
# 랜딩 페이지 테스트만 실행
npm test -- __tests__/page.test.tsx

# API 테스트만 실행
npm test -- __tests__/api/auth/quick-signup.test.ts
```

#### 3. 감시 모드로 실행 (개발 중)

```bash
# 파일 변경 시 자동으로 테스트 재실행
npm test -- --watch
```

#### 4. 특정 테스트만 실행

```bash
# 이름으로 필터링 (정규식 사용 가능)
npm test -- --testNamePattern="둘러보기"

# 예시
npm test -- --testNamePattern="should navigate to /home"
```

#### 5. 테스트 커버리지 확인

```bash
# 커버리지 리포트 생성
npm test -- --coverage

# 커버리지 리포트 HTML로 생성
npm test -- --coverage --coverageReporters=html

# 결과 확인
open coverage/index.html
```

**커버리지 목표**:
- 전체: 80% 이상
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

#### 6. 테스트 결과 해석

```
Pass count:
✓ 5 passed (모든 테스트 성공)

Fail count:
✕ 2 failed (실패한 테스트 확인 필요)

Snapshot:
⊗ 1 snapshot failed (스냅샷 업데이트 필요)
```

### Jest 명령어 참고

| 명령어 | 설명 |
|--------|------|
| `npm test` | 모든 테스트 실행 |
| `npm test -- --watch` | 감시 모드 |
| `npm test -- --coverage` | 커버리지 리포트 |
| `npm test -- --updateSnapshot` | 스냅샷 업데이트 |
| `npm test -- --verbose` | 상세 출력 |
| `npm test -- --testTimeout=10000` | 타임아웃 설정 |

---

## 통합 테스트 (API)

### API 테스트 시 주의사항

#### 1. Supabase 설정 확인

API 테스트를 실행하기 전에 Supabase 환경 확인:

```bash
# Supabase 연결 확인
curl -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  https://your-project.supabase.co/rest/v1/

# 응답이 401이 아니면 연결 정상
```

#### 2. 데이터베이스 상태 확인

```bash
# 테스트 데이터베이스 백업
pg_dump $DATABASE_URL > backup.sql

# 테스트 후 복원 가능
psql $DATABASE_URL < backup.sql
```

#### 3. API 테스트 실행

```bash
# 통합 테스트 실행
npm test -- __tests__/api/auth/quick-signup.test.ts

# 상세 로그 출력
npm test -- __tests__/api/auth/quick-signup.test.ts --verbose
```

#### 4. 실제 API 엔드포인트 테스트

```bash
# 개발 서버 실행 중일 때
curl -X POST http://localhost:3000/api/auth/quick-signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 예상 응답 (성공)
{
  "success": true,
  "user": { "id": "...", "email": "test@example.com" },
  "requiresEmailConfirmation": true,
  "debugInfo": { "emailSent": true }
}

# 예상 응답 (중복)
{
  "error": "이미 가입된 이메일입니다. 로그인해주세요.",
  "status": 409
}
```

### 테스트 데이터 관리

#### Mock 데이터 사용

```typescript
// 테스트용 이메일 주소
const testEmails = {
  valid: 'test-user@example.com',
  duplicate: 'duplicate@example.com',
  invalid: 'invalid-email',
}
```

#### 테스트 데이터 정리

```bash
# 테스트 완료 후 생성된 데이터 제거
DELETE FROM public.profile
WHERE email LIKE '%test%'
  AND created_at >= NOW() - INTERVAL '1 hour'
```

---

## E2E 테스트 (Playwright)

### Playwright 설치 및 설정

```bash
# Playwright 브라우저 설치 (처음 1회만)
npx playwright install

# 또는 npm 통해 설치
npm install --save-dev @playwright/test
```

### Playwright 테스트 실행

#### 1. 모든 E2E 테스트 실행

```bash
# 개발 서버 먼저 실행 (필수)
npm run dev &

# 다른 터미널에서
npx playwright test

# 또는
npm run test:e2e
```

#### 2. 특정 브라우저에서만 테스트

```bash
# Chromium만 테스트
npx playwright test --project=chromium

# Chrome, Safari, Firefox 개별 테스트
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox
```

#### 3. 특정 테스트 파일만 실행

```bash
# 랜딩 페이지 E2E 테스트만 실행
npx playwright test __tests__/e2e/landing-page.spec.ts
```

#### 4. 테스트 시각화 모드 (권장)

```bash
# 브라우저를 띄운 상태에서 테스트 실행
npx playwright test --headed

# 느리게 실행 (동작 확인 용이)
npx playwright test --headed --project=chromium --workers=1 --timeout=60000
```

#### 5. 특정 테스트만 실행

```bash
# 정규식으로 필터
npx playwright test --grep "둘러보기"

# 전체 exclude
npx playwright test --grep "not @skip"
```

#### 6. 디버그 모드

```bash
# Inspector 켜기 (단계별 실행)
npx playwright test --debug

# VSCode에서 디버그 (launch.json 설정)
code --version  # VSCode 확인

# test 파일에서 한 줄에 F12 누르기 (Inspector 켜짐)
```

#### 7. 테스트 리포트 생성

```bash
# HTML 리포트 생성
npx playwright test

# 리포트 확인
npx playwright show-report

# CI/CD에서 항상 리포트 생성 설정
npx playwright test --reporter=html
```

### Playwright 테스트 작성 팁

#### 대기 (Waiting) 전략

```typescript
// 좋은 예
await page.waitForURL('/home')                  // URL 변경 대기
await page.waitForLoadState('networkidle')     // 네트워크 유휴
await page.locator('.button').isVisible()      // 요소 표시 대기

// 피해야 할 패턴
await page.waitForTimeout(5000)                // 절대 사용 금지
```

#### 선택자 전략

```typescript
// 권장 (접근성 기반)
page.getByText('둘러보기')           // 텍스트 기반
page.getByPlaceholder('이메일')      // 플레이스홀더
page.getByRole('button', { name })   // ARIA 역할

// 최후 수단
page.locator('button.submit')        // CSS 선택자
page.locator('[data-testid="btn"]')  // Test ID
```

#### 에러 처리

```typescript
// try-catch로 에러 처리
try {
  await page.waitForURL('/confirm-email', { timeout: 5000 })
  // URL이 변경되지 않으면 에러 발생
} catch (error) {
  // 다른 시나리오 처리 (자동 가입 등)
  console.log('Expected timeout:', error.message)
}
```

---

## 수동 테스트 (Manual QA)

### 테스트 시작 전 체크리스트

- [ ] 개발 서버가 실행 중 (`npm run dev`)
- [ ] 브라우저 콘솔이 열려 있음 (F12)
- [ ] 네트워크 탭이 열려 있음 (Network throttling: Fast 3G)
- [ ] 캐시가 비워져 있음 (Ctrl+Shift+Delete)

### Test Case 1: "둘러보기" 버튼

**목표**: 게스트 모드로 진입하고 /home으로 이동

| 단계 | 작업 | 예상 결과 | 검증 |
|------|------|----------|------|
| 1 | 랜딩 페이지 접속 | 페이지 로드 | 콘솔 에러 없음 |
| 2 | "둘러보기" 버튼 클릭 | 로딩 스피너 표시 | 버튼 내부에 스피너 애니메이션 |
| 3 | 대기 (2초) | "입장 중..." 텍스트 | 버튼 비활성화 |
| 4 | 대기 (3초) | /home으로 이동 | URL이 `/home`으로 변경 |
| 5 | Toast 확인 | "게스트 모드로..." 메시지 | 우상단에 초록색 알림 |
| 6 | 페이지 새로고침 | 데이터 유지 | localStorage 확인 |

**검증 도구**:
```javascript
// 브라우저 콘솔에서 실행
// 게스트 모드 확인
JSON.parse(localStorage.getItem('nomu-pro-guest-mode'))

// Auth 상태 확인
JSON.parse(localStorage.getItem('auth-store'))
```

---

### Test Case 2: "시작하기" 버튼

**목표**: /auth/signup으로 라우팅

| 단계 | 작업 | 예상 결과 | 검증 |
|------|------|----------|------|
| 1 | 랜딩 페이지 접속 | 페이지 로드 | 콘솔 에러 없음 |
| 2 | "시작하기" 버튼 클릭 | 회원가입 페이지 로드 | URL이 `/auth/signup` |
| 3 | 폼 요소 확인 | 이메일, 비밀번호 입력 필드 | 입력 가능 |
| 4 | 기능 테스트 | 회원가입 진행 가능 | 다음 단계로 진행 |

---

### Test Case 3: 빠른 가입 (Quick Signup)

**목표**: 이메일을 통한 가입 및 이메일 인증

| 단계 | 작업 | 입력값 | 예상 결과 |
|------|------|--------|----------|
| 1 | 이메일 입력 | `test@example.com` | 입력 가능 |
| 2 | 가입 버튼 클릭 | - | 로딩 중... 표시 |
| 3 | 대기 (3-5초) | - | `/auth/confirm-email` 이동 |
| 4 | 이메일 확인 | 실제 이메일 클라이언트 | 인증 메일 도착 |
| 5 | 인증 링크 클릭 | 이메일 내 링크 | /home으로 자동 이동 |

**실제 이메일 테스트**:
```bash
# 임시 이메일 서비스 사용
# - maildev (로컬): http://localhost:1080
# - mailtrap.io (온라인)
# - 10minutemail.com (일회용)

# 또는 실제 이메일 계정 사용
# Gmail: 스팸 메일함 확인 필수
```

---

### Test Case 4: 에러 처리

**목표**: 예외 상황에 대한 적절한 처리

| 시나리오 | 입력값 | 예상 결과 | 검증 방법 |
|---------|--------|----------|----------|
| 유효하지 않은 이메일 | `invalid-email` | 에러 메시지 표시 | 빨간색 텍스트 |
| 빈 이메일 | (공백) | 제출 불가 | 버튼 비활성화 |
| 중복 이메일 | `existing@test.com` | "이미 가입됨" 메시지 | 409 상태 코드 |
| 네트워크 오류 | (인터넷 끔) | "서버 오류" 메시지 | DevTools Network 확인 |

---

### 브라우저별 테스트

#### Chrome/Chromium

```bash
# 최신 버전 확인
google-chrome --version

# 테스트 실행
npm run test:e2e -- --project=chromium
```

**체크 항목**:
- 렌더링 정상
- 애니메이션 부드러움
- DevTools 에러 없음

#### Safari

```bash
# macOS에서만 가능
npx playwright test --project=webkit

# 또는 수동 테스트
open -a Safari http://localhost:3000
```

**체크 항목**:
- CSS 호환성
- 터치 제스처
- 폰트 렌더링

#### Firefox

```bash
npx playwright test --project=firefox
```

**체크 항목**:
- CSS 렌더링
- JavaScript 호환성
- 에러 콘솔

---

### 모바일 테스트

#### 기기 테스트

```bash
# iPhone 시뮬레이터
npx playwright test --project=iPad

# Android 기기
npx playwright test --project="Pixel 5"
```

#### DevTools 모바일 모드

```javascript
// Chrome DevTools > Device Toolbar (Ctrl+Shift+M)
// 테스트할 기기 선택:
// - iPhone 12 (390x844)
// - iPhone SE (375x667)
// - Galaxy S10 (360x800)
// - iPad (768x1024)
```

**체크 항목**:
- 터치 상호작용 (tap, long press)
- 이중 탭 확대
- 핀치 줌
- 소프트 키보드 동작

---

## 테스트 결과 분석

### 테스트 결과 리포트

#### 1. Jest 커버리지 리포트

```bash
npm test -- --coverage

# 출력 예시
------|----------|----------|----------|----------|------|---------|
File  | % Stmts  | % Branch | % Funcs  | % Lines  | Uncov |
------|----------|----------|----------|----------|------|---------|
All   | 75.5     | 70.2     | 78.3     | 75.8     |      |
------|----------|----------|----------|----------|------|---------|
```

#### 2. Playwright 리포트

```bash
npx playwright test
npx playwright show-report

# 리포트에서 확인 항목:
# - 통과한 테스트 수
# - 실패한 테스트 수
# - 스크린샷 및 비디오
# - 성능 메트릭
```

#### 3. CI/CD 통합

```bash
# GitHub Actions 예시
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

---

### 실패 분석 및 디버깅

#### Jest 테스트 실패

```bash
# 상세 로그 출력
npm test -- __tests__/page.test.tsx --verbose

# 실패한 테스트만 재실행
npm test -- --onlyChanged

# 스냅샷 업데이트 필요
npm test -- -u
```

**일반적인 실패 원인**:
1. Mock 설정 오류
2. 비동기 대기 시간 부족
3. 환경 변수 누락
4. 상태 관리 오류

#### Playwright 테스트 실패

```bash
# 실패한 스크린샷 확인
open test-results/index.html

# 실패한 테스트 재실행
npx playwright test --grep "failed test name"

# 슬로우 모션으로 확인
npx playwright test --headed --slow-mo=1000
```

**일반적인 실패 원인**:
1. 요소 찾을 수 없음
2. 타임아웃
3. URL 변경 대기 실패
4. 네트워크 에러

---

## 이슈 보고 템플릿

### 버그 리포트 양식

**제목**: [BUG] 둘러보기 버튼 - 로딩 스피너 표시 안 됨

**환경**:
- 브라우저: Chrome 120.0.6099.219
- 기기: MacBook Pro M1
- OS: macOS 14.2.1
- 개발 서버: npm run dev

**재현 방법**:
1. http://localhost:3000 접속
2. "둘러보기" 버튼 클릭
3. 로딩 스피너 확인

**예상 결과**: 버튼 내부에 로딩 스피너 애니메이션 표시

**실제 결과**: 로딩 스피너가 표시되지 않음

**스크린샷/비디오**:
```
(스크린샷 첨부)
```

**콘솔 에러**:
```javascript
// F12 > Console
[Error] Uncaught TypeError: Cannot read property 'setGuestMode' of undefined
```

**추가 정보**:
- 새로고침 후에도 동일한 현상
- 다른 브라우저(Firefox)에서는 정상 작동
- 캐시 비우기 후에도 동일

---

### 성능 이슈 리포트

**제목**: [PERFORMANCE] 이메일 입력 시 지연 발생

**성능 지표**:
- 페이지 로드: 2.3초 (목표: <1.5초)
- 이메일 입력 응답: 800ms (목표: <200ms)
- API 응답: 1.2초 (목표: <500ms)

**성능 스냅샷**:
```
Chrome DevTools > Performance 탭에서 기록
(성능 프로필 첨부)
```

---

### 접근성 이슈 리포트

**제목**: [A11Y] 포커스 인디케이터 부재

**WCAG 준수**: WCAG 2.1 Level AA 미충족

**이슈**:
- Tab 키로 포커스 이동 시 포커스 인디케이터가 보이지 않음
- 스크린 리더(NVDA)에서 버튼 목적 불명확

**재현 방법**:
1. 랜딩 페이지 접속
2. Tab 키 누르기
3. 포커스 인디케이터 확인

---

## 참고 자료

### 문서
- [Jest 공식 문서](https://jestjs.io/)
- [Playwright 공식 문서](https://playwright.dev/)
- [Next.js 테스팅 가이드](https://nextjs.org/docs/testing)

### 도구
- Chrome DevTools: F12
- Firefox DevTools: F12
- Safari Developer Tools: Cmd+Option+I
- Playwright Inspector: `npx playwright test --debug`

### 실용적인 팁
1. **테스트 먼저**: TDD 방식으로 테스트부터 작성
2. **모킹 활용**: 외부 의존성은 반드시 모킹
3. **격리된 테스트**: 각 테스트는 독립적이어야 함
4. **명확한 이름**: 테스트 이름으로 무엇을 테스트하는지 명확히
5. **정기적인 리뷰**: 테스트 커버리지를 주간으로 검토

---

## 체크리스트: 배포 전 테스트

### 코드 레벨
- [ ] ESLint 통과 (`npm run lint`)
- [ ] Jest 테스트 80% 이상 통과
- [ ] TypeScript 에러 없음
- [ ] 콘솔 에러 없음

### 기능 레벨
- [ ] 둘러보기 버튼 동작 정상
- [ ] 시작하기 버튼 라우팅 정상
- [ ] 빠른 가입 폼 동작 정상
- [ ] 소셜 로그인 버튼 동작 정상

### 성능 레벨
- [ ] Lighthouse 점수 80점 이상
- [ ] Core Web Vitals 양호
- [ ] API 응답 500ms 이하

### 보안 레벨
- [ ] CSRF 보호 활성화
- [ ] 민감 정보 로깅 없음
- [ ] SQL 주입 방어 확인

### 접근성 레벨
- [ ] 키보드 네비게이션 가능
- [ ] 색상 대비 WCAG AA 충족
- [ ] 스크린 리더 호환성 확인

---

**마지막 업데이트**: 2026-05-12 13:30 KST
**작성자**: Claude Code QA Engineer
