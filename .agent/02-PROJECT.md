# Project Context

## Project Overview

**Name:** BACOWR v2.0

**Type:** [x] web-app  [ ] api  [ ] library  [ ] cli-tool  [ ] other

**Description:**
SEO operations platform for AI-powered article generation with intelligent link planning. Built for managing ~5000 links/month across multiple clients with full historical tracking.

**Status:** [ ] new  [x] in-progress  [ ] maintenance

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes (Node.js) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS (dark theme, gray-950 background) |
| Deployment | Not specified |
| Other | Pluggable LLM adapter (Anthropic Claude, OpenAI, Ollama, custom) |

---

## Domain Model

Key entities in this project:

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **clients** | Customer accounts with SEO/anchor configurations | id, domain, brand_terms, focus_keywords |
| **jobs** | Article generation state machine with audit logs | id, state, publisher_domain, target_url, anchor_text |
| **historical_links** | Imported CSV link history (5000+ links) | id, client_id, publisher_root, target_url, anchor_text, anchor_type |
| **target_pages** | Focus pages for link building per client | id, client_id, url |
| **bulk_orders** | Batch job containers | id, status |
| **link_plans** | Monthly strategic plans with publisher assignments | id, client_id, period |
| **monthly_assignments** | Monthly planning assignments with status tracking | id, status, client_name |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (jobs, clients, links, planning, monthly)
│   ├── clients/           # Client management pages
│   ├── links/             # Link explorer
│   ├── import/            # CSV import
│   ├── monthly/           # Monthly assignments
│   ├── planning/          # Link planning
│   ├── bulk/              # Bulk job generation
│   └── generate/          # Single article generation
├── lib/                   # Core modules
│   ├── llm-adapter.ts     # Multi-provider LLM abstraction
│   ├── preflight.ts       # Research phase: publisher profile, semantic bridge
│   ├── writer.ts          # Facit builder & article generation
│   ├── validator.ts       # Deterministic QA (8 checks, 80/100 threshold)
│   ├── job-service.ts     # State machine orchestrator
│   ├── database.ts        # Supabase CRUD + views/functions
│   ├── link-planner.ts    # Topical authority analysis
│   ├── csv-import.ts      # Historical link import with encoding fix
│   └── client-rules.ts    # Client-specific anchor validation
├── types/
│   └── core.ts            # Centralized TypeScript types
└── db/
    └── schema-complete.sql # Database schema
```

---

## Current State

**What exists:**
- Dashboard with stats, quick actions, recent jobs
- Client management with auto-generate profiles, compare mode
- Link explorer with full filtering (search, client, anchor type, dates)
- CSV import with Windows-1252 encoding fix and auto-derivation
- Monthly assignment spreadsheet editor
- Anchor type classification system (exact_match, partial_match, brand, generic, url, other)
- Client rules validation (forbidden anchors, required patterns, domain mismatch)

**Current Data:**
- 5000+ historical links imported
- 70+ unique clients
- 500+ unique publishers
- Support for multiple markets (SE, NO, DK, etc.)

**Pipeline Flow:**
```
INTAKE → PREFLIGHT → READY_TO_WRITE → WRITING → DRAFT_COMPLETE → VALIDATING → VALIDATED/EXPORTED
```

---

## Key Decisions Made

| Decision | Rationale | Date |
|----------|-----------|------|
| "Determinism without determinism" | LLM perceives creative freedom but constraints ensure valid output | Core design |
| Three Holy Inputs | publisher_domain + target_url + anchor_text are required for job creation | Core design |
| 100% deterministic validation | 8 checks, no LLM involved, reproducible results | Core design |
| Swedish UI labels | Primary market is Sweden | Initial |

---

## External Dependencies

| Service | Purpose | Docs |
|---------|---------|------|
| Supabase | PostgreSQL database with views and functions | supabase.com |
| Anthropic Claude | Primary LLM provider (claude-sonnet-4-20250514) | anthropic.com |
| OpenAI (optional) | Alternative LLM provider | openai.com |
| Ollama (optional) | Local LLM option | ollama.ai |

---

## Key Architectural Concepts

### "Determinism Without Determinism" (writer.ts)
The LLM agent perceives creative freedom but constraints from preflight ensure only valid choices are possible.

### Validator Checks (100% reproducible, no LLM):
1. Word count (900-1500)
2. LIX readability score
3. AI markers detection
4. Link placement accuracy
5. Anchor text compliance
6. Entity coverage
7. Marriage establishment (semantic connection)
8. Forbidden content check

### Anchor Type Classification:
- `exact_match` - Exact keyword match
- `partial_match` - Contains keywords
- `brand` - Brand name
- `generic` - Generic phrases (klicka här, läs mer)
- `url` - URL as anchor
- `other` - Unclassified

---

## Things This Project Does NOT Do

Explicit boundaries:
- Does not handle user authentication/authorization (single-user system)
- Does not publish articles directly (exports for manual publishing)
- Does not manage billing/payments

---

```
Previous: ← 01-FRAMEWORK.md
Next:     → 03-IDENTITY.md
```
