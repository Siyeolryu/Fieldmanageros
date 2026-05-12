/**
 * Supabase 신규 데이터 등록 테스트
 * 현장 및 근로자 등록 테스트
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsertData() {
  console.log('\n🔍 신규 데이터 등록 테스트 시작...\n')

  try {
    // 1. 기존 건설사 ID 가져오기
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1)

    if (!companies || companies.length === 0) {
      console.log('❌ 건설사가 없습니다. 먼저 건설사를 등록해주세요.')
      return { success: false }
    }

    const companyId = companies[0].id
    console.log(`✅ 테스트용 건설사: ${companies[0].name} (${companyId})\n`)

    // 2. 신규 현장 등록 테스트
    console.log('1️⃣ 신규 현장 등록 테스트...')
    const testSiteName = `테스트 현장 ${new Date().toISOString().slice(0, 10)}`

    const { data: newSite, error: siteError } = await supabase
      .from('sites')
      .insert({
        company_id: companyId,
        name: testSiteName,
        location: '서울시 강남구 테헤란로 123',
        start_date: '2026-04-19',
        is_active: true
      })
      .select()
      .single()

    if (siteError) {
      console.log('   ❌ 현장 등록 실패:', siteError.message)
      console.log('   세부 정보:', siteError)
      return { success: false, error: siteError }
    }

    console.log(`   ✅ 현장 등록 성공: ${newSite.name}`)
    console.log(`   현장 ID: ${newSite.id}\n`)

    // 3. 신규 근로자 등록 테스트
    console.log('2️⃣ 신규 근로자 등록 테스트...')
    const testWorkerName = `테스트 근로자 ${new Date().getTime().toString().slice(-4)}`

    const { data: newWorker, error: workerError } = await supabase
      .from('workers')
      .insert({
        site_id: newSite.id,
        name: testWorkerName,
        phone: '010-1234-5678',
        hourly_rate: 18000,
        bank_name: '국민은행',
        bank_account: '123-456-789012',
        is_active: true
      })
      .select()
      .single()

    if (workerError) {
      console.log('   ❌ 근로자 등록 실패:', workerError.message)
      console.log('   세부 정보:', workerError)
      return { success: false, error: workerError }
    }

    console.log(`   ✅ 근로자 등록 성공: ${newWorker.name}`)
    console.log(`   근로자 ID: ${newWorker.id}`)
    console.log(`   시급: ${newWorker.hourly_rate}원\n`)

    // 4. 등록된 데이터 확인
    console.log('3️⃣ 등록된 데이터 확인...')

    const { data: siteCheck } = await supabase
      .from('sites')
      .select('*, companies(name)')
      .eq('id', newSite.id)
      .single()

    console.log(`   현장: ${siteCheck.name}`)
    console.log(`   소속: ${siteCheck.companies.name}`)
    console.log(`   위치: ${siteCheck.location}`)

    const { data: workerCheck } = await supabase
      .from('workers')
      .select('*, sites(name)')
      .eq('id', newWorker.id)
      .single()

    console.log(`   근로자: ${workerCheck.name}`)
    console.log(`   현장: ${workerCheck.sites.name}`)
    console.log(`   연락처: ${workerCheck.phone}`)
    console.log(`   시급: ${workerCheck.hourly_rate}원\n`)

    // 5. 테스트 데이터 삭제 (선택적)
    console.log('4️⃣ 테스트 데이터 정리...')

    await supabase.from('workers').delete().eq('id', newWorker.id)
    console.log(`   ✅ 테스트 근로자 삭제됨`)

    await supabase.from('sites').delete().eq('id', newSite.id)
    console.log(`   ✅ 테스트 현장 삭제됨\n`)

    console.log('✅ 모든 테스트 통과!\n')

    return {
      success: true,
      results: {
        site: newSite,
        worker: newWorker
      }
    }

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error)
    return { success: false, error }
  }
}

// 스크립트 실행
testInsertData()
  .then(result => {
    if (result.success) {
      console.log('📊 테스트 요약:')
      console.log('   ✅ 신규 현장 등록 → DB 저장 확인 → 삭제 완료')
      console.log('   ✅ 신규 근로자 등록 → DB 저장 확인 → 삭제 완료')
      console.log('\n💡 결론: Supabase DB 연동이 정상적으로 작동합니다!\n')
      process.exit(0)
    } else {
      console.log('\n❌ 테스트 실패\n')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('스크립트 실행 실패:', error)
    process.exit(1)
  })
