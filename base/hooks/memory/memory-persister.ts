#!/usr/bin/env node
/**
 * Agent Memory Persister Hook
 *
 * Stop hook that validates agent-memory.json integrity after modifications.
 * Detects if the memory file was modified during the current turn and
 * confirms the change or warns about invalid JSON.
 *
 * Triggered by: Stop event (after Claude finishes a turn)
 * Output: Validation confirmation or warning
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ToolInput {
  file_path?: string;
  edits?: Array<{ file_path: string }>;
}

interface HookInput {
  session_id: string;
  tool_name: string;
  tool_input: ToolInput;
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

const VALID_STATUSES = ['active', 'idle', 'completed', 'blocked', 'error'];

function getModifiedPaths(data: HookInput): string[] {
  const paths: string[] = [];

  if (data.tool_name === 'MultiEdit' && data.tool_input.edits) {
    data.tool_input.edits.forEach((edit) => {
      if (edit.file_path) paths.push(edit.file_path);
    });
  } else if (data.tool_input.file_path) {
    paths.push(data.tool_input.file_path);
  }

  return paths;
}

function isMemoryFile(filePath: string): boolean {
  return filePath.endsWith('agent-memory.json');
}

function validateMemory(memory: AgentMemory): string[] {
  const errors: string[] = [];

  if (!memory.version) {
    errors.push('Missing "version" field');
  }

  if (typeof memory.agents !== 'object' || memory.agents === null) {
    errors.push('"agents" must be an object');
    return errors;
  }

  for (const [name, agent] of Object.entries(memory.agents)) {
    if (!agent.agent_name) {
      errors.push(`Agent "${name}": missing "agent_name"`);
    }
    if (!agent.agent_type) {
      errors.push(`Agent "${name}": missing "agent_type"`);
    }
    if (!agent.status) {
      errors.push(`Agent "${name}": missing "status"`);
    } else if (!VALID_STATUSES.includes(agent.status)) {
      errors.push(`Agent "${name}": invalid status "${agent.status}" (valid: ${VALID_STATUSES.join(', ')})`);
    }
    if (!agent.last_updated) {
      errors.push(`Agent "${name}": missing "last_updated"`);
    }
  }

  return errors;
}

function main() {
  try {
    const input = readFileSync(0, 'utf-8');
    const data: HookInput = JSON.parse(input);

    // Only process Write/Edit/MultiEdit tools
    const writingTools = ['Write', 'Edit', 'MultiEdit'];
    if (!writingTools.includes(data.tool_name)) {
      process.exit(0);
    }

    const modifiedPaths = getModifiedPaths(data);
    const memoryModified = modifiedPaths.some(isMemoryFile);

    if (!memoryModified) {
      process.exit(0);
    }

    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const memoryPath = join(projectDir, '.project', 'memory', 'agent-memory.json');

    if (!existsSync(memoryPath)) {
      console.log('\n⚠️ AGENT MEMORY: File was deleted or moved. Expected at .project/memory/agent-memory.json\n');
      process.exit(0);
    }

    // Validate JSON structure
    let memory: AgentMemory;
    try {
      const raw = readFileSync(memoryPath, 'utf-8');
      memory = JSON.parse(raw);
    } catch {
      let output = '\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += '❌ AGENT MEMORY: INVALID JSON\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += 'The agent-memory.json file contains invalid JSON.\n';
      output += 'Please fix the file before continuing.\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      console.log(output);
      process.exit(2); // Exit code 2 sends feedback to Claude
    }

    // Validate schema
    const validationErrors = validateMemory(memory);

    if (validationErrors.length > 0) {
      let output = '\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      output += '⚠️ AGENT MEMORY: VALIDATION WARNINGS\n';
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      validationErrors.forEach((err) => {
        output += `  • ${err}\n`;
      });
      output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      console.log(output);
      process.exit(2);
    }

    // All good — confirm
    const agentCount = Object.keys(memory.agents).length;
    let output = '\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += `✅ AGENT MEMORY: Updated (${agentCount} agent${agentCount !== 1 ? 's' : ''} stored)\n`;
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    console.log(output);
    process.exit(0);
  } catch {
    // Silent fail — memory persistence validation is not critical
    process.exit(0);
  }
}

main();
