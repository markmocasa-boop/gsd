# gsd-project-researcher.md — Standard Reference

## Metadata
| Attribute | Value |
|-----------|-------|
| **Type** | Agent |
| **Location** | `agents/gsd-project-researcher.md` |
| **Size** | 866 lines |
| **Documentation Tier** | Standard |
| **Complexity Score** | 2+2+2+2 = **8/12** |

### Complexity Breakdown
- **Centrality: 2** — Spawned by new-project/new-milestone orchestrators, feeds roadmapper
- **Complexity: 2** — 3 research modes, source hierarchy, verification protocol
- **Failure Impact: 2** — Bad research leads to poorly structured roadmaps
- **Novelty: 2** — "Training as hypothesis" philosophy is GSD-specific

---

## Purpose

Researches the domain ecosystem before roadmap creation, producing comprehensive findings that inform phase structure. Answers "What does this domain ecosystem look like?" by surveying technology landscape, feature categories, architecture patterns, and domain-specific pitfalls.

---

## Critical Behaviors

- **MUST treat Claude's training as hypothesis** — Training data is 6-18 months stale; verify claims with Context7 or official docs before stating as fact
- **MUST follow source hierarchy** — Context7 > Official Docs > WebSearch verified > WebSearch unverified; never present LOW confidence findings as authoritative
- **MUST include confidence levels** — HIGH (Context7/official), MEDIUM (WebSearch verified), LOW (WebSearch only)
- **DO NOT commit** — Always spawned in parallel with other researchers; orchestrator commits all research files together

---

## Modes/Variants

| Mode | Trigger | Output Focus |
|------|---------|--------------|
| **Ecosystem** (default) | "What tools/approaches exist for X?" | Comprehensive list of options, popularity, when to use each |
| **Feasibility** | "Can we do X?" or "Is Y possible?" | YES/NO/MAYBE with conditions, blockers, risk factors |
| **Comparison** | "Compare A vs B" | Comparison matrix, clear recommendation with rationale, tradeoffs |

---

## Interactions

| Reads | Writes | Spawned By | Consumed By |
|-------|--------|------------|-------------|
| PROJECT.md (if exists) | `.planning/research/SUMMARY.md` | `/gsd:new-project` | `gsd-roadmapper` |
| Context7 docs | `.planning/research/STACK.md` | `/gsd:new-milestone` | Roadmap creation |
| Official docs via WebFetch | `.planning/research/FEATURES.md` | | |
| WebSearch results | `.planning/research/ARCHITECTURE.md` | | |
| | `.planning/research/PITFALLS.md` | | |

---

## Output Files

| File | Purpose |
|------|---------|
| `SUMMARY.md` | Executive summary with roadmap implications, phase suggestions |
| `STACK.md` | Technology recommendations with versions and rationale |
| `FEATURES.md` | Table stakes, differentiators, anti-features |
| `ARCHITECTURE.md` | System structure patterns, component boundaries |
| `PITFALLS.md` | Common mistakes with prevention strategies |
| `COMPARISON.md` | If comparison mode - detailed comparison matrix |
| `FEASIBILITY.md` | If feasibility mode - YES/NO/MAYBE assessment |

---

## Quick Reference

```
WHAT:     Domain ecosystem research before roadmap creation
MODES:    Ecosystem (default), Feasibility, Comparison
OUTPUT:   .planning/research/ (SUMMARY, STACK, FEATURES, ARCHITECTURE, PITFALLS)

CORE RULES:
• Treat training data as hypothesis — verify with Context7/official docs
• Follow source hierarchy: Context7 > Official > WebSearch verified > WebSearch unverified
• Include confidence levels on all findings (HIGH/MEDIUM/LOW)
• DO NOT commit — orchestrator handles commits after all researchers complete

SPAWNED BY: /gsd:new-project, /gsd:new-milestone
CONSUMED BY: gsd-roadmapper (phase structure), roadmap creation
```
