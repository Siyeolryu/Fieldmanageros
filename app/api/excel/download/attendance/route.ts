import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { generateAttendanceExcel } from '@/lib/excel/generator'

// GET /api/excel/download/attendance?siteId=xxx&year=2026&month=4
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    if (!siteId) {
      return NextResponse.json(
        { error: '현장 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 현장 정보 및 소유권 검증
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        company: {
          ownerId: user.id,
        },
      },
      select: {
        name: true,
      },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // 출근 데이터 조회
    const attendance = await prisma.attendance.findMany({
      where: {
        siteId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        worker: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    if (!attendance || attendance.length === 0) {
      return NextResponse.json(
        { error: '출근 데이터가 없습니다.' },
        { status: 404 }
      )
    }

    // 엑셀 생성
    const excelBuffer = generateAttendanceExcel(
      attendance.map((a) => ({
        workerName: a.worker.name,
        date: new Date(a.date),
        hoursWorked: Number(a.hoursWorked),
        isWeeklyHoliday: a.isWeeklyHoliday,
        notes: a.notes || undefined,
      })),
      year,
      month
    )

    // 파일명 생성
    const filename = `출근부_${site.name}_${year}년${month}월.xlsx`

    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading attendance Excel:', error)
    return NextResponse.json(
      { error: '출근부 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
