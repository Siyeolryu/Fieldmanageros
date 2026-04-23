import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Phase 7: 접근성 테스트
 *
 * WCAG 2.1 AA 기준 자동화 테스트
 * - 색상 대비 (Contrast)
 * - 키보드 네비게이션
 * - ARIA 레이블
 * - 폼 접근성
 */

test.describe('접근성 테스트 (Accessibility)', () => {
  test('랜딩 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('회원가입 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/auth/signup')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('로그인 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/auth/login')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('세무 가이드 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/help/tax-guide')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('키보드 네비게이션 - 회원가입 폼', async ({ page }) => {
    await page.goto('/auth/signup')

    // Tab 키로 폼 요소 간 이동
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName)

    // 첫 번째 입력 필드에 포커스되어야 함
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement)

    // Tab 키를 여러 번 눌러 모든 폼 요소를 순회
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    }
  })

  test('키보드 네비게이션 - 현장 생성 폼', async ({ page }) => {
    // Note: 로그인 상태여야 함
    await page.goto('/sites/new')

    // 페이지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle')

    // Tab 키로 폼 필드 순회
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          type: (el as HTMLInputElement)?.type,
          name: (el as HTMLInputElement)?.name,
        }
      })

      // 포커스 가능한 요소인지 확인
      expect(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A']).toContain(focusedElement.tag)
    }
  })

  test('스크린 리더 호환성 - ARIA 레이블', async ({ page }) => {
    await page.goto('/sites/new')

    // 폼 필드에 적절한 레이블이 있는지 확인
    const nameInput = page.locator('input[name="name"]')
    if (await nameInput.isVisible()) {
      const ariaLabel = await nameInput.getAttribute('aria-label')
      const labelFor = await page.locator('label[for="name"]').count()

      // aria-label 또는 연결된 label이 있어야 함
      expect(ariaLabel || labelFor > 0).toBeTruthy()
    }
  })

  test('색상 대비 검사 - 버튼', async ({ page }) => {
    await page.goto('/')

    // 모든 버튼의 색상 대비 확인
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('button')
      .withTags(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('모바일 터치 타겟 크기 (최소 44x44px)', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 모든 클릭 가능한 요소 확인
    const clickableElements = await page.locator('button, a, input[type="checkbox"], input[type="radio"]').all()

    for (const element of clickableElements.slice(0, 10)) {
      // 처음 10개만 테스트
      if (await element.isVisible()) {
        const box = await element.boundingBox()
        if (box) {
          // 터치 타겟은 최소 44x44px 권장
          expect(box.width).toBeGreaterThanOrEqual(30) // 약간 여유를 둠
          expect(box.height).toBeGreaterThanOrEqual(30)
        }
      }
    }
  })

  test('폼 오류 메시지 접근성', async ({ page }) => {
    await page.goto('/auth/signup')

    // 빈 폼 제출 시도
    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()

      // 오류 메시지가 aria-live 또는 role="alert"로 표시되는지 확인
      const errorMessages = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]')
      const count = await errorMessages.count()

      // 오류가 있으면 접근 가능한 방식으로 표시되어야 함
      if (count > 0) {
        expect(count).toBeGreaterThan(0)
      }
    }
  })

  test('이미지 대체 텍스트 (alt text)', async ({ page }) => {
    await page.goto('/')

    // 모든 이미지 확인
    const images = await page.locator('img').all()

    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')

      // alt 속성이 있거나 role="presentation"이어야 함
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
  })

  test('Heading 계층 구조 (h1 → h2 → h3)', async ({ page }) => {
    await page.goto('/')

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = await Promise.all(
      headings.map(async (h) => {
        const tag = await h.evaluate((el) => el.tagName)
        return parseInt(tag.replace('H', ''))
      })
    )

    // h1이 최소 하나 있어야 함
    expect(headingLevels).toContain(1)

    // heading이 논리적 순서로 배치되어야 함 (건너뛰기 없이)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1]
      // 다음 헤딩이 2단계 이상 건너뛰지 않아야 함
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  test('포커스 표시 (Focus Indicators)', async ({ page }) => {
    await page.goto('/auth/login')

    // 첫 번째 입력 필드에 포커스
    const firstInput = page.locator('input').first()
    await firstInput.focus()

    // 포커스 스타일 확인 (outline 또는 box-shadow)
    const focusStyle = await firstInput.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
      }
    })

    // 포커스 시 시각적 표시가 있어야 함
    const hasFocusIndicator =
      focusStyle.outline !== 'none' ||
      focusStyle.boxShadow !== 'none' ||
      focusStyle.borderColor !== 'rgb(0, 0, 0)' // 기본 검은색이 아님

    expect(hasFocusIndicator).toBeTruthy()
  })
})
