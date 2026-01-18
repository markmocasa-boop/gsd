# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
get-shit-done/
├── bin/                    # CLI entry point
│   └── install.js         # Node.js installer (232 lines)
├── commands/gsd/          # User-facing slash commands (28+ files)
├── agents/                # Subagent specifications (7 files)
├── get-shit-done/         # Core system resources
│   ├── references/        # Implementation guides
│   ├── templates/         # File templates
│   │   └── codebase/      # Codebase analysis templates
│   └── workflows/         # Multi-step procedures
├── package.json           # NPM package metadata
├── README.md              # User documentation
├── GSD-STYLE.md           # Style guide for contributors
├── CHANGELOG.md           # Version history
└── .gitignore             # Excluded files
```

## Directory Purposes

**bin/**
- Purpose: CLI entry point for installation
- Contains: `install.js` - Node.js script that copies system to Claude config
- Key files: `install.js` (232 lines, handles npx installation)
- Subdirectories: None

**commands/gsd/**
- Purpose: User-facing slash command definitions
- Contains: 28+ markdown files (one per command)
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `progress.md`, `help.md`
- Subdirectories: None (flat structure)

**agents/**
- Purpose: Subagent specifications for specialized tasks
- Contains: 7 agent definitions
- Key files: `gsd-executor.md`, `gsd-verifier.md`, `gsd-researcher.md`, `gsd-debugger.md`, `gsd-codebase-mapper.md`
- Subdirectories: None

**get-shit-done/references/**
- Purpose: Core philosophy and guidance documents
- Contains: Implementation guides and principles
- Key files: `principles.md`, `questioning.md`, `plan-format.md`, `checkpoints.md`, `goal-backward.md`
- Subdirectories: `debugging/` (debugging methodology)

**get-shit-done/templates/**
- Purpose: Document templates for .planning/ files
- Contains: Template definitions with examples and guidelines
- Key files: `project.md`, `roadmap.md`, `phase-prompt.md`, `summary.md`, `state.md`, `requirements.md`
- Subdirectories: `codebase/` (stack/architecture/structure templates), `research-project/`

**get-shit-done/workflows/**
- Purpose: Reusable multi-step procedures
- Contains: Workflow definitions called by commands
- Key files: `execute-plan.md`, `execute-phase.md`, `plan-phase.md`, `create-roadmap.md`, `verify-phase.md`
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `bin/install.js` - Installation script (npx entry)

**Configuration:**
- `package.json` - Project metadata, dependencies, bin entry
- `get-shit-done/templates/config.json` - Workflow mode configuration
- `.gitignore` - Excluded files

**Core Logic:**
- `bin/install.js` - All installation logic (file copying, path replacement)
- `commands/gsd/*.md` - Command specifications
- `get-shit-done/workflows/*.md` - Workflow implementations

**Testing:**
- Not applicable - No test framework (verification happens during execution)

**Documentation:**
- `README.md` - User-facing installation and usage guide
- `GSD-STYLE.md` - Contributor style guide
- `CHANGELOG.md` - Version history

## Naming Conventions

**Files:**
- kebab-case.md: All markdown documents
- kebab-case.js: JavaScript source files
- UPPERCASE.md: Important project files (README, CHANGELOG)
- {phase}-{plan}-PLAN.md: Executable plan files
- {phase}-{plan}-SUMMARY.md: Execution summaries

**Directories:**
- kebab-case: All directories
- Plural for collections: templates/, commands/, workflows/, agents/

**Special Patterns:**
- `gsd:command-name` format for slash commands
- `gsd-agent-name` format for subagents

## Where to Add New Code

**New Slash Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Documentation: Update `commands/gsd/help.md` with new command

**New Workflow:**
- Implementation: `get-shit-done/workflows/{name}.md`
- Usage: Reference from command with `@~/.claude/get-shit-done/workflows/{name}.md`

**New Template:**
- Implementation: `get-shit-done/templates/{name}.md`
- Documentation: Template is self-documenting (includes guidelines)

**New Reference Document:**
- Implementation: `get-shit-done/references/{name}.md`
- Usage: Reference from commands/workflows as needed

**New Agent:**
- Implementation: `agents/gsd-{name}.md`
- Usage: Spawn from orchestrator command

## Special Directories

**get-shit-done/**
- Purpose: Resources installed to ~/.claude/
- Source: Copied by bin/install.js during installation
- Committed: Yes (source of truth)

**commands/**
- Purpose: Slash commands installed to ~/.claude/commands/
- Source: Copied by bin/install.js during installation
- Committed: Yes (source of truth)

**agents/**
- Purpose: Subagents installed to ~/.claude/agents/
- Source: Copied by bin/install.js during installation
- Committed: Yes (source of truth)

**.planning/** (user projects)
- Purpose: Generated project artifacts
- Source: Created by commands during project execution
- Committed: User's choice (typically yes for state tracking)

---

*Structure analysis: 2026-01-16*
*Update when directory structure changes*