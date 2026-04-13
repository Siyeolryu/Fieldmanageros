import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// DELETE /api/attendance/range - 기간별 출근 기록 삭제
const deleteRangeSchema = z.object({
  siteId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  workerIds: z.array(z.string().uuid()).optional(),
})

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { siteId, startDate, endDate, workerIds } = deleteRangeSchema.parse(body)

    let query = supabaseAdmin
      .from('attendance')
      .delete()
      .eq('site_id', siteId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (workerIds && workerIds.length > 0) {
      query = query.in('worker_id', workerIds)
    }

    const { error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      deleted: count || 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error deleting attendance range:', error)
    return NextResponse.json(
      { error: '출근 기록 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
