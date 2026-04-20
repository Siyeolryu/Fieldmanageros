-- ════════════════════════════════════════
-- Auto Profile Creation Trigger
-- auth.users에 사용자 생성 시 자동으로 profiles 생성
-- ════════════════════════════════════════

-- Step 1: 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'manager'  -- 기본 역할은 manager
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Supabase Auth에서 새 사용자 생성 시 자동으로 profiles 레코드 생성';

-- Step 2: 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  '새 사용자 가입 시 프로필 자동 생성 트리거';

-- Step 3: 기존 auth.users에 대해 누락된 profiles 생성 (선택적)
-- 이미 가입한 사용자가 있는데 profile이 없는 경우를 위한 복구용
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'manager'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'Auto profile creation trigger installed successfully';
END $$;
