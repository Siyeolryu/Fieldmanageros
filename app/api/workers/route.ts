import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 근로자 등록 검증 스키마
const workerSchema = z.object({
  siteId: z.string().uuid('유효한 현장 ID가 필요합니다.'),
  name: z.string().min(1, '이름은 필수입니다.'),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  hourlyRate: z.number().min(0, '시급은 0원 이상이어야 합니다.'),
  isActive: z.boolean().default(true),
})

// GET /api/workers - 근로자 목록 조회 (현장 ID 필터링 가능)
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
    const siteId = searchParams.get('siteId')

    // RLS가 자동으로 현재 사용자의 근로자만 필터링
    let query = supabase
      .from('workers')
      .select('*, sites(name)')
      .order('name', { ascending: true })

    if (siteId) {
      query = query.eq('site_id', siteId)
    }

    const { data: workers, error } = await query

    if (error) throw error

    return NextResponse.json(workers)
  } catch (error) {
    console.error('Error fetching workers:', error)
    return NextResponse.json(
      { error: '근로자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/workers - 신규 근로자 등록
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
    const validatedData = workerSchema.parse(body)

    // RLS 정책이 자동으로 현장 소유권을 검증
    const { data: worker, error } = await supabase
      .from('workers')
      .insert({
        site_id: validatedData.siteId,
        name: validatedData.name,
        phone: validatedData.phone || null,
        id_number: validatedData.idNumber || null,
        bank_name: validatedData.bankName || null,
        bank_account: validatedData.bankAccount || null,
        hourly_rate: validatedData.hourlyRate,
        is_active: validatedData.isActive,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(worker, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating worker:', error)
    return NextResponse.json(
      { error: '근로자 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
