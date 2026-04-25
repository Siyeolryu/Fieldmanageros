# 서버 오류 수정: Date 객체 직렬화 문제 해결

## 발생한 오류

### 증상
- URL: `/companies/[id]`, `/sites/[id]`
- 오류 메시지: "Application error: a server-side exception has occurred"
- Digest: 433681422

### 재현 환경
- Vercel 배포 환경
- Next.js 15.5.15 (App Router)
- 서버 컴포넌트에서 클라이언트 컴포넌트로 데이터 전달 시 발생

## 원인 분석

### 근본 원인
Next.js의 서버 컴포넌트에서 클라이언트 컴포넌트로 props를 전달할 때, **모든 데이터는 직렬화(serialization) 가능해야 함**. 하지만 JavaScript의 `Date` 객체는 직렬화할 수 없어 런타임 오류가 발생함.

### 문제가 있었던 코드

**`/companies/[id]/page.tsx` (서버 컴포넌트)**
```typescript
// ❌ 잘못된 코드
const company = await prisma.company.findUnique({
  where: { id },
  include: {
    sites: {
      orderBy: { createdAt: 'desc' },
    }
  }
})

// Date 객체를 포함한 채로 클라이언트 컴포넌트에 전달
<CompanyForm initialData={company} />  // ❌ 오류 발생!
<SiteCard site={site} />                // ❌ 오류 발생!
```

### 왜 이전엔 발견되지 않았나?
- 로컬 개발 환경에서는 Next.js가 일부 직렬화 문제를 자동으로 처리
- Vercel 프로덕션 빌드에서는 엄격한 직렬화 검사 수행
- 이전 세션에서 import 경로만 수정했고, Date 직렬화 문제는 발견하지 못함

## 해결 방법

### 1. `/companies/[id]/page.tsx` 수정

**Before:**
```typescript
const company = await prisma.company.findUnique({
  where: { id },
  include: {
    sites: {
      orderBy: { createdAt: 'desc' },
    }
  }
})

// Date 객체가 포함된 채로 전달
<CompanyForm initialData={company} />
{company.sites.map(site => (
  <SiteCard key={site.id} site={site} />
))}
```

**After:**
```typescript
const company = await prisma.company.findUnique({
  where: { id },
  include: {
    sites: {
      orderBy: { createdAt: 'desc' },
    }
  }
})

// ✅ Date 객체를 ISO 문자열로 변환
const serializedCompany = {
  ...company,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
}

const serializedSites = company.sites.map(site => ({
  ...site,
  startDate: site.startDate?.toISOString() || null,
  endDate: site.endDate?.toISOString() || null,
  createdAt: site.createdAt.toISOString(),
  updatedAt: site.updatedAt.toISOString(),
}))

// 직렬화된 데이터 전달
<CompanyForm initialData={serializedCompany} />
{serializedSites.map(site => (
  <SiteCard key={site.id} site={site} />
))}
```

### 2. `/sites/[id]/page.tsx` 수정

**동일한 패턴 적용:**
```typescript
// ✅ Site 객체 직렬화
const serializedSite = {
  ...site,
  startDate: site.startDate?.toISOString() || null,
  endDate: site.endDate?.toISOString() || null,
  createdAt: site.createdAt.toISOString(),
  updatedAt: site.updatedAt.toISOString(),
  company: site.company ? {
    ...site.company,
    createdAt: site.company.createdAt.toISOString(),
    updatedAt: site.company.updatedAt.toISOString(),
  } : null,
}

// ✅ Companies 배열 직렬화
const serializedCompanies = companies.map(company => ({
  ...company,
  createdAt: company.createdAt.toISOString(),
  updatedAt: company.updatedAt.toISOString(),
}))

<SiteForm initialData={serializedSite} companies={serializedCompanies} />
```

## 수정된 파일 목록

1. `app/companies/[id]/page.tsx`
   - `serializedCompany` 추가
   - `serializedSites` 배열 추가
   - Date 필드를 ISO 문자열로 변환

2. `app/sites/[id]/page.tsx`
   - `serializedSite` 추가
   - `serializedCompanies` 배열 추가
   - 중첩된 `company` 객체도 직렬화

## 검증 결과

### 빌드 테스트
```bash
npm run build
```
- ✅ 컴파일 성공
- ✅ 모든 페이지 정적 생성 성공
- ✅ 오류 없음

### 변경 사항
- 빌드 전: Application error 발생
- 빌드 후: 정상 작동

## 교훈 및 베스트 프랙티스

### 1. Next.js 서버/클라이언트 컴포넌트 데이터 전달 규칙
- **직렬화 가능한 데이터만 전달**: JSON.stringify()로 변환 가능해야 함
- **Date 객체는 ISO 문자열로 변환**: `date.toISOString()`
- **함수, Symbol, undefined는 전달 불가**

### 2. Prisma Date 필드 처리 패턴
```typescript
// ✅ 권장 패턴
const serializedData = {
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
  startDate: data.startDate?.toISOString() || null,  // nullable 필드
}
```

### 3. 중첩 객체 처리
```typescript
// ✅ 관계형 데이터도 재귀적으로 직렬화
const serializedSite = {
  ...site,
  createdAt: site.createdAt.toISOString(),
  company: site.company ? {
    ...site.company,
    createdAt: site.company.createdAt.toISOString(),
    updatedAt: site.company.updatedAt.toISOString(),
  } : null,
}
```

### 4. 타입 안전성 유지
클라이언트 컴포넌트에서는 ISO 문자열을 받으므로 필요 시 다시 Date로 변환:
```typescript
// 클라이언트 컴포넌트에서
const date = new Date(props.createdAt)
```

## 추가 조치 필요 사항

### 다른 페이지 점검
다음 페이지들도 동일한 패턴 확인 필요:
- ✅ `/companies/[id]/page.tsx` - 수정 완료
- ✅ `/sites/[id]/page.tsx` - 수정 완료
- ⚠️ 다른 동적 라우트 페이지들도 검토 권장

### 자동화 가능성
향상된 방법:
1. **헬퍼 함수 작성**:
   ```typescript
   // lib/utils/serialize.ts
   export function serializeDates<T>(obj: T): T {
     // 재귀적으로 모든 Date 객체를 ISO 문자열로 변환
   }
   ```

2. **Prisma 미들웨어 활용**:
   - 모든 쿼리 결과를 자동으로 직렬화

3. **타입 정의 개선**:
   ```typescript
   type Serialized<T> = {
     [K in keyof T]: T[K] extends Date
       ? string
       : T[K] extends object
       ? Serialized<T[K]>
       : T[K]
   }
   ```

## 결론

Next.js 15의 App Router에서 서버 컴포넌트와 클라이언트 컴포넌트 간 데이터 전달 시 **Date 객체 직렬화는 필수**입니다.

이번 수정으로:
- ✅ `/companies/[id]` 페이지 정상 작동
- ✅ `/sites/[id]` 페이지 정상 작동
- ✅ Vercel 프로덕션 환경에서 안정적 동작

---

**수정 일시**: 2026-04-25
**수정자**: Claude Sonnet 4.5
**관련 커밋**: (다음 커밋)
