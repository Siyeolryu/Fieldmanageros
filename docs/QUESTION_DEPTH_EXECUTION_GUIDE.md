# Question Depth Execution Guide
## 질문 깊이에 따른 실행 전략 매뉴얼

> **핵심:** 질문의 본질을 5초 안에 파악하고, 최적의 실행 경로를 선택

---

## 🎯 질문 분류 시스템

### 4-Level Classification

```
Level 1: INFO      → 정보 조회 (1-2분)
Level 2: EXPLORE   → 탐색/분석 (3-10분)
Level 3: BUILD     → 구현/개발 (15-40분)
Level 4: ARCHITECT → 시스템 설계 (1-3시간)
```

---

## 📊 Level 1: INFO (정보 조회)

### 특징
- 단순 사실 확인
- 1-3개 파일
- 즉각 답변 가능

### 판별 키워드
```
"어디에", "무엇이", "어떤", "몇 개"
"확인해줘", "보여줘", "알려줘"
```

### 실행 플로우

```
질문 접수
    ↓
파일 경로 알고 있는가?
    ↓YES → Read 직접 실행 → 답변
    ↓NO
키워드 명확한가?
    ↓YES → Glob/Grep → 답변
    ↓NO → Explore Agent (quick)
```

### 예시 & 솔루션

#### 예시 1: "package.json에 어떤 의존성이 있나?"
```typescript
✅ 최적 경로:
Read("package.json")
→ dependencies 섹션 출력
```
**소요 시간:** 10초
**토큰 사용:** 2K

---

#### 예시 2: "Framer Motion이 어디서 사용되고 있나?"
```typescript
✅ 최적 경로:
Grep({
  pattern: "from ['\"]framer-motion['\"]",
  output_mode: "files_with_matches"
})
→ 파일 목록 출력
```
**소요 시간:** 20초
**토큰 사용:** 3K

---

#### 예시 3: "현재 브랜치가 뭐야?"
```typescript
✅ 최적 경로:
Bash({ command: "git branch --show-current" })
→ "db" 출력
```
**소요 시간:** 5초
**토큰 사용:** 0.5K

---

### Level 1 체크리스트
```
[ ] Agent 사용 안 함
[ ] 직접 도구만 사용 (Read/Glob/Grep/Bash)
[ ] 1분 이내 응답
[ ] 5K 토큰 이하
```

---

## 🔍 Level 2: EXPLORE (탐색/분석)

### 특징
- 코드 구조 이해
- 여러 파일 관계 파악
- 패턴 분석

### 판별 키워드
```
"어떻게 구현되어 있나", "구조가 어떻게 되나"
"찾아줘", "분석해줘", "파악해줘"
```

### 실행 플로우

```
질문 접수
    ↓
탐색 범위 좁힐 수 있는가?
    ↓YES → Glob으로 파일 식별
    │      → Read (필요한 것만)
    ↓NO
Explore Agent 실행
    ↓
thoroughness 설정:
- "quick": 기본 검색 (5-10K)
- "medium": 보통 탐색 (10-20K)
- "very thorough": 깊은 분석 (20-40K)
```

### 예시 & 솔루션

#### 예시 1: "3-factor 분석 시스템이 어떻게 동작하나?"
```typescript
✅ 최적 경로:
Task({
  subagent_type: "Explore",
  description: "3-factor 분석 구조 파악",
  prompt: `
    Baseball Insight Pro의 3-factor 분석 시스템 구조 파악:
    1. 데이터 분석 (stats.data)
    2. 환경 분석 (stats.env)
    3. 심리/동기 (stats.psych)

    app/demo/page.tsx를 중심으로 탐색
  `,
  model: "haiku"
})
```
**소요 시간:** 2-3분
**토큰 사용:** 15K

---

