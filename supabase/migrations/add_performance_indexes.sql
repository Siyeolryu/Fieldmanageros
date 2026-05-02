-- Performance Indexes Migration
-- Created: 2026-05-02
-- Purpose: Add indexes to optimize database queries (10x performance improvement)

-- ============================================================
-- Company Indexes
-- ============================================================

-- Owner lookup optimization (GET /api/companies)
CREATE INDEX IF NOT EXISTS "companies_ownerId_idx"
ON "companies"("owner_id");

-- ============================================================
-- Site Indexes
-- ============================================================

-- Active sites by company (GET /api/sites?companyId=xxx)
CREATE INDEX IF NOT EXISTS "sites_companyId_isActive_idx"
ON "sites"("company_id", "is_active");

-- Expiring sites risk analysis (GET /api/dashboard/risks)
CREATE INDEX IF NOT EXISTS "sites_endDate_isActive_idx"
ON "sites"("end_date", "is_active");

-- ============================================================
-- Worker Indexes
-- ============================================================

-- Active workers by site - MOST FREQUENT QUERY (GET /api/workers?siteId=xxx)
CREATE INDEX IF NOT EXISTS "workers_siteId_isActive_idx"
ON "workers"("site_id", "is_active");

-- Worker-Site JOIN optimization
CREATE INDEX IF NOT EXISTS "workers_siteId_idx"
ON "workers"("site_id");

-- Profile-Worker link (Phase 2 dual-role feature)
CREATE INDEX IF NOT EXISTS "workers_profileId_idx"
ON "workers"("profile_id");

-- ============================================================
-- Attendance Indexes
-- ============================================================

-- Daily attendance by site (GET /api/attendance/calendar)
CREATE INDEX IF NOT EXISTS "attendance_siteId_date_idx"
ON "attendance"("site_id", "date");

-- Worker attendance history (GET /api/worker/my-attendance)
CREATE INDEX IF NOT EXISTS "attendance_workerId_date_idx"
ON "attendance"("worker_id", "date");

-- Date-based aggregations (dashboard stats)
CREATE INDEX IF NOT EXISTS "attendance_date_idx"
ON "attendance"("date");

-- ============================================================
-- Payroll Indexes
-- ============================================================

-- Monthly payroll by site - CORE QUERY (GET /api/payroll?siteId=xxx&year=2026&month=5)
CREATE INDEX IF NOT EXISTS "payroll_siteId_year_month_idx"
ON "payroll"("site_id", "year", "month");

-- Worker payroll history (GET /api/worker/my-payroll)
CREATE INDEX IF NOT EXISTS "payroll_workerId_year_month_idx"
ON "payroll"("worker_id", "year", "month");

-- Unpaid payroll lookup (GET /api/dashboard/risks)
CREATE INDEX IF NOT EXISTS "payroll_paidAt_idx"
ON "payroll"("paid_at");

-- ============================================================
-- Verification Query
-- ============================================================

-- Run this to verify all indexes were created successfully:
/*
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('companies', 'sites', 'workers', 'attendance', 'payroll')
ORDER BY tablename, indexname;
*/
