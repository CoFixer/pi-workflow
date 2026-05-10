#!/bin/bash

# Auto-reflect hook - analyzes session for learnings on Stop event
# Only runs if auto-reflect is enabled via /reflect-on

# Skip in CI environments (GitHub Actions, etc.)
[ -n "$CI" ] && exit 0

# Skip if environment variable is set
if [ -n "$SKIP_AUTO_REFLECT" ]; then
    exit 0
fi

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

cat | npx tsx auto-reflect.ts
