import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/risks - 리스크 분석
export async function GET() {
  try {
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

    // 사용자의 회사 조회
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    const companyIds = companies?.map((c) => c.id) || []

    if (companyIds.length === 0) {
      return NextResponse.json({ risks: [] })
    }

    // Get all sites
    const { data: sites } = await supabaseAdmin
      .from('sites')
      .select('id, is_active, end_date')
      .in('company_id', companyIds)

    const siteIds = sites?.map((s) => s.id) || []

    if (siteIds.length === 0) {
      return NextResponse.json({ risks: [] })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0]
    const thirtyDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    // 리스크 분석
    const [
      unpaidPayrollsResult,
      weeklyAttendanceData,
      allActiveWorkersResult,
      recentAttendanceWorkersData,
    ] = await Promise.all([
      // 미지급 급여
      supabaseAdmin
        .from('payroll')
        .select('id', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .is('paid_at', null),

      // 최근 7일간 출근 기록 (주 52시간 초과 확인용)
      supabaseAdmin
        .from('attendance')
        .select('worker_id, hours_worked')
        .in('site_id', siteIds)
        .gte('date', sevenDaysAgo)
        .lt('date', today),

      // 활성 근로자 전체
      supabaseAdmin
        .from('workers')
        .select('id')
        .in('site_id', siteIds)
        .eq('is_active', true),

      // 최근 7일간 출근 기록이 있는 근로자
      supabaseAdmin
        .from('attendance')
        .select('worker_id')
        .in('site_id', siteIds)
        .gte('date', sevenDaysAgo),
    ])

    const unpaidPayrolls = unpaidPayrollsResult.count || 0

    // 주 52시간 초과 계산
    const workerHoursMap = new Map<string, number>()
    weeklyAttendanceData.data?.forEach((a) => {
      const current = workerHoursMap.get(a.worker_id) || 0
      workerHoursMap.set(a.worker_id, current + (a.hours_worked || 0))
    })
    const excessiveWorkHours = Array.from(workerHoursMap.values()).filter((hours) => hours > 52)

    // 최근 7일간 출근 기록 없는 활성 근로자
    const allActiveWorkerIds = new Set(allActiveWorkersResult.data?.map((w) => w.id) || [])
    const recentAttendanceWorkerIds = new Set(recentAttendanceWorkersData.data?.map((a) => a.worker_id) || [])
    const missingAttendance = allActiveWorkerIds.size - recentAttendanceWorkerIds.size

    // 종료 예정 현장 (30일 이내)
    const inactiveSites = sites?.filter((s) => {
      if (!s.is_active || !s.end_date) return false
      return s.end_date <= thirtyDaysLater && s.end_date >= today
    }).length || 0

    const risks = [
      {
        type: 'unpaid_payroll',
        level: unpaidPayrolls > 10 ? 'high' : unpaidPayrolls > 5 ? 'medium' : 'low',
        count: unpaidPayrolls,
        message: `미지급 급여 ${unpaidPayrolls}건`,
      },
      {
        type: 'excessive_hours',
        level: excessiveWorkHours.length > 5 ? 'high' : excessiveWorkHours.length > 0 ? 'medium' : 'low',
        count: excessiveWorkHours.length,
        message: `주 52시간 초과 근무자 ${excessiveWorkHours.length}명`,
      },
      {
        type: 'missing_attendance',
        level: missingAttendance > 10 ? 'high' : missingAttendance > 3 ? 'medium' : 'low',
        count: missingAttendance,
        message: `7일간 출근 기록 없는 근로자 ${missingAttendance}명`,
      },
      {
        type: 'site_ending',
        level: inactiveSites > 5 ? 'high' : inactiveSites > 0 ? 'medium' : 'low',
        count: inactiveSites,
        message: `30일 내 종료 예정 현장 ${inactiveSites}개`,
      },
    ]

    return NextResponse.json({ risks })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json(
      { error: '리스크 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
