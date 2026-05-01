import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { generatePayrollExcel } from '@/lib/excel/generator'

// GET /api/excel/download/payroll?siteId=xxx&year=2026&month=4
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    if (!siteId) {
      return NextResponse.json(
        { error: '현장 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 현장 정보 및 소유권 검증
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        company: {
          ownerId: user.id,
        },
      },
      select: {
        name: true,
      },
    })

    if (!site) {
      return NextResponse.json(
        { error: '현장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 급여 데이터 조회
    const payrolls = await prisma.payroll.findMany({
      where: {
        siteId,
        year,
        month,
      },
      include: {
        worker: {
          select: {
            name: true,
            hourlyRate: true,
            bankName: true,
            bankAccount: true,
          },
        },
      },
    })

    if (!payrolls || payrolls.length === 0) {
      return NextResponse.json(
        { error: '급여 데이터가 없습니다.' },
        { status: 404 }
      )
    }

    // 엑셀 생성
    const excelBuffer = generatePayrollExcel(
      payrolls.map((p) => ({
        workerName: p.worker.name,
        hourlyRate: p.worker.hourlyRate,
        totalWorkDays: p.totalWorkDays || 0,
        totalHours: Number(p.totalHours || 0),
        basePay: p.basePay || 0,
        weeklyHolidayPay: p.weeklyHolidayPay || 0,
        overtimePay: p.overtimePay || 0,
        totalPay: p.totalPay || 0,
        healthInsurance: p.healthInsurance || 0,
        pensionInsurance: p.pensionInsurance || 0,
        employmentInsurance: p.employmentInsurance || 0,
        incomeTax: p.incomeTax || 0,
        totalDeduction: p.totalDeduction || 0,
        netPay: p.netPay || 0,
        bankName: p.worker.bankName || undefined,
        bankAccount: p.worker.bankAccount || undefined,
      })),
      year,
      month
    )

    // 파일명 생성
    const filename = `급여명세서_${site.name}_${year}년${month}월.xlsx`

    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading payroll Excel:', error)
    return NextResponse.json(
      { error: '급여명세서 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
