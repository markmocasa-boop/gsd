# External Integrations

**Analysis Date:** 2026-01-21

## APIs & External Services

**npm Registry:**
- `npm view get-shit-done-cc version` - Version check for update notifications
  - Called by: `hooks/gsd-check-update.js`
  - Method: `execSync('npm view get-shit-done-cc version', { encoding: 'utf8', timeout: 10000, windowsHide: true })`
  - Purpose: Compare installed version vs latest for update indicator in statusline
  - Location: `hooks/gsd-check-update.js` line 45

**GitHub (raw content):**
- `https://raw.githubusercontent.com/glittercowboy/get-shit-done/main/CHANGELOG.md`
  - Called by: `/gsd:whats-new` command
  - Purpose: Fetch latest changelog for version comparison
  - Fallback: Shows local CHANGELOG.md if offline/unavailable
  - Reference: `commands/gsd/whats-new.md` lines 38-50

## Data Storage

**Databases:**
- None (local filesystem only)

**File Storage:**
- Local filesystem only
- Key locations:
  - `~/.claude/` - Claude Code configuration directory
  - `~/.claude/commands/gsd/` - Installed GSD slash commands
  - `~/.claude/agents/` - Installed GSD subagents
  - `~/.claude/hooks/` - Installed hooks (statusline, update check)
  - `~/.claude/get-shit-done/` - GSD skill files (workflows, templates, references)
  - `~/.claude/todos/` - Todo list state (read by statusline)
  - `~/.claude/cache/` - Cached data (gsd-update-check.json)
  - `.claude/` - Project-local Claude config (for --local installs)
  - `.planning/` - Project planning documents (PROJECT.md, ROADMAP.md, STATE.md, etc.)

**Caching:**
- `~/.claude/cache/gsd-update-check.json` - Update check result cache
  - Structure: `{ update_available, installed, latest, checked }`
  - Written by: `hooks/gsd-check-update.js`
  - Read by: `hooks/gsd-statusline.js`

## Authentication & Identity

**Auth Provider:**
- None (no authentication required)
- This is a development tool, not a service

## Monitoring & Observability

**Error Tracking:**
- None (manual debugging via `/gsd:debug` command)

**Logs:**
- Console stdout/stderr for installer output
- Hook processes communicate via stdin/stdout (JSON)
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- GitHub repository: `https://github.com/glittercowboy/get-shit-done`
- npm package: `get-shit-done-cc` on npm registry

**CI Pipeline:**
- None detected (no GitHub Actions workflows, no `.github/workflows/` directory)
- Manual release process via `npm publish`

## Environment Configuration

**Required env vars:**
- `CLAUDE_CONFIG_DIR` - Optional override for Claude config directory location
  - Used by: `bin/install.js`
  - Priority: explicit --config-dir arg > CLAUDE_CONFIG_DIR env var > default ~/.claude

**Secrets location:**
- No secrets required (no API keys, tokens, or credentials)

## Webhooks & Callbacks

**Incoming:**
- None (this is not a web service)

**Outgoing:**
- None (no external API calls except npm registry and GitHub raw content)

## Claude Code Integration Points

**Slash Commands:**
- Installed to `~/.claude/commands/gsd/` or `.claude/commands/gsd/`
- Entry points: 27 commands (help, new-project, plan-phase, execute-phase, etc.)
- File format: Markdown with YAML frontmatter

**Agents (Subagents):**
- Installed to `~/.claude/agents/`
- 12 specialized agents:
  - `gsd-codebase-mapper.md` - Codebase analysis
  - `gsd-debugger.md` - Systematic debugging
  - `gsd-executor.md` - Task execution
  - `gsd-integration-checker.md` - Integration verification
  - `gsd-phase-researcher.md` - Domain research
  - `gsd-plan-checker.md` - Plan verification
  - `gsd-planner.md` - Plan creation
  - `gsd-project-researcher.md` - Ecosystem research
  - `gsd-research-synthesizer.md` - Research compilation
  - `gsd-roadmapper.md` - Roadmap generation
  - `gsd-verifier.md` - Phase verification

**Hooks:**
- SessionStart hook: `hooks/dist/gsd-check-update.js` - Background version check
- Statusline hook: `hooks/dist/gsd-statusline.js` - Custom status display
  - Shows: model name, current task, directory, context usage, update indicator

**Skill Files:**
- `get-shit-done/workflows/` - Reusable workflow patterns
- `get-shit-done/templates/` - Document templates (PROJECT.md, PLAN.md, etc.)
- `get-shit-done/references/` - Pattern reference documents
- `get-shit-done/templates/codebase/` - Codebase analysis templates

**State Management:**
- `STATE.md` - Session state, blockers, decisions
- `ROADMAP.md` - Phase tracking
- `.planning/todos/` - Todo lists (JSON format)
- `.planning/agent-history.json` - Subagent orchestration state

## Native/System Dependencies

**Node.js Built-in Modules Used:**
- `fs` - File system operations (read, write, copy, mkdir)
- `path` - Path manipulation (join, basename, resolve)
- `os` - Operating system utilities (homedir, tmpdir)
- `readline` - Interactive CLI prompts
- `child_process` - Spawn background processes (update check, execSync for npm)

**Git Integration:**
- Git commands executed via Bash tool in Claude Code
- Common operations: status, add, commit, log, diff, tag, check-ignore
- Commit format: `{type}({phase}-{plan}): {description}`

**No native extensions:**
- Pure JavaScript, no C/C++ addons
- No platform-specific binaries

---

*Integration audit: 2026-01-21*
