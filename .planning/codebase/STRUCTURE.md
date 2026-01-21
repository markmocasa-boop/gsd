# Codebase Structure

**Analysis Date:** 2025-01-21

## Directory Layout

```
get-shit-done/
├── agents/                    # Subagent definitions (spawned via Task tool)
├── bin/                       # Installation entry point
├── commands/                  # User-facing slash commands
│   └── gsd/                   # All /gsd:* commands
├── get-shit-done/             # Main skill directory (installed to ~/.claude/)
│   ├── references/            # Reusable patterns and conventions
│   ├── templates/             # Document structure templates
│   ├── workflows/             # Detailed execution patterns
│   ├── templates/
│   │   ├── codebase/         # Codebase mapping templates
│   │   └── research-project/ # Research output templates
│   └── config.json           # Default workflow configuration
├── hooks/                     # Claude Code hooks (built to dist/)
├── scripts/                   # Build and utility scripts
├── assets/                    # Static assets
├── package.json               # NPM manifest
└── [other root files]
```

## Directory Purposes

**`agents/` - Subagent Definitions**
- Purpose: Agent definitions spawned by orchestrator commands
- Contains: Markdown files with agent role, tools, philosophy, execution flow
- Key files:
  - `gsd-planner.md` - Phase planning agent
  - `gsd-executor.md` - Plan execution agent
  - `gsd-verifier.md` - Phase verification agent
  - `gsd-roadmapper.md` - Roadmap creation agent
  - `gsd-codebase-mapper.md` - Codebase analysis agent
  - `gsd-project-researcher.md` - Domain research agent
  - `gsd-research-synthesizer.md` - Research combination agent
  - `gsd-phase-researcher.md` - Phase-specific research agent
  - `gsd-plan-checker.md` - Plan validation agent
  - `gsd-debugger.md` - Issue diagnosis agent
  - `gsd-integration-checker.md` - Integration verification agent

**`bin/` - Installation**
- Purpose: Entry point for `npx get-shit-done-cc`
- Contains: `install.js`
- Key files:
  - `install.js` - Main installer with CLI parsing, path replacement, hook configuration

**`commands/gsd/` - User Commands**
- Purpose: All slash commands users can invoke
- Contains: Markdown command definitions
- Key files:
  - `new-project.md` - Project initialization command
  - `plan-phase.md` - Phase planning command
  - `execute-phase.md` - Phase execution command
  - `discuss-phase.md` - Phase context gathering command
  - `research-phase.md` - Phase research command
  - `map-codebase.md` - Codebase mapping command
  - `verify-work.md` - Manual verification command
  - `debug.md` - Issue debugging command
  - `progress.md` - Project status display
  - `quick.md` - Quick task execution
  - `add-phase.md`, `insert-phase.md`, `remove-phase.md` - Phase management
  - `new-milestone.md`, `complete-milestone.md`, `audit-milestone.md` - Milestone management
  - `add-todo.md`, `check-todos.md` - Todo management
  - `settings.md`, `set-profile.md`, `update.md` - Configuration

**`get-shit-done/references/` - Reusable Patterns**
- Purpose: Best practices, conventions, guidelines referenced across agents
- Contains: Markdown pattern documents
- Key files:
  - `checkpoints.md` - Checkpoint protocols and human-verification patterns
  - `questioning.md` - Deep questioning techniques for requirements gathering
  - `ui-brand.md` - UI branding and formatting conventions
  - `tdd.md` - Test-driven development patterns
  - `verification-patterns.md` - Verification methodology
  - `git-integration.md` - Git workflow patterns
  - `model-profiles.md` - Model selection guidelines

**`get-shit-done/templates/` - Document Templates**
- Purpose: Structure templates for planning artifacts
- Contains: Template markdown files
- Key files:
  - `project.md` - PROJECT.md template
  - `requirements.md` - REQUIREMENTS.md template
  - `roadmap.md` - ROADMAP.md template
  - `state.md` - STATE.md template
  - `summary.md` - Plan SUMMARY.md template
  - `verification-report.md` - VERIFICATION.md template
  - `UAT.md` - User acceptance testing template
  - `context.md` - Phase CONTEXT.md template
  - `discovery.md` - DISCOVERY.md research template
  - `user-setup.md` - User setup documentation template

**`get-shit-done/workflows/` - Execution Patterns**
- Purpose: Detailed workflow documentation referenced by commands
- Contains: Process documentation
- Key files:
  - `execute-plan.md` - Plan execution workflow
  - `execute-phase.md` - Phase execution workflow
  - `discuss-phase.md` - Phase discussion workflow
  - `verify-phase.md` - Phase verification workflow
  - `map-codebase.md` - Codebase mapping workflow
  - `discovery-phase.md` - Discovery research workflow

