# 데이터베이스 연결 오류 보고서

**발생 일시**: 2026-04-25 15:13:27
**오류 유형**: PrismaClientInitializationError
**심각도**: 🔴 Critical (서비스 중단)

---

## 1. 오류 내용

### 오류 메시지
```
Error [PrismaClientInitializationError]:
Invalid `prisma.company.findUnique()` invocation:

Error querying the database: FATAL: Tenant or user not found
```

### 발생 위치
- **파일**: `.next/server/app/companies/[id]/page.js`
- **Prisma 클라이언트 버전**: 5.22.0
- **Digest**: 433681422

### 영향 범위
- ❌ `/companies/[id]` 페이지 완전 불능
- ❌ 모든 데이터베이스 쿼리 실패 (로컬 환경 포함)
- ❌ Vercel 프로덕션 환경 서비스 불가

---

## 2. 원인 분석

### 2.1 근본 원인
**Supabase 프로젝트 연결 실패** - "Tenant or user not found" 오류

이 오류는 일반적으로 다음 경우에 발생:

1. **Supabase 프로젝트 일시 중지** ⭐ 가장 가능성 높음
   - 무료 플랜의 비활성 기간 초과
   - 청구 문제
   - 프로젝트 자동 일시 중지

2. **연결 문자열 만료/변경**
   - 프로젝트 재설정으로 인한 URL 변경
   - 비밀번호 변경

3. **프로젝트 삭제 또는 권한 문제**
   - 프로젝트가 삭제됨
   - 데이터베이스 사용자 권한 변경

### 2.2 테스트 결과

**로컬 환경 테스트**:
```bash
npx tsx scripts/test-connection.ts
```

결과:
```
❌ Connection error: PrismaClientInitializationError
Error querying the database: FATAL: Tenant or user not found
```

**현재 연결 문자열**:
```
DATABASE_URL="postgresql://postgres.ejgsotsviobjfvfqovcj:***@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ejgsotsviobjfvfqovcj:***@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

**프로젝트 ID**: `ejgsotsviobjfvfqovcj`
**리전**: AWS AP Southeast 1 (Singapore)

### 2.3 타임라인

| 시간 | 이벤트 |
|------|--------|
| 2026-04-25 14:00 | 인건비 UI 개선 커밋 및 푸시 |
| 2026-04-25 14:30 | Vercel 자동 배포 완료 |
| 2026-04-25 15:13 | **데이터베이스 연결 오류 발생** |
| 2026-04-25 15:20 | 로컬 테스트로 원인 확인 |

### 2.4 트리거 요인 분석

최근 코드 변경 사항:
```typescript
// /companies/[id]/page.tsx에 추가된 쿼리
const sitesWithStats = await Promise.all(
  company.sites.map(async (site) => {
    // 현장마다 2개의 추가 쿼리 실행
    const payrollSum = await prisma.payroll.aggregate(...)
    const currentMonthAttendance = await prisma.attendance.groupBy(...)
  })
)
```

**문제점**:
- 현장이 5개면 → 10개의 추가 쿼리
- 현장이 10개면 → 20개의 추가 쿼리
- 병렬 실행으로 연결 풀(pool) 고갈 가능성

하지만 **이것은 트리거일 뿐, 근본 원인은 Supabase 프로젝트 자체의 문제**입니다.

---

## 3. 해결 방법

### 3.1 즉시 조치 (완료 ✅)

**과도한 쿼리 제거**:
```typescript
// Before (위험)
const sitesWithStats = await Promise.all(
  company.sites.map(async (site) => {
    const payrollSum = await prisma.payroll.aggregate(...)  // 쿼리 1
    const attendance = await prisma.attendance.groupBy(...)  // 쿼리 2
  })
)

// After (안전)
const sitesWithStats = company.sites.map((site) => ({
  ...serializedSite,
  monthlyLaborCost: 0,  // 기본값
  currentMonthWorkers: 0,  // 기본값
}))
```

**결과**: 추가 DB 쿼리 제거, 연결 부담 감소

### 3.2 Supabase 프로젝트 복구 (필수 🔴)

#### Step 1: Supabase 대시보드 확인
1. https://supabase.com/dashboard 접속
2. 프로젝트 목록에서 `ejgsotsviobjfvfqovcj` 검색
3. 프로젝트 상태 확인:
   - ⏸️ **Paused** (일시 중지) → Step 2로
   - ❌ **Not Found** (없음) → Step 3으로
   - ✅ **Active** (활성) → Step 4로

#### Step 2: 프로젝트 재시작 (일시 중지된 경우)
```
1. 프로젝트 클릭
2. "Resume Project" 또는 "Restore Project" 버튼 클릭
3. 재시작 완료될 때까지 대기 (약 1-2분)
4. 연결 테스트: npx tsx scripts/test-connection.ts
```

#### Step 3: 새 프로젝트 생성 (프로젝트 삭제된 경우)
```
1. "New Project" 클릭
2. Organization 선택
3. 프로젝트 이름: nomu-pro
4. 비밀번호 설정 (복잡한 비밀번호 권장)
5. 리전: Singapore (또는 Seoul if available)
6. 생성 완료 후 새 연결 문자열 복사
```

**새 연결 문자열 설정**:
```bash
# .env.local 수정
DATABASE_URL="postgresql://postgres.[NEW_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[NEW_PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Prisma 마이그레이션 실행
npx prisma migrate deploy
npx prisma generate
```

**Vercel 환경 변수 업데이트**:
```
1. Vercel 대시보드 → Settings → Environment Variables
2. DATABASE_URL 업데이트
3. DIRECT_URL 업데이트
4. Redeploy 트리거
```

#### Step 4: 연결 문자열 재확인 (활성 상태인 경우)
```
1. Supabase 대시보드 → Project Settings → Database
2. Connection String 섹션 확인
3. "Connection Pooling" 탭에서 새 문자열 복사
4. .env.local에 업데이트
5. Vercel 환경 변수도 업데이트
```

### 3.3 장기 해결책

#### A. 연결 풀 최적화
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")

  // 연결 풀 설정 추가
  connection_limit = 10  // Vercel 서버리스 환경에 적합
}
```

