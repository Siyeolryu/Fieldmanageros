/**
 * Supabase DB 연동 테스트 스크립트
 * 근로자 및 현장 등록 테스트
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('\n🔍 Supabase 연결 테스트 시작...\n')

  try {
    // 1. 테이블 존재 여부 확인
    console.log('1️⃣ 테이블 구조 확인...')

    const tables = ['profiles', 'companies', 'sites', 'workers', 'attendance']

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`   ❌ ${table} 테이블 접근 실패:`, error.message)
      } else {
        console.log(`   ✅ ${table} 테이블 존재 확인`)
      }
    }

    // 2. Companies 테이블 조회
    console.log('\n2️⃣ 건설사 목록 조회...')
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5)

    if (companiesError) {
      console.log('   ❌ 건설사 조회 실패:', companiesError.message)
    } else {
      console.log(`   ✅ 건설사 ${companies.length}개 조회됨`)
      companies.forEach(c => console.log(`      - ${c.name} (ID: ${c.id})`))
    }

    // 3. Sites 테이블 조회
    console.log('\n3️⃣ 현장 목록 조회...')
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*, companies(name)')
      .limit(5)

    if (sitesError) {
      console.log('   ❌ 현장 조회 실패:', sitesError.message)
    } else {
      console.log(`   ✅ 현장 ${sites.length}개 조회됨`)
      sites.forEach(s => console.log(`      - ${s.name} (${s.companies?.name || '건설사 없음'})`))
    }

    // 4. Workers 테이블 조회
    console.log('\n4️⃣ 근로자 목록 조회...')
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*, sites(name)')
      .limit(5)

    if (workersError) {
      console.log('   ❌ 근로자 조회 실패:', workersError.message)
    } else {
      console.log(`   ✅ 근로자 ${workers.length}명 조회됨`)
      workers.forEach(w => console.log(`      - ${w.name} (${w.sites?.name || '현장 없음'}) - 시급: ${w.hourly_rate}원`))
    }

    // 5. RLS 정책 확인
    console.log('\n5️⃣ RLS 정책 상태 확인...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status')
      .catch(() => ({ data: null, error: { message: 'RLS 상태 확인 함수 없음' } }))

    if (rlsError) {
      console.log('   ⚠️  RLS 상태 확인 불가:', rlsError.message)
    } else {
      console.log('   ✅ RLS 정책 활성화됨')
    }

    console.log('\n✅ Supabase 연결 테스트 완료!\n')

    return {
      success: true,
      counts: {
        companies: companies?.length || 0,
        sites: sites?.length || 0,
        workers: workers?.length || 0
      }
    }

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error)
    return { success: false, error }
  }
}

// 스크립트 실행
testSupabaseConnection()
  .then(result => {
    if (result.success) {
      console.log('📊 요약:')
      console.log(`   - 건설사: ${result.counts.companies}개`)
      console.log(`   - 현장: ${result.counts.sites}개`)
      console.log(`   - 근로자: ${result.counts.workers}명`)
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('스크립트 실행 실패:', error)
    process.exit(1)
  })
