#!/bin/bash
# Agent Activity Logger Hook Shell Wrapper
#
# Runs the TypeScript agent activity logger using tsx.
# This hook logs Task tool invocations for agent monitoring.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the TypeScript file using tsx
cd "$SCRIPT_DIR" && npx tsx agent-activity-logger.ts
