import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 수동 수정 검증 스키마
const updatePayrollSchema = z.object({
  paidAt: z.string().nullable().optional(),
  basePay: z.number().int().optional(),
  weeklyHolidayPay: z.number().int().optional(),
  overtimePay: z.number().int().optional(),
  healthInsurance: z.number().int().optional(),
  pensionInsurance: z.number().int().optional(),
  employmentInsurance: z.number().int().optional(),
  incomeTax: z.number().int().optional(),
  totalDeduction: z.number().int().optional(),
  netPay: z.number().int().optional(),
})

// GET /api/payroll/[id] - 단일 급여 명세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: payroll, error } = await supabaseAdmin
      .from('payroll')
      .select('*, workers(*), sites(name, companies(name))')
      .eq('id', id)
      .single()

    if (error || !payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...payroll,
      worker: payroll.workers,
      site: payroll.sites,
      workers: undefined,
      sites: undefined,
    })
  } catch (error) {
    console.error('Error fetching payroll details:', error)
    return NextResponse.json(
      { error: '급여 명세 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/payroll/[id] - 급여 명세 수정 (수동 조정 또는 지급 완료 처리)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updatePayrollSchema.parse(body)

    const updateData: Record<string, string | number | null> = {}
    if (validatedData.paidAt !== undefined) updateData.paid_at = validatedData.paidAt
    if (validatedData.basePay !== undefined) updateData.base_pay = validatedData.basePay
    if (validatedData.weeklyHolidayPay !== undefined) updateData.weekly_holiday_pay = validatedData.weeklyHolidayPay
    if (validatedData.overtimePay !== undefined) updateData.overtime_pay = validatedData.overtimePay
    if (validatedData.healthInsurance !== undefined) updateData.health_insurance = validatedData.healthInsurance
    if (validatedData.pensionInsurance !== undefined) updateData.pension_insurance = validatedData.pensionInsurance
    if (validatedData.employmentInsurance !== undefined) updateData.employment_insurance = validatedData.employmentInsurance
    if (validatedData.incomeTax !== undefined) updateData.income_tax = validatedData.incomeTax
    if (validatedData.totalDeduction !== undefined) updateData.total_deduction = validatedData.totalDeduction
    if (validatedData.netPay !== undefined) updateData.net_pay = validatedData.netPay

    const { data: payroll, error } = await supabaseAdmin
      .from('payroll')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(payroll)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating payroll:', error)
    return NextResponse.json(
      { error: '급여 명세 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
