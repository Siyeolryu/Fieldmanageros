import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 수정 검증 스키마
const updateSiteSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/sites/[id] - 단일 현장 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .select('*, companies(id, name)')
      .eq('id', id)
      .single()

    if (error || !site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Get counts for workers and attendance
    const [workersCount, attendanceCount] = await Promise.all([
      supabaseAdmin
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', id),
      supabaseAdmin
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', id),
    ])

    return NextResponse.json({
      ...site,
      company: site.companies,
      companies: undefined,
      _count: {
        workers: workersCount.count || 0,
        attendance: attendanceCount.count || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching site details:', error)
    return NextResponse.json(
      { error: '현장 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/sites/[id] - 현장 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateSiteSchema.parse(body)

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.startDate !== undefined) updateData.start_date = validatedData.startDate
    if (validatedData.endDate !== undefined) updateData.end_date = validatedData.endDate
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive

    const { data: site, error } = await supabaseAdmin
      .from('sites')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(site)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating site:', error)
    return NextResponse.json(
      { error: '현장 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/sites/[id] - 현장 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('sites')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: '현장이 성공적으로 삭제되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json(
      { error: '현장 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
