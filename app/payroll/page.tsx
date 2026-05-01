'use client'

import React, { useState, useEffect } from 'react'
import { useAppStore, useAuthStore } from '@/lib/store'
import SiteSelector from '@/app/components/ui/SiteSelector'
import Button from '@/app/components/ui/Button'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import Modal from '@/app/components/ui/Modal'
import ExcelUploadModal from '@/app/components/excel/ExcelUploadModal'

export default function PayrollPage() {
  // --- Helpers & Utilities ---
  const maskIdNumber = (idNum: string | null) => {
    if (!idNum) return '-';
    // 숫자만 추출
    const clean = idNum.replace(/[^0-9]/g, '');
    if (clean.length >= 7) {
      // 900101-1****** 형태
      return `${clean.slice(0, 6)}-${clean.charAt(6)}******`;
    }
    return idNum;
  };

  interface PayrollRecord {
    id: string
    workerId: string
    siteId: string
    year: number
    month: number
    worker?: {
      name: string
      idNumber: string
      hourlyRate: number
    }
    totalWorkDays: number
    totalHours: number
    basePay: number
    overtimePay: number
    weeklyHolidayPay: number
    totalPay: number
    healthInsurance: number
    pensionInsurance: number
    employmentInsurance: number
    incomeTax: number
    totalDeduction: number
    netPay: number
  }

  const exportToExcel = (siteName: string, y: number, m: number, data: PayrollRecord[]) => {
    if (!data.length) return
    const wsData = [
      [`${y}년 ${m}월 노임대장 - ${siteName}`],
      [],
      ['성명', '주민등록번호', '공수', '기본급', '연장수당', '주휴수당', '지급총액', '공제계', '차인지급액']
    ]
    data.forEach(p => wsData.push([
      p.worker?.name || '-',
      maskIdNumber(p.worker?.idNumber || null),
      (Number(p.totalHours || 0) / 8).toFixed(1),
      (p.basePay || 0).toLocaleString(),
      (p.overtimePay || 0).toLocaleString(),
      (p.weeklyHolidayPay || 0).toLocaleString(),
      (p.totalPay || 0).toLocaleString(),
      (p.totalDeduction || 0).toLocaleString(),
      (p.netPay || 0).toLocaleString()
    ]))
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }]
    
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, `${siteName}_노임대장_${y}_${m}.xlsx`)
  }

  const { selectedSite } = useAppStore()
  const { user } = useAuthStore()
  
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [weeklyHolidayMap, setWeeklyHolidayMap] = useState<Record<string, number>>({})
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])

  // 명세서 모달용 상태
  const [isStubModalOpen, setIsStubModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)

  // Excel 업로드 모달용 상태
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)

  const fetchPayrolls = async () => {
    if (!selectedSite) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/payroll?siteId=${selectedSite.id}&year=${year}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setPayrolls(data)
        const newMap: Record<string, number> = {}
        data.forEach((p: PayrollRecord) => {
            const count = p.weeklyHolidayPay / ((p.worker?.hourlyRate || 1) * 8) || 0
            newMap[p.workerId] = count
        })
        setWeeklyHolidayMap(newMap)
      }
    } catch (error) {
      console.error('Failed to fetch payrolls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrolls()
  }, [selectedSite, year, month])

  const handleRecommendWeeklyHoliday = () => {
    const newMap = { ...weeklyHolidayMap }
    let count = 0
    payrolls.forEach((p: PayrollRecord) => {
        if (p.totalWorkDays >= 5) {
            newMap[p.workerId] = 1.0
            count++
        }
    })
    setWeeklyHolidayMap(newMap)
    alert(`${count}명의 대상자에게 주휴수당(1.0)을 추천 적용했습니다. '정산하기'를 눌러 저장하세요.`)
  }

  const handleGenerate = async (workerId?: string) => {
    if (!selectedSite) return
    const isBulk = !workerId
    if (isBulk) setIsGenerating(true)
    try {
      const idsToProcess = workerId ? [workerId] : selectedWorkerIds.length > 0 ? selectedWorkerIds : payrolls.map(p => p.workerId)
      
      const promises = idsToProcess.map(id => 
        fetch('/api/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: id,
            siteId: selectedSite.id,
            year,
            month,
            weeklyHolidayCount: weeklyHolidayMap[id] || 0
          })
        })
      )
      await Promise.all(promises)
      fetchPayrolls()
      if (isBulk) alert('정산이 완료되었습니다.')
    } catch {
      alert('정산 중 오류가 발생했습니다.')
    } finally {
      if (isBulk) setIsGenerating(false)
    }
  }

  const totals = payrolls.reduce((acc, curr) => ({
    totalPay: acc.totalPay + (curr.totalPay || 0),
    netPay: acc.netPay + (curr.netPay || 0),
    count: acc.count + 1
  }), { totalPay: 0, netPay: 0, count: 0 })

  const handleShowStub = (record: PayrollRecord) => {
    setSelectedRecord(record)
    setIsStubModalOpen(true)
  }

  const handleExcelSuccess = () => {
    fetchPayrolls() // 업로드 후 급여 데이터 새로고침
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-blue-600 tracking-tight">노무PRO</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">대시보드</Link>
              <Link href="/workers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">근로자 관리</Link>
              <Link href="/payroll" className="text-sm font-bold text-gray-900 border-b-2 border-blue-600 pb-1">노임대장</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <SiteSelector />
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
               <span className="text-xs font-bold text-gray-600">{user?.fullName?.[0] || 'U'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">노임대장 및 급여 정산</h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none">
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-transparent font-bold text-blue-600 outline-none">
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                </div>
                <p className="text-sm text-gray-500 font-medium">현장: {selectedSite?.name || '선택 필요'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleRecommendWeeklyHoliday} className="text-blue-600 font-bold border-blue-100 hover:bg-blue-50">
                주휴수당 추천 적용
            </Button>
            <Button variant="outline" onClick={() => setIsExcelModalOpen(true)} disabled={!selectedSite} className="gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Excel 업로드
            </Button>
            <Button variant="outline" onClick={() => exportToExcel(selectedSite?.name || '현장', year, month, payrolls)} disabled={payrolls.length === 0} className="gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                엑셀 다운로드
            </Button>
            <Button onClick={() => handleGenerate()} isLoading={isGenerating} disabled={!selectedSite} className="shadow-lg shadow-blue-100 gap-2">
                정산 저장하기
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">정산 인원</p>
                <p className="text-2xl font-black text-gray-900">{totals.count}명</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">총 지급액(세전)</p>
                <p className="text-2xl font-black text-gray-900">₩{totals.totalPay.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-blue-600 rounded-3xl shadow-lg shadow-blue-100 text-white">
                <p className="text-xs font-bold text-blue-100 mb-1 tracking-wider uppercase">실지급 합계(세후)</p>
                <p className="text-2xl font-black">₩{totals.netPay.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 w-10">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                checked={selectedWorkerIds.length === payrolls.length && payrolls.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedWorkerIds(payrolls.map(p => p.workerId))
                                    else setSelectedWorkerIds([])
                                }}
                            />
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">근로자</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">주휴수당 선택</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">실지급액</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                        <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400">데이터를 불러오고 있습니다...</td></tr>
                    ) : payrolls.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                    checked={selectedWorkerIds.includes(p.workerId)}
                                    onChange={() => {
                                        setSelectedWorkerIds(prev => 
                                            prev.includes(p.workerId) ? prev.filter(id => id !== p.workerId) : [...prev, p.workerId]
                                        )
                                    }}
                                />
                            </td>
                            <td className="px-6 py-5">
                                <p className="font-black text-gray-900">{p.worker?.name || '-'}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{maskIdNumber(p.worker?.idNumber || null)}</p>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <select 
                                        value={weeklyHolidayMap[p.workerId] || 0}
                                        onChange={(e) => {
                                            const val = Number(e.target.value)
                                            setWeeklyHolidayMap(prev => ({ ...prev, [p.workerId]: val }))
                                        }}
                                        className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 outline-none"
                                    >
                                        <option value={0}>지급 안함</option>
                                        <option value={1}>1.0 공수 추가</option>
                                        <option value={2}>2.0 공수 추가</option>
                                        <option value={0.5}>0.5 공수 추가</option>
                                    </select>
                                    <button 
                                        onClick={() => handleGenerate(p.workerId)}
                                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                                        title="적용 및 재계산"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right font-black text-blue-600">
                                ₩{p.netPay?.toLocaleString()}
                            </td>
                            <td className="px-6 py-5 text-center">
                                <Button variant="ghost" size="sm" onClick={() => handleShowStub(p)} className="text-xs h-8 min-h-0 text-blue-600 font-bold">명세서 보기</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </main>

      {/* 급여 명세서 모달 */}
      <Modal
        isOpen={isStubModalOpen}
        onClose={() => setIsStubModalOpen(false)}
        title="급여 명세서 (Pay Stub)"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div id="pay-stub-content" className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-blue-600 mb-1">급여 명세서</h3>
                  <p className="text-sm text-gray-400 font-bold">{selectedRecord.year}년 {selectedRecord.month}월분</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">{selectedRecord.worker?.name || '-'}</p>
                  <p className="text-xs text-gray-500 font-bold">{maskIdNumber(selectedRecord.worker?.idNumber || null)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-gray-50 py-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">지급 내역 (Earnings)</p>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">기본급</span><span className="font-bold text-gray-900">₩{selectedRecord.basePay.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">연장수당</span><span className="font-bold text-gray-900">₩{selectedRecord.overtimePay.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">주휴수당</span><span className="font-bold text-gray-900">₩{selectedRecord.weeklyHolidayPay.toLocaleString()}</span></div>
                  <div className="pt-2 border-t border-gray-50 flex justify-between font-black text-blue-600"><p>지급액 총계</p><p>₩{selectedRecord.totalPay.toLocaleString()}</p></div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">공제 내역 (Deductions)</p>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">건강보험/장기요양</span><span className="font-bold text-gray-900">₩{selectedRecord.healthInsurance.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">국민연금</span><span className="font-bold text-gray-900">₩{selectedRecord.pensionInsurance.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">고용보험</span><span className="font-bold text-gray-900">₩{selectedRecord.employmentInsurance.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">소득세/지방세</span><span className="font-bold text-gray-900">₩{selectedRecord.incomeTax.toLocaleString()}</span></div>
                  <div className="pt-2 border-t border-gray-50 flex justify-between font-black text-rose-500"><p>공제액 총계</p><p>₩{selectedRecord.totalDeduction.toLocaleString()}</p></div>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-2xl flex justify-between items-center text-white">
                <p className="text-lg font-black tracking-tight">실제 수령액 (Net Pay)</p>
                <p className="text-3xl font-black">₩{selectedRecord.netPay.toLocaleString()}</p>
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-gray-200 text-center">
                  <p className="text-xs text-gray-400 font-bold mb-4 italic">본 명세서의 내용은 위 사실과 다름이 없음을 확인합니다.</p>
                  <div className="w-32 h-12 bg-gray-50 border border-gray-100 rounded-lg mx-auto flex items-center justify-center text-gray-300 text-[10px] font-bold">인 또는 서명</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="full" onClick={() => setIsStubModalOpen(false)}>닫기</Button>
              <Button size="full" onClick={() => window.print()} className="gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF 명세서 출력
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Excel 업로드 모달 */}
      {selectedSite && (
        <ExcelUploadModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onSuccess={handleExcelSuccess}
          siteId={selectedSite.id}
          type="ledger"
          year={year}
          month={month}
        />
      )}
    </div>
  )
}
