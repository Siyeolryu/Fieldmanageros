import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface GuestCompany {
  id: string
  name: string
  businessNumber?: string
  phone?: string
  address?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

interface GuestSite {
  id: string
  companyId: string
  name: string
  location?: string
  startDate?: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface GuestWorker {
  id: string
  siteId: string
  name: string
  phone?: string
  idNumber?: string
  bankName?: string
  bankAccount?: string
  hourlyRate: number
  profileId?: string
  isOwner: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface GuestAttendance {
  id: string
  workerId: string
  siteId: string
  date: Date
  hoursWorked: number
  isWeeklyHoliday: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface GuestData {
  companies: GuestCompany[]
  sites: GuestSite[]
  workers: GuestWorker[]
  attendance: GuestAttendance[]
}

// POST /api/guest/migrate - 게스트 모드 데이터를 실제 DB로 마이그레이션
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const guestData: GuestData = body.guestData

    if (!guestData || !guestData.companies) {
      return NextResponse.json({ error: 'No guest data provided' }, { status: 400 })
    }

    // ID 매핑 (게스트 ID → 실제 DB ID)
    const companyIdMap = new Map<string, string>()
    const siteIdMap = new Map<string, string>()
    const workerIdMap = new Map<string, string>()

    // 1. Companies 마이그레이션
    for (const guestCompany of guestData.companies) {
      const newCompany = await prisma.company.create({
        data: {
          name: guestCompany.name,
          businessNumber: guestCompany.businessNumber,
          phone: guestCompany.phone,
          address: guestCompany.address,
          ownerId: user.id,
        },
      })
      companyIdMap.set(guestCompany.id, newCompany.id)
    }

    // 2. Sites 마이그레이션
    for (const guestSite of guestData.sites) {
      const realCompanyId = companyIdMap.get(guestSite.companyId)
      if (!realCompanyId) continue

      const newSite = await prisma.site.create({
        data: {
          companyId: realCompanyId,
          name: guestSite.name,
          location: guestSite.location,
          startDate: guestSite.startDate ? new Date(guestSite.startDate) : null,
          endDate: guestSite.endDate ? new Date(guestSite.endDate) : null,
          isActive: guestSite.isActive,
        },
      })
      siteIdMap.set(guestSite.id, newSite.id)
    }

    // 3. Workers 마이그레이션
    for (const guestWorker of guestData.workers) {
      const realSiteId = siteIdMap.get(guestWorker.siteId)
      if (!realSiteId) continue

      const newWorker = await prisma.worker.create({
        data: {
          siteId: realSiteId,
          name: guestWorker.name,
          phone: guestWorker.phone,
          idNumber: guestWorker.idNumber,
          bankName: guestWorker.bankName,
          bankAccount: guestWorker.bankAccount,
          hourlyRate: guestWorker.hourlyRate,
          isOwner: guestWorker.isOwner,
          isActive: guestWorker.isActive,
        },
      })
      workerIdMap.set(guestWorker.id, newWorker.id)
    }

    // 4. Attendance 마이그레이션
    for (const guestAttendance of guestData.attendance) {
      const realWorkerId = workerIdMap.get(guestAttendance.workerId)
      const realSiteId = siteIdMap.get(guestAttendance.siteId)
      if (!realWorkerId || !realSiteId) continue

      // 중복 체크 (workerId + siteId + date)
      const existing = await prisma.attendance.findFirst({
        where: {
          workerId: realWorkerId,
          siteId: realSiteId,
          date: new Date(guestAttendance.date),
        },
      })

      if (existing) continue

      await prisma.attendance.create({
        data: {
          workerId: realWorkerId,
          siteId: realSiteId,
          date: new Date(guestAttendance.date),
          hoursWorked: guestAttendance.hoursWorked,
          isWeeklyHoliday: guestAttendance.isWeeklyHoliday,
          notes: guestAttendance.notes,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '게스트 데이터가 성공적으로 마이그레이션되었습니다.',
      migrated: {
        companies: companyIdMap.size,
        sites: siteIdMap.size,
        workers: workerIdMap.size,
        attendance: guestData.attendance.length,
      },
    })
  } catch (error) {
    console.error('Error migrating guest data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
