import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/sites/[id]/dashboard - 현장 대시보드 데이터
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
          select: { id: true, name: true },
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
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // 대시보드 데이터 수집
    const [
      recentAttendance,
      topWorkers,
      thisMonthCosts,
      lastMonthCosts,
      upcomingPayrolls,
    ] = await Promise.all([
      // 최근 출근 기록
      prisma.attendance.findMany({
        where: { siteId: id },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),

      // 이번 달 근무 시간 상위 근로자
      prisma.attendance.groupBy({
        by: ['workerId'],
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
        orderBy: {
          _sum: {
            hoursWorked: 'desc',
          },
        },
        take: 5,
      }),

      // 이번 달 비용
      prisma.payroll.aggregate({
        where: {
          siteId: id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
        _sum: {
          totalPay: true,
        },
      }),

      // 지난 달 비용
      prisma.payroll.aggregate({
        where: {
          siteId: id,
          year: lastMonth.getFullYear(),
          month: lastMonth.getMonth() + 1,
        },
        _sum: {
          totalPay: true,
        },
      }),

      // 미지급 급여
      prisma.payroll.findMany({
        where: {
          siteId: id,
          paidAt: null,
        },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ])

    // 상위 근로자 정보 가져오기
    const workerIds = topWorkers.map((w) => w.workerId)
    const workers = await prisma.worker.findMany({
      where: {
        id: { in: workerIds },
      },
      select: {
        id: true,
        name: true,
        hourlyRate: true,
      },
    })

    const topWorkersWithInfo = topWorkers.map((tw) => {
      const worker = workers.find((w) => w.id === tw.workerId)
      return {
        workerId: tw.workerId,
        workerName: worker?.name || '알 수 없음',
        hourlyRate: worker?.hourlyRate || 0,
        totalHours: Number(tw._sum.hoursWorked || 0),
        estimatedPay: Math.round(
          Number(tw._sum.hoursWorked || 0) * (worker?.hourlyRate || 0)
        ),
      }
    })

    const dashboard = {
      siteId: id,
      siteName: site.name,
      companyName: site.company.name,
      isActive: site.isActive,
      recentActivity: recentAttendance.map((a) => ({
        id: a.id,
        workerId: a.workerId,
        workerName: a.worker.name,
        date: a.date,
        hoursWorked: Number(a.hoursWorked),
        isWeeklyHoliday: a.isWeeklyHoliday,
      })),
      topWorkers: topWorkersWithInfo,
      costs: {
        thisMonth: thisMonthCosts._sum.totalPay || 0,
        lastMonth: lastMonthCosts._sum.totalPay || 0,
        change:
          lastMonthCosts._sum.totalPay && lastMonthCosts._sum.totalPay > 0
            ? Math.round(
                (((thisMonthCosts._sum.totalPay || 0) -
                  lastMonthCosts._sum.totalPay) /
                  lastMonthCosts._sum.totalPay) *
                  100
              )
            : 0,
      },
      unpaidPayrolls: upcomingPayrolls.map((p) => ({
        id: p.id,
        workerId: p.workerId,
        workerName: p.worker.name,
        year: p.year,
        month: p.month,
        totalPay: p.totalPay,
        netPay: p.netPay,
      })),
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching site dashboard:', error)
    return NextResponse.json(
      { error: '현장 대시보드를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
