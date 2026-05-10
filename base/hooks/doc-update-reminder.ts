#!/usr/bin/env node
/**
 * Documentation Update Reminder Hook
 *
 * PostToolUse hook that detects file modifications and prompts Claude
 * to update corresponding documentation files.
 *
 * Triggered by: Edit, MultiEdit, Write tool operations
 * Output: Formatted prompt injection for Claude to update docs
 */

import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

// --- Interfaces ---

interface HookInput {
    session_id: string;
    tool_name: string;
    tool_input: {
        file_path?: string;
        edits?: Array<{ file_path: string }>;
    };
}

interface DocMapping {
    pattern: RegExp;
    docFile: string;
    category: string;
    description: string;
}

// --- Configuration ---

const DOC_MAPPINGS: DocMapping[] = [
    {
        pattern: /backend\/src\/.*\.controller\.ts$/,
        docFile: '.pi-project/status/backend/API_IMPLEMENTATION_STATUS.md',
        category: 'backend-api',
        description: 'Backend API controller',
    },
    {
        pattern: /backend\/src\/.*\.entity\.ts$/,
        docFile: '.pi-project/status/backend/API_IMPLEMENTATION_STATUS.md',
        category: 'backend-entity',
        description: 'Backend entity',
    },
    {
        pattern: /frontend\/app\/pages\/.*\.tsx$/,
        docFile: '.pi-project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md',
        category: 'frontend-screen',
        description: 'Frontend screen/page',
    },
    {
        pattern: /frontend\/app\/services\/.*\.ts$/,
        docFile: '.pi-project/status/frontend/API_INTEGRATION_STATUS.md',
        category: 'frontend-api',
        description: 'Frontend API service',
    },
    {
        pattern: /frontend-dashboard\/app\/pages\/.*\.tsx$/,
        docFile: '.pi-project/status/frontend-dashboard/SCREEN_IMPLEMENTATION_STATUS.md',
        category: 'dashboard-screen',
        description: 'Dashboard screen/page',
    },
    {
        pattern: /frontend-dashboard\/app\/services\/.*\.ts$/,
        docFile: '.pi-project/status/frontend-dashboard/API_INTEGRATION_STATUS.md',
        category: 'dashboard-api',
        description: 'Dashboard API service',
    },
];

// --- Helper Functions ---

function getCacheDir(sessionId: string): string {
    const home = process.env.HOME || '/root';
    return join(home, '.claude', 'doc-reminder-cache', sessionId);
}

function getCacheFile(sessionId: string): string {
    return join(getCacheDir(sessionId), 'reminded-docs.txt');
}

function hasBeenReminded(sessionId: string, category: string): boolean {
    const cacheFile = getCacheFile(sessionId);
    if (!existsSync(cacheFile)) return false;

    const content = readFileSync(cacheFile, 'utf-8');
    return content.split('\n').includes(category);
}

function markAsReminded(sessionId: string, category: string): void {
    const cacheDir = getCacheDir(sessionId);
    const cacheFile = getCacheFile(sessionId);

    if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir, { recursive: true });
    }

    appendFileSync(cacheFile, category + '\n');
}

function getFilePaths(data: HookInput): string[] {
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

function matchFileToDoc(filePath: string): DocMapping | null {
    for (const mapping of DOC_MAPPINGS) {
        if (mapping.pattern.test(filePath)) {
            return mapping;
        }
    }
    return null;
}

function getShortPath(filePath: string): string {
    const parts = filePath.split('/');
    return parts.slice(-3).join('/');
}

// --- Main Function ---

function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const sessionId = data.session_id || 'default';
        const filePaths = getFilePaths(data);

        if (filePaths.length === 0) {
            process.exit(0);
        }

        // Track which docs need updating (deduplicated by category)
        const docsToUpdate = new Map<
            string,
            {
                mapping: DocMapping;
                files: string[];
            }
        >();

        for (const filePath of filePaths) {
            const mapping = matchFileToDoc(filePath);
            if (!mapping) continue;

            // Skip if already reminded in this session
            if (hasBeenReminded(sessionId, mapping.category)) continue;

            if (!docsToUpdate.has(mapping.category)) {
                docsToUpdate.set(mapping.category, {
                    mapping,
                    files: [],
                });
            }
            docsToUpdate.get(mapping.category)!.files.push(filePath);
        }

        if (docsToUpdate.size === 0) {
            process.exit(0);
        }

        // Output prompt injection
        let output = '\n';
        output +=
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '📝 DOCUMENTATION UPDATE REMINDER\n';
        output +=
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        output += 'You modified files that require documentation updates:\n\n';

        for (const [category, info] of docsToUpdate) {
            const { mapping, files } = info;

            output += `📁 ${mapping.description} changes:\n`;
            files.forEach((f) => {
                output += `   • ${getShortPath(f)}\n`;
            });
            output += `\n   📄 UPDATE: ${mapping.docFile}\n\n`;

            // Mark as reminded so we don't repeat
            markAsReminded(sessionId, category);
        }

        output +=
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output +=
            '⚡ ACTION: Please update the documentation file(s) above\n';
        output += '   to reflect your implementation changes.\n';
        output +=
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        console.log(output);
        process.exit(0);
    } catch {
        // Silent fail - documentation reminder is not critical
        process.exit(0);
    }
}

main();
