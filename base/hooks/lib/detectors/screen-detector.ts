/**
 * Screen Detector
 *
 * Detects React page implementations from file content.
 */

export interface DetectedScreen {
    screenName: string;
    route: string;
    section: string;
    filePath: string;
    status: 'Complete' | 'In Progress' | 'Not Started';
    hasDefaultExport: boolean;
    lineCount: number;
}

/**
 * Detect screen information from a React page file
 */
export function detectScreen(
    filePath: string,
    fileContent: string
): DetectedScreen | null {
    // Only process .tsx files in pages directories
    if (!filePath.includes('/pages/') || !filePath.endsWith('.tsx')) {
        return null;
    }

    // Extract section and screen name from file path
    const pathInfo = parsePagePath(filePath);
    if (!pathInfo) {
        return null;
    }

    // Check for default export (indicates implemented component)
    const hasDefaultExport =
        /export\s+default\s+function/.test(fileContent) ||
        /export\s+default\s+\w+/.test(fileContent) ||
        /export\s+\{\s*\w+\s+as\s+default\s*\}/.test(fileContent);

    // Count non-empty, non-comment lines
    const lineCount = countSubstantiveLines(fileContent);

    // Determine status based on content
    const status = determineScreenStatus(fileContent, lineCount);

    // Generate route from file path
    const route = generateRouteFromPath(filePath, pathInfo);

    return {
        screenName: pathInfo.screenName,
        route,
        section: pathInfo.section,
        filePath,
        status,
        hasDefaultExport,
        lineCount,
    };
}

interface PathInfo {
    section: string;
    screenName: string;
    relativePath: string;
}

/**
 * Parse page file path to extract section and screen name
 */
function parsePagePath(filePath: string): PathInfo | null {
    const pagesMatch = filePath.match(
        /(?:frontend|dashboard)\/app\/pages\/(.+)\.tsx$/
    );
    if (!pagesMatch) {
        return null;
    }

    const relativePath = pagesMatch[1];
    const parts = relativePath.split('/');

    if (parts.length === 1) {
        return {
            section: 'Public/Marketing',
            screenName: formatScreenName(parts[0]),
            relativePath,
        };
    }

    const section = formatSectionName(parts[0]);
    const screenPath = parts.slice(1).join('/');
    const screenName = formatScreenName(screenPath);

    return {
        section,
        screenName,
        relativePath,
    };
}

function formatSectionName(section: string): string {
    const sectionMap: Record<string, string> = {
        auth: 'Authentication',
        dashboard: 'User Dashboard',
        admin: 'Admin Dashboard',
        public: 'Public/Marketing',
    };

    return (
        sectionMap[section.toLowerCase()] ||
        section.charAt(0).toUpperCase() + section.slice(1)
    );
}

function formatScreenName(path: string): string {
    return path
        .split(/[/\-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateRouteFromPath(filePath: string, pathInfo: PathInfo): string {
    const { relativePath } = pathInfo;

    if (relativePath === 'home' || relativePath === 'landing') {
        return '/';
    }

    if (relativePath === 'index' || relativePath.endsWith('/index')) {
        const basePath = relativePath.replace(/\/?index$/, '');
        return '/' + basePath;
    }

    if (relativePath.startsWith('auth/')) {
        return '/' + relativePath.replace('auth/', '');
    }

    if (relativePath.startsWith('public/')) {
        return '/' + relativePath.replace('public/', '');
    }

    return '/' + relativePath;
}

function countSubstantiveLines(content: string): number {
    const lines = content.split('\n');
    let count = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (
            trimmed.length > 0 &&
            !trimmed.startsWith('//') &&
            !trimmed.startsWith('/*') &&
            !trimmed.startsWith('*') &&
            trimmed !== '*/'
        ) {
            count++;
        }
    }

    return count;
}

function determineScreenStatus(
    content: string,
    lineCount: number
): 'Complete' | 'In Progress' | 'Not Started' {
    const hasPlaceholder =
        /(?:TODO|FIXME|Coming\s+soon|Placeholder|Not\s+implemented)/i.test(
            content
        );

    const hasJsx =
        /<[A-Z]\w+/.test(content) || /<div|<section|<main|<form/.test(content);

    const isMinimalComponent = /return\s*\(\s*<div[^>]*>\s*<\/div>\s*\)/.test(
        content
    );

    if (!hasJsx || lineCount < 20) {
        return 'Not Started';
    }

    if (hasPlaceholder || isMinimalComponent || lineCount < 50) {
        return 'In Progress';
    }

    return 'Complete';
}

export function getSectionHeader(section: string): string {
    const headerMap: Record<string, string> = {
        Authentication: 'Authentication Screens',
        'User Dashboard': 'User Dashboard Screens',
        'Admin Dashboard': 'Admin Dashboard Screens',
        'Public/Marketing': 'Public/Marketing Screens',
        Profile: 'Profile & Settings Screens',
        Settings: 'Profile & Settings Screens',
    };

    return headerMap[section] || `${section} Screens`;
}

export function getAppFromPath(
    filePath: string
): 'frontend' | 'dashboard' {
    if (filePath.includes('dashboard')) {
        return 'dashboard';
    }
    return 'frontend';
}
