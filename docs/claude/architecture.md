# GSD Architecture

## Overview

GSD is a hierarchical workflow system with lazy-loaded context references, XML-based task definitions, and wave-based parallel execution. It runs entirely within Claude Code's CLI environment.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GSD ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User                                                               │
│    │                                                                │
│    ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SLASH COMMANDS                            │   │
│  │  /gsd:new-project  /gsd:create-roadmap  /gsd:plan-phase     │   │
│  │  /gsd:execute-phase  /gsd:verify-work  /gsd:complete-milestone│  │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      WORKFLOWS                               │   │
│  │  execute-phase.md  execute-plan.md  plan-phase.md           │   │
│  │  create-milestone.md  verify-work.md  resume-project.md     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│              ┌───────────────┼───────────────┐                      │
│              ▼               ▼               ▼                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│  │   TEMPLATES     │ │   REFERENCES    │ │ PROJECT STATE   │       │
│  │                 │ │                 │ │                 │       │
│  │ project.md      │ │ principles.md   │ │ PROJECT.md      │       │
│  │ roadmap.md      │ │ questioning.md  │ │ ROADMAP.md      │       │
│  │ state.md        │ │ tdd.md          │ │ STATE.md        │       │
│  │ phase-prompt.md │ │ checkpoints.md  │ │ config.json     │       │
│  │ summary.md      │ │ git-integration │ │ ISSUES.md       │       │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. Context Engineering as Primary Design Constraint

Everything in GSD is designed around managing Claude's context window:

```
┌──────────────────────────────────────────────────────┐
│              CONTEXT QUALITY CURVE                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Quality │█████████████████                           │
│          │█████████████████                           │
│          │██████████████░░░                           │
│          │███████████░░░░░░                           │
│          │████████░░░░░░░░░                           │
│          │█████░░░░░░░░░░░░                           │
│          │██░░░░░░░░░░░░░░░                           │
│          └───────────────────── Context %            │
│            0%   30%   50%  70%  100%                 │
│                                                       │
│  PEAK     GOOD    DEGRADING   POOR                   │
│  0-30%    30-50%  50-70%      70%+                   │
└──────────────────────────────────────────────────────┘
```

**Key decisions:**
- Plans max out at 2-3 tasks (stays in peak zone)
- Fresh subagent contexts for each plan (200k tokens)
- All context files deliberately size-limited
- STATE.md stays under 150 lines

### 2. Progressive Disclosure Hierarchy

Each layer answers different questions:

```
┌────────────────────────────────────────────────────────────────┐
│                    INFORMATION HIERARCHY                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COMMAND (commands/gsd/*.md)                                   │
│  └─ "What can I invoke?"                                       │
│      │                                                          │
│      ▼                                                          │
│  WORKFLOW (get-shit-done/workflows/*.md)                       │
│  └─ "How does this process work step-by-step?"                 │
│      │                                                          │
│      ▼                                                          │
│  TEMPLATE (get-shit-done/templates/*.md)                       │
│  └─ "What structure should output have?"                       │
│      │                                                          │
│      ▼                                                          │
│  REFERENCE (get-shit-done/references/*.md)                     │
│  └─ "What are the deep rules and exceptions?"                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3. Meta-Prompting Pattern

Commands load workflows which reference templates and references via `@-references`:

```
┌─────────────────────────────────────────────────────────────────┐
│                     META-PROMPTING FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   /gsd:execute-phase 1                                          │
│          │                                                       │
│          ▼ loads                                                 │
│   ┌──────────────────────────────────────────────┐              │
│   │  commands/gsd/execute-phase.md               │              │
│   │  ---                                         │              │
│   │  allowed-tools: [Task, Read, Bash, ...]     │              │
│   │  ---                                         │              │
│   │  @~/.claude/get-shit-done/workflows/        │              │
│   │    execute-phase.md                          │ ◄─ lazy load │
│   └──────────────────────────────────────────────┘              │
│                    │                                             │
│                    ▼ references                                  │
│   ┌──────────────────────────────────────────────┐              │
│   │  workflows/execute-phase.md                  │              │
│   │                                              │              │
│   │  @templates/subagent-task-prompt.md         │ ◄─ lazy load │
│   │  @templates/summary.md                      │ ◄─ lazy load │
│   │  @references/checkpoints.md                 │ ◄─ lazy load │
│   └──────────────────────────────────────────────┘              │
│                                                                  │
│  @-references are signals telling Claude what to read,          │
│  NOT pre-loaded content                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Subagent Orchestration Model

