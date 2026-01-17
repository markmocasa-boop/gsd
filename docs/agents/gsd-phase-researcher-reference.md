# gsd-phase-researcher.md — Standard Reference

## Metadata
| Attribute | Value |
|-----------|-------|
| **Type** | Agent |
| **Location** | `agents/gsd-phase-researcher.md` |
| **Size** | 633 lines |
| **Documentation Tier** | Standard |
| **Complexity Score** | 2+2+2+2 = **8/12** |

### Complexity Breakdown
- **Centrality: 2** — Spawned by plan-phase/research-phase, directly feeds gsd-planner
- **Complexity: 2** — Source hierarchy, tool strategy, verification protocol, CONTEXT.md integration
- **Failure Impact: 2** — Bad research leads to poorly informed plans
- **Novelty: 2** — "Training as hypothesis" philosophy, prescriptive (not exploratory) output

---

## Purpose

Researches how to implement a specific phase before planning, producing findings that directly inform task creation. Answers "What do I need to know to PLAN this phase well?" The key distinction from project-researcher: phase-specific, prescriptive ("Use X" not "Consider X or Y"), and consumed immediately by planner.

---

## Critical Behaviors

- **MUST be prescriptive, not exploratory** — "Use X" not "Consider X or Y"; research becomes instructions for planner
- **MUST respect CONTEXT.md constraints** — If user locked decisions via `/gsd:discuss-phase`, research THOSE deeply, don't explore alternatives
- **MUST follow source hierarchy** — Context7 > Official Docs > WebSearch verified > WebSearch unverified
- **MUST include confidence levels** — HIGH/MEDIUM/LOW on all findings
- **MUST commit RESEARCH.md** — Unlike project-researcher, phase-researcher commits its own output

---

## CONTEXT.md Integration

If CONTEXT.md exists (from `/gsd:discuss-phase`), it constrains research scope:

| Section | Research Constraint |
|---------|---------------------|
| **Decisions** | Locked choices — research THESE deeply, don't explore alternatives |
| **Claude's Discretion** | Freedom areas — research options, make recommendations |
| **Deferred Ideas** | Out of scope — ignore completely |

---

## Interactions

| Reads | Writes | Spawned By | Consumed By |
|-------|--------|------------|-------------|
| `{phase}-CONTEXT.md` (if exists) | `{phase}-RESEARCH.md` | `/gsd:plan-phase` | `gsd-planner` |
| Context7 docs | | `/gsd:research-phase` | |
| Official docs via WebFetch | | | |
| WebSearch results | | | |

---

## RESEARCH.md Output Sections

The planner expects these specific sections:

| Section | How Planner Uses It |
|---------|---------------------|
| **Standard Stack** | Plans use these libraries, not alternatives |
| **Architecture Patterns** | Task structure follows these patterns |
| **Don't Hand-Roll** | Tasks NEVER build custom solutions for listed problems |
| **Common Pitfalls** | Verification steps check for these |
| **Code Examples** | Task actions reference these patterns |

---

## Source Hierarchy

| Level | Sources | Use |
|-------|---------|-----|
| **HIGH** | Context7, official documentation, official releases | State as fact |
| **MEDIUM** | WebSearch verified with official source, multiple credible sources agree | State with attribution |
| **LOW** | WebSearch only, single source, unverified | Flag as needing validation |

---

## Structured Returns

**RESEARCH COMPLETE:**
- Phase number and name
- Confidence level (HIGH/MEDIUM/LOW)
- Key findings (3-5 bullets)
- File created path
- Open questions for planner awareness

**RESEARCH BLOCKED:**
- What's preventing progress
- Options to resolve
- What's needed to continue

---

## Quick Reference

```
WHAT:     Phase-specific research to inform planning
MODES:    Single mode (phase implementation research)
OUTPUT:   .planning/phases/XX-name/{phase}-RESEARCH.md

CORE RULES:
• Be PRESCRIPTIVE ("Use X") not exploratory ("Consider X or Y")
• Respect CONTEXT.md constraints (locked decisions, discretion areas, deferred)
• Follow source hierarchy: Context7 > Official > WebSearch
• Commit your own RESEARCH.md (unlike project-researcher)

SPAWNED BY: /gsd:plan-phase, /gsd:research-phase
CONSUMED BY: gsd-planner (Standard Stack, Patterns, Pitfalls sections)
```
