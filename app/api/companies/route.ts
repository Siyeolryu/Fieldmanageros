import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { validateBusinessNumber, validatePhoneNumber } from '@/lib/utils/validation'

// 건설사 등록 검증 스키마
const companySchema = z.object({
  name: z.string().min(1, '회사명은 필수입니다.'),
  businessNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateBusinessNumber(val),
      '유효하지 않은 사업자번호입니다.'
    ),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || validatePhoneNumber(val),
      '유효하지 않은 전화번호입니다.'
    ),
  address: z.string().optional(),
})

// GET /api/companies - 건설사 목록 조회
export async function GET() {
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

    // RLS가 자동으로 현재 사용자의 회사만 필터링
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (companiesError) throw companiesError

    // 각 건설사의 현장 개수 조회
    const companiesWithCount = await Promise.all(
      (companies || []).map(async (company) => {
        const { count } = await supabase
          .from('sites')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.id)

        return {
          ...company,
          _count: {
            sites: count || 0
          }
        }
      })
    )

    return NextResponse.json(companiesWithCount)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: '건설사 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/companies - 신규 건설사 등록
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
    const validatedData = companySchema.parse(body)

    // RLS 정책이 자동으로 owner_id를 검증
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name: validatedData.name,
        business_number: validatedData.businessNumber || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        owner_id: user.id, // 인증된 사용자 ID 사용
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: '건설사 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
