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

    // 배치 처리 최적화: 모든 데이터를 한 번에 조회
    const [workers, allAttendance, existingPayrolls] = await Promise.all([
      // 근로자 목록
      prisma.worker.findMany({
        where: {
          siteId,
          ...(workerIds && workerIds.length > 0 ? { id: { in: workerIds } } : {}),
        },
      }),
      // 모든 출근 기록 (한 번에 조회)
      prisma.attendance.findMany({
        where: {
          siteId,
          date: {
            gte: startDate,
            lt: endDate,
          },
          ...(workerIds && workerIds.length > 0 ? { workerId: { in: workerIds } } : {}),
        },
        orderBy: {
          date: 'asc',
        },
      }),
      // 기존 급여 기록 (한 번에 조회)
      prisma.payroll.findMany({
        where: {
          siteId,
          year,
          month,
          ...(workerIds && workerIds.length > 0 ? { workerId: { in: workerIds } } : {}),
        },
        select: { id: true, workerId: true },
      }),
    ])

    if (!workers || workers.length === 0) {
      return NextResponse.json(
        { error: '근로자가 없습니다.' },
        { status: 400 }
      )
    }

    // 메모리에서 worker별로 attendance 그룹화
    const attendanceByWorker = new Map<string, typeof allAttendance>()
    allAttendance.forEach((att) => {
      if (!attendanceByWorker.has(att.workerId)) {
        attendanceByWorker.set(att.workerId, [])
      }
      attendanceByWorker.get(att.workerId)!.push(att)
    })

    // 기존 급여를 Map으로 변환
    const existingPayrollMap = new Map(
      existingPayrolls.map((p) => [p.workerId, p.id])
    )

    const results: Array<{
      payrollId: string
      workerId: string
      workerName: string
      totalPay: number | null
      netPay: number | null
      status: 'created' | 'updated'
    }> = []
    const errors: Array<{
      workerId: string
      workerName: string
      error: string
    }> = []
    const payrollsToCreate: Array<{
      data: Record<string, unknown>
      workerId: string
      workerName: string
    }> = []
    const payrollsToUpdate: Array<{
      id: string
      data: Record<string, unknown>
      workerId: string
      workerName: string
    }> = []

    // 각 worker의 급여 계산 (DB 쿼리 없이 메모리에서만 처리)
    for (const worker of workers) {
      try {
        const attendance = attendanceByWorker.get(worker.id) || []

        // 출근 기록이 없으면 건너뛰기
        if (attendance.length === 0) {
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

        const existingPayrollId = existingPayrollMap.get(worker.id)
        if (existingPayrollId) {
          payrollsToUpdate.push({
            id: existingPayrollId,
            data: payrollPayload,
            workerId: worker.id,
            workerName: worker.name,
          })
        } else {
          payrollsToCreate.push({
            data: payrollPayload,
            workerId: worker.id,
            workerName: worker.name,
          })
        }
      } catch (error) {
        errors.push({
          workerId: worker.id,
          workerName: worker.name,
          error: error instanceof Error ? error.message : '급여 계산 중 오류 발생',
        })
      }
    }

    // 트랜잭션으로 배치 처리 (원자성 보장)
    try {
      await prisma.$transaction(async (tx) => {
        // 업데이트는 순차적으로 (unique constraint 때문에 병렬 불가)
        for (const item of payrollsToUpdate) {
          const payroll = await tx.payroll.update({
            where: { id: item.id },
            data: item.data,
          })
          results.push({
            payrollId: payroll.id,
            workerId: item.workerId,
            workerName: item.workerName,
            totalPay: payroll.totalPay,
            netPay: payroll.netPay,
            status: 'updated' as const,
          })
        }

        // 신규 생성은 createMany로 배치 처리
        if (payrollsToCreate.length > 0) {
          await tx.payroll.createMany({
            data: payrollsToCreate.map((item) => item.data),
          })

          // createMany는 생성된 레코드를 반환하지 않으므로 다시 조회
          const createdPayrolls = await tx.payroll.findMany({
            where: {
              siteId,
              year,
              month,
              workerId: { in: payrollsToCreate.map((p) => p.workerId) },
            },
          })

          createdPayrolls.forEach((payroll) => {
            const item = payrollsToCreate.find((p) => p.workerId === payroll.workerId)
            if (item) {
              results.push({
                payrollId: payroll.id,
                workerId: item.workerId,
                workerName: item.workerName,
                totalPay: payroll.totalPay,
                netPay: payroll.netPay,
                status: 'created' as const,
              })
            }
          })
        }
      })
    } catch (error) {
      console.error('Transaction error:', error)
      return NextResponse.json(
        { error: '급여 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
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
