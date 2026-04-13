import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 일괄 처리 스키마
const batchSchema = z.object({
  payrollIds: z.array(z.string().uuid()).min(1, '최소 1개의 급여를 선택해야 합니다.'),
  action: z.enum(['approve', 'pay', 'delete']),
})

// POST /api/payroll/batch - 급여 일괄 처리
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payrollIds, action } = batchSchema.parse(body)

    let error, count

    switch (action) {
      case 'approve':
        // 승인 처리 (커스텀 필드 추가 필요 시)
        const approveResult = await supabaseAdmin
          .from('payroll')
          .update({
            // 승인 관련 필드 업데이트
            // approved_at: new Date().toISOString(),
          })
          .in('id', payrollIds)

        error = approveResult.error
        count = approveResult.count
        break

      case 'pay':
        // 지급 처리
        const payResult = await supabaseAdmin
          .from('payroll')
          .update({
            paid_at: new Date().toISOString(),
          })
          .in('id', payrollIds)
          .is('paid_at', null)

        error = payResult.error
        count = payResult.count
        break

      case 'delete':
        // 삭제
        const deleteResult = await supabaseAdmin
          .from('payroll')
          .delete()
          .in('id', payrollIds)
          .is('paid_at', null)

        error = deleteResult.error
        count = deleteResult.count
        break

      default:
        return NextResponse.json(
          { error: '지원하지 않는 작업입니다.' },
          { status: 400 }
        )
    }

    if (error) throw error

    return NextResponse.json({
      success: true,
      action,
      affected: count || 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in batch payroll operation:', error)
    return NextResponse.json(
      { error: '일괄 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
