#!/bin/bash
set -e

cd "$CLAUDE_PROJECT_DIR/.pi/hooks/memory"
cat | npx tsx memory-loader.ts
