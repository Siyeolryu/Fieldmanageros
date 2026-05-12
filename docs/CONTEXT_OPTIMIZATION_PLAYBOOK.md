# Context Optimization Playbook
## 컨텍스트 낭비 Zero를 향한 실전 가이드

> **목표:** 200K 토큰 예산 내에서 최대 생산성 달성
> **원칙:** "Agent는 도구, 남용은 독"

---

## 🎯 빠른 의사결정 체크리스트

### 30초 안에 판단하기

```
질문을 받았을 때:

1️⃣ 파일 경로를 아는가?
   YES → Read 직접 사용
   NO  → 2번으로

2️⃣ 1-2개 키워드로 찾을 수 있는가?
   YES → Glob/Grep 직접 사용
   NO  → 3번으로

3️⃣ 단일 파일만 수정하는가?
   YES → Edit 직접 사용
   NO  → 4번으로

4️⃣ 설계가 필요한가?
   YES → EnterPlanMode
   NO  → 5번으로

5️⃣ 도메인 전문성이 필요한가?
   YES → 전문 Agent (Backend/UX/Test)
   NO  → General-Purpose Agent
```

---

## 📊 컨텍스트 예산 관리

### 토큰 사용량 기준표

| 작업 유형 | 예상 토큰 | Agent 사용 | 권장 도구 |
|----------|----------|-----------|---------|
| 파일 1개 읽기 | 1K-3K | ❌ 불필요 | Read |
| 파일 검색 | 2K-5K | ❌ 불필요 | Glob/Grep |
| 코드 탐색 (5-10개 파일) | 10K-20K | ✅ Explore | Task(Explore) |
| 설계 작업 | 20K-40K | ✅ Plan | EnterPlanMode |
| 기능 구현 | 30K-60K | ✅ 전문 Agent | Task(전문) |
| 복합 시스템 작업 | 60K-120K | ✅ 다중 Agent | 병렬 Task |

### 실시간 모니터링

```
현재 사용량 확인:
"Token usage: X/200000"

위험 구간:
🟢 0-50K    → 자유롭게 사용
🟡 50K-100K → 신중하게 Agent 선택
🟠 100K-150K → 직접 도구 우선
🔴 150K+    → Agent 사용 금지
```

---

## ⚡ 컨텍스트 절약 패턴 10선

### 1. **Lazy Reading** (게으른 읽기)

```typescript
// ❌ BAD: 모든 파일 미리 읽기
Read("app/page.tsx")
Read("app/demo/page.tsx")
Read("app/layout.tsx")
// ... 작업 시작

// ✅ GOOD: 필요할 때만 읽기
// 작업 시작 → 필요한 파일만 Read
```

**절약:** 10K-30K 토큰

---

### 2. **Grep Before Read** (검색 후 읽기)

```typescript
// ❌ BAD: 관련 파일 모두 읽기
Glob("**/*.tsx") → 50개 파일
Read(파일1), Read(파일2), ... // 엄청난 토큰

// ✅ GOOD: 검색으로 범위 좁히기
Grep({ pattern: "GameData", output_mode: "files_with_matches" })
// → 3개 파일만 식별
Read(핵심 파일만)
```

**절약:** 20K-50K 토큰

---

### 3. **Offset & Head Limit** (부분 읽기)

```typescript
// ❌ BAD: 1000줄 파일 전체 읽기
Read("huge-file.tsx") // 20K 토큰

// ✅ GOOD: 필요한 부분만
Read("huge-file.tsx", { offset: 100, limit: 50 })
// → 100-150줄만 읽기
```

**절약:** 15K 토큰

---

### 4. **Parallel Tool Calls** (병렬 도구 호출)

```typescript
// ❌ BAD: 순차 실행
Read("file1.tsx")
// 대기...
Read("file2.tsx")
// 대기...

// ✅ GOOD: 동시 실행 (단일 메시지)
Read("file1.tsx")
Read("file2.tsx")
Read("file3.tsx")
// 모두 동시에!
```

**절약:** 시간 70% 단축, 컨텍스트 누적 방지

---

### 5. **Agent Model Selection** (모델 선택)

