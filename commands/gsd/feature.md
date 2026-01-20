---
name: gsd:feature
description: Thorough feature development with GSD guarantees (exploration, architecture, atomic commits, state tracking)
argument-hint: "<feature description>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - AskUserQuestion
  - LSP
---

<lsp_priority>
## Code Navigation: LSP First

**Use LSP as primary tool for code navigation:**

| Task | Primary (LSP) | Fallback (Grep/Glob) |
|------|---------------|----------------------|
| Find definition | `goToDefinition` | Grep for pattern |
| Find all usages | `findReferences` | Grep for symbol name |
| List symbols in file | `documentSymbol` | Grep for patterns |
| Find implementations | `goToImplementation` | Grep for class/interface |
| Call hierarchy | `incomingCalls`/`outgoingCalls` | Manual trace |
| Type info | `hover` | Read file manually |

**When to fallback to Grep/Glob:**
- LSP returns error or no results
- Pattern/text search (not semantic)
- File discovery by name/extension
- Multi-file text replacement
</lsp_priority>

<objective>
Thorough feature development combining feature-dev's exploration workflow with GSD's execution guarantees.

This command provides:
- **Deep exploration**: 2 gsd-code-explorer agents analyze the codebase
- **Clarifying questions**: Dedicated phase to gather requirements
- **Architecture design**: 2 gsd-code-architect agents propose approaches, you choose
- **GSD execution**: Atomic commits, STATE.md tracking, artifact organization
- **Quality review**: 2 gsd-code-reviewer agents check the result

Use when: You want thorough feature development with exploration and architecture phases.
For quick tasks where you already know what to do, use `/gsd:quick` instead.
</objective>

<execution_context>
Orchestration is inline. Features live in `.planning/features/NNN-slug/` with 6 artifacts:
- NNN-EXPLORATION.md — codebase analysis findings
- NNN-CLARIFICATIONS.md — user answers to clarifying questions
- NNN-ARCHITECTURE.md — chosen approach with trade-offs
- NNN-PLAN.md — execution plan with tasks
- NNN-SUMMARY.md — what was built
- NNN-REVIEW.md — quality review findings
</execution_context>

<context>
@.planning/STATE.md
</context>

<process>
**Step 0: Resolve Model Profile**

Read model profile for agent spawning:

```bash
MODEL_PROFILE=$(cat .planning/config.json 2>/dev/null | grep -o '"model_profile"[[:space:]]*:[[:space:]]*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"' || echo "balanced")
```

Default to "balanced" if not set.

**Model lookup table:**

| Agent | quality | balanced | budget |
|-------|---------|----------|--------|
| gsd-code-explorer | opus | sonnet | haiku |
| gsd-code-architect | opus | sonnet | sonnet |
| gsd-code-reviewer | opus | sonnet | haiku |
| gsd-planner | opus | opus | sonnet |
| gsd-executor | opus | sonnet | sonnet |

Store resolved models for use in Task calls below.

---

**Step 1: Pre-flight validation**

Check for existing planning infrastructure:

```bash
if [ -f .planning/ROADMAP.md ]; then
  # Full GSD project - use as context
  project_mode="full"
elif [ -d .planning ]; then
  # Partial setup - continue
  project_mode="partial"
else
  # No project - create minimal .planning/
  mkdir -p .planning
  project_mode="standalone"
fi
```

**Key difference from /gsd:quick**: Works without ROADMAP.md (standalone mode).

Report mode:
```
Project mode: ${project_mode}
```

---

**Step 2: Get feature description**

Check if description was passed as argument. If not, prompt user:

```
AskUserQuestion(
  header: "Feature",
  question: "What feature do you want to build?",
  followUp: null
)
```

Store response as `$DESCRIPTION`.

If empty, re-prompt: "Please provide a feature description."

Generate slug from description:
```bash
slug=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//' | cut -c1-40)
```

---

**Step 3: Create feature directory**

Ensure `.planning/features/` directory exists and find the next sequential number:

