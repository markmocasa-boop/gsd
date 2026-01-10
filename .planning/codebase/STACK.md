# Technology Stack

**Analysis Date:** 2025-01-10

## Languages

**Primary:**
- TypeScript 5.3 - Plugin code in .opencode/ directory

**Secondary:**
- JavaScript - CLI scripts in bin/ directory
- Markdown - Command definitions, templates, workflows, references

## Runtime

**Environment:**
- Node.js 20.x (LTS) - Runtime for all scripts

**Package Manager:**
- npm 10.x
- Lockfile: No package-lock.json detected

## Frameworks

**Core:**
- None (vanilla Node.js CLI and plugin)

**Testing:**
- None (manual verification only)

**Build/Dev:**
- None (direct Node.js execution)

## Key Dependencies

**Critical:**
- @opencode-ai/plugin 1.1.11 - Claude Code plugin framework

**Infrastructure:**
- Node.js built-ins - fs, path, os for file operations

## Configuration

**Environment:**
- No environment variables required
- Configuration via JSON template files

**Build:**
- No build configuration (direct execution)

## Platform Requirements

**Development:**
- macOS/Linux/Windows (any platform with Node.js)
- No external dependencies

**Production:**
- Claude Code plugin system
- Installed to ~/.claude/ or ./.claude/