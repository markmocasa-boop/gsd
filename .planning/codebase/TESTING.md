# Testing Patterns

**Analysis Date:** 2026-01-21

## Test Framework

**Runner:**
- No test framework detected
- No package.json test scripts
- No test configuration files (jest.config.js, vitest.config.ts, etc.)
- Manual testing via command execution

**Assertion Library:**
- Not applicable (no automated testing framework)

**Run Commands:**
```bash
# Manual testing approach
npx get-shit-done-cc          # Test installation
node bin/install.js --global   # Test global install
node bin/install.js --local    # Test local install
```

## Test File Organization

**Location:**
- No test files present
- No `*.test.ts`, `*.spec.ts`, or `__tests__/` directories
- Testing done manually via CLI execution

**Naming:**
- Not applicable (no test files)

**Structure:**
```
get-shit-done/
├── bin/           # Executable scripts (manually tested)
├── hooks/         # Hook scripts (manually tested)
├── scripts/       # Build scripts (manually tested)
├── commands/      # Command definitions (markdown)
├── agents/        # Agent definitions (markdown)
└── get-shit-done/ # Workflows and templates
```

## Test Structure

**Suite Organization:**
- Not applicable (no automated tests)

**Patterns:**
- Manual verification via CLI commands
- Installation tested via `npx get-shit-done-cc`
- Hook functionality tested during git operations

## Mocking

**Framework:**
- Not applicable (no test framework)

**Patterns:**
- File system operations use real fs module
- No mocking infrastructure present

**What to Mock:**
- Not applicable

**What NOT to Mock:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- Template files serve as test fixtures (`get-shit-done/templates/*.md`)
- Example commands in `commands/gsd/` directory
- Reference documentation in `get-shit-done/references/`

**Location:**
- `get-shit-done/templates/` - Template fixtures
- `get-shit-done/references/` - Reference documentation

## Coverage

**Requirements:**
- No enforced coverage target
- No coverage tracking tool configured

**Configuration:**
- Not applicable

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- Not present

**Integration Tests:**
- Manual testing of end-to-end workflows
- GSD workflows test their own outputs via verification steps
- User acceptance testing via actual project usage

**E2E Tests:**
- Manual E2E testing by running full GSD workflows
- Example: Create project, plan phases, execute plans, verify results

## Verification Patterns

**Built-in Verification:**
- GSD includes verification workflows (`verify-work.md`, `verify-phase.md`)
- gsd-verifier agent checks for:
  - Stub detection (TODO/FIXME comments)
  - Placeholder text
  - Empty/trivial implementations
  - Hardcoded values where dynamic expected

**Verification Command:**
```bash
/gsd:verify-work    # Verify phase completion
/gsd:audit-milestone  # Audit milestone for anti-patterns
```

**Verification Reports:**
- VERIFICATION.md generated after verification
- Documents files checked, issues found, resolution needed

## Manual Testing Approach

**Installation Testing:**
```bash
# Test global install
npx get-shit-done-cc --global

# Test local install
npx get-shit-done-cc --local

# Verify files installed
ls ~/.claude/commands/gsd/
ls ~/.claude/get-shit-done/
```

**Command Testing:**
```bash
# Test help command
/gsd:help

# Test new project workflow
/gsd:new-project

# Test planning workflow
/gsd:plan-phase

# Test execution workflow
/gsd:execute-phase
```

**Hook Testing:**
- Hooks run automatically during git operations
- gsd-check-update.js runs on session start
- gsd-statusline.js displays status in prompt

## Quality Assurance

**Style Guide:**
- GSD-STYLE.md defines coding conventions
- Enforced via review and agent prompts
- Manual adherence to conventions

**Verification Workflows:**
- `verify-work.md` - Phase-level verification
- `verify-phase.md` - Milestone-level verification
- `audit-milestone.md` - Anti-pattern detection

**Anti-pattern Detection:**
- Searches for TODO, FIXME, placeholder text
- Checks for stub implementations
- Identifies hardcoded values
- Validates file completeness

## Testing Documentation

**TDD Reference:**
- `get-shit-done/references/tdd.md` - TDD guidance for user projects
- Not applied to GSD itself (manual testing only)

**Verification Reference:**
- `get-shit-done/references/verification-patterns.md` - How to verify implementations
- Used by gsd-verifier agent

**Checkpoint System:**
- `get-shit-done/references/checkpoints.md` - Checkpoint patterns
- User verification required at blocking checkpoints

## Debugging Support

**Debug Template:**
- `get-shit-done/templates/DEBUG.md` - Debug session tracking
- `.planning/debug/[slug].md` files for active debugging
- Structured format: symptoms, evidence, eliminated hypotheses, resolution

**Debug Command:**
```bash
/gsd:debug    # Start debug session
```

**Debugger Agent:**
- `agents/gsd-debugger.md` - Debugging workflow agent
- Systematic investigation process
- Evidence tracking across sessions

## Common Patterns

**Async Testing:**
- Not applicable (no async test framework)

**Error Testing:**
- Manual error handling verification
- Test invalid arguments to CLI
- Verify error messages display correctly

**File System Testing:**
- Manual verification of file creation
- Check correct file placement in `.claude/` directory
- Validate file permissions on executable scripts

**Integration Testing:**
- Run full GSD workflow on test project
- Verify all artifacts created (PLAN.md, SUMMARY.md, STATE.md)
- Check git commits created correctly

---

*Testing analysis: 2026-01-21*
*Note: GSD uses manual testing and built-in verification workflows rather than automated test frameworks*
