-- ════════════════════════════════════════════════════════════════
-- 노무Pro 통합 마이그레이션 스크립트
-- Supabase Dashboard SQL Editor에서 실행하세요
-- ════════════════════════════════════════════════════════════════
--
-- 실행 방법:
-- 1. https://supabase.com/dashboard 접속
-- 2. 프로젝트 선택 (ejgsotsviobjfvfqovcj)
-- 3. 좌측 메뉴에서 "SQL Editor" 클릭
-- 4. "+ New query" 클릭
-- 5. 이 파일의 전체 내용을 복사하여 붙여넣기
-- 6. "Run" 버튼 클릭 (Ctrl/Cmd + Enter)
--
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════
-- 1단계: Extensions 활성화 및 초기 스키마
-- ════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════ Profiles (사용자 프로필) ════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  avatar_url TEXT,
  user_type TEXT DEFAULT 'manager' CHECK (user_type IN ('manager', 'both', 'worker')),
  hourly_rate INTEGER,
  bank_name TEXT,
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS '사용자 프로필 (Supabase Auth 확장)';
COMMENT ON COLUMN public.profiles.role IS 'admin: 관리자, manager: 현장소장, viewer: 조회자';
COMMENT ON COLUMN public.profiles.user_type IS 'manager: 관리자만, both: 관리자+근로자, worker: 근로자만';
COMMENT ON COLUMN public.profiles.hourly_rate IS '시급 (원) - user_type이 both 또는 worker일 때만 사용';
COMMENT ON COLUMN public.profiles.bank_name IS '은행명 - 급여 입금용';
COMMENT ON COLUMN public.profiles.bank_account IS '계좌번호 - 급여 입금용';

-- ════════ Companies (건설사) ════════

CREATE TABLE IF NOT EXISTS public.companies (
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

CREATE TABLE IF NOT EXISTS public.sites (
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

CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  id_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  hourly_rate INTEGER NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_owner BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.workers IS '일용직 근로자';
COMMENT ON COLUMN public.workers.hourly_rate IS '시급 (원 단위)';
COMMENT ON COLUMN public.workers.id_number IS '주민등록번호 - 반드시 암호화 저장 권장';
COMMENT ON COLUMN public.workers.profile_id IS '프로필 연결 - 관리자가 본인을 근로자로 등록할 때 사용 (Phase 2)';
COMMENT ON COLUMN public.workers.is_owner IS '현장 소유자 여부 - 세금 처리용 (Phase 2)';

-- ════════ Attendance (출근 기록) ════════

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked NUMERIC(4,1) NOT NULL,
  is_weekly_holiday BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, date)
);

COMMENT ON TABLE public.attendance IS '일일 출근 기록';
COMMENT ON COLUMN public.attendance.hours_worked IS '근무 시간 (시간 단위, 소수점 1자리)';
COMMENT ON COLUMN public.attendance.is_weekly_holiday IS '8일 카운팅으로 계산된 주휴일';

-- ════════ Payroll (급여 명세) ════════

CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_work_days INTEGER,
  total_hours NUMERIC(6,1),
  base_pay INTEGER,
  weekly_holiday_pay INTEGER,
  overtime_pay INTEGER,
  total_pay INTEGER,
  health_insurance INTEGER,
  pension_insurance INTEGER,
  employment_insurance INTEGER,
  income_tax INTEGER,
  total_deduction INTEGER,
  net_pay INTEGER,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, year, month)
);

COMMENT ON TABLE public.payroll IS '월별 급여 명세서';
COMMENT ON COLUMN public.payroll.base_pay IS '기본급 (시급 × 근무시간)';
COMMENT ON COLUMN public.payroll.weekly_holiday_pay IS '주휴수당 (8일 카운팅 기반)';
COMMENT ON COLUMN public.payroll.net_pay IS '실수령액 (총 지급액 - 총 공제액)';

-- ════════ CorrectionRequest (출근 기록 수정 요청) ════════

CREATE TABLE IF NOT EXISTS public.correction_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  requested_hours NUMERIC(4, 1),
  requested_notes TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.correction_requests IS '출근 기록 수정 요청 테이블';
