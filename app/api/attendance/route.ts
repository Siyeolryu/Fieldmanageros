import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// 출근 기록 등록 검증 스키마
const attendanceSchema = z.object({
  workerId: z.string().uuid('유효한 근로자 ID가 필요합니다.'),
  siteId: z.string().uuid('유효한 현장 ID가 필요합니다.'),
  date: z.string(),
  hoursWorked: z.number().min(0).max(24, '근무 시간은 0에서 24 사이여야 합니다.'),
  isWeeklyHoliday: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET /api/attendance - 출근 기록 조회 (현장, 근로자, 날짜 필터링)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const workerId = searchParams.get('workerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const attendance = await prisma.attendance.findMany({
      where: {
        ...(siteId && { siteId }),
        ...(workerId && { workerId }),
        ...(startDate && { date: { gte: new Date(startDate) } }),
        ...(endDate && { date: { lte: new Date(endDate) } }),
      },
      include: {
        worker: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: '출근 기록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - 출근 기록 등록 (단일 또는 일괄)
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 배열인지 단일 객체인지 확인
    const isArray = Array.isArray(body)
    const records = isArray ? body : [body]

    const results = []

    for (const record of records) {
      const validatedData = attendanceSchema.parse(record)

      // Prisma upsert - unique constraint 기반 (workerId, siteId, date)
      const attendance = await prisma.attendance.upsert({
        where: {
          workerId_siteId_date: {
            workerId: validatedData.workerId,
            siteId: validatedData.siteId,
            date: new Date(validatedData.date),
          },
        },
        update: {
          hoursWorked: validatedData.hoursWorked,
          isWeeklyHoliday: validatedData.isWeeklyHoliday,
          notes: validatedData.notes || null,
        },
        create: {
          workerId: validatedData.workerId,
          siteId: validatedData.siteId,
          date: new Date(validatedData.date),
          hoursWorked: validatedData.hoursWorked,
          isWeeklyHoliday: validatedData.isWeeklyHoliday,
          notes: validatedData.notes || null,
        },
      })

      results.push(attendance)
    }

    return NextResponse.json(isArray ? results : results[0], { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error processing attendance:', error)
    return NextResponse.json(
      { error: '출근 기록 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
