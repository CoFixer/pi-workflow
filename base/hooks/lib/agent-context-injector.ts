import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getFrameworkContext } from './framework-context-builder';
import { detectBackendStack, DetectedStack } from './detectors/stack-detector';

export interface AgentType {
  description: string;
  frameworks: string[];
  color?: string;
  defaultModel?: string;
}

export interface AgentConfig {
  type: string;
  description: string;
  frameworkOverrides: string[] | null;
}

export interface AgentRegistry {
  version: string;
  description?: string;
  agentTypes: Record<string, AgentType>;
  agents: Record<string, AgentConfig>;
}

/**
 * Loads agent registry from agent-registry.json
 */
export function loadAgentRegistry(claudeDir: string): AgentRegistry | null {
  const registryPath = join(claudeDir, 'agents', 'agent-registry.json');

  if (!existsSync(registryPath)) {
    console.error('Agent registry not found at:', registryPath);
    return null;
  }

  try {
    const content = readFileSync(registryPath, 'utf-8');
    const registry: AgentRegistry = JSON.parse(content);
    return registry;
  } catch (error) {
    console.error('Error loading agent registry:', error);
    return null;
  }
}

/**
 * Resolves frameworks for a given agent name
 * Returns list of framework names this agent should have access to
 *
 * @param registry - Agent registry configuration
 * @param agentName - Name of the agent
 * @param projectRoot - Optional project root for stack detection
 */
export function resolveFrameworks(
  registry: AgentRegistry,
  agentName: string,
  projectRoot?: string
): string[] {
  // Get agent configuration
  const agentConfig = registry.agents[agentName];

  if (!agentConfig) {
    console.warn(`Agent "${agentName}" not found in registry`);
    return [];
  }

  // If agent has framework overrides, use those
  if (agentConfig.frameworkOverrides && agentConfig.frameworkOverrides.length > 0) {
    return agentConfig.frameworkOverrides;
  }

  // Otherwise, get frameworks from agent type
  const agentType = registry.agentTypes[agentConfig.type];

  if (!agentType) {
    console.warn(`Agent type "${agentConfig.type}" not found in registry`);
    return [];
  }

  let frameworks = agentType.frameworks || [];

  // Stack filtering for backend agents
  if (projectRoot && agentConfig.type === 'backend') {
    const detectedStack = detectBackendStack(projectRoot);

    if (detectedStack.backend) {
      // Only include the detected backend framework
      frameworks = frameworks.filter(f => f === detectedStack.backend);
      console.log(`[Stack Detection] Filtered to detected backend: ${detectedStack.backend}`);
    } else if (detectedStack.hasProject) {
      // PROJECT_KNOWLEDGE.md exists but no backend detected - log warning
      console.warn('[Stack Detection] PROJECT_KNOWLEDGE.md exists but backend stack not detected');
      // Keep all frameworks as fallback
    }
    // If no PROJECT_KNOWLEDGE.md, keep all frameworks (setup in progress)
  }

  return frameworks;
}

/**
 * Builds a stack detection info banner for backend agents
 *
 * @param stack - Detected stack information
 * @returns Formatted banner string
 */
function buildStackInfoBanner(stack: DetectedStack): string {
  if (!stack.hasProject) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  STACK DETECTION: No PROJECT_KNOWLEDGE.md found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: Project documentation not initialized
Action: Using generic backend instructions (both NestJS and Django)
Note: Run /new-project or manually create .pi-project/docs/PROJECT_KNOWLEDGE.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  if (!stack.backend) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  STACK DETECTION: Backend not specified in PROJECT_KNOWLEDGE.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: PROJECT_KNOWLEDGE.md exists but backend stack not detected
Action: Using generic backend instructions (both NestJS and Django)
Fix: Add "- **Backend**: nestjs" or "- **Backend**: django" to Tech Stack section
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  const stackName = stack.backend === 'nestjs' ? 'NestJS' : 'Django REST Framework';
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ DETECTED BACKEND STACK: ${stackName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source: .pi-project/docs/PROJECT_KNOWLEDGE.md
Framework Resources: .pi/${stack.backend}/
Action: Using ${stackName}-specific instructions and patterns
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Injects framework context into agent prompt
 * Returns the prompt with prepended framework context
 */
export function injectContext(
  claudeDir: string,
  agentName: string,
  prompt: string
): string {
  // Load registry
  const registry = loadAgentRegistry(claudeDir);

  if (!registry) {
    // Registry not found, return prompt unchanged
    return prompt;
  }

  // Determine project root (claudeDir is .claude, go one level up)
  const projectRoot = join(claudeDir, '..');

  // Resolve frameworks for this agent (now with stack filtering)
  const frameworks = resolveFrameworks(registry, agentName, projectRoot);

  if (frameworks.length === 0) {
    // No frameworks assigned to this agent (generic agent)
    return prompt;
  }

  // Get framework context
  const context = getFrameworkContext(claudeDir, frameworks);

  if (!context) {
    // No context generated (frameworks not available)
    return prompt;
  }

  // Add stack detection info banner for backend agents
  const agentConfig = registry.agents[agentName];
  if (agentConfig && agentConfig.type === 'backend') {
    const detectedStack = detectBackendStack(projectRoot);
    const stackInfo = buildStackInfoBanner(detectedStack);
    return `${stackInfo}\n${context}\n${prompt}`;
  }

  // Prepend context to prompt
  return `${context}\n${prompt}`;
}

/**
 * Gets agent metadata from registry
 */
export function getAgentMetadata(
  claudeDir: string,
  agentName: string
): { type: string; frameworks: string[]; description: string } | null {
  const registry = loadAgentRegistry(claudeDir);

  if (!registry) {
    return null;
  }

  const agentConfig = registry.agents[agentName];
  if (!agentConfig) {
    return null;
  }

  const frameworks = resolveFrameworks(registry, agentName);

  return {
    type: agentConfig.type,
    frameworks,
    description: agentConfig.description
  };
}

/**
 * Lists all agents of a specific type
 */
export function getAgentsByType(
  claudeDir: string,
  type: string
): string[] {
  const registry = loadAgentRegistry(claudeDir);

  if (!registry) {
    return [];
  }

  return Object.entries(registry.agents)
    .filter(([_, config]) => config.type === type)
    .map(([name, _]) => name);
}

/**
 * Gets all available frameworks from registry
 */
export function getAllFrameworks(claudeDir: string): string[] {
  const registry = loadAgentRegistry(claudeDir);

  if (!registry) {
    return [];
  }

  const frameworksSet = new Set<string>();

  // Collect all frameworks from agent types
  for (const agentType of Object.values(registry.agentTypes)) {
    for (const framework of agentType.frameworks) {
      frameworksSet.add(framework);
    }
  }

  // Collect frameworks from agent overrides
  for (const agent of Object.values(registry.agents)) {
    if (agent.frameworkOverrides) {
      for (const framework of agent.frameworkOverrides) {
        frameworksSet.add(framework);
      }
    }
  }

  return Array.from(frameworksSet).sort();
}
