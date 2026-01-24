# Enhancement 04: Exports Field Guidance

**Status:** ✅ Complete (PR #272)

## Overview

Improve documentation for the existing `exports` field in must_haves artifacts to encourage specific function/handler names instead of generic descriptions.

## Problem Statement

The `exports` field exists but examples show generic descriptions:

```yaml
artifacts:
  - path: "src/app/api/chat/route.ts"
    provides: "Message CRUD operations"
    exports: ["GET", "POST"]  # Generic HTTP methods
```

This doesn't enable verification of specific functionality. Better:

```yaml
artifacts:
  - path: "src/lib/auth.ts"
    provides: "Authentication service"
    exports: ["login", "logout", "refreshToken", "validateSession"]
```

## Proposed Solution

Add guidance that `exports` should list actual exported identifiers that can be verified:

```yaml
artifacts:
  - path: "src/lib/auth.ts"
    provides: "Authentication service"
    exports: ["login", "logout", "refreshToken"]  # Actual function names

  - path: "src/components/Button.tsx"
    provides: "Reusable button component"
    exports: ["Button", "ButtonProps"]  # Component + types

  - path: "src/hooks/useAuth.ts"
    provides: "Auth state hook"
    exports: ["useAuth", "AuthContext"]  # Hook + context
```

## Value

| Benefit | Impact |
|---------|--------|
| Specific verification | gsd-verifier can grep for actual exports |
| API surface documentation | Clear what each file exposes |
| Refactoring safety | Know exactly what's public interface |

## Files to Modify

| File | Changes |
|------|---------|
| `get-shit-done/templates/phase-prompt.md` | Update exports field documentation and examples |

## Implementation Details

### 1. Update Artifacts Documentation (~line 540)

Add guidance after the artifacts field description:

```markdown
**artifacts[].exports** - List actual exported identifiers, not descriptions:

```yaml
# GOOD - Specific, verifiable exports
exports: ["login", "logout", "refreshToken"]
exports: ["Button", "ButtonProps", "ButtonVariant"]
exports: ["useAuth", "AuthProvider", "AuthContext"]
exports: ["GET", "POST", "DELETE"]  # For API routes, HTTP methods are acceptable

# BAD - Generic descriptions
exports: ["auth functions"]
exports: ["main component"]
exports: ["CRUD operations"]
```

**Why specific exports matter:**
- gsd-verifier can grep for `export.*login` to verify
- Documents the public API surface
- Catches when implementation exists but isn't exported
```

### 2. Update Example Artifacts

Update the must_haves example to show specific exports:

```yaml
artifacts:
  - path: "src/components/Chat.tsx"
    provides: "Message list rendering"
    min_lines: 30
    exports: ["Chat", "ChatProps"]

  - path: "src/app/api/chat/route.ts"
    provides: "Message CRUD operations"
    exports: ["GET", "POST"]

  - path: "src/lib/messages.ts"
    provides: "Message service layer"
    exports: ["getMessages", "createMessage", "deleteMessage"]

  - path: "src/hooks/useMessages.ts"
    provides: "Message state management"
    exports: ["useMessages", "MessagesContext"]
```

### 3. Add to Field Descriptions Table

In the field descriptions table (~line 539), update the exports row:

```markdown
| `artifacts[].exports` | Optional. Actual exported identifiers to verify (function names, component names, types). |
```

## Acceptance Criteria

- [ ] Exports field documentation clarifies "actual identifiers, not descriptions"
- [ ] Good/bad examples added showing the difference
- [ ] Example artifacts updated with specific exports
- [ ] Explanation of why specific exports enable verification

## Dependencies

- None (documentation improvement only)

## Branch

```bash
git checkout -b feature/exports-field-guidance
```

## GSD Command

```
/gsd:quick Implement enhancement 04 from .planning/research/plan-context-improvements/04-exports-field-guidance.md
```
