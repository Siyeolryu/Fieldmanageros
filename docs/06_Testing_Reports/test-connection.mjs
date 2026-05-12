import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env 파일 로드
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Supabase 연결 테스트 시작...\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '미설정')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '미설정')
  process.exit(1)
}

console.log('✅ 환경 변수 확인 완료')
console.log('   URL:', supabaseUrl)
console.log('   Anon Key:', supabaseAnonKey.substring(0, 20) + '...')
console.log('')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 1. 테이블 존재 확인
console.log('📋 1. 테이블 존재 확인...')
try {
  const { data, error } = await supabase
    .from('companies')
    .select('count')
    .limit(1)

  if (error) {
    console.error('   ❌ 에러:', error.message)
    console.error('   힌트:', error.hint)
  } else {
    console.log('   ✅ companies 테이블 접근 성공')
  }
} catch (err) {
  console.error('   ❌ 연결 실패:', err.message)
}

// 2. RLS 정책 확인
console.log('\n🔒 2. RLS 정책 확인...')
try {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .limit(1)

  if (error) {
    if (error.message.includes('row-level security')) {
      console.log('   ✅ RLS 정책 활성화 확인 (인증 필요)')
    } else {
      console.error('   ❌ 에러:', error.message)
    }
  } else {
    console.log('   ⚠️  RLS 없이 데이터 접근 가능 (보안 문제!)')
    console.log('   데이터:', data)
  }
} catch (err) {
  console.error('   ❌ 연결 실패:', err.message)
}

// 3. Auth 기능 확인
console.log('\n🔐 3. Auth 기능 확인...')
try {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('   ❌ Auth 에러:', error.message)
  } else {
    if (data.session) {
      console.log('   ✅ 활성 세션 있음:', data.session.user.email)
    } else {
      console.log('   ✅ Auth 기능 정상 (현재 로그인 안됨)')
    }
  }
} catch (err) {
  console.error('   ❌ Auth 연결 실패:', err.message)
}

// 4. 기타 테이블 확인
console.log('\n📊 4. 주요 테이블 확인...')
const tables = ['sites', 'workers', 'attendance', 'payroll']

for (const table of tables) {
  try {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1)

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`)
    } else {
      console.log(`   ✅ ${table}: 접근 가능`)
    }
  } catch (err) {
    console.log(`   ❌ ${table}: ${err.message}`)
  }
}

console.log('\n✨ 테스트 완료!')
