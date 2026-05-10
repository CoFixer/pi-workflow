/**
 * Dashboard Updater - Regenerates AGENT_MONITOR_DASHBOARD.md from activity logs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { readAllLogs, aggregateByAgent, aggregateByTeam, getActiveChains } from './activity-recorder';

function getMonitoringDir(): string {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    return resolve(projectDir, '.claude', 'monitoring');
}

export function updateDashboard(): void {
    const monitoringDir = getMonitoringDir();
    if (!existsSync(monitoringDir)) {
        mkdirSync(monitoringDir, { recursive: true });
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const entries = readAllLogs(since24h);
    const agentStats = aggregateByAgent(entries);
    const teamStats = aggregateByTeam(entries);
    const activeChains = getActiveChains();

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const totalInvocations = agentStats.reduce((sum, a) => sum + a.invocations, 0);
    const totalSuccesses = agentStats.reduce((sum, a) => sum + a.successes, 0);
    const totalFailures = agentStats.reduce((sum, a) => sum + a.failures, 0);
    const totalCompleted = totalSuccesses + totalFailures;
    const successRate = totalCompleted > 0 ? ((totalSuccesses / totalCompleted) * 100).toFixed(1) : '100.0';
    const durations = agentStats.filter((a) => a.avg_duration_ms > 0).map((a) => a.avg_duration_ms);
    const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const maxDepth = entries.reduce((max, e) => Math.max(max, e.depth), 0);

    // Build agent activity table
    let agentTable = '| Agent | Team | Role | Invocations | Success | Failed | Avg Duration | Last Used |\n';
    agentTable += '|-------|------|------|-------------|---------|--------|-------------|----------|\n';
    for (const stat of agentStats) {
        const lastUsed = stat.last_used ? new Date(stat.last_used).toISOString().substring(11, 16) : '-';
        const duration = stat.avg_duration_ms > 0 ? `${Math.round(stat.avg_duration_ms / 1000)}s` : '-';
        agentTable += `| ${stat.agent_name} | ${stat.team || '-'} | ${stat.role} | ${stat.invocations} | ${stat.successes} | ${stat.failures} | ${duration} | ${lastUsed} |\n`;
    }

    // Build team health table
    let teamTable = '| Team | Total Calls | Success Rate | Load | Status |\n';
    teamTable += '|------|-------------|-------------|------|--------|\n';
    for (const stat of teamStats) {
        const status = stat.total_calls === 0 ? ':clipboard: Idle' : stat.success_rate >= 90 ? ':white_check_mark: Healthy' : ':warning: Needs Attention';
        teamTable += `| ${stat.team} | ${stat.total_calls} | ${stat.success_rate}% | ${stat.load} | ${status} |\n`;
    }

    // Build active chains table
    let chainsTable = '| Session | Agent | Depth | Started |\n';
    chainsTable += '|---------|-------|-------|--------|\n';
    for (const chain of activeChains) {
        const started = new Date(chain.started).toISOString().substring(11, 19);
        chainsTable += `| ${chain.session_id.substring(0, 8)}... | ${chain.agent_name} | ${chain.depth} | ${started} |\n`;
    }
    if (activeChains.length === 0) {
        chainsTable += '| - | No active chains | - | - |\n';
    }

    // Check for alerts
    const alerts: string[] = [];

    // A01: Delegation loops
    const chainDepths = entries.filter((e) => e.depth > 4);
    if (chainDepths.length > 0) {
        alerts.push('| :warning: WARNING | Deep delegation chain | Chain depth >4 detected | Review delegation patterns |');
    }

    // A02: Low success rate
    for (const stat of agentStats) {
        if (stat.invocations >= 3 && stat.failures / stat.invocations > 0.3) {
            alerts.push(`| :warning: WARNING | High failure rate | ${stat.agent_name}: ${stat.failures}/${stat.invocations} failed | Check error patterns |`);
        }
    }

    // A05: Error resolver loop
    const errorResolverCalls = entries.filter((e) => e.agent_name === 'auto-error-resolver').length;
    if (errorResolverCalls > 3) {
        alerts.push('| :warning: WARNING | Error resolver overuse | auto-error-resolver invoked >3x | Consider manual review |');
    }

    let alertsTable = '| Level | Alert | Details | Action |\n';
    alertsTable += '|-------|-------|---------|--------|\n';
    if (alerts.length > 0) {
        alertsTable += alerts.join('\n') + '\n';
    } else {
        alertsTable += '| :white_check_mark: | No alerts | System operating normally | - |\n';
    }

    const dashboard = `# Agent Monitor Dashboard

> **Last Updated:** ${now}
> **Active Chains:** ${activeChains.length}
> **Period:** Last 24 hours

---

## System Health

| Metric | Value |
|--------|-------|
| Total Agent Invocations | ${totalInvocations} |
| Success Rate | ${successRate}% |
| Avg Duration | ${avgDuration > 0 ? Math.round(avgDuration / 1000) + 's' : '-'} |
| Deepest Delegation Chain | ${maxDepth} |
| Active Alerts | ${alerts.length} |

---

## Agent Activity (Last 24h)

${agentTable}

---

## Team Health

${teamTable}

---

## Active Task Chains

${chainsTable}

---

## Alerts

${alertsTable}
`;

    writeFileSync(join(monitoringDir, 'AGENT_MONITOR_DASHBOARD.md'), dashboard, 'utf-8');
}
