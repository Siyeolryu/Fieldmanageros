import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function checkSupabaseStatus() {
  console.log('🔍 Checking Supabase project status...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('\nRequired variables:')
    console.log('  - NEXT_PUBLIC_SUPABASE_URL')
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return
  }

  console.log('📊 Current Configuration:')
  console.log(`  URL: ${supabaseUrl}`)
  console.log(`  Project ID: ${supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'}`)
  console.log(`  Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
  console.log('')

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('🔌 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      console.log('\n🔧 Possible solutions:')
      console.log('  1. Project is paused → Resume in Supabase dashboard')
      console.log('  2. Invalid credentials → Update .env.local')
      console.log('  3. Project deleted → Create new project')
      console.log('\n📍 Supabase Dashboard:')
      console.log('  https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1]?.split('.')[0])
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('✅ Project is active and responding')
    }
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message)
    console.log('\n🔧 Action required:')
    console.log('  → Go to https://supabase.com/dashboard')
    console.log('  → Find your project')
    console.log('  → Click "Resume Project" if paused')
  }
}

checkSupabaseStatus()