```typescript
// ❌ BAD: 모든 작업에 sonnet
Task({ model: "sonnet", prompt: "파일 찾기" })

// ✅ GOOD: 작업에 맞는 모델
Task({
  model: "haiku",  // 탐색/검색은 haiku
  subagent_type: "Explore",
  prompt: "파일 찾기"
})

Task({
  model: "sonnet", // 복잡한 설계만 sonnet
  subagent_type: "Plan",
  prompt: "아키텍처 설계"
})
```

**절약:** 50-70% 비용 감소 (haiku는 sonnet 대비 저렴)

---

### 6. **Agent Resume** (Agent 재사용)

```typescript
// ❌ BAD: 매번 새 Agent
Task({ subagent_type: "backend-designer", prompt: "1단계" })
// 완료...
Task({ subagent_type: "backend-designer", prompt: "2단계" })
// 컨텍스트 재로드!

// ✅ GOOD: 이전 Agent 이어가기
const agent1 = Task({ subagent_type: "backend-designer", prompt: "1단계" })
// 완료... (agent_id: "abc123")
Task({
  subagent_type: "backend-designer",
  resume: "abc123",
  prompt: "2단계"
})
```

**절약:** 20K-40K 토큰 (컨텍스트 재로드 방지)

---

### 7. **Targeted Grep** (정밀 검색)

```typescript
// ❌ BAD: 광범위 검색
Grep({ pattern: "game", output_mode: "content" })
// → 500개 매치, 엄청난 출력

// ✅ GOOD: 필터링된 검색
Grep({
  pattern: "interface GameData",
  glob: "**/*.tsx",
  output_mode: "files_with_matches" // 파일명만
})
// → 3개 파일, 최소 출력
```

**절약:** 30K-60K 토큰

---

### 8. **Avoid Over-Planning** (과도한 계획 금지)

```typescript
// ❌ BAD: 단순 작업에 Plan Agent
"버튼 색상 바꿔줘"
→ EnterPlanMode() // 불필요!

// ✅ GOOD: 직접 실행
Read("component.tsx")
Edit(...) // 바로 수정
```

**절약:** 10K-20K 토큰

---

### 9. **Background Tasks** (백그라운드 실행)

```typescript
// 긴 작업은 백그라운드로
Task({
  subagent_type: "test-specialist",
  prompt: "전체 테스트 스위트 작성",
  run_in_background: true
})

// 다른 작업 계속 진행
Edit("other-file.tsx")

// 나중에 결과 확인
TaskOutput({ task_id: "test-task-123" })
```

**절약:** 블로킹 시간 제거

---

### 10. **Smart File Globbing** (영리한 파일 검색)

```typescript
// ❌ BAD: 너무 광범위
Glob("**/*") // 수백 개 파일

// ✅ GOOD: 정확한 패턴
Glob("app/**/page.tsx") // 페이지만
Glob("components/**/*.tsx") // 컴포넌트만
Glob("**/api/**/*.ts") // API만
```

**절약:** 5K-15K 토큰

---

## 🧠 인지 부하 감소 전략

### 문제: Agent가 너무 많은 파일을 읽음

**원인:**
- 불명확한 프롬프트
- 탐색 범위 미지정

**해결:**
```typescript
// ❌ BAD
Task({
  prompt: "게임 관련 코드 찾아줘"
  // → Agent가 모든 파일 검색
})

// ✅ GOOD
Task({
  prompt: "app/demo/page.tsx의 GameData 인터페이스 정의 찾아줘"
  // → 정확한 위치 지정
})
```

---

### 문제: 같은 정보를 반복 요청

**원인:**
- Agent Resume 미사용
- 메시지 분산

**해결:**
```typescript
// ✅ GOOD: 한 번에 묶어서 요청
"3-factor 분석 시스템의 구조를 파악하고,
개선점을 찾고,
구현 계획을 세워줘"

// 단일 Agent가 모든 맥락 유지
```

---

### 문제: 불필요한 Plan Mode 진입

**원인:**
- 단순 작업에 과도한 설계

**해결:**
```
단순 작업 (Plan 불필요):
- 오타 수정
- 스타일 변경
- 한 줄 수정
- 파일 이동

복잡 작업 (Plan 필요):
- 새 기능 추가
- 여러 파일 리팩토링
- 아키텍처 변경
- 데이터베이스 설계
```

