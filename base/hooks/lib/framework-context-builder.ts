import { readdirSync, existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

export interface FrameworkResource {
  name: string;
  path: string;
  description?: string;
}

export interface FrameworkResources {
  framework: string;
  skills: FrameworkResource[];
  guides: FrameworkResource[];
  agents: FrameworkResource[];
  commands: FrameworkResource[];
}

/**
 * Discovers available framework directories in .pi/
 * Returns list of framework names (e.g., ['nestjs', 'react', 'django'])
 */
export function discoverFrameworks(claudeDir: string): string[] {
  const frameworks: string[] = [];

  if (!existsSync(claudeDir)) {
    return frameworks;
  }

  const knownFrameworks = ['nestjs', 'django', 'react', 'react-native', 'marketing', 'operations'];

  try {
    const entries = readdirSync(claudeDir);

    for (const entry of entries) {
      // Check if it's a known framework directory
      if (knownFrameworks.includes(entry)) {
        const entryPath = join(claudeDir, entry);

        // Verify it's a directory
        if (statSync(entryPath).isDirectory()) {
          frameworks.push(entry);
        }
      }
    }
  } catch (error) {
    console.error('Error discovering frameworks:', error);
  }

  return frameworks.sort();
}

/**
 * Scans a framework directory for resources (skills, guides, agents, commands)
 */
export function scanFrameworkResources(claudeDir: string, framework: string): FrameworkResources {
  const frameworkPath = join(claudeDir, framework);
  const resources: FrameworkResources = {
    framework,
    skills: [],
    guides: [],
    agents: [],
    commands: []
  };

  if (!existsSync(frameworkPath)) {
    return resources;
  }

  // Scan skills directory
  const skillsDir = join(frameworkPath, 'skills');
  if (existsSync(skillsDir)) {
    try {
      const skillEntries = readdirSync(skillsDir);
      for (const entry of skillEntries) {
        const skillPath = join(skillsDir, entry);

        // Check if it's a directory (skill package)
        if (statSync(skillPath).isDirectory()) {
          const skillFile = join(skillPath, 'SKILL.md');
          if (existsSync(skillFile)) {
            resources.skills.push({
              name: entry,
              path: `.pi/${framework}/skills/${entry}/SKILL.md`,
              description: extractDescription(skillFile)
            });
          }
        } else if (entry.endsWith('.md')) {
          // Standalone skill markdown
          resources.skills.push({
            name: entry.replace('.md', ''),
            path: `.pi/${framework}/skills/${entry}`,
            description: extractDescription(skillPath)
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning ${framework} skills:`, error);
    }
  }

  // Scan guides directory
  const guidesDir = join(frameworkPath, 'guides');
  if (existsSync(guidesDir)) {
    try {
      const guideEntries = readdirSync(guidesDir).filter(f => f.endsWith('.md'));
      for (const entry of guideEntries) {
        const guidePath = join(guidesDir, entry);
        resources.guides.push({
          name: entry.replace('.md', ''),
          path: `.pi/${framework}/guides/${entry}`,
          description: extractDescription(guidePath)
        });
      }
    } catch (error) {
      console.error(`Error scanning ${framework} guides:`, error);
    }
  }

  // Scan agents directory
  const agentsDir = join(frameworkPath, 'agents');
  if (existsSync(agentsDir)) {
    try {
      const agentEntries = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      for (const entry of agentEntries) {
        const agentPath = join(agentsDir, entry);
        resources.agents.push({
          name: entry.replace('.md', ''),
          path: `.pi/${framework}/agents/${entry}`,
          description: extractDescription(agentPath)
        });
      }
    } catch (error) {
      console.error(`Error scanning ${framework} agents:`, error);
    }
  }

  // Scan commands directory
  const commandsDir = join(frameworkPath, 'commands');
  if (existsSync(commandsDir)) {
    try {
      scanCommandsRecursive(commandsDir, framework, '', resources.commands);
    } catch (error) {
      console.error(`Error scanning ${framework} commands:`, error);
    }
  }

  return resources;
}

/**
 * Recursively scans commands directory
 */
function scanCommandsRecursive(
  dir: string,
  framework: string,
  prefix: string,
  commands: FrameworkResource[]
): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const entryPath = join(dir, entry);
    const stat = statSync(entryPath);

    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      scanCommandsRecursive(entryPath, framework, `${prefix}${entry}/`, commands);
    } else if (entry.endsWith('.md')) {
      const commandName = entry.replace('.md', '');
      commands.push({
        name: `${prefix}${commandName}`,
        path: `.pi/${framework}/commands/${prefix}${entry}`,
        description: extractDescription(entryPath)
      });
    }
  }
}

/**
 * Extracts description from markdown file's frontmatter or first heading
 */
function extractDescription(filePath: string): string | undefined {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Try to extract from frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      if (descMatch) {
        return descMatch[1].trim();
      }
    }

    // Try to extract from first heading
    const headingMatch = content.match(/^#\s+(.+)/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
  } catch (error) {
    // Silently fail for description extraction
  }

  return undefined;
}

/**
 * Builds formatted context string for agent injection
 */
export function buildContextString(claudeDir: string, frameworks: string[]): string {
  if (frameworks.length === 0) {
    return '';
  }

  const lines: string[] = [];
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🎯 FRAMEWORK RESOURCES AVAILABLE');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`Assigned Frameworks: ${frameworks.join(', ')}`);
  lines.push('');

  for (const framework of frameworks) {
    const resources = scanFrameworkResources(claudeDir, framework);
    const frameworkName = framework.toUpperCase().replace('-', ' ');

    lines.push(`📚 ${frameworkName} RESOURCES:`);
    lines.push('');

    // Guides
    if (resources.guides.length > 0) {
      lines.push(`Guides (.pi/${framework}/guides/):`);
      const displayCount = Math.min(resources.guides.length, 5);
      for (let i = 0; i < displayCount; i++) {
        const guide = resources.guides[i];
        const desc = guide.description ? ` - ${guide.description}` : '';
        lines.push(`  → ${guide.name}.md${desc}`);
      }
      if (resources.guides.length > 5) {
        lines.push(`  (+ ${resources.guides.length - 5} more guides)`);
      }
      lines.push('');
    }

    // Skills
    if (resources.skills.length > 0) {
      lines.push(`Skills (.pi/${framework}/skills/):`);
      for (const skill of resources.skills) {
        const desc = skill.description ? ` - ${skill.description}` : '';
        lines.push(`  → ${skill.name}${desc}`);
      }
      lines.push('');
    }

    // Agents
    if (resources.agents.length > 0) {
      lines.push(`Agents (.pi/${framework}/agents/):`);
      for (const agent of resources.agents) {
        const desc = agent.description ? ` - ${agent.description}` : '';
        lines.push(`  → ${agent.name}${desc}`);
      }
      lines.push('');
    }

    // Commands (optional - only if many)
    if (resources.commands.length > 0) {
      lines.push(`Commands: ${resources.commands.length} available`);
      lines.push('');
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('IMPORTANT: Use these resources when implementing features.');
  lines.push('Reference guides for patterns, invoke skills for specialized tasks.');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main function to get framework context for an agent
 */
export function getFrameworkContext(claudeDir: string, frameworks: string[]): string {
  // Discover available frameworks
  const availableFrameworks = discoverFrameworks(claudeDir);

  // Filter to only requested frameworks that actually exist
  const existingFrameworks = frameworks.filter(f => availableFrameworks.includes(f));

  if (existingFrameworks.length === 0) {
    return '';
  }

  // Build and return context string
  return buildContextString(claudeDir, existingFrameworks);
}
