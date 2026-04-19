---
name: ux-audit
description: Complete UX audit reviewing user flows, accessibility, design consistency, and responsiveness. Use when improving user experience or evaluating design quality.
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# UX Audit

Conduct a thorough UX audit of the application focusing on usability, accessibility, and design consistency.

## Audit Process

This skill orchestrates a comprehensive UX review for the 노무Pro application.

### 1. User Flow Analysis

Map and evaluate critical user journeys:
- **Onboarding:** First-time user experience
- **Daily Tasks:** Common workflows (record attendance, view workers)
- **Monthly Tasks:** Generate payroll, review reports
- **Error Recovery:** How users handle mistakes
- **Mobile Experience:** Touch interactions, readability

### 2. Visual Design Review

Assess visual consistency and quality:
- **Color System:** Consistent use of primary/secondary colors
- **Typography:** Font sizes, weights, line heights
- **Spacing:** Padding, margins, component spacing
- **Visual Hierarchy:** Information prioritization
- **Iconography:** Consistent icon style and usage
- **Imagery:** Quality and appropriateness of images

### 3. Accessibility Review (WCAG 2.1 Level AA)

Check compliance across:
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** Tab order, focus indicators
- **Screen Readers:** ARIA labels, semantic HTML
- **Forms:** Label associations, error announcements
- **Interactive Elements:** Touch target sizes (44x44px minimum)
- **Alternative Text:** Images and icons

### 4. Responsiveness Check

Test across breakpoints:
- **Mobile (320px-767px):** Primary device for construction sites
- **Tablet (768px-1023px):** Optional but should work
- **Desktop (1024px+):** Office use
- **Touch Interactions:** Swipe, long-press behaviors
- **Orientation:** Portrait and landscape modes

### 5. Component Quality Review

Evaluate individual components:
- **Buttons:** Clear labels, appropriate sizes, loading states
- **Forms:** Label placement, validation, error messages
- **Cards:** Information density, visual hierarchy
- **Navigation:** Clarity, active states, breadcrumbs
- **Feedback:** Success/error messages, loading indicators
- **Empty States:** Helpful messages and CTAs

### 6. Korean Language UI

Check Korean-specific issues:
- **Text Length:** Korean text typically 20-30% longer
- **Line Breaking:** Proper word breaks
- **Date Formats:** "2026.04.18 (금)" format
- **Number Formats:** Korean currency (₩123,456)
- **Button Labels:** Concise 2-4 character labels

## How to Use This Skill

When this skill is invoked, it will:

1. **Delegate to @"ux-designer (agent)"** to perform comprehensive UX analysis

2. **Generate a structured report** including:
   - Executive summary with overall UX score
   - Findings by category (Critical, Important, Nice-to-have)
   - Before/after mockups for key improvements
   - Implementation priority matrix

3. **Provide specific design recommendations** with examples

## Expected Output Format

```markdown
# UX Audit Report
Date: [Date]
Auditor: ux-designer agent
Overall UX Score: [X]/100

## Executive Summary
[3-4 sentences on overall UX quality and top findings]

## User Flow Analysis

### Critical Paths Evaluated
1. User Registration → First Attendance Record (Current: 8 steps)
2. Daily Attendance Recording (Current: 4 clicks)
3. Monthly Payroll Generation (Current: 6 steps)

### Friction Points
- [Specific issue with screenshot reference]

## Visual Design Findings

### ✅ Strengths
- Clear visual hierarchy on dashboard
- Consistent color usage
- Appropriate font sizes for target age group

### ❌ Issues
1. **Low contrast on secondary buttons**
   - Current: 3.2:1 ratio
   - Required: 4.5:1
   - Fix: Use #555555 instead of #999999

## Accessibility Issues

### 🔴 Critical (WCAG Violations)
1. [Issue with specific component reference]
   - **Impact:** [User group affected]
   - **Fix:** [Specific code change]

### 🟡 Important
[Similar format]

### 🟢 Nice-to-have
[Similar format]

## Responsiveness Findings

### Mobile (Primary Device)
- ✅ Touch targets meet 44px minimum
- ❌ Calendar grid too small on 320px screens
- ❌ Bottom nav overlaps content on iPhone SE

### Recommendations
[Specific fixes with code examples]

## Priority Matrix

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| P0 | Color contrast on error messages | High | 1 hour |
| P1 | Calendar mobile sizing | High | 4 hours |
| P2 | Loading state animations | Medium | 2 hours |

## Quick Wins (< 2 hours each)
1. [Specific improvement]
2. [Specific improvement]
3. [Specific improvement]

## Code Examples
[Specific Tailwind/CSS fixes for top issues]

## Next Steps
1. Fix P0 issues immediately
2. Address P1 issues in next sprint
3. Schedule P2 improvements
4. Conduct user testing with 5 target users
```

## Agent Invocation

Use this format to invoke the ux-designer agent:

```
@"ux-designer (agent)" Please conduct a comprehensive UX audit:

1. Review all pages in app/ directory
2. Check critical user flows (onboarding, attendance, payroll)
3. Evaluate accessibility compliance (WCAG 2.1 AA)
4. Test responsiveness on mobile (320px), tablet (768px), desktop (1024px)
5. Assess design consistency across components
6. Check Korean language UI appropriateness

Prioritize findings by impact and effort. Provide specific code examples for fixes.

Target users: 40-60 year old construction site managers with low tech literacy.
```

## When to Use This Skill

- Before major UI releases
- After adding new features
- When user feedback indicates confusion
- Quarterly UX health checks
- Before user testing sessions
- When preparing for accessibility certification
