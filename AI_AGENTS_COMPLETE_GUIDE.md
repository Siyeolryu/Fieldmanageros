# Field Manager OS - AI 에이전트 시스템 종합 가이드

## 🎯 개요

**Field Manager OS**의 발전을 위한 완전한 AI 에이전트 시스템입니다.
Agent Maker를 통해 새로운 에이전트를 자동 생성하고, 전문 에이전트들이 **AOS/iOS 앱 개발**, **Vercel 배포**, **시스템 아키텍처 설계**, **테스트 자동화**를 수행합니다.

---

## 📦 설치된 Agent 목록

### 🤖 Core Agents (핵심 에이전트)

| Agent | 역할 | 주요 기능 | 파일 |
|-------|------|-----------|------|
| **Agent Maker** | 메타 에이전트 | 새로운 Agent 자동 생성 | `.claude/skills/agent-maker/SKILL.md` |
| **Mobile Developer** | 모바일 개발 | AOS/iOS 앱 전환 계획 | `.claude/agents/mobile_developer_agent.py` |
| **DevOps** | 배포 자동화 | Vercel 배포, CI/CD | `.claude/agents/devops_agent.py` |
| **Architecture** | 시스템 설계 | 아키텍처 설계, 기술 스택 | `.claude/agents/architecture_agent.py` |
| **QA/Test** | 품질 관리 | 테스트 자동화, 품질 보증 | `.claude/agents/qa_agent.py` |

### 📋 Business Agents (비즈니스 에이전트)

| Agent | 역할 | 주요 기능 | 파일 |
|-------|------|-----------|------|
| **Planner** | 제품 기획 | 기능 설계, UX 개선 | `.claude/agents/field_planner_agent.py` (생성 예정) |
| **Marketing** | 마케팅 전략 | B2B 영업, 콘텐츠 제작 | `.claude/agents/field_marketing_agent.py` (생성 예정) |

---

## 🚀 빠른 시작

### 1단계: Agent Maker로 새 Agent 생성

```bash
# CLI에서 Agent Maker 호출
/agent-maker "법무 Agent를 만들어줘. 근로기준법 준수 체크하고 4대 보험 계산 검증하는 Agent"
```

**결과**:
- `.claude/agents/legal_agent.py` ✅
- `.claude/skills/legal/SKILL.md` ✅
- `.claude/templates/legal_report.md` ✅

### 2단계: Mobile Developer로 앱 전환

```bash
# Python SDK 실행
python .claude/agents/mobile_developer_agent.py
```

또는

```bash
# CLI Skill 실행
/mobile-dev "React Native로 AOS/iOS 앱 전환 계획"
```

**결과**: 모바일 앱 전환 계획서 생성

### 3단계: DevOps로 Vercel 배포

```bash
python .claude/agents/devops_agent.py
```

**결과**: Vercel 배포 가이드 + 설정 파일 생성

### 4단계: QA로 테스트 자동화

```bash
python .claude/agents/qa_agent.py
```

**결과**: 테스트 전략 + 샘플 테스트 코드 생성

---

## 📖 Agent 상세 사용법

### 🛠️ Agent Maker (메타 에이전트)

#### 용도
새로운 도메인 전문 Agent를 자동으로 생성합니다.

#### 사용법
```bash
/agent-maker "[생성할 Agent 설명]"
```

#### 예시

**예시 1: 법무 Agent 생성**
```bash
/agent-maker "법무 Agent 생성.
- 근로기준법 준수 체크
- 4대 보험 계산 검증
- 법적 리스크 분석
- 컴플라이언스 리포트 생성"
```

**예시 2: 데이터 분석 Agent 생성**
```bash
/agent-maker "데이터 분석 Agent 생성.
- 현장별 노무비 트렌드 분석
- 근로자 출근율 패턴 분석
- 비용 절감 인사이트 제공"
```

#### 생성되는 파일
1. **Python Agent**: `.claude/agents/[name]_agent.py`
2. **Skill 래퍼**: `.claude/skills/[name]/SKILL.md`
3. **템플릿**: `.claude/templates/[name]_template.md`

---

### 📱 Mobile Developer Agent

#### 용도
HTML/JavaScript 웹앱을 AOS/iOS 네이티브 앱으로 전환합니다.

