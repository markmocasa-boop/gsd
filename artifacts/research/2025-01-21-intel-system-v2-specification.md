# Codebase Intelligence System v2: Best-in-Class Specification

**Created:** 2025-01-21
**Status:** Specification
**Goal:** Massively increase Claude's codebase comprehension during planning and execution

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [System Architecture](#2-system-architecture)
3. [Intelligence Layers](#3-intelligence-layers)
4. [Hook Implementations](#4-hook-implementations)
5. [Storage Schema](#5-storage-schema)
6. [Context Injection Strategy](#6-context-injection-strategy)
7. [Plan-Phase Deep Integration](#7-plan-phase-deep-integration)
8. [Query Interface](#8-query-interface)
9. [Entity Management](#9-entity-management)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Core Philosophy

### 1.1 Why Intelligence Matters

Claude operates in a **stateless environment** - each session starts fresh. Without intelligence:
- Claude doesn't know what files exist or what they do
- Claude can't see relationships between modules
- Claude repeats discovery work every session
- Claude makes changes that conflict with established patterns
- Claude doesn't know which files are fragile (many dependents)

**The goal:** Make Claude as knowledgeable about the codebase as a developer who's worked on it for months.

### 1.2 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Zero-latency capture** | Hooks must complete in <100ms, never block Claude |
| **Deferred processing** | Expensive operations (entity generation) happen async |
| **Relevance over volume** | Inject targeted intel, not everything |
| **Semantic over syntactic** | Capture PURPOSE, not just exports/imports |
| **Graph-native** | Relationships are first-class, enable traversal queries |
| **Self-healing** | Stale data is detected and refreshed automatically |

### 1.3 The Intelligence Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPTURE (Always Running)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ File Write  │───▶│ Index Fast  │───▶│ Queue Deep  │                  │
│  │   (Edit)    │    │ (exports,   │    │ Analysis    │                  │
│  └─────────────┘    │  imports)   │    └─────────────┘                  │
│                     └─────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROCESS (Background/Deferred)                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ Entity      │───▶│ Graph Sync  │───▶│ Summary     │                  │
│  │ Generation  │    │ (nodes,     │    │ Generation  │                  │
│  │ (semantic)  │    │  edges)     │    │ (rich)      │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         INJECT (On Demand)                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ Session     │    │ Plan-Phase  │    │ Query       │                  │
│  │ Start       │    │ (targeted)  │    │ Response    │                  │
│  │ (overview)  │    │             │    │ (specific)  │                  │
│  └─────────────┘    └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1 Component Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HOOKS LAYER                                 │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ gsd-intel-       │  │ gsd-intel-       │  │ gsd-intel-       │       │
│  │ session.js       │  │ capture.js       │  │ sync.js          │       │
│  │                  │  │                  │  │                  │       │
│  │ SessionStart     │  │ PostToolUse      │  │ Stop             │       │
│  │ Injects context  │  │ Fast indexing    │  │ Background sync  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              STORAGE LAYER                               │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ index.json       │  │ graph.db         │  │ entities/        │       │
│  │                  │  │                  │  │                  │       │
│  │ Fast file index  │  │ SQLite relations │  │ Semantic docs    │       │
│  │ exports/imports  │  │ nodes & edges    │  │ per-file purpose │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ queue.json       │  │ summary.md       │  │ session.json     │       │
│  │                  │  │                  │  │                  │       │
│  │ Pending entity   │  │ Rich injectable  │  │ Cross-session    │       │
│  │ generation       │  │ context          │  │ memory           │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              QUERY LAYER                                 │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ /gsd:query-intel │  │ Plan-phase       │  │ In-context       │       │
│  │                  │  │ auto-query       │  │ <intel_query>    │       │
│  │ Manual queries   │  │ Relevant files   │  │ Claude can ask   │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
File Written/Edited
        │
        ▼
┌───────────────────┐
│ gsd-intel-capture │ <100ms, synchronous
│                   │
│ 1. Extract exports│
│ 2. Extract imports│
│ 3. Update index   │
│ 4. Queue for deep │
│    analysis       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ queue.json        │
│                   │
│ {pending: [...]}  │
└───────────────────┘
        │
        ▼ (on Stop event or /gsd:sync-intel)
┌───────────────────┐
│ gsd-intel-sync    │ Async, background
│                   │
│ 1. Process queue  │
│ 2. Generate/update│
│    entities       │
│ 3. Sync to graph  │
│ 4. Rebuild summary│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ summary.md        │
│ graph.db          │
│ entities/*.md     │
└───────────────────┘
        │
        ▼ (on SessionStart or plan-phase)
┌───────────────────┐
│ Context Injection │
│                   │
│ Targeted intel    │
│ for current task  │
└───────────────────┘
```

---

## 3. Intelligence Layers

### 3.1 Layer 1: Structural Index (Fast, Always Current)

**What:** File → exports/imports mapping
**When Updated:** Every Write/Edit, synchronously
**Latency:** <50ms
**Storage:** `index.json`

```json
{
  "version": 2,
  "updated": 1737400000000,
  "files": {
    "src/lib/db.ts": {
      "exports": ["DatabasePool", "query", "transaction", "healthCheck"],
      "imports": ["pg", "dotenv", "./types", "../config/env"],
      "indexed": 1737400000000,
      "lines": 245,
      "language": "typescript"
    }
  },
  "conventions": {
    "naming": {
      "exports": {"dominant": "camelCase", "confidence": 87},
      "files": {"dominant": "kebab-case", "confidence": 92}
    },
    "directories": {
      "src/services": {"purpose": "Business logic services", "pattern": "*.service.ts"},
      "src/components": {"purpose": "React components", "pattern": "PascalCase.tsx"}
    }
  }
}
```

### 3.2 Layer 2: Semantic Entities (Rich, Deferred)

**What:** Per-file documentation capturing PURPOSE
**When Updated:** Queued on edit, processed in background
**Latency:** N/A (async)
**Storage:** `entities/*.md`

```markdown
---
id: src-lib-db
path: src/lib/db.ts
type: util
updated: 2025-01-21
status: active
lines: 245
complexity: medium
---

# db.ts

## Purpose

Manages PostgreSQL database connections using connection pooling. Provides a
unified interface for query execution with automatic retry logic and transaction
support. Handles connection health monitoring and graceful shutdown.

**Why it exists:** Centralizes all database access to ensure consistent error
handling, connection management, and query logging across the application.

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `DatabasePool` | class | Singleton connection pool manager |
| `query(sql, params)` | function | Execute parameterized query with retry |
| `transaction(callback)` | function | Execute multiple queries atomically |
| `healthCheck()` | function | Verify database connectivity |

## Dependencies

**Internal:**
- [[src-config-env]] - Database connection string and pool settings
- [[src-types-db]] - TypeScript types for query results

**External:**
- `pg` - PostgreSQL client for Node.js
- `pg-pool` - Connection pooling

## Dependents (Auto-generated)

Files that import from this module:
- [[src-services-user-service]] - User CRUD operations
- [[src-services-auth-service]] - Session storage
- [[src-api-health]] - Health check endpoint
- ... (28 total)

## Patterns & Notes

- All queries use parameterized statements (SQL injection protection)
- Connection pool size configured via `DB_POOL_SIZE` env var (default: 10)
- Queries auto-retry up to 3 times on connection errors
- Transaction isolation level: READ COMMITTED
```

### 3.3 Layer 3: Relationship Graph (Queryable)

**What:** Nodes (files) + Edges (dependencies)
**When Updated:** On entity sync
**Storage:** `graph.db` (SQLite via sql.js)

**Schema:**

```sql
-- Nodes: Every tracked file
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,           -- 'src-lib-db'
  path TEXT NOT NULL,            -- 'src/lib/db.ts'
  type TEXT,                     -- 'util' | 'service' | 'component' | ...
  purpose TEXT,                  -- First sentence of Purpose section
  lines INTEGER,
  complexity TEXT,               -- 'low' | 'medium' | 'high'
  updated TEXT,                  -- ISO date
  status TEXT DEFAULT 'active'   -- 'active' | 'deprecated' | 'stale'
);

-- Edges: Dependencies between files
CREATE TABLE edges (
  source TEXT NOT NULL,          -- 'src-services-auth'
  target TEXT NOT NULL,          -- 'src-lib-db'
  relationship TEXT DEFAULT 'imports',  -- 'imports' | 'extends' | 'implements'
  UNIQUE(source, target, relationship),
  FOREIGN KEY (source) REFERENCES nodes(id),
  FOREIGN KEY (target) REFERENCES nodes(id)
);

-- Indexes for fast queries
CREATE INDEX idx_edges_target ON edges(target);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_status ON nodes(status);
```

**Key Queries:**

```sql
-- Hotspots: Files with most dependents
SELECT n.id, n.path, n.purpose, COUNT(e.source) as dependents
FROM nodes n
LEFT JOIN edges e ON n.id = e.target
GROUP BY n.id
ORDER BY dependents DESC
LIMIT 10;

-- Blast radius: What breaks if I change X?
WITH RECURSIVE affected AS (
  SELECT source as id, 1 as depth
  FROM edges WHERE target = ?
  UNION ALL
  SELECT e.source, a.depth + 1
  FROM edges e
  JOIN affected a ON e.target = a.id
  WHERE a.depth < 5
)
SELECT DISTINCT n.id, n.path, n.purpose, MIN(a.depth) as depth
FROM affected a
JOIN nodes n ON a.id = n.id
GROUP BY n.id
ORDER BY depth;

-- Files related to keyword
SELECT id, path, purpose
FROM nodes
WHERE purpose LIKE '%authentication%'
   OR path LIKE '%auth%'
ORDER BY
  CASE WHEN path LIKE '%auth%' THEN 0 ELSE 1 END,
  id;
```

### 3.4 Layer 4: Rich Summary (Injectable Context)

**What:** Human-readable intelligence for Claude's context
**When Updated:** After entity sync completes
**Storage:** `summary.md`

```markdown
# Codebase Intelligence

**Project:** get-shit-done
**Last sync:** 2025-01-21T14:30:00Z
**Indexed files:** 127 | **Entities:** 45 | **Stale:** 3

---

## Architecture Overview

Node.js/TypeScript API following service-layer architecture:
- **API Layer** (`src/api/`): Express route handlers, request validation
- **Service Layer** (`src/services/`): Business logic, orchestration
- **Data Layer** (`src/lib/`, `src/models/`): Database access, data models

---

## Critical Hotspots

Files with many dependents - changes here have wide impact:

| File | Dependents | Purpose |
|------|------------|---------|
| `src/lib/db.ts` | 42 | Database connection pooling and query execution |
| `src/services/auth.service.ts` | 28 | JWT authentication and session management |
| `src/config/env.ts` | 24 | Environment configuration and validation |
| `src/types/user.ts` | 19 | User data types and validation schemas |

---

## Established Patterns

**Services** (`src/services/*.service.ts`):
- Class-based, singleton pattern
- Constructor injection for dependencies
- Async methods return `Promise<Result<T, Error>>`
- Example: `UserService`, `AuthService`, `PaymentService`

**API Routes** (`src/api/*.ts`):
- Express Router per domain
- Middleware: auth → validate → handler
- Response format: `{ success: boolean, data?: T, error?: string }`

**Database Access**:
- All queries through `src/lib/db.ts`
- Parameterized queries only (no string concatenation)
- Transactions for multi-step operations

---

## Module Statistics

| Type | Count | Key Examples |
|------|-------|--------------|
| Service | 8 | auth.service, user.service, payment.service |
| API | 12 | /auth, /users, /payments, /health |
| Util | 15 | db, logger, validator, cache |
| Model | 9 | User, Session, Payment, Subscription |
| Component | 23 | Button, Modal, Form, Table |
| Config | 4 | env, database, redis, auth |

---

## Recent Changes

Files modified in last session:
- `src/services/auth.service.ts` - Added OAuth provider support
- `src/lib/oauth.ts` - New file: OAuth token handling
- `src/api/auth.ts` - Added /auth/google and /auth/github routes

---

## Stale Entities (Need Refresh)

These files changed but entities haven't been updated:
- `src/services/user.service.ts` (modified 2 days ago)
- `src/lib/cache.ts` (modified 3 days ago)

Run `/gsd:sync-intel` to refresh.
```

### 3.5 Layer 5: Session Memory (Cross-Session Continuity)

**What:** What happened last session, decisions made
**When Updated:** On session end (Stop hook)
**Storage:** `session.json`

```json
{
  "lastSession": {
    "timestamp": "2025-01-21T12:00:00Z",
    "duration": "45 minutes",
    "phase": "Phase 3: Authentication",
    "filesModified": [
      "src/services/auth.service.ts",
      "src/lib/oauth.ts",
      "src/api/auth.ts"
    ],
    "filesCreated": [
      "src/lib/oauth.ts"
    ],
    "summary": "Implemented OAuth support for Google and GitHub providers. Added new routes /auth/google and /auth/github. Refactored auth.service to support multiple auth strategies."
  },
  "recentDecisions": [
    {
      "date": "2025-01-21",
      "topic": "OAuth Implementation",
      "decision": "Using passport.js with custom strategies instead of Auth0",
      "rationale": "More control over flow, no external dependency"
    }
  ],
  "workInProgress": {
    "phase": "Phase 3",
    "remainingTasks": [
      "Add OAuth callback error handling",
      "Implement token refresh logic"
    ]
  }
}
```

---

## 4. Hook Implementations

### 4.1 gsd-intel-session.js (SessionStart)

**Trigger:** When Claude Code session starts
**Mode:** Synchronous, <200ms
**Purpose:** Inject accumulated intelligence into context

```javascript
#!/usr/bin/env node
/**
 * SessionStart Hook: Injects codebase intelligence into Claude's context.
 *
 * Output is wrapped in <codebase-intelligence> tags and shown to Claude
 * at the start of every session.
 */

const fs = require('fs');
const path = require('path');

function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, '.planning', 'intel'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function main() {
  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) {
    // No intel directory - silent exit (opt-in behavior)
    process.exit(0);
  }

  const intelDir = path.join(projectRoot, '.planning', 'intel');
  const summaryPath = path.join(intelDir, 'summary.md');
  const sessionPath = path.join(intelDir, 'session.json');

  const output = [];

  // 1. Inject main summary
  if (fs.existsSync(summaryPath)) {
    const summary = fs.readFileSync(summaryPath, 'utf8');
    output.push(summary);
  }

  // 2. Inject session memory (last session context)
  if (fs.existsSync(sessionPath)) {
    try {
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      if (session.lastSession) {
        output.push('\n---\n');
        output.push('## Last Session Context\n');
        output.push(`**When:** ${session.lastSession.timestamp}\n`);
        output.push(`**Phase:** ${session.lastSession.phase}\n`);
        output.push(`**Summary:** ${session.lastSession.summary}\n`);

        if (session.workInProgress?.remainingTasks?.length > 0) {
          output.push('\n**Remaining tasks:**\n');
          session.workInProgress.remainingTasks.forEach(task => {
            output.push(`- ${task}\n`);
          });
        }
      }
    } catch (e) {
      // Ignore malformed session.json
    }
  }

  // 3. Output wrapped in tags
  if (output.length > 0) {
    console.log('<codebase-intelligence>');
    console.log(output.join(''));
    console.log('</codebase-intelligence>');
  }

  process.exit(0);
}

main();
```

### 4.2 gsd-intel-capture.js (PostToolUse)

**Trigger:** After Write or Edit tool
**Mode:** Synchronous, <100ms
**Purpose:** Fast indexing, queue for deep analysis

```javascript
#!/usr/bin/env node
/**
 * PostToolUse Hook: Fast capture of file changes.
 *
 * This hook MUST be fast (<100ms). It:
 * 1. Extracts exports/imports (regex, no AST)
 * 2. Updates index.json
 * 3. Queues file for deep analysis (entity generation)
 *
 * Deep analysis happens later in gsd-intel-sync.js
 */

const fs = require('fs');
const path = require('path');

// Fast regex-based extraction (no AST parsing)
function extractExports(content, language) {
  const exports = [];

  if (language === 'typescript' || language === 'javascript') {
    // export function/const/class/type/interface
    const patterns = [
      /export\s+(?:async\s+)?function\s+(\w+)/g,
      /export\s+(?:const|let|var)\s+(\w+)/g,
      /export\s+class\s+(\w+)/g,
      /export\s+type\s+(\w+)/g,
      /export\s+interface\s+(\w+)/g,
      /export\s+enum\s+(\w+)/g,
      /export\s+default\s+(?:class|function)?\s*(\w+)?/g,
      /export\s*\{\s*([^}]+)\s*\}/g,  // named exports
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          // Handle named export lists
          if (match[1].includes(',')) {
            match[1].split(',').forEach(name => {
              const clean = name.trim().split(/\s+as\s+/).pop().trim();
              if (clean && !exports.includes(clean)) exports.push(clean);
            });
          } else {
            const clean = match[1].trim();
            if (clean && !exports.includes(clean)) exports.push(clean);
          }
        }
      }
    });
  } else if (language === 'python') {
    // Python: functions, classes at module level; __all__
    const patterns = [
      /^def\s+(\w+)/gm,
      /^class\s+(\w+)/gm,
      /^(\w+)\s*=/gm,  // Module-level assignments
    ];

    // Check for __all__
    const allMatch = content.match(/__all__\s*=\s*\[([^\]]+)\]/);
    if (allMatch) {
      allMatch[1].match(/['"](\w+)['"]/g)?.forEach(m => {
        exports.push(m.replace(/['"]/g, ''));
      });
    } else {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1] && !match[1].startsWith('_') && !exports.includes(match[1])) {
            exports.push(match[1]);
          }
        }
      });
    }
  }

  return exports;
}

