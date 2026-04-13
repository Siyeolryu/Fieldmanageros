import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

// PUT /api/payroll/[id]/approve - 급여 승인
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: payroll, error: findError } = await supabaseAdmin
      .from('payroll')
      .select('id')
      .eq('id', id)
      .single()

    if (findError || !payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 승인 처리 (필요시 커스텀 필드 추가)
    const { data: updated, error } = await supabaseAdmin
      .from('payroll')
      .update({
        // approved_at: new Date().toISOString(),
        // approved_by: userId,
      })
      .eq('id', id)
      .select('*, workers(id, name), sites(id, name)')
      .single()

    if (error) throw error

    return NextResponse.json({
      ...updated,
      worker: updated.workers,
      site: updated.sites,
      workers: undefined,
      sites: undefined,
    })
  } catch (error) {
    console.error('Error approving payroll:', error)
    return NextResponse.json(
      { error: '급여 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
