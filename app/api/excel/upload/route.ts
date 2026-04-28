import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { parseAttendanceExcel, parseWorkersExcel, parsePayrollLedgerExcel } from '@/lib/excel/parser'

// POST /api/excel/upload - 엑셀 파일 업로드 및 파싱
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const siteId = formData.get('siteId') as string
    const type = formData.get('type') as 'attendance' | 'workers' | 'ledger'

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    if (!siteId) {
      return NextResponse.json(
        { error: '현장 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let result: {
      type: string
      total?: number
      saved?: number
      failed?: number
      errors?: unknown[]
      workers?: {
        total: number
        saved: number
        failed: number
        errors: unknown[]
      }
      attendance?: {
        total: number
        saved: number
        failed: number
        errors: unknown[]
      }
    }

    switch (type) {
      case 'attendance': {
        // 출근 데이터 파싱
        const attendanceData = parseAttendanceExcel(buffer)

        // 근로자 이름으로 ID 매핑 - RLS가 자동으로 소유권 검증
        const workerNames = [...new Set(attendanceData.map((a) => a.workerName))]
        const { data: workers } = await supabase
          .from('workers')
          .select('id, name')
          .eq('site_id', siteId)
          .in('name', workerNames)

        const workerMap = new Map((workers || []).map((w) => [w.name, w.id]))

        // 데이터베이스에 저장
        const saved = []
        const errors = []

        for (const record of attendanceData) {
          const workerId = workerMap.get(record.workerName)

          if (!workerId) {
            errors.push({
              workerName: record.workerName,
              error: '근로자를 찾을 수 없습니다.',
            })
            continue
          }

          try {
            // Supabase upsert 사용 - RLS가 자동으로 소유권 검증
            const { data: attendance, error: upsertError } = await supabase
              .from('attendance')
              .upsert({
                worker_id: workerId,
                site_id: siteId,
                date: record.date.toISOString().split('T')[0],
                hours_worked: record.hoursWorked,
                is_weekly_holiday: record.isWeeklyHoliday,
                notes: record.notes,
              }, {
                onConflict: 'worker_id,site_id,date'
              })
              .select()
              .single()

            if (upsertError) throw upsertError
            saved.push(attendance)
          } catch (error) {
            errors.push({
              workerName: record.workerName,
              date: record.date.toISOString().split('T')[0],
              error: error instanceof Error ? error.message : '저장 실패',
            })
          }
        }

        result = {
          type: 'attendance',
          total: attendanceData.length,
          saved: saved.length,
          failed: errors.length,
          errors,
        }
        break
      }

      case 'workers': {
        // 근로자 데이터 파싱
        const workersData = parseWorkersExcel(buffer)

        const saved = []
        const errors = []

        for (const worker of workersData) {
          try {
            // RLS가 자동으로 소유권 검증
            const { data: created, error: createError } = await supabase
              .from('workers')
              .insert({
                site_id: siteId,
                name: worker.name,
                phone: worker.phone,
                id_number: worker.idNumber,
                bank_name: worker.bankName,
                bank_account: worker.bankAccount,
                hourly_rate: worker.hourlyRate,
                is_active: true,
              })
              .select()
              .single()

            if (createError) throw createError
            saved.push(created)
          } catch (error) {
            errors.push({
              workerName: worker.name,
              error: error instanceof Error ? error.message : '저장 실패',
            })
          }
        }

        result = {
          type: 'workers',
          total: workersData.length,
          saved: saved.length,
          failed: errors.length,
          errors,
        }
        break
      }

      case 'ledger': {
        // 노임대장 통합 파싱
        const { workers: workersData, attendance: attendanceData } = parsePayrollLedgerExcel(buffer)

        // 근로자 먼저 저장
        const workerMap = new Map<string, string>()
        const workerErrors = []

        for (const worker of workersData) {
          try {
            // 기존 근로자 확인 - RLS가 자동으로 소유권 검증
            const { data: existing } = await supabase
              .from('workers')
              .select('id')
              .eq('site_id', siteId)
              .eq('name', worker.name)
              .single()

            if (existing) {
              workerMap.set(worker.name, existing.id)
            } else {
              // 새 근로자 생성 - RLS가 자동으로 소유권 검증
              const { data: created, error: createError } = await supabase
                .from('workers')
                .insert({
                  site_id: siteId,
                  name: worker.name,
                  phone: worker.phone,
                  id_number: worker.idNumber,
                  bank_name: worker.bankName,
                  bank_account: worker.bankAccount,
                  hourly_rate: worker.hourlyRate,
                  is_active: true,
                })
                .select()
                .single()

              if (createError) throw createError
              workerMap.set(worker.name, created.id)
            }
          } catch (error) {
            workerErrors.push({
              workerName: worker.name,
              error: error instanceof Error ? error.message : '저장 실패',
            })
          }
        }

        // 출근 데이터 저장
        const savedAttendance = []
        const attendanceErrors = []

        for (const record of attendanceData) {
          const workerId = workerMap.get(record.workerName)

          if (!workerId) {
            attendanceErrors.push({
              workerName: record.workerName,
              error: '근로자 ID를 찾을 수 없습니다.',
            })
            continue
          }

          try {
            // RLS가 자동으로 소유권 검증
            const { data: attendance, error: upsertError } = await supabase
              .from('attendance')
              .upsert({
                worker_id: workerId,
                site_id: siteId,
                date: record.date.toISOString().split('T')[0],
                hours_worked: record.hoursWorked,
                is_weekly_holiday: record.isWeeklyHoliday,
              }, {
                onConflict: 'worker_id,site_id,date'
              })
              .select()
              .single()

            if (upsertError) throw upsertError
            savedAttendance.push(attendance)
          } catch (error) {
            attendanceErrors.push({
              workerName: record.workerName,
              date: record.date.toISOString().split('T')[0],
              error: error instanceof Error ? error.message : '저장 실패',
            })
          }
        }

        result = {
          type: 'ledger',
          workers: {
            total: workersData.length,
            saved: workerMap.size,
            failed: workerErrors.length,
            errors: workerErrors,
          },
          attendance: {
            total: attendanceData.length,
            saved: savedAttendance.length,
            failed: attendanceErrors.length,
            errors: attendanceErrors,
          },
        }
        break
      }

      default:
        return NextResponse.json(
          { error: '지원하지 않는 파일 형식입니다.' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Error uploading Excel:', error)
    return NextResponse.json(
      { error: '엑셀 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
