import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateMonthlyPayroll } from '@/lib/payroll/calculator'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// 급여 생성 요청 스키마
const generateSchema = z.object({
  siteId: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  workerIds: z.array(z.string().uuid()).optional(), // 특정 근로자만 생성 (없으면 전체)
})

// POST /api/payroll/generate - 월별 급여 자동 생성
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, year, month, workerIds } = generateSchema.parse(body)

    // 현장 존재 확인
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 기간 설정
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    // 근로자 목록 가져오기
    const workers = await prisma.worker.findMany({
      where: {
        siteId,
        ...(workerIds && workerIds.length > 0 ? { id: { in: workerIds } } : {}),
      },
    })

    if (!workers || workers.length === 0) {
      return NextResponse.json(
        { error: '근로자가 없습니다.' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const worker of workers) {
      try {
        // 해당 근로자의 출근 기록 가져오기
        const attendance = await prisma.attendance.findMany({
          where: {
            workerId: worker.id,
            siteId,
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          orderBy: {
            date: 'asc',
          },
        })

        // 출근 기록이 없으면 건너뛰기
        if (!attendance || attendance.length === 0) {
          errors.push({
            workerId: worker.id,
            workerName: worker.name,
            error: '출근 기록이 없습니다.',
          })
          continue
        }

        // 급여 계산
        const payrollData = calculateMonthlyPayroll(
          {
            workerId: worker.id,
            workerName: worker.name,
            hourlyRate: worker.hourlyRate,
            attendance: attendance.map((a) => ({
              date: new Date(a.date),
              hoursWorked: Number(a.hoursWorked),
              isWeeklyHoliday: a.isWeeklyHoliday,
            })),
          },
          year,
          month
        )

        // 기존 급여 확인 (이미 생성된 경우 업데이트)
        const existingPayroll = await prisma.payroll.findUnique({
          where: {
            workerId_siteId_year_month: {
              workerId: worker.id,
              siteId,
              year,
              month,
            },
          },
          select: { id: true },
        })

        const payrollPayload = {
          workerId: worker.id,
          siteId,
          year,
          month,
          totalWorkDays: payrollData.totalWorkDays,
          totalHours: new Decimal(payrollData.totalHours),
          basePay: payrollData.basePay,
          weeklyHolidayPay: payrollData.weeklyHolidayPay,
          overtimePay: payrollData.overtimePay,
          totalPay: payrollData.totalPay,
          healthInsurance: payrollData.healthInsurance,
          pensionInsurance: payrollData.pensionInsurance,
          employmentInsurance: payrollData.employmentInsurance,
          incomeTax: payrollData.incomeTax,
          totalDeduction: payrollData.totalDeduction,
          netPay: payrollData.netPay,
        }

        let payroll
        if (existingPayroll) {
          // 업데이트
          payroll = await prisma.payroll.update({
            where: { id: existingPayroll.id },
            data: payrollPayload,
          })
        } else {
          // 신규 생성
          payroll = await prisma.payroll.create({
            data: payrollPayload,
          })
        }

        results.push({
          payrollId: payroll.id,
          workerId: worker.id,
          workerName: worker.name,
          totalPay: payroll.totalPay,
          netPay: payroll.netPay,
          status: existingPayroll ? 'updated' : 'created',
        })
      } catch (error) {
        errors.push({
          workerId: worker.id,
          workerName: worker.name,
          error: error instanceof Error ? error.message : '급여 계산 중 오류 발생',
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        siteId,
        year,
        month,
        summary: {
          total: workers.length,
          created: results.filter((r) => r.status === 'created').length,
          updated: results.filter((r) => r.status === 'updated').length,
          failed: errors.length,
        },
        results,
        errors,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error generating payroll:', error)
    return NextResponse.json(
      { error: '급여 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
