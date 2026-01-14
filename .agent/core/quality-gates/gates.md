# Quality Gates

Quality gates are automated checks that code must pass before delivery.

---

## Gate Levels

### Minimal
**Always applies.** Non-negotiable.

```yaml
minimal:
  - id: syntax_valid
    description: Code must parse without errors
    check: "Code compiles/parses successfully"
    
  - id: no_hardcoded_secrets
    description: No API keys, passwords, or tokens in code
    check: "No strings matching secret patterns"
    patterns:
      - "sk-[a-zA-Z0-9]+"          # OpenAI keys
      - "sk_live_[a-zA-Z0-9]+"     # Stripe keys
      - "ghp_[a-zA-Z0-9]+"         # GitHub tokens
      - "password\\s*=\\s*['\"]"   # Hardcoded passwords
```

### Standard
**Default for most projects.** Ensures completeness.

```yaml
standard:
  includes: minimal
  
  - id: no_placeholders
    description: No TODO, FIXME, ..., or stub implementations
    check: "No placeholder patterns found"
    patterns:
      - "TODO"
      - "FIXME"
      - "XXX"
      - "\\.\\.\\."
      - "// implement"
      - "pass  # "
      - "raise NotImplementedError"
      
  - id: imports_complete
    description: All imports resolve to existing modules
    check: "No import errors"
    
  - id: code_complete
    description: All functions have implementations
    check: "No empty function bodies"
    
  - id: error_handling
    description: Async operations have error handling
    check: "try/catch or .catch() present"
```

### Thorough
**For complex projects.** Adds design quality checks.

```yaml
thorough:
  includes: standard
  
  - id: input_validation
    description: All external input is validated
    check: "Validation present on API endpoints and forms"
    
  - id: consistent_naming
    description: Names follow project conventions
    check: "camelCase/snake_case consistent"
    
  - id: no_duplicate_code
    description: No copy-pasted code blocks
    check: "No identical blocks >10 lines"
    
  - id: appropriate_logging
    description: Errors are logged appropriately
    check: "console.error or logger.error on catch blocks"
```

### Production
**For enterprise/critical paths.** Full verification.

```yaml
production:
  includes: thorough
  
  - id: security_review
    description: OWASP Top 10 considerations addressed
    check: "Security patterns followed"
    items:
      - SQL injection prevented (parameterized queries)
      - XSS prevented (output encoding)
      - CSRF protection present
      - Authentication on protected routes
      - Authorization checks present
      
  - id: audit_logging
    description: Sensitive operations are logged
    check: "Audit log calls present"
    
  - id: backward_compatible
    description: Changes don't break existing functionality
    check: "API contracts maintained"
    
  - id: rollback_possible
    description: Changes can be reverted
    check: "Feature flags or reversible migrations"
```

---

## Applying Gates

### In Workflows

Each workflow specifies which gate level to use:

```yaml
quick-fix:
  quality_gate: minimal

feature-build:
  quality_gate: standard

full-stack:
  quality_gate: thorough

enterprise:
  quality_gate: production
```

### Override in Project

Add to `05-CONSTRAINTS.md`:

```markdown
## Quality Gate Override

This project requires: **thorough**
```

---

## Gate Check Process

Before delivery, the agent should verify:

### For Minimal
```markdown
## Quality Check: Minimal

- [ ] Code parses without errors
- [ ] No hardcoded secrets found

All checks passed? → Deliver
```

### For Standard
```markdown
## Quality Check: Standard

- [ ] Code parses without errors
- [ ] No hardcoded secrets found
- [ ] No TODO/FIXME/... placeholders
- [ ] All imports resolve
- [ ] All functions implemented
- [ ] Error handling present

All checks passed? → Deliver
```

### For Thorough
```markdown
## Quality Check: Thorough

[Standard checks +]
- [ ] Input validation present
- [ ] Naming conventions followed
- [ ] No duplicate code
- [ ] Appropriate logging

All checks passed? → Deliver
```

### For Production
```markdown
## Quality Check: Production

[Thorough checks +]
- [ ] Security review passed
- [ ] Audit logging present
- [ ] Backward compatible
- [ ] Rollback possible

All checks passed? → Deliver
```

---

## Failure Handling

If a gate check fails:

1. **Identify** which check failed
2. **Fix** the issue before delivery
3. **Re-verify** all checks
4. **Document** any exceptions (if approved)

### Exception Process

If a check must be bypassed:

```markdown
## Gate Exception

**Check:** no_placeholders
**Exception:** TODO in deprecated function
**Reason:** Function being removed in next sprint
**Approved by:** [user confirmation]
```

---

## Custom Gates

Add project-specific gates in `05-CONSTRAINTS.md`:

```markdown
## Custom Quality Gates

- [ ] All components have PropTypes/TypeScript types
- [ ] Database queries use the ORM, not raw SQL
- [ ] API responses follow the standard envelope format
```
