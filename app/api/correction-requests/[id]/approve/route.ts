import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Approve correction request and apply changes
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { reviewNotes } = body

    // Find the correction request
    const correctionRequest = await prisma.correctionRequest.findUnique({
      where: { id },
      include: {
        attendance: true,
      },
    })

    if (!correctionRequest) {
      return NextResponse.json({ error: 'Correction request not found' }, { status: 404 })
    }

    if (correctionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Correction request has already been reviewed' },
        { status: 400 }
      )
    }

    // Update the correction request status
    const updated = await prisma.correctionRequest.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
      include: {
        attendance: true,
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
    })

    // Apply the changes to the attendance record
    const updateData: any = {}
    if (correctionRequest.requestedHours !== null) {
      updateData.hoursWorked = correctionRequest.requestedHours
    }
    if (correctionRequest.requestedNotes !== null) {
      updateData.notes = correctionRequest.requestedNotes
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.attendance.update({
        where: { id: correctionRequest.attendanceId },
        data: updateData,
      })
    }

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error('Error approving correction request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
