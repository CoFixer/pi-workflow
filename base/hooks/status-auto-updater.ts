#!/usr/bin/env node
/**
 * Status Auto-Updater Hook
 *
 * PostToolUse hook that automatically updates status documentation
 * when controllers, pages, or services are modified.
 *
 * Triggered by: Edit, MultiEdit, Write tool operations
 * Updates:
 *   - API_IMPLEMENTATION_STATUS.md (for controllers)
 *   - SCREEN_IMPLEMENTATION_STATUS.md (for pages)
 *   - API_INTEGRATION_STATUS.md (for services)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

// Import detectors
import { detectApiEndpoints } from './lib/detectors/api-detector';
import { detectScreen } from './lib/detectors/screen-detector';
import { detectIntegration } from './lib/detectors/integration-detector';

// Import updaters
import { updateApiStatus } from './lib/updaters/api-status-updater';
import { updateScreenStatus } from './lib/updaters/screen-status-updater';
import { updateIntegrationStatus } from './lib/updaters/integration-status-updater';

// --- Interfaces ---

interface HookInput {
    session_id: string;
    tool_name: string;
    tool_input: {
        file_path?: string;
        edits?: Array<{ file_path: string }>;
    };
    tool_output?: string;
}

interface UpdateResult {
    type: 'api' | 'screen' | 'integration';
    filePath: string;
    success: boolean;
    message: string;
}

// --- Configuration ---

const FILE_PATTERNS = {
    api: /backend\/src\/modules\/.*\.controller\.ts$/,
    screen: /(?:frontend|dashboard)\/app\/pages\/.*\.tsx$/,
    integration:
        /(?:frontend|dashboard)\/app\/services\/(?:httpServices\/)?.*\.ts$/,
};

// Files to ignore
const IGNORE_PATTERNS = [
    /\.spec\.ts$/, // Test files
    /\.test\.ts$/, // Test files
    /\.d\.ts$/, // Type definition files
    /index\.ts$/, // Barrel exports (usually)
    /layout\.tsx$/, // Layout files (not screens)
];

// --- Helper Functions ---

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

function shouldIgnoreFile(filePath: string): boolean {
    return IGNORE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function getFileType(
    filePath: string
): 'api' | 'screen' | 'integration' | null {
    if (shouldIgnoreFile(filePath)) {
        return null;
    }

    if (FILE_PATTERNS.api.test(filePath)) {
        return 'api';
    }
    if (FILE_PATTERNS.screen.test(filePath)) {
        return 'screen';
    }
    if (FILE_PATTERNS.integration.test(filePath)) {
        return 'integration';
    }

    return null;
}

function getProjectRoot(filePath: string): string {
    // Walk up from file path to find project root (where .project exists)
    let dir = dirname(filePath);
    const maxDepth = 10;
    let depth = 0;

    while (depth < maxDepth) {
        if (existsSync(resolve(dir, '.project'))) {
            return dir;
        }
        const parent = dirname(dir);
        if (parent === dir) break; // Reached filesystem root
        dir = parent;
        depth++;
    }

    // Fallback: assume cofoundry structure
    const match = filePath.match(/(.+?)\/(?:backend|frontend)/);
    if (match) {
        return match[1];
    }

    return process.cwd();
}

function processFile(filePath: string): UpdateResult | null {
    const fileType = getFileType(filePath);
    if (!fileType) {
        return null;
    }

    // Check if file exists
    if (!existsSync(filePath)) {
        return null;
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const projectRoot = getProjectRoot(filePath);

    switch (fileType) {
        case 'api': {
            const controller = detectApiEndpoints(filePath, fileContent);
            if (!controller || controller.endpoints.length === 0) {
                return null;
            }

            const result = updateApiStatus(projectRoot, controller);
            return {
                type: 'api',
                filePath,
                success: result.success,
                message: result.message,
            };
        }

        case 'screen': {
            const screen = detectScreen(filePath, fileContent);
            if (!screen) {
                return null;
            }

            const result = updateScreenStatus(projectRoot, screen);
            return {
                type: 'screen',
                filePath,
                success: result.success,
                message: result.message,
            };
        }

        case 'integration': {
            const integration = detectIntegration(filePath, fileContent);
            if (!integration || integration.thunks.length === 0) {
                return null;
            }

            const result = updateIntegrationStatus(projectRoot, integration);
            return {
                type: 'integration',
                filePath,
                success: result.success,
                message: result.message,
            };
        }
    }

    return null;
}

// --- Main Function ---

function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const filePaths = getFilePaths(data);

        if (filePaths.length === 0) {
            process.exit(0);
        }

        const results: UpdateResult[] = [];

        for (const filePath of filePaths) {
            const result = processFile(filePath);
            if (result) {
                results.push(result);
            }
        }

        if (results.length === 0) {
            process.exit(0);
        }

        // Output summary
        let output = '\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '📊 STATUS DOCUMENTATION AUTO-UPDATED\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        for (const result of results) {
            const icon = result.success ? '✅' : '❌';
            const typeLabel = {
                api: 'API',
                screen: 'Screen',
                integration: 'Integration',
            }[result.type];

            output += `${icon} ${typeLabel}: ${result.message}\n`;
        }

        output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        console.log(output);
        process.exit(0);
    } catch (error) {
        // Silent fail - status documentation is not critical path
        // Log to stderr for debugging if needed
        if (process.env.DEBUG) {
            console.error(
                `[status-auto-updater] Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
        process.exit(0);
    }
}

main();
