# 배포 체크리스트

**프로젝트**: Field Manager OS (노무PRO)
**최종 업데이트**: 2026-04-13

---

## 🚀 배포 전 체크리스트

### 1. 코드 준비

- [ ] 모든 변경사항 커밋 완료
- [ ] `main` 브랜치로 머지 완료
- [ ] 버전 태그 생성 (선택)
  ```bash
  git tag -a v1.0.0 -m "Initial production release"
  git push origin v1.0.0
  ```

### 2. 환경 변수 설정

**Vercel Dashboard에서 설정 필요:**

#### Production 환경

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App 설정
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Field Manager OS
```

#### 환경 변수 확인
- [ ] Supabase URL 확인
- [ ] Supabase Anon Key 확인
- [ ] Service Role Key 확인 (절대 노출 금지!)
- [ ] 프로덕션 URL 설정

### 3. Supabase 설정

- [ ] **프로덕션 프로젝트 생성** (별도 프로젝트 권장)
- [ ] **데이터베이스 마이그레이션 실행**
  ```sql
  -- Supabase SQL Editor에서 실행
  -- 1. supabase/migrations/001_initial_schema.sql
  -- 2. supabase/migrations/002_rls_policies.sql
  -- 3. supabase/migrations/003_utility_functions.sql
  -- 4. supabase/migrations/004_realtime.sql
  ```
- [ ] **RLS 정책 활성화 확인**
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```
- [ ] **인증 설정**
  - [ ] Site URL 설정 (`https://yourdomain.com`)
  - [ ] Redirect URLs 설정
  - [ ] Email 템플릿 커스터마이징 (선택)
- [ ] **API 설정**
  - [ ] Rate limiting 활성화
  - [ ] CORS 설정 (도메인 제한)
- [ ] **백업 설정**
  - [ ] 자동 백업 활성화
  - [ ] 백업 주기 확인 (일일)

### 4. Vercel 프로젝트 설정

- [ ] **프로젝트 생성/연결**
  ```bash
  vercel login
  vercel link
  ```
- [ ] **빌드 설정 확인**
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm ci`
- [ ] **브랜치 설정**
  - Production Branch: `main`
  - Preview Branches: `staging`, `db`
- [ ] **도메인 설정** (선택)
  - [ ] 커스텀 도메인 추가
  - [ ] DNS 레코드 설정
  - [ ] SSL 인증서 확인 (자동)

### 5. GitHub 설정

- [ ] **Secrets 추가** (Settings → Secrets)
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  VERCEL_TOKEN (CI/CD용)
  VERCEL_ORG_ID (CI/CD용)
  VERCEL_PROJECT_ID (CI/CD용)
  ```
- [ ] **Branch Protection 설정** (`main` 브랜치)
  - [ ] Require pull request reviews
  - [ ] Require status checks to pass
  - [ ] Include administrators

### 6. 보안 체크

- [ ] **의존성 보안 감사**
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] **환경 변수 누출 확인**
  ```bash
  # .env 파일이 .gitignore에 있는지 확인
  git check-ignore .env
  ```
- [ ] **API 인증 테스트**
  - [ ] 비인증 요청 차단 확인
  - [ ] RLS 정책 작동 확인
- [ ] **CORS 설정 확인**
- [ ] **Rate Limiting 테스트** (향후)

### 7. 성능 체크

- [ ] **로컬 빌드 테스트**
  ```bash
  npm run build
  npm run start
  ```
- [ ] **번들 크기 확인**
  ```bash
  npm run build
  # First Load JS < 100KB 목표
  ```
- [ ] **Lighthouse 테스트** (개발 환경)
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

### 8. 기능 테스트

#### 인증
- [ ] 회원가입 동작 확인
- [ ] 로그인 동작 확인
- [ ] 로그아웃 동작 확인
- [ ] 세션 유지 확인

#### 핵심 기능
- [ ] 회사/현장 생성
- [ ] 근로자 등록
- [ ] 출근 기록 등록
- [ ] 급여 계산
- [ ] Excel 업로드
- [ ] Excel 다운로드

#### 권한
- [ ] 다른 사용자 데이터 접근 차단
- [ ] RLS 정책 작동 확인

---

## 🎯 배포 실행

### 1. 최종 확인

```bash
# 1. 현재 브랜치 확인
git branch

# 2. 최신 상태 확인
git status

# 3. main 브랜치로 전환
git checkout main

# 4. 최신 코드 풀
git pull origin main
```

### 2. Vercel 배포

**옵션 A: CLI 배포**
```bash
# 프로덕션 배포
vercel --prod

# 배포 완료 후 URL 확인
```

**옵션 B: GitHub 연동 (권장)**
```bash
# main 브랜치에 푸시하면 자동 배포
git push origin main
```

### 3. 배포 모니터링

- [ ] **Vercel Dashboard 확인**
  - Build Logs 체크
  - 에러 없이 완료 확인
- [ ] **배포 URL 접속**
  - 페이지 로드 확인
  - 콘솔 에러 확인 (F12)
