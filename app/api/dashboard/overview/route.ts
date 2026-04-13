import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/overview - 전체 현황
export async function GET() {
  try {
    // 현재 사용자 확인
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

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 사용자의 회사 조회
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    if (companiesError) throw companiesError

    const companyIds = companies?.map((c) => c.id) || []

    if (companyIds.length === 0) {
      return NextResponse.json({
        totalCompanies: 0,
        totalSites: 0,
        totalWorkers: 0,
        activeWorkers: 0,
        thisMonth: {
          totalAttendance: 0,
          totalPayroll: 0,
          unpaidPayroll: 0,
        },
        trends: {
          workersChange: 0,
          payrollChange: 0,
        },
      })
    }

    // Get all sites for these companies
    const { data: companySites } = await supabaseAdmin
      .from('sites')
      .select('id, is_active')
      .in('company_id', companyIds)

    const siteIds = companySites?.map((s) => s.id) || []

    if (siteIds.length === 0) {
      return NextResponse.json({
        totalCompanies: companyIds.length,
        totalSites: 0,
        totalWorkers: 0,
        activeWorkers: 0,
        thisMonth: {
          totalAttendance: 0,
          totalPayroll: 0,
          unpaidPayroll: 0,
        },
        trends: {
          workersChange: 0,
          payrollChange: 0,
        },
      })
    }

    // 통계 수집
    const [
      totalSitesResult,
      activeSitesResult,
      totalWorkersResult,
      activeWorkersResult,
      thisMonthAttendanceResult,
      thisMonthPayrollData,
      lastMonthPayrollData,
      unpaidPayrollData,
    ] = await Promise.all([
      // 전체 현장 수
      supabaseAdmin
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .in('company_id', companyIds),

      // 활성 현장 수
      supabaseAdmin
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .in('company_id', companyIds)
        .eq('is_active', true),

      // 전체 근로자 수
      supabaseAdmin
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .in('site_id', siteIds),

      // 활성 근로자 수
      supabaseAdmin
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .eq('is_active', true),

      // 이번 달 출근 기록 수
      supabaseAdmin
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .gte('date', thisMonth.toISOString().split('T')[0])
        .lt('date', nextMonth.toISOString().split('T')[0]),

      // 이번 달 급여 총액
      supabaseAdmin
        .from('payroll')
        .select('total_pay')
        .in('site_id', siteIds)
        .eq('year', now.getFullYear())
        .eq('month', now.getMonth() + 1),

      // 지난 달 급여 총액
      supabaseAdmin
        .from('payroll')
        .select('total_pay')
        .in('site_id', siteIds)
        .eq('year', lastMonth.getFullYear())
        .eq('month', lastMonth.getMonth() + 1),

      // 미지급 급여 총액
      supabaseAdmin
        .from('payroll')
        .select('net_pay')
        .in('site_id', siteIds)
        .is('paid_at', null),
    ])

    const totalSites = totalSitesResult.count || 0
    const activeSites = activeSitesResult.count || 0
    const totalWorkers = totalWorkersResult.count || 0
    const activeWorkers = activeWorkersResult.count || 0
    const thisMonthAttendance = thisMonthAttendanceResult.count || 0

    // Calculate sum for payroll
    const thisMonthPayrollSum =
      thisMonthPayrollData.data?.reduce((sum, p) => sum + (p.total_pay || 0), 0) || 0
    const lastMonthPayrollSum =
      lastMonthPayrollData.data?.reduce((sum, p) => sum + (p.total_pay || 0), 0) || 0
    const unpaidPayrollSum =
      unpaidPayrollData.data?.reduce((sum, p) => sum + (p.net_pay || 0), 0) || 0
    const unpaidCount = unpaidPayrollData.data?.length || 0

    const overview = {
      totalCompanies: companyIds.length,
      totalSites,
      activeSites,
      inactiveSites: totalSites - activeSites,
      totalWorkers,
      activeWorkers,
      inactiveWorkers: totalWorkers - activeWorkers,
      thisMonth: {
        totalAttendance: thisMonthAttendance,
        totalPayroll: thisMonthPayrollSum,
        unpaidPayroll: unpaidPayrollSum,
        unpaidCount: unpaidCount,
      },
      trends: {
        payrollChange:
          lastMonthPayrollSum && lastMonthPayrollSum > 0
            ? Math.round(
                ((thisMonthPayrollSum - lastMonthPayrollSum) / lastMonthPayrollSum) * 100
              )
            : 0,
      },
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
