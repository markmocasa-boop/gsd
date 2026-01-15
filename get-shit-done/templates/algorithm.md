# Algorithm Template

Template for `.planning/algorithms/<name>.md` — living documents that keep algorithm specifications and implementations in sync.

---

## When to Use

Projects with computational logic requiring precise implementation:
- **Robotics:** State estimation, control, calibration, kinematics
- **ML/DL:** Architectures, training loops, loss functions
- **Scientific:** Solvers, simulations, numerical methods
- **Graphics:** Rendering pipelines, shaders, coordinate transforms

## Workflows

| Workflow | When | Focus |
|----------|------|-------|
| **Greenfield** | Spec exists before code | Fill Steps with Pseudocode for code generation |
| **Brownfield** | Code exists, needs documentation | Fill Steps with `[!implementation]` callouts linking to code |

## File Template

```markdown
---
owns:
  - path/to/impl.py
  - path/to/impl.cpp
---

# [Algorithm Name]

## Problem

[What this computes. Where it fits in the system.]

## I/O

**Inputs:**
- `name` (type/shape): description [units/frame/space]

**Outputs:**
- `name` (type/shape): description [units/frame/space]

## Conventions

[Domain-specific conventions affecting implementation correctness:
frames, coordinate systems, sign conventions, tensor layouts, etc.]

## Pipeline

[Flow diagram showing step sequence and data dependencies]

## Steps

### Step N: [Name] → `output_var`

**Goal:** [One sentence: what this step produces]

**Method:**
[Core operation - equation, layer spec, transform, or update rule]

**Variables:**
- `name` (type/shape): what it represents

**Pseudocode:** (Greenfield - for code generation)
```
[Language-agnostic implementation steps]
```

> [!implementation] `function_name()` (Brownfield - links to existing code)
> **File:** `path/to/file`
> **Inputs:** `var1`, `var2`
> **Output:** `result` → $symbol$

---

[Repeat for each step...]

## Implementation Mapping

| Step | Function | File | Responsibility |
|------|----------|------|----------------|

**Integration point:** `[file where algorithm is called]`

## Invariants

[Properties that must remain true after refactors]

## Validation

[How to verify correctness: tests, tolerances, visual checks]

## Defaults

| Parameter | Value | Rationale |
|-----------|-------|-----------|
```

<frontmatter_guidance>
**owns:** Implementation files this algorithm covers.
- `/gsd:plan-phase` auto-loads algorithm docs when planning touches owned files
- `/gsd:execute-plan` flags sync warnings when owned files are modified
- Supports glob patterns: `src/filters/*.py`
</frontmatter_guidance>

<step_structure>
Each step should enable either code generation OR code documentation:

1. **Goal** - What the step computes (always)
2. **Method** - Core operation: equation, layer, transform, rule (always)
3. **Variables** - Intermediates with types/shapes (always)
4. **Pseudocode** - Language-agnostic implementation (Greenfield)
5. **[!implementation]** - Links to existing code (Brownfield)

Use Pseudocode when writing spec before code.
Use [!implementation] when documenting existing code.
Use both during iterative development.
</step_structure>

<domain_adaptation>
The Method field adapts to domain:

| Domain | Method Style | Conventions Focus |
|--------|--------------|-------------------|
| **Robotics** | Equations, matrix operations | Coordinate frames, units, rotation conventions |
| **ML/DL** | Layer spec, dimensions, activations | Tensor layouts (NCHW/NHWC), batch dimension |
| **Graphics** | Transform matrices, shader ops | Coordinate spaces, handedness, depth range |
| **Scientific** | Update rules, discretization | Time step, boundary conditions, convergence |
</domain_adaptation>

<guidelines>
**Greenfield workflow:**
1. Write Problem, I/O, Conventions first
2. Define Pipeline showing data flow
3. Fill Steps with Method + Pseudocode
4. Generate code from spec
5. Add [!implementation] callouts after code exists
6. Fill Implementation Mapping table

**Brownfield workflow:**
1. Create stub with Problem, I/O from code analysis
2. Fill Steps with Method + [!implementation] callouts
3. Fill Implementation Mapping table
4. Add Pseudocode later if regeneration needed

**Code generation readiness:**
A step is ready for code generation when:
- All inputs defined (from I/O or previous steps)
- Method is concrete (not placeholder)
- Variables have types/shapes
- Pseudocode specifies operations and solvers

**Keeping in sync:**
`/gsd:execute-plan` flags Algorithm Sync in SUMMARY.md when owned files change.
User decides whether spec needs updating.
</guidelines>
