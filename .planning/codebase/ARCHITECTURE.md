# Architecture

**Analysis Date:** 2025-01-10

## Pattern Overview

**Overall:** Prompt-driven development system

**Key Characteristics:**
- Plugin for Claude Code AI assistant
- Markdown-based prompts and templates
- No runtime server or application logic
- Meta-prompting and context engineering

## Layers

**Command Layer:**
- Purpose: User interface via slash commands
- Contains: Slash command definitions and prompts
- Location: `commands/gsd/*.md`
- Depends on: Workflow layer for execution logic
- Used by: Claude Code users

**Workflow Layer:**
- Purpose: Development process logic and prompt engineering
- Contains: Multi-step workflow definitions
- Location: `get-shit-done/workflows/*.md`
- Depends on: Template and reference layers
- Used by: Command handlers

**Template Layer:**
- Purpose: Output generation formats and structures
- Contains: Markdown templates for consistent output
- Location: `get-shit-done/templates/*.md`
- Depends on: None (static templates)
- Used by: Workflow prompts

**Reference Layer:**
- Purpose: Contextual knowledge and guidelines
- Contains: Injected context materials and principles
- Location: `get-shit-done/references/*.md`
- Depends on: None (static references)
- Used by: Workflow prompts

## Data Flow

**Slash Command Execution:**

1. User types `/gsd:<command>` in Claude Code
2. Claude Code reads corresponding `.md` file from `commands/gsd/`
3. Command prompt executes workflow from `get-shit-done/workflows/`
4. Workflow injects templates from `get-shit-done/templates/` and references from `get-shit-done/references/`
5. Claude Code generates response and potentially modifies project files

**State Management:**
- File-based: All state lives in project `.planning/` directory
- No persistent in-memory state
- Each command execution is independent

## Key Abstractions

**Slash Commands:**
- Purpose: User-facing commands for development tasks
- Examples: `commands/gsd/new-project.md`, `commands/gsd/plan-phase.md`
- Pattern: Markdown files with YAML frontmatter defining command metadata

**Workflow Prompts:**
- Purpose: Encapsulate reusable development logic
- Examples: `get-shit-done/workflows/execute-phase.md`, `get-shit-done/workflows/map-codebase.md`
- Pattern: Step-by-step procedures with task spawning and file generation

**Markdown Templates:**
- Purpose: Consistent output formats for planning documents
- Examples: `get-shit-done/templates/project.md`, `get-shit-done/templates/roadmap.md`
- Pattern: Structured Markdown with placeholder variables

## Entry Points

**Installer Entry:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc` or `node bin/install.js`
- Responsibilities: Copy files to Claude Code config directory

**Commands:**
- Location: `commands/gsd/*.md`
- Triggers: User slash commands in Claude Code
- Responsibilities: Route to appropriate workflow execution

## Error Handling

**Strategy:** Basic error handling in installation scripts, no runtime errors in prompts

**Patterns:**
- Try/catch in file operations
- Console error logging
- Process exit on failures

## Cross-Cutting Concerns

**Logging:**
- Console output for installation feedback
- No structured logging in prompts

**Validation:**
- Manual verification of command execution
- No automated validation

**File Operations:**
- Synchronous file operations in installer
- Template copying with path replacement

---

*Architecture analysis: 2025-01-10*
*Update when major patterns change*