---
name: testing-strategy
description: Complete testing strategy including unit, integration, and E2E test planning. Use when establishing or improving test coverage and quality assurance.
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Testing Strategy Review

Develop a comprehensive testing strategy covering all layers of the application.

## Testing Process

This skill orchestrates a complete testing assessment for the 노무Pro application.

### 1. Current Test Analysis

Assess existing test coverage:
- Locate all test files (`**/*.test.ts`, `**/*.test.tsx`, `**/__tests__/*`)
- Calculate current coverage percentage
- Identify untested critical paths
- Evaluate test quality and maintainability
- Check for flaky or outdated tests

### 2. Test Gap Identification

Find what's missing:
- **Untested API Routes:** Which endpoints lack tests?
- **Untested Components:** UI components without test coverage
- **Untested Business Logic:** Critical calculations (payroll, 4대보험)
- **Missing E2E Tests:** User flows without end-to-end coverage
- **Edge Cases:** Boundary conditions and error scenarios

### 3. Testing Layer Strategy

Design comprehensive test pyramid:

#### Unit Tests (Base - 70% of tests)
- **Components:** Render, user interactions, edge cases
- **Utilities:** Pure functions, calculations, validators
- **Hooks:** Custom React hooks
- **Validation:** Zod schemas, form validation

#### Integration Tests (Middle - 20% of tests)
- **API Routes:** Request/response, database operations
- **Authentication:** Login, signup, session management
- **Data Flow:** Component → API → Database
- **Third-party:** Supabase integration

#### E2E Tests (Top - 10% of tests)
- **Critical Paths:** User registration → add worker → record attendance
- **Workflows:** Monthly payroll generation
- **Cross-browser:** Chrome, Safari, Mobile browsers
- **Error Scenarios:** Network failures, validation errors

### 4. Test Infrastructure

Recommend testing setup:
- **Test Runner:** Jest + React Testing Library
- **E2E Framework:** Playwright (recommended) or Cypress
- **Coverage Tool:** Jest coverage reports
- **Mocking:** MSW for API mocking
- **CI/CD:** GitHub Actions test pipeline

### 5. Coverage Targets

Set realistic goals:
- **Critical Business Logic:** 100% (payroll calculation, 4대보험)
- **API Routes:** 90%+
- **Components:** 80%+
- **Utilities:** 95%+
- **Overall Project:** 80%+ minimum

## How to Use This Skill

When this skill is invoked, it will:

1. **Delegate to @"test-specialist (agent)"** to analyze testing needs

2. **Generate a comprehensive testing plan** including:
   - Current coverage assessment
   - Test gap analysis
   - Recommended test structure
   - Priority test cases to write
   - Test infrastructure setup guide

3. **Provide actual test code examples** for critical paths

## Expected Output Format

