import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, startOfToday, subDays } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json({ error: '현장 ID가 필요합니다.' }, { status: 400 })
    }

    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const todayStart = startOfToday()

    // 1. 총 근로자 수 (해당 현장 기준)
    const totalWorkers = await prisma.worker.count({
      where: {
        siteId,
        isActive: true,
      },
    })

    // 2. 오늘 출근 인원
    const todayAttendance = await prisma.attendance.count({
      where: {
        siteId,
        date: todayStart,
      },
    })

    // 3. 이번 달 누적 노무비 및 리스크 근로자 (6~7일 근무)
    const monthlyAttendance = await prisma.attendance.findMany({
      where: {
        siteId,
        date: {
          gte: monthStart,
          lte: monthEnd,
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
    })

    const workerDaysMap: Record<string, { name: string, days: number }> = {}

    const monthlyCost = monthlyAttendance.reduce((sum, record) => {
      // 공수 계산 및 비용 합산
      const hours = Number(record.hoursWorked)
      const hourlyRate = record.worker.hourlyRate
      const pay = hours * hourlyRate
      const overtimePay = hours > 8 ? (hours - 8) * hourlyRate * 0.5 : 0

      // 근무일수 집계 (주수휴당 제외 순수 출근일)
      if (!workerDaysMap[record.workerId]) {
        workerDaysMap[record.workerId] = { name: record.worker.name, days: 0 }
      }
      workerDaysMap[record.workerId].days += 1

      return sum + pay + overtimePay
    }, 0)

    const riskWorkers = Object.values(workerDaysMap)
      .filter(w => w.days === 6 || w.days === 7)
      .sort((a, b) => b.days - a.days)

    // 4. 최근 14일간의 지출 추이 데이터 (그래프용)
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(today, 13 - i)
      return {
        date: date.toISOString().split('T')[0],
        formattedDate: `${date.getMonth() + 1}/${date.getDate()}`,
        cost: 0
      }
    })

    const recentAttendance = await prisma.attendance.findMany({
      where: {
        siteId,
        date: {
          gte: subDays(today, 13),
        },
      },
      include: {
        worker: {
          select: {
            hourlyRate: true,
          },
        },
      },
    })

    recentAttendance.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0]
      const dayData = last14Days.find(d => d.date === dateStr)
      if (dayData) {
        const hours = Number(record.hoursWorked)
        const hourlyRate = record.worker.hourlyRate
        const pay = hours * hourlyRate
        const overtime = hours > 8 ? (hours - 8) * hourlyRate * 0.5 : 0
        dayData.cost += (pay + overtime)
      }
    })

    return NextResponse.json({
      totalWorkers,
      todayAttendance,
      monthlyCost,
      riskWorkers,
      chartData: last14Days
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: '통계 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
