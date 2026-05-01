import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/payroll/[id]/pay - 급여 지급 처리
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const payroll = await prisma.payroll.findUnique({
      where: { id },
      select: {
        id: true,
        paidAt: true,
      },
    })

    if (!payroll) {
      return NextResponse.json(
        { error: '급여 명세를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (payroll.paidAt) {
      return NextResponse.json(
        { error: '이미 지급된 급여입니다.' },
        { status: 400 }
      )
    }

    // 지급 처리
    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        paidAt: new Date(),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            bankName: true,
            bankAccount: true,
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
    console.error('Error marking payroll as paid:', error)
    return NextResponse.json(
      { error: '급여 지급 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
