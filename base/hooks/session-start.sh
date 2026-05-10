#!/bin/bash
set -e

# SessionStart hook: Display a compact guide of available magic keywords and commands
# NOTE: The prompt guidance system (skill-activation-prompt.ts) also shows a
# once-per-session reminder on the first prompt via getSessionStartNudge().
# This hook provides the initial banner before any prompt is typed.

CLAUDE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
STACK_CONFIG="$CLAUDE_DIR/stack-config.json"

# Detect enabled stacks using node for reliable JSON parsing
STACKS="base"
if [ -f "$STACK_CONFIG" ]; then
    STACKS=$(node -e "
        const c = require('$STACK_CONFIG');
        const s = (c.enabledStacks || []).filter(x => x !== 'base');
        console.log(s.length ? s.join(' + ') : 'base');
    " 2>/dev/null || echo "base")
fi

cat << EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.claude powered | ${STACKS}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick start (type keyword followed by colon):
  debug:    Debug systematically         api:       Build NestJS endpoints
  test:     Run tests                    commit:    Commit and PR to dev
  figma:    Convert Figma to React       team:      Launch agent team
  docs:     Generate documentation       plan:      Architecture first
  fix:      Root-cause bug fixing        start:     Pull + start servers

Type /skills for the full catalog with recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
