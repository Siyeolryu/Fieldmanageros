# 🔐 Vercel 환경변수 설정 가이드

**프로젝트**: Field Manager OS (노무PRO)  
**최종 업데이트**: 2026-04-14  
**목적**: Vercel 신규 배포 화면에서 Environment Variables 입력 방법

---

## 📸 현재 화면 상황

> Vercel → New Project → Environment Variables 섹션에서  
> `+ Add More` 또는 `Import .env` 버튼이 보이는 상태

---

## ✅ 방법 1: Import .env (가장 쉬운 방법 ⭐ 추천)

### 1단계: `Import .env` 버튼 클릭

화면 하단의 **`Import .env`** 버튼 클릭

### 2단계: 아래 내용 전체 복사 후 붙여넣기

```env
NEXT_PUBLIC_SUPABASE_URL=https://ejgsotsviobjfvfqovcj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ3NvdHN2aW9iamZ2ZnFvdmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzU5ODgsImV4cCI6MjA5MDQ1MTk4OH0.9rxkuz5mau1q7ZLBAFWGg4CKPvk8lz5DRxoW_WlRWy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ3NvdHN2aW9iamZ2ZnFvdmNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NTk4OCwiZXhwIjoyMDkwNDUxOTg4fQ.o4IcF7tDkSo_xksFPbhl1ZmDsjEYbTt65_ZfzaUK9Yk
DATABASE_URL=postgresql://postgres.ejgsotsviobjfvfqovcj:Guswk0925%21%21@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.ejgsotsviobjfvfqovcj:Guswk0925%21%21@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fieldmanageros.vercel.app
ANTHROPIC_API_KEY=여기에_Anthropic_실제키_입력
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

> ⚠️ `ANTHROPIC_API_KEY` → [console.anthropic.com](https://console.anthropic.com) 에서 발급 후 교체

### 3단계: `Deploy` 버튼 클릭

---

## ➕ 방법 2: Add More 버튼으로 1개씩 입력

`+ Add More` 버튼을 누를 때마다 Key / Value 입력란이 1줄 추가됩니다.  
아래 표를 보고 한 줄씩 입력하세요.

---

## 📋 환경변수 전체 목록

### 🟢 필수 (지금 당장 입력)

| Key | Value | 설명 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ejgsotsviobjfvfqovcj.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` 파일의 값 복사 | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` 파일의 값 복사 | Supabase 서버 전용 키 ⚠️ SECRET |
| `DATABASE_URL` | `.env.local` 파일의 값 복사 | Prisma용 DB 연결 (pooler) |
| `DIRECT_URL` | `.env.local` 파일의 값 복사 | Prisma 마이그레이션용 |
| `NODE_ENV` | `production` | 운영 환경 설정 |
| `NEXT_PUBLIC_APP_URL` | `https://fieldmanageros.vercel.app` | 배포 후 실제 URL |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-20241022` | Claude 모델명 |

### 🟡 권장 (AI 기능 사용 시 필수)

| Key | Value | 어디서 발급? |
|-----|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` 실제 키 입력 | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### 🔵 선택 (나중에 필요할 때 추가)

| Key | Value | 어디서 발급? |
|-----|-------|-------------|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | `test_ck_...` | [토스페이먼츠](https://developers.tosspayments.com/) |
| `TOSS_SECRET_KEY` | `test_sk_...` | 토스페이먼츠 대시보드 |
| `SMS_API_KEY` | 알리고/쿨SMS 키 | 각 서비스 대시보드 |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics |

---

## 🔍 `.env.local` 파일에서 값 복사하는 방법

프로젝트 루트의 `.env.local` 파일을 열어서 복사합니다.

```
경로: C:\Users\tlduf\.cursor\projects\dev3_nomu\.env.local
```

| 복사할 항목 | `.env.local` 위치 |
|------------|------------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 9번째 줄 |
| `SUPABASE_SERVICE_ROLE_KEY` | 10번째 줄 |
| `DATABASE_URL` | 15번째 줄 |
| `DIRECT_URL` | 17번째 줄 |

---

## ⚡ 배포 직후 해야 할 일

배포 완료 후 Vercel이 URL을 제공합니다.  
예: `https://fieldmanageros-abc123.vercel.app`

그 URL로 `NEXT_PUBLIC_APP_URL` 값을 업데이트하세요:

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. `NEXT_PUBLIC_APP_URL` 클릭 → 실제 URL로 수정
4. **Redeploy** 실행

---

## ⚠️ 보안 주의사항

| 변수명 | 주의사항 |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | 절대 `NEXT_PUBLIC_` 접두사 붙이지 말 것 |
| `DATABASE_URL` | Git에 절대 커밋하지 말 것 |
| `ANTHROPIC_API_KEY` | 클라이언트 코드에서 사용 금지 |
| `TOSS_SECRET_KEY` | 서버 API Route에서만 사용 |

---

## ✅ 체크리스트

- [ ] `Import .env` 또는 `Add More`로 필수 변수 모두 입력
- [ ] `ANTHROPIC_API_KEY` 실제 키로 교체
- [ ] `Deploy` 클릭
- [ ] 배포 완료 후 `NEXT_PUBLIC_APP_URL` 실제 URL로 업데이트
- [ ] Redeploy 실행
- [ ] 메인 페이지 접속 확인
- [ ] 로그인 기능 테스트

---

*작성: Claude (Antigravity) | 프로젝트: Field Manager OS*
