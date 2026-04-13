-- ════════════════════════════════════════
-- Utility Functions
-- 비즈니스 로직 함수
-- ════════════════════════════════════════

-- ════════════════════════════════════════
-- 8일 카운팅 계산 함수
-- 근로기준법 주휴일 계산: 8일 일하면 1일 주휴
-- ════════════════════════════════════════

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
  -- 근무일수 및 총 근무시간 계산
  SELECT COUNT(*), COALESCE(SUM(hours_worked), 0)
  INTO work_days, total_work_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND date BETWEEN p_start_date AND p_end_date
    AND is_weekly_holiday = FALSE; -- 주휴일 제외

  -- 8일 카운팅 (8일 일하면 1일 주휴)
  weekly_holiday_count := FLOOR(work_days / 8.0);

  RETURN QUERY SELECT work_days, weekly_holiday_count, total_work_hours;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_weekly_holiday IS '8일 카운팅 기반 주휴일 계산 (8일 근무 = 1일 주휴)';

-- ════════════════════════════════════════
-- 주휴수당 계산 함수
-- 주휴수당 = 주휴일수 × 평균 일 근무시간 × 시급
-- ════════════════════════════════════════

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
  month_start DATE;
  month_end DATE;
BEGIN
  -- 해당 월의 시작일과 종료일
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- 평균 일 근무시간 계산 (주휴일 제외)
  SELECT AVG(hours_worked)
  INTO avg_daily_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND date BETWEEN month_start AND month_end
    AND is_weekly_holiday = FALSE;

  -- 시급 조회
  SELECT w.hourly_rate
  INTO hourly_rate
  FROM public.workers w
  WHERE w.id = p_worker_id;

  -- 주휴일수 계산
  SELECT (calculate_weekly_holiday(
    p_worker_id,
    month_start,
    month_end
  )).weekly_holidays
  INTO weekly_holidays;

  -- 주휴수당 = 주휴일수 × 평균 일 근무시간 × 시급
  holiday_pay := ROUND(weekly_holidays * COALESCE(avg_daily_hours, 0) * hourly_rate);

  RETURN holiday_pay;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_weekly_holiday_pay IS '월별 주휴수당 자동 계산';

