# GSD Configuration Guide

This document covers installation, configuration options, and setup for Get Shit Done.

## Installation

### Quick Install

```bash
npx get-shit-done-cc
```

This runs the interactive installer which prompts for installation location.

### Installation Options

```bash
# Interactive (default) - prompts for location
npx get-shit-done-cc

# Global install - to ~/.claude/
npx get-shit-done-cc --global
npx get-shit-done-cc -g

# Local install - to ./.claude/
npx get-shit-done-cc --local
npx get-shit-done-cc -l

# Custom directory
npx get-shit-done-cc --config-dir /path/to/config

# Via environment variable
CLAUDE_CONFIG_DIR=/path/to/config npx get-shit-done-cc
```

### What Gets Installed

```
{config_dir}/
├── commands/gsd/           # 26 slash commands
│   ├── new-project.md
│   ├── create-roadmap.md
│   ├── plan-phase.md
│   ├── execute-phase.md
│   └── [22 more commands]
│
└── get-shit-done/          # Core system
    ├── templates/          # 21 templates
    ├── workflows/          # 16 workflows
    └── references/         # 14 reference docs
```

### Installation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      INSTALLATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  npx get-shit-done-cc                                                   │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────┐           │
│  │  bin/install.js                                          │           │
│  │                                                          │           │
│  │  1. Determine install mode:                              │           │
│  │     --global (-g) ──► ~/.claude/                        │           │
│  │     --local (-l)  ──► ./.claude/                        │           │
│  │     (prompt)      ──► User chooses                      │           │
│  │                                                          │           │
│  │  2. Copy files:                                          │           │
│  │     commands/gsd/ ──► {target}/commands/gsd/            │           │
│  │     get-shit-done/ ──► {target}/get-shit-done/          │           │
│  │                                                          │           │
│  │  3. Replace path placeholders:                           │           │
│  │     @~/.claude/get-shit-done/ ──► @{actual_path}        │           │
│  │                                                          │           │
│  │  4. Verify installation:                                 │           │
│  │     Check directories exist                              │           │
│  └──────────────────────────────────────────────────────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Configuration

Each GSD project has a configuration file at `.planning/config.json`.

### Default Configuration

