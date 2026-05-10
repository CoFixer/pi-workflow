/**
 * Integration Status Updater
 *
 * Updates API_INTEGRATION_STATUS.md based on detected Redux thunks.
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
    DetectedIntegration,
    getIntegrationSectionHeader,
    normalizeEndpoint,
} from '../detectors/integration-detector';

/**
 * Update integration status document with detected thunks
 */
export function updateIntegrationStatus(
    projectRoot: string,
    integration: DetectedIntegration
): { success: boolean; message: string; updatedCount: number } {
    // Determine which app based on file path
    const app = integration.filePath.includes('dashboard')
        ? 'dashboard'
        : 'frontend';

    const statusFilePath = join(
        projectRoot,
        `.pi-project/status/${app}/API_INTEGRATION_STATUS.md`
    );

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
        const sectionHeader = getIntegrationSectionHeader(
            integration.serviceName
        );

        // Find or create the section
        const { content: updatedContent } = findOrCreateSection(
            docContent,
            sectionHeader,
            3 // Use ### for integration sections
        );
        docContent = updatedContent;

        // Get existing table or create new one
        let tableLocation = findTableInSection(docContent, sectionHeader);
        let table: MarkdownTable;

        const headers = [
            'Screen',
            'Route',
            'API Endpoint',
            'Status',
            'Service Method',
        ];

        if (tableLocation) {
            table = tableLocation.table;
        } else {
            table = { headers, rows: [] };
        }

        // Update table with detected thunks
        let updatedCount = 0;
        for (const thunk of integration.thunks) {
            // Try to find existing row by API endpoint
            const existingRowIndex = table.rows.findIndex((row) => {
                const rowEndpoint = row['API Endpoint'] || '';
                return (
                    normalizeEndpoint(rowEndpoint) ===
                    normalizeEndpoint(thunk.fullEndpoint)
                );
            });

            if (existingRowIndex >= 0) {
                // Update existing row
                table.rows[existingRowIndex] = {
                    ...table.rows[existingRowIndex],
                    Status: '**Complete** ✅',
                    'Service Method': `${thunk.name} (Redux)`,
                };
            } else {
                // Add new row (with placeholder screen/route since we don't know context)
                table.rows.push({
                    Screen: '(auto-detected)',
                    Route: '-',
                    'API Endpoint': `\`${thunk.fullEndpoint}\``,
                    Status: '**Complete** ✅',
                    'Service Method': `${thunk.name} (Redux)`,
                });
            }
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
            const sectionPattern = new RegExp(
                `(###\\s*${escapeRegex(sectionHeader)}[^\\n]*\\n)`,
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
            message: `Updated ${sectionHeader} with ${updatedCount} integrations`,
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

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
