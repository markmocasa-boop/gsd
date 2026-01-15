# GSD Multi-Agent

## What This Is

A multi-agent port of the Get Shit Done (GSD) framework that supports both Claude Code and OpenCode. The installer asks which agent platform to target, then installs the appropriate directory structure and commands. Full feature parity across both platforms achieved in v1.0.

## Core Value

Full feature parity on OpenCode — every GSD command works identically on both agent platforms.

## Requirements

### Validated

- ✓ 26 slash commands for project workflow — existing (v1.0)
- ✓ 16 workflows for execution logic — existing (v1.0)
- ✓ 21 templates for document generation — existing (v1.0)
- ✓ 14 references for conceptual guidance — existing (v1.0)
- ✓ Wave-based parallel execution — existing (v1.0)
- ✓ Context engineering (2-3 tasks/plan, fresh subagent contexts) — existing (v1.0)
- ✓ Atomic git commits per task — existing (v1.0)
- ✓ npm package distribution (`get-shit-done-cc`) — existing (v1.0)
- ✓ OpenCode port with full feature parity — v1.0
- ✓ Multi-agent installer (asks: Claude Code or OpenCode?) — v1.0
- ✓ OpenCode directory structure (`.opencode/command/`, `.opencode/agent/`) — v1.0
- ✓ OpenCode YAML frontmatter format adaptation — v1.0
- ✓ Shared source files where possible (commands, workflows, templates, references) — v1.0
- ✓ Agent-specific adapters only where platform differences require — v1.0

### Active

(No active requirements - v1.0 complete, planning next milestone)

### Out of Scope

- Other agent platforms (Cursor, Windsurf, Aider, etc.) — v1 is Claude Code + OpenCode only
- New features beyond current GSD — pure port, no additions
- Breaking changes to Claude Code version — must maintain backwards compatibility

## Current State

**Shipped:** v1.0 (2026-01-15)

**Codebase:**
- 8,151 lines of documentation and installer code
- 43 files modified during v1.0
- Node.js 16.7+ installer with zero dependencies
- Full dual-platform support (Claude Code + OpenCode)

**Platform implementation:**
- Claude Code: `.claude/commands/`, `allowed-tools` in frontmatter
- OpenCode: `.opencode/command/`, `tools` in frontmatter, explicit `agent` definitions
- Install-time transformation handles all platform differences
- Shared source files for workflows, templates, references

**User feedback themes:**
- None yet (v1.0 just shipped)

**Known issues:**
- Phase 1 missing SUMMARY.md file (minor documentation gap)
- OpenCode agent visibility bug (platform issue, not GSD)
- Manual command testing deferred to users (test matrix provided)

## Constraints

- **Maintain Claude Code**: Existing Claude Code version must keep working with no regressions
- **OpenCode conventions**: Must follow `.opencode/` directory structure and YAML frontmatter schema exactly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Support only Claude Code + OpenCode | Focus on two platforms for v1, avoid scope creep | ✓ Good (v1.0) |
| Pure port, no new features | Reduce complexity, validate approach before extending | ✓ Good (v1.0) |
| Shared source where possible | Minimize duplication, single source of truth | ✓ Good (v1.0) |
| Claude Code as source of truth, transform at install time | Avoid maintaining duplicate files | ✓ Good (v1.0) |
| No separate directories per platform | All source files shared, transformation during install | ✓ Good (v1.0) |

---
*Last updated: 2026-01-15 after v1.0 milestone*
