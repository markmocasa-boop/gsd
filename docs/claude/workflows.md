# GSD Workflows

This document details the internal workflows that power GSD commands. Workflows define the step-by-step processes that Claude follows when executing commands.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GSD WORKFLOWS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Location: get-shit-done/workflows/                                     │
│  Total: 16 workflow files                                               │
│                                                                          │
│  EXECUTION WORKFLOWS                                                    │
│  ───────────────────                                                    │
│  execute-phase.md        Wave-based parallel execution orchestration    │
│  execute-plan.md         Single plan execution (54K - comprehensive!)   │
│                                                                          │
│  PLANNING WORKFLOWS                                                     │
│  ─────────────────                                                      │
│  plan-phase.md           Phase planning process                         │
│  discover-phase.md       Phase discovery                                │
│  discuss-phase.md        Phase discussion                               │
│  research-phase.md       Research workflow                              │
│                                                                          │
│  MILESTONE WORKFLOWS                                                    │
│  ──────────────────                                                     │
│  create-milestone.md     Milestone creation                             │
│  complete-milestone.md   Milestone completion                           │
│                                                                          │
│  VERIFICATION WORKFLOWS                                                 │
│  ─────────────────────                                                  │
│  verify-work.md          UAT workflow                                   │
│                                                                          │
│  SESSION WORKFLOWS                                                      │
│  ─────────────────                                                      │
│  resume-project.md       Resumption workflow                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Execute Phase Workflow

**File:** `get-shit-done/workflows/execute-phase.md`

The orchestrator workflow for parallel plan execution. Stays lean (~15% context) by delegating to subagents.

### Process Steps

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXECUTE-PHASE WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: load_project_state                                             │
│  ─────────────────────────────                                          │
│  • Read STATE.md                                                        │
│  • Parse current position, decisions, issues, blockers                  │
│  • Error if .planning/ doesn't exist                                    │
│                                                                          │
│  STEP 2: validate_phase                                                 │
│  ─────────────────────────                                              │
│  • Find phase directory matching argument                               │
│  • Count PLAN.md files                                                  │
│  • Error if no plans found                                              │
│                                                                          │
│  STEP 3: discover_plans                                                 │
│  ───────────────────────                                                │
│  • List all *-PLAN.md files                                            │
│  • Check for existing *-SUMMARY.md (already complete)                  │
│  • Read frontmatter: wave, autonomous flag                             │
│  • Build plan inventory                                                 │
│  • Skip completed plans                                                 │
│                                                                          │
│  STEP 4: group_by_wave                                                  │
│  ──────────────────────                                                 │
│  • Group plans by wave number from frontmatter                         │
│  • No dependency analysis needed (pre-computed)                        │
│  • Report wave structure to user                                       │
│                                                                          │
│  STEP 5: execute_waves                                                  │
│  ─────────────────────                                                  │
│  FOR EACH WAVE (in order):                                              │
│  │                                                                       │
│  │  1. Spawn all autonomous plans in parallel                          │
│  │     • Use Task tool with subagent-task-prompt                       │
│  │     • Each agent gets fresh 200k context                            │
│  │                                                                       │
│  │  2. Wait for all agents to complete                                 │
│  │                                                                       │
│  │  3. Collect results                                                 │
│  │     • Verify SUMMARY.md exists                                      │
│  │     • Note any issues                                               │
│  │                                                                       │
│  │  4. Handle failures                                                 │
│  │     • Report which plan failed                                      │
│  │     • Ask: Continue remaining waves?                                │
│  │                                                                       │
│  │  5. Handle checkpoint plans                                         │
│  │     • Present to user, collect response                             │
│  │     • Spawn continuation agent                                      │
│  │                                                                       │
│  └─► PROCEED TO NEXT WAVE                                              │
│                                                                          │
│  STEP 6: aggregate_results                                              │
│  ─────────────────────────                                              │
│  • Collect summaries from all plans                                    │
│  • Build wave summary table                                            │
│  • List issues encountered                                             │
│                                                                          │
│  STEP 7: update_roadmap                                                 │
│  ───────────────────────                                                │
│  • Mark phase complete in ROADMAP.md                                   │
│  • Add completion date                                                 │
│  • Commit roadmap update                                               │
│                                                                          │
│  STEP 8: offer_next                                                     │
│  ─────────────────                                                      │
│  • If more phases: Offer /gsd:plan-phase                              │
│  • If milestone complete: Offer /gsd:complete-milestone               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Checkpoint Handling

