# GSD Documentation Execution Plan v2

> **Objective:** Create comprehensive LLM-optimized documentation for the GSD system.
> **Method:** Multi-phase extraction with context-aware batching.
> **Output:** Complete reference documentation suitable for Claude Code modification tasks.

---

## Prerequisites

Before starting, ensure you have:
- [ ] GSD repository cloned locally
- [ ] `GSD_ARCHITECTURE_SCAFFOLDING.md` in your project (already created)
- [ ] `extraction-case-study-gsd-planner.md` available as methodology reference
- [ ] Claude Code or similar agent with file read/write access

---

## Deep Reference Extraction Methodology

**CRITICAL:** Before executing any Deep Reference prompt, understand the 7-phase extraction process demonstrated in `extraction-case-study-gsd-planner.md`:

### The 7 Phases

| Phase | Purpose | Key Activities |
|-------|---------|----------------|
| 1. Pre-Analysis | Inventory the file | Line count, section list, marker scan (MUST/NEVER/ALWAYS counts) |
| 2. Complexity Assessment | Score 1-3 on 4 factors | Centrality, Complexity, Failure Impact, Novelty |
| 3. Critical Behavior Extraction | 5 systematic passes | Constraints, numeric limits, modes, relationships, anti-patterns |
| 4. Relationship Extraction | Map dependencies | What reads/writes/spawns/consumes |
| 5. Anti-Pattern Extraction | Document failure modes | Search for "Don't", "Avoid", "Bad" |
| 6. Gap Detection | Verify completeness | Answer the 8 critical questions |
| 7. Verification | Self-test quality | 3 verification questions |

### The 8 Critical Questions (Phase 6)

Every Deep Reference must answer:
1. What modes can this agent operate in?
2. What triggers each mode?
3. What are the hard numeric limits?
4. What's the core methodology?
5. What does it read?
6. What does it write?
7. What breaks if this changes?
8. What are common mistakes?

### The 3 Verification Questions (Phase 7)

After drafting, ask:
1. Could someone modify this file safely with only this documentation?
2. What questions does this documentation NOT answer?
3. What almost got missed?

---

## Phase Overview

| Phase | Focus | Files Created | Est. Passes |
|-------|-------|---------------|-------------|
| 1 | File Manifest | `FILE_MANIFEST.md` | 1 |
| 2 | Core Agents (Deep) | 4 agent docs | 4 |
| 3 | Support Agents (Standard) | 4 agent docs | 2 |
| 4 | Commands (Batch) | Command reference | 2 |
| 5 | Workflows & Templates | Support docs | 1 |
| 6 | Integration & Index | Final index | 1 |

**Total estimated passes:** 11 (each pass = fresh context)

---

## Phase 1: File Manifest Generation

**Goal:** Create a complete inventory of all GSD files with metadata.

### Prompt 1.1 — Generate File Manifest

```
Create a FILE_MANIFEST.md for the GSD system by analyzing the repository structure.

For each file, extract:
- Path
- Category (command | agent | workflow | template | reference | state | hook)
- Purpose (one line)
- Key relationships (@-references to other files)

Use this structure:

```markdown
# GSD File Manifest

## Commands (commands/gsd/*.md)
| File | Purpose | Spawns |
|------|---------|--------|
| new-project.md | Project initialization | gsd-researcher, gsd-roadmapper |
...

## Agents (agents/*.md)  
| File | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| gsd-planner.md | Phase planning | 1319 | High |
...

## Workflows (get-shit-done/workflows/*.md)
...

## Templates (get-shit-done/templates/*.md)
...

## References (get-shit-done/references/*.md)
...

## State Templates (implied by templates)
...
```

Execute:
1. `find . -name "*.md" -type f | grep -E "(commands|agents|workflows|templates|references)" | sort`
2. For each file, read first 50 lines to extract purpose
3. Count lines: `wc -l <file>`
4. Scan for @-references: `grep -o "@[^[:space:]]*" <file> | sort -u`

Write output to: `.planning/docs/FILE_MANIFEST.md`
```

**Success criteria:**
- [ ] All .md files cataloged
- [ ] Line counts accurate
- [ ] @-references extracted
- [ ] Categories assigned

---

## Phase 2: Core Agent Documentation (Deep Reference)

These agents score 10-12 on complexity and require full extraction.

### Deep Reference Output Template

**All Deep Reference documents MUST include these sections:**