-- ════════════════════════════════════════
-- 월별 급여 자동 계산 함수
-- 기본급 + 주휴수당 - 4대보험 = 실수령액
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_monthly_payroll(
  p_worker_id UUID,
  p_site_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE(
  base_pay INTEGER,
  weekly_holiday_pay INTEGER,
  total_pay INTEGER,
  health_insurance INTEGER,
  pension_insurance INTEGER,
  employment_insurance INTEGER,
  income_tax INTEGER,
  total_deduction INTEGER,
  net_pay INTEGER
) AS $$
DECLARE
  v_total_hours NUMERIC;
  v_hourly_rate INTEGER;
  v_base_pay INTEGER;
  v_weekly_holiday_pay INTEGER;
  v_total_pay INTEGER;
  v_health_insurance INTEGER;
  v_pension_insurance INTEGER;
  v_employment_insurance INTEGER;
  v_income_tax INTEGER;
  v_total_deduction INTEGER;
  v_net_pay INTEGER;
  month_start DATE;
  month_end DATE;
BEGIN
  -- 해당 월의 시작일과 종료일
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- 총 근무시간
  SELECT COALESCE(SUM(hours_worked), 0)
  INTO v_total_hours
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND site_id = p_site_id
    AND date BETWEEN month_start AND month_end
    AND is_weekly_holiday = FALSE;

  -- 시급 조회
  SELECT hourly_rate
  INTO v_hourly_rate
  FROM public.workers
  WHERE id = p_worker_id;

  -- 기본급 = 총 근무시간 × 시급
  v_base_pay := ROUND(v_total_hours * v_hourly_rate);

  -- 주휴수당
  v_weekly_holiday_pay := calculate_weekly_holiday_pay(p_worker_id, p_year, p_month);

  -- 총 지급액
  v_total_pay := v_base_pay + v_weekly_holiday_pay;

  -- 4대 보험 (2026년 기준 예상 요율)
  -- 건강보험: 3.545% (본인 부담)
  v_health_insurance := ROUND(v_total_pay * 0.03545);

  -- 국민연금: 4.5% (본인 부담)
  v_pension_insurance := ROUND(v_total_pay * 0.045);

  -- 고용보험: 0.9% (본인 부담)
  v_employment_insurance := ROUND(v_total_pay * 0.009);

  -- 소득세 (간이세액표, 월급여 기준)
  -- 간단화: 월 200만원 이하 면세, 이상 6%
  IF v_total_pay <= 2000000 THEN
    v_income_tax := 0;
  ELSE
    v_income_tax := ROUND((v_total_pay - 2000000) * 0.06);
  END IF;

  -- 총 공제액
  v_total_deduction := v_health_insurance + v_pension_insurance + v_employment_insurance + v_income_tax;

  -- 실수령액
  v_net_pay := v_total_pay - v_total_deduction;

  RETURN QUERY SELECT
    v_base_pay,
    v_weekly_holiday_pay,
    v_total_pay,
    v_health_insurance,
    v_pension_insurance,
    v_employment_insurance,
    v_income_tax,
    v_total_deduction,
    v_net_pay;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_monthly_payroll IS '월별 급여 자동 계산 (기본급 + 주휴수당 - 4대보험 - 소득세)';

-- ════════════════════════════════════════
-- 급여 명세서 자동 생성 함수
-- attendance 데이터 기반으로 payroll 테이블에 INSERT
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_payroll(
  p_worker_id UUID,
  p_site_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_payroll_id UUID;
  v_payroll_data RECORD;
  v_work_days INTEGER;
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE(p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01');
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- 근무일수 계산
  SELECT COUNT(*)
  INTO v_work_days
  FROM public.attendance
  WHERE worker_id = p_worker_id
    AND site_id = p_site_id
    AND date BETWEEN month_start AND month_end;

  -- 급여 계산
  SELECT * INTO v_payroll_data
  FROM calculate_monthly_payroll(p_worker_id, p_site_id, p_year, p_month);

  -- Payroll INSERT (이미 존재하면 UPDATE)
  INSERT INTO public.payroll (
    worker_id,
    site_id,
    year,
    month,
    total_work_days,
    total_hours,
    base_pay,
    weekly_holiday_pay,
    total_pay,
    health_insurance,
    pension_insurance,
    employment_insurance,
    income_tax,
    total_deduction,
    net_pay
  )
  VALUES (
    p_worker_id,
    p_site_id,
    p_year,
    p_month,
    v_work_days,
    (SELECT SUM(hours_worked) FROM public.attendance
     WHERE worker_id = p_worker_id
       AND site_id = p_site_id
       AND date BETWEEN month_start AND month_end),
    v_payroll_data.base_pay,
    v_payroll_data.weekly_holiday_pay,
    v_payroll_data.total_pay,
    v_payroll_data.health_insurance,
    v_payroll_data.pension_insurance,
    v_payroll_data.employment_insurance,
    v_payroll_data.income_tax,
    v_payroll_data.total_deduction,
    v_payroll_data.net_pay
  )
  ON CONFLICT (worker_id, site_id, year, month)
  DO UPDATE SET
    total_work_days = EXCLUDED.total_work_days,
    total_hours = EXCLUDED.total_hours,
    base_pay = EXCLUDED.base_pay,
    weekly_holiday_pay = EXCLUDED.weekly_holiday_pay,
    total_pay = EXCLUDED.total_pay,
    health_insurance = EXCLUDED.health_insurance,
    pension_insurance = EXCLUDED.pension_insurance,
    employment_insurance = EXCLUDED.employment_insurance,
    income_tax = EXCLUDED.income_tax,
    total_deduction = EXCLUDED.total_deduction,
    net_pay = EXCLUDED.net_pay,
    updated_at = NOW()
  RETURNING id INTO v_payroll_id;

  RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_payroll IS '급여 명세서 자동 생성 (attendance 기반)';

-- ════════════════════════════════════════
-- Utility Functions 완료
--
-- 주요 기능:
-- 1. calculate_weekly_holiday: 8일 카운팅 계산
-- 2. calculate_weekly_holiday_pay: 주휴수당 계산
-- 3. calculate_monthly_payroll: 월급여 계산
-- 4. generate_payroll: 급여 명세서 자동 생성
-- ════════════════════════════════════════
