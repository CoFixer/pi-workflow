/**
 * API Status Updater
 *
 * Updates API_IMPLEMENTATION_STATUS.md based on detected controller endpoints.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
    parseMarkdownTable,
    generateMarkdownTable,
    findTableInSection,
    upsertTableRow,
    updateLastUpdatedDate,
    findOrCreateSection,
    MarkdownTable,
} from '../markdown-table';
import {
    DetectedController,
    getModuleSectionHeader,
} from '../detectors/api-detector';

const STATUS_FILE_PATH = '.pi-project/status/backend/API_IMPLEMENTATION_STATUS.md';

/**
 * Update API status document with detected controller endpoints
 */
export function updateApiStatus(
    projectRoot: string,
    controller: DetectedController
): { success: boolean; message: string; updatedCount: number } {
    const statusFilePath = join(projectRoot, STATUS_FILE_PATH);

    // Check if status file exists
    if (!existsSync(statusFilePath)) {
        return {
            success: false,
            message: `Status file not found: ${statusFilePath}`,
            updatedCount: 0,
        };
    }

    try {
        let docContent = readFileSync(statusFilePath, 'utf-8');
        const sectionHeader = getModuleSectionHeader(controller.moduleName);

        // Find or create the section
        const { content: updatedContent, created } = findOrCreateSection(
            docContent,
            sectionHeader,
            2
        );
        docContent = updatedContent;

        // Get existing table or create new one
        let tableLocation = findTableInSection(docContent, sectionHeader);
        let table: MarkdownTable;

        const headers = ['Endpoint', 'Method', 'Status', 'Auth', 'Notes'];

        if (tableLocation) {
            table = tableLocation.table;
        } else {
            // Create new table with headers
            table = { headers, rows: [] };
        }

        // Update table with detected endpoints
        let updatedCount = 0;
        for (const endpoint of controller.endpoints) {
            const fullPath = endpoint.fullPath;

            table = upsertTableRow(table, 'Endpoint', fullPath, {
                Endpoint: `\`${fullPath}\``,
                Method: endpoint.method,
                Status: 'Complete',
                Auth: endpoint.auth,
                Notes: endpoint.summary || '',
            });
            updatedCount++;
        }

        // Generate new table markdown
        const newTableMarkdown = generateMarkdownTable(table.headers, table.rows);

        // Replace or insert table in section
        if (tableLocation) {
            docContent =
                docContent.slice(0, tableLocation.start) +
                newTableMarkdown +
                '\n' +
                docContent.slice(tableLocation.end);
        } else {
            // Add table after section header
            const sectionPattern = new RegExp(
                `(##\\s*${escapeRegex(sectionHeader)}[^\\n]*\\n)`,
                'i'
            );
            const match = docContent.match(sectionPattern);
            if (match && match.index !== undefined) {
                const insertPos = match.index + match[0].length;
                docContent =
                    docContent.slice(0, insertPos) +
                    '\n' +
                    newTableMarkdown +
                    '\n\n' +
                    docContent.slice(insertPos);
            }
        }

        // Update last updated date
        docContent = updateLastUpdatedDate(docContent);

        // Write back to file
        writeFileSync(statusFilePath, docContent, 'utf-8');

        return {
            success: true,
            message: `Updated ${sectionHeader} with ${updatedCount} endpoints`,
            updatedCount,
        };
    } catch (error) {
        return {
            success: false,
            message: `Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`,
            updatedCount: 0,
        };
    }
}

/**
 * Add file reference comment to section if not present
 */
export function addFileReference(
    docContent: string,
    sectionHeader: string,
    filePath: string
): string {
    const sectionPattern = new RegExp(
        `(##\\s*${escapeRegex(sectionHeader)}[^\\n]*\\n)`,
        'i'
    );
    const match = docContent.match(sectionPattern);

    if (!match || match.index === undefined) {
        return docContent;
    }

    const sectionStart = match.index + match[0].length;
    const afterSection = docContent.slice(sectionStart, sectionStart + 200);

    // Check if file reference already exists
    if (afterSection.includes('> **File:**')) {
        return docContent;
    }

    // Add file reference
    const fileRef = `\n> **File:** \`${filePath}\`\n`;
    return (
        docContent.slice(0, sectionStart) +
        fileRef +
        docContent.slice(sectionStart)
    );
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
