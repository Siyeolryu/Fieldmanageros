import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/compliance - 법정 준수사항 체크
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const companies = await prisma.company.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    })

    const companyIds = companies.map((c) => c.id)

    if (companyIds.length === 0) {
      return NextResponse.json({ compliance: [] })
    }

    // Get all sites for these companies
    const sites = await prisma.site.findMany({
      where: { companyId: { in: companyIds } },
      select: { id: true, isActive: true },
    })

    const siteIds = sites.map((s) => s.id)

    if (siteIds.length === 0) {
      return NextResponse.json({ compliance: [] })
    }

    const now = new Date()

    // 법정 준수사항 체크
    const [
      workersWithoutBankInfo,
      workersWithoutIdNumber,
      activeSitesCount,
      recentPayrollsData,
    ] = await Promise.all([
      // 계좌 정보 없는 근로자
      prisma.worker.count({
        where: {
          siteId: { in: siteIds },
          isActive: true,
          OR: [
            { bankName: null },
            { bankAccount: null },
          ],
        },
      }),

      // 주민등록번호 없는 근로자
      prisma.worker.count({
        where: {
          siteId: { in: siteIds },
          isActive: true,
          idNumber: null,
        },
      }),

      // 활성 현장 수
      prisma.site.count({
        where: {
          companyId: { in: companyIds },
          isActive: true,
        },
      }),

      // 최근 3개월 급여 지급 현황
      prisma.payroll.findMany({
        where: {
          siteId: { in: siteIds },
          year: { gte: now.getFullYear() },
          month: { gte: now.getMonth() - 1 },
        },
        select: {
          year: true,
          month: true,
          paidAt: true,
        },
      }),
    ])

    const sitesWithoutInsurance = activeSitesCount

    // Group by year and month
    const payrollGroups = new Set()
    recentPayrollsData.forEach((p) => {
      if (p.paidAt) {
        payrollGroups.add(`${p.year}-${p.month}`)
      }
    })
    const recentPayrolls = Array.from(payrollGroups)

    const compliance = [
      {
        category: 'worker_info',
        status: workersWithoutBankInfo === 0 ? 'compliant' : 'warning',
        message: `계좌 정보 미등록 근로자: ${workersWithoutBankInfo}명`,
        action: '근로자 정보 업데이트 필요',
      },
      {
        category: 'worker_id',
        status: workersWithoutIdNumber === 0 ? 'compliant' : 'warning',
        message: `주민등록번호 미등록 근로자: ${workersWithoutIdNumber}명`,
        action: '4대 보험 가입을 위해 정보 수집 필요',
      },
      {
        category: 'insurance',
        status: sitesWithoutInsurance === 0 ? 'compliant' : 'info',
        message: `활성 현장: ${sitesWithoutInsurance}개`,
        action: '현장별 4대 보험 가입 여부 확인',
      },
      {
        category: 'payroll_payment',
        status: recentPayrolls.length >= 3 ? 'compliant' : 'warning',
        message: `최근 3개월 급여 지급 내역: ${recentPayrolls.length}건`,
        action: '정기적인 급여 지급 필요',
      },
    ]

    return NextResponse.json({ compliance })
  } catch (error) {
    console.error('Error checking compliance:', error)
    return NextResponse.json(
      { error: '준수사항 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