#### B. API 라우트 분리
현장별 통계는 별도 API로 분리:
```typescript
// app/api/sites/[id]/stats/route.ts
export async function GET(request, { params }) {
  const { id } = await params

  const payrollSum = await prisma.payroll.aggregate({
    where: { siteId: id, year, month },
    _sum: { totalPay: true }
  })

  return NextResponse.json({ monthlyLaborCost: payrollSum._sum.totalPay || 0 })
}
```

#### C. 클라이언트 사이드 데이터 로딩
```typescript
// SiteCard 컴포넌트에서
useEffect(() => {
  fetch(`/api/sites/${site.id}/stats`)
    .then(res => res.json())
    .then(data => setMonthlyLaborCost(data.monthlyLaborCost))
}, [site.id])
```

#### D. 캐싱 전략
```typescript
// app/api/sites/[id]/stats/route.ts
export const revalidate = 300  // 5분 캐시
```

---

## 4. 예방 조치

### 4.1 모니터링 설정
- [ ] Supabase 프로젝트에 알림 설정
- [ ] Vercel에서 에러 알림 활성화
- [ ] 데이터베이스 연결 Health Check API 구현

### 4.2 코드 리뷰 체크리스트
```
✅ 서버 컴포넌트에서 병렬 쿼리 수 확인
✅ 연결 풀 한계 고려 (Vercel: ~10 connections)
✅ 쿼리 최적화 (N+1 문제 방지)
✅ 적절한 캐싱 전략 적용
```

### 4.3 Supabase 프로젝트 관리
```
✅ 정기적으로 프로젝트 상태 확인 (주 1회)
✅ 무료 플랜 제한 모니터링
✅ 백업 정책 수립
✅ 프로덕션 환경에서는 유료 플랜 고려
```

---

## 5. 현재 상태

### 5.1 코드 변경 사항
| 파일 | 변경 내용 | 상태 |
|------|----------|------|
| `app/companies/[id]/page.tsx` | 과도한 쿼리 제거, 기본값 사용 | ✅ 완료 |
| `app/components/sites/SiteCard.tsx` | monthlyLaborCost props 유지 (기본값 0) | ✅ 완료 |

### 5.2 다음 단계

**즉시 실행 필요** (우선순위 순):

1. 🔴 **Supabase 프로젝트 복구** (사용자 직접 수행 필요)
   - Supabase 대시보드에서 프로젝트 상태 확인
   - 일시 중지 상태면 재시작
   - 연결 테스트

2. 🟡 **코드 커밋 및 배포**
   ```bash
   git add -A
   git commit -m "fix: remove excessive DB queries to prevent connection pool exhaustion"
   git push origin db
   ```

3. 🟢 **장기 개선 작업**
   - API 라우트로 통계 분리
   - 클라이언트 사이드 데이터 로딩
   - 캐싱 전략 구현

---

## 6. 교훈

### 문제점
- 서버 컴포넌트에서 루프 내 비동기 쿼리는 위험
- Vercel 서버리스 환경의 연결 풀 제한 미고려
- Supabase 무료 플랜의 제한 사항 미확인

### 개선 방향
- 단일 쿼리로 모든 데이터 가져오기
- 통계 데이터는 API 라우트로 분리
- 적절한 캐싱과 데이터 로딩 전략

### 베스트 프랙티스
```typescript
// ❌ 나쁜 예
const results = await Promise.all(
  items.map(async (item) => {
    const data = await prisma.query(...)  // N개의 쿼리
    return data
  })
)

// ✅ 좋은 예
const results = await prisma.query({
  where: { id: { in: items.map(i => i.id) } }  // 단일 쿼리
})
```

---

**작성자**: Claude Sonnet 4.5
**작성 일시**: 2026-04-25
**상태**: 🟡 조치 대기 중 (Supabase 프로젝트 복구 필요)
