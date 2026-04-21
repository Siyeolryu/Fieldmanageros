-- ════════════════════════════════════════
-- Dual-Role Support for Workers
-- 소규모 시공팀장이 관리자이면서 근로자인 경우 지원
-- ════════════════════════════════════════

-- Step 1: workers 테이블에 컬럼 추가
ALTER TABLE public.workers
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

-- Step 2: 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_workers_profile ON public.workers(profile_id);
CREATE INDEX IF NOT EXISTS idx_workers_owner ON public.workers(is_owner) WHERE is_owner = TRUE;

-- Step 3: 주석 추가 (문서화)
COMMENT ON COLUMN public.workers.profile_id IS
  '시스템 사용자와 연결 (팀장이 자기 자신을 근로자로 등록한 경우)
   - NULL: 일반 근로자 (시스템 미사용)
   - UUID: 프로필과 연결된 사용자 (팀장 본인 등)';

COMMENT ON COLUMN public.workers.is_owner IS
  '현장 소유자 (팀장) 여부
   - TRUE: 이 현장의 팀장/관리자
   - FALSE: 일반 근로자
   급여 명세서에서 구분 표시 및 세무 안내용';

-- Step 4: RLS (Row Level Security) 정책 업데이트
-- 기존 정책 제거 후 재생성

-- 조회 정책: 사용자는 자기가 속한 현장의 근로자만 조회 가능
DROP POLICY IF EXISTS "Users can view workers in their sites" ON public.workers;

CREATE POLICY "Users can view workers in their sites"
  ON public.workers FOR SELECT
  USING (
    -- 조건 1: 자기가 소유한 회사의 현장에 속한 근로자
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
    OR
    -- 조건 2: 본인이 근로자로 등록된 경우 (어느 현장이든 자기 자신은 조회 가능)
    profile_id = auth.uid()
  );

-- 삽입 정책: 사용자는 자기가 소유한 현장에만 근로자 추가 가능
DROP POLICY IF EXISTS "Users can insert workers in their sites" ON public.workers;

CREATE POLICY "Users can insert workers in their sites"
  ON public.workers FOR INSERT
  WITH CHECK (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- 수정 정책: 사용자는 자기가 소유한 현장의 근로자만 수정 가능
DROP POLICY IF EXISTS "Users can update workers in their sites" ON public.workers;

CREATE POLICY "Users can update workers in their sites"
  ON public.workers FOR UPDATE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- 삭제 정책: 사용자는 자기가 소유한 현장의 근로자만 삭제 가능
DROP POLICY IF EXISTS "Users can delete workers in their sites" ON public.workers;

CREATE POLICY "Users can delete workers in their sites"
  ON public.workers FOR DELETE
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Step 5: 헬퍼 뷰 생성 (선택적)
-- 근로자 조회 시 프로필 정보와 조인하여 편리하게 사용
CREATE OR REPLACE VIEW public.workers_with_profile AS
SELECT
  w.*,
  p.email AS profile_email,
  p.full_name AS profile_full_name,
  p.role AS profile_role,
  CASE
    WHEN w.profile_id IS NOT NULL THEN TRUE
    ELSE FALSE
  END AS is_system_user
FROM public.workers w
LEFT JOIN public.profiles p ON w.profile_id = p.id;

COMMENT ON VIEW public.workers_with_profile IS
  '근로자 정보 + 프로필 정보 조인 뷰
   - is_system_user: 시스템 사용자 여부 (프로필 연결 여부)
   - profile_*: 연결된 프로필 정보';

-- Step 6: 헬퍼 함수 생성 (선택적)
-- 특정 사용자가 특정 현장에서 근로자인지 확인
CREATE OR REPLACE FUNCTION public.is_user_worker_in_site(
  user_id UUID,
  site_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workers
    WHERE profile_id = user_id
    AND workers.site_id = is_user_worker_in_site.site_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_user_worker_in_site IS
  '특정 사용자가 특정 현장에 근로자로 등록되어 있는지 확인
   예: SELECT is_user_worker_in_site(auth.uid(), ''현장-uuid'');';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ Dual-role support migration completed successfully';
  RAISE NOTICE '📋 Added columns: profile_id, is_owner';
  RAISE NOTICE '🔐 Updated RLS policies for dual-role access';
  RAISE NOTICE '👁️  Created workers_with_profile view';
  RAISE NOTICE '🔧 Created helper function: is_user_worker_in_site()';
END $$;
