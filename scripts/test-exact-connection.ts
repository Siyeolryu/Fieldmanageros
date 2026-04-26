import { PrismaClient } from '@prisma/client'

// 사용자가 제공한 정확한 연결 문자열 테스트
const exactConnectionString = 'postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'

async function testExactConnection() {
  console.log('🔌 Testing exact connection string from dashboard...\n')
  console.log('Connection string:', exactConnectionString.replace(/:[^@]+@/, ':****@'))
  console.log()

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: exactConnectionString
        }
      }
    })

    console.log('Attempting to connect...')
    await prisma.$connect()

    console.log('Executing test query...')
    await prisma.$executeRaw`SELECT 1`

    console.log('Disconnecting...')
    await prisma.$disconnect()

    console.log('\n✅ Connection successful!')
    console.log('\n📝 This connection string works. Updating .env.local...')

    return true

  } catch (error: any) {
    console.error('\n❌ Connection failed')
    console.error('Error:', error.message)
    console.error('\nFull error:')
    console.error(error)
    return false
  }
}

testExactConnection()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
