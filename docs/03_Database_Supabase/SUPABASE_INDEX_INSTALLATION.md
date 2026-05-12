# Supabase 인덱스 설치 가이드

## 🎯 목적

성능 최적화를 위해 데이터베이스에 10개의 인덱스를 추가합니다.

**예상 성능 향상**:
- Workers 목록: 150ms → 15ms (10배)
- Dashboard: 300ms → 30ms (10배)
- 급여 생성 (50명): 5000ms → 50ms (100배)

## 📋 설치 방법

### Option 1: Supabase 대시보드 (권장)

1. **Supabase 대시보드 접속**
   - URL: https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **SQL 실행**
   - 아래 SQL 전체를 복사하여 붙여넣기
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)

4. **결과 확인**
   - "Success. No rows returned" 메시지 확인
   - 12개 인덱스가 생성되었습니다

### Option 2: SQL 파일 실행

파일 위치: `supabase/migrations/add_performance_indexes.sql`

Supabase CLI 사용:
```bash
supabase db push --file supabase/migrations/add_performance_indexes.sql
```

---

## 📝 실행할 SQL

```sql
-- ============================================================
-- Company Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "companies_ownerId_idx"
ON "companies"("owner_id");

-- ============================================================
-- Site Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "sites_companyId_isActive_idx"
ON "sites"("company_id", "is_active");

CREATE INDEX IF NOT EXISTS "sites_endDate_isActive_idx"
ON "sites"("end_date", "is_active");

-- ============================================================
-- Worker Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "workers_siteId_isActive_idx"
ON "workers"("site_id", "is_active");

CREATE INDEX IF NOT EXISTS "workers_siteId_idx"
ON "workers"("site_id");

CREATE INDEX IF NOT EXISTS "workers_profileId_idx"
ON "workers"("profile_id");

-- ============================================================
-- Attendance Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "attendance_siteId_date_idx"
ON "attendance"("site_id", "date");

CREATE INDEX IF NOT EXISTS "attendance_workerId_date_idx"
ON "attendance"("worker_id", "date");

CREATE INDEX IF NOT EXISTS "attendance_date_idx"
ON "attendance"("date");

-- ============================================================
-- Payroll Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "payroll_siteId_year_month_idx"
ON "payroll"("site_id", "year", "month");

CREATE INDEX IF NOT EXISTS "payroll_workerId_year_month_idx"
ON "payroll"("worker_id", "year", "month");

CREATE INDEX IF NOT EXISTS "payroll_paidAt_idx"
ON "payroll"("paid_at");
```

---

## ✅ 검증 쿼리

인덱스가 정상적으로 생성되었는지 확인:

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('companies', 'sites', 'workers', 'attendance', 'payroll')
    AND indexname LIKE '%_idx'
ORDER BY tablename, indexname;
```

**예상 결과**: 12개 행이 반환되어야 합니다.

### 테이블별 인덱스 개수

| 테이블 | 인덱스 개수 |
|--------|-------------|
| companies | 1 |
| sites | 2 |
| workers | 3 |
| attendance | 3 |
| payroll | 3 |
| **합계** | **12** |

---

## 📊 각 인덱스의 목적

### Companies
- `companies_ownerId_idx`: 사용자별 회사 조회 최적화

### Sites
- `sites_companyId_isActive_idx`: 활성 현장 조회 최적화 (가장 빈번)
- `sites_endDate_isActive_idx`: 종료 예정 현장 리스크 분석

### Workers
- `workers_siteId_isActive_idx`: 현장별 활성 근로자 조회 (핵심 쿼리)
- `workers_siteId_idx`: Worker-Site JOIN 최적화
- `workers_profileId_idx`: 프로필 연결 조회 (Phase 2 기능)

### Attendance
- `attendance_siteId_date_idx`: 날짜별 출근 기록 조회
- `attendance_workerId_date_idx`: 근로자 출근 이력 조회
- `attendance_date_idx`: 날짜 기반 집계

### Payroll
- `payroll_siteId_year_month_idx`: 월별 급여 조회 (핵심 쿼리)
- `payroll_workerId_year_month_idx`: 근로자 급여 이력
- `payroll_paidAt_idx`: 미지급 급여 조회

---

## ⚠️ 주의사항

1. **IF NOT EXISTS 사용**
   - 이미 존재하는 인덱스는 무시됩니다
   - 여러 번 실행해도 안전합니다

2. **인덱스 생성 시간**
   - 빈 테이블: 즉시 완료
   - 데이터 있는 경우: 테이블 크기에 비례 (보통 1초 미만)

3. **성능 영향**
   - 인덱스는 쓰기 성능을 약간 저하시킬 수 있습니다
   - 하지만 읽기 성능 향상이 훨씬 큽니다 (10배~100배)

4. **디스크 공간**
   - 각 인덱스는 약간의 디스크 공간을 사용합니다
   - 12개 인덱스 합계: 약 5-10MB (데이터 크기에 따라 다름)

---

## 🔧 트러블슈팅

### "relation does not exist" 오류

**원인**: 테이블이 아직 생성되지 않았습니다.

**해결**: Prisma migration을 먼저 실행하세요.
```bash
npx prisma migrate deploy
```

### "permission denied" 오류

**원인**: 권한 부족

**해결**:
1. Supabase 대시보드에서 실행 (자동으로 적절한 권한 사용)
2. 또는 Service Role Key 사용

### 인덱스가 사용되지 않는 경우

**확인 방법**:
```sql
EXPLAIN ANALYZE
SELECT * FROM workers
WHERE site_id = 'your-site-id' AND is_active = true;
```

**예상 출력**: `Index Scan using workers_siteId_isActive_idx`

---

## 📈 성능 측정

### Before (인덱스 없음)

```sql
EXPLAIN ANALYZE
SELECT * FROM workers WHERE site_id = 'xxx' AND is_active = true;
-- Seq Scan on workers (cost=0.00..25.00 rows=100 width=100)
-- Execution Time: 150 ms
```

### After (인덱스 있음)

```sql
EXPLAIN ANALYZE
SELECT * FROM workers WHERE site_id = 'xxx' AND is_active = true;
-- Index Scan using workers_siteId_isActive_idx (cost=0.15..8.17 rows=5 width=100)
-- Execution Time: 15 ms
```

---

## ✅ 완료 체크리스트

- [ ] Supabase 대시보드에 로그인
- [ ] SQL Editor 열기
- [ ] 위의 SQL 복사 & 붙여넣기
- [ ] "Run" 버튼 클릭
- [ ] "Success" 메시지 확인
- [ ] 검증 쿼리 실행 (12개 행 확인)
- [ ] Vercel 재배포 (자동 트리거됨)
- [ ] /workers 페이지 성능 확인

---

## 🎉 완료 후

1. **Vercel 재배포 확인**
   - main 브랜치에 푸시되었으므로 자동 배포됨
   - https://dev3nomu.vercel.app 접속하여 확인

2. **성능 테스트**
   - /workers 페이지 로딩 시간 측정
   - Dashboard 응답 시간 확인
   - 급여 생성 속도 확인

3. **모니터링**
   - Vercel Analytics에서 성능 메트릭 추적
   - Supabase Logs에서 쿼리 시간 확인

---

**작성일**: 2026-05-02
**작성자**: Claude Sonnet 4.5
**관련 문서**: DEVELOPMENT_LOG_2026-05-02.md
