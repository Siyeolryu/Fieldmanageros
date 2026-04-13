// Attendance 타입 정의 (Supabase 기반)
interface Attendance {
  id: string
  worker_id: string
  site_id: string
  date: string
  hours_worked: number
  is_weekly_holiday?: boolean
  created_at?: string
  updated_at?: string
}

/**
 * 급여 계산 상수 (2026년 기준)
 */
export const TAX_RATES = {
  HEALTH_INSURANCE: 0.03595,       // 건강보험 (근로자 부담분: 3.595%)
  LONG_TERM_CARE: 0.1314,          // 장기요양보험 (건강보험료의 13.14%)
  NATIONAL_PENSION: 0.0475,         // 국민연금 (근로자 부담분: 4.75%)
  EMPLOYMENT_INSURANCE: 0.009,     // 고용보험 (근로자 부담분: 0.9%)
  DAILY_ALLOWANCE_LIMIT: 150000,    // 일당 소득공제액 (15만원)
  INCOME_TAX_RATE: 0.06,           // 소득세율 (6%)
  INCOME_TAX_DEDUCTION: 0.55,      // 근로소득세액공제 (55%)
}

/**
 * 주휴수당 계산 상수
 */
export const WEEKLY_HOLIDAY_CONSTANTS = {
  MIN_WEEKLY_HOURS: 15,            // 주휴수당 발생 최소 주간 근무시간
  STANDARD_WEEKLY_HOURS: 40,       // 소정근로시간 (주 40시간)
  STANDARD_DAILY_HOURS: 8,         // 1일 소정근로시간 (8시간)
}

/**
 * 주차별 근무시간 계산
 * @param attendances 출근 기록 배열
 * @returns 주차별 근무시간 맵 (주차 번호 -> 총 근무시간)
 */
export function calculateWeeklyHours(attendances: Attendance[]): Map<number, number> {
  const weeklyHours = new Map<number, number>()

  attendances.forEach(record => {
    const date = new Date(record.date)
    // 해당 월의 몇 번째 주인지 계산 (1일이 속한 주를 1주차로)
    const dayOfMonth = date.getDate()
    const weekNumber = Math.ceil(dayOfMonth / 7)

    const currentHours = weeklyHours.get(weekNumber) || 0
    weeklyHours.set(weekNumber, currentHours + Number(record.hours_worked))
  })

  return weeklyHours
}

/**
 * 주휴수당 자동 계산
 * - 주 15시간 이상 근무 시 주휴수당 지급
 * - 주휴수당 = (주간 근무시간 / 40시간) × 8시간 × 시급
 * @param attendances 출근 기록 배열
 * @param hourlyRate 시급
 * @returns 주휴수당 총액
 */
export function calculateAutoWeeklyHolidayPay(
  attendances: Attendance[],
  hourlyRate: number
): { pay: number; eligibleWeeks: number } {
  const weeklyHours = calculateWeeklyHours(attendances)
  let totalWeeklyHolidayPay = 0
  let eligibleWeeks = 0

  weeklyHours.forEach((hours, weekNumber) => {
    // 주 15시간 이상 근무한 경우에만 주휴수당 지급
    if (hours >= WEEKLY_HOLIDAY_CONSTANTS.MIN_WEEKLY_HOURS) {
      // 주휴수당 = (실제 근무시간 / 소정근로시간) × 1일 소정근로시간 × 시급
      // 단, 최대 8시간까지만 인정
      const ratio = Math.min(hours / WEEKLY_HOLIDAY_CONSTANTS.STANDARD_WEEKLY_HOURS, 1)
      const weeklyPay = ratio * WEEKLY_HOLIDAY_CONSTANTS.STANDARD_DAILY_HOURS * hourlyRate
      totalWeeklyHolidayPay += weeklyPay
      eligibleWeeks++
    }
  })

  return {
    pay: Math.floor(totalWeeklyHolidayPay),
    eligibleWeeks
  }
}

/**
 * 일용직 소득세 계산 (일당 기준)
 * 계산식: (일급 - 150,000) * 6% * (1 - 55%) = (일급 - 150,000) * 2.7%
 */
export function calculateDailyIncomeTax(dailyPay: number): number {
  if (dailyPay <= TAX_RATES.DAILY_ALLOWANCE_LIMIT) return 0
  const taxableAmount = dailyPay - TAX_RATES.DAILY_ALLOWANCE_LIMIT
  const tax = taxableAmount * TAX_RATES.INCOME_TAX_RATE * (1 - TAX_RATES.INCOME_TAX_DEDUCTION)
  return Math.floor(tax / 10) * 10 // 10원 단위 절사
}

