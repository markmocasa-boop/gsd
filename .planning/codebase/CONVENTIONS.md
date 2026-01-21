# Coding Conventions

**Analysis Date:** 2026-01-21

## Naming Patterns

**Files:**
- kebab-case for all markdown files (`execute-phase.md`, `plan-phase.md`)
- kebab-case for JavaScript files (`install.js`, `build-hooks.js`)
- Commands use `gsd:kebab-case` prefix (`gsd:execute-phase`, `gsd:plan-phase`)
- Templates use kebab-case (`state.md`, `summary.md`, `debug.md`)

**Functions:**
- camelCase for all JavaScript functions (`parseConfigDirArg`, `expandTilde`)
- No special prefix for async functions
- Event handlers use `handle` prefix (`handleStatusline`)

**Variables:**
- camelCase for variables (`configDir`, `hasGlobal`, `explicitConfigDir`)
- UPPER_SNAKE_CASE for constants/exports (`cyan`, `green`, `yellow`, `reset`)
- Descriptive boolean names: `hasGlobal`, `isGlobal`, `shouldInstallStatusline`

**Types/Interfaces:**
- PascalCase for type-like concepts (not TypeScript - this is conceptual)
- No "I" prefix for interfaces

## Code Style

**Formatting:**
- No Prettier config detected
- No ESLint config detected
- Manual formatting with 2-space indentation observed
- Line length appears flexible (no strict limit enforced)
- Single quotes for strings in JavaScript
- Semicolons required
- Shebang `#!/usr/bin/env node` for executable scripts

**Linting:**
- No linting configuration present
- Manual code review style enforcement via GSD-STYLE.md

**Code Organization:**
- Comments grouping related functionality (`// Parse args`, `// Main`)
- Blank lines between major sections
- Functions defined before usage

## Import Organization

**Order:**
1. Node.js built-in modules (`fs`, `path`, `os`, `readline`)
2. Child process from `child_process` module
3. Local relative imports (`../package.json`)

**Grouping:**
- Blank line between external and local imports
- Logical grouping by functionality

**Path Aliases:**
- No path aliases used
- Direct relative imports with `../` for parent directories

## Error Handling

**Patterns:**
- Use `console.error()` for error messages
- Use `process.exit(1)` for fatal errors
- Error messages use yellow color for visibility
- Clear error descriptions with guidance
- Early exit pattern for invalid arguments

**Error Types:**
- Exit on invalid input (`--config-dir` without value)
- Exit on conflicting flags (`--global` and `--local` together)
- Descriptive error messages with resolution hints
- No custom error classes used

**Error Message Format:**
```javascript
console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
process.exit(1);
```

## Logging

**Framework:**
- Console output only (`console.log`, `console.error`)
- Color-coded output using ANSI escape sequences
- No structured logging framework

**Patterns:**
- Color constants defined at top (`cyan`, `green`, `yellow`, `dim`, `reset`)
- Success messages use checkmark: `${green}✓${reset}`
- Error messages use X mark: `${yellow}✗${reset}`
- Informational messages use console.log with formatting
- Error messages use console.error

**Log Levels:**
- No formal log levels
- Visual distinction via color and symbols
- Dim color for less important information (`${dim}message${reset}`)

## Comments

**When to Comment:**
- Section headers for code organization (`// Parse args`, `// Main`)
- Inline comments for non-obvious logic
- Template files include extensive frontmatter documentation
- XML tags in markdown serve as semantic comments

**JSDoc/TSDoc:**
- Not used in JavaScript files
- Functions are self-documenting through naming
- Complex logic gets inline comments

**TODO Comments:**
- TODO/FIXME/HACK/XXX comments are flagged in verification
- Used sparingly - prefer implementation over TODO
- No specific TODO format required

**Comment Style:**
- Single-line comments with `//`
- Multi-line comments for file headers in templates
- Section dividers use all caps: `// Main`

## Function Design

**Size:**
- Functions appear to be kept focused and relatively short
- `parseConfigDirArg()` ~25 lines
- `install()` function is longer but modular
- Extract helper functions when logic grows

**Parameters:**
- No strict parameter limit observed
- Destructuring used for object parameters when appropriate
- Boolean flags common (`hasGlobal`, `hasLocal`, `isGlobal`)
- Configuration objects passed to functions

**Return Values:**
- Explicit return statements
- Objects returned for multiple values (`{ settingsPath, settings, statuslineCommand }`)
- Early returns for error conditions
- Some functions use callbacks (legacy pattern in install.js)

## Module Design

**Exports:**
- CommonJS `require()` for imports
- `module.exports` not explicitly used (files are scripts)
- Package.json defines `bin` entry point

**Barrel Files:**
- Not applicable for this codebase structure
- No index.ts re-exports

**File Structure:**
- `bin/` - Executable CLI scripts
- `hooks/` - Git hook scripts
- `scripts/` - Build/utility scripts
- `commands/gsd/` - Command definitions (markdown)
- `agents/` - Agent definitions (markdown)
- `get-shit-done/` - Core workflows, templates, references

## Markdown Conventions

**XML Tags:**
- XML tags for semantic structure (`<objective>`, `<process>`, `<step>`)
- kebab-case for tag names (`<execution_context>`, `<success_criteria>`)
- Tags serve as structural containers, not processing instructions

**Frontmatter:**
- YAML frontmatter in command files
- Fields: `name`, `description`, `argument-hint`, `allowed-tools`, `agent`
- Hypenated keys in YAML frontmatter

**Section Organization:**
- XML tags for major sections
- Markdown headers (`##`) within XML tags
- Consistent ordering: objective → context → process → success_criteria

**Code Blocks:**
- Fenced code blocks with language: ```bash, ```typescript, ```markdown
- Used for commands, examples, file templates

**File References:**
- Backtick format for paths: `src/path/file.ts`
- @-references for lazy loading: `@path/to/file.md`

## Language & Tone

**Imperative Voice:**
- Use commands: "Execute tasks", "Read STATE.md"
- Avoid passive voice: "Execution is performed" (avoid)
- Direct instructions preferred

**No Filler:**
- Avoid: "Let me", "Just", "Simply", "Basically"
- Present: Direct technical statements

**Brevity:**
- One-liners should be substantive
- "JWT auth with refresh rotation using jose library" (good)
- "Phase complete" (bad)

**No Sycophancy:**
- Avoid: "Great!", "Awesome!", "Excellent!"
- Present: Factual verification results

## Commit Conventions

**Format:**
```
{type}({phase}-{plan}): {description}
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `test` - Tests only (TDD RED)
- `refactor` - Code cleanup (TDD REFACTOR)
- `docs` - Documentation/metadata
- `chore` - Config/dependencies

**Rules:**
- One commit per task during execution
- Stage files individually (never `git add .`)
- Include `Co-Authored-By: Claude <noreply@anthropic.com>`
- Capture commit hash for SUMMARY.md

---

*Convention analysis: 2026-01-21*
*Update when patterns change*
