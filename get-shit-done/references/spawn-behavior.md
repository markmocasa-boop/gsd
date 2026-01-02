# GSD Spawn Behavior Reference

## Yolo Mode Spawn Protocol

**When mode is `yolo` in `.planning/config.json`, Claude outputs a spawn marker and the Stop hook handles everything.**

No tmux commands. No variation. Just output the marker.

## How to Spawn

At the end of any workflow with a handoff, output this marker:

```
GSD_SPAWN: /gsd:next-command [args]
```

Examples:
```
GSD_SPAWN: /gsd:execute-plan .planning/phases/05/05-01-PLAN.md
GSD_SPAWN: /gsd:plan-phase 6
GSD_SPAWN: /gsd:progress
GSD_SPAWN: /gsd:complete-milestone
```

Then stop (the hook fires when Claude finishes responding). The Stop hook will:
1. Parse the marker from the transcript
2. Spawn a new tmux window with the command
3. Verify the new window exists
4. Send `/exit` to the source window (which closes Claude and the window)

## Checking Mode

```bash
MODE=$(cat .planning/config.json 2>/dev/null | jq -r '.mode // "interactive"')
if [[ "$MODE" == "yolo" ]]; then
  # Output GSD_SPAWN marker
else
  # Show manual handoff
fi
```

## Workflow Handoffs

| From Workflow | Next Command |
|---------------|--------------|
| discuss-milestone | `/gsd:new-milestone [context]` |
| create-milestone | `/gsd:plan-phase [first-phase]` |
| discuss-phase | `/gsd:plan-phase [N]` |
| plan-phase | `/gsd:execute-plan [path]` |
| execute-phase (plan done) | `/gsd:execute-plan [next-path]` |
| execute-phase (phase done) | `/gsd:plan-phase [N+1]` |
| execute-phase (milestone done) | `/gsd:complete-milestone` |
| complete-milestone | `/gsd:discuss-milestone` |
| transition | `/gsd:plan-phase [N+1]` |

## Key Principles

**In yolo mode, the user never types commands manually between workflow steps.**

Claude:
1. Finishes current workflow
2. Outputs `GSD_SPAWN: /gsd:next-command`
3. Exits normally
4. Hook spawns new window and kills old one

**Claude NEVER runs tmux commands directly** - this prevents variation and breakage.

## Hook Architecture

Three hooks work together:

1. **SessionStart** (`gsd-session-start.sh`): Captures tmux window ID to `.planning/.current-window-id`
2. **Stop** (`gsd-stop.sh`): Fires when Claude finishes responding. Checks for GSD_SPAWN marker, spawns successor, sends /exit to source
3. **SessionEnd** (`gsd-session-end.sh`): Fallback cleanup if session ends without Stop hook (e.g., manual /exit)

**Why Stop, not SessionEnd?**
- SessionEnd only fires when Claude **exits** (the process ends)
- Stop fires every time Claude **finishes responding** (returns to prompt)
- We need to spawn when Claude outputs the marker, while it's still at the prompt

Window ID is stable (integer), window names can change. Always reference by ID.

## Safety Guarantees

- New window is verified to exist BEFORE sending /exit to old window
- Uses window ID (`:N`), not name (avoids wrong-window bugs)
- Duplicate spawn prevention: stores processed markers in `.planning/.spawn-marker-processed`
- If spawn fails, source window stays open for debugging

## Hook Data

The Stop hook receives JSON input with:
- `cwd`: Current working directory
- `transcript_path`: Path to the JSONL transcript file

Example: `/Users/bob/.claude/projects/-Users-bob-code-myproject/abc123.jsonl`