When a plan has checkpoints (`autonomous: false`):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT HANDLING                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Spawn agent for checkpoint plan                                     │
│                                                                          │
│  2. Agent runs until checkpoint                                         │
│     • Executes auto tasks normally                                      │
│     • Reaches checkpoint task                                           │
│     • Returns with structured checkpoint state                          │
│                                                                          │
│  3. Agent return includes:                                              │
│     ┌────────────────────────────────────────────────────────┐         │
│     │  ## CHECKPOINT REACHED                                  │         │
│     │                                                         │         │
│     │  **Type:** human-verify                                │         │
│     │  **Plan:** 01-01                                       │         │
│     │  **Progress:** 2/3 tasks complete                      │         │
│     │                                                         │         │
│     │  ### Completed Tasks                                    │         │
│     │  | Task | Name | Commit | Files |                      │         │
│     │  |------|------|--------|-------|                      │         │
│     │  | 1 | Create model | abc123 | user.ts |              │         │
│     │  | 2 | Add validation | def456 | user.ts |            │         │
│     │                                                         │         │
│     │  ### Checkpoint Details                                 │         │
│     │  [What user needs to verify/decide/do]                 │         │
│     │                                                         │         │
│     │  ### Awaiting                                           │         │
│     │  Type "approved" or describe issues                    │         │
│     └────────────────────────────────────────────────────────┘         │
│                                                                          │
│  4. Orchestrator presents to user                                       │
│                                                                          │
│  5. User responds:                                                      │
│     • "approved" / "done" → spawn continuation                         │
│     • Description of issues → spawn continuation with feedback         │
│     • Decision selection → spawn continuation with choice              │
│                                                                          │
│  6. Spawn continuation agent (fresh, not resume)                        │
│     • Uses continuation-prompt.md template                             │
│     • Includes completed tasks table                                   │
│     • Includes user response                                           │
│                                                                          │
│  7. Repeat until plan completes                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Execute Plan Workflow

**File:** `get-shit-done/workflows/execute-plan.md` (54K lines!)

The comprehensive workflow for executing a single plan. This is the largest and most detailed workflow file.

