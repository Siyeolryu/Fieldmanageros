import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateLedgerTemplateExcel } from '@/lib/excel/generator'

/**
 * GET /api/excel/template?type=ledger&year=2026&month=5
 * 노임대장 업로드용 서식 파일을 동적으로 생성하여 다운로드
 */
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
    const type = searchParams.get('type') || 'ledger'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // 유효성 검사
    if (type !== 'ledger') {
      return NextResponse.json(
        { error: '지원하지 않는 서식 타입입니다. (지원: ledger)' },
        { status: 400 }
      )
    }

    if (isNaN(year) || year < 2020 || year > 2030) {
      return NextResponse.json(
        { error: '유효하지 않은 연도입니다.' },
        { status: 400 }
      )
    }

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: '유효하지 않은 월입니다.' },
        { status: 400 }
      )
    }

    // 서식 파일 동적 생성 (Uint8Array 반환)
    const excelBuffer = generateLedgerTemplateExcel(year, month)

    // 파일명
    const filename = `노임대장_업로드서식_${year}년${month}월.xlsx`

    // Blob으로 변환하여 Response 생성
    // @ts-expect-error - Uint8Array type compatibility with BlobPart
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating Excel template:', error)
    return NextResponse.json(
      { error: '서식 파일 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
