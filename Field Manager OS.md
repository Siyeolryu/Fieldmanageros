# Field Manager OS - 노무Pro

## 개요

**Field Manager OS**는 노무Pro 프로젝트의 통합 운영 시스템입니다. AI 에이전트들이 협업하여 건설 현장 인건비 관리 기능 개발, 마케팅, 운영을 자동화합니다.

**프로젝트**: 노무Pro - 건설 현장 인건비 신고 & 소득 관리 자동화 플랫폼

## 핵심 구성 요소

### 1. 기획자 Agent (Planner Agent)
**역할**: 건설 현장 관리 시스템 기능 설계 및 법규 준수

**주요 기능**:
- 건설 현장 관리 요구사항 분석
- 노무비 정산 기능 우선순위 결정
- 근로기준법 준수 기술 스펙 작성
- 현장 관리자 UX/UI 개선 제안
- 출근 기록 및 급여 데이터베이스 스키마 설계
- 4대 보험 계산 로직 설계
- 주휴수당 자동 계산 기능 기획

**사용 도구**:
- Read, Glob, Grep (코드베이스 분석)
- Edit, Write (기획서 작성)
- WebSearch (근로기준법, 건설 업계 조사)
- AskUserQuestion (현장 관리자 요구사항 확인)

### 2. 마케팅 Agent (Marketing Agent)
**역할**: B2B 영업 전략 및 건설사 타겟 마케팅

**주요 기능**:
- 건설사/협력업체 타겟 마케팅 콘텐츠 작성
- 현장 관리자 페르소나 분석
- 도입 제안서 작성 (ROI 산출)
- 건설 업계 블로그 콘텐츠 제작
- 경쟁사 분석 (타 현장 관리 솔루션)
- B2B 영업 캠페인 기획

**사용 도구**:
- Read, Write (제안서, 콘텐츠 작성)
- WebSearch, WebFetch (건설 업계 시장 조사)
- Grep (기존 마케팅 자료 분석)
- AskUserQuestion (타겟 고객 확인)

### 3. 오케스트레이터 Skill
**역할**: 에이전트 간 협업 조율 및 건설 현장 특화 워크플로우 관리

**주요 기능**:
- 작업 우선순위 결정
- 에이전트 간 정보 공유
- 건설 현장 도메인 특화 워크플로우 자동화
- 진행상황 추적
- 결과 통합 리포트

## 워크플로우 예시

### 신규 기능 개발 워크플로우
```
1. 사용자 요청: "주휴수당 자동 계산 기능 추가"
   ↓
2. 오케스트레이터 → 기획자 Agent 호출
   - 근로기준법 조사 (주 15시간 이상 근무 시 발생)
   - 계산 로직 설계 (1주 근무시간 ÷ 5 × 시급)
   - UX 설계 (달력에 "주휴" 자동 표시)
   - 4대 보험 연동 구현 계획
   ↓
3. 오케스트레이터 → 마케팅 Agent 호출
   - "주휴수당 계산, 이제 자동입니다" 메시지
   - 네이버 블로그 콘텐츠 기획
   - 기존 고객 신기능 소개 이메일
   ↓
4. 오케스트레이터 → 결과 통합
   - 개발 로드맵 + 마케팅 계획 생성
   - 법규 준수 체크리스트 제공
```

### B2B 영업 전략 워크플로우
```
1. 사용자 요청: "대형 건설사 영업 전략"
   ↓
2. 오케스트레이터 → 마케팅 Agent 호출
   - 타겟 건설사 리스트 분석
   - 도입 제안서 작성 (노무비 절감 ROI)
   - 현장별 데모 계획
   ↓
3. 오케스트레이터 → 기획자 Agent 호출
   - 대형 현장 특화 기능 기획
   - 다중 현장 통합 관리 기능
   - 본사-현장 실시간 연동 설계
   ↓
4. 오케스트레이터 → 실행 계획 생성
   - 제품 로드맵 + 영업 전략 통합
```

### 사용자 피드백 대응 워크플로우
```
1. 사용자 요청: "엑셀 업로드가 어렵다는 피드백"
   ↓
2. 오케스트레이터 → 기획자 Agent 호출
   - UX 개선안 (드래그앤드롭, 템플릿 제공)
   - 에러 메시지 개선
   - 샘플 파일 제공 기능
   ↓
3. 오케스트레이터 → 마케팅 Agent 호출
   - 사용 가이드 영상 스크립트
   - FAQ 업데이트
   ↓
4. 오케스트레이터 → 결과 통합
   - UX 개선 계획 + 교육 자료
```

