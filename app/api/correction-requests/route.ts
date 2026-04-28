import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List correction requests
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
    const siteId = searchParams.get('siteId')
    const status = searchParams.get('status') || 'pending'
    const requestedBy = searchParams.get('requestedBy') // For worker: only their requests

    const where: {
      status: string
      requestedBy?: string
      attendance?: {
        siteId: string
      }
    } = {
      status,
    }

    // If requestedBy is specified (worker viewing their own requests)
    if (requestedBy) {
      where.requestedBy = requestedBy
    } else if (siteId) {
      // Manager viewing all requests for a site
      where.attendance = {
        siteId,
      }
    }

    const requests = await prisma.correctionRequest.findMany({
      where,
      include: {
        attendance: {
          include: {
            worker: true,
            site: true,
          },
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error('Error fetching correction requests:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST - Create a new correction request
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
    const { attendanceId, requestedHours, requestedNotes, reason } = body

    if (!attendanceId || !reason) {
      return NextResponse.json(
        { error: 'attendanceId and reason are required' },
        { status: 400 }
      )
    }

    // Verify the attendance record exists
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    // Create the correction request
    const correctionRequest = await prisma.correctionRequest.create({
      data: {
        attendanceId,
        requestedBy: user.id,
        requestedHours,
        requestedNotes,
        reason,
        status: 'pending',
      },
      include: {
        attendance: {
          include: {
            worker: true,
            site: true,
          },
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ data: correctionRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating correction request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
