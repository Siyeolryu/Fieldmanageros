import * as XLSX from 'xlsx'

interface PayrollData {
  workerName: string
  hourlyRate: number
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
  bankName?: string
  bankAccount?: string
}

interface AttendanceData {
  workerName: string
  date: Date
  hoursWorked: number
  isWeeklyHoliday: boolean
  notes?: string
}

/**
 * 급여명세서 엑셀 생성
 */
export function generatePayrollExcel(
  payrolls: PayrollData[],
  year: number,
  month: number
): Buffer {
  const data = [
    // 헤더
    [
      '이름',
      '시급',
      '근무일수',
      '근무시간',
      '기본급',
      '주휴수당',
      '연장수당',
      '총 지급액',
      '건강보험',
      '국민연금',
      '고용보험',
      '소득세',
      '총 공제액',
      '실수령액',
      '은행',
      '계좌번호',
    ],
    // 데이터
    ...payrolls.map((p) => [
      p.workerName,
      p.hourlyRate,
      p.totalWorkDays,
      p.totalHours,
      p.basePay,
      p.weeklyHolidayPay,
      p.overtimePay,
      p.totalPay,
      p.healthInsurance,
      p.pensionInsurance,
      p.employmentInsurance,
      p.incomeTax,
      p.totalDeduction,
      p.netPay,
      p.bankName || '',
      p.bankAccount || '',
    ]),
  ]

  // 합계 행
  const totals = [
    '합계',
    '',
    payrolls.reduce((sum, p) => sum + p.totalWorkDays, 0),
    payrolls.reduce((sum, p) => sum + p.totalHours, 0),
    payrolls.reduce((sum, p) => sum + p.basePay, 0),
    payrolls.reduce((sum, p) => sum + p.weeklyHolidayPay, 0),
    payrolls.reduce((sum, p) => sum + p.overtimePay, 0),
    payrolls.reduce((sum, p) => sum + p.totalPay, 0),
    payrolls.reduce((sum, p) => sum + p.healthInsurance, 0),
    payrolls.reduce((sum, p) => sum + p.pensionInsurance, 0),
    payrolls.reduce((sum, p) => sum + p.employmentInsurance, 0),
    payrolls.reduce((sum, p) => sum + p.incomeTax, 0),
    payrolls.reduce((sum, p) => sum + p.totalDeduction, 0),
    payrolls.reduce((sum, p) => sum + p.netPay, 0),
    '',
    '',
  ]
  data.push(totals)

  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // 열 너비 설정
  worksheet['!cols'] = [
    { wch: 10 }, // 이름
    { wch: 10 }, // 시급
    { wch: 10 }, // 근무일수
    { wch: 10 }, // 근무시간
    { wch: 12 }, // 기본급
    { wch: 12 }, // 주휴수당
    { wch: 12 }, // 연장수당
    { wch: 12 }, // 총 지급액
    { wch: 12 }, // 건강보험
    { wch: 12 }, // 국민연금
    { wch: 12 }, // 고용보험
    { wch: 12 }, // 소득세
    { wch: 12 }, // 총 공제액
    { wch: 12 }, // 실수령액
    { wch: 15 }, // 은행
    { wch: 20 }, // 계좌번호
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, `${year}년 ${month}월 급여`)

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

/**
 * 출근부 엑셀 생성
 */
export function generateAttendanceExcel(
  attendance: AttendanceData[],
  year: number,
  month: number
): Buffer {
  // 날짜별로 그룹화
  const dateMap = new Map<string, AttendanceData[]>()

  attendance.forEach((record) => {
    const dateKey = record.date.toISOString().split('T')[0]
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, [])
    }
    dateMap.get(dateKey)!.push(record)
  })

  const dates = Array.from(dateMap.keys()).sort()

  const data = [
    ['이름', ...dates, '총 근무일', '총 근무시간'],
  ]

  // 근로자별로 그룹화
  const workerMap = new Map<string, Map<string, number>>()

  attendance.forEach((record) => {
    if (!workerMap.has(record.workerName)) {
      workerMap.set(record.workerName, new Map())
    }
    const dateKey = record.date.toISOString().split('T')[0]
    workerMap.get(record.workerName)!.set(dateKey, record.hoursWorked)
  })

  // 각 근로자별 행 생성
  workerMap.forEach((dateHours, workerName) => {
    const row = [workerName]

    let totalDays = 0
    let totalHours = 0

    dates.forEach((date) => {
      const hours = dateHours.get(date) || 0
      row.push(hours)
      if (hours > 0) {
        totalDays++
        totalHours += hours
      }
    })

    row.push(totalDays, totalHours)
    data.push(row)
  })

  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // 열 너비 설정
  const cols = [{ wch: 12 }] // 이름
  dates.forEach(() => cols.push({ wch: 8 })) // 날짜
  cols.push({ wch: 12 }, { wch: 12 }) // 합계

  worksheet['!cols'] = cols

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, `${year}년 ${month}월 출근부`)

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

/**
 * 노임대장 엑셀 생성 (통합 형식)
 */
export function generatePayrollLedgerExcel(
  workers: {
    name: string
    phone?: string
    idNumber?: string
    bankName?: string
    bankAccount?: string
    hourlyRate: number
  }[],
  attendance: AttendanceData[],
  year: number,
  month: number,
  siteName: string
): Buffer {
  // 해당 월의 모든 날짜 생성
  const daysInMonth = new Date(year, month, 0).getDate()
  const dates: Date[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month - 1, day))
  }

  // 헤더 생성
  const header = [
    '이름',
    '전화번호',
    '주민등록번호',
    '은행',
    '계좌번호',
    '시급',
    ...dates.map((d) => `${d.getMonth() + 1}/${d.getDate()}`),
    '합계',
  ]

  const data = [header]

  // 각 근로자별 데이터
  workers.forEach((worker) => {
    const row = [
      worker.name,
      worker.phone || '',
      worker.idNumber || '',
      worker.bankName || '',
      worker.bankAccount || '',
      worker.hourlyRate,
    ]

    let totalHours = 0

    dates.forEach((date) => {
      const record = attendance.find(
        (a) =>
          a.workerName === worker.name &&
          a.date.toDateString() === date.toDateString()
      )
      const hours = record ? record.hoursWorked : 0
      row.push(hours)
      totalHours += hours
    })

    row.push(totalHours)
    data.push(row)
  })

  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // 열 너비 설정
  const cols = [
    { wch: 10 }, // 이름
    { wch: 13 }, // 전화번호
    { wch: 15 }, // 주민등록번호
    { wch: 10 }, // 은행
    { wch: 20 }, // 계좌번호
    { wch: 10 }, // 시급
    ...dates.map(() => ({ wch: 6 })), // 각 날짜
    { wch: 10 }, // 합계
  ]

  worksheet['!cols'] = cols

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    `${siteName}_${year}년${month}월`
  )

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}
