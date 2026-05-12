# 🔧 Supabase MCP 설정 가이드

## 📌 개요

이 문서는 **노무Pro** 프로젝트에서 Supabase MCP(Model Context Protocol) 서버를 활성화하고 사용하는 방법을 설명합니다.

---

## ✅ 현재 설정 상태

### 완료된 사항
- ✅ `.env.local` - Supabase 인증 키 설정 완료
- ✅ `.mcp.json` - MCP 서버 설정 파일 생성 완료
- ✅ Supabase 프로젝트 연결 - HTTPS API 연결 정상

### 미완료 사항
- ⏳ MCP 서버 승인 대기
- ⏳ 데이터베이스 테이블 4개 생성 필요 (profiles, companies, sites, payroll)

---

## 📋 1. 필요한 정보 체크리스트

다음 정보들을 확인하여 제공해주세요:

### ✔️ 1-1. Claude Code 재시작 확인

**질문:** Claude Code를 완전히 종료하고 다시 시작하셨나요?

```
- [ ] 예, 재시작했습니다
- [ ] 아니오, 아직 재시작하지 않았습니다
```

**재시작 방법:**
- Windows: `Ctrl + C` (터미널에서) → 다시 `claude` 실행
- VS Code Extension: VS Code 완전 종료 → 재시작

---

### ✔️ 1-2. MCP 로딩 메시지 확인

**질문:** Claude Code 시작 시 다음과 같은 메시지가 보였나요?

예상 메시지:
```
🔌 Loading MCP servers...
📦 Found 1 MCP server(s) in .mcp.json
⏳ MCP server 'supabase' is pending approval
```

**보였던 메시지를 복사하여 붙여넣어 주세요:**
```
[여기에 메시지 붙여넣기]
```

---

### ✔️ 1-3. MCP 상태 확인

**실행 명령어:**

Claude Code 터미널에서 다음 명령어를 입력:

```bash
/mcp
```

**결과 예시:**
```
MCP Servers:
├─ supabase (pending)
│  Command: npx -y @supabase/mcp-server ...
│  Status: Waiting for approval
└─ ...
```

**실제 결과를 복사하여 붙여넣어 주세요:**
```
[여기에 /mcp 명령어 결과 붙여넣기]
```

---

### ✔️ 1-4. 승인 프롬프트 확인

**질문:** 다음과 같은 승인 요청 프롬프트가 나타났나요?

```
╭─────────────────────────────────────────────────────╮
│ MCP Server Permission Request                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ The project wants to use MCP server "supabase"     │
│                                                     │
│ Command: npx -y @supabase/mcp-server               │
│          --supabase-url https://...                 │
│          --supabase-anon-key eyJ...                │
│          --supabase-service-role-key eyJ...        │
│                                                     │
│ Allow this MCP server?                             │
│                                                     │
│ [Allow] [Deny] [Always Allow] [Always Deny]       │
╰─────────────────────────────────────────────────────╯
```

**상태:**
```
- [ ] 예, 프롬프트가 나타났습니다
- [ ] 아니오, 프롬프트가 나타나지 않았습니다
```

**만약 나타났다면, 어떤 버튼을 눌렀나요?**
```
선택한 옵션: [여기에 작성]
```

---

### ✔️ 1-5. 현재 작업 디렉토리 확인

**실행 명령어:**

```bash
pwd
```

또는 Windows CMD/PowerShell:
```cmd
cd
```

**결과를 복사하여 붙여넣어 주세요:**
```
[여기에 현재 경로 붙여넣기]
```

**예상 경로:**
```
C:\Users\tlduf\.cursor\projects\dev3_nomu
```

---

### ✔️ 1-6. .mcp.json 파일 위치 확인

**실행 명령어:**

```bash
ls -la .mcp.json
```

또는 Windows:
```cmd
dir .mcp.json
```

**결과:**
```
[여기에 결과 붙여넣기]
```

---

## 🔧 2. 설정 파일 확인

### 📄 `.mcp.json` 파일 내용

현재 설정된 파일 위치:
```
C:\Users\tlduf\.cursor\projects\dev3_nomu\.mcp.json
```

