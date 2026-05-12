# 🔀 병렬 작업 체크리스트 (Parallel Work Checklist)

> **작업 날짜**: 2026년 4월 1일
> **목표**: Claude Code와 Antigravity가 동시에 작업하여 개발 속도 2배 향상
> **기준**: ORCHESTRATOR.md의 Phase 1 우선순위 작업 분할

---

## 📋 작업 분할 전략

### 원칙
- **Claude Code (이 세션)**: 백엔드, 데이터베이스, API, 인프라 담당
- **Antigravity**: 프론트엔드 UI/UX, React 컴포넌트, 사용자 인터랙션 담당
- **독립성**: 각 작업은 상대방 완료를 기다리지 않고 진행 가능
- **통합 시점**: 각 파트 완료 후 통합 테스트

---

## 🤖 Claude Code 작업 체크리스트

### Phase 1A: Supabase 백엔드 초기화 (2-4시간)

#### Step 1: Supabase 프로젝트 생성
- [x] ✅ `SUPABASE_INIT_GUIDE.md` 생성 - 완벽한 단계별 가이드 제공
- [x] ✅ Supabase.com 프로젝트 생성 완료
- [x] ✅ 새 프로젝트 생성 완료
  - Name: `nomu-pro`
  - Project ID: `ejgsotsviobjfvfqovcj`
  - Region: `Northeast Asia (Seoul)`
- [x] ✅ API Keys 확인 및 복사 완료
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Step 2: 데이터베이스 마이그레이션 실행
- [x] ✅ `MIGRATION_DASHBOARD_GUIDE.md` 생성 - 상세 실행 가이드 제공
- [ ] **사용자 작업 필요**: Supabase SQL Editor에서 마이그레이션 실행
  - [ ] `001_initial_schema.sql` 실행
  - [ ] `002_rls_policies.sql` 실행
  - [ ] `003_utility_functions.sql` 실행
  - [ ] `004_realtime.sql` 실행
- [ ] 테이블 생성 확인 (6개 테이블: profiles, companies, sites, workers, attendance, payroll)

#### Step 3: 환경 변수 설정
- [x] ✅ `.env.local` 파일 생성 완료
  - Project URL: https://ejgsotsviobjfvfqovcj.supabase.co
  - API Keys 설정 완료
  - Database connection strings 설정 완료
- [x] ✅ `.gitignore`에 `.env.local` 이미 포함됨

#### Step 4: Prisma 설정
- [x] ✅ `npx prisma generate` 실행 완료 (v5.22.0)
- [x] ✅ Prisma Client 생성 완료

#### Step 5: Supabase 클라이언트 검증
- [x] ✅ `lib/supabaseClient.ts` 파일 확인 완료
- [x] ✅ Tailwind CSS 4 오류 수정 완료
  - @tailwindcss/postcss 설치
  - postcss.config.js 업데이트
  - globals.css 업데이트
- [x] ✅ 개발 서버 실행 성공 (`http://localhost:3001`)
- [ ] **다음 단계**: SQL 마이그레이션 후 연결 테스트

### Phase 1B: API Routes 구현 (4-6시간)

#### API Route 1: Companies (건설사 관리)
- [ ] `app/api/companies/route.ts` 생성
  - [ ] GET - 목록 조회 (페이지네이션)
  - [ ] POST - 신규 건설사 등록
- [ ] `app/api/companies/[id]/route.ts` 생성
  - [ ] GET - 단일 건설사 조회
  - [ ] PATCH - 수정
  - [ ] DELETE - 삭제
- [ ] Postman/Thunder Client로 API 테스트

#### API Route 2: Sites (프로젝트/현장 관리)
- [ ] `app/api/sites/route.ts` 생성
  - [ ] GET - 현장 목록 (company_id 필터)
  - [ ] POST - 신규 현장 등록
- [ ] `app/api/sites/[id]/route.ts` 생성
  - [ ] GET, PATCH, DELETE
- [ ] API 테스트

