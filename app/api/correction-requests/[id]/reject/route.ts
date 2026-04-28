import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Reject correction request
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
        status: 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNotes,
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
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error: unknown) {
    console.error('Error rejecting correction request:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