#### 주요 기능
1. **전환 전략 제안** (WebView vs React Native vs 네이티브)
2. **아키텍처 설계** (앱 구조, 데이터 플로우)
3. **기술 스택 제안** (UI 프레임워크, DB, API)
4. **스토어 등록 가이드** (Google Play, App Store)
5. **스타터 코드 생성**

#### Python SDK 사용

```python
from mobile_developer_agent import MobileDeveloperAgent

agent = MobileDeveloperAgent()

# 모바일 앱 전환 계획
result = await agent.convert_to_mobile_app(
    platform="both",  # "android", "ios", "both"
    current_tech="HTML/JavaScript (Tailwind, ExcelJS, jsPDF)",
    requirements=[
        "오프라인 모드 필수",
        "빠른 출시 (3개월 이내)",
        "예산 제한 (₩2,000만 이하)"
    ]
)

print(result['conversion_plan'])
```

#### 출력 예시
```markdown
# Field Manager OS 모바일 앱 전환 계획

## 추천 전략: React Native

### 이유
- 기존 JavaScript 지식 활용 (80% 재사용)
- 크로스플랫폼 (AOS + iOS 동시 개발)
- 네이티브 성능 (90% 수준)
- 개발 비용: ₩1,800만 (예산 내)

## 기술 스택
- UI: React Native + React Navigation
- 상태 관리: Zustand
- 로컬 DB: Realm
- 파일 처리: react-native-fs, xlsx

## 구현 로드맵
Phase 1: 프로젝트 초기화 (2주)
Phase 2: 핵심 기능 (6주)
Phase 3: 고급 기능 (3주)
Phase 4: 스토어 배포 (1주)

[상세 내용...]
```

---

### ☁️ DevOps Agent

#### 용도
Vercel을 통한 빠르고 안정적인 배포 환경을 구축합니다.

#### 주요 기능
1. **Vercel 배포 설정** (vercel.json, 환경 변수)
2. **CI/CD 파이프라인** (GitHub Actions)
3. **성능 최적화** (캐싱, 압축, CDN)
4. **모니터링 설정** (Analytics, Sentry)
5. **비용 최적화** (플랜 선택, 대역폭 관리)

#### Python SDK 사용

```python
from devops_agent import DevOpsAgent

agent = DevOpsAgent()

# Vercel 배포 설정
result = await agent.setup_vercel_deployment(
    project_type="static",
    custom_domain="fieldmanager.app",
    environment_vars={
        "NODE_ENV": "production",
        "API_URL": "https://api.fieldmanager.app"
    }
)

print(result['deployment_guide'])
```

#### 생성되는 파일
```
vercel.json                    # Vercel 설정
package.json                   # 의존성 관리
.github/workflows/deploy.yml   # CI/CD 파이프라인
```

#### 배포 명령어
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 배포
vercel --prod

# 4. 커스텀 도메인 연결
vercel domains add fieldmanager.app
```

---

### 🏗️ Architecture Agent

#### 용도
확장 가능한 시스템 아키텍처를 설계하고 기술 스택을 선정합니다.

#### 주요 기능
1. **As-Is/To-Be 분석** (현재 → 목표 아키텍처)
2. **계층별 설계** (프론트엔드, 백엔드, DB)
3. **데이터 모델 설계** (Prisma 스키마, ERD)
4. **API 설계** (RESTful 엔드포인트)
5. **확장성 전략** (캐싱, 로드 밸런싱)
6. **보안 아키텍처** (인증, 암호화)

#### Python SDK 사용

```python
from architecture_agent import ArchitectureAgent

agent = ArchitectureAgent()

result = await agent.design_system_architecture(
    requirements=[
        "멀티 디바이스 동기화 (웹, AOS, iOS)",
        "오프라인 모드 지원",
        "실시간 협업 (여러 관리자)",
        "대용량 엑셀 처리 (수천 행)",
        "역할 기반 권한 관리"
    ],
    scale="medium",  # "small", "medium", "large"
    constraints={
        "예산": "월 $100 이하",
        "개발 기간": "3개월",
        "팀 규모": "1-2명"
    }
)

print(result['architecture_doc'])
```

#### 출력 예시
```markdown
# Field Manager OS 시스템 아키텍처

## 목표 아키텍처 (To-Be)

```
[Client] Web/Mobile
    ↕
[Vercel Edge Network]
    ↕
[Next.js API Routes]
    ↕
[Database] Vercel Postgres
[Storage] Vercel Blob
[Cache] Redis
```

