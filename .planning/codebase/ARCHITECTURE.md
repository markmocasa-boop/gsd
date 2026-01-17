# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Hierarchical Meta-Prompting System with Subagent Orchestration

**Key Characteristics:**
- Command-driven specification system for AI-assisted solo development
- Plans as executable prompts (PLAN.md files ARE the prompts, not documents to transform)
- Wave-based parallel execution with pre-computed dependencies
- Subagent orchestration (each gets fresh 200k token context)
- Persistent state management across sessions

## Layers

**User Interface Layer:**
- Purpose: Accept user commands and route to appropriate handlers
- Contains: Slash commands (`/gsd:*`)
- Location: `commands/gsd/*.md`
- Depends on: Workflows for business logic
- Used by: Claude Code users

**Planning Layer:**
- Purpose: Transform project vision into executable plans
- Contains: Discovery, roadmap creation, plan generation
- Location: `get-shit-done/workflows/create-roadmap.md`, `plan-phase.md`
- Depends on: Templates, references
- Used by: User Interface Layer

**Execution Layer:**
- Purpose: Run plans and manage subagent orchestration
- Contains: Wave-based orchestration, checkpoint handling, state management
- Location: `get-shit-done/workflows/execute-phase.md`, `execute-plan.md`
- Depends on: Subagents (gsd-executor, gsd-verifier)
- Used by: Planning Layer

**Subagent Layer:**
- Purpose: Specialized execution (plans, verification, research, debugging)
- Contains: Agent definitions with role, process, execution flow
- Location: `agents/*.md`
- Depends on: Templates, references
- Used by: Execution Layer (spawned on demand)

**Verification Layer:**
- Purpose: Goal-backward verification, gap detection
- Contains: Must-haves checking, VERIFICATION.md creation
- Location: `agents/gsd-verifier.md`, `get-shit-done/workflows/verify-phase.md`
- Depends on: Execution artifacts
- Used by: Execution Layer (post-phase)

## Data Flow

**Initialization Flow:**
1. User runs: `/gsd:new-project`
2. Discovery via questioning (brownfield check, project scope)
3. Create PROJECT.md + config.json
4. Git commit

**Planning Flow:**
1. User runs: `/gsd:create-roadmap`
2. Load PROJECT.md + REQUIREMENTS.md
3. Identify phases (mapped to requirements)
4. Create ROADMAP.md + STATE.md
5. Initialize phase directories

**Execution Flow:**
1. User runs: `/gsd:execute-phase N`
2. Discover all *-PLAN.md files in phase directory
3. Read wave/depends_on from each plan's frontmatter
4. Group plans by wave (pre-computed, not runtime)
5. For each wave: spawn gsd-executor subagent per plan in parallel
6. Wait for *-SUMMARY.md creation
7. Spawn gsd-verifier to check must_haves
8. Update STATE.md, ROADMAP.md, REQUIREMENTS.md
9. Commit phase metadata

**State Management:**
- File-based: All state lives in `.planning/` directory
- Key files: STATE.md (project memory), PROJECT.md (vision), ROADMAP.md (phases)
- No persistent in-memory state - each command execution is independent

## Key Abstractions

**PLAN.md as Executable Prompt:**
- Purpose: Atomic unit of work with tasks, verification, success criteria
- Examples: `01-01-PLAN.md`, `02-03-PLAN.md`
- Pattern: YAML frontmatter + XML task structure

**Wave-based Parallelization:**
- Purpose: Pre-computed dependencies allow parallel plan execution
- Examples: Wave 1 = foundation, Wave 2 = features, Wave 3 = verification
- Pattern: Plans in same wave run in parallel; higher waves wait for prior

**Subagent:**
- Purpose: Specialized executor with fresh context
- Examples: gsd-executor (`agents/gsd-executor.md`), gsd-verifier (`agents/gsd-verifier.md`)
- Pattern: Spawned by orchestrator, returns results, fresh 200k token context

**State File (STATE.md):**
- Purpose: Project memory across sessions
- Examples: Current position, decisions, blockers, metrics
- Pattern: Updated after each phase, loaded at session start

**Checkpoint:**
- Purpose: Human verification or decision point
- Examples: `checkpoint:human-verify`, `checkpoint:decision`
- Pattern: Executor pauses, orchestrator presents to user, fresh agent continues

## Entry Points

**CLI Entry:**
- Location: `bin/install.js`
- Triggers: User runs `npx get-shit-done-cc`
- Responsibilities: Copy commands/workflows/agents to Claude config directory

**User-Facing Commands:**
- Location: `commands/gsd/*.md`
- Triggers: User runs `/gsd:command-name`
- Responsibilities: Delegate to workflows, manage state

**Subagent Entry:**
- Location: `agents/*.md`
- Triggers: Spawned by orchestrator commands
- Responsibilities: Execute specific task (plan execution, verification, research)

## Error Handling

**Strategy:** Task-level verification with checkpoint fallback

**Patterns:**
- Each task has `<verify>` block - shell command to prove completion
- Each task has `<done>` block - acceptance criteria
- Checkpoint tasks pause for human verification
- Deviations auto-fixed by executor, documented in SUMMARY.md
- Gaps detected by verifier trigger `/gsd:plan-phase N --gaps`

## Cross-Cutting Concerns

**Logging:**
- Console output during installation (`bin/install.js`)
- SUMMARY.md files document execution results
- STATE.md tracks project-level decisions and blockers

**Validation:**
- Frontmatter parsing in PLAN.md files (phase, plan, wave, depends_on)
- Path validation during installation (`bin/install.js`)
- Must-haves verification post-execution (gsd-verifier)

**Git Integration:**
- Atomic per-task commits during plan execution
- Commit format: `feat(phase): task-name` or `fix(phase): task-name`
- State changes committed after phase completion

---

*Architecture analysis: 2026-01-16*
*Update when major patterns change*
