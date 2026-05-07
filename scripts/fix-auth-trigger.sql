-- =============================================
-- Supabase Auth → Profile 자동 생성 트리거
-- =============================================
-- 이 SQL을 Supabase Dashboard → SQL Editor에서 실행하세요
-- https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new

-- 1. 기존 트리거 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Profile 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'manager',  -- 기본값: manager
    'manager',  -- 기본값: manager
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS 정책 확인 및 수정
-- Service Role이 모든 작업을 할 수 있도록 설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- 새로운 정책 생성
CREATE POLICY "Allow service role full access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. RLS 활성화 확인
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 완료!
SELECT '✅ Auth 트리거 및 RLS 정책 설정 완료!' AS status;