현재 내용:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server",
        "--supabase-url",
        "https://ejgsotsviobjfvfqovcj.supabase.co",
        "--supabase-anon-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "--supabase-service-role-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      ]
    }
  }
}
```

### 📄 `.env.local` 파일 확인

**실행 명령어:**

```bash
cat .env.local | grep SUPABASE
```

**예상 결과:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ejgsotsviobjfvfqovcj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (JWT 토큰)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (JWT 토큰)
```

**실제 결과를 확인하여 알려주세요:**
```
- [ ] NEXT_PUBLIC_SUPABASE_URL이 정확합니다
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY가 eyJ로 시작하는 JWT 토큰입니다
- [ ] SUPABASE_SERVICE_ROLE_KEY가 eyJ로 시작하는 JWT 토큰입니다
```

---

## 🚀 3. MCP 활성화 절차

### 방법 1: 자동 승인 (권장)

Claude Code를 재시작하면 자동으로 승인 프롬프트가 나타납니다.

**단계:**

1. **Claude Code 완전 종료**
   ```bash
   # 터미널에서 Ctrl+C
   # 또는 VS Code 완전 종료
   ```

2. **Claude Code 재시작**
   ```bash
   claude
   # 또는 VS Code 재실행
   ```

3. **승인 프롬프트 대기**
   - "supabase" MCP 서버 승인 요청이 나타남
   - **"Always Allow"** 버튼 클릭 (권장)
   - 또는 **"Allow"** 클릭

4. **승인 확인**
   ```bash
   /mcp
   ```

   예상 결과:
   ```
   MCP Servers:
   ├─ supabase ✅ (active)
   │  Tools: 15 available
   └─ ...
   ```

---

### 방법 2: 수동 승인

승인 프롬프트가 나타나지 않는 경우:

**단계:**

1. **MCP 서버 목록 확인**
   ```bash
   /mcp
   ```

2. **수동으로 서버 활성화**
   ```bash
   /mcp enable supabase
   ```

3. **활성화 확인**
   ```bash
   /mcp
   ```

---

### 방법 3: 설정 파일로 직접 승인

**파일 위치:**
```
C:\Users\tlduf\.claude\settings.json
```

**추가할 내용:**
```json
{
  "enabledMcpjsonServers": ["supabase"]
}
```

**실행 명령어:**

```bash
# settings.json 확인
cat C:/Users/tlduf/.claude/settings.json
```

---

## 📊 4. MCP 활성화 확인

### ✔️ 4-1. MCP 도구 목록 확인

**실행 명령어:**

```bash
/mcp tools supabase
```

**예상 결과:**
```
Supabase MCP Tools:
├─ supabase_execute_sql - Execute SQL queries
├─ supabase_list_tables - List all tables
├─ supabase_describe_table - Get table schema
├─ supabase_insert_row - Insert a new row
├─ supabase_select_rows - Query rows
├─ supabase_update_row - Update a row
├─ supabase_delete_row - Delete a row
└─ ... (총 15개 도구)
```

**실제 결과를 붙여넣어 주세요:**
```
[여기에 결과 붙여넣기]
```

---

### ✔️ 4-2. Supabase 연결 테스트

**Claude Code 대화에서 다음 명령어 입력:**

```
@supabase list tables
```

또는

```
supabase에 연결된 테이블 목록을 보여줘
```

**예상 응답:**
```
Supabase 테이블 목록:
- workers (근로자)
- attendance (출근 기록)
```

**실제 응답:**
```
[여기에 Claude의 응답 붙여넣기]
```

---

## 🎯 5. 다음 단계: 테이블 생성

MCP가 성공적으로 활성화되면, 다음 명령어로 누락된 테이블을 생성합니다:

### 📝 생성할 테이블

- ❌ `profiles` - 사용자 프로필
- ❌ `companies` - 건설사
- ❌ `sites` - 현장/프로젝트
- ❌ `payroll` - 급여 명세

### 🤖 MCP를 통한 테이블 생성

Claude Code에서 다음과 같이 요청:

```
@supabase를 사용하여 다음 테이블들을 생성해줘:
1. profiles
2. companies
3. sites
4. payroll

migration 파일은 scripts/combined-migrations.sql에 있어.
```

---

## 🔍 6. 트러블슈팅

### ❓ MCP 서버가 승인되지 않는 경우

**증상:**
```bash
/mcp
# 결과: supabase (pending)
```

