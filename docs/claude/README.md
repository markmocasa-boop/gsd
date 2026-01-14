# Get Shit Done (GSD) - Technical Documentation

This documentation provides a comprehensive technical reference for the Get Shit Done (GSD) system - a meta-prompting, context engineering, and spec-driven development framework for Claude Code.

## Purpose

GSD solves **context rot** - the quality degradation that occurs as Claude's context window fills during long development sessions. It optimizes for:

- Solo developer + Claude workflow (not teams)
- Context engineering (managing Claude's context window deliberately)
- Plans as executable prompts (not documents to transform)

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture, core principles, component overview |
| [Data Flow](./data-flow.md) | How data moves through the system with diagrams |
| [Commands](./commands.md) | Complete slash command reference |
| [Workflows](./workflows.md) | Detailed workflow processes |
| [Configuration](./configuration.md) | Setup options and configuration reference |

## Quick Start

```bash
# Install GSD
npx get-shit-done-cc

# Start a new project
/gsd:new-project

# Create roadmap
/gsd:create-roadmap

# Plan first phase
/gsd:plan-phase 1

# Execute phase (parallel)
/gsd:execute-phase 1

# Complete milestone
/gsd:complete-milestone
```

## Core Concepts

### Context Rot Prevention

```
Quality degradation curve:
┌────────────────────────────────────────────┐
│ 0-30%  context: ████████████ Peak quality  │
│ 30-50% context: ████████░░░░ Good quality  │
│ 50-70% context: █████░░░░░░░ Degrading     │
│ 70%+   context: ██░░░░░░░░░░ Poor quality  │
└────────────────────────────────────────────┘
```

**Solution:** Fresh subagent contexts for each plan, aggressive atomicity (2-3 tasks per plan).

### Plans ARE Prompts

PLAN.md files are not documents that get transformed - they ARE the executable prompts:

```
PLAN.md
├── <objective>        → What and why
├── <execution_context> → File references (@-references)
├── <context>          → Dynamic content
├── <tasks>            → XML-structured work
└── <success_criteria> → Measurable completion
```

### Wave-Based Parallel Execution

Plans declare `wave: N` in frontmatter. Independent plans execute in parallel:

```
Wave 1 (parallel): plan-01, plan-02
    ↓ wait
Wave 2 (parallel): plan-03, plan-04
    ↓ wait
Wave 3: plan-05
```

## File Structure

```
.planning/
├── PROJECT.md                    # Vision, requirements, constraints
├── ROADMAP.md                    # Phases with dependencies
├── STATE.md                      # Living memory (session continuity)
├── config.json                   # Workflow preferences
├── ISSUES.md                     # Deferred enhancements
├── codebase/                     # (Optional) Brownfield analysis
│   └── [7 analysis documents]
└── phases/
    └── XX-phase-name/
        ├── XX-YY-PLAN.md         # Executable plan
        └── XX-YY-SUMMARY.md      # Execution results
```

## System Statistics

- **Markdown Files:** 109 total
- **Commands:** 28 slash commands
- **Templates:** 21 distinct templates (+7 codebase)
- **Workflows:** 16 detailed processes
- **References:** 14 deep-dive docs
- **Version:** 1.4.15

## Further Reading

- [Core Principles](../../get-shit-done/references/principles.md)
- [Plan Format](../../get-shit-done/references/plan-format.md)
- [Git Integration](../../get-shit-done/references/git-integration.md)
- [TDD Guide](../../get-shit-done/references/tdd.md)
