'use client'

import React from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import Button from '../ui/Button'

interface CalendarHeaderProps {
  currentMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentMonth, 
  onPrevMonth, 
  onNextMonth, 
  onToday 
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-6 border-b bg-white">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <span className="text-sm font-medium text-blue-600">
          현장 출근 현황 관리
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPrevMonth}
          className="p-2 h-10 w-10 min-h-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToday}
          className="px-4 h-10 min-h-0 text-sm font-bold"
        >
          오늘
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNextMonth}
          className="p-2 h-10 w-10 min-h-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

export default CalendarHeader
