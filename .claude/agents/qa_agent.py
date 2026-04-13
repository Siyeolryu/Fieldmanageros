"""
QA/Test Agent
테스트 자동화 및 품질 관리를 담당하는 AI 에이전트
"""

import asyncio
from typing import Optional, Dict, Any, List
from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage, AssistantMessage


class QAAgent:
    """QA Agent - 테스트 자동화 및 품질 관리 전문가"""

    def __init__(self):
        self.name = "QA Agent"
        self.description = "테스트 전략 수립, 자동화 테스트 작성, 품질 보증"

    async def create_test_strategy(
        self,
        test_scope: str = "full",  # unit, integration, e2e, full
        framework: str = "vitest"  # vitest, jest, playwright, cypress
    ) -> Dict[str, Any]:
        """
        테스트 전략 및 자동화 계획 수립

        Args:
            test_scope: 테스트 범위
            test_framework: 테스트 프레임워크

        Returns:
            테스트 전략 문서 및 샘플 코드
        """

        scope_desc = {
            "unit": "유닛 테스트 (함수, 컴포넌트 단위)",
            "integration": "통합 테스트 (API, DB 연동)",
            "e2e": "E2E 테스트 (사용자 시나리오)",
            "full": "전체 테스트 (유닛 + 통합 + E2E)"
        }.get(test_scope, "전체 테스트")

        prompt = f"""
당신은 Field Manager OS의 **QA Engineer**입니다.
고품질 소프트웨어 테스트 전략을 수립하고 자동화하는 전문가입니다.

## 프로젝트 정보
- **앱 유형**: 건설 현장 일용직 출근 관리 시스템
- **테스트 범위**: {scope_desc}
- **테스트 프레임워크**: {framework}
- **현재 기술**: HTML/JavaScript → Next.js/React 전환 예정

## 수행할 작업

### 1. 테스트 전략 수립

#### 1.1 테스트 피라미드
```
        ┌─────────────┐
        │  E2E Tests  │  (10%)
        │  (Slow)     │
        └─────────────┘
      ┌───────────────────┐
      │ Integration Tests │ (30%)
      │   (Medium)        │
      └───────────────────┘
  ┌─────────────────────────┐
  │     Unit Tests          │ (60%)
  │      (Fast)             │
  └─────────────────────────┘
```

#### 1.2 테스트 커버리지 목표
- **유닛 테스트**: 80% 이상
- **통합 테스트**: 주요 API 엔드포인트 100%
- **E2E 테스트**: 핵심 사용자 플로우 100%

### 2. 테스트 환경 설정

#### 2.1 패키지 설치
```json
// package.json
{{
  "devDependencies": {{
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",  // API Mocking
    "happy-dom": "^13.0.0"
  }},
  "scripts": {{
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }}
}}
```

#### 2.2 Vitest 설정
```typescript
// vitest.config.ts
import {{ defineConfig }} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({{
  plugins: [react()],
  test: {{
    globals: true,
    environment: 'happy-dom',
    setupFiles: './test/setup.ts',
    coverage: {{
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.*',
        '**/dist/**'
      ]
    }}
  }},
  resolve: {{
    alias: {{
      '@': path.resolve(__dirname, './src')
    }}
  }}
}});
```

#### 2.3 테스트 설정 파일
```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import {{ afterEach }} from 'vitest';
import {{ cleanup }} from '@testing-library/react';

// 각 테스트 후 자동 cleanup
afterEach(() => {{
  cleanup();
}});
```

### 3. 유닛 테스트 작성

#### 3.1 유틸리티 함수 테스트
```typescript
// src/utils/date-helpers.test.ts
import {{ describe, it, expect }} from 'vitest';
import {{
  formatDate,
  calculateWorkingDays,
  isWeeklyHoliday
}} from './date-helpers';

describe('Date Helpers', () => {{
  describe('formatDate', () => {{
    it('should format date to YYYY-MM-DD', () => {{
      const date = new Date('2026-03-15');
      expect(formatDate(date)).toBe('2026-03-15');
    }});

    it('should handle invalid date', () => {{
      expect(formatDate(null)).toBe('');
    }});
  }});

  describe('calculateWorkingDays', () => {{
    it('should calculate 8-day working period correctly', () => {{
      const attendances = [
        {{ date: '2026-03-01', hours: 8 }},
        {{ date: '2026-03-02', hours: 8 }},
        // ... 8일
      ];
      const result = calculateWorkingDays(attendances);
      expect(result.totalDays).toBe(8);
      expect(result.weeklyHolidays).toBe(1);
    }});
  }});

  describe('isWeeklyHoliday', () => {{
    it('should identify weekly holiday correctly', () => {{
      const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
      expect(isWeeklyHoliday(workDays)).toBe(true);
    }});

    it('should return false for less than 8 days', () => {{
      const workDays = ['Mon', 'Tue', 'Wed'];
      expect(isWeeklyHoliday(workDays)).toBe(false);
    }});
  }});
}});
```

#### 3.2 React 컴포넌트 테스트
```typescript
// src/components/CalendarGrid.test.tsx
import {{ describe, it, expect, vi }} from 'vitest';
import {{ render, screen, fireEvent }} from '@testing-library/react';
import {{ CalendarGrid }} from './CalendarGrid';

describe('CalendarGrid', () => {{
  it('should render calendar for current month', () => {{
    render(<CalendarGrid month={{3}} year={{2026}} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  }});

  it('should highlight today\'s date', () => {{
    const today = new Date();
    render(<CalendarGrid month={{today.getMonth()}} year={{today.getFullYear()}} />);
    const todayCell = screen.getByRole('button', {{
      name: new RegExp(today.getDate().toString())
    }});
    expect(todayCell).toHaveClass('today');
  }});

  it('should call onDateClick when date is clicked', () => {{
    const onDateClick = vi.fn();
    render(<CalendarGrid onDateClick={{onDateClick}} />);

    const dateButton = screen.getByRole('button', {{ name: /15/ }});
    fireEvent.click(dateButton);

    expect(onDateClick).toHaveBeenCalledWith(expect.objectContaining({{
      day: 15
    }}));
  }});

  it('should show attendance count on dates', () => {{
    const attendances = [
      {{ date: '2026-03-01', workerId: '1', hours: 8 }},
      {{ date: '2026-03-01', workerId: '2', hours: 8 }}
    ];
    render(<CalendarGrid attendances={{attendances}} />);

    expect(screen.getByText('2')).toBeInTheDocument(); // 2명 출근
  }});
}});
```

### 4. 통합 테스트 (API)

#### 4.1 API Route 테스트
```typescript
// app/api/attendance/route.test.ts
import {{ describe, it, expect, beforeEach }} from 'vitest';
import {{ POST, GET }} from './route';
import {{ prisma }} from '@/lib/prisma';

describe('Attendance API', () => {{
  beforeEach(async () => {{
    // 테스트 DB 초기화
    await prisma.attendance.deleteMany();
    await prisma.worker.deleteMany();
    await prisma.site.deleteMany();
  }});

  describe('POST /api/attendance', () => {{
    it('should create new attendance record', async () => {{
      const worker = await prisma.worker.create({{
        data: {{
          name: '홍길동',
          hourlyRate: 15000,
          siteId: 'test-site-id'
        }}
      }});

      const request = new Request('http://localhost:3000/api/attendance', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{
          workerId: worker.id,
          date: '2026-03-15',
          hoursWorked: 8
        }})
      }});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.attendance).toMatchObject({{
        workerId: worker.id,
        hoursWorked: 8
      }});
    }});

    it('should return 400 for invalid data', async () => {{
      const request = new Request('http://localhost:3000/api/attendance', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{
          workerId: 'invalid',
          date: 'not-a-date'
        }})
      }});

      const response = await POST(request);
      expect(response.status).toBe(400);
    }});
  }});

  describe('GET /api/attendance', () => {{
    it('should return attendance for specific date range', async () => {{
      // 테스트 데이터 생성
      // ...

      const url = new URL('http://localhost:3000/api/attendance');
      url.searchParams.set('startDate', '2026-03-01');
      url.searchParams.set('endDate', '2026-03-31');

      const request = new Request(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.attendances)).toBe(true);
    }});
  }});
}});
```

### 5. E2E 테스트 (Playwright)

#### 5.1 Playwright 설정
```typescript
// playwright.config.ts
import {{ defineConfig }} from '@playwright/test';

export default defineConfig({{
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {{
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }},
  projects: [
    {{ name: 'chromium', use: {{ browserName: 'chromium' }} }},
    {{ name: 'firefox', use: {{ browserName: 'firefox' }} }},
    {{ name: 'webkit', use: {{ browserName: 'webkit' }} }}
  ],
  webServer: {{
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }}
}});
```

#### 5.2 핵심 사용자 플로우 테스트
```typescript
// e2e/attendance-flow.spec.ts
import {{ test, expect }} from '@playwright/test';

test.describe('Attendance Recording Flow', () => {{
  test('should record attendance for worker', async ({{ page }}) => {{
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 현장 선택
    await page.selectOption('select[id="site-select"]', 'site-1');

    // 달력에서 날짜 클릭
    await page.click('button:has-text("15")');

    // 근로자 선택
    await page.click('text=홍길동');

    // 출근 기록 확인
    await expect(page.locator('.has-att')).toBeVisible();

    // 명세서 생성
    await page.click('text=명세서 생성');
    await page.waitForSelector('text=노무비 지급대장');

    // PDF 다운로드
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("PDF 다운로드")')
    ]);

    expect(download.suggestedFilename()).toContain('.pdf');
  }});

  test('should calculate weekly holiday correctly', async ({{ page }}) => {{
    await page.goto('/dashboard');

    // 8일 연속 출근 기록
    for (let day = 1; day <= 8; day++) {{
      await page.click(`button:has-text("${{day}}")`);
      await page.click('text=홍길동');
    }}

    // 주휴수당 표시 확인
    await expect(page.locator('text=주휴')).toBeVisible();

    // 합계 확인
    const totalElement = page.locator('[data-testid="total-pay"]');
    const totalText = await totalElement.textContent();
    expect(parseInt(totalText.replace(/,/g, ''))).toBeGreaterThan(0);
  }});
}});
```

### 6. 성능 테스트

#### 6.1 Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

#### 6.2 성능 벤치마크
```typescript
// test/performance.test.ts
import {{ describe, it, expect }} from 'vitest';
import {{ performance }} from 'perf_hooks';
import {{ calculateWorkingDays }} from '@/utils/attendance';

describe('Performance Tests', () => {{
  it('should calculate 1000 workers attendance in < 100ms', () => {{
    const attendances = Array.from({{ length: 1000 }}, (_, i) => ({{
      workerId: `worker-${{i}}`,
      date: '2026-03-15',
      hours: 8
    }}));

    const start = performance.now();
    calculateWorkingDays(attendances);
    const end = performance.now();

    expect(end - start).toBeLessThan(100);
  }});
}});
```

### 7. 테스트 자동화 (CI/CD)

#### 7.1 GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 8. 테스트 우선순위

#### 높은 우선순위 (필수)
- [ ] 출근 기록 생성/수정/삭제
- [ ] 8일 카운팅 계산
- [ ] 주휴수당 계산
- [ ] 명세서 생성 (PDF/Excel)
- [ ] 인증/인가

#### 중간 우선순위
- [ ] 건설사/현장 관리
- [ ] 근로자 관리
- [ ] 달력 UI
- [ ] 필터 및 검색

#### 낮은 우선순위
- [ ] UI 애니메이션
- [ ] 다크 모드
- [ ] 알림 기능

## 출력 형식

다음을 포함한 상세 테스트 전략 문서를 작성하세요:
1. **테스트 전략 개요**
2. **환경 설정 가이드** (패키지, 설정 파일)
3. **샘플 테스트 코드** (유닛, 통합, E2E)
4. **CI/CD 파이프라인**
5. **커버리지 목표 및 측정 방법**
6. **테스트 우선순위 체크리스트**

Field Manager OS의 핵심 기능을 분석하고 테스트 계획을 작성하세요.
"""

        result = {
            "status": "pending",
            "test_strategy": "",
            "cost_usd": 0.0,
            "session_id": None
        }

        async for message in query(
            prompt=prompt,
            options=ClaudeAgentOptions(
                allowed_tools=[
                    "Read", "Glob", "Grep",
                    "Write",
                    "WebSearch"
                ],
                effort="high",
                max_turns=20,
                setting_sources=["project"],
            ),
        ):
            if isinstance(message, AssistantMessage):
                for content in message.message.content:
                    if hasattr(content, 'text'):
                        print(f"[QA] {content.text[:100]}...")

            if isinstance(message, ResultMessage):
                if message.subtype == "success":
                    result["status"] = "success"
                    result["test_strategy"] = message.result
                    result["cost_usd"] = message.total_cost_usd
                    result["session_id"] = message.session_id
                else:
                    result["status"] = "error"
                    result["error"] = message.subtype

        return result


async def main():
    """테스트 실행"""
    agent = QAAgent()

    print("\n" + "="*60)
    print("QA Agent 테스트")
    print("="*60 + "\n")

    result = await agent.create_test_strategy(
        test_scope="full",
        framework="vitest"
    )

    print(f"✅ 테스트 전략 생성 완료")
    print(f"💰 비용: ${result['cost_usd']:.4f}\n")
    print("="*60)
    print(result['test_strategy'][:500])
    print("\n... (계속)")


if __name__ == "__main__":
    asyncio.run(main())
