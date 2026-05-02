import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/dashboard/risks - 리스크 분석
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자의 회사 조회
    const companies = await prisma.company.findMany({
      where: {
        ownerId: user.id,
      },
      select: {
        id: true,
      },
    })

    const companyIds = companies.map((c) => c.id)

    if (companyIds.length === 0) {
      return NextResponse.json({ risks: [] })
    }

    // Get all sites
    const sites = await prisma.site.findMany({
      where: {
        companyId: {
          in: companyIds,
        },
      },
      select: {
        id: true,
        isActive: true,
        endDate: true,
      },
    })

    const siteIds = sites.map((s) => s.id)

    if (siteIds.length === 0) {
      return NextResponse.json({ risks: [] })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    const thirtyDaysLater = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 리스크 분석 (최적화: 중복 쿼리 제거)
    const [
      unpaidPayrolls,
      recentAttendance,
      allActiveWorkers,
    ] = await Promise.all([
      // 미지급 급여
      prisma.payroll.count({
        where: {
          siteId: {
            in: siteIds,
          },
          paidAt: null,
        },
      }),

      // 최근 7일간 출근 기록 (한 번만 조회)
      prisma.attendance.findMany({
        where: {
          siteId: {
            in: siteIds,
          },
          date: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          workerId: true,
          hoursWorked: true,
        },
      }),

      // 활성 근로자 전체
      prisma.worker.findMany({
        where: {
          siteId: {
            in: siteIds,
          },
          isActive: true,
        },
        select: {
          id: true,
        },
      }),
    ])

    // 메모리에서 처리: 주 52시간 초과 및 출근 기록 분석
    const workerHoursMap = new Map<string, number>()
    const recentAttendanceWorkerIds = new Set<string>()

    recentAttendance.forEach((a) => {
      // 주 52시간 초과 체크용
      const current = workerHoursMap.get(a.workerId) || 0
      workerHoursMap.set(a.workerId, current + Number(a.hoursWorked))

      // 출근 기록 있는 근로자 추적
      recentAttendanceWorkerIds.add(a.workerId)
    })

    const excessiveWorkHours = Array.from(workerHoursMap.values()).filter((hours) => hours > 52)

    // 최근 7일간 출근 기록 없는 활성 근로자
    const allActiveWorkerIds = new Set(allActiveWorkers.map((w) => w.id))
    const missingAttendance = allActiveWorkerIds.size - recentAttendanceWorkerIds.size

    // 종료 예정 현장 (30일 이내)
    const inactiveSites = sites.filter((s) => {
      if (!s.isActive || !s.endDate) return false
      return s.endDate <= thirtyDaysLater && s.endDate >= today
    }).length

    const risks = [
      {
        type: 'unpaid_payroll',
        level: unpaidPayrolls > 10 ? 'high' : unpaidPayrolls > 5 ? 'medium' : 'low',
        count: unpaidPayrolls,
        message: `미지급 급여 ${unpaidPayrolls}건`,
      },
      {
        type: 'excessive_hours',
        level: excessiveWorkHours.length > 5 ? 'high' : excessiveWorkHours.length > 0 ? 'medium' : 'low',
        count: excessiveWorkHours.length,
        message: `주 52시간 초과 근무자 ${excessiveWorkHours.length}명`,
      },
      {
        type: 'missing_attendance',
        level: missingAttendance > 10 ? 'high' : missingAttendance > 3 ? 'medium' : 'low',
        count: missingAttendance,
        message: `7일간 출근 기록 없는 근로자 ${missingAttendance}명`,
      },
      {
        type: 'site_ending',
        level: inactiveSites > 5 ? 'high' : inactiveSites > 0 ? 'medium' : 'low',
        count: inactiveSites,
        message: `30일 내 종료 예정 현장 ${inactiveSites}개`,
      },
    ]

    return NextResponse.json({ risks })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json(
      { error: '리스크 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
