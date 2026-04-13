# 🔑 Supabase Access Token 받기

CLI로 마이그레이션을 실행하려면 Access Token이 필요합니다.

## 방법 1: Supabase Dashboard에서 토큰 생성 (2분)

### Step 1: Access Token 생성

1. https://supabase.com/dashboard/account/tokens 접속
2. **Generate new token** 버튼 클릭
3. Token name: `nomu-pro-cli` (또는 원하는 이름)
4. **Generate token** 클릭
5. 생성된 토큰 **즉시 복사** (다시 볼 수 없음!)

예시:
```
sbp_1234567890abcdefghijklmnopqrstuvwxyz...
```

### Step 2: 토큰을 환경 변수로 설정

**Windows (PowerShell)**:
```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_여기에토큰붙여넣기"
```

**Windows (CMD)**:
```cmd
set SUPABASE_ACCESS_TOKEN=sbp_여기에토큰붙여넣기
```

**Git Bash**:
```bash
export SUPABASE_ACCESS_TOKEN="sbp_여기에토큰붙여넣기"
```

### Step 3: CLI 명령어 실행

```bash
# 프로젝트 링크
npx supabase link --project-ref ejgsotsviobjfvfqovcj

# 마이그레이션 푸시
npx supabase db push
```

---

## 방법 2: 직접 토큰으로 로그인

```bash
npx supabase login --token sbp_여기에토큰붙여넣기
```

---

## 방법 3: Dashboard에서 직접 SQL 실행 (더 빠름, 5분)

CLI 없이 Supabase Dashboard에서 직접 실행:

1. https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj/sql/new 접속
2. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 → **RUN**
4. `002_rls_policies.sql` 실행
5. `003_utility_functions.sql` 실행
6. `004_realtime.sql` 실행

---

## ✅ 성공 확인

마이그레이션 후:
```bash
# 테이블 확인
npx supabase db diff

# 또는 Dashboard → Table Editor에서 6개 테이블 확인
```

---

**어떤 방법을 선택하시겠습니까?**
