# 노무Pro - 남은 개발 사항

## 📋 프로젝트 현황

### ✅ 완료된 작업
- [x] Supabase 데이터베이스 스키마 설계 및 생성
- [x] RLS (Row Level Security) 보안 정책 적용
- [x] Prisma ORM 통합
- [x] 인증 시스템 (Supabase Auth)
- [x] 기본 API 엔드포인트 (workers, attendance, payroll, companies, sites)
- [x] Supabase 클라이언트 설정 (서버/클라이언트)
- [x] 미들웨어 인증 보호
- [x] 기본 인증 UI (로그인/회원가입)

### 🎯 개발 목표
일용직 노무 관리 플랫폼 완성 - 건설 현장 인건비 신고 및 소득 관리 자동화

---

## 🤖 Claude Code 담당 작업

### Phase 1: 핵심 백엔드 기능 (우선순위: 높음)

#### 1.1 회사/현장 관리 API 개선
- [x] **companies API 확장**
  - [x] `GET /api/companies/[id]/stats` - 회사별 통계
  - [x] `GET /api/companies/[id]/workers/summary` - 소속 근로자 요약
  - [x] 사업자번호 검증 로직 (`lib/utils/validation.ts`)

- [x] **sites API 확장**
  - [x] `GET /api/sites/[id]/stats` - 현장별 통계
  - [x] `GET /api/sites/[id]/dashboard` - 현장 대시보드 데이터
  - [x] `GET /api/sites/[id]/monthly-report` - 월별 리포트
  - [ ] 현장 종료 처리 로직 (비즈니스 로직 추가 필요)

#### 1.2 급여 계산 자동화
- [x] **급여 계산 엔진 구현**
  - [x] `lib/payroll/calculator.ts` - 급여 계산 로직
    - [x] 기본급 계산 (시급 × 근무시간)
    - [x] 주휴수당 계산 (주 15시간 이상 근무자)
    - [x] 연장근무 수당 (주 40시간 초과)
    - [x] 4대 보험 공제 계산
    - [x] 소득세/지방소득세 계산

- [x] **급여 생성 API**
  - [x] `POST /api/payroll/generate` - 월별 급여 자동 생성
  - [x] `POST /api/payroll/batch` - 다수 근로자 일괄 처리
  - [x] `PUT /api/payroll/[id]/approve` - 급여 승인
  - [x] `PUT /api/payroll/[id]/pay` - 지급 처리

#### 1.3 출근 관리 개선
- [x] **attendance API 확장**
  - [x] `POST /api/attendance/bulk-import` - 엑셀 일괄 업로드
  - [x] `GET /api/attendance/calendar` - 캘린더 뷰 데이터
  - [x] `GET /api/attendance/conflicts` - 중복/충돌 감지
  - [x] `DELETE /api/attendance/range` - 기간별 삭제

#### 1.4 통계 및 대시보드 API
- [x] **dashboard API 완성**
  - [x] `GET /api/dashboard/overview` - 전체 현황
  - [x] `GET /api/dashboard/costs` - 인건비 추이
  - [x] `GET /api/dashboard/risks` - 리스크 분석
  - [x] `GET /api/dashboard/compliance` - 법정 준수사항 체크

#### 1.5 엑셀 처리
- [x] **엑셀 파싱 및 생성**
  - [x] `lib/excel/parser.ts` - 엑셀 파일 파싱 (노임대장 양식)
  - [x] `lib/excel/generator.ts` - 엑셀 파일 생성
  - [x] `POST /api/excel/upload` - 엑셀 업로드 처리
  - [x] `GET /api/excel/download/payroll` - 급여명세서 다운로드
  - [x] `GET /api/excel/download/attendance` - 출근부 다운로드

### Phase 2: 고급 기능 (우선순위: 중간)

#### 2.1 Supabase Storage 통합
- [ ] **파일 업로드 시스템**
  - `lib/storage/client.ts` - Storage 클라이언트
  - Bucket 생성 및 RLS 정책 설정
  - `POST /api/upload/document` - 계약서, 신분증 등
  - `POST /api/upload/excel` - 엑셀 파일
  - 파일 압축 및 최적화

#### 2.2 Supabase Realtime 통합
- [ ] **실시간 기능**
  - `lib/realtime/subscriptions.ts` - Realtime 구독 관리
  - 근로자 출근 실시간 알림
  - 급여 승인 실시간 알림
  - 현장 통계 실시간 업데이트

#### 2.3 알림 시스템
- [ ] **알림 인프라**
  - `notifications` 테이블 생성
  - `POST /api/notifications/send` - 알림 발송
  - `GET /api/notifications` - 알림 조회
  - `PUT /api/notifications/[id]/read` - 읽음 처리
  - 이메일 알림 (Supabase Email)

#### 2.4 권한 관리
- [ ] **역할 기반 접근 제어 (RBAC)**
  - Profile role 확장 (admin, manager, viewer)
  - RLS 정책 role 기반 세분화
  - API 레벨 권한 체크 미들웨어
  - 감사 로그 (audit_logs 테이블)

