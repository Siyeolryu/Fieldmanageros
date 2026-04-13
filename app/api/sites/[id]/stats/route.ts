import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/sites/[id]/stats - 현장별 통계
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 현장 존재 확인
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // 통계 데이터 수집
    const [
      totalWorkers,
      activeWorkers,
      thisMonthAttendance,
      thisMonthWorkDays,
      thisMonthTotalHours,
      thisMonthPayroll,
      averageHourlyRate,
    ] = await Promise.all([
      // 전체 근로자 수
      prisma.worker.count({
        where: { siteId: id },
      }),

      // 활성 근로자 수
      prisma.worker.count({
        where: { siteId: id, isActive: true },
      }),

      // 이번 달 출근 기록 수
      prisma.attendance.count({
        where: {
          siteId: id,
          date: {
            gte: thisMonth,
            lt: nextMonth,
          },
        },
      }),

      // 이번 달 근무 일수 (중복 제거)
      prisma.attendance.groupBy({
        by: ['date'],
        where: {
          siteId: id,
          date: {
            gte: thisMonth,
            lt: nextMonth,
          },
        },
      }),

      // 이번 달 총 근무 시간
      prisma.attendance.aggregate({
        where: {
          siteId: id,
          date: {
            gte: thisMonth,
            lt: nextMonth,
          },
        },
        _sum: {
          hoursWorked: true,
        },
      }),

      // 이번 달 급여 총액
      prisma.payroll.aggregate({
        where: {
          siteId: id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
        _sum: {
          totalPay: true,
          totalDeduction: true,
          netPay: true,
        },
      }),

      // 평균 시급
      prisma.worker.aggregate({
        where: {
          siteId: id,
          isActive: true,
        },
        _avg: {
          hourlyRate: true,
        },
      }),
    ])

    const stats = {
      siteId: id,
      siteName: site.name,
      companyId: site.company.id,
      companyName: site.company.name,
      location: site.location,
      isActive: site.isActive,
      startDate: site.startDate,
      endDate: site.endDate,
      workers: {
        total: totalWorkers,
        active: activeWorkers,
        inactive: totalWorkers - activeWorkers,
        averageHourlyRate: Math.round(averageHourlyRate._avg.hourlyRate || 0),
      },
      thisMonth: {
        attendanceCount: thisMonthAttendance,
        workDays: thisMonthWorkDays.length,
        totalHours: Number(thisMonthTotalHours._sum.hoursWorked || 0),
        payroll: {
          totalPay: thisMonthPayroll._sum.totalPay || 0,
          totalDeduction: thisMonthPayroll._sum.totalDeduction || 0,
          netPay: thisMonthPayroll._sum.netPay || 0,
        },
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching site stats:', error)
    return NextResponse.json(
      { error: '현장 통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