## 디렉토리 구조

```
.claude/
├── skills/
│   ├── field-orchestrator/        # 오케스트레이터 Skill
│   │   ├── SKILL.md
│   │   └── workflows.json
│   ├── field-planner/             # 기획자 Agent 래퍼
│   │   └── SKILL.md
│   └── field-marketing/           # 마케팅 Agent 래퍼
│       └── SKILL.md
├── agents/
│   ├── architecture_agent.py      # 아키텍처 Agent
│   ├── qa_agent.py                # QA/테스트 Agent
│   ├── mobile_developer_agent.py  # 모바일 개발 Agent
│   ├── devops_agent.py            # DevOps Agent
│   ├── supabase_database_agent.py # Supabase DB Agent
│   ├── field_planner_agent.py     # 기획자 Agent (향후)
│   ├── field_marketing_agent.py   # 마케팅 Agent (향후)
│   └── field_orchestrator.py      # 오케스트레이터 실행기 (향후)
└── templates/
    ├── feature_spec.md            # 기능 스펙 템플릿
    ├── ux_improvement.md          # UX 개선안 템플릿
    ├── sales_proposal.md          # 영업 제안서 템플릿
    └── content_brief.md           # 콘텐츠 브리프 템플릿
```

## 사용 방법

### CLI에서 직접 호출 (향후 구현)
```bash
# 오케스트레이터로 통합 작업
/field-orchestrate "주휴수당 자동 계산 기능 추가 및 홍보"

# 기획자만 호출
/field-planner "근로자 출근율 대시보드 설계"

# 마케팅만 호출
/field-marketing "중소 건설사 대상 도입 제안서"
```

### Python SDK로 프로그래밍 방식 (향후 구현)
```python
from claude_agent_sdk import query
from agents.field_orchestrator import run_orchestrator

# 오케스트레이터 실행
result = await run_orchestrator(
    task="주휴수당 자동 계산 기능 추가",
    agents=["planner", "marketing"]
)
```

## 확장 계획

### Phase 1 (현재)
- ✅ Architecture Agent 구현
- ✅ QA Agent 구현
- ✅ Mobile Developer Agent 구현
- ✅ DevOps Agent 구현
- ✅ Supabase Database Agent 구현
- 📋 기획자 Agent 구현 (향후)
- 📋 마케팅 Agent 구현 (향후)
- 📋 오케스트레이터 Skill 구현 (향후)

### Phase 2 (향후)
- 🔄 법무/회계 Agent (근로기준법 체크, 4대 보험 계산)
- 🔄 데이터 분석 Agent (노무비 트렌드, 출근율 패턴)
- 🔄 개발자 Agent (코드 자동 생성)

### Phase 3 (미래)
- 📋 고객 지원 Agent (현장 관리자 FAQ 챗봇)
- 📋 재무 분석 Agent (비용 절감 인사이트)
- 📋 법무 Agent (계약서, 라이선스)

## 통합 원칙

1. **모듈성**: 각 에이전트는 독립적으로 실행 가능
2. **재사용성**: 템플릿과 프롬프트는 재사용 가능하게 설계
3. **확장성**: 새 에이전트 추가 시 기존 시스템 수정 최소화
4. **투명성**: 모든 에이전트 작업은 로깅 및 추적 가능
5. **안전성**: 중요 작업은 사용자 승인 필요
6. **법규 준수**: 근로기준법, 개인정보보호법 자동 체크

## 성공 지표

- **개발 속도**: 신규 기능 기획→출시 시간 50% 단축
- **마케팅 효율**: 제안서 작성 시간 75% 단축
- **품질**: 기획 문서 완성도 평균 90% 이상
- **법규 준수**: 법규 위반 리스크 95% 감소
- **협업**: 에이전트 간 정보 전달 오류율 5% 이하

## 보안 및 주의사항

### 민감 정보 처리
- 근로자 개인정보는 Agent가 직접 접근하지 않음
- 샘플 데이터로 테스트
- 실제 노임대장 파일은 로컬에서만 처리

### AI 활용 원칙
- AI 생성 콘텐츠는 반드시 사람이 검토
- 법률/회계 내용은 전문가 확인 필수
- 고객 데이터는 외부 AI API로 전송 금지
