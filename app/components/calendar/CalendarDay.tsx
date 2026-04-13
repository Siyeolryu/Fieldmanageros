'use client'

import React from 'react'
import { isSunday, isToday, format } from 'date-fns'

interface CalendarDayProps {
  date: Date
  attendeeCount: number
  isCurrentMonth: boolean
  isSelected: boolean
  onClick: (date: Date) => void
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  date, 
  attendeeCount, 
  isCurrentMonth, 
  isSelected,
  onClick 
}) => {
  const dayNumber = format(date, 'd')
  const sunday = isSunday(date)
  const today = isToday(date)

  // 인원수가 많을수록 배경색 농도 조절 (Heatmap 아이디어 반영)
  const getIntensityClass = () => {
    if (attendeeCount === 0) return 'bg-white'
    if (attendeeCount < 5) return 'bg-blue-50'
    if (attendeeCount < 10) return 'bg-blue-100'
    if (attendeeCount < 20) return 'bg-blue-200'
    return 'bg-blue-300'
  }

  return (
    <div 
      onClick={() => onClick(date)}
      className={`
        relative min-h-[100px] p-2 border-r border-b cursor-pointer transition-all hover:bg-gray-50
        ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
        ${isSelected ? 'ring-2 ring-blue-600 ring-inset z-10' : ''}
        ${getIntensityClass()}
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`
          text-sm font-semibold
          ${sunday ? 'text-rose-500' : 'text-gray-700'}
          ${today ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center -mt-1 -ml-1' : ''}
        `}>
          {dayNumber}
        </span>
        
        {/* 현장 관리용 배지 (인원수 표시) */}
        {attendeeCount > 0 && isCurrentMonth && (
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-sm">
              {attendeeCount}명
            </span>
            {/* 8일 이상 근무자 여부 등을 표시하는 도트 인디케이터(옵션) */}
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 최적화된 하단 정보 영역 */}
      <div className="mt-auto pt-4 flex flex-col gap-1 overflow-hidden">
        {/* 예: 해당 날짜의 주요 특이사항이나 상태 표시 가능 */}
      </div>
    </div>
  )
}

export default CalendarDay
