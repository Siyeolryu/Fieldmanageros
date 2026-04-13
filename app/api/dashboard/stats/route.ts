import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { startOfMonth, endOfMonth, startOfToday, endOfToday, subDays } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json({ error: '현장 ID가 필요합니다.' }, { status: 400 })
    }

    const today = new Date()
    const monthStart = startOfMonth(today).toISOString().split('T')[0]
    const monthEnd = endOfMonth(today).toISOString().split('T')[0]
    const todayStart = startOfToday().toISOString().split('T')[0]

    // 1. 총 근로자 수 (해당 현장 기준)
    const { count: totalWorkers } = await supabaseAdmin
      .from('workers')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('is_active', true)

    // 2. 오늘 출근 인원
    const { count: todayAttendance } = await supabaseAdmin
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('date', todayStart)

    // 3. 이번 달 누적 노무비 및 리스크 근로자 (6~7일 근무)
    const { data: monthlyAttendance } = await supabaseAdmin
      .from('attendance')
      .select('*, workers(id, name, hourly_rate)')
      .eq('site_id', siteId)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    const workerDaysMap: Record<string, { name: string, days: number }> = {}

    const monthlyCost = (monthlyAttendance || []).reduce((sum, record) => {
      // 공수 계산 및 비용 합산
      const hours = Number(record.hours_worked)
      const hourlyRate = record.workers?.hourly_rate || 0
      const pay = hours * hourlyRate
      const overtimePay = hours > 8 ? (hours - 8) * hourlyRate * 0.5 : 0

      // 근무일수 집계 (주수휴당 제외 순수 출근일)
      if (!workerDaysMap[record.worker_id]) {
        workerDaysMap[record.worker_id] = { name: record.workers?.name || '', days: 0 }
      }
      workerDaysMap[record.worker_id].days += 1

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

    const { data: recentAttendance } = await supabaseAdmin
      .from('attendance')
      .select('date, hours_worked, workers(hourly_rate)')
      .eq('site_id', siteId)
      .gte('date', subDays(today, 13).toISOString().split('T')[0])

    recentAttendance?.forEach(record => {
      const dateStr = record.date
      const dayData = last14Days.find(d => d.date === dateStr)
      if (dayData) {
        const hours = Number(record.hours_worked)
        const hourlyRate = record.workers?.hourly_rate || 0
        const pay = hours * hourlyRate
        const overtime = hours > 8 ? (hours - 8) * hourlyRate * 0.5 : 0
        dayData.cost += (pay + overtime)
      }
    })

    return NextResponse.json({
      totalWorkers: totalWorkers || 0,
      todayAttendance: todayAttendance || 0,
      monthlyCost,
      riskWorkers,
      chartData: last14Days
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: '통계 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
