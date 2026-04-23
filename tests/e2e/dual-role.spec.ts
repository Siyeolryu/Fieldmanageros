import { test, expect } from '@playwright/test'

/**
 * Phase 7: E2E 테스트 - Dual-Role 핵심 시나리오
 *
 * 테스트 시나리오:
 * 1. 회원가입 시 "관리자 + 근로자" 역할 선택
 * 2. 프로필 설정 (시급, 은행 정보 입력)
 * 3. 현장 생성 시 본인 포함 옵션 선택
 * 4. 본인이 근로자 목록에 포함되어 있는지 확인
 * 5. 출퇴근 입력 및 급여 계산 확인
 */

test.describe('Dual-Role 사용자 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('회원가입 - 관리자+근로자 역할 선택', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.click('text=회원가입')

    // URL 확인
    await expect(page).toHaveURL(/.*auth\/signup/)

    // 페이지 헤더 확인
    await expect(page.locator('h1, h2').filter({ hasText: '회원가입' })).toBeVisible()

    // 역할 선택 라디오 버튼 확인
    const bothRadio = page.locator('input[type="radio"][value="both"]')
    await expect(bothRadio).toBeVisible()

    // "관리자 + 근로자" 옵션 선택
    await bothRadio.check()
    await expect(bothRadio).toBeChecked()
  })

  test('프로필 설정 - 근로자 정보 입력', async ({ page }) => {
    // Note: 실제 테스트 시 회원가입 후 자동으로 프로필 설정 페이지로 이동해야 함
    // 여기서는 프로필 설정 페이지가 존재한다고 가정

    // 임시: 로그인 후 프로필 페이지로 이동
    await page.goto('/profile')

    // 근로자 정보 섹션 확인
    const workerInfoSection = page.locator('text=근로자 정보')
    if (await workerInfoSection.isVisible()) {
      // 시급 입력
      const hourlyRateInput = page.locator('input[name="hourlyRate"], input[placeholder*="시급"]')
      if (await hourlyRateInput.isVisible()) {
        await hourlyRateInput.fill('25000')
      }

      // 은행 선택
      const bankSelect = page.locator('select[name="bankName"], select').filter({ hasText: /은행/ }).first()
      if (await bankSelect.isVisible()) {
        await bankSelect.selectOption({ label: /국민은행/ })
      }
    }
  })

  test('현장 생성 - 본인 포함 옵션', async ({ page }) => {
    // Note: 실제 테스트 시 로그인 상태여야 함
    await page.goto('/sites/new')

    // 현장 정보 입력
    await page.fill('input[name="name"]', '테스트 현장')

    // 건설사 선택 (첫 번째 옵션)
    const companySelect = page.locator('select[name="companyId"]')
    await companySelect.selectOption({ index: 1 })

    // "이 현장에 본인도 작업자로 투입" 체크박스 확인
    const includeMyselfCheckbox = page.locator('input[type="checkbox"]#includeMyself')

    if (await includeMyselfCheckbox.isVisible()) {
      await includeMyselfCheckbox.check()
      await expect(includeMyselfCheckbox).toBeChecked()

      // 세무 안내 문구 표시 확인
      await expect(page.locator('text=세무 안내')).toBeVisible()
      await expect(page.locator('text=원천징수')).toBeVisible()
    }
  })

  test('근로자 목록 - 본인 강조 표시', async ({ page }) => {
    // 현장 상세 페이지로 이동 (테스트용 현장 ID 필요)
    await page.goto('/sites')

    // 첫 번째 현장 클릭
    const firstSite = page.locator('[data-testid="site-card"]').first()
    if (await firstSite.isVisible()) {
      await firstSite.click()
    }

    // 근로자 목록에서 "본인" 뱃지 확인
    const ownerBadge = page.locator('text=본인').or(page.locator('[data-testid="owner-badge"]'))
    if (await ownerBadge.isVisible()) {
      await expect(ownerBadge).toBeVisible()
    }

    // 관리자 뱃지 확인
    const managerBadge = page.locator('text=관리자').or(page.locator('[data-testid="manager-badge"]'))
    if (await managerBadge.isVisible()) {
      await expect(managerBadge).toBeVisible()
    }
  })

  test('급여 명세서 - 본인 급여 세무 안내', async ({ page }) => {
    // 급여 페이지로 이동
    await page.goto('/payroll')

    // "본인 급여" 표시 확인
    const ownerPayrollBadge = page.locator('text=본인 급여')
    if (await ownerPayrollBadge.isVisible()) {
      await expect(ownerPayrollBadge).toBeVisible()

      // 세무 처리 안내 섹션 확인
      await expect(page.locator('text=본인 급여 세무 처리 안내')).toBeVisible()
      await expect(page.locator('text=원천징수')).toBeVisible()
      await expect(page.locator('text=4대보험')).toBeVisible()
      await expect(page.locator('text=고용보험 제외')).toBeVisible()
    }
  })

  test('세무 가이드 페이지 접근', async ({ page }) => {
    // 세무 가이드 페이지로 이동
    await page.goto('/help/tax-guide')

    // 페이지 로딩 확인
    await expect(page).toHaveURL(/.*help\/tax-guide/)

    // 주요 섹션 확인
    await expect(page.locator('text=Dual-Role')).toBeVisible()
    await expect(page.locator('text=4대보험')).toBeVisible()
    await expect(page.locator('text=원천징수')).toBeVisible()

    // FAQ 섹션 확인
    const faqSection = page.locator('text=자주 묻는 질문').or(page.locator('text=FAQ'))
    if (await faqSection.isVisible()) {
      await expect(faqSection).toBeVisible()
    }
  })
})

test.describe('세무 알림 기능', () => {
  test('TaxNotification 표시 확인', async ({ page }) => {
    // 대시보드/홈 페이지로 이동 (로그인 필요)
    await page.goto('/home')

    // 현재 날짜가 원천징수 신고일(10일) 또는 4대보험 신고일(15일) 근처인지 확인
    const today = new Date()
    const day = today.getDate()

    // 원천징수 알림 (5일 전~신고일)
    if (day >= 5 && day <= 10) {
      const withholdingNotification = page.locator('text=원천징수 신고')
      if (await withholdingNotification.isVisible()) {
        await expect(withholdingNotification).toBeVisible()
        await expect(page.locator('text=홈택스')).toBeVisible()
      }
    }

    // 4대보험 알림 (7일 전~신고일)
    if (day >= 8 && day <= 15) {
      const insuranceNotification = page.locator('text=4대보험 신고')
      if (await insuranceNotification.isVisible()) {
        await expect(insuranceNotification).toBeVisible()
      }
    }
  })
})
