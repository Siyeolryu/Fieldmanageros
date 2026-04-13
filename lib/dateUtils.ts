import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSunday, 
  isSameDay, 
  parseISO 
} from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

/**
 * 특정 월의 모든 날짜 배열 반환
 */
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(start)
  return eachDayOfInterval({ start, end })
}

/**
 * 주휴일 여부 확인 (기본적으로 일요일을 주휴일로 가정)
 * 현장 상황에 따라 토요일이나 평일로 변경될 수 있음
 */
export const isWeeklyHoliday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isSunday(d)
}

/**
 * 특정 월의 8일 이상 근무 여부 체크 (보험 공제 기준)
 */
export const isInsuranceTarget = (workDaysCount: number): boolean => {
  return workDaysCount >= 8
}

/**
 * 한국어 요일 반환
 */
export const getDayInKorean = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEEEE', { locale: ko })
}

/**
 * 날짜 비교 (년-월-일 동일 여부)
 */
export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isSameDay(d1, d2)
}
