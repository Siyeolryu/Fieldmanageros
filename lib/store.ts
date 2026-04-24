import { create } from 'zustand'
import { Attendance, Worker, Site, Company } from '@prisma/client'

interface AuthState {
  user: {
    id: string
    email: string
    fullName?: string | null
    userType?: 'manager' | 'both' | 'worker' // 사용자 타입
  } | null
  activeRole: 'manager' | 'worker' // 현재 활성화된 역할
  setUser: (user: AuthState['user']) => void
  setActiveRole: (role: 'manager' | 'worker') => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // 실제 인증 후 setUser로 설정됨
  activeRole: 'manager', // 기본값은 관리자
  setUser: (user) => {
    // user가 설정될 때, userType이 'worker'면 activeRole도 'worker'로 설정
    const activeRole = user?.userType === 'worker' ? 'worker' : 'manager'
    set({ user, activeRole })
  },
  setActiveRole: (role) => set({ activeRole: role }),
  logout: () => set({ user: null, activeRole: 'manager' }),
}))

interface AppState {
  selectedCompany: Company | null
  selectedSite: Site | null
  selectedWorker: Worker | null
  setSelectedCompany: (company: Company | null) => void
  setSelectedSite: (site: Site | null) => void
  setSelectedWorker: (worker: Worker | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedCompany: null,
  selectedSite: null,
  selectedWorker: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  setSelectedSite: (site) => set({ selectedSite: site }),
  setSelectedWorker: (worker) => set({ selectedWorker: worker }),
}))

interface AttendanceState {
  attendanceRecords: (Attendance & { worker: { name: string } })[]
  selectedDate: Date
  isLoading: boolean
  error: string | null
  setAttendanceRecords: (records: AttendanceState['attendanceRecords']) => void
  setSelectedDate: (date: Date) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  // 특정 날짜의 출근 기록 필터링
  getAttendanceByDate: (date: Date) => AttendanceState['attendanceRecords']
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendanceRecords: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,
  setAttendanceRecords: (records) => set({ attendanceRecords: records, isLoading: false }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  getAttendanceByDate: (date) => {
    const { attendanceRecords } = get()
    // 현지 날짜 기준으로 비교 (toISOString()은 UTC 기준이므로 주의)
    const target = date.toLocaleDateString('en-CA') // YYYY-MM-DD format
    return attendanceRecords.filter(r => {
      const recordDate = new Date(r.date).toLocaleDateString('en-CA')
      return recordDate === target
    })
  },
}))