```markdown
# {agent}.md — Deep Reference Documentation

## Metadata
| Attribute | Value |
|-----------|-------|
| **Type** | Agent |
| **Location** | `agents/{agent}.md` |
| **Size** | {N} lines |
| **Documentation Tier** | Deep Reference |
| **Complexity Score** | {a}+{b}+{c}+{d} = **{total}** |

### Complexity Breakdown
- **Centrality: {1-3}** — [justification]
- **Complexity: {1-3}** — [justification]
- **Failure Impact: {1-3}** — [justification]
- **Novelty: {1-3}** — [justification]

---

## Purpose
[2-3 sentences explaining core responsibility and why it matters]
[Key innovations this agent embodies]

---

## Critical Behaviors ⚠️

### Constraints Enforced
| Constraint | Rule | Consequence if Violated | Source Section |
|------------|------|------------------------|----------------|
| ... | ... | ... | `<section_name>` |

### Numeric Limits
| Limit | Value | Rationale |
|-------|-------|-----------|
| ... | ... | ... |

### Quality/Performance Curves (if applicable)
| Threshold | State | Behavior |
|-----------|-------|----------|
| 0-30% | ... | ... |
| ... | ... | ... |

---

## Operational Modes

### Mode 1: {Name}
- **Trigger:** [what activates this mode]
- **Input:** [what it receives]
- **Process:** [key steps]
- **Output:** [what it produces]
- **Key difference:** [vs other modes]

### Mode 2: {Name}
[same structure]

---

## Mechanism

### Execution Flow
```
1. step_name
   ├── Sub-step A
   ├── Sub-step B
   └── Decision point → [outcome A | outcome B]

2. step_name
   ...
```

### Core Methodology (if agent has signature approach)
**[Name of methodology] asks:** "[key question]"

**Step-by-step process:**
1. [Step with explanation]
   - Good example: [concrete example]
   - Bad example: [concrete example]
2. [Next step]
   ...

### Decision Heuristics (if applicable)
| Decision Point | Condition | Action A | Action B |
|----------------|-----------|----------|----------|
| ... | ... | ... | ... |

### Scope/Budget Estimation (if applicable)
| Factor | Value | Context Impact |
|--------|-------|----------------|
| ... | ... | ... |

### Split/Branch Signals (if applicable)
**ALWAYS [split/branch/escalate] if:**
- [Condition 1]
- [Condition 2]
- ...

---

## Interactions

### Reads
| File | What It Uses | Why |
|------|--------------|-----|
| ... | ... | ... |

### Writes
| File | Content | Format |
|------|---------|--------|
| ... | ... | ... |

### Spawned By
| Command/Agent | Mode | Context Provided |
|---------------|------|------------------|
| ... | ... | ... |

### Output Consumed By
| Consumer | What They Use | How |
|----------|--------------|-----|
| ... | ... | ... |

---

## Structured Returns

### {Return Type 1}
```markdown
## {RETURN_TYPE_NAME}

**{field}:** {value}
...
```

### {Return Type 2}
[same structure for each return message format]

---

## Anti-Patterns

| Anti-Pattern | Why Bad | Correct Approach |
|--------------|---------|------------------|
| ❌ ... | ... | ... |

---

## Change Impact Analysis

### If {agent} Changes:

**Upstream Impact (who calls this):**
- [component] — [what might need updating]

**Downstream Impact (who consumes output):**
- [component] — [what expects specific format]

**Breaking Changes to Watch:**
- Changing [X] → breaks [Y]
- ...

---

## Section Index

| Section | Lines (approx) | Purpose |
|---------|----------------|---------|
| `<section_name>` | N-M | [brief purpose] |
| ... | ... | ... |

---

## Quick Reference

```
WHAT:     [one-line description]
MODES:    [mode list]
BUDGET:   [context target]
OUTPUT:   [primary output files]

CORE RULES:
• [Rule 1]
• [Rule 2]
• [Rule 3]

SPAWNED BY: [list]
CONSUMED BY: [list]
```
```

---

### Prompt 2.1 — gsd-planner Deep Reference