/**
 * 급여 계산 결과 타입
 */
export interface PayrollCalculationResult {
  totalHours: number
  totalWorkDays: number
  basePay: number
  weeklyHolidayPay: number
  overtimePay: number
  totalPay: number
  healthInsurance: number
  pensionInsurance: number
  employmentInsurance: number
  incomeTax: number
  totalDeduction: number
  netPay: number
}

/**
 * 한 달 치 급여 계산 메인 함수
 * @param attendances 출근 기록 배열
 * @param hourlyRate 시급
 * @param manualWeeklyHolidayCount 수동 주휴수당 공수 (기본값 0이면 자동 계산)
 */
export function calculateMonthlyPayroll(
  attendances: (Attendance & { hoursWorked?: number })[],
  hourlyRate: number,
  manualWeeklyHolidayCount: number = 0
): PayrollCalculationResult {
  let totalHours = 0
  let totalWorkDays = 0
  let basePay = 0
  let weeklyHolidayPay = 0
  let overtimePay = 0
  let totalIncomeTax = 0

  // Attendance 타입으로 변환
  const normalizedAttendances: Attendance[] = attendances.map(a => ({
    ...a,
    hours_worked: a.hoursWorked || a.hours_worked || 0
  }))

  normalizedAttendances.forEach(record => {
    const hours = Number(record.hours_worked)
    totalHours += hours
    totalWorkDays += 1

    // 기본급 (8시간 기준)
    const dailyBaseHours = Math.min(hours, 8)
    const dailyBasePay = dailyBaseHours * hourlyRate
    basePay += dailyBasePay

    // 연장수당 (8시간 초과분 * 1.5)
    if (hours > 8) {
      const dailyOvertimeHours = hours - 8
      const dailyOvertimePay = dailyOvertimeHours * hourlyRate * 1.5
      overtimePay += dailyOvertimePay
    }

    // 일별 소득세 합산 (주휴수당 제외한 일급 기준)
    const totalDailyPay = dailyBasePay + (hours > 8 ? (hours - 8) * hourlyRate * 1.5 : 0)
    totalIncomeTax += calculateDailyIncomeTax(totalDailyPay)
  })

  // 주휴수당 계산
  if (manualWeeklyHolidayCount > 0) {
    // 수동 입력 우선 (매니저가 직접 지정한 공수)
    weeklyHolidayPay = manualWeeklyHolidayCount * 8 * hourlyRate
  } else {
    // 자동 계산 (주 15시간 이상 근무 시 자동 지급)
    const autoResult = calculateAutoWeeklyHolidayPay(normalizedAttendances, hourlyRate)
    weeklyHolidayPay = autoResult.pay
  }

  const totalPayBeforeInsurance = basePay + overtimePay + weeklyHolidayPay

  // 4대 보험 (8일 이상 근무 시 공제 가정)
  let healthInsurance = 0
  let pensionInsurance = 0
  let employmentInsurance = 0

  if (totalWorkDays >= 8) {
    healthInsurance = Math.floor(totalPayBeforeInsurance * TAX_RATES.HEALTH_INSURANCE / 10) * 10
    const longTermCare = Math.floor(healthInsurance * TAX_RATES.LONG_TERM_CARE / 10) * 10
    healthInsurance += longTermCare
    
    pensionInsurance = Math.floor(totalPayBeforeInsurance * TAX_RATES.NATIONAL_PENSION / 10) * 10
  }

  // 고용보험은 근로일수 무관 공제 (일용직 특수성 고려)
  employmentInsurance = Math.floor(totalPayBeforeInsurance * TAX_RATES.EMPLOYMENT_INSURANCE / 10) * 10

  const incomeTax = totalIncomeTax
  const localTax = Math.floor(incomeTax * 0.1 / 10) * 10
  const finalIncomeTax = incomeTax + localTax

  const totalDeduction = healthInsurance + pensionInsurance + employmentInsurance + finalIncomeTax
  const netPay = totalPayBeforeInsurance - totalDeduction

  return {
    totalHours,
    totalWorkDays,
    basePay,
    weeklyHolidayPay,
    overtimePay,
    totalPay: totalPayBeforeInsurance,
    healthInsurance,
    pensionInsurance,
    employmentInsurance,
    incomeTax: finalIncomeTax,
    totalDeduction,
    netPay,
  }
}