**해결 방법:**

1. **프로젝트 디렉토리 확인**
   ```bash
   pwd
   # 결과가 C:\Users\tlduf\.cursor\projects\dev3_nomu 인지 확인
   ```

2. **Claude Code 재시작**
   ```bash
   # Ctrl+C로 종료
   claude
   ```

3. **수동 승인**
   ```bash
   /mcp enable supabase
   ```

---

### ❓ .mcp.json 파일을 찾지 못하는 경우

**증상:**
```
No MCP servers found
```

**해결 방법:**

1. **파일 존재 확인**
   ```bash
   ls -la .mcp.json
   ```

2. **파일이 없으면 다시 생성**
   ```bash
   cat > .mcp.json << 'EOF'
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server",
           "--supabase-url",
           "https://ejgsotsviobjfvfqovcj.supabase.co",
           "--supabase-anon-key",
           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ3NvdHN2aW9iamZ2ZnFvdmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzU5ODgsImV4cCI6MjA5MDQ1MTk4OH0.9rxkuz5mau1q7ZLBAFWGg4CKPvk8lz5DRxoW_WlRWy0",
           "--supabase-service-role-key",
           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZ3NvdHN2aW9iamZ2ZnFvdmNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NTk4OCwiZXhwIjoyMDkwNDUxOTg4fQ.o4IcF7tDkSo_xksFPbhl1ZmDsjEYbTt65_ZfzaUK9Yk"
         ]
       }
     }
   }
   EOF
   ```

3. **Claude Code 재시작**

---

### ❓ MCP 도구를 사용할 수 없는 경우

**증상:**
```
@supabase list tables
# 결과: MCP tool not found
```

**해결 방법:**

1. **MCP 서버 상태 확인**
   ```bash
   /mcp
   # supabase가 active 상태인지 확인
   ```

2. **MCP 도구 목록 확인**
   ```bash
   /mcp tools supabase
   ```

3. **수동으로 도구 호출**
   ```
   Claude에게: "Supabase MCP의 list_tables 도구를 사용해서 테이블 목록을 가져와줘"
   ```

---

## 📞 7. 정보 제공 양식

위 체크리스트를 완료한 후, 다음 양식을 작성하여 제공해주세요:

```markdown
### MCP 설정 정보

**1. Claude Code 재시작 여부:**
- [ ] 예 / [ ] 아니오

**2. MCP 로딩 메시지:**
```
[메시지 붙여넣기]
```

**3. /mcp 명령어 결과:**
```
[결과 붙여넣기]
```

**4. 승인 프롬프트:**
- [ ] 나타남 / [ ] 나타나지 않음
- 선택한 옵션: [       ]

**5. 현재 작업 디렉토리:**
```
[경로 붙여넣기]
```

**6. .mcp.json 파일 확인:**
- [ ] 존재함 / [ ] 존재하지 않음

**7. 환경 변수 확인:**
- [ ] SUPABASE_URL 정확
- [ ] ANON_KEY 정확
- [ ] SERVICE_ROLE_KEY 정확

**8. MCP 도구 목록:**
```
[결과 붙여넣기]
```

**9. Supabase 연결 테스트:**
```
[Claude의 응답 붙여넣기]
```
```

---

## 🎉 8. 설정 완료 후

MCP가 성공적으로 활성화되면:

1. **테이블 생성 자동화**
   - Claude가 MCP를 통해 직접 SQL 실행
   - 누락된 4개 테이블 자동 생성

2. **데이터베이스 작업 자동화**
   - 테이블 조회, 삽입, 수정, 삭제
   - 스키마 확인 및 수정
   - 인덱스 관리

3. **개발 생산성 향상**
   - SQL Editor 없이 Claude가 직접 DB 작업
   - 마이그레이션 자동 실행
   - 실시간 데이터 확인

---

## 📚 참고 자료

- **Supabase MCP 서버 문서:** https://github.com/supabase/mcp-server-supabase
- **Claude Code MCP 가이드:** https://code.claude.com/docs/en/mcp
- **프로젝트 Supabase Dashboard:** https://supabase.com/dashboard/project/ejgsotsviobjfvfqovcj

---

**작성일:** 2026-04-12
**버전:** 1.0
**프로젝트:** 노무Pro (dev3_nomu)
