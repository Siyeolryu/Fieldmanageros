import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/sites/[id]/monthly-report?year=2026&month=4 - 월별 리포트
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

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

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // 월별 데이터 수집
    const [
      attendance,
      payrolls,
      workers,
      dailySummary,
    ] = await Promise.all([
      // 출근 기록
      prisma.attendance.findMany({
        where: {
          siteId: id,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              hourlyRate: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      }),

      // 급여 명세
      prisma.payroll.findMany({
        where: {
          siteId: id,
          year,
          month,
        },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // 활성 근로자
      prisma.worker.findMany({
        where: {
          siteId: id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          hourlyRate: true,
        },
      }),

      // 일별 요약
      prisma.attendance.groupBy({
        by: ['date'],
        where: {
          siteId: id,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          hoursWorked: true,
        },
      }),
    ])

    // 근로자별 요약
    const workerSummary = workers.map((worker) => {
      const workerAttendance = attendance.filter(
        (a) => a.workerId === worker.id
      )
      const workerPayroll = payrolls.find((p) => p.workerId === worker.id)

      const totalHours = workerAttendance.reduce(
        (sum, a) => sum + Number(a.hoursWorked),
        0
      )
      const workDays = workerAttendance.length
      const weeklyHolidays = workerAttendance.filter(
        (a) => a.isWeeklyHoliday
      ).length

      return {
        workerId: worker.id,
        workerName: worker.name,
        hourlyRate: worker.hourlyRate,
        workDays,
        totalHours: Math.round(totalHours * 10) / 10,
        weeklyHolidays,
        payroll: workerPayroll
          ? {
              totalPay: workerPayroll.totalPay,
              totalDeduction: workerPayroll.totalDeduction,
              netPay: workerPayroll.netPay,
              paidAt: workerPayroll.paidAt,
            }
          : null,
      }
    })

    // 전체 요약
    const totalAttendance = attendance.length
    const totalHours = attendance.reduce(
      (sum, a) => sum + Number(a.hoursWorked),
      0
    )
    const totalPay = payrolls.reduce((sum, p) => sum + (p.totalPay || 0), 0)
    const totalDeduction = payrolls.reduce(
      (sum, p) => sum + (p.totalDeduction || 0),
      0
    )
    const totalNetPay = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0)

    const report = {
      siteId: id,
      siteName: site.name,
      companyName: site.company.name,
      year,
      month,
      period: {
        start: startDate,
        end: new Date(endDate.getTime() - 1),
      },
      summary: {
        totalWorkers: workers.length,
        totalAttendance,
        totalWorkDays: dailySummary.length,
        totalHours: Math.round(totalHours * 10) / 10,
        totalPay,
        totalDeduction,
        totalNetPay,
        averageHoursPerDay:
          dailySummary.length > 0
            ? Math.round((totalHours / dailySummary.length) * 10) / 10
            : 0,
      },
      dailySummary: dailySummary.map((d) => ({
        date: d.date,
        workerCount: d._count.id,
        totalHours: Number(d._sum.hoursWorked || 0),
      })),
      workerSummary,
      payrolls: payrolls.map((p) => ({
        id: p.id,
        workerId: p.workerId,
        workerName: p.worker.name,
        totalPay: p.totalPay,
        netPay: p.netPay,
        paidAt: p.paidAt,
      })),
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching monthly report:', error)
    return NextResponse.json(
      { error: '월별 리포트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
