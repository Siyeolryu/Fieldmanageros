/**
 * Supabase를 통해 테스트 이메일 전송
 *
 * 사용법: npx tsx scripts/send-test-email.ts <email>
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
  console.log('사용법: npx tsx scripts/send-test-email.ts your-email@example.com')
  process.exit(1)
}

console.log('📧 Supabase 테스트 이메일 전송')
console.log('─'.repeat(60))
console.log('이메일:', email)
console.log('발신자: 노무PRO')
console.log('')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function sendTestEmail() {
  try {
    console.log('📨 이메일 전송 중...')
    console.log('')

    // Admin API를 사용하여 사용자 초대
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'http://localhost:3000/auth/callback'
    })

    if (error) {
      console.error('❌ 이메일 전송 실패:', error.message)
      console.log('')

      if (error.message.includes('already registered')) {
        console.log('💡 이미 가입된 이메일입니다.')
        console.log('   다른 이메일로 시도하거나,')
        console.log('   Supabase Users 페이지에서 해당 사용자를 삭제 후 재시도하세요.')
        console.log('')
        console.log('🔗 Users 페이지:')
        console.log('   https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/users')
      }

      return
    }

    console.log('✅ 이메일 전송 성공!')
    console.log('─'.repeat(60))
    console.log('')
    console.log('📬 이메일 확인 안내')
    console.log('─'.repeat(60))
    console.log(`1. ${email} 메일함을 확인하세요`)
    console.log('2. 받은편지함 확인 (1~2분 이내)')
    console.log('3. (없으면) 스팸메일함 확인')
    console.log('')
    console.log('📧 예상 이메일 내용:')
    console.log('─'.repeat(60))
    console.log('발신자: 노무PRO')
    console.log('제목: 이메일 주소를 인증해주세요')
    console.log('내용:')
    console.log('  ┌─────────────────────────────────┐')
    console.log('  │   [파란색 그라데이션 헤더]      │')
    console.log('  │         노무PRO                 │')
    console.log('  │   건설 현장 노무 관리 플랫폼     │')
    console.log('  └─────────────────────────────────┘')
    console.log('  ')
    console.log('  이메일 주소를 인증해주세요')
    console.log('  ')
    console.log('  ┌──────────────────────┐')
    console.log('  │  ✉️ 이메일 인증하기   │')
    console.log('  └──────────────────────┘')
    console.log('')
    console.log('⏰ 이메일 도착 시간: 1~3분 이내')
    console.log('')
    console.log('💡 팁:')
    console.log('  - Gmail: 받은편지함에 바로 도착')
    console.log('  - Naver: 받은편지함 또는 스팸메일함')
    console.log('  - 스팸함에 있으면 "스팸 아님" 클릭!')
    console.log('')
    console.log('🔍 전송 상세 정보:')
    console.log('─'.repeat(60))
    console.log('User ID:', data.user.id)
    console.log('Email:', data.user.email)
    console.log('Created At:', data.user.created_at)
    console.log('Email Confirmed:', data.user.email_confirmed_at ? '✅ Yes' : '❌ No (확인 필요)')
    console.log('')

  } catch (err) {
    console.error('❌ 오류 발생:', err)
  }
}

sendTestEmail()
