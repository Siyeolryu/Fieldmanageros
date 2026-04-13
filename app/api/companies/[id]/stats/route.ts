import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/companies/[id]/stats - 회사별 통계
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 회사 존재 확인
    const company = await prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      return NextResponse.json(
        { error: '회사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 통계 데이터 수집
    const [
      sitesCount,
      activeSitesCount,
      totalWorkers,
      activeWorkers,
      thisMonthAttendance,
      thisMonthPayroll,
    ] = await Promise.all([
      // 전체 현장 수
      prisma.site.count({
        where: { companyId: id },
      }),

      // 활성 현장 수
      prisma.site.count({
        where: { companyId: id, isActive: true },
      }),

      // 전체 근로자 수
      prisma.worker.count({
        where: {
          site: { companyId: id },
        },
      }),

      // 활성 근로자 수
      prisma.worker.count({
        where: {
          site: { companyId: id },
          isActive: true,
        },
      }),

      // 이번 달 출근 기록 수
      prisma.attendance.count({
        where: {
          site: { companyId: id },
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
      }),

      // 이번 달 급여 총액
      prisma.payroll.aggregate({
        where: {
          site: { companyId: id },
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
        _sum: {
          totalPay: true,
        },
      }),
    ])

    const stats = {
      companyId: id,
      companyName: company.name,
      sites: {
        total: sitesCount,
        active: activeSitesCount,
        inactive: sitesCount - activeSitesCount,
      },
      workers: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: totalWorkers - activeWorkers,
      },
      thisMonth: {
        attendanceCount: thisMonthAttendance,
        totalPayroll: thisMonthPayroll._sum.totalPay || 0,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: '회사 통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
