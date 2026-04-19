---
name: full-stack-review
description: Complete full-stack review combining backend architecture, UX design, and testing strategy. Use for major feature planning or architectural decisions.
context: fork
agent: general-purpose
disable-model-invocation: false
---

# Full-Stack Review Workflow

You are orchestrating a comprehensive review of the 노무Pro application across backend, frontend, and testing dimensions.

This is a **meta-skill** that coordinates the three specialized agents to provide a holistic view of the application's quality and improvement opportunities.

## Orchestration Process

### Phase 1: Backend Architecture Review (30 minutes)

Delegate to the **backend-designer agent**:

```
@"backend-designer (agent)" Please conduct a comprehensive backend architecture review:

1. Analyze all API routes in app/api/
   - Check RESTful design patterns
   - Review error handling consistency
   - Evaluate authentication/authorization

2. Review database schema in prisma/schema.prisma
   - Check table relationships
   - Evaluate index coverage
   - Assess data types and constraints

3. Assess performance and scalability
   - Query optimization opportunities
   - Caching strategies
   - Connection pooling configuration

4. Security audit
   - Input validation (Zod schemas)
   - SQL injection prevention
   - Rate limiting

5. Provide prioritized recommendations with code examples

Focus on: Scalability to 1000+ users, maintainability, security
```

**Wait for backend-designer to complete before moving to Phase 2.**

---

### Phase 2: UX Design Audit (30 minutes)

Delegate to the **ux-designer agent**:

```
@"ux-designer (agent)" Please conduct a comprehensive UX audit:

1. Review all pages in app/ directory
   - User flow analysis (onboarding, daily tasks, monthly tasks)
   - Mobile responsiveness (320px primary focus)
   - Information architecture

2. Check accessibility (WCAG 2.1 AA)
   - Color contrast ratios
   - Keyboard navigation
   - Screen reader compatibility
   - Touch target sizes

3. Evaluate design consistency
   - Color system usage
   - Typography hierarchy
   - Component consistency
   - Visual feedback (loading, errors, success)

4. Korean language UI review
   - Text length handling
   - Date/number formats
   - Button label appropriateness

5. Provide specific improvements with before/after examples

Target users: 40-60 year old construction managers with low tech literacy
Priority: Mobile experience, simplicity, accessibility
```

**Wait for ux-designer to complete before moving to Phase 3.**

---

### Phase 3: Testing Strategy Assessment (30 minutes)

Delegate to the **test-specialist agent**:

```
@"test-specialist (agent)" Please create a comprehensive testing strategy:

1. Analyze current test coverage
   - Find all *.test.ts and *.test.tsx files
   - Calculate coverage percentage
   - Identify critical gaps

2. Prioritize untested paths
   - Payroll calculation logic (CRITICAL)
   - 4대보험 risk detection (CRITICAL)
   - API endpoints
   - User flows

3. Design test structure
   - Recommend testing framework
   - Propose directory structure
   - Suggest mocking strategy

4. Provide priority test cases with code examples
   - Unit tests for business logic
   - Integration tests for API routes
   - E2E tests for critical user flows

5. Create implementation timeline

Focus on: Business logic correctness, API reliability, E2E coverage
```

**Wait for test-specialist to complete before moving to Phase 4.**

---

### Phase 4: Synthesis and Integrated Roadmap (30 minutes)

After gathering input from all three agents, synthesize findings:

#### 4.1 Identify Cross-Cutting Concerns

Look for issues that span multiple domains:
- Does a backend performance issue also affect UX (loading times)?
- Do API changes require UI updates and new tests?
- Are accessibility issues related to component structure?

#### 4.2 Dependency Analysis

Map dependencies between recommendations:
```
Example:
Backend: "Add input validation to /api/attendance"
  ↓ Enables
UX: "Show field-level validation errors in real-time"
  ↓ Requires
Testing: "Add integration tests for validation scenarios"
```

#### 4.3 Priority Matrix

Categorize all recommendations:

| Impact ↓ \ Effort → | Low (<1 day) | Medium (1-3 days) | High (>3 days) |
|---------------------|--------------|-------------------|----------------|
| **High** | Quick wins | Strategic priorities | Major initiatives |
| **Medium** | Nice-to-haves | Improvements | Projects |
| **Low** | Backlog | Backlog | Avoid |

#### 4.4 Phased Implementation Roadmap

Create a realistic timeline:

**Week 1: Critical Fixes (P0)**
- Backend: [Top 3 critical issues]
- UX: [Accessibility violations]
- Testing: [Business logic tests]

**Week 2-3: High-Impact Improvements (P1)**
- Backend: [Performance optimizations]
- UX: [Mobile experience improvements]
- Testing: [API integration tests]

**Week 4+: Enhancements (P2)**
- Backend: [Code quality improvements]
- UX: [Polish and animations]
- Testing: [E2E coverage expansion]

#### 4.5 Risk Assessment

Identify risks for major changes:
- **Technical Risk:** Complexity, unknowns, dependencies
- **Business Risk:** User impact, downtime, revenue effect
- **Timeline Risk:** Estimation uncertainty, resource constraints

## Final Report Format

