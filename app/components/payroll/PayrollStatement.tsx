'use client'

import React from 'react'
import Tooltip from '../ui/Tooltip'

interface PayrollStatementProps {
  payroll: {
    year: number
    month: number
    total_work_days: number
    total_hours: number
    base_pay: number
    weekly_holiday_pay: number
    overtime_pay: number
    total_pay: number
    health_insurance: number
    pension_insurance: number
    employment_insurance: number
    income_tax: number
    total_deduction: number
    net_pay: number
    worker?: {
      name: string
      phone?: string
      isOwner?: boolean      // Phase 5: 현장 소유자 여부
      profileId?: string     // Phase 5: 프로필 연결
    }
  }
  workerName?: string
  isOwner?: boolean  // Phase 5: 본인 급여인 경우 세무 안내 표시
}

export default function PayrollStatement({ payroll, workerName, isOwner }: PayrollStatementProps) {
  const displayName = workerName || payroll.worker?.name || '근로자'
  const isOwnerPayroll = isOwner || payroll.worker?.isOwner

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">급여 명세서</h2>
          {isOwnerPayroll && (
            <span className="px-2 py-1 bg-sky-600 text-white text-xs font-bold rounded-lg">
              본인 급여
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            <span className="font-semibold">{displayName}</span>
          </p>
          <p className="text-gray-500">
            {payroll.year}년 {payroll.month}월
          </p>
        </div>
      </div>

      {/* 근무 정보 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">근무 정보</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">총 근무일수</p>
            <p className="text-lg font-bold text-gray-900">{payroll.total_work_days}일</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">총 근무시간</p>
            <p className="text-lg font-bold text-gray-900">{payroll.total_hours}시간</p>
          </div>
        </div>
      </div>

      {/* 지급 내역 */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">지급 내역</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">기본급</span>
            <span className="text-sm font-semibold text-gray-900">
              {payroll.base_pay.toLocaleString()}원
            </span>
          </div>

          {payroll.overtime_pay > 0 && (
            <div className="flex items-center justify-between py-2 bg-amber-50 px-3 rounded-lg">
              <span className="text-sm text-gray-600">연장수당 (1.5배)</span>
              <span className="text-sm font-semibold text-amber-700">
                +{payroll.overtime_pay.toLocaleString()}원
              </span>
            </div>
          )}

          {payroll.weekly_holiday_pay > 0 && (
            <div className="flex items-center justify-between py-2 bg-green-50 px-3 rounded-lg">
              <span className="text-sm text-gray-600">주휴수당</span>
              <span className="text-sm font-semibold text-green-700">
                +{payroll.weekly_holiday_pay.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">총 지급액</span>
              <span className="text-lg font-bold text-blue-600">
                {payroll.total_pay.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 공제 내역 */}
      <div className="bg-red-50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">공제 내역</h3>
        <div className="space-y-2">
          {payroll.health_insurance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">건강보험 (3.595% + 장기요양)</span>
              <span className="text-sm font-semibold text-red-600">
                -{payroll.health_insurance.toLocaleString()}원
              </span>
            </div>
          )}

          {payroll.pension_insurance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">국민연금 (4.75%)</span>
              <span className="text-sm font-semibold text-red-600">
                -{payroll.pension_insurance.toLocaleString()}원
              </span>
            </div>
          )}

          {payroll.employment_insurance > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">고용보험 (0.9%)</span>
              <span className="text-sm font-semibold text-red-600">
                -{payroll.employment_insurance.toLocaleString()}원
              </span>
            </div>
          ) : isOwnerPayroll ? (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 line-through">고용보험 (0.9%)</span>
                <Tooltip content="사업자이면서 자신에게 급여를 주는 경우, 고용보험은 가입 대상이 아닙니다.">
                  <svg className="w-4 h-4 text-blue-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </Tooltip>
              </div>
              <span className="text-sm font-semibold text-gray-400">
                제외
              </span>
            </div>
          ) : null}

          {payroll.income_tax > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">소득세 + 지방세</span>
              <span className="text-sm font-semibold text-red-600">
                -{payroll.income_tax.toLocaleString()}원
              </span>
            </div>
          )}

          <div className="border-t border-red-200 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">총 공제액</span>
              <span className="text-base font-bold text-red-600">
                -{payroll.total_deduction.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 실수령액 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6">
        <div className="flex items-center justify-between text-white">
          <span className="text-lg font-bold">실수령액</span>
          <span className="text-3xl font-black">
            {payroll.net_pay.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* Phase 5: 본인 급여 세무 안내 */}
      {isOwnerPayroll && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 text-sm mb-2">본인 급여 세무 처리 안내</h4>
              <div className="text-xs text-amber-800 space-y-1.5">
                <p className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>원천징수:</strong> 약 {Math.floor(payroll.income_tax * 0.9).toLocaleString()}원 (다음 달 10일까지 신고)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>4대보험:</strong> 건강보험, 국민연금, 산재보험만 해당 (고용보험 제외)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>종합소득세:</strong> 5월에 사업소득과 합산 신고 필요</span>
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs text-amber-700">
                  💡 자세한 사항은 세무사와 상담하거나 <strong>국세청 126번</strong>으로 문의하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
        <p className="mb-1">※ 4대 보험은 월 8일 이상 근무 시 공제됩니다.</p>
        <p className="mb-1">※ 주휴수당은 주 15시간 이상 근무 시 자동 지급됩니다.</p>
        <p>※ 소득세는 일당 15만원 초과분에 대해 2.7% 공제됩니다.</p>
      </div>
    </div>
  )
}
