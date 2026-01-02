#!/bin/bash
# GSD Session End Hook
# Detects GSD_SPAWN marker and handles spawn + cleanup

set -e

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
LOGFILE="$HOME/.claude/hooks/gsd-session.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOGFILE"
}

# Only run if in a GSD project
if [[ ! -d "$CWD/.planning" ]]; then
    exit 0
fi

# Check if yolo/spawn mode is enabled
MODE=$(cat "$CWD/.planning/config.json" 2>/dev/null | jq -r '.mode // "interactive"')
SPAWN_ENABLED=$(cat "$CWD/.planning/config.json" 2>/dev/null | jq -r '.spawn.enabled // false')

if [[ "$MODE" != "yolo" && "$SPAWN_ENABLED" != "true" ]]; then
    log "Skip: not yolo mode (mode=$MODE, spawn=$SPAWN_ENABLED)"
    exit 0
fi

# Read source window ID (captured at session start)
SOURCE_ID_FILE="$CWD/.planning/.current-window-id"
if [[ ! -f "$SOURCE_ID_FILE" ]]; then
    log "Skip: no window ID captured at session start"
    exit 0
fi
SOURCE_WINDOW_ID=$(cat "$SOURCE_ID_FILE")
log "Source window ID: $SOURCE_WINDOW_ID"

# Parse transcript for GSD_SPAWN marker
# Format: GSD_SPAWN: /gsd:command [args]
if [[ ! -f "$TRANSCRIPT_PATH" ]]; then
    log "Skip: transcript not found at $TRANSCRIPT_PATH"
    exit 0
fi

# Extract last 500 lines of transcript and look for spawn marker
SPAWN_LINE=$(tail -500 "$TRANSCRIPT_PATH" 2>/dev/null | \
    jq -r '.message.content[]?.text // empty' 2>/dev/null | \
    grep -o 'GSD_SPAWN: /gsd:[^ ]*[^`]*' | \
    tail -1 || echo "")

if [[ -z "$SPAWN_LINE" ]]; then
    log "Skip: no GSD_SPAWN marker found in transcript"
    exit 0
fi

# Parse the command
NEXT_CMD=$(echo "$SPAWN_LINE" | sed 's/^GSD_SPAWN: //' | sed 's/[[:space:]]*$//')
log "Found spawn command: $NEXT_CMD"

# Generate successor window name
PROJECT_NAME=$(basename "$CWD")
TIMESTAMP=$(date +%s)
SUCCESSOR_NAME="${PROJECT_NAME}-${TIMESTAMP}"

# Spawn successor window
log "Spawning: $SUCCESSOR_NAME with command: $NEXT_CMD"
tmux new-window -n "$SUCCESSOR_NAME" -c "$CWD" \
    "claude --dangerously-skip-permissions --chrome '$NEXT_CMD'"

# Brief delay to let window initialize
sleep 1

# Verify successor exists before killing source
if tmux list-windows -F '#W' | grep -q "^${SUCCESSOR_NAME}$"; then
    log "Successor verified: $SUCCESSOR_NAME"

    # Send notification
    osascript -e "display notification \"$NEXT_CMD\" with title \"GSD: $PROJECT_NAME\"" 2>/dev/null || true

    # Kill source window by ID (delayed to allow this script to complete)
    (
        sleep 2
        tmux kill-window -t ":$SOURCE_WINDOW_ID" 2>/dev/null && \
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Killed source window ID: $SOURCE_WINDOW_ID" >> "$LOGFILE" || \
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Source window already gone: $SOURCE_WINDOW_ID" >> "$LOGFILE"
    ) &

    log "Cleanup scheduled for window ID: $SOURCE_WINDOW_ID"
else
    log "ERROR: Successor not found, keeping source window open"
fi

# Clean up the window ID file
rm -f "$SOURCE_ID_FILE"
