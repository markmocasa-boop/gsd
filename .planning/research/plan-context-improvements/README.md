# Plan Context Improvements

This folder contains individual enhancement specifications for improving GSD's dependency modeling and verification capabilities. Each enhancement is designed to be worked on independently as a separate feature branch and PR.

## Source

Analysis report: `.planning/research/RPG-ANALYSIS-REPORT.md`

## Enhancements

| # | Enhancement | Priority | Effort | Files Modified | Status |
|---|-------------|----------|--------|----------------|--------|
| 01 | [Provides/Consumes Frontmatter](./01-provides-consumes-frontmatter.md) | P1 | 1 hr | `templates/phase-prompt.md` | ✓ [PR #269](https://github.com/glittercowboy/get-shit-done/pull/269) |
| 02 | [Data Flow in ROADMAP](./02-data-flow-roadmap.md) | P1 | 30 min | `templates/roadmap.md` | ✓ [PR #270](https://github.com/glittercowboy/get-shit-done/pull/270) |
| 03 | [Key Links Enhancement](./03-key-links-enhancement.md) | P1 | 1 hr | `templates/phase-prompt.md` | ✓ [PR #271](https://github.com/glittercowboy/get-shit-done/pull/271) |
| 04 | [Exports Field Guidance](./04-exports-field-guidance.md) | P1 | 15 min | `templates/phase-prompt.md` | |
| 05 | [Feature Map in STRUCTURE.md](./05-feature-map-structure.md) | P2 | 2 hr | `agents/gsd-codebase-mapper.md` | |
| 06 | [Verifier Relationship Checking](./06-verifier-relationship-checking.md) | P2 | 4 hr | `agents/gsd-verifier.md` | |

## Dependencies Between Enhancements

```
01-provides-consumes ──┐
                       ├──> 06-verifier-relationship-checking
03-key-links ──────────┘

02-data-flow-roadmap (independent)
04-exports-field-guidance (independent)
05-feature-map-structure (independent)
```

**Recommended order:**
1. Start with independent items (02, 04, 05) — no dependencies
2. Then 01 and 03 (both modify phase-prompt.md, can be combined)
3. Finally 06 (depends on 01 and 03 being merged)

---

## GSD Workflow for Each Enhancement

### Starting a New Session

When you start a new Claude Code session to work on an enhancement:

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/{enhancement-name}

# 2. Start Claude Code
claude

# 3. Load context and begin planning
```

### GSD Commands to Use

**For each enhancement, use this workflow:**

1. **Load the enhancement spec:**
   ```
   Read the enhancement document at .planning/research/plan-context-improvements/XX-name.md
   ```

2. **Use /gsd:quick for simple changes (02, 04):**
   ```
   /gsd:quick Implement the enhancement described in .planning/research/plan-context-improvements/02-data-flow-roadmap.md
   ```

3. **Use /gsd:plan-phase for complex changes (01, 03, 05, 06):**

   First, create a minimal roadmap for the enhancement:
   ```
   Create a single-phase ROADMAP.md for this enhancement based on the spec in .planning/research/plan-context-improvements/01-provides-consumes-frontmatter.md
   ```

   Then plan and execute:
   ```
   /gsd:plan-phase 01
   /gsd:execute-phase 01
   ```

4. **Commit and create PR:**
   ```
   /commit
   ```

   Then manually:
   ```bash
   git push -u origin feature/{enhancement-name}
   gh pr create --title "feat: {enhancement title}" --body "$(cat << 'EOF'
   ## Summary
   {description from enhancement doc}

   ## Changes
   - {list of files modified}

   ## Testing
   - {acceptance criteria from enhancement doc}

   ## Related
   Based on analysis: .planning/research/RPG-ANALYSIS-REPORT.md
   EOF
   )"
   ```

---

## Branch Naming Convention

| Enhancement | Branch Name |
|-------------|-------------|
| 01 | `feature/provides-consumes-frontmatter` |
| 02 | `feature/data-flow-roadmap` |
| 03 | `feature/key-links-enhancement` |
| 04 | `feature/exports-field-guidance` |
| 05 | `feature/feature-map-structure` |
| 06 | `feature/verifier-relationships` |

---

## PR Checklist (For Each Enhancement)

Before submitting PR:

- [ ] Enhancement spec acceptance criteria met
- [ ] No breaking changes to existing templates/agents
- [ ] Examples updated in templates
- [ ] Tested with a sample project (if applicable)
- [ ] CHANGELOG.md updated
- [ ] No unrelated changes included

---

## Quick Reference: GSD Commands

| Command | When to Use |
|---------|-------------|
| `/gsd:quick` | Simple, single-file changes (02, 04) |
| `/gsd:plan-phase` | Multi-step changes requiring planning (01, 03, 05, 06) |
| `/gsd:execute-phase` | Execute a planned phase |
| `/commit` | Create atomic commit after changes |
| `/gsd:verify-work` | Validate changes meet acceptance criteria |

---

## Notes

- Each enhancement should be a separate PR for clean review
- Enhancements 01 and 03 both modify `phase-prompt.md` — consider combining into single PR if done together
- Enhancement 06 should wait until 01 and 03 are merged (depends on provides/consumes and key_links)
- Keep commits atomic and focused on the specific enhancement
