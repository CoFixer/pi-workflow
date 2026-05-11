import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DetectedStack {
  backend: 'nestjs' | 'django' | null;
  frontends: string[];
  hasProject: boolean;
}

/**
 * Detect active backend stack from CLAUDE.md (primary) or PROJECT_KNOWLEDGE.md (fallback)
 *
 * @param projectRoot - The root directory of the project
 * @returns DetectedStack object with backend, frontends, and project status
 *
 * @example
 * const stack = detectBackendStack('/path/to/project');
 * if (stack.backend === 'nestjs') {
 *   console.log('NestJS project detected');
 * }
 */
export function detectBackendStack(projectRoot: string): DetectedStack {
  // Try CLAUDE.md first (faster, at root level, token-efficient)
  const claudeMdPath = join(projectRoot, 'CLAUDE.md');
  const knowledgePath = join(projectRoot, '.project', 'docs', 'PROJECT_KNOWLEDGE.md');

  const result: DetectedStack = {
    backend: null,
    frontends: [],
    hasProject: false
  };

  // Check CLAUDE.md first (5-10x faster than nested path)
  if (existsSync(claudeMdPath)) {
    try {
      const content = readFileSync(claudeMdPath, 'utf-8');

      // Parse Quick Stack Reference section
      // Format: - **Backend**: nestjs
      const backendMatch = content.match(/^-\s*\*\*Backend\*\*:\s*(\w+)/m);
      if (backendMatch) {
        const backend = backendMatch[1].toLowerCase();
        if (backend === 'nestjs' || backend === 'django') {
          result.backend = backend;
          result.hasProject = true;

          // Parse Frontend
          // Format: - **Frontend**: react, react-native
          const frontendMatch = content.match(/^-\s*\*\*Frontend\*\*:\s*([^\n]+)/m);
          if (frontendMatch) {
            result.frontends = frontendMatch[1]
              .split(',')
              .map((f: string) => f.trim().toLowerCase())
              .filter((f: string) => f.length > 0);
          }

          return result;
        }
      }
    } catch (error) {
      console.error('Error reading CLAUDE.md:', error);
      // Fall through to PROJECT_KNOWLEDGE.md fallback
    }
  }

  // Fallback to PROJECT_KNOWLEDGE.md
  if (!existsSync(knowledgePath)) {
    return result;
  }

  result.hasProject = true;

  try {
    const content = readFileSync(knowledgePath, 'utf-8');

    // Parse Tech Stack section
    // Format: - **Backend**: nestjs
    // Format: - **Backend**: django
    const backendMatch = content.match(/^-\s*\*\*Backend\*\*:\s*(\w+)/m);
    if (backendMatch) {
      const backend = backendMatch[1].toLowerCase();
      if (backend === 'nestjs' || backend === 'django') {
        result.backend = backend;
      }
    }

    // Parse Frontend (for completeness, though not needed for backend agent)
    // Format: - **Frontend**: react, react-native
    const frontendMatch = content.match(/^-\s*\*\*Frontend\*\*:\s*([^\n]+)/m);
    if (frontendMatch) {
      result.frontends = frontendMatch[1]
        .split(',')
        .map((f: string) => f.trim().toLowerCase())
        .filter((f: string) => f.length > 0);
    }

  } catch (error) {
    console.error('Error reading PROJECT_KNOWLEDGE.md:', error);
  }

  return result;
}

/**
 * Get backend-specific instruction marker
 * Used by agent to conditionally read instructions
 *
 * @param backend - The detected backend framework
 * @returns Instruction marker string
 */
export function getBackendInstructionMarker(backend: 'nestjs' | 'django' | null): string {
  if (!backend) {
    return 'STACK_NOT_DETECTED';
  }
  return backend === 'nestjs' ? 'NESTJS_INSTRUCTIONS' : 'DJANGO_INSTRUCTIONS';
}