### Process Steps

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXECUTE-PLAN WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: load_project_state                                             │
│  ─────────────────────────────                                          │
│  • Read STATE.md for project context                                   │
│  • Parse position, decisions, issues, concerns                         │
│                                                                          │
│  STEP 2: identify_plan                                                  │
│  ─────────────────────                                                  │
│  • Find next unexecuted plan in phase                                  │
│  • Check roadmap for "In progress" phase                               │
│  • In YOLO mode: auto-approve                                          │
│  • In interactive: confirm before proceeding                           │
│                                                                          │
│  STEP 3: record_start_time                                              │
│  ─────────────────────────                                              │
│  • Record execution start for performance tracking                     │
│                                                                          │
│  STEP 4: parse_segments                                                 │
│  ──────────────────────                                                 │
│  • Analyze plan for checkpoints                                        │
│  • Determine execution pattern:                                        │
│    ◦ Pattern A: Fully autonomous (no checkpoints)                     │
│    ◦ Pattern B: Segmented (verify-only checkpoints)                   │
│    ◦ Pattern C: Decision-dependent (must stay in main)                │
│                                                                          │
│  STEP 5: init_agent_tracking                                            │
│  ───────────────────────────                                            │
│  • Create agent-history.json if needed                                 │
│  • Check for interrupted agents (resume detection)                     │
│  • Prune old entries                                                   │
│                                                                          │
│  STEP 6: segment_execution (if Pattern B)                               │
│  ─────────────────────────────────────────                              │
│  • Execute segment by segment                                          │
│  • Spawn subagent for autonomous segments                              │
│  • Execute checkpoints in main context                                 │
│  • Aggregate results at end                                            │
│                                                                          │
│  STEP 7: load_prompt                                                    │
│  ──────────────────                                                     │
│  • Read PLAN.md file                                                   │
│  • Load CONTEXT.md if referenced                                       │
│                                                                          │
│  STEP 8: previous_phase_check                                           │
│  ───────────────────────────                                            │
│  • Check if previous phase had issues                                  │
│  • Ask user how to proceed if issues exist                             │
│                                                                          │
│  STEP 9: execute                                                        │
│  ───────────────                                                        │
│  FOR EACH TASK:                                                         │
│  │                                                                       │
│  │  If type="auto":                                                    │
│  │  • Check for TDD attribute                                          │
│  │  • Execute task (or TDD cycle if TDD)                               │
│  │  • Apply deviation rules as needed                                  │
│  │  • Run verification                                                 │
│  │  • Commit task                                                      │
│  │                                                                       │
│  │  If type="checkpoint:*":                                            │
│  │  • STOP immediately                                                 │
│  │  • Execute checkpoint_protocol                                      │
│  │  • Wait for user response                                           │
│  │                                                                       │
│  └─► Continue to next task                                             │
│                                                                          │
│  STEP 10: checkpoint_protocol (when checkpoint hit)                     │
│  ──────────────────────────────────────────────────                     │
│  • Display checkpoint with type-specific content                       │
│  • WAIT for user response (never hallucinate)                          │
│  • Run verification if specified                                       │
│  • Continue or handle issues                                           │
│                                                                          │
│  STEP 11: verification_failure_gate                                     │
│  ───────────────────────────────                                        │
│  • If verification fails: STOP                                         │
│  • Present options: Retry / Skip / Stop                                │
│                                                                          │
│  STEP 12: record_completion_time                                        │
│  ──────────────────────────────                                         │
│  • Calculate duration                                                  │
│                                                                          │
│  STEP 13: create_summary                                                │
│  ────────────────────────                                               │
│  • Create SUMMARY.md with frontmatter                                  │
│  • Include substantive one-liner                                       │
│  • Document accomplishments, files, decisions                          │
│  • Include deviations and issues                                       │
│  • Add performance data                                                │
│                                                                          │
│  STEP 14: update_current_position                                       │
│  ───────────────────────────────                                        │
│  • Update STATE.md Current Position section                            │
│  • Calculate and render progress bar                                   │
│                                                                          │
│  STEP 15: extract_decisions_and_issues                                  │
│  ─────────────────────────────────────                                  │
│  • Add decisions to STATE.md Decisions table                           │
│  • Update Deferred Issues section                                      │
│  • Add blockers/concerns                                               │
│                                                                          │
│  STEP 16: update_session_continuity                                     │
│  ───────────────────────────────────                                    │
│  • Update STATE.md Session Continuity section                          │
│                                                                          │
│  STEP 17: issues_review_gate                                            │
│  ───────────────────────────                                            │
│  • Check if issues were encountered                                    │
│  • In YOLO: auto-acknowledge                                           │
│  • In interactive: wait for acknowledgment                             │
│                                                                          │
│  STEP 18: update_roadmap                                                │
│  ────────────────────────                                               │
│  • Update ROADMAP.md with completion                                   │
│                                                                          │
│  STEP 19: git_commit_metadata                                           │
│  ───────────────────────────                                            │
│  • Stage SUMMARY.md, STATE.md, ROADMAP.md                              │
│  • Commit: docs({phase}-{plan}): complete [plan-name]                  │
│                                                                          │
│  STEP 20: update_codebase_map                                           │
│  ───────────────────────────                                            │
│  • If .planning/codebase/ exists                                       │
│  • Update relevant docs if structural changes                          │
│                                                                          │
│  STEP 21: check_phase_issues                                            │
│  ───────────────────────────                                            │
│  • Check if issues were created during phase                           │
│  • Offer to review with /gsd:consider-issues                          │
│                                                                          │
│  STEP 22: offer_next                                                    │
│  ─────────────────                                                      │
│  • Verify remaining work                                               │
│  • Route A: More plans in phase → offer next plan                      │
│  • Route B: Phase complete, more phases → offer plan-phase            │
│  • Route C: Milestone complete → offer complete-milestone             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deviation Rules

