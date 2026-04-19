---
name: backend-review
description: Comprehensive backend review combining architecture analysis, API design, and database decisions. Use when planning major backend changes or reviewing architecture.
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Backend Architecture Review

Conduct a comprehensive backend architecture review using the backend-designer agent.

## Review Process

This skill orchestrates a thorough backend review for the 노무Pro application.

### 1. Current State Analysis

First, analyze the existing backend:
- Examine all API routes in `app/api/`
- Review database schema in `prisma/schema.prisma`
- Check Supabase integration in `lib/supabase/`
- Identify existing patterns and conventions
- Document technical debt and bottlenecks

### 2. Architecture Assessment

Evaluate the current design:
- **Scalability:** Can the current structure handle 1000+ users?
- **Performance:** Are queries optimized? Is caching implemented?
- **Security:** Are inputs validated? Are SQL injections prevented?
- **Maintainability:** Is code DRY? Are there clear patterns?
- **Testing:** Is the backend testable? Are tests present?

### 3. API Design Review

For each API endpoint, check:
- RESTful naming conventions
- HTTP method appropriateness (GET, POST, PUT, DELETE)
- Request/response structure consistency
- Error handling and status codes
- Input validation with Zod
- Authentication and authorization

### 4. Database Review

Analyze Prisma schema:
- Table relationships and foreign keys
- Index coverage for common queries
- Data types appropriateness
- Migration strategy
- Connection pooling configuration

### 5. Recommendations

Provide specific, actionable recommendations:
- High priority fixes (security, critical bugs)
- Medium priority improvements (performance, scalability)
- Low priority enhancements (code quality, DX)
- Suggested timeline and effort estimates

## How to Use This Skill

When this skill is invoked, it will:

1. **Delegate to @"backend-designer (agent)"** to perform comprehensive analysis

2. **Generate a structured report** including:
   - Executive summary
   - Current architecture overview
   - Identified issues by priority
   - Detailed recommendations
   - Implementation roadmap

3. **Provide code examples** for recommended changes

## Expected Output Format

```markdown
# Backend Architecture Review Report
Date: [Date]
Reviewer: backend-designer agent

## Executive Summary
[2-3 sentence overview of findings]

## Current Architecture
### API Routes
- [List of routes with brief description]

### Database Schema
- [Overview of tables and relationships]

### Authentication
- [Current auth implementation]

## Findings

### 🔴 Critical Issues
1. [Issue 1]
   - **Impact:** [Description]
   - **Recommendation:** [Solution]
   - **Effort:** [Hours/Days]

### 🟡 Medium Priority
[Similar format]

### 🟢 Enhancements
[Similar format]

## Recommended Roadmap

### Phase 1: Critical Fixes (Week 1)
- [ ] Task 1
- [ ] Task 2

### Phase 2: Performance (Week 2-3)
- [ ] Task 3
- [ ] Task 4

### Phase 3: Enhancements (Week 4+)
- [ ] Task 5
- [ ] Task 6

## Code Examples
[Specific code snippets for top 3 recommendations]
```

## Agent Invocation

Use this format to invoke the backend-designer agent:

```
@"backend-designer (agent)" Please conduct a comprehensive backend architecture review:

1. Analyze all API routes in app/api/
2. Review the Prisma schema
3. Check authentication implementation
4. Identify performance bottlenecks
5. Provide prioritized recommendations with code examples

Focus on scalability, security, and maintainability.
```

This skill should be used:
- Before major feature development
- During quarterly architecture reviews
- When performance issues are reported
- Before scaling to production
- When onboarding senior developers who need architecture context
