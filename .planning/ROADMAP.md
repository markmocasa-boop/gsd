# Roadmap: GSD Constitutional Enforcement

## Overview

Transform GSD from convention-documented to convention-enforced through constitutional system. Five phases build from foundation files through TDD validation to checkpoint enforcement and retroactive application, delivering automated TDD-first validation that prevents executors from writing features before tests exist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Constitution Foundation** - Files, loading, versioning, severity system
- [ ] **Phase 2: TDD Commit Validation** - Evidence-based TDD enforcement
- [ ] **Phase 3: Enforcement Infrastructure** - Override mechanism, audit trail
- [ ] **Phase 4: Verifier Integration** - Checkpoint validation in phase workflow
- [ ] **Phase 5: Retroactive Application** - Migration tooling, progressive rollout

## Phase Details

### Phase 1: Constitution Foundation
**Goal**: Constitutional files exist with loading system that merges global + project rules
**Depends on**: Nothing (first phase)
**Requirements**: CONST-01, CONST-02, CONST-03, CONST-04, CONST-05, DOC-01, DOC-02, DOC-03, DOC-04
**Success Criteria** (what must be TRUE):
  1. Global CONSTITUTION.md exists at `~/.claude/get-shit-done/CONSTITUTION.md` with NON-NEGOTIABLE/ERROR/WARNING sections
  2. Per-project CONSTITUTION.md template exists at `.planning/CONSTITUTION.md`
  3. Constitution loader merges global + project rules with project override precedence
  4. Constitution versioning prevents retroactive breaks through version field
  5. Anti-patterns documented with rationale explaining why each rule exists
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Constitution file templates (global + project)
- [ ] 01-02-PLAN.md — Constitution loader with TDD (parse, merge, validate)
- [ ] 01-03-PLAN.md — System integration (install + new-project workflows)

### Phase 2: TDD Commit Validation
**Goal**: TDD validator analyzes git history to detect test-before-implementation violations
**Depends on**: Phase 1
**Requirements**: TDD-01, TDD-02, TDD-03, TDD-04
**Success Criteria** (what must be TRUE):
  1. Validator parses git history for commit range within phase
  2. Validator detects test files using naming conventions (*.test.js, *.spec.js, __tests__/)
  3. Validator identifies test committed before corresponding implementation through timestamp comparison
  4. Violations reported with specific file, commit hash, and timestamp evidence
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Enforcement Infrastructure
**Goal**: Override mechanism with required justification prevents bypass abuse
**Depends on**: Phase 2
**Requirements**: ENFORCE-01, ENFORCE-02, ENFORCE-03, ENFORCE-04
**Success Criteria** (what must be TRUE):
  1. Error-level violations block verification with clear prompt for override
  2. Override requires user-provided justification (free-form text)
  3. All overrides logged to STATE.md with timestamp, rule ID, and reason
  4. Override metrics tracked per-rule for effectiveness monitoring
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Verifier Integration
**Goal**: Constitutional validation integrated as Step 10 in gsd-verifier workflow
**Depends on**: Phase 3
**Requirements**: VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04
**Success Criteria** (what must be TRUE):
  1. gsd-verifier extended with constitutional validation step after goal verification
  2. Validator runs at phase completion checkpoint (not pre-commit)
  3. Violations surfaced in VERIFICATION.md with severity, details, and fix guidance
  4. Verifier returns gaps_found status when constitutional violations block completion
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Retroactive Application
**Goal**: Existing GSD projects can adopt constitutional enforcement through migration path
**Depends on**: Phase 4
**Requirements**: RETRO-01, RETRO-02, RETRO-03, RETRO-04
**Success Criteria** (what must be TRUE):
  1. Migration tooling upgrades existing projects to constitution version 1
  2. Projects opt-out through constitution_version field in config.json
  3. Grandfather clause allows existing projects to pin to version 0 (no enforcement)
  4. New projects default to latest constitution version automatically
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Constitution Foundation | 0/3 | Ready to execute | - |
| 2. TDD Commit Validation | 0/TBD | Not started | - |
| 3. Enforcement Infrastructure | 0/TBD | Not started | - |
| 4. Verifier Integration | 0/TBD | Not started | - |
| 5. Retroactive Application | 0/TBD | Not started | - |
