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

  const data: (string | number)[][] = [
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
    const row: (string | number)[] = [workerName]

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

  const data: (string | number)[][] = [header]

  // 각 근로자별 데이터
  workers.forEach((worker) => {
    const row: (string | number)[] = [
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

/**
 * 노임대장 업로드용 빈 서식 파일 생성 (동적 - 연/월 기반)
 * 파서 parsePayrollLedgerExcel 과 100% 호환되는 컬럼 구조
 * 컬럼: 이름 | 전화번호 | 주민등록번호 | 은행명 | 계좌번호 | 시급 | 1일 ... N일
 */
export function generateLedgerTemplateExcel(year: number, month: number): Buffer {
  const daysInMonth = new Date(year, month, 0).getDate()

  // 헤더 행: 파서가 index 0~5를 근로자 정보, 6~ 을 날짜별 근무시간으로 읽음
  // 날짜 헤더를 실제 Date 값으로 설정 (xlsx가 날짜 직렬로 변환 → 파서가 XLSX.SSF.parse_date_code로 파싱)
  const dateHeader: (string | number | Date)[] = [
    '이름', '전화번호', '주민등록번호', '은행명', '계좌번호', '시급',
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month - 1, i + 1)),
  ]

  // 샘플 데이터 3행 (입력 예시 - 사용자가 내용을 지우고 실제 데이터 입력)
  const sampleRows: (string | number)[][] = [
    ['홍길동', '010-1234-5678', '900101-1000000', '국민은행', '123-456-789012', 25000, ...Array(daysInMonth).fill('')],
    ['김철수', '010-2345-6789', '850515-1000000', '신한은행', '234-567-890123', 28000, ...Array(daysInMonth).fill('')],
    ['이영희', '010-3456-7890', '920303-2000000', '우리은행', '345-678-901234', 26000, ...Array(daysInMonth).fill('')],
  ]

  const data: (string | number | Date)[][] = [dateHeader, ...sampleRows]

  const worksheet = XLSX.utils.aoa_to_sheet(data, { cellDates: true })

  // 날짜 열 서식: M/D 형태로 표시 (예: 5/1, 5/2)
  for (let col = 6; col < 6 + daysInMonth; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].z = 'M/D'
    }
  }

  // 열 너비 설정
  const colWidths: { wch: number }[] = [
    { wch: 10 }, // 이름
    { wch: 14 }, // 전화번호
    { wch: 16 }, // 주민등록번호
    { wch: 10 }, // 은행명
    { wch: 20 }, // 계좌번호
    { wch: 8  }, // 시급
    ...Array(daysInMonth).fill({ wch: 5 }), // 날짜별
  ]
  worksheet['!cols'] = colWidths

  // 첫 행 고정 (헤더 고정)
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2', sqref: 'A2' }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, `${year}년 ${month}월 노임대장`)

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}
