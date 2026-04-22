'use client'

import React from 'react'
import Link from 'next/link'

interface TaxNotificationProps {
  workerCount?: number
  ownerIncluded?: boolean
}

export default function TaxNotification({ workerCount = 0, ownerIncluded = false }: TaxNotificationProps) {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth() + 1

  // 원천징수 신고일 (매월 10일) 체크
  const withholdingDeadline = 10
  const daysUntilWithholding = withholdingDeadline - currentDay

  // 4대보험 신고 기한 (매월 15일) 체크
  const insuranceDeadline = 15
  const daysUntilInsurance = insuranceDeadline - currentDay

  const notifications: Array<{
    id: string
    type: 'urgent' | 'warning' | 'info'
    icon: string
    title: string
    message: string
    action?: { text: string; href: string }
  }> = []

  // 원천징수 알림 (10일 5일 전부터)
  if (daysUntilWithholding > 0 && daysUntilWithholding <= 5) {
    notifications.push({
      id: 'withholding',
      type: daysUntilWithholding <= 2 ? 'urgent' : 'warning',
      icon: '💰',
      title: '원천징수 신고 기한',
      message: `원천징수 신고일이 ${daysUntilWithholding}일 남았습니다 (${currentMonth}월 ${withholdingDeadline}일까지)`,
      action: {
        text: '홈택스 바로가기',
        href: 'https://www.hometax.go.kr',
      },
    })
  }

  // 4대보험 알림 (15일 7일 전부터)
  if (daysUntilInsurance > 0 && daysUntilInsurance <= 7 && workerCount > 0) {
    const totalCount = ownerIncluded ? workerCount : workerCount
    notifications.push({
      id: 'insurance',
      type: daysUntilInsurance <= 3 ? 'urgent' : 'warning',
      icon: '📋',
      title: '4대보험 신고 안내',
      message: `4대보험 신고 대상자: ${totalCount}명${ownerIncluded ? ' (본인 포함)' : ''} • ${daysUntilInsurance}일 남음`,
      action: {
        text: '4대보험 정보',
        href: 'https://www.4insure.or.kr',
      },
    })
  }

  // 세무 가이드 안내 (본인 포함된 경우)
  if (ownerIncluded) {
    notifications.push({
      id: 'tax-guide',
      type: 'info',
      icon: '💡',
      title: '본인 급여 세무 안내',
      message: '팀장 본인 급여 지급 시 세무 처리 방법을 확인하세요',
      action: {
        text: '세무 가이드',
        href: '/help/tax-guide',
      },
    })
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const bgColors = {
          urgent: 'bg-red-50 border-red-200',
          warning: 'bg-amber-50 border-amber-200',
          info: 'bg-blue-50 border-blue-200',
        }

        const textColors = {
          urgent: 'text-red-900',
          warning: 'text-amber-900',
          info: 'text-blue-900',
        }

        const buttonColors = {
          urgent: 'bg-red-600 hover:bg-red-700 text-white',
          warning: 'bg-amber-600 hover:bg-amber-700 text-white',
          info: 'bg-blue-600 hover:bg-blue-700 text-white',
        }

        return (
          <div
            key={notification.id}
            className={`p-4 rounded-2xl border-2 ${bgColors[notification.type]} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{notification.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm mb-1 ${textColors[notification.type]}`}>
                  {notification.title}
                </h3>
                <p className={`text-xs ${textColors[notification.type]} opacity-90`}>
                  {notification.message}
                </p>
              </div>
              {notification.action && (
                <Link
                  href={notification.action.href}
                  target={notification.action.href.startsWith('http') ? '_blank' : undefined}
                  rel={notification.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${buttonColors[notification.type]}`}
                >
                  {notification.action.text}
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
