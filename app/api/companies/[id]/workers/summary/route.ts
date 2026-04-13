import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/companies/[id]/workers/summary - 회사 소속 근로자 요약
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 회사 존재 확인
    const company = await prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      return NextResponse.json(
        { error: '회사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현장별 근로자 요약
    const sites = await prisma.site.findMany({
      where: { companyId: id },
      include: {
        _count: {
          select: {
            workers: true,
          },
        },
        workers: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            hourlyRate: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // 전체 요약
    const summary = {
      companyId: id,
      companyName: company.name,
      totalSites: sites.length,
      totalWorkers: sites.reduce((sum, site) => sum + site._count.workers, 0),
      activeWorkers: sites.reduce(
        (sum, site) => sum + site.workers.length,
        0
      ),
      sites: sites.map((site) => ({
        siteId: site.id,
        siteName: site.name,
        location: site.location,
        isActive: site.isActive,
        totalWorkers: site._count.workers,
        activeWorkers: site.workers.length,
        workers: site.workers,
        averageHourlyRate:
          site.workers.length > 0
            ? Math.round(
                site.workers.reduce((sum, w) => sum + w.hourlyRate, 0) /
                  site.workers.length
              )
            : 0,
      })),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching workers summary:', error)
    return NextResponse.json(
      { error: '근로자 요약을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