```markdown
# Testing Strategy Report
Date: [Date]
Analyst: test-specialist agent

## Executive Summary
Current Coverage: [X]%
Target Coverage: 80%
Estimated Effort: [X] days

## Current Test Status

### Existing Tests
- Unit Tests: [X] tests ([Y]% coverage)
- Integration Tests: [X] tests
- E2E Tests: [X] tests

### Test Quality Assessment
- ✅ Good: [Strengths]
- ❌ Needs Improvement: [Weaknesses]

## Test Gap Analysis

### Critical Untested Paths
1. **Payroll Calculation**
   - Current: No tests
   - Risk: HIGH (money-related bugs)
   - Priority: P0

2. **4대보험 Risk Detection**
   - Current: No tests
   - Risk: HIGH (compliance issues)
   - Priority: P0

3. [More gaps...]

### Coverage Gaps by Module

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| API Routes | 20% | 90% | P0 |
| Components | 40% | 80% | P1 |
| Utils | 60% | 95% | P2 |

## Recommended Test Structure

```
dev3_nomu/
├── __tests__/
│   ├── api/
│   │   ├── attendance.test.ts
│   │   ├── payroll.test.ts
│   │   └── workers.test.ts
│   ├── components/
│   │   ├── CalendarView.test.tsx
│   │   └── WorkerCard.test.tsx
│   ├── lib/
│   │   └── calculations.test.ts
│   └── e2e/
│       ├── user-flow.spec.ts
│       └── payroll-generation.spec.ts
├── __mocks__/
│   ├── prisma.ts
│   └── supabase.ts
└── jest.config.js
```

## Priority Test Cases

### Phase 1: Critical Tests (Week 1)

#### 1. Payroll Calculation Tests
```typescript
// Example test to write
describe('calculateMonthlyPayroll', () => {
  test('calculates daily wage correctly for 8-hour workday', () => {
    const attendances = [
      { date: '2026-04-01', hours: 8, hourlyRate: 15000 }
    ]
    const result = calculateMonthlyPayroll(attendances)
    expect(result.totalWage).toBe(120000)
  })

  test('applies overtime rate for hours over 8', () => {
    // Test implementation...
  })

  test('handles missing attendance records', () => {
    // Test implementation...
  })
})
```

#### 2. 4대보험 Risk Detection
```typescript
// Example test
describe('detectInsuranceRisk', () => {
  test('flags worker with 15+ days in month', () => {
    const attendance = { daysWorked: 15, monthlyWage: 2000000 }
    const risk = detectInsuranceRisk(attendance)
    expect(risk.level).toBe('HIGH')
    expect(risk.message).toContain('4대보험 가입 필요')
  })
})
```

### Phase 2: API Route Tests (Week 2)

```typescript
// Example API test
describe('POST /api/attendance', () => {
  test('creates attendance record successfully', async () => {
    const response = await request(app)
      .post('/api/attendance')
      .send({
        workerId: 1,
        date: '2026-04-18',
        hours: 8,
      })
      .expect(200)

    expect(response.body.success).toBe(true)
  })

  test('returns 400 for invalid date format', async () => {
    // Test implementation...
  })
})
```

### Phase 3: E2E Tests (Week 3)

```typescript
// Example E2E test (Playwright)
test('user can record attendance for worker', async ({ page }) => {
  // Login
  await page.goto('/auth/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to calendar
  await page.waitForURL('/dashboard')
  await page.click('text=출근 기록')

  // Select worker and date
  await page.click('[data-testid="worker-select"]')
  await page.click('text=김철수')
  await page.click('[data-date="2026-04-18"]')

  // Submit
  await page.click('button:has-text("저장")')
  await expect(page.locator('text=출근 기록 완료')).toBeVisible()
})
```

## Test Infrastructure Setup

### 1. Install Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event msw
npm install --save-dev @playwright/test
```

### 2. Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'next',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### 3. GitHub Actions CI
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Implementation Timeline

| Phase | Tasks | Duration | Priority |
|-------|-------|----------|----------|
| 1 | Critical business logic tests | 3 days | P0 |
| 2 | API route integration tests | 5 days | P0 |
| 3 | Component unit tests | 5 days | P1 |
| 4 | E2E critical path tests | 4 days | P1 |
| 5 | Coverage improvement | 3 days | P2 |

Total: ~20 days

## Success Criteria

- [ ] 80%+ overall code coverage
- [ ] 100% coverage on payroll calculation
- [ ] All API routes have integration tests
- [ ] Top 5 user flows have E2E tests
- [ ] Zero flaky tests in CI
- [ ] Tests run in < 2 minutes

## Next Steps
1. Set up Jest and testing infrastructure
2. Write tests for critical business logic first
3. Add API integration tests
4. Implement E2E tests for main user flows
5. Configure CI/CD pipeline
6. Establish testing culture (require tests for all new features)
```

## Agent Invocation

Use this format to invoke the test-specialist agent:

```
@"test-specialist (agent)" Please create a comprehensive testing strategy:

1. Analyze current test coverage (find all *.test.ts files)
2. Identify critical untested paths (especially payroll, 4대보험)
3. Recommend test structure and tools
4. Provide priority test cases with actual code examples
5. Create implementation timeline

Focus on:
- Business logic correctness (money calculations)
- API reliability
- User flow coverage
- Maintainability

Provide working code examples for the top 5 priority test cases.
```

## When to Use This Skill

- At project start (establish testing from day 1)
- Before major refactoring
- When bugs are frequently found in production
- Quarterly quality assessments
- Before scaling team (new developers need good tests)
- When preparing for audit or certification
