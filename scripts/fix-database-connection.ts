import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixDatabaseConnection() {
  console.log('🔧 Fixing database connection...\n')

  const projectId = 'ejgsotsviobjfvfqovcj'
  const password = 'Guswk0925!!'
  const region = 'aws-0-ap-southeast-1'

  console.log('📊 Current DATABASE_URL:')
  console.log(process.env.DATABASE_URL)
  console.log('\n📊 Current DIRECT_URL:')
  console.log(process.env.DIRECT_URL)

  console.log('\n💡 Issue: pgBouncer connection might be causing problems')
  console.log('💡 Solution: Using direct connection instead\n')

  const newDatabaseUrl = `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`
  const newDirectUrl = `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`

  console.log('✅ New DATABASE_URL (Session Pooler):')
  console.log(newDatabaseUrl)
  console.log('\n✅ New DIRECT_URL:')
  console.log(newDirectUrl)

  // Read .env.local
  const envPath = resolve(process.cwd(), '.env.local')
  let envContent = readFileSync(envPath, 'utf-8')

  // Replace DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL=".*"/,
    `DATABASE_URL="${newDatabaseUrl}"`
  )

  // Replace DIRECT_URL
  envContent = envContent.replace(
    /DIRECT_URL=".*"/,
    `DIRECT_URL="${newDirectUrl}"`
  )

  // Write back
  writeFileSync(envPath, envContent)

  console.log('\n✅ Updated .env.local')
  console.log('\n🔄 Next steps:')
  console.log('  1. npx prisma generate')
  console.log('  2. npx tsx scripts/test-connection.ts')
}

fixDatabaseConnection()
