// 사업자번호 검증 (10자리)
export function validateBusinessNumber(businessNumber: string): boolean {
  // 하이픈 제거
  const cleaned = businessNumber.replace(/-/g, '')

  // 10자리 숫자인지 확인
  if (!/^\d{10}$/.test(cleaned)) {
    return false
  }

  // 체크섬 검증
  const digits = cleaned.split('').map(Number)
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i]
  }

  // 9번째 자리에 대한 특수 계산
  sum += Math.floor((digits[8] * 5) / 10)

  const checkDigit = (10 - (sum % 10)) % 10

  return checkDigit === digits[9]
}

// 사업자번호 포맷 (000-00-00000)
export function formatBusinessNumber(businessNumber: string): string {
  const cleaned = businessNumber.replace(/-/g, '')
  if (cleaned.length !== 10) return businessNumber

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
}

// 전화번호 검증
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '')
  return /^(01[0-9]|02|0[3-9][0-9])[0-9]{3,4}[0-9]{4}$/.test(cleaned)
}

// 전화번호 포맷 (010-0000-0000)
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')

  if (cleaned.startsWith('02')) {
    // 서울 지역번호
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
  } else {
    // 기타 지역번호 및 휴대폰
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
    }
  }

  return phone
}

// 주민등록번호 마스킹 (123456-1******)
export function maskIdNumber(idNumber: string): string {
  const cleaned = idNumber.replace(/-/g, '')
  if (cleaned.length !== 13) return '***********'

  return `${cleaned.slice(0, 6)}-${cleaned[6]}******`
}

// 은행 계좌번호 마스킹 (끝 4자리만 표시)
export function maskBankAccount(account: string): string {
  const cleaned = account.replace(/[^0-9]/g, '')
  if (cleaned.length < 4) return '****'

  const masked = '*'.repeat(cleaned.length - 4)
  return masked + cleaned.slice(-4)
}
