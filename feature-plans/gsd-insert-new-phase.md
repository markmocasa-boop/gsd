# Feature Plan: `gsd:insert-new-phase`

## Overview

Add a new command `/gsd:insert-new-phase <after> <description>` that inserts a true integer phase at a specific position, renumbering all subsequent phases and their artifacts.

**Motivation:** The current `/gsd:insert-phase` command creates decimal phases (e.g., 72.1, 72.2) which don't renumber anything - they're "insertions" that preserve the original sequence. This works for urgent mid-milestone work but is awkward for planned restructuring. The new command enables clean integer phase insertion with proper renumbering.

---

## Requirements Summary

| Requirement | Details |
|-------------|---------|
| **Command name** | `gsd:insert-new-phase` |
| **Arguments** | `<after-phase> <description>` (same format as insert-phase) |
| **Decimal handling** | Renumber decimals with their parent (2.1 → 3.1, 2.2 → 3.2) |
| **Cross-references** | Update ALL references (frontmatter + prose) in planning artifacts |
| **Phase creation** | Create directory + ROADMAP entry + STATE update |
| **Validation** | Block if ANY phase after insertion point is completed |
| **Confirmation** | Show preview, require confirmation before executing |
| **Git behavior** | Do NOT auto-commit (matches insert-phase behavior) |

---

## Validation Rules

The command must block insertion if any completed phase would be renumbered. This ensures git commit history remains accurate.

```
Given phases: [1-done, 2-done, 3-pending, 4-done, 5-pending]

✗ insert-new-phase 1  → FAIL: Phase 2 (completed) would be renumbered
✗ insert-new-phase 2  → FAIL: Phase 4 (completed) exists after position 2
✗ insert-new-phase 3  → FAIL: Phase 4 (completed) exists after position 3
✗ insert-new-phase 4  → FAIL: Phase 4 is completed, can't insert after it
✓ insert-new-phase 5  → OK: No completed phases after position 5
```

**Key rule:** If ANY completed phase exists at position > target, block the operation.

### Why This Rule Exists

Completed phases have git commits like:
- `feat(03-01): implement authentication`
- `docs(03): complete phase 3`

If we renumbered phase 3 to phase 4, these commits would incorrectly reference the wrong phase. By never renumbering completed phases, git history integrity is preserved.

**Note:** GSD does NOT parse git commit messages to infer state (completion is determined by SUMMARY.md file existence). However, maintaining accurate commit messages is important for human readability and context engineering.

---

## Files Updated During Renumbering

| File/Location | Updates Required |
|---------------|------------------|
| **Phase directories** | `03-slug/` → `04-slug/` |
| **Plan files** | `03-01-PLAN.md` → `04-01-PLAN.md` |
| **Summary files** | `03-01-SUMMARY.md` → `04-01-SUMMARY.md` |
| **Context files** | `03-CONTEXT.md` → `04-CONTEXT.md` |
| **Research files** | `03-RESEARCH.md` → `04-RESEARCH.md` |
| **Verification files** | `03-VERIFICATION.md` → `04-VERIFICATION.md` |
| **UAT files** | `03-UAT.md` → `04-UAT.md` |
| **Decimal directories** | `03.1-slug/` → `04.1-slug/` |
| **Decimal files** | `03.1-01-PLAN.md` → `04.1-01-PLAN.md` |
| **ROADMAP.md** | Phase headings, progress table, plan lists, dependencies |
| **STATE.md** | Total phase count, current position (if affected) |
| **REQUIREMENTS.md** | Phase column in requirements traceability table |
| **Plan frontmatter** | `depends_on: [03-01]` → `depends_on: [04-01]` |
| **Summary frontmatter** | `phase:`, `requires:`, `affects:` fields |
| **Prose references** | "Phase 3" → "Phase 4" in descriptions |

---

## Command Implementation Steps

### Step 1: Parse Arguments

```bash
if [ $# -lt 2 ]; then
  echo "ERROR: Both phase number and description required"
  echo "Usage: /gsd:insert-new-phase <after> <description>"
  echo "Example: /gsd:insert-new-phase 2 Add user authentication"
  exit 1
fi

after_phase=$1
shift
description="$*"

# Validate after_phase is an integer
if ! [[ "$after_phase" =~ ^[0-9]+$ ]]; then
  echo "ERROR: Phase number must be an integer (cannot insert after decimal phases)"
  exit 1
fi
```

### Step 2: Load State

- Read ROADMAP.md, STATE.md
- Parse current position, all phase statuses
- Build list of all phases with their completion status

### Step 3: Validate Target Phase

