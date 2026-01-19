# Phase 2: Document Validation - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate user-provided documentation against actual codebase before integration. Cross-check claims, flag stale or contradictory information, and let user decide how to handle issues. Does not include editing docs or suggesting fixes — only validation and user decisions.

</domain>

<decisions>
## Implementation Decisions

### Claim extraction
- Extract ALL verifiable technical claims: file paths, folder structure, function names, class names, API signatures, exports, config values, environment variables
- Code comments should be read as additional context when verifying claims
- Claude's discretion on how to handle prose/architectural descriptions

### Validation depth
- Content peek: verify file exists AND contains expected exports/functions
- Location match for API/function claims: function must exist in the specific file mentioned
- Semantic check: flag when doc implies something the code doesn't actually do
- Version-specific claims (e.g., "uses React 18"): note as "version claim — not verified" rather than cross-referencing deps

### Confidence scoring
- Per-claim confidence levels (HIGH/MEDIUM/LOW)
- Only show problems to user — LOW confidence or flagged issues
- Claude's discretion on exact thresholds for HIGH vs MEDIUM vs LOW

### Issue presentation
- Show all issues at once (not one at a time)
- Minimal detail: claim text + confidence level only
- User choices: Include / Exclude / Mark as "known stale"
- On clean pass: show summary ("X claims verified across Y docs")

### Claude's Discretion
- Handling prose/architectural descriptions
- External reference handling (URLs, external APIs, third-party packages)
- Exact confidence thresholds
- Formatting of issue list

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-document-validation*
*Context gathered: 2026-01-19*