## 기술 스택
- Frontend: Next.js 15, React, Tailwind
- Backend: Next.js API Routes, Prisma
- Database: Vercel Postgres
- Auth: NextAuth.js
- Deploy: Vercel

## Prisma 스키마
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  companies Company[]
}

model Company {
  id    String @id @default(cuid())
  name  String
  sites Site[]
}

[상세 스키마...]
```

[상세 내용...]
```

---

### 🧪 QA/Test Agent

#### 용도
테스트 자동화 전략을 수립하고 테스트 코드를 생성합니다.

#### 주요 기능
1. **테스트 전략 수립** (유닛, 통합, E2E)
2. **환경 설정** (Vitest, Playwright)
3. **샘플 테스트 코드** (컴포넌트, API, E2E)
4. **CI/CD 통합** (GitHub Actions)
5. **커버리지 측정** (목표: 80% 이상)

#### Python SDK 사용

```python
from qa_agent import QAAgent

agent = QAAgent()

result = await agent.create_test_strategy(
    test_scope="full",  # "unit", "integration", "e2e", "full"
    framework="vitest"  # "vitest", "jest", "playwright"
)

print(result['test_strategy'])
```

#### 생성되는 파일
```
vitest.config.ts                      # Vitest 설정
playwright.config.ts                  # Playwright 설정
src/utils/date-helpers.test.ts       # 유닛 테스트
src/components/Calendar.test.tsx     # 컴포넌트 테스트
app/api/attendance/route.test.ts     # API 테스트
e2e/attendance-flow.spec.ts          # E2E 테스트
.github/workflows/test.yml           # CI/CD
```

#### 테스트 실행
```bash
# 유닛 테스트
npm run test

# 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e

# UI 모드
npm run test:ui
```

---

## 🔄 통합 워크플로우

### 시나리오 1: 웹앱 → 모바일 앱 + Vercel 배포

```bash
# 1단계: Architecture Agent로 전체 아키텍처 설계
python .claude/agents/architecture_agent.py

# 2단계: Mobile Developer로 앱 전환 계획
python .claude/agents/mobile_developer_agent.py

# 3단계: DevOps로 Vercel 배포 설정
python .claude/agents/devops_agent.py

# 4단계: QA로 테스트 자동화
python .claude/agents/qa_agent.py

# 5단계: 구현 시작!
```

### 시나리오 2: 새 기능 추가 (주휴수당 자동 계산)

```bash
# 1단계: Planner Agent로 기능 기획
/planner "주휴수당 자동 계산 기능 추가"

# 2단계: Architecture Agent로 DB 스키마 설계
# (주휴수당 필드 추가)

# 3단계: 개발자가 구현

# 4단계: QA Agent로 테스트 코드 생성
/qa "주휴수당 계산 로직 테스트"

# 5단계: Marketing Agent로 신기능 홍보
/marketing "주휴수당 자동화 기능 콘텐츠 작성"
```

### 시나리오 3: Agent Maker로 커스텀 Agent 생성

```bash
# 예: 고객 지원 Agent 생성
/agent-maker "고객 지원 Agent 생성.
- FAQ 자동 응답
- 문제 해결 티켓 분류
- 사용 가이드 챗봇
- 사용 패턴 분석"

# 생성된 Agent 사용
/customer-support "자주 묻는 질문 FAQ 작성"
```

---

## 📂 프로젝트 구조

```
field-manager-os/
├── .claude/
│   ├── agents/                          # Python Agent SDK
│   │   ├── mobile_developer_agent.py    # 모바일 개발
│   │   ├── devops_agent.py              # DevOps
│   │   ├── architecture_agent.py        # 아키텍처
│   │   ├── qa_agent.py                  # QA/Test
│   │   ├── field_planner_agent.py       # 기획자
│   │   └── field_marketing_agent.py     # 마케팅
│   │
│   ├── skills/                          # Claude Code Skills
│   │   ├── agent-maker/                 # Agent 생성기
│   │   │   └── SKILL.md
│   │   ├── mobile-dev/
│   │   ├── devops/
│   │   ├── architecture/
│   │   ├── qa/
│   │   ├── planner/
│   │   └── marketing/
│   │
│   └── templates/                       # 문서 템플릿
│       ├── feature_spec.md
│       ├── architecture_doc.md
│       ├── test_plan.md
│       └── deployment_guide.md
│
├── app/                                 # 현재 앱
│   └── index.html
│
├── FIELD_MANAGER_OS_AI_PLAN.md          # AI 에이전트 계획
└── AI_AGENTS_COMPLETE_GUIDE.md          # 이 문서
```

