# 🔴 Supabase 프로젝트 복구 가이드

## 현재 상황

✅ **Supabase API 연결**: 정상 작동
❌ **PostgreSQL 직접 연결**: 실패 (Tenant or user not found)

**프로젝트 ID**: `ejgsotsviobjfvfqovcj`

## 복구 단계

### Step 1: Supabase 대시보드 접속

1. 브라우저에서 다음 URL을 엽니다:
   ```
   https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj
   ```

2. 로그인하세요 (GitHub 또는 이메일)

### Step 2: 프로젝트 상태 확인

프로젝트 페이지에서 다음 중 하나를 확인하세요:

#### 경우 A: 프로젝트가 "Paused" 상태
```
┌─────────────────────────────────────┐
│  ⏸️  Project Paused                 │
│                                     │
│  [Resume Project] 버튼              │
└─────────────────────────────────────┘
```

**조치**:
1. "Resume Project" 버튼 클릭
2. 1-2분 대기 (프로젝트 재시작)
3. "Active" 상태로 변경 확인
4. 아래 "Step 3: 연결 테스트"로 이동

#### 경우 B: 프로젝트를 찾을 수 없음
```
404 - Project not found
```

**조치**:
1. 새 프로젝트를 생성해야 합니다
2. "Step 4: 새 프로젝트 생성"으로 이동

#### 경우 C: 프로젝트가 "Active" 상태
```
✅ Active
```

**조치**:
1. Settings → Database로 이동
2. Connection String 확인
3. "Step 5: 연결 문자열 업데이트"로 이동

### Step 3: 연결 테스트 (프로젝트 Resume 후)

프로젝트가 재시작되면 아래 명령어를 실행하세요:

```bash
# 터미널에서 실행
npx tsx scripts/test-connection.ts
```

**성공 메시지가 나오면**:
```
✅ Connected to database successfully!
```
→ 복구 완료! 🎉

**여전히 실패하면**:
→ Step 5로 이동

### Step 4: 새 프로젝트 생성 (프로젝트가 없는 경우)

1. Supabase 대시보드에서 "New Project" 클릭

2. 프로젝트 정보 입력:
   ```
   Organization: (본인 Organization 선택)
   Name: nomu-pro
   Database Password: (안전한 비밀번호 생성 - 반드시 저장!)
   Region: Singapore (또는 Seoul if available)
   Pricing Plan: Free
   ```

3. "Create new project" 클릭

4. 프로젝트 생성 완료 대기 (약 2-3분)

5. 생성 완료 후:
   - Settings → Database → Connection String 복사
   - 아래 "Step 5: 연결 문자열 업데이트"로 이동

### Step 5: 연결 문자열 업데이트

#### A. Supabase 대시보드에서 연결 문자열 가져오기

1. Settings → Database로 이동
2. Connection String 섹션 찾기
3. "Transaction pooler" 또는 "Session pooler" 선택
4. 문자열 복사:
   ```
   postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

#### B. .env.local 파일 수정

프로젝트 폴더에서 `.env.local` 파일을 열고:

```bash
# 이전 값
DATABASE_URL="postgresql://postgres.ejgsotsviobjfvfqovcj:..."

# 새 값으로 교체
DATABASE_URL="[위에서 복사한 연결 문자열]"
DIRECT_URL="[위에서 복사한 연결 문자열 - 포트만 5432로 변경]"
```

**예시**:
```bash
DATABASE_URL="postgresql://postgres.abcdefghij:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.abcdefghij:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

#### C. Prisma 재생성 및 테스트

```bash
npx prisma generate
npx tsx scripts/test-connection.ts
```

#### D. Vercel 환경 변수 업데이트

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. `DATABASE_URL` 찾아서 Edit 클릭
5. 새 값 입력 후 Save
6. `DIRECT_URL`도 동일하게 업데이트
7. Deployments → 최신 배포 → Redeploy 클릭

### Step 6: 데이터베이스 마이그레이션 (새 프로젝트인 경우)

새 프로젝트를 생성했다면 테이블을 다시 만들어야 합니다:

```bash
# 마이그레이션 실행
npx prisma migrate deploy

# 또는 Prisma Studio에서 수동 생성
npx prisma studio
```

**테이블 생성 SQL**:
```sql
-- prisma/migrations/create_correction_requests_table.sql 파일 실행
-- Supabase SQL Editor에서 실행 가능
```

### Step 7: 최종 확인

```bash
# 1. 연결 테스트
npx tsx scripts/test-connection.ts

# 2. 빌드 테스트
npm run build

# 3. 로컬 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속 후:
- `/companies` 페이지 접속
- 데이터가 정상적으로 로드되는지 확인

---

## 문제 해결

### Q: "Tenant or user not found" 오류가 계속됨
**A**:
1. 프로젝트 ID가 올바른지 확인
2. 비밀번호에 특수문자가 있다면 URL 인코딩 필요:
   ```javascript
   encodeURIComponent("Guswk0925!!")  // "Guswk0925%21%21"
   ```
3. Supabase 대시보드에서 프로젝트 상태가 "Active"인지 확인

### Q: 새 프로젝트를 만들었는데 데이터가 없음
**A**: 정상입니다. 다음 단계 필요:
1. 마이그레이션 실행
2. 테스트 데이터 입력
3. 또는 백업에서 복원

### Q: Vercel 배포에서만 오류 발생
**A**: Vercel 환경 변수가 업데이트되지 않았을 수 있습니다:
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. `DATABASE_URL`, `DIRECT_URL` 업데이트
3. Redeploy

---

## 빠른 명령어 참고

```bash
# Supabase 상태 확인
npx tsx scripts/check-supabase-status.ts

# DB 연결 테스트
npx tsx scripts/test-connection.ts

# Prisma 재생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate deploy

# 빌드 테스트
npm run build
```

---

## 지원

문제가 해결되지 않으면:
1. Supabase Support: https://supabase.com/dashboard/support
2. GitHub Issues: https://github.com/Siyeolryu/Fieldmanageros/issues

**작성 일시**: 2026-04-25
**프로젝트**: 노무Pro (Nomu Pro)
