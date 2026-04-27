# 프로덕션 배포 전 개선 사항

## 개요
Vercel 배포 최적화 후 프로덕션 안정성을 위한 추가 개선 작업

---

## 🔴 Critical (즉시 개선 필요)

### 1. TypeScript/ESLint 에러 무시 제거

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

**문제점**:
- 실제 버그가 있어도 빌드가 성공
- 프로덕션에서 런타임 에러 발생 가능
- 타입 안전성 상실

**해결 방안**:
1. 현재 프로젝트의 타입/린트 에러 확인
2. 모든 에러 수정
3. `ignoreDuringBuilds: false` 또는 설정 제거
4. CI/CD에서 빌드 실패 시 배포 차단

**우선순위**: 🔴 HIGH

---

### 2. /api/debug 엔드포인트 보안 강화

**현재 상태**:
- 모든 환경에서 접근 가능
- 환경 변수 설정 여부 노출

**문제점**:
- 프로덕션 환경 정보 노출
- 잠재적 보안 취약점

**해결 방안**:
```typescript
// 개발 환경에서만 활성화
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

**대안**: 배포 확인 후 완전 삭제

**우선순위**: 🔴 HIGH

---

## 🟡 Medium (정식 출시 전 개선 권장)

### 3. Build ID 최적화

**현재 상태**:
```javascript
generateBuildId: async () => {
  return `build-${Date.now()}`
},
```

**문제점**:
- 매 빌드마다 새로운 ID 생성
- Vercel 증분 빌드 캐싱 비활성화
- 빌드 시간 증가

**해결 방안 1**: Git commit hash 사용
```javascript
generateBuildId: async () => {
  try {
    const { execSync } = require('child_process')
    const gitHash = execSync('git rev-parse --short HEAD')
      .toString()
      .trim()
    return `build-${gitHash}`
  } catch (error) {
    return `build-${Date.now()}` // fallback
  }
},
```

**해결 방안 2**: 완전 제거 (Next.js 기본값 사용)

**우선순위**: 🟡 MEDIUM

---

### 4. 프로덕션 환경 변수 검증

**추가 필요 사항**:
- 환경 변수 누락 시 빌드 실패
- 명확한 에러 메시지

**구현**:
```javascript
// next.config.mjs 상단에 추가
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
]

if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  })
}
```

**우선순위**: 🟡 MEDIUM

---

## 🟢 Low (추후 최적화 가능)

### 5. ISR (Incremental Static Regeneration) 적용

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

**우선순위**: 🟢 LOW

---

### 6. Edge Runtime 적용 검토

**대상 API**:
- `/api/health` - 단순 헬스체크
- `/api/debug` - 환경 변수 확인 (개발용)

**구현**:
```typescript
export const runtime = 'edge'
```

**효과**:
- 응답 속도 개선 (Cold start 제거)
- 글로벌 엣지 배포

**주의사항**:
- Prisma는 Edge Runtime 미지원
- 데이터베이스 쿼리 필요한 API는 적용 불가

**우선순위**: 🟢 LOW

---

### 7. 이미지 최적화

**현재 상태**: `<img>` 태그 사용 (있는 경우)

**개선**:
```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
  priority // LCP 최적화
/>
```

**우선순위**: 🟢 LOW

---

## 개선 작업 순서

### Phase 1: 긴급 보안/안정성 (배포 전 필수)
1. ✅ TypeScript/ESLint 에러 확인
2. ✅ 모든 에러 수정
3. ✅ `ignoreBuildErrors` 제거
4. ✅ `/api/debug` 보안 강화
5. ✅ 로컬 빌드 테스트
6. ✅ 배포

### Phase 2: 최적화 (정식 출시 전)
1. Build ID 최적화
2. 환경 변수 검증 추가
3. 로컬 빌드 테스트
4. 배포

### Phase 3: 성능 개선 (출시 후)
1. ISR 적용
2. Edge Runtime 검토
3. 이미지 최적화
4. 성능 모니터링

---

## 체크리스트

### Phase 1 (즉시)
- [ ] `npm run lint` 실행 및 에러 확인
- [ ] `npm run build` 실행 및 타입 에러 확인
- [ ] 모든 에러 수정
- [ ] `next.config.mjs`에서 `ignoreDuringBuilds` 제거
- [ ] `/api/debug` 프로덕션 접근 제한
- [ ] 로컬 테스트: `npm run build && npm run start`
- [ ] 커밋 & 배포
- [ ] 배포 후 검증: `/api/health`, `/api/debug`, 주요 페이지

### Phase 2 (정식 출시 전)
- [ ] Git commit hash 기반 buildId 구현
- [ ] 환경 변수 검증 로직 추가
- [ ] 배포 가이드 업데이트
- [ ] 커밋 & 배포

### Phase 3 (출시 후)
- [ ] ISR 적용 및 효과 측정
- [ ] Edge Runtime 테스트
- [ ] 이미지 최적화
- [ ] Lighthouse 점수 측정
- [ ] Web Vitals 모니터링

---

## 예상 효과

### Phase 1 완료 시
- ✅ 프로덕션 런타임 에러 사전 방지
- ✅ 타입 안전성 확보
- ✅ 보안 취약점 제거

### Phase 2 완료 시
- ✅ 빌드 시간 10-30% 단축
- ✅ 배포 실패 조기 감지

### Phase 3 완료 시
- ✅ 페이지 로딩 속도 30-50% 개선
- ✅ 서버 부하 20-40% 감소
- ✅ Lighthouse 점수 90+ 달성

---

## 참고 문서

- [Next.js Build Configuration](https://nextjs.org/docs/app/api-reference/next-config-js)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

---

## 변경 이력

### 2026-04-27
- 개선 사항 문서 작성
- Phase 1-3 우선순위 정의
- 체크리스트 작성
