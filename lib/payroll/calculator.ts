// 급여 계산 엔진

interface WorkerAttendance {
  workerId: string
  workerName: string
  hourlyRate: number
  attendance: {
    date: Date
    hoursWorked: number
    isWeeklyHoliday: boolean
  }[]
}

interface PayrollResult {
  workerId: string
  year: number
  month: number
  totalWorkDays: number
  totalHours: number
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

// 2026년 기준 법정 비율
const RATES = {
  // 4대 보험 (근로자 부담률)
  HEALTH_INSURANCE: 0.03545, // 건강보험 3.545%
  PENSION_INSURANCE: 0.045, // 국민연금 4.5%
  EMPLOYMENT_INSURANCE: 0.009, // 고용보험 0.9%

  // 근로 시간 기준
  WEEKLY_STANDARD_HOURS: 40, // 주 40시간
  WEEKLY_HOLIDAY_ELIGIBILITY_HOURS: 15, // 주휴수당 자격: 주 15시간 이상

  // 연장근무 가산율
  OVERTIME_RATE: 1.5, // 연장근무 50% 가산
}

/**
 * 월 급여 계산
 */
export function calculateMonthlyPayroll(
  workerData: WorkerAttendance,
  year: number,
  month: number
): PayrollResult {
  const { workerId, hourlyRate, attendance } = workerData

  // 1. 기본급 계산 (시급 × 근무시간)
  const totalHours = attendance.reduce(
    (sum, a) => sum + a.hoursWorked,
    0
  )
  const basePay = Math.round(hourlyRate * totalHours)

  // 2. 주휴수당 계산
  const weeklyHolidayPay = calculateWeeklyHolidayPay(
    attendance,
    hourlyRate
  )

  // 3. 연장근무 수당 계산 (주 40시간 초과)
  const overtimePay = calculateOvertimePay(attendance, hourlyRate)

  // 4. 총 급여
  const totalPay = basePay + weeklyHolidayPay + overtimePay

  // 5. 4대 보험 공제 계산
  const healthInsurance = calculateHealthInsurance(totalPay)
  const pensionInsurance = calculatePensionInsurance(totalPay)
  const employmentInsurance = calculateEmploymentInsurance(totalPay)

  // 6. 소득세 계산
  const incomeTax = calculateIncomeTax(totalPay)

  // 7. 총 공제액
  const totalDeduction =
    healthInsurance + pensionInsurance + employmentInsurance + incomeTax

  // 8. 실수령액
  const netPay = totalPay - totalDeduction

  return {
    workerId,
    year,
    month,
    totalWorkDays: attendance.length,
    totalHours: Math.round(totalHours * 10) / 10,
    basePay,
    weeklyHolidayPay,
    overtimePay,
    totalPay,
    healthInsurance,
    pensionInsurance,
    employmentInsurance,
    incomeTax,
    totalDeduction,
    netPay,
  }
}

/**
 * 주휴수당 계산
 * - 주 15시간 이상 근무 시 지급
 * - 1주일 평균 근무시간 × 시급
 */
function calculateWeeklyHolidayPay(
  attendance: { date: Date; hoursWorked: number; isWeeklyHoliday: boolean }[],
  hourlyRate: number
): number {
  // 주차별로 그룹화
  const weeklyGroups = groupByWeek(attendance)

  let totalHolidayPay = 0

  for (const week of weeklyGroups) {
    const weeklyHours = week.reduce((sum, a) => sum + a.hoursWorked, 0)

    // 주 15시간 이상 근무 시 주휴수당 지급
    if (weeklyHours >= RATES.WEEKLY_HOLIDAY_ELIGIBILITY_HOURS) {
      const avgDailyHours = weeklyHours / week.length
      totalHolidayPay += avgDailyHours * hourlyRate
    }
  }

  return Math.round(totalHolidayPay)
}

/**
 * 연장근무 수당 계산
 * - 주 40시간 초과 시 50% 가산
 */
function calculateOvertimePay(
  attendance: { date: Date; hoursWorked: number }[],
  hourlyRate: number
): number {
  const weeklyGroups = groupByWeek(attendance)

  let totalOvertimePay = 0

  for (const week of weeklyGroups) {
    const weeklyHours = week.reduce((sum, a) => sum + a.hoursWorked, 0)

    if (weeklyHours > RATES.WEEKLY_STANDARD_HOURS) {
      const overtimeHours = weeklyHours - RATES.WEEKLY_STANDARD_HOURS
      totalOvertimePay += overtimeHours * hourlyRate * (RATES.OVERTIME_RATE - 1)
    }
  }

  return Math.round(totalOvertimePay)
}

/**
 * 건강보험료 계산
 */
function calculateHealthInsurance(totalPay: number): number {
  return Math.round(totalPay * RATES.HEALTH_INSURANCE)
}

/**
 * 국민연금 계산
 */
function calculatePensionInsurance(totalPay: number): number {
  // 월 소득 상한/하한 적용 (실제로는 더 복잡하지만 단순화)
  const MIN_INCOME = 370000 // 최저 소득
  const MAX_INCOME = 5900000 // 최고 소득

  const adjustedIncome = Math.min(Math.max(totalPay, MIN_INCOME), MAX_INCOME)
  return Math.round(adjustedIncome * RATES.PENSION_INSURANCE)
}

/**
 * 고용보험 계산
 */
function calculateEmploymentInsurance(totalPay: number): number {
  return Math.round(totalPay * RATES.EMPLOYMENT_INSURANCE)
}

/**
 * 소득세 계산 (간이세액표 기준)
 * - 실제로는 더 복잡하지만 단순화된 계산
 */
function calculateIncomeTax(totalPay: number): number {
  // 월 급여 구간별 소득세율 (2026년 기준 간소화)
  if (totalPay < 1000000) return 0
  if (totalPay < 2000000) return Math.round(totalPay * 0.006)
  if (totalPay < 3000000) return Math.round(totalPay * 0.015)
  if (totalPay < 4500000) return Math.round(totalPay * 0.024)
  if (totalPay < 8800000) return Math.round(totalPay * 0.035)
  return Math.round(totalPay * 0.038)
}

/**
 * 주차별로 출근 기록 그룹화
 * - 월요일 시작 기준
 */
function groupByWeek(
  attendance: { date: Date; hoursWorked: number }[]
): { date: Date; hoursWorked: number }[][] {
  const weeks: { date: Date; hoursWorked: number }[][] = []
  const sorted = [...attendance].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  let currentWeek: { date: Date; hoursWorked: number }[] = []
  let currentWeekStart: number | null = null

  for (const record of sorted) {
    const date = new Date(record.date)
    const weekStart = getWeekStart(date)

    if (currentWeekStart === null || weekStart !== currentWeekStart) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek)
      }
      currentWeek = []
      currentWeekStart = weekStart
    }

    currentWeek.push(record)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
}

/**
 * 주의 시작일 (월요일) 타임스탬프 가져오기
 */
function getWeekStart(date: Date): number {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 월요일로 조정
  const weekStart = new Date(d.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart.getTime()
}

/**
 * 여러 근로자의 급여를 일괄 계산
 */
export function calculateBatchPayroll(
  workersData: WorkerAttendance[],
  year: number,
  month: number
): PayrollResult[] {
  return workersData.map((worker) =>
    calculateMonthlyPayroll(worker, year, month)
  )
}
