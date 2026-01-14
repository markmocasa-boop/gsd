# Agent Intelligence Framework - Portable Edition

## Design Document

### Vision

Transformera Agent Intelligence Framework från en Claude.ai Project knowledge base till ett **portabelt, IDE-agnostiskt system** som kan dropas in i vilket projekt som helst och ge vilken CLI-agent som helst (Claude Code, Codex, Gemini) strukturerad intelligens.

---

## Kärninsikt

**Problemet med CLI-agenter:**
- De har inget minne mellan sessioner
- De förstår inte projektets kontext automatiskt
- De har ingen struktur för kvalitetssäkring
- De kan inte växla mellan "personas" intelligent

**Lösningen:**
- En mapp (`.agent/`) som agenten MÅSTE läsa vid start
- En "chain of consciousness" som bygger upp agentens förståelse steg för steg
- Projektspecifika filer som genereras vid setup
- Agnostiska workflows som fungerar överallt

---

## Filstruktur

```
your-project/
├── .agent/                           # ← DROP IN DENNA
│   │
│   │ ══════════════════════════════════════════════════════
│   │  BOOTSTRAP CHAIN (Agent MÅSTE läsa i ordning)
│   │ ══════════════════════════════════════════════════════
│   │
│   ├── 00-BOOTSTRAP.md               # FÖRSTA FILEN - instruerar agenten
│   │   └── "Read 01-FRAMEWORK.md next"
│   │
│   ├── 01-FRAMEWORK.md               # Vad är detta framework?
│   │   └── "Read 02-PROJECT.md next"
│   │
│   ├── 02-PROJECT.md                 # [GENERERAS] Projektspecifik kontext
│   │   └── "Read 03-IDENTITY.md next"
│   │
│   ├── 03-IDENTITY.md                # Vilken identitet ska agenten ha?
│   │   └── "Read 04-WORKFLOW.md next"
│   │
│   ├── 04-WORKFLOW.md                # [GENERERAS] Valt arbetsflöde
│   │   └── "Read 05-CONSTRAINTS.md next"
│   │
│   ├── 05-CONSTRAINTS.md             # [GENERERAS] Projektspecifika regler
│   │   └── "You are now ready to work."
│   │
│   │ ══════════════════════════════════════════════════════
│   │  AGNOSTISKA KOMPONENTER (förbyggda, återanvändbara)
│   │ ══════════════════════════════════════════════════════
│   │
│   ├── core/
│   │   ├── identities/               # Agent-personas
│   │   │   ├── _base.md              # Gemensam bas
│   │   │   ├── planner.md
│   │   │   ├── architect.md
│   │   │   ├── builder.md
│   │   │   ├── tester.md
│   │   │   └── reviewer.md
│   │   │
│   │   ├── workflows/                # Arbetsflöden
│   │   │   ├── quick-fix.yaml
│   │   │   ├── feature-build.yaml
│   │   │   ├── full-stack.yaml
│   │   │   ├── explore.yaml          # För kreativa projekt
│   │   │   └── enterprise.yaml
│   │   │
│   │   ├── quality-gates/            # Kvalitetskontroller
│   │   │   ├── minimal.yaml
│   │   │   ├── standard.yaml
│   │   │   ├── thorough.yaml
│   │   │   └── production.yaml
│   │   │
│   │   └── knowledge/                # Domänkunskap
│   │       ├── auth.md
│   │       ├── database.md
│   │       ├── payments.md
│   │       └── ...
│   │
│   │ ══════════════════════════════════════════════════════
│   │  PROJEKTSPECIFIKA KOMPONENTER (genereras vid setup)
│   │ ══════════════════════════════════════════════════════
│   │
│   ├── project/
│   │   ├── context.yaml              # Projektbeskrivning, mål, stack
│   │   ├── constraints.yaml          # Regler, forbidden patterns
│   │   ├── entities.yaml             # Domänentiteter
│   │   └── decisions.md              # Logg av arkitekturbeslut
│   │
│   │ ══════════════════════════════════════════════════════
│   │  RUNTIME STATE (uppdateras under sessionen)
│   │ ══════════════════════════════════════════════════════
│   │
│   ├── state/
│   │   ├── current-identity.txt      # Vilken identitet är aktiv
│   │   ├── current-phase.txt         # Vilken fas i workflow
│   │   ├── session-log.md            # Vad har gjorts denna session
│   │   └── pending-tasks.md          # Uppgifter att återuppta
│   │
│   │ ══════════════════════════════════════════════════════
│   │  SETUP & UTILITIES
│   │ ══════════════════════════════════════════════════════
│   │
│   ├── setup/
│   │   ├── init.md                   # Instruktioner för första körning
│   │   ├── questions.yaml            # Frågor att ställa användaren
│   │   └── templates/                # Mallar för genererade filer
│   │       ├── project-context.template.yaml
│   │       ├── constraints.template.yaml
│   │       └── workflow.template.yaml
│   │
│   └── README.md                     # Human-readable översikt
```

---