**`hooks/` - Claude Code Hooks**
- Purpose: Hooks triggered by Claude Code lifecycle events
- Contains: JavaScript files built to `dist/`
- Key files:
  - `gsd-statusline.js` - Statusline display (model, task, context)
  - `gsd-check-update.js` - Update checker on session start

**`scripts/` - Build Tools**
- Purpose: Build and utility scripts
- Contains: Node.js scripts
- Key files:
  - `build-hooks.js` - Bundles hooks with dependencies

## Key File Locations

**Entry Points:**
- `bin/install.js`: Installation entry point for npm package
- `package.json`: NPM manifest with version, bin, files, scripts
- `commands/gsd/new-project.md`: Project initialization command
- `commands/gsd/execute-phase.md`: Phase execution command

**Configuration:**
- `get-shit-done/templates/config.json`: Default workflow configuration
- User's `.planning/config.json`: Project-specific workflow settings

**Core Agent Logic:**
- `agents/gsd-planner.md`: Phase planning agent (1387 lines)
- `agents/gsd-executor.md`: Plan execution agent (785 lines)
- `agents/gsd-verifier.md`: Phase verification agent (779 lines)
- `agents/gsd-roadmapper.md`: Roadmap creation agent (606 lines)

**Template System:**
- `get-shit-done/templates/`: All planning document templates
- `get-shit-done/templates/codebase/`: Codebase mapping templates
- `get-shit-done/templates/research-project/`: Research output templates

**Testing:**
- No test files detected (project uses manual verification via commands)

## Naming Conventions

**Files:**
- Commands: `lowercase-with-dashes.md` (e.g., `new-project.md`, `execute-phase.md`)
- Agents: `gsd-{role}.md` (e.g., `gsd-planner.md`, `gsd-executor.md`)
- Templates: `lowercase.md` (e.g., `project.md`, `summary.md`)
- Hooks: `gsd-{purpose}.js` (e.g., `gsd-statusline.js`)

**Directories:**
- All lowercase: `agents/`, `commands/`, `workflows/`, `references/`, `templates/`
- Hyphenated for multi-word: `get-shit-done/`, `codebase/`, `research-project/`

**Planning Artifacts (Generated):**
- Phase directories: `{number}-{name}/` (e.g., `01-foundation/`, `02-authentication/`)
- Plan files: `{phase}-{plan:02d}-PLAN.md` (e.g., `01-01-PLAN.md`, `01-02-PLAN.md`)
- Summary files: `{phase}-{plan:02d}-SUMMARY.md`
- Verification files: `{phase}-VERIFICATION.md`

## Where to Add New Code

**New Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Reference workflow (if complex): `get-shit-done/workflows/{command-name}.md`
- Follow template: frontmatter (name, description, argument-hint, allowed-tools), objective, process, success_criteria

**New Agent:**
- Implementation: `agents/gsd-{agent-name}.md`
- Follow template: frontmatter (name, description, tools, color), role, philosophy, execution_flow, success_criteria

**New Template:**
- Implementation: `get-shit-done/templates/{template-name}.md`
- Reference from agents using `@~/.claude/get-shit-done/templates/{template-name}.md`

**New Reference Document:**
- Implementation: `get-shit-done/references/{reference-name}.md`
- Reference from agents/commands using `@~/.claude/get-shit-done/references/{reference-name}.md`

**New Workflow:**
- Implementation: `get-shit-done/workflows/{workflow-name}.md`
- Reference from commands using `@~/.claude/get-shit-done/workflows/{workflow-name}.md`

**Utilities:**
- Shared helpers: Not applicable (this is a prompt/agent system, not code)
- Build utilities: `scripts/{script-name}.js`

## Special Directories

**`hooks/` - Generated Code**
- Purpose: Claude Code lifecycle hooks
- Generated: Yes (built from `hooks/*.js` sources via `scripts/build-hooks.js`)
- Committed: Yes (`dist/` contents are committed)

**`get-shit-done/` - Installed Skill**
- Purpose: Main skill directory installed to `~/.claude/get-shit-done/`
- Generated: No (static content with path replacement during install)
- Committed: Yes

**`.planning/` - User Artifacts (Generated During Use)**
- Purpose: Project planning artifacts created by GSD commands
- Generated: Yes (by commands during project workflow)
- Committed: Configurable (via `commit_docs` in config.json)
- Contains:
  - `PROJECT.md` - Project context
  - `REQUIREMENTS.md` - Requirements with traceability
  - `ROADMAP.md` - Phase breakdown
  - `STATE.md` - Project memory
  - `config.json` - Workflow configuration
  - `phases/` - Phase directories with PLAN.md, SUMMARY.md, VERIFICATION.md files
  - `research/` - Domain research outputs
  - `codebase/` - Codebase mapping documents

---

*Structure analysis: 2025-01-21*
