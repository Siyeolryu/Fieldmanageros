import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

// GET /api/attendance/conflicts?siteId=xxx&startDate=2026-04-01&endDate=2026-04-30
// 중복 또는 이상 출근 기록 감지
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!siteId) {
      return NextResponse.json(
        { error: '현장 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 출근 기록 조회
    let query = supabaseAdmin
      .from('attendance')
      .select('*, workers(id, name)')
      .eq('site_id', siteId)
      .order('worker_id', { ascending: true })
      .order('date', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: attendance, error } = await query

    if (error) throw error

    const conflicts: {
      type: string
      workerId: string
      workerName: string
      date: string
      hoursWorked: number
      reason: string
    }[] = []

    // 이상 패턴 감지
    attendance?.forEach((record) => {
      // 1. 24시간 초과 근무
      if (Number(record.hours_worked) > 24) {
        conflicts.push({
          type: 'excessive_hours',
          workerId: record.worker_id,
          workerName: record.workers?.name || '',
          date: record.date,
          hoursWorked: Number(record.hours_worked),
          reason: '24시간을 초과한 근무 시간',
        })
      }

      // 2. 0시간 근무
      if (Number(record.hours_worked) === 0) {
        conflicts.push({
          type: 'zero_hours',
          workerId: record.worker_id,
          workerName: record.workers?.name || '',
          date: record.date,
          hoursWorked: 0,
          reason: '근무 시간이 0시간',
        })
      }

      // 3. 너무 짧은 근무 (2시간 미만)
      if (Number(record.hours_worked) < 2 && Number(record.hours_worked) > 0) {
        conflicts.push({
          type: 'short_hours',
          workerId: record.worker_id,
          workerName: record.workers?.name || '',
          date: record.date,
          hoursWorked: Number(record.hours_worked),
          reason: '2시간 미만의 짧은 근무',
        })
      }
    })

    // 주별 근무 시간 확인 (주 52시간 초과)
    const weeklyHours = new Map<string, { total: number; records: any[] }>()

    attendance?.forEach((record) => {
      const weekKey = `${record.worker_id}-${getWeekOfYear(new Date(record.date))}`
      if (!weeklyHours.has(weekKey)) {
        weeklyHours.set(weekKey, { total: 0, records: [] })
      }
      const week = weeklyHours.get(weekKey)!
      week.total += Number(record.hours_worked)
      week.records.push(record)
    })

    weeklyHours.forEach((week, key) => {
      if (week.total > 52 && week.records.length > 0) {
        const firstRecord = week.records[0]
        conflicts.push({
          type: 'weekly_overtime',
          workerId: firstRecord.worker_id,
          workerName: firstRecord.workers?.name || '',
          date: firstRecord.date,
          hoursWorked: week.total,
          reason: `주 52시간을 초과한 근무 (총 ${Math.round(week.total * 10) / 10}시간)`,
        })
      }
    })

    return NextResponse.json({
      totalConflicts: conflicts.length,
      conflicts: conflicts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    })
  } catch (error) {
    console.error('Error detecting conflicts:', error)
    return NextResponse.json(
      { error: '충돌 감지 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 주차 계산 헬퍼
function getWeekOfYear(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-W${weekNo}`
}