#### API Route 3: Workers (근로자 관리)
- [ ] `app/api/workers/route.ts` 생성
  - [ ] GET - 근로자 목록 (site_id 필터)
  - [ ] POST - 신규 근로자 등록
- [ ] `app/api/workers/[id]/route.ts` 생성
  - [ ] GET, PATCH, DELETE
- [ ] API 테스트

#### API Route 4: Attendance (출근 기록) ⭐ 최우선
- [ ] `app/api/attendance/route.ts` 생성
  - [ ] GET - 출근 기록 조회 (날짜/근로자 필터)
  - [ ] POST - 출근 기록 등록
- [ ] `app/api/attendance/[id]/route.ts` 생성
  - [ ] PATCH - 수정 (근무 시간 변경)
  - [ ] DELETE - 삭제
- [ ] **성공 기준**: 출근 기록 1개를 POST → GET으로 확인
- [ ] API 테스트

#### API Route 5: Payroll (급여 명세)
- [ ] `app/api/payroll/route.ts` 생성
  - [ ] GET - 급여 명세 조회
  - [ ] POST - 급여 명세 생성 (자동 계산 로직 포함)
- [ ] `app/api/payroll/[id]/route.ts` 생성
  - [ ] GET, PATCH
- [ ] 급여 계산 로직 구현
  - 기본급 계산
  - 주휴수당 계산
  - 4대 보험 공제 계산
- [ ] API 테스트

### Phase 1C: 유틸리티 & 헬퍼 함수 (2-3시간)

#### 급여 계산 로직 (`lib/payroll.ts`)
- [ ] `calculateBasePay()` - 기본급 계산
- [ ] `calculateWeeklyHolidayPay()` - 주휴수당 계산
- [ ] `calculateInsurance()` - 4대 보험 계산
  - 건강보험 (2024년 기준 7.09%)
  - 국민연금 (4.5%)
  - 고용보험 (0.9%)
  - 산재보험 (업종별)
- [ ] `calculateIncomeTax()` - 소득세 계산
- [ ] `calculateNetPay()` - 실수령액 계산
- [ ] 단위 테스트 작성

#### 날짜 유틸리티 (`lib/dateUtils.ts`)
- [ ] `getWorkDaysInMonth()` - 월별 근무일수 계산
- [ ] `isWeeklyHoliday()` - 주휴일 판정
- [ ] `formatDate()` - 날짜 포맷팅
- [ ] 단위 테스트 작성

#### Supabase 헬퍼 (`lib/supabaseHelpers.ts`)
- [ ] `getUserProfile()` - 사용자 프로필 조회
- [ ] `checkAuth()` - 인증 확인
- [ ] `handleSupabaseError()` - 에러 핸들링

---

## 🎨 Antigravity 작업 체크리스트

### Phase 2A: React 컴포넌트 기본 구조 (3-4시간)

#### Step 1: 컴포넌트 디렉토리 구조
- [ ] `app/components/` 폴더 생성
- [ ] 폴더 구조 생성:
  ```
  app/components/
  ├── calendar/
  │   ├── CalendarView.tsx
  │   ├── CalendarDay.tsx
  │   └── CalendarHeader.tsx
  ├── workers/
  │   ├── WorkerList.tsx
  │   ├── WorkerCard.tsx
  │   └── WorkerForm.tsx
  ├── payroll/
  │   ├── PayrollSummary.tsx
  │   └── PayrollDetail.tsx
  └── ui/
      ├── Button.tsx
      ├── Modal.tsx
      └── BottomSheet.tsx
  ```

#### Step 2: UI 기본 컴포넌트 (`app/components/ui/`)
- [ ] `Button.tsx` - 재사용 가능한 버튼 컴포넌트
  - 크기: 최소 44x44px (rules.md 준수)
  - 색상: Blue, Green, Red 변형
  - Props: size, variant, onClick
- [ ] `Modal.tsx` - 모달 컴포넌트
  - 열기/닫기 애니메이션
  - 외부 클릭 시 닫기