The orchestrator stays lean, delegating heavy work to subagents:

```
┌──────────────────────────────────────────────────────────────────┐
│                    SUBAGENT ORCHESTRATION                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ORCHESTRATOR (15% context)                                      │
│  ├── Discovers plans in phase directory                          │
│  ├── Reads frontmatter for wave numbers                          │
│  ├── Groups plans by wave                                        │
│  ├── Spawns subagents via Task tool                              │
│  └── Collects results                                            │
│                                                                   │
│            ┌──────────────┐                                       │
│            │ Orchestrator │                                       │
│            │   (lean)     │                                       │
│            └──────┬───────┘                                       │
│                   │ spawns                                        │
│      ┌────────────┼────────────┐                                 │
│      ▼            ▼            ▼                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐                             │
│  │Subagent│  │Subagent│  │Subagent│   Wave 1 (parallel)         │
│  │ Plan 1 │  │ Plan 2 │  │ Plan 3 │                             │
│  │ 200k   │  │ 200k   │  │ 200k   │                             │
│  └────────┘  └────────┘  └────────┘                             │
│      │            │            │                                  │
│      └────────────┼────────────┘                                 │
│                   │ wait                                          │
│                   ▼                                               │
│            ┌────────────┐                                         │
│            │  Subagent  │   Wave 2                               │
│            │   Plan 4   │                                        │
│            │   200k     │                                        │
│            └────────────┘                                         │
│                                                                   │
│  Each subagent:                                                  │
│  - Gets fresh 200k context                                       │
│  - Loads execute-plan.md workflow                                │
│  - Executes tasks with full capacity                             │
│  - Creates SUMMARY.md, commits                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 5. Atomic Git Strategy

Each task gets its own commit for observability and failure recovery:

```
┌──────────────────────────────────────────────────────────────────┐
│                     ATOMIC COMMIT STRATEGY                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Plan 08-02 Execution                                            │
│                                                                   │
│  Task 1: Create user model                                       │
│     └─► git commit -m "feat(08-02): create user model"          │
│                                                                   │
│  Task 2: Add password hashing                                    │
│     └─► git commit -m "feat(08-02): add password hashing"       │
│                                                                   │
│  Task 3: Create registration endpoint                            │
│     └─► git commit -m "feat(08-02): create registration endpoint"│
│                                                                   │
│  Metadata (SUMMARY + STATE + ROADMAP)                            │
│     └─► git commit -m "docs(08-02): complete user-registration"  │
│                                                                   │
│  ───────────────────────────────────────────────────────────     │
│                                                                   │
│  Resulting git log:                                              │
│                                                                   │
│  abc123f docs(08-02): complete user-registration                 │
│  def456g feat(08-02): create registration endpoint               │
│  hij789k feat(08-02): add password hashing                       │
│  lmn012o feat(08-02): create user model                          │
│                                                                   │
│  Benefits:                                                        │
│  • git bisect finds exact failing task                           │
│  • Each task independently revertable                            │
│  • Git history = context source for future Claude sessions       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Directory Structure

