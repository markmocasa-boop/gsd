# Codebase Concerns

**Analysis Date:** 2026-01-21

## Tech Debt

**Orphaned file cleanup in installer:**
- Issue: Installer maintains hardcoded lists of orphaned files to remove from previous versions
- Files: `bin/install.js` (lines 172-184, orphanedFiles array)
- Why: Each version requires manual updates to remove old files, prone to missing items
- Impact: Orphaned files accumulate over time, potential confusion for users
- Fix approach: Implement versioned manifest tracking or use deprecation markers in files

**Settings.json hook cleanup complexity:**
- Issue: Cleanup orphaned hooks requires iterating through all hook event types and pattern-matching command strings
- Files: `bin/install.js` (lines 189-230, cleanupOrphanedHooks function)
- Why: Hook system evolution leaves residue; cleanup is fragile and string-based
- Impact: Broken hooks may persist if patterns don't match exactly
- Fix approach: Use hook metadata/versioning instead of string pattern matching

**Path handling inconsistencies:**
- Issue: Multiple path expansion patterns (expandTilde function, forward slash conversion for Windows)
- Files: `bin/install.js` (lines 101-116)
- Why: Different platforms handle paths differently; ad-hoc fixes accumulated
- Impact: Windows-specific bugs, WSL2 compatibility issues
- Fix approach: Consolidate path handling through a single abstraction layer

**Context rot mitigation through clean installs:**
- Issue: Installer performs clean install by deleting destination directories first
- Files: `bin/install.js` (lines 143-148)
- Why: To prevent orphaned files from previous versions
- Impact: User customizations in ~/.claude/ get lost without warning
- Fix approach: Implement merge strategy with conflict detection

## Known Bugs

**WSL2/non-TTY stdin detection:**
- Symptoms: Installation fails to prompt for location in WSL2 environments
- Files: `bin/install.js` (lines 517-526, process.stdin.isTTY check)
- Trigger: Running installer in WSL2 or Docker where stdin may not be properly connected
- Workaround: Auto-defaults to global install when non-TTY detected
- Root cause: readline fails in environments where stdin isn't a proper TTY
- Fix approach: Improve TTY detection or use alternative prompting methods

**Phase directory matching inconsistency:**
- Symptoms: Phase numbering issues when mixing zero-padded (05) and unpadded (5) formats
- Files: CHANGELOG.md (v1.5.28 fix)
- Trigger: Manual phase directory naming or inconsistent automated naming
- Workaround: Fixed by normalizing matching logic
- Root cause: No enforced naming convention for phase directories
- Status: Marked as fixed in v1.5.28

**Double-path bug in researcher:**
- Symptoms: Git add command with duplicated paths
- Files: CHANGELOG.md (v1.5.29 fix)
- Trigger: Research-phase git operations
- Root cause: Path concatenation error
- Status: Marked as fixed in v1.5.29

**Glob respecting .gitignore:**
- Symptoms: .planning/ directory not found when using Glob tool (often gitignored)
- Files: `commands/gsd/progress.md` (lines 23-28)
- Trigger: Using Glob instead of Bash for directory existence checks
- Workaround: Use Bash test command instead of Glob
- Root cause: Glob tool respects .gitignore by design, .planning/ is commonly gitignored
- Status: Documented workaround in progress.md

## Security Considerations

**No API key/secrets management:**
- Risk: GSD system has no built-in secret management; external services require manual configuration
- Files: `get-shit-done/templates/user-setup.md` exists but no enforcement
- Current mitigation: USER-SETUP.md template for external service configuration
- Recommendations: Implement encrypted secret store or integrate with system keychain

**Shell command execution:**
- Risk: Multiple hooks execute shell commands; validation limited
- Files: `hooks/gsd-check-update.js`, `hooks/gsd-statusline.js`
- Current mitigation: Node.js spawn with proper argument separation
- Recommendations: Add command whitelist/validation for hook execution

**NPM package execution:**
- Risk: Installer runs as Node.js script with file system access
- Files: `bin/install.js`
- Current mitigation: No mitigation - standard npm install behavior
- Recommendations: Document security model; consider sandboxed installation option

