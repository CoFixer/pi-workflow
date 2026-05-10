#!/usr/bin/env bash
# Task Completed Handler
# Triggered when an agent task is marked as completed in Agent Teams mode
# Logs completion and outputs coordination message
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec npx tsx "$DIR/task-completed-handler.ts"
