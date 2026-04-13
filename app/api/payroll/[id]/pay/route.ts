import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

// PUT /api/payroll/[id]/pay - 급여 지급 처리
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: payroll, error: findError } = await supabaseAdmin
      .from('payroll')
      .select('id, paid_at')
      .eq('id', id)
      .single()

    if (findError || !payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (payroll.paid_at) {
      return NextResponse.json(
        { error: '이미 지급된 급여입니다.' },
        { status: 400 }
      )
    }

    // 지급 처리
    const { data: updated, error } = await supabaseAdmin
      .from('payroll')
      .update({
        paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, workers(id, name, bank_name, bank_account), sites(id, name)')
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
    console.error('Error marking payroll as paid:', error)
    return NextResponse.json(
      { error: '급여 지급 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
