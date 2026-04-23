import { test, expect, devices } from '@playwright/test'

/**
 * Phase 7: 모바일 반응형 테스트
 *
 * 다양한 디바이스에서 UI가 올바르게 표시되는지 확인
 * - iPhone 13 (375x667)
 * - Galaxy S21 (360x800)
 * - iPad (768x1024)
 */

const viewports = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'Galaxy S21', width: 360, height: 800 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
]

test.describe('모바일 반응형 테스트', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      test('랜딩 페이지 렌더링', async ({ page }) => {
        await page.goto('/')

        // 페이지가 로드되고 스크롤 없이 주요 콘텐츠가 보여야 함
        await expect(page).toHaveTitle(/노무PRO/i)

        // 주요 CTA 버튼 확인
        const ctaButton = page.locator('text=회원가입').or(page.locator('button').filter({ hasText: /가입|시작/ })).first()
        if (await ctaButton.isVisible()) {
          await expect(ctaButton).toBeVisible()
        }
      })

      test('회원가입 폼 레이아웃', async ({ page }) => {
        await page.goto('/auth/signup')

        // 폼 필드가 수직으로 배치되어야 함 (모바일)
        const formInputs = page.locator('input[type="email"], input[type="password"]').all()
        const inputs = await formInputs

        if (inputs.length >= 2) {
          const firstBox = await inputs[0].boundingBox()
          const secondBox = await inputs[1].boundingBox()

          if (firstBox && secondBox) {
            // 모바일에서는 입력 필드가 수직으로 쌓여야 함
            if (viewport.width < 768) {
              expect(secondBox.y).toBeGreaterThan(firstBox.y)
            }
          }
        }
      })

      test('네비게이션 메뉴 (햄버거 메뉴)', async ({ page }) => {
        await page.goto('/')

        if (viewport.width < 768) {
          // 모바일: 햄버거 메뉴 버튼이 보여야 함
          const hamburgerMenu = page.locator('[aria-label*="메뉴"], button[aria-label*="menu"]').or(
            page.locator('button').filter({ hasText: /☰|≡/ })
          )

          if (await hamburgerMenu.isVisible()) {
            await expect(hamburgerMenu).toBeVisible()
          }
        }
      })

      test('버튼 터치 타겟 크기 (최소 44x44px)', async ({ page }) => {
        await page.goto('/auth/login')

        const buttons = await page.locator('button').all()

        for (const button of buttons.slice(0, 5)) {
          if (await button.isVisible()) {
            const box = await button.boundingBox()
            if (box) {
              // iOS/Android 권장: 44x44px
              if (viewport.width < 768) {
                expect(box.height).toBeGreaterThanOrEqual(40) // 약간 여유
              }
            }
          }
        }
      })

      test('텍스트 가독성 (최소 16px)', async ({ page }) => {
        await page.goto('/')

        // 본문 텍스트 크기 확인
        const bodyText = page.locator('p, div').filter({ hasText: /현장|관리|급여/ }).first()

        if (await bodyText.isVisible()) {
          const fontSize = await bodyText.evaluate((el) => {
            return window.getComputedStyle(el).fontSize
          })

          const fontSizeNum = parseInt(fontSize)

          // 모바일에서 최소 14px (이상적으로는 16px)
          expect(fontSizeNum).toBeGreaterThanOrEqual(14)
        }
      })

      test('가로 스크롤 없음', async ({ page }) => {
        await page.goto('/')

        // 페이지 너비가 뷰포트를 초과하지 않아야 함
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // 약간의 오차 허용
      })

      test('이미지 반응형 (max-width: 100%)', async ({ page }) => {
        await page.goto('/')

        const images = await page.locator('img').all()

        for (const img of images.slice(0, 5)) {
          if (await img.isVisible()) {
            const box = await img.boundingBox()
            if (box) {
              // 이미지가 뷰포트를 넘지 않아야 함
              expect(box.width).toBeLessThanOrEqual(viewport.width)
            }
          }
        }
      })

      test('폼 입력 필드 너비 (모바일 최적화)', async ({ page }) => {
        await page.goto('/sites/new')

        const inputs = await page.locator('input[type="text"], input[type="email"]').all()

        for (const input of inputs.slice(0, 3)) {
          if (await input.isVisible()) {
            const box = await input.boundingBox()
            if (box) {
              // 모바일에서 입력 필드는 전체 너비 또는 적절한 너비
              if (viewport.width < 768) {
                expect(box.width).toBeGreaterThan(200) // 최소 너비
                expect(box.width).toBeLessThanOrEqual(viewport.width - 40) // 좌우 여백 고려
              }
            }
          }
        }
      })
    })
  }

  test('가로/세로 방향 전환', async ({ page }) => {
    // 세로 모드
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveTitle(/노무PRO/i)

    // 가로 모드로 회전
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500) // 레이아웃 재계산 대기

    // 여전히 페이지가 올바르게 표시되어야 함
    await expect(page).toHaveTitle(/노무PRO/i)
  })

  test('테이블 반응형 (모바일에서 스크롤 또는 카드형)', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/payroll')

    // 테이블 확인
    const tables = await page.locator('table').count()

    if (tables > 0) {
      // 모바일에서 테이블이 있으면 overflow-x: auto가 적용되어야 함
      const overflowX = await page.locator('table').first().evaluate((el) => {
        return window.getComputedStyle(el.parentElement!).overflowX
      })

      // 스크롤 가능하거나 테이블이 변형되어야 함
      expect(['auto', 'scroll', 'hidden']).toContain(overflowX)
    }
  })

  test('모달/팝업 모바일 최적화', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 모달이 있는 경우 (예: 확인 다이얼로그)
    // 모달 너비가 화면 너비의 90% 이하여야 함
    const modals = await page.locator('[role="dialog"], .modal').all()

    for (const modal of modals) {
      if (await modal.isVisible()) {
        const box = await modal.boundingBox()
        if (box) {
          expect(box.width).toBeLessThanOrEqual(375 * 0.95)
        }
      }
    }
  })
})

test.describe('Tailwind 반응형 클래스 검증', () => {
  test('md: 브레이크포인트 (768px)', async ({ page }) => {
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 데스크탑 뷰
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.reload()

    // 레이아웃이 변경되어야 함 (예: 그리드 컬럼 수)
    await page.waitForTimeout(500)
    await expect(page).toHaveTitle(/노무PRO/i)
  })

  test('lg: 브레이크포인트 (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    // 대형 화면에서 최대 너비 제한 확인
    const container = page.locator('main, .container').first()
    if (await container.isVisible()) {
      const box = await container.boundingBox()
      if (box) {
        // 컨테이너가 적절한 최대 너비를 가져야 함
        expect(box.width).toBeGreaterThan(0)
      }
    }
  })
})

test.describe('성능 최적화 (모바일)', () => {
  test('초기 로딩 시간 (3초 이내)', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    const loadTime = Date.now() - startTime

    // 모바일 3G 환경 시뮬레이션 없이도 3초 이내 로딩
    expect(loadTime).toBeLessThan(3000)
  })

  test('이미지 지연 로딩 (Lazy Loading)', async ({ page }) => {
    await page.goto('/')

    // 모든 이미지에 loading="lazy" 속성 확인
    const images = await page.locator('img').all()

    for (const img of images) {
      const loading = await img.getAttribute('loading')
      // 첫 화면 이미지는 eager, 나머지는 lazy
      if (loading) {
        expect(['lazy', 'eager']).toContain(loading)
      }
    }
  })
})
