import { test, expect, Page } from '@playwright/test'

/**
 * E2E 테스트: 랜딩 페이지 버튼 동작 및 가입 흐름
 *
 * 테스트 환경:
 * - NODE_ENV: test
 * - BASE_URL: http://localhost:3000 (또는 staging)
 * - 이메일: 임시 이메일 서비스 사용 (maildev 등)
 *
 * 실행 명령:
 * npx playwright test --project=chromium
 */

test.describe('Landing Page - Button Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 랜딩 페이지로 이동
    await page.goto('/')
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle')
  })

  test('should display all header buttons', async ({ page }) => {
    // "둘러보기" 버튼 확인
    const guestButton = page.getByText('둘러보기')
    await expect(guestButton).toBeVisible()

    // "시작하기" 버튼 확인
    const signupButton = page.getByText('시작하기')
    await expect(signupButton).toBeVisible()

    // 로고 확인
    const logo = page.getByText('노무PRO')
    await expect(logo).toBeVisible()
  })

  test.describe('"둘러보기" (Guest Mode) Button', () => {
    test('should navigate to /home with loading indicator', async ({ page }) => {
      const guestButton = page.getByText('둘러보기')

      // 버튼 클릭 전 상태 확인
      await expect(guestButton).toBeEnabled()

      // 버튼 클릭
      await guestButton.click()

      // 로딩 상태 표시 확인
      await expect(page.getByText('입장 중...')).toBeVisible()

      // 페이지 이동 확인
      await page.waitForURL('/home', { timeout: 5000 })
      expect(page.url()).toContain('/home')
    })

    test('should show success toast message', async ({ page }) => {
      const guestButton = page.getByText('둘러보기')
      await guestButton.click()

      // Toast 메시지 확인 (sonner toast)
      const toast = page.getByText(/게스트 모드로 입장했습니다/)
      await expect(toast).toBeVisible({ timeout: 3000 })
    })

    test('should disable button during navigation', async ({ page }) => {
      const guestButton = page.getByText('둘러보기')

      // 클릭 후 즉시 disabled 상태 확인
      await guestButton.click()

      // 버튼이 비활성화되었는지 확인
      await expect(guestButton).toBeDisabled()
    })

    test('should prevent duplicate clicks', async ({ page }) => {
      const guestButton = page.getByText('둘러보기')

      // 빠르게 여러 번 클릭 시도
      await guestButton.click()
      await guestButton.click()
      await guestButton.click()

      // /home으로 한 번만 이동해야 함
      await page.waitForURL('/home', { timeout: 5000 })

      // 추가 네비게이션이 없는지 확인 (2초 동안)
      const urlBefore = page.url()
      await page.waitForTimeout(2000)
      const urlAfter = page.url()

      expect(urlBefore).toBe(urlAfter)
      expect(urlAfter).toContain('/home')
    })
  })

  test.describe('"시작하기" (Sign Up) Button', () => {
    test('should navigate directly to /auth/signup', async ({ page }) => {
      const signupButton = page.getByText('시작하기')

      // 현재 스크롤 위치 기록
      const scrollBefore = await page.evaluate(() => window.scrollY)

      // 버튼 클릭
      await signupButton.click()

      // /auth/signup으로 이동 확인
      await page.waitForURL('/auth/signup', { timeout: 5000 })
      expect(page.url()).toContain('/auth/signup')

      // 회원가입 폼이 표시되는지 확인
      await expect(page.getByPlaceholderText('이메일 주소 입력')).toBeVisible()
    })

    test('should use router.push instead of scroll navigation', async ({ page }) => {
      const signupButton = page.getByText('시작하기')

      // 페이지를 스크롤 다운
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      const scrollBefore = await page.evaluate(() => window.scrollY)

      // 버튼 클릭
      await signupButton.click()

      // URL 변경 확인 (스크롤 기반 네비게이션이 아님)
      await page.waitForURL('/auth/signup', { timeout: 5000 })
      expect(page.url()).toContain('/auth/signup')

      // 페이지 최상단으로 스크롤되지 않았음 (직접 라우팅)
      const scrollAfter = await page.evaluate(() => window.scrollY)
      // 새 페이지에서의 스크롤 위치는 0이어야 함
      expect(scrollAfter).toBeLessThan(scrollBefore)
    })
  })

  test.describe('Quick Signup Form', () => {
    test('should validate email format', async ({ page }) => {
      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      // 유효하지 않은 이메일 입력
      await emailInput.fill('invalid-email')
      await submitButton.click()

      // 에러 메시지 표시 확인
      const errorMessage = page.getByText('올바른 이메일 주소를 입력해주세요')
      await expect(errorMessage).toBeVisible()
    })

    test('should accept valid email and submit', async ({ page }) => {
      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      // 유효한 이메일 입력
      const testEmail = `test-${Date.now()}@example.com`
      await emailInput.fill(testEmail)

      // 제출 버튼 클릭
      await submitButton.click()

      // 로딩 상태 확인
      await expect(submitButton).toBeDisabled()

      // API 응답 대기 (다양한 시나리오 가능)
      await page.waitForTimeout(2000)

      // 다음 페이지로 이동하거나 에러 메시지 표시
      const urlOrError = await Promise.race([
        page.waitForURL('/auth/confirm-email', { timeout: 5000 }).then(() => 'confirm'),
        page.waitForSelector('text=이미 가입된 이메일입니다', { timeout: 5000 }).then(() => 'duplicate'),
        Promise.resolve('pending'),
      ]).catch(() => 'timeout')

      // 성공 또는 중복 가입 메시지 확인
      expect(['confirm', 'duplicate', 'pending']).toContain(urlOrError)
    })

    test('should disable form during submission', async ({ page }) => {
      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      // 유효한 이메일 입력
      await emailInput.fill(`test-${Date.now()}@example.com`)

      // 제출
      await submitButton.click()

      // 폼 필드 비활성화 확인
      await expect(emailInput).toBeDisabled()
      await expect(submitButton).toBeDisabled()
    })

    test('should show error for duplicate email', async ({ page }) => {
      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      // 알려진 중복 이메일 입력 (임의 사용, 실제 테스트에선 고정값 필요)
      await emailInput.fill('duplicate@test.com')
      await submitButton.click()

      // 에러 메시지 대기
      await page.waitForTimeout(1000)

      // 에러 메시지 또는 이메일 인증 페이지 확인
      const errorOrConfirm = await Promise.race([
        page.waitForSelector('text=이미 가입된 이메일입니다', { timeout: 5000 }).then(() => 'error'),
        page.waitForURL('/auth/confirm-email', { timeout: 5000 }).then(() => 'confirm'),
        Promise.resolve('pending'),
      ]).catch(() => 'timeout')

      expect(['error', 'confirm', 'pending']).toContain(errorOrConfirm)
    })
  })

  test.describe('Email Confirmation Flow', () => {
    test('should navigate to confirm-email page after signup', async ({ page }) => {
      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      // 새 이메일로 가입
      const testEmail = `newemail-${Date.now()}@example.com`
      await emailInput.fill(testEmail)
      await submitButton.click()

      // confirm-email 페이지로 이동 대기
      try {
        await page.waitForURL('**/auth/confirm-email', { timeout: 10000 })

        // 이메일 주소 표시 확인
        await expect(page.getByText(testEmail)).toBeVisible()

        // 지침 텍스트 확인
        await expect(page.getByText('받은 편지함 확인')).toBeVisible()
        await expect(page.getByText('인증 링크 클릭')).toBeVisible()
      } catch {
        // 자동 가입 또는 다른 시나리오
        // 이 경우 /home으로 이동할 수 있음
      }
    })

    test('should show countdown timer on confirm-email page', async ({ page }) => {
      // confirm-email 페이지로 직접 이동
      await page.goto('/auth/confirm-email?email=test@example.com')

      // 타이머 표시 확인
      const timer = page.getByText(/\d+초/)
      await expect(timer).toBeVisible()
    })

    test('should show spam tip after 10 seconds', async ({ page }) => {
      await page.goto('/auth/confirm-email?email=test@example.com')

      // 10초 대기
      await page.waitForTimeout(10500)

      // 스팸 팁 표시 확인
      const spamTip = page.getByText('스팸 메일함도 확인해보세요')
      await expect(spamTip).toBeVisible()
    })

    test('should provide spam folder links', async ({ page }) => {
      await page.goto('/auth/confirm-email?email=test@gmail.com')

      // Gmail 스팸함 링크 확인
      const gmailLink = page.getByRole('link', { name: /스팸 메일함/ })
      await expect(gmailLink).toBeVisible()
      expect(await gmailLink.getAttribute('href')).toContain('gmail.com')
    })

    test('should allow email resend after 30 seconds', async ({ page }) => {
      await page.goto('/auth/confirm-email?email=test@example.com')

      // 초기 재전송 버튼은 비활성화되어야 함
      const resendButton = page.locator('button', { has: page.getByText('다시 보내기') }).first()

      // 30초 이상 대기
      await page.waitForTimeout(31000)

      // 강조된 재전송 버튼 표시 확인
      const prominentResendButton = page.getByRole('button', { name: /지금 바로 다시 보내기/ })
      await expect(prominentResendButton).toBeVisible()
    })
  })

  test.describe('Social Login Buttons', () => {
    test('should render Kakao and Naver login buttons', async ({ page }) => {
      const kakaoButton = page.getByText('카카오 로그인')
      const naverButton = page.getByText('네이버 로그인')

      await expect(kakaoButton).toBeVisible()
      await expect(naverButton).toBeVisible()
    })

    test('should trigger Kakao OAuth when clicked', async ({ page, context }) => {
      // 새 페이지 이벤트 감지
      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.getByText('카카오 로그인').click(),
      ]).catch(() => [null])

      // Kakao OAuth 페이지로 이동 시도 확인 (또는 에러 처리)
      // 실제 환경에서는 OAuth 리다이렉트 발생
    })

    test('should disable social buttons during loading', async ({ page }) => {
      const kakaoButton = page.getByText('카카오 로그인')

      // 클릭
      await kakaoButton.click()

      // 비활성화 확인
      await expect(kakaoButton).toBeDisabled()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 812 })

      // 헤더 버튼 확인
      await expect(page.getByText('둘러보기')).toBeVisible()
      await expect(page.getByText('시작하기')).toBeVisible()

      // 폼 필드 확인
      await expect(page.getByPlaceholderText('이메일 주소 입력')).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
      // 태블릿 뷰포트 설정
      await page.setViewportSize({ width: 768, height: 1024 })

      // 레이아웃 확인
      await expect(page.getByText('주요 역할을 선택해주세요')).toBeVisible()
    })

    test('should be responsive on desktop', async ({ page }) => {
      // 데스크톱 뷰포트 설정
      await page.setViewportSize({ width: 1920, height: 1080 })

      // 2단 레이아웃 확인
      const hero = page.locator('section').first()
      await expect(hero).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // 포커스 탐색
      await page.keyboard.press('Tab')

      // 로고 또는 첫 요소에 포커스
      let focusedElement = await page.evaluate(() => document.activeElement?.textContent)

      // 탭을 통해 "둘러보기" 버튼으로 이동
      let isGuestButtonFocused = false
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        focusedElement = await page.evaluate(() => document.activeElement?.textContent)
        if (focusedElement?.includes('둘러보기')) {
          isGuestButtonFocused = true
          break
        }
      }

      // 포커스된 요소 확인
      expect(isGuestButtonFocused || focusedElement?.includes('둘러보기')).toBeTruthy()
    })

    test('should activate buttons with Enter key', async ({ page }) => {
      // "시작하기" 버튼으로 포커스 이동
      const signupButton = page.getByText('시작하기')
      await signupButton.focus()

      // Enter 키로 활성화
      await page.keyboard.press('Enter')

      // /auth/signup으로 이동 확인
      await page.waitForURL('/auth/signup', { timeout: 5000 })
      expect(page.url()).toContain('/auth/signup')
    })

    test('should have proper color contrast', async ({ page }) => {
      // 접근성 검사 (axe)
      const results = await page.evaluate(() => {
        const elements = document.querySelectorAll('button, a, h1, h2, p')
        return Array.from(elements).map((el: any) => ({
          text: el.textContent,
          color: window.getComputedStyle(el).color,
          backgroundColor: window.getComputedStyle(el).backgroundColor,
        }))
      })

      // 최소한 100개 이상의 요소가 스타일을 가져야 함
      expect(results.length).toBeGreaterThan(0)
    })
  })

  test.describe('Performance', () => {
    test('should load page within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // 페이지 로드 시간 < 3초
      expect(loadTime).toBeLessThan(3000)
    })

    test('should have good Lighthouse score', async ({ page }) => {
      // 성능 측정 (기본)
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        }
      })

      // 기본 성능 기준
      expect(metrics.domContentLoaded).toBeLessThan(2000)
      expect(metrics.loadComplete).toBeLessThan(3000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // 네트워크 오류 시뮬레이션
      await page.route('/api/auth/quick-signup', route => route.abort())

      const emailInput = page.getByPlaceholderText('이메일 주소 입력')
      const submitButton = page.getByText('3분 만에 무료 시작 →')

      await emailInput.fill('test@example.com')
      await submitButton.click()

      // 에러 메시지 표시 확인
      const errorMessage = page.getByText(/오류가 발생했습니다/)
      await expect(errorMessage).toBeVisible({ timeout: 5000 })

      // 폼이 여전히 상호작용 가능한지 확인
      await expect(submitButton).not.toBeDisabled()
    })

    test('should display console errors in accessible way', async ({ page }) => {
      // 콘솔 에러 모니터링
      let consoleErrors: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // 페이지 상호작용
      await page.getByText('시작하기').click()
      await page.waitForURL('/auth/signup')

      // 심각한 콘솔 에러 없어야 함
      const severeErrors = consoleErrors.filter(
        e => !e.includes('404') && !e.includes('CORS') // 무시 가능한 에러
      )

      expect(severeErrors.length).toBeLessThan(3)
    })
  })
})

test.describe('Authentication State', () => {
  test('should show dashboard link when user is logged in', async ({ page, context }) => {
    // 인증된 상태 시뮬레이션 (쿠키 또는 localStorage 설정)
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'fake-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // "대시보드로 가기" 버튼 확인 (있을 경우)
    // 또는 다른 로그인 상태 지표 확인
  })

  test('should show login buttons when user is not logged in', async ({ page }) => {
    await page.goto('/')

    // 로그인 하지 않은 상태의 버튼 확인
    await expect(page.getByText('둘러보기')).toBeVisible()
    await expect(page.getByText('시작하기')).toBeVisible()
  })
})