---

## 📈 최적화 성과 측정

### Before & After 비교

#### 시나리오: "결제 시스템 추가"

**최적화 전:**
```
1. Read all files (50개)          → 100K 토큰
2. General-Purpose Agent          → 40K 토큰
3. 순차 실행 (30분)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 토큰: 140K
총 시간: 30분
```

**최적화 후:**
```
1. Explore (결제 관련만)         → 15K 토큰
2. Plan (설계)                   → 20K 토큰
3. 병렬 실행:
   - Backend-Designer (API)      → 25K 토큰
   - UX-Designer (UI)            → 15K 토큰
4. Test-Specialist (검증)        → 10K 토큰
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 토큰: 85K (39% 절약)
총 시간: 15분 (50% 단축)
```

---

## 🚨 Red Flags (위험 신호)

### 즉시 중단하고 재검토해야 할 상황

```
🚨 Token usage > 150K
   → 작업 분해 필요

🚨 Agent 5개 이상 동시 실행
   → 불필요한 병렬 실행

🚨 같은 파일 3번 이상 Read
   → 정보 저장/재사용 필요

🚨 Plan Mode에서 10분 이상
   → 과도한 설계, 실행 시작

🚨 Grep 결과 100개 이상
   → 검색어 너무 광범위
```

---

## 🎓 실전 훈련: 최적화 전/후

### 연습 1: 코드 리뷰 요청

**Before (비효율):**
```
사용자: "코드 전체 리뷰해줘"

Claude:
- Read app/page.tsx
- Read app/demo/page.tsx
- Read app/layout.tsx
- Read components/*.tsx (20개)
- Read lib/*.ts (10개)
→ 80K 토큰 사용
```

**After (최적화):**
```
사용자: "코드 전체 리뷰해줘"

Claude:
1. 명확화 질문:
   "어떤 부분을 리뷰할까요?
   - 성능 이슈
   - 보안 취약점
   - 코드 품질
   - 아키텍처 구조"

2. 사용자: "성능 이슈"

3. Explore Agent:
   "성능 병목 가능성 있는 컴포넌트 3개 식별"
   → 15K 토큰

4. Read (식별된 3개만)
   → 10K 토큰

총 25K 토큰 (69% 절약)
```

---

### 연습 2: 버그 수정

**Before (비효율):**
```
사용자: "로그인 안 돼"

Claude:
- General-Purpose Agent 실행
- 모든 인증 관련 파일 읽기
- 전체 플로우 분석
→ 40K 토큰, 15분
```

**After (최적화):**
```
사용자: "로그인 안 돼"

Claude:
1. 정보 수집 (직접):
   "에러 메시지가 뭔가요?
   브라우저 콘솔에 뭐가 나오나요?"

2. 사용자: "401 Unauthorized"

3. Grep (에러 발생 지점):
   pattern: "401"
   glob: "**/*.tsx"
   → 2개 파일 식별
   → 2K 토큰

4. Read (해당 파일만)
   → 5K 토큰

5. Edit (직접 수정)

총 7K 토큰 (82% 절약), 3분
```

---

### 연습 3: 새 기능 추가

**Before (비효율):**
```
사용자: "다크모드 추가해줘"

Claude:
- 모든 컴포넌트 Read (50개)
- General-Purpose Agent
- 순차 구현
→ 100K 토큰, 40분
```

**After (최적화):**
```
사용자: "다크모드 추가해줘"

Claude:
1. Plan (설계만):
   EnterPlanMode()
   → 15K 토큰, 5분

2. 사용자 승인

3. 병렬 구현:
   - UX-Designer (테마 시스템)  → 20K
   - UX-Designer (컴포넌트 수정) → 25K
   동시 실행 ↑

4. Test (통합):
   - Test-Specialist → 10K

총 70K 토큰 (30% 절약), 20분 (50% 단축)
```

---

## 🎯 일일 체크리스트

### 오전 작업 시작 전
```
[ ] 오늘 목표 작업 목록 정리
[ ] 각 작업의 복잡도 평가 (Level 1-4)
[ ] 컨텍스트 예산 배분 계획
```

