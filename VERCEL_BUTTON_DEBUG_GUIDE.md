# 🔧 Vercel 배포 버튼 클릭 문제 해결 가이드

## 현재 상황
- **URL**: https://dev3nomu.vercel.app/
- **증상**: 버튼들이 클릭되지 않음
- **영향 받는 버튼들**:
  - 이메일 가입 버튼 ("3분 만에 무료 시작 →")
  - 카카오 로그인 버튼
  - 네이버 로그인 버튼
  - 헤더 "시작하기" 버튼

---

## ✅ 체크리스트

### 1. Vercel 환경 변수 확인 (가장 중요!)

브라우저에서 다음 페이지가 열렸습니다:
```
https://vercel.com/siyeolryu00-5566s-projects/dev3nomu/settings/environment-variables
```

다음 환경 변수들이 **모두** 설정되어 있는지 확인하세요:

#### ✅ 필수 환경 변수 (Production 환경)

```bash
# Supabase Public Keys
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Supabase Service Key
SUPABASE_SERVICE_ROLE_KEY

# Database URLs (방금 업데이트한 것)
DATABASE_URL
DIRECT_URL

# App URL (선택사항, 권장)
NEXT_PUBLIC_APP_URL
```

**확인 방법**:
1. 각 변수명 왼쪽에 체크 표시가 있는지 확인
2. "Production" 환경이 선택되어 있는지 확인
3. 값이 비어있지 않은지 확인

**만약 없거나 잘못되었다면**:
- .env.local 파일의 값을 복사해서 Vercel에 추가
- 추가 후 반드시 **Redeploy** 필요!

---

### 2. DATABASE_URL 업데이트 확인

**중요**: 최근 데이터베이스 연결 정보가 변경되었습니다!

Vercel의 `DATABASE_URL`과 `DIRECT_URL`이 다음과 같이 설정되어 있는지 확인:

```bash
# 올바른 값 (aws-1-ap-northeast-1)
DATABASE_URL=postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.ejgsotsviobjfvfqovcj:guswk0925!!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

**주의**: `aws-1-ap-northeast-1`이어야 합니다 (기존 `aws-0`는 잘못된 값)

**변경 방법**:
1. 각 변수 우측의 "..." 메뉴 클릭
2. "Edit" 선택
3. 새 값 입력
4. "Save" 클릭
5. 페이지 하단 "Redeploy" 버튼 클릭

---

### 3. Supabase OAuth 리다이렉트 URL 확인

카카오/네이버 로그인 버튼이 작동하려면 Supabase에서 redirect URL을 설정해야 합니다.

**Supabase 대시보드 확인**:
1. https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/url-configuration 접속
2. "Redirect URLs" 섹션에 다음이 있는지 확인:
   ```
   https://dev3nomu.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
3. 없다면 "Add URL" 클릭하여 추가

**Site URL 확인**:
- "Site URL" 항목이 `https://dev3nomu.vercel.app`로 설정되어 있는지 확인

---

### 4. Vercel 배포 로그 확인

**배포 로그 접속**:
1. https://vercel.com/siyeolryu00-5566s-projects/dev3nomu 접속
2. 최신 배포 클릭
3. "Deployment Details" → "Build Logs" 확인
4. 빨간색 오류 메시지가 있는지 확인

**주의 깊게 볼 부분**:
- `Error: Missing environment variable`
- `PrismaClientInitializationError`
- `FATAL: Tenant or user not found`

---

### 5. 브라우저 콘솔 확인

**개발자 도구로 클라이언트 오류 확인**:
1. https://dev3nomu.vercel.app/ 접속
2. `F12` 키 누르기 (또는 우클릭 → "검사")
3. "Console" 탭 클릭
4. 빨간색 오류 메시지 확인

**흔한 오류들**:
```javascript
// Supabase 환경 변수 누락
Uncaught Error: supabaseUrl is required.

// JavaScript Hydration 오류
Uncaught Error: Hydration failed

// 네트워크 오류
Failed to load resource: the server responded with a status of 500
```

**스크린샷**:
- 오류 메시지가 보이면 스크린샷 찍어서 공유

---

### 6. Network 탭 확인

**API 요청 실패 확인**:
1. 개발자 도구 → "Network" 탭
2. 페이지 새로고침
3. 버튼 클릭 시도
4. 빨간색으로 표시된 요청 확인

**확인할 요청들**:
- `/api/auth/quick-signup` (이메일 가입 시)
- Supabase OAuth 요청 (소셜 로그인 시)

**상태 코드 확인**:
- `500`: 서버 오류 (환경 변수 문제 가능성)
- `404`: 엔드포인트 없음
- `401/403`: 인증 오류

---

## 🔨 즉시 해결 방법

### 빠른 수정 1: 환경 변수 추가 후 재배포

1. Vercel 환경 변수 페이지에서 누락된 변수 추가
2. 프로젝트 메인 페이지로 이동
3. 우측 상단 "..." 메뉴 → "Redeploy" 클릭
4. "Use existing Build Cache" **체크 해제**
5. "Redeploy" 버튼 클릭
6. 1-2분 대기
7. https://dev3nomu.vercel.app/ 다시 테스트

### 빠른 수정 2: Supabase Redirect URL 추가

1. https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/auth/url-configuration 접속
2. "Redirect URLs"에 `https://dev3nomu.vercel.app/auth/callback` 추가
3. "Save" 클릭
4. 즉시 적용됨 (재배포 불필요)

---

## 📋 문제별 해결책

### 문제: 이메일 가입 버튼만 작동 안 함
**원인**: `/api/auth/quick-signup` 엔드포인트 오류
**해결**:
- Vercel 로그에서 API 오류 확인
- `DATABASE_URL` 환경 변수 확인
- 재배포

### 문제: 소셜 로그인 버튼만 작동 안 함
**원인**: Supabase OAuth 설정 문제
**해결**:
- Supabase Redirect URLs 확인
- `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- 재배포

### 문제: 모든 버튼이 작동 안 함
**원인**: JavaScript 로드 실패 또는 Hydration 오류
**해결**:
- 브라우저 콘솔 오류 확인
- 캐시 지우고 새로고침 (`Ctrl + Shift + R`)
- Vercel Build Cache 없이 재배포

---

## ✅ 최종 확인

모든 설정을 확인한 후:

1. **재배포**:
   ```
   Vercel 대시보드 → Redeploy (Build Cache 제외)
   ```

2. **1-2분 대기**

3. **테스트**:
   - https://dev3nomu.vercel.app/ 접속
   - 이메일 가입 버튼 클릭
   - 카카오 로그인 버튼 클릭
   - 네이버 로그인 버튼 클릭

4. **여전히 안 된다면**:
   - 브라우저 콘솔 스크린샷
   - Vercel 배포 로그 스크린샷
   - 공유해주시면 추가 진단 가능

---

**작성 일시**: 2026-04-26
**예상 해결 시간**: 5-10분
