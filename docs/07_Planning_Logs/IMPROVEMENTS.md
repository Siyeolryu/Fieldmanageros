# 노무Pro - 프로젝트 전체 개선 사항

## 개요
**작성일**: 2026-04-28
**현재 브랜치**: db
**최신 커밋**: feat: 랜딩 페이지 정리 및 테스트 스크립트 추가 (326d926)

2026-04-28 기준 프로젝트 전체 점검 결과 및 개선 사항

---

## 📊 프로젝트 현황 요약

### ✅ 완료된 주요 기능

#### 백엔드 (API & 비즈니스 로직)
- ✅ **급여 계산 엔진** (`lib/payroll/calculator.ts`) - 완벽 구현
  - 기본급, 주휴수당, 연장근무 수당 자동 계산
  - 4대보험 공제 (건강보험 3.545%, 국민연금 4.5%, 고용보험 0.9%)
  - 소득세 누진 구간 적용
  - 주차별 그룹핑 및 주 40시간 기준 연장근무 계산

- ✅ **Excel 파싱 로직** (`lib/excel/parser.ts`)
  - 출근 데이터 파싱 (`parseAttendanceExcel`)
  - 근로자 데이터 파싱 (`parseWorkersExcel`)
  - 노임대장 복합 파싱 (`parsePayrollLedgerExcel`)

- ✅ **API 엔드포인트** (40개 이상)
  - `/api/auth/*` - 인증 (quick-signup, logout)
  - `/api/companies/*` - 건설사 CRUD + 통계
  - `/api/sites/*` - 현장 CRUD + 대시보드 + 월간 리포트
  - `/api/workers/*` - 근로자 CRUD
  - `/api/attendance/*` - 출근 CRUD + 캘린더 + 일괄 임포트
  - `/api/payroll/*` - 급여 생성/조회/승인/지급
  - `/api/dashboard/*` - 대시보드 통계/비용/위험/컴플라이언스
  - `/api/excel/*` - 업로드/다운로드
  - `/api/correction-requests/*` - 출근 기록 수정 요청 (새로 추가됨)
  - `/api/worker/*` - 근로자 전용 (my-attendance, my-payroll)

- ✅ **데이터베이스 스키마** (Prisma)
  - 6개 모델: Profile, Company, Site, Worker, Attendance, Payroll
  - **CorrectionRequest 모델** - 근로자 출근 수정 요청 기능 (Phase 2 기능)
  - 모든 관계 설정 완료 (Cascade, SetNull)
  - 유니크 제약 조건 설정

- ✅ **상태 관리** (Zustand)
  - `useAuthStore` - 인증 + 게스트 모드 + 역할 전환
  - `useAppStore` - 선택된 회사/현장/근로자
  - `useAttendanceStore` - 출근 기록 캐싱
  - `useGuestStore` - 게스트 모드 localStorage 기반 저장

#### 프론트엔드 (UI/UX)
- ✅ **페이지 구조** (44개 페이지 빌드 성공)
  - 랜딩 페이지 (`/`) - 게스트 모드 버튼, 소셜 로그인
  - 홈 대시보드 (`/home`) - 관리자/근로자 역할 전환 UI
  - 회사/현장/근로자/급여/출근/수정요청 페이지
  - 인증 페이지 (로그인/회원가입/이메일 확인)

- ✅ **컴포넌트** (27개)
  - UI: Modal, BottomSheet, Button, Tooltip, SiteSelector
  - Calendar: CalendarView, CalendarDay, CalendarHeader
  - Dashboard: CostChart, RiskRadar, TaxNotification, CostSplitterModal
  - Forms: WorkerForm, CompanyForm, SiteForm, AttendanceForm, BulkAttendanceForm
  - Payroll: PayrollGenerateModal, PayrollStatement
  - Auth: AuthForm, UserNav
  - Excel: ExcelUploadModal
  - Corrections: CorrectionRequestModal (새로 추가됨)

- ✅ **게스트 모드**
  - 로그인 없이 UI 체험 가능
  - localStorage 기반 데이터 저장
  - 실제 DB 저장 시 로그인 유도

- ✅ **소셜 로그인**
  - 카카오 로그인 (Supabase OAuth)
  - 네이버 로그인 (Supabase OAuth)
  - 이메일 기반 Quick Signup

#### 개발 환경
- ✅ **빌드 성공** (23.3초, 타입/린트 에러 무시 중)
- ✅ **Playwright E2E 테스트**
  - 접근성 테스트 (`tests/e2e/accessibility.spec.ts`)
  - 모바일 반응형 테스트 (`tests/e2e/mobile-responsive.spec.ts`)
  - 이중 역할 테스트 (`tests/e2e/dual-role.spec.ts`)

