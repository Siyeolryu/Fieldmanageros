import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 프로필이 없으면 생성
      const existingProfile = await prisma.profile.findUnique({
        where: { id: data.user.id },
        select: { id: true },
      })

      if (!existingProfile && data.user.email) {
        await prisma.profile.create({
          data: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || data.user.email.split('@')[0] || '사용자',
          },
        })
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
