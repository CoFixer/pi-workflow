#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    hook_event_name: string;
}

interface ReflectState {
    enabled: boolean;
    lastReflection: string | null;
    totalReflections: number;
}

interface Learning {
    title: string;
    type: 'correction' | 'preference' | 'pattern' | 'approval';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    evidence: string[];
    category: string;
}

// Get project directory
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const HOME_DIR = process.env.HOME || '/root';

// Memory levels (priority: personal < team < project)
type MemoryLevel = 'personal' | 'team' | 'project';

const MEMORY_PATHS: Record<MemoryLevel, string> = {
    personal: join(HOME_DIR, '.claude', 'memory'),           // ~/.pi/memory/
    team: join(PROJECT_DIR, '.claude', 'base', 'memory'),    // .pi/base/memory/
    project: join(PROJECT_DIR, '.project', 'memory'), // .project/memory/
};

// State file path (project-specific in .project/)
const STATE_DIR = join(PROJECT_DIR, '.project', 'state');
const STATE_FILE = join(STATE_DIR, 'reflect-enabled.json');

// Default to project level for auto-reflection (safest)
const DEFAULT_AUTO_LEVEL: MemoryLevel = 'project';
const MEMORY_DIR = MEMORY_PATHS[DEFAULT_AUTO_LEVEL];
const LEARNINGS_FILE = join(MEMORY_DIR, 'LEARNINGS.md');

// Signal detection patterns
const CORRECTION_PATTERNS = [
    /\b(no,?\s|nope|don't|do not|wrong|incorrect|that's not right|instead|rather|actually)\b/i,
    /\bi meant\b/i,
    /\bwhat i wanted\b/i,
    /\bplease (change|fix|update|correct)\b/i,
    /\bcan you (change|fix|redo|correct)\b/i,
    /\bnot what i\b/i,
    /\bthat's wrong\b/i,
    /\bshould be\b.*\bnot\b/i,
    /\bnever\s+(do|use|add)\b/i,
];

const APPROVAL_PATTERNS = [
    /\b(yes|perfect|exactly|correct|right|thanks|great|good|nice|awesome|excellent)\b/i,
    /\bthat's (right|correct|what i wanted|exactly what)\b/i,
    /\bworks (great|perfectly|well)\b/i,
    /\blooks good\b/i,
    /\bwell done\b/i,
];

const PREFERENCE_PATTERNS = [
    /\bi (prefer|like to|always|never|want to)\b/i,
    /\bwe (always|never|usually|typically)\b/i,
    /\bour (convention|standard|approach|pattern)\b/i,
    /\bdon't use .+ use .+ instead\b/i,
    /\balways use\b/i,
    /\bshould always\b/i,
    /\bmake sure (to|you)\b/i,
];

