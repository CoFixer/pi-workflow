/**
 * Screen Status Updater
 *
 * Updates SCREEN_IMPLEMENTATION_STATUS.md based on detected page implementations.
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
    DetectedScreen,
    getSectionHeader,
    getAppFromPath,
} from '../detectors/screen-detector';

/**
 * Update screen status document with detected page implementation
 */
export function updateScreenStatus(
    projectRoot: string,
    screen: DetectedScreen
): { success: boolean; message: string } {
    const app = getAppFromPath(screen.filePath);
    const statusFilePath = join(
        projectRoot,
        `.project/status/${app}/SCREEN_IMPLEMENTATION_STATUS.md`
    );

    // Check if status file exists
    if (!existsSync(statusFilePath)) {
        return {
            success: false,
            message: `Status file not found: ${statusFilePath}`,
        };
    }

    try {
        let docContent = readFileSync(statusFilePath, 'utf-8');
        const sectionHeader = getSectionHeader(screen.section);

        // Find or create the section
        const { content: updatedContent } = findOrCreateSection(
            docContent,
            sectionHeader,
            2
        );
        docContent = updatedContent;

        // Get existing table or create new one
        let tableLocation = findTableInSection(docContent, sectionHeader);
        let table: MarkdownTable;

        const headers = [
            'Screen',
            'Route',
            'HTML Source',
            'Figma Node ID',
            'Status',
            'Last QA',
        ];

        if (tableLocation) {
            table = tableLocation.table;
        } else {
            table = { headers, rows: [] };
        }

        // Map status to emoji format
        const statusEmoji = getStatusEmoji(screen.status);

        // Update table with detected screen
        table = upsertTableRow(table, 'Route', screen.route, {
            Screen: screen.screenName,
            Route: `\`${screen.route}\``,
            'HTML Source': '-',
            'Figma Node ID': '-',
            Status: statusEmoji,
            'Last QA': '-',
        });

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
            message: `Updated ${screen.screenName} in ${sectionHeader}`,
        };
    } catch (error) {
        return {
            success: false,
            message: `Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

/**
 * Convert status to emoji format used in status docs
 */
function getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
        Complete: ':white_check_mark: Complete',
        'In Progress': ':construction: In Progress',
        'Not Started': ':x: Not Started',
        Review: ':mag: Review',
        Blocked: ':no_entry: Blocked',
    };

    return emojiMap[status] || status;
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
