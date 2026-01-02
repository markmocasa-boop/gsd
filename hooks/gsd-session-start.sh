#!/bin/bash
# GSD Session Start Hook
# Captures tmux window ID for safe cleanup later

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Only run if in a GSD project
if [[ ! -d "$CWD/.planning" ]]; then
    exit 0
fi

# Capture tmux window ID (stable, never changes)
WINDOW_ID=$(tmux display-message -p '#I' 2>/dev/null || echo "")

if [[ -n "$WINDOW_ID" ]]; then
    echo "$WINDOW_ID" > "$CWD/.planning/.current-window-id"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Captured window ID: $WINDOW_ID for $CWD" >> ~/.claude/hooks/gsd-session.log
fi
