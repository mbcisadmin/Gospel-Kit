# Architecture Decision Records (ADRs)

This directory contains records of architectural decisions made for Gospel Kit.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision along with its context and consequences.

## Format

Each ADR follows this structure:

- **Title**: Short descriptive title
- **Status**: Accepted, Proposed, Deprecated
- **Context**: What situation led to this decision?
- **Decision**: What did we decide to do?
- **Consequences**: What are the trade-offs?

## ADRs

| # | Title | Status |
|---|-------|--------|
| 001 | [Raw TypeScript Packages](./ADR-001-raw-typescript-packages.md) | Accepted |
| 002 | [CSS Variable Theming](./ADR-002-css-variable-theming.md) | Accepted |
| 003 | [Monorepo Structure](./ADR-003-monorepo-structure.md) | Accepted |
| 004 | [Abstraction Guidelines](./ADR-004-abstraction-guidelines.md) | Accepted |
| 005 | [Audit Logging Pattern](./ADR-005-audit-logging-pattern.md) | Accepted |

## Quick Decision Flowcharts

### Should I Abstract This Code?

```
┌─────────────────────────────┐
│ What type of code is this?  │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────┐
│UI       │   │Business      │
│Component│   │Logic         │
└────┬────┘   └──────┬───────┘
     │               │
     ▼               ▼
┌─────────────┐  ┌──────────────────┐
│Church-      │  │Used in 3+        │
│agnostic?    │  │places?           │
└─────┬───────┘  └────────┬─────────┘
      │                   │
  ┌───┴───┐           ┌───┴───┐
  │       │           │       │
  ▼       ▼           ▼       ▼
┌───┐   ┌───┐       ┌───┐   ┌───┐
│YES│   │NO │       │YES│   │NO │
└─┬─┘   └─┬─┘       └─┬─┘   └─┬─┘
  │       │           │       │
  ▼       ▼           ▼       ▼
Abstract  Keep      Abstract  Keep
to        in        to        in
package   app       package   app
```

### Which Package Should It Go In?

```
┌──────────────────────────────┐
│ Does it depend on React/     │
│ Next.js?                     │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────┐
│NO       │   │YES           │
└────┬────┘   └──────┬───────┘
     │               │
     ▼               ▼
┌────────────┐  ┌──────────────┐
│packages/   │  │packages/     │
│core/       │  │nextjs/       │
└────┬───────┘  └──────┬───────┘
     │                 │
     ▼                 ▼
┌──────────┐      ┌─────────────┐
│MP API?   │      │Auth?        │
│→ministry-│      │→auth/       │
│platform/ │      │             │
│          │      │UI Component?│
│Schemas?  │      │→ui/         │
│→database/│      │             │
└──────────┘      │Tailwind?    │
                  │→tailwind-   │
                  │config/      │
                  └─────────────┘
```

## Creating a New ADR

1. Copy the template below
2. Number it sequentially (e.g., ADR-006)
3. Fill in all sections
4. Update this README with the new entry

### ADR Template

```markdown
# ADR-XXX: [Title]

**Status**: [Proposed | Accepted | Deprecated]
**Date**: YYYY-MM-DD

## Context

What is the issue we're facing? What factors led to this decision?

## Decision

What are we going to do about it?

## Consequences

What becomes easier or more difficult as a result of this decision?

### Positive Consequences

-

### Negative Consequences

-

### Neutral Consequences

-
```
