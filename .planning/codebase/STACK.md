# Technology Stack

**Analysis Date:** 2026-01-21

## Languages

**Primary:**
- JavaScript (Node.js) - Runtime environment for installer, build scripts, and hooks
- Markdown - Documentation, agent prompts, command definitions, workflows, templates

**Secondary:**
- YAML - Frontmatter metadata in command files
- JSON - Configuration files, package manifest, project state

## Runtime

**Environment:**
- Node.js >=16.7.0 (required per `package.json` engines field)

**Package Manager:**
- npm (inferred from `package.json` structure and `npx` installation)
- Lockfile: Not present (this is a zero-dependency package)

**Distribution:**
- npm registry under package name `get-shit-done-cc`

## Frameworks

**Core:**
- None (pure Node.js with built-in modules)

**Testing:**
- Not detected (no test framework or test files)

**Build/Dev:**
- esbuild ^0.24.0 - Bundler for hooks (minimal usage - mostly file copying)
- Node.js native modules: `fs`, `path`, `os`, `readline`, `child_process`

## Key Dependencies

**Critical:**
- None - This is a zero-dependency package (empty `dependencies` object)

**Infrastructure:**
- None - No external infrastructure dependencies

**Development:**
- esbuild ^0.24.0 - Only devDependency, used to prepare hooks for distribution

## Configuration

**Environment:**
- `.planning/config.json` - Project settings (mode, depth, workflow flags, parallelization, gates)
- `~/.claude/settings.json` - Claude Code global settings (hooks, statusline configuration)
- Environment variable: `CLAUDE_CONFIG_DIR` - Optional override for Claude config directory

**Build:**
- `scripts/build-hooks.js` - Copy hooks to dist directory
- `package.json` - npm package manifest with build:hooks script

## Platform Requirements

**Development:**
- Node.js >=16.7.0
- npm (for installation/publishing)
- Claude Code CLI (target platform for this package)
- Git (for version control and commit operations during GSD workflows)

**Production:**
- Claude Code CLI (runs the installed commands, agents, and hooks)
- npm (for update checks via `npm view` command)
- Git (required for GSD's commit operations)
- Cross-platform: Mac, Windows, Linux (per README.md)

---

*Stack analysis: 2026-01-21*
