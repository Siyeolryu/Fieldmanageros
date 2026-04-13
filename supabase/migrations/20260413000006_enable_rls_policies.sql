-- =====================================================
-- RLS 정책 설정
-- =====================================================

-- companies 테이블 RLS 정책
-- 사용자는 자신이 소유한 회사만 조회/수정/삭제 가능
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = owner_id);

-- sites 테이블 RLS 정책
-- 사용자는 자신의 회사에 속한 현장만 조회/수정/삭제 가능
CREATE POLICY "Users can view sites from their companies"
  ON sites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sites to their companies"
  ON sites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sites from their companies"
  ON sites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sites from their companies"
  ON sites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = sites.company_id
      AND companies.owner_id = auth.uid()
    )
  );

-- workers 테이블 RLS 정책
-- 사용자는 자신의 회사 현장에 속한 근로자만 조회/수정/삭제 가능
CREATE POLICY "Users can view workers from their sites"
  ON workers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workers to their sites"
  ON workers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workers from their sites"
  ON workers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workers from their sites"
  ON workers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = workers.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- attendance 테이블 RLS 정책
-- 사용자는 자신의 회사 현장의 출근 기록만 조회/수정/삭제 가능
CREATE POLICY "Users can view attendance from their sites"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attendance to their sites"
  ON attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attendance from their sites"
  ON attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attendance from their sites"
  ON attendance FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = attendance.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- payroll 테이블 RLS 정책
-- 사용자는 자신의 회사 현장의 급여 명세만 조회/수정/삭제 가능
CREATE POLICY "Users can view payroll from their sites"
  ON payroll FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payroll to their sites"
  ON payroll FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payroll from their sites"
  ON payroll FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payroll from their sites"
  ON payroll FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sites
      JOIN companies ON companies.id = sites.company_id
      WHERE sites.id = payroll.site_id
      AND companies.owner_id = auth.uid()
    )
  );

-- profiles 테이블 RLS 정책
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