#### 예시 2: "애니메이션 패턴이 어떤 게 있나?"
```typescript
✅ 최적 경로:
// Step 1: 파일 식별
Grep({
  pattern: "motion\\.",
  glob: "**/*.tsx",
  output_mode: "files_with_matches"
})

// Step 2: 주요 파일 읽기
Read("app/page.tsx")
Read("app/demo/page.tsx")

// Step 3: 패턴 요약 (직접)
```
**소요 시간:** 3-5분
**토큰 사용:** 10K

---

#### 예시 3: "API 라우트가 어디 있나?"
```typescript
✅ 최적 경로:
Glob("app/api/**/*.ts")

→ 결과가 없으면:
"현재 API 라우트가 없습니다.
db 브랜치에서 구현 예정입니다."
```
**소요 시간:** 30초
**토큰 사용:** 2K

---

### Level 2 체크리스트
```
[ ] Explore Agent는 haiku 모델
[ ] thoroughness 적절히 설정
[ ] 범위 좁힐 수 있으면 Glob/Grep 먼저
[ ] 10분 이내 완료
[ ] 20K 토큰 이하
```

---

## 🛠️ Level 3: BUILD (구현/개발)

### 특징
- 새 기능 추가
- 버그 수정
- 리팩토링
- 여러 파일 수정

### 판별 키워드
```
"추가해줘", "구현해줘", "만들어줘"
"수정해줘", "고쳐줘", "개선해줘"
```

### 실행 플로우

```
질문 접수
    ↓
복잡도 평가:
- 단일 파일? → 직접 구현
- 여러 파일? → 계속
    ↓
설계 필요한가?
    ↓YES → EnterPlanMode
    │      → 사용자 승인
    ↓NO → 직접 구현
    ↓
도메인 전문성 필요?
    ↓YES → 전문 Agent 선택
    │      - Backend: backend-designer
    │      - UI/UX: ux-designer
    │      - 테스트: test-specialist
    ↓NO → General-Purpose
    ↓
병렬 실행 가능?
    ↓YES → 여러 Agent 동시 실행
    ↓NO → 순차 실행
    ↓
테스트 필요?
    ↓YES → Test-Specialist
    ↓
완료
```

### 예시 & 솔루션

#### 예시 1: "로딩 스피너 컴포넌트 추가"

**복잡도:** 낮음 (단일 기능)

```typescript
✅ 최적 경로:
// Step 1: 직접 구현 (Plan 불필요)
Write("components/LoadingSpinner.tsx", `
'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}
`)

// Step 2: 사용 예시 추가
Edit("app/page.tsx", ...)
```
**소요 시간:** 3-5분
**토큰 사용:** 8K

---

#### 예시 2: "사용자 프로필 페이지 추가"

**복잡도:** 중간 (여러 파일, UI+로직)

```typescript
✅ 최적 경로:
// Step 1: 설계
EnterPlanMode()
/* 계획:
1. app/profile/page.tsx 생성
2. 프로필 UI 컴포넌트
3. API 연동 (나중에)
4. 반응형 디자인
*/

// Step 2: 사용자 승인

// Step 3: 병렬 구현 (단일 메시지)
Task({
  subagent_type: "ux-designer",
  description: "프로필 페이지 UI",
  prompt: "프로필 페이지 구현 (이름, 이메일, 구독 상태)",
  model: "haiku"
})

Task({
  subagent_type: "ux-designer",
  description: "프로필 수정 폼",
  prompt: "프로필 수정 모달 컴포넌트",
  model: "haiku"
})
```
**소요 시간:** 15-20분
**토큰 사용:** 40K

---

#### 예시 3: "결제 실패 시 재시도 로직 추가"

**복잡도:** 중간-높음 (백엔드 로직)

```typescript
✅ 최적 경로:
// Step 1: 기존 결제 코드 탐색
Task({
  subagent_type: "Explore",
  description: "결제 로직 찾기",
  prompt: "토스페이먼츠 결제 처리 코드 위치 파악",
  model: "haiku"
})

// Step 2: 백엔드 설계
Task({
  subagent_type: "backend-designer",
  description: "재시도 로직 설계",
  prompt: `
    결제 실패 시 재시도 로직 구현:
    - 최대 3회 재시도
    - Exponential backoff
    - 실패 로깅
  `,
  model: "sonnet"
})

// Step 3: 테스트
Task({
  subagent_type: "test-specialist",
  description: "재시도 로직 테스트",
  prompt: "결제 재시도 시나리오 테스트 작성",
  model: "haiku"
})
```
**소요 시간:** 25-30분
**토큰 사용:** 55K

