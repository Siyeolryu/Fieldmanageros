/**
 * 기존 사용자 삭제 후 테스트 이메일 재전송
 *
 * 사용법: npx tsx scripts/delete-user-and-resend.ts <email>
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const email = process.argv[2]

if (!email) {
  console.error('❌ 에러: 이메일 주소를 입력해주세요')
  console.log('사용법: npx tsx scripts/delete-user-and-resend.ts your-email@example.com')
  process.exit(1)
}

console.log('🔄 사용자 삭제 및 테스트 이메일 재전송')
console.log('─'.repeat(60))
console.log('이메일:', email)
console.log('')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteAndResend() {
  try {
    // Step 1: 기존 사용자 찾기
    console.log('🔍 Step 1: 기존 사용자 찾기...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError.message)
      return
    }

    const existingUser = users.users.find(u => u.email === email)

    if (!existingUser) {
      console.log('✅ 기존 사용자 없음. 바로 이메일 전송 진행합니다.')
      console.log('')
    } else {
      console.log('✅ 기존 사용자 발견:', existingUser.id)
      console.log('   Email:', existingUser.email)
      console.log('   Created:', existingUser.created_at)
      console.log('')

      // Step 2: 사용자 삭제
      console.log('🗑️  Step 2: 기존 사용자 삭제 중...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id)

      if (deleteError) {
        console.error('❌ 사용자 삭제 실패:', deleteError.message)
        return
      }

      console.log('✅ 사용자 삭제 완료!')
      console.log('')

      // 데이터베이스 처리 대기 (3초)
      console.log('⏳ 데이터베이스 처리 대기 중... (3초)')
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('')
    }

    // Step 3: 새로운 초대 이메일 전송
    console.log('📨 Step 3: 테스트 이메일 전송 중...')
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'http://localhost:3000/auth/callback'
    })

    if (error) {
      console.error('❌ 이메일 전송 실패:', error.message)
      return
    }

    console.log('✅ 이메일 전송 성공!')
    console.log('─'.repeat(60))
    console.log('')
    console.log('📬 이메일 확인 안내')
    console.log('─'.repeat(60))
    console.log(`📧 이메일: ${email}`)
    console.log('📍 확인 위치:')
    console.log('   1. 받은편지함 (1~2분 이내)')
    console.log('   2. 스팸메일함 (받은편지함에 없으면)')
    console.log('')
    console.log('📧 예상 이메일 내용:')
    console.log('─'.repeat(60))
    console.log('발신자: 노무PRO <your-gmail@gmail.com>')
    console.log('제목: 이메일 주소를 인증해주세요')
    console.log('')
    console.log('내용:')
    console.log('  ┌─────────────────────────────────┐')
    console.log('  │   [파란색 그라데이션 헤더]      │')
    console.log('  │         노무PRO                 │')
    console.log('  │   건설 현장 노무 관리 플랫폼     │')
    console.log('  └─────────────────────────────────┘')
    console.log('  ')
    console.log('  이메일 주소를 인증해주세요')
    console.log('  ')
    console.log('  안녕하세요,')
    console.log('  노무PRO 회원가입을 환영합니다!')
    console.log('  ')
    console.log('  ┌──────────────────────┐')
    console.log('  │  ✉️ 이메일 인증하기   │')
    console.log('  └──────────────────────┘')
    console.log('')
    console.log('⏰ 이메일 도착 예상 시간: 1~3분')
    console.log('')
    console.log('💡 Naver 메일 확인 팁:')
    console.log('─'.repeat(60))
    console.log('1. Naver 메일 접속')
    console.log('2. 받은편지함 확인')
    console.log('3. 없으면 왼쪽 메뉴 → 스팸메일함 확인')
    console.log('4. 스팸함에 있으면 "스팸 아님" 클릭')
    console.log('5. 다음부터는 받은편지함으로 도착!')
    console.log('')
    console.log('🔍 전송 상세 정보:')
    console.log('─'.repeat(60))
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
    console.log('Created At:', data.user.created_at)
    console.log('Email Confirmed:', data.user.email_confirmed_at ? '✅ Yes' : '❌ No (확인 필요)')
    console.log('')
    console.log('✨ 다음 단계:')
    console.log('─'.repeat(60))
    console.log('1. Naver 메일함을 확인하세요')
    console.log('2. 이메일이 도착하면 결과를 알려주세요!')
    console.log('3. 도착하면 앱 테스트로 진행하겠습니다')
    console.log('')

  } catch (err) {
    console.error('❌ 오류 발생:', err)
  }
}

deleteAndResend()
