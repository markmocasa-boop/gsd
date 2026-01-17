# gsd-integration-checker.md — Standard Reference

## Metadata
| Attribute | Value |
|-----------|-------|
| **Type** | Agent |
| **Location** | `agents/gsd-integration-checker.md` |
| **Size** | 423 lines |
| **Documentation Tier** | Standard |
| **Complexity Score** | 2+2+2+1 = **7/12** |

### Complexity Breakdown
- **Centrality: 2** — Spawned by audit-milestone, outputs consumed by milestone auditor
- **Complexity: 2** — Multiple verification steps, bash patterns, flow tracing, report generation
- **Failure Impact: 2** — Missed integration issues = broken system shipped despite passing phase verification
- **Novelty: 1** — Integration testing patterns are industry standard

---

## Purpose

Verifies cross-phase integration and E2E flows work together as a system. Individual phases can pass verification while the overall system fails due to broken wiring—this agent catches those gaps. The key insight: **Existence ≠ Integration**. A component can exist without being imported, an API can exist without being called.

---

## Critical Behaviors

- **Check connections, not existence** — Files existing is phase-level; files connecting is integration-level
- **Trace full paths** — Component → API → DB → Response → Display; break at any point = broken flow
- **Check both directions** — Export exists AND import exists AND import is used AND used correctly
- **Be specific about breaks** — "Dashboard doesn't work" is useless; "Dashboard.tsx line 45 fetches /api/users but doesn't await response" is actionable
- **Return structured data** — Milestone auditor aggregates findings; use consistent format

---

## Core Principle

**Existence ≠ Integration**

Integration verification checks four connection types:

| Connection Type | What It Checks |
|-----------------|----------------|
| Exports → Imports | Phase 1 exports `getCurrentUser`, Phase 3 imports and calls it? |
| APIs → Consumers | `/api/users` route exists, something fetches from it? |
| Forms → Handlers | Form submits to API, API processes, result displays? |
| Data → Display | Database has data, UI renders it? |

---

## Verification Process
Extract from phase SUMMARY.md files what each phase provides vs consumes.
### Step 1: Build Export/Import Map
Extract from phase SUMMARYs what each phase provides vs consumes.

### Step 2: Verify Export Usage
For each phase's exports, verify they're imported AND used (not just imported).

| Status | Meaning |
|--------|---------|
| CONNECTED | Imported and used |
| IMPORTED_NOT_USED | Imported but never called |
| ORPHANED | Never imported |

### Step 3: Verify API Coverage
Find all API routes, check each has consumers (fetch/axios calls).

### Step 4: Verify Auth Protection
Check sensitive routes (dashboard, settings, profile) actually check auth.

### Step 5: Verify E2E Flows
Trace common flows: Auth flow, Data display flow, Form submission flow.

### Step 6: Compile Integration Report
Structure findings for milestone auditor.

---

## Interactions

| Reads | Writes | Spawned By | Consumed By |
|-------|--------|------------|-------------|
| Phase SUMMARYs | Integration report | `/gsd:audit-milestone` | Milestone auditor |
| Codebase (`src/`) | | | |
| API routes | | | |

---

## Output Format

Structured report with sections:

| Section | Contents |
|---------|----------|
| **Wiring Summary** | Connected/Orphaned/Missing counts |
| **API Coverage** | Consumed/Orphaned route counts |
| **Auth Protection** | Protected/Unprotected counts |
| **E2E Flows** | Complete/Broken flow counts |
| **Detailed Findings** | Orphaned exports, missing connections, broken flows, unprotected routes |

### Wiring Status Schema
```yaml
wiring:
  connected:
    - export: "getCurrentUser"
      from: "Phase 1 (Auth)"
      used_by: ["Phase 3", "Phase 4"]
  orphaned:
    - export: "formatUserData"
      from: "Phase 2"
      reason: "Exported but never imported"
  missing:
    - expected: "Auth check in Dashboard"
      from: "Phase 1"
      to: "Phase 3"
      reason: "Dashboard doesn't call useAuth"
```

### Flow Status Schema
```yaml
flows:
  complete:
    - name: "User signup"
      steps: ["Form", "API", "DB", "Redirect"]
  broken:
    - name: "View dashboard"
      broken_at: "Data fetch"
      reason: "Dashboard component doesn't fetch user data"
      steps_complete: ["Route", "Component render"]
      steps_missing: ["Fetch", "State", "Display"]
```

---

## Success Criteria

- [ ] Export/import map built from SUMMARYs
- [ ] All key exports checked for usage
- [ ] All API routes checked for consumers
- [ ] Auth protection verified on sensitive routes
- [ ] E2E flows traced and status determined
- [ ] Orphaned code identified
- [ ] Missing connections identified
- [ ] Broken flows identified with specific break points
- [ ] Structured report returned to auditor

---

## Quick Reference

```
WHAT:     Cross-phase integration and E2E flow verification
MODES:    Single mode (integration check)
OUTPUT:   Structured integration report to milestone auditor

CORE RULES:
• Check CONNECTIONS not existence (existence is phase-level)
• Trace full paths: Component → API → DB → Response → Display
• Be specific about breaks with file/line references
• Return structured YAML format for aggregation

SPAWNED BY: /gsd:audit-milestone
CONSUMED BY: Milestone auditor (aggregates with phase verification)
```
