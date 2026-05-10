#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    prompt: string;
}

interface PromptTriggers {
    keywords?: string[];
    intentPatterns?: string[];
}

interface SkillRule {
    type: 'guardrail' | 'domain';
    enforcement: 'block' | 'suggest' | 'warn';
    priority: 'critical' | 'high' | 'medium' | 'low';
    promptTriggers?: PromptTriggers;
}

interface SkillRules {
    version: string;
    skills: Record<string, SkillRule>;
}

interface MatchedSkill {
    name: string;
    matchType: 'keyword' | 'intent';
    config: SkillRule;
}

interface CommandInfo {
    name: string;
    source: string;
    description: string;
    keywords: string[];
}

interface MatchedCommand {
    name: string;
    source: string;
    description: string;
}

/**
 * Parse frontmatter from a markdown command file
 */
function parseFrontmatter(content: string): { description: string; argumentHint?: string } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        return { description: '' };
    }

    const frontmatter = frontmatterMatch[1];
    const descMatch = frontmatter.match(/description:\s*(.+)/);
    const argMatch = frontmatter.match(/argument-hint:\s*(.+)/);

    return {
        description: descMatch ? descMatch[1].trim() : '',
        argumentHint: argMatch ? argMatch[1].trim() : undefined,
    };
}

/**
 * Extract keywords from a description string
 */
function extractKeywords(description: string): string[] {
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
        'to', 'from', 'for', 'with', 'in', 'on', 'at', 'by', 'of', 'as',
        'be', 'this', 'that', 'it', 'its', 'your', 'you', 'we', 'our',
    ]);

    return description
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));
}

/**
 * Recursively scan a directory for .md command files
 */
function scanCommandsDir(
    dir: string,
    source: string,
    commands: Map<string, CommandInfo>,
    prefix: string = '',
): void {
    try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
            const entryPath = join(dir, entry);

            try {
                const stat = statSync(entryPath);

                if (stat.isDirectory()) {
                    // Recurse into subdirectory with category prefix
                    scanCommandsDir(entryPath, source, commands, entry);
                } else if (entry.endsWith('.md')) {
                    // Process command file
                    const baseName = entry.replace('.md', '');
                    // Command name includes category prefix if in subdirectory
                    const name = prefix ? `${prefix}/${baseName}` : baseName;

                    const content = readFileSync(entryPath, 'utf-8');
                    const frontmatter = parseFrontmatter(content);

                    commands.set(name, {
                        name,
                        source: prefix ? `${source}/${prefix}` : source,
                        description: frontmatter.description,
                        keywords: extractKeywords(frontmatter.description),
                    });
                }
            } catch {
                // Skip entries that can't be read
            }
        }
    } catch {
        // Directory read failed
    }
}

/**
 * Discover commands from all submodules in .claude directory
 * Supports both flat and categorized command structures
 */
function discoverCommands(claudeDir: string): Map<string, CommandInfo> {
    const commands = new Map<string, CommandInfo>();

    if (!existsSync(claudeDir)) {
        return commands;
    }

    // Get all directories in .pi/
    const entries = readdirSync(claudeDir);

    for (const entry of entries) {
        const entryPath = join(claudeDir, entry);

        // Skip non-directories and special entries
        if (!statSync(entryPath).isDirectory()) {
            continue;
        }

        // Check for commands/ subdirectory
        const commandsDir = join(entryPath, 'commands');
        if (!existsSync(commandsDir) || !statSync(commandsDir).isDirectory()) {
            continue;
        }

        // Recursively scan commands directory (supports nested folders)
        scanCommandsDir(commandsDir, entry, commands);
    }

    return commands;
}

/**
 * Discover skill-rules.json files from all submodules in .claude directory.
 * This allows each submodule (nestjs, django, react, react-native, base) to
 * define its own skill triggers that get merged together.
 */
function discoverSkillRulesPaths(claudeDir: string): string[] {
    const paths: string[] = [];

    // Always check the main skills directory first (project-specific overrides)
    const mainSkillRules = join(claudeDir, 'skills', 'skill-rules.json');
    if (existsSync(mainSkillRules)) {
        paths.push(mainSkillRules);
    }

    // Discover submodules dynamically
    try {
        const entries = readdirSync(claudeDir);
        for (const entry of entries) {
            // Skip the main skills folder and hidden entries
            if (entry === 'skills' || entry.startsWith('.')) continue;

            const entryPath = join(claudeDir, entry);
            try {
                if (!statSync(entryPath).isDirectory()) continue;
            } catch {
                continue;
            }

            // Check if this submodule has skills/skill-rules.json
            const submoduleRules = join(entryPath, 'skills', 'skill-rules.json');
            if (existsSync(submoduleRules)) {
                paths.push(submoduleRules);
            }
        }
    } catch {
        // Directory read failed, continue with what we have
    }

    return paths;
}

