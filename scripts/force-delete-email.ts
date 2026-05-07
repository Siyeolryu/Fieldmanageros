/**
 * Supabase에서 특정 이메일 완전 강제 삭제
 * auth.users 테이블에서 직접 삭제
 *
 * 사용법: npx tsx scripts/force-delete-email.ts <email>
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
  console.log('사용법: npx tsx scripts/force-delete-email.ts your-email@example.com')
  process.exit(1)
}

console.log('🔥 강제 이메일 삭제')
console.log('─'.repeat(60))
console.log('이메일:', email)
console.log('')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function forceDeleteEmail() {
  try {
    console.log('🔍 Step 1: 사용자 찾기...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError.message)
      return
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.log('✅ Auth에 사용자 없음 - 이미 정리되었습니다')
      console.log('')

      // Supabase에서 SQL로 완전 삭제 시도
      console.log('🗑️  Step 2: SQL로 완전 삭제 확인...')
      console.log('')
      console.log('다음 SQL을 Supabase SQL Editor에서 실행하세요:')
      console.log('─'.repeat(60))
      console.log(`DELETE FROM auth.users WHERE email = '${email}';`)
      console.log(`SELECT * FROM auth.users WHERE email = '${email}';`)
      console.log('─'.repeat(60))
      console.log('')
      return
    }

    console.log('✅ 사용자 발견:', user.id)
    console.log('   Email:', user.email)
    console.log('   Created:', user.created_at)
    console.log('   Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No')
    console.log('')

    // Step 2: Admin API로 삭제 시도
    console.log('🗑️  Step 2: Admin API로 삭제 시도...')
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id, true) // shouldSoftDelete: false

    if (deleteError) {
      console.error('❌ Admin API 삭제 실패:', deleteError.message)
      console.log('')
      console.log('💡 대안: Supabase SQL Editor에서 수동 삭제')
      console.log('─'.repeat(60))
      console.log(`DELETE FROM auth.users WHERE id = '${user.id}';`)
      console.log(`SELECT * FROM auth.users WHERE email = '${email}';`)
      console.log('─'.repeat(60))
      console.log('')
      return
    }

    console.log('✅ Admin API 삭제 성공!')
    console.log('')

    // Step 3: 재확인
    console.log('🔍 Step 3: 삭제 확인...')
    const { data: checkUsers } = await supabase.auth.admin.listUsers()
    const stillExists = checkUsers?.users.find(u => u.email === email)

    if (stillExists) {
      console.log('⚠️  사용자가 여전히 존재합니다!')
      console.log('   ID:', stillExists.id)
      console.log('')
      console.log('💡 Supabase SQL Editor에서 수동 삭제 필요:')
      console.log('─'.repeat(60))
      console.log(`DELETE FROM auth.users WHERE id = '${stillExists.id}';`)
      console.log('─'.repeat(60))
      console.log('')
    } else {
      console.log('✅ 완전히 삭제되었습니다!')
      console.log('')
    }

    console.log('🎉 강제 삭제 완료!')
    console.log('─'.repeat(60))
    console.log('')
    console.log('✨ 다음 단계:')
    console.log('1. 5초 대기')
    console.log('2. 앱에서 다시 회원가입 시도')
    console.log('3. 이번엔 성공할 것입니다!')
    console.log('')

  } catch (err) {
    console.error('❌ 오류 발생:', err)
  }
}

forceDeleteEmail()
