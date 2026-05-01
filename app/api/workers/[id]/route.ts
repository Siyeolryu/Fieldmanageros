import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendance: true,
            payroll: true,
          },
        },
      },
    })

    if (!worker) {
      return NextResponse.json(
        { error: '근로자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(worker)
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

    const updateData: {
      siteId?: string
      name?: string
      phone?: string
      idNumber?: string
      bankName?: string
      bankAccount?: string
      hourlyRate?: number
      isActive?: boolean
    } = {}

    if (validatedData.siteId !== undefined) updateData.siteId = validatedData.siteId
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.idNumber !== undefined) updateData.idNumber = validatedData.idNumber
    if (validatedData.bankName !== undefined) updateData.bankName = validatedData.bankName
    if (validatedData.bankAccount !== undefined) updateData.bankAccount = validatedData.bankAccount
    if (validatedData.hourlyRate !== undefined) updateData.hourlyRate = validatedData.hourlyRate
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    const worker = await prisma.worker.update({
      where: { id },
      data: updateData,
    })

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
    await prisma.worker.delete({
      where: { id },
    })

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
