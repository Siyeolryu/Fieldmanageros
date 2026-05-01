import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { calculateMonthlyPayroll } from '@/lib/payroll'
import { Decimal } from '@prisma/client/runtime/library'

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

    // 현재 사용자의 급여만 조회 (소유권 검증)
    const where: {
      siteId?: string
      year?: number
      month?: number
      site: {
        company: {
          ownerId: string
        }
      }
    } = {
      site: {
        company: {
          ownerId: user.id,
        },
      },
    }

    if (siteId) where.siteId = siteId
    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        worker: {
          select: {
            name: true,
            phone: true,
            idNumber: true,
            hourlyRate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(payrolls)
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

    // 1. 근로자 정보 조회 및 소유권 검증
    const worker = await prisma.worker.findFirst({
      where: {
        id: validatedData.workerId,
        site: {
          company: {
            ownerId: user.id,
          },
        },
      },
    })

    if (!worker) {
      return NextResponse.json({ error: '근로자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. 해당 월의 출근 기록 조회
    const startDate = new Date(validatedData.year, validatedData.month - 1, 1)
    const endDate = new Date(validatedData.year, validatedData.month, 0)

    const attendances = await prisma.attendance.findMany({
      where: {
        workerId: validatedData.workerId,
        siteId: validatedData.siteId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    if (!attendances || attendances.length === 0) {
      return NextResponse.json(
        { error: '해당 월의 출근 기록이 없어 급여를 생성할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 3. 급여 계산 수행
    const result = calculateMonthlyPayroll(
      attendances.map(a => ({
        id: a.id,
        worker_id: a.workerId,
        site_id: a.siteId,
        date: a.date.toISOString().split('T')[0],
        hours_worked: Number(a.hoursWorked),
        is_weekly_holiday: a.isWeeklyHoliday,
      })),
      worker.hourlyRate,
      validatedData.weeklyHolidayCount
    )

    // 4. 급여 명세 저장 (Upsert)
    const payroll = await prisma.payroll.upsert({
      where: {
        workerId_siteId_year_month: {
          workerId: validatedData.workerId,
          siteId: validatedData.siteId,
          year: validatedData.year,
          month: validatedData.month,
        },
      },
      update: {
        totalWorkDays: result.totalWorkDays,
        totalHours: new Decimal(result.totalHours),
        basePay: result.basePay,
        weeklyHolidayPay: result.weeklyHolidayPay,
        overtimePay: result.overtimePay,
        totalPay: result.totalPay,
        healthInsurance: result.healthInsurance,
        pensionInsurance: result.pensionInsurance,
        employmentInsurance: result.employmentInsurance,
        incomeTax: result.incomeTax,
        totalDeduction: result.totalDeduction,
        netPay: result.netPay,
      },
      create: {
        workerId: validatedData.workerId,
        siteId: validatedData.siteId,
        year: validatedData.year,
        month: validatedData.month,
        totalWorkDays: result.totalWorkDays,
        totalHours: new Decimal(result.totalHours),
        basePay: result.basePay,
        weeklyHolidayPay: result.weeklyHolidayPay,
        overtimePay: result.overtimePay,
        totalPay: result.totalPay,
        healthInsurance: result.healthInsurance,
        pensionInsurance: result.pensionInsurance,
        employmentInsurance: result.employmentInsurance,
        incomeTax: result.incomeTax,
        totalDeduction: result.totalDeduction,
        netPay: result.netPay,
      },
    })

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
