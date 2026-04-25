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

    // 현재 사용자의 Profile에서 연결된 Worker 찾기
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        workers: {
          include: {
            payroll: {
              where: {
                year,
                month,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!profile || profile.workers.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // 모든 Worker의 급여 데이터 합치기
    const allPayrollData = profile.workers.flatMap((worker) => worker.payroll)

    return NextResponse.json({ data: allPayrollData })
  } catch (error: any) {
    console.error('Error fetching worker payroll:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
