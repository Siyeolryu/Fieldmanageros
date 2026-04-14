import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generatePayrollExcel } from '@/lib/excel/generator'

// GET /api/excel/download/payroll?siteId=xxx&year=2026&month=4
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

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

    // 현장 정보 - RLS가 자동으로 소유권 검증
    const { data: site } = await supabase
      .from('sites')
      .select('name')
      .eq('id', siteId)
      .single()

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 급여 데이터 조회 - RLS가 자동으로 소유권 검증
    const { data: payrolls, error: payrollError } = await supabase
      .from('payroll')
      .select('*, workers(name, hourly_rate, bank_name, bank_account)')
      .eq('site_id', siteId)
      .eq('year', year)
      .eq('month', month)

    if (payrollError) throw payrollError

    if (!payrolls || payrolls.length === 0) {
      return NextResponse.json(
        { error: '급여 데이터가 없습니다.' },
        { status: 404 }
      )
    }

    // 엑셀 생성
    const excelBuffer = generatePayrollExcel(
      payrolls.map((p) => ({
        workerName: p.workers?.name || '근로자',
        hourlyRate: p.workers?.hourly_rate || 0,
        totalWorkDays: p.total_work_days || 0,
        totalHours: Number(p.total_hours || 0),
        basePay: p.base_pay || 0,
        weeklyHolidayPay: p.weekly_holiday_pay || 0,
        overtimePay: p.overtime_pay || 0,
        totalPay: p.total_pay || 0,
        healthInsurance: p.health_insurance || 0,
        pensionInsurance: p.pension_insurance || 0,
        employmentInsurance: p.employment_insurance || 0,
        incomeTax: p.income_tax || 0,
        totalDeduction: p.total_deduction || 0,
        netPay: p.net_pay || 0,
        bankName: p.workers?.bank_name || undefined,
        bankAccount: p.workers?.bank_account || undefined,
      })),
      year,
      month,
      site.name
    )

    // 파일명 생성
    const filename = `급여명세서_${site.name}_${year}년${month}월.xlsx`

    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading payroll Excel:', error)
    return NextResponse.json(
      { error: '급여명세서 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
