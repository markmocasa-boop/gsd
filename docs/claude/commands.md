# GSD Command Reference

This document provides a comprehensive reference for all 26 GSD slash commands.

## Command Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GSD COMMAND CATEGORIES                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INITIALIZATION (4)          EXECUTION (4)          ROADMAP (3)         │
│  ──────────────────         ─────────────          ───────────         │
│  new-project                 execute-plan          add-phase            │
│  create-roadmap              execute-phase         insert-phase         │
│  map-codebase                status                remove-phase         │
│                              verify-work                                 │
│                                                                          │
│  PLANNING (4)                MILESTONE (3)         SESSION (2)          │
│  ───────────                 ────────────          ──────────           │
│  discuss-phase               discuss-milestone     pause-work           │
│  research-phase              new-milestone         resume-work          │
│  list-phase-assumptions      complete-milestone                         │
│  plan-phase                                                             │
│                                                                          │
│  ISSUES & TODOS (4)          UTILITY (2)                                │
│  ─────────────────          ───────────                                │
│  consider-issues             help                                       │
│  plan-fix                    progress                                   │
│  add-todo                    debug                                      │
│  check-todos                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Primary Workflow Commands

### `/gsd:new-project`

Initialize a new project with deep context gathering.

```
Source: commands/gsd/new-project.md
Tools:  Read, Bash, Write, AskUserQuestion
```

**What it does:**
- Creates `.planning/` directory structure
- Conducts multi-round questioning to gather vision, requirements, constraints
- Creates `PROJECT.md` with project definition
- Creates `config.json` with workflow preferences

**Example:**
```
/gsd:new-project

# Claude asks deep questions:
# - What problem are you solving?
# - Who is the target user?
# - What are the must-have features?
# - What constraints exist?

# Creates:
# .planning/
# ├── PROJECT.md
# └── config.json
```

---

### `/gsd:create-roadmap`

Create roadmap and state tracking for initialized project.

```
Source: commands/gsd/create-roadmap.md
Tools:  Read, Write, Bash
```

**What it does:**
- Reads PROJECT.md to understand requirements
- Creates phased roadmap based on config.json depth setting
- Creates STATE.md for session continuity
- Creates phase directories

**Output:**
```
.planning/
├── ROADMAP.md                  # Phase breakdown with dependencies
├── STATE.md                    # Living memory file
└── phases/
    ├── 01-phase-name/
    ├── 02-phase-name/
    └── ...
```

---

### `/gsd:plan-phase <number>`

Create detailed execution plans for a specific phase.

```
Source: commands/gsd/plan-phase.md
Args:   Phase number (e.g., "1", "2", "3.1")
Tools:  Read, Write, Bash, Glob, Grep, Task
```

**What it does:**
- Loads project context (PROJECT.md, ROADMAP.md, STATE.md)
- Analyzes phase requirements and dependencies
- Determines discovery level (0-3) based on unknowns
- Creates PLAN.md files with 2-3 tasks each
- Pre-computes wave numbers for parallel execution
- Identifies TDD candidates

**Output:**
```
.planning/phases/01-foundation/
├── 01-01-PLAN.md       # wave: 1, autonomous: true
├── 01-02-PLAN.md       # wave: 1, autonomous: true
└── 01-03-PLAN.md       # wave: 2, depends_on: [01-01, 01-02]
```

---

### `/gsd:execute-phase <phase-number>`

Execute all plans in a phase with wave-based parallelization.

```
Source: commands/gsd/execute-phase.md
Args:   Phase number
Tools:  Read, Write, Edit, Glob, Grep, Bash, Task, TodoWrite, AskUserQuestion
```

**What it does:**
- Discovers all PLAN.md files in phase
- Skips completed plans (have SUMMARY.md)
- Groups plans by wave number
- Spawns parallel subagents for each wave
- Waits for all agents in wave before next wave
- Collects results and updates ROADMAP.md

**Execution flow:**
```
Wave 1: [plan-01, plan-02] → parallel execution
          │
          ▼ wait
Wave 2: [plan-03, plan-04] → parallel execution
          │
          ▼ wait
Wave 3: [plan-05] → single execution
          │
          ▼
       Complete
```