---

### Level 3 체크리스트
```
[ ] 복잡도 평가 완료
[ ] Plan Mode 사용 여부 결정
[ ] 적절한 전문 Agent 선택
[ ] 병렬 실행 기회 포착
[ ] 테스트 계획 수립
[ ] 40분 이내 완료
[ ] 80K 토큰 이하
```

---

## 🏗️ Level 4: ARCHITECT (시스템 설계)

### 특징
- 전체 시스템 영향
- 아키텍처 결정
- 다중 도메인
- 장기 영향

### 판별 키워드
```
"시스템", "아키텍처", "전체", "통합"
"설계해줘", "구축해줘", "마이그레이션"
```

### 실행 플로우

```
질문 접수
    ↓
Phase 1: 현황 분석
│  Explore Agent (thorough)
│     ↓
│  기존 구조 문서화
│     ↓
Phase 2: 아키텍처 설계
│  Plan Agent (sonnet)
│     ↓
│  기술 스택 결정
│  데이터 모델 설계
│  API 구조 설계
│     ↓
│  사용자 승인 (중요!)
│     ↓
Phase 3: 도메인별 병렬 구현
│  ┌─ Backend-Designer (DB, API)
│  ├─ UX-Designer (UI, UX)
│  └─ Test-Specialist (테스트 전략)
│     ↓
Phase 4: 통합 및 검증
│  General-Purpose Agent
│     ↓
│  통합 테스트
│  성능 검증
│  문서화
│     ↓
Phase 5: 배포 준비
│  체크리스트 실행
│  환경 변수 설정
│  CI/CD 구성
```

### 예시 & 솔루션

#### 예시 1: "Prisma로 완전한 데이터베이스 시스템 구축"

**복잡도:** 매우 높음

