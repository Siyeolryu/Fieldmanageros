# 하네스엔지니어링(Harness Engineering) 완전 가이드

> **작성일**: 2026-04-02
> **대상**: SaaS 개발자, AI 엔지니어, MLOps 실무자
> **초점**: Claude LLM 학습/평가 및 CI/CD 자동화

---

## 목차

1. [개요: 하네스엔지니어링이란?](#1-개요-하네스엔지니어링이란)
2. [Harness.io - AI 기반 CI/CD 플랫폼](#2-harnessio---ai-기반-cicd-플랫폼)
3. [LM Evaluation Harness - LLM 평가 프레임워크](#3-lm-evaluation-harness---llm-평가-프레임워크)
4. [Anthropic의 Harness Design - 자율 개발 아키텍처](#4-anthropic의-harness-design---자율-개발-아키텍처)
5. [MLOps: 머신러닝 모델 배포 파이프라인](#5-mlops-머신러닝-모델-배포-파이프라인)
6. [터미널 기반 실전 워크플로우](#6-터미널-기반-실전-워크플로우)
7. [Claude Fine-tuning과 Harness 통합](#7-claude-fine-tuning과-harness-통합)
8. [실제 사용 사례](#8-실제-사용-사례)
9. [참고 자료](#9-참고-자료)

---

## 1. 개요: 하네스엔지니어링이란?

**하네스엔지니어링(Harness Engineering)**은 소프트웨어 개발에서 '평가(Evaluation)'와 '배포(Deployment)' 프로세스를 자동화하고 체계화하는 기술 및 방법론을 의미합니다.

### 1.1 용어의 다층적 의미

| 분류 | 정의 | 주요 도구 |
|------|------|----------|
| **CI/CD 플랫폼** | 지속적 통합/배포 자동화 시스템 | Harness.io |
| **LLM 평가 프레임워크** | 언어 모델 성능 측정 도구 | EleutherAI lm-evaluation-harness |
| **자율 개발 아키텍처** | AI 에이전트가 코드를 작성하고 평가하는 시스템 | Anthropic Harness Design |
| **MLOps 인프라** | 머신러닝 모델 학습-배포 파이프라인 | Harness MLOps |

### 1.2 왜 SaaS 개발자에게 중요한가?

- **속도**: 빌드 시간 8배 단축, 테스트 사이클 80% 단축
- **품질**: AI 기반 자동 검증으로 수동 작업 85% 감소
- **비용**: 클라우드 비용 최적화 및 자원 효율성
- **확장성**: LLM 기반 SaaS의 안전한 프로덕션 배포

---

## 2. Harness.io - AI 기반 CI/CD 플랫폼

### 2.1 플랫폼 개요

[Harness.io](https://www.harness.io/)는 2026년 기준 가장 진보된 AI 네이티브 DevOps 플랫폼입니다. 기존 Jenkins, CircleCI와 달리 **LLM을 1급 시민(First-class Citizen)**으로 취급합니다.

**핵심 기능**:
- ✅ **Harness CI**: AI 기반 테스트 인텔리전스, 스마트 캐싱
- ✅ **Harness CD**: LLM/RAG 애플리케이션 안전한 점진적 배포
- ✅ **Harness Agents**: 파이프라인 단계로 실행되는 AI 에이전트

### 2.2 Harness Agents: LLM을 파이프라인에 통합

**에이전트는 LLM을 호출하는 AI 기반 파이프라인 단계**입니다. Claude, Gemini, Codex 등 다양한 모델을 지원합니다.

#### 시스템 에이전트 템플릿

```yaml
# 사용 가능한 기본 에이전트
agents:
  - Autofix: 빌드 실패 자동 수정
  - Code Coverage: 코드 커버리지 자동 증가
  - Code Review: AI 기반 코드 리뷰
  - Library Upgrades: Java/Python/React 라이브러리 자동 업그레이드
  - Vulnerability Remediation: 보안 취약점 자동 패치
  - Manifest Remediator: Kubernetes 매니페스트 자동 수정
```

#### 에이전트 실행 특징

- **컨텍스트 공유**: 파이프라인의 실행 컨텍스트, 비밀, 커넥터 공유
- **감사 가능**: 모든 액션이 로그로 기록됨
- **거버넌스**: RBAC(역할 기반 접근 제어) 범위 내에서 실행
- **통합성**: CI/CD 파이프라인의 일부로 실행

### 2.3 Architect Mode: 인텐트 기반 파이프라인 설계

엔지니어의 요구사항을 이해하고 **규정 준수 파이프라인을 자동 설계**합니다.

```bash
# 예시: "나는 Python 앱을 AWS Lambda에 배포하고 싶어"
# → Architect Mode가 자동으로 다단계 파이프라인 생성
```

### 2.4 2026년 AI 배포 기능

**LLM/RAG 애플리케이션 배포**를 위한 특화 기능:

- **시맨틱 테스팅**: 응답 품질을 의미론적으로 검증
- **가드레일**: 유해 콘텐츠/프롬프트 인젝션 방어
- **점진적 배포**: Canary, Blue-Green 롤아웃으로 위험 최소화
- **조정된 릴리스**: RAG 벡터 DB와 LLM 버전 동기화

### 2.5 성능 메트릭

| 지표 | 개선률 |
|------|--------|
| 빌드 속도 | 8배 향상 |
| 테스트 사이클 | 80% 단축 |
| 수동 작업 | 85% 감소 |
| 코드 커버리지 | 자동 증가 |

---

## 3. LM Evaluation Harness - LLM 평가 프레임워크

### 3.1 EleutherAI의 lm-evaluation-harness

[GitHub - lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)는 **언어 모델 평가의 업계 표준**입니다.

**사용처**:
- 🏆 Hugging Face Open LLM Leaderboard 백엔드
- 📚 수백 개의 연구 논문에서 인용
- 🏢 NVIDIA, Cohere, BigScience 등 내부 사용

### 3.2 핵심 기능

#### 통합 프레임워크

```bash
# 모든 인과적(causal) 언어 모델을 동일한 입력/코드베이스로 테스트
lm_eval --model hf \
    --model_args pretrained=meta-llama/Llama-2-7b-hf \
    --tasks mmlu,gsm8k,humaneval \
    --device cuda:0 \
    --batch_size 8
```

#### 지원되는 벤치마크

**60개 이상의 학술 태스크**:

| 카테고리 | 벤치마크 | 평가 내용 |
|---------|---------|----------|
| 일반 지식 | MMLU | 다학제 객관식 문제 |
| 수학 | GSM8K | 초등학교 수학 문제 |
| 코딩 | HumanEval | Python 함수 생성 |
| 추론 | HellaSwag | 상식 추론 |
| 언어 이해 | LAMBADA | 문맥 기반 단어 예측 |

### 3.3 Claude Code Skill 통합

[LM Evaluation Harness Claude Code Skill](https://mcpmarket.com/tools/skills/lm-evaluation-harness)을 통해 **터미널에서 직접 Claude 벤치마킹**이 가능합니다.

```bash
# Claude Code에서 평가 실행
/skill lm-eval \
    --model anthropic/claude-3-opus-20240229 \
    --tasks mmlu \
    --output_path ./results/
```

**지원 모델 타입**:
- HuggingFace 로컬 모델
- vLLM 서버
- API 기반 모델 (Claude, GPT-4)

### 3.4 실전 사용 사례

#### 회귀 탐지 파이프라인

```bash
# 매일 밤 새 체크포인트를 자동 평가
# → 성능 저하 즉시 감지
cron: "0 2 * * *"
script: |
  lm_eval --model ./checkpoints/latest \
          --tasks mmlu,gsm8k \
          --output_path ./eval_results/$(date +%Y%m%d)
```

#### Fine-tuning 전후 비교

```python
# Before fine-tuning
results_before = evaluate_model("base_model", tasks=["mmlu"])

# After fine-tuning
results_after = evaluate_model("finetuned_model", tasks=["mmlu"])

# Delta calculation
accuracy_gain = results_after["mmlu"] - results_before["mmlu"]
print(f"Accuracy improvement: {accuracy_gain:.2%}")
```

---

## 4. Anthropic의 Harness Design - 자율 개발 아키텍처

### 4.1 배경: AI가 AI를 평가한다

2026년, Anthropic 연구원 **Prithvi Rajasekaran**이 개발한 [3-에이전트 하네스 아키텍처](https://www.vktr.com/ai-news/anthropic-harness-design/)는 **AI가 풀스택 소프트웨어를 자율적으로 개발하고 테스트**할 수 있음을 입증했습니다.

### 4.2 3-에이전트 아키텍처

```
┌──────────────┐
│  1. Planner  │  요구사항 분석 → 구현 계획 수립
└──────┬───────┘
       │
       v
┌──────────────┐
│ 2. Generator │  구조화된 스프린트로 코드 작성
└──────┬───────┘
       │
       v
┌──────────────┐
│ 3. Evaluator │  Playwright로 자동 QA 테스트
└──────────────┘
```

#### 각 에이전트의 역할

| 에이전트 | 기능 | 도구 |
|---------|------|------|
| **Planner** | 태스크 분해, 아키텍처 설계 | Claude API |
| **Generator** | 코드 작성, 파일 생성 | Claude Code |
| **Evaluator** | 브라우저 자동화 테스트, API 엔드포인트 검증, DB 상태 확인 | Playwright |

### 4.3 실제 성능

- **다중 시간 코딩 세션**: 실제 버그를 잡아내며 수 시간 동안 자율 작업
- **인간 수준 초과**: 2시간 내에 특정 태스크에서 인간 개발자 능력 초과
- **Test-Time Compute**: 더 많은 시간을 줄수록 성능이 계속 향상

### 4.4 내부 Test-Time Compute Harness

Anthropic 내부의 **엄격한 테스트 하네스**:

```python
# 개념적 예시 (실제 코드는 비공개)
harness = AnthropicTestHarness(
    model="claude-opus-4.5",
    time_budget_hours=8,
    evaluation_tasks=["webapp_qa", "api_integration", "db_consistency"]
)

results = harness.run_long_context_eval()
# → 시간이 증가할수록 성능 곡선이 계속 상승
```

---

## 5. MLOps: 머신러닝 모델 배포 파이프라인

### 5.1 Harness MLOps 개요

[Harness MLOps](https://developer.harness.io/docs/continuous-integration/development-guides/mlops/mlops-overview/)는 **데이터 엔지니어링부터 모델 거버넌스까지** 전체 ML 라이프사이클을 커버합니다.

### 5.2 End-to-End MLOps 파이프라인

[AWS 기반 E2E MLOps 튜토리얼](https://developer.harness.io/docs/continuous-integration/development-guides/mlops/e2e-mlops-tutorial/) 예시:

```yaml
# pipeline.yaml
name: ML Model CI/CD
stages:
  - stage:
      name: Train Model
      steps:
        - step:
            type: Run
            name: Train with SageMaker
            spec:
              connectorRef: aws_connector
              image: python:3.9
              command: |
                python train.py --data s3://bucket/data
                aws s3 cp model.pkl s3://bucket/models/

  - stage:
      name: Evaluate Model
      steps:
        - step:
            type: Run
            name: Calculate Metrics
            spec:
              command: |
                python evaluate.py --model model.pkl
                # accuracy, fairness 점수 계산

  - stage:
      name: Policy Gate
      steps:
        - step:
            type: Policy
            name: OPA Policy Check
            spec:
              policySets:
                - model_quality_gate
              # accuracy < 0.85 이면 배포 거부

  - stage:
      name: Deploy Model
      steps:
        - step:
            type: K8sRollingDeploy
            name: Deploy to EKS
            spec:
              manifests:
                - model-serving-deployment.yaml
```

### 5.3 지원 프레임워크 및 도구

**학습 플랫폼**:
- AWS SageMaker
- Google Vertex AI
- Azure ML
- Harness 자체 학습 환경

**ML 프레임워크**:
- TensorFlow, PyTorch
- scikit-learn, Keras
- XGBoost, LightGBM

**데이터 과학 도구**:
- Jupyter Notebook
- Pandas, NumPy
- Matplotlib, Seaborn

### 5.4 AI 기반 자동 검증

**배포 후 이상 탐지**:

```yaml
# Harness는 정상 행동을 학습하고 이상을 플래그
verification:
  type: AI_Powered
  provider: Harness
  auto_rollback: true
  sensitivity: medium

  metrics:
    - prediction_latency
    - model_accuracy
    - request_rate
```

**결과**: 프로덕션 배포 검증에서 **수동 노력 85% 감소**

---

## 6. 터미널 기반 실전 워크플로우

### 6.1 Harness CLI 설정

```bash
# Harness CLI 설치
curl -LO https://github.com/harness/harness-cli/releases/latest/download/harness-cli-linux-amd64
chmod +x harness-cli-linux-amd64
sudo mv harness-cli-linux-amd64 /usr/local/bin/harness

# 인증
harness login --api-key YOUR_API_KEY --account YOUR_ACCOUNT_ID

# 계정 정보 확인
harness account get
```

### 6.2 LM Evaluation Harness 설치 및 실행

```bash
# 설치
git clone https://github.com/EleutherAI/lm-evaluation-harness
cd lm-evaluation-harness
pip install -e .

# 로컬 모델 평가
lm_eval --model hf \
    --model_args pretrained=meta-llama/Llama-3.1-8B \
    --tasks mmlu,gsm8k \
    --device cuda:0 \
    --batch_size 16 \
    --output_path ./results/llama3_baseline

# API 기반 모델 평가 (Claude)
export ANTHROPIC_API_KEY="sk-ant-..."

lm_eval --model anthropic \
    --model_args model=claude-3-opus-20240229 \
    --tasks mmlu,humaneval \
    --output_path ./results/claude_opus
```

### 6.3 Claude Fine-tuning 워크플로우 (AWS Bedrock)

```bash
# 1. 학습 데이터 준비 (JSONL 형식)
cat > training_data.jsonl << EOF
{"prompt": "건설 공정 관리에서 CPM이란?", "completion": "Critical Path Method의 약자로..."}
{"prompt": "공정표 작성 시 고려사항은?", "completion": "작업 순서, 소요 기간, 자원 배분..."}
EOF

# 2. S3에 업로드
aws s3 cp training_data.jsonl s3://my-bucket/finetune/data/

# 3. Fine-tuning 작업 생성 (AWS Bedrock)
aws bedrock create-model-customization-job \
    --job-name "construction-mgmt-claude" \
    --custom-model-name "claude-construction-v1" \
    --base-model-identifier "anthropic.claude-3-haiku-20240307-v1:0" \
    --training-data-config '{"s3Uri": "s3://my-bucket/finetune/data/training_data.jsonl"}' \
    --output-data-config '{"s3Uri": "s3://my-bucket/finetune/output/"}' \
    --hyper-parameters '{"epochCount": "3", "batchSize": "8", "learningRateMultiplier": "1.0"}'

# 4. 작업 상태 모니터링
aws bedrock get-model-customization-job --job-identifier "construction-mgmt-claude"

# 5. 평가
lm_eval --model bedrock \
    --model_args model_id=claude-construction-v1 \
    --tasks custom_construction_eval
```

### 6.4 Harness 파이프라인 자동 트리거

```bash
# Git push 시 자동 평가 파이프라인 실행
cat > .github/workflows/eval.yml << EOF
name: Model Evaluation
on:
  push:
    branches: [main]
    paths: ['models/**']

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Harness Pipeline
        run: |
          harness pipeline execute \
            --org default \
            --project ml-evals \
            --pipeline model-eval-pipeline \
            --input model_path=models/latest
EOF
```

---

## 7. Claude Fine-tuning과 Harness 통합

### 7.1 Fine-tuning 현황 (2026년 기준)

**사용 가능**:
- ✅ Claude 3 Haiku (AWS Bedrock에서만)
- ✅ 텍스트 기반 fine-tuning, 32K 컨텍스트 지원

**제한 사항**:
- ❌ Claude Opus, Sonnet은 일반 사용자에게 fine-tuning 미제공
- ❌ Anthropic 네이티브 API를 통한 직접 fine-tuning 불가
- 🔄 비전 기능은 향후 추가 예정

### 7.2 Fine-tuning 성능 사례

**분류 정확도 개선**:
- Before: 81.5%
- After: **99.6%** (18% 향상)
- 토큰 사용량: **85% 감소**

**SK Telecom 사례**:
- 긍정 피드백: **73% 증가**
- KPI: **37% 개선**
- 도메인: 통신 관련 태스크

### 7.3 통합 아키텍처 예시

```mermaid
데이터 준비 → AWS S3
    ↓
Bedrock Fine-tune Job
    ↓
커스텀 Claude 모델
    ↓
LM Evaluation Harness
    ↓
Harness CD 파이프라인 → 프로덕션 배포
```

**Python 스크립트**:

```python
# comprehensive_pipeline.py
import boto3
import subprocess
import json

class ClaudeFinetunePipeline:
    def __init__(self, model_name, data_path):
        self.bedrock = boto3.client('bedrock')
        self.model_name = model_name
        self.data_path = data_path

    def upload_data(self):
        """S3에 학습 데이터 업로드"""
        s3 = boto3.client('s3')
        s3.upload_file(self.data_path, 'my-bucket', f'finetune/{self.model_name}/data.jsonl')

    def start_finetuning(self):
        """Fine-tuning 작업 시작"""
        response = self.bedrock.create_model_customization_job(
            jobName=f"{self.model_name}-job",
            customModelName=self.model_name,
            baseModelIdentifier="anthropic.claude-3-haiku-20240307-v1:0",
            trainingDataConfig={'s3Uri': f's3://my-bucket/finetune/{self.model_name}/data.jsonl'},
            outputDataConfig={'s3Uri': f's3://my-bucket/finetune/{self.model_name}/output/'}
        )
        return response['jobArn']

    def wait_for_completion(self, job_arn):
        """작업 완료 대기"""
        waiter = self.bedrock.get_waiter('model_customization_job_complete')
        waiter.wait(jobIdentifier=job_arn)

    def evaluate_model(self):
        """LM Evaluation Harness로 평가"""
        result = subprocess.run([
            'lm_eval',
            '--model', 'bedrock',
            '--model_args', f'model_id={self.model_name}',
            '--tasks', 'mmlu,gsm8k',
            '--output_path', f'./results/{self.model_name}'
        ], capture_output=True, text=True)

        with open(f'./results/{self.model_name}/results.json') as f:
            return json.load(f)

    def deploy_to_production(self, eval_results):
        """Harness CD로 배포"""
        if eval_results['mmlu']['acc'] > 0.85:
            subprocess.run([
                'harness', 'pipeline', 'execute',
                '--pipeline', 'claude-deployment',
                '--input', f'model_id={self.model_name}'
            ])
            return True
        return False

# 실행
pipeline = ClaudeFinetunePipeline('construction-assistant-v2', './data/training.jsonl')
pipeline.upload_data()
job_arn = pipeline.start_finetuning()
pipeline.wait_for_completion(job_arn)
results = pipeline.evaluate_model()
deployed = pipeline.deploy_to_production(results)

print(f"Deployment success: {deployed}")
```

---

## 8. 실제 사용 사례

### 8.1 건설 관리 SaaS용 도메인 특화 Claude

**시나리오**: 건설 공정 관리 전문가가 자신의 지식을 Claude에 학습시켜 SaaS 제품 개발

**워크플로우**:

```bash
# 1. 도메인 데이터 수집
# - 과거 프로젝트 보고서
# - 공정표 샘플
# - 문제 해결 사례

# 2. JSONL 변환
python convert_to_jsonl.py --input ./construction_docs/ --output training.jsonl

# 3. Fine-tune
aws bedrock create-model-customization-job \
    --custom-model-name "construction-pm-assistant" \
    --training-data-config '{"s3Uri": "s3://my-bucket/construction-data.jsonl"}'

# 4. 평가
lm_eval --model bedrock --model_args model_id=construction-pm-assistant \
    --tasks custom_construction_eval

# 5. Harness CD로 배포
harness pipeline execute --pipeline construction-saas-deploy
```

### 8.2 연구팀의 모델 회귀 탐지

**시나리오**: AI 연구팀이 매일 밤 새 체크포인트를 벤치마크하여 성능 저하 탐지

```bash
# cron 작업 (매일 새벽 2시)
0 2 * * * /home/researcher/eval_nightly.sh

# eval_nightly.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
CHECKPOINT="/models/checkpoints/checkpoint-$DATE"

lm_eval --model hf \
    --model_args pretrained=$CHECKPOINT \
    --tasks mmlu,gsm8k,humaneval \
    --output_path ./results/$DATE

# 이전 날짜와 비교
python compare_results.py --current ./results/$DATE --baseline ./results/baseline

# 회귀 발견 시 Slack 알림
if [ $? -ne 0 ]; then
    curl -X POST https://slack.com/api/chat.postMessage \
        -d "text=⚠️ 모델 회귀 탐지: $DATE" \
        -H "Authorization: Bearer $SLACK_TOKEN"
fi
```

### 8.3 RAG 애플리케이션의 CI/CD

**시나리오**: LLM + RAG 기반 고객 지원 챗봇 배포

```yaml
# harness-rag-pipeline.yaml
pipeline:
  name: RAG Chatbot Deployment
  stages:
    - stage:
        name: Vector DB Update
        steps:
          - step:
              type: Run
              name: Embed New Documents
              spec:
                command: python embed_docs.py --db pinecone

    - stage:
        name: Semantic Testing
        steps:
          - step:
              type: Run
              name: Test Response Quality
              spec:
                command: python test_rag_quality.py
                assertions:
                  - semantic_similarity > 0.9
                  - hallucination_rate < 0.05

    - stage:
        name: Guardrail Check
        steps:
          - step:
              type: SecurityScan
              name: Prompt Injection Test
              spec:
                tool: guardrails_ai

    - stage:
        name: Progressive Rollout
        steps:
          - step:
              type: CanaryDeploy
              name: 10% Traffic
              spec:
                percentage: 10
                duration: 1h
                rollback_on_error: true
```

---

## 9. 참고 자료

### 9.1 공식 문서

- [Harness.io Developer Hub](https://developer.harness.io/)
- [LM Evaluation Harness GitHub](https://github.com/EleutherAI/lm-evaluation-harness)
- [Claude API Docs - Test and Evaluate](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [AWS Bedrock - Fine-tune Claude](https://www.anthropic.com/news/fine-tune-claude-3-haiku)

### 9.2 주요 블로그 및 논문

- [AI Deployment in 2026: CI/CD for LLMs & Agents](https://www.harness.io/blog/ai-deployment-in-production-orchestrate-llms-rag-agents)
- [Agentic Harness Engineering: LLMs as the New OS](https://www.decodingai.com/p/agentic-harness-engineering)
- [How Anthropic Taught Claude to Build Full Apps](https://www.vktr.com/ai-news/anthropic-harness-design/)
- [LLM Readiness Harness: Evaluation, Observability, and CI Gates](https://arxiv.org/html/2603.27355)
- [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)

### 9.3 튜토리얼 및 가이드

- [End-to-end MLOps CI/CD with Harness and AWS](https://developer.harness.io/docs/continuous-integration/development-guides/mlops/e2e-mlops-tutorial/)
- [Best practices for fine-tuning Claude 3 Haiku on Bedrock](https://aws.amazon.com/blogs/machine-learning/best-practices-and-lessons-for-fine-tuning-anthropics-claude-3-haiku-on-amazon-bedrock/)
- [Evaluating LLM Accuracy with lm-evaluation-harness](https://medium.com/@kimdoil1211/evaluating-llm-accuracy-with-lm-evaluation-harness-for-local-server-a-comprehensive-guide-933df1361d1d)

### 9.4 커뮤니티 및 지원

- **Harness Community**: [community.harness.io](https://community.harness.io)
- **EleutherAI Discord**: LM Evaluation Harness 관련 질문
- **Anthropic Discord**: Claude API 및 fine-tuning 지원
- **GitHub Issues**: 각 프로젝트의 이슈 트래커

---

## 부록: 용어 사전

| 용어 | 설명 |
|------|------|
| **CI/CD** | Continuous Integration/Continuous Deployment - 지속적 통합/배포 |
| **MLOps** | Machine Learning Operations - ML 모델의 운영 자동화 |
| **RAG** | Retrieval-Augmented Generation - 검색 증강 생성 |
| **Fine-tuning** | 사전 학습된 모델을 특정 도메인에 맞게 추가 학습 |
| **Evaluation Harness** | 모델 성능을 체계적으로 평가하는 프레임워크 |
| **Test-Time Compute** | 추론 시 더 많은 계산 자원을 투입하여 성능 향상 |
| **Canary Deployment** | 일부 트래픽만 새 버전으로 보내는 점진적 배포 |
| **RBAC** | Role-Based Access Control - 역할 기반 접근 제어 |
| **OPA** | Open Policy Agent - 정책 기반 의사결정 엔진 |
| **vLLM** | 고성능 LLM 추론 서버 |

---

## 마무리

하네스엔지니어링은 **LLM 시대의 필수 인프라**입니다. 단순히 코드를 배포하는 것을 넘어, **AI를 평가하고, AI로 개발하고, AI를 안전하게 프로덕션에 배포**하는 전체 라이프사이클을 다룹니다.

**다음 단계**:
1. Harness.io 무료 계정 생성 및 샘플 파이프라인 실행
2. lm-evaluation-harness 설치 및 로컬 모델 벤치마크
3. AWS Bedrock에서 Claude Haiku fine-tuning 실험
4. 자신의 도메인 데이터로 커스텀 평가 태스크 작성

**질문이나 문제가 있을 경우**:
- GitHub Issues 생성
- Harness Community 포럼 참여
- Anthropic Discord에서 Claude 전문가와 대화

---

**Sources**:
- [AI Deployment in 2026: CI/CD for LLMs & Agents](https://www.harness.io/blog/ai-deployment-in-production-orchestrate-llms-rag-agents)
- [Overview of Harness AI](https://developer.harness.io/docs/platform/harness-ai/overview/)
- [Harness Agents Documentation](https://developer.harness.io/docs/platform/harness-ai/harness-agents/)
- [Agentic Harness Engineering: LLMs as the New OS](https://www.decodingai.com/p/agentic-harness-engineering)
- [GitHub - EleutherAI/lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness)
- [LM Evaluation Harness Claude Code Skill](https://mcpmarket.com/tools/skills/lm-evaluation-harness)
- [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [How Anthropic Taught Claude to Build Full Apps](https://www.vktr.com/ai-news/anthropic-harness-design/)
- [Claude fine-tuning: a complete guide](https://pieces.app/blog/claude-fine-tuning)
- [Fine-tune Claude 3 Haiku in Amazon Bedrock](https://www.anthropic.com/news/fine-tune-claude-3-haiku)
- [Tutorial - End-to-end MLOps CI/CD with Harness and AWS](https://developer.harness.io/docs/continuous-integration/development-guides/mlops/e2e-mlops-tutorial/)
- [MLOps with Harness Overview](https://developer.harness.io/docs/continuous-integration/development-guides/mlops/mlops-overview/)
