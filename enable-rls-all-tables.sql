-- ⚠️ 중요: Supabase SQL Editor에서 실행
-- 모든 public 테이블에 RLS 활성화

-- 1. 기존 테이블에 RLS 활성화
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payroll ENABLE ROW LEVEL SECURITY;

-- 2. 확인
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
