# Agent 오케스트레이션 가이드
## Claude Code & Antigravity Agent 효율적 활용 전략

> **목적:** 컨텍스트 낭비를 최소화하고, 질문의 복잡도에 따라 적절한 agent를 선택하여 프로젝트 생산성을 극대화

---

## 📋 목차

1. [Agent 타입별 특징](#agent-타입별-특징)
2. [컨텍스트 최적화 원칙](#컨텍스트-최적화-원칙)
3. [질문 깊이별 실행 플로우](#질문-깊이별-실행-플로우)
4. [실전 시나리오 매트릭스](#실전-시나리오-매트릭스)
5. [Best Practices 체크리스트](#best-practices-체크리스트)

---

## 🤖 Agent 타입별 특징

### 1. **Explore Agent** (탐색 전문)
**언제 사용:**
- 코드베이스 구조 파악
- 특정 기능의 위치 찾기
- "어디에 구현되어 있나?" 질문

**장점:**
- 빠른 파일 패턴 탐색
- 키워드 기반 검색 최적화
- 낮은 컨텍스트 사용량

**사용 예시:**
```
❌ 직접 Glob/Grep 사용: "app/**/*.tsx 파일들을 검색해줘"
✅ Explore Agent 사용: "게임 예측 로직이 어느 파일에 있는지 찾아줘"
```

**프로젝트 적용:**
- 3-factor 분석 시스템 구현 위치 탐색
- Framer Motion 애니메이션 패턴 찾기
- API 라우트 구조 확인

---

### 2. **Plan Agent** (설계 전문)
**언제 사용:**
- 새로운 기능 구현 전 설계
- 여러 파일 수정이 필요한 작업
- 아키텍처 결정이 필요한 경우

**장점:**
- 단계별 실행 계획 수립
- 파일 의존성 분석
- 위험 요소 사전 식별

**사용 예시:**
```
❌ 바로 구현 시작: "결제 시스템 추가해줘"
✅ Plan Agent 먼저: "토스페이먼츠 결제를 어떻게 통합할지 계획 세워줘"
```

**프로젝트 적용:**
- 데이터베이스 스키마 설계
- 예측 알고리즘 아키텍처 설계
- 인증 시스템 통합 계획

---

### 3. **Backend-Designer Agent** (백엔드 아키텍트)
**언제 사용:**
- API 엔드포인트 설계
- 데이터베이스 최적화
- 성능 개선 작업

**장점:**
- RESTful API 설계 전문성
- 데이터 모델링 최적화
- 성능 병목 분석

**사용 예시:**
```
❌ 일반 agent: "게임 데이터 저장하는 API 만들어줘"
✅ Backend-Designer: "3-factor 분석 결과를 효율적으로 저장/조회하는 API 설계해줘"
```

**프로젝트 적용:**
- `/api/predictions` 엔드포인트 설계
- Player 메트릭 (ACWR, HRV, WPA, PER) 저장 구조
- 실시간 승률 업데이트 아키텍처

---

### 4. **Test-Specialist Agent** (테스팅 전문)
**언제 사용:**
- 단위 테스트 작성
- 통합 테스트 설계
- 버그 재현 및 수정

**장점:**
- 엣지 케이스 식별
- 테스트 커버리지 최적화
- 테스트 코드 품질 향상

**사용 예시:**
```
❌ 수동 테스트: "이 함수가 잘 작동하는지 확인해줘"
✅ Test-Specialist: "승률 계산 함수의 경계값 테스트 작성해줘"
```

**프로젝트 적용:**
- 예측 정확도 검증 테스트
- API 응답 시간 성능 테스트
- 결제 플로우 통합 테스트

---

### 5. **UX-Designer Agent** (UX 전문)
**언제 사용:**
- UI 컴포넌트 개선
- 접근성 검토
- 사용자 흐름 최적화

**장점:**
- 디자인 시스템 일관성
- 접근성 가이드라인 준수
- 반응형 디자인 최적화

**사용 예시:**
```
❌ 직접 수정: "버튼 색상 바꿔줘"
✅ UX-Designer: "프리미엄 구독 전환율을 높이기 위한 CTA 디자인 개선해줘"
```

**프로젝트 적용:**
- 게임 카드 UI 개선
- 신뢰도 표시 (HIGH/MEDIUM/LOW) 시각화
- 모바일 반응형 레이아웃 최적화

---

### 6. **General-Purpose Agent** (범용)
**언제 사용:**
- 복잡한 다단계 작업
- 여러 도메인 걸친 작업
- 탐색 + 구현 + 테스트 통합

**장점:**
- 모든 도구 사용 가능
- 유연한 문제 해결
- 컨텍스트 유지

**사용 예시:**
```
✅ 적절한 사용: "프로필 사진 업로드 기능을 처음부터 끝까지 구현해줘"
```

---

## ⚡ 컨텍스트 최적화 원칙

### 원칙 1: **작업 분해 우선**
```
❌ 나쁜 예:
"앱 전체를 리뷰하고 개선점 찾아줘" (모든 파일 읽음)

✅ 좋은 예:
1. Explore: "성능 병목이 있을 만한 컴포넌트 찾아줘"
2. Read: 특정 파일만 읽기
3. Plan: 개선 계획 수립
```

### 원칙 2: **Lazy Loading 전략**
```
단계별 정보 요청:
1. 파일 위치 찾기 (Explore)
2. 필요한 파일만 읽기 (Read)
3. 수정 계획 수립 (Plan)
4. 구현 (Edit/Write)
```

### 원칙 3: **병렬 작업 최대화**
```typescript
// ❌ 순차 실행 (느림)
Task 1 → 완료 → Task 2 → 완료 → Task 3

// ✅ 병렬 실행 (빠름)
Task 1 ↘
Task 2 → 동시 실행 → 결과 통합
Task 3 ↗
```

### 원칙 4: **Agent 재사용**
```
❌ 새 agent 계속 생성:
- 컨텍스트 중복 로드
- 토큰 낭비

✅ Agent resume 기능 활용:
- 이전 대화 맥락 유지
- 빠른 후속 작업
```

---

## 📊 질문 깊이별 실행 플로우

### Level 1: **Simple Query** (단순 질문)
**특징:** 1-2개 파일, 단일 작업, 명확한 답변

**플로우:**
```
사용자 질문 → 직접 도구 사용 (Glob/Read/Grep) → 답변
```

**예시:**
- "app/page.tsx에 어떤 컴포넌트가 있나?"
- "Tailwind 설정 파일 어디 있어?"
- "현재 Next.js 버전은?"

**도구 선택:**
- `Read`: 특정 파일 확인
- `Glob`: 파일 패턴 검색
- `Grep`: 키워드 검색

**예상 시간:** 10-30초
**컨텍스트 사용량:** 낮음 (1K-5K 토큰)

---

### Level 2: **Exploration Task** (탐색 작업)
**특징:** 코드베이스 이해, 여러 파일 검색, 구조 파악

**플로우:**
```
사용자 질문 → Explore Agent 실행 → 결과 요약 → 답변
```

**예시:**
- "3-factor 분석 시스템이 어떻게 구현되어 있나?"
- "Framer Motion 애니메이션 패턴 찾아줘"
- "인증 관련 코드가 어디에 있나?"

**Agent 선택:**
```typescript
Task({
  subagent_type: "Explore",
  prompt: "게임 예측 로직의 구현 위치와 구조 파악",
  description: "예측 로직 탐색",
  model: "haiku" // 빠른 탐색에는 haiku
})
```

**예상 시간:** 1-3분
**컨텍스트 사용량:** 중간 (10K-30K 토큰)

---

### Level 3: **Implementation Task** (구현 작업)
**특징:** 새 기능 추가, 여러 파일 수정, 테스트 필요

**플로우:**
```
1. 요구사항 분석
2. Plan Agent로 설계 (EnterPlanMode)
3. 사용자 승인
4. 병렬 구현 (여러 agent 동시 실행)
5. Test-Specialist로 테스트
```

**예시:**
- "사용자 로그인 기능 추가"
- "결제 시스템 통합"
- "실시간 승률 업데이트 기능"

**Agent 조합:**
```typescript
// Step 1: 설계
EnterPlanMode() → 사용자 승인

// Step 2: 병렬 구현
Task({ subagent_type: "backend-designer", prompt: "API 구현" })
Task({ subagent_type: "ux-designer", prompt: "UI 컴포넌트" })
// 동시 실행 ↑

// Step 3: 테스트
Task({ subagent_type: "test-specialist", prompt: "통합 테스트" })
```

**예상 시간:** 5-15분
**컨텍스트 사용량:** 높음 (50K-100K 토큰)

---

### Level 4: **Complex Architecture** (복잡한 아키텍처 작업)
**특징:** 시스템 전체 영향, 다중 도메인, 단계별 실행 필요

**플로우:**
```
1. 전체 구조 파악 (Explore)
2. 아키텍처 설계 (Plan)
3. 도메인별 전문 agent 실행
   - Backend-Designer (API/DB)
   - UX-Designer (UI/UX)
   - Test-Specialist (QA)
4. 통합 및 배포
```

**예시:**
- "데이터베이스 마이그레이션 및 API 전체 재설계"
- "프리미엄 구독 시스템 완전 통합"
- "예측 알고리즘 v2 전면 개편"

**Agent 오케스트레이션:**
```typescript
// Phase 1: 탐색 및 계획 (순차)
await Task({ subagent_type: "Explore", prompt: "현재 구조 분석" })
await EnterPlanMode()

// Phase 2: 도메인별 병렬 실행
const [backend, frontend, tests] = await Promise.all([
  Task({ subagent_type: "backend-designer", prompt: "백엔드 재설계" }),
  Task({ subagent_type: "ux-designer", prompt: "UI 리팩토링" }),
  Task({ subagent_type: "test-specialist", prompt: "테스트 스위트" })
])

// Phase 3: 통합
Task({ subagent_type: "general-purpose", prompt: "통합 및 배포" })
```

**예상 시간:** 30분-2시간
**컨텍스트 사용량:** 매우 높음 (100K-150K 토큰)

---

## 🎯 실전 시나리오 매트릭스

### 시나리오 1: "게임 예측 정확도를 85%로 높이고 싶어"

| 단계 | Agent | 작업 | 이유 |
|------|-------|------|------|
| 1 | Explore | 현재 예측 알고리즘 찾기 | 코드 위치 파악 |
| 2 | Read | `app/demo/page.tsx` 읽기 | 현재 로직 이해 |
| 3 | Backend-Designer | 알고리즘 개선안 설계 | 도메인 전문성 |
| 4 | Plan | 구현 계획 수립 | 단계별 실행 |
| 5 | General-Purpose | 구현 및 통합 | 복합 작업 |
| 6 | Test-Specialist | 정확도 검증 테스트 | 품질 보증 |

**예상 소요:** 20-30분
**컨텍스트 효율:** ⭐⭐⭐⭐ (agent 역할 분담으로 최적화)

---

### 시나리오 2: "모바일 UI가 깨져 보여, 고쳐줘"

| 단계 | Agent | 작업 | 이유 |
|------|-------|------|------|
| 1 | Read | `app/page.tsx`, `globals.css` | 레이아웃 코드 확인 |
| 2 | UX-Designer | 반응형 문제 진단 및 수정 | UI 전문성 |
| 3 | Bash | `npm run build` | 빌드 검증 |

**예상 소요:** 3-5분
**컨텍스트 효율:** ⭐⭐⭐⭐⭐ (최소한의 agent 사용)

---

### 시나리오 3: "Prisma로 데이터베이스 완전히 구축해줘"

| 단계 | Agent | 작업 | 이유 |
|------|-------|------|------|
| 1 | Explore | 기존 DB 관련 코드 탐색 | 현황 파악 |
| 2 | Backend-Designer | 스키마 설계 (Teams, Players, Games, Predictions) | DB 아키텍처 |
| 3 | Plan | 마이그레이션 계획 | 단계별 실행 |
| 4 | Bash | `npx prisma init` | 초기 설정 |
| 5 | Write | `schema.prisma` 작성 | 스키마 정의 |
| 6 | Bash | `npx prisma migrate dev` | DB 생성 |
| 7 | Backend-Designer | API 라우트 구현 | 엔드포인트 |
| 8 | Test-Specialist | API 테스트 작성 | 품질 검증 |

**예상 소요:** 30-40분
**컨텍스트 효율:** ⭐⭐⭐⭐ (체계적 분업)

---

### 시나리오 4: "이 에러 메시지 무슨 뜻이야?"

| 단계 | 도구 | 작업 | 이유 |
|------|------|------|------|
| 1 | Read | 에러 발생 파일 읽기 | 직접 확인 가능 |
| 2 | 직접 답변 | 에러 설명 및 해결 방법 | Agent 불필요 |

**예상 소요:** 30초-1분
**컨텍스트 효율:** ⭐⭐⭐⭐⭐ (agent 미사용)

---

## ✅ Best Practices 체크리스트

### 🔍 질문 전 자가 진단

```
[ ] 이 작업은 단일 파일 수정으로 가능한가?
    → Yes: 직접 도구 사용 (Read/Edit/Write)
    → No: Agent 고려

[ ] 코드 위치를 모르는가?
    → Yes: Explore Agent 먼저 실행
    → No: Read로 직접 읽기

[ ] 여러 파일을 동시에 수정하는가?
    → Yes: Plan Agent로 설계 먼저
    → No: 직접 구현

[ ] 백엔드/프론트엔드/테스트 중 어느 도메인인가?
    → 명확함: 전문 agent 사용
    → 복합적: General-Purpose

[ ] 병렬 실행 가능한 작업이 있는가?
    → Yes: 단일 메시지에서 여러 Task 호출
    → No: 순차 실행
```

---

### ⚙️ Agent 선택 결정 트리

```
작업 복잡도 분석
│
├─ 단순 (1-2 파일) → 직접 도구 사용
│   └─ Read, Edit, Glob, Grep
│
├─ 중간 (탐색 필요) → Explore Agent
│   └─ 코드베이스 구조 파악
│
├─ 복잡 (설계 필요) → Plan Agent
│   └─ 실행 계획 수립 → 도메인별 전문 agent
│
└─ 매우 복잡 (전체 시스템)
    └─ 단계별 오케스트레이션
        ├─ Explore (분석)
        ├─ Plan (설계)
        ├─ 전문 Agents (병렬 구현)
        └─ Test-Specialist (검증)
```

---

### 📈 컨텍스트 사용량 모니터링

**현재 세션 토큰 확인:**
```
System warning에서 확인:
"Token usage: 23698/200000"
→ 아직 11% 사용, 여유 있음
```

**임계값 기준:**
- **0-50K:** 자유롭게 agent 사용
- **50K-100K:** 중요 작업만 agent 사용
- **100K-150K:** General-Purpose 대신 전문 agent
- **150K+:** 직접 도구 사용, agent 최소화

---

### 🚀 병렬 실행 패턴

**❌ 나쁜 예 (순차 실행):**
```typescript
// Message 1
Task({ subagent_type: "backend-designer", prompt: "API 설계" })

// Message 2 (이전 완료 후)
Task({ subagent_type: "ux-designer", prompt: "UI 설계" })

// Message 3 (이전 완료 후)
Task({ subagent_type: "test-specialist", prompt: "테스트 작성" })
```

**✅ 좋은 예 (병렬 실행):**
```typescript
// 단일 Message에서 모두 실행
Task({ subagent_type: "backend-designer", prompt: "API 설계" })
Task({ subagent_type: "ux-designer", prompt: "UI 설계" })
Task({ subagent_type: "test-specialist", prompt: "테스트 작성" })
// 3개 동시 실행 → 시간 1/3로 단축
```

---

### 🧠 Agent Resume 활용

**상황:** 이전 agent 작업의 후속 작업

```typescript
// ❌ 새 agent 생성 (컨텍스트 재로드)
Task({
  subagent_type: "backend-designer",
  prompt: "앞에서 설계한 API 구현해줘"
})

// ✅ 기존 agent resume (컨텍스트 유지)
Task({
  subagent_type: "backend-designer",
  resume: "agent-id-12345", // 이전 agent ID
  prompt: "설계한 API 구현해줘"
})
```

---

## 📚 프로젝트별 Agent 매핑

### Baseball Insight Pro 주요 작업

| 작업 유형 | 추천 Agent | 모델 | 우선순위 |
|----------|-----------|------|---------|
| 3-factor 분석 로직 개선 | Backend-Designer | sonnet | 높음 |
| 게임 카드 UI 리팩토링 | UX-Designer | haiku | 중간 |
| Prisma 스키마 설계 | Backend-Designer | sonnet | 높음 |
| API 엔드포인트 구현 | Backend-Designer | sonnet | 높음 |
| 애니메이션 최적화 | UX-Designer | haiku | 낮음 |
| 예측 정확도 테스트 | Test-Specialist | haiku | 높음 |
| 코드베이스 구조 파악 | Explore | haiku | 중간 |
| 결제 시스템 통합 | Plan + General | sonnet | 높음 |

---

## 🎓 실전 예제: 완전한 플로우

### 요청: "프리미엄 구독 결제 기능을 토스페이먼츠로 구현해줘"

**Step 1: 초기 분석 (직접 수행)**
```typescript
// 현재 상태 확인
Glob("**/payment**") // 기존 결제 코드 있는지
Read("package.json") // 의존성 확인
```

**Step 2: 설계 (Plan Agent)**
```typescript
EnterPlanMode()
// → 사용자 승인 대기
```

**Step 3: 병렬 구현 (전문 Agents)**
```typescript
// 단일 메시지에서 동시 실행
Task({
  subagent_type: "backend-designer",
  prompt: "토스페이먼츠 API 통합 및 /api/payment/subscribe 엔드포인트 구현",
  model: "sonnet"
})

Task({
  subagent_type: "ux-designer",
  prompt: "₩19,000/주 구독 결제 UI 컴포넌트 및 성공/실패 페이지 구현",
  model: "haiku"
})
```

**Step 4: 통합 및 테스트 (순차 실행)**
```typescript
// 이전 작업 완료 후
Task({
  subagent_type: "test-specialist",
  prompt: "결제 플로우 E2E 테스트 작성 (성공/실패/취소 시나리오)",
  model: "haiku"
})
```

**Step 5: 배포 준비 (직접 수행)**
```bash
npm run build
npm run test
git commit -m "feat: 토스페이먼츠 구독 결제 통합"
```

**총 소요 시간:** 25-35분
**컨텍스트 사용량:** 약 70K 토큰 (병렬 실행으로 최적화)

---

## 🛡️ 안티패턴 (하지 말아야 할 것)

### ❌ Anti-Pattern 1: Agent 남용
```
"안녕하세요"
→ General-Purpose Agent 실행 (불필요)
```
**해결:** 단순 대화는 직접 응답

---

### ❌ Anti-Pattern 2: 잘못된 순차 실행
```
Backend 구현 → 완료 대기 → Frontend 구현 → 완료 대기
```
**해결:** 독립적 작업은 병렬 실행

---

### ❌ Anti-Pattern 3: 과도한 파일 읽기
```
"전체 코드 리뷰해줘"
→ 모든 파일 Read (컨텍스트 폭발)
```
**해결:** Explore Agent로 먼저 중요 파일 식별

---

### ❌ Anti-Pattern 4: Agent Resume 미사용
```
같은 작업 이어서 하는데 새 agent 생성
→ 중복 컨텍스트 로드
```
**해결:** resume 파라미터로 이전 agent 재사용

---

## 📊 성과 측정

### 효율성 KPI

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 작업당 평균 토큰 | < 30K | System warning 확인 |
| Agent 재사용률 | > 40% | Resume 사용 횟수 |
| 병렬 실행률 | > 60% | 단일 메시지 내 Task 수 |
| 직접 도구 사용률 | > 50% | Agent 미사용 작업 비율 |

---

## 🔄 지속적 개선

### 매 세션 후 체크
```
[ ] 불필요한 agent 실행이 있었나?
[ ] 병렬 실행 가능했는데 순차 실행한 것은?
[ ] 직접 도구로 해결 가능했던 작업은?
[ ] Agent resume을 활용할 기회가 있었나?
```

### 월간 리뷰
- 가장 많이 사용한 agent 타입 분석
- 컨텍스트 사용량 추세 확인
- 새로운 최적화 패턴 발굴

---

## 📞 빠른 참조 카드

```
┌─────────────────────────────────────────┐
│  작업 타입          →  Agent 선택       │
├─────────────────────────────────────────┤
│  파일 찾기          →  Explore          │
│  설계 필요          →  Plan             │
│  API 구현           →  Backend-Designer │
│  UI 개선            →  UX-Designer      │
│  테스트 작성        →  Test-Specialist  │
│  복합 작업          →  General-Purpose  │
│  단순 수정          →  직접 도구        │
└─────────────────────────────────────────┘
```

---

## 🎯 핵심 요약

1. **작업을 분해하라** - 큰 작업은 작은 단계로
2. **적재적소에 agent 배치** - 전문성 활용
3. **병렬 실행을 최대화** - 시간과 컨텍스트 절약
4. **Agent를 재사용** - Resume 기능 적극 활용
5. **단순한 것은 직접** - 불필요한 agent 실행 지양

---

**문서 버전:** 1.0
**최종 업데이트:** 2026-05-12
**작성자:** Claude Code Orchestrator

**관련 문서:**
- `AGENT_FRONTEND.md` - UI/UX Agent 상세 가이드
- `AGENT_BACKEND.md` - Backend Agent 상세 가이드
- `AGENT_DATABASE.md` - Database Agent 상세 가이드
