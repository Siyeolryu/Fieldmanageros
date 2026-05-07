-- =============================================
-- 데이터베이스 상태 점검 SQL
-- =============================================
-- 현재 Supabase 데이터베이스 설정을 점검합니다
-- SQL Editor에서 각 섹션별로 실행하여 상태를 확인하세요

-- =============================================
-- 1. profiles 테이블 구조 확인
-- =============================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =============================================
-- 2. 현재 활성화된 트리거 확인
-- =============================================

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- =============================================
-- 3. profiles 테이블의 RLS 정책 확인
-- =============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- =============================================
-- 4. profiles 테이블 RLS 활성화 여부 확인
-- =============================================

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- =============================================
-- 5. handle_new_user() 함수 존재 여부 확인
-- =============================================

SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- =============================================
-- 6. profiles 테이블의 레코드 수 확인
-- =============================================

SELECT COUNT(*) as total_profiles FROM public.profiles;

-- =============================================
-- 7. auth.users 테이블의 레코드 수 확인
-- =============================================

SELECT COUNT(*) as total_auth_users FROM auth.users;
