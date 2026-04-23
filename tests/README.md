# E2E Tests - 노무PRO

자동화된 End-to-End 테스트 스위트입니다.

## 🚀 빠른 시작

### 1. Playwright 설치

```bash
npm install
npx playwright install chromium
```

### 2. 개발 서버 실행 (자동으로 실행됨)

테스트 실행 시 `npm run dev`가 자동으로 실행됩니다.

### 3. 테스트 실행

```bash
# 전체 테스트 (헤드리스 모드)
npm run test:e2e

# UI 모드 (권장: 시각적으로 테스트 확인)
npm run test:e2e:ui

# 브라우저를 보면서 실행
npm run test:e2e:headed

# 특정 테스트만 실행
npm run test:dual-role        # Dual-Role 시나리오
npm run test:accessibility    # 접근성 테스트
npm run test:mobile          # 모바일 반응형 테스트
```

### 4. 테스트 결과 보기

```bash
npm run test:report
```

HTML 리포트가 자동으로 브라우저에서 열립니다.

---

## 📁 파일 구조

```
tests/
├── e2e/
│   ├── dual-role.spec.ts          # Dual-Role 핵심 시나리오 (7개 테스트)
│   ├── accessibility.spec.ts      # 접근성 테스트 (13개 테스트)
│   └── mobile-responsive.spec.ts  # 모바일 반응형 (12개 테스트)
└── README.md                      # 이 파일
```

---

## 🧪 테스트 카테고리

### 1. Dual-Role 시나리오 (`dual-role.spec.ts`)

**핵심 사용자 플로우 테스트**:
- 회원가입 시 "관리자 + 근로자" 역할 선택
- 프로필 설정 (시급, 은행 정보)
- 현장 생성 시 본인 포함 옵션
- 근로자 목록에서 본인 강조 표시
- 급여 명세서 세무 안내
- 세무 가이드 페이지 접근
- TaxNotification 알림 표시

### 2. 접근성 테스트 (`accessibility.spec.ts`)

**WCAG 2.1 AA 기준 준수 검증**:
- Axe-core 자동 접근성 스캔
- 키보드 네비게이션 (Tab 키)
- 스크린 리더 호환성 (ARIA 레이블)
- 색상 대비 검사
- 터치 타겟 크기 (44x44px)
- 폼 오류 메시지 접근성
- 이미지 대체 텍스트
- Heading 계층 구조
- 포커스 표시

### 3. 모바일 반응형 (`mobile-responsive.spec.ts`)

**다양한 디바이스에서 UI 검증**:
- iPhone 13 (390x844)
- Galaxy S21 (360x800)
- iPad (768x1024)
- Desktop (1920x1080)

**검사 항목**:
- 레이아웃 깨짐 없음
- 가로 스크롤 없음
- 터치 타겟 크기
- 텍스트 가독성 (최소 14px)
- 이미지 반응형
- 가로/세로 방향 전환
- 성능 (3초 이내 로딩)

---

## 🛠️ Playwright 설정

### `playwright.config.ts`

주요 설정:
- **Base URL**: `http://localhost:3000`
- **Retries**: CI에서 2회 재시도
- **Workers**: 로컬에서 병렬 실행
- **Reporter**: HTML 리포트
- **Projects**: Desktop (Chromium) + Mobile (iPhone 13)

### 브라우저 설치

```bash
# Chromium만 (권장)
npx playwright install chromium

# 전체 브라우저 (Firefox, WebKit 포함)
npx playwright install
```

---

## ✍️ 새 테스트 작성하기

### 기본 템플릿

```typescript
import { test, expect } from '@playwright/test'

test.describe('새로운 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('테스트 케이스 제목', async ({ page }) => {
    // 1. 페이지 이동
    await page.goto('/some-page')

    // 2. 요소 상호작용
    await page.click('[data-testid="button"]')

    // 3. Assertion
    await expect(page.locator('h1')).toHaveText('Expected Text')
  })
})
```

