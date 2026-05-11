#!/usr/bin/env node
/**
 * Agent Memory Loader Hook
 *
 * UserPromptSubmit hook that loads agent memory from the persistent store
 * and injects a status summary into the session context.
 *
 * Triggered by: Every user prompt submission
 * Output: Formatted agent status block (only if agents exist)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface HookInput {
  session_id: string;
  prompt: string;
  cwd: string;
}

interface AgentEntry {
  agent_type: string;
  agent_name: string;
  status: string;
  last_updated: string;
  context?: string;
  notes?: string;
}

interface AgentMemory {
  version: string;
  last_modified: string;
  agents: Record<string, AgentEntry>;
}

function formatTimeAgo(isoDate: string): string {
  if (!isoDate) return 'unknown';

  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  if (isNaN(diffMs) || diffMs < 0) return 'unknown';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function statusIcon(status: string): string {
  switch (status) {
    case 'active': return '🟢';
    case 'idle': return '🟡';
    case 'completed': return '✅';
    case 'blocked': return '🔴';
    case 'error': return '❌';
    default: return '⚪';
  }
}

function main() {
  try {
    const input = readFileSync(0, 'utf-8');
    JSON.parse(input) as HookInput;

    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const memoryPath = join(projectDir, '.project', 'memory', 'agent-memory.json');

    if (!existsSync(memoryPath)) {
      process.exit(0);
    }

    const raw = readFileSync(memoryPath, 'utf-8');
    const memory: AgentMemory = JSON.parse(raw);

    const agentNames = Object.keys(memory.agents);
    if (agentNames.length === 0) {
      process.exit(0);
    }

    let output = '\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '🧠 AGENT MEMORY STATUS\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    for (const name of agentNames) {
      const agent = memory.agents[name];
      const icon = statusIcon(agent.status);
      const timeAgo = formatTimeAgo(agent.last_updated);

      output += `  ${icon} ${agent.agent_name} [${agent.agent_type}] — ${agent.status} (${timeAgo})\n`;

      if (agent.context) {
        output += `     Context: ${agent.context}\n`;
      }
      if (agent.notes) {
        output += `     Notes: ${agent.notes}\n`;
      }
      output += '\n';
    }

    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += 'Use /memory to manage agent statuses\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    console.log(output);
    process.exit(0);
  } catch {
    // Silent fail — memory loading is not critical
    process.exit(0);
  }
}

main();
