import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        worker: true,
        site: {
          select: {
            name: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(payroll)
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

    const updateData: {
      paidAt?: Date | null
      basePay?: number
      weeklyHolidayPay?: number
      overtimePay?: number
      healthInsurance?: number
      pensionInsurance?: number
      employmentInsurance?: number
      incomeTax?: number
      totalDeduction?: number
      netPay?: number
    } = {}

    if (validatedData.paidAt !== undefined) {
      updateData.paidAt = validatedData.paidAt ? new Date(validatedData.paidAt) : null
    }
    if (validatedData.basePay !== undefined) updateData.basePay = validatedData.basePay
    if (validatedData.weeklyHolidayPay !== undefined) updateData.weeklyHolidayPay = validatedData.weeklyHolidayPay
    if (validatedData.overtimePay !== undefined) updateData.overtimePay = validatedData.overtimePay
    if (validatedData.healthInsurance !== undefined) updateData.healthInsurance = validatedData.healthInsurance
    if (validatedData.pensionInsurance !== undefined) updateData.pensionInsurance = validatedData.pensionInsurance
    if (validatedData.employmentInsurance !== undefined) updateData.employmentInsurance = validatedData.employmentInsurance
    if (validatedData.incomeTax !== undefined) updateData.incomeTax = validatedData.incomeTax
    if (validatedData.totalDeduction !== undefined) updateData.totalDeduction = validatedData.totalDeduction
    if (validatedData.netPay !== undefined) updateData.netPay = validatedData.netPay

    const payroll = await prisma.payroll.update({
      where: { id },
      data: updateData,
    })

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
