/**
 * 이메일 회원가입 테스트 스크립트
 *
 * 사용법:
 * node scripts/test-email-signup.js your-email@example.com
 */

const email = process.argv[2]

if (!email) {
  console.error('❌ 에러: 이메일 주소를 입력해주세요')
  console.log('사용법: node scripts/test-email-signup.js your-email@example.com')
  process.exit(1)
}

console.log('📧 이메일 회원가입 테스트 시작...')
console.log('이메일:', email)
console.log('')

const testSignup = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/quick-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    const data = await response.json()

    console.log('─'.repeat(60))
    console.log('📊 응답 결과')
    console.log('─'.repeat(60))
    console.log('상태 코드:', response.status)
    console.log('응답 데이터:', JSON.stringify(data, null, 2))
    console.log('')

    if (response.ok) {
      console.log('✅ 회원가입 API 호출 성공!')
      console.log('')

      if (data.requiresEmailConfirmation) {
        console.log('📨 이메일 확인이 필요합니다')
        console.log('─'.repeat(60))
        console.log('다음 단계:')
        console.log('1. 이메일함 확인:', email)
        console.log('2. 스팸 메일함도 확인해주세요')
        console.log('3. "이메일 인증하기" 버튼 클릭')
        console.log('')
        console.log('⏰ 이메일 도착 예상 시간: 1~2분')
        console.log('')

        if (data.debugInfo) {
          console.log('🔍 디버그 정보:')
          console.log(JSON.stringify(data.debugInfo, null, 2))
        }
      } else if (data.autoSignedIn) {
        console.log('🎉 자동 로그인 완료!')
        console.log('⚠️  이메일 확인이 비활성화되어 있습니다.')
        console.log('')
        console.log('Supabase에서 이메일 확인을 활성화하려면:')
        console.log('https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/settings')
        console.log('→ "Enable email confirmations" ON')
      }
    } else {
      console.log('❌ 회원가입 실패')
      console.log('에러:', data.error || '알 수 없는 오류')

      if (response.status === 409) {
        console.log('')
        console.log('💡 이미 가입된 이메일입니다.')
        console.log('   다른 이메일로 테스트해주세요.')
      }
    }

    console.log('─'.repeat(60))
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message)
    console.log('')
    console.log('확인 사항:')
    console.log('1. 개발 서버가 실행 중인가요? (npm run dev)')
    console.log('2. http://localhost:3000 접속 가능한가요?')
  }
}

testSignup()
