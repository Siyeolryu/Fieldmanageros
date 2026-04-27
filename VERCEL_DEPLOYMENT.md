# Vercel 배포 가이드 (404 오류 해결)

## 문제 상황
Vercel 배포 후 https://dev3nomu.vercel.app/dashboard/companies 같은 하위 경로가 404 에러를 발생시키는 문제

## 진단 결과

### 원인 분석
1. **vercel.json 간섭**: Next.js 15에서는 vercel.json의 buildCommand, framework 등이 자동 감지를 방해할 수 있음
2. **설정 중복**: Next.js 설정과 Vercel 설정이 중복되어 충돌 발생 가능

### 해결 방법 적용

#### 1. vercel.json 최소화
- 불필요한 빌드 설정 제거
- 리전 설정만 유지
- 보안 헤더는 next.config.mjs로 이동

#### 2. next.config.mjs 업데이트
- 보안 헤더를 async headers()로 추가
- 기존 리다이렉트 규칙 유지

#### 3. .vercelignore 추가
- 불필요한 파일 배포 방지
- 빌드 최적화

## 배포 전 체크리스트

### 1. 환경 변수 확인
Vercel 대시보드에서 다음 환경 변수가 설정되어 있는지 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
```

### 2. 로컬 빌드 테스트
```bash
npm run build
npm run start
```

다음 경로들이 정상 작동하는지 확인:
- http://localhost:3000/
- http://localhost:3000/companies
- http://localhost:3000/sites
- http://localhost:3000/dashboard
- http://localhost:3000/workers
- http://localhost:3000/payroll

### 3. 배포
```bash
# Git 커밋
git add .
git commit -m "fix: Vercel 배포 설정 최적화 - 404 오류 해결"
git push origin db

# Vercel은 자동으로 배포 시작
```

## 배포 후 검증

### 1. 헬스체크 API 확인
```bash
curl https://dev3nomu.vercel.app/api/health
```

예상 응답:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-27T...",
  "service": "Field Manager OS",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "api": "ok"
  }
}
```

### 2. 디버그 엔드포인트 확인
```bash
curl https://dev3nomu.vercel.app/api/debug
```

환경 변수가 모두 'SET'으로 표시되어야 함:
```json
{
  "status": "ok",
  "environment": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SUPABASE_URL": "SET",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "SET",
    "SUPABASE_SERVICE_ROLE_KEY": "SET",
    "DATABASE_URL": "SET",
    "DIRECT_URL": "SET"
  }
}
```

### 3. 주요 페이지 접근 테스트
브라우저에서 다음 URL 접근 확인:

- ✅ https://dev3nomu.vercel.app/
- ✅ https://dev3nomu.vercel.app/companies
- ✅ https://dev3nomu.vercel.app/sites
- ✅ https://dev3nomu.vercel.app/dashboard
- ✅ https://dev3nomu.vercel.app/workers
- ✅ https://dev3nomu.vercel.app/payroll
- ✅ https://dev3nomu.vercel.app/api/companies

### 4. 리다이렉트 확인
다음 경로는 자동으로 리다이렉트되어야 함:

- /dashboard/companies → /companies
- /dashboard/sites → /sites
- /dashboard/workers → /workers
- /dashboard/payroll → /payroll

## 문제 해결 가이드

### 여전히 404 오류 발생 시

#### 1. Vercel 대시보드에서 빌드 로그 확인
- Settings → Deployments → 최신 배포 클릭
- Build Logs에서 에러 확인

#### 2. 환경 변수 재확인
- Settings → Environment Variables
- Production 환경에 모든 변수가 설정되어 있는지 확인
- 변수 수정 후 Redeploy 필요

#### 3. 캐시 초기화
```bash
# Vercel CLI 사용 시
vercel --force

# 또는 Vercel 대시보드에서
Deployments → ... → Redeploy → Clear cache and redeploy
```

#### 4. Next.js 버전 확인
```json
// package.json
{
  "dependencies": {
    "next": "^15.5.15"
  }
}
```

#### 5. Middleware 확인
middleware.ts가 올바르게 작동하는지 확인:
```bash
curl -I https://dev3nomu.vercel.app/companies
```

응답 헤더에 리다이렉트가 있으면 middleware 문제.

## 주요 파일 구조

```
project/
├── app/
│   ├── companies/
│   │   ├── page.tsx          ✅ /companies
│   │   ├── [id]/page.tsx     ✅ /companies/[id]
│   │   └── new/page.tsx      ✅ /companies/new
│   ├── sites/
│   │   ├── page.tsx          ✅ /sites
│   │   ├── [id]/page.tsx     ✅ /sites/[id]
│   │   └── new/page.tsx      ✅ /sites/new
│   ├── dashboard/
│   │   └── page.tsx          ✅ /dashboard
│   └── api/
│       ├── health/route.ts   ✅ /api/health
│       └── debug/route.ts    ✅ /api/debug (새로 추가)
├── middleware.ts              ✅ 인증 처리
├── next.config.mjs           ✅ 보안 헤더 + 리다이렉트
├── vercel.json               ✅ 최소 설정 (리전만)
└── .vercelignore             ✅ 불필요한 파일 제외
```

## 성공 기준

- [x] 로컬 빌드 성공 (npm run build)
- [ ] Vercel 배포 성공 (자동 빌드)
- [ ] /api/health 응답 200 OK
- [ ] /api/debug 환경 변수 모두 SET
- [ ] /companies 페이지 정상 렌더링
- [ ] /sites 페이지 정상 렌더링
- [ ] /dashboard 페이지 정상 렌더링 (인증 필요)
- [ ] 동적 라우트 정상 작동 (/companies/[id], /sites/[id])

## 추가 최적화 사항

### 1. Edge Runtime 고려 (선택사항)
특정 페이지/API에서 더 빠른 응답을 원할 경우:

```typescript
// app/api/health/route.ts
export const runtime = 'edge'
```

### 2. ISR (Incremental Static Regeneration)
자주 변경되지 않는 페이지에 적용:

```typescript
// app/companies/page.tsx
export const revalidate = 60 // 60초마다 재생성
```

### 3. 이미지 최적화
Next.js Image 컴포넌트 사용 권장:

```typescript
import Image from 'next/image'
```

## 참고 문서

- [Next.js 15 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel Next.js 최적화](https://vercel.com/docs/frameworks/nextjs)
- [App Router 라우팅](https://nextjs.org/docs/app/building-your-application/routing)
- [Middleware 설정](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 변경 이력

### 2026-04-27
- vercel.json 최소화 (빌드 설정 제거)
- next.config.mjs에 보안 헤더 추가
- .vercelignore 추가
- /api/debug 엔드포인트 추가
- 배포 가이드 작성