- [ ] `BottomSheet.tsx` - 모바일 바텀 시트
  - 드래그로 닫기
  - 높이 조절 가능

#### Step 3: 달력 컴포넌트 ⭐ 최우선 (`app/components/calendar/`)
- [ ] `CalendarView.tsx` - 메인 달력 컨테이너
  - 월별 캘린더 렌더링
  - 날짜 선택 상태 관리
  - 8일 카운팅 로직 (rules.md 준수)
- [ ] `CalendarDay.tsx` - 개별 날짜 셀
  - 출근/결근 상태 표시
  - 클릭 이벤트 처리
  - 다중 선택 지원
- [ ] `CalendarHeader.tsx` - 월 선택 헤더
  - 이전/다음 달 버튼
  - 오늘로 이동 버튼

### Phase 2B: 근로자 관리 컴포넌트 (2-3시간)

#### `WorkerList.tsx` - 근로자 목록
- [ ] Supabase에서 근로자 목록 fetch
- [ ] 검색 필터 (이름, 전화번호)
- [ ] 정렬 기능 (이름순, 최근 등록순)
- [ ] 무한 스크롤 또는 페이지네이션

#### `WorkerCard.tsx` - 근로자 카드
- [ ] 근로자 정보 표시 (이름, 전화번호, 시급)
- [ ] 수정/삭제 버튼
- [ ] 출근 기록 바로가기

#### `WorkerForm.tsx` - 근로자 등록/수정 폼
- [ ] React Hook Form + Zod 검증
- [ ] 필드: 이름, 전화번호, 시급, 은행 정보
- [ ] 유효성 검사 (전화번호 형식, 시급 범위)
- [ ] API 연동 (POST/PATCH)

### Phase 2C: 급여 명세 컴포넌트 (2-3시간)

#### `PayrollSummary.tsx` - 급여 요약
- [ ] 이번 달 총 급여
- [ ] 4대 보험 공제액
- [ ] 실수령액
- [ ] 차트 표시 (recharts 활용)

#### `PayrollDetail.tsx` - 급여 상세
- [ ] 일별 근무 시간 표시
- [ ] 주휴수당 계산 내역
- [ ] PDF 다운로드 버튼
- [ ] Excel 내보내기 버튼

### Phase 2D: 상태 관리 (Zustand) (1-2시간)

#### `lib/store.ts` - 전역 상태 관리
- [ ] `useAuthStore` - 인증 상태
  - currentUser
  - isAuthenticated
  - login/logout
- [ ] `useCompanyStore` - 건설사 상태
  - selectedCompany
  - companies
- [ ] `useSiteStore` - 현장 상태
  - selectedSite
  - sites
- [ ] `useWorkerStore` - 근로자 상태
  - workers
  - selectedWorker
- [ ] `useAttendanceStore` - 출근 기록 상태
  - attendanceMap (날짜별)
  - selectedMonth

### Phase 2E: 페이지 구성 (2-3시간)

#### `app/dashboard/page.tsx` - 대시보드
- [ ] 오늘의 출근 현황
- [ ] 이번 주 급여 요약
- [ ] 최근 근로자 목록

#### `app/attendance/page.tsx` - 출근 관리
- [ ] CalendarView 컴포넌트 통합
- [ ] 날짜 선택 → 출근 기록 등록
- [ ] 일괄 처리 기능

#### `app/workers/page.tsx` - 근로자 관리
- [ ] WorkerList 컴포넌트 통합
- [ ] 검색 및 필터
- [ ] 신규 근로자 등록

#### `app/payroll/page.tsx` - 급여 명세
- [ ] PayrollSummary 컴포넌트 통합
- [ ] 월별 명세서 조회
- [ ] PDF/Excel 내보내기

---

## 🔗 통합 작업 (Both) (1-2시간)