```
get-shit-done/
├── bin/
│   └── install.js              # CLI installation script
│
├── commands/gsd/               # 28 slash commands (entry points)
│   ├── new-project.md          # Initialize project
│   ├── create-roadmap.md       # Create roadmap + state
│   ├── plan-phase.md           # Plan a phase
│   ├── execute-phase.md        # Execute all plans in phase (parallel)
│   ├── execute-plan.md         # Execute single plan (interactive)
│   ├── verify-work.md          # User acceptance testing
│   ├── complete-milestone.md   # Ship and archive
│   ├── map-codebase.md         # Analyze existing codebase
│   ├── status.md               # Check execution status
│   └── [18 more commands...]
│
├── get-shit-done/
│   ├── templates/              # 21 output structure templates
│   │   ├── project.md          # PROJECT.md structure
│   │   ├── roadmap.md          # ROADMAP.md structure
│   │   ├── state.md            # STATE.md structure
│   │   ├── phase-prompt.md     # PLAN.md structure
│   │   ├── summary.md          # SUMMARY.md structure
│   │   └── codebase/           # 7 brownfield analysis templates
│   │
│   ├── workflows/              # 16 detailed process definitions
│   │   ├── execute-phase.md    # Parallel execution orchestration
│   │   ├── execute-plan.md     # Single plan execution (54K lines!)
│   │   ├── plan-phase.md       # Phase planning process
│   │   └── [13 more workflows...]
│   │
│   └── references/             # 14 deep-dive reference docs
│       ├── principles.md       # Core GSD principles
│       ├── questioning.md      # Discovery question patterns
│       ├── tdd.md              # TDD plan structure
│       ├── checkpoints.md      # Checkpoint patterns
│       ├── git-integration.md  # Atomic commit strategy
│       └── debugging/          # 5 debugging reference docs
│
└── GSD-STYLE.md                # Comprehensive style guide
```

### Component Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT RELATIONSHIPS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  COMMANDS invoke WORKFLOWS                                          │
│     │                                                                │
│     │  /gsd:execute-phase ──► workflows/execute-phase.md            │
│     │  /gsd:plan-phase    ──► workflows/plan-phase.md               │
│     │  /gsd:verify-work   ──► workflows/verify-work.md              │
│                                                                      │
│  WORKFLOWS use TEMPLATES for output                                  │
│     │                                                                │
│     │  execute-plan.md ──► templates/summary.md                     │
│     │  plan-phase.md   ──► templates/phase-prompt.md                │
│     │  new-project.md  ──► templates/project.md                     │
│                                                                      │
│  WORKFLOWS reference REFERENCES for rules                            │
│     │                                                                │
│     │  execute-plan.md ──► references/checkpoints.md                │
│     │  execute-plan.md ──► references/tdd.md                        │
│     │  plan-phase.md   ──► references/plan-format.md                │
│                                                                      │
│  ALL read/write PROJECT STATE                                        │
│     │                                                                │
│     │  Every workflow reads: PROJECT.md, ROADMAP.md, STATE.md       │
│     │  Execution writes:     PLAN.md, SUMMARY.md, updates STATE.md  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Execution Models

### Interactive Mode

User confirms at each step:

```
User ──► /gsd:execute-plan
              │
              ▼
         Load plan ──► "Proceed?" ──► User confirms
              │
              ▼
         Task 1 ──► Execute ──► Commit
              │
              ▼
         Task 2 ──► Execute ──► Commit
              │
              ▼
         Checkpoint ──► "Verify?" ──► User confirms
              │
              ▼
         Task 3 ──► Execute ──► Commit
              │
              ▼
         Create SUMMARY ──► Commit metadata
              │
              ▼
         "Next plan?" ──► User decides
```

### YOLO Mode (Recommended)

Frictionless automation with auto-approval:

```
User ──► /gsd:execute-phase 1
              │
              ▼
         ┌─────────────────────────────┐
         │   Discover plans            │
         │   Group by wave             │
         │   Auto-approve execution    │
         └─────────────────────────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
  ┌────────┐     ┌────────┐     Wave 1 (parallel)
  │ Plan 1 │     │ Plan 2 │
  │ auto   │     │ auto   │
  └────────┘     └────────┘
      │               │
      └───────┬───────┘
              │ wait
              ▼
         ┌────────┐             Wave 2
         │ Plan 3 │
         │ auto   │
         └────────┘
              │
              ▼
         All complete ──► Offer next phase
```

## Deviation Handling

