import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// 일괄 업로드 스키마
const bulkImportSchema = z.object({
  siteId: z.string().uuid(),
  records: z.array(
    z.object({
      workerId: z.string().uuid(),
      date: z.string(),
      hoursWorked: z.number().min(0).max(24),
      isWeeklyHoliday: z.boolean().default(false),
      notes: z.string().optional(),
    })
  ),
})

// POST /api/attendance/bulk-import - 출근 기록 일괄 업로드
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { siteId, records } = bulkImportSchema.parse(body)

    // 현장 존재 확인
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const results: unknown[] = []
    const errors: { workerId: string; date: string; error: string }[] = []

    for (const record of records) {
      try {
        const attendance = await prisma.attendance.upsert({
          where: {
            workerId_siteId_date: {
              workerId: record.workerId,
              siteId: siteId,
              date: new Date(record.date),
            },
          },
          update: {
            hoursWorked: record.hoursWorked,
            isWeeklyHoliday: record.isWeeklyHoliday,
            notes: record.notes || null,
          },
          create: {
            workerId: record.workerId,
            siteId: siteId,
            date: new Date(record.date),
            hoursWorked: record.hoursWorked,
            isWeeklyHoliday: record.isWeeklyHoliday,
            notes: record.notes || null,
          },
        })

        results.push(attendance)
      } catch (error) {
        errors.push({
          workerId: record.workerId,
          date: record.date,
          error: error instanceof Error ? error.message : '처리 중 오류 발생',
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: records.length,
        success: results.length,
        failed: errors.length,
      },
      results,
      errors,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { error: '일괄 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
