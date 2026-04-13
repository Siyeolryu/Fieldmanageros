-- ════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- 데이터 보안 정책
-- ════════════════════════════════════════

-- ════════ Enable RLS on All Tables ════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════
-- Profiles Policies
-- 사용자는 자신의 프로필만 조회/수정 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ════════════════════════════════════════
-- Companies Policies
-- 소유자만 자신의 건설사 조회/수정/삭제 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);

-- ════════════════════════════════════════
-- Sites Policies
-- 자신의 건설사에 속한 현장만 조회/관리 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view sites of own companies"
  ON public.sites FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sites for own companies"
  ON public.sites FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sites of own companies"
  ON public.sites FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sites of own companies"
  ON public.sites FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- Workers Policies
-- 자신의 현장에 속한 근로자만 조회/관리 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view workers of own sites"
  ON public.workers FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workers for own sites"
  ON public.workers FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workers of own sites"
  ON public.workers FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workers of own sites"
  ON public.workers FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- Attendance Policies
-- 자신의 현장 출근 기록만 조회/관리 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view attendance of own sites"
  ON public.attendance FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attendance for own sites"
  ON public.attendance FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attendance of own sites"
  ON public.attendance FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attendance of own sites"
  ON public.attendance FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- Payroll Policies
-- 자신의 현장 급여 명세만 조회/관리 가능
-- ════════════════════════════════════════

CREATE POLICY "Users can view payroll of own sites"
  ON public.payroll FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payroll for own sites"
  ON public.payroll FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payroll of own sites"
  ON public.payroll FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payroll of own sites"
  ON public.payroll FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════════════════════════════════════
-- RLS Policies 완료
--
-- 보안 레벨:
-- - 사용자는 자신의 데이터만 접근 가능
-- - 회사 소유자만 해당 회사 데이터 접근
-- - 현장별 데이터 격리
-- ════════════════════════════════════════