```json
{
  "mode": "interactive",
  "depth": "standard",
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

### Recommended Configuration (YOLO Mode)

```json
{
  "mode": "yolo",
  "depth": "standard",
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  },
  "gates": {
    "confirm_project": false,
    "confirm_phases": false,
    "confirm_roadmap": false,
    "confirm_breakdown": false,
    "confirm_plan": false,
    "execute_next_plan": false,
    "issues_review": false,
    "confirm_transition": false
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

---

## Configuration Options

### Mode

```json
{
  "mode": "interactive" | "yolo"
}
```

| Mode | Description |
|------|-------------|
| `interactive` | Confirms each major decision, pauses at checkpoints |
| `yolo` | Auto-approves most decisions, minimal interruptions (recommended) |

**Interactive Mode:**
- Confirms project details before saving
- Confirms phases before creating roadmap
- Confirms each plan before execution
- Pauses at all checkpoints
- Good for: Learning GSD, critical projects

**YOLO Mode:**
- Auto-approves non-critical decisions
- Only stops for critical checkpoints
- Maximizes execution speed
- Good for: Experienced users, rapid development

---

### Depth

```json
{
  "depth": "quick" | "standard" | "comprehensive"
}
```

Controls the granularity of roadmap planning:

| Depth | Phases | Plans per Phase | Use Case |
|-------|--------|-----------------|----------|
| `quick` | 3-5 | 1-3 | Small projects, prototypes |
| `standard` | 5-8 | 3-5 | Most projects (default) |
| `comprehensive` | 8-12 | 5-10 | Large complex projects |

---

### Parallelization

```json
{
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable parallel execution |
| `plan_level` | boolean | `true` | Run plans in parallel (wave-based) |
| `task_level` | boolean | `false` | Run tasks within plan in parallel (not recommended) |
| `skip_checkpoints` | boolean | `true` | Skip human checkpoints in parallel mode |
| `max_concurrent_agents` | number | `3` | Maximum simultaneous subagents |
| `min_plans_for_parallel` | number | `2` | Minimum plans to trigger parallelization |

**Parallelization Architecture:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PARALLEL EXECUTION                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Orchestrator (15% context)                                             │
│       │                                                                  │
│       │  max_concurrent_agents: 3                                       │
│       │                                                                  │
│       ├──────────────────────────────────┐                              │
│       │                                   │                              │
│  Wave 1 (parallel):                       │                              │
│       │                                   │                              │
│  ┌────┴────┐  ┌─────────┐  ┌─────────┐   │                              │
│  │Agent 1  │  │Agent 2  │  │Agent 3  │   │  (3 concurrent)             │
│  │Plan 01  │  │Plan 02  │  │Plan 03  │   │                              │
│  │ 200k    │  │ 200k    │  │ 200k    │   │                              │
│  └─────────┘  └─────────┘  └─────────┘   │                              │
│       │            │            │         │                              │
│       └────────────┴────────────┘         │                              │
│                    │                       │                              │
│              wait for all                 │                              │
│                    │                       │                              │
│                    ▼                       │                              │
│  Wave 2:                                   │                              │
│  ┌─────────┐  ┌─────────┐                 │                              │
│  │Agent 4  │  │Agent 5  │                 │  (2 concurrent)             │
│  │Plan 04  │  │Plan 05  │                 │                              │
│  └─────────┘  └─────────┘                 │                              │
│                                            │                              │
└────────────────────────────────────────────┘                              │
                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Gates

```json
{
  "gates": {
    "confirm_project": true,
    "confirm_phases": true,
    "confirm_roadmap": true,
    "confirm_breakdown": true,
    "confirm_plan": true,
    "execute_next_plan": true,
    "issues_review": true,
    "confirm_transition": true
  }
}
```

| Gate | When Triggered | If True |
|------|----------------|---------|
| `confirm_project` | After PROJECT.md created | Ask to confirm before saving |
| `confirm_phases` | After phases identified | Ask to confirm phase list |
| `confirm_roadmap` | After ROADMAP.md created | Ask to confirm before saving |
| `confirm_breakdown` | After plans created | Ask to confirm plan breakdown |
| `confirm_plan` | Before executing each plan | Ask to confirm execution |
| `execute_next_plan` | After plan completes | Ask to execute next plan |
| `issues_review` | When issues encountered | Ask to review issues |
| `confirm_transition` | Before phase/milestone transition | Ask to confirm transition |

**Setting all gates to `false`** is equivalent to YOLO mode behavior.

---

### Safety

```json
{
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  }
}
```

| Option | Description |
|--------|-------------|
| `always_confirm_destructive` | Confirm before file deletions, database drops, etc. |
| `always_confirm_external_services` | Confirm before calls to external APIs/services |

**Recommendation:** Keep both `true` even in YOLO mode.

---

## Running Claude Code with GSD

### Recommended Startup

For the best GSD experience, run Claude Code with permission skipping:

```bash
claude --dangerously-skip-permissions
```

This avoids 50+ permission prompts during execution.

### Standard Startup

```bash
claude
```

You'll be prompted for permissions as Claude executes commands.

---

## Project File Structure

After initialization, your project will have:

```
your-project/
├── .planning/
│   ├── PROJECT.md                # Vision, requirements, constraints
│   ├── ROADMAP.md                # Phases with dependencies
│   ├── STATE.md                  # Living memory file
│   ├── config.json               # Workflow configuration
│   ├── ISSUES.md                 # Deferred enhancements (created when needed)
│   │
│   ├── codebase/                 # (Brownfield only)
│   │   ├── STACK.md              # Languages, frameworks, dependencies
│   │   ├── ARCHITECTURE.md       # Patterns, layers, data flow
│   │   ├── STRUCTURE.md          # Directory layout
│   │   ├── CONVENTIONS.md        # Code style, naming
│   │   ├── TESTING.md            # Test framework, patterns
│   │   ├── INTEGRATIONS.md       # External services, APIs
│   │   └── CONCERNS.md           # Tech debt, known issues
│   │
│   ├── phases/
│   │   ├── 01-phase-name/
│   │   │   ├── 01-01-PLAN.md     # Executable plan
│   │   │   ├── 01-01-SUMMARY.md  # Execution results
│   │   │   ├── 01-02-PLAN.md
│   │   │   └── 01-02-SUMMARY.md
│   │   ├── 02-phase-name/
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── todos/                    # Ideas captured during work
│   │   ├── pending/
│   │   └── done/
│   │
│   ├── debug/                    # Debug sessions
│   │   └── resolved/
│   │
│   └── milestones/               # Archived milestones
│       └── milestone-01-v1.0/
│
└── [your project files]
```

---

## File Naming Conventions

### Phases

```
.planning/phases/
├── 01-foundation/           # Integer phases (planned)
├── 02-authentication/
├── 02.1-hotfix/             # Decimal phases (inserted)
├── 03-features/
└── ...
```

### Plans

```
{phase}-{plan}-PLAN.md
{phase}-{plan}-SUMMARY.md

