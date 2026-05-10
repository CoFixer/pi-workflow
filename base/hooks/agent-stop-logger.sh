#!/bin/bash
# Agent Stop Logger Hook Shell Wrapper
#
# Runs the TypeScript agent stop logger using tsx.
# This hook finalizes session data and updates monitoring dashboard.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the TypeScript file using tsx
cd "$SCRIPT_DIR" && npx tsx agent-stop-logger.ts
