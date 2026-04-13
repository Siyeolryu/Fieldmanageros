import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { calculateMonthlyPayroll } from '@/lib/payroll/calculator'
import { z } from 'zod'

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
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 기간 설정
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 1).toISOString().split('T')[0]

    // 근로자 목록 가져오기
    let workerQuery = supabaseAdmin
      .from('workers')
      .select('*')
      .eq('site_id', siteId)

    if (workerIds && workerIds.length > 0) {
      workerQuery = workerQuery.in('id', workerIds)
    }

    const { data: workers, error: workersError } = await workerQuery

    if (workersError) throw workersError

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
        const { data: attendance, error: attendanceError } = await supabaseAdmin
          .from('attendance')
          .select('*')
          .eq('worker_id', worker.id)
          .eq('site_id', siteId)
          .gte('date', startDate)
          .lt('date', endDate)
          .order('date', { ascending: true })

        if (attendanceError) throw attendanceError

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
            hourlyRate: worker.hourly_rate,
            attendance: attendance.map((a) => ({
              date: a.date,
              hoursWorked: Number(a.hours_worked),
              isWeeklyHoliday: a.is_weekly_holiday,
            })),
          },
          year,
          month
        )

        // 기존 급여 확인 (이미 생성된 경우 업데이트)
        const { data: existingPayroll } = await supabaseAdmin
          .from('payroll')
          .select('id')
          .eq('worker_id', worker.id)
          .eq('site_id', siteId)
          .eq('year', year)
          .eq('month', month)
          .single()

        let payroll
        const payrollPayload = {
          worker_id: worker.id,
          site_id: siteId,
          year,
          month,
          total_work_days: payrollData.totalWorkDays,
          total_hours: payrollData.totalHours,
          base_pay: payrollData.basePay,
          weekly_holiday_pay: payrollData.weeklyHolidayPay,
          overtime_pay: payrollData.overtimePay,
          total_pay: payrollData.totalPay,
          health_insurance: payrollData.healthInsurance,
          pension_insurance: payrollData.pensionInsurance,
          employment_insurance: payrollData.employmentInsurance,
          income_tax: payrollData.incomeTax,
          total_deduction: payrollData.totalDeduction,
          net_pay: payrollData.netPay,
        }

        if (existingPayroll) {
          // 업데이트
          const { data, error } = await supabaseAdmin
            .from('payroll')
            .update(payrollPayload)
            .eq('id', existingPayroll.id)
            .select()
            .single()

          if (error) throw error
          payroll = data
        } else {
          // 신규 생성
          const { data, error } = await supabaseAdmin
            .from('payroll')
            .insert(payrollPayload)
            .select()
            .single()

          if (error) throw error
          payroll = data
        }

        results.push({
          payrollId: payroll.id,
          workerId: worker.id,
          workerName: worker.name,
          totalPay: payroll.total_pay,
          netPay: payroll.net_pay,
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