The execute-plan workflow includes comprehensive deviation handling:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DEVIATION RULES                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RULE 1: Auto-fix bugs                                                  │
│  ─────────────────────                                                  │
│  Trigger: Code doesn't work as intended                                 │
│  Action: Fix immediately, track for SUMMARY                             │
│  Examples:                                                              │
│  • Wrong SQL query returning incorrect data                             │
│  • Logic errors, type errors, null pointer exceptions                   │
│  • Security vulnerabilities                                             │
│                                                                          │
│  RULE 2: Auto-add missing critical                                      │
│  ─────────────────────────────────                                      │
│  Trigger: Missing essential features for correctness/security          │
│  Action: Add immediately, track for SUMMARY                             │
│  Examples:                                                              │
│  • Missing error handling, input validation                             │
│  • No authentication on protected routes                                │
│  • Missing database indexes causing timeouts                            │
│                                                                          │
│  RULE 3: Auto-fix blockers                                              │
│  ─────────────────────────                                              │
│  Trigger: Something prevents completing current task                    │
│  Action: Fix to unblock, track for SUMMARY                              │
│  Examples:                                                              │
│  • Missing dependency, wrong types                                      │
│  • Broken import paths, missing env vars                                │
│                                                                          │
│  RULE 4: Ask about architectural                                        │
│  ────────────────────────────────                                       │
│  Trigger: Significant structural modification required                  │
│  Action: STOP, present to user, wait for decision                       │
│  Examples:                                                              │
│  • Adding new database table                                            │
│  • Switching libraries/frameworks                                       │
│  • Changing authentication approach                                     │
│                                                                          │
│  RULE 5: Log enhancements                                               │
│  ────────────────────────                                               │
│  Trigger: Improvement that isn't essential now                          │
│  Action: Add to ISSUES.md, continue                                     │
│  Examples:                                                              │
│  • Performance optimization                                             │
│  • Code refactoring                                                     │
│  • Nice-to-have UX improvements                                         │
│                                                                          │
│  PRIORITY ORDER:                                                        │
│  1. Rule 4 applies → STOP and ask                                      │
│  2. Rules 1-3 apply → Fix automatically                                │
│  3. Rule 5 applies → Log and continue                                  │
│  4. Genuinely unsure → Apply Rule 4 (ask user)                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### TDD Execution

When a task has `tdd="true"`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TDD EXECUTION CYCLE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. CHECK TEST INFRASTRUCTURE (if first TDD plan)                       │
│     • Detect project type                                               │
│     • Install test framework if needed                                  │
│     • Create test config                                                │
│                                                                          │
│  2. RED - Write failing test                                            │
│     • Read <behavior> element for test spec                            │
│     • Create test file                                                  │
│     • Write tests for expected behavior                                 │
│     • Run tests - MUST fail                                            │
│     • Commit: test({phase}-{plan}): add failing test for [feature]     │
│                                                                          │
│  3. GREEN - Implement to pass                                           │
│     • Read <implementation> element for guidance                       │
│     • Write minimal code to make test pass                             │
│     • Run tests - MUST pass                                            │
│     • Commit: feat({phase}-{plan}): implement [feature]                │
│                                                                          │
│  4. REFACTOR (if needed)                                                │
│     • Clean up code if obvious improvements                            │
│     • Run tests - MUST still pass                                      │
│     • Commit: refactor({phase}-{plan}): clean up [feature]             │
│                                                                          │
│  ERROR HANDLING:                                                        │
│  • Test doesn't fail in RED → investigate (test wrong or exists)       │
│  • Test doesn't pass in GREEN → debug, iterate                         │
│  • Tests fail in REFACTOR → undo refactor                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Task Commit Protocol

After each task completes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TASK COMMIT PROTOCOL                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. IDENTIFY MODIFIED FILES                                             │
│     git status --short                                                  │
│                                                                          │
│  2. STAGE ONLY TASK-RELATED FILES                                       │
│     git add src/api/auth.ts                                             │
│     git add src/types/user.ts                                           │
│     # NEVER use git add . or git add -A                                │
│                                                                          │
│  3. DETERMINE COMMIT TYPE                                               │
│     feat     → New feature, endpoint, component                         │
│     fix      → Bug fix, error correction                                │
│     test     → Test-only changes (TDD RED)                              │
│     refactor → Code cleanup (TDD REFACTOR)                              │
│     perf     → Performance improvement                                  │
│     docs     → Documentation changes                                    │
│     style    → Formatting, linting                                      │
│     chore    → Config, tooling, dependencies                            │
│                                                                          │
│  4. CRAFT COMMIT MESSAGE                                                │
│     Format: {type}({phase}-{plan}): {task description}                  │
│                                                                          │
│     git commit -m "feat(08-02): create user registration endpoint       │
│                                                                          │
│     - POST /auth/register validates email and password                  │
│     - Checks for duplicate users                                        │
│     - Returns JWT token on success                                      │
│     "                                                                    │
│                                                                          │
│  5. RECORD COMMIT HASH                                                  │
│     TASK_COMMIT=$(git rev-parse --short HEAD)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Plan Phase Workflow

