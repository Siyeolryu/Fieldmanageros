import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { calculateMonthlyPayroll } from '@/lib/payroll'

// 급여 생성 요청 검증 스키마
const payrollSchema = z.object({
  workerId: z.string().uuid('유효한 근로자 ID가 필요합니다.'),
  siteId: z.string().uuid('유효한 현장 ID가 필요합니다.'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  weeklyHolidayCount: z.number().min(0).max(10).optional().default(0),
})

// GET /api/payroll - 급여 명세 목록 조회
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
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    // RLS가 자동으로 현재 사용자의 급여만 필터링
    let query = supabase
      .from('payroll')
      .select('*, workers(name, phone, id_number, hourly_rate)')
      .order('created_at', { ascending: false })

    if (siteId) query = query.eq('site_id', siteId)
    if (year) query = query.eq('year', parseInt(year))
    if (month) query = query.eq('month', parseInt(month))

    const { data: payrolls, error } = await query

    if (error) throw error

    // workers 필드를 worker로 변환 (호환성 유지)
    const formattedPayrolls = payrolls?.map(p => ({
      ...p,
      workerId: p.worker_id,
      worker: {
        name: p.workers?.name,
        phone: p.workers?.phone,
        idNumber: p.workers?.id_number,
        hourlyRate: p.workers?.hourly_rate,
      },
      workers: undefined,
    }))

    return NextResponse.json(formattedPayrolls)
  } catch (error) {
    console.error('Error fetching payrolls:', error)
    return NextResponse.json(
      { error: '급여 명세 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/payroll - 급여 명세 생성/업데이트
export async function POST(request: Request) {
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

    const body = await request.json()
    const validatedData = payrollSchema.parse(body)

    // 1. 근로자 정보 조회 (시급 확인 필요) - RLS가 소유권 검증
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', validatedData.workerId)
      .single()

    if (workerError || !worker) {
      return NextResponse.json({ error: '근로자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. 해당 월의 출근 기록 조회 - RLS가 소유권 검증
    const startDate = new Date(validatedData.year, validatedData.month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(validatedData.year, validatedData.month, 0).toISOString().split('T')[0]

    const { data: attendances, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('worker_id', validatedData.workerId)
      .eq('site_id', validatedData.siteId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (attendanceError) throw attendanceError

    if (!attendances || attendances.length === 0) {
      return NextResponse.json(
        { error: '해당 월의 출근 기록이 없어 급여를 생성할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 3. 급여 계산 수행
    const result = calculateMonthlyPayroll(
      attendances as any,
      worker.hourly_rate,
      validatedData.weeklyHolidayCount
    )

    // 4. 급여 명세 저장 (Upsert) - RLS가 소유권 검증
    const { data: payroll, error: payrollError } = await supabase
      .from('payroll')
      .upsert({
        worker_id: validatedData.workerId,
        site_id: validatedData.siteId,
        year: validatedData.year,
        month: validatedData.month,
        total_work_days: result.totalWorkDays,
        total_hours: result.totalHours,
        base_pay: result.basePay,
        weekly_holiday_pay: result.weeklyHolidayPay,
        overtime_pay: result.overtimePay,
        total_pay: result.totalPay,
        health_insurance: result.healthInsurance,
        pension_insurance: result.pensionInsurance,
        employment_insurance: result.employmentInsurance,
        income_tax: result.incomeTax,
        total_deduction: result.totalDeduction,
        net_pay: result.netPay,
      }, {
        onConflict: 'worker_id,site_id,year,month'
      })
      .select()
      .single()

    if (payrollError) throw payrollError

    return NextResponse.json(payroll, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating payroll:', error)
    return NextResponse.json(
      { error: '급여 명세 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
