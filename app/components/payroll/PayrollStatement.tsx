'use client'

import React from 'react'

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
    }
  }
  workerName?: string
}

export default function PayrollStatement({ payroll, workerName }: PayrollStatementProps) {
  const displayName = workerName || payroll.worker?.name || '근로자'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">급여 명세서</h2>
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

          {payroll.employment_insurance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-600">고용보험 (0.9%)</span>
              <span className="text-sm font-semibold text-red-600">
                -{payroll.employment_insurance.toLocaleString()}원
              </span>
            </div>
          )}

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

      {/* 안내 문구 */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
        <p className="mb-1">※ 4대 보험은 월 8일 이상 근무 시 공제됩니다.</p>
        <p className="mb-1">※ 주휴수당은 주 15시간 이상 근무 시 자동 지급됩니다.</p>
        <p>※ 소득세는 일당 15만원 초과분에 대해 2.7% 공제됩니다.</p>
      </div>
    </div>
  )
}
