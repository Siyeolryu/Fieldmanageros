import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

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

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 1).toISOString().split('T')[0]

    // 출근 기록 조회
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, workers(id, name)')
      .eq('site_id', siteId)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: true })

    if (error) throw error

    // 날짜별로 그룹화
    type AttendanceRecord = {
      id: string
      date: string
      worker_id: string
      hours_worked: number
      is_weekly_holiday: boolean
      notes: string | null
      workers: { name: string } | null
    }

    const calendar: Record<
      string,
      {
        date: string
        totalWorkers: number
        totalHours: number
        records: AttendanceRecord[]
      }
    > = {}

    attendance?.forEach((record) => {
      const dateKey = record.date

      if (!calendar[dateKey]) {
        calendar[dateKey] = {
          date: dateKey,
          totalWorkers: 0,
          totalHours: 0,
          records: [],
        }
      }

      calendar[dateKey].totalWorkers += 1
      calendar[dateKey].totalHours += Number(record.hours_worked)
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
          workerId: r.worker_id,
          workerName: r.workers?.name,
          hoursWorked: Number(r.hours_worked),
          isWeeklyHoliday: r.is_weekly_holiday,
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
