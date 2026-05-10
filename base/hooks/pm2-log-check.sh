#!/bin/bash
# PM2 Backend Log Check Hook
# Runs on Stop event after backend file edits
# Waits for nodemon restart and checks for crash indicators

[ -n "$CI" ] && exit 0
[ -n "$SKIP_PM2_CHECK" ] && exit 0

CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$HOME/project}"
HOOK_INPUT=$(cat)

PM2_PROCESS_NAME="ah-backend"
RESTART_WAIT_SECONDS=5
LOG_FILE="$HOME/.pm2/logs/${PM2_PROCESS_NAME}-out.log"
ERR_LOG_FILE="$HOME/.pm2/logs/${PM2_PROCESS_NAME}-error.log"

TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_input // {}')

case "$TOOL_NAME" in
    Write|Edit|MultiEdit) ;;
    *) exit 0 ;;
esac

# Extract file paths
if [ "$TOOL_NAME" = "MultiEdit" ]; then
    FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.edits[].file_path // empty')
else
    FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')
fi

# Only proceed if a backend .ts file was modified
HAS_BACKEND_FILE=false
while IFS= read -r file_path; do
    [ -z "$file_path" ] && continue
    relative_path="${file_path#$CLAUDE_PROJECT_DIR/}"
    if [[ "$relative_path" == backend/*.ts ]] || [[ "$relative_path" == backend/**/*.ts ]]; then
        HAS_BACKEND_FILE=true
        break
    fi
done <<< "$FILE_PATHS"
[ "$HAS_BACKEND_FILE" = false ] && exit 0

# Check PM2 is running and process exists
command -v pm2 &>/dev/null || exit 0
pm2 jlist 2>/dev/null | jq -e ".[] | select(.name==\"$PM2_PROCESS_NAME\")" &>/dev/null || exit 0

# Record log sizes before waiting
LOG_SIZE_BEFORE=0
ERR_SIZE_BEFORE=0
[ -f "$LOG_FILE" ] && LOG_SIZE_BEFORE=$(wc -c < "$LOG_FILE" | tr -d ' ')
[ -f "$ERR_LOG_FILE" ] && ERR_SIZE_BEFORE=$(wc -c < "$ERR_LOG_FILE" | tr -d ' ')

echo "  Waiting ${RESTART_WAIT_SECONDS}s for backend restart..." >&2
sleep "$RESTART_WAIT_SECONDS"

# Read only NEW log lines
NEW_OUT_LOGS=""
NEW_ERR_LOGS=""
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE_AFTER=$(wc -c < "$LOG_FILE" | tr -d ' ')
    if [ "$LOG_SIZE_AFTER" -gt "$LOG_SIZE_BEFORE" ]; then
        NEW_OUT_LOGS=$(tail -c $((LOG_SIZE_AFTER - LOG_SIZE_BEFORE)) "$LOG_FILE")
    fi
fi
if [ -f "$ERR_LOG_FILE" ]; then
    ERR_SIZE_AFTER=$(wc -c < "$ERR_LOG_FILE" | tr -d ' ')
    if [ "$ERR_SIZE_AFTER" -gt "$ERR_SIZE_BEFORE" ]; then
        NEW_ERR_LOGS=$(tail -c $((ERR_SIZE_AFTER - ERR_SIZE_BEFORE)) "$ERR_LOG_FILE")
    fi
fi

ALL_NEW_LOGS="${NEW_OUT_LOGS}
${NEW_ERR_LOGS}"

# No new logs = still compiling, not an error (tsc-check catches compile errors)
[ -z "$(echo "$ALL_NEW_LOGS" | tr -d '[:space:]')" ] && exit 0

# Success: app started cleanly
if echo "$ALL_NEW_LOGS" | grep -q "Application is running on:"; then
    echo "  Backend restarted successfully" >&2
    exit 0
fi

# Check for crash patterns
CRASH_PATTERNS="app crashed|Cannot find module|SyntaxError:|TypeError:|ReferenceError:|EADDRINUSE|ECONNREFUSED|UnhandledPromiseRejection|error TS[0-9]"
FOUND_ERRORS=$(echo "$ALL_NEW_LOGS" | grep -iE "$CRASH_PATTERNS" 2>/dev/null | sort -u | head -15)

if [ -n "$FOUND_ERRORS" ]; then
    {
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "PM2 BACKEND CRASH DETECTED (ah-backend)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "$FOUND_ERRORS" | sed 's/^/  /'
        echo ""
        echo "Full logs: pm2 logs ah-backend --lines 50 --nostream"
        echo ""
        echo "FIX THE CRASH BEFORE MOVING ON."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    } >&2
    exit 1
fi

exit 0
