import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/attendance/calendar?siteId=xxx&year=2026&month=4 - 캘린더 뷰 데이터
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    if (!siteId) {
      return NextResponse.json(
        { error: '현장 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // 출근 기록 조회 with worker name
    const attendance = await prisma.attendance.findMany({
      where: {
        siteId: siteId,
        date: {
          gte: startDate,
          lte: endDate,
        },
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
        date: 'asc',
      },
    })

    // 날짜별로 그룹화
    type AttendanceWithWorker = typeof attendance[0]

    const calendar: Record<
      string,
      {
        date: string
        totalWorkers: number
        totalHours: number
        records: AttendanceWithWorker[]
      }
    > = {}

    attendance.forEach((record) => {
      const dateKey = record.date.toISOString().split('T')[0]

      if (!calendar[dateKey]) {
        calendar[dateKey] = {
          date: dateKey,
          totalWorkers: 0,
          totalHours: 0,
          records: [],
        }
      }

      calendar[dateKey].totalWorkers += 1
      calendar[dateKey].totalHours += Number(record.hoursWorked)
      calendar[dateKey].records.push(record)
    })

    return NextResponse.json({
      year,
      month,
      calendar: Object.values(calendar).map((day) => ({
        ...day,
        totalHours: Math.round(day.totalHours * 10) / 10,
        records: day.records.map((r) => ({
          id: r.id,
          workerId: r.workerId,
          workerName: r.worker.name,
          hoursWorked: Number(r.hoursWorked),
          isWeeklyHoliday: r.isWeeklyHoliday,
          notes: r.notes,
        })),
      })),
    })
  } catch (error) {
    console.error('Error fetching calendar:', error)
    return NextResponse.json(
      { error: '캘린더 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