## Bootstrap Chain - Detaljerad Design

### Varför en kedja?

LLM:er har begränsad uppmärksamhet. Genom att strukturera informationen som en kedja:
1. Tvingar vi agenten att läsa i rätt ordning
2. Bygger upp förståelsen inkrementellt
3. Gör varje fil fokuserad på EN sak
4. Gör det lätt att se var i "medvetandet" agenten är

### 00-BOOTSTRAP.md

```markdown
# Agent Intelligence Framework

> STOP. Read this file completely before doing anything else.

You are about to work on a project that uses the Agent Intelligence Framework.
This framework will make you more effective by:

1. Giving you structured context about the project
2. Assigning you a specialized identity for the task
3. Providing quality gates to ensure your output is complete
4. Guiding you through a proven workflow

## Your First Action

Read the file `01-FRAMEWORK.md` in this directory.

Do not proceed with any user requests until you have read through
the entire bootstrap chain (files 00 through 05).

---
Next: → 01-FRAMEWORK.md
```

### 01-FRAMEWORK.md

```markdown
# Framework Overview

## What This Is

Agent Intelligence Framework is a system that transforms you from a generic
AI assistant into a specialized, quality-focused development agent.

## Key Concepts

### Identities
You can operate as different specialized personas:
- PLANNER: Strategic planning, task breakdown
- ARCHITECT: System design, API contracts
- BUILDER: Implementation, clean code
- TESTER: Quality assurance, edge cases
- REVIEWER: Code review, security audit

### Workflows
Predefined sequences of phases for different task complexities:
- quick-fix: 1 phase, immediate action
- feature-build: 3 phases (plan → design → build)
- full-stack: 5 phases with parallel frontend/backend
- explore: Flexible, for creative/experimental work
- enterprise: 7 phases with staged apply

### Quality Gates
Automated checks that your output must pass:
- No placeholders (TODO, ..., etc.)
- Complete implementations
- No hardcoded secrets
- All imports resolved

## How It Works

1. You read the bootstrap chain (this is step 2)
2. Project-specific context is loaded (step 3)
3. You assume an identity appropriate for the task (step 4)
4. You follow the workflow for the task type (step 5)
5. Your output passes quality gates before delivery

---
Previous: ← 00-BOOTSTRAP.md
Next: → 02-PROJECT.md
```

### 02-PROJECT.md (TEMPLATE - genereras)

```markdown
# Project Context

> This file was generated during project setup.
> It contains the specific context for THIS project.

## Project Overview

**Name:** [PROJECT_NAME]
**Type:** [web-app | api | library | tool | other]
**Description:** [BRIEF_DESCRIPTION]

## Technology Stack

**Frontend:** [FRONTEND_STACK]
**Backend:** [BACKEND_STACK]
**Database:** [DATABASE]
**Deployment:** [DEPLOYMENT_TARGET]

## Key Entities

[DOMAIN_ENTITIES]

## Architecture Decisions

See `project/decisions.md` for the full ADR log.

Current key decisions:
- [DECISION_1]
- [DECISION_2]

## Boundaries

Things this project does NOT do:
- [BOUNDARY_1]
- [BOUNDARY_2]

---
Previous: ← 01-FRAMEWORK.md
Next: → 03-IDENTITY.md
```

### 03-IDENTITY.md

```markdown
# Identity System

## Available Identities

Read the appropriate identity file based on your current task:

| Task Type | Identity | File |
|-----------|----------|------|
| Planning, scoping | PLANNER | `core/identities/planner.md` |
| System design, APIs | ARCHITECT | `core/identities/architect.md` |
| Writing code | BUILDER | `core/identities/builder.md` |
| Testing, QA | TESTER | `core/identities/tester.md` |
| Code review | REVIEWER | `core/identities/reviewer.md` |

## Identity Selection

If a workflow is active (see 04-WORKFLOW.md), follow its identity sequence.

If no workflow is active, select identity based on the user's request:
- "plan", "design", "architect" → PLANNER or ARCHITECT
- "build", "implement", "create" → BUILDER
- "test", "verify", "check" → TESTER
- "review", "audit" → REVIEWER

## Core Rules (All Identities)

1. You have ONE expertise - stay in your lane
2. Hand off to another identity when the task changes
3. No placeholders - every function must be complete
4. Explain your decisions briefly
5. Flag issues outside your scope

---
Previous: ← 02-PROJECT.md
Next: → 04-WORKFLOW.md
```

### 04-WORKFLOW.md (TEMPLATE - genereras baserat på val)

```markdown
# Active Workflow

> This file defines the workflow for the current project/task.

## Selected Workflow: [WORKFLOW_NAME]

**Complexity:** [simple | moderate | complex | extreme]
**Phases:** [NUMBER]
**Estimated effort:** [ESTIMATE]

## Phase Sequence

[PHASE_TABLE]

## Current Phase

**Phase:** [CURRENT_PHASE]
**Identity:** [ACTIVE_IDENTITY]
**Status:** [not_started | in_progress | completed]

## Quality Gates for This Workflow

[GATES]

---
Previous: ← 03-IDENTITY.md
Next: → 05-CONSTRAINTS.md
```

