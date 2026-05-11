import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TaskCompletedInput {
  session_id?: string;
  agent_name?: string;
  task_summary?: string;
  files_changed?: string[];
  tool_name?: string;
}

function main(): void {
  let input: TaskCompletedInput = {};

  try {
    const rawInput = readFileSync(0, 'utf-8').trim();
    if (rawInput) {
      input = JSON.parse(rawInput);
    }
  } catch {
    // No input or invalid JSON — continue with defaults
  }

  const agentName = input.agent_name || 'unknown';
  const taskSummary = input.task_summary || 'task completed';
  const filesChanged = input.files_changed?.length || 0;
  const timestamp = new Date().toISOString();

  // Log to team coordination file
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const logDir = join(projectDir, '.project', 'logs');

  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch {
      // Can't create log dir — skip logging
    }
  }

  const logFile = join(logDir, 'team-activity.log');
  const logEntry = `[${timestamp}] COMPLETED: Agent "${agentName}" finished: ${taskSummary} (${filesChanged} files changed)\n`;

  try {
    appendFileSync(logFile, logEntry);
  } catch {
    // Non-critical — skip if can't write
  }

  // Output completion message for team coordination
  const result = {
    message: `Task completed by ${agentName}: ${taskSummary}${filesChanged > 0 ? ` (${filesChanged} files changed)` : ''}`
  };
  process.stdout.write(JSON.stringify(result));

  // Exit cleanly — non-blocking
  process.exit(0);
}

main();