```typescript
✅ 최적 경로:

// ═══════════════════════════════════════════
// Phase 1: 현황 분석 (5-10분)
// ═══════════════════════════════════════════
Task({
  subagent_type: "Explore",
  description: "현재 데이터 구조 분석",
  prompt: `
    현재 app/demo/page.tsx의 하드코딩된 데이터 구조 분석:
    - GameData 인터페이스
    - Teams, Players 관계
    - Predictions 구조
  `,
  model: "haiku"
})

// ═══════════════════════════════════════════
// Phase 2: 아키텍처 설계 (15-20분)
// ═══════════════════════════════════════════
EnterPlanMode()
/* 설계 문서:
1. Prisma 스키마 설계
   - User, Team, Player, Game, Prediction 모델
   - 관계 정의
   - 인덱스 전략

2. API 구조
   - /api/games (CRUD)
   - /api/predictions (CRUD)
   - /api/players (통계 조회)

3. 마이그레이션 전략
   - 하드코딩 데이터 → DB 이관
   - 점진적 배포

4. 성능 최적화
   - 캐싱 전략
   - 쿼리 최적화
*/

// 사용자 승인 대기...

// ═══════════════════════════════════════════
// Phase 3: 병렬 구현 (30-40분)
// ═══════════════════════════════════════════

// 3-1. 데이터베이스 레이어
Task({
  subagent_type: "backend-designer",
  description: "Prisma 스키마 구현",
  prompt: `
    Prisma 스키마 파일 작성:

    model User {
      id String @id @default(cuid())
      email String @unique
      subscriptions Subscription[]
    }

    model Team {
      id Int @id @default(autoincrement())
      name String
      homeGames Game[] @relation("HomeTeam")
      awayGames Game[] @relation("AwayTeam")
    }

    model Game {
      id Int @id @default(autoincrement())
      homeTeam Team @relation("HomeTeam")
      awayTeam Team @relation("AwayTeam")
      predictions Prediction[]
    }

    model Prediction {
      id Int @id @default(autoincrement())
      game Game @relation(...)
      winRate Float
      confidence String
      dataAnalysis Json
      envAnalysis Json
      psychAnalysis Json
    }
  `,
  model: "sonnet"
})

// 3-2. API 레이어
Task({
  subagent_type: "backend-designer",
  description: "API 엔드포인트 구현",
  prompt: `
    Next.js App Router API 구현:

    /api/games
    - GET: 게임 목록 (필터링, 페이징)
    - POST: 새 게임 생성

    /api/predictions/[gameId]
    - GET: 게임 예측 조회
    - POST: 예측 생성/업데이트

    3-factor 분석 결과 JSON 저장
  `,
  model: "sonnet",
  run_in_background: true // 백그라운드 실행
})

// 3-3. 프론트엔드 통합
Task({
  subagent_type: "ux-designer",
  description: "데이터 fetching 통합",
  prompt: `
    app/demo/page.tsx 리팩토링:

    - 하드코딩된 games 배열 제거
    - API 호출로 대체: fetch('/api/games')
    - Loading state 추가
    - Error handling
    - React Query 또는 SWR 사용 고려
  `,
  model: "haiku",
  run_in_background: true
})

// 3-4. 테스트 스위트
Task({
  subagent_type: "test-specialist",
  description: "통합 테스트 작성",
  prompt: `
    테스트 작성:

    1. Prisma 스키마 테스트
       - 관계 무결성
       - 제약 조건

    2. API 테스트
       - CRUD 동작
       - 에러 처리
       - 권한 검증

    3. E2E 테스트
       - 게임 목록 → 예측 조회 플로우
  `,
  model: "haiku",
  run_in_background: true
})

// ═══════════════════════════════════════════
// Phase 4: 통합 (백그라운드 작업 완료 대기)
// ═══════════════════════════════════════════
TaskOutput({ task_id: "api-task-id", block: true })
TaskOutput({ task_id: "frontend-task-id", block: true })
TaskOutput({ task_id: "test-task-id", block: true })

// 통합 검증
Bash({ command: "npx prisma migrate dev --name init" })
Bash({ command: "npm run build" })
Bash({ command: "npm test" })

// ═══════════════════════════════════════════
// Phase 5: 배포 준비
// ═══════════════════════════════════════════
Task({
  subagent_type: "general-purpose",
  description: "배포 체크리스트",
  prompt: `
    배포 준비:

    1. 환경 변수 설정
       - DATABASE_URL
       - DIRECT_URL

    2. Vercel 설정
       - Prisma generate 빌드 스크립트
       - Postgres 데이터베이스 연결

    3. 문서 업데이트
       - API 명세
       - DB 스키마 다이어그램
  `,
  model: "sonnet"
})
```

**총 소요 시간:** 1.5-2시간
**토큰 사용:** 120K-140K
**주요 전략:** 병렬 실행 + 백그라운드 작업

---

#### 예시 2: "예측 알고리즘 v2 전면 개편"

**복잡도:** 매우 높음

```typescript
✅ 최적 경로:

// Phase 1: 현재 알고리즘 분석
Task({
  subagent_type: "Explore",
  description: "기존 예측 로직 분석",
  prompt: "3-factor 분석의 승률 계산 로직 파악",
  model: "haiku"
})

// Phase 2: 새 알고리즘 설계
Task({
  subagent_type: "backend-designer",
  description: "알고리즘 v2 설계",
  prompt: `
    개선된 예측 알고리즘 설계:

    1. 머신러닝 모델 통합 (optional)
    2. 가중치 시스템 개선
    3. 실시간 업데이트
    4. 정확도 추적
  `,
  model: "sonnet"
})

// Phase 3: 구현 및 검증
// (병렬 실행)
Task({ subagent_type: "backend-designer", prompt: "알고리즘 구현" })
Task({ subagent_type: "test-specialist", prompt: "백테스팅 스크립트" })
Task({ subagent_type: "ux-designer", prompt: "신뢰도 시각화 개선" })

// Phase 4: A/B 테스트 준비
Task({
  subagent_type: "general-purpose",
  description: "A/B 테스트 설정",
  prompt: "v1 vs v2 비교 실험 환경 구축",
  model: "sonnet"
})
```

