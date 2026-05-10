#!/usr/bin/env bash
# Teammate Idle Handler
# Triggered when an agent teammate becomes idle in Agent Teams mode
# Logs idle status and suggests next actions for orchestrator agents
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec npx tsx "$DIR/teammate-idle-handler.ts"
