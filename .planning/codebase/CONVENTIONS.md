# Coding Conventions

**Analysis Date:** 2025-01-10

## Naming Patterns

**Files:**
- kebab-case for Markdown files (command definitions, templates, workflows)
- camelCase for JavaScript files (installer scripts)
- Lower-kebab-case for command files (new-project.md, plan-phase.md)

**Functions:**
- camelCase for all functions (parseConfigDirArg, expandTilde, copyWithPathReplacement)

**Variables:**
- camelCase for variables
- UPPER_CASE for constants (ANSI color codes)

**Types:**
- Not applicable (JavaScript only, no TypeScript in main codebase)

## Code Style

**Formatting:**
- 2 space indentation consistently
- Mixed quotes (single in CommonJS, double in ES modules)
- Semicolons present in CommonJS, absent in ES modules

**Linting:**
- None configured (no ESLint or similar)

## Import Organization

**Order:**
1. Node.js built-ins (fs, path, os)
2. External packages (@opencode-ai/plugin)
3. Local imports

**Grouping:**
- Blank lines between groups
- Alphabetical within groups

**Path Aliases:**
- None defined

## Error Handling

**Patterns:**
- Basic try/catch blocks in file operations
- Console error logging
- Process exit on failures

**Error Types:**
- Generic Error objects
- No custom error classes

## Logging

**Framework:**
- Console methods (console.log, console.error)

**Patterns:**
- Colored output using ANSI escape codes
- Error logging before exit
- Success confirmation messages

## Comments

**When to Comment:**
- JSDoc style for function descriptions
- Explain complex logic or workarounds

**JSDoc/TSDoc:**
- Used for main functions in installer scripts
- Format: /** * Description */

**TODO Comments:**
- Not detected in current codebase

## Function Design

**Size:**
- Functions vary in size (installer has some large functions)

**Parameters:**
- Variable parameter counts
- Destructuring not heavily used

**Return Values:**
- Explicit returns
- Some functions return values, others perform side effects

## Module Design

**Exports:**
- CommonJS exports (module.exports) in installer
- ES module exports (export) in plugin code

**Barrel Files:**
- None used

---

*Convention analysis: 2025-01-10*
*Update when patterns change*