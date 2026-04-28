import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 수정 검증 스키마
const updateWorkerSchema = z.object({
  siteId: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/workers/[id] - 단일 근로자 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: worker, error } = await supabaseAdmin
      .from('workers')
      .select('*, sites(id, name)')
      .eq('id', id)
      .single()

    if (error || !worker) {
      return NextResponse.json(
        { error: '근로자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Get counts for attendance and payroll
    const [attendanceCount, payrollCount] = await Promise.all([
      supabaseAdmin
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', id),
      supabaseAdmin
        .from('payroll')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', id),
    ])

    return NextResponse.json({
      ...worker,
      site: worker.sites,
      sites: undefined,
      _count: {
        attendance: attendanceCount.count || 0,
        payroll: payrollCount.count || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching worker details:', error)
    return NextResponse.json(
      { error: '근로자 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/workers/[id] - 근로자 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateWorkerSchema.parse(body)

    const updateData: Record<string, string | number | boolean | null> = {}
    if (validatedData.siteId !== undefined) updateData.site_id = validatedData.siteId
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.idNumber !== undefined) updateData.id_number = validatedData.idNumber
    if (validatedData.bankName !== undefined) updateData.bank_name = validatedData.bankName
    if (validatedData.bankAccount !== undefined) updateData.bank_account = validatedData.bankAccount
    if (validatedData.hourlyRate !== undefined) updateData.hourly_rate = validatedData.hourlyRate
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive

    const { data: worker, error } = await supabaseAdmin
      .from('workers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(worker)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating worker:', error)
    return NextResponse.json(
      { error: '근로자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/workers/[id] - 근로자 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('workers')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: '근로자가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting worker:', error)
    return NextResponse.json(
      { error: '근로자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
