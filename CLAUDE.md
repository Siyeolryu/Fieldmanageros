# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**노무Pro (Nomu Pro)** - 건설 현장 인건비 신고 & 소득 관리 플랫폼 (Construction Site Labor Cost Reporting & Income Management Platform)

A B2B SaaS platform for construction site managers to track worker attendance, calculate payroll, manage 4대보험 (Korean mandatory insurances), and generate labor cost reports.

- **Framework:** Next.js 15.5.15 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma 5.10.2
- **Auth:** Supabase Auth (email + social login via Kakao/Naver)
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand 4.5.1
- **Testing:** Playwright (E2E)
- **UI Language:** Korean (한국어)

## Essential Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run postinstall      # Generate Prisma client (runs automatically after npm install)
npm run db:test          # Test database connection
npm run db:test-supabase # Test Supabase connection
npm run db:migrate       # Run migrations
npm run db:verify        # Verify database setup
npm run db:studio        # Open Prisma Studio GUI

# Testing
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:headed  # Run E2E tests with browser visible
npm run test:accessibility  # Run accessibility tests
npm run test:mobile      # Run mobile responsive tests
npm run test:dual-role   # Test dual-role features (manager + worker)
npm run test:report      # Show test report

# Git branches
# main - production branch
# db - database implementation branch (current working branch)
```

## Architecture Overview

### App Router Structure

```
app/
├── page.tsx                    # Landing page with quick signup
├── home/page.tsx               # Main dashboard (requires auth)
├── auth/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── confirm-email/page.tsx  # Email confirmation
│   └── callback/route.ts       # OAuth callback handler
├── dashboard/
│   ├── page.tsx                # Alternative dashboard view
│   ├── profile/page.tsx        # User profile settings
│   └── reports/page.tsx        # Reports view
├── companies/
│   ├── page.tsx                # Companies list
│   ├── [id]/page.tsx           # Company detail
│   └── new/page.tsx            # Create company
├── sites/
│   ├── page.tsx                # Sites list
│   ├── [id]/page.tsx           # Site detail (includes calendar)
│   └── new/page.tsx            # Create site
├── workers/page.tsx            # Workers management
├── payroll/page.tsx            # Payroll/노임대장 management
├── help/tax-guide/page.tsx     # Tax guidance page
├── components/                 # Reusable UI components
│   ├── ui/                     # Generic UI components
│   ├── calendar/               # Calendar components
│   ├── attendance/             # Attendance forms
│   ├── workers/                # Worker management
│   ├── payroll/                # Payroll components
│   ├── dashboard/              # Dashboard widgets
│   └── companies/              # Company components
└── api/                        # API routes
    ├── auth/                   # Auth endpoints
    ├── attendance/             # Attendance CRUD
    ├── workers/                # Workers CRUD
    ├── companies/              # Companies CRUD
    ├── sites/                  # Sites CRUD
    ├── payroll/                # Payroll generation & CRUD
    ├── dashboard/              # Dashboard stats/analytics
    └── excel/                  # Excel import/export
