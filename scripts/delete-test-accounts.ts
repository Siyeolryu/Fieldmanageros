/**
 * 테스트 계정 삭제 스크립트 (Supabase 클라이언트 사용)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteTestAccounts() {
  console.log('🧹 Starting test account cleanup...\n')

  try {
    // 1. 모든 프로필 조회
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, user_type, created_at')
      .order('created_at', { ascending: false })

    if (profileError) throw profileError

    console.log(`📊 Found ${profiles?.length || 0} profiles:\n`)
    profiles?.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email || 'No email'}`)
      console.log(`   Name: ${profile.full_name || 'No name'}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Type: ${profile.user_type}`)
      console.log(`   Created: ${profile.created_at}`)
      console.log()
    })

    // 2. 회사 데이터 조회
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name, owner_id')

    if (companyError) throw companyError

    console.log(`🏢 Found ${companies?.length || 0} companies:\n`)
    companies?.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`)
      console.log()
    })

    // 3. 현장 데이터 조회
    const { data: sites, error: siteError } = await supabase
      .from('sites')
      .select('id, name, company_id')

    if (siteError) throw siteError

    console.log(`🏗️  Found ${sites?.length || 0} sites:\n`)

    // 4. 근로자 데이터 조회
    const { data: workers, error: workerError } = await supabase
      .from('workers')
      .select('id, name, site_id')

    if (workerError) throw workerError

    console.log(`👷 Found ${workers?.length || 0} workers\n`)

    // 5. 출근 기록 조회
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('id')

    if (attendanceError) throw attendanceError

    console.log(`📅 Found ${attendance?.length || 0} attendance records\n`)

    // 6. 급여 기록 조회
    const { data: payroll, error: payrollError } = await supabase
      .from('payroll')
      .select('id')

    if (payrollError) throw payrollError

    console.log(`💰 Found ${payroll?.length || 0} payroll records\n`)

    console.log('─'.repeat(60))
    console.log('\n⚠️  WARNING: This will delete ALL data above!\n')
    console.log('📋 To proceed with deletion, uncomment the deletion code.\n')
    console.log('─'.repeat(60))

    // 실제 삭제 코드 (주석 처리 - 안전 장치)
    // 삭제 순서: cascade 설정에 따라 자동으로 연관 데이터가 삭제됨
    /*
    console.log('\n🗑️  Starting deletion...\n')

    // Payroll 삭제
    if (payroll && payroll.length > 0) {
      const { error } = await supabase.from('payroll').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${payroll.length} payroll records`)
    }

    // Attendance 삭제
    if (attendance && attendance.length > 0) {
      const { error } = await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${attendance.length} attendance records`)
    }

    // Workers 삭제
    if (workers && workers.length > 0) {
      const { error } = await supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${workers.length} workers`)
    }

    // Sites 삭제
    if (sites && sites.length > 0) {
      const { error } = await supabase.from('sites').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${sites.length} sites`)
    }

    // Companies 삭제
    if (companies && companies.length > 0) {
      const { error } = await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${companies.length} companies`)
    }

    // Profiles 삭제
    if (profiles && profiles.length > 0) {
      const { error } = await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      console.log(`✅ Deleted ${profiles.length} profiles`)
    }

    // Auth 사용자 삭제 (Admin API 사용)
    // 주의: 이 부분은 Supabase Dashboard에서 수동으로 하는 것이 더 안전합니다
    console.log('\n⚠️  Auth users should be deleted manually from Supabase Dashboard')
    console.log('   Go to: Authentication > Users > Select and Delete\n')

    console.log('✨ Test data cleanup complete!')
    */

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

deleteTestAccounts()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
