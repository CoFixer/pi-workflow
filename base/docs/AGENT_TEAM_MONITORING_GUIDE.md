# Agent & Team Monitoring Guide

How to monitor individual agents and agent teams while they work in Claude Code.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Monitoring Individual Agents](#monitoring-individual-agents)
- [Monitoring Agent Teams](#monitoring-agent-teams)
- [Task List Monitoring](#task-list-monitoring)
- [Idle Notifications](#idle-notifications)
- [Team Discovery](#team-discovery)
- [Hooks for Automated Monitoring](#hooks-for-automated-monitoring)
- [Persistent Task Lists](#persistent-task-lists)
- [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+T** | Toggle task list display (up to 10 tasks) |
| **Ctrl+B** | Move running task to background |
| **Ctrl+O** | Toggle verbose output (see all tool calls) |
| **Shift+Up/Down** | Cycle through teammates (in-process mode) |
| **Enter** | Open selected teammate's full session |
| **Escape** | Interrupt teammate / return to lead |

### Slash Commands

| Command | What It Does |
|---------|-------------|
| `/tasks` | List all background tasks with IDs and status |
| `/cost` | Show token usage per agent and total costs |
| `/context` | See context window usage as a colored grid |

---

## Monitoring Individual Agents

### Background vs Foreground

**Foreground agents** (default):
- Block the main conversation until complete
- You see all tool uses and outputs in real-time
- Permission prompts pass through to you

**Background agents** (`run_in_background: true`):
- Run concurrently while you keep working
- Permissions are pre-approved before launch
- Returns a **task ID** and **output file path**

### Running Agents in Background

Ask Claude to run something in the background:
```
Run the test suite in the background and report only failing tests
```

Or press **Ctrl+B** to background a running task (tmux users: press Ctrl+B twice).

### Checking Background Agent Progress

**Non-blocking check** (returns immediately with whatever output is available):
```
TaskOutput(task_id="bg-task-123", block=false)
```

**Blocking wait** (waits for agent to finish):
```
TaskOutput(task_id="bg-task-123", block=true)
```

**Read the output file directly:**
Use the Read tool on the output file path, or `tail` via Bash to see recent output.

### Listing Background Tasks

```
/tasks
```

Shows all running background tasks with their IDs and status.

### Resuming Failed Background Agents

If a background agent fails due to missing permissions, resume it in the foreground:
```
Resume the code-reviewer subagent with the necessary permissions
```

Resumed agents retain their full conversation history and pick up exactly where they stopped.

---

## Monitoring Agent Teams

Agent teams have a **lead** (your main session) and multiple **teammates** (separate Claude instances).

### Display Modes

Set in `settings.json`:

**In-process mode** (any terminal):
```json
{ "teammateMode": "in-process" }
```
- All teammates run inside your terminal
- **Shift+Up/Down** to navigate between them
- Type to send messages, **Enter** to view session, **Escape** to interrupt

**Split-pane mode** (requires tmux or iTerm2):
```json
{ "teammateMode": "tmux" }
```
- Each teammate gets its own pane
- See everyone's output simultaneously
- Click into a pane to interact directly

Or use CLI flag:
```bash
claude --teammate-mode tmux
```

### Interacting with Teammates

**In-process mode:**
1. **Shift+Up/Down** - cycle through teammates
2. **Type** - send a direct message to selected teammate
3. **Enter** - open that teammate's full session
4. **Escape** - return to lead / interrupt current work

**Split-pane mode:**
1. Click into any teammate's pane
2. Interact with their session directly

### Example: Spawning and Monitoring a Team

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

Then monitor by:
- Cycling through reviewers with **Shift+Up/Down**
- Sending targeted messages for updates
- Watching task list with **Ctrl+T**

---

## Task List Monitoring

Teams use a shared task list to coordinate work.

### Toggle Task List Display

Press **Ctrl+T** to show/hide the task list in your terminal. Shows:
- Task names and descriptions
- Status indicators (completed, in progress, pending)
- Dependencies and current assignee

### Task States

| State | Meaning |
|-------|---------|
| **Pending** | Awaiting assignment |
| **In progress** | Currently being worked on |
| **Completed** | Finished |

Tasks can have dependencies - a pending task with unresolved dependencies can't be claimed until those dependencies are completed.

### Managing Tasks

```
Show me all tasks
Clear all tasks
Assign task #3 to the architect teammate
Mark task #3 as completed
```

### Task Storage

Tasks are stored at:
```
~/.pi/tasks/{team-name}/
```

---

## Idle Notifications

Teammates **automatically go idle** after every turn. This is normal behavior.

Key points:
- **Idle does NOT mean done** - they're waiting for input
- Sending a message to an idle teammate **wakes them up**
- The system automatically notifies the lead when a teammate goes idle
- **Peer DM summaries** are included in idle notifications for visibility
- You do NOT need to react to idle notifications unless you want to assign new work

---

## Team Discovery

### Reading Team Config

Team member info is stored at:
```
~/.pi/teams/{team-name}/config.json
```

Contains:
```json
{
  "members": [
    {
      "name": "architect",
      "agentId": "agent-uuid-1",
      "agentType": "specialized-architect"
    },
    {
      "name": "security-reviewer",
      "agentId": "agent-uuid-2",
      "agentType": "security-specialist"
    }
  ]
}
```

Always refer to teammates by **name** (not agentId) for messaging and task assignment.

---

## Hooks for Automated Monitoring

### TeammateIdle Hook

Triggers when a teammate stops working:

```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/on-idle.sh"
          }
        ]
      }
    ]
  }
}
```

**Exit codes:**
- `0` = Allow idle (normal)
- `2` = Send feedback and keep the teammate working

### TaskCompleted Hook

Triggers when a task is marked done - use for quality gates:

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/verify-task.sh"
          }
        ]
      }
    ]
  }
}
```

**Exit codes:**
- `0` = Allow completion
- `2` = Prevent completion and send feedback for revision

### Example Hook Script

```bash
#!/bin/bash
INPUT=$(cat)
TEAMMATE_NAME=$(echo "$INPUT" | jq -r '.agent_name // empty')
echo "Teammate $TEAMMATE_NAME has finished and is going idle"
exit 0
```

---

## Persistent Task Lists

Share a task list across sessions with an environment variable:

```bash
CLAUDE_CODE_TASK_LIST_ID=my-project claude
```

This uses `~/.pi/tasks/my-project/` for all sessions, letting you pick up where you left off.

---

## Verbose Output & Debugging

| Command / Shortcut | Purpose |
|--------------------|---------|
| **Ctrl+O** | Toggle verbose output - shows all tool calls and decisions |
| `/cost` | Token usage per agent (costs scale linearly with team size) |
| `/context` | Context window usage grid |
| `/debug` | Session debug log (spawn events, state changes, errors) |

### Subagent Transcripts

Subagent conversations are stored at:
```
~/.pi/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl
```

Read these to understand what an agent did after it completes.

---

## Troubleshooting

### Teammates Not Appearing
- Press **Shift+Down** to cycle - they may already be running
- For split panes, verify tmux is installed: `which tmux`
- For iTerm2, ensure `it2` CLI is installed and Python API is enabled

### Too Many Permission Prompts
Pre-approve common operations in `settings.json`:
```json
{
  "permissions": {
    "allow": ["Bash(npm test:*)", "Bash(git status:*)"]
  }
}
```

### Task Status Appears Stuck
Check if work is actually done and update manually:
```
Mark task #3 as completed
```

### Orphaned tmux Sessions
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## Practical Workflow

1. **Start team** with your preferred display mode
2. **Ctrl+T** to keep the task list visible
3. **Ctrl+O** for verbose output to see detailed tool usage
4. **Shift+Up/Down** to cycle through teammates and check on them
5. **Type a message** to redirect any teammate that's stuck
6. **/cost** periodically to track token usage
7. **/tasks** to check on any background tasks
