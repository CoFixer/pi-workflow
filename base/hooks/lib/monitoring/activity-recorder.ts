/**
 * Activity Recorder - JSONL read/write library for agent monitoring
 *
 * Provides append-only JSONL logging and query functions for agent activity data.
 */

import { readFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';

// --- Interfaces ---

export interface ActivityEntry {
    timestamp: string;
    event_type: 'agent_invoked' | 'agent_completed' | 'agent_failed' | 'agent_delegated' | 'session_start' | 'session_end';
    session_id: string;
    agent_name: string;
    agent_type: string;
    team: string | null;
    role: string;
    parent_agent: string | null;
    task_description: string;
    depth: number;
    status: 'started' | 'completed' | 'failed' | 'timeout';
    duration_ms: number | null;
    error: string | null;
}

export interface ChainInfo {
    session_id: string;
    chain_id: string;
    agent_name: string;
    parent_session: string | null;
    depth: number;
    started: string;
}

// --- Configuration ---

function getMonitoringDir(): string {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    return resolve(projectDir, '.claude', 'monitoring');
}

function getLogsDir(): string {
    return join(getMonitoringDir(), 'logs');
}

function getActiveChainsDir(): string {
    return join(getMonitoringDir(), '.active-chains');
}

// --- Write Functions ---

export function recordActivity(entry: ActivityEntry): void {
    const logsDir = getLogsDir();
    if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
    }

    const logFile = join(logsDir, `${entry.session_id}.jsonl`);
    const line = JSON.stringify(entry) + '\n';
    appendFileSync(logFile, line, 'utf-8');
}

export function writeChainFile(chain: ChainInfo): void {
    const chainsDir = getActiveChainsDir();
    if (!existsSync(chainsDir)) {
        mkdirSync(chainsDir, { recursive: true });
    }

    const chainFile = join(chainsDir, `${chain.session_id}.json`);
    writeFileSync(chainFile, JSON.stringify(chain, null, 2), 'utf-8');
}

export function removeChainFile(sessionId: string): void {
    const chainFile = join(getActiveChainsDir(), `${sessionId}.json`);
    if (existsSync(chainFile)) {
        unlinkSync(chainFile);
    }
}

// --- Read Functions ---

export function readSessionLog(sessionId: string): ActivityEntry[] {
    const logFile = join(getLogsDir(), `${sessionId}.jsonl`);
    if (!existsSync(logFile)) {
        return [];
    }

    const content = readFileSync(logFile, 'utf-8');
    return content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
            try {
                return JSON.parse(line) as ActivityEntry;
            } catch {
                return null;
            }
        })
        .filter((entry): entry is ActivityEntry => entry !== null);
}

export function readAllLogs(since?: Date): ActivityEntry[] {
    const logsDir = getLogsDir();
    if (!existsSync(logsDir)) {
        return [];
    }

    const entries: ActivityEntry[] = [];
    const files = readdirSync(logsDir).filter((f) => f.endsWith('.jsonl'));

    for (const file of files) {
        const content = readFileSync(join(logsDir, file), 'utf-8');
        const lines = content.split('\n').filter((line) => line.trim());

        for (const line of lines) {
            try {
                const entry = JSON.parse(line) as ActivityEntry;
                if (since) {
                    const entryDate = new Date(entry.timestamp);
                    if (entryDate >= since) {
                        entries.push(entry);
                    }
                } else {
                    entries.push(entry);
                }
            } catch {
                // Skip malformed lines
            }
        }
    }

    return entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getActiveChains(): ChainInfo[] {
    const chainsDir = getActiveChainsDir();
    if (!existsSync(chainsDir)) {
        return [];
    }

    const chains: ChainInfo[] = [];
    const files = readdirSync(chainsDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
        try {
            const content = readFileSync(join(chainsDir, file), 'utf-8');
            chains.push(JSON.parse(content) as ChainInfo);
        } catch {
            // Skip malformed files
        }
    }

    return chains;
}

// --- Aggregation Functions ---

export interface AgentStats {
    agent_name: string;
    team: string | null;
    role: string;
    invocations: number;
    successes: number;
    failures: number;
    avg_duration_ms: number;
    last_used: string;
}

export function aggregateByAgent(entries: ActivityEntry[]): AgentStats[] {
    const agentMap = new Map<string, { entries: ActivityEntry[]; team: string | null; role: string }>();

    for (const entry of entries) {
        if (entry.event_type !== 'agent_invoked' && entry.event_type !== 'agent_completed' && entry.event_type !== 'agent_failed') {
            continue;
        }

        if (!agentMap.has(entry.agent_name)) {
            agentMap.set(entry.agent_name, { entries: [], team: entry.team, role: entry.role });
        }
        agentMap.get(entry.agent_name)!.entries.push(entry);
    }

    const stats: AgentStats[] = [];
    for (const [agent_name, data] of agentMap) {
        const invoked = data.entries.filter((e) => e.event_type === 'agent_invoked');
        const completed = data.entries.filter((e) => e.status === 'completed');
        const failed = data.entries.filter((e) => e.status === 'failed');
        const durations = data.entries.filter((e) => e.duration_ms !== null).map((e) => e.duration_ms!);

        stats.push({
            agent_name,
            team: data.team,
            role: data.role,
            invocations: invoked.length,
            successes: completed.length,
            failures: failed.length,
            avg_duration_ms: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
            last_used: data.entries.length > 0 ? data.entries[data.entries.length - 1].timestamp : '',
        });
    }

    return stats.sort((a, b) => b.invocations - a.invocations);
}

export interface TeamStats {
    team: string;
    total_calls: number;
    success_rate: number;
    load: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function aggregateByTeam(entries: ActivityEntry[]): TeamStats[] {
    const teamMap = new Map<string, { invoked: number; completed: number; failed: number }>();

    for (const entry of entries) {
        const team = entry.team || 'cross-team';
        if (!teamMap.has(team)) {
            teamMap.set(team, { invoked: 0, completed: 0, failed: 0 });
        }

        const data = teamMap.get(team)!;
        if (entry.event_type === 'agent_invoked') data.invoked++;
        if (entry.status === 'completed') data.completed++;
        if (entry.status === 'failed') data.failed++;
    }

    const totalCalls = Array.from(teamMap.values()).reduce((sum, t) => sum + t.invoked, 0);

    const stats: TeamStats[] = [];
    for (const [team, data] of teamMap) {
        const total = data.completed + data.failed;
        const successRate = total > 0 ? (data.completed / total) * 100 : 100;
        const loadPct = totalCalls > 0 ? (data.invoked / totalCalls) * 100 : 0;

        stats.push({
            team,
            total_calls: data.invoked,
            success_rate: Math.round(successRate * 10) / 10,
            load: loadPct > 50 ? 'HIGH' : loadPct > 20 ? 'MEDIUM' : 'LOW',
        });
    }

    return stats.sort((a, b) => b.total_calls - a.total_calls);
}
