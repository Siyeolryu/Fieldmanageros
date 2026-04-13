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
  } catch (error: any) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      {
        error: '현장 목록을 불러오는 중 오류가 발생했습니다.',
        details: error.message
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
