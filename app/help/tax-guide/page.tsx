'use client'

import React from 'react'
import Link from 'next/link'

export default function TaxGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/home" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-3">건설업 세무 가이드</h1>
          <p className="text-lg text-gray-600">
            소규모 시공팀장을 위한 세무 신고 및 4대보험 안내
          </p>
        </div>

        {/* 목차 */}
        <div className="bg-white rounded-3xl border-2 border-blue-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📑 목차</h2>
          <ul className="space-y-2">
            <li>
              <a href="#dual-role" className="text-blue-600 hover:underline font-semibold">
                1. 관리자이면서 근로자인 경우 (Dual-Role)
              </a>
            </li>
            <li>
              <a href="#insurance" className="text-blue-600 hover:underline font-semibold">
                2. 4대보험 신고 방법
              </a>
            </li>
            <li>
              <a href="#withholding" className="text-blue-600 hover:underline font-semibold">
                3. 원천징수 신고 기한
              </a>
            </li>
            <li>
              <a href="#business-vs-worker" className="text-blue-600 hover:underline font-semibold">
                4. 사업자 vs 근로자 차이
              </a>
            </li>
            <li>
              <a href="#faq" className="text-blue-600 hover:underline font-semibold">
                5. 자주 묻는 질문 (FAQ)
              </a>
            </li>
          </ul>
        </div>

        {/* 섹션 1: Dual-Role */}
        <section id="dual-role" className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center text-lg font-black">1</span>
            관리자이면서 근로자인 경우 (Dual-Role)
          </h2>

          <div className="space-y-6">
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6">
              <h3 className="font-bold text-sky-900 mb-3">💡 핵심 개념</h3>
              <p className="text-sky-800 leading-relaxed">
                소규모 시공팀장은 <strong>사업자</strong>이면서 동시에 직접 작업에 투입되는 <strong>근로자</strong>입니다.
                이 경우 본인에게 급여를 지급하면 <strong>근로소득</strong>이 발생하며, 세무 처리가 필요합니다.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">📋 세무 처리 절차</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-semibold text-gray-900">본인 급여 지급</p>
                    <p className="text-sm text-gray-600 mt-1">노무PRO에서 자신을 근로자로 등록하고 출퇴근 및 급여 기록</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-semibold text-gray-900">원천징수 신고</p>
                    <p className="text-sm text-gray-600 mt-1">다음 달 10일까지 홈택스에서 근로소득 원천징수 신고</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-semibold text-gray-900">4대보험 신고</p>
                    <p className="text-sm text-gray-600 mt-1">건강보험, 국민연금, 산재보험 신고 (고용보험 제외)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <p className="font-semibold text-gray-900">종합소득세 신고</p>
                    <p className="text-sm text-gray-600 mt-1">매년 5월, 사업소득과 근로소득을 합산하여 신고</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* 섹션 2: 4대보험 */}
        <section id="insurance" className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg font-black">2</span>
            4대보험 신고 방법
          </h2>

          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold text-gray-900">보험 종류</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold text-gray-900">일반 근로자</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-bold text-gray-900">팀장 (Dual-Role)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">건강보험</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        직장가입자
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="text-amber-600 font-semibold">⚠️ 지역+직장 이중 주의</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">국민연금</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        사업장가입
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="text-amber-600 font-semibold">⚠️ 임의가입 검토</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">고용보험</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        가입 필수
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        사업자 제외
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-semibold text-gray-900">산재보험</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        가입 필수
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        중소기업 특례 가입
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <h3 className="font-bold text-amber-900 mb-3">⚠️ 주의사항</h3>
              <ul className="space-y-2 text-amber-800">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>고용보험</strong>은 사업자이므로 가입 대상이 아닙니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>건강보험</strong>은 이미 지역가입자인 경우 이중 가입 주의가 필요합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>산재보험</strong>은 중대재해처벌법에 따라 반드시 가입해야 합니다.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">📞 신고 문의처</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">건강보험공단</p>
                  <p className="text-2xl font-black text-blue-600">1577-1000</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">국민연금공단</p>
                  <p className="text-2xl font-black text-blue-600">1355</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">고용·산재보험</p>
                  <p className="text-2xl font-black text-blue-600">1588-0075</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">4대보험 통합</p>
                  <p className="text-2xl font-black text-blue-600">1566-3232</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: 원천징수 */}
        <section id="withholding" className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-black">3</span>
            원천징수 신고 기한
          </h2>

          <div className="space-y-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black">
                  10
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">매월 10일까지 신고</h3>
                  <p className="text-indigo-800 leading-relaxed">
                    전월에 지급한 급여에 대한 <strong>근로소득세 원천징수액</strong>을
                    다음 달 <strong>10일까지</strong> 홈택스에서 신고하고 납부해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">📅 신고 일정표</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-24 text-center">
                    <p className="text-sm font-semibold text-gray-600">1월분 급여</p>
                  </div>
                  <div className="flex-shrink-0">→</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">2월 10일까지 신고</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-24 text-center">
                    <p className="text-sm font-semibold text-gray-600">2월분 급여</p>
                  </div>
                  <div className="flex-shrink-0">→</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">3월 10일까지 신고</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex-shrink-0 w-24 text-center">
                    <p className="text-sm font-semibold text-blue-600">... 매월 반복</p>
                  </div>
                  <div className="flex-shrink-0 text-blue-600">→</div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900">다음 달 10일까지 신고</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-900 mb-3">🚨 미신고 시 불이익</h3>
              <ul className="space-y-2 text-red-800">
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>가산세 10%</strong> - 납부 불성실 가산세</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>납부 지연 시</strong> - 하루당 0.03%의 가산세 추가</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0">•</span>
                  <span><strong>세무조사 대상</strong> - 지속적 미신고 시 조사 가능성</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">💡 홈택스 신고 방법</h3>
              <ol className="space-y-3 text-blue-800">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">1.</span>
                  <span>홈택스 (www.hometax.go.kr) 접속 → 로그인</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">2.</span>
                  <span>신고/납부 → 원천세 → 근로소득 간이지급명세서</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">3.</span>
                  <span>근로자별 급여 및 원천징수세액 입력</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold">4.</span>
                  <span>신고서 제출 및 세액 납부</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* 섹션 4: 사업자 vs 근로자 */}
        <section id="business-vs-worker" className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center text-lg font-black">4</span>
            사업자 vs 근로자 차이
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  <th className="border border-violet-400 px-4 py-3 text-left font-bold">구분</th>
                  <th className="border border-violet-400 px-4 py-3 text-left font-bold">사업자</th>
                  <th className="border border-violet-400 px-4 py-3 text-left font-bold">근로자</th>
                  <th className="border border-violet-400 px-4 py-3 text-left font-bold">Dual-Role (팀장)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-3 font-semibold bg-gray-50">소득 구분</td>
                  <td className="border border-gray-200 px-4 py-3">사업소득</td>
                  <td className="border border-gray-200 px-4 py-3">근로소득</td>
                  <td className="border border-gray-200 px-4 py-3 bg-violet-50 font-semibold">사업소득 + 근로소득</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3 font-semibold bg-gray-50">세금 신고</td>
                  <td className="border border-gray-200 px-4 py-3">5월 종합소득세</td>
                  <td className="border border-gray-200 px-4 py-3">연말정산 (회사 처리)</td>
                  <td className="border border-gray-200 px-4 py-3 bg-violet-50 font-semibold">5월 합산 신고</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3 font-semibold bg-gray-50">부가가치세</td>
                  <td className="border border-gray-200 px-4 py-3">1월, 7월 신고</td>
                  <td className="border border-gray-200 px-4 py-3">해당 없음</td>
                  <td className="border border-gray-200 px-4 py-3 bg-violet-50 font-semibold">사업 부분만 신고</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3 font-semibold bg-gray-50">4대보험</td>
                  <td className="border border-gray-200 px-4 py-3">임의가입 (선택)</td>
                  <td className="border border-gray-200 px-4 py-3">의무가입</td>
                  <td className="border border-gray-200 px-4 py-3 bg-violet-50 font-semibold">부분 의무가입*</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3 font-semibold bg-gray-50">원천징수</td>
                  <td className="border border-gray-200 px-4 py-3">3.3% (간이)</td>
                  <td className="border border-gray-200 px-4 py-3">간이세액표 적용</td>
                  <td className="border border-gray-200 px-4 py-3 bg-violet-50 font-semibold">근로 부분 원천징수</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            * 건강보험, 국민연금, 산재보험만 의무 (고용보험 제외)
          </div>
        </section>

        {/* 섹션 5: FAQ */}
        <section id="faq" className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center text-lg font-black">5</span>
            자주 묻는 질문 (FAQ)
          </h2>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 본인에게 급여를 꼭 지급해야 하나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed">
                  <strong>필수는 아닙니다.</strong> 다만 직접 작업에 투입되어 공수를 기록하는 경우,
                  근로소득으로 인정받아 <strong>소득공제 혜택</strong>을 받을 수 있습니다.
                  또한 4대보험 가입으로 <strong>노후 보장</strong>과 <strong>산재 보호</strong>를 받을 수 있습니다.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 고용보험은 왜 가입할 수 없나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed">
                  고용보험은 <strong>근로자를 보호</strong>하기 위한 제도입니다.
                  사업자는 스스로 사업을 운영하므로 실업의 개념이 적용되지 않아 가입 대상이 아닙니다.
                  단, <strong>자영업자 고용보험</strong>에 별도로 임의가입할 수는 있습니다.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 원천징수를 하지 않으면 어떻게 되나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed mb-3">
                  원천징수 의무를 이행하지 않으면 다음과 같은 불이익이 있습니다:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>가산세 10%</strong> - 미신고 또는 과소신고 시</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>납부 지연 시</strong> - 일일 0.03%의 추가 가산세</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>세무조사 대상</strong> - 지속적 미신고 시 조사 가능성</span>
                  </li>
                </ul>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 사업소득과 근로소득을 합산하면 세금이 더 많이 나오나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed mb-3">
                  <strong>경우에 따라 다릅니다.</strong> 종합소득세는 <strong>누진세율</strong>(6~45%)이 적용되므로
                  소득이 합산되면 더 높은 세율 구간에 진입할 수 있습니다.
                </p>
                <p className="leading-relaxed mb-3">
                  하지만 근로소득은 <strong>근로소득공제</strong>(최대 2,000만원)가 있어
                  실제 과세표준은 크게 줄어듭니다. 따라서 단순히 합산한다고 무조건 세금이 늘어나는 것은 아닙니다.
                </p>
                <p className="text-blue-600 font-semibold">
                  💡 정확한 세액은 세무사와 상담하시는 것을 권장합니다.
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 노무PRO에서 세금을 자동으로 신고해주나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed mb-3">
                  <strong>아니요.</strong> 노무PRO는 <strong>급여 계산 및 기록 관리</strong> 도구입니다.
                  실제 세금 신고는 <strong>홈택스</strong>에서 직접 하셔야 합니다.
                </p>
                <p className="leading-relaxed">
                  다만, 노무PRO에서 생성한 <strong>급여 명세서</strong>와 <strong>노임대장</strong>을
                  홈택스 신고 시 참고 자료로 활용하실 수 있습니다.
                </p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-gray-50 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-bold text-gray-900">Q. 일용직 근로자도 4대보험에 가입해야 하나요?</span>
                <svg className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-700">
                <p className="leading-relaxed mb-3">
                  <strong>월 8일 이상 근무</strong>하는 경우 4대보험 가입 대상입니다.
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>건강보험</strong>: 월 8일 이상 근무 시</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>국민연금</strong>: 월 8일 이상 근무 시</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>고용보험</strong>: 월 60시간 이상 근무 시</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0">•</span>
                    <span><strong>산재보험</strong>: 근로 첫날부터 자동 가입</span>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </section>

        {/* 연락처 */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-4">추가 도움이 필요하신가요?</h2>
          <p className="text-lg mb-6 opacity-90">
            복잡한 세무 문제는 전문가와 상담하세요
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm font-semibold mb-1">국세청 상담센터</p>
              <p className="text-3xl font-black">126</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm font-semibold mb-1">4대보험 통합</p>
              <p className="text-3xl font-black">1566-3232</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            본 가이드는 일반적인 정보 제공을 목적으로 하며, 구체적인 세무 처리는 세무사와 상담하시기 바랍니다.
          </p>
          <p>
            최종 업데이트: 2026년 4월 | 노무PRO
          </p>
        </div>
      </div>
    </div>
  )
}
