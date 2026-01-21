---
name: gsd:check-plan
description: Check your Claude Code plan type and get rate limit guidance for GSD usage
argument-hint: ""
allowed-tools: [Bash, Read, Write]
---

<objective>
Check the user's Claude Code plan type (Team vs Personal) and provide specific guidance on rate limit implications for GSD's multi-agent workflow.

GSD spawns many parallel subagents (research, planning, execution, verification) which can exhaust rate limits on Team plans faster than typical Claude Code usage. This command helps users understand their plan's limitations and provides actionable recommendations.

**When to use:**
- During initial project setup to understand plan implications
- When experiencing rate limit issues
- To check if plan type has changed
- To get recommendations for reducing GSD usage
</objective>

<execution_context>
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<context>
**Plan Detection Method:**

Parse `/config` command output for:
- `Login method: Claude Team Account` → Team plan
- Other login methods → Personal plan (assumed)

**Rate Limit Context:**

Team plans have lower rate limits than personal plans. GSD's multi-agent orchestration is particularly demanding:

| Stage | Agent Usage |
|-------|-------------|
| Research | 4 parallel researchers |
| Planning | 1 planner + 1 checker (iterative verification) |
| Execution | N executors (wave-based parallelization) |
| Verification | 1 verifier + potential debug agents |

Personal plans (Pro, Pro Max x5, Pro Max x20) all have higher rate limits suitable for GSD.
</context>

<process>

<step name="check_project_active">
Check if this is an active GSD project:

```bash
if [ ! -f .planning/config.json ]; then
  echo "No GSD project found in current directory."
  echo ""
  echo "This command is only useful within an active GSD project."
  echo "Run /gsd:new-project to initialize a project first."
  exit 0
fi
```

If no project found, exit gracefully with guidance.
</step>

<step name="get_config_output">
Attempt automated plan type detection using environment variables and session data:

```bash
# Check environment variables (Claude Code may expose plan info)
PLAN_TYPE="unknown"

if [ -n "$CLAUDE_TEAM_ACCOUNT" ] && [ "$CLAUDE_TEAM_ACCOUNT" = "true" ]; then
  PLAN_TYPE="team"
fi

# Try reading from Claude Code session files if env var not set
if [ "$PLAN_TYPE" = "unknown" ]; then
  CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  if [ -f "$CLAUDE_DIR/session.json" ]; then
    # Look for team account indicators in session file
    if grep -q '"loginMethod".*[Tt]eam' "$CLAUDE_DIR/session.json" 2>/dev/null; then
      PLAN_TYPE="team"
    elif grep -q '"accountType".*"team"' "$CLAUDE_DIR/session.json" 2>/dev/null; then
      PLAN_TYPE="team"
    elif grep -q '"organization"' "$CLAUDE_DIR/session.json" 2>/dev/null; then
      # Presence of organization field suggests team account
      PLAN_TYPE="team"
    else
      # No team indicators found, likely personal account
      PLAN_TYPE="personal"
    fi
  fi
fi

echo "Detected plan type: $PLAN_TYPE"
```

**Detection Strategy:**
1. Check `CLAUDE_TEAM_ACCOUNT` environment variable
2. Parse `~/.claude/session.json` for team account indicators
3. Return `unknown` only if both methods fail
</step>


<step name="display_results">
Show formatted output based on detected plan type.

**For Team Plans:**

```
─────────────────────────────────────────────────────────
📋 Claude Code Plan Check

Login method: Claude Team Account
Organization: [parsed from /config]

⚠️  Team Plan Detected

GSD's multi-agent workflow spawns many subagents which can
consume rate limits quickly:

Stage                   Agent Usage
─────────────────────────────────────────────────────────
Research                4 parallel researchers
Planning                1 planner + 1 checker (loops)
Execution               N executors (wave-based)
Verification            1 verifier + debug agents

Team plans have lower rate limits than personal plans.

Recommendations:

1. Consider a personal plan for GSD usage:
   • Pro (Max x5) - $150/mo - 5× higher limits
   • Pro (Max x20) - $300/mo - 20× higher limits

   Personal plans support multiple projects and have
   higher quality limits.

2. Reduce GSD agent usage:
   Run /gsd:settings to disable optional workflow agents:
   • Research agents (skip domain research)
   • Plan checking (skip verification loops)
   • Phase verifier (skip automated verification)

   Estimated reduction: ~60% fewer subagent spawns

─────────────────────────────────────────────────────────
```

**For Personal Plans:**

```
─────────────────────────────────────────────────────────
📋 Claude Code Plan Check

Login method: Personal Account

✓ Personal Plan Detected

Your personal plan is well-suited for GSD's multi-agent
workflow. Personal plans have higher rate limits than team
plans, providing better support for:

• Parallel research agents
• Iterative plan verification
• Wave-based execution
• Automated verification with debugging

If you experience rate limits:
  Run /gsd:settings to adjust workflow agents as needed.

─────────────────────────────────────────────────────────
```

**For Unknown:**

```
─────────────────────────────────────────────────────────
📋 Claude Code Plan Check

Could not automatically detect your plan type.

To check manually:
1. Run /config in Claude Code
2. Look for "Login method:" line
3. Team accounts may hit rate limits faster with GSD

If you're on a Team account and experiencing rate limits:
  Run /gsd:settings to reduce agent usage.

─────────────────────────────────────────────────────────
```
</step>

<step name="update_config">
Update `.planning/config.json` with detected plan type:

```bash
# Read existing config
CONFIG_JSON=$(cat .planning/config.json)

# Update with detected plan type (use jq or manual JSON manipulation)
# Add/update fields:
#   "claude_plan_type": "team" | "personal" | "unknown"
#   "team_plan_checked_at": "2026-01-21T10:30:00Z"

# If team_plan_warning_shown doesn't exist, add it as false
# This allows the SessionStart hook to show the warning

# Write back to config.json
```

**Implementation note:** Update config.json preserving existing fields, adding:
- `claude_plan_type`: detected value
- `team_plan_checked_at`: current timestamp
- `team_plan_warning_shown`: false (reset to allow hook notification if needed)
</step>

<step name="complete">
Complete the command after displaying results and updating config.

No user interaction required. The displayed information includes actionable recommendations:
- For Team plans: Suggests running `/gsd:settings` to reduce usage
- For Personal plans: Confirms plan is well-suited for GSD
- For Unknown: Provides manual verification steps

Users can choose to follow recommendations at their discretion.
</step>

</process>

<success_criteria>
- [ ] Plan type detected automatically from environment/session data
- [ ] Appropriate guidance displayed based on plan type (team/personal/unknown)
- [ ] `.planning/config.json` updated with plan type and timestamp
- [ ] Actionable recommendations provided in output (no user prompts required)
- [ ] Command exits gracefully if no GSD project found
- [ ] Handles detection failures without crashing (defaults to 'unknown')
</success_criteria>