**총 소요 시간:** 2-3시간
**토큰 사용:** 100K-130K

---

### Level 4 체크리스트
```
[ ] Phase별 명확한 구분
[ ] 각 Phase 완료 후 검증
[ ] 사용자 승인 단계 포함
[ ] 백그라운드 실행 활용
[ ] 병렬 작업 최대화
[ ] 통합 테스트 필수
[ ] 문서화 자동 포함
[ ] 3시간 이내 목표
[ ] 150K 토큰 이하
```

---

## 🎯 빠른 판별 플로우차트

```
                    질문 접수
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
   "어디에/무엇이"?                "추가/구현/설계"?
   (사실 확인)                      (작업 요청)
        ↓                               ↓
   Level 1: INFO                    파일 1개?
        ↓                               ↓
   직접 도구                         YES ↓ NO
   (Read/Glob/Grep)                    ↓  ↓
                                  직접 구현 ↓
                                           ↓
                                      여러 파일?
                                           ↓
                                      YES ↓ NO
                                          ↓  ↓
                                   설계 필요? ↓
                                          ↓
                                     YES ↓ NO
                                         ↓  ↓
                              전체 시스템? Level 3
                                         ↓
                                    YES ↓ NO
                                        ↓  ↓
                                 Level 4  Level 3
                                        ↓
                                   Phase별 실행
```

---

## 📊 Level별 비교표

| Level | 시간 | 토큰 | Agent | 도구 | 승인 필요 | 테스트 |
|-------|------|------|-------|------|----------|--------|
| 1: INFO | 1-2분 | <5K | ❌ | Read/Grep | ❌ | ❌ |
| 2: EXPLORE | 3-10분 | 5K-20K | Explore | Glob/Grep | ❌ | ❌ |
| 3: BUILD | 15-40분 | 20K-80K | 전문 Agent | All | Optional | ✅ |
| 4: ARCHITECT | 1-3시간 | 80K-150K | 다중 Agent | All | ✅ 필수 | ✅✅ |

---

## 🧪 실전 훈련 시나리오

### 시나리오 1: 모호한 질문
**질문:** "앱이 이상해"

**판별 과정:**
```
1. 명확화 질문 (AskUserQuestion):
   "어떤 부분이 이상한가요?"
   - 화면 깨짐 (UI)
   - 동작 안 됨 (기능)
   - 느림 (성능)
   - 에러 발생 (버그)

2. 사용자: "화면 깨짐"

3. 추가 질문:
   "어느 페이지인가요?"
   "모바일/데스크톱?"

4. 사용자: "메인 페이지, 모바일"

5. Level 판별: Level 2 (EXPLORE)
   → UX-Designer Agent로 모바일 반응형 검토
```

---

### 시나리오 2: 복합 요청
**질문:** "회원가입 기능 추가하고 테스트도 작성해줘"

**판별 과정:**
```
1. 분해:
   - 회원가입 (Backend + Frontend)
   - 테스트 (Test)

2. Level 판별: Level 3 (BUILD)

3. 실행 계획:
   Phase A: 설계 (Plan)
   Phase B: 병렬 구현
      - Backend-Designer (API)
      - UX-Designer (UI)
   Phase C: 테스트
      - Test-Specialist

4. 토큰 예산: 60K 예상
```

---

### 시나리오 3: 긴급 버그
**질문:** "프로덕션에서 결제가 안 돼! 급해!"

**판별 과정:**
```
1. Level 판별: Level 2 → Level 3 전환 가능

2. 긴급 모드 실행:
   - Explore (결제 코드 빠르게 찾기)
   - Read (에러 발생 지점)
   - 직접 수정 (Plan 생략)
   - 즉시 테스트

3. 최적화:
   - Agent 최소화
   - 직접 도구 우선
   - 시간 최우선 (토큰 낭비 감수)
```

