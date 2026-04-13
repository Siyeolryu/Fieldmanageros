import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { z } from 'zod'

// 수정 검증 스키마
const updateCompanySchema = z.object({
  name: z.string().min(1, '회사명은 최소 1자 이상이어야 합니다.').optional(),
  businessNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// GET /api/companies/[id] - 단일 건설사 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .select('*, sites(id, name, location, is_active)')
      .eq('id', id)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: '건설사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company details:', error)
    return NextResponse.json(
      { error: '건설사 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/companies/[id] - 건설사 정보 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.businessNumber !== undefined) updateData.business_number = validatedData.businessNumber
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.address !== undefined) updateData.address = validatedData.address

    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(company)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 입력 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: '건설사 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id] - 건설사 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      { message: '건설사가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: '건설사 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