- ✅ **데이터베이스 스크립트**
  - `test-connection.ts` - PostgreSQL 연결 테스트
  - `test-supabase.ts` - Supabase 클라이언트 테스트
  - `run-migrations.ts` - Prisma 마이그레이션 실행
  - `verify-setup.ts` - 전체 DB 설정 검증

- ✅ **Git Commit Hash 기반 Build ID** (Phase 2 완료!)
  - `next.config.mjs`에 이미 구현됨
  - Git 없을 시 타임스탬프 fallback

- ✅ **보안 헤더 설정**
  - X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
  - Referrer-Policy, Permissions-Policy
  - API 캐시 설정

---

## 🔴 Critical (즉시 개선 필요)

### 1. TypeScript/ESLint 에러 수정 ⭐ 최우선

**현재 상태**:
```javascript
// next.config.mjs
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
```

**발견된 에러** (npm run lint 결과):
```
./app/api/attendance/calendar/route.ts
40:18  Error: Unexpected any. Specify a different type.

./app/api/attendance/conflicts/route.ts
84:67  Error: Unexpected any. Specify a different type.
96:32  Warning: 'key' is defined but never used.

./app/api/attendance/[id]/route.ts
58:23  Error: Unexpected any. Specify a different type.

./app/api/companies/[id]/route.ts
53:23  Error: Unexpected any. Specify a different type.

./app/api/correction-requests/route.ts
24:18  Error: Unexpected any. Specify a different type.
68:19  Error: Unexpected any. Specify a different type.
133:19  Error: Unexpected any. Specify a different type.

./app/api/correction-requests/[id]/approve/route.ts
74:23  Error: Unexpected any. Specify a different type.
```

**총 7개 `any` 타입 에러, 1개 unused 변수**

**해결 방안**:
1. 각 API 라우트의 `any` 타입을 명시적 타입으로 변경
2. `app/api/attendance/conflicts/route.ts:96` - 미사용 `key` 변수 제거
3. 모든 타입 에러 수정 후 `ignoreBuildErrors: false`로 변경
4. CI/CD에서 타입 체크 실패 시 빌드 차단

**우선순위**: 🔴 **CRITICAL** - 프로덕션 배포 전 필수

---

### 2. `/api/debug` 엔드포인트 보안 강화 또는 제거

**현재 상태**:
- 모든 환경에서 접근 가능
- 환경 변수 설정 여부 노출

**해결 방안 1**: 개발 환경에서만 활성화
```typescript
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production' },
      { status: 403 }
    )
  }
  // ... 기존 코드
}
```

**해결 방안 2**: 완전 삭제 (권장)

**우선순위**: 🔴 **HIGH**

---

### 3. `next lint` Deprecated 경고 해결

**현재 상태**:
```
`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .
```

**해결 방안**:
1. ESLint CLI로 마이그레이션
2. `package.json` 스크립트 변경: `"lint": "eslint ."`
3. `.eslintrc.json` 설정 업데이트

**우선순위**: 🟡 **MEDIUM** (Next.js 16 업그레이드 전에 해결)

---

### 4. 미완료 커밋 처리

**현재 상태** (git status):
```
M app/page.tsx
M lib/store.ts
M utils/supabase/middleware.ts
```

**해결 방안**:
1. 변경 사항 리뷰
2. 테스트 후 커밋
3. `db` 브랜치에서 `main` 브랜치로 PR 생성

**우선순위**: 🟡 **MEDIUM**

---

## 🟡 Medium (정식 출시 전 개선 권장)

### 5. Excel 생성 로직 확인 필요

**현재 상태**:
- `lib/excel/generator.ts` 파일 존재 확인 필요
- API `/api/excel/download/attendance`, `/api/excel/download/payroll` 존재

**확인 사항**:
1. Excel 다운로드 기능 동작 확인
2. 노임대장 양식 정확성 검증
3. 대용량 데이터 처리 성능 테스트

**우선순위**: 🟡 **MEDIUM**

---

### 6. 환경 변수 검증 로직 추가

**현재 상태**:
- `.env.example` 존재하지만 빌드 시 검증 없음

**해결 방안**:
```javascript
// next.config.mjs 상단에 추가
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
]

