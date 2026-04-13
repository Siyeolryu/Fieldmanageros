"""
Architecture Agent
시스템 아키텍처 설계 및 기술 스택 선정을 담당하는 AI 에이전트
"""

import asyncio
from typing import Optional, Dict, Any, List
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage


class ArchitectureAgent:
    """Architecture Agent - 시스템 아키텍처 및 기술 설계 전문가"""

    def __init__(self):
        self.name = "Architecture Agent"
        self.description = "시스템 아키텍처 설계, 기술 스택 선정, 확장성 계획"

    async def design_system_architecture(
        self,
        requirements: List[str],
        scale: str = "medium",  # small, medium, large
        constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        시스템 아키텍처 설계

        Args:
            requirements: 기능 요구사항 리스트
            scale: 예상 규모
            constraints: 제약사항 (예산, 기술, 시간)

        Returns:
            아키텍처 설계서
        """

        reqs_text = "\n".join([f"- {r}" for r in requirements])
        constraints_text = "\n".join([f"- {k}: {v}" for k, v in (constraints or {}).items()])

        scale_info = {
            "small": "사용자 100명 이하, 단일 서버",
            "medium": "사용자 1,000~10,000명, 마이크로서비스",
            "large": "사용자 10만명 이상, 분산 시스템"
        }.get(scale, "중간 규모")

        prompt = f"""
당신은 Field Manager OS의 **시스템 아키텍트**입니다.
확장 가능하고 유지보수 가능한 시스템 아키텍처를 설계하는 전문가입니다.

## 프로젝트 정보
- **현재 상태**: HTML/JavaScript 단일 파일 웹앱
- **예상 규모**: {scale_info}
- **도메인**: 건설 현장 일용직 출근 관리

## 기능 요구사항
{reqs_text}

## 제약사항
{constraints_text if constraints_text else "제약사항 없음"}

## 수행할 작업

### 1. 아키텍처 비전

#### 1.1 현재 상태 분석 (As-Is)
```
[현재 아키텍처]
Client (Browser)
  └─ index.html (단일 파일)
      ├─ UI Logic (JavaScript)
      ├─ Data Storage (LocalStorage)
      └─ File Export (Client-side)

한계점:
- 데이터 동기화 불가
- 멀티 디바이스 지원 어려움
- 확장성 제한
- 협업 기능 없음
```

#### 1.2 목표 아키텍처 (To-Be)
```
[제안 아키텍처]
Client (Web/Mobile)
  ↕ API Gateway
Backend Services
  ├─ Auth Service
  ├─ Attendance Service
  ├─ Report Service
  └─ File Service
  ↕
Database (PostgreSQL)
Cloud Storage (S3/GCS)
Cache (Redis)
Queue (Bull/RabbitMQ)
```

### 2. 계층별 설계

#### 2.1 프론트엔드 아키텍처

**기술 스택 제안**:
- Framework: Next.js 15 (App Router) / React Native
- 상태 관리: Zustand / Redux Toolkit
- UI 라이브러리: shadcn/ui, Tailwind CSS
- 데이터 페칭: TanStack Query (React Query)
- 폼 관리: React Hook Form + Zod

**디렉토리 구조**:
```
app/
├── (auth)/              # 인증 그룹
│   ├── login/
│   └── register/
├── (dashboard)/         # 대시보드 그룹
│   ├── calendar/
│   ├── workers/
│   ├── reports/
│   └── settings/
├── api/                 # API Routes
│   ├── auth/
│   ├── attendance/
│   └── reports/
├── components/          # 재사용 컴포넌트
│   ├── ui/              # shadcn/ui
│   ├── calendar/
│   └── workers/
├── lib/                 # 유틸리티
│   ├── api-client.ts
│   ├── date-utils.ts
│   └── validators.ts
└── stores/              # 상태 관리
    ├── auth-store.ts
    └── attendance-store.ts
```

#### 2.2 백엔드 아키텍처

**기술 스택 제안**:
- Runtime: Node.js 20 / Deno / Bun
- Framework: Next.js API Routes / Hono / Fastify
- ORM: Prisma / Drizzle
- 인증: NextAuth.js / Clerk / Supabase Auth
- 파일 처리: Sharp, ExcelJS, PDFKit

**API 설계**:
```typescript
// RESTful API 엔드포인트

// 인증
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session

// 건설사/현장
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
DELETE /api/companies/:id

GET    /api/sites
POST   /api/sites
GET    /api/sites/:id
PUT    /api/sites/:id

// 근로자
GET    /api/workers
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id

// 출근 기록
GET    /api/attendance?date=2026-03&siteId=123
POST   /api/attendance
PUT    /api/attendance/:id
DELETE /api/attendance/:id

// 리포트
GET    /api/reports/summary?month=2026-03
GET    /api/reports/worker/:workerId
POST   /api/reports/generate-pdf

// 파일
POST   /api/files/upload-excel
GET    /api/files/export-excel
```

#### 2.3 데이터베이스 설계

**Prisma 스키마**:
```prisma
// schema.prisma

generator client {{
  provider = "prisma-client-js"
}}

datasource db {{
  provider = "postgresql"
  url      = env("DATABASE_URL")
}}

model User {{
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(MANAGER)
  companies Company[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}}

model Company {{
  id        String   @id @default(cuid())
  name      String
  sites     Site[]
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}}

model Site {{
  id         String       @id @default(cuid())
  name       String
  location   String?
  companyId  String
  company    Company      @relation(fields: [companyId], references: [id])
  workers    Worker[]
  attendance Attendance[]
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
}}

model Worker {{
  id         String       @id @default(cuid())
  name       String
  phone      String?
  hourlyRate Int          // 시급 (원)
  siteId     String
  site       Site         @relation(fields: [siteId], references: [id])
  attendance Attendance[]
  isActive   Boolean      @default(true)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
}}

model Attendance {{
  id           String   @id @default(cuid())
  date         DateTime
  workerId     String
  worker       Worker   @relation(fields: [workerId], references: [id])
  siteId       String
  site         Site     @relation(fields: [siteId], references: [id])
  hoursWorked  Float    // 근무 시간
  isWeeklyHoliday Boolean @default(false) // 주휴일 여부
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([workerId, date, siteId])
}}

enum Role {{
  ADMIN
  MANAGER
  VIEWER
}}
```

### 3. 배포 아키텍처

#### 3.1 Vercel 기반 배포
```
[클라이언트 요청]
       ↓
[Cloudflare CDN] (캐싱)
       ↓
[Vercel Edge Network] (전 세계 100+ 지역)
       ↓
┌──────────────────────────┐
│  Vercel Functions        │
│  (Serverless)            │
│  - API Routes            │
│  - 인증 검증             │
│  - 비즈니스 로직         │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│  Database                │
│  - Vercel Postgres       │
│  - Supabase              │
│  - PlanetScale           │
└──────────────────────────┘
```

#### 3.2 인프라 구성
- **Compute**: Vercel Serverless Functions
- **Database**: Vercel Postgres / Supabase
- **Storage**: Vercel Blob / AWS S3
- **Cache**: Vercel Edge Cache / Redis
- **Monitoring**: Vercel Analytics, Sentry
- **CDN**: Vercel Edge Network

### 4. 확장성 전략

#### 4.1 수평 확장 (Horizontal Scaling)
- Serverless Functions는 자동 확장
- Database 읽기 복제본 추가
- CDN 엣지 캐싱 활용

#### 4.2 수직 확장 (Vertical Scaling)
- Vercel Pro/Enterprise 플랜 업그레이드
- Database 인스턴스 크기 증가
- Connection Pool 최적화

#### 4.3 캐싱 전략
```typescript
// 레벨 1: Browser Cache
Cache-Control: public, max-age=3600

// 레벨 2: CDN Cache (Vercel Edge)
export const config = {{
  runtime: 'edge',
}};

// 레벨 3: Redis Cache
import {{ redis }} from '@/lib/redis';

async function getCachedData(key: string) {{
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFromDB();
  await redis.set(key, JSON.stringify(data), 'EX', 3600);
  return data;
}}
```

### 5. 보안 아키텍처

#### 5.1 인증/인가
```typescript
// NextAuth.js 설정
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {{
  providers: [
    CredentialsProvider({{
      name: "Credentials",
      credentials: {{
        email: {{ label: "Email", type: "email" }},
        password: {{ label: "Password", type: "password" }}
      }},
      async authorize(credentials) {{
        // 사용자 검증 로직
      }}
    }})
  ],
  session: {{ strategy: "jwt" }},
  pages: {{
    signIn: '/login',
  }},
}};
```

#### 5.2 데이터 보호
- HTTPS 강제 (Vercel 자동)
- SQL Injection 방지 (Prisma 파라미터화)
- XSS 방지 (React 자동 이스케이핑)
- CSRF 토큰 검증
- Rate Limiting (Vercel Edge Middleware)

#### 5.3 개인정보 보호
- 근로자 정보 암호화 (저장 시)
- GDPR/PIPA 준수
- 감사 로그 (Audit Trail)

### 6. 성능 최적화

#### 6.1 프론트엔드 최적화
- Code Splitting (Next.js 자동)
- Image Optimization (next/image)
- Lazy Loading (React.lazy)
- Tree Shaking (Webpack)
- Bundle Size Monitoring (next-bundle-analyzer)

#### 6.2 백엔드 최적화
- Database Indexing
- Query Optimization (N+1 문제 해결)
- Connection Pooling
- Batch Processing (엑셀 대량 처리)

#### 6.3 성능 목표
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- API 응답 시간: < 200ms (P95)

### 7. 마이그레이션 전략

#### Phase 1: 기반 구축
- [ ] Next.js 프로젝트 초기화
- [ ] Vercel Postgres 설정
- [ ] Prisma 스키마 마이그레이션
- [ ] 인증 시스템 구축

#### Phase 2: 기능 이전
- [ ] 달력 UI → React 컴포넌트
- [ ] LocalStorage → Database
- [ ] 출근 기록 로직 → API
- [ ] 명세서 생성 → Serverless Function

#### Phase 3: 배포 및 테스트
- [ ] Vercel 배포
- [ ] 사용자 테스트
- [ ] 성능 튜닝
- [ ] 프로덕션 런칭

#### Phase 4: 레거시 종료
- [ ] 기존 사용자 마이그레이션
- [ ] 데이터 백업 및 검증
- [ ] 구 버전 종료

## 출력 형식

다음을 포함한 상세 아키텍처 문서를 작성하세요:
1. **시스템 다이어그램** (ASCII 아트 또는 Mermaid)
2. **기술 스택 상세 설명** (선정 이유 포함)
3. **데이터 모델** (ERD, Prisma 스키마)
4. **API 명세** (엔드포인트, 요청/응답 스키마)
5. **배포 아키텍처** (인프라 구성도)
6. **확장성/성능 계획**
7. **보안 고려사항**
8. **마이그레이션 로드맵**

Field Manager OS의 현재 코드를 분석하고 최적의 아키텍처를 제안하세요.
"""

        result = {
            "status": "pending",
            "architecture_doc": "",
            "cost_usd": 0.0,
            "session_id": None
        }

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=[
                    "Read", "Glob", "Grep",
                    "Write",
                    "WebSearch",
                    "AskUserQuestion"
                ],
                effort="high",
                max_turns=25,
                setting_sources=["project"],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for content in message.message.content:
                    if hasattr(content, 'text'):
                        print(f"[Architect] {content.text[:100]}...")

            if isinstance(message, ResultMessage):
                if message.subtype == "success":
                    result["status"] = "success"
                    result["architecture_doc"] = message.result
                    result["cost_usd"] = message.total_cost_usd
                    result["session_id"] = message.session_id
                else:
                    result["status"] = "error"
                    result["error"] = message.subtype

        return result


async def main():
    """테스트 실행"""
    agent = ArchitectureAgent()

    print("\n" + "="*60)
    print("Architecture Agent 테스트")
    print("="*60 + "\n")

    result = await agent.design_system_architecture(
        requirements=[
            "멀티 디바이스 동기화 (웹, AOS, iOS)",
            "오프라인 모드 지원",
            "실시간 협업 (여러 관리자)",
            "대용량 엑셀 처리 (수천 행)",
            "PDF 명세서 생성 (고품질)",
            "푸시 알림",
            "역할 기반 권한 관리"
        ],
        scale="medium",
        constraints={
            "예산": "월 $100 이하 (초기)",
            "개발 기간": "3개월",
            "팀 규모": "1-2명"
        }
    )

    print(f"✅ 아키텍처 설계 완료")
    print(f"💰 비용: ${result['cost_usd']:.4f}\n")
    print("="*60)
    print(result['architecture_doc'][:500])
    print("\n... (계속)")


if __name__ == "__main__":
    asyncio.run(main())
