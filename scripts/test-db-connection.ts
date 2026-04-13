// 데이터베이스 연결 테스트 스크립트
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 데이터베이스 연결 테스트 시작...\n')

    // 1. 데이터베이스 연결 테스트
    await prisma.$connect()
    console.log('✅ 데이터베이스 연결 성공\n')

    // 2. 테이블 확인
    console.log('📊 테이블 데이터 확인:\n')

    const profileCount = await prisma.profile.count()
    console.log(`- Profiles: ${profileCount}개`)

    const companyCount = await prisma.company.count()
    console.log(`- Companies: ${companyCount}개`)

    const siteCount = await prisma.site.count()
    console.log(`- Sites: ${siteCount}개`)

    const workerCount = await prisma.worker.count()
    console.log(`- Workers: ${workerCount}개`)

    const attendanceCount = await prisma.attendance.count()
    console.log(`- Attendance: ${attendanceCount}개`)

    const payrollCount = await prisma.payroll.count()
    console.log(`- Payroll: ${payrollCount}개`)

    console.log('\n✨ 모든 테스트 통과!')
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