---

## 💡 Pro Tips

### Tip 1: 질문을 명확하게 유도하기
```
❌ "코드 리뷰해줘"
   → 너무 광범위, Level 불명확

✅ "게임 예측 로직에 성능 이슈가 있나?"
   → Level 2, Explore로 명확
```

---

### Tip 2: 단계별 승인 받기
```
Level 3-4 작업에서:

1. 설계 먼저 보여주기
2. 사용자 승인 받기
3. 구현 시작

→ 방향 틀리면 토큰 낭비 방지
```

---

### Tip 3: 점진적 Level Up
```
처음엔 낮은 Level로 시작:

질문 → Level 1/2로 탐색
     → 복잡하면 Level 3/4로 전환

한 번에 Level 4로 가지 말기
```

---

### Tip 4: 백그라운드 활용
```
Level 4에서 병렬 작업 시:

긴 작업은 run_in_background: true
→ 다른 작업 동시 진행
→ TaskOutput으로 나중에 확인
```

---

## 🎓 숙달 로드맵

### Week 1: Level 1-2 마스터
- 직접 도구 능숙하게 사용
- Explore Agent 효과적 활용
- 10K 토큰 이하로 대부분 해결

### Week 2: Level 3 마스터
- Plan Mode 적절히 사용
- 전문 Agent 구분
- 병렬 실행 패턴 익히기

### Week 3: Level 4 도전
- 복잡한 시스템 작업
- Phase별 오케스트레이션
- 백그라운드 실행 활용

### Week 4: 최적화 전문가
- 토큰 사용량 40% 절감
- 시간 30% 단축
- 새로운 패턴 발견

---

## 📋 일일 점검표

### 오전 (작업 계획)
```
[ ] 오늘 할 작업 목록 작성
[ ] 각 작업의 Level 판별
[ ] 토큰 예산 배분
[ ] 긴급 작업 우선순위
```

### 작업 중 (실시간 판단)
```
[ ] 질문 접수 → 5초 안에 Level 판별
[ ] 적절한 실행 경로 선택
[ ] 토큰 사용량 모니터링
[ ] 필요시 Level 조정
```

### 오후 (회고)
```
[ ] Level 판별이 정확했는가?
[ ] 더 효율적인 경로는?
[ ] 다음에 개선할 점은?
```

---

## 🎯 핵심 정리

### Level 판별 골든 룰

```
1. 의심스러우면 낮은 Level부터
   → 필요하면 Level Up

2. 복잡하다고 무조건 Level 4 아님
   → 분해하면 Level 3

3. 긴급하면 최적화보다 속도
   → 토큰 희생하고 빠르게

4. 모호하면 명확화 먼저
   → AskUserQuestion 활용

5. 설계는 투자, 과도한 계획은 낭비
   → Level 3는 Plan 선택적, Level 4는 필수
```

---

## 📚 관련 문서

- **AGENT_ORCHESTRATION_GUIDE.md** - Agent 전체 가이드
- **CONTEXT_OPTIMIZATION_PLAYBOOK.md** - 컨텍스트 최적화 전략
- **CLAUDE.md** - 프로젝트 컨텍스트

---

## 🏆 마스터 체크리스트

```
[ ] Level 1-2를 5초 안에 판별할 수 있다
[ ] Level 3-4를 분해하여 실행할 수 있다
[ ] 병렬 실행을 적극 활용한다
[ ] 토큰 예산을 초과하지 않는다
[ ] 각 Level의 시간 목표를 달성한다
[ ] 긴급 상황에 유연하게 대응한다
[ ] 새로운 최적화 패턴을 발견한다
```

---

**문서 버전:** 1.0
**최종 업데이트:** 2026-05-12
**목표:** 질문 판별 정확도 95% 이상

**Quick Start:** 30초 체크리스트 → Level 판별 → 실행 플로우 선택
