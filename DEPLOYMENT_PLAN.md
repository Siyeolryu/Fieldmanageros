# 배포 및 DevOps 마일스톤

**프로젝트**: Field Manager OS (노무PRO)
**저장소**: https://github.com/Siyeolryu/Fieldmanageros
**작성일**: 2026-04-13
**상태**: 개발 완료 → 배포 준비 중

---

## 📋 목차

1. [현재 상태](#현재-상태)
2. [배포 아키텍처](#배포-아키텍처)
3. [배포 마일스톤](#배포-마일스톤)
4. [CI/CD 파이프라인](#cicd-파이프라인)
5. [환경 변수 관리](#환경-변수-관리)
6. [모니터링 및 로깅](#모니터링-및-로깅)
7. [보안 체크리스트](#보안-체크리스트)
8. [성능 최적화](#성능-최적화)
9. [백업 및 복구](#백업-및-복구)
10. [롤백 전략](#롤백-전략)

---

## 현재 상태

### ✅ 완료된 기능

- **인증 시스템**: Supabase Auth + RLS 정책
- **근로자 관리**: CRUD + Excel 업로드/다운로드
- **출근 관리**: 캘린더 뷰 + 일괄 등록
- **급여 계산**: 자동 주휴수당 + 4대 보험 계산
- **현장/회사 관리**: 다중 현장 지원
- **대시보드**: 통계 및 리스크 분석
- **Excel 통합**: 노임대장 형식 지원

### 🔧 기술 스택

**Frontend**
- Next.js 15.1.6 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4

**Backend**
- Supabase (PostgreSQL + Auth + RLS + Realtime)
- Next.js API Routes
- Row Level Security (RLS)

**개발 도구**
- Git (GitHub)
- npm/Node.js
- ESLint

---

## 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 (Users)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                        │
│  • CDN (정적 파일 캐싱)                                       │
│  • 자동 HTTPS/SSL                                            │
│  • DDoS 보호                                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
      ▼                                     ▼
┌─────────────────┐              ┌─────────────────────┐
│  Vercel (App)   │              │  Supabase (BaaS)    │
│                 │              │                     │
│ • Next.js SSR   │◄────────────►│ • PostgreSQL        │
│ • API Routes    │   REST API   │ • Auth              │
│ • Edge Runtime  │              │ • Realtime          │
│ • Serverless    │              │ • Storage (Future)  │
└─────────────────┘              └─────────────────────┘
      │                                     │
      │                                     │
      ▼                                     ▼
┌─────────────────┐              ┌─────────────────────┐
│  Monitoring     │              │  Database Backups   │
│                 │              │                     │
│ • Vercel Logs   │              │ • Daily Snapshots   │
│ • Sentry        │              │ • Point-in-time     │
│ • Web Vitals    │              │   Recovery          │
└─────────────────┘              └─────────────────────┘
```

### 권장 배포 플랫폼

**🥇 1순위: Vercel (권장)**
- Next.js 최적화
- 자동 배포 (GitHub 연동)
- Edge Functions 지원
- 무료 플랜 제공
- 자동 HTTPS/CDN

**🥈 2순위: Netlify**
- 유사한 기능
- Form 처리 기능

**🥉 3순위: Railway / Render**
- 컨테이너 기반 배포
- 더 많은 제어권

---

## 배포 마일스톤

### Phase 1: 개발 환경 배포 (1-2일) ✅ 준비 완료

**목표**: 개발팀 내부 테스트용 배포

#### Tasks

- [x] GitHub 저장소 연결 완료
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 첫 배포 실행
- [ ] 기본 기능 테스트
  - [ ] 로그인/회원가입
  - [ ] 근로자 등록
  - [ ] 출근 기록
  - [ ] 급여 계산

**성공 기준**
- 모든 페이지 정상 로드
- API 엔드포인트 응답
- Supabase 연결 성공

---

### Phase 2: 스테이징 환경 구축 (3-5일)

**목표**: 프로덕션과 동일한 환경에서 테스트

#### Tasks

- [ ] **별도 Supabase 프로젝트 생성** (스테이징 DB)
- [ ] **스테이징 브랜치 생성** (`staging`)
  ```bash
  git checkout -b staging
  git push -u origin staging
  ```
- [ ] **Vercel 스테이징 환경 설정**
  - 별도 프로젝트 생성 (예: `fieldmanageros-staging`)
  - staging 브랜치와 연결
- [ ] **테스트 데이터 시드**
  ```bash
  npm run seed:staging
  ```
- [ ] **통합 테스트 실행**
  - [ ] 사용자 시나리오 테스트
  - [ ] Excel 업로드/다운로드
  - [ ] 급여 계산 정확도
  - [ ] 권한 체크 (RLS)
- [ ] **성능 테스트**
  - [ ] Lighthouse 점수 (90+ 목표)
  - [ ] API 응답 시간 (<500ms)
  - [ ] 대량 데이터 처리

**성공 기준**
- 모든 기능 정상 작동
- 성능 기준 충족
- 보안 취약점 없음

---

### Phase 3: 프로덕션 배포 준비 (5-7일)

**목표**: 실제 사용자에게 제공할 준비 완료

#### Tasks

- [ ] **도메인 구매 및 설정**
  - 옵션 1: `fieldmanager.kr` 또는 `노무pro.com`
  - DNS 설정 (Vercel 연결)
  - SSL 인증서 (자동)

- [ ] **프로덕션 환경 변수 설정**
  ```bash
  # Vercel CLI 사용
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  vercel env add SUPABASE_SERVICE_ROLE_KEY production
  ```

- [ ] **Supabase 프로덕션 설정**
  - [ ] Rate limiting 활성화
  - [ ] CORS 설정
  - [ ] Database 인덱스 최적화
  - [ ] Backup 정책 설정 (일일 자동 백업)

- [ ] **보안 강화**
  - [ ] CSP (Content Security Policy) 설정
  - [ ] Rate limiting 구현
  - [ ] XSS/CSRF 방어 검증
  - [ ] 환경 변수 암호화

- [ ] **모니터링 설정**
  - [ ] Sentry 연동 (에러 트래킹)
  - [ ] Vercel Analytics 활성화
  - [ ] Supabase Logs 모니터링

- [ ] **문서화**
  - [ ] API 문서 작성
  - [ ] 사용자 매뉴얼
  - [ ] 관리자 가이드

**성공 기준**
- 보안 감사 통과
- 성능 최적화 완료
- 모니터링 시스템 작동

---

### Phase 4: 프로덕션 배포 (1일)

**목표**: 실제 서비스 시작

#### Tasks

- [ ] **최종 점검**
  - [ ] 모든 환경 변수 확인
  - [ ] DB 마이그레이션 완료
  - [ ] 백업 확인

- [ ] **배포 실행**
  ```bash
  git checkout main
  git pull origin main
  vercel --prod
  ```

- [ ] **배포 후 검증**
  - [ ] 헬스체크 API 확인
  - [ ] 주요 기능 테스트
  - [ ] 에러 로그 모니터링

- [ ] **사용자 온보딩**
  - [ ] 초기 사용자 계정 생성
  - [ ] 샘플 데이터 제공
  - [ ] 튜토리얼 제공

**롤백 플랜**
- Vercel에서 이전 배포로 즉시 롤백 가능
- DB 스냅샷 복구 준비

---

### Phase 5: 운영 및 모니터링 (지속)

**목표**: 안정적인 서비스 운영

#### Tasks

- [ ] **일일 모니터링**
  - [ ] 에러율 체크 (<1%)
  - [ ] 응답 시간 모니터링
  - [ ] 사용자 피드백 수집

- [ ] **주간 리뷰**
  - [ ] 성능 리포트 분석
  - [ ] 사용자 행동 분석
  - [ ] 버그 수정 우선순위

- [ ] **월간 점검**
  - [ ] 보안 패치 적용
  - [ ] 의존성 업데이트
  - [ ] DB 최적화

---

## CI/CD 파이프라인

### GitHub Actions Workflow

`.github/workflows/ci.yml` 파일 생성:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging, db]
  pull_request:
    branches: [main]

jobs:
  # 1. 코드 품질 체크
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  # 2. 타입 체크
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  # 3. 빌드 테스트
  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  # 4. 배포 (main 브랜치만)
  deploy:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel 자동 배포 설정

**권장 설정** (Vercel Dashboard):

```
Production Branch: main
Preview Branches: staging, db
Build Command: npm run build
Output Directory: .next
Install Command: npm ci

Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL (All Environments)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (All Environments)
- SUPABASE_SERVICE_ROLE_KEY (Production only)
```

---

## 환경 변수 관리

### 필수 환경 변수

#### Supabase 관련

```bash
# Public (클라이언트에서 접근 가능)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private (서버 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 선택적 환경 변수

```bash
# OAuth (향후 구현 시)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 모니터링
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# 분석
NEXT_PUBLIC_GA_ID=

# 기타
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fieldmanager.kr
```

### 환경별 설정

| 환경 | 브랜치 | Supabase 프로젝트 | URL |
|------|--------|-------------------|-----|
| Development | `db` | dev-project | localhost:3000 |
| Staging | `staging` | staging-project | staging.vercel.app |
| Production | `main` | prod-project | fieldmanager.kr |

### 보안 관리

1. **절대 커밋하지 말 것**
   - `.env` 파일은 `.gitignore`에 포함
   - Service Role Key는 절대 노출 금지

2. **암호화 저장**
   - Vercel: 자동 암호화
   - GitHub Secrets: 암호화 저장

3. **정기 교체**
   - Service Role Key: 6개월마다 교체
   - OAuth 키: 1년마다 교체

---

## 모니터링 및 로깅

### 1. Vercel Analytics

**자동 제공**
- Real User Monitoring (RUM)
- Web Vitals (LCP, FID, CLS)
- 페이지 로드 시간
- 에러율

**설정 방법**
```bash
# Vercel Dashboard에서 활성화
Project Settings → Analytics → Enable
```

### 2. Sentry (에러 트래킹)

**설치**
```bash
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**설정** (`sentry.client.config.ts`)
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // 민감한 정보 필터링
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization
    }
    return event
  }
})
```

### 3. Supabase Logs

**모니터링 항목**
- API 요청 로그
- Database 쿼리 로그
- Auth 이벤트 로그
- 에러 로그

**접근 방법**
```
Supabase Dashboard → Logs → Select log type
```

### 4. Custom Logging

**API 로깅 미들웨어** (`lib/logger.ts`)
```typescript
export function logApiRequest(req: Request, res: Response, duration: number) {
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url,
    status: res.status,
    duration: `${duration}ms`,
    userAgent: req.headers.get('user-agent')
  })
}
```

### 5. 알림 설정

**Vercel 배포 알림**
- Slack/Discord 웹훅 연동
- 배포 성공/실패 알림

**Sentry 알림**
- 에러율 임계값 설정
- 중요 에러 즉시 알림

**Supabase 알림**
- DB CPU 사용률 > 80%
- 스토리지 사용량 > 90%

---

## 보안 체크리스트

### 인증 및 권한

- [x] Supabase Auth 구현
- [x] Row Level Security (RLS) 정책 적용
- [ ] Session 타임아웃 설정 (24시간)
- [ ] 비밀번호 복잡도 요구사항
- [ ] 2FA 구현 (선택, Phase 2)

### API 보안

- [ ] **Rate Limiting 구현**
  ```typescript
  // middleware.ts
  export async function middleware(request: NextRequest) {
    const ip = request.ip ?? 'unknown'
    const limit = await checkRateLimit(ip)

    if (!limit.success) {
      return new Response('Too Many Requests', { status: 429 })
    }
    // ...
  }
  ```

- [ ] **CORS 설정**
  ```typescript
  // next.config.ts
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://fieldmanager.kr' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  }
  ```

- [x] **인증 검증** (모든 API 라우트)
- [ ] **입력 검증** (Zod 스키마)

### 데이터 보안

- [x] **데이터베이스 암호화** (Supabase 기본 제공)
- [ ] **민감 정보 마스킹** (주민등록번호, 계좌번호)
  ```typescript
  // 이미 구현됨: maskIdNumber()
  ```
- [ ] **SQL Injection 방지** (Supabase 쿼리 빌더 사용)
- [ ] **XSS 방지** (React 기본 이스케이핑)

### 네트워크 보안

- [ ] **HTTPS 강제** (Vercel 자동)
- [ ] **CSP 헤더 설정**
  ```typescript
  // next.config.ts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          },
        ],
      },
    ]
  }
  ```
- [ ] **HSTS 설정**

### 의존성 보안

- [ ] **정기 보안 감사**
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] **Dependabot 활성화** (GitHub)
- [ ] **자동 업데이트 설정**

### 컴플라이언스

- [ ] **개인정보 처리방침 작성**
- [ ] **서비스 이용약관 작성**
- [ ] **GDPR/개인정보보호법 준수** (필요시)

---

## 성능 최적화

### 1. Next.js 최적화

**이미지 최적화**
```typescript
// 향후 근로자 사진 기능 추가 시
import Image from 'next/image'

<Image
  src="/worker-photo.jpg"
  width={200}
  height={200}
  alt="Worker"
  loading="lazy"
/>
```

**동적 Import**
```typescript
// 무거운 컴포넌트 지연 로딩
const ExcelUploadModal = dynamic(
  () => import('@/app/components/excel/ExcelUploadModal'),
  { ssr: false }
)
```

**폰트 최적화**
```typescript
// layout.tsx에서 이미 구현
import { GeistSans } from 'geist/font/sans'
```

### 2. 데이터베이스 최적화

**인덱스 추가**
```sql
-- 자주 조회하는 컬럼에 인덱스
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_workers_site ON workers(site_id);
CREATE INDEX idx_payroll_year_month ON payroll(year, month);
```

**쿼리 최적화**
```typescript
// 불필요한 데이터 제외
const { data } = await supabase
  .from('workers')
  .select('id, name, hourly_rate') // 필요한 컬럼만
  .eq('site_id', siteId)
  .limit(100) // 페이지네이션
```

### 3. 캐싱 전략

**Vercel Edge Caching**
```typescript
// API 라우트에서
export const runtime = 'edge'
export const revalidate = 3600 // 1시간 캐시
```

**React Query 도입 (선택)**
```bash
npm install @tanstack/react-query
```

### 4. 번들 크기 최적화

**분석 도구**
```bash
npm install --save-dev @next/bundle-analyzer
```

**목표**
- First Load JS: < 100KB
- Total Bundle Size: < 500KB

### 5. 성능 목표

| 지표 | 목표 | 현재 |
|------|------|------|
| Lighthouse Performance | 90+ | TBD |
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Time to Interactive | < 3.5s | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |

---

## 백업 및 복구

### 1. 데이터베이스 백업

**Supabase 자동 백업**
- **일일 백업**: 자동 (7일 보관)
- **주간 백업**: 자동 (4주 보관)
- **월간 백업**: 수동 (1년 보관)

**수동 백업 스크립트**
```bash
# scripts/backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/db_backup_$DATE.sql
```

**복구 절차**
```bash
# 1. 백업 파일 확인
ls -lh backups/

# 2. 복구 실행
psql $DATABASE_URL < backups/db_backup_20260413.sql

# 3. 데이터 검증
psql $DATABASE_URL -c "SELECT COUNT(*) FROM workers;"
```

### 2. 파일 백업

**현재**: Excel 파일은 클라이언트에서 직접 생성 (서버 저장 없음)

**향후**: Supabase Storage 사용 시
```typescript
// 파일 업로드 시 자동 버전 관리
const { data } = await supabase.storage
  .from('documents')
  .upload(`${date}/${filename}`, file)
```

### 3. 코드 백업

**GitHub 자동 백업**
- 모든 커밋 히스토리 보존
- 브랜치별 관리

**추가 백업** (선택)
```bash
# 매월 1일 전체 저장소 아카이브
git archive --format=zip HEAD > backups/repo_$(date +%Y%m).zip
```

### 4. 재해 복구 계획 (DR Plan)

**RTO (Recovery Time Objective)**: 4시간
**RPO (Recovery Point Objective)**: 24시간

**복구 시나리오**

| 시나리오 | 복구 절차 | 예상 시간 |
|----------|-----------|-----------|
| 배포 실패 | Vercel 롤백 | 5분 |
| DB 데이터 손실 | 백업 복구 | 1시간 |
| 전체 서비스 다운 | 새 인스턴스 배포 | 4시간 |

---

## 롤백 전략

### 1. Vercel 배포 롤백

**자동 롤백** (배포 실패 시)
- Vercel이 자동으로 이전 버전 유지
- 배포 실패 시 자동 롤백

**수동 롤백**
```bash
# Vercel Dashboard
Deployments → 이전 배포 선택 → Promote to Production

# CLI
vercel rollback
```

### 2. 데이터베이스 롤백

**마이그레이션 롤백**
```sql
-- Supabase에서 마이그레이션 되돌리기
-- (자동 롤백 미지원, 수동 스크립트 필요)

-- 예: 테이블 변경 롤백
ALTER TABLE workers DROP COLUMN new_column;
```

**데이터 롤백**
```bash
# 백업에서 복구
psql $DATABASE_URL < backups/db_backup_before_deploy.sql
```

### 3. 긴급 대응 절차

**Step 1: 문제 감지**
- Sentry 알림
- 사용자 신고
- 모니터링 경고

**Step 2: 영향 평가**
- 영향받는 사용자 수
- 데이터 손실 여부
- 보안 문제 여부

**Step 3: 롤백 결정**
- 심각도 평가
- 복구 시간 예측
- 롤백 vs 긴급 수정

**Step 4: 롤백 실행**
```bash
# 1. 서비스 롤백
vercel rollback

# 2. DB 롤백 (필요 시)
psql $DATABASE_URL < backups/latest.sql

# 3. 검증
curl https://fieldmanager.kr/api/health
```

**Step 5: 사후 분석**
- 원인 분석
- 재발 방지책
- 문서화

---

## 체크리스트

### 배포 전 최종 점검

- [ ] 모든 환경 변수 설정 완료
- [ ] `.env.example` 파일 최신화
- [ ] 프로덕션 DB 마이그레이션 완료
- [ ] RLS 정책 활성화 확인
- [ ] 보안 감사 완료 (`npm audit`)
- [ ] 성능 테스트 통과
- [ ] 백업 시스템 작동 확인
- [ ] 모니터링 시스템 설정 완료
- [ ] 문서화 완료
- [ ] 롤백 절차 숙지

### 배포 후 점검

- [ ] 헬스체크 API 응답 확인
- [ ] 로그인/회원가입 테스트
- [ ] 주요 기능 동작 확인
- [ ] 에러 로그 모니터링 (1시간)
- [ ] 성능 메트릭 확인
- [ ] 사용자 피드백 수집

---

## 다음 단계

### 즉시 실행 (1-2일)

1. **Vercel 계정 생성 및 프로젝트 연결**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```

2. **환경 변수 설정**
   - Supabase URL/Key 추가
   - Vercel Dashboard에서 설정

3. **첫 배포 실행**
   ```bash
   vercel --prod
   ```

### 단기 목표 (1주일)

- [ ] 개발 환경 배포 완료
- [ ] 기본 모니터링 설정
- [ ] 팀 내부 테스트

### 중기 목표 (2-3주)

- [ ] 스테이징 환경 구축
- [ ] CI/CD 파이프라인 구축
- [ ] 보안 강화

### 장기 목표 (1-2개월)

- [ ] 프로덕션 배포
- [ ] 사용자 온보딩
- [ ] 성능 최적화
- [ ] 모니터링 및 개선

---

## 참고 자료

### 공식 문서

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

### 관련 파일

- `README.md` - 프로젝트 개요
- `MIGRATION_GUIDE.md` - DB 마이그레이션 가이드
- `docs/AUTH_COMPLETE.md` - 인증 시스템 문서
- `docs/RLS_APPLY_STEPS.md` - RLS 설정 가이드

### 연락처

- **개발팀 리드**: [이메일]
- **DevOps 담당**: [이메일]
- **긴급 연락**: [전화번호]

---

**작성**: Claude Code
**최종 수정**: 2026-04-13
**버전**: 1.0
