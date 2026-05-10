#!/bin/bash
# Status Auto-Updater Hook Shell Wrapper
#
# Runs the TypeScript status auto-updater using tsx.
# This hook automatically updates status documentation when
# controllers, pages, or services are modified.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the TypeScript file using tsx
cd "$SCRIPT_DIR" && npx tsx status-auto-updater.ts