```bash
mkdir -p .planning/features

last=$(ls -1d .planning/features/[0-9][0-9][0-9]-* 2>/dev/null | sort -r | head -1 | xargs -I{} basename {} | grep -oE '^[0-9]+')

if [ -z "$last" ]; then
  next_num="001"
else
  next_num=$(printf "%03d" $((10#$last + 1)))
fi

FEATURE_DIR=".planning/features/${next_num}-${slug}"
mkdir -p "$FEATURE_DIR"
```

Report to user:
```
Creating feature ${next_num}: ${DESCRIPTION}
Directory: ${FEATURE_DIR}
```

---

**Step 4: Explore (2 parallel agents)**

**Read project context first, then inline to prompts:**

```bash
STATE_CONTENT=$(cat .planning/STATE.md 2>/dev/null || echo "No STATE.md")
CONVENTIONS=$(cat .planning/codebase/CONVENTIONS.md 2>/dev/null || echo "")
STRUCTURE=$(cat .planning/codebase/STRUCTURE.md 2>/dev/null || echo "")
```

**Spawn 2 code-explorer agents in parallel (single message, multiple Task calls):**

```
Task(
  subagent_type="gsd-code-explorer",
  model="{explorer_model}",
  prompt="<objective>
Explore how similar features are implemented in this codebase.
Feature: ${DESCRIPTION}
</objective>

<focus>
- Find similar existing features
- Trace their implementation patterns
- Identify reusable components
- Note file locations and conventions
</focus>

<project_context>
${STATE_CONTENT}
</project_context>

<conventions>
${CONVENTIONS}
</conventions>

<structure>
${STRUCTURE}
</structure>

Return:
1. Similar features found (with file paths)
2. Reusable patterns identified
3. Key files to examine
4. Potential integration points",
  description="Explore: similar features"
)

Task(
  subagent_type="gsd-code-explorer",
  model="{explorer_model}",
  prompt="<objective>
Explore architecture patterns relevant to: ${DESCRIPTION}
</objective>

<focus>
- Data flow patterns
- Component boundaries
- State management approach
- Error handling patterns
- Testing patterns
</focus>

<project_context>
${STATE_CONTENT}
</project_context>

<conventions>
${CONVENTIONS}
</conventions>

<structure>
${STRUCTURE}
</structure>

Return:
1. Architecture patterns used
2. Data flow from user action to storage
3. State management approach
4. Key abstractions and where they live
5. Testing patterns in use",
  description="Explore: architecture"
)
```

**After both agents return:**

1. Synthesize findings into `${FEATURE_DIR}/${next_num}-EXPLORATION.md`:

```markdown
# Feature ${next_num}: Exploration

**Feature:** ${DESCRIPTION}
**Date:** $(date +%Y-%m-%d)

## Similar Features

[Synthesized from first explorer]

## Architecture Patterns

[Synthesized from second explorer]

## Key Files to Examine

[Combined list from both explorers]

## Integration Points

[Where this feature will connect]
```

2. Read up to 10 key files identified by agents for context
3. Commit: `docs(feature-${next_num}): exploration`

---

**Step 5: Clarify**

Based on exploration findings, identify gaps and ask clarifying questions.

Analyze exploration to find:
- Edge cases undefined
- Error handling approach unclear
- Integration points needing decisions
- Scope boundaries fuzzy
- User experience preferences

Use AskUserQuestion with 1-4 questions:

```
AskUserQuestion(
  questions: [
    {
      header: "[Topic 1]",
      question: "[Clarifying question about ambiguity found in exploration]",
      options: [
        { label: "Option A", description: "..." },
        { label: "Option B", description: "..." }
      ],
      multiSelect: false
    },
    // ... up to 4 questions
  ]
)
```

**GATE: Wait for user answers.**

Save answers to `${FEATURE_DIR}/${next_num}-CLARIFICATIONS.md`:

```markdown
# Feature ${next_num}: Clarifications

**Feature:** ${DESCRIPTION}
**Date:** $(date +%Y-%m-%d)

## Questions & Answers

### [Topic 1]
**Q:** [Question asked]
**A:** [User's answer]

### [Topic 2]
**Q:** [Question asked]
**A:** [User's answer]

## Implications

[How these answers affect the approach]
```