---

### `/gsd:execute-plan <path>`

Execute a single PLAN.md file interactively.

```
Source: commands/gsd/execute-plan.md
Args:   Path to PLAN.md file
Tools:  Read, Write, Edit, Glob, Grep, Bash, NotebookEdit, Task, TodoWrite, AskUserQuestion
```

**What it does:**
- Loads plan and context files
- Executes tasks sequentially
- Commits each task atomically
- Handles checkpoints interactively
- Creates SUMMARY.md on completion
- Updates STATE.md

---

### `/gsd:verify-work [phase]`

User acceptance testing for completed work.

```
Source: commands/gsd/verify-work.md
Args:   Optional phase number
Tools:  Read, Bash, Glob, Grep, Task
```

**What it does:**
- Presents completed work for user verification
- Walks through verification steps from SUMMARY files
- Collects user feedback on issues
- Routes to `/gsd:plan-fix` if issues found

---

### `/gsd:complete-milestone`

Archive completed milestone and prepare for next version.

```
Source: commands/gsd/complete-milestone.md
Tools:  Read, Write, Bash, Glob
```

**What it does:**
- Verifies all phases are complete
- Archives phases in `<details>` tags in ROADMAP.md
- Creates milestone archive in milestones/ directory
- Creates git tag for the release
- Moves open issues to ISSUES.md
- Resets STATE.md for next milestone

---

## Phase Planning Commands

### `/gsd:discuss-phase <number>`

Gather context about how you envision a phase.

```
Source: commands/gsd/discuss-phase.md
Args:   Phase number
Tools:  Read, Write, AskUserQuestion
```

**What it does:**
- Asks questions about your vision for the phase
- Captures what's essential vs nice-to-have
- Documents boundaries and constraints
- Creates CONTEXT.md in phase directory

**Use when:** You have specific ideas about how something should look, feel, or work.

---

### `/gsd:research-phase <number>`

Deep ecosystem research for specialized domains.

```
Source: commands/gsd/research-phase.md
Args:   Phase number
Tools:  Read, Write, Glob, Grep, WebSearch, WebFetch, Task
```

**What it does:**
- Researches how experts build in the domain
- Discovers standard stacks, architecture patterns
- Identifies common pitfalls and best practices
- Creates RESEARCH.md in phase directory

**Use when:** Working with 3D, games, audio, shaders, ML, or other specialized domains.

---

### `/gsd:list-phase-assumptions <number>`

See Claude's planned approach before execution.

```
Source: commands/gsd/list-phase-assumptions.md
Args:   Phase number
Tools:  Read
```

**What it does:**
- Shows Claude's intended approach
- Lists assumptions about implementation
- Allows course correction before planning
- No files created (conversational only)

---

## Roadmap Management Commands

### `/gsd:add-phase <description>`

Add new phase to end of current milestone.

```
Source: commands/gsd/add-phase.md
Args:   Phase description
Tools:  Read, Write, Edit, Bash
```

**What it does:**
- Appends new phase to ROADMAP.md
- Uses next sequential number
- Creates phase directory
- Commits changes

**Example:**
```
/gsd:add-phase "Add admin dashboard"
# Creates Phase 6 if Phase 5 was last
```

---

### `/gsd:insert-phase <after> <description>`

Insert urgent work as decimal phase.

```
Source: commands/gsd/insert-phase.md
Args:   After phase number, description
Tools:  Read, Write, Edit, Bash
```

**What it does:**
- Creates intermediate phase (e.g., 7.1 between 7 and 8)
- Marks phase as INSERTED in ROADMAP.md
- Maintains phase ordering

**Example:**
```
/gsd:insert-phase 7 "Fix critical auth bug"
# Creates Phase 7.1
```

---

### `/gsd:remove-phase <number>`

Remove a future phase and renumber.

```
Source: commands/gsd/remove-phase.md
Args:   Phase number
Tools:  Read, Write, Edit, Bash
```

**What it does:**
- Validates phase is not started
- Deletes phase directory
- Renumbers subsequent phases
- Updates ROADMAP.md

