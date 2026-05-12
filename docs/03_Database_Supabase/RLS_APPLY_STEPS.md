# RLS 정책 빠른 적용 가이드

## 방법 1: 전체 SQL 한 번에 실행 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. 아래 SQL을 복사해서 붙여넣기
6. **Run** 버튼 클릭 (Ctrl+Enter)

```sql
-- =====================================================
-- Companies 테이블 RLS 정책
-- =====================================================
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

-- =====================================================
-- Sites 테이블 RLS 정책
-- =====================================================
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

-- =====================================================
-- Workers 테이블 RLS 정책
-- =====================================================
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

-- =====================================================
-- Attendance 테이블 RLS 정책
-- =====================================================
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

-- =====================================================
-- Payroll 테이블 RLS 정책
-- =====================================================
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

-- =====================================================
-- Profiles 테이블 RLS 정책
-- =====================================================
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
```

---

## 방법 2: 기존 정책이 있는 경우

기존 정책과 충돌이 발생하면 아래 SQL을 먼저 실행하세요:

```sql
-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view their own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete their own companies" ON companies;

DROP POLICY IF EXISTS "Users can view sites from their companies" ON sites;
DROP POLICY IF EXISTS "Users can insert sites to their companies" ON sites;
DROP POLICY IF EXISTS "Users can update sites from their companies" ON sites;
DROP POLICY IF EXISTS "Users can delete sites from their companies" ON sites;

DROP POLICY IF EXISTS "Users can view workers from their sites" ON workers;
DROP POLICY IF EXISTS "Users can insert workers to their sites" ON workers;
DROP POLICY IF EXISTS "Users can update workers from their sites" ON workers;
DROP POLICY IF EXISTS "Users can delete workers from their sites" ON workers;

DROP POLICY IF EXISTS "Users can view attendance from their sites" ON attendance;
DROP POLICY IF EXISTS "Users can insert attendance to their sites" ON attendance;
DROP POLICY IF EXISTS "Users can update attendance from their sites" ON attendance;
DROP POLICY IF EXISTS "Users can delete attendance from their sites" ON attendance;

DROP POLICY IF EXISTS "Users can view payroll from their sites" ON payroll;
DROP POLICY IF EXISTS "Users can insert payroll to their sites" ON payroll;
DROP POLICY IF EXISTS "Users can update payroll from their sites" ON payroll;
DROP POLICY IF EXISTS "Users can delete payroll from their sites" ON payroll;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
```

그 다음 **방법 1**의 SQL을 실행하세요.

---

## 적용 확인

SQL Editor에서 아래 쿼리로 확인:

```sql
-- 정책 목록 확인
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

예상 결과: 각 테이블당 3-4개의 정책이 표시되어야 함

---

## 문제 해결

### "policy already exists" 에러
→ **방법 2** 실행 후 다시 시도

### "permission denied" 에러
→ Supabase Dashboard 로그인 확인

### 정책이 작동하지 않는 경우
1. RLS가 활성화되었는지 확인:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

2. 모든 `rowsecurity`가 `true`인지 확인

3. `false`인 경우:
```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```
