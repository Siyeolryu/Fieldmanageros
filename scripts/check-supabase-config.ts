/**
 * Supabase 이메일 설정 확인 스크립트
 *
 * 사용법: npx tsx scripts/check-supabase-config.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env.local 파일 로드
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔍 Supabase 설정 확인 중...\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkConfig() {
  console.log('📋 환경 변수 확인')
  console.log('─'.repeat(60))
  console.log('SUPABASE_URL:', SUPABASE_URL)
  console.log('SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음')
  console.log('')

  console.log('🔐 연결 테스트')
  console.log('─'.repeat(60))

  try {
    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    })

    if (error) {
      console.log('❌ Supabase 연결 실패:', error.message)
      return
    }

    console.log('✅ Supabase 연결 성공')
    console.log('총 사용자 수:', data.users.length > 0 ? '1명 이상' : '0명')
    console.log('')

    // 테스트 이메일 전송 시도
    console.log('📧 이메일 전송 테스트')
    console.log('─'.repeat(60))
    console.log('⚠️  실제 테스트 이메일을 전송하려면 회원가입을 시도하세요.')
    console.log('')
    console.log('테스트 명령어:')
    console.log('  node scripts/test-email-signup.js your-email@example.com')
    console.log('')

    console.log('🔧 Supabase 설정 확인 필요 사항')
    console.log('─'.repeat(60))
    console.log('1. 이메일 확인 활성화 여부:')
    console.log('   → https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/settings')
    console.log('   → "Enable email confirmations" 확인')
    console.log('')
    console.log('2. SMTP 설정:')
    console.log('   → Supabase 기본 SMTP 사용 중 (하루 4개 제한)')
    console.log('   → 커스텀 SMTP 미설정')
    console.log('')
    console.log('3. 이메일 템플릿:')
    console.log('   → https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/templates')
    console.log('   → "Confirm signup" 템플릿 확인')
    console.log('')

  } catch (err) {
    console.error('❌ 오류 발생:', err)
  }
}

checkConfig()