- [ ] **Health Check**
  ```bash
  curl https://yourdomain.com/api/health
  ```

---

## ✅ 배포 후 검증

### 즉시 확인 (배포 후 5분 내)

- [ ] **사이트 접속 가능**
  - [ ] 메인 페이지 로드
  - [ ] 로그인 페이지 로드
- [ ] **인증 시스템**
  - [ ] 회원가입 테스트
  - [ ] 로그인 테스트
  - [ ] 로그아웃 테스트
- [ ] **API 응답**
  - [ ] GET /api/companies
  - [ ] GET /api/sites
  - [ ] GET /api/workers
- [ ] **콘솔 에러 확인**
  - 브라우저 개발자 도구에서 에러 없는지 확인

### 30분 내 확인

- [ ] **주요 기능 테스트**
  - [ ] 회사 생성
  - [ ] 현장 생성
  - [ ] 근로자 등록 (1명)
  - [ ] 출근 기록
  - [ ] 급여 계산
  - [ ] Excel 다운로드
- [ ] **성능 확인**
  - [ ] 페이지 로드 시간 < 3초
  - [ ] API 응답 시간 < 1초
- [ ] **모바일 확인**
  - [ ] 반응형 레이아웃
  - [ ] 터치 인터랙션

### 1시간 내 확인

- [ ] **Vercel Analytics 확인**
  - 방문자 수집 시작
  - Web Vitals 데이터
- [ ] **Supabase Dashboard 확인**
  - DB 연결 정상
  - Auth 이벤트 로그
  - API 요청 로그
- [ ] **에러 모니터링**
  - Sentry (설정된 경우)
  - Vercel Logs
  - 예상치 못한 에러 없는지

### 24시간 내 확인

- [ ] **사용자 피드백 수집**
- [ ] **성능 메트릭 분석**
  - Lighthouse 점수
  - Core Web Vitals
- [ ] **에러율 체크**
  - 목표: < 1%
- [ ] **데이터베이스 상태**
  - 쿼리 성능
  - 커넥션 풀 사용률

---

## 🚨 문제 발생 시 대응

### 배포 실패

```bash
# 1. 에러 로그 확인
vercel logs

# 2. 로컬 빌드 테스트
npm run build

# 3. 환경 변수 확인
vercel env ls
```

### 사이트 접속 불가

```bash
# 1. DNS 전파 확인 (커스텀 도메인 사용 시)
nslookup yourdomain.com

# 2. Vercel 상태 확인
# https://www.vercel-status.com/

# 3. 롤백 고려
vercel rollback
```

### API 에러

- [ ] Supabase 연결 확인
- [ ] 환경 변수 확인
- [ ] RLS 정책 확인
- [ ] 네트워크 로그 확인

### 데이터베이스 문제

- [ ] Supabase Dashboard에서 상태 확인
- [ ] 쿼리 로그 확인
- [ ] 커넥션 수 확인
- [ ] 백업에서 복구 고려

---

## 📊 배포 성공 기준

### 필수 (Must Have)

- ✅ 모든 페이지 정상 로드
- ✅ 인증 시스템 작동
- ✅ 핵심 기능 (CRUD) 작동
- ✅ 에러율 < 5%
- ✅ 페이지 로드 시간 < 5초

### 권장 (Should Have)

- ⭐ Lighthouse Performance > 80
- ⭐ 에러율 < 1%
- ⭐ 페이지 로드 시간 < 3초
- ⭐ API 응답 시간 < 1초

### 최적 (Nice to Have)

- 🎯 Lighthouse Performance > 90
- 🎯 에러율 < 0.1%
- 🎯 페이지 로드 시간 < 2초
- 🎯 API 응답 시간 < 500ms

---

## 📝 배포 완료 보고

**배포 정보**
- 날짜/시간: _______________
- 버전: _______________
- 배포자: _______________
- 배포 URL: _______________

**체크리스트 완료 여부**
- [ ] 모든 사전 체크 완료
- [ ] 배포 성공
- [ ] 배포 후 검증 완료
- [ ] 모니터링 설정 완료

**이슈 및 특이사항**
```
(이슈나 특이사항 기록)
```

**다음 단계**
- [ ] 사용자 온보딩
- [ ] 피드백 수집
- [ ] 성능 모니터링
- [ ] 기능 개선

---

## 🔄 롤백 절차

배포 후 심각한 문제 발생 시:

```bash
# 1. Vercel Dashboard에서 롤백
# Deployments → 이전 버전 선택 → Promote to Production

# 또는 CLI로 롤백
vercel rollback

# 2. 데이터베이스 롤백 (필요 시)
# Supabase Dashboard → Database → Backups → Restore

# 3. 팀 공지
# Slack/Discord에 롤백 사실 공지

# 4. 원인 분석 시작
# 로그 수집, 에러 분석, 재발 방지책 마련
```

---

**작성**: Claude Code
**버전**: 1.0
**관련 문서**: DEPLOYMENT_PLAN.md
