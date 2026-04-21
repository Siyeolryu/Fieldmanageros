-- ════════════════════════════════════════
-- Add Worker Information to Profiles
-- profiles 테이블에 근로자 정보 추가 (선택적)
-- ════════════════════════════════════════

-- Step 1: profiles 테이블에 근로자 관련 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'manager' CHECK (user_type IN ('manager', 'both', 'worker')),
ADD COLUMN IF NOT EXISTS hourly_rate INTEGER,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Step 2: 주석 추가
COMMENT ON COLUMN public.profiles.user_type IS
  '사용자 역할 타입
   - manager: 관리자만 (현장 운영, 직접 작업 안 함)
   - both: 관리자 + 근로자 (소규모 팀장)
   - worker: 근로자만';

COMMENT ON COLUMN public.profiles.hourly_rate IS
  '본인의 시급 (user_type이 both 또는 worker일 때 사용)
   - NULL: 관리자만인 경우
   - 숫자: 시급 (원 단위)';

COMMENT ON COLUMN public.profiles.bank_name IS
  '급여 입금 은행명 (user_type이 both 또는 worker일 때 사용)';

COMMENT ON COLUMN public.profiles.bank_account IS
  '급여 입금 계좌번호 (user_type이 both 또는 worker일 때 사용)
   - 암호화 저장 권장';

-- Step 3: 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- Step 4: 기존 데이터 업데이트 (선택적)
-- 기존 사용자들은 기본값 'manager'로 설정됨
UPDATE public.profiles
SET user_type = 'manager'
WHERE user_type IS NULL;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Worker information added to profiles table';
  RAISE NOTICE '📋 Added columns: user_type, hourly_rate, bank_name, bank_account';
  RAISE NOTICE '🔍 Created index: idx_profiles_user_type';
END $$;
