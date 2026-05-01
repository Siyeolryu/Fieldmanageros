import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import prisma from '@/lib/prisma'
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

    // Type assertion needed due to Supabase type inference
    const record = attendance as {
      id: string
      worker_id: string
      site_id: string
      date: string
      hours_worked: number
      is_weekly_holiday: boolean
      notes: string | null
      created_at: string
      updated_at: string
      workers: { id: string; name: string } | null
      sites: { id: string; name: string } | null
    }

    return NextResponse.json({
      id: record.id,
      worker_id: record.worker_id,
      site_id: record.site_id,
      date: record.date,
      hours_worked: record.hours_worked,
      is_weekly_holiday: record.is_weekly_holiday,
      notes: record.notes,
      created_at: record.created_at,
      updated_at: record.updated_at,
      worker: record.workers,
      site: record.sites,
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

    // Update using Prisma
    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        ...(validatedData.hoursWorked !== undefined && { hoursWorked: validatedData.hoursWorked }),
        ...(validatedData.isWeeklyHoliday !== undefined && { isWeeklyHoliday: validatedData.isWeeklyHoliday }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      },
    })

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