function loadState(): ReflectState {
    try {
        if (existsSync(STATE_FILE)) {
            return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch {
        // Ignore errors, return default state
    }

    return {
        enabled: true,
        lastReflection: null,
        totalReflections: 0,
    };
}

function saveState(state: ReflectState): void {
    if (!existsSync(STATE_DIR)) {
        mkdirSync(STATE_DIR, { recursive: true });
    }
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function isEnabled(): boolean {
    return loadState().enabled;
}

// Max length for a genuine user message (filters out command file dumps)
const MAX_USER_MESSAGE_LENGTH = 500;

function isSystemContent(text: string): boolean {
    // Matches any XML/angle-bracket tag injected by the system
    if (/^<[a-zA-Z_-]+[\s>]/.test(text)) return true;

    // Markdown heading — likely a skill/command prompt expansion
    if (/^#{1,3}\s/.test(text)) return true;

    // Common command/skill prompt starts
    if (/^(You are a|Base directory|This session is being continued)/.test(text)) return true;

    // YAML frontmatter (command files start with ---)
    if (text.startsWith('---\n') || text.startsWith('---\r\n')) return true;

    return false;
}

function extractUserMessages(transcript: string): string[] {
    const messages: string[] = [];
    const lines = transcript.split('\n');

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const entry = JSON.parse(line);
            if (entry.type !== 'user') continue;

            const msg = entry.message;
            if (!msg?.content) continue;

            // Handle both transcript formats:
            // Project transcripts: message.content is array of {type: "text", text: "..."}
            // Global transcripts: content may be a direct string
            let text = '';
            if (Array.isArray(msg.content)) {
                text = msg.content
                    .filter((block: any) => block.type === 'text')
                    .map((block: any) => block.text || '')
                    .filter((t: string) => !isSystemContent(t))
                    .join(' ');
            } else if (typeof msg.content === 'string') {
                text = msg.content;
            }

            text = text.trim();

            // Skip system-injected content
            if (!text || isSystemContent(text)) continue;

            // Skip messages that are too long — genuine user corrections/preferences
            // are short. Long messages are almost always leaked command prompts.
            if (text.length > MAX_USER_MESSAGE_LENGTH) continue;

            messages.push(text);
        } catch {
            // Not valid JSON line — skip silently
        }
    }

    return messages;
}

function detectSignals(userMessages: string[]): {
    corrections: string[];
    approvals: string[];
    preferences: string[];
} {
    const corrections: string[] = [];
    const approvals: string[] = [];
    const preferences: string[] = [];

    for (const message of userMessages) {
        // Check for corrections (highest priority)
        if (CORRECTION_PATTERNS.some((p) => p.test(message))) {
            corrections.push(message);
            continue; // Don't double-count
        }

        // Check for preferences
        if (PREFERENCE_PATTERNS.some((p) => p.test(message))) {
            preferences.push(message);
            continue;
        }

        // Check for approvals
        if (APPROVAL_PATTERNS.some((p) => p.test(message))) {
            approvals.push(message);
        }
    }

    return { corrections, approvals, preferences };
}

function extractLearningTitle(message: string): string {
    // Clean and truncate the message for a title
    const cleaned = message
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s,.-]/g, '')
        .trim();

    if (cleaned.length <= 60) {
        return cleaned;
    }

    // Find a good breaking point
    const truncated = cleaned.substring(0, 60);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function extractLearnings(signals: ReturnType<typeof detectSignals>): Learning[] {
    const learnings: Learning[] = [];

    // Process corrections (HIGH confidence)
    for (const correction of signals.corrections) {
        learnings.push({
            title: extractLearningTitle(correction),
            type: 'correction',
            confidence: 'HIGH',
            description: correction,
            evidence: [correction],
            category: 'general',
        });
    }

    // Process preferences (MEDIUM confidence)
    for (const preference of signals.preferences) {
        learnings.push({
            title: extractLearningTitle(preference),
            type: 'preference',
            confidence: 'MEDIUM',
            description: preference,
            evidence: [preference],
            category: 'style',
        });
    }

    return learnings;
}

function formatLearningEntry(learning: Learning): string {
    const date = new Date().toISOString().split('T')[0];

    return `
### ${date}: ${learning.title}

**Type**: ${learning.type}
**Confidence**: ${learning.confidence}
**Source**: Auto-reflection

**Description**: ${learning.description}

**Evidence**:
${learning.evidence.map((e) => `- "${e.substring(0, 200)}${e.length > 200 ? '...' : ''}"`).join('\n')}

---
`;
}

function initializeMemoryFiles(): void {
    if (!existsSync(MEMORY_DIR)) {
        mkdirSync(MEMORY_DIR, { recursive: true });
    }

    if (!existsSync(LEARNINGS_FILE)) {
        writeFileSync(
            LEARNINGS_FILE,
            `# Session Learnings

Auto-captured and manually-extracted learnings from conversation analysis.
This file is version-controlled and grows over time.

---

## How This File Works

- **Auto-captured**: HIGH confidence learnings are added automatically (if enabled)
- **Manual**: Use \`/reflect\` to add learnings manually
- **Version-controlled**: All changes are committed to git
- **Human-readable**: Plain markdown for easy review

---

## Entries

<!-- Learnings are appended below this line -->
`,
        );
    }
}

function appendLearnings(learnings: Learning[]): void {
    if (learnings.length === 0) return;

    initializeMemoryFiles();

    const entries = learnings.map(formatLearningEntry).join('\n');
    appendFileSync(LEARNINGS_FILE, entries);
}

function commitChanges(learnings: Learning[]): void {
    if (learnings.length === 0) return;

    try {
        // Check if we're in a git repo
        execSync('git rev-parse --git-dir', { cwd: PROJECT_DIR, stdio: 'ignore' });

        // Stage memory files (in .project/)
        execSync('git add .project/memory/', { cwd: PROJECT_DIR, stdio: 'ignore' });

        // Check if there are staged changes
        const status = execSync('git diff --cached --name-only', {
            cwd: PROJECT_DIR,
            encoding: 'utf-8',
        });

        if (!status.trim()) {
            return; // No changes to commit
        }

        // Create commit message
        const summaries = learnings
            .slice(0, 5)
            .map((l) => `- [${l.confidence}] ${l.type}: ${l.title.substring(0, 50)}`)
            .join('\n');

        const message = `reflect(auto): capture ${learnings.length} session learning(s)

Learnings captured:
${summaries}${learnings.length > 5 ? `\n... and ${learnings.length - 5} more` : ''}

Confidence breakdown:
- HIGH: ${learnings.filter((l) => l.confidence === 'HIGH').length}
- MEDIUM: ${learnings.filter((l) => l.confidence === 'MEDIUM').length}
- LOW: ${learnings.filter((l) => l.confidence === 'LOW').length}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;

        execSync(`git commit -m "${message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
            cwd: PROJECT_DIR,
            stdio: 'ignore',
        });
    } catch {
        // Git operations failed silently - not critical
    }
}

async function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        // Check if auto-reflect is enabled
        if (!isEnabled()) {
            process.exit(0);
        }

        // Read transcript if available
        if (!data.transcript_path || !existsSync(data.transcript_path)) {
            process.exit(0);
        }

        const transcript = readFileSync(data.transcript_path, 'utf-8');

        // Extract user messages from transcript
        const userMessages = extractUserMessages(transcript);

        if (userMessages.length === 0) {
            process.exit(0);
        }

        // Detect signals
        const signals = detectSignals(userMessages);

        // Check if any signals found
        const totalSignals =
            signals.corrections.length + signals.approvals.length + signals.preferences.length;

        if (totalSignals === 0) {
            process.exit(0);
        }

        // Extract learnings
        const learnings = extractLearnings(signals);

        // Filter to high-confidence only for auto-apply
        const highConfidence = learnings.filter((l) => l.confidence === 'HIGH');

        if (highConfidence.length > 0) {
            // Append to learnings file
            appendLearnings(highConfidence);

            // Commit changes
            commitChanges(highConfidence);

            // Update state
            const state = loadState();
            saveState({
                ...state,
                lastReflection: new Date().toISOString(),
                totalReflections: state.totalReflections + 1,
            });

            // Notify user (via stderr for visibility)
            console.error(`\n[reflect] Auto-captured ${highConfidence.length} learning(s)\n`);
        }

        process.exit(0);
    } catch (err) {
        // Silent failure - this is just a reflection, not critical
        process.exit(0);
    }
}

main();