COMMENT ON COLUMN public.correction_requests.status IS 'pending: 대기, approved: 승인, rejected: 거부';
COMMENT ON COLUMN public.correction_requests.requested_hours IS '수정 요청 근무 시간';
COMMENT ON COLUMN public.correction_requests.reason IS '수정 요청 사유';

-- ════════ Indexes (성능 최적화) ════════

CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_company ON public.sites(company_id);
CREATE INDEX IF NOT EXISTS idx_sites_active ON public.sites(is_active);
CREATE INDEX IF NOT EXISTS idx_workers_site ON public.workers(site_id);
CREATE INDEX IF NOT EXISTS idx_workers_active ON public.workers(is_active);
CREATE INDEX IF NOT EXISTS idx_workers_profile_id ON public.workers(profile_id);
CREATE INDEX IF NOT EXISTS idx_attendance_worker ON public.attendance(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_site ON public.attendance(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_payroll_worker ON public.payroll(worker_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON public.payroll(year, month);
CREATE INDEX IF NOT EXISTS idx_correction_requests_attendance ON public.correction_requests(attendance_id);
CREATE INDEX IF NOT EXISTS idx_correction_requests_status ON public.correction_requests(status);
CREATE INDEX IF NOT EXISTS idx_correction_requests_requester ON public.correction_requests(requested_by);

-- ════════ Updated_at Trigger ════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_sites_updated_at ON public.sites;
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_workers_updated_at ON public.workers;
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_payroll_updated_at ON public.payroll;
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_correction_requests_updated_at ON public.correction_requests;
CREATE TRIGGER update_correction_requests_updated_at BEFORE UPDATE ON public.correction_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════
-- 2단계: Row Level Security (RLS) 정책
-- ════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.profiles;
CREATE POLICY "Users can insert own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Companies Policies
DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
CREATE POLICY "Users can view own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);

-- Sites Policies
DROP POLICY IF EXISTS "Users can view sites of own companies" ON public.sites;
CREATE POLICY "Users can view sites of own companies"
  ON public.sites FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert sites for own companies" ON public.sites;
CREATE POLICY "Users can insert sites for own companies"
  ON public.sites FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update sites of own companies" ON public.sites;
CREATE POLICY "Users can update sites of own companies"
  ON public.sites FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete sites of own companies" ON public.sites;
CREATE POLICY "Users can delete sites of own companies"
  ON public.sites FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- Workers Policies
DROP POLICY IF EXISTS "Users can view workers of own sites" ON public.workers;
CREATE POLICY "Users can view workers of own sites"
  ON public.workers FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert workers for own sites" ON public.workers;
CREATE POLICY "Users can insert workers for own sites"
  ON public.workers FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update workers of own sites" ON public.workers;
CREATE POLICY "Users can update workers of own sites"
  ON public.workers FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete workers of own sites" ON public.workers;
CREATE POLICY "Users can delete workers of own sites"
  ON public.workers FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Attendance Policies
DROP POLICY IF EXISTS "Users can view attendance of own sites" ON public.attendance;
CREATE POLICY "Users can view attendance of own sites"
  ON public.attendance FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert attendance for own sites" ON public.attendance;
CREATE POLICY "Users can insert attendance for own sites"
  ON public.attendance FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update attendance of own sites" ON public.attendance;
CREATE POLICY "Users can update attendance of own sites"
  ON public.attendance FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete attendance of own sites" ON public.attendance;
CREATE POLICY "Users can delete attendance of own sites"
  ON public.attendance FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Payroll Policies
DROP POLICY IF EXISTS "Users can view payroll of own sites" ON public.payroll;
CREATE POLICY "Users can view payroll of own sites"
  ON public.payroll FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert payroll for own sites" ON public.payroll;
CREATE POLICY "Users can insert payroll for own sites"
  ON public.payroll FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update payroll of own sites" ON public.payroll;
CREATE POLICY "Users can update payroll of own sites"
  ON public.payroll FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete payroll of own sites" ON public.payroll;
CREATE POLICY "Users can delete payroll of own sites"
  ON public.payroll FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- CorrectionRequest Policies
DROP POLICY IF EXISTS "Users can view correction requests of own sites" ON public.correction_requests;
CREATE POLICY "Users can view correction requests of own sites"
  ON public.correction_requests FOR SELECT
  USING (
    attendance_id IN (
      SELECT a.id FROM public.attendance a
      JOIN public.sites s ON a.site_id = s.id
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert correction requests for own sites" ON public.correction_requests;
CREATE POLICY "Users can insert correction requests for own sites"
  ON public.correction_requests FOR INSERT
  WITH CHECK (
    attendance_id IN (
      SELECT a.id FROM public.attendance a
      JOIN public.sites s ON a.site_id = s.id
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
    AND requested_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update correction requests of own sites" ON public.correction_requests;
CREATE POLICY "Users can update correction requests of own sites"
  ON public.correction_requests FOR UPDATE
  USING (
    attendance_id IN (
      SELECT a.id FROM public.attendance a
      JOIN public.sites s ON a.site_id = s.id
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete correction requests of own sites" ON public.correction_requests;
CREATE POLICY "Users can delete correction requests of own sites"
  ON public.correction_requests FOR DELETE
  USING (
    attendance_id IN (
      SELECT a.id FROM public.attendance a
      JOIN public.sites s ON a.site_id = s.id
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- 3단계: Utility Functions (비즈니스 로직)
-- ════════════════════════════════════════

-- 8일 카운팅 계산
CREATE OR REPLACE FUNCTION calculate_weekly_holiday(
  p_worker_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_days INTEGER,
  weekly_holidays INTEGER,
  total_hours NUMERIC
) AS $$
DECLARE
  work_days INTEGER;
  weekly_holiday_count INTEGER;
  total_work_hours NUMERIC;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(hours_worked), 0)
  INTO work_days, total_work_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND date BETWEEN p_start_date AND p_end_date
    AND is_weekly_holiday = FALSE;

  weekly_holiday_count := FLOOR(work_days / 8.0);

  RETURN QUERY SELECT work_days, weekly_holiday_count, total_work_hours;
END;
$$ LANGUAGE plpgsql;

-- 주휴수당 계산
CREATE OR REPLACE FUNCTION calculate_weekly_holiday_pay(
  p_worker_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  avg_daily_hours NUMERIC;
  hourly_rate INTEGER;
  weekly_holidays INTEGER;
  holiday_pay INTEGER;
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  SELECT AVG(hours_worked)
  INTO avg_daily_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND date BETWEEN month_start AND month_end
    AND is_weekly_holiday = FALSE;

  SELECT w.hourly_rate
  INTO hourly_rate
  FROM public.workers w
  WHERE w.id = p_worker_id;

  SELECT (calculate_weekly_holiday(
    p_worker_id,
    month_start,
    month_end
  )).weekly_holidays
  INTO weekly_holidays;

  holiday_pay := ROUND(weekly_holidays * COALESCE(avg_daily_hours, 0) * hourly_rate);

  RETURN holiday_pay;
END;
$$ LANGUAGE plpgsql;

-- 월별 급여 계산
CREATE OR REPLACE FUNCTION calculate_monthly_payroll(
  p_worker_id UUID,
  p_site_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE(
  base_pay INTEGER,
  weekly_holiday_pay INTEGER,
  total_pay INTEGER,
  health_insurance INTEGER,
  pension_insurance INTEGER,
  employment_insurance INTEGER,
  income_tax INTEGER,
  total_deduction INTEGER,
  net_pay INTEGER
) AS $$
DECLARE
  v_total_hours NUMERIC;
  v_hourly_rate INTEGER;
  v_base_pay INTEGER;
  v_weekly_holiday_pay INTEGER;
  v_total_pay INTEGER;
  v_health_insurance INTEGER;
  v_pension_insurance INTEGER;
  v_employment_insurance INTEGER;
  v_income_tax INTEGER;
  v_total_deduction INTEGER;
  v_net_pay INTEGER;
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  SELECT COALESCE(SUM(hours_worked), 0)
  INTO v_total_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND site_id = p_site_id
    AND date BETWEEN month_start AND month_end
    AND is_weekly_holiday = FALSE;

  SELECT hourly_rate
  INTO v_hourly_rate
  FROM public.workers
  WHERE id = p_worker_id;

  v_base_pay := ROUND(v_total_hours * v_hourly_rate);
  v_weekly_holiday_pay := calculate_weekly_holiday_pay(p_worker_id, p_year, p_month);
  v_total_pay := v_base_pay + v_weekly_holiday_pay;

  v_health_insurance := ROUND(v_total_pay * 0.03545);
  v_pension_insurance := ROUND(v_total_pay * 0.045);
  v_employment_insurance := ROUND(v_total_pay * 0.009);

  IF v_total_pay <= 2000000 THEN
    v_income_tax := 0;
  ELSE
    v_income_tax := ROUND((v_total_pay - 2000000) * 0.06);
  END IF;

  v_total_deduction := v_health_insurance + v_pension_insurance + v_employment_insurance + v_income_tax;
  v_net_pay := v_total_pay - v_total_deduction;

  RETURN QUERY SELECT
    v_base_pay,
    v_weekly_holiday_pay,
    v_total_pay,
    v_health_insurance,
    v_pension_insurance,
    v_employment_insurance,
    v_income_tax,
    v_total_deduction,
    v_net_pay;
END;
$$ LANGUAGE plpgsql;

-- 급여 명세서 자동 생성
CREATE OR REPLACE FUNCTION generate_payroll(
  p_worker_id UUID,
  p_site_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_payroll_id UUID;
  v_payroll_data RECORD;
  v_work_days INTEGER;
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  SELECT COUNT(*)
  INTO v_work_days
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND site_id = p_site_id
    AND date BETWEEN month_start AND month_end;

  SELECT * INTO v_payroll_data
  FROM calculate_monthly_payroll(p_worker_id, p_site_id, p_year, p_month);

  INSERT INTO public.payroll (
    worker_id, site_id, year, month, total_work_days, total_hours,
    base_pay, weekly_holiday_pay, total_pay,
    health_insurance, pension_insurance, employment_insurance,
    income_tax, total_deduction, net_pay
  )
  VALUES (
    p_worker_id, p_site_id, p_year, p_month, v_work_days,
    (SELECT SUM(hours_worked) FROM public.attendance
     WHERE worker_id = p_worker_id AND site_id = p_site_id
       AND date BETWEEN month_start AND month_end),
    v_payroll_data.base_pay, v_payroll_data.weekly_holiday_pay,
    v_payroll_data.total_pay, v_payroll_data.health_insurance,
    v_payroll_data.pension_insurance, v_payroll_data.employment_insurance,
    v_payroll_data.income_tax, v_payroll_data.total_deduction,
    v_payroll_data.net_pay
  )
  ON CONFLICT (worker_id, site_id, year, month)
  DO UPDATE SET
    total_work_days = EXCLUDED.total_work_days,
    total_hours = EXCLUDED.total_hours,
    base_pay = EXCLUDED.base_pay,
    weekly_holiday_pay = EXCLUDED.weekly_holiday_pay,
    total_pay = EXCLUDED.total_pay,
    health_insurance = EXCLUDED.health_insurance,
    pension_insurance = EXCLUDED.pension_insurance,
    employment_insurance = EXCLUDED.employment_insurance,
    income_tax = EXCLUDED.income_tax,
    total_deduction = EXCLUDED.total_deduction,
    net_pay = EXCLUDED.net_pay,
    updated_at = NOW()
  RETURNING id INTO v_payroll_id;

  RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════
-- 4단계: Realtime Subscription
-- ════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payroll;

-- ════════════════════════════════════════
-- 마이그레이션 완료!
-- ════════════════════════════════════════
--
-- 테이블 생성 확인:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public';
--
-- ════════════════════════════════════════
