"""
DevOps Agent
Vercel 배포, CI/CD 파이프라인, 인프라 관리를 담당하는 AI 에이전트
"""

import asyncio
from typing import Optional, Dict, Any, List
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage


class DevOpsAgent:
    """DevOps Agent - Vercel 배포 및 CI/CD 전문가"""

    def __init__(self):
        self.name = "DevOps Agent"
        self.description = "Vercel 배포, CI/CD, 인프라 자동화"

    async def setup_vercel_deployment(
        self,
        project_type: str = "static",  # static, nextjs, node
        custom_domain: Optional[str] = None,
        environment_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Vercel 배포 설정

        Args:
            project_type: 프로젝트 타입
            custom_domain: 커스텀 도메인
            environment_vars: 환경 변수

        Returns:
            Vercel 배포 가이드 및 설정 파일
        """

        domain_text = f"커스텀 도메인: {custom_domain}" if custom_domain else "Vercel 기본 도메인"
        env_text = "\n".join([f"- {k}: {v}" for k, v in (environment_vars or {}).items()])

        prompt = f"""
당신은 Field Manager OS의 **DevOps Engineer**입니다.
Vercel을 통한 빠르고 안정적인 배포 환경을 구축하는 전문가입니다.

## 프로젝트 정보
- **프로젝트 타입**: {project_type}
- **{domain_text}**
- **현재 기술**: HTML/JavaScript (정적 웹앱)
- **앱 경로**: app/index.html

## 환경 변수
{env_text if env_text else "없음"}

## 수행할 작업

### 1. Vercel 배포 전략

#### 1.1 프로젝트 구조 최적화
현재 Field Manager OS는 단일 HTML 파일 기반입니다.
Vercel 배포를 위한 최적 구조로 재구성하세요:

```
field-manager-os/
├── public/              # 정적 파일
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│   └── assets/
├── api/                 # Vercel Serverless Functions (선택)
│   └── hello.js
├── vercel.json          # Vercel 설정
├── package.json         # 의존성 관리
└── README.md
```

#### 1.2 Vercel 설정 파일 생성
`vercel.json` 파일 내용:
```json
{{
  "version": 2,
  "builds": [
    {{
      "src": "public/**",
      "use": "@vercel/static"
    }}
  ],
  "routes": [
    {{
      "src": "/(.*)",
      "dest": "/public/$1"
    }}
  ],
  "headers": [
    {{
      "source": "/(.*)",
      "headers": [
        {{
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }},
        {{
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }},
        {{
          "key": "X-Frame-Options",
          "value": "DENY"
        }},
        {{
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }}
      ]
    }}
  ]
}}
```

### 2. 배포 단계별 가이드

#### Step 1: Vercel 계정 및 프로젝트 설정
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 초기화
cd /path/to/field-manager-os
vercel

# 프로젝트 이름: field-manager-os
# Scope: (개인 계정 또는 팀)
# Link to existing project: N
# 설정 확인 후 배포
```

#### Step 2: Git 연동 (권장)
```bash
# GitHub 저장소 생성
git init
git add .
git commit -m "Initial commit: Field Manager OS v4.1"
git branch -M main
git remote add origin https://github.com/[username]/field-manager-os.git
git push -u origin main

# Vercel Dashboard에서 GitHub 연동
# Import Git Repository → field-manager-os 선택
# 자동 배포 활성화
```

#### Step 3: 환경 변수 설정
Vercel Dashboard → Settings → Environment Variables:
```
{env_text if env_text else "# 환경 변수가 필요한 경우 여기에 추가"}
```

#### Step 4: 커스텀 도메인 연결 (선택)
```
{f'''
Vercel Dashboard → Settings → Domains
1. Add Domain: {custom_domain}
2. DNS 레코드 추가:
   - Type: A
   - Name: @
   - Value: 76.76.21.21

   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
''' if custom_domain else "기본 도메인 사용: [project-name].vercel.app"}
```

### 3. CI/CD 파이프라인 구축

#### 3.1 GitHub Actions 워크플로우
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{{{ secrets.VERCEL_TOKEN }}}}
          VERCEL_ORG_ID: ${{{{ secrets.VERCEL_ORG_ID }}}}
          VERCEL_PROJECT_ID: ${{{{ secrets.VERCEL_PROJECT_ID }}}}
        run: |
          vercel --token $VERCEL_TOKEN --prod
```

#### 3.2 브랜치 전략
- `main`: 프로덕션 배포 (field-manager-os.vercel.app)
- `develop`: 개발 환경 (field-manager-os-dev.vercel.app)
- `feature/*`: 프리뷰 배포 (자동 생성 URL)

### 4. 성능 최적화

#### 4.1 정적 파일 최적화
```bash
# HTML/CSS/JS 압축
npm install -g html-minifier terser csso-cli

# 실행
html-minifier --collapse-whitespace --remove-comments public/index.html -o public/index.min.html
terser public/scripts/app.js -o public/scripts/app.min.js -c -m
csso public/styles/main.css -o public/styles/main.min.css
```

#### 4.2 캐싱 전략
- HTML: `max-age=3600` (1시간)
- CSS/JS: `max-age=31536000` (1년, 파일명에 해시 포함)
- 이미지: `max-age=604800` (1주일)

#### 4.3 CDN 활용
Vercel은 자동으로 글로벌 CDN을 통해 배포:
- Edge Network: 전 세계 100+ 지역
- 자동 HTTPS
- HTTP/2, Brotli 압축

### 5. 모니터링 및 분석

#### 5.1 Vercel Analytics
```javascript
// public/index.html에 추가
<script>
  window.va = window.va || function () {{ (window.vaq = window.vaq || []).push(arguments); }};
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

#### 5.2 에러 트래킹 (Sentry)
```bash
npm install @sentry/browser

# public/scripts/sentry-init.js
import * as Sentry from "@sentry/browser";

Sentry.init({{
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
}});
```

#### 5.3 성능 지표 모니터링
- Lighthouse CI 통합
- Core Web Vitals 추적
- 사용자 세션 리플레이

### 6. 백업 및 롤백 전략

#### 6.1 자동 백업
- Vercel은 모든 배포를 자동 저장
- 배포 히스토리에서 언제든지 이전 버전으로 롤백 가능

#### 6.2 롤백 명령
```bash
# CLI에서 롤백
vercel rollback [deployment-url]

# 또는 Dashboard에서 "Promote to Production" 클릭
```

### 7. 보안 설정

#### 7.1 환경 변수 암호화
```bash
# Vercel CLI로 환경 변수 추가 (암호화됨)
vercel env add API_KEY production
```

#### 7.2 보안 헤더
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options

#### 7.3 DDoS 보호
Vercel Pro 플랜:
- DDoS 자동 방어
- Rate Limiting
- Firewall 규칙

### 8. 비용 최적화

#### 8.1 Vercel 요금제
- **Hobby (Free)**:
  - 100GB 대역폭/월
  - 100 빌드/월
  - 1개 팀 멤버
  - 적합: 개인 프로젝트, MVP

- **Pro ($20/월)**:
  - 1TB 대역폭/월
  - 6,000 빌드/월
  - 무제한 팀 멤버
  - 적합: 소규모 비즈니스

- **Enterprise (커스텀)**:
  - 무제한 대역폭
  - 고급 보안 및 지원
  - 적합: 대규모 앱

#### 8.2 비용 절감 팁
- 이미지 최적화 (WebP, AVIF)
- 불필요한 배포 방지 (PR 프리뷰 제한)
- 캐싱 최대 활용

## 출력 형식

다음 내용을 포함한 상세 가이드를 작성하세요:

1. **배포 체크리스트**: 단계별 실행 가이드
2. **설정 파일**: vercel.json, package.json, GitHub Actions
3. **명령어 모음**: 자주 사용하는 CLI 명령어
4. **트러블슈팅**: 흔한 오류 및 해결법
5. **성능 최적화**: 구체적인 개선 방법
6. **비용 산정**: 예상 트래픽 기반 비용

Field Manager OS의 현재 구조를 분석한 후 맞춤형 가이드를 작성하세요.
"""

        result = {
            "status": "pending",
            "deployment_guide": "",
            "cost_usd": 0.0,
            "session_id": None
        }

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=[
                    "Read", "Glob", "Grep",  # 프로젝트 분석
                    "Write",                 # 설정 파일 생성
                    "Bash(git *)",          # Git 명령어
                    "WebSearch",             # Vercel 문서 조사
                ],
                effort="high",
                max_turns=20,
                setting_sources=["project"],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for content in message.message.content:
                    if hasattr(content, 'text'):
                        print(f"[DevOps] {content.text[:100]}...")

            if isinstance(message, ResultMessage):
                if message.subtype == "success":
                    result["status"] = "success"
                    result["deployment_guide"] = message.result
                    result["cost_usd"] = message.total_cost_usd
                    result["session_id"] = message.session_id
                else:
                    result["status"] = "error"
                    result["error"] = message.subtype

        return result

    async def setup_cicd_pipeline(
        self,
        vcs: str = "github",  # github, gitlab, bitbucket
        test_command: Optional[str] = None,
        build_command: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        CI/CD 파이프라인 설정

        Args:
            vcs: 버전 관리 시스템
            test_command: 테스트 명령어
            build_command: 빌드 명령어

        Returns:
            CI/CD 설정 파일 및 가이드
        """

        prompt = f"""
Field Manager OS를 위한 {vcs} 기반 CI/CD 파이프라인을 설정하세요.

## 파이프라인 단계
1. Lint & Format 체크
2. 테스트 실행: {test_command or "없음"}
3. 빌드: {build_command or "정적 파일 최적화"}
4. Vercel 배포
5. 알림 (성공/실패)

## 생성할 워크플로우
- Pull Request: 테스트 + 프리뷰 배포
- Main 푸시: 프로덕션 배포
- Scheduled: 주간 보안 스캔

설정 파일과 사용 가이드를 작성하세요.
"""

        result = {"status": "pending", "pipeline_config": "", "cost_usd": 0.0}

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=["Read", "Write", "WebSearch"],
                effort="medium",
                max_turns=10,
            ),
        ):
            if isinstance(message, ResultMessage) and message.subtype == "success":
                result["status"] = "success"
                result["pipeline_config"] = message.result
                result["cost_usd"] = message.total_cost_usd

        return result


async def main():
    """테스트 실행"""
    agent = DevOpsAgent()

    print("\n" + "="*60)
    print("DevOps Agent 테스트: Vercel 배포 설정")
    print("="*60 + "\n")

    result = await agent.setup_vercel_deployment(
        project_type="static",
        custom_domain="fieldmanager.app",
        environment_vars={
            "NODE_ENV": "production",
            "API_URL": "https://api.fieldmanager.app"
        }
    )

    print(f"✅ Vercel 배포 가이드 생성 완료")
    print(f"💰 비용: ${result['cost_usd']:.4f}\n")
    print("="*60)
    print(result['deployment_guide'][:500])
    print("\n... (계속)")


if __name__ == "__main__":
    asyncio.run(main())