### Phase 3: 최적화 및 배포 (우선순위: 낮음)

#### 3.1 성능 최적화
- [ ] **쿼리 최적화**
  - Prisma query 성능 분석
  - 추가 인덱스 생성
  - N+1 쿼리 제거
  - 캐싱 전략 (Redis 또는 Vercel KV)

#### 3.2 에러 처리 및 로깅
- [ ] **에러 관리**
  - `lib/errors/handler.ts` - 중앙 에러 핸들러
  - 로깅 시스템 (Sentry 또는 LogTail)
  - API 에러 응답 표준화
  - 디버깅 도구 설정

#### 3.3 테스트
- [ ] **백엔드 테스트**
  - API 엔드포인트 통합 테스트 (Jest)
  - 급여 계산 로직 유닛 테스트
  - RLS 정책 테스트
  - E2E 테스트 (Playwright)

#### 3.4 배포 설정
- [ ] **프로덕션 준비**
  - Vercel 배포 설정
  - 환경 변수 관리
  - CI/CD 파이프라인 (GitHub Actions)
  - 데이터베이스 백업 자동화
  - 모니터링 대시보드 (Vercel Analytics)

---

## 🎨 Antigravity Agent 담당 작업

### Phase 1: 핵심 UI 구현 (우선순위: 높음)

#### 1.1 회사/현장 관리 UI
- [ ] **회사 관리 페이지**
  - `app/companies/page.tsx` - 회사 목록
  - `app/companies/new/page.tsx` - 회사 등록 폼
  - `app/companies/[id]/page.tsx` - 회사 상세
  - `app/components/companies/CompanyCard.tsx`
  - `app/components/companies/CompanyForm.tsx`
  - 사업자번호 입력 마스크
  - 회사 정보 수정/삭제

- [ ] **현장 관리 페이지**
  - `app/sites/page.tsx` - 현장 목록
  - `app/sites/new/page.tsx` - 현장 등록 폼
  - `app/sites/[id]/page.tsx` - 현장 상세/대시보드
  - `app/components/sites/SiteCard.tsx`
  - `app/components/sites/SiteForm.tsx`
  - 현장 상태 표시 (진행중/완료/중단)
  - 날짜 범위 선택기

#### 1.2 근로자 관리 UI 개선
- [ ] **근로자 페이지 개선**
  - 기존 `app/workers/page.tsx` 개선
  - `WorkerList` 컴포넌트 Supabase 연동
  - `WorkerForm` 컴포넌트 Supabase 연동
  - 근로자 검색/필터링 (이름, 현장, 상태)
  - 근로자 프로필 상세 페이지
  - 근로자별 근무 이력 표시
  - 은행 계좌 입력 마스크
  - 주민등록번호 보안 처리

#### 1.3 출근 관리 UI 개선
- [ ] **출근 캘린더 개선**
  - `app/attendance/page.tsx` 생성
  - 기존 `CalendarView` 컴포넌트 Supabase 연동
  - `AttendanceForm` Supabase 연동
  - `BulkAttendanceForm` 개선 (다수 근로자 동시 출근 입력)
  - 월별/주별 뷰 토글
  - 드래그 앤 드롭으로 출근 시간 조정
  - 출근 상태 시각화 (정상/지각/결근)
  - 엑셀 업로드 UI

#### 1.4 급여 관리 UI 개선
- [ ] **급여 페이지 개선**
  - 기존 `app/payroll/page.tsx` Supabase 연동
  - 월별 급여 목록
  - 급여 상세 모달 (공제 내역 상세)
  - 급여 계산 미리보기
  - 일괄 급여 생성 UI
  - 급여 승인 워크플로우
  - 급여명세서 PDF 생성
  - 급여 지급 상태 표시

#### 1.5 대시보드 개선
- [ ] **메인 대시보드**
  - 기존 `app/page.tsx` Supabase 연동
  - `CostChart` 컴포넌트 실제 데이터 연동
  - `RiskRadar` 컴포넌트 실제 데이터 연동
  - 주요 지표 카드 (총 근로자, 이번 달 인건비, 현장 수)
  - 최근 활동 타임라인
  - 알림 센터
  - 빠른 작업 버튼

### Phase 2: UX 개선 (우선순위: 중간)

#### 2.1 공통 컴포넌트 개선
- [ ] **UI 컴포넌트 라이브러리**
  - `Button`, `Modal`, `BottomSheet` 개선
  - `Table` 컴포넌트 (정렬, 페이지네이션)
  - `DatePicker` 한글화
  - `Select` 컴포넌트 개선
  - `Toast` 알림
  - `Loading` 스피너/스켈레톤
  - `Empty State` 일러스트
  - `Error Boundary` UI