### data-testid 사용 (권장)

```typescript
// ❌ 텍스트 기반 (UI 변경 시 깨짐)
await page.click('text=회원가입')

// ✅ data-testid 기반 (안정적)
await page.click('[data-testid="signup-button"]')
```

**컴포넌트 예시**:
```tsx
<Button data-testid="signup-button" type="submit">
  회원가입
</Button>
```

---

## 🐛 디버깅

### 1. UI 모드로 디버깅 (권장)

```bash
npm run test:e2e:ui
```

- 각 단계를 시각적으로 확인
- 타임라인으로 실행 과정 추적
- 스크린샷 및 네트워크 요청 확인

### 2. 브라우저를 보면서 실행

```bash
npm run test:e2e:headed
```

### 3. 특정 테스트만 실행

```bash
# 파일명으로 필터링
npx playwright test dual-role

# 테스트 제목으로 필터링
npx playwright test -g "회원가입"
```

### 4. 디버그 모드

```bash
npx playwright test --debug
```

- Playwright Inspector 실행
- 한 줄씩 실행 가능
- 브레이크포인트 설정

### 5. 스크린샷 확인

테스트 실패 시 자동으로 스크린샷이 저장됩니다:
```
test-results/
└── dual-role-spec-ts-회원가입-chromium/
    └── test-failed-1.png
```

---

## 🔧 트러블슈팅

### 문제: `Error: page.goto: net::ERR_CONNECTION_REFUSED`

**원인**: 개발 서버가 실행되지 않음

**해결**:
```bash
# 수동으로 개발 서버 실행
npm run dev

# 다른 터미널에서 테스트 실행
npm run test:e2e
```

### 문제: 테스트가 너무 느림

**원인**: 네트워크 요청 대기 시간이 길음

**해결**:
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30초로 증가
  expect: {
    timeout: 5000,
  },
})
```

### 문제: 셀렉터를 찾을 수 없음

**원인**: 요소가 아직 렌더링되지 않음

**해결**:
```typescript
// ❌ 즉시 클릭 (실패 가능)
await page.click('button')

// ✅ 요소가 보일 때까지 대기
await page.waitForSelector('button', { state: 'visible' })
await page.click('button')

// ✅ Playwright 자동 대기 (권장)
await expect(page.locator('button')).toBeVisible()
await page.locator('button').click()
```

### 문제: 인증이 필요한 페이지 테스트

**임시 해결** (Phase 7-1에서 정식 구현 예정):
```typescript
test.beforeEach(async ({ page }) => {
  // 로그인 세션 쿠키 설정
  await page.context().addCookies([
    {
      name: 'supabase-auth-token',
      value: 'your-test-token',
      domain: 'localhost',
      path: '/',
    },
  ])
})
```

---

## 📚 참고 자료

### Playwright 공식 문서

- [Getting Started](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)

### 접근성 테스트

- [axe-core Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 모범 사례

1. **테스트는 독립적이어야 함**: 한 테스트가 다른 테스트에 의존하지 않기
2. **data-testid 사용**: 텍스트 기반 셀렉터 지양
3. **명확한 테스트 제목**: "무엇을 테스트하는지" 명시
4. **적절한 대기**: `waitFor...` 사용하여 비동기 처리
5. **스크린샷 활용**: 실패 시 디버깅 자료 확보

---

## 🎯 커버리지 목표

| 영역 | 현재 | 목표 |
|------|------|------|
| Dual-Role 플로우 | 100% | 100% |
| 접근성 (WCAG AA) | 100% | 100% |
| 모바일 반응형 | 100% | 100% |
| 전체 기능 | 86% | 95% |

---

## 📞 도움이 필요하신가요?

- Playwright Discord: https://aka.ms/playwright/discord
- GitHub Issues: https://github.com/microsoft/playwright/issues
- Stack Overflow: [playwright] 태그

---

**Last Updated**: 2026-04-23
**Maintained by**: 노무PRO 개발팀
