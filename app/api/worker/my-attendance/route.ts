import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // 해당 월의 시작일과 종료일 계산
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    // 현재 사용자의 Profile에서 연결된 Worker 찾기
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        workers: {
          include: {
            attendance: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: { date: 'asc' },
            },
          },
        },
      },
    })

    if (!profile || profile.workers.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // 모든 Worker의 출근 기록 합치기
    const allAttendanceData = profile.workers.flatMap((worker) => worker.attendance)

    return NextResponse.json({ data: allAttendanceData })
  } catch (error: unknown) {
    console.error('Error fetching worker attendance:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
