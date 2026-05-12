# Vercel 빌드 에러 디버깅 가이드

**작성일**: 2026-04-14
**목적**: Vercel 배포 시 발생하는 에러를 효과적으로 디버깅하는 방법

---

## 🔍 1단계: Vercel 빌드 로그 확인

### 방법 1: Vercel Dashboard
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Deployments** 탭 클릭
4. 최신 배포 선택
5. **View Build Logs** 클릭

### 방법 2: Vercel CLI
```bash
# 최신 배포 로그 확인
vercel logs

# 특정 배포 로그 확인
vercel logs <deployment-url>

# 실시간 로그 스트리밍
vercel logs --follow
```

### 방법 3: GitHub Actions (CI/CD 사용 시)
1. GitHub 저장소 → **Actions** 탭
2. 최신 워크플로우 실행 선택
3. 빌드 단계 로그 확인

---

## 📋 2단계: 에러 로그 복사

### 에러 로그 형식
Vercel 빌드 로그를 복사할 때 다음 정보를 포함하세요:

```markdown
# Vercel Build Error Log

**Date**: 2026-04-14
**Commit**: abc1234
**Branch**: db

## Error Output
[전체 에러 메시지 복사]
```

### 중요한 에러 섹션
- ❌ **Failed to compile** - 컴파일 실패
- ❌ **Module not found** - 모듈 누락
- ❌ **Type error** - TypeScript 타입 오류
- ❌ **Build failed** - 빌드 실패
- ⚠️ **Warning** - 경고 (빌드는 성공할 수 있음)

---

## 🛠️ 3단계: 일반적인 에러 및 해결 방법

### 에러 1: Module not found
```
Error: Cannot find module 'module-name'
```

**원인**:
- 패키지가 `package.json`에 없음
- Import 경로가 잘못됨
- 파일이 실제로 존재하지 않음

**해결**:
```bash
# 패키지 설치 확인
npm ls module-name

# 없으면 설치
npm install module-name

# devDependencies로 설치된 경우
npm install --save-dev module-name

# 커밋 및 푸시
git add package.json package-lock.json
git commit -m "fix: Add missing dependency"
git push
```

---

### 에러 2: TypeScript Type Error
```
Type error: Type 'X' is not assignable to type 'Y'
```

**임시 해결** (빠른 배포):
```typescript
// next.config.ts
export default {
  typescript: {
    ignoreBuildErrors: true,  // 타입 오류 무시
  },
}
```

**근본 해결**:
1. 해당 파일의 타입 정의 수정
2. 타입 assertion 사용: `value as Type`
3. null 체크 추가: `if (value !== null)`

---

### 에러 3: Environment Variables Missing
```
Error: Environment variable 'VARIABLE_NAME' is not defined
```

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. 누락된 변수 추가
3. **Redeploy** 버튼 클릭

**필수 환경 변수 체크리스트**:
```bash
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ ANTHROPIC_API_KEY
```

---

### 에러 4: Build Timeout
```
Error: Command "npm run build" exited with timeout
```

**원인**:
- 빌드가 너무 오래 걸림 (>15분)
- 무한 루프 또는 데드락

**해결**:
```typescript
// next.config.ts - 빌드 최적화
export default {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['package-name'],
  },
  swcMinify: true,
}
```

---

### 에러 5: Out of Memory
```
Error: JavaScript heap out of memory
```

**해결**:
```json
// package.json - Node 메모리 증가
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

---

### 에러 6: Prisma Generate Failed
```
Error: Prisma schema not found
```

**해결**:
```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate",  // 이미 있는지 확인
    "vercel-build": "prisma generate && next build"  // Vercel 전용
  }
}
```

---

## 🔧 4단계: 로컬 빌드 테스트

배포 전 항상 로컬에서 프로덕션 빌드를 테스트하세요:

```bash
# 1. 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 프로덕션 빌드
npm run build

# 3. 빌드 성공 시 프로덕션 서버 실행
npm run start

# 4. 테스트
curl http://localhost:3000/api/health
```

---

## 📊 5단계: 빌드 성능 분석

### 빌드 시간 분석
```bash
# 빌드 시간 측정
time npm run build

# 목표: < 2분
```

### 번들 크기 분석
```bash
# @next/bundle-analyzer 설치
npm install --save-dev @next/bundle-analyzer

# 분석 실행
ANALYZE=true npm run build
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // ... 기존 설정
})
```

---

## 🚨 6단계: 긴급 롤백

빌드 실패로 서비스 중단 시:

### Vercel Dashboard에서 롤백
1. Deployments → 이전 성공 배포 선택
2. **Promote to Production** 클릭

### CLI로 롤백
```bash
vercel rollback
```

### 브랜치 되돌리기
```bash
# 이전 커밋으로 리셋
git reset --hard <previous-commit-hash>
git push --force
```

---

## 📝 7단계: 에러 리포트 작성

에러를 해결한 후 문서화하세요:

```markdown
# Vercel Build Error Report

**Date**: 2026-04-14 23:30
**Branch**: db
**Commit**: 77d048d

## Error Summary
[간단한 에러 요약]

## Root Cause
[근본 원인]

## Solution Applied
[적용한 해결 방법]

## Files Modified
- file1.ts
- file2.json

## Prevention
[재발 방지 방법]
```

---

## 🔗 유용한 링크

- [Vercel Build Logs](https://vercel.com/docs/deployments/troubleshoot-a-build)
- [Next.js Build Error](https://nextjs.org/docs/messages)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Status](https://www.vercel-status.com/)

---

## 💡 예방 체크리스트

배포 전 확인사항:

- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 환경 변수 모두 설정됨
- [ ] `package.json` dependencies 최신화
- [ ] TypeScript 오류 없음
- [ ] ESLint 경고 최소화
- [ ] `.gitignore`에 `.env` 포함됨
- [ ] 테스트 통과 (있는 경우)
- [ ] 브랜치 최신화 (`git pull`)

---

**작성자**: Claude Code (Sonnet 4.5)
**버전**: 1.0.0