function extractImports(content, language) {
  const imports = [];

  if (language === 'typescript' || language === 'javascript') {
    const patterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,  // dynamic import
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !imports.includes(match[1])) {
          imports.push(match[1]);
        }
      }
    });
  } else if (language === 'python') {
    const patterns = [
      /^import\s+(\S+)/gm,
      /^from\s+(\S+)\s+import/gm,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !imports.includes(match[1])) {
          imports.push(match[1].split('.')[0]);  // Top-level module
        }
      }
    });
  }

  return imports;
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.ts': 'typescript', '.tsx': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
  };
  return langMap[ext] || null;
}

function getRelativePath(filePath, projectRoot) {
  return path.relative(projectRoot, filePath);
}

function main() {
  // Parse hook input from stdin
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf8');
  } catch (e) {
    process.exit(0);
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch (e) {
    process.exit(0);
  }

  // Only process Write and Edit tools
  const toolName = hookData.tool_name;
  if (toolName !== 'Write' && toolName !== 'Edit') {
    process.exit(0);
  }

  const filePath = hookData.tool_input?.file_path;
  if (!filePath) {
    process.exit(0);
  }

  // Find project root
  let projectRoot = path.dirname(filePath);
  while (projectRoot !== '/') {
    if (fs.existsSync(path.join(projectRoot, '.planning', 'intel'))) {
      break;
    }
    projectRoot = path.dirname(projectRoot);
  }

  if (projectRoot === '/') {
    // No intel directory - opt-in behavior
    process.exit(0);
  }

  const intelDir = path.join(projectRoot, '.planning', 'intel');
  const indexPath = path.join(intelDir, 'index.json');
  const queuePath = path.join(intelDir, 'queue.json');

  // Detect language
  const language = detectLanguage(filePath);
  if (!language) {
    // Unsupported file type
    process.exit(0);
  }

  // Read file content
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    process.exit(0);
  }

  // Extract exports and imports
  const exports = extractExports(content, language);
  const imports = extractImports(content, language);
  const relativePath = getRelativePath(filePath, projectRoot);
  const lines = content.split('\n').length;

  // Load or create index
  let index = { version: 2, updated: 0, files: {}, conventions: {} };
  if (fs.existsSync(indexPath)) {
    try {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (e) {}
  }

  // Check if signature changed (for queue decision)
  const prevEntry = index.files[relativePath];
  const signatureChanged = !prevEntry ||
    JSON.stringify(prevEntry.exports) !== JSON.stringify(exports) ||
    JSON.stringify(prevEntry.imports) !== JSON.stringify(imports);

  // Update index
  index.files[relativePath] = {
    exports,
    imports,
    indexed: Date.now(),
    lines,
    language,
  };
  index.updated = Date.now();

  // Write index
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // Queue for deep analysis if signature changed
  if (signatureChanged) {
    let queue = { pending: [], updated: 0 };
    if (fs.existsSync(queuePath)) {
      try {
        queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      } catch (e) {}
    }

    // Add to queue if not already present
    if (!queue.pending.includes(relativePath)) {
      queue.pending.push(relativePath);
      queue.updated = Date.now();
      fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    }
  }

  process.exit(0);
}