Commit: `docs(feature-${next_num}): clarifications`

---

**Step 6: Architect (2 parallel agents)**

**Read all accumulated context:**

```bash
EXPLORATION=$(cat "${FEATURE_DIR}/${next_num}-EXPLORATION.md")
CLARIFICATIONS=$(cat "${FEATURE_DIR}/${next_num}-CLARIFICATIONS.md")
```

**Spawn 2 code-architect agents in parallel with different focuses:**

```
Task(
  subagent_type="gsd-code-architect",
  model="{architect_model}",
  prompt="<objective>
Design architecture for: ${DESCRIPTION}
Focus: MINIMAL CHANGES - smallest change, maximum reuse of existing code
</objective>

<exploration_findings>
${EXPLORATION}
</exploration_findings>

<user_clarifications>
${CLARIFICATIONS}
</user_clarifications>

Return:
1. Approach summary (2-3 sentences)
2. Files to create (with purpose)
3. Files to modify (with change description)
4. Components to reuse
5. Pros: Why this is the right approach
6. Cons: Trade-offs and limitations",
  description="Architect: minimal"
)

Task(
  subagent_type="gsd-code-architect",
  model="{architect_model}",
  prompt="<objective>
Design architecture for: ${DESCRIPTION}
Focus: CLEAN ARCHITECTURE - maintainability, proper abstractions, future-proof
</objective>

<exploration_findings>
${EXPLORATION}
</exploration_findings>

<user_clarifications>
${CLARIFICATIONS}
</user_clarifications>

Return:
1. Approach summary (2-3 sentences)
2. Files to create (with purpose)
3. Files to modify (with change description)
4. New abstractions introduced
5. Pros: Why this is the right approach
6. Cons: Trade-offs and limitations",
  description="Architect: clean"
)
```

**After both agents return:**

Present both approaches to user:

```
## Architecture Options

### Option A: Minimal Changes
[Summary from first architect]

**Pros:** [pros]
**Cons:** [cons]

### Option B: Clean Architecture
[Summary from second architect]

**Pros:** [pros]
**Cons:** [cons]
```

**GATE: User picks approach:**

```
AskUserQuestion(
  questions: [{
    header: "Approach",
    question: "Which architecture approach do you prefer?",
    options: [
      { label: "Minimal Changes", description: "Fewer files touched, faster to implement" },
      { label: "Clean Architecture", description: "Better abstractions, more maintainable" },
      { label: "Hybrid", description: "I'll specify a mix of both approaches" }
    ],
    multiSelect: false
  }]
)
```

Save chosen approach to `${FEATURE_DIR}/${next_num}-ARCHITECTURE.md`:

```markdown
# Feature ${next_num}: Architecture

**Feature:** ${DESCRIPTION}
**Date:** $(date +%Y-%m-%d)
**Chosen Approach:** [Minimal/Clean/Hybrid]

## Summary

[Chosen approach summary]

## Files to Create

| File | Purpose |
|------|---------|
| ... | ... |

## Files to Modify

| File | Changes |
|------|---------|
| ... | ... |

## Trade-offs Accepted

[Why this approach was chosen and what trade-offs were accepted]
```

Commit: `docs(feature-${next_num}): architecture`

---

**Step 7: Plan**

**Read all context, inline to planner:**

```bash
EXPLORATION=$(cat "${FEATURE_DIR}/${next_num}-EXPLORATION.md")
CLARIFICATIONS=$(cat "${FEATURE_DIR}/${next_num}-CLARIFICATIONS.md")
ARCHITECTURE=$(cat "${FEATURE_DIR}/${next_num}-ARCHITECTURE.md")
```

Spawn gsd-planner:

```
Task(
  subagent_type="gsd-planner",
  model="{planner_model}",
  prompt="<objective>
Create execution plan for feature: ${DESCRIPTION}
Mode: feature (atomic commits, single plan)
Output: ${FEATURE_DIR}/${next_num}-PLAN.md
</objective>

<architecture>
${ARCHITECTURE}
</architecture>

<exploration>
${EXPLORATION}
</exploration>

<clarifications>
${CLARIFICATIONS}
</clarifications>

<constraints>
- Create a SINGLE plan with focused tasks
- Each task should be atomically committable
- Target ~50% context usage (quality zone)
- Include verification criteria for each task
- Include done criteria for each task
</constraints>

Write the plan to: ${FEATURE_DIR}/${next_num}-PLAN.md

Return: ## PLANNING COMPLETE with plan path",
  description="Plan: ${DESCRIPTION}"
)
```

After planner returns:
1. Verify plan exists at `${FEATURE_DIR}/${next_num}-PLAN.md`
2. Report: "Plan created with N tasks"

If plan not found, error: "Planner failed to create plan"

---

**Step 8: Execute**

**Read plan, inline to executor:**

```bash
PLAN=$(cat "${FEATURE_DIR}/${next_num}-PLAN.md")
```

Spawn gsd-executor:

```
Task(
  subagent_type="gsd-executor",
  model="{executor_model}",
  prompt="<objective>
Execute feature plan.
Output summary to: ${FEATURE_DIR}/${next_num}-SUMMARY.md
</objective>

<plan>
${PLAN}
</plan>

<constraints>
- Commit each task atomically
- Follow conventional commit format: feat(feature-${next_num}): description
- Create SUMMARY.md with what was built
- Track all files created and modified
- Note any deviations from plan
</constraints>

Return: ## EXECUTION COMPLETE with:
- Tasks completed (N/N)
- Commit hashes
- Files created/modified
- Any deviations",
  description="Execute: ${DESCRIPTION}"
)
```

After executor returns:
1. Verify summary exists at `${FEATURE_DIR}/${next_num}-SUMMARY.md`
2. Capture commit hashes for STATE.md update
3. Report execution status

---

**Step 9: Review (2 parallel agents)**

**Get recent changes for review:**

```bash
# Get commits since feature started (look for feature-NNN commits)
RECENT_COMMITS=$(git log --oneline --grep="feature-${next_num}" | head -20)
RECENT_DIFF=$(git diff HEAD~10 --stat 2>/dev/null || echo "")
```

**Spawn 2 code-reviewer agents in parallel:**

```
Task(
  subagent_type="gsd-code-reviewer",
  model="{reviewer_model}",
  prompt="<objective>
Review recent changes for: ${DESCRIPTION}
Focus: Simplicity, DRY principles, code elegance
</objective>

<recent_commits>
${RECENT_COMMITS}
</recent_commits>

<files_changed>
${RECENT_DIFF}
</files_changed>

Return findings with confidence scores (only report if confidence >= 80):
1. Simplicity issues (unnecessary complexity)
2. DRY violations (duplicated logic)
3. Code elegance concerns (hard to read/maintain)
4. Suggested improvements (optional, not blocking)",
  description="Review: simplicity"
)

Task(
  subagent_type="gsd-code-reviewer",
  model="{reviewer_model}",
  prompt="<objective>
Review recent changes for: ${DESCRIPTION}
Focus: Bugs, functional correctness, security vulnerabilities
</objective>

<recent_commits>
${RECENT_COMMITS}
</recent_commits>

<files_changed>
${RECENT_DIFF}
</files_changed>

Return findings with confidence scores (only report if confidence >= 80):
1. Potential bugs (logic errors, edge cases)
2. Functional correctness issues (doesn't match requirements)
3. Security vulnerabilities (OWASP Top 10)
4. Missing error handling",
  description="Review: correctness"
)
```

**After both agents return:**

Consolidate findings by severity (only confidence >= 80):

```
## Review Findings

### Critical (must fix)
- [Any security issues or bugs]

### Important (should fix)
- [Code quality issues]

### Suggestions (nice to have)
- [Optional improvements]
```

**GATE: User decides how to proceed:**

```
AskUserQuestion(
  questions: [{
    header: "Review",
    question: "How would you like to handle the review findings?",
    options: [
      { label: "Fix Now", description: "Address critical/important issues before completing" },
      { label: "Fix Later", description: "Log issues to TODO, complete feature now" },
      { label: "Proceed", description: "Accept as-is, no changes needed" }
    ],
    multiSelect: false
  }]
)
```