#### 2.2 네비게이션 및 레이아웃
- [ ] **레이아웃 개선**
  - 사이드바 네비게이션 추가
  - 모바일 햄버거 메뉴
  - 브레드크럼 (Breadcrumb)
  - 하단 네비게이션 (모바일)
  - `UserNav` 컴포넌트 통합
  - 다크 모드 토글

#### 2.3 폼 개선
- [ ] **사용자 입력 최적화**
  - 폼 검증 실시간 피드백
  - 자동 저장 기능
  - 폼 입력 진행률 표시
  - 키보드 단축키 지원
  - 모바일 친화적 입력 (숫자 키패드 등)

#### 2.4 데이터 시각화
- [ ] **차트 및 그래프**
  - 인건비 추이 그래프 (recharts)
  - 현장별 비용 비교 차트
  - 근로자 출근율 차트
  - 월별 급여 통계
  - 리스크 레이더 차트

### Phase 3: 모바일 및 반응형 (우선순위: 중간)

#### 3.1 모바일 최적화
- [ ] **모바일 UI**
  - 모든 페이지 반응형 디자인
  - 터치 제스처 지원
  - 모바일 출근 체크인 UI
  - PWA 설정 (Progressive Web App)
  - 오프라인 지원 (Service Worker)
  - 푸시 알림 (Web Push)

#### 3.2 접근성
- [ ] **웹 접근성 (WCAG 2.1)**
  - 키보드 네비게이션
  - 스크린 리더 지원 (ARIA)
  - 색상 대비 개선
  - 포커스 표시
  - 대체 텍스트

### Phase 4: 추가 기능 (우선순위: 낮음)

#### 4.1 설정 페이지
- [ ] **사용자 설정**
  - `app/settings/page.tsx`
  - 프로필 편집
  - 비밀번호 변경
  - 알림 설정
  - 테마 설정
  - 언어 설정 (한/영)

#### 4.2 도움말 및 가이드
- [ ] **온보딩**
  - 첫 사용자 튜토리얼
  - 인터랙티브 가이드 (react-joyride)
  - FAQ 페이지
  - 도움말 문서
  - 비디오 튜토리얼

#### 4.3 인쇄 및 내보내기
- [ ] **출력 기능**
  - 급여명세서 인쇄 스타일
  - 출근부 인쇄 스타일
  - PDF 생성 (react-pdf)
  - 엑셀 다운로드 UI
  - 인쇄 미리보기

---

## 📊 진행 상황 추적

### 전체 진행률
- **백엔드 (Claude Code)**: 75% 완료
  - Phase 1: 95% 완료 ✅
  - Phase 2: 0%
  - Phase 3: 0%

- **프론트엔드 (Antigravity)**: 25% 완료
  - Phase 1: 15%
  - Phase 2: 0%
  - Phase 3: 0%
  - Phase 4: 0%

### 마일스톤

#### M1: MVP (Minimum Viable Product) - 2주
- [ ] 회사/현장 CRUD
- [ ] 근로자 CRUD (완료)
- [ ] 출근 기록 (완료)
- [ ] 기본 급여 계산
- [ ] 간단한 대시보드

#### M2: 베타 출시 - 4주
- [ ] 급여 자동 계산
- [ ] 엑셀 업로드/다운로드
- [ ] 실시간 알림
- [ ] 모바일 최적화
- [ ] 기본 통계

#### M3: 정식 출시 - 6주
- [ ] 권한 관리
- [ ] 파일 업로드
- [ ] 고급 통계
- [ ] PWA
- [ ] 테스트 완료

---

## 🎯 우선순위 작업 (다음 스프린트)

### Claude Code - 이번 주
1. ✅ 급여 계산 엔진 구현
2. ✅ companies/sites API 확장
3. ✅ 엑셀 파서 구현
4. ✅ dashboard API 완성

### Antigravity Agent - 이번 주
1. ✅ 회사/현장 관리 UI
2. ✅ 근로자 목록 Supabase 연동
3. ✅ 출근 캘린더 Supabase 연동
4. ✅ 대시보드 실제 데이터 연동

---

## 📝 작업 분담 원칙

### Claude Code 담당
- ✅ API 엔드포인트 개발
- ✅ 데이터베이스 스키마 수정
- ✅ 비즈니스 로직 구현
- ✅ 인증/인가 시스템
- ✅ 외부 서비스 통합 (Supabase, Storage, Realtime)
- ✅ 성능 최적화
- ✅ 배포 및 인프라

### Antigravity Agent 담당
- ✅ React 컴포넌트 개발
- ✅ UI/UX 디자인 구현
- ✅ 스타일링 (Tailwind CSS)
- ✅ 애니메이션 (Framer Motion)
- ✅ 폼 및 검증 UI
- ✅ 차트 및 시각화
- ✅ 반응형 디자인
- ✅ 접근성

---

## 🔗 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)
- [노무 관련 법규](https://www.moel.go.kr) - 근로기준법, 4대 보험

---

**마지막 업데이트**: 2026-04-12
**다음 리뷰**: 2026-04-19
