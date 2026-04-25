import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - Delete/cancel a pending correction request
export async function DELETE(
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

    // Find the correction request
    const correctionRequest = await prisma.correctionRequest.findUnique({
      where: { id },
    })

    if (!correctionRequest) {
      return NextResponse.json({ error: 'Correction request not found' }, { status: 404 })
    }

    // Only allow deletion of pending requests by the requester
    if (correctionRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending requests' },
        { status: 400 }
      )
    }

    if (correctionRequest.requestedBy !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own requests' },
        { status: 403 }
      )
    }

    // Delete the request
    await prisma.correctionRequest.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting correction request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
