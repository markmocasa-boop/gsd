# Roadmap

## Domain Expertise

None

## Milestones

- ✅ **v1.0 OpenCode Port** — Phases 1-4 (shipped 2026-01-15)

## Completed Milestones

- ✅ [v1.0 OpenCode Port](milestones/v1.0-ROADMAP.md) (Phases 1-4) — SHIPPED 2026-01-15

<details>
<summary>✅ v1.0 OpenCode Port (Phases 1-4) — SHIPPED 2026-01-15</summary>

#### Phase 1: OpenCode Research
**Goal:** Understand OpenCode conventions and map equivalents from Claude Code

**Scope:**
- Research OpenCode directory structure (`.opencode/command/`, `.opencode/agent/`)
- Document YAML frontmatter differences (`allowed-tools` → `tools`)
- Map all 26 commands to OpenCode equivalents
- Design shared source architecture

**Status:** Complete (1/1 plans)
**Completed:** 2026-01-14

---

#### Phase 2: Multi-Agent Installer
**Goal:** Modify install.js to support both Claude Code and OpenCode

**Scope:**
- Add platform selection prompt (Claude Code / OpenCode)
- Implement OpenCode installation paths (`.opencode/command/`, `.opencode/agent/`)
- Handle frontmatter transformation during install
- Maintain backwards compatibility with existing Claude Code installs

**Status:** Complete (1/1 plans)
**Completed:** 2026-01-14

---

#### Phase 3: Command Adaptation
**Goal:** Ensure all commands and workflows work on OpenCode

**Scope:**
- Adapt command frontmatter for OpenCode format
- Create OpenCode agent definitions if required
- Test workflow execution on OpenCode
- Handle any platform-specific differences in execution

**Status:** Complete (1/1 plans)
**Completed:** 2026-01-14

---

#### Phase 4: Validation
**Goal:** Verify feature parity and document usage

**Scope:**
- Test all 26 commands on both platforms
- Verify parallel execution works on OpenCode
- Update README with dual-platform instructions
- Create platform-specific troubleshooting guide

**Status:** Complete (2/2 plans)
**Completed:** 2026-01-14

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. OpenCode Research | v1.0 | 1/1 | Complete | 2026-01-14 |
| 2. Multi-Agent Installer | v1.0 | 1/1 | Complete | 2026-01-14 |
| 3. Command Adaptation | v1.0 | 1/1 | Complete | 2026-01-14 |
| 4. Validation | v1.0 | 2/2 | Complete | 2026-01-14 |

---
*Last updated: 2026-01-15 after v1.0 milestone completion*
