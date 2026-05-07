-- =============================================
-- Auth 문제 진단 SQL
-- =============================================
-- Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new

-- =============================================
-- 1. auth.users 테이블의 모든 트리거 확인
-- =============================================

SELECT
  'Auth Triggers:' AS section,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- =============================================
-- 2. public 스키마의 모든 함수 확인
-- =============================================

SELECT
  'Public Functions:' AS section,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =============================================
-- 3. profiles 테이블의 제약 조건 확인
-- =============================================

SELECT
  'Profile Constraints:' AS section,
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

-- =============================================
-- 4. profiles 테이블의 인덱스 확인
-- =============================================

SELECT
  'Profile Indexes:' AS section,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND schemaname = 'public';

-- =============================================
-- 5. profiles 테이블 RLS 정책 확인
-- =============================================

SELECT
  'RLS Policies:' AS section,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- =============================================
-- 6. RLS 활성화 여부 확인
-- =============================================

SELECT
  'RLS Status:' AS section,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- =============================================
-- 7. profiles 테이블 구조 확인
-- =============================================

SELECT
  'Profile Columns:' AS section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =============================================
-- 8. auth.users에 tlduf1@naver.com 존재 여부 확인
-- =============================================

SELECT
  'User Check:' AS section,
  id,
  email,
  email_confirmed_at,
  created_at,
  deleted_at
FROM auth.users
WHERE email = 'tlduf1@naver.com';

-- =============================================
-- 9. profiles에 tlduf1@naver.com 존재 여부 확인
-- =============================================

SELECT
  'Profile Check:' AS section,
  id,
  email,
  role,
  user_type,
  created_at
FROM public.profiles
WHERE email = 'tlduf1@naver.com';

-- =============================================
-- 10. 최근 생성된 auth.users 확인
-- =============================================

SELECT
  'Recent Auth Users:' AS section,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- =============================================
-- 11. 최근 생성된 profiles 확인
-- =============================================

SELECT
  'Recent Profiles:' AS section,
  id,
  email,
  role,
  user_type,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
