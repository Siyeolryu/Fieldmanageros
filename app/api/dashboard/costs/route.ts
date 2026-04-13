import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/costs?months=6 - 인건비 추이
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6')

    // 사용자의 회사 조회
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    const companyIds = companies?.map((c) => c.id) || []

    if (companyIds.length === 0) {
      return NextResponse.json({ costs: [] })
    }

    // Get all sites
    const { data: sites } = await supabaseAdmin
      .from('sites')
      .select('id')
      .in('company_id', companyIds)

    const siteIds = sites?.map((s) => s.id) || []

    if (siteIds.length === 0) {
      return NextResponse.json({ costs: [] })
    }

    // 최근 N개월 데이터
    const now = new Date()
    const monthlyData: {
      year: number
      month: number
      label: string
      totalPay: number
      totalDeduction: number
      netPay: number
      workerCount: number
    }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth() + 1

      const { data: payrollData } = await supabaseAdmin
        .from('payroll')
        .select('total_pay, total_deduction, net_pay, worker_id')
        .in('site_id', siteIds)
        .eq('year', year)
        .eq('month', month)

      const totalPay = payrollData?.reduce((sum, p) => sum + (p.total_pay || 0), 0) || 0
      const totalDeduction = payrollData?.reduce((sum, p) => sum + (p.total_deduction || 0), 0) || 0
      const netPay = payrollData?.reduce((sum, p) => sum + (p.net_pay || 0), 0) || 0
      const uniqueWorkers = new Set(payrollData?.map((p) => p.worker_id) || [])

      monthlyData.push({
        year,
        month,
        label: `${year}.${month.toString().padStart(2, '0')}`,
        totalPay,
        totalDeduction,
        netPay,
        workerCount: uniqueWorkers.size,
      })
    }

    return NextResponse.json({ costs: monthlyData })
  } catch (error) {
    console.error('Error fetching cost trends:', error)
    return NextResponse.json(
      { error: '인건비 추이를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
