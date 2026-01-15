<purpose>
Orchestrate algorithm documentation generation from existing code.

This is the **Code → Math** direction: analyze implementation code and produce structured algorithm documentation that bridges math and code.

Each algorithm is documented by a dedicated subagent with fresh context, ensuring quality documentation with required diagrams.
</purpose>

<philosophy>
**Why separate command:**
Context exhaustion during map-codebase prevents quality algorithm documentation. Separate command = fresh context = full docs with diagrams.

**User-driven detection:**
Propose candidates, don't dictate. User knows their codebase best and decides:
- Which files contain algorithms
- How to group files into algorithms (1 file = N algorithms, N files = 1 algorithm)
- What to name each algorithm

**Diagram is REQUIRED:**
The diagram is the most important element. Don't skip it. Choose the style that fits:
- Pipeline: A → B → C → D (sequential transformations)
- Architecture: Layered boxes (neural networks, systems)
- Flowchart: Branches and decisions
- Data flow: Show how variables transform through steps

**Parallel subagents:**
N algorithms = N subagents, each with fresh 200k context. Main agent orchestrates, subagents read code and produce docs.
</philosophy>

<process>

<step name="load_context" priority="first">
Load minimal project context:

```bash
# Check for codebase context
cat .planning/codebase/STACK.md 2>/dev/null | head -50
cat .planning/codebase/ARCHITECTURE.md 2>/dev/null | head -50
```

**If context exists:** Note technology stack and architecture patterns for subagent prompts.

**If context missing:** Proceed without - subagents will infer from code.

Check for existing algorithm docs:

```bash
ls .planning/algorithms/*.md 2>/dev/null
```

Store list of existing docs for later conflict resolution.
</step>

<step name="check_arguments">
**If $ARGUMENTS provided:**

User specified files/patterns to analyze. Skip detection, go directly to step "propose_candidates" with user's files as candidates.

**If no arguments:**

Continue to detection step.
</step>

<step name="detect_patterns">
Spawn Explore agent to find algorithm patterns in codebase.

Use Task tool:
```
subagent_type: "Explore"
description: "Detect algorithm patterns in codebase"
```

Prompt:
```
Analyze this codebase for algorithm implementation patterns. Look for:

**State estimation / filtering:**
- Kalman filter variants (EKF, UKF, particle filter)
- Prediction/update cycles
- Covariance matrices

**Optimization:**
- Gradient descent variants
- Loss functions
- Constraint handling
- QP solvers

**Neural networks / ML:**
- Forward/backward passes
- Layer definitions
- Training loops
- Custom loss functions

**Control systems:**
- PID controllers
- Model predictive control
- Trajectory planning

**Signal processing:**
- FFT, filtering, convolution
- Calibration routines

**Numerical methods:**
- Solvers (Newton, bisection)
- Integration schemes
- Interpolation

**Robotics:**
- Kinematics (forward/inverse)
- Dynamics computations
- Coordinate transforms

Search for patterns like:
- Functions with mathematical operations (matrix multiplications, decompositions)
- Files named *_filter, *_controller, *_solver, *_model
- Classes/functions with predict(), update(), forward(), backward(), solve(), optimize()
- Heavy numpy/scipy/torch/tensorflow usage

Output format:
For each detected algorithm candidate:
- File path(s)
- Algorithm type (state estimation, optimization, etc.)
- Key functions/classes
- Confidence (high/medium/low based on pattern clarity)

Group related files that implement the same algorithm together.
```

Wait for agent to complete, collect findings.
</step>

<step name="propose_candidates">
Present detected algorithms to user for confirmation.

**Format candidates as AskUserQuestion:**

```
header: "Algorithms"
question: "Which algorithms should be documented?"
options:
  - label: "[Algorithm 1 name]"
    description: "[files] - [type]"
  - label: "[Algorithm 2 name]"
    description: "[files] - [type]"
  - label: "All detected"
    description: "Document all [N] algorithms found"
  - label: "Specify custom"
    description: "I'll provide my own list"
multiSelect: true
```

**Handle user response:**

- If specific algorithms selected: Use those
- If "All detected": Use all candidates
- If "Specify custom": Ask user for file paths and names
- If user provides modifications: Incorporate their changes

**Allow user to:**
- Rename algorithms
- Merge/split file groupings
- Add files not detected
- Remove false positives
</step>

<step name="handle_existing">
For each confirmed algorithm, check if documentation already exists:

```bash
# For algorithm named "kalman_filter"
ls .planning/algorithms/kalman-filter.md 2>/dev/null
```

**If existing doc found:**

Use AskUserQuestion:
```
header: "Existing Doc"
question: "Algorithm doc already exists for [name]. What should I do?"
options:
  - label: "Update"
    description: "Regenerate from current code (overwrites)"
  - label: "Skip"
    description: "Keep existing doc unchanged"
  - label: "Delete"
    description: "Remove existing doc, don't regenerate"
```

Track decisions for spawn step.
</step>

