import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const projectId = 'ejgsotsviobjfvfqovcj'
const password = 'Guswk0925!!'
const region = 'aws-0-ap-northeast-1'

// 다양한 연결 문자열 조합 생성 (올바른 리전 사용)
const connectionOptions = [
  {
    name: 'Session Pooler (Port 5432) - Encoded',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Transaction Pooler (Port 6543 with pgbouncer) - Encoded',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'Direct Connection - Encoded',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres`
  },
  {
    name: 'Direct Connection with SSL - Encoded',
    url: `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres?sslmode=require`
  },
  {
    name: 'Session Pooler - Not Encoded',
    url: `postgresql://postgres.${projectId}:${password}@${region}.pooler.supabase.com:5432/postgres`
  },
  {
    name: 'Transaction Pooler - Not Encoded',
    url: `postgresql://postgres.${projectId}:${password}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'Direct Connection - Not Encoded',
    url: `postgresql://postgres.${projectId}:${password}@db.${projectId}.supabase.co:5432/postgres`
  },
  {
    name: 'Pooler with postgres user',
    url: `postgresql://postgres:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres?host=${projectId}`
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

async function testAllConnections() {
  console.log('🔧 Testing all connection options with correct region (ap-northeast-1)...\n')
  console.log(`Project ID: ${projectId}`)
  console.log(`Region: ${region}\n`)

  let successfulUrl: string | null = null
  let successfulName: string | null = null

  for (const option of connectionOptions) {
    process.stdout.write(`Testing: ${option.name}... `)

    const isWorking = await testConnection(option.url)

    if (isWorking) {
      console.log('✅ SUCCESS!')
      successfulUrl = option.url
      successfulName = option.name
      break
    } else {
      console.log('❌ Failed')
    }
  }

  if (successfulUrl) {
    console.log('\n🎉 Found working connection string!')
    console.log(`\nMethod: ${successfulName}`)
    console.log(`\nConnection URL: ${successfulUrl}\n`)
    return true
  } else {
    console.log('\n❌ None of the connection options worked.')
    console.log('\n🔍 This likely means the database password is incorrect.')
    console.log('\n📋 Next steps:')
    console.log('  1. Reset database password in Supabase dashboard')
    console.log('  2. Update .env.local with new password')
    console.log('  3. Run this script again')
    return false
  }
}

testAllConnections()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
