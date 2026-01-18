# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**Missing error handling in file operations:**
- Issue: Multiple synchronous file operations lack try-catch blocks
- Files: `bin/install.js` (lines 105, 107, 117-121, 152, 178, 184)
- Why: Rapid development for CLI installer
- Impact: Installation script crashes with Node stack traces instead of user-friendly messages
- Fix approach: Wrap `copyWithPathReplacement()` and file operations in try-catch with clear error messages

**Deprecated files still in repo:**
- Issue: 8+ deprecated files creating confusion about which version to use
- Files: `get-shit-done/workflows/debug.md`, `workflows/research-phase.md`, `workflows/research-project.md`, `references/research-pitfalls.md`, `references/debugging/` (5 files)
- Why: Functionality consolidated into agents (gsd-debugger, gsd-researcher)
- Impact: Clutter, potential confusion about active vs deprecated code
- Fix approach: Remove deprecated files or archive to separate branch

## Known Bugs

**No critical bugs detected.**

Codebase is primarily documentation/specification files (92 markdown, 1 JS). The single source file has error handling gaps but no functional bugs.

## Security Considerations

**No hardcoded secrets detected** â
- Search for API keys, passwords, tokens returned no results

**Unvalidated environment variable usage:**
- Risk: `process.env.CLAUDE_CONFIG_DIR` used without path validation
- File: `bin/install.js` (line 132)
- Current mitigation: path.join() provides some normalization
- Recommendations: Add explicit path validation before file operations

**Regex path replacement edge cases:**
- Risk: If `pathPrefix` contains regex special characters, replacement could fail
- File: `bin/install.js` (line 118)
- Current mitigation: pathPrefix is validated by path.join()
- Recommendations: Escape regex special characters in replacement string

## Performance Bottlenecks

**No significant performance issues detected.**

The codebase is a CLI installer and specification system. File operations are synchronous but fast for the file counts involved (<100 files).

## Fragile Areas

**Installation path logic:**
- File: `bin/install.js` (lines 144-146)
- Why fragile: Complex conditional for path prefix based on config dir
- Common failures: Wrong path prefix if config dir handling changes
- Safe modification: Add comprehensive comments explaining the logic
- Test coverage: None (manual testing during install)

## Scaling Limits

**Not applicable** - This is a local CLI tool, not a server application.

## Dependencies at Risk

**No external npm dependencies** â

The package has zero npm dependencies (intentionally minimal). Uses only Node.js built-ins.

## Missing Critical Features

**Source directory validation:**
- Problem: Assumes `__dirname/..` contains required directories but doesn't verify
- File: `bin/install.js` (line 130)
- Current workaround: None - silently copies empty trees if wrong location
- Blocks: Unclear error messages when installed from wrong location
- Implementation complexity: Low (add fs.existsSync checks)

**Destination directory write permission check:**
- Problem: No check for write permissions before file operations
- File: `bin/install.js`
- Current workaround: None - fails with Node error
- Blocks: User-friendly error messages
- Implementation complexity: Low (add fs.accessSync check)

## Test Coverage Gaps

**Installation script:**
- What's not tested: `bin/install.js` has no automated tests
- Risk: Installation could break without detection
- Priority: Medium
- Difficulty to test: Would need file system mocking or temp directories

**Command/workflow specifications:**
- What's not tested: Markdown files are specifications, not testable code
- Risk: Specification errors discovered only during execution
- Priority: Low - this is by design (verification happens during execution)
- Difficulty to test: N/A - testing happens via plan execution

## Documentation Gaps

**Complex path logic lacks explanation:**
- What's missing: `bin/install.js` path prefix logic (lines 144-146) needs more comments
- File: `bin/install.js`
- Risk: Future modifications risk breaking path replacement
- Priority: Low

**Large files lack table of contents:**
- What's missing: TOC for files over 500 lines
- Files: `get-shit-done/workflows/execute-plan.md` (1,832 lines), `agents/gsd-debugger.md` (1,184 lines), `agents/gsd-researcher.md` (915 lines)
- Risk: Difficult to navigate for maintainers
- Priority: Low

---

*Concerns audit: 2026-01-16*
*Update as issues are fixed or new ones discovered*