<step name="create_directory">
Ensure algorithms directory exists:

```bash
mkdir -p .planning/algorithms
```
</step>

<step name="spawn_subagents">
**Spawn N parallel subagents, one per algorithm.**

IMPORTANT: Spawn ALL agents in a SINGLE message with multiple Task tool calls to maximize parallelism.

For each algorithm to document:

Use Task tool:
```
subagent_type: "Explore"
run_in_background: true
description: "Document [algorithm-name] algorithm"
```

Prompt template (fill for each algorithm):
```
Analyze the algorithm implementation and create documentation.

**Files to analyze:**
[list of file paths for this algorithm]

**Technology context:**
[Stack info if available from load_context step]

**Your task:**

1. Read and understand the algorithm implementation in the specified files
2. Identify:
   - Purpose (what problem it solves, where it's used)
   - Inputs (parameters, data, shapes/types)
   - Outputs (return values, effects)
   - Domain conventions (coordinate frames, units, sign conventions)
   - Method (approach, technique, key equations)
   - Step-by-step breakdown
   - How spec maps to code (functions, files, constants)

3. Create documentation following this EXACT structure:

```markdown
---
owns:
  - [file-path-1]
  - [file-path-2]
---

# [Algorithm Name]

## Purpose

[What this solves. Where it fits in the system.]

## I/O

**Inputs:**
- `name` (type/shape): description [units/frame if applicable]

**Outputs:**
- `name` (type/shape): description [units/frame if applicable]

## Conventions

[Domain-specific conventions that affect correctness]

## Diagram

[REQUIRED. Create a visual representation.

Choose the best style:
- Pipeline: A → B → C (for sequential)
- Architecture: Layered boxes (for neural nets)
- Flowchart: Branches (for conditional logic)
- Data flow: Variables transforming through steps

Use ASCII art that renders well in markdown.]

## Method

[High-level description of the approach]

### Step 1: [Name]

[Describe step with equations/operations as needed]

### Step 2: [Name]

[Continue for each major step]

## Implementation

[How the spec maps to code:
- File structure
- Function → Step mapping
- Key constants]

## Notes

[Invariants, edge cases, validation approaches, limitations]
```

**CRITICAL:** The Diagram section is REQUIRED. Do not skip it. Create an ASCII diagram showing the algorithm flow.

**Output:** Return ONLY the markdown content for the algorithm doc. No explanation or preamble.
```

After spawning all agents, continue to collect_results.
</step>

<step name="collect_results">
Wait for all subagents to complete.

Use TaskOutput tool to collect results from each background agent.

**For each agent result:**

1. Parse the returned markdown content
2. Extract algorithm name from the `# [Algorithm Name]` header
3. Convert name to kebab-case for filename (e.g., "Extended Kalman Filter" → "extended-kalman-filter.md")
4. Write to `.planning/algorithms/[name].md`

```bash
# Example for each algorithm
cat > .planning/algorithms/extended-kalman-filter.md << 'EOF'
[markdown content from agent]
EOF
```

**Validation:**
- Confirm ## Diagram section exists (REQUIRED)
- Confirm owns: frontmatter has file paths
- Confirm ## Method has at least one ### Step

**If validation fails:**
Log which algorithm needs manual attention.
</step>

<step name="commit_documentation">
Commit all algorithm documentation:

```bash
git add .planning/algorithms/*.md
git commit -m "$(cat <<'EOF'
docs: document algorithms (Code → Math)

Documented algorithm patterns:
[list algorithm names]

Created by /gsd:map-algorithms with parallel subagents.

Each algorithm doc includes:
- Purpose and I/O specification
- Diagram (required)
- Step-by-step method breakdown
- Implementation mapping
EOF
)"
```
</step>

<step name="offer_next">
Present completion summary and next steps:

```
Algorithm documentation complete.

Created .planning/algorithms/:
[list files with line counts]

---

## Bidirectional Sync

Your algorithms are now documented (Code → Math).

**When code changes:** `/gsd:execute-plan` will flag affected algorithm docs in SUMMARY.md "Algorithm Sync" section.

**When math changes:** Edit the algorithm doc, then `/gsd:plan-phase` will auto-load it when planning touches owned files.

---

## ▶ Next Up

**Continue project work**

`/gsd:progress`

<sub>`/clear` first → fresh context window</sub>

---

**Also available:**
- Edit algorithm docs directly: `code .planning/algorithms/[name].md`
- Re-run for specific files: `/gsd:map-algorithms src/filters/*.py`
- Review what was created: `ls -la .planning/algorithms/`

---
```

End workflow.
</step>

</process>

<success_criteria>
- .planning/algorithms/ directory exists
- User confirmed algorithm candidates via AskUserQuestion
- N subagents spawned in parallel (one per algorithm)
- All algorithm docs have REQUIRED Diagram section
- All algorithm docs have owns: frontmatter
- Documentation committed to git
- User knows about bidirectional sync
</success_criteria>
