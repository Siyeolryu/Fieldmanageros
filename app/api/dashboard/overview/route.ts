import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/overview - 전체 현황
export async function GET() {
  try {
    // 현재 사용자 확인
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

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 사용자의 회사 조회
    const companies = await prisma.company.findMany({
      where: {
        ownerId: user.id,
      },
      select: {
        id: true,
      },
    })

    const companyIds = companies.map((c) => c.id)

    if (companyIds.length === 0) {
      return NextResponse.json({
        totalCompanies: 0,
        totalSites: 0,
        totalWorkers: 0,
        activeWorkers: 0,
        thisMonth: {
          totalAttendance: 0,
          totalPayroll: 0,
          unpaidPayroll: 0,
        },
        trends: {
          workersChange: 0,
          payrollChange: 0,
        },
      })
    }

    // Get all sites for these companies
    const companySites = await prisma.site.findMany({
      where: {
        companyId: {
          in: companyIds,
        },
      },
      select: {
        id: true,
        isActive: true,
      },
    })

    const siteIds = companySites.map((s) => s.id)

    if (siteIds.length === 0) {
      return NextResponse.json({
        totalCompanies: companyIds.length,
        totalSites: 0,
        totalWorkers: 0,
        activeWorkers: 0,
        thisMonth: {
          totalAttendance: 0,
          totalPayroll: 0,
          unpaidPayroll: 0,
        },
        trends: {
          workersChange: 0,
          payrollChange: 0,
        },
      })
    }

    // 통계 수집
    const [
      totalSites,
      activeSites,
      totalWorkers,
      activeWorkers,
      thisMonthAttendance,
      thisMonthPayrollData,
      lastMonthPayrollData,
      unpaidPayrollData,
    ] = await Promise.all([
      // 전체 현장 수
      prisma.site.count({
        where: {
          companyId: {
            in: companyIds,
          },
        },
      }),

      // 활성 현장 수
      prisma.site.count({
        where: {
          companyId: {
            in: companyIds,
          },
          isActive: true,
        },
      }),

      // 전체 근로자 수
      prisma.worker.count({
        where: {
          siteId: {
            in: siteIds,
          },
        },
      }),

      // 활성 근로자 수
      prisma.worker.count({
        where: {
          siteId: {
            in: siteIds,
          },
          isActive: true,
        },
      }),

      // 이번 달 출근 기록 수
      prisma.attendance.count({
        where: {
          siteId: {
            in: siteIds,
          },
          date: {
            gte: thisMonth,
            lt: nextMonth,
          },
        },
      }),

      // 이번 달 급여 총액
      prisma.payroll.findMany({
        where: {
          siteId: {
            in: siteIds,
          },
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
        select: {
          totalPay: true,
        },
      }),

      // 지난 달 급여 총액
      prisma.payroll.findMany({
        where: {
          siteId: {
            in: siteIds,
          },
          year: lastMonth.getFullYear(),
          month: lastMonth.getMonth() + 1,
        },
        select: {
          totalPay: true,
        },
      }),

      // 미지급 급여 총액
      prisma.payroll.findMany({
        where: {
          siteId: {
            in: siteIds,
          },
          paidAt: null,
        },
        select: {
          netPay: true,
        },
      }),
    ])

    // Calculate sum for payroll
    const thisMonthPayrollSum =
      thisMonthPayrollData.reduce((sum, p) => sum + (p.totalPay || 0), 0)
    const lastMonthPayrollSum =
      lastMonthPayrollData.reduce((sum, p) => sum + (p.totalPay || 0), 0)
    const unpaidPayrollSum =
      unpaidPayrollData.reduce((sum, p) => sum + (p.netPay || 0), 0)
    const unpaidCount = unpaidPayrollData.length

    const overview = {
      totalCompanies: companyIds.length,
      totalSites,
      activeSites,
      inactiveSites: totalSites - activeSites,
      totalWorkers,
      activeWorkers,
      inactiveWorkers: totalWorkers - activeWorkers,
      thisMonth: {
        totalAttendance: thisMonthAttendance,
        totalPayroll: thisMonthPayrollSum,
        unpaidPayroll: unpaidPayrollSum,
        unpaidCount: unpaidCount,
      },
      trends: {
        payrollChange:
          lastMonthPayrollSum && lastMonthPayrollSum > 0
            ? Math.round(
                ((thisMonthPayrollSum - lastMonthPayrollSum) / lastMonthPayrollSum) * 100
              )
            : 0,
      },
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