/**
 * Load and merge skill rules from all discovered locations (main + submodules).
 */
function loadAllSkillRules(claudeDir: string): SkillRules {
    const rulesPaths = discoverSkillRulesPaths(claudeDir);

    const mergedRules: SkillRules = {
        version: '1.0',
        skills: {},
    };

    for (const rulesPath of rulesPaths) {
        try {
            const rules: SkillRules = JSON.parse(
                readFileSync(rulesPath, 'utf-8'),
            );
            // Merge skills - later files override earlier ones
            Object.assign(mergedRules.skills, rules.skills);
        } catch {
            // File invalid, skip silently
        }
    }

    return mergedRules;
}

/**
 * Match commands against prompt
 */
function matchCommands(
    commands: Map<string, CommandInfo>,
    prompt: string,
): MatchedCommand[] {
    const matched: MatchedCommand[] = [];
    const promptLower = prompt.toLowerCase();

    for (const [, cmd] of commands) {
        // Check if any keyword from the command description appears in the prompt
        const keywordMatch = cmd.keywords.some((kw) => promptLower.includes(kw));

        if (keywordMatch) {
            matched.push({
                name: cmd.name,
                source: cmd.source,
                description: cmd.description,
            });
        }
    }

    return matched;
}

function main() {
    try {
        // Read input from stdin
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);
        const prompt = data.prompt.toLowerCase();

        const projectDir = process.env.CLAUDE_PROJECT_DIR || data.cwd;
        const claudeDir = join(projectDir, '.claude');

        // Load and merge skill rules from main skills/ and all submodules
        const rules = loadAllSkillRules(claudeDir);

        const matchedSkills: MatchedSkill[] = [];

        // Check each skill for matches
        for (const [skillName, config] of Object.entries(rules.skills)) {
            const triggers = config.promptTriggers;
            if (!triggers) {
                continue;
            }

            // Keyword matching
            if (triggers.keywords) {
                const keywordMatch = triggers.keywords.some((kw) =>
                    prompt.includes(kw.toLowerCase()),
                );
                if (keywordMatch) {
                    matchedSkills.push({
                        name: skillName,
                        matchType: 'keyword',
                        config,
                    });
                    continue;
                }
            }

            // Intent pattern matching
            if (triggers.intentPatterns) {
                const intentMatch = triggers.intentPatterns.some((pattern) => {
                    const regex = new RegExp(pattern, 'i');
                    return regex.test(prompt);
                });
                if (intentMatch) {
                    matchedSkills.push({
                        name: skillName,
                        matchType: 'intent',
                        config,
                    });
                }
            }
        }

        // Discover and match commands from all submodules
        const commands = discoverCommands(claudeDir);
        const matchedCommands = matchCommands(commands, data.prompt);

        // Generate output if matches found
        if (matchedSkills.length > 0 || matchedCommands.length > 0) {
            let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
            output += '🎯 SKILL & COMMAND ACTIVATION CHECK\n';
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

            // Output matched commands first
            if (matchedCommands.length > 0) {
                output += '📦 SUGGESTED COMMANDS:\n';
                matchedCommands.forEach((cmd) => {
                    output += `  → /${cmd.name} (${cmd.source})\n`;
                    if (cmd.description) {
                        output += `     ${cmd.description}\n`;
                    }
                });
                output += '\n';
            }

            // Group skills by priority
            const critical = matchedSkills.filter(
                (s) => s.config.priority === 'critical',
            );
            const high = matchedSkills.filter(
                (s) => s.config.priority === 'high',
            );
            const medium = matchedSkills.filter(
                (s) => s.config.priority === 'medium',
            );
            const low = matchedSkills.filter(
                (s) => s.config.priority === 'low',
            );

            if (critical.length > 0) {
                output += '⚠️ CRITICAL SKILLS (REQUIRED):\n';
                critical.forEach((s) => (output += `  → ${s.name}\n`));
                output += '\n';
            }

            if (high.length > 0) {
                output += '📚 RECOMMENDED SKILLS:\n';
                high.forEach((s) => (output += `  → ${s.name}\n`));
                output += '\n';
            }

            if (medium.length > 0) {
                output += '💡 SUGGESTED SKILLS:\n';
                medium.forEach((s) => (output += `  → ${s.name}\n`));
                output += '\n';
            }

            if (low.length > 0) {
                output += '📌 OPTIONAL SKILLS:\n';
                low.forEach((s) => (output += `  → ${s.name}\n`));
                output += '\n';
            }

            if (matchedSkills.length > 0) {
                output += 'ACTION: Use Skill tool BEFORE responding\n';
            }
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

            console.log(output);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error in skill-activation-prompt hook:', err);
        process.exit(1);
    }
}

main();
