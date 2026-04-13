# 🚀 Supabase 초기화 완벽 가이드

> **소요 시간**: 약 15-20분
> **난이도**: 초급 (복사 붙여넣기만 하면 됩니다)

---

## 📋 전체 프로세스 개요

```
1. Supabase 프로젝트 생성 (웹) → 5분
2. SQL 마이그레이션 실행 → 5분
3. API Keys 복사 → 2분
4. .env.local 파일 생성 → 3분
5. 연결 테스트 → 5분
```

---

## Step 1: Supabase 프로젝트 생성 (5분)

### 1.1 Supabase 웹사이트 접속

1. 브라우저에서 https://supabase.com 열기
2. **Start your project** 버튼 클릭
3. GitHub 계정으로 로그인 (추천) 또는 이메일 가입

### 1.2 새 프로젝트 생성

1. 대시보드에서 **New Project** 버튼 클릭
2. **Organization** 선택 (없으면 자동 생성됨)
3. 프로젝트 정보 입력:

```
Name: nomu-pro
Database Password: [강력한 비밀번호 생성 - 반드시 저장!]
Region: Northeast Asia (Seoul)
Pricing Plan: Free
```

**⚠️ 중요**: Database Password는 나중에 확인할 수 없으니 **반드시 메모장에 저장**하세요!

4. **Create new project** 버튼 클릭
5. ⏳ 프로젝트 생성 대기 (약 2-3분)

---

## Step 2: SQL 마이그레이션 실행 (5분)

프로젝트가 준비되면 데이터베이스 테이블을 생성해야 합니다.

### 2.1 SQL Editor 열기

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

### 2.2 마이그레이션 파일 순서대로 실행

#### 📄 파일 1: 001_initial_schema.sql (기본 테이블)

1. 로컬 프로젝트에서 `supabase/migrations/001_initial_schema.sql` 파일 열기
2. **전체 내용 복사** (Ctrl+A, Ctrl+C)
3. Supabase SQL Editor에 **붙여넣기** (Ctrl+V)
4. **RUN** 버튼 클릭 (또는 Ctrl+Enter)
5. ✅ 하단에 "Success. No rows returned" 메시지 확인

#### 📄 파일 2: 002_rls_policies.sql (보안 정책)

1. `supabase/migrations/002_rls_policies.sql` 파일 열기
2. **전체 내용 복사**
3. SQL Editor에서 **New query** 클릭
4. **붙여넣기** → **RUN**
5. ✅ 성공 메시지 확인

#### 📄 파일 3: 003_utility_functions.sql (유틸리티 함수)

1. `supabase/migrations/003_utility_functions.sql` 파일 열기
2. **전체 내용 복사**
3. **New query** → **붙여넣기** → **RUN**
4. ✅ 성공 메시지 확인

#### 📄 파일 4: 004_realtime.sql (실시간 구독)

1. `supabase/migrations/004_realtime.sql` 파일 열기
2. **전체 내용 복사**
3. **New query** → **붙여넣기** → **RUN**
4. ✅ 성공 메시지 확인

### 2.3 테이블 생성 확인

1. 좌측 메뉴에서 **Table Editor** 클릭
2. 다음 6개 테이블이 보여야 합니다:
   - ✅ `profiles`
   - ✅ `companies`
   - ✅ `sites`
   - ✅ `workers`
   - ✅ `attendance`
   - ✅ `payroll`

---

## Step 3: API Keys 복사 (2분)

### 3.1 Settings 메뉴 열기

1. 좌측 메뉴 하단 **Settings** (톱니바퀴 아이콘) 클릭
2. **API** 섹션 클릭

### 3.2 필요한 값들 복사

다음 3가지 값을 **메모장에 복사**하세요:

#### ① Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```

#### ② anon public key (클라이언트에서 사용)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```
(매우 긴 문자열)

#### ③ service_role key (서버에서만 사용, ⚠️ 절대 노출 금지)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```
(매우 긴 문자열)

### 3.3 Database Connection String 복사

1. Settings → **Database** 클릭
2. **Connection string** 섹션에서 **URI** 탭 선택
3. 비밀번호 입력 (Step 1에서 저장한 Database Password)
4. Connection string 복사:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 4: .env.local 파일 생성 (3분)

### 4.1 터미널에서 파일 복사

프로젝트 루트 디렉토리에서:

```bash
# Windows (Git Bash 또는 PowerShell)
cp .env.example .env.local

# 또는 수동으로
# 1. .env.example 파일 복사
# 2. 이름을 .env.local로 변경
```

### 4.2 .env.local 파일 수정