**File:** `get-shit-done/workflows/plan-phase.md`

### Process Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PLAN-PHASE WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT                                                                  │
│  ─────                                                                  │
│  • PROJECT.md - Vision and requirements                                 │
│  • ROADMAP.md - Phase goal and dependencies                             │
│  • STATE.md - Current position, accumulated decisions                   │
│  • codebase/*.md - (if brownfield) existing code analysis              │
│  • Previous SUMMARY.md files - What was built                          │
│                                                                          │
│  DISCOVERY                                                              │
│  ─────────                                                              │
│  Determine unknowns level:                                              │
│                                                                          │
│  Level 0: Established patterns                                          │
│           Familiar work, minimal questions                              │
│                                                                          │
│  Level 1: Some unknowns                                                 │
│           Needs clarification, standard discovery                       │
│                                                                          │
│  Level 2: New integrations                                              │
│           Research likely, deeper discovery                             │
│                                                                          │
│  Level 3: Exploratory                                                   │
│           Significant unknowns, extensive discovery                     │
│                                                                          │
│  SCOPE ESTIMATION                                                       │
│  ────────────────                                                       │
│  • 2-3 tasks per plan maximum                                          │
│  • Each plan independently executable                                   │
│  • Split based on logical boundaries                                    │
│  • Group related tasks that share context                               │
│                                                                          │
│  TDD DECISION                                                           │
│  ────────────                                                           │
│  Can write expect(fn(input)).toBe(output) before fn?                   │
│  • Yes → Create dedicated TDD plan (one feature)                       │
│  • No → Standard plan                                                  │
│                                                                          │
│  WAVE COMPUTATION                                                       │
│  ────────────────                                                       │
│  • Identify dependencies between plans                                 │
│  • Assign wave number based on dependency depth                        │
│  • Plans with no dependencies → wave 1                                 │
│  • Plans depending on wave 1 → wave 2                                  │
│  • Etc.                                                                 │
│                                                                          │
│  OUTPUT                                                                 │
│  ──────                                                                 │
│  .planning/phases/XX-name/                                              │
│  ├── XX-01-PLAN.md (wave: 1)                                           │
│  ├── XX-02-PLAN.md (wave: 1)                                           │
│  └── XX-03-PLAN.md (wave: 2, depends_on: [01, 02])                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Verify Work Workflow

**File:** `get-shit-done/workflows/verify-work.md`

### Process Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VERIFY-WORK WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOAD CONTEXT                                                        │
│     • Read STATE.md for project position                                │
│     • Find SUMMARY.md files for completed work                          │
│     • Extract verification criteria                                     │
│                                                                          │
│  2. PRESENT WORK                                                        │
│     • Show what was built (from SUMMARY accomplishments)                │
│     • List files created/modified                                       │
│     • Show how to verify                                                │
│                                                                          │
│  3. COLLECT FEEDBACK                                                    │
│     • Ask user to verify each item                                      │
│     • Record "approved" or issues                                       │
│     • Document specific problems found                                  │
│                                                                          │
│  4. ROUTE BASED ON FEEDBACK                                             │
│     • All approved → Continue to next phase                            │
│     • Issues found → Create UAT-ISSUES.md                              │
│     • Route to /gsd:plan-fix for fixes                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Milestone Workflow

**File:** `get-shit-done/workflows/complete-milestone.md`

### Process Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 COMPLETE-MILESTONE WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. VERIFY COMPLETION                                                   │
│     • Check all phases are complete                                     │
│     • Verify all plans have SUMMARY.md                                  │
│     • Error if work remains                                             │
│                                                                          │
│  2. GATHER STATISTICS                                                   │
│     • Count phases completed                                            │
│     • Count plans executed                                              │
│     • Count commits made                                                │
│     • Calculate total duration                                          │
│                                                                          │
│  3. ARCHIVE PHASES                                                      │
│     • Wrap completed phases in <details> tags in ROADMAP.md            │
│     • Preserve full details in collapsible sections                    │
│     • Create milestone archive in milestones/ directory                │
│                                                                          │
│  4. HANDLE OPEN ISSUES                                                  │
│     • Move deferred issues to ISSUES.md                                │
│     • Mark which milestone they came from                              │
│     • Clear from inline sections                                       │
│                                                                          │
│  5. CREATE GIT TAG                                                      │
│     • Tag release: v{version}                                          │
│     • Include milestone summary in tag message                         │
│                                                                          │
│  6. RESET STATE                                                         │
│     • Update STATE.md for next milestone                               │
│     • Clear current position                                           │
│     • Preserve accumulated decisions                                   │
│                                                                          │
│  7. OFFER NEXT STEPS                                                    │
│     • /gsd:discuss-milestone for planning                              │
│     • /gsd:new-milestone to start next                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Resume Project Workflow

**File:** `get-shit-done/workflows/resume-project.md`

### Process Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   RESUME-PROJECT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOAD STATE                                                          │
│     • Read STATE.md                                                     │
│     • Parse current position                                            │
│     • Load accumulated decisions                                        │
│     • Load deferred issues                                              │
│     • Get session continuity info                                       │
│                                                                          │
│  2. CHECK CONTINUATION FILE                                             │
│     • Look for .continue-here file                                      │
│     • If exists: load in-progress context                              │
│     • If not: reconstruct from STATE.md                                │
│                                                                          │
│  3. PRESENT STATUS                                                      │
│     • Show project name                                                 │
│     • Show last session date/time                                       │
│     • Show current position (phase, plan)                               │
│     • Show progress bar                                                 │
│     • Show recent accomplishments                                       │
│                                                                          │
│  4. OFFER ACTIONS                                                       │
│     • Execute next plan                                                 │
│     • Execute remaining phase plans                                     │
│     • Show detailed progress                                            │
│     • Review open issues                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Gates

Workflows handle authentication errors dynamically:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION GATES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  DETECTION                                                              │
│  ─────────                                                              │
│  Auth error indicators:                                                 │
│  • "Not authenticated", "Not logged in", "Unauthorized"                 │
│  • HTTP 401, 403                                                        │
│  • "Please run {tool} login"                                            │
│  • "Set {ENV_VAR} environment variable"                                 │
│                                                                          │
│  PROTOCOL                                                               │
│  ────────                                                               │
│  1. Recognize it's an auth gate (not a bug)                             │
│  2. STOP current task execution                                         │
│  3. Create dynamic checkpoint:human-action                              │
│  4. Provide exact authentication steps                                  │
│  5. Wait for user to authenticate                                       │
│  6. Verify authentication works                                         │
│  7. Retry the original task                                             │
│  8. Continue normally                                                   │
│                                                                          │
│  EXAMPLE                                                                │
│  ───────                                                                │
│  Running: vercel --yes                                                  │
│  Error: Not authenticated                                               │
│                                                                          │
│  ════════════════════════════════════════                               │
│  CHECKPOINT: Authentication Required                                    │
│  ════════════════════════════════════════                               │
│                                                                          │
│  Task 3 of 8: Authenticate Vercel CLI                                   │
│                                                                          │
│  What you need to do:                                                   │
│  Run: vercel login                                                      │
│                                                                          │
│  Type "done" when authenticated                                         │
│  ════════════════════════════════════════                               │
│                                                                          │
│  [User types "done"]                                                    │
│                                                                          │
│  Verifying: vercel whoami                                               │
│  ✓ Authenticated as: user@example.com                                  │
│                                                                          │
│  Retrying: vercel --yes                                                │
│  ✓ Deployed successfully                                               │
│                                                                          │
│  DOCUMENTATION                                                          │
│  ─────────────                                                          │
│  Auth gates documented as normal flow, not deviations:                  │
│                                                                          │
│  ## Authentication Gates                                                │
│  1. Task 3: Vercel CLI required authentication                          │
│     - Paused for `vercel login`                                        │
│     - Resumed after authentication                                      │
│     - Deployed successfully                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## See Also

- [Architecture](./architecture.md) - System architecture
- [Data Flow](./data-flow.md) - How data moves through the system
- [Commands](./commands.md) - Complete command reference
- [Configuration](./configuration.md) - Setup options
