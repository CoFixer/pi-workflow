#!/usr/bin/env node
/**
 * Agent Activity Logger Hook
 *
 * PostToolUse hook that logs agent invocations when the Task tool is used.
 * Triggered by: Task tool operations (subagent invocations)
 * Updates:
 *   - .pi/monitoring/logs/{session_id}.jsonl (activity log)
 *   - .pi/monitoring/AGENT_MONITOR_DASHBOARD.md (live dashboard)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { recordActivity, writeChainFile, getActiveChains } from './lib/monitoring/activity-recorder';
import { updateDashboard } from './lib/monitoring/dashboard-updater';
import type { ActivityEntry, ChainInfo } from './lib/monitoring/activity-recorder';

// --- Interfaces ---

interface HookInput {
    session_id: string;
    tool_name: string;
    tool_input: {
        subagent_type?: string;
        description?: string;
        prompt?: string;
    };
    tool_output?: string;
}

interface AgentRegistryEntry {
    type: string;
    description: string;
    team: string | null;
    role: string;
}

interface AgentRegistry {
    agents: Record<string, AgentRegistryEntry>;
}

// --- Helper Functions ---

function loadAgentRegistry(): AgentRegistry | null {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const registryPath = resolve(projectDir, '.claude', 'agents', 'agent-registry.json');

    if (!existsSync(registryPath)) {
        return null;
    }

    try {
        const content = readFileSync(registryPath, 'utf-8');
        return JSON.parse(content) as AgentRegistry;
    } catch {
        return null;
    }
}

function detectParentAgent(sessionId: string): { parentAgent: string | null; depth: number } {
    const activeChains = getActiveChains();
    // Check if there's an active chain for this session (meaning this is a nested call)
    const parentChain = activeChains.find((c) => c.session_id !== sessionId);

    if (parentChain) {
        return {
            parentAgent: parentChain.agent_name,
            depth: parentChain.depth + 1,
        };
    }

    return { parentAgent: null, depth: 0 };
}

// --- Main Function ---

function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        // Only process Task tool calls
        if (data.tool_name !== 'Task') {
            process.exit(0);
        }

        const agentName = data.tool_input.subagent_type;
        if (!agentName) {
            process.exit(0);
        }

        // Look up agent metadata
        const registry = loadAgentRegistry();
        const agentInfo = registry?.agents[agentName];

        const { parentAgent, depth } = detectParentAgent(data.session_id);

        // Create activity entry
        const entry: ActivityEntry = {
            timestamp: new Date().toISOString(),
            event_type: parentAgent ? 'agent_delegated' : 'agent_invoked',
            session_id: data.session_id,
            agent_name: agentName,
            agent_type: agentInfo?.type || 'unknown',
            team: agentInfo?.team || null,
            role: agentInfo?.role || 'unknown',
            parent_agent: parentAgent,
            task_description: data.tool_input.description || '',
            depth,
            status: 'started',
            duration_ms: null,
            error: null,
        };

        // Record activity
        recordActivity(entry);

        // Write chain tracking file
        const chainInfo: ChainInfo = {
            session_id: data.session_id,
            chain_id: `ch-${Date.now().toString(36)}`,
            agent_name: agentName,
            parent_session: parentAgent ? data.session_id : null,
            depth,
            started: entry.timestamp,
        };
        writeChainFile(chainInfo);

        // Update dashboard
        try {
            updateDashboard();
        } catch {
            // Dashboard update is non-critical
        }

        // Output summary banner
        const teamLabel = agentInfo?.team ? ` [${agentInfo.team}]` : '';
        const parentLabel = parentAgent ? ` (by ${parentAgent})` : '';
        let output = '\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += `AGENT MONITOR: ${agentName}${teamLabel} invoked${parentLabel}\n`;
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        // Check for alert conditions
        if (depth > 4) {
            output += `WARNING [A03]: Deep delegation chain (depth=${depth})\n`;
        }

        console.log(output);
        process.exit(0);
    } catch (error) {
        // Silent fail - monitoring is not critical path
        if (process.env.DEBUG) {
            console.error(`[agent-activity-logger] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        process.exit(0);
    }
}

main();
