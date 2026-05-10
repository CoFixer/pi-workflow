#!/bin/bash
set -e

cd "$CLAUDE_PROJECT_DIR/.pi/base/hooks"
cat | npx tsx doc-update-reminder.ts
