-- ════════════════════════════════════════════════════════════════
-- Supabase Auth "Database error saving new user" 즉시 수정 SQL
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
-- 예상 실행 시간: ~10초
-- 영향 범위: profiles, workers 테이블만 수정 (데이터 손실 없음)
--
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════
-- STEP 1: Auth 트리거 완전 제거
-- ════════════════════════════════════════

DO $$
BEGIN
  -- Auth 트리거 확인
  RAISE NOTICE '🔍 Checking for Auth triggers...';

  -- 트리거 삭제 (있다면)
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

  RAISE NOTICE '✅ Auth triggers removed (if existed)';

  -- 관련 함수 삭제 (있다면)
  DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
  DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

  RAISE NOTICE '✅ Auth functions removed (if existed)';
END $$;

-- ════════════════════════════════════════
-- STEP 2: Profiles 테이블 스키마 업데이트
-- ════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '🔧 Updating profiles table schema...';

  -- user_type 컬럼 추가 (Prisma: userType)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'user_type'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN user_type TEXT DEFAULT 'manager'
    CHECK (user_type IN ('manager', 'both', 'worker'));

    RAISE NOTICE '✅ user_type column added';
  ELSE
    RAISE NOTICE '⏭️  user_type column already exists';
  END IF;

  -- hourly_rate 컬럼 추가 (Phase 2 dual-role용)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN hourly_rate INTEGER;

    RAISE NOTICE '✅ hourly_rate column added';
  ELSE
    RAISE NOTICE '⏭️  hourly_rate column already exists';
  END IF;

  -- bank_name 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN bank_name TEXT;

    RAISE NOTICE '✅ bank_name column added';
  ELSE
    RAISE NOTICE '⏭️  bank_name column already exists';
  END IF;

  -- bank_account 컬럼 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'bank_account'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN bank_account TEXT;

    RAISE NOTICE '✅ bank_account column added';
  ELSE
    RAISE NOTICE '⏭️  bank_account column already exists';
  END IF;

  -- 기존 레코드에 기본값 설정
  UPDATE public.profiles
  SET user_type = 'manager'
  WHERE user_type IS NULL;

  RAISE NOTICE '✅ Existing profiles updated with default user_type';
END $$;

-- ════════════════════════════════════════
-- STEP 3: Workers 테이블 스키마 업데이트
-- ════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '🔧 Updating workers table schema...';

  -- profile_id 컬럼 추가 (nullable - 일반 근로자는 프로필 없음)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workers'
      AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.workers
    ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

    RAISE NOTICE '✅ profile_id column added to workers';
  ELSE
    RAISE NOTICE '⏭️  profile_id column already exists in workers';
  END IF;

  -- is_owner 컬럼 추가 (현장 소유자 여부)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'workers'
      AND column_name = 'is_owner'
  ) THEN
    ALTER TABLE public.workers
    ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;

    RAISE NOTICE '✅ is_owner column added to workers';
  ELSE
    RAISE NOTICE '⏭️  is_owner column already exists in workers';
  END IF;
END $$;

-- ════════════════════════════════════════
-- STEP 4: 인덱스 추가 (성능 최적화)
-- ════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_workers_profile_id ON public.workers(profile_id);

DO $$ BEGIN RAISE NOTICE '✅ Index created: idx_workers_profile_id'; END $$;

-- ════════════════════════════════════════
-- STEP 5: RLS 정책 중복 제거 및 재생성
-- ════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '🔒 Updating RLS policies...';

  -- Companies 테이블 정책 정리
  DROP POLICY IF EXISTS "Users can view their own companies" ON public.companies;
  DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;

  CREATE POLICY "Users can view own companies"
    ON public.companies FOR SELECT
    USING (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can insert their own companies" ON public.companies;
  DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;

  CREATE POLICY "Users can insert own companies"
    ON public.companies FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
  DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;

  CREATE POLICY "Users can update own companies"
    ON public.companies FOR UPDATE
    USING (auth.uid() = owner_id);

  DROP POLICY IF EXISTS "Users can delete their own companies" ON public.companies;
  DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;

  CREATE POLICY "Users can delete own companies"
    ON public.companies FOR DELETE
    USING (auth.uid() = owner_id);

  RAISE NOTICE '✅ RLS policies updated for companies';
END $$;

-- ════════════════════════════════════════
-- STEP 6: 스키마 검증
-- ════════════════════════════════════════

DO $$
DECLARE
  column_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 Validating schema changes...';

  -- Profiles 테이블 필수 컬럼 확인
  SELECT COUNT(*)
  INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN ('user_type', 'hourly_rate', 'bank_name', 'bank_account');

  IF column_count = 4 THEN
    RAISE NOTICE '✅ Profiles table: All 4 columns exist';
  ELSE
    RAISE WARNING '⚠️  Profiles table: Missing columns (found % of 4)', column_count;
  END IF;

  -- Workers 테이블 필수 컬럼 확인
  SELECT COUNT(*)
  INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'workers'
    AND column_name IN ('profile_id', 'is_owner');

  IF column_count = 2 THEN
    RAISE NOTICE '✅ Workers table: All 2 columns exist';
  ELSE
    RAISE WARNING '⚠️  Workers table: Missing columns (found % of 2)', column_count;
  END IF;

  -- Auth 트리거 제거 확인
  SELECT COUNT(*)
  INTO column_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'auth'
    AND event_object_table = 'users';

  IF column_count = 0 THEN
    RAISE NOTICE '✅ Auth triggers: 0 triggers (clean)';
  ELSE
    RAISE WARNING '⚠️  Auth triggers: % triggers still exist', column_count;
  END IF;
END $$;

-- ════════════════════════════════════════
-- 실행 완료!
-- ════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. 로컬에서 "npx prisma generate" 실행';
  RAISE NOTICE '2. tlduf1@naver.com으로 회원가입 재테스트';
  RAISE NOTICE '3. Supabase Dashboard → Table Editor에서 profiles 테이블 확인';
  RAISE NOTICE '';
END $$;

-- ════════════════════════════════════════
-- 선택사항: 테이블 구조 확인
-- ════════════════════════════════════════

-- 주석 제거 후 실행하면 테이블 구조를 볼 수 있습니다:
-- SELECT
--   column_name,
--   data_type,
--   column_default,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'profiles'
-- ORDER BY ordinal_position;
