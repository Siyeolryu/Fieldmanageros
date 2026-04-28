import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 현장 등록 검증 스키마
const siteSchema = z.object({
  companyId: z.string().uuid('유효한 건설사 ID가 필요합니다.'),
  name: z.string().min(1, '현장명은 필수입니다.'),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
  includeMyself: z.boolean().default(false),
})

// GET /api/sites - 현장 목록 조회 (건설사 ID 필터링 가능)
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    // RLS가 자동으로 현재 사용자의 현장만 필터링
    let query = supabase
      .from('sites')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: sites, error: sitesError } = await query

    if (sitesError) throw sitesError

    // 각 현장의 근로자 수 조회
    const sitesWithCount = await Promise.all(
      (sites || []).map(async (site) => {
        const { count } = await supabase
          .from('workers')
          .select('*', { count: 'exact', head: true })
          .eq('site_id', site.id)

        return {
          ...site,
          company: site.companies,
          companies: undefined, // 원본 필드 제거
          _count: {
            workers: count || 0
          }
        }
      })
    )

    return NextResponse.json(sitesWithCount)
  } catch (error: unknown) {
    console.error('Error fetching sites:', error)
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      {
        error: '현장 목록을 불러오는 중 오류가 발생했습니다.',
        details: message
      },
      { status: 500 }
    )
  }
}

// POST /api/sites - 신규 현장 등록
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = siteSchema.parse(body)

    // RLS 정책이 자동으로 회사 소유권을 검증
    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        company_id: validatedData.companyId,
        name: validatedData.name,
        location: validatedData.location || null,
        start_date: validatedData.startDate || null,
        end_date: validatedData.endDate || null,
        is_active: validatedData.isActive,
      })
      .select()
      .single()

    if (error) throw error

    // Phase 4: 본인을 근로자로 포함하는 경우
    if (validatedData.includeMyself) {
      // 사용자 프로필 정보 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, user_type, hourly_rate, bank_name, bank_account')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw new Error('프로필 정보를 불러올 수 없습니다.')
      }

      // user_type이 'both' 또는 'worker'이고 hourly_rate가 있는 경우만 근로자 등록
      if ((profile.user_type === 'both' || profile.user_type === 'worker') && profile.hourly_rate) {
        const { error: workerError } = await supabase
          .from('workers')
          .insert({
            site_id: site.id,
            name: profile.full_name || '(이름 미입력)',
            profile_id: profile.id,
            is_owner: true,
            hourly_rate: profile.hourly_rate,
            bank_name: profile.bank_name || null,
            bank_account: profile.bank_account || null,
            is_active: true,
          })

        if (workerError) {
          console.error('Error creating worker:', workerError)
          // 근로자 등록 실패 시 경고만 하고 현장 생성은 성공으로 처리
          // (현장은 이미 생성되었으므로)
        }
      }
    }

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating site:', error)
    return NextResponse.json(
      { error: '현장 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
