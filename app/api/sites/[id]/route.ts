import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
    const site = await prisma.site.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            workers: true,
            attendance: true,
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(site)
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

    const updateData: {
      name?: string
      location?: string
      startDate?: Date
      endDate?: Date
      isActive?: boolean
    } = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.location !== undefined) updateData.location = validatedData.location
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = new Date(validatedData.endDate)
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    const site = await prisma.site.update({
      where: { id },
      data: updateData,
    })

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
    await prisma.site.delete({
      where: { id },
    })

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
