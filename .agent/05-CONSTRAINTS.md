# Project Constraints

---

## Universal Constraints (Always Apply)

These rules apply to ALL projects regardless of configuration:

### Code Quality
- **No placeholders:** Never write `TODO`, `...`, `// implement later`
- **No stub functions:** Every function must be fully implemented
- **No hardcoded secrets:** Never include API keys, passwords, tokens in code
- **Complete imports:** All imports must be present and correct
- **Error handling:** All async operations must handle errors

### Security
- Validate all user input
- Use parameterized queries (never string concatenation for SQL)
- Sanitize output to prevent XSS
- Use HTTPS for all external requests
- Never log sensitive data (passwords, tokens, PII)

### Communication
- Explain your decisions briefly
- Flag issues outside your current scope
- Be explicit about assumptions
- Ask if requirements are unclear

---

## Project-Specific Constraints

### Must Follow (REQUIRED)

These are non-negotiable for BACOWR v2:

- [x] Use TypeScript for all new files (strict mode)
- [x] Use Next.js App Router patterns (not Pages Router)
- [x] All API routes must validate input
- [x] Components must be functional (no class components)
- [x] Use Supabase client from `src/lib/database.ts`
- [x] All database queries should use views/functions where available
- [x] Anchor classification must use the 6-type system (exact_match, partial_match, brand, generic, url, other)
- [x] Swedish language for all UI labels

### Should Follow (PREFERRED)

These are strong preferences but can be overridden with justification:

- [x] Prefer Tailwind CSS over custom CSS
- [x] Use early returns over nested conditions
- [x] Use existing database views (`v_client_dashboard`, `v_anchor_balance`, etc.) over raw queries
- [x] Use existing RPC functions (`classify_anchor`, `find_client_by_name`, etc.) for common operations
- [x] Dark theme styling (gray-950 background)
- [x] Color-coded anchor types (green=exact, blue=partial, purple=brand, yellow=generic)

### Must Not Do (FORBIDDEN)

These patterns are explicitly banned:

- Do not use `any` type in TypeScript without explicit justification
- Do not install new dependencies without asking
- Do not modify database schema directly (use migrations)
- Do not bypass the job state machine
- Do not hardcode client-specific logic
- Do not use LLM in validation (must be 100% deterministic)
- Do not use English in UI labels (Swedish only)

---

## Style Guide

### Code Style

| Aspect | Rule |
|--------|------|
| Formatting | Prettier with default config |
| Naming | camelCase for variables, PascalCase for components |
| File naming | kebab-case.ts for files |
| Exports | Named exports preferred over default |

### Comment Style

```javascript
// Single-line for brief explanations

/*
 * Multi-line for longer explanations
 * that need more context
 */

/**
 * JSDoc for public functions
 * @param {string} anchor - The anchor text
 * @returns {AnchorType} The classified anchor type
 */
```

### Commit Messages

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

---

## Domain-Specific Rules

### Article Generation
- Link must be placed in section 2 or 3, not intro or outro
- Anchor text must appear exactly once in the article
- Bridge theme must be established in first 300 words
- Word count must be 900-1500 words

### Anchor Classification
- `exact_match`: Anchor exactly matches a focus keyword
- `partial_match`: Anchor contains focus keywords
- `brand`: Anchor contains brand terms
- `generic`: Generic phrases like "klicka här", "läs mer"
- `url`: URL used as anchor text
- `other`: Unclassified

### Three Holy Inputs
Every job requires:
1. `publisher_domain` - Where the article publishes (SEO source)
2. `target_url` - Where the link points (destination)
3. `anchor_text` - The clickable text

### Validator Checks (All Must Pass at 80/100 threshold)
1. Word count (900-1500)
2. LIX readability score
3. AI markers detection
4. Link placement accuracy
5. Anchor text compliance
6. Entity coverage
7. Marriage establishment
8. Forbidden content check

---

## External Service Rules

| Service | Rules |
|---------|-------|
| Supabase | Use migrations for schema changes. Use views for complex queries. |
| LLM Provider | Use `llm-adapter.ts` abstraction. Never call providers directly. |
| CSV Import | Always handle Windows-1252 encoding. Auto-derive missing domains. |

---

## Quality Gates for This Project

Based on project complexity, these gates must pass:

| Gate | Requirement | Automated? |
|------|-------------|------------|
| Syntax | TypeScript compiles | Yes |
| No secrets | No hardcoded credentials | Yes |
| No placeholders | No TODO/... in code | Yes |
| Imports complete | All imports resolve | Yes |
| Validation deterministic | No LLM in validator | Manual |
| Swedish UI | No English labels | Manual |

---

## Exceptions

Document any approved exceptions to the rules:

| Rule | Exception | Reason | Approved By |
|------|-----------|--------|-------------|
| - | - | - | - |

---

```
Previous: ← 04-WORKFLOW.md

═══════════════════════════════════════════════════════════════════════════════

  YOU HAVE COMPLETED THE BOOTSTRAP CHAIN.

  You now understand:
  ✓ The framework and how it works
  ✓ This project's context and goals (BACOWR v2.0 - SEO platform)
  ✓ Your available identities (PLANNER, ARCHITECT, BUILDER, TESTER, REVIEWER)
  ✓ The workflow to follow
  ✓ The constraints to obey

  YOU ARE READY TO WORK.

  Current state:
  - Project: BACOWR v2.0
  - Tech: Next.js 14 + TypeScript + Supabase
  - Identity: Select based on task
  - Workflow: Select based on task complexity

═══════════════════════════════════════════════════════════════════════════════
```
