"""
Supabase Database Agent
Supabase를 활용한 데이터베이스 설계 및 MCP 통합을 담당하는 AI 에이전트
"""

import asyncio
from typing import Optional, Dict, Any, List
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage, tool, create_sdk_mcp_server


class SupabaseDatabaseAgent:
    """Supabase Database Agent - Supabase DB 설계 및 MCP 통합"""

    def __init__(self):
        self.name = "Supabase Database Agent"
        self.description = "Supabase 데이터베이스 설계, 마이그레이션, MCP 통합"

    async def design_supabase_schema(
        self,
        requirements: List[str],
        enable_rls: bool = True,
        enable_realtime: bool = False
    ) -> Dict[str, Any]:
        """
        Supabase 데이터베이스 스키마 설계

        Args:
            requirements: 기능 요구사항
            enable_rls: Row Level Security 활성화
            enable_realtime: 실시간 구독 활성화

        Returns:
            Supabase SQL 스키마 및 설정
        """

        reqs_text = "\n".join([f"- {r}" for r in requirements])
        rls_note = "✅ Row Level Security 활성화" if enable_rls else "⚠️ RLS 비활성화 (보안 주의)"
        realtime_note = "✅ 실시간 구독 활성화" if enable_realtime else "실시간 구독 없음"

        prompt = f"""
당신은 Field Manager OS의 **Supabase Database Architect**입니다.
Supabase를 활용한 확장 가능한 데이터베이스를 설계하는 전문가입니다.

## 프로젝트 정보
- **도메인**: 건설 현장 일용직 출근 관리
- **Database**: Supabase (PostgreSQL + Extensions)
- **{rls_note}**
- **{realtime_note}**

## 기능 요구사항
{reqs_text}

## 수행할 작업

### 1. Supabase 스키마 설계

#### 1.1 테이블 구조 (SQL)

```sql
-- ════════════════════════════════════════
-- Field Manager OS - Supabase Schema
-- ════════════════════════════════════════

-- Extensions 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════ Users (인증은 Supabase Auth 사용) ════════
-- auth.users 테이블이 자동으로 생성되므로 프로필만 추가

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════ Companies (건설사) ════════
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_number TEXT,
  phone TEXT,
  address TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════ Sites (현장) ════════
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════ Workers (근로자) ════════
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  id_number TEXT, -- 주민등록번호 (암호화 권장)
  bank_name TEXT,
  bank_account TEXT,
  hourly_rate INTEGER NOT NULL, -- 시급 (원)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ════════ Attendance (출근 기록) ════════
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked NUMERIC(4,1) NOT NULL, -- 8.0, 8.5 등
  is_weekly_holiday BOOLEAN DEFAULT FALSE, -- 주휴일 여부
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, date) -- 한 근로자는 같은 날짜/현장에 한 번만
);

-- ════════ Payroll (급여 명세) ════════
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_work_days INTEGER,
  total_hours NUMERIC(6,1),
  base_pay INTEGER, -- 기본급
  weekly_holiday_pay INTEGER, -- 주휴수당
  overtime_pay INTEGER, -- 연장수당
  total_pay INTEGER, -- 총 지급액
  health_insurance INTEGER, -- 건강보험
  pension_insurance INTEGER, -- 국민연금
  employment_insurance INTEGER, -- 고용보험
  income_tax INTEGER, -- 소득세
  total_deduction INTEGER, -- 총 공제액
  net_pay INTEGER, -- 실수령액
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, site_id, year, month)
);

-- ════════ Indexes ════════
CREATE INDEX idx_companies_owner ON public.companies(owner_id);
CREATE INDEX idx_sites_company ON public.sites(company_id);
CREATE INDEX idx_workers_site ON public.workers(site_id);
CREATE INDEX idx_attendance_worker ON public.attendance(worker_id);
CREATE INDEX idx_attendance_site ON public.attendance(site_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_payroll_worker ON public.payroll(worker_id);
CREATE INDEX idx_payroll_period ON public.payroll(year, month);

-- ════════ Updated_at Trigger ════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2. Row Level Security (RLS) 정책

{"" if not enable_rls else '''
```sql
-- ════════ Enable RLS ════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- ════════ Profiles Policies ════════
-- 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ════════ Companies Policies ════════
-- 소유자만 자신의 건설사 조회/수정/삭제 가능
CREATE POLICY "Users can view own companies"
  ON public.companies FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own companies"
  ON public.companies FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own companies"
  ON public.companies FOR DELETE
  USING (auth.uid() = owner_id);

-- ════════ Sites Policies ════════
CREATE POLICY "Users can view sites of own companies"
  ON public.sites FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage sites of own companies"
  ON public.sites FOR ALL
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- ════════ Workers Policies ════════
CREATE POLICY "Users can view workers of own sites"
  ON public.workers FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage workers of own sites"
  ON public.workers FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════ Attendance Policies ════════
CREATE POLICY "Users can view attendance of own sites"
  ON public.attendance FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage attendance of own sites"
  ON public.attendance FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

-- ════════ Payroll Policies ════════
CREATE POLICY "Users can view payroll of own sites"
  ON public.payroll FOR SELECT
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage payroll of own sites"
  ON public.payroll FOR ALL
  USING (
    site_id IN (
      SELECT s.id FROM public.sites s
      JOIN public.companies c ON s.company_id = c.id
      WHERE c.owner_id = auth.uid()
    )
  );
```
'''}

### 3. Supabase 실시간 구독 설정

{"" if not enable_realtime else '''
```sql
-- ════════ Realtime 활성화 ════════
-- Supabase Dashboard → Database → Replication 에서도 설정 가능

ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sites;

-- 클라이언트에서 실시간 구독 예시:
-- const subscription = supabase
--   .channel('attendance-changes')
--   .on('postgres_changes', {{
--     event: '*',
--     schema: 'public',
--     table: 'attendance'
--   }}, (payload) => {{
--     console.log('Change received!', payload);
--   }})
--   .subscribe();
```
'''}

### 4. 유틸리티 함수 (Supabase Functions)

```sql
-- ════════ 8일 카운팅 계산 함수 ════════
CREATE OR REPLACE FUNCTION calculate_weekly_holiday(
  p_worker_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_days INTEGER,
  weekly_holidays INTEGER,
  total_hours NUMERIC
) AS $$
DECLARE
  work_days INTEGER;
  weekly_holiday_count INTEGER;
  total_work_hours NUMERIC;
BEGIN
  -- 근무일수 계산
  SELECT COUNT(*), SUM(hours_worked)
  INTO work_days, total_work_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND date BETWEEN p_start_date AND p_end_date;

  -- 8일 카운팅 (8일 일하면 1일 주휴)
  weekly_holiday_count := FLOOR(work_days / 8);

  RETURN QUERY SELECT work_days, weekly_holiday_count, total_work_hours;
END;
$$ LANGUAGE plpgsql;

-- ════════ 주휴수당 계산 함수 ════════
CREATE OR REPLACE FUNCTION calculate_weekly_holiday_pay(
  p_worker_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  avg_daily_hours NUMERIC;
  hourly_rate INTEGER;
  weekly_holidays INTEGER;
  holiday_pay INTEGER;
BEGIN
  -- 평균 일 근무시간 계산
  SELECT AVG(hours_worked)
  INTO avg_daily_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month;

  -- 시급 조회
  SELECT w.hourly_rate
  INTO hourly_rate
  FROM public.workers w
  WHERE w.id = p_worker_id;

  -- 주휴일수 계산
  SELECT (calculate_weekly_holiday(
    p_worker_id,
    DATE(p_year || '-' || p_month || '-01'),
    DATE(p_year || '-' || p_month || '-01') + INTERVAL '1 month' - INTERVAL '1 day'
  )).weekly_holidays
  INTO weekly_holidays;

  -- 주휴수당 = 주휴일수 × 평균 일 근무시간 × 시급
  holiday_pay := ROUND(weekly_holidays * COALESCE(avg_daily_hours, 0) * hourly_rate);

  RETURN holiday_pay;
END;
$$ LANGUAGE plpgsql;
```

### 5. 샘플 데이터 (개발용)

```sql
-- ════════ 테스트 데이터 삽입 ════════
-- 실제 사용 시 auth.users를 통해 가입 후 프로필 생성

-- 건설사
INSERT INTO public.companies (name, business_number, owner_id) VALUES
  ('더존하우징', '123-45-67890', 'USER_UUID_HERE');

-- 현장
INSERT INTO public.sites (company_id, name, location, start_date) VALUES
  ((SELECT id FROM public.companies LIMIT 1), '곤지암삼리', '경기도 광주시 곤지암읍', '2026-01-01');

-- 근로자
INSERT INTO public.workers (site_id, name, phone, hourly_rate) VALUES
  ((SELECT id FROM public.sites LIMIT 1), '홍길동', '010-1234-5678', 15000),
  ((SELECT id FROM public.sites LIMIT 1), '김철수', '010-2345-6789', 16000);

-- 출근 기록
INSERT INTO public.attendance (worker_id, site_id, date, hours_worked) VALUES
  ((SELECT id FROM public.workers WHERE name = '홍길동'), (SELECT id FROM public.sites LIMIT 1), '2026-03-01', 8.0),
  ((SELECT id FROM public.workers WHERE name = '홍길동'), (SELECT id FROM public.sites LIMIT 1), '2026-03-02', 8.0),
  ((SELECT id FROM public.workers WHERE name = '김철수'), (SELECT id FROM public.sites LIMIT 1), '2026-03-01', 8.5);
```

## 출력 형식

다음을 포함한 상세 Supabase 설정 가이드를 작성하세요:

1. **완전한 SQL 스키마** (CREATE TABLE, INDEX, TRIGGER)
2. **RLS 정책** (보안 정책)
3. **실시간 구독 설정** (필요 시)
4. **유틸리티 함수** (8일 카운팅, 주휴수당 계산)
5. **마이그레이션 가이드** (Supabase Dashboard 또는 CLI)
6. **클라이언트 연동 예시** (JavaScript/TypeScript)

Field Manager OS의 요구사항을 완벽히 반영한 Supabase 스키마를 작성하세요.
"""

        result = {
            "status": "pending",
            "schema_sql": "",
            "cost_usd": 0.0,
            "session_id": None
        }

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=[
                    "Read", "Glob", "Grep",
                    "Write",
                    "WebSearch"
                ],
                effort="high",
                max_turns=20,
                setting_sources=["project"],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for content in message.message.content:
                    if hasattr(content, 'text'):
                        print(f"[Supabase DB] {content.text[:100]}...")

            if isinstance(message, ResultMessage):
                if message.subtype == "success":
                    result["status"] = "success"
                    result["schema_sql"] = message.result
                    result["cost_usd"] = message.total_cost_usd
                    result["session_id"] = message.session_id
                else:
                    result["status"] = "error"
                    result["error"] = message.subtype

        return result


async def main():
    """테스트 실행"""
    agent = SupabaseDatabaseAgent()

    print("\n" + "="*60)
    print("Supabase Database Agent 테스트")
    print("="*60 + "\n")

    result = await agent.design_supabase_schema(
        requirements=[
            "건설사/현장 관리",
            "근로자 출근 기록",
            "8일 카운팅 시스템",
            "주휴수당 자동 계산",
            "급여 명세서 생성",
            "실시간 출근 현황 (선택)"
        ],
        enable_rls=True,
        enable_realtime=True
    )

    print(f"✅ Supabase 스키마 생성 완료")
    print(f"💰 비용: ${result['cost_usd']:.4f}\n")
    print("="*60)
    print(result['schema_sql'][:1000])
    print("\n... (계속)")


if __name__ == "__main__":
    asyncio.run(main())