---

## Milestone Management Commands

### `/gsd:discuss-milestone`

Figure out what to build in next milestone.

```
Source: commands/gsd/discuss-milestone.md
Tools:  Read, AskUserQuestion
```

**What it does:**
- Reviews previous milestone accomplishments
- Gathers ideas for next milestone
- Routes to `/gsd:new-milestone` when ready

---

### `/gsd:new-milestone <name>`

Create new milestone with phases.

```
Source: commands/gsd/new-milestone.md
Args:   Milestone name
Tools:  Read, Write, Edit, Bash, AskUserQuestion
```

**What it does:**
- Adds milestone section to ROADMAP.md
- Creates phase directories
- Updates STATE.md

---

## Session Management Commands

### `/gsd:pause-work`

Create context handoff when pausing mid-phase.

```
Source: commands/gsd/pause-work.md
Tools:  Read, Write, Bash
```

**What it does:**
- Creates `.continue-here` file with current state
- Updates STATE.md session continuity section
- Captures in-progress work context

---

### `/gsd:resume-work`

Resume work with full context restoration.

```
Source: commands/gsd/resume-work.md
Tools:  Read, Bash
```

**What it does:**
- Reads STATE.md for project context
- Loads `.continue-here` file if exists
- Shows current position and progress
- Offers next actions

---

## Issue & Todo Management Commands

### `/gsd:consider-issues`

Review deferred issues with codebase context.

```
Source: commands/gsd/consider-issues.md
Tools:  Read, Write, Edit, Bash, Glob, Grep, Task
```

**What it does:**
- Analyzes open issues against codebase
- Identifies resolved issues (can close)
- Identifies urgent issues (should fix now)
- Identifies natural fits for upcoming phases
- Offers batch actions

---

### `/gsd:plan-fix [plan]`

Plan fixes for UAT issues.

```
Source: commands/gsd/plan-fix.md
Args:   Optional plan reference
Tools:  Read, Write, Edit, Bash, Glob, Grep
```

**What it does:**
- Reviews UAT issues from verify-work
- Creates fix plan with targeted tasks
- Integrates with existing plan or creates new

---

### `/gsd:add-todo [description]`

Capture idea or task as todo.

```
Source: commands/gsd/add-todo.md
Args:   Optional description
Tools:  Read, Write, Bash
```

**What it does:**
- Extracts context from conversation (or uses description)
- Creates todo file in `.planning/todos/pending/`
- Infers area from file paths
- Checks for duplicates

---

### `/gsd:check-todos [area]`

List and work on pending todos.

```
Source: commands/gsd/check-todos.md
Args:   Optional area filter
Tools:  Read, Write, Bash, Glob
```

**What it does:**
- Lists pending todos with title, area, age
- Optionally filters by area
- Loads full context for selected todo
- Routes to appropriate action

---

## Utility Commands

### `/gsd:progress`

Check project status and route to next action.

```
Source: commands/gsd/progress.md
Tools:  Read, Bash, Glob
```

**What it does:**
- Shows visual progress bar
- Summarizes recent work
- Displays current position
- Lists key decisions and issues
- Offers next actions

---

### `/gsd:status [--wait]`

Check status of background agents.

```
Source: commands/gsd/status.md
Args:   Optional --wait flag
Tools:  Read, BashOutput
```

**What it does:**
- Shows running/completed agents
- Polls agent status from agent-history.json
- With `--wait`: blocks until complete

---

### `/gsd:debug [issue description]`

Systematic debugging with persistent state.

```
Source: commands/gsd/debug.md
Args:   Optional issue description
Tools:  Read, Write, Edit, Bash, Glob, Grep, Task
```

**What it does:**
- Gathers symptoms through questioning
- Creates `.planning/debug/[slug].md` file
- Investigates using scientific method
- Survives `/clear` - run without args to resume
- Archives resolved issues

**Example:**
```
/gsd:debug "login button doesn't work"
# ... investigation, context fills ...
/clear
/gsd:debug          # Resume from where you left off
```

---

### `/gsd:help`

Show command reference.