```

Most pages are client components (`'use client'`) for interactivity. API routes follow Next.js App Router convention.

### Path Aliases

- `@/*` maps to repository root (`./`)
- Example: `import Component from '@/app/components/ui/Button'`

### Database Schema (Prisma)

Five core models in `prisma/schema.prisma`:

1. **Profile** - User profiles (linked to Supabase Auth)
   - `id` (UUID from Supabase Auth)
   - `role`: admin, manager, viewer
   - `userType`: manager, both, worker (Phase 2: dual-role support)
   - Relations: owns Companies, optionally linked to Worker records

2. **Company** - Construction companies (건설사)
   - Owned by a Profile
   - Has many Sites

3. **Site** - Construction sites/projects (현장)
   - Belongs to a Company
   - Has many Workers, Attendance, Payroll
   - Includes `isActive`, `startDate`, `endDate`

4. **Worker** - Construction workers (근로자)
   - Belongs to a Site
   - `hourlyRate` (시급) - stored in KRW (원)
   - `profileId` (nullable) - Phase 2 feature linking workers to profiles
   - `isOwner` - marks site owner for tax purposes
   - Has many Attendance, Payroll records

5. **Attendance** - Daily attendance records (출근 기록)
   - Links Worker + Site + Date (unique constraint)
   - `hoursWorked` (Decimal 4,1)
   - `isWeeklyHoliday` - marks 주휴일 (weekly rest day)

6. **Payroll** - Monthly payroll statements (급여 명세)
   - Links Worker + Site + Year + Month (unique constraint)
   - Includes: basePay, weeklyHolidayPay, overtimePay, totalPay
   - Insurance deductions: healthInsurance, pensionInsurance, employmentInsurance
   - incomeTax, totalDeduction, netPay
   - `paidAt` timestamp when payment confirmed

### Authentication & Authorization

- **Supabase Auth**: Email/password + OAuth (Kakao, Naver)
- **Client-side auth**: `lib/supabase/client.ts` - for browser usage
- **Server-side auth**: `lib/supabase/server.ts` - for API routes/server components
- **State management**: Zustand stores in `lib/store.ts`:
  - `useAuthStore` - user session
  - `useAppStore` - selected company/site/worker
  - `useAttendanceStore` - attendance records cache

API routes should verify auth using:
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

const supabase = createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Core Business Logic

#### Payroll Calculation Engine (`lib/payroll/calculator.ts`)

The heart of the application. Calculates monthly payroll based on attendance records:

**Key features:**
- **Basic pay**: hourlyRate × totalHours
- **주휴수당 (Weekly holiday pay)**: If worker works ≥15 hours/week, pays average daily hours
- **연장근무 수당 (Overtime pay)**: 50% extra for hours beyond 40/week
- **4대보험 (4 mandatory insurances)**: Health (3.545%), Pension (4.5%), Employment (0.9%)
- **소득세 (Income tax)**: Progressive tax brackets based on monthly income
- **실수령액 (Net pay)**: Total pay - all deductions

Functions:
- `calculateMonthlyPayroll(workerData, year, month)` - single worker
- `calculateBatchPayroll(workersData, year, month)` - multiple workers

**Important**: All amounts in KRW (원), no decimals except `hoursWorked` (1 decimal place).

#### Excel Import/Export

- `lib/excel/parser.ts` - Parse Excel files for bulk attendance import
- `lib/excel/generator.ts` - Generate Excel reports (attendance, payroll)
- API routes:
  - `POST /api/excel/upload` - Bulk import
  - `GET /api/excel/download/attendance` - Export attendance
  - `GET /api/excel/download/payroll` - Export payroll

#### Date Handling

- All dates stored in PostgreSQL as `@db.Date` or `@db.Timestamptz`
- Use `lib/dateUtils.ts` for consistent date formatting
- Korean locale: `'2026.04.24 (목)'` format for display

## Frontend Patterns

### State Management with Zustand

Three stores in `lib/store.ts`:

```typescript
// Auth
const { user, setUser, logout } = useAuthStore()

// App context
const { selectedCompany, selectedSite, selectedWorker,
        setSelectedCompany, setSelectedSite, setSelectedWorker } = useAppStore()

// Attendance cache
const { attendanceRecords, selectedDate, isLoading,
        setAttendanceRecords, getAttendanceByDate } = useAttendanceStore()
```

### Component Patterns

- **Form handling**: React Hook Form + Zod validation (`lib/utils/validation.ts`)
- **Modals**: `app/components/ui/Modal.tsx` - reusable modal wrapper
- **Bottom sheets**: `app/components/ui/BottomSheet.tsx` - mobile-friendly
- **Tooltips**: `app/components/ui/Tooltip.tsx` - for help text
- **Toast notifications**: Sonner library

### Responsive Design

- Mobile-first approach
- Bottom tab navigation for mobile (`<768px`)
- Desktop header navigation (`≥768px`)
- Tailwind breakpoints: `md:` (768px+), `lg:` (1024px+)

### Styling Conventions

- Blue primary: `blue-600` (#2563EB)
- Gradient backgrounds: `from-blue-50 via-white to-indigo-50`
- Card design: `rounded-3xl shadow-sm border border-gray-100`
- Glassmorphism: `bg-white/80 backdrop-blur-md`
- Font weights: `font-bold` (700), `font-black` (900) for headings

## API Route Conventions

All API routes return JSON with consistent error handling:

```typescript
// Success
return NextResponse.json({ data: result })

// Error
return NextResponse.json({ error: 'Error message' }, { status: 400 })
```

### Key API Endpoints

**Authentication:**
- `POST /api/auth/quick-signup` - Email-based quick signup
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/callback` - OAuth callback

**Dashboard:**
- `GET /api/dashboard/overview` - Overview stats
- `GET /api/dashboard/stats?siteId=xxx` - Site-specific stats
- `GET /api/dashboard/costs?siteId=xxx` - Cost breakdown
- `GET /api/dashboard/risks?siteId=xxx` - Insurance risk alerts
- `GET /api/dashboard/compliance?siteId=xxx` - Compliance status

**Attendance:**
- `GET /api/attendance?siteId=xxx&date=YYYY-MM-DD` - Get attendance
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/[id]` - Update attendance
- `DELETE /api/attendance/[id]` - Delete attendance
- `GET /api/attendance/calendar?siteId=xxx&month=YYYY-MM` - Calendar view
- `POST /api/attendance/bulk-import` - Excel import
- `GET /api/attendance/range?siteId=xxx&start=xxx&end=xxx` - Date range

**Workers:**
- `GET /api/workers?siteId=xxx` - List workers
- `POST /api/workers` - Create worker
- `PUT /api/workers/[id]` - Update worker
- `DELETE /api/workers/[id]` - Delete worker

**Payroll:**
- `POST /api/payroll/generate` - Generate monthly payroll
- `GET /api/payroll?siteId=xxx&year=2026&month=4` - Get payroll records
- `POST /api/payroll/[id]/approve` - Approve payroll
- `POST /api/payroll/[id]/pay` - Mark as paid
- `POST /api/payroll/batch` - Batch operations

**Companies/Sites:**
- Standard CRUD operations following RESTful patterns

## Environment Variables

Required in `.env.local` (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://...?pgbouncer=true"  # Transaction pooler
DIRECT_URL="postgresql://...?pgbouncer=false"   # Direct connection for migrations

# Optional: AI features
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Testing

### E2E Tests with Playwright

Three test suites in `tests/e2e/`:

1. **`accessibility.spec.ts`** - WCAG compliance, keyboard navigation
2. **`mobile-responsive.spec.ts`** - Mobile UI, touch interactions
3. **`dual-role.spec.ts`** - Dual-role features (manager who is also a worker)

Configuration: `playwright.config.ts`
- Tests both desktop Chrome and mobile (iPhone 13)
- Auto-starts dev server on port 3000

### Running Tests

```bash
npm run test:e2e              # Headless
npm run test:e2e:ui           # Interactive UI
npm run test:e2e:headed       # See browser
npm run test:accessibility    # Just accessibility
npm run test:mobile           # Just mobile
npm run test:dual-role        # Just dual-role
```

## Korean Language Requirements

All user-facing text must be in Korean:

- **Companies**: "건설사"
- **Sites**: "현장" or "프로젝트"
- **Workers**: "근로자"
- **Attendance**: "출근 기록" or "출퇴근"
- **Payroll**: "노임대장" or "급여명세"
- **4대보험**: "건강보험, 국민연금, 고용보험, 산재보험"
- **주휴수당**: "Weekly holiday pay"
- **시급**: "Hourly rate"
- **일당**: "Daily wage"

Dates: Use Korean day format `'2026.04.24 (목)'`

## Development Workflow

### Adding a New Feature

1. **Database changes**: Update `prisma/schema.prisma`, run `npm run db:migrate`
2. **API route**: Create in `app/api/[feature]/route.ts`
3. **Frontend component**: Create in `app/components/[category]/`
4. **Page**: Create in `app/[feature]/page.tsx`
5. **State**: Add to Zustand stores if needed
6. **Types**: TypeScript types auto-generated from Prisma

### Common Tasks

**Adding a new worker:**
1. User selects site via `SiteSelector` (sets `useAppStore.selectedSite`)
2. Navigate to `/workers`
3. `WorkerForm` component → `POST /api/workers`
4. Backend validates, creates Worker record via Prisma
5. Frontend refreshes list

**Recording attendance:**
1. User selects date on `CalendarView` component
2. `AttendanceForm` → `POST /api/attendance`
3. Backend validates uniqueness (worker + site + date)
4. Frontend updates `useAttendanceStore`

**Generating payroll:**
1. User clicks "급여 생성" button
2. `PayrollGenerateModal` → `POST /api/payroll/generate`
3. Backend calls `calculateBatchPayroll()` from `lib/payroll/calculator.ts`
4. Creates Payroll records for all workers in selected month
5. Frontend shows generated payroll statements

## Performance Considerations

- Use `loading.tsx` files for page-level loading states
- Prisma queries should use `select` to limit fields
- Large lists (workers, attendance) should implement pagination
- Calendar view fetches one month at a time
- Excel exports are streamed for large datasets

## Known Issues & Future Work

- **Payment gateway integration**: Planned (토스페이먼츠)
- **Real-time updates**: Currently polling, consider WebSockets
- **Mobile app**: Progressive Web App (PWA) features not yet implemented
- **Multi-language**: Currently Korean only
- **Bulk operations**: Excel import works, but UI could be improved

## Git Workflow

- `main` branch: Production-ready code
- `db` branch: Current development branch (database integration)
- Feature branches: Create from appropriate base branch
- Commit messages: Use conventional commits format

## Deployment

Designed for Vercel deployment:

```bash
npx vercel
```

**Environment variables** must be set in Vercel dashboard:
- All Supabase keys
- Database URLs
- Any optional API keys (Anthropic, payment gateway)

## Database Scripts

Utility scripts in `scripts/`:

- `test-connection.ts` - Test PostgreSQL connection
- `test-supabase.ts` - Test Supabase client
- `run-migrations.ts` - Run Prisma migrations programmatically
- `verify-setup.ts` - Verify entire database setup
- `create-tables-supabase.ts` - Create tables via Supabase client (legacy)

Run with `tsx`:
```bash
npx tsx scripts/test-connection.ts
```

## TypeScript Configuration

- **Strict mode enabled** - all code must pass strict type checks
- **Path aliases**: `@/*` resolves to root
- **JSX**: `preserve` (Next.js handles transformation)
- **Target**: ES2017
- **Module resolution**: `bundler` (Next.js 15+ default)

When adding new files:
- No implicit `any`
- Proper type annotations for props and function returns
- Use Prisma-generated types where possible
- Interface definitions for API responses