`.env.local` 파일을 에디터로 열고 다음 값들을 **실제 값으로 교체**하세요:

```env
# ════════ Supabase Configuration ════════

# Step 3.2에서 복사한 Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Step 3.2에서 복사한 anon public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# Step 3.2에서 복사한 service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# ════════ Database ════════

# Step 3.3에서 복사한 Connection String
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# 동일한 값 (connection pooling 없이)
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**⚠️ 주의**:
- `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 교체
- URL의 `xxxxxxxxxxxxx` 부분을 실제 프로젝트 ID로 교체

### 4.3 저장 확인

- `.env.local` 파일 저장 (Ctrl+S)
- `.gitignore`에 이미 등록되어 있어 Git에 커밋되지 않습니다

---

## Step 5: 연결 테스트 (5분)

### 5.1 Prisma 설정

터미널에서 실행:

```bash
# 1. Prisma Client 생성
npx prisma generate

# 2. Prisma 스키마를 Supabase에 동기화 (선택)
# (이미 SQL로 테이블을 만들었으므로 스킵 가능)
# npx prisma db push
```

예상 출력:
```
✔ Generated Prisma Client (v5.10.2)
```

### 5.2 개발 서버 실행

```bash
npm run dev
```

예상 출력:
```
▲ Next.js 15.1.6
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 5.3 브라우저에서 확인

1. 브라우저에서 http://localhost:3000 열기
2. 페이지가 로드되면 다음 중 하나가 표시됩니다:

#### ✅ 성공 케이스
```
노무Pro
건설 현장 인건비 신고 & 소득 관리 플랫폼

✅ Supabase 연결 성공
데이터베이스에 정상적으로 연결되었습니다.

건설사 목록
등록된 건설사가 없습니다.
```

#### ❌ 실패 케이스
```
❌ Supabase 연결 실패
Supabase 연결에 실패했습니다.
.env.local 파일의 NEXT_PUBLIC_SUPABASE_URL과
NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.
```

### 5.4 브라우저 콘솔 확인

1. F12 키를 눌러 개발자 도구 열기
2. **Console** 탭 선택
3. 에러 메시지 확인:

#### 성공 시
```
✅ Supabase 연결 성공: []
```

#### 실패 시
```
Supabase 연결 오류: {...}
```

---

## 🎉 성공 확인

모든 단계가 완료되었다면:

- ✅ Supabase 프로젝트 생성 완료
- ✅ 6개 테이블 생성 완료
- ✅ .env.local 파일 설정 완료
- ✅ Next.js 개발 서버 실행 완료
- ✅ Supabase 연결 테스트 통과

**다음 단계**: `/api/attendance` API 엔드포인트 구현

---

## ❌ 트러블슈팅

### 문제 1: "Invalid API key" 오류

**원인**: API Key가 잘못 복사되었거나 환경 변수가 인식되지 않음

**해결**:
1. `.env.local` 파일에서 API Key 앞뒤 공백 제거
2. Key가 완전히 복사되었는지 확인 (매우 긺)
3. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)

### 문제 2: "relation does not exist" 오류

**원인**: SQL 마이그레이션이 제대로 실행되지 않음

**해결**:
1. Supabase Dashboard → Table Editor에서 테이블 확인
2. 테이블이 없으면 SQL 마이그레이션 다시 실행
3. 각 SQL 파일 실행 후 에러 메시지 확인

### 문제 3: 연결 타임아웃

**원인**: 방화벽 또는 네트워크 문제

**해결**:
1. Supabase 프로젝트가 "Paused" 상태인지 확인 (대시보드에서)
2. 방화벽에서 Supabase 도메인 허용
3. 다른 네트워크에서 테스트

### 문제 4: Prisma generate 실패

**원인**: DATABASE_URL 형식 오류

**해결**:
```bash
# DATABASE_URL 확인
echo $env:DATABASE_URL  # PowerShell
echo $DATABASE_URL      # Git Bash

# Prisma 스키마 검증
npx prisma validate

# node_modules 재설치
rm -rf node_modules
npm install
```

---

## 📞 도움말

### Supabase 공식 문서
- https://supabase.com/docs/guides/database

### 프로젝트 관련 문서
- `SUPABASE_SETUP.md` - 상세 설정 가이드
- `ORCHESTRATOR.md` - 전체 프로젝트 로드맵
- `PARALLEL_WORK_CHECKLIST.md` - 병렬 작업 체크리스트

---

**초기화 완료 후 다음 단계**: API Routes 구현 (`PARALLEL_WORK_CHECKLIST.md` 참고)
