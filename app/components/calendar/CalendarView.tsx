'use client'

import React, { useState, useEffect } from 'react'
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths,
} from 'date-fns'
import CalendarHeader from './CalendarHeader'
import CalendarDay from './CalendarDay'
import BottomSheet from '../ui/BottomSheet'
import { useAttendanceStore, useAppStore } from '@/lib/store'
import Button from '../ui/Button'
import BulkAttendanceForm from '../attendance/BulkAttendanceForm'
import AttendanceForm from '../attendance/AttendanceForm'
import Modal from '../ui/Modal'

const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false)
  
  const { 
    attendanceRecords, 
    setAttendanceRecords, 
    getAttendanceByDate,
    isLoading,
    setIsLoading,
    setError 
  } = useAttendanceStore()
  const { selectedSite } = useAppStore()
  
  // 근로자 데이터
  const [workers, setWorkers] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()  // Phase 5

  // Phase 5: 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // 데이터 로딩 로직 (함수로 분리하여 새로고침 가능하게 함)
  const fetchData = async () => {
    if (!selectedSite) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. 해당 현장의 근로자 정보 가져오기
      const workersRes = await fetch(`/api/workers?siteId=${selectedSite.id}`);
      if (!workersRes.ok) throw new Error('근로자 정보를 불러오는데 실패했습니다.');
      const workersData = await workersRes.json();
      setWorkers(workersData);

      // 2. 해당 현장의 이번 달 출근 기록 가져오기
      const monthStartStr = startOfMonth(currentMonth).toISOString();
      const monthEndStr = endOfMonth(currentMonth).toISOString();
      const attendanceRes = await fetch(
        `/api/attendance?siteId=${selectedSite.id}&startDate=${monthStartStr}&endDate=${monthEndStr}`
      );
      if (!attendanceRes.ok) throw new Error('출근 기록을 불러오는데 실패했습니다.');
      const attendanceData = await attendanceRes.json();
      setAttendanceRecords(attendanceData);
    } catch (err: any) {
      console.error('Data fetching error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSite, currentMonth])

  // 달력 날짜 계산 로직
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // 날짜 선택 핸들러
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsSheetOpen(true)
  }

  // 월 이동 핸들러
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  // 선택된 날짜의 출근 인원 데이터
  const selectedDayAttendees = getAttendanceByDate(selectedDate)

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border overflow-hidden">
      {/* 헤더 */}
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onToday={goToToday}
      />

      {/* 요일 표시 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div 
            key={day} 
            className={`py-3 text-center text-xs font-bold ${index === 0 ? 'text-rose-500' : 'text-gray-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-blue-600">데이터를 가져오고 있습니다...</p>
            </div>
          </div>
        )}
        
        {days.map((day) => {
          // 해당 날짜의 총 출근 인원수 계산 (Store에서 필터링)
          const attendeeCount = getAttendanceByDate(day).length
          
          return (
            <CalendarDay 
              key={day.toString()}
              date={day}
              attendeeCount={attendeeCount}
              isCurrentMonth={isSameMonth(day, monthStart)}
              isSelected={selectedDate.toDateString() === day.toDateString()}
              onClick={handleDateClick}
            />
          )
        })}
      </div>

      {/* 상세 내역 바텀 시트 (클러터 방지 전략 반영) */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title={`${selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })} 출근`}
      >
        <div className="space-y-6">
          {selectedDayAttendees.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">출근 명단 ({selectedDayAttendees.length}명)</span>
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold p-0 min-h-0">전체 보기</Button>
              </div>
              <ul className="space-y-3">
                {selectedDayAttendees.map((record) => (
                  <li key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {record.worker.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{record.worker.name}</p>
                        <p className="text-xs font-bold text-blue-600">{(Number(record.hoursWorked) / 8).toFixed(1)}공수</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 min-h-0 text-xs">상세</Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">등록된 출근 기록이 없습니다.</p>
            </div>
          )}

          {/* 일괄 등록 UX 제안 반영 */}
          <div className="space-y-3 pt-4">
            <Button 
              size="full" 
              className="bg-blue-600 gap-2"
              onClick={() => {
                setIsSheetOpen(false)
                setIsIndividualModalOpen(true)
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              개별 등록
            </Button>
            <Button 
              size="full" 
              variant="success" 
              className="gap-2"
              onClick={() => {
                setIsSheetOpen(false)
                setIsBulkModalOpen(true)
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              인원 일괄 추가 (그룹)
            </Button>
          </div>
        </div>
      </BottomSheet>

        <Modal 
          isOpen={isBulkModalOpen} 
          onClose={() => setIsBulkModalOpen(false)}
          title="일괄 출근 등록"
        >
          <BulkAttendanceForm
            workers={workers}
            date={selectedDate}
            siteId={selectedSite?.id || ''}
            currentUserId={currentUserId}
            onSuccess={() => {
              setIsBulkModalOpen(false)
              fetchData()
              alert('출근 등록이 완료되었습니다.')
            }}
            onCancel={() => setIsBulkModalOpen(false)}
          />
        </Modal>

        {/* 개별 등록 모달 */}
        <Modal 
          isOpen={isIndividualModalOpen} 
          onClose={() => setIsIndividualModalOpen(false)}
          title="개별 출근 등록"
        >
          <AttendanceForm 
            workers={workers}
            date={selectedDate}
            onSuccess={() => {
              setIsIndividualModalOpen(false)
              fetchData()
              alert('정상적으로 등록되었습니다.')
            }}
            onCancel={() => setIsIndividualModalOpen(false)}
          />
        </Modal>
      </div>
  )
}

export default CalendarView
