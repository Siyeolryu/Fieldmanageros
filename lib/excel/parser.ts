import * as XLSX from 'xlsx'

export interface ParsedAttendanceRow {
  workerName: string
  date: Date
  hoursWorked: number
  isWeeklyHoliday: boolean
  notes?: string
}

export interface ParsedWorkerRow {
  name: string
  phone?: string
  idNumber?: string
  bankName?: string
  bankAccount?: string
  hourlyRate: number
}

/**
 * 엑셀 파일에서 출근 데이터 파싱
 * 예상 형식:
 * | 이름 | 날짜 | 근무시간 | 주휴수당 | 비고 |
 */
export function parseAttendanceExcel(buffer: Buffer): ParsedAttendanceRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // JSON으로 변환
  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  // 첫 행은 헤더로 간주하고 건너뜀
  const rows = data.slice(1)

  const parsed: ParsedAttendanceRow[] = []

  for (const row of rows) {
    // 빈 행 건너뛰기
    if (!row[0]) continue

    try {
      const workerName = String(row[0] || '').trim()
      const dateValue = row[1]
      const hoursWorked = parseFloat(row[2] || '0')
      const isWeeklyHoliday = row[3] === 'O' || row[3] === '○' || row[3] === 'Y' || row[3] === true
      const notes = row[4] ? String(row[4]).trim() : undefined

      // 날짜 파싱
      let date: Date
      if (typeof dateValue === 'number') {
        // Excel 날짜 형식 (1900년 1월 1일부터의 일수)
        date = XLSX.SSF.parse_date_code(dateValue)
        date = new Date(date.y, date.m - 1, date.d)
      } else if (typeof dateValue === 'string') {
        // 문자열 날짜 파싱
        date = new Date(dateValue)
      } else {
        continue // 유효하지 않은 날짜
      }

      if (isNaN(date.getTime())) {
        console.warn(`Invalid date for worker ${workerName}:`, dateValue)
        continue
      }

      if (workerName && !isNaN(hoursWorked)) {
        parsed.push({
          workerName,
          date,
          hoursWorked,
          isWeeklyHoliday,
          notes,
        })
      }
    } catch (error) {
      console.error('Error parsing row:', row, error)
    }
  }

  return parsed
}

/**
 * 엑셀 파일에서 근로자 데이터 파싱
 * 예상 형식:
 * | 이름 | 전화번호 | 주민등록번호 | 은행 | 계좌번호 | 시급 |
 */
export function parseWorkersExcel(buffer: Buffer): ParsedWorkerRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const rows = data.slice(1)

  const parsed: ParsedWorkerRow[] = []

  for (const row of rows) {
    if (!row[0]) continue

    try {
      const name = String(row[0] || '').trim()
      const phone = row[1] ? String(row[1]).trim() : undefined
      const idNumber = row[2] ? String(row[2]).trim() : undefined
      const bankName = row[3] ? String(row[3]).trim() : undefined
      const bankAccount = row[4] ? String(row[4]).trim() : undefined
      const hourlyRate = parseFloat(row[5] || '0')

      if (name && hourlyRate > 0) {
        parsed.push({
          name,
          phone,
          idNumber,
          bankName,
          bankAccount,
          hourlyRate,
        })
      }
    } catch (error) {
      console.error('Error parsing worker row:', row, error)
    }
  }

  return parsed
}

/**
 * 노임대장 형식 파싱
 * 일반적인 건설 현장 노임대장 양식
 */
export function parsePayrollLedgerExcel(buffer: Buffer): {
  workers: ParsedWorkerRow[]
  attendance: ParsedAttendanceRow[]
} {
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  // 첫 번째 시트에서 근로자 정보와 출근 데이터를 함께 파싱
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  // 헤더 분석 (날짜 컬럼 찾기)
  const headerRow = data[0] || []
  const dateColumns: number[] = []

  headerRow.forEach((cell: any, index: number) => {
    if (index > 5 && cell) {
      // 6번째 컬럼부터 날짜로 간주
      dateColumns.push(index)
    }
  })

  const workers: ParsedWorkerRow[] = []
  const attendance: ParsedAttendanceRow[] = []

  // 데이터 행 파싱 (첫 행은 헤더)
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (!row[0]) continue

    try {
      const name = String(row[0] || '').trim()
      const phone = row[1] ? String(row[1]).trim() : undefined
      const idNumber = row[2] ? String(row[2]).trim() : undefined
      const bankName = row[3] ? String(row[3]).trim() : undefined
      const bankAccount = row[4] ? String(row[4]).trim() : undefined
      const hourlyRate = parseFloat(row[5] || '0')

      if (name && hourlyRate > 0) {
        workers.push({
          name,
          phone,
          idNumber,
          bankName,
          bankAccount,
          hourlyRate,
        })

        // 날짜별 출근 데이터 파싱
        dateColumns.forEach((colIndex) => {
          const hoursWorked = parseFloat(row[colIndex] || '0')
          if (hoursWorked > 0) {
            const dateHeader = headerRow[colIndex]
            let date: Date

            if (typeof dateHeader === 'number') {
              const parsed = XLSX.SSF.parse_date_code(dateHeader)
              date = new Date(parsed.y, parsed.m - 1, parsed.d)
            } else {
              date = new Date(dateHeader)
            }

            if (!isNaN(date.getTime())) {
              attendance.push({
                workerName: name,
                date,
                hoursWorked,
                isWeeklyHoliday: false,
              })
            }
          }
        })
      }
    } catch (error) {
      console.error('Error parsing ledger row:', row, error)
    }
  }

  return { workers, attendance }
}