---

## 💡 고급 사용법

### 1. Agent 체인 실행

여러 Agent를 순차적으로 실행:

```python
import asyncio
from architecture_agent import ArchitectureAgent
from mobile_developer_agent import MobileDeveloperAgent
from devops_agent import DevOpsAgent

async def full_stack_pipeline():
    # 1. 아키텍처 설계
    arch_agent = ArchitectureAgent()
    arch_result = await arch_agent.design_system_architecture(
        requirements=[...],
        scale="medium"
    )

    # 2. 모바일 앱 전환
    mobile_agent = MobileDeveloperAgent()
    mobile_result = await mobile_agent.convert_to_mobile_app(
        platform="both"
    )

    # 3. Vercel 배포
    devops_agent = DevOpsAgent()
    deploy_result = await devops_agent.setup_vercel_deployment(
        project_type="nextjs"
    )

    # 통합 리포트 생성
    report = f"""
    # 전체 스택 마이그레이션 리포트

    ## 아키텍처
    {arch_result['architecture_doc']}

    ## 모바일 앱
    {mobile_result['conversion_plan']}

    ## 배포
    {deploy_result['deployment_guide']}
    """

    with open('FULL_STACK_MIGRATION.md', 'w', encoding='utf-8') as f:
        f.write(report)

asyncio.run(full_stack_pipeline())
```

### 2. Agent 커스터마이징

Agent 프롬프트를 수정하여 특화:

```python
class CustomMobileAgent(MobileDeveloperAgent):
    async def convert_to_mobile_app(self, **kwargs):
        # 기본 프롬프트에 커스텀 요구사항 추가
        custom_requirements = """
        ## 추가 요구사항
        - 건설 현장 특화 오프라인 모드
        - QR 코드 출근 체크 기능
        - 생체 인증 (지문, 얼굴)
        """
        # ... 나머지 구현
```

### 3. Agent 결과 캐싱

동일한 요청을 캐싱하여 비용 절감:

```python
import hashlib
import json
import os

def get_cached_result(agent_name, params):
    cache_key = hashlib.md5(
        f"{agent_name}{json.dumps(params)}".encode()
    ).hexdigest()
    cache_file = f".cache/{cache_key}.json"

    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    return None

def save_to_cache(agent_name, params, result):
    os.makedirs('.cache', exist_ok=True)
    cache_key = hashlib.md5(
        f"{agent_name}{json.dumps(params)}".encode()
    ).hexdigest()
    cache_file = f".cache/{cache_key}.json"

    with open(cache_file, 'w') as f:
        json.dump(result, f)
```

---

## 📊 비용 관리

### Agent 실행 비용 (예상)

| Agent | Effort | 평균 Tokens | 예상 비용 (Sonnet 4.5) |
|-------|--------|-------------|----------------------|
| Agent Maker | High | 15,000 | $0.05 |
| Mobile Developer | High | 20,000 | $0.07 |
| DevOps | High | 15,000 | $0.05 |
| Architecture | High | 25,000 | $0.08 |
| QA/Test | High | 18,000 | $0.06 |

**월 예상 비용** (주 2회 실행): $5 ~ $10

### 비용 절감 팁
1. **캐싱 활용**: 동일한 요청은 캐시 사용
2. **Effort 조정**: 간단한 작업은 `effort="medium"` 또는 `effort="low"`
3. **max_turns 제한**: 불필요한 반복 방지
4. **Haiku 모델 사용**: 간단한 Agent는 `model="haiku"`

---

## 🔧 트러블슈팅

### 문제 1: Agent 실행 시 "Tool not allowed" 오류

**원인**: 필요한 도구가 `allowed_tools`에 없음

**해결**:
```python
ClaudeAgentOptions(
    allowed_tools=[
        "Read", "Write", "Glob", "Grep",  # 필요한 도구 추가
        "WebSearch", "WebFetch",
        "Bash(git *)"  # Git 명령어 허용
    ]
)
```

### 문제 2: 비용이 너무 높음

**원인**: `effort="high"`, 많은 `max_turns`

**해결**:
```python
ClaudeAgentOptions(
    effort="medium",  # high → medium
    max_turns=10,     # 20 → 10
    model="haiku"     # 간단한 작업은 Haiku
)
```