Examples:
01-01-PLAN.md          # Phase 1, Plan 1
01-02-PLAN.md          # Phase 1, Plan 2
02.1-01-PLAN.md        # Phase 2.1 (inserted), Plan 1
```

### Frontmatter

PLAN.md files include frontmatter:

```yaml
---
phase: 01
plan: 02
type: standard       # or "tdd"
wave: 1              # Execution wave (pre-computed)
depends_on: []       # Plan dependencies
files_modified: []   # Expected files
autonomous: true     # Has checkpoints?
---
```

---

## Context Size Management

GSD is designed around Claude's context limitations:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONTEXT MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  QUALITY CURVE                                                          │
│                                                                          │
│  Quality │█████████████████                                             │
│          │█████████████████         0-30%:  Peak quality                │
│          │██████████████░░░         30-50%: Good quality                │
│          │███████████░░░░░░         50-70%: Degrading                   │
│          │████████░░░░░░░░░         70%+:   Poor quality                │
│          │█████░░░░░░░░░░░░                                             │
│          │██░░░░░░░░░░░░░░░                                             │
│          └───────────────────── Context %                               │
│            0%   30%   50%  70%  100%                                    │
│                                                                          │
│  GSD MITIGATIONS                                                        │
│  ───────────────                                                        │
│  • Plans: 2-3 tasks maximum (stays in peak zone)                       │
│  • Subagents: Fresh 200k context per plan                              │
│  • STATE.md: Under 150 lines (fast loading)                            │
│  • Orchestrator: ~15% context (coordination only)                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Best Practices

1. **Use `/clear` between phases** - Fresh context for planning/execution
2. **Let parallelization work** - Each subagent gets full context
3. **Keep STATE.md lean** - Prune old decisions periodically
4. **Trust atomic commits** - Git history is your context source

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAUDE_CONFIG_DIR` | Override Claude config directory |

---

## Troubleshooting

### Commands Not Found

```bash
# Verify installation
ls ~/.claude/commands/gsd/

# Or for local install
ls ./.claude/commands/gsd/
```

If missing, reinstall:
```bash
npx get-shit-done-cc --global
```

### Permission Issues

Run Claude with permission skipping:
```bash
claude --dangerously-skip-permissions
```

### Config Not Applied

1. Check `.planning/config.json` exists
2. Verify JSON syntax is valid
3. Ensure you're in the project directory

### Parallel Execution Fails

1. Check `max_concurrent_agents` isn't too high
2. Verify plans have `wave` numbers in frontmatter
3. Check `parallelization.enabled` is `true`

### STATE.md Missing

```bash
# Reconstruct from artifacts
cat .planning/ROADMAP.md  # Check current phase
ls .planning/phases/*/    # Find completed plans
```

Or run:
```bash
/gsd:resume-work
```

---

## See Also

- [Architecture](./architecture.md) - System architecture
- [Data Flow](./data-flow.md) - How data moves through the system
- [Commands](./commands.md) - Complete command reference
- [Workflows](./workflows.md) - Detailed workflow processes
