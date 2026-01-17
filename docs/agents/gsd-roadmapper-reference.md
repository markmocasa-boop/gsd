# gsd-roadmapper.md — Standard Reference

## Metadata
| Attribute | Value |
|-----------|-------|
| **Type** | Agent |
| **Location** | `agents/gsd-roadmapper.md` |
| **Size** | 606 lines |
| **Documentation Tier** | Standard |
| **Complexity Score** | 2+2+2+2 = **8/12** |

### Complexity Breakdown
- **Centrality: 2** — Spawned by new-project, feeds plan-phase via ROADMAP.md
- **Complexity: 2** — Goal-backward phase derivation, coverage validation, depth calibration
- **Failure Impact: 2** — Bad roadmap = poorly structured project, cascading issues
- **Novelty: 2** — Goal-backward at phase level, anti-enterprise philosophy are GSD-specific

---

## Purpose

Creates project roadmaps that map requirements to phases with goal-backward success criteria. Transforms requirements into a phase structure where every v1 requirement maps to exactly one phase, and every phase has observable success criteria (2-5 user-verifiable behaviors). Initializes STATE.md for project memory.

---

## Critical Behaviors

- **MUST derive phases from requirements** — Let work determine phases, not a template ("Setup → Core → Features → Polish")
- **MUST validate 100% coverage** — Every v1 requirement maps to exactly one phase; no orphans, no duplicates
- **MUST apply goal-backward thinking** — "What must be TRUE for users?" not "What should we build?"
- **MUST write files FIRST, then return** — Ensures artifacts persist even if context is lost
- **NEVER include enterprise artifacts** — No time estimates, sprints, resource allocation, stakeholder management

---

## Goal-Backward Phase Derivation

**Forward planning asks:** "What should we build in this phase?"
**Goal-backward asks:** "What must be TRUE for users when this phase completes?"

**Process:**
1. **State phase goal** as outcome (not task): "Users can securely access their accounts" not "Build authentication"
2. **Derive 2-5 observable truths** — What users can observe/do when phase completes
3. **Cross-check against requirements** — Each criterion supported by requirement; each requirement supports a criterion
4. **Resolve gaps** — Add requirement, mark criterion out of scope, or reassign requirement

---

## Depth Calibration

Read depth from `config.json`. Depth controls compression tolerance:

| Depth | Typical Phases | Guidance |
|-------|----------------|----------|
| Quick | 3-5 | Combine aggressively, critical path only |
| Standard | 5-8 | Balanced grouping |
| Comprehensive | 8-12 | Let natural boundaries stand |

---

## Phase Patterns

**Good — Vertical Slices:**
```
Phase 1: Setup (project scaffolding)
Phase 2: Auth (complete feature)
Phase 3: Content (complete feature)
Phase 4: Social (complete feature)
```

**Bad — Horizontal Layers:**
```
Phase 1: All database models ← Too coupled
Phase 2: All API endpoints ← Can't verify independently
Phase 3: All UI components ← Nothing works until end
```

---

## Interactions

| Reads | Writes | Spawned By | Consumed By |
|-------|--------|------------|-------------|
| PROJECT.md (core value) | `.planning/ROADMAP.md` | `/gsd:new-project` | `/gsd:plan-phase` |
| REQUIREMENTS.md (v1 reqs) | `.planning/STATE.md` | | `gsd-planner` |
| research/SUMMARY.md (if exists) | REQUIREMENTS.md (traceability update) | | |
| config.json (depth) | | | |

---

## Output Files

**ROADMAP.md:**
- Overview (2-3 sentences)
- Phases with Goal, Dependencies, Requirements, Success Criteria (2-5 observable behaviors each)
- Progress table

**STATE.md:**
- Project Reference (core value, current focus)
- Current Position (phase, plan, status, progress bar)
- Performance Metrics
- Accumulated Context (decisions, todos, blockers)
- Session Continuity

---

## Structured Returns

- **ROADMAP CREATED** — Files written, summary table, success criteria preview, coverage status
- **ROADMAP REVISED** — Changes made, updated summary, coverage re-validated
- **ROADMAP BLOCKED** — What's blocking, options to resolve, what input needed

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Impose arbitrary structure ("All projects need 5-7 phases") | Derive phases from requirements |
| Use horizontal layers (Models → APIs → UI) | Use vertical slices (complete features) |
| Skip coverage validation | Explicit mapping of every requirement |
| Write vague success criteria ("Auth works") | Observable behaviors ("User can log in and stay logged in across sessions") |
| Add enterprise artifacts (estimates, Gantt, risks) | Focus on phases, goals, requirements, criteria |

---

## Quick Reference

```
WHAT:     Requirement → phase mapping with goal-backward success criteria
MODES:    Single mode (roadmap creation)
OUTPUT:   .planning/ROADMAP.md, .planning/STATE.md, REQUIREMENTS.md traceability update

CORE RULES:
• Derive phases from requirements (don't impose template)
• 100% coverage required (every v1 req → exactly one phase)
• Goal-backward: "What must be TRUE for users?" not "What to build?"
• Write files FIRST, then return (artifacts persist if context lost)
• NO enterprise artifacts (estimates, sprints, resources)

SPAWNED BY: /gsd:new-project
CONSUMED BY: /gsd:plan-phase (phase goals → plans), gsd-planner (success criteria → must_haves)
```
