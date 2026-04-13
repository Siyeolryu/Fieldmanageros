import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 출근 기록 등록 검증 스키마
const attendanceSchema = z.object({
  workerId: z.string().uuid('유효한 근로자 ID가 필요합니다.'),
  siteId: z.string().uuid('유효한 현장 ID가 필요합니다.'),
  date: z.string(),
  hoursWorked: z.number().min(0).max(24, '근무 시간은 0에서 24 사이여야 합니다.'),
  isWeeklyHoliday: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET /api/attendance - 출근 기록 조회 (현장, 근로자, 날짜 필터링)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const workerId = searchParams.get('workerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabaseAdmin
      .from('attendance')
      .select('*, workers(name)')
      .order('date', { ascending: false })

    if (siteId) query = query.eq('site_id', siteId)
    if (workerId) query = query.eq('worker_id', workerId)
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: attendance, error } = await query

    if (error) throw error

    // workers 필드를 worker로 변환 (호환성 유지)
    const formattedAttendance = attendance?.map(record => ({
      ...record,
      worker: record.workers,
      workers: undefined,
    }))

    return NextResponse.json(formattedAttendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: '출근 기록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - 출근 기록 등록 (단일 또는 일괄)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 배열인지 단일 객체인지 확인
    const isArray = Array.isArray(body)
    const records = isArray ? body : [body]

    const results = []

    for (const record of records) {
      const validatedData = attendanceSchema.parse(record)

      // Supabase upsert - unique constraint 기반 (worker_id, site_id, date)
      const { data: attendance, error } = await supabaseAdmin
        .from('attendance')
        .upsert({
          worker_id: validatedData.workerId,
          site_id: validatedData.siteId,
          date: validatedData.date,
          hours_worked: validatedData.hoursWorked,
          is_weekly_holiday: validatedData.isWeeklyHoliday,
          notes: validatedData.notes || null,
        }, {
          onConflict: 'worker_id,site_id,date'
        })
        .select()
        .single()

      if (error) throw error
      results.push(attendance)
    }

    return NextResponse.json(isArray ? results : results[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error processing attendance:', error)
    return NextResponse.json(
      { error: '출근 기록 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
