/**
 * 특정 이메일의 모든 데이터베이스 레코드 삭제
 * (Auth + Profile + 관련 데이터)
 *
 * 사용법: npx tsx scripts/clean-database-for-email.ts <email>
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

// .env.local 파일 로드
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const email = process.argv[2]

if (!email) {
  console.error('❌ 에러: 이메일 주소를 입력해주세요')
  console.log('사용법: npx tsx scripts/clean-database-for-email.ts your-email@example.com')
  process.exit(1)
}

console.log('🧹 데이터베이스 완전 정리')
console.log('─'.repeat(60))
console.log('이메일:', email)
console.log('')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    // Step 1: Auth에서 사용자 찾기
    console.log('🔍 Step 1: 사용자 찾기...')
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ 사용자 목록 조회 실패:', listError.message)
      return
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      console.log('✅ Auth에 사용자 없음')
    } else {
      console.log('✅ 사용자 발견:', user.id)
      console.log('')

      // Step 2: Profile 및 관련 데이터 삭제
      console.log('🗑️  Step 2: Profile 및 관련 데이터 삭제...')

      try {
        // Profile 삭제 (Cascade로 관련 데이터도 자동 삭제됨)
        await prisma.profile.delete({
          where: { id: user.id }
        })
        console.log('✅ Profile 삭제 완료')
      } catch (e: any) {
        if (e.code === 'P2025') {
          console.log('✅ Profile 없음 (이미 삭제됨)')
        } else {
          console.log('⚠️  Profile 삭제 실패:', e.message)
        }
      }
      console.log('')

      // Step 3: Auth에서 사용자 삭제
      console.log('🗑️  Step 3: Auth 사용자 삭제...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.error('❌ Auth 사용자 삭제 실패:', deleteError.message)
        return
      }

      console.log('✅ Auth 사용자 삭제 완료')
      console.log('')
    }

    console.log('🎉 데이터베이스 정리 완료!')
    console.log('─'.repeat(60))
    console.log('')
    console.log('✨ 다음 단계:')
    console.log('1. 앱에서 다시 회원가입 시도')
    console.log('2. 이번엔 성공할 것입니다!')
    console.log('')

  } catch (err) {
    console.error('❌ 오류 발생:', err)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
