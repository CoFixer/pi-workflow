#!/bin/bash
# ============================================================
# autopilot.sh — Persistent team mode with auto-resume
# ============================================================
#
# Wraps Claude Code in a tmux session. Detects rate-limit exits,
# waits with exponential backoff, and auto-resumes the team loop.
#
# Usage:
#   .pi/base/scripts/autopilot.sh <team-args...>
#
# Examples:
#   ./autopilot.sh --prd .project/prd/my-feature.md
#   ./autopilot.sh --prd ./prd.md --split-dev
#
# Requirements: tmux, claude CLI
# Monitor:     tmux attach -t claude-autopilot
# Stop:        tmux send-keys -t claude-autopilot C-c
# ============================================================

set -euo pipefail

# --- Configuration ---
SESSION_NAME="claude-autopilot"
LOG_FILE="/tmp/claude-autopilot.log"
WAIT_SECONDS=60
MAX_WAIT=300
MAX_RETRIES=50
RETRY_COUNT=0
TEAM_ARGS="$*"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# --- Preflight checks ---
if ! command -v tmux &>/dev/null; then
    echo -e "${RED}Error: tmux is required but not installed.${NC}"
    echo "Install: brew install tmux (macOS) or apt install tmux (Linux)"
    exit 1
fi

if ! command -v claude &>/dev/null; then
    echo -e "${RED}Error: claude CLI is required but not installed.${NC}"
    exit 1
fi

# --- Initialize log ---
echo "" > "$LOG_FILE"
log "${GREEN}Autopilot starting${NC}"
log "Args: $TEAM_ARGS"
log "Session: $SESSION_NAME"
log "Max retries: $MAX_RETRIES"

# --- Check for existing session ---
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    log "${YELLOW}Existing session found. Attaching...${NC}"
    tmux attach -t "$SESSION_NAME"
    exit 0
fi

# --- Main loop (runs inside tmux) ---
run_loop() {
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        log "${GREEN}--- Run #$((RETRY_COUNT + 1)) ---${NC}"

        # Run claude with team command
        set +e
        claude -p "team: start --autopilot $TEAM_ARGS" 2>&1 | tee -a "$LOG_FILE"
        EXIT_CODE=$?
        set -e

        # Check for rate limit (check last 50 lines for broader coverage)
        if tail -50 "$LOG_FILE" | grep -qi "rate.limit\|429\|too many requests\|quota exceeded\|overloaded\|capacity\|throttl\|resource_exhausted\|server_busy"; then
            RETRY_COUNT=$((RETRY_COUNT + 1))
            log "${YELLOW}[autopilot] Rate limited. Waiting ${WAIT_SECONDS}s... (retry $RETRY_COUNT/$MAX_RETRIES)${NC}"
            sleep "$WAIT_SECONDS"
            # Exponential backoff capped at MAX_WAIT
            WAIT_SECONDS=$((WAIT_SECONDS * 2))
            [ "$WAIT_SECONDS" -gt "$MAX_WAIT" ] && WAIT_SECONDS=$MAX_WAIT
            continue
        fi

        # Check for successful completion (exact marker only)
        if tail -20 "$LOG_FILE" | grep -q "TEAM_COMPLETE"; then
            log "${GREEN}[autopilot] Team completed successfully.${NC}"
            break
        fi

        # Check for manual stop
        if tail -20 "$LOG_FILE" | grep -qi "shutdown.*complete\|team.*deleted\|TeamDelete"; then
            log "${GREEN}[autopilot] Team stopped by user.${NC}"
            break
        fi

        # Also check status file — if all items are done, no need to retry
        STATUS_FILES=$(find .project/status/ -name "TEAM_STATUS.md" 2>/dev/null)
        if [ -n "$STATUS_FILES" ]; then
            PENDING=$(grep -c "PENDING" $STATUS_FILES 2>/dev/null || true)
            if [ "$PENDING" = "0" ] && [ $EXIT_CODE -eq 0 ]; then
                log "${GREEN}[autopilot] No PENDING items in status file. Team complete.${NC}"
                break
            fi
        fi

        # Unexpected exit — brief wait and retry (always resume)
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log "${YELLOW}[autopilot] Unexpected exit (code $EXIT_CODE). Resuming in 30s... (retry $RETRY_COUNT/$MAX_RETRIES)${NC}"
        sleep 30
        # Reset backoff on non-rate-limit retries
        WAIT_SECONDS=60
    done

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        log "${RED}[autopilot] Max retries ($MAX_RETRIES) reached. Stopping.${NC}"
    fi

    log "Autopilot session ended. Log: $LOG_FILE"
}

# --- Launch in tmux ---
log "Launching tmux session: $SESSION_NAME"
tmux new-session -d -s "$SESSION_NAME" "bash -c '$(declare -f log run_loop); LOG_FILE=\"$LOG_FILE\" WAIT_SECONDS=$WAIT_SECONDS MAX_WAIT=$MAX_WAIT MAX_RETRIES=$MAX_RETRIES RETRY_COUNT=$RETRY_COUNT TEAM_ARGS=\"$TEAM_ARGS\" RED=\"$RED\" GREEN=\"$GREEN\" YELLOW=\"$YELLOW\" NC=\"$NC\" SESSION_NAME=\"$SESSION_NAME\" run_loop'"

echo ""
echo -e "${GREEN}Autopilot launched in tmux session: $SESSION_NAME${NC}"
echo ""
echo "  Monitor:  tmux attach -t $SESSION_NAME"
echo "  Logs:     tail -f $LOG_FILE"
echo "  Stop:     tmux send-keys -t $SESSION_NAME C-c"
echo ""
