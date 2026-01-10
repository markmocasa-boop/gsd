# Codebase Structure

**Analysis Date:** 2025-01-10

## Directory Layout

```
get-shit-done/
├── bin/                # CLI entry points and installation scripts
├── commands/           # Slash command definitions
│   └── gsd/           # GSD-specific commands
├── get-shit-done/     # Core system resources
│   ├── references/    # Reference materials and guidelines
│   ├── templates/     # Output generation templates
│   └── workflows/     # Development workflow prompts
├── assets/            # Supporting assets
├── package.json       # Project metadata and scripts
├── README.md          # User documentation
└── AGENTS.md          # Development guidelines
```

## Directory Purposes

**bin/**
- Purpose: CLI entry points and installation logic
- Contains: install.js, install-opencode.js, uninstall-opencode.js
- Key files: install.js (main installer), install-opencode.js (OpenCode-specific install)
- Subdirectories: None

**commands/gsd/**
- Purpose: Claude Code slash command definitions
- Contains: *.md files (one per command)
- Key files: help.md, new-project.md, plan-phase.md, execute-plan.md
- Subdirectories: None (flat structure)

**get-shit-done/references/**
- Purpose: Core philosophy and reference materials
- Contains: principles.md, checkpoints.md, tdd.md
- Key files: principles.md (system philosophy)
- Subdirectories: None

**get-shit-done/templates/**
- Purpose: Document templates for .planning/ files
- Contains: *.md template files with frontmatter
- Key files: project.md, roadmap.md, plan.md, summary.md
- Subdirectories: codebase/ (for stack/architecture/structure templates)

**get-shit-done/workflows/**
- Purpose: Reusable multi-step development procedures
- Contains: *.md workflow definitions
- Key files: execute-phase.md, plan-phase.md, map-codebase.md
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `bin/install.js` - Main CLI installer
- `commands/gsd/help.md` - Help command definition

**Configuration:**
- `package.json` - Project metadata, bin entries, dependencies

**Core Logic:**
- `bin/install.js` - All installation logic (file copying, path replacement)

**Testing:**
- None (manual verification only)

**Documentation:**
- `README.md` - Installation and usage guide
- `AGENTS.md` - Development guidelines

## Naming Conventions

**Files:**
- kebab-case.md: Markdown documentation and templates
- kebab-case.js: JavaScript source files
- camelCase.js: Installer scripts

**Directories:**
- kebab-case: All directories
- Plural for collections: templates/, commands/, workflows/

**Special Patterns:**
- {command-name}.md: Slash command definition files
- *-template.md: Template files
- *-workflow.md: Workflow definition files

## Where to Add New Code

**New Slash Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Documentation: Update README.md

**New Template:**
- Implementation: `get-shit-done/templates/{name}.md`

**New Workflow:**
- Implementation: `get-shit-done/workflows/{name}.md`

**New Reference Document:**
- Implementation: `get-shit-done/references/{name}.md`

**Utilities:**
- No utilities yet (installer is monolithic)

## Special Directories

**get-shit-done/**
- Purpose: Resources copied to ~/.claude/ during installation
- Source: Committed source files
- Committed: Yes

**assets/**
- Purpose: Supporting assets (icons, images)
- Source: Static files
- Committed: Yes

---

*Structure analysis: 2025-01-10*
*Update when directory structure changes*