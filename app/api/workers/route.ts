import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
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

    // Prisma를 사용하여 근로자 조회 (RLS 대신 쿼리 레벨에서 권한 검증)
    const workers = await prisma.worker.findMany({
      where: siteId ? {
        siteId,
        site: {
          company: {
            ownerId: user.id // 현재 사용자가 소유한 회사의 현장만
          }
        }
      } : {
        site: {
          company: {
            ownerId: user.id
          }
        }
      },
      include: {
        site: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

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

    // 현장 소유권 검증
    const site = await prisma.site.findFirst({
      where: {
        id: validatedData.siteId,
        company: {
          ownerId: user.id
        }
      }
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장에 대한 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // Prisma를 사용하여 근로자 생성
    const worker = await prisma.worker.create({
      data: {
        siteId: validatedData.siteId,
        name: validatedData.name,
        phone: validatedData.phone,
        idNumber: validatedData.idNumber,
        bankName: validatedData.bankName,
        bankAccount: validatedData.bankAccount,
        hourlyRate: validatedData.hourlyRate,
        isActive: validatedData.isActive,
      },
      include: {
        site: {
          select: { name: true }
        }
      }
    })

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
