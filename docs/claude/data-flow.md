# GSD Data Flow

This document details how data flows through the GSD system, from project initialization to milestone completion.

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GSD LIFECYCLE FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INITIALIZATION                                                         │
│  ─────────────                                                          │
│                                                                          │
│  User Input ──► /gsd:new-project ──► Deep Questioning                  │
│                      │                      │                            │
│                      ▼                      ▼                            │
│              ┌─────────────────────────────────────────┐                │
│              │         PROJECT.md                      │                │
│              │         config.json                     │                │
│              └─────────────────────────────────────────┘                │
│                                  │                                       │
│                                  ▼                                       │
│              /gsd:create-roadmap                                        │
│                      │                                                   │
│                      ▼                                                   │
│              ┌─────────────────────────────────────────┐                │
│              │         ROADMAP.md                      │                │
│              │         STATE.md                        │                │
│              └─────────────────────────────────────────┘                │
│                                  │                                       │
│  PLANNING                        ▼                                       │
│  ────────                                                               │
│                                                                          │
│              /gsd:plan-phase [N]                                        │
│                      │                                                   │
│                      ▼                                                   │
│              ┌─────────────────────────────────────────┐                │
│              │   .planning/phases/XX-name/             │                │
│              │   ├── XX-01-PLAN.md                     │                │
│              │   ├── XX-02-PLAN.md                     │                │
│              │   └── XX-03-PLAN.md                     │                │
│              └─────────────────────────────────────────┘                │
│                                  │                                       │
│  EXECUTION                       ▼                                       │
│  ─────────                                                              │
│                                                                          │
│              /gsd:execute-phase N                                       │
│                      │                                                   │
│           ┌──────────┼──────────┐                                       │
│           ▼          ▼          ▼        (Wave 1 - parallel)           │
│      Plan 01    Plan 02    Plan 03                                      │
│           │          │          │                                        │
│           └──────────┼──────────┘                                       │
│                      │                                                   │
│                      ▼                                                   │
│              ┌─────────────────────────────────────────┐                │
│              │   .planning/phases/XX-name/             │                │
│              │   ├── XX-01-SUMMARY.md                  │                │
│              │   ├── XX-02-SUMMARY.md                  │                │
│              │   └── XX-03-SUMMARY.md                  │                │
│              └─────────────────────────────────────────┘                │
│                                  │                                       │
│  VERIFICATION                    ▼                                       │
│  ────────────                                                           │
│                                                                          │
│              /gsd:verify-work [phase]                                   │
│                      │                                                   │
│                      ▼                                                   │
│              User Acceptance Testing                                    │
│                      │                                                   │
│              (issues?) ──► /gsd:plan-fix                               │
│                      │                                                   │
│  COMPLETION          ▼                                                   │
│  ──────────                                                             │
│                                                                          │
│              /gsd:complete-milestone                                    │
│                      │                                                   │
│                      ▼                                                   │
│              ┌─────────────────────────────────────────┐                │
│              │   Archive v1.0                          │                │
│              │   Reset for v1.1                        │                │
│              └─────────────────────────────────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Project Initialization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROJECT INITIALIZATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User provides freeform input                                           │
│         │                                                                │
│         ▼                                                                │
│  /gsd:new-project                                                       │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DEEP QUESTIONING                              │   │
│  │                                                                   │   │
│  │  Round 1: Vision & Scope                                         │   │
│  │  ├── What problem are we solving?                                │   │
│  │  ├── Who is this for?                                            │   │
│  │  └── What does success look like?                                │   │
│  │                                                                   │   │
│  │  Round 2: Technical Context                                      │   │
│  │  ├── What technologies are required/preferred?                   │   │
│  │  ├── Any existing systems to integrate with?                     │   │
│  │  └── What constraints exist?                                     │   │
│  │                                                                   │   │
│  │  Round 3: Requirements Clarification                             │   │
│  │  ├── What are the must-haves vs nice-to-haves?                   │   │
│  │  ├── Any specific workflows or user journeys?                    │   │
│  │  └── What should we explicitly NOT build?                        │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  OUTPUT: .planning/                                              │   │
│  │                                                                   │   │
│  │  PROJECT.md                                                      │   │
│  │  ├── ## Vision                                                   │   │
│  │  ├── ## Requirements                                             │   │
│  │  │   ├── Functional                                              │   │
│  │  │   └── Non-functional                                          │   │
│  │  ├── ## Constraints                                              │   │
│  │  ├── ## Tech Stack                                               │   │
│  │  └── ## Out of Scope                                             │   │
│  │                                                                   │   │
│  │  config.json                                                     │   │
│  │  {                                                               │   │
│  │    "mode": "yolo",                                               │   │
│  │    "depth": "standard",                                          │   │
│  │    "parallelization": { "enabled": true, ... },                  │   │
│  │    "gates": { ... },                                             │   │
│  │    "safety": { ... }                                             │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Roadmap Creation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ROADMAP CREATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /gsd:create-roadmap                                                    │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  INPUT: Read PROJECT.md                                          │   │
│  │                                                                   │   │
│  │  Extract:                                                         │   │
│  │  • Vision and goals                                              │   │
│  │  • Requirements (functional + non-functional)                    │   │
│  │  • Constraints                                                   │   │
│  │  • Tech stack decisions                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  PROCESSING: Break into phases                                   │   │
│  │                                                                   │   │
│  │  Based on config.json depth:                                     │   │
│  │  • "quick": 3-5 phases, 1-3 plans each                          │   │
│  │  • "standard": 5-8 phases, 3-5 plans each (default)             │   │
│  │  • "comprehensive": 8-12 phases, 5-10 plans each                │   │
│  │                                                                   │   │
│  │  Analyze dependencies:                                           │   │
│  │  • Which phases must complete before others?                     │   │
│  │  • Can any phases run in parallel?                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  OUTPUT: .planning/                                              │   │
│  │                                                                   │   │
│  │  ROADMAP.md                                                      │   │
│  │  ├── ## Milestone: v1.0 - [Name]                                │   │
│  │  │   ├── ### Phase 1: [Name] - [Goal]                           │   │
│  │  │   │   └── depends_on: none                                   │   │
│  │  │   ├── ### Phase 2: [Name] - [Goal]                           │   │
│  │  │   │   └── depends_on: Phase 1                                │   │
│  │  │   ├── ### Phase 3: [Name] - [Goal]                           │   │
│  │  │   │   └── depends_on: Phase 1, Phase 2                       │   │
│  │  │   └── ...                                                     │   │
│  │                                                                   │   │
│  │  STATE.md                                                        │   │
│  │  ├── ## Current Position                                         │   │
│  │  │   ├── Phase: 1 of N                                          │   │
│  │  │   ├── Plan: Not started                                      │   │
│  │  │   └── Progress: ░░░░░░░░░░ 0%                                │   │
│  │  ├── ## Decisions                                                │   │
│  │  ├── ## Deferred Issues                                          │   │
│  │  └── ## Session Continuity                                       │   │
│  │                                                                   │   │
│  │  phases/                                                         │   │
│  │  ├── 01-phase-name/                                              │   │
│  │  ├── 02-phase-name/                                              │   │
│  │  └── ...                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Phase Planning

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PHASE PLANNING FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /gsd:plan-phase [N]                                                    │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  INPUT: Load context files                                       │   │
│  │                                                                   │   │
│  │  • PROJECT.md - Vision and requirements                          │   │
│  │  • ROADMAP.md - Phase goal and dependencies                      │   │
│  │  • STATE.md - Current position, accumulated decisions            │   │
│  │  • codebase/*.md - (if brownfield) existing code analysis       │   │
│  │  • Previous SUMMARY.md files - What was built so far            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  DISCOVERY: Determine unknowns level                             │   │
│  │                                                                   │   │
│  │  Level 0: Established patterns - familiar work                   │   │
│  │  Level 1: Some unknowns - needs clarification                    │   │
│  │  Level 2: New integrations - research likely                     │   │
│  │  Level 3: Exploratory - significant unknowns                     │   │
│  │                                                                   │   │
│  │  Higher levels → more discovery questions before planning        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  SCOPE ESTIMATION: Determine plan count                          │   │
│  │                                                                   │   │
│  │  Rules:                                                          │   │
│  │  • 2-3 tasks per plan maximum (context constraint)               │   │
│  │  • Each plan independently executable                            │   │
│  │  • Split based on logical boundaries                             │   │
│  │  • Group related tasks that share context                        │   │
│  │                                                                   │   │
│  │  TDD Decision:                                                   │   │
│  │  Can write `expect(fn(input)).toBe(output)` before `fn`?        │   │
│  │  → Yes: Create dedicated TDD plan (one feature)                  │   │
│  │  → No: Standard plan                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  WAVE COMPUTATION: Pre-compute execution order                   │   │
│  │                                                                   │   │
│  │  For each plan:                                                  │   │
│  │  • Identify which other plans it depends on                      │   │
│  │  • Assign wave number based on dependency depth                  │   │
│  │                                                                   │   │
│  │  Example:                                                        │   │
│  │  Plan 01: depends_on: [] ──► wave: 1                            │   │
│  │  Plan 02: depends_on: [] ──► wave: 1                            │   │
│  │  Plan 03: depends_on: [01] ──► wave: 2                          │   │
│  │  Plan 04: depends_on: [01, 02] ──► wave: 2                      │   │
│  │  Plan 05: depends_on: [03, 04] ──► wave: 3                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  OUTPUT: .planning/phases/XX-name/                               │   │
│  │                                                                   │   │
│  │  XX-01-PLAN.md                                                   │   │
│  │  ---                                                             │   │
│  │  phase: XX                                                       │   │
│  │  plan: 01                                                        │   │
│  │  type: standard|tdd                                              │   │
│  │  wave: 1                                                         │   │
│  │  depends_on: []                                                  │   │
│  │  files_modified: [expected files]                                │   │
│  │  autonomous: true|false                                          │   │
│  │  ---                                                             │   │
│  │                                                                   │   │
│  │  <objective>What and why</objective>                             │   │
│  │                                                                   │   │
│  │  <execution_context>                                             │   │
│  │    @~/.claude/get-shit-done/workflows/execute-plan.md           │   │
│  │  </execution_context>                                            │   │
│  │                                                                   │   │
│  │  <context>                                                       │   │
│  │    @.planning/PROJECT.md                                         │   │
│  │    @.planning/STATE.md                                           │   │
│  │    @src/relevant/files.ts                                        │   │
│  │  </context>                                                      │   │
│  │                                                                   │   │
│  │  <tasks>                                                         │   │
│  │    <task num="1" type="auto">...</task>                         │   │
│  │    <task num="2" type="auto">...</task>                         │   │
│  │    <task num="3" type="checkpoint:human-verify">...</task>      │   │
│  │  </tasks>                                                        │   │
│  │                                                                   │   │
│  │  <success_criteria>Measurable completion</success_criteria>      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Phase Execution (Parallel)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE EXECUTION FLOW (PARALLEL)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /gsd:execute-phase N                                                   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ORCHESTRATOR (15% context)                                      │   │
│  │                                                                   │   │
│  │  1. Load STATE.md for project context                            │   │
│  │  2. Validate phase exists and has plans                          │   │
│  │  3. Discover all *-PLAN.md files                                 │   │
│  │  4. Check for existing *-SUMMARY.md (skip completed)             │   │
│  │  5. Read frontmatter: extract wave numbers                       │   │
│  │  6. Group plans by wave                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  WAVE EXECUTION LOOP                                             │   │
│  │                                                                   │   │
│  │  FOR EACH WAVE (in order):                                       │   │
│  │                                                                   │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ Wave N                                                     │  │   │
│  │  │                                                            │  │   │
│  │  │ Spawn all autonomous plans in parallel:                    │  │   │
│  │  │                                                            │  │   │
│  │  │    Task(prompt=subagent-task-prompt,                      │  │   │
│  │  │         subagent_type="general-purpose")                  │  │   │
│  │  │              │                                             │  │   │
│  │  │      ┌───────┼───────┐                                    │  │   │
│  │  │      ▼       ▼       ▼                                    │  │   │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐                              │  │   │
│  │  │  │Agent │ │Agent │ │Agent │  (parallel execution)        │  │   │
│  │  │  │Plan 1│ │Plan 2│ │Plan 3│                              │  │   │
│  │  │  │ 200k │ │ 200k │ │ 200k │  (fresh context each)        │  │   │
│  │  │  └──────┘ └──────┘ └──────┘                              │  │   │
│  │  │      │       │       │                                    │  │   │
│  │  │      └───────┼───────┘                                    │  │   │
│  │  │              │                                             │  │   │
│  │  │  WAIT for all agents to complete                          │  │   │
│  │  │              │                                             │  │   │
│  │  │  Collect results:                                          │  │   │
│  │  │  • Verify SUMMARY.md exists for each plan                  │  │   │
│  │  │  • Note any issues reported                                │  │   │
│  │  │  • Record completion                                       │  │   │
│  │  │                                                            │  │   │
│  │  │  Handle failures:                                          │  │   │
│  │  │  • Report which plan failed                                │  │   │
│  │  │  • Ask: Continue remaining waves? / Stop?                  │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  PROCEED TO NEXT WAVE                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  AGGREGATION                                                     │   │
│  │                                                                   │   │
│  │  After all waves complete:                                       │   │
│  │  • Aggregate results from all SUMMARYs                           │   │
│  │  • Update ROADMAP.md with completion status                      │   │
│  │  • Commit roadmap update                                         │   │
│  │  • Offer next phase or milestone completion                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow: Plan Execution (Within Subagent)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PLAN EXECUTION FLOW (SUBAGENT)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Subagent receives task with PLAN.md path                               │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  INITIALIZATION (Fresh 200k context)                             │   │
│  │                                                                   │   │
│  │  1. Load execute-plan.md workflow                                │   │
│  │  2. Load STATE.md for project context                            │   │
│  │  3. Load PLAN.md                                                 │   │
│  │  4. Load @context files referenced in plan                       │   │
│  │  5. Record start time                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  TASK EXECUTION LOOP                                             │   │
│  │                                                                   │   │
│  │  FOR EACH TASK:                                                  │   │
│  │                                                                   │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ If type="auto":                                            │  │   │
│  │  │                                                            │  │   │
│  │  │   ┌──────────────────────────────────────────────────┐    │  │   │
│  │  │   │ Execute task                                      │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ ┌─────────────────────────────────────────────┐   │    │  │   │
│  │  │   │ │ If TDD: RED → GREEN → REFACTOR cycle       │   │    │  │   │
│  │  │   │ │   • Write failing test → commit            │   │    │  │   │
│  │  │   │ │   • Implement to pass → commit             │   │    │  │   │
│  │  │   │ │   • Refactor if needed → commit            │   │    │  │   │
│  │  │   │ └─────────────────────────────────────────────┘   │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ Apply deviation rules as needed:                   │    │  │   │
│  │  │   │   Rule 1: Auto-fix bugs                           │    │  │   │
│  │  │   │   Rule 2: Auto-add missing critical               │    │  │   │
│  │  │   │   Rule 3: Auto-fix blockers                       │    │  │   │
│  │  │   │   Rule 4: Ask about architectural (STOP)          │    │  │   │
│  │  │   │   Rule 5: Log enhancements to ISSUES.md           │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ Run verification                                   │    │  │   │
│  │  │   │ Confirm done criteria met                          │    │  │   │
│  │  │   └──────────────────────────────────────────────────┘    │  │   │
│  │  │                        │                                   │  │   │
│  │  │                        ▼                                   │  │   │
│  │  │   ┌──────────────────────────────────────────────────┐    │  │   │
│  │  │   │ COMMIT TASK                                       │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ git add [task-related files only]                 │    │  │   │
│  │  │   │ git commit -m "{type}({phase}-{plan}): {desc}"   │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ Types: feat, fix, test, refactor, perf, docs     │    │  │   │
│  │  │   │                                                    │    │  │   │
│  │  │   │ Record commit hash for SUMMARY                    │    │  │   │
│  │  │   └──────────────────────────────────────────────────┘    │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │ If type="checkpoint:*":                                    │  │   │
│  │  │                                                            │  │   │
│  │  │   STOP immediately                                         │  │   │
│  │  │   Return to orchestrator with checkpoint state:            │  │   │
│  │  │   • Completed tasks table                                  │  │   │
│  │  │   • Current task and blocker                               │  │   │
│  │  │   • Checkpoint type and details                            │  │   │
│  │  │   • What's awaited from user                               │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  CONTINUE TO NEXT TASK                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  COMPLETION                                                      │   │
│  │                                                                   │   │
│  │  1. Record end time, calculate duration                          │   │
│  │                                                                   │   │
│  │  2. Create SUMMARY.md                                            │   │
│  │     ├── Frontmatter (phase, plan, subsystem, tags)              │   │
│  │     ├── One-liner (substantive, not generic)                    │   │
│  │     ├── Accomplishments                                          │   │
│  │     ├── Files Created/Modified                                   │   │
│  │     ├── Decisions Made                                           │   │
│  │     ├── Deviations from Plan                                     │   │
│  │     ├── Issues Encountered                                       │   │
│  │     ├── Performance (duration, tasks, commits)                   │   │
│  │     └── Next Step                                                │   │
│  │                                                                   │   │
│  │  3. Update STATE.md                                              │   │
│  │     ├── Current Position (phase, plan, progress bar)            │   │
│  │     ├── Decisions (add from this execution)                     │   │
│  │     ├── Deferred Issues (if new ISS-XXX created)                │   │
│  │     └── Session Continuity                                       │   │
│  │                                                                   │   │
│  │  4. Final metadata commit                                        │   │
│  │     git add SUMMARY.md STATE.md ROADMAP.md                      │   │
│  │     git commit -m "docs({phase}-{plan}): complete [plan-name]"  │   │
│  │                                                                   │   │
│  │  5. Return to orchestrator with completion status                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Checkpoint Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CHECKPOINT FLOW                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Types of Checkpoints:                                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  checkpoint:human-verify (90%)                                   │   │
│  │                                                                   │   │
│  │  Purpose: User confirms Claude's work (visual, UX)               │   │
│  │                                                                   │   │
│  │  Flow:                                                           │   │
│  │  Claude automates ──► Displays verification steps ──► User checks │   │
│  │        │                                                         │   │
│  │        ▼                                                         │   │
│  │  "approved" ──► Continue                                        │   │
│  │  "issues: X" ──► Handle issues, then continue                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  checkpoint:decision (9%)                                        │   │
│  │                                                                   │   │
│  │  Purpose: User makes implementation choice                       │   │
│  │                                                                   │   │
│  │  Flow:                                                           │   │
│  │  Claude presents options ──► User selects ──► Claude implements  │   │
│  │                                                                   │   │
│  │  Options format:                                                 │   │
│  │  1. [option-id]: [name]                                          │   │
│  │     Pros: [pros]                                                 │   │
│  │     Cons: [cons]                                                 │   │
│  │  2. [option-id]: [name]                                          │   │
│  │     ...                                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  checkpoint:human-action (1%)                                    │   │
│  │                                                                   │   │
│  │  Purpose: Truly unavoidable manual steps (email links, 2FA)      │   │
│  │                                                                   │   │
│  │  Flow:                                                           │   │
│  │  Claude automates ──► Blocked ──► User does ONE thing ──► Verify │   │
│  │                                                                   │   │
│  │  Examples:                                                       │   │
│  │  • Click email verification link                                 │   │
│  │  • Enter 2FA code from authenticator app                         │   │
│  │  • Physical device action                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Authentication Gates (Dynamic Checkpoints):                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  When CLI/API returns auth error during auto task:               │   │
│  │                                                                   │   │
│  │  1. Recognize it's an auth gate (not a bug)                      │   │
│  │  2. Create dynamic checkpoint:human-action                       │   │
│  │  3. Provide exact authentication steps                           │   │
│  │  4. Wait for user to authenticate                                │   │
│  │  5. Verify credentials work                                      │   │
│  │  6. Retry original task                                          │   │
│  │  7. Continue normally                                            │   │
│  │                                                                   │   │
│  │  Example:                                                        │   │
│  │  Running: vercel --yes                                           │   │
│  │  Error: Not authenticated                                        │   │
│  │        │                                                         │   │
│  │        ▼                                                         │   │
│  │  CHECKPOINT: Authentication Required                             │   │
│  │  Run: vercel login                                               │   │
│  │  Type "done" when authenticated                                  │   │
│  │        │                                                         │   │
│  │        ▼ (user types "done")                                    │   │
│  │  Verifying: vercel whoami                                        │   │
│  │  ✓ Authenticated as: user@example.com                           │   │
│  │  Retrying: vercel --yes                                         │   │
│  │  ✓ Deployed successfully                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STATE.md is the "living memory" of the project:                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  STATE.md Structure                                              │   │
│  │                                                                   │   │
│  │  ## Current Position                                             │   │
│  │  Phase: 2 of 4 (Authentication)                                  │   │
│  │  Plan: 1 of 2 in current phase                                   │   │
│  │  Status: In progress                                             │   │
│  │  Last activity: 2025-01-19 - Completed 02-01-PLAN.md            │   │
│  │  Progress: ███████░░░ 50%                                       │   │
│  │                                                                   │   │
│  │  ## Decisions                                                    │   │
│  │  | Phase | Decision | Rationale |                                │   │
│  │  |-------|----------|-----------|                                │   │
│  │  | 01 | Used jose for JWT | Lighter than jsonwebtoken |         │   │
│  │  | 02 | Refresh rotation | Security best practice |             │   │
│  │                                                                   │   │
│  │  ## Deferred Issues                                              │   │
│  │  - ISS-001: Optimize query (logged in Phase 1)                   │   │
│  │  - ISS-002: Add rate limiting (logged in Phase 2)                │   │
│  │                                                                   │   │
│  │  ## Blockers/Concerns Carried Forward                            │   │
│  │  - Database migration needs testing in staging                    │   │
│  │                                                                   │   │
│  │  ## Session Continuity                                           │   │
│  │  Last session: 2025-01-19 15:30 UTC                              │   │
│  │  Stopped at: Completed 02-01-PLAN.md                             │   │
│  │  Resume file: None                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Update Points:                                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  /gsd:create-roadmap                                             │   │
│  │      └─► Creates STATE.md with initial position                  │   │
│  │                                                                   │   │
│  │  Each plan execution                                             │   │
│  │      └─► Updates:                                                │   │
│  │          • Current Position (phase, plan, progress)              │   │
│  │          • Decisions (from SUMMARY)                              │   │
│  │          • Deferred Issues (from SUMMARY)                        │   │
│  │          • Session Continuity (timestamp, location)              │   │
│  │                                                                   │   │
│  │  /gsd:pause-work                                                 │   │
│  │      └─► Creates .continue-here file, updates resume file path   │   │
│  │                                                                   │   │
│  │  /gsd:resume-work                                                │   │
│  │      └─► Reads STATE.md, restores context                        │   │
│  │                                                                   │   │
│  │  /gsd:complete-milestone                                         │   │
│  │      └─► Resets for new milestone, archives old state           │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Size Constraint: STATE.md stays under 150 lines                        │
│  (to maintain fast loading and minimize context consumption)            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Brownfield Flow (Existing Codebase)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       BROWNFIELD FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  For existing codebases, run /gsd:map-codebase first:                   │
│                                                                          │
│  /gsd:map-codebase                                                      │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ANALYSIS: Explore existing code                                 │   │
│  │                                                                   │   │
│  │  • Scan directory structure                                      │   │
│  │  • Read package.json / requirements.txt / etc.                   │   │
│  │  • Identify frameworks and libraries                             │   │
│  │  • Analyze architectural patterns                                │   │
│  │  • Find test frameworks and coverage                             │   │
│  │  • Identify external integrations                                │   │
│  │  • Note tech debt and known issues                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  OUTPUT: .planning/codebase/                                     │   │
│  │                                                                   │   │
│  │  STACK.md                                                        │   │
│  │  ├── Languages and versions                                      │   │
│  │  ├── Frameworks (frontend, backend)                              │   │
│  │  ├── Dependencies (key packages)                                 │   │
│  │  └── Build tools and configuration                               │   │
│  │                                                                   │   │
│  │  ARCHITECTURE.md                                                 │   │
│  │  ├── High-level patterns (MVC, Clean Architecture, etc.)        │   │
│  │  ├── Layer structure                                             │   │
│  │  ├── Data flow                                                   │   │
│  │  └── Key abstractions                                            │   │
│  │                                                                   │   │
│  │  STRUCTURE.md                                                    │   │
│  │  └── Directory layout with descriptions                          │   │
│  │                                                                   │   │
│  │  CONVENTIONS.md                                                  │   │
│  │  ├── Naming conventions                                          │   │
│  │  ├── Code style (linting, formatting)                           │   │
│  │  └── File organization patterns                                  │   │
│  │                                                                   │   │
│  │  TESTING.md                                                      │   │
│  │  ├── Test framework                                              │   │
│  │  ├── Test patterns and locations                                 │   │
│  │  └── Coverage information                                        │   │
│  │                                                                   │   │
│  │  INTEGRATIONS.md                                                 │   │
│  │  ├── External APIs                                               │   │
│  │  ├── Third-party services                                        │   │
│  │  └── Authentication providers                                    │   │
│  │                                                                   │   │
│  │  CONCERNS.md                                                     │   │
│  │  ├── Known tech debt                                             │   │
│  │  ├── Performance issues                                          │   │
│  │  └── Security considerations                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  Continue with /gsd:new-project (codebase docs inform planning)         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Session Resumption Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SESSION RESUMPTION FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /gsd:resume-work                                                       │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  1. Load STATE.md                                                │   │
│  │     ├── Current Position (where we are)                          │   │
│  │     ├── Accumulated Decisions (constraints)                      │   │
│  │     ├── Deferred Issues (context)                                │   │
│  │     └── Session Continuity (last session info)                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  2. Check for .continue-here file                                │   │
│  │                                                                   │   │
│  │  If exists:                                                      │   │
│  │  ├── Load continuation context                                   │   │
│  │  ├── Show what was in progress                                   │   │
│  │  └── Offer to continue from that point                          │   │
│  │                                                                   │   │
│  │  If not exists:                                                  │   │
│  │  └── Reconstruct from STATE.md position                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  3. Present resumption options                                   │   │
│  │                                                                   │   │
│  │  Welcome back! Project: [name]                                   │   │
│  │                                                                   │   │
│  │  Last session: [date/time]                                       │   │
│  │  You were at: Phase [X], Plan [Y]                                │   │
│  │  Progress: [progress bar]                                        │   │
│  │                                                                   │   │
│  │  Continue with:                                                  │   │
│  │  • /gsd:execute-plan [next plan]                                 │   │
│  │  • /gsd:execute-phase [phase]                                    │   │
│  │  • /gsd:progress (show detailed status)                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Interrupted Execution Recovery:                                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  If /gsd:execute-phase was interrupted:                          │   │
│  │                                                                   │   │
│  │  1. Run /gsd:execute-phase [N] again                             │   │
│  │  2. discover_plans finds completed SUMMARYs                      │   │
│  │  3. Skips completed plans                                        │   │
│  │  4. Resumes from first incomplete plan                           │   │
│  │  5. Continues wave-based execution                               │   │
│  │                                                                   │   │
│  │  STATE.md tracks:                                                │   │
│  │  • Last completed plan                                           │   │
│  │  • Current wave                                                  │   │
│  │  • Any pending checkpoints                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## See Also

- [Architecture](./architecture.md) - System architecture and design principles
- [Commands](./commands.md) - Complete command reference
- [Workflows](./workflows.md) - Detailed workflow processes
- [Configuration](./configuration.md) - Setup options
