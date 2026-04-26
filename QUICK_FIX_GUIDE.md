# ⚡ 3단계로 빠르게 해결하기

## 현재 상황
✅ Supabase 프로젝트가 존재하지만 **일시 중지(Paused)** 상태
✅ 모든 자동 복구 시도 완료 (모두 실패)
✅ 수동 개입 필요

---

## 방법 1: Access Token으로 자동 재시작 (권장 ⭐)

### Step 1: Access Token 발급 (30초)

방금 열린 브라우저 창에서:
```
https://supabase.com/dashboard/account/tokens
```

1. "Generate New Token" 버튼 클릭
2. Token name: `CLI-Access` 입력
3. "Generate Token" 클릭
4. **토큰 복사** (한 번만 표시됨!)
   ```
   예: sbp_1a2b3c4d5e6f7g8h9i0j...
   ```

### Step 2: 토큰 추가 (10초)

`.env.local` 파일 열기 → 맨 아래에 추가:
```bash
SUPABASE_ACCESS_TOKEN=여기에_복사한_토큰_붙여넣기
```

### Step 3: 자동 재시작 실행 (10초)

터미널에서:
```bash
npx tsx scripts/resume-supabase-project.ts
```

**성공하면**:
```
✅ Project resume initiated!
⏳ Please wait 1-2 minutes...
```

1-2분 대기 후:
```bash
npx tsx scripts/test-connection.ts
```

✅ **복구 완료!**

---

## 방법 2: 대시보드에서 수동으로 (가장 간단)

### 단 2번의 클릭

1. 브라우저 열기:
   ```
   https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj
   ```

2. 화면에 보이는 **"Resume Project"** 또는 **"Restore Project"** 버튼 클릭

3. 1-2분 대기

4. 완료!

---

## 방법 3: 완전히 새로 시작

프로젝트가 삭제되었거나 복구가 불가능한 경우:

### Step 1: 새 프로젝트 생성

https://supabase.com/dashboard

1. "New Project" 클릭
2. 정보 입력:
   - Name: `nomu-pro`
   - Database Password: **안전한 비밀번호 생성 및 저장!**
   - Region: Singapore (또는 Seoul)
3. "Create new project" 클릭
4. 2-3분 대기

### Step 2: 연결 문자열 복사

프로젝트 생성 후:
1. Settings → Database
2. "Connection String" 섹션 찾기
3. "Session pooler" 선택
4. 문자열 복사

### Step 3: .env.local 업데이트

```bash
DATABASE_URL="복사한_연결_문자열"
DIRECT_URL="복사한_연결_문자열"  # 같은 것 사용
```

### Step 4: 데이터베이스 마이그레이션

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

---

## 🎯 지금 바로 할 일

**가장 빠른 방법 (30초)**:
1. 브라우저에서 https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj 열기
2. "Resume Project" 버튼 클릭
3. 1분 대기
4. `npx tsx scripts/test-connection.ts` 실행

**또는 자동화 방법 (1분)**:
1. 브라우저에서 토큰 생성 (지금 열려있음)
2. `.env.local`에 추가
3. `npx tsx scripts/resume-supabase-project.ts` 실행

---

## ❓ 문제 해결

### "Resume Project" 버튼이 안 보여요
→ 프로젝트가 이미 Active 상태일 수 있습니다
→ Settings → Database → Connection String 확인

### 토큰을 잃어버렸어요
→ 다시 생성하세요 (무제한 생성 가능)
→ 기존 토큰은 자동으로 무효화되지 않음

### 모든 방법이 실패했어요
→ 새 프로젝트 생성 (방법 3)
→ 5분이면 완전히 새로 시작 가능

---

**작성 일시**: 2026-04-25
**예상 소요 시간**: 30초 ~ 5분
