import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 수정 검증 스키마
const updateAttendanceSchema = z.object({
  hoursWorked: z.number().min(0).max(24).optional(),
  isWeeklyHoliday: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET /api/attendance/[id] - 단일 출근 기록 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, workers(id, name), sites(id, name)')
      .eq('id', id)
      .single()

    if (error || !attendance) {
      return NextResponse.json(
        { error: '출근 기록을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...attendance,
      worker: attendance.workers,
      site: attendance.sites,
      workers: undefined,
      sites: undefined,
    })
  } catch (error) {
    console.error('Error fetching attendance details:', error)
    return NextResponse.json(
      { error: '출근 기록 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/attendance/[id] - 출근 기록 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateAttendanceSchema.parse(body)

    const updateData: any = {}
    if (validatedData.hoursWorked !== undefined) updateData.hours_worked = validatedData.hoursWorked
    if (validatedData.isWeeklyHoliday !== undefined) updateData.is_weekly_holiday = validatedData.isWeeklyHoliday
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(attendance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: '출근 기록 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/attendance/[id] - 출근 기록 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: '출근 기록이 성공적으로 삭제되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: '출근 기록 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
