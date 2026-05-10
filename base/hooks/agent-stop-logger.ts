#!/usr/bin/env node
/**
 * Agent Stop Logger Hook
 *
 * Stop hook that finalizes session activity data, calculates durations,
 * cleans up active chains, and triggers dashboard regeneration.
 */

import { readFileSync } from 'fs';
import { recordActivity, readSessionLog, removeChainFile, getActiveChains } from './lib/monitoring/activity-recorder';
import { updateDashboard } from './lib/monitoring/dashboard-updater';
import { updateErrorLog } from './lib/monitoring/error-tracker';
import type { ActivityEntry } from './lib/monitoring/activity-recorder';

// --- Interfaces ---

interface HookInput {
    session_id: string;
    tool_name?: string;
    tool_input?: Record<string, unknown>;
}

// --- Main Function ---

function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const sessionId = data.session_id;
        if (!sessionId) {
            process.exit(0);
        }

        // Read all entries for this session
        const entries = readSessionLog(sessionId);
        if (entries.length === 0) {
            process.exit(0);
        }

        // Find started entries that need completion
        const startedEntries = entries.filter((e) => e.status === 'started');
        const now = new Date();

        for (const entry of startedEntries) {
            const startTime = new Date(entry.timestamp);
            const durationMs = now.getTime() - startTime.getTime();

            const completionEntry: ActivityEntry = {
                timestamp: now.toISOString(),
                event_type: 'session_end',
                session_id: entry.session_id,
                agent_name: entry.agent_name,
                agent_type: entry.agent_type,
                team: entry.team,
                role: entry.role,
                parent_agent: entry.parent_agent,
                task_description: entry.task_description,
                depth: entry.depth,
                status: 'completed',
                duration_ms: durationMs,
                error: null,
            };

            recordActivity(completionEntry);
        }

        // Clean up active chain files for this session
        removeChainFile(sessionId);

        // Update dashboard and error log
        try {
            updateDashboard();
            updateErrorLog();
        } catch {
            // Non-critical
        }

        // Output summary
        const agentNames = [...new Set(startedEntries.map((e) => e.agent_name))];
        if (agentNames.length > 0) {
            let output = '\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            output += `AGENT MONITOR: Session complete\n`;
            output += `Agents used: ${agentNames.join(', ')}\n`;
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            console.log(output);
        }

        process.exit(0);
    } catch (error) {
        if (process.env.DEBUG) {
            console.error(`[agent-stop-logger] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        process.exit(0);
    }
}

main();