```
Create Deep Reference documentation for agents/gsd-planner.md (1319 lines, complexity 12/12).

## Pre-Analysis (Phase 1)

**Structure scan:**
`grep -n "^<[a-z_]*>$\|^</[a-z_]*>$" agents/gsd-planner.md`

**Marker scan:**
`grep -c "MUST\|NEVER\|ALWAYS" agents/gsd-planner.md`
`grep -c "[0-9]*%" agents/gsd-planner.md`

## Extraction Protocol (Phase 3)

**Pass 1: Constraint extraction**
`grep -n "MUST\|NEVER\|ALWAYS\|ONLY\|maximum\|minimum" agents/gsd-planner.md`

**Pass 2: Numeric limits**
`grep -n "[0-9]*%" agents/gsd-planner.md`
`grep -n "2-3\|3-7\|max 3\|50%\|40%" agents/gsd-planner.md`

**Pass 3: Mode detection**
`grep -n "mode.*=\|Mode:\|standard\|gap_closure\|revision" agents/gsd-planner.md`

**Pass 4: Relationships**
- Search for: `cat`, `Read`, `@.planning/` (what it reads)
- Search for: `Write`, `git add`, output paths (what it writes)
- Search for: `Task(` with this agent (what spawns it)

**Pass 5: Anti-patterns**
`grep -n "Don't\|Avoid\|Anti-pattern\|Bad\|Never" agents/gsd-planner.md`

## Required Output Sections

Your documentation MUST include:

1. **Complexity Breakdown** — Score each of 4 factors with justification
2. **Quality Degradation Curve** — The 4-tier context usage table (0-30%, 30-50%, etc.)
3. **Three Operational Modes** — Standard, Gap Closure, Revision (each with trigger/input/process/output/key difference)
4. **Execution Flow** — 12-step process with decision tree formatting
5. **Goal-Backward Methodology** — 5-step process with concrete examples for each step
6. **TDD Detection Heuristic** — Yes/No decision table with action for each
7. **Scope Estimation Tables** — File count → context %, Task complexity → context %
8. **Split Signals** — Explicit list of "ALWAYS split if" conditions
9. **Structured Returns** — All 4 return message formats (PLANNING COMPLETE, CHECKPOINT REACHED, GAP CLOSURE PLANS CREATED, REVISION COMPLETE)
10. **Change Impact Analysis** — Upstream/downstream/breaking changes

## Critical Questions to Answer

1. What are the 3 modes and their triggers?
2. What's the 2-3 task limit and why?
3. What's the 50% context target and quality curve?
4. How does goal-backward methodology work step-by-step?
5. How is TDD detected and handled differently?
6. What causes a plan to split?
7. What's the wave assignment algorithm?
8. What frontmatter fields do consumers expect?

## Verification (Phase 7)

After drafting, verify:
- [ ] Could someone modify gsd-planner.md safely using only this doc?
- [ ] Are all 4 return message formats documented?
- [ ] Is the goal-backward methodology clear enough to execute?
- [ ] Are all breaking change scenarios identified?

Write to: `.planning/docs/agents/gsd-planner-reference.md`
```

---

### Prompt 2.2 — gsd-executor Deep Reference

```
Create Deep Reference documentation for agents/gsd-executor.md.

## Complexity Assessment (Phase 2)

| Factor | Score | Justification |
|--------|-------|---------------|
| Centrality | 3 | Spawned by execute-phase, outputs consumed by verifier |
| Complexity | 3 | Deviation handling, checkpoints, atomic commits, segment routing |
| Failure Impact | 3 | Execution failures = no code shipped |
| Novelty | 2 | Execution patterns are GSD-specific |
| **Total** | **11** | → Deep Reference tier |

## Pre-Analysis (Phase 1)

**Structure scan:**
`grep -n "^<[a-z_]*>$\|^</[a-z_]*>$" agents/gsd-executor.md`

**Marker scan:**
`grep -c "MUST\|NEVER\|ALWAYS\|checkpoint\|deviation" agents/gsd-executor.md`

## Key Sections to Extract

- `<deviation_rules>` — When to auto-fix vs checkpoint (extract decision matrix)
- `<checkpoint_behavior>` — Three checkpoint types with triggers
- `<execution_flow>` — Task-by-task process
- `<segment_execution>` — Subagent vs main context (when each is used)
- `<commit_protocol>` — Atomic commit patterns

## Required Output Sections

1. **Deviation Handling Matrix** — Type × Severity → Action table
2. **Three Checkpoint Types** — Each with trigger, behavior, continuation
3. **Execution Flow** — Step-by-step with decision points
4. **Segment Routing Logic** — When to spawn subagent vs execute in main context
5. **Commit Protocol** — Atomic commit rules
6. **Structured Returns** — All return message formats
7. **Change Impact Analysis**

## Critical Questions to Answer

1. What are the deviation types and how is each handled?
2. What triggers each checkpoint type?
3. How does segment execution work (subagent vs main)?
4. What's the commit-per-task protocol?
5. How does executor handle mid-execution failures?
6. What's the SUMMARY.md schema?

## Verification

- [ ] Could someone modify gsd-executor.md safely using only this doc?
- [ ] Is deviation handling complete (all types, all severities)?
- [ ] Are checkpoint resumption paths clear?

Write to: `.planning/docs/agents/gsd-executor-reference.md`
```

---

### Prompt 2.3 — gsd-verifier Deep Reference

```
Create Deep Reference documentation for agents/gsd-verifier.md.

## Complexity Assessment (Phase 2)

| Factor | Score | Justification |
|--------|-------|---------------|
| Centrality | 3 | Called after every phase execution |
| Complexity | 3 | 4-level verification hierarchy, truth vs artifact distinction |
| Failure Impact | 3 | Missed gaps = broken features ship |
| Novelty | 3 | Goal-backward verification is core innovation |
| **Total** | **12** | → Deep Reference tier |

## Pre-Analysis (Phase 1)

**Structure scan:**
`grep -n "^<[a-z_]*>$\|^</[a-z_]*>$" agents/gsd-verifier.md`

## Key Sections to Extract

- `<verification_hierarchy>` — Existence→Substantive→Wired→Functional (extract each level's criteria)
- `<truth_verification>` — Observable behavior checks (how to verify user-facing truths)
- `<artifact_verification>` — File existence checks
- `<gap_detection>` — How gaps are classified (type, severity)
- `<output_format>` — VERIFICATION.md schema

## Required Output Sections

1. **4-Level Verification Hierarchy** — Each level with definition, checks, pass criteria
2. **Truth vs Artifact Distinction** — When to use each, examples
3. **Gap Classification** — Types and severities with examples
4. **Verification Flow** — Step-by-step process
5. **VERIFICATION.md Schema** — Complete output format
6. **Structured Returns** — All return types
7. **Change Impact Analysis**

## Critical Questions to Answer

1. What's the 4-level verification hierarchy?
2. How does truth verification differ from artifact verification?
3. What causes a gap vs a pass at each level?
4. What's the VERIFICATION.md schema?
5. How does verifier connect to gap closure planning?

## Verification

- [ ] Could someone modify gsd-verifier.md safely using only this doc?
- [ ] Is each verification level's pass/fail criteria explicit?
- [ ] Is gap → gap closure planning connection clear?

Write to: `.planning/docs/agents/gsd-verifier-reference.md`
```

---

### Prompt 2.4 — gsd-plan-checker Deep Reference

```
Create Deep Reference documentation for agents/gsd-plan-checker.md.

## Complexity Assessment (Phase 2)

| Factor | Score | Justification |
|--------|-------|---------------|
| Centrality | 2 | Only called by plan-phase |
| Complexity | 3 | 6 verification dimensions |
| Failure Impact | 3 | Bad plans approved = cascading failures |
| Novelty | 2 | Pre-execution verification pattern |
| **Total** | **10** | → Deep Reference tier |

## Key Sections to Extract

- `<verification_dimensions>` — All 6 dimensions with specific criteria
- `<issue_format>` — How issues are reported (structure)
- `<pass_criteria>` — What constitutes approval
- `<revision_protocol>` — How issues are sent back to planner

## Required Output Sections

1. **The 6 Verification Dimensions** — Each with:
   - What it checks
   - Pass criteria
   - Common failure modes
   - Example issues

2. **Issue Reporting Format** — Structure with examples

3. **Pass/Fail Decision Logic** — When to pass, when to send for revision

4. **Revision Protocol** — How issues flow back to planner

5. **Structured Returns** — APPROVED vs ISSUES_FOUND formats

6. **Change Impact Analysis**

## The 6 Dimensions (extract full details)

1. **Requirement coverage** — [extract criteria]
2. **Task completeness** — [extract criteria]
3. **Dependency correctness** — [extract criteria]
4. **Key link validation** — [extract criteria]
5. **Scope sanity** — [extract criteria]
6. **Must-haves derivation** — [extract criteria]

## Verification

- [ ] Could someone modify gsd-plan-checker.md safely using only this doc?
- [ ] Are all 6 dimensions fully specified?
- [ ] Is the revision → planner flow clear?

Write to: `.planning/docs/agents/gsd-plan-checker-reference.md`
```

---

## Phase 3: Support Agent Documentation (Standard Tier)

These agents score 6-9 and need Standard tier documentation (150-300 tokens each).

### Standard Tier Template

```markdown
# {agent}.md — Standard Reference

## Metadata
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Location | agents/{agent}.md |
| Complexity | {score}/12 |

## Purpose
[2-3 sentences]

## Critical Behaviors
- [Constraint 1 with consequence]
- [Constraint 2 with consequence]
- [Key numeric limit]

## Modes/Variants (if applicable)
| Mode | Trigger | Output |
|------|---------|--------|
| ... | ... | ... |

## Interactions
| Reads | Writes | Spawned By | Consumed By |
|-------|--------|------------|-------------|
| ... | ... | ... | ... |

## Quick Reference
[3-line summary]
```

---

### Prompt 3.1 — Research Agents (Batch)

```
Create Standard tier documentation for research agents.

## Files to Process
1. agents/gsd-researcher.md — Project-level research
2. agents/gsd-phase-researcher.md — Phase-specific research

## Extraction Focus

**For each agent, extract:**
- Research modes (how many? what triggers each?)
- Source hierarchy (what sources are prioritized?)
- Output files (RESEARCH.md, STACK.md, etc.)
- Key constraints (depth limits, source limits)
- Downstream consumers (who uses the research?)

**Search patterns:**
```bash
grep -n "mode\|Mode\|level\|Level" agents/gsd-researcher.md
grep -n "source\|Source\|priority" agents/gsd-researcher.md
grep -n "RESEARCH\|STACK\|CONTEXT" agents/gsd-researcher.md
```

Write to: 
- `.planning/docs/agents/gsd-researcher-reference.md`
- `.planning/docs/agents/gsd-phase-researcher-reference.md`
```

---

### Prompt 3.2 — Utility Agents (Batch)

```
Create Standard tier documentation for utility agents.

## Files to Process
1. agents/gsd-debugger.md — Scientific debugging
2. agents/gsd-codebase-mapper.md — Brownfield analysis
3. agents/gsd-roadmapper.md — Requirement→phase mapping

## Extraction Focus

**gsd-debugger:**
- Investigation techniques (list all)
- Hypothesis testing protocol
- Debug file lifecycle (active → resolved)
- Checkpoint handling during debug

**gsd-codebase-mapper:**
- Output files (all 7 if applicable)
- Analysis sequence
- Integration with new-project flow

**gsd-roadmapper:**
- Requirement→phase mapping logic
- Coverage validation rules
- ROADMAP.md schema

Write to:
- `.planning/docs/agents/gsd-debugger-reference.md`
- `.planning/docs/agents/gsd-codebase-mapper-reference.md`
- `.planning/docs/agents/gsd-roadmapper-reference.md`
```

---

## Phase 4: Command Documentation

### Prompt 4.1 — Core Commands

```
Create command documentation for the primary workflow commands.

## Files to Process
1. commands/gsd/new-project.md
2. commands/gsd/plan-phase.md
3. commands/gsd/execute-phase.md
4. commands/gsd/verify-work.md

## Command Documentation Template

```markdown
# /gsd:{command}

## Purpose
[One sentence]

## Arguments & Flags
| Arg/Flag | Required | Purpose | Default |
|----------|----------|---------|---------|
| ... | ... | ... | ... |

## Execution Flow
1. [Step with decision point]
2. [Agent spawn if any]
3. [Output routing]

## Spawns
| Agent | Condition | Purpose |
|-------|-----------|---------|
| ... | ... | ... |

## Reads/Writes
| Reads | Writes |
|-------|--------|
| ... | ... |

## Structured Returns
[Key return messages with formats]

## Success Criteria
[From source file]

## Common Patterns
- [Usage pattern 1]
- [Usage pattern 2]

## Error Handling
[What happens on failure]
```

## Extraction Commands
```bash
grep -n "argument-hint\|allowed-tools" commands/gsd/{command}.md
grep -n "Task(" commands/gsd/{command}.md
grep -n "success_criteria\|Success" commands/gsd/{command}.md
```

Write to: `.planning/docs/commands/core-commands-reference.md`
```

---

### Prompt 4.2 — Secondary Commands

```
Create condensed documentation for secondary commands.

## Files to Process (Minimal tier — one table entry each)
- add-phase.md, insert-phase.md, remove-phase.md
- add-todo.md, check-todos.md
- progress.md, resume-work.md, pause-work.md
- discuss-phase.md, research-phase.md, list-phase-assumptions.md
- new-milestone.md, complete-milestone.md
- debug.md, map-codebase.md
- help.md, whats-new.md, update.md

## Output Format

```markdown
# Secondary Commands Reference

## Roadmap Management
| Command | Purpose | Key Args | Spawns | Output |
|---------|---------|----------|--------|--------|
| add-phase | Append phase to roadmap | description | None | ROADMAP.md |
| insert-phase | Insert between phases | after, description | None | ROADMAP.md |
| remove-phase | Delete future phase | number | None | ROADMAP.md |

## Session Management
| Command | Purpose | Key Args | Spawns | Output |
|---------|---------|----------|--------|--------|
| progress | Show current state | — | None | Display |
| resume-work | Continue paused work | — | None | Display |
| pause-work | Mark stopping point | — | None | STATE.md |

## Debugging & Analysis
| Command | Purpose | Key Args | Spawns | Output |
|---------|---------|----------|--------|--------|
| debug | Scientific debugging | symptom | gsd-debugger | DEBUG.md |
| map-codebase | Analyze existing code | — | gsd-codebase-mapper | CODEBASE.md |

## Milestone Management
...

## Utility
...
```

Write to: `.planning/docs/commands/secondary-commands-reference.md`
```

---

## Phase 5: Workflows, Templates & References

### Prompt 5.1 — Support Documentation

```
Create condensed documentation for workflows, templates, and references.

## Workflows (get-shit-done/workflows/*.md)

Document each with:
- Purpose (one line)
- Used by (which agents/commands)
- Key steps (numbered list, 3-5 items)
- Output (what it produces)

## Templates (get-shit-done/templates/*.md)

Document each with:
- Produces (which file)
- Filled by (which agent/command)
- Required sections (list)
- Frontmatter schema (if applicable, list all fields)

## References (get-shit-done/references/*.md)

Document each with:
- Domain (what topic)
- Used by (which components)
- Key concepts (3-5 bullets)

## Output Format

```markdown
# Support Components Reference

## Workflows
| Workflow | Purpose | Used By | Output |
|----------|---------|---------|--------|
| execute-plan.md | Task execution | gsd-executor | SUMMARY.md |
...

### execute-plan.md Details
**Steps:**
1. Load PLAN.md and context
2. Execute tasks sequentially
3. Handle deviations per rules
4. Commit after each task
5. Write SUMMARY.md

### [other workflow details...]

## Templates
| Template | Produces | Filled By | Key Sections |
|----------|----------|-----------|--------------|
| ... | ... | ... | ... |

### Frontmatter Schemas

**PLAN.md Frontmatter:**
| Field | Type | Required | Used By |
|-------|------|----------|---------|
| wave | int | Yes | execute-phase |
| depends_on | list | No | execute-phase |
| autonomous | bool | Yes | executor |
| ... | ... | ... | ... |

**[other schemas...]**

## References
| Reference | Domain | Used By |
|-----------|--------|---------|
| ... | ... | ... |
```

Write to: `.planning/docs/support-components-reference.md`
```

---

## Phase 6: Integration & Final Index

### Prompt 6.1 — Create Master Index

```
Create the master documentation index that ties everything together.

## Input Files
- GSD_ARCHITECTURE_SCAFFOLDING.md (already exists)
- .planning/docs/FILE_MANIFEST.md
- .planning/docs/agents/*.md
- .planning/docs/commands/*.md
- .planning/docs/support-components-reference.md

## Output Structure

```markdown
# GSD Documentation Index

## Quick Start
For modification tasks, load in this order:
1. This index (navigation)
2. GSD_ARCHITECTURE_SCAFFOLDING.md (architecture)
3. Relevant component doc (behavioral details)

## Document Map

### Architecture (Load First)
| Document | Tokens | Purpose |
|----------|--------|---------|
| GSD_ARCHITECTURE_SCAFFOLDING.md | ~2,200 | System architecture, registries, flows |

### Agent References
| Agent | Tier | Tokens | When to Load |
|-------|------|--------|--------------|
| gsd-planner | Deep | ~800 | Modifying planning logic |
| gsd-executor | Deep | ~700 | Modifying execution logic |
| gsd-verifier | Deep | ~700 | Modifying verification |
| gsd-plan-checker | Deep | ~600 | Modifying plan validation |
| gsd-researcher | Standard | ~300 | Modifying research |
| gsd-debugger | Standard | ~300 | Modifying debugging |
...

### Command References
| Document | Coverage | Tokens |
|----------|----------|--------|
| core-commands-reference.md | 4 commands | ~600 |
| secondary-commands-reference.md | 17 commands | ~400 |

### Support References
| Document | Coverage | Tokens |
|----------|----------|--------|
| support-components-reference.md | Workflows, templates, refs | ~500 |

## Modification Guides

### Adding a New Command
1. Load: scaffolding + core-commands-reference
2. Read: Similar command as template
3. Create: commands/gsd/{name}.md
4. Update: help.md command list

### Adding a New Agent
1. Load: scaffolding + similar agent reference
2. Create: agents/gsd-{name}.md
3. Update: Spawning command
4. Add: Output template if needed

### Modifying an Agent
1. Load: scaffolding + agent's deep reference
2. Identify: Section to modify (use section index)
3. Extract: Current constraints from source
4. Modify: Preserving constraints
5. Update: Downstream consumers if output changes
6. **Verify: Check Change Impact Analysis for breaking changes**

### Modifying State Schema
1. Load: scaffolding + FILE_MANIFEST
2. Identify: All readers/writers of that state file
3. Update: Template + all consumers
4. Test: Full flow that uses state

## Cross-Reference Matrix

| Component | Reads | Writes | Spawns | Spawned By |
|-----------|-------|--------|--------|------------|
| /gsd:plan-phase | ROADMAP, STATE | — | planner, checker | User |
| gsd-planner | STATE, ROADMAP, CONTEXT, RESEARCH | PLAN.md | — | plan-phase |
| gsd-executor | PLAN.md, STATE | SUMMARY.md, code | — | execute-phase |
| gsd-verifier | PLAN.md, SUMMARY.md | VERIFICATION.md | — | verify-work |
| gsd-plan-checker | PLAN.md | (issues) | — | plan-phase |
...

## Appendix: Token Budget Guide

| Task Type | Load These | Est. Tokens |
|-----------|------------|-------------|
| Quick lookup | Index only | ~500 |
| Architecture review | Index + scaffolding | ~2,700 |
| Agent modification | Above + agent ref | ~3,500 |
| Full system change | Above + related refs | ~5,000 |
```

Write to: `.planning/docs/GSD_DOCUMENTATION_INDEX.md`
```

---

## Execution Checklist

### Phase 1: Manifest
- [ ] Run Prompt 1.1
- [ ] Verify all files cataloged
- [ ] `/clear` context

### Phase 2: Core Agents
- [ ] Run Prompt 2.1 (gsd-planner)
- [ ] **Verify: All 10 required sections present**
- [ ] **Verify: 3 verification questions answered**
- [ ] `/clear` context
- [ ] Run Prompt 2.2 (gsd-executor)
- [ ] **Verify: Deviation matrix complete**
- [ ] `/clear` context
- [ ] Run Prompt 2.3 (gsd-verifier)
- [ ] **Verify: All 4 verification levels documented**
- [ ] `/clear` context
- [ ] Run Prompt 2.4 (gsd-plan-checker)
- [ ] **Verify: All 6 dimensions documented**
- [ ] `/clear` context

### Phase 3: Support Agents
- [ ] Run Prompt 3.1 (research agents)
- [ ] `/clear` context
- [ ] Run Prompt 3.2 (utility agents)
- [ ] `/clear` context

### Phase 4: Commands
- [ ] Run Prompt 4.1 (core commands)
- [ ] `/clear` context
- [ ] Run Prompt 4.2 (secondary commands)
- [ ] `/clear` context

### Phase 5: Support Docs
- [ ] Run Prompt 5.1
- [ ] **Verify: All frontmatter schemas documented**
- [ ] `/clear` context

### Phase 6: Integration
- [ ] Run Prompt 6.1
- [ ] Verify all cross-references
- [ ] Final review

---

## Output Directory Structure

```
.planning/docs/
├── GSD_DOCUMENTATION_INDEX.md      # Master navigation
├── FILE_MANIFEST.md                 # Complete file inventory
├── agents/
│   ├── gsd-planner-reference.md     # Deep tier
│   ├── gsd-executor-reference.md    # Deep tier
│   ├── gsd-verifier-reference.md    # Deep tier
│   ├── gsd-plan-checker-reference.md # Deep tier
│   ├── gsd-researcher-reference.md  # Standard tier
│   ├── gsd-phase-researcher-reference.md
│   ├── gsd-debugger-reference.md
│   ├── gsd-codebase-mapper-reference.md
│   └── gsd-roadmapper-reference.md
├── commands/
│   ├── core-commands-reference.md
│   └── secondary-commands-reference.md
└── support-components-reference.md
```

Plus at project root:
```
GSD_ARCHITECTURE_SCAFFOLDING.md     # Already created
```

---

## Quality Verification

After all phases complete, verify:

### Coverage Check
```bash
# Count documented vs total files
wc -l .planning/docs/FILE_MANIFEST.md
find . -name "*.md" | wc -l
```

### Deep Reference Quality Check

For each Deep Reference doc, verify:
- [ ] All MUST/NEVER constraints documented with consequences
- [ ] All numeric limits documented with rationale
- [ ] All operational modes documented with trigger/input/process/output
- [ ] All anti-patterns documented with correct approach
- [ ] Structured returns include all message formats
- [ ] Change impact analysis includes upstream/downstream/breaking changes
- [ ] Section index maps to source file

### Cross-Reference Check
- [ ] Every spawned agent has documentation
- [ ] Every output file has template documentation
- [ ] Every workflow has user documentation

### Token Budget Check
```bash
# Estimate tokens (words × 1.3)
wc -w .planning/docs/**/*.md | tail -1
```

Target: Total documentation < 10,000 tokens for full load.

---

## Notes for Execution

1. **Always `/clear` between phases** — Extraction is context-intensive

2. **Extraction order matters** — Core agents first because other docs reference them

3. **If context runs low mid-phase** — Save progress, `/clear`, resume with partial output

4. **Verify as you go** — Check each doc before moving to next phase

5. **Source of truth** — Always cite line numbers for constraints (enables verification)

6. **Don't over-document** — Standard tier exists for a reason. Not everything needs Deep Reference.

7. **Use the 3 verification questions** — After each Deep Reference, ask:
   - Could someone modify this safely with only this doc?
   - What questions remain unanswered?
   - What almost got missed?

8. **Reference the case study** — When in doubt about extraction depth, consult `extraction-case-study-gsd-planner.md` for methodology

---

## Appendix: Extraction Prompt Template

For files not covered by specific prompts, use this template:

```markdown
# Documentation Task: {filename}

## Pre-Analysis (Phase 1)

1. Count total lines: `wc -l {file}`
2. List all top-level sections: `grep -n "^<[a-z_]*>$\|^##" {file}`
3. Scan for critical markers:
   - `grep -c "MUST\|NEVER\|ALWAYS" {file}`
   - `grep -c "[0-9]*%" {file}`
   - `grep -c "mode\|Mode" {file}`

## Complexity Assessment (Phase 2)

Score 1-3 for each:
| Factor | Score | Justification |
|--------|-------|---------------|
| Centrality | ? | How many other files reference this? |
| Complexity | ? | How many modes, branches, edge cases? |
| Failure Impact | ? | What breaks if this fails? |
| Novelty | ? | Standard pattern or system innovation? |

Total: ___ → Tier: ___

## Extraction Passes (Phase 3)

### Pass 1: Constraints
Search for: MUST, NEVER, ALWAYS, ONLY, "do not", "don't", "avoid"
Record each with location and consequence.

### Pass 2: Numeric Limits
Search for: percentages, counts, "max", "min", thresholds
Record each with value, location, rationale.

### Pass 3: Modes/Variants
Search for: "mode", "if", "when", conditional branches
Document each mode with trigger and key differences.

### Pass 4: Relationships
- What files does it READ? (cat, @references, Read operations)
- What files does it WRITE? (Write, git add, output paths)
- What SPAWNS it? (Task tool calls with this agent)
- What CONSUMES its output? (references in other files)

### Pass 5: Anti-Patterns
Search for: "Don't", "Avoid", "Anti-pattern", "Bad", negative examples
Record each with why it's bad and correct approach.

## Synthesis

Write documentation at appropriate tier depth.
Include section references for critical behaviors.
Flag uncertainties for follow-up.

## Verification (Phase 7)

1. Could someone modify this file safely with only this documentation?
2. What questions does this documentation NOT answer?
3. What almost got missed?
```
