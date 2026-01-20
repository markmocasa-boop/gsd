---
name: gsd:analyze-codebase
description: Scan existing codebase and populate .planning/intel/ with file index, conventions, and semantic entity files
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - Glob
  - Write
  - Task
---

<objective>
Scan codebase to populate .planning/intel/ with file index, conventions, and semantic entity files.

Works standalone (without /gsd:new-project) for brownfield codebases. Creates summary.md for context injection at session start. Generates entity files that capture file PURPOSE (what it does, why it exists), not just syntax.

Output: .planning/intel/index.json, conventions.json, summary.md, entities/*.md
</objective>

<context>
This command performs bulk codebase scanning to bootstrap the Codebase Intelligence system.

**Use for:**
- Brownfield projects before /gsd:new-project
- Refreshing intel after major changes
- Standalone intel without full project setup

After initial scan, the PostToolUse hook (hooks/intel-index.js) maintains incremental updates.

**Execution model (Step 9 - Entity Generation):**
- Orchestrator selects files for entity generation (up to 50 based on priority)
- Spawns `gsd-entity-generator` subagent with file list (paths only, not contents)
- Subagent reads files in fresh 200k context, generates entities, writes to disk
- PostToolUse hook automatically syncs entities to graph.db
- Subagent returns statistics only (not entity contents)
- This preserves orchestrator context for large codebases (500+ files)
- Users can skip Step 9 if they only want the index (faster)
</context>

<process>

## Step 1: Create directory structure

```bash
mkdir -p .planning/intel
```

## Step 2: Find all indexable files

Use Glob tool with patterns for both JavaScript/TypeScript and Python:
- JavaScript/TypeScript: `**/*.{js,ts,jsx,tsx,mjs,cjs}`
- Python: `**/*.{py,pyx}`

Exclude directories (skip any path containing):
- node_modules
- dist
- build
- .git
- vendor
- coverage
- .next
- __pycache__
- .venv
- venv
- env
- .eggs
- *.egg-info
- .tox
- .pytest_cache
- .mypy_cache
- site-packages

Filter results to remove excluded paths before processing.

## Step 3: Process each file

Initialize the index structure:
```javascript
{
  version: 1,
  updated: Date.now(),
  files: {}
}
```

For each file found:

1. Read file content using Read tool

2. Extract exports using these patterns:

   **JavaScript/TypeScript (.js, .ts, .jsx, .tsx, .mjs, .cjs):**
   - Named exports: `export\s*\{([^}]+)\}`
   - Declaration exports: `export\s+(?:const|let|var|function\*?|async\s+function|class)\s+(\w+)`
   - Default exports: `export\s+default\s+(?:function\s*\*?\s*|class\s+)?(\w+)?`
   - CommonJS object: `module\.exports\s*=\s*\{([^}]+)\}`
   - CommonJS single: `module\.exports\s*=\s*(\w+)\s*[;\n]`
   - TypeScript: `export\s+(?:type|interface)\s+(\w+)`

   **Python (.py, .pyx):**
   - Explicit __all__: `__all__\s*=\s*\[([^\]]+)\]` - extract quoted strings from list
   - Top-level functions: `^def\s+(\w+)\s*\(` (must start at column 0, exclude _private)
   - Top-level async functions: `^async\s+def\s+(\w+)\s*\(`
   - Top-level classes: `^class\s+(\w+)[\s:(]`
   - Module constants: `^([A-Z][A-Z0-9_]*)\s*=` (SCREAMING_SNAKE at column 0)

   For Python, if `__all__` is defined, use only those exports. Otherwise, include all public top-level definitions (names not starting with `_`).

3. Extract imports using these patterns:

   **JavaScript/TypeScript:**
   - ES6: `import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]`
   - Side-effect: `import\s+['"]([^'"]+)['"]` (not preceded by 'from')
   - CommonJS: `require\s*\(\s*['"]([^'"]+)['"]\s*\)`

   **Python:**
   - Module import: `^import\s+([\w.]+)` - captures `import os`, `import foo.bar`
   - From import: `^from\s+([\w.]+)\s+import` - captures `from os import path`
   - Relative import: `^from\s+(\.+[\w.]*)\s+import` - captures `from . import`, `from ..utils import`

   For Python relative imports (starting with `.`), resolve to absolute path based on current file location.

4. Store in index:
   ```javascript
   index.files[absolutePath] = {
     exports: [],  // Array of export names
     imports: [],  // Array of import sources
     indexed: Date.now()
   }
   ```

## Step 4: Detect conventions

Analyze the collected index for patterns.

**Naming conventions** (require 5+ exports, 70%+ match rate):
- camelCase: `^[a-z][a-z0-9]*(?:[A-Z][a-z0-9]+)+$` or single lowercase `^[a-z][a-z0-9]*$`
- PascalCase: `^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$` or single `^[A-Z][a-z0-9]+$`
- snake_case: `^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$`
- SCREAMING_SNAKE: `^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$` or single `^[A-Z][A-Z0-9]*$`
- Skip 'default' when counting (it's a keyword, not naming convention)

**Python-specific conventions (PEP 8):**
- Functions/methods: snake_case expected
- Classes: PascalCase expected
- Constants: SCREAMING_SNAKE expected
- Analyze separately by type (functions vs classes vs constants) for Python files

**Directory patterns** (use lookup table):
```
# JavaScript/TypeScript
components -> UI components
hooks -> React/custom hooks
utils, lib -> Utility functions
services -> Service layer
api, routes -> API endpoints
types -> TypeScript types
models -> Data models
tests, __tests__, test, spec -> Test files
controllers -> Controllers
middleware -> Middleware
config -> Configuration
constants -> Constants
pages -> Page components
views -> View templates

# Python
views -> Views (Django/Flask)
serializers -> Serializers (DRF)
forms -> Forms (Django)
tasks -> Async tasks (Celery)
migrations -> Database migrations
fixtures -> Test fixtures
management -> Management commands (Django)
templatetags -> Template tags (Django)
schemas -> Pydantic/marshmallow schemas
routers -> API routers (FastAPI)
crud -> CRUD operations
core -> Core/shared modules
db -> Database layer
```

**Suffix patterns** (require 5+ occurrences):
```
# JavaScript/TypeScript
.test.*, .spec.* -> Test files
.service.* -> Service layer
.controller.* -> Controllers
.model.* -> Data models
.util.*, .utils.* -> Utility functions
.helper.*, .helpers.* -> Helper functions
.config.* -> Configuration
.types.*, .type.* -> TypeScript types
.hook.*, .hooks.* -> React/custom hooks
.context.* -> React context
.store.* -> State store
.slice.* -> Redux slice
.reducer.* -> Redux reducer
.action.*, .actions.* -> Redux actions
.api.* -> API layer
.route.*, .routes.* -> Route definitions
.middleware.* -> Middleware
.schema.* -> Schema definitions
.mock.*, .mocks.* -> Mock data
.fixture.*, .fixtures.* -> Test fixtures

# Python
_test.py, test_*.py -> Test files
_models.py, models.py -> Data models
_views.py, views.py -> Views
_serializers.py, serializers.py -> Serializers (DRF)
_forms.py, forms.py -> Forms
_tasks.py, tasks.py -> Async tasks (Celery)
_admin.py, admin.py -> Admin config
_urls.py, urls.py -> URL routing
_schemas.py, schemas.py -> Schema definitions
_crud.py, crud.py -> CRUD operations
_deps.py, deps.py, dependencies.py -> Dependency injection
_routers.py, routers.py -> API routers
conftest.py -> Pytest fixtures
__init__.py -> Package init
```

## Step 5: Write index.json

Write to `.planning/intel/index.json`:
```javascript
{
  "version": 1,
  "updated": 1737360330000,
  "files": {
    "/absolute/path/to/file.js": {
      "exports": ["functionA", "ClassB"],
      "imports": ["react", "./utils"],
      "indexed": 1737360330000
    },
    "/absolute/path/to/module.py": {
      "exports": ["process_data", "DataHandler", "DEFAULT_TIMEOUT"],
      "imports": ["os", "typing", "app.services.auth"],
      "indexed": 1737360330000
    }
  }
}
```

## Step 6: Write conventions.json

Write to `.planning/intel/conventions.json`:
```javascript
{
  "version": 1,
  "updated": 1737360330000,
  "naming": {
    "exports": {
      "dominant": "camelCase",
      "count": 42,
      "percentage": 85
    }
  },
  "directories": {
    "components": { "purpose": "UI components", "files": 15 },
    "hooks": { "purpose": "React/custom hooks", "files": 8 }
  },
  "suffixes": {
    ".test.js": { "purpose": "Test files", "count": 12 }
  }
}
```

## Step 7: Generate summary.md

Write to `.planning/intel/summary.md`:

```markdown
# Codebase Intelligence Summary

Last updated: [ISO timestamp]
Indexed files: [N]

## Naming Conventions

- Export naming: [case] ([percentage]% of [count] exports)

## Key Directories

- `[dir]/`: [purpose] ([N] files)
- ... (top 5)

## File Patterns

- `*[suffix]`: [purpose] ([count] files)
- ... (top 3)

Total exports: [N]
```

Target: < 500 tokens. Keep concise for context injection.

## Step 8: Report completion

Display summary statistics:

```
Codebase Analysis Complete

Files indexed: [N]
Exports found: [N]
Imports found: [N]

Conventions detected:
- Naming: [dominant case] ([percentage]%)
- Directories: [list]
- Patterns: [list]

Files created:
- .planning/intel/index.json
- .planning/intel/conventions.json
- .planning/intel/summary.md
```

## Step 9: Generate semantic entities (optional)

Generate entity files that capture semantic understanding of key files. These provide PURPOSE, not just syntax.

**Skip this step if:** User only wants the index, or codebase has < 10 files.

### 9.1 Create entities directory

```bash
mkdir -p .planning/intel/entities
```

### 9.2 Select files for entity generation

Select up to 50 files based on these criteria (in priority order):

1. **High-export files:** 3+ exports (likely core modules)
2. **Hub files:** Referenced by 5+ other files (via imports analysis)
3. **Key directories:** Entry points (index.js, main.js, app.js), config files
4. **Structural files:** Files matching convention patterns (services, controllers, models)

From the index.json, identify candidates and limit to 50 files maximum per run.

### 9.3 Spawn entity generator subagent

Spawn `gsd-entity-generator` with the selected file list.

**Pass to subagent:**
- Total file count
- Output directory: `.planning/intel/entities/`
- Slug convention: `src/lib/db.ts` -> `src-lib-db` (replace / with -, remove extension, lowercase)
- Entity template (include full template from agent definition)
- List of absolute file paths (one per line)

**Task tool invocation:**

```python
# Build file list (one absolute path per line)
file_list = "\n".join(selected_files)
today = date.today().isoformat()

Task(
  prompt=f"""Generate semantic entity documentation for key codebase files.

You are a GSD entity generator. Read source files and create semantic documentation that captures PURPOSE (what/why), not just syntax.

**Parameters:**
- Files to process: {len(selected_files)}
- Output directory: .planning/intel/entities/
- Date: {today}

**Slug convention:**
- Remove leading /
- Remove file extension
- Replace / and . with -
- Lowercase everything
- Example: src/lib/db.ts -> src-lib-db

**Entity template:**
```markdown
---
path: {{absolute_path}}
type: [module|component|util|config|api|hook|service|model|test]
updated: {today}
status: active
---

# {{filename}}

## Purpose

[1-3 sentences: What does this file do? Why does it exist? What problem does it solve?]

## Exports

- `functionName(params): ReturnType` - Brief description
- `ClassName` - What this class represents

If no exports: "None"

## Dependencies

- [[internal-file-slug]] - Why needed (for internal deps)
- external-package - What it provides (for npm packages)

If no dependencies: "None"

## Used By

TBD
```

**Process:**
For each file path below:
1. Read file content using Read tool
2. Analyze purpose, exports, dependencies
3. Check if entity already exists (skip if so)
4. Write entity to .planning/intel/entities/{{slug}}.md
5. PostToolUse hook syncs to graph.db automatically

**Files:**
{file_list}

**Return format:**
When complete, return ONLY statistics:

## ENTITY GENERATION COMPLETE

**Files processed:** {{N}}
**Entities created:** {{M}}
**Already existed:** {{K}}
**Errors:** {{E}}

Entities written to: .planning/intel/entities/

Do NOT include entity contents in your response.
""",
  subagent_type="gsd-entity-generator"
)
```

**Wait for completion:** Task() blocks until subagent finishes.

**Parse result:** Extract entities_created count from response for final report.

### 9.4 Verify entity generation

Confirm entities were written:

```bash
ls .planning/intel/entities/*.md 2>/dev/null | wc -l
```

### 9.5 Report entity statistics

```
Entity Generation Complete

Entity files created: [N] (from subagent response)
Location: .planning/intel/entities/
Graph database: Updated automatically via PostToolUse hook

Next: Intel hooks will continue incremental updates as you code.
```

</process>

<output>
- .planning/intel/index.json - File index with exports and imports
- .planning/intel/conventions.json - Detected naming and structural patterns
- .planning/intel/summary.md - Concise summary for context injection
- .planning/intel/entities/*.md - Semantic entity files (optional, Step 9)
</output>

<success_criteria>
- [ ] .planning/intel/ directory created
- [ ] All JS/TS files scanned (excluding node_modules, dist, build, .git, vendor, coverage)
- [ ] All Python files scanned (excluding __pycache__, .venv, venv, site-packages, .eggs)
- [ ] index.json populated with exports and imports for each file
- [ ] conventions.json has detected patterns (naming, directories, suffixes)
- [ ] summary.md is concise (< 500 tokens)
- [ ] Statistics reported to user
- [ ] Entity files generated for key files (if Step 9 executed)
- [ ] Entity files contain Purpose section with semantic understanding
</success_criteria>
