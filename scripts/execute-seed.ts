// Seed 데이터 실행 스크립트
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSeed() {
  try {
    console.log('🌱 Seed 데이터 실행 시작...\n')

    // seed.sql 파일 읽기
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql')
    const seedSQL = fs.readFileSync(seedPath, 'utf-8')

    // SQL 실행
    const { data, error } = await supabase.rpc('exec', { sql: seedSQL })

    if (error) {
      console.error('❌ Seed 실행 실패:', error)
      process.exit(1)
    }

    console.log('✅ Seed 데이터 실행 완료\n')

    // 데이터 확인
    console.log('📊 삽입된 데이터 확인:\n')

    const { count: companyCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    console.log(`- Companies: ${companyCount}개`)

    const { count: siteCount } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true })
    console.log(`- Sites: ${siteCount}개`)

    const { count: workerCount } = await supabase
      .from('workers')
      .select('*', { count: 'exact', head: true })
    console.log(`- Workers: ${workerCount}명`)

    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
    console.log(`- Attendance: ${attendanceCount}건`)

    console.log('\n✨ 모든 작업 완료!')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

executeSeed()
