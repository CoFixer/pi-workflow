import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TeammateIdleInput {
  session_id?: string;
  agent_name?: string;
  idle_since?: string;
  tool_name?: string;
}

function main(): void {
  let input: TeammateIdleInput = {};

  try {
    const rawInput = readFileSync(0, 'utf-8').trim();
    if (rawInput) {
      input = JSON.parse(rawInput);
    }
  } catch {
    // No input or invalid JSON — continue with defaults
  }

  const agentName = input.agent_name || 'unknown';
  const timestamp = new Date().toISOString();

  // Log to team coordination file
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const logDir = join(projectDir, '.claude-project', 'logs');

  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch {
      // Can't create log dir — skip logging
    }
  }

  const logFile = join(logDir, 'team-activity.log');
  const logEntry = `[${timestamp}] IDLE: Agent "${agentName}" became idle\n`;

  try {
    appendFileSync(logFile, logEntry);
  } catch {
    // Non-critical — skip if can't write
  }

  // Output coordination message
  // Orchestrator agents get a prompt to check task completion
  const orchestratorAgents = ['ticket-fixer'];

  if (orchestratorAgents.includes(agentName)) {
    const result = {
      message: `Orchestrator "${agentName}" is idle. Check if all delegated tasks are complete, then summarize results and update ticket status.`
    };
    process.stdout.write(JSON.stringify(result));
  }

  // Exit cleanly — non-blocking
  process.exit(0);
}

main();
