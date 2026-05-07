-- =============================================
-- Supabase Auth → Profile 자동 생성 트리거 (수정 버전)
-- =============================================
-- 이 SQL을 Supabase Dashboard → SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new

-- =============================================
-- Step 1: 기존 트리거 및 함수 삭제
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =============================================
-- Step 2: Profile 자동 생성 함수
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Auth에서 새 사용자가 생성되면 Profile 테이블에도 자동 추가
  INSERT INTO public.profiles (id, email, role, user_type)
  VALUES (
    NEW.id::uuid,           -- Auth user ID를 UUID로 캐스팅
    NEW.email,              -- 이메일
    'manager',              -- 기본 role
    'manager'               -- 기본 user_type
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- 에러 발생 시 로그 출력 (Supabase Logs에서 확인 가능)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- =============================================
-- Step 3: 트리거 생성
-- =============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Step 4: RLS (Row Level Security) 정책 설정
-- =============================================

-- 4-1. 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;

-- 4-2. Service Role에게 모든 권한 부여 (트리거 작동 필수!)
CREATE POLICY "service_role_all_access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4-3. 인증된 사용자는 자신의 프로필 읽기 가능
CREATE POLICY "users_read_own_profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4-4. 인증된 사용자는 자신의 프로필 수정 가능
CREATE POLICY "users_update_own_profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4-5. RLS 활성화 확인
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 5: 완료 확인
-- =============================================

SELECT
  '✅ Auth 트리거 및 RLS 정책 설정 완료!' AS status,
  'Trigger: on_auth_user_created' AS trigger_name,
  'Function: handle_new_user()' AS function_name;
