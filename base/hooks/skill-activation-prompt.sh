#!/bin/bash
set -e

cd "$CLAUDE_PROJECT_DIR/.pi/hooks"
cat | npx tsx skill-activation-prompt.ts
