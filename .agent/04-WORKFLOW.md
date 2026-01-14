# Active Workflow

```
═══════════════════════════════════════════════════════════════════════════════
  THIS FILE SHOULD BE SET DURING PROJECT SETUP
  If no workflow is selected, use quick-fix as default or ask the user
═══════════════════════════════════════════════════════════════════════════════
```

---

## Available Workflows

### quick-fix
**For:** Small changes, bug fixes, typos
**Phases:** 1
**Identities:** BUILDER only
**Time:** Minutes

```
[BUILDER] → Done
```

### feature-build
**For:** Adding new features, moderate complexity
**Phases:** 3
**Identities:** PLANNER → ARCHITECT → BUILDER
**Time:** Hours

```
[PLANNER] → [ARCHITECT] → [BUILDER] → Done
    │            │             │
    └─ Plan      └─ Design     └─ Code
```

### full-stack
**For:** Complete features touching frontend + backend + database
**Phases:** 5
**Identities:** PLANNER → ARCHITECT → BUILDER(fe) + BUILDER(be) → TESTER → REVIEWER
**Time:** Day(s)

```
[PLANNER] → [ARCHITECT] → [BUILDER:fe] ─┬─ [TESTER] → [REVIEWER] → Done
                          [BUILDER:be] ─┘
```

### explore
**For:** Creative projects, experiments, learning
**Phases:** Flexible
**Identities:** As needed
**Time:** Variable

```
[Flexible] → Adapt as you go → Done when user says so
```

No rigid structure. Ask questions, iterate, experiment.

### enterprise
**For:** Production systems, critical paths, audit requirements
**Phases:** 7
**Identities:** Full sequence with staged apply
**Time:** Days to weeks

```
[PLANNER] → [ARCHITECT] → [REVIEWER:design] → [BUILDER] → [TESTER] → [REVIEWER:code] → [STAGED_APPLY] → Done
```

---

## Selected Workflow

**Current Workflow:** [WORKFLOW_NAME or "none selected"]

**Complexity:** [ ] simple  [ ] moderate  [ ] complex  [ ] extreme

---

## Phase Progress

| # | Phase | Identity | Status | Output |
|---|-------|----------|--------|--------|
| 1 | [phase] | [identity] | [ ] not started / [x] complete | [deliverable] |
| 2 | [phase] | [identity] | [ ] not started | [deliverable] |
| 3 | [phase] | [identity] | [ ] not started | [deliverable] |

---

## Current Phase Details

**Phase:** [CURRENT_PHASE_NUMBER]
**Name:** [PHASE_NAME]
**Identity:** [ACTIVE_IDENTITY]

**Objective:**
[What this phase should produce]

**Inputs:**
[What was received from previous phase]

**Expected Outputs:**
- [ ] [output 1]
- [ ] [output 2]

**Quality Gates:**
- [ ] [gate 1]
- [ ] [gate 2]

---

## Workflow Selection Guide

If no workflow is selected, help the user choose:

| Question | Answer → Workflow |
|----------|-------------------|
| Is this a quick fix or small change? | Yes → quick-fix |
| Does it need planning but not full architecture? | Yes → feature-build |
| Does it touch both frontend and backend? | Yes → full-stack |
| Is this experimental or creative? | Yes → explore |
| Is this production-critical? | Yes → enterprise |

Or ask the user directly:
> "What kind of task is this?
> 1. Quick fix (small change, bug fix)
> 2. New feature (needs some planning)
> 3. Full system work (frontend + backend + database)
> 4. Exploration (creative, experimental)
> 5. Enterprise (critical, needs audit trail)"

---

```
Previous: ← 03-IDENTITY.md
Next:     → 05-CONSTRAINTS.md
```