```
Source: commands/gsd/help.md
Tools:  (none)
```

---

### `/gsd:map-codebase`

Analyze existing codebase for brownfield projects.

```
Source: commands/gsd/map-codebase.md
Tools:  Read, Write, Bash, Glob, Grep, Task
```

**What it does:**
- Analyzes codebase with parallel Explore agents
- Creates `.planning/codebase/` directory
- Produces 7 analysis documents:
  - STACK.md - Languages, frameworks, dependencies
  - ARCHITECTURE.md - Patterns, layers, data flow
  - STRUCTURE.md - Directory layout
  - CONVENTIONS.md - Code style, naming
  - TESTING.md - Test framework, patterns
  - INTEGRATIONS.md - External services, APIs
  - CONCERNS.md - Tech debt, known issues

**Use when:** Starting GSD on an existing codebase (run before `/gsd:new-project`).

---

## Command Tool Matrix

| Command | Read | Write | Edit | Bash | Task | AskUser | Glob | Grep |
|---------|------|-------|------|------|------|---------|------|------|
| new-project | ✓ | ✓ | | ✓ | | ✓ | | |
| create-roadmap | ✓ | ✓ | | ✓ | | | | |
| map-codebase | ✓ | ✓ | | ✓ | ✓ | | ✓ | ✓ |
| plan-phase | ✓ | ✓ | | ✓ | ✓ | | ✓ | ✓ |
| execute-phase | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| execute-plan | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| verify-work | ✓ | | | ✓ | ✓ | | ✓ | ✓ |
| complete-milestone | ✓ | ✓ | | ✓ | | | ✓ | |
| discuss-phase | ✓ | ✓ | | | | ✓ | | |
| research-phase | ✓ | ✓ | | | ✓ | | ✓ | ✓ |
| list-phase-assumptions | ✓ | | | | | | | |
| add-phase | ✓ | ✓ | ✓ | ✓ | | | | |
| insert-phase | ✓ | ✓ | ✓ | ✓ | | | | |
| remove-phase | ✓ | ✓ | ✓ | ✓ | | | | |
| discuss-milestone | ✓ | | | | | ✓ | | |
| new-milestone | ✓ | ✓ | ✓ | ✓ | | ✓ | | |
| pause-work | ✓ | ✓ | | ✓ | | | | |
| resume-work | ✓ | | | ✓ | | | | |
| consider-issues | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ |
| plan-fix | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| add-todo | ✓ | ✓ | | ✓ | | | | |
| check-todos | ✓ | ✓ | | ✓ | | | ✓ | |
| progress | ✓ | | | ✓ | | | ✓ | |
| status | ✓ | | | | | | | |
| debug | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ |
| help | | | | | | | | |

---

## Common Workflows

### Starting a New Project

```
/gsd:new-project           # Initialize with deep questioning
/gsd:create-roadmap        # Create phases and state
/gsd:plan-phase 1          # Plan first phase
/gsd:execute-phase 1       # Execute all plans in parallel
```

### Existing Codebase (Brownfield)

```
/gsd:map-codebase          # Analyze existing code
/gsd:new-project           # Initialize with codebase context
/gsd:create-roadmap        # Create phases
# Continue as normal...
```

### Resuming After Break

```
/gsd:resume-work           # Full context restoration
# or
/gsd:progress              # See status and continue
```

### Adding Urgent Work

```
/gsd:insert-phase 5 "Critical security fix"
/gsd:plan-phase 5.1
/gsd:execute-phase 5.1
```

### Completing Milestone

```
/gsd:verify-work           # UAT all phases
/gsd:complete-milestone    # Archive and tag
/gsd:discuss-milestone     # Plan next milestone
/gsd:new-milestone "v2.0"
```

### Debugging Across Sessions

```
/gsd:debug "form submission fails"    # Start
# ... investigation, context fills ...
/clear
/gsd:debug                            # Resume
```

---

## See Also

- [Architecture](./architecture.md) - System architecture
- [Data Flow](./data-flow.md) - How data moves through the system
- [Workflows](./workflows.md) - Detailed workflow processes
- [Configuration](./configuration.md) - Setup options