### 05-CONSTRAINTS.md (TEMPLATE - genereras)

```markdown
# Project Constraints

> This file defines what you MUST and MUST NOT do in this project.

## Mandatory Requirements (MUST)

- [ ] [REQUIREMENT_1]
- [ ] [REQUIREMENT_2]
- [ ] [REQUIREMENT_3]

## Forbidden Patterns (MUST NOT)

- ❌ [FORBIDDEN_1]
- ❌ [FORBIDDEN_2]
- ❌ [FORBIDDEN_3]

## Style Requirements

**Code style:** [STYLE]
**Naming conventions:** [NAMING]
**Comment requirements:** [COMMENTS]

## Domain-Specific Rules

[DOMAIN_RULES]

---
Previous: ← 04-WORKFLOW.md

═══════════════════════════════════════════════════════════════════
YOU ARE NOW READY TO WORK.

Your current identity is: [IDENTITY]
Your current workflow is: [WORKFLOW]
Your current phase is: [PHASE]

Begin by reading the user's request and responding as [IDENTITY].
═══════════════════════════════════════════════════════════════════
```

---

## Setup Flow

### Scenario 1: Seriöst projekt (default)

```
User: claude "Initialize agent framework for my project"

Agent:
1. Detects .agent/ folder exists
2. Reads 00-BOOTSTRAP.md
3. Notices 02-PROJECT.md is missing or empty
4. Enters SETUP MODE

Agent asks:
- "What is this project? (brief description)"
- "What is the tech stack? (frontend/backend/db)"
- "What are the key domain entities?"
- "Are there any specific constraints or forbidden patterns?"
- "What workflow complexity? (quick-fix/feature/full-stack/enterprise)"

Agent generates:
- 02-PROJECT.md (filled in)
- 04-WORKFLOW.md (based on selection)
- 05-CONSTRAINTS.md (based on answers)
- project/context.yaml
- project/constraints.yaml

Agent:
"Project initialized. I am now operating as PLANNER with the feature-build workflow."
```

### Scenario 2: Utforskande projekt (explicit)

```
User: claude "Initialize agent framework in explore mode"

Agent:
1. Detects "explore mode" keyword
2. Loads explore.yaml workflow (minimal structure)
3. Generates lightweight project files
4. Does NOT ask extensive questions

Agent:
"Explore mode active. I'll adapt as we go. What would you like to build?"
```

### Scenario 3: Återuppta session

```
User: claude "Continue where we left off"

Agent:
1. Reads bootstrap chain
2. Finds state/current-phase.txt, state/session-log.md
3. Resumes from last known state

Agent:
"Resuming. Last session you were in BUILDER phase implementing the auth system.
Should I continue from there?"
```

---

## Model-Specific Optimizations

### Claude (Primary Target)

Claude är bäst på:
- Längre, strukturerad input
- Markdown-format
- Explicit instruktioner

Optimeringar:
- Bootstrap chain i ren Markdown
- Tydliga "---" separatorer
- Explicit "Next: →" direktiv

### Codex/GPT

GPT är bäst på:
- Kortare, mer fokuserad kontext
- JSON/YAML för strukturerad data
- System prompts

Optimeringar:
- Kompakt variant av bootstrap chain
- Mer YAML, mindre prosa
- Kan använda `.agent/compact/` med kondenserade versioner

### Gemini

Gemini är bäst på:
- Multimodal (kan läsa diagram)
- Strukturerad output
- Longer context windows

Optimeringar:
- Kan inkludera arkitekturdiagram
- Mer visuella representationer av workflow
- Kan ha längre knowledge files

---

## Implementation Plan

### Phase 1: Core Structure
1. Skapa .agent/ mappstruktur
2. Skriva bootstrap chain (00-05)
3. Migrera identities från befintligt framework
4. Migrera workflows/presets

### Phase 2: Setup System
1. Skapa setup/questions.yaml
2. Skapa templates för genererade filer
3. Implementera setup/init.md instruktioner

### Phase 3: State Management
1. Designa state/-filerna
2. Skriva instruktioner för hur agenten uppdaterar state
3. Skapa resume-logik

### Phase 4: Testing
1. Testa med Claude Code
2. Testa med Codex
3. Testa med Gemini
4. Iterera baserat på resultat

### Phase 5: Documentation
1. README för humans
2. Troubleshooting guide
3. Examples gallery

---

## Success Criteria

1. **Drop-in fungerar:** Kopiera .agent/ till projekt → agent förstår det
2. **Bootstrap chain fungerar:** Agent läser alla filer i ordning
3. **Projektspecifik generering fungerar:** Setup skapar korrekta filer
4. **Workflow fungerar:** Agent följer valt arbetsflöde
5. **Quality gates fungerar:** Output uppfyller gates
6. **Cross-model fungerar:** Fungerar med Claude, Codex, Gemini