**Update mechanism over HTTP:**
- Risk: Update check fetches from npm registry over HTTP (unless HTTPS enforced)
- Files: `hooks/gsd-check-update.js` (npm view command)
- Current mitigation: npm uses HTTPS by default
- Recommendations: Verify TLS, consider checksum verification

## Performance Bottlenecks

**Sequential hook execution:**
- Problem: SessionStart hook runs update check synchronously (spawned but unref'd)
- Files: `hooks/gsd-check-update.js` (lines 24-61)
- Measurement: Not measured, but blocks on npm registry availability
- Cause: Spawn used with unref() but completion not awaited
- Improvement path: Already optimal (background execution), but timeout of 10s may cause delays

**Statusline file operations per session:**
- Problem: Reads multiple files (cache, todos, VERSION) on every render
- Files: `hooks/gsd-statusline.js`
- Measurement: Not measured; likely negligible for small files
- Cause: No caching of file contents between renders
- Improvement path: Add in-memory caching for frequently accessed files

**Codebase mapping file scanning:**
- Problem: map-codebase spawns 4 parallel agents but each does full file system scans
- Files: `agents/gsd-codebase-mapper.md`
- Measurement: Not measured; depends on codebase size
- Cause: No shared scan results between agents
- Improvement path: Implement shared scan cache or pre-scan coordinator

## Fragile Areas

**Hook system coupling:**
- Files: `bin/install.js` (lines 409-434, settings.hooks.SessionStart)
- Why fragile: Hook registration depends on exact string matching in command field
- Common failures: Adding/removing hooks breaks pattern matching in cleanup functions
- Safe modification: Use hook metadata objects instead of command string matching
- Test coverage: No automated tests for hook installation/cleanup

**Model profile system:**
- Files: Various agent commands and `commands/gsd/set-profile.md`
- Why fragile: Model selection hardcoded in lookup tables throughout codebase
- Common failures: New model support requires updating multiple files
- Safe modification: Centralize model profile configuration
- Test coverage: No tests for model profile resolution

**Phase numbering assumptions:**
- Files: Multiple commands assume sequential phase numbering
- Why fragile: Insert/remove-phase operations can break assumptions
- Common failures: References to phase "N+1" fail when phases are renumbered
- Safe modification: Use symbolic references instead of numeric offsets
- Test coverage: Limited testing of phase renumbering edge cases

**Settings.json structure evolution:**
- Files: `bin/install.js` (readSettings, writeSettings functions)
- Why fragile: Settings structure grows organically; backward compatibility not guaranteed
- Common failures: Old configs missing new fields cause undefined behavior
- Safe modification: Implement schema versioning and migration logic
- Test coverage: No tests for config migration

## Scaling Limits

**Single project per directory:**
- Current capacity: One PROJECT.md per directory
- Limit: Cannot manage multiple projects in same codebase
- Symptoms at limit: Need to use separate directories for different projects
- Scaling path: Multi-project workspaces (would require significant redesign)

**Agent parallelization:**
- Current capacity: 4 parallel researchers, wave-based executors
- Limit: No explicit limit but Claude Code API constraints apply
- Symptoms at limit: Rate limiting, context window exhaustion
- Scaling path: Implement agent pooling, request queuing

**.planning/ directory growth:**
- Current capacity: Unbounded; all artifacts stored indefinitely
- Limit: Disk space, file system performance with thousands of files
- Symptoms at limit: Slow file operations, large git history
- Scaling path: Implement artifact archival/compression for old phases

## Dependencies at Risk

**esbuild:**
- Risk: Build tool for hooks; dependency on external bundler
- Impact: Cannot build hooks for distribution if esbuild breaks or changes API
- Migration plan: Minimal usage; could switch to simpler copy-only build

**Node.js version requirement:**
- Risk: Requires Node >=16.7.0
- Files: `package.json` (engines field)
- Impact: Won't work on older Node versions; may break with future Node changes
- Migration plan: Test on new Node versions; update engines field as needed

**npm registry availability:**
- Risk: Update check and installation depend on npm registry
- Files: `hooks/gsd-check-update.js`, installation process
- Impact: Cannot check for updates or install if npm is down
- Migration plan: Already mitigated by caching; could add fallback to GitHub releases

**Claude Code API changes:**
- Risk: GSD depends on Claude Code slash command and hook APIs
- Impact: Breaking changes in Claude Code could break GSD
- Migration plan: Monitor changelogs; version compatibility testing

## Missing Critical Features

**No automated testing:**
- Problem: No test suite for installer, hooks, or agent workflows
- Current workaround: Manual testing during development
- Blocks: Confidence in releases, catching regressions
- Implementation complexity: High (need to test file system operations, agent spawning)

**No configuration validation:**
- Problem: config.json structure not validated on load
- Current workaround: Graceful degradation when fields missing
- Blocks: Early detection of configuration errors
- Implementation complexity: Medium (JSON schema validation)

**No backup/restore mechanism:**
- Problem: No way to backup .planning/ state or restore from corruption
- Current workaround: Manual git operations
- Blocks: Recovery from user errors or disk issues
- Implementation complexity: Medium (export/import functionality)

**No progress persistence across sessions:**
- Problem: Session state (todos, debug) not automatically restored
- Current workaround: /gsd:resume-work command for manual continuation
- Blocks: Seamless workflow after interruption
- Implementation complexity: High (need session serialization)

## Platform-Specific Issues

**Windows console flash on hook execution:**
- Problem: Console window briefly appears when hooks spawn background processes
- Files: `hooks/gsd-check-update.js`, `hooks/gsd-statusline.js`
- Platform: Windows
- Status: Fixed in v1.5.29 via windowsHide option
- Files affected: All hooks using spawn()

**Tilde expansion in environment variables:**
- Problem: CLAUDE_CONFIG_DIR with ~ path doesn't expand in all contexts
- Files: `bin/install.js` (expandTilde function, line 101-106)
- Platform: All, but primarily affects non-interactive shells
- Mitigation: Manual expansion function added
- Status: Partially addressed

**Forward slash for Node.js compatibility on Windows:**
- Problem: Windows uses backslashes, Node.js needs forward slashes
- Files: `bin/install.js` (buildHookCommand function, line 114)
- Platform: Windows
- Status: Workaround implemented
- Risk: May break with future Node.js or Windows changes

**WSL2 detection and fallback:**
- Problem: WSL2 stdin not recognized as TTY, breaks interactive prompts
- Files: `bin/install.js` (line 519)
- Platform: WSL2
- Status: Fallback to global install implemented
- Limitation: No true WSL2 detection, just TTY check

**Termux/Android environment:**
- Problem: Current running environment is Termux on Android
- Platform: Termux (Android Linux)
- Status: Installer works but not explicitly tested/supported
- Concern: May have path or permission issues specific to Termux

## Removed Features (Deprecated)

**Codebase Intelligence System (v1.9.2):**
- Issue: SQLite graph database (21MB dependency) deemed overengineered
- Files removed: gsd-intel-*.js hooks, /gsd:analyze-codebase, /gsd:query-intel
- Why: Too complex for value provided; codebase mapping sufficient
- Impact: Users who relied on entity file generation lose that feature
- Migration: Use /gsd:map-codebase instead

**ISSUES.md system (v1.4.24):**
- Issue: Phase-scoped UAT and TODOs replaced global issues tracking
- Files removed: ISSUES.md references and templates
- Why: Better alignment with phase-based workflow
- Impact: Global issue tracking replaced by phase-specific issues
- Migration: Use UAT.md and todos/ system instead

**gsd-notify.sh hook (v1.6.4):**
- Issue: Notification popups across platforms removed
- Files removed: hooks/gsd-notify.sh
- Why: Platform-specific notification system too fragile
- Impact: No visual notification when Claude stops
- Migration: Statusline shows state; no replacement for notifications

**/gsd:execute-plan command (v1.5.28):**
- Issue: Functionality consolidated into /gsd:execute-phase
- Files removed: commands/gsd/execute-plan.md (if existed)
- Why: Unified execution interface
- Impact: Users must use execute-phase for all execution
- Migration: Use /gsd:execute-phase instead

---

*Concerns audit: 2026-01-21*
*Update as issues are fixed or new ones discovered*
