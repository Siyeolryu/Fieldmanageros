import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/compliance - 법정 준수사항 체크
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

    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    const companyIds = companies?.map((c) => c.id) || []

    if (companyIds.length === 0) {
      return NextResponse.json({ compliance: [] })
    }

    // Get all sites for these companies
    const { data: sites } = await supabaseAdmin
      .from('sites')
      .select('id, is_active')
      .in('company_id', companyIds)

    const siteIds = sites?.map((s) => s.id) || []
    const activeSiteIds = sites?.filter((s) => s.is_active).map((s) => s.id) || []

    if (siteIds.length === 0) {
      return NextResponse.json({ compliance: [] })
    }

    const now = new Date()

    // 법정 준수사항 체크
    const [
      workersWithoutBankInfoResult,
      workersWithoutIdNumberResult,
      activeSitesResult,
      recentPayrollsData,
    ] = await Promise.all([
      // 계좌 정보 없는 근로자
      supabaseAdmin
        .from('workers')
        .select('id', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .eq('is_active', true)
        .or('bank_name.is.null,bank_account.is.null'),

      // 주민등록번호 없는 근로자
      supabaseAdmin
        .from('workers')
        .select('id', { count: 'exact', head: true })
        .in('site_id', siteIds)
        .eq('is_active', true)
        .is('id_number', null),

      // 활성 현장 수
      supabaseAdmin
        .from('sites')
        .select('id', { count: 'exact', head: true })
        .in('company_id', companyIds)
        .eq('is_active', true),

      // 최근 3개월 급여 지급 현황
      supabaseAdmin
        .from('payroll')
        .select('year, month, paid_at')
        .in('site_id', siteIds)
        .gte('year', now.getFullYear())
        .gte('month', now.getMonth() - 1),
    ])

    const workersWithoutBankInfo = workersWithoutBankInfoResult.count || 0
    const workersWithoutIdNumber = workersWithoutIdNumberResult.count || 0
    const sitesWithoutInsurance = activeSitesResult.count || 0

    // Group by year and month
    const payrollGroups = new Set()
    recentPayrollsData.data?.forEach((p) => {
      if (p.paid_at) {
        payrollGroups.add(`${p.year}-${p.month}`)
      }
    })
    const recentPayrolls = Array.from(payrollGroups)

    const compliance = [
      {
        category: 'worker_info',
        status: workersWithoutBankInfo === 0 ? 'compliant' : 'warning',
        message: `계좌 정보 미등록 근로자: ${workersWithoutBankInfo}명`,
        action: '근로자 정보 업데이트 필요',
      },
      {
        category: 'worker_id',
        status: workersWithoutIdNumber === 0 ? 'compliant' : 'warning',
        message: `주민등록번호 미등록 근로자: ${workersWithoutIdNumber}명`,
        action: '4대 보험 가입을 위해 정보 수집 필요',
      },
      {
        category: 'insurance',
        status: sitesWithoutInsurance === 0 ? 'compliant' : 'info',
        message: `활성 현장: ${sitesWithoutInsurance}개`,
        action: '현장별 4대 보험 가입 여부 확인',
      },
      {
        category: 'payroll_payment',
        status: recentPayrolls.length >= 3 ? 'compliant' : 'warning',
        message: `최근 3개월 급여 지급 내역: ${recentPayrolls.length}건`,
        action: '정기적인 급여 지급 필요',
      },
    ]

    return NextResponse.json({ compliance })
  } catch (error) {
    console.error('Error checking compliance:', error)
    return NextResponse.json(
      { error: '준수사항 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
