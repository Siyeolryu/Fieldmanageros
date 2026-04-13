-- ════════════════════════════════════════
-- Field Manager OS - Initial Schema
-- 노무Pro 초기 데이터베이스 스키마
-- ════════════════════════════════════════

-- Extensions 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════ Profiles (사용자 프로필) ════════
-- auth.users는 Supabase Auth가 자동 생성
-- 여기서는 추가 프로필 정보만 저장

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS '사용자 프로필 (Supabase Auth 확장)';
COMMENT ON COLUMN public.profiles.role IS 'admin: 관리자, manager: 현장소장, viewer: 조회자';

-- ════════ Companies (건설사) ════════

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_number TEXT,
  phone TEXT,
  address TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.companies IS '건설사/소속 회사';
COMMENT ON COLUMN public.companies.business_number IS '사업자등록번호';

-- ════════ Sites (현장/프로젝트) ════════

CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sites IS '건설 현장/프로젝트';
COMMENT ON COLUMN public.sites.is_active IS '현장 활성화 여부 (종료된 현장은 false)';

-- ════════ Workers (근로자) ════════

CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  id_number TEXT, -- 주민등록번호 (암호화 권장)
  bank_name TEXT,
  bank_account TEXT,
  hourly_rate INTEGER NOT NULL, -- 시급 (원)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.workers IS '일용직 근로자';
COMMENT ON COLUMN public.workers.hourly_rate IS '시급 (원 단위)';
COMMENT ON COLUMN public.workers.id_number IS '주민등록번호 - 반드시 암호화 저장 권장';

-- ════════ Attendance (출근 기록) ════════

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked NUMERIC(4,1) NOT NULL, -- 8.0, 8.5 등
  is_weekly_holiday BOOLEAN DEFAULT FALSE, -- 주휴일 여부
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, date) -- 한 근로자는 같은 날짜/현장에 한 번만
);

COMMENT ON TABLE public.attendance IS '일일 출근 기록';
COMMENT ON COLUMN public.attendance.hours_worked IS '근무 시간 (시간 단위, 소수점 1자리)';
COMMENT ON COLUMN public.attendance.is_weekly_holiday IS '8일 카운팅으로 계산된 주휴일';

-- ════════ Payroll (급여 명세) ════════

CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_work_days INTEGER,
  total_hours NUMERIC(6,1),
  base_pay INTEGER, -- 기본급
  weekly_holiday_pay INTEGER, -- 주휴수당
  overtime_pay INTEGER, -- 연장수당
  total_pay INTEGER, -- 총 지급액
  health_insurance INTEGER, -- 건강보험
  pension_insurance INTEGER, -- 국민연금
  employment_insurance INTEGER, -- 고용보험
  income_tax INTEGER, -- 소득세
  total_deduction INTEGER, -- 총 공제액
  net_pay INTEGER, -- 실수령액
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, year, month)
);

COMMENT ON TABLE public.payroll IS '월별 급여 명세서';
COMMENT ON COLUMN public.payroll.base_pay IS '기본급 (시급 × 근무시간)';
COMMENT ON COLUMN public.payroll.weekly_holiday_pay IS '주휴수당 (8일 카운팅 기반)';
COMMENT ON COLUMN public.payroll.net_pay IS '실수령액 (총 지급액 - 총 공제액)';

-- ════════ Indexes (성능 최적화) ════════

CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE INDEX idx_sites_company ON public.sites(company_id);
CREATE INDEX idx_sites_active ON public.sites(is_active);
CREATE INDEX idx_workers_site ON public.workers(site_id);
CREATE INDEX idx_workers_active ON public.workers(is_active);
CREATE INDEX idx_attendance_worker ON public.attendance(worker_id);
CREATE INDEX idx_attendance_site ON public.attendance(site_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_payroll_worker ON public.payroll(worker_id);
CREATE INDEX idx_payroll_period ON public.payroll(year, month);

-- ════════ Updated_at Trigger (자동 업데이트) ════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'updated_at 컬럼 자동 업데이트 트리거 함수';

-- Profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Companies
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sites
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Workers
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Attendance
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Payroll
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════
-- Initial Schema 완료
-- ════════════════════════════════════════
