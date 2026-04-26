import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

const projectId = 'ejgsotsviobjfvfqovcj'
const password = 'Guswk0925!!'
const region = 'aws-0-ap-southeast-1'

// 다양한 연결 문자열 조합 생성
const connectionOptions = [
  {
    name: 'Session Pooler (Port 5432)',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Transaction Pooler (Port 6543 with pgbouncer)',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'Transaction Pooler (Port 6543 without pgbouncer)',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres`
  },
  {
    name: 'Direct Connection (Port 5432)',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres`
  },
  {
    name: 'Direct Connection with SSL',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres?sslmode=require`
  },
  {
    name: 'Pooler without encoding',
    url: `postgresql://postgres.${projectId}:${password}@${region}.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'IPv6 Pooler',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres?options=endpoint%3Daws-0-ap-southeast-1.pooler`
  }
]

async function testConnection(url: string): Promise<boolean> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: { url }
      }
    })

    await prisma.$connect()
    await prisma.$executeRaw`SELECT 1`
    await prisma.$disconnect()
    return true
  } catch (error) {
    return false
  }
}

async function autoFixConnection() {
  console.log('🔧 Automatically testing all connection options...\n')
  console.log(`Project ID: ${projectId}`)
  console.log(`Region: ${region}\n`)

  let successfulUrl: string | null = null

  for (const option of connectionOptions) {
    process.stdout.write(`Testing: ${option.name}... `)

    const isWorking = await testConnection(option.url)

    if (isWorking) {
      console.log('✅ SUCCESS!')
      successfulUrl = option.url
      break
    } else {
      console.log('❌ Failed')
    }
  }

  if (successfulUrl) {
    console.log('\n🎉 Found working connection string!')
    console.log(`\nConnection URL: ${successfulUrl}\n`)

    // Update .env.local
    const envPath = resolve(process.cwd(), '.env.local')
    let envContent = readFileSync(envPath, 'utf-8')

    // Replace DATABASE_URL
    envContent = envContent.replace(
      /DATABASE_URL=".*"/,
      `DATABASE_URL="${successfulUrl}"`
    )

    // For DIRECT_URL, use the same working connection
    envContent = envContent.replace(
      /DIRECT_URL=".*"/,
      `DIRECT_URL="${successfulUrl}"`
    )

    writeFileSync(envPath, envContent)

    console.log('✅ Updated .env.local with working connection string')
    console.log('\n🔄 Please run: npx prisma generate')
    console.log('Then test with: npm run dev')

    return true
  } else {
    console.log('\n❌ None of the connection options worked.')
    console.log('\n🔍 Possible causes:')
    console.log('  1. Project is paused in Supabase dashboard')
    console.log('  2. Password has changed')
    console.log('  3. Project has been deleted')
    console.log('  4. Network/firewall issue')
    console.log('\n📋 Next steps:')
    console.log('  1. Visit: https://supabase.com/dashboard/project/' + projectId)
    console.log('  2. Check if project is paused → Click "Resume Project"')
    console.log('  3. If project not found → Create new project and update credentials')

    return false
  }
}

autoFixConnection()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
