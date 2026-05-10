/**
 * API Detector
 *
 * Detects NestJS controller endpoints from file content.
 */

export interface DetectedEndpoint {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    fullPath: string;
    auth: 'Public' | 'JWT' | 'Admin';
    summary: string;
}

export interface DetectedController {
    controllerName: string;
    basePath: string;
    filePath: string;
    moduleName: string;
    endpoints: DetectedEndpoint[];
}

/**
 * Detect controller and endpoints from NestJS controller file content
 */
export function detectApiEndpoints(
    filePath: string,
    fileContent: string
): DetectedController | null {
    // Extract controller name
    const controllerMatch = fileContent.match(
        /export\s+class\s+(\w+Controller)/
    );
    if (!controllerMatch) {
        return null;
    }

    const controllerName = controllerMatch[1];

    // Extract base path from @Controller decorator
    const controllerDecoratorMatch = fileContent.match(
        /@Controller\(\s*['"`]([^'"`]*)['"`]\s*\)/
    );
    const basePath = controllerDecoratorMatch
        ? controllerDecoratorMatch[1]
        : '';

    // Extract module name from file path
    const moduleMatch = filePath.match(/modules\/([^/]+)\//);
    const moduleName = moduleMatch ? moduleMatch[1] : 'unknown';

    // Detect endpoints
    const endpoints = detectEndpoints(fileContent, basePath);

    return {
        controllerName,
        basePath,
        filePath,
        moduleName,
        endpoints,
    };
}

/**
 * Detect all endpoint methods in a controller
 */
function detectEndpoints(
    fileContent: string,
    basePath: string
): DetectedEndpoint[] {
    const endpoints: DetectedEndpoint[] = [];

    // Pattern to match method decorators and extract method info
    // We need to look for decorators followed by method definitions
    const methodPattern =
        /(?:@(Get|Post|Patch|Put|Delete)\s*\(\s*['"`]?([^'"`)\s]*)['"`]?\s*\)[\s\S]*?)?(?:@ApiOperation\s*\(\s*\{[^}]*summary\s*:\s*['"`]([^'"`]+)['"`][^}]*\}\s*\))?[\s\S]*?(?:@Public\s*\(\s*\)[\s\S]*?)?(?:@Roles\s*\(\s*[^)]*(?:ADMIN|SUPER_ADMIN)[^)]*\)\s*)?(?:async\s+)?(\w+)\s*\(/g;

    // Simpler approach: find each HTTP method decorator and extract info
    const httpMethods = ['Get', 'Post', 'Patch', 'Put', 'Delete'] as const;

    for (const method of httpMethods) {
        // Find all occurrences of @Method('path') or @Method()
        const decoratorPattern = new RegExp(
            `@${method}\\s*\\(\\s*(?:['"\`]([^'"\`]*)['"\`])?\\s*\\)`,
            'g'
        );

        let match;
        while ((match = decoratorPattern.exec(fileContent)) !== null) {
            const endpointPath = match[1] || '';
            const decoratorPosition = match.index;

            // Look backwards and forwards from decorator to find related decorators
            const contextStart = Math.max(0, decoratorPosition - 500);
            const contextEnd = Math.min(
                fileContent.length,
                decoratorPosition + 500
            );
            const context = fileContent.slice(contextStart, contextEnd);

            // Check for @Public()
            const isPublic = /@Public\s*\(\s*\)/.test(context);

            // Check for @Roles with ADMIN
            const isAdmin =
                /@Roles\s*\([^)]*(?:ADMIN|SUPER_ADMIN)[^)]*\)/.test(context);

            // Extract @ApiOperation summary
            const summaryMatch = context.match(
                /@ApiOperation\s*\(\s*\{[^}]*summary\s*:\s*['"`]([^'"`]+)['"`]/
            );
            const summary = summaryMatch ? summaryMatch[1] : '';

            // Build full path
            const fullPath = buildFullPath(basePath, endpointPath);

            // Determine auth type
            let auth: 'Public' | 'JWT' | 'Admin' = 'JWT'; // Default to JWT
            if (isPublic) {
                auth = 'Public';
            } else if (isAdmin) {
                auth = 'Admin';
            }

            endpoints.push({
                method: method.toUpperCase() as DetectedEndpoint['method'],
                path: endpointPath,
                fullPath,
                auth,
                summary,
            });
        }
    }

    return endpoints;
}

/**
 * Build full endpoint path from base path and endpoint path
 */
function buildFullPath(basePath: string, endpointPath: string): string {
    const parts = [];

    if (basePath) {
        parts.push(basePath.replace(/^\/|\/$/g, ''));
    }

    if (endpointPath) {
        parts.push(endpointPath.replace(/^\/|\/$/g, ''));
    }

    const fullPath = '/' + parts.join('/');

    // Clean up double slashes
    return fullPath.replace(/\/+/g, '/');
}

/**
 * Map module name to section header in status doc
 */
export function getModuleSectionHeader(moduleName: string): string {
    const moduleMap: Record<string, string> = {
        auth: 'Authentication APIs',
        users: 'Users APIs',
        ideas: 'Ideas APIs',
        votes: 'Votes APIs',
        comments: 'Comments APIs',
        'saved-ideas': 'Saved Ideas APIs',
        media: 'Media APIs',
        features: 'Features APIs',
        documents: 'Documents APIs',
        reports: 'Reports APIs',
        'featured-ideas': 'Featured Ideas APIs',
        otp: 'OTP APIs',
        community: 'Community APIs',
        notifications: 'Notifications APIs',
        startups: 'Startups APIs',
    };

    return (
        moduleMap[moduleName] ||
        `${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} APIs`
    );
}

/**
 * Convert controller path to a readable module name
 */
export function extractModuleFromPath(filePath: string): string {
    const match = filePath.match(/modules\/([^/]+)\//);
    return match ? match[1] : 'unknown';
}
