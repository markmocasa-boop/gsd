# Architecture

**Analysis Date:** 2025-01-21

## Pattern Overview

**Overall:** Agent Orchestrator - CLI Plugin System for Claude Code

**Key Characteristics:**
- Meta-prompting framework where prompts are first-class artifacts
- Subagent orchestration via Task tool spawning
- Markdown-based command and agent definitions
- Context-budget-driven execution (target ~50% context usage per plan)
- Goal-backward planning methodology
- Wave-based parallel execution

## Layers

**Command Layer:**
- Purpose: User-facing slash commands that trigger workflows
- Location: `commands/gsd/`
- Contains: Markdown files with frontmatter defining command behavior
- Depends on: Claude Code's command system
- Used by: Users via `/gsd:*` commands

**Agent Layer:**
- Purpose: Specialized subagents spawned for specific tasks
- Location: `agents/`
- Contains: Markdown files defining agent roles and behaviors
- Depends on: Command layer for spawning, execution_context references
- Used by: Commands via Task() spawning

**Workflow Layer:**
- Purpose: Detailed execution patterns referenced by commands/agents
- Location: `get-shit-done/workflows/`
- Contains: Process documentation for complex operations
- Depends on: Reference documents, templates
- Used by: Commands and agents for execution guidance

**Reference Layer:**
- Purpose: Reusable patterns, conventions, and guidelines
- Location: `get-shit-done/references/`
- Contains: Best practices, coding standards, UI patterns
- Depends on: None
- Used by: Agents and workflows for consistency

**Template Layer:**
- Purpose: Document structure templates for planning artifacts
- Location: `get-shit-done/templates/`
- Contains: PROJECT.md, SUMMARY.md, ROADMAP.md, etc. templates
- Depends on: None
- Used by: Agents for file generation

**Infrastructure Layer:**
- Purpose: Installation, hooks, build tooling
- Location: `bin/`, `hooks/`, `scripts/`
- Contains: Installer, statusline hook, update checker, build scripts
- Depends on: Node.js runtime
- Used by: Package distribution and Claude Code integration

## Data Flow

**Project Initialization Flow:**

1. User runs `/gsd:new-project`
2. Command spawns gsd-project-researcher agents (4 parallel) for domain research
3. Research outputs written to `.planning/research/`
4. gsd-research-synthesizer combines research into SUMMARY.md
5. gsd-roadmapper creates ROADMAP.md and STATE.md
6. Orchestrator presents roadmap for approval
7. User approval commits all planning artifacts

**Phase Execution Flow:**

1. User runs `/gsd:plan-phase X`
2. Orchestrator loads STATE.md, codebase context, phase CONTEXT.md
3. Spawns gsd-planner agent with rich context
4. Planner creates PLAN.md files with frontmatter (wave, depends_on, must_haves)
5. User runs `/gsd:execute-phase X`
6. Orchestrator groups plans by wave number
7. Spawns gsd-executor agents (parallel per wave)
8. Each executor creates per-task commits, then SUMMARY.md
9. Orchestrator spawns gsd-verifier to check must_haves
10. If gaps found, user runs `/gsd:plan-phase X --gaps` to create fix plans
11. Loop until verifier passes

**State Management:**
- STATE.md: Central project memory (position, decisions, todos, blockers)
- ROADMAP.md: Phase structure, requirement mappings, progress tracking
- REQUIREMENTS.md: Traceability table with status per requirement
- Plan SUMMARY.md frontmatter: Dependency graph for subsequent phases

## Key Abstractions

**Frontmatter-Driven Configuration:**
- Purpose: Metadata and behavior declaration without parsing logic
- Examples: `commands/gsd/*.md`, agent definitions, PLAN.md files
- Pattern: YAML frontmatter in markdown files defines structure

**@-References:**
- Purpose: Context loading via file references in markdown
- Examples: `@~/.claude/get-shit-done/workflows/execute-plan.md`
- Pattern: Commands/agents reference workflows, templates, references

**Goal-Backward Planning:**
- Purpose: Derive tasks from outcomes, not vice versa
- Examples: must_haves in PLAN.md frontmatter, success criteria in ROADMAP.md
- Pattern: Start with "what must be TRUE", derive artifacts and wiring

**Wave-Based Parallelization:**
- Purpose: Execute independent plans concurrently
- Examples: `wave: 1` frontmatter in PLAN.md
- Pattern: Pre-compute wave numbers from dependency graph during planning

**Model Profiles:**
- Purpose: Quality/cost tradeoffs for agent spawning
- Examples: `model_profile: quality|balanced|budget` in config.json
- Pattern: Lookup table maps agent type + profile to Claude model

## Entry Points

**Installation Entry Point:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc` execution
- Responsibilities: CLI argument parsing, directory copying, path replacement, settings.json configuration, hook registration

**Command Entry Points:**
- Location: `commands/gsd/*.md` (e.g., `new-project.md`, `plan-phase.md`, `execute-phase.md`)
- Triggers: User types `/gsd:*` in Claude Code
- Responsibilities: Define objective, process, success criteria for each command

**Agent Entry Points:**
- Location: `agents/gsd-*.md` (e.g., `gsd-planner.md`, `gsd-executor.md`)
- Triggers: Task() tool calls from orchestrators
- Responsibilities: Execute specific roles (planning, execution, verification, etc.)

**Hook Entry Points:**
- Location: `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`
- Triggers: Claude Code SessionStart, statusLine display
- Responsibilities: Update checking, status display

## Error Handling

**Strategy:** Graceful degradation with user notification

**Patterns:**
- **Install-time:** Orphaned file cleanup, hook registration validation
- **Planning-time:** Discovery level detection (skip, quick verify, full research based on complexity)
- **Execution-time:** Deviation rules (auto-fix bugs, auto-add critical, ask about architectural)
- **Verification-time:** Three-level artifact verification (exists, substantive, wired)

## Cross-Cutting Concerns

**Context Budget Management:**
- Target 50% context per plan to avoid quality degradation
- Aggressive atomicity (2-3 tasks per plan)
- Fresh context per subagent (orchestrator stays lean)

**Git Integration:**
- Per-task atomic commits with structured messages
- Separate metadata commits for planning docs
- Configurable via `commit_docs` flag (respect .gitignore)

**Model Selection:**
- Profile-based (quality/balanced/budget)
- Per-agent lookup tables
- Configurable via `model_profile` in config.json

**Parallel Execution:**
- Wave-based grouping from dependency graph
- Exclusive file ownership prevents conflicts
- Max concurrent agents limit

---

*Architecture analysis: 2025-01-21*