```markdown
# 노무Pro Full-Stack Review
Date: [Date]
Review Duration: ~2 hours
Reviewers: backend-designer, ux-designer, test-specialist agents

## Executive Summary

Overall Health Score: [X]/100
- Backend: [X]/100
- UX: [X]/100
- Testing: [X]/100

**Key Finding:** [1-2 sentences on the most critical insight]

**Recommendation:** [Primary action to take]

---

## Backend Architecture Findings

[Summarized findings from backend-designer agent]

### Critical Issues (P0)
1. [Issue] - Impact: [High/Medium/Low], Effort: [X days]
2. [Issue] - Impact: [High/Medium/Low], Effort: [X days]

### Recommendations
[Top 3 backend recommendations with code examples]

---

## UX Design Findings

[Summarized findings from ux-designer agent]

### Critical Issues (P0)
1. [Issue] - User Impact: [Description], Effort: [X hours]
2. [Issue] - User Impact: [Description], Effort: [X hours]

### Recommendations
[Top 3 UX improvements with mockups/examples]

---

## Testing Strategy Findings

[Summarized findings from test-specialist agent]

### Current State
- Coverage: [X]%
- Critical gaps: [List]

### Recommendations
[Top 3 testing priorities with code examples]

---

## Integrated Roadmap

### Phase 1: Foundation (Week 1) - 5 days
**Goal:** Fix critical issues and establish testing baseline

Backend:
- [ ] [Critical fix 1] (1 day)
- [ ] [Critical fix 2] (2 days)

UX:
- [ ] [Accessibility fix 1] (1 day)
- [ ] [Mobile fix 1] (1 day)

Testing:
- [ ] Set up test infrastructure (0.5 days)
- [ ] Write payroll calculation tests (1.5 days)

**Dependencies:**
- Testing infrastructure must be set up first
- Backend validation enables UX field-level errors

---

### Phase 2: Core Improvements (Week 2-3) - 10 days

Backend:
- [ ] [Performance optimization 1] (3 days)
- [ ] [Security enhancement 1] (2 days)

UX:
- [ ] [User flow improvement 1] (3 days)
- [ ] [Design consistency fixes] (2 days)

Testing:
- [ ] API integration tests (3 days)
- [ ] Component unit tests (2 days)

**Dependencies:**
- API changes require corresponding test updates
- UX improvements depend on backend API stability

---

### Phase 3: Polish & Scale (Week 4+) - Ongoing

Backend:
- [ ] Caching layer (3 days)
- [ ] Database query optimization (2 days)

UX:
- [ ] Animations and micro-interactions (2 days)
- [ ] Advanced mobile features (3 days)

Testing:
- [ ] E2E test coverage (5 days)
- [ ] Performance testing (2 days)

---

## Risk Assessment

### High Risk Items
1. **[Change description]**
   - **Risk:** [Description]
   - **Mitigation:** [Strategy]
   - **Rollback Plan:** [How to revert if needed]

### Medium Risk Items
[Similar format]

---

## Effort Estimation

| Phase | Backend | UX | Testing | Total |
|-------|---------|----|---------| ------|
| Phase 1 | 3 days | 2 days | 2 days | 5 days |
| Phase 2 | 5 days | 5 days | 5 days | 10 days |
| Phase 3 | 5 days | 5 days | 7 days | 10+ days |

**Total:** ~25 days (5 weeks with 1 developer)

---

## Quick Wins (Do These First!)

Items with high impact and low effort:

1. **[Quick win 1]** - 2 hours, fixes [impact]
2. **[Quick win 2]** - 4 hours, improves [metric]
3. **[Quick win 3]** - 1 hour, addresses [issue]

---

## Success Metrics

How to measure improvement:

**Backend:**
- API response time < 200ms (currently [X]ms)
- Zero SQL injection vulnerabilities
- 90%+ API route test coverage

**UX:**
- All WCAG 2.1 AA violations fixed
- Mobile task completion time reduced by 30%
- User satisfaction score > 4/5

**Testing:**
- 80%+ overall code coverage
- 100% critical path E2E coverage
- < 2 minute test suite execution

---

## Next Steps

1. **Immediate (Today):**
   - [Action 1]
   - [Action 2]

2. **This Week:**
   - Begin Phase 1 critical fixes
   - Set up testing infrastructure

3. **This Month:**
   - Complete Phase 1 and Phase 2
   - Conduct user testing with 5 users

4. **Ongoing:**
   - Weekly progress reviews
   - Continuous monitoring of metrics

---

## Appendix: Detailed Agent Reports

### A. Backend Architecture Review
[Link to or embed full backend-designer report]

### B. UX Audit Report
[Link to or embed full ux-designer report]

### C. Testing Strategy Report
[Link to or embed full test-specialist report]
```

---

## When to Use This Skill

This comprehensive review should be conducted:

- **Quarterly:** Regular health checks (every 3 months)
- **Before Major Features:** Planning phase for significant new functionality
- **Pre-Launch:** Final quality check before public release
- **After Incidents:** Root cause analysis after production issues
- **Scaling Preparation:** Before anticipated user growth
- **Team Onboarding:** Help new senior developers understand the system

---

## Output Deliverables

After running this skill, you will have:

1. ✅ **Comprehensive review report** (markdown document)
2. ✅ **Prioritized action items** with effort estimates
3. ✅ **Code examples** for top recommendations
4. ✅ **Implementation roadmap** with dependencies mapped
5. ✅ **Risk assessment** for major changes
6. ✅ **Success metrics** to track improvement

---

## Customization

You can customize this review by:

- **Focusing on specific areas:** Add parameters like "focus on mobile UX"
- **Time-boxing:** Request "quick 30-minute review" vs "deep 2-hour analysis"
- **Feature-specific:** "Review only the payroll generation feature"
- **Pre-launch checklist:** "Production-readiness review"

Example:
```
/full-stack-review focus:mobile-experience depth:quick
```

This meta-skill represents the **highest level of code quality assurance** available through the agent system, providing a 360-degree view of your application's health.
