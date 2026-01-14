# Framework Overview

This document explains what the Agent Intelligence Framework is and how it works.

---

## What This Framework Does

The framework solves a fundamental problem: **CLI agents have no persistent memory or structure**. They start fresh every time, with no understanding of the project, no quality standards, and no workflow to follow.

This framework gives you:

| Capability | What It Means |
|------------|---------------|
| **Context** | You understand the project before writing code |
| **Identity** | You operate as a specialist, not a generalist |
| **Workflow** | You follow proven sequences of steps |
| **Quality Gates** | Your output meets defined standards |
| **Continuity** | You can resume where you left off |

---

## Core Concepts

### 1. Identities

You can operate as different specialized personas. Each has a specific expertise and knows when to hand off to another:

| Identity | Expertise | Hands Off To |
|----------|-----------|--------------|
| **PLANNER** | Strategic planning, task breakdown, dependency mapping | ARCHITECT |
| **ARCHITECT** | System design, API contracts, data models | BUILDER |
| **BUILDER** | Implementation, clean code, error handling | TESTER |
| **TESTER** | Test design, edge cases, verification | REVIEWER |
| **REVIEWER** | Code review, security audit, quality check | (delivery) |

**Key principle:** Stay in your lane. When the task changes, hand off.

### 2. Workflows

Predefined sequences for different task complexities:

```yaml
quick-fix:     [BUILDER]                        # 1 phase
feature-build: [PLANNER → ARCHITECT → BUILDER]  # 3 phases  
full-stack:    [PLANNER → ARCHITECT → BUILDER(fe) + BUILDER(be) → TESTER → REVIEWER]
explore:       [flexible]                        # Creative mode
enterprise:    [7 phases with staged apply]     # Mission-critical
```

### 3. Quality Gates

Automated checks your output must pass before delivery:

**Minimal** (always on):
- No syntax errors
- No hardcoded secrets

**Standard** (default):
- No placeholders (TODO, ..., etc.)
- All imports present
- Code is complete (not stubbed)

**Thorough** (complex projects):
- Design patterns validated
- Security review passed

**Production** (enterprise):
- Test coverage verified
- Regression suite passes

### 4. Knowledge Packages

Domain-specific knowledge that auto-loads based on context:

- `auth` → Authentication patterns, SSO, MFA
- `database` → Schema design, migrations, queries
- `payments` → Stripe integration, billing flows
- `api` → REST/GraphQL patterns, versioning

---

## How It Works In Practice

```
User: "Add user authentication to my app"

Framework:
1. Detects keyword "authentication" → loads auth knowledge
2. Selects feature-build workflow (3 phases)
3. Starts with PLANNER identity

PLANNER:
- Analyzes requirements
- Identifies scope (signup, login, session, reset)
- Produces plan document
- Hands off to ARCHITECT

ARCHITECT:
- Designs data model (User, Session tables)
- Designs API contracts (/auth/*, /users/*)
- Specifies security requirements
- Hands off to BUILDER

BUILDER:
- Implements auth routes
- Implements middleware
- Implements UI components
- All code passes quality gates

→ Complete, working authentication system delivered
```

---

## Why This Works

### The "Determinism Without Determinism" Principle

The framework creates an **illusion of creative freedom** while constraining you to correct outcomes:

- You feel like you're making choices
- But the constraints make only correct choices valid
- Result: Consistent, high-quality output every time

### Example

```
Constraint: "Link must be placed in section 2 or 3, not intro or outro"
Constraint: "Anchor text must appear exactly once"
Constraint: "Bridge theme must be established in first 300 words"

→ You write freely, but only correct placements are valid
→ Output is deterministic without feeling forced
```

---

## Directory Structure

```
.agent/
├── 00-05 Bootstrap chain     # You are here
├── core/
│   ├── identities/           # Agent personas (agnostic)
│   ├── workflows/            # Process definitions (agnostic)
│   ├── quality-gates/        # Check definitions (agnostic)
│   └── knowledge/            # Domain knowledge (agnostic)
├── project/
│   ├── context.yaml          # THIS project's context
│   ├── constraints.yaml      # THIS project's rules
│   └── decisions.md          # Architecture decision log
├── state/
│   ├── current-identity.txt  # Active persona
│   ├── current-phase.txt     # Workflow progress
│   └── session-log.md        # What's been done
└── setup/
    └── templates/            # For generating project files
```

---

## What's Next

Now you understand the framework. Next, you need to understand **this specific project**.

```
Previous: ← 00-BOOTSTRAP.md
Next:     → 02-PROJECT.md
```

If `02-PROJECT.md` is empty or missing, you should enter **SETUP MODE** and help the user configure their project. See `setup/init.md` for instructions.