Plans are guides, not straitjackets. During execution:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DEVIATION RULES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PRIORITY ORDER:                                                    │
│                                                                      │
│  1. RULE 4 (Ask) ──► STOP for architectural decisions              │
│     │  Examples: new tables, framework changes, API contracts       │
│     │  Action: Present to user, wait for decision                   │
│     │                                                                │
│  2. RULES 1-3 (Fix) ──► Auto-fix and document                      │
│     │                                                                │
│     │  Rule 1: Auto-fix bugs                                        │
│     │  Rule 2: Auto-add missing critical (security, validation)     │
│     │  Rule 3: Auto-fix blockers (missing deps, broken imports)     │
│     │                                                                │
│  3. RULE 5 (Log) ──► Log enhancement to ISSUES.md, continue        │
│     │  Examples: performance optimizations, refactoring, docs       │
│     │  Action: Add ISS-XXX entry, brief notification, continue      │
│                                                                      │
│  Decision heuristic:                                                │
│  "Does this affect correctness, security, or ability to complete?" │
│                                                                      │
│    YES ──► Rules 1-3 (fix automatically)                           │
│    NO  ──► Rule 5 (log it)                                         │
│    MAYBE ──► Rule 4 (ask user)                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## TDD Integration

TDD plans get dedicated treatment due to context consumption:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TDD EXECUTION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Standard Plan:                      TDD Plan:                      │
│  • Multiple tasks                    • Single feature               │
│  • 1 commit per task                 • RED-GREEN-REFACTOR cycle     │
│  • 2-4 commits total                 • 2-3 commits per feature      │
│                                                                      │
│  TDD Execution:                                                     │
│                                                                      │
│  ┌─────────────────┐                                                │
│  │     RED         │  Write failing test                            │
│  │  test(08-02):   │  └─► git commit                               │
│  │  add failing    │                                                │
│  │  test for X     │                                                │
│  └────────┬────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │    GREEN        │  Implement to pass                             │
│  │  feat(08-02):   │  └─► git commit                               │
│  │  implement X    │                                                │
│  └────────┬────────┘                                                │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐                                                │
│  │   REFACTOR      │  Clean up (optional)                          │
│  │  refactor(08-02)│  └─► git commit                               │
│  │  clean up X     │                                                │
│  └─────────────────┘                                                │
│                                                                      │
│  Why dedicated plans:                                               │
│  TDD requires 2-3 cycles, each with file reads, test runs, and     │
│  potential debugging. This consumes 40-50% context per feature.    │
│  Dedicated plans ensure full quality throughout the cycle.         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Installation Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      INSTALLATION FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  npx get-shit-done-cc                                               │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  bin/install.js                                          │       │
│  │                                                          │       │
│  │  1. Determine install mode:                              │       │
│  │     --global (-g) ──► ~/.claude/                        │       │
│  │     --local (-l)  ──► ./.claude/                        │       │
│  │     (prompt)      ──► User chooses                      │       │
│  │                                                          │       │
│  │  2. Copy files:                                          │       │
│  │     commands/gsd/ ──► {target}/commands/gsd/            │       │
│  │     get-shit-done/ ──► {target}/get-shit-done/          │       │
│  │                                                          │       │
│  │  3. Replace path placeholders:                           │       │
│  │     @~/.claude/get-shit-done/ ──► @{actual_path}        │       │
│  │                                                          │       │
│  │  4. Verify installation:                                 │       │
│  │     Check commands/ directory exists                     │       │
│  │     Check get-shit-done/ directory exists                │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  Environment variables:                                             │
│  • CLAUDE_CONFIG_DIR ──► Override default config location          │
│  • --config-dir <path> ──► Explicit path override                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Anti-Patterns (What GSD Avoids)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ANTI-ENTERPRISE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GSD is explicitly NOT for enterprise patterns:                     │
│                                                                      │
│  ✗ Team structures, RACI matrices                                  │
│  ✗ Stakeholder management                                          │
│  ✗ Sprint ceremonies                                               │
│  ✗ Human dev time estimates (hours, days, weeks)                   │
│  ✗ Change management processes                                      │
│  ✗ Documentation for documentation's sake                           │
│                                                                      │
│  GSD IS for:                                                        │
│                                                                      │
│  ✓ Solo developer + Claude                                         │
│  ✓ Context-optimized execution                                     │
│  ✓ Atomic commits for AI observability                             │
│  ✓ Plans as executable prompts                                     │
│  ✓ Ship fast: Plan → Execute → Ship → Learn → Repeat               │
│                                                                      │
│  "If it sounds like corporate PM theater, delete it."              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## See Also

- [Data Flow](./data-flow.md) - How data moves through the system
- [Commands](./commands.md) - Complete command reference
- [Workflows](./workflows.md) - Detailed workflow processes
- [Configuration](./configuration.md) - Setup options
