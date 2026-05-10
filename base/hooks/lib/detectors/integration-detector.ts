/**
 * Integration Detector
 *
 * Detects Redux thunks and API calls from service files.
 */

export interface DetectedThunk {
    name: string;
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    endpoint: string;
    fullEndpoint: string;
}

export interface DetectedIntegration {
    serviceName: string;
    filePath: string;
    thunks: DetectedThunk[];
}

/**
 * Detect Redux thunks and API calls from a service file
 */
export function detectIntegration(
    filePath: string,
    fileContent: string
): DetectedIntegration | null {
    // Only process service files
    if (
        !filePath.includes('/services/') ||
        (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))
    ) {
        return null;
    }

    // Extract service name from file path
    const serviceNameMatch = filePath.match(/\/([^/]+)Service\.ts$/);
    const serviceName = serviceNameMatch
        ? serviceNameMatch[1] + 'Service'
        : extractServiceName(filePath);

    // Detect thunks
    const thunks = detectThunks(fileContent);

    if (thunks.length === 0) {
        return null;
    }

    return {
        serviceName,
        filePath,
        thunks,
    };
}

/**
 * Extract service name from file path
 */
function extractServiceName(filePath: string): string {
    const match = filePath.match(/\/([^/]+)\.ts$/);
    if (match) {
        return match[1];
    }
    return 'unknown';
}

/**
 * Detect all Redux async thunks in a file
 */
function detectThunks(fileContent: string): DetectedThunk[] {
    const thunks: DetectedThunk[] = [];

    // Build a map of API object methods to their endpoints
    const apiMethodMap = buildApiMethodMap(fileContent);

    // Pattern to match createAsyncThunk calls
    const thunkPattern =
        /export\s+const\s+(\w+)\s*=\s*createAsyncThunk\s*[<(]/g;

    let thunkMatch;
    while ((thunkMatch = thunkPattern.exec(fileContent)) !== null) {
        const thunkName = thunkMatch[1];
        const thunkStart = thunkMatch.index;

        const contextEnd = Math.min(fileContent.length, thunkStart + 2000);
        const thunkContext = fileContent.slice(thunkStart, contextEnd);

        // Try direct httpService call first, then API object method
        let apiCall = extractApiCall(thunkContext);
        if (!apiCall) {
            apiCall = extractApiObjectCall(thunkContext, apiMethodMap);
        }

        if (apiCall) {
            thunks.push({
                name: thunkName,
                method: apiCall.method,
                endpoint: apiCall.endpoint,
                fullEndpoint: `${apiCall.method} ${apiCall.endpoint}`,
            });
        }
    }

    return thunks;
}

/**
 * Build map of API object method names to their endpoints
 */
function buildApiMethodMap(fileContent: string): Map<string, ApiCall> {
    const methodMap = new Map<string, ApiCall>();

    // Pattern handles multiline arrow functions
    const apiMethodPattern =
        /(\w+)\s*:\s*\([^)]*\)\s*=>[\s\S]*?httpService\.(get|post|patch|put|delete)[^(]*\(\s*['"`]([^'"`]+)['"`]/gm;

    let match;
    while ((match = apiMethodPattern.exec(fileContent)) !== null) {
        const methodName = match[1];
        const httpMethod = match[2].toUpperCase() as ApiCall['method'];
        let endpoint = match[3];
        endpoint = endpoint.replace(/\$\{(\w+)\}/g, ':$1');
        methodMap.set(methodName, { method: httpMethod, endpoint });
    }

    return methodMap;
}

/**
 * Extract API call from API object method call (e.g., authApi.login)
 */
function extractApiObjectCall(
    context: string,
    apiMethodMap: Map<string, ApiCall>
): ApiCall | null {
    const apiCallPattern = /\w+Api\.(\w+)\s*\(/g;

    let match;
    while ((match = apiCallPattern.exec(context)) !== null) {
        const methodName = match[1];
        const apiCall = apiMethodMap.get(methodName);
        if (apiCall) {
            return apiCall;
        }
    }

    return null;
}

interface ApiCall {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    endpoint: string;
}

/**
 * Extract API call details from thunk context
 */
function extractApiCall(context: string): ApiCall | null {
    // Match httpService.get/post/patch/put/delete calls
    const apiCallPattern =
        /httpService\.(get|post|patch|put|delete)\s*(?:<[^>]*>)?\s*\(\s*['"`]([^'"`]+)['"`]/i;

    const match = context.match(apiCallPattern);
    if (!match) {
        return null;
    }

    const method = match[1].toUpperCase() as ApiCall['method'];
    let endpoint = match[2];

    // Handle template literals with variables
    // e.g., `/ideas/${ideaId}/comments` -> `/ideas/:ideaId/comments`
    endpoint = endpoint.replace(/\$\{(\w+)\}/g, ':$1');

    return { method, endpoint };
}

/**
 * Map service name to integration section header
 */
export function getIntegrationSectionHeader(serviceName: string): string {
    const sectionMap: Record<string, string> = {
        authService: 'Authentication',
        ideaService: 'Ideas Browsing & Viewing',
        voteService: 'Voting',
        commentService: 'Comments',
        savedIdeaService: 'Saved Ideas',
        mediaService: 'Media Upload',
        documentService: 'Documents',
        reportService: 'Admin - Reports Management',
        featuredIdeaService: 'Admin - Featured Management',
        userService: 'User Settings',
        communityService: 'Community',
        notificationService: 'Notifications',
        startupService: 'Startups',
    };

    return sectionMap[serviceName] || serviceName;
}

/**
 * Normalize endpoint for comparison
 */
export function normalizeEndpoint(endpoint: string): string {
    return endpoint
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
        .replace(/:\w+/g, ':id') // Normalize param names to :id
        .replace(/\$\{\w+\}/g, ':id'); // Handle template literal params
}
