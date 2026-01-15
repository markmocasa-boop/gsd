---
name: gsd:map-algorithms
description: Generate algorithm documentation from existing code (Code → Math direction)
argument-hint: "[optional: specific files or patterns to analyze, e.g., 'src/filters/*.py']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Generate algorithm documentation from existing code implementations.

This is the **Code → Math** direction of bidirectional algorithm documentation:
- `/gsd:map-algorithms` — Code → Math (generate/update docs from code)
- `/gsd:plan-phase` — Math → Code (generate code from spec, auto-loads algorithm docs)

Output: `.planning/algorithms/*.md` files following the algorithm template.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/map-algorithms.md
@~/.claude/get-shit-done/templates/algorithm.md
</execution_context>

<context>
Focus area: $ARGUMENTS (optional - specific files/patterns to analyze)

**Load minimal context:**
- Check for .planning/codebase/STACK.md (technology context)
- Check for .planning/codebase/ARCHITECTURE.md (structure context)

**When to use:**
- After implementing algorithms and wanting documentation
- Onboarding to algorithm-heavy codebase
- Before major refactoring to preserve understanding
- Anytime math/code drift is suspected
</context>

<when_to_use>
**Use map-algorithms for:**
- Robotics projects (state estimation, control, calibration, kinematics)
- ML/DL projects (architectures, training loops, loss functions)
- Scientific computing (solvers, simulations, numerical methods)
- Graphics projects (rendering pipelines, shaders, coordinate transforms)
- Any code with non-trivial mathematical foundations

**Skip map-algorithms for:**
- CRUD applications (no algorithms to document)
- Simple utilities (logic is self-explanatory)
- Projects where code IS the documentation
</when_to_use>

<process>
1. Load minimal context (STACK.md + ARCHITECTURE.md if exist)
2. Spawn Explore agent to detect algorithm patterns in codebase
3. Propose algorithm candidates to user via AskUserQuestion
   - User confirms, modifies, or specifies own list
   - One file can be N algorithms, N files can be 1 algorithm
4. Handle existing docs (ask: skip/update/delete)
5. Spawn N parallel subagents (one per algorithm)
   - Each reads relevant code files
   - Each produces .planning/algorithms/<name>.md
   - Uses template structure (Purpose → I/O → Diagram → Steps → Implementation → Notes)
6. Commit algorithm documentation
7. Offer next steps
</process>

<success_criteria>
- [ ] .planning/algorithms/ directory created
- [ ] User confirmed algorithm candidates
- [ ] Algorithm docs follow template structure
- [ ] Diagram is present in each doc (REQUIRED)
- [ ] owns: frontmatter links to implementation files
- [ ] Parallel subagents completed without errors
- [ ] User knows next steps
</success_criteria>