- Verify target phase exists in ROADMAP.md
- Verify target phase is an integer (can't insert after decimal)

```
ERROR: Phase {target} not found in roadmap
Available phases: 1, 2, 3, 4, 5
```

### Step 4: Check Completion Constraint

Scan ALL phases with number > target. Determine completion by checking for SUMMARY.md files in phase directories.

If ANY phase after target is completed:

```
ERROR: Cannot insert phase after Phase {target}

The following completed phases would need renumbering:
- Phase {N}: {Name} (completed)
- Phase {M}: {Name} (completed)

Completed phases cannot be renumbered because:
- Git commit history references these phase numbers
- Renumbering would make historical commits inaccurate

Options:
1. Use /gsd:insert-phase {target} to insert a decimal phase (no renumbering)
2. Add phase at end with /gsd:add-phase
```

### Step 5: Gather Affected Phases

- List all phases > target (integers and decimals)
- Calculate new phase numbers (all increment by 1)
- Calculate new phase number for insertion: `target + 1`

Example for `insert-new-phase 2`:
```
Affected phases:
- Phase 3 → Phase 4
- Phase 3.1 → Phase 4.1
- Phase 3.2 → Phase 4.2
- Phase 4 → Phase 5
- Phase 5 → Phase 6

New phase 3 will be created
```

### Step 6: Show Confirmation

```
Inserting new Phase {new_phase}: {description}

This will renumber the following phases:
  - Phase 3 → Phase 4
  - Phase 3.1 → Phase 4.1
  - Phase 4 → Phase 5
  - Phase 5 → Phase 6

Directories to rename: 4
Files to rename: 12
Files to update (content): 8

Proceed? (y/n)
```

Wait for user confirmation before proceeding.

### Step 7: Renumber Directories (Descending Order)

Process from highest to lowest to avoid naming conflicts:

```bash
# Example sequence for insert-new-phase 2:
mv ".planning/phases/05-dashboard" ".planning/phases/06-dashboard"
mv ".planning/phases/04-auth" ".planning/phases/05-auth"
mv ".planning/phases/03.2-hotfix" ".planning/phases/04.2-hotfix"
mv ".planning/phases/03.1-bugfix" ".planning/phases/04.1-bugfix"
mv ".planning/phases/03-core" ".planning/phases/04-core"
```

### Step 8: Rename Files Inside Directories

For each renumbered directory, rename files containing the phase number:

```bash
# Inside 04-core (was 03-core):
mv "03-01-PLAN.md" "04-01-PLAN.md"
mv "03-02-PLAN.md" "04-02-PLAN.md"
mv "03-01-SUMMARY.md" "04-01-SUMMARY.md"
mv "03-CONTEXT.md" "04-CONTEXT.md"
mv "03-RESEARCH.md" "04-RESEARCH.md"
mv "03-VERIFICATION.md" "04-VERIFICATION.md"
# etc.
```

### Step 9: Update File Contents

Search and replace phase references in all `.planning/` files:

**Frontmatter updates:**
- `phase: 03` → `phase: 04`
- `depends_on: [03-01]` → `depends_on: [04-01]`
- `affects: [phase 04]` → `affects: [phase 05]`

**Prose updates:**
- "Phase 3" → "Phase 4"
- "phase 3" → "phase 4"

Process files in this order:
1. PLAN.md files (frontmatter + body)
2. SUMMARY.md files (frontmatter + body)
3. CONTEXT.md, RESEARCH.md, VERIFICATION.md, UAT.md
4. ROADMAP.md
5. STATE.md
6. REQUIREMENTS.md

### Step 10: Create New Phase

Generate slug from description:
```bash
slug=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
```

Create directory:
```bash
new_phase=$((after_phase + 1))
phase_dir=".planning/phases/$(printf "%02d" $new_phase)-${slug}"
mkdir -p "$phase_dir"
```

### Step 11: Update ROADMAP.md

Insert new phase section after target phase:

```markdown
### Phase {new_phase}: {Description}

**Goal:** [To be defined during planning]
**Depends on:** Phase {after_phase}
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase {new_phase} to break down)

**Details:**
[To be added during planning]
```

Also update:
- All subsequent phase headings (increment numbers)
- Progress table rows
- Dependency references (`**Depends on:** Phase N` → `Phase N+1`)

### Step 12: Update STATE.md

- Increment total phase count: `Phase: X of Y` → `Phase: X of Y+1`
- Update current position if current phase was renumbered
- Recalculate progress percentage
- Add roadmap evolution entry:
  ```
  - Phase {new_phase} inserted after Phase {after_phase}: {description}
  ```

### Step 13: Update REQUIREMENTS.md (if exists)

Update phase numbers in requirements traceability table:

```markdown
| Requirement | Description | Phase | Status |
| REQ-01 | User registration | 03 | Pending |
```
→
```markdown
| Requirement | Description | Phase | Status |
| REQ-01 | User registration | 04 | Pending |
```

### Step 14: Completion Summary (No Auto-Commit)

```
Phase {new_phase} inserted: {description}

Changes made:
- Created: .planning/phases/{new_phase}-{slug}/
- Renumbered: {count} phases ({old_range} → {new_range})
- Updated: {file_count} files with phase references
- Modified: ROADMAP.md, STATE.md

Files changed (not yet committed):
  .planning/ROADMAP.md
  .planning/STATE.md
  .planning/phases/04-auth/ (was 03-auth/)
  .planning/phases/05-dashboard/ (was 04-dashboard/)
  [etc.]

---

## Next Up

**Phase {new_phase}: {description}** — newly inserted

`/gsd:discuss-phase {new_phase}` or `/gsd:plan-phase {new_phase}`

<sub>`/clear` first → fresh context window</sub>

---

When ready to commit:

git add .planning/ && git commit -m "feat: insert phase {new_phase} ({description})

Renumbered phases:
- Phase 3 → Phase 4
- Phase 3.1 → Phase 4.1
- Phase 4 → Phase 5

Updated {file_count} files"

---
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| **No subsequent phases** | Just create new phase at end (functionally same as add-phase) |
| **Multiple decimal phases** | Renumber all with parent (3.1→4.1, 3.2→4.2, 3.3→4.3) |
| **Insert after decimal** | ERROR: Must insert after integer phase |
| **Target phase doesn't exist** | ERROR with list of available phases |
| **No ROADMAP.md** | ERROR: No project initialized |
| **Insert after last phase** | Works, but suggest using `/gsd:add-phase` instead |
| **Phase directory doesn't exist yet** | Only update ROADMAP.md references (directory may not be created until planning) |

---

## Anti-Patterns

- Don't allow insertion after decimal phases (only integers)
- Don't skip the confirmation step
- Don't partially complete (all-or-nothing operation)
- Don't modify completed phase content (only pending phases' numbers)
- Don't update git commit hashes/references (immutable history)
- Don't ask about each file individually - batch the operation
- Don't auto-commit changes (user decides when to commit, matching insert-phase behavior)

---

## Success Criteria

Phase insertion is complete when:

- [ ] Arguments parsed and validated (integer phase, description provided)
- [ ] Target phase verified to exist in ROADMAP.md
- [ ] Completion constraint checked (no completed phases after target)
- [ ] User confirmed the operation after seeing preview
- [ ] All subsequent phase directories renamed (descending order)
- [ ] All files inside directories renamed with new phase numbers
- [ ] All file contents updated with new phase references
- [ ] New phase directory created
- [ ] ROADMAP.md updated (new entry inserted, subsequent entries renumbered)
- [ ] STATE.md updated (phase count, position if affected, evolution note)
- [ ] REQUIREMENTS.md updated if it exists
- [ ] No gaps in phase numbering
- [ ] User informed of changes and provided commit command

---

## File Structure

The command will be implemented as:

```
commands/gsd/insert-new-phase.md
```

Following the same structure as `remove-phase.md`:
- YAML frontmatter with name, description, argument-hint, allowed-tools
- `<objective>` explaining purpose
- `<execution_context>` referencing needed files
- `<process>` with step-by-step instructions
- `<anti_patterns>` to avoid
- `<edge_cases>` handling
- `<success_criteria>` checklist

---

## Comparison with Related Commands

| Command | Purpose | Renumbers? | Creates Phase? | Commits? |
|---------|---------|------------|----------------|----------|
| `add-phase` | Append phase to end | No | Yes | No |
| `insert-phase` | Insert decimal phase (72.1) | No | Yes | No |
| `remove-phase` | Delete phase, renumber subsequent | Yes (down) | No | Yes |
| **`insert-new-phase`** | Insert integer phase, renumber subsequent | Yes (up) | Yes | No |

---

## Implementation Notes

### Allowed Tools

```yaml
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
```

### Execution Context

```yaml
execution_context:
  - .planning/ROADMAP.md
  - .planning/STATE.md
  - .planning/REQUIREMENTS.md
  - .planning/phases/
```

### Detecting Phase Completion

Phase completion is determined by file existence, not git history:

```bash
# Check if phase has any completed plans
ls .planning/phases/{phase}-*/*-SUMMARY.md 2>/dev/null
```

If any SUMMARY.md files exist, the phase has started execution and should be considered "completed" for the purposes of this command's validation.