### 각 작업 시작 전
```
[ ] 30초 의사결정 체크리스트 실행
[ ] 직접 도구로 가능한지 확인
[ ] 필요한 Agent 타입 식별
[ ] 병렬 실행 가능 여부 판단
```

### 작업 중
```
[ ] Token usage 주기적 확인 (매 10분)
[ ] 불필요한 파일 읽기 방지
[ ] Agent Resume 기회 포착
```

### 작업 완료 후
```
[ ] 최적화 가능했던 부분 회고
[ ] 다음 작업에 적용할 교훈 정리
```

---

## 📚 참조 자료

### Agent별 평균 컨텍스트 사용량

```
Explore Agent (haiku):
- Quick: 5K-10K
- Medium: 10K-20K
- Thorough: 20K-40K

Plan Agent (sonnet):
- Simple: 10K-20K
- Complex: 20K-40K
- Architecture: 40K-60K

Backend-Designer (sonnet):
- API 단일: 15K-30K
- DB 설계: 20K-40K
- 시스템 통합: 40K-70K

UX-Designer (haiku):
- 컴포넌트 수정: 5K-15K
- 페이지 리팩토링: 15K-30K
- 전체 UI 개편: 30K-50K

Test-Specialist (haiku):
- 단위 테스트: 5K-10K
- 통합 테스트: 10K-20K
- E2E 테스트: 20K-35K

General-Purpose (sonnet):
- 단순 작업: 20K-40K
- 복합 작업: 40K-80K
- 대규모 작업: 80K-120K
```

---

## 🏆 숙달 단계

### Level 1: 초보자
- 직접 도구와 Agent 구분
- Read, Edit, Glob 능숙하게 사용
- 불필요한 Agent 실행 피하기

### Level 2: 중급자
- Agent 타입별 특성 이해
- 병렬 실행 패턴 활용
- Plan Mode 적절히 사용

### Level 3: 고급자
- Agent Resume 능숙하게 사용
- 컨텍스트 예산 실시간 관리
- 최적의 Agent 조합 설계

### Level 4: 마스터
- 복잡한 오케스트레이션 구성
- 토큰 사용량 50% 이하로 최적화
- 새로운 효율 패턴 발견/공유

---

## 💡 고급 팁

### 1. Agent Chaining (Agent 체이닝)
```typescript
// 작업 흐름 설계
const flow = [
  { agent: "Explore", output: "file_list" },
  { agent: "Backend-Designer", input: "file_list", output: "api_design" },
  { agent: "Test-Specialist", input: "api_design", output: "tests" }
]
// 각 Agent가 다음 Agent에게 정제된 정보 전달
```

### 2. Conditional Agent Selection
```typescript
// 작업 복잡도에 따라 동적 선택
if (파일수 < 3) {
  직접 도구 사용
} else if (파일수 < 10) {
  Explore Agent
} else {
  Plan Agent → 전문 Agent 조합
}
```

### 3. Incremental Implementation
```typescript
// ❌ 한 번에 모두 구현
"전체 기능 구현해줘" → 100K 토큰

// ✅ 점진적 구현
"MVP 먼저 구현" → 30K 토큰
"기능 확장" → 20K 토큰
"최적화" → 15K 토큰
// 총 65K (35% 절약)
```

---

## 🎬 마무리: 황금률 5개

```
1. "할 수 있다고 해서 Agent를 쓰지 마라"
   → 직접 도구가 더 빠르면 직접 사용

2. "Agent는 병렬로, 도구는 순차로"
   → 독립적 Agent는 동시 실행

3. "탐색 먼저, 구현은 나중에"
   → Explore로 범위 좁히고 시작

4. "설계는 투자, 과도한 계획은 낭비"
   → 복잡한 작업만 Plan Mode

5. "Resume은 친구, 새 Agent는 적"
   → 가능하면 기존 Agent 재사용
```

---

**문서 버전:** 1.0
**최종 업데이트:** 2026-05-12
**토큰 절약 목표:** 평균 40% 이상

**Quick Link:** `AGENT_ORCHESTRATION_GUIDE.md` - 전체 Agent 가이드