**If "Fix Now":**
- Orchestrator fixes issues inline (no agent spawn for speed)
- Create additional commits: `fix(feature-${next_num}): address review feedback`
- Re-run quick verification

**If "Fix Later":**
- Create TODO entries for each issue in `.planning/todos/pending/`
- Note in review document

Save to `${FEATURE_DIR}/${next_num}-REVIEW.md`:

```markdown
# Feature ${next_num}: Review

**Feature:** ${DESCRIPTION}
**Date:** $(date +%Y-%m-%d)
**Decision:** [Fix Now/Fix Later/Proceed]

## Findings

### Critical
[Issues or "None"]

### Important
[Issues or "None"]

### Suggestions
[Issues or "None"]

## Resolution

[What was done - fixes applied / TODOs created / accepted as-is]
```

Commit: `docs(feature-${next_num}): review`

---

**Step 10: Finalize**

**10a. Update STATE.md**

Check if "Features Completed" section exists. If not, create it after "Quick Tasks Completed" or "Blockers/Concerns":

```markdown
### Features Completed

| # | Description | Date | Commits | Directory |
|---|-------------|------|---------|-----------|
```

Append new row:

```markdown
| ${next_num} | ${DESCRIPTION} | $(date +%Y-%m-%d) | ${commit_hashes} | [${next_num}-${slug}](./features/${next_num}-${slug}/) |
```

Update "Last activity" line:
```
Last activity: $(date +%Y-%m-%d) - Completed feature ${next_num}: ${DESCRIPTION}
```

**10b. Final commit**

Stage and commit feature artifacts:

```bash
git add ${FEATURE_DIR}/*.md
git add .planning/STATE.md

git commit -m "$(cat <<'EOF'
docs(feature-${next_num}): complete ${DESCRIPTION}

Feature completed with full exploration-architecture-review workflow.

Artifacts:
- EXPLORATION.md
- CLARIFICATIONS.md
- ARCHITECTURE.md
- PLAN.md
- SUMMARY.md
- REVIEW.md

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**10c. Display completion output:**

```
---

GSD > FEATURE COMPLETE

Feature ${next_num}: ${DESCRIPTION}

📂 ${FEATURE_DIR}/
├── ${next_num}-EXPLORATION.md
├── ${next_num}-CLARIFICATIONS.md
├── ${next_num}-ARCHITECTURE.md
├── ${next_num}-PLAN.md
├── ${next_num}-SUMMARY.md
└── ${next_num}-REVIEW.md

Commits: ${commit_hashes}

---

Ready for next feature: /gsd:feature
```

</process>

<flags>
**Optional flags:**

| Flag | Effect |
|------|--------|
| `--skip-explore` | Skip exploration phase (you already know the codebase) |
| `--skip-review` | Skip quality review phase (for speed) |
| `--quick` | Skip explore + architect + review (essentially /gsd:quick in features/) |

Parse flags from arguments before Step 1.

**If --skip-explore:** Skip Step 4, proceed directly to Step 5 (clarify)
**If --skip-review:** Skip Step 9, proceed directly to Step 10 (finalize)
**If --quick:** Skip Steps 4, 6, and 9 (explore, architect, review)
</flags>

<success_criteria>
- [ ] Feature description obtained (from arg or prompt)
- [ ] Slug generated (lowercase, hyphens, max 40 chars)
- [ ] Next number calculated (001, 002, 003...)
- [ ] Directory created at `.planning/features/NNN-slug/`
- [ ] `NNN-EXPLORATION.md` created by explorers (unless --skip-explore)
- [ ] `NNN-CLARIFICATIONS.md` created with user answers
- [ ] `NNN-ARCHITECTURE.md` created with chosen approach (unless --quick)
- [ ] `NNN-PLAN.md` created by planner
- [ ] `NNN-SUMMARY.md` created by executor
- [ ] `NNN-REVIEW.md` created by reviewers (unless --skip-review)
- [ ] STATE.md updated with feature row
- [ ] All artifacts committed
</success_criteria>