main();
```

### 4.3 gsd-intel-sync.js (Stop Hook / Command)

**Trigger:** On Stop event OR `/gsd:sync-intel` command
**Mode:** Can run async/background
**Purpose:** Process queue, generate entities, rebuild summary

```javascript
#!/usr/bin/env node
/**
 * Stop Hook / Sync Command: Deep analysis and summary generation.
 *
 * This processes the queue of files needing entity generation,
 * syncs entities to the graph, and rebuilds the summary.
 *
 * Can be triggered by:
 * 1. Stop event (end of Claude response)
 * 2. /gsd:sync-intel command
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ... (sql.js setup for graph operations)

async function main() {
  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) process.exit(0);

  const intelDir = path.join(projectRoot, '.planning', 'intel');
  const queuePath = path.join(intelDir, 'queue.json');
  const indexPath = path.join(intelDir, 'index.json');

  // 1. Process entity generation queue
  if (fs.existsSync(queuePath)) {
    const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

    if (queue.pending.length > 0) {
      // Option A: Spawn entity generator subagent (recommended for many files)
      // Option B: Generate inline (for 1-3 files)

      if (queue.pending.length <= 3) {
        // Inline generation - simple prompt to Claude
        for (const filePath of queue.pending) {
          await generateEntityInline(filePath, intelDir);
        }
      } else {
        // Batch generation via subagent
        await spawnEntityGenerator(queue.pending, intelDir);
      }

      // Clear queue
      queue.pending = [];
      queue.updated = Date.now();
      fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    }
  }

  // 2. Sync all entities to graph
  await syncEntitiesToGraph(intelDir);

  // 3. Rebuild rich summary
  await rebuildSummary(intelDir, indexPath);

  // 4. Update session memory
  await updateSessionMemory(intelDir);

  process.exit(0);
}

async function rebuildSummary(intelDir, indexPath) {
  const summaryPath = path.join(intelDir, 'summary.md');
  const graphPath = path.join(intelDir, 'graph.db');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  // Initialize sql.js and load graph
  const db = loadGraph(graphPath);

  // Query hotspots with purposes
  const hotspots = db.exec(`
    SELECT n.path, n.purpose, COUNT(e.source) as deps
    FROM nodes n
    LEFT JOIN edges e ON n.id = e.target
    WHERE n.status = 'active'
    GROUP BY n.id
    HAVING deps > 0
    ORDER BY deps DESC
    LIMIT 10
  `);

  // Query module type distribution
  const types = db.exec(`
    SELECT type, COUNT(*) as count
    FROM nodes
    WHERE status = 'active'
    GROUP BY type
    ORDER BY count DESC
  `);

  // Detect stale entities
  const entitiesDir = path.join(intelDir, 'entities');
  const staleFiles = [];
  for (const [filePath, data] of Object.entries(index.files)) {
    const entityPath = path.join(entitiesDir, pathToSlug(filePath) + '.md');
    if (fs.existsSync(entityPath)) {
      const entityMtime = fs.statSync(entityPath).mtimeMs;
      if (data.indexed > entityMtime) {
        staleFiles.push(filePath);
      }
    }
  }

  // Build summary markdown
  const summary = buildSummaryMarkdown({
    fileCount: Object.keys(index.files).length,
    entityCount: countEntities(entitiesDir),
    staleCount: staleFiles.length,
    hotspots,
    types,
    conventions: index.conventions,
    staleFiles,
  });

  fs.writeFileSync(summaryPath, summary);
}

main();
```

---

## 5. Storage Schema

### 5.1 Directory Structure

```
.planning/intel/
├── index.json          # Fast file index (exports, imports)
├── conventions.json    # Detected patterns (deprecated - merged into index.json)
├── queue.json          # Files pending deep analysis
├── graph.db            # SQLite relationship database
├── summary.md          # Rich injectable context
├── session.json        # Cross-session memory
└── entities/           # Per-file semantic documentation
    ├── src-lib-db.md
    ├── src-services-auth-service.md
    └── ...
```

### 5.2 File Specifications

#### index.json (v2)

```json
{
  "version": 2,
  "updated": 1737400000000,
  "projectName": "my-project",
  "files": {
    "src/lib/db.ts": {
      "exports": ["DatabasePool", "query", "transaction"],
      "imports": ["pg", "./types", "../config/env"],
      "indexed": 1737400000000,
      "lines": 245,
      "language": "typescript",
      "entityStatus": "current"  // "current" | "stale" | "missing"
    }
  },
  "conventions": {
    "naming": {
      "exports": {"dominant": "camelCase", "confidence": 87, "samples": 142},
      "files": {"dominant": "kebab-case", "confidence": 92, "samples": 67}
    },
    "directories": {
      "src/services": {
        "purpose": "Business logic services",
        "pattern": "*.service.ts",
        "fileCount": 8
      },
      "src/components": {
        "purpose": "React UI components",
        "pattern": "PascalCase.tsx",
        "fileCount": 23
      }
    },
    "suffixes": {
      ".service.ts": {"purpose": "Service class", "count": 8},
      ".test.ts": {"purpose": "Test file", "count": 34},
      ".controller.ts": {"purpose": "API controller", "count": 12}
    }
  },
  "stats": {
    "totalFiles": 127,
    "totalExports": 456,
    "totalImports": 892,
    "languages": {"typescript": 98, "javascript": 12, "python": 17}
  }
}
```

#### queue.json

```json
{
  "pending": [
    "src/services/user.service.ts",
    "src/lib/oauth.ts"
  ],
  "inProgress": [],
  "failed": [],
  "updated": 1737400000000,
  "stats": {
    "totalProcessed": 45,
    "lastBatchSize": 12,
    "lastBatchDuration": 34000
  }
}
```

#### session.json

```json
{
  "lastSession": {
    "id": "sess_abc123",
    "timestamp": "2025-01-21T12:00:00Z",
    "duration": "45 minutes",
    "phase": "Phase 3: Authentication",
    "filesModified": ["src/services/auth.service.ts", "src/api/auth.ts"],
    "filesCreated": ["src/lib/oauth.ts"],
    "filesDeleted": [],
    "summary": "Implemented OAuth support for Google and GitHub providers.",
    "tokensUsed": 45000
  },
  "recentDecisions": [
    {
      "date": "2025-01-21",
      "topic": "OAuth Implementation",
      "decision": "Using passport.js instead of Auth0",
      "rationale": "More control, no external dependency",
      "affectedFiles": ["src/lib/oauth.ts", "src/services/auth.service.ts"]
    }
  ],
  "workInProgress": {
    "phase": "Phase 3",
    "phaseGoal": "Complete authentication system",
    "remainingTasks": [
      "Add OAuth callback error handling",
      "Implement token refresh logic",
      "Add rate limiting to auth endpoints"
    ]
  },
  "sessionHistory": [
    {"id": "sess_xyz789", "date": "2025-01-20", "summary": "Set up database layer"},
    {"id": "sess_abc123", "date": "2025-01-21", "summary": "Implemented OAuth"}
  ]
}
```

---

## 6. Context Injection Strategy

### 6.1 Session Start Injection

**What Claude sees at session start:**

```xml
<codebase-intelligence>
# Codebase Intelligence

**Project:** my-project
**Last sync:** 2025-01-21T14:30:00Z
**Files:** 127 | **Entities:** 45

---

## Architecture Overview

Node.js/TypeScript API with service-layer architecture:
- **API Layer** (`src/api/`): Express route handlers
- **Service Layer** (`src/services/`): Business logic
- **Data Layer** (`src/lib/`): Database, cache, external APIs

---

## Critical Hotspots

| File | Deps | Purpose |
|------|------|---------|
| `src/lib/db.ts` | 42 | Database connection pooling |
| `src/services/auth.service.ts` | 28 | JWT auth & sessions |
| `src/config/env.ts` | 24 | Environment config |

---

## Patterns

**Services:** Class-based, `*.service.ts`, constructor injection
**API:** Express Router, middleware chain: auth → validate → handler
**Database:** All via `db.ts`, parameterized queries only

---

## Last Session

**Phase:** Phase 3: Authentication
**Summary:** Implemented OAuth for Google/GitHub

**Remaining tasks:**
- Add OAuth callback error handling
- Implement token refresh logic
</codebase-intelligence>
```

**Token budget:** ~500 tokens (fits easily in context)

### 6.2 Plan-Phase Targeted Injection

When `/gsd:plan-phase` runs, inject **relevant** intel based on phase goal:

```markdown
## Phase Goal
"Add rate limiting to authentication endpoints"

## Relevant Intelligence (Auto-Selected)

### Files You'll Likely Modify

**src/services/auth.service.ts** [28 dependents]
Purpose: JWT authentication, session management, OAuth integration
Exports: `AuthService`, `validateToken`, `refreshToken`, `revokeSession`
Dependencies: [[src-lib-db]], [[src-lib-redis]], `jsonwebtoken`

**src/api/auth.ts** [3 dependents]
Purpose: Authentication route handlers (/login, /logout, /refresh)
Exports: `authRouter`
Dependencies: [[src-services-auth-service]], [[src-middleware-validate]]

**src/middleware/rate-limit.ts** [0 dependents]
Purpose: Express rate limiting middleware (currently unused)
Exports: `rateLimiter`, `createLimiter`
Dependencies: `express-rate-limit`, [[src-lib-redis]]

### Blast Radius

Changing `auth.service.ts` affects 28 files:
- All API routes that require authentication
- User service, payment service, admin service
- All protected components

### Suggested Approach

1. Rate limiting middleware exists at `src/middleware/rate-limit.ts` but is unused
2. Apply to auth routes in `src/api/auth.ts`
3. Configure limits in `src/config/env.ts`
```

### 6.3 On-Demand Query Response

When Claude (or user) queries intel:

```
/gsd:query-intel "what handles file uploads?"
```

Response injected:

```markdown
## Query: "what handles file uploads?"

### Direct Matches (path/purpose contains keywords)

**src/services/upload.service.ts** [12 dependents]
Purpose: Handles file upload processing, validation, and S3 storage
Exports: `UploadService`, `validateFile`, `uploadToS3`, `deleteFile`

**src/api/upload.ts** [0 dependents]
Purpose: File upload endpoints with multipart handling
Exports: `uploadRouter`

**src/lib/s3.ts** [4 dependents]
Purpose: AWS S3 client wrapper for file storage operations
Exports: `s3Client`, `uploadFile`, `getSignedUrl`, `deleteObject`

### Related Files (import from matches)

- `src/services/user.service.ts` - imports upload.service for avatar uploads
- `src/services/document.service.ts` - imports upload.service for doc storage
```

---

## 7. Plan-Phase Deep Integration

### 7.1 Enhanced plan-phase.md

```markdown
## Step 7: Gather Codebase Intelligence

### 7a. Read base intelligence
INTEL_SUMMARY=$(cat .planning/intel/summary.md 2>/dev/null)

### 7b. Extract phase keywords
Parse the phase goal to identify key concepts:
- Nouns: "rate limiting", "authentication", "endpoints"
- Verbs: "add", "implement", "modify"
- Technical terms: "middleware", "redis", "express"

### 7c. Query graph for relevant files
Using the keywords, query the intel graph:

```bash
# Pseudo-query (implemented in gsd-intel-query.js)
gsd-intel-query --related-to "rate limiting,authentication,middleware"
```

Returns:
- Files whose path contains keywords
- Files whose purpose contains keywords
- Files that depend on matched files (blast radius)

### 7d. Build targeted injection

For each relevant file (up to 10):
1. Read entity file from `.planning/intel/entities/{slug}.md`
2. Extract: purpose, key exports, dependencies
3. Query graph for dependents count

Assemble into `<phase-relevant-intel>` block.

## Step 8: Spawn Planner with Enhanced Context

```markdown
**General Codebase Intel:**
<codebase-intel>
{intel_summary}
</codebase-intel>

**Phase-Relevant Files:**
<phase-relevant-intel>
{targeted_intel}
</phase-relevant-intel>

**Phase Goal:**
{phase_goal}
```
```

### 7.2 Relevance Scoring Algorithm

```javascript
function scoreFileRelevance(file, keywords, graph) {
  let score = 0;

  // Path matching (high signal)
  for (const keyword of keywords) {
    if (file.path.toLowerCase().includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  // Purpose matching (highest signal)
  for (const keyword of keywords) {
    if (file.purpose?.toLowerCase().includes(keyword.toLowerCase())) {
      score += 15;
    }
  }

  // Export matching
  for (const exp of file.exports) {
    for (const keyword of keywords) {
      if (exp.toLowerCase().includes(keyword.toLowerCase())) {
        score += 5;
      }
    }
  }

  // Dependency proximity (files that depend on high-scoring files)
  const dependents = graph.getDependents(file.id);
  for (const dep of dependents) {
    if (scoredFiles[dep.id] > 10) {
      score += 3;
    }
  }

  // Hotspot bonus (important files get boost)
  const dependentCount = graph.getDependentCount(file.id);
  if (dependentCount > 10) score += 2;
  if (dependentCount > 20) score += 3;

  return score;
}
```

---

## 8. Query Interface

### 8.1 Command: /gsd:query-intel

```markdown
# /gsd:query-intel

Query the codebase intelligence graph.

## Usage

### Find files by keyword
```bash
/gsd:query-intel "authentication"
```

### Get blast radius for a file
```bash
/gsd:query-intel dependents src/lib/db.ts
```

### List hotspots
```bash
/gsd:query-intel hotspots
```

### Find files by type
```bash
/gsd:query-intel type:service
```

### Combined query
```bash
/gsd:query-intel "payment" type:service
```

## Output Format

Results are injected into context as `<intel-query-result>` tags.
```

### 8.2 In-Context Query (Advanced)

Allow Claude to query intel mid-conversation using a pseudo-tag:

```markdown
User: "Add caching to the user lookup"

Claude thinks: I need to understand the current user lookup implementation.

Claude outputs:
<intel_query>files related to "user lookup" OR "user service"</intel_query>

System injects (via hook or skill):
<intel_query_result>
**src/services/user.service.ts** [15 dependents]
Purpose: User CRUD operations, profile management, lookup by ID/email
Key exports: `UserService`, `getUserById`, `getUserByEmail`, `updateUser`
Dependencies: [[src-lib-db]], [[src-lib-cache]], [[src-types-user]]

**src/lib/cache.ts** [8 dependents]
Purpose: Redis cache wrapper for common caching patterns
Key exports: `cache`, `cacheGet`, `cacheSet`, `cacheInvalidate`
</intel_query_result>

Claude continues: I can see user lookups go through UserService which uses
cache.ts. I should add caching in getUserById and getUserByEmail...
```

**Implementation:** This requires either:
1. A PreToolUse hook that detects `<intel_query>` in Claude's output
2. An MCP server that Claude can call
3. A custom tool exposed to Claude

---

## 9. Entity Management

### 9.1 Entity Generation Strategy

**Key insight:** Entity generation is expensive (requires Claude). Must be strategic.

#### When to Generate

| Trigger | Action | Rationale |
|---------|--------|-----------|
| New file created | Queue for generation | New knowledge needed |
| Exports changed | Queue for regeneration | API surface changed |
| File deleted | Remove entity | Stale data |
| Manual sync | Process queue | User requested |
| Session end | Process if queue < 5 | Background cleanup |

#### When NOT to Generate

- Import-only changes (internal refactor)
- Comment/formatting changes
- Test file changes (low value)
- Config file changes (unless exports changed)

### 9.2 Batch Entity Generation

For large queues (5+ files), use subagent:

```markdown
## Entity Generation Task

You are generating semantic entity documentation for {count} files.

Output directory: .planning/intel/entities/

For each file:
1. Read the file content
2. Analyze purpose (WHY does this exist?)
3. Document key exports with signatures
4. Identify dependencies (internal = [[wiki-link]], external = plain)
5. Write entity markdown

Use this template:
[template here]

Files to process:
1. src/services/user.service.ts
2. src/services/payment.service.ts
3. src/lib/stripe.ts
...

Return only statistics when complete.
```

### 9.3 Entity Staleness Detection

```javascript
function detectStaleEntities(index, entitiesDir) {
  const stale = [];

  for (const [filePath, data] of Object.entries(index.files)) {
    const slug = pathToSlug(filePath);
    const entityPath = path.join(entitiesDir, `${slug}.md`);

    if (!fs.existsSync(entityPath)) {
      // Missing entity
      stale.push({ path: filePath, reason: 'missing' });
      continue;
    }

    const entityMtime = fs.statSync(entityPath).mtimeMs;

    if (data.indexed > entityMtime) {
      // File modified after entity generated
      stale.push({ path: filePath, reason: 'outdated' });
    }
  }

  return stale;
}
```

### 9.4 Entity Quality Checks

When generating/updating entities, validate:

```javascript
function validateEntity(content) {
  const errors = [];

  // Check frontmatter
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter.path) errors.push('Missing path in frontmatter');
  if (!frontmatter.type) errors.push('Missing type in frontmatter');
  if (!['module','service','component','util','api','config','model','test','hook']
      .includes(frontmatter.type)) {
    errors.push(`Invalid type: ${frontmatter.type}`);
  }

  // Check purpose
  const purpose = extractSection(content, 'Purpose');
  if (!purpose || purpose.length < 50) {
    errors.push('Purpose too short (need 50+ chars)');
  }
  if (purpose.startsWith('Exports') || purpose.startsWith('Contains')) {
    errors.push('Purpose should describe WHY, not WHAT');
  }

  // Check wiki-links for internal deps
  const deps = extractSection(content, 'Dependencies');
  const internalImports = frontmatter.imports?.filter(i => i.startsWith('.'));
  const wikiLinks = content.match(/\[\[[\w-]+\]\]/g) || [];

  if (internalImports?.length > 0 && wikiLinks.length === 0) {
    errors.push('Internal dependencies should use [[wiki-links]]');
  }

  return errors;
}
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Immediate)

**Goal:** Fix critical issues, establish correct patterns

| Task | Priority | Effort |
|------|----------|--------|
| Split hooks: capture (fast) vs sync (deferred) | P0 | 4h |
| Implement queue.json for deferred processing | P0 | 2h |
| Remove inline entity generation from PostToolUse | P0 | 1h |
| Add staleness detection to index.json | P1 | 2h |

**Deliverables:**
- `gsd-intel-capture.js` - Fast PostToolUse hook (<100ms)
- `gsd-intel-sync.js` - Deferred processing hook
- Updated `index.json` schema with entityStatus field

### Phase 2: Rich Summaries

**Goal:** Make summary.md actually useful

| Task | Priority | Effort |
|------|----------|--------|
| Include entity purposes in summary | P0 | 3h |
| Add architecture overview section | P1 | 2h |
| Add recent changes section | P1 | 2h |
| Add stale entity warnings | P2 | 1h |

**Deliverables:**
- Enhanced `rebuildSummary()` function
- Summary includes purposes for hotspots
- Summary shows last session context

### Phase 3: Plan-Phase Integration

**Goal:** Inject relevant intel during planning

| Task | Priority | Effort |
|------|----------|--------|
| Add keyword extraction to plan-phase | P0 | 2h |
| Implement relevance scoring | P0 | 3h |
| Build targeted intel assembly | P0 | 3h |
| Update plan-phase.md steps 7-8 | P1 | 2h |

**Deliverables:**
- `gsd-intel-query.js` - Query script for plan-phase
- Updated `plan-phase.md` with targeted injection
- Relevance scoring algorithm

### Phase 4: Session Memory

**Goal:** Cross-session continuity

| Task | Priority | Effort |
|------|----------|--------|
| Implement session.json schema | P1 | 2h |
| Track files modified per session | P1 | 2h |
| Capture work-in-progress state | P2 | 2h |
| Inject last session context at start | P1 | 1h |

**Deliverables:**
- `session.json` tracking
- SessionStart injects last session summary
- Work-in-progress task continuity

### Phase 5: Query Interface

**Goal:** Let Claude query intel on demand

| Task | Priority | Effort |
|------|----------|--------|
| Enhance /gsd:query-intel command | P1 | 3h |
| Add keyword search to graph | P1 | 2h |
| Add type filtering | P2 | 1h |
| Consider MCP server for in-context queries | P3 | 8h |

**Deliverables:**
- Enhanced query command
- Keyword + type search support
- (Optional) MCP server for live queries

---

## Appendix A: Token Budget Analysis

| Component | Estimated Tokens | When Injected |
|-----------|------------------|---------------|
| summary.md (overview) | 300-500 | Every session |
| Last session context | 100-200 | Every session |
| **Session start total** | **400-700** | - |
| Phase-relevant entities (5-10 files) | 500-1000 | Plan-phase |
| Blast radius info | 100-200 | Plan-phase |
| **Plan-phase total** | **1000-1900** | - |
| Query result (3-5 files) | 300-500 | On query |

**Context impact:** Minimal. Even with all injections, intel uses <2000 tokens out of 200K+ context.

---

## Appendix B: Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| PostToolUse capture | <100ms | ~50ms |
| SessionStart injection | <200ms | ~100ms |
| Entity generation (1 file) | <30s | ~15s |
| Summary regeneration | <500ms | ~200ms |
| Graph query (hotspots) | <100ms | ~50ms |
| Graph query (dependents, depth 3) | <200ms | ~100ms |

---

## Appendix C: File Size Estimates

| File | Typical Size | Max Size |
|------|--------------|----------|
| index.json | 50KB | 500KB (1000 files) |
| graph.db | 100KB | 2MB (1000 files) |
| summary.md | 3KB | 10KB |
| session.json | 2KB | 5KB |
| Single entity | 1KB | 3KB |
| entities/ total | 50KB | 500KB (500 entities) |
| **Total intel/** | **~200KB** | **~3MB** |

Storage is negligible even for large projects.
