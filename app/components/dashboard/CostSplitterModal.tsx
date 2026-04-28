'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/app/components/ui/Modal'
import { TAX_RATES, calculateDailyIncomeTax } from '@/lib/payroll'
import { useAppStore } from '@/lib/store'

interface WorkerProposal {
    id: string
    name: string
    dailyRate: number
    days: number
    totalPay: number
    deductions: number
    netPay: number
}

interface CostSplitterModalProps {
    isOpen: boolean
    onClose: () => void
}

interface Worker {
    id: string
    name: string
    hourlyRate: number
    isActive: boolean
}

export default function CostSplitterModal({ isOpen, onClose }: CostSplitterModalProps) {
    const { selectedSite } = useAppStore()
    const [targetBudget, setTargetBudget] = useState<number>(10000000) // 기본 1,000만원
    const [workers, setWorkers] = useState<Worker[]>([])
    const [proposals, setProposals] = useState<WorkerProposal[]>([])

    // 현장 근로자 불러오기
    useEffect(() => {
        if (isOpen && selectedSite) {
            fetch(`/api/workers?siteId=${selectedSite.id}`)
                .then(res => res.json())
                .then(data => setWorkers(data.filter((w: Worker) => w.isActive)))
        }
    }, [isOpen, selectedSite])

    // 역산 알고리즘
    const calculateScenarios = () => {
        if (workers.length === 0 || targetBudget <= 0) return

        const n = workers.length
        const targetPerWorker = targetBudget / n
        
        const newProposals: WorkerProposal[] = workers.map(worker => {
            // 1. 단가 우선 결정 (기본 20만원, 최대 30만원)
            let dailyRate = Math.min(Math.max(worker.hourlyRate * 8, 150000), 300000)
            
            // 2. 일수 계산
            let days = Math.round((targetPerWorker / dailyRate) * 2) / 2 // 0.5공수 단위
            
            // 3. 일수/단가 조정 (일수가 너무 많거나 적으면 단가 조정)
            if (days > 22) {
                dailyRate = Math.min(300000, Math.ceil((targetPerWorker / 22) / 1000) * 1000)
                days = Math.round((targetPerWorker / dailyRate) * 2) / 2
            } else if (days < 5 && dailyRate > 150000) {
                dailyRate = 150000
                days = Math.round((targetPerWorker / dailyRate) * 2) / 2
            }

            // 4. 세금 및 보험료 계산 (표준 요율 준수)
            const totalPay = dailyRate * days
            
            // 고용보험 (0.9%)
            const employmentInsurance = Math.floor(totalPay * TAX_RATES.EMPLOYMENT_INSURANCE / 10) * 10
            
            // 4대 보험 (8일 이상일 때만 건강/국민)
            let healthInsurance = 0
            let pensionInsurance = 0
            if (days >= 8) {
                healthInsurance = Math.floor(totalPay * TAX_RATES.HEALTH_INSURANCE / 10) * 10
                const longTermCare = Math.floor(healthInsurance * TAX_RATES.LONG_TERM_CARE / 10) * 10
                healthInsurance += longTermCare
                pensionInsurance = Math.floor(totalPay * TAX_RATES.NATIONAL_PENSION / 10) * 10
            }

            // 소득세 (일급 기준 합산)
            const incomeTaxBase = calculateDailyIncomeTax(dailyRate) * Math.floor(days)
            const localTax = Math.floor(incomeTaxBase * 0.1 / 10) * 10
            const incomeTax = incomeTaxBase + localTax

            const deductions = healthInsurance + pensionInsurance + employmentInsurance + incomeTax
            
            return {
                id: worker.id,
                name: worker.name,
                dailyRate,
                days,
                totalPay,
                deductions,
                netPay: totalPay - deductions
            }
        })

        // 전체 합계 맞추기 (마지막 인원에서 차액 조정)
        const currentTotal = newProposals.reduce((sum, p) => sum + p.totalPay, 0)
        const diff = targetBudget - currentTotal
        if (Math.abs(diff) > 0 && newProposals.length > 0) {
            newProposals[0].totalPay += diff
            newProposals[0].netPay += diff // 단순 가산
        }

        setProposals(newProposals)
    }

    useEffect(() => {
        calculateScenarios()
    }, [workers, targetBudget])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI 공사비 최적 분할 (역산 도구)">
            <div className="space-y-6">
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <label className="text-xs font-bold text-indigo-400 uppercase mb-2 block">목표 총 공사비 입력 (원)</label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={targetBudget}
                            onChange={(e) => setTargetBudget(Number(e.target.value))}
                            className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            placeholder="예: 50,000,000"
                        />
                        <span className="text-lg font-bold text-indigo-600">₩</span>
                    </div>
                    <p className="mt-2 text-[10px] text-indigo-400 leading-normal">
                        * 입력하신 금액을 기준으로 {workers.length}명의 근로자에게 최적의 단가와 일수를 배분합니다.<br/>
                        * 단가 상한선(30만원) 및 2026년 표준 요율이 적용됩니다.
                    </p>
                </div>

                <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">근로자</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">제안 단가</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">제안 공수</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">세전 지급액</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {proposals.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="text-sm font-bold text-gray-600">₩{p.dailyRate.toLocaleString()}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${p.days >= 8 ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {p.days}공수
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="text-sm font-black text-gray-900">₩{p.totalPay.toLocaleString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">예상 총액 합계</p>
                                <p className="text-lg font-black text-gray-900">₩{proposals.reduce((sum, p) => sum + p.totalPay, 0).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const text = proposals.map(p =>
                                            `${p.name}\t${p.dailyRate.toLocaleString()}원\t${p.days}공수\t${p.totalPay.toLocaleString()}원`
                                        ).join('\n')
                                        navigator.clipboard.writeText(text)
                                        alert('✅ 시나리오가 클립보드에 복사되었습니다.\n엑셀이나 메모장에 붙여넣기 하세요.')
                                    }}
                                    className="px-4 py-2 bg-white border-2 border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all"
                                >
                                    📋 복사
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs text-blue-700 leading-relaxed">
                                💡 <strong>이 도구는 시뮬레이션입니다.</strong> 실제 데이터에 반영하려면:<br/>
                                1. &quot;복사&quot; 버튼으로 결과를 복사하거나<br/>
                                2. 각 근로자의 시급을 수동으로 조정한 후<br/>
                                3. 노임대장 페이지에서 정산을 진행하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