if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`❌ Missing required environment variable: ${envVar}`)
    }
  })
}
```

**우선순위**: 🟡 **MEDIUM**

---

### 7. 근로자 역할 전환 기능 테스트

**현재 상태**:
- `useAuthStore`에 `activeRole` 상태 존재
- `/home` 페이지에서 관리자/근로자 메뉴 구분
- `/api/worker/*` 엔드포인트 존재

**확인 필요**:
1. `/worker/my-info` 페이지 구현 확인
2. 역할 전환 시 UI 변경 테스트
3. 근로자가 자신의 출근/급여만 볼 수 있는지 권한 검증

**우선순위**: 🟡 **MEDIUM** (Phase 2 기능)

---

### 8. 게스트 모드 → 로그인 전환 시 데이터 마이그레이션

**현재 상태**:
- 게스트 모드는 localStorage에 데이터 저장
- 로그인 시 게스트 데이터 자동 마이그레이션 기능 없음

**개선 방안**:
1. 로그인 후 게스트 데이터 감지
2. "게스트 모드 데이터를 계정에 저장하시겠습니까?" 확인 모달
3. 사용자 동의 시 API 호출로 DB 저장
4. localStorage 클리어

**우선순위**: 🟡 **MEDIUM**

---

## 🟢 Low (추후 최적화 가능)

### 9. ISR (Incremental Static Regeneration) 적용

**대상 페이지**:
- `/companies` - 회사 목록 (변경 빈도 낮음)
- `/sites` - 현장 목록 (변경 빈도 낮음)

**구현**:
```typescript
// app/companies/page.tsx
export const revalidate = 300 // 5분마다 재생성
```

**효과**:
- 초기 로딩 속도 향상
- 서버 부하 감소

**우선순위**: 🟢 **LOW**

---

### 10. Edge Runtime 적용 검토

**대상 API**:
- `/api/health` - 단순 헬스체크
- 데이터베이스 쿼리가 없는 API

**구현**:
```typescript
export const runtime = 'edge'
```

**주의사항**:
- Prisma는 Edge Runtime 미지원
- 데이터베이스 쿼리 필요한 API는 적용 불가

**우선순위**: 🟢 **LOW**

---

### 11. 이미지 최적화

**현재 상태**: `<img>` 태그 사용 또는 이미지 미사용

**개선**:
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="노무PRO 로고"
  priority // LCP 최적화
/>
```

**우선순위**: 🟢 **LOW**

---

### 12. 결제 시스템 구현 (토스페이먼츠)

**현재 상태**: 미구현

**구현 범위**:
1. 토스페이먼츠 SDK 설치
2. 결제 페이지 생성 (`/pricing`, `/checkout`)
3. 구독 모델 설정 (₩19,000/주간 - CLAUDE.md 참고)
4. 웹훅 처리 (`/api/payments/webhook`)
5. Profile 모델에 `subscriptionStatus`, `subscriptionEndDate` 추가

**우선순위**: 🟢 **LOW** (MVP 출시 후)

---

### 13. AI 기능 구현

**현재 상태**:
- `ANTHROPIC_API_KEY` 환경 변수 설정됨
- 실제 사용 안 함

**구현 아이디어**:
- 랜딩 페이지의 "AI 공사비 분석" 실제 구현
- 비정상적인 인건비 패턴 감지 (연속 장시간 근무, 급격한 시급 변화)
- 예상 월간 인건비 자동 예측
- 4대보험 신고 대상자 자동 식별 AI

**우선순위**: 🟢 **LOW** (차별화 기능)

---

### 14. 실시간 업데이트 (WebSocket)

**현재 상태**: 폴링 또는 수동 새로고침

**구현 방안**:
- Supabase Realtime 사용
- 출근 기록 실시간 동기화
- 급여 승인 알림 실시간 전송

**우선순위**: 🟢 **LOW**

---

### 15. PWA (Progressive Web App) 기능

**현재 상태**: 미구현

**구현 범위**:
1. `manifest.json` 생성
2. Service Worker 등록
3. 오프라인 모드 지원
4. 홈 화면에 추가 기능

**효과**: 모바일 네이티브 앱처럼 사용 가능

**우선순위**: 🟢 **LOW**

---

## 📋 개선 작업 순서

### Phase 1: 긴급 보안/안정성 (배포 전 필수) - 🔴 Critical

**목표**: 프로덕션 배포 가능한 안정적인 코드베이스 확보

1. ✅ TypeScript/ESLint 에러 수정 (7개)
   - `app/api/attendance/calendar/route.ts:40` - any 타입
   - `app/api/attendance/conflicts/route.ts:84, 96` - any 타입, unused var
   - `app/api/attendance/[id]/route.ts:58` - any 타입
   - `app/api/companies/[id]/route.ts:53` - any 타입
   - `app/api/correction-requests/route.ts:24, 68, 133` - any 타입
   - `app/api/correction-requests/[id]/approve/route.ts:74` - any 타입

2. ✅ `next.config.mjs`에서 `ignoreBuildErrors: false` 변경

3. ✅ `/api/debug` 엔드포인트 보안 강화 또는 삭제

4. ✅ 로컬 빌드 테스트
   ```bash
   npm run lint
   npm run build
   npm run start
   ```

5. ✅ 변경 사항 커밋
   ```bash
   git add .
   git commit -m "fix: TypeScript/ESLint 에러 수정 및 보안 강화"
   git push origin db
   ```

6. ✅ 배포 및 검증
   - Vercel 배포
   - `/api/health`, 주요 페이지 동작 확인

**예상 소요 시간**: 2-3시간

---

### Phase 2: 최적화 및 안정화 (정식 출시 전) - 🟡 Medium

**목표**: 사용자 경험 개선 및 장기 안정성 확보

1. ✅ `next lint` deprecated 해결 (ESLint CLI 마이그레이션)
2. ✅ 환경 변수 검증 로직 추가
3. ✅ Excel 생성 로직 확인 및 테스트
4. ✅ 근로자 역할 전환 기능 E2E 테스트
5. ✅ 게스트 모드 → 로그인 데이터 마이그레이션 구현
6. ✅ 미완료 커밋 처리 및 PR 생성
7. ✅ 배포 가이드 업데이트
8. ✅ 커밋 & 배포

**예상 소요 시간**: 1-2일

---

### Phase 3: 성능 개선 및 추가 기능 (출시 후) - 🟢 Low

**목표**: 서비스 확장성 및 차별화 기능 추가

1. ✅ ISR 적용 및 효과 측정
2. ✅ Edge Runtime 테스트
3. ✅ 이미지 최적화
4. ✅ 결제 시스템 구현 (토스페이먼츠)
5. ✅ AI 기능 구현
6. ✅ 실시간 업데이트 (WebSocket)
7. ✅ PWA 기능 구현
8. ✅ Lighthouse 점수 측정 (목표: 90+)
9. ✅ Web Vitals 모니터링

**예상 소요 시간**: 2-4주

---

## 체크리스트

### Phase 1 (즉시) - 🔴 Critical
- [ ] `app/api/attendance/calendar/route.ts:40` any 타입 수정
- [ ] `app/api/attendance/conflicts/route.ts:84` any 타입 수정
- [ ] `app/api/attendance/conflicts/route.ts:96` unused 변수 제거
- [ ] `app/api/attendance/[id]/route.ts:58` any 타입 수정
- [ ] `app/api/companies/[id]/route.ts:53` any 타입 수정
- [ ] `app/api/correction-requests/route.ts:24` any 타입 수정
- [ ] `app/api/correction-requests/route.ts:68` any 타입 수정
- [ ] `app/api/correction-requests/route.ts:133` any 타입 수정
- [ ] `app/api/correction-requests/[id]/approve/route.ts:74` any 타입 수정
- [ ] `next.config.mjs`에서 `ignoreBuildErrors` 제거
- [ ] `/api/debug` 프로덕션 접근 제한 또는 삭제
- [ ] 로컬 테스트: `npm run lint` (에러 0개 확인)
- [ ] 로컬 테스트: `npm run build` (성공 확인)
- [ ] 로컬 테스트: `npm run start` (정상 동작 확인)
- [ ] 커밋 & Push
- [ ] Vercel 배포
- [ ] 배포 후 검증: `/api/health`, `/`, `/home`, 주요 기능

### Phase 2 (정식 출시 전) - 🟡 Medium
- [ ] ESLint CLI 마이그레이션
- [ ] 환경 변수 검증 로직 추가
- [ ] `lib/excel/generator.ts` 동작 확인
- [ ] Excel 다운로드 기능 테스트
- [ ] `/worker/my-info` 페이지 확인
- [ ] 역할 전환 E2E 테스트
- [ ] 게스트 모드 데이터 마이그레이션 구현
- [ ] `app/page.tsx`, `lib/store.ts`, `utils/supabase/middleware.ts` 커밋
- [ ] `db` → `main` PR 생성 및 리뷰
- [ ] 배포 가이드 업데이트 (`DEPLOY.md`)

### Phase 3 (출시 후) - 🟢 Low
- [ ] `/companies`, `/sites` 페이지에 ISR 적용
- [ ] `/api/health` Edge Runtime 적용
- [ ] 로고 이미지 Next.js Image 컴포넌트로 변경
- [ ] 토스페이먼츠 SDK 설치 및 결제 페이지 구현
- [ ] Anthropic API 연동 (비정상 패턴 감지)
- [ ] Supabase Realtime 연동
- [ ] PWA manifest 생성 및 Service Worker 등록
- [ ] Lighthouse 점수 측정 (목표: 90+ 달성)

---

## 예상 효과

### Phase 1 완료 시
- ✅ **타입 안전성 100% 확보** - 런타임 에러 사전 방지
- ✅ **프로덕션 보안 강화** - 디버그 엔드포인트 차단
- ✅ **CI/CD 품질 게이트** - 타입 체크 실패 시 빌드 차단
- ✅ **배포 신뢰도 향상** - 예기치 않은 에러 제거

### Phase 2 완료 시
- ✅ **장기 유지보수성 개선** - ESLint 최신 버전 호환
- ✅ **배포 실패 조기 감지** - 환경 변수 검증
- ✅ **사용자 경험 개선** - 게스트 → 로그인 데이터 보존
- ✅ **코드 품질 향상** - 미완료 작업 정리

### Phase 3 완료 시
- ✅ **페이지 로딩 속도 30-50% 개선** - ISR 적용
- ✅ **서버 부하 20-40% 감소** - Edge Runtime 활용
- ✅ **매출 발생** - 결제 시스템 구현
- ✅ **차별화된 가치 제공** - AI 분석 기능
- ✅ **모바일 사용성 극대화** - PWA 기능
- ✅ **Lighthouse 점수 90+ 달성** - SEO 및 성능 최적화

---

## 주요 기술 스택 점검

| 카테고리 | 기술 | 버전 | 상태 |
|---------|------|------|------|
| 프레임워크 | Next.js | 15.5.15 | ✅ 최신 |
| 언어 | TypeScript | 5.x | ✅ 정상 |
| 데이터베이스 | PostgreSQL (Supabase) | - | ✅ 정상 |
| ORM | Prisma | 5.10.2 | ✅ 정상 |
| 인증 | Supabase Auth | 2.39.7 | ✅ 정상 |
| 상태관리 | Zustand | 4.5.1 | ✅ 정상 |
| 스타일링 | Tailwind CSS | 4.0.0 | ✅ 최신 |
| 테스트 | Playwright | 1.59.1 | ✅ 정상 |
| UI 라이브러리 | Recharts, Sonner | - | ✅ 정상 |
| Excel | xlsx | 0.18.5 | ✅ 정상 |
| AI (Optional) | Anthropic SDK | - | ⚠️ 미사용 |
| 결제 (Future) | 토스페이먼츠 | - | ❌ 미구현 |

---

## 참고 문서

### 공식 문서
- [Next.js Build Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

### 프로젝트 문서
- `CLAUDE.md` - 전체 프로젝트 가이드
- `package.json` - 스크립트 및 의존성
- `prisma/schema.prisma` - 데이터베이스 스키마
- `lib/payroll/calculator.ts` - 급여 계산 로직
- `lib/excel/parser.ts` - Excel 파싱 로직

---

## 변경 이력

### 2026-04-28 (대규모 업데이트)
- **전체 프로젝트 점검** 수행
- TypeScript/ESLint 에러 7개 발견 (Critical)
- `next lint` deprecated 경고 확인
- 완료된 기능 목록 업데이트:
  - 급여 계산 엔진 완성 확인
  - Excel 파싱 로직 완성 확인
  - CorrectionRequest 모델 추가 확인
  - 40개 이상 API 엔드포인트 확인
  - 게스트 모드 구현 확인
  - 소셜 로그인 구현 확인
  - Git commit hash 기반 buildId 이미 완료 확인
- Phase 1-3 우선순위 재정의
- 상세 체크리스트 작성

### 2026-04-27
- 초기 개선 사항 문서 작성 (Vercel 배포 최적화 기준)
- Phase 1-3 우선순위 정의

---

## 다음 액션 아이템

**즉시 실행 (오늘 또는 내일)**:
1. TypeScript `any` 타입 7개 수정
2. unused 변수 1개 제거
3. `/api/debug` 삭제 또는 프로덕션 차단
4. `npm run lint`, `npm run build` 테스트
5. `ignoreBuildErrors: false` 변경
6. 커밋 & 배포

**이번 주 내**:
1. ESLint CLI 마이그레이션
2. Excel 다운로드 기능 테스트
3. 근로자 역할 전환 E2E 테스트
4. 게스트 모드 데이터 마이그레이션 구현

**MVP 출시 후**:
1. 결제 시스템 구현
2. AI 분석 기능 추가
3. PWA 적용

---

**작성자**: Claude Code (Sonnet 4.5)
**마지막 업데이트**: 2026-04-28
**문서 버전**: 2.0