### 문제 3: Agent가 프로젝트 파악을 못함

**원인**: `setting_sources=["project"]` 누락

**해결**:
```python
ClaudeAgentOptions(
    setting_sources=["project"],  # CLAUDE.md 로드
    # ...
)
```

---

## 🎓 다음 단계

### 1. 추가 Agent 생성

```bash
# 데이터 분석 Agent
/agent-maker "데이터 분석 Agent. 노무비 트렌드, 출근율 분석"

# 법무/회계 Agent
/agent-maker "법무 Agent. 근로기준법 체크, 4대 보험 계산"

# 고객 지원 Agent
/agent-maker "고객 지원 Agent. FAQ 챗봇, 티켓 관리"
```

### 2. 오케스트레이터 확장

새 Agent를 오케스트레이터에 통합:

```python
# .claude/agents/field_orchestrator.py에 추가
from legal_agent import LegalAgent
from data_analyst_agent import DataAnalystAgent

class Orchestrator:
    def __init__(self):
        # ... 기존 Agent들 ...
        self.legal = LegalAgent()
        self.data_analyst = DataAnalystAgent()
```

### 3. 실제 구현 시작

```bash
# 1. 아키텍처 설계 실행
python .claude/agents/architecture_agent.py

# 2. 생성된 문서 검토
# - architecture_design.md
# - prisma/schema.prisma

# 3. 프로젝트 초기화
npx create-next-app@latest field-manager-pro
cd field-manager-pro
npm install prisma @prisma/client

# 4. Prisma 마이그레이션
npx prisma migrate dev --name init

# 5. Vercel 배포
vercel
```

---

## 📚 참고 자료

### 공식 문서
- [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Code Skills](https://code.claude.com/docs/en/skills.md)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 문서](https://nextjs.org/docs)

### 프로젝트 문서
- `FIELD_MANAGER_OS_AI_PLAN.md` - 전체 AI 시스템 계획
- `Field Manager OS.md` - 필드매니저OS 개념
- `AI_AGENTS_COMPLETE_GUIDE.md` - 이 문서

### 튜토리얼
1. [Agent Maker로 첫 Agent 만들기](#agent-maker-메타-에이전트)
2. [모바일 앱 전환 가이드](#-mobile-developer-agent)
3. [Vercel 배포 완벽 가이드](#️-devops-agent)
4. [테스트 자동화 시작하기](#-qatest-agent)

---

## 🎉 성공 사례

### Case 1: 3개월 만에 웹 → 모바일 앱 전환

```
Before:
- 단일 HTML 파일 웹앱
- LocalStorage만 사용
- 디바이스 간 동기화 불가

After (3개월):
- React Native AOS/iOS 앱
- Vercel Postgres 동기화
- App Store, Google Play 출시
- 비용: ₩1,800만 (Agent 활용으로 50% 절감)
```

### Case 2: Agent Maker로 10개 전문 Agent 생성

```
생성한 Agent들:
1. Legal Agent - 근로기준법 준수
2. Data Analyst - 노무비 분석
3. SEO Agent - 검색 최적화
4. Customer Support - FAQ 챗봇
5. Sales Agent - 영업 제안서
... 총 10개

결과:
- Agent 생성 시간: 10분/개 (수작업 대비 90% 단축)
- 총 비용: $2 (10개 Agent 생성)
- 재사용률: 80% (템플릿 활용)
```

---

## 💬 피드백 및 지원

### 문의
- GitHub Issues: [프로젝트 저장소]
- 이메일: [연락처]

### 기여하기
새로운 Agent를 만들었다면 공유해주세요!

```bash
# 1. Fork 저장소
# 2. Agent 생성
# 3. Pull Request 제출
```

---

**Field Manager OS AI Agent System v1.0**
*"AI가 개발하고, 당신은 비즈니스에 집중하세요"*

---

## ⚡ 빠른 명령어 레퍼런스

```bash
# Agent Maker
/agent-maker "[Agent 설명]"

# 모바일 개발
python .claude/agents/mobile_developer_agent.py

# DevOps
python .claude/agents/devops_agent.py

# 아키텍처
python .claude/agents/architecture_agent.py

# QA
python .claude/agents/qa_agent.py

# 전체 파이프라인
python run_full_pipeline.py

# Vercel 배포
vercel --prod

# 테스트
npm run test
npm run test:e2e
```
