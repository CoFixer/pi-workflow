/**
 * Markdown Table Utilities
 *
 * Parse and generate markdown tables for status documentation updates.
 */

export interface MarkdownTable {
    headers: string[];
    rows: Record<string, string>[];
}

export interface TableLocation {
    start: number;
    end: number;
    table: MarkdownTable;
}

/**
 * Parse a markdown table string into structured data
 */
export function parseMarkdownTable(tableText: string): MarkdownTable {
    const lines = tableText
        .trim()
        .split('\n')
        .filter((line) => line.trim().startsWith('|'));

    if (lines.length < 2) {
        return { headers: [], rows: [] };
    }

    // Parse header row
    const headers = lines[0]
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

    // Skip separator row (line 1)
    // Parse data rows (line 2+)
    const rows: Record<string, string>[] = [];

    for (let i = 2; i < lines.length; i++) {
        const cells = lines[i]
            .split('|')
            .map((cell) => cell.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length); // Remove empty first/last from split

        if (cells.length > 0) {
            const row: Record<string, string> = {};
            headers.forEach((header, idx) => {
                row[header] = cells[idx] || '';
            });
            rows.push(row);
        }
    }

    return { headers, rows };
}

/**
 * Generate a markdown table string from structured data
 */
export function generateMarkdownTable(
    headers: string[],
    rows: Record<string, string>[]
): string {
    if (headers.length === 0) {
        return '';
    }

    // Calculate column widths
    const widths = headers.map((header) => {
        const maxRowWidth = rows.reduce((max, row) => {
            return Math.max(max, (row[header] || '').length);
        }, 0);
        return Math.max(header.length, maxRowWidth, 3); // Minimum width of 3
    });

    // Generate header row
    const headerRow =
        '| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |';

    // Generate separator row
    const separatorRow =
        '|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|';

    // Generate data rows
    const dataRows = rows.map((row) => {
        return (
            '| ' +
            headers.map((h, i) => (row[h] || '').padEnd(widths[i])).join(' | ') +
            ' |'
        );
    });

    return [headerRow, separatorRow, ...dataRows].join('\n');
}

/**
 * Find a table within a specific section of a markdown document
 */
export function findTableInSection(
    docContent: string,
    sectionHeader: string
): TableLocation | null {
    // Find the section header
    const headerPattern = new RegExp(
        `^(#{1,6})\\s*${escapeRegex(sectionHeader)}\\s*$`,
        'm'
    );
    const headerMatch = docContent.match(headerPattern);

    if (!headerMatch || headerMatch.index === undefined) {
        return null;
    }

    const headerLevel = headerMatch[1].length;
    const sectionStart = headerMatch.index + headerMatch[0].length;

    // Find the end of this section (next header of same or higher level, or end of doc)
    const nextSectionPattern = new RegExp(`^#{1,${headerLevel}}\\s+`, 'm');
    const remainingContent = docContent.slice(sectionStart);
    const nextSectionMatch = remainingContent.match(nextSectionPattern);
    const sectionEnd = nextSectionMatch
        ? sectionStart + (nextSectionMatch.index || remainingContent.length)
        : docContent.length;

    const sectionContent = docContent.slice(sectionStart, sectionEnd);

    // Find table within section
    const tablePattern = /(\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)*)/;
    const tableMatch = sectionContent.match(tablePattern);

    if (!tableMatch || tableMatch.index === undefined) {
        return null;
    }

    const tableStart = sectionStart + tableMatch.index;
    const tableEnd = tableStart + tableMatch[0].length;
    const table = parseMarkdownTable(tableMatch[0]);

    return { start: tableStart, end: tableEnd, table };
}

/**
 * Replace a table within a specific section
 */
export function replaceTableInSection(
    docContent: string,
    sectionHeader: string,
    newTableContent: string
): string {
    const location = findTableInSection(docContent, sectionHeader);

    if (!location) {
        // Section exists but no table - try to add table after section header
        const headerPattern = new RegExp(
            `^(#{1,6})\\s*${escapeRegex(sectionHeader)}\\s*$`,
            'm'
        );
        const headerMatch = docContent.match(headerPattern);

        if (headerMatch && headerMatch.index !== undefined) {
            const insertPos = headerMatch.index + headerMatch[0].length;
            return (
                docContent.slice(0, insertPos) +
                '\n\n' +
                newTableContent +
                '\n' +
                docContent.slice(insertPos)
            );
        }

        return docContent; // Section not found, return unchanged
    }

    return (
        docContent.slice(0, location.start) +
        newTableContent +
        '\n' +
        docContent.slice(location.end)
    );
}

/**
 * Update or insert a row in a table
 */
export function upsertTableRow(
    table: MarkdownTable,
    matchKey: string,
    matchValue: string,
    newData: Record<string, string>
): MarkdownTable {
    const existingIndex = table.rows.findIndex(
        (row) => normalizeValue(row[matchKey]) === normalizeValue(matchValue)
    );

    const updatedRows = [...table.rows];

    if (existingIndex >= 0) {
        // Update existing row
        updatedRows[existingIndex] = {
            ...updatedRows[existingIndex],
            ...newData,
        };
    } else {
        // Insert new row
        const newRow: Record<string, string> = {};
        table.headers.forEach((h) => {
            newRow[h] = newData[h] || '';
        });
        updatedRows.push(newRow);
    }

    return { headers: table.headers, rows: updatedRows };
}

/**
 * Update the "Last Updated" date in a document header
 */
export function updateLastUpdatedDate(docContent: string): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return docContent.replace(
        /\*\*Last Updated:\*\*\s*\d{4}-\d{2}-\d{2}/,
        `**Last Updated:** ${today}`
    );
}

/**
 * Find or create a section in a document
 */
export function findOrCreateSection(
    docContent: string,
    sectionHeader: string,
    headerLevel: number = 2
): { content: string; created: boolean } {
    const headerPattern = new RegExp(
        `^(#{1,6})\\s*${escapeRegex(sectionHeader)}\\s*$`,
        'm'
    );

    if (headerPattern.test(docContent)) {
        return { content: docContent, created: false };
    }

    // Create new section at end of document
    const headerPrefix = '#'.repeat(headerLevel);
    const newSection = `\n\n${headerPrefix} ${sectionHeader}\n\n`;

    return { content: docContent + newSection, created: true };
}

// Helper functions

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeValue(value: string | undefined): string {
    if (!value) return '';
    return value
        .toLowerCase()
        .replace(/[`*_~]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}
