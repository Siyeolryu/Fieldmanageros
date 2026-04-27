/**
 * 테스트 데이터 삭제 스크립트
 *
 * 주의: 프로덕션 환경에서는 실행하지 마세요!
 */

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

async function cleanTestData() {
  console.log('🧹 Starting test data cleanup...\n')

  try {
    // 1. 모든 데이터 확인
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        userType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${profiles.length} profiles:\n`)
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email || 'No email'}`)
      console.log(`   Name: ${profile.fullName || 'No name'}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Type: ${profile.userType}`)
      console.log(`   Created: ${profile.createdAt.toISOString()}`)
      console.log()
    })

    // 2. 회사 데이터 확인
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        _count: {
          select: {
            sites: true
          }
        }
      }
    })

    console.log(`🏢 Found ${companies.length} companies:\n`)
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`)
      console.log(`   Sites: ${company._count.sites}`)
      console.log()
    })

    // 3. 사용자 확인 후 삭제 진행
    console.log('⚠️  WARNING: This will delete ALL test data!\n')
    console.log('If you want to proceed, please modify this script to confirm deletion.\n')

    // 실제 삭제는 주석 처리 (안전을 위해)
    /*
    console.log('🗑️  Deleting all test data...\n')

    // Cascade 삭제가 설정되어 있으므로 관련 데이터도 함께 삭제됨
    const deletedCompanies = await prisma.company.deleteMany({})
    console.log(`✅ Deleted ${deletedCompanies.count} companies and related data`)

    const deletedProfiles = await prisma.profile.deleteMany({})
    console.log(`✅ Deleted ${deletedProfiles.count} profiles`)

    console.log('\n✨ Test data cleanup complete!')
    */

    console.log('📋 To delete data, uncomment the deletion code in this script.')
    console.log('   Then run: npx tsx scripts/clean-test-data.ts\n')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanTestData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