### 최종 통합 테스트
- [ ] Claude Code: API 엔드포인트 모두 정상 작동 확인
- [ ] Antigravity: 모든 컴포넌트 렌더링 확인
- [ ] **통합 시나리오 1**: 근로자 등록 → 출근 기록 → 급여 명세 생성
- [ ] **통합 시나리오 2**: 달력에서 날짜 선택 → 출근 기록 저장 → DB 확인
- [ ] 에러 처리 확인 (네트워크 오류, 잘못된 입력)
- [ ] 모바일 반응형 테스트 (Chrome DevTools)
- [ ] 성능 테스트 (Lighthouse)

### 배포 준비
- [ ] Claude Code: `vercel.json` 설정
- [ ] Claude Code: 환경 변수 Vercel에 등록
- [ ] Antigravity: 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 첫 배포 실행 (`vercel`)

---

## 📊 진행 상황 트래킹

### Claude Code 진행률
```
Phase 1A (Supabase 초기화): ⬜⬜⬜⬜⬜ 0%
Phase 1B (API Routes):      ⬜⬜⬜⬜⬜ 0%
Phase 1C (유틸리티):        ⬜⬜⬜⬜⬜ 0%
```

### Antigravity 진행률
```
Phase 2A (컴포넌트 구조):   ⬜⬜⬜⬜⬜ 0%
Phase 2B (근로자 관리):     ⬜⬜⬜⬜⬜ 0%
Phase 2C (급여 명세):       ⬜⬜⬜⬜⬜ 0%
Phase 2D (상태 관리):       ⬜⬜⬜⬜⬜ 0%
Phase 2E (페이지):          ⬜⬜⬜⬜⬜ 0%
```

---

## 🎯 일일 목표

### Day 1 (오늘)
**Claude Code**:
- [ ] Supabase 프로젝트 생성 ✅
- [ ] 마이그레이션 실행 ✅
- [ ] `/api/attendance` 구현 ✅

**Antigravity**:
- [ ] 기본 UI 컴포넌트 (Button, Modal) ✅
- [ ] CalendarView 컴포넌트 ✅
- [ ] 달력 클릭 → 로컬 상태 저장 테스트 ✅

**성공 기준**: 달력에서 날짜를 클릭하면 출근 기록이 Supabase에 저장되고, 새로고침 후에도 유지됨

---

## 💬 협업 프로토콜

### 커뮤니케이션
- **Claude Code 완료 시**: 이 체크리스트 파일 업데이트 + 커밋 메시지에 "✅ [Phase 1A] Supabase 초기화 완료" 형식
- **Antigravity 완료 시**: 같은 방식으로 체크리스트 업데이트
- **충돌 방지**: Claude Code는 `/api`, `/lib` 폴더만 수정, Antigravity는 `/app/components`, `/app/[pages]` 수정

### 파일 분리 규칙
- **Claude Code 소유**:
  - `app/api/**/*`
  - `lib/**/*`
  - `prisma/**/*`
  - `supabase/**/*`

- **Antigravity 소유**:
  - `app/components/**/*`
  - `app/dashboard/**/*`
  - `app/attendance/**/*`
  - `app/workers/**/*`
  - `app/payroll/**/*`

- **공유**:
  - `app/layout.tsx`
  - `app/globals.css`
  - `package.json` (필요 시 소통 후 수정)

---

## 🚀 다음 단계

### Claude Code 시작 명령어
```bash
# Supabase 프로젝트 생성 후
cd C:\Users\tlduf\.cursor\projects\dev3_nomu
npm install
npx prisma generate
npm run dev
```

### Antigravity 시작 프롬프트
```
rules.md 파일을 확인하고, PARALLEL_WORK_CHECKLIST.md의
"Antigravity 작업 체크리스트 > Phase 2A"를 시작해줘.

첫 번째로 app/components/ui/Button.tsx 컴포넌트를 만들어줘.
- 최소 크기: 44x44px
- 변형: primary (blue), success (green), danger (red)
- TypeScript 타입 안전성 보장
```

---

**병렬 작업 시작 준비 완료!** 🎉
