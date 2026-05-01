import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/payroll/[id]/approve - 급여 승인
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 승인 처리 (필요시 커스텀 필드 추가)
    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        // approvedAt: new Date(),
        // approvedBy: userId,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error approving payroll:', error)
    return NextResponse.json(
      { error: '급여 승인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
