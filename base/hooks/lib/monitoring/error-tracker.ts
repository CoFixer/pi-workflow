/**
 * Error Tracker - Categorizes and tracks agent errors
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { ActivityEntry, readAllLogs } from './activity-recorder';

// --- Interfaces ---

export interface ErrorPattern {
    pattern: string;
    category: 'import-resolution' | 'context-loss' | 'timeout' | 'delegation-loop' | 'build-failure' | 'unknown';
    count: number;
    agents: string[];
    last_seen: string;
    sample_error: string;
}

// --- Functions ---

function getMonitoringDir(): string {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    return resolve(projectDir, '.claude', 'monitoring');
}

function categorizeError(error: string): ErrorPattern['category'] {
    if (/import|module not found|cannot find/i.test(error)) return 'import-resolution';
    if (/context|not enough|missing/i.test(error)) return 'context-loss';
    if (/timeout|timed out|exceeded/i.test(error)) return 'timeout';
    if (/loop|circular|recursive/i.test(error)) return 'delegation-loop';
    if (/build|compile|tsc|typescript/i.test(error)) return 'build-failure';
    return 'unknown';
}

export function trackErrors(entries?: ActivityEntry[]): ErrorPattern[] {
    const allEntries = entries || readAllLogs(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const failedEntries = allEntries.filter((e) => e.status === 'failed' && e.error);

    const patternMap = new Map<string, ErrorPattern>();

    for (const entry of failedEntries) {
        const category = categorizeError(entry.error!);
        const key = `${category}:${entry.agent_name}`;

        if (!patternMap.has(key)) {
            patternMap.set(key, {
                pattern: key,
                category,
                count: 0,
                agents: [],
                last_seen: entry.timestamp,
                sample_error: entry.error!,
            });
        }

        const pattern = patternMap.get(key)!;
        pattern.count++;
        if (!pattern.agents.includes(entry.agent_name)) {
            pattern.agents.push(entry.agent_name);
        }
        if (new Date(entry.timestamp) > new Date(pattern.last_seen)) {
            pattern.last_seen = entry.timestamp;
        }
    }

    return Array.from(patternMap.values()).sort((a, b) => b.count - a.count);
}

export function updateErrorLog(): void {
    const monitoringDir = getMonitoringDir();
    if (!existsSync(monitoringDir)) {
        mkdirSync(monitoringDir, { recursive: true });
    }

    const patterns = trackErrors();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    let content = `# Agent Error Log\n\n`;
    content += `> **Last Updated:** ${now}\n`;
    content += `> **Period:** Last 7 days\n`;
    content += `> **Total Error Patterns:** ${patterns.length}\n\n`;
    content += `---\n\n`;
    content += `## Error Patterns\n\n`;
    content += `| Category | Agent(s) | Count | Last Seen | Sample Error |\n`;
    content += `|----------|----------|-------|-----------|-------------|\n`;

    for (const pattern of patterns) {
        const lastSeen = new Date(pattern.last_seen).toISOString().substring(0, 16);
        const sampleTruncated = pattern.sample_error.substring(0, 60).replace(/\|/g, '/');
        content += `| ${pattern.category} | ${pattern.agents.join(', ')} | ${pattern.count} | ${lastSeen} | ${sampleTruncated} |\n`;
    }

    if (patterns.length === 0) {
        content += `| - | No errors recorded | 0 | - | - |\n`;
    }

    content += `\n---\n\n`;
    content += `## Alert Conditions\n\n`;
    content += `| Condition | Status |\n`;
    content += `|-----------|--------|\n`;

    // Check delegation loops
    const loopPatterns = patterns.filter((p) => p.category === 'delegation-loop');
    content += `| Delegation loops | ${loopPatterns.length > 0 ? ':warning: ' + loopPatterns.length + ' detected' : ':white_check_mark: None'} |\n`;

    // Check high-frequency errors
    const highFreq = patterns.filter((p) => p.count >= 5);
    content += `| High-frequency errors (>=5) | ${highFreq.length > 0 ? ':warning: ' + highFreq.length + ' patterns' : ':white_check_mark: None'} |\n`;

    // Check recurring agents
    const recurringAgents = patterns.filter((p) => p.agents.length >= 3);
    content += `| Multi-agent errors | ${recurringAgents.length > 0 ? ':warning: ' + recurringAgents.length + ' patterns' : ':white_check_mark: None'} |\n`;

    writeFileSync(join(monitoringDir, 'AGENT_ERROR_LOG.md'), content, 'utf-8');
}
