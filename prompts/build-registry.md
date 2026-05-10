---
description: Build centralized registry of all skills, commands, agents, and their cross-references
argument-hint: Optional --generate-docs to update CLAUDE.md sections, --verbose for detailed output
---

You are a Claude Code registry builder. Your task is to scan the `.pi` directory structure and generate a `pi-registry.json` file that indexes all resources and their cross-references.

## Purpose

The registry solves three problems:
1. **Finding references** - When updating a skill, find all places that reference it
2. **Keeping docs in sync** - Generate CLAUDE.md sections from registry
3. **Detecting broken refs** - Provide data for validation command

---

## Step 1: Discover Commands

Scan for command files and extract metadata from frontmatter.

```bash
echo "=== Discovering Commands ==="
find .pi -path "*commands/*/*.md" -type f 2>/dev/null | sort
```

For each command file found, read it and extract:
- `description` from YAML frontmatter
- `argument-hint` from YAML frontmatter
- Source tier (base, nestjs, react, or project based on path)

**Expected output structure per command:**
```json
{
  "source": "base",
  "file": ".pi/base/commands/ralph.md",
  "description": "Run autonomous workflow loops"
}
```

---

## Step 2: Discover Skills

Scan for skill files at all tiers.

```bash
echo "=== Discovering Skills ==="
# Skill markdown files
find .pi -path "*skills/*.md" -type f 2>/dev/null | grep -v README | sort

# Skill directories with SKILL.md
find .pi -name "SKILL.md" -type f 2>/dev/null | sort

# skill-rules.json files
find .pi -name "skill-rules.json" -type f 2>/dev/null | sort
```

For each skill-rules.json, parse and extract skill definitions:
```bash
cat .pi/skills/skill-rules.json 2>/dev/null
cat .pi/base/skills/skill-rules.json 2>/dev/null
cat .pi/react/skills/skill-rules.json 2>/dev/null
cat .pi/nestjs/skills/skill-rules.json 2>/dev/null
```

**Extract from skill-rules.json:**
- Skill name/ID
- Type (domain, guardrail, workflow)
- Keywords and intent patterns (for triggers)
- File reference if specified

**Expected output structure per skill:**
```json
{
  "source": "react",
  "file": ".pi/react/skills/design-qa-patterns.md",
  "skillRulesFile": ".pi/react/skills/skill-rules.json",
  "description": "Compare UI screens against Figma designs",
  "type": "domain",
  "triggers": {
    "keywords": ["design qa", "figma", "pixel perfect"],
    "filePatterns": ["*.tsx", "*.css"]
  }
}
```

---

## Step 3: Discover Agents

Scan for agent definition files.

```bash
echo "=== Discovering Agents ==="
find .pi -path "*agents/*.md" -type f 2>/dev/null | grep -v README | sort
```

For each agent file, read and extract:
- First heading as name
- First paragraph as description
- Source tier from path

**Expected output structure per agent:**
```json
{
  "source": "react",
  "file": ".pi/react/agents/frontend-developer.md",
  "description": "Frontend development agent for React applications"
}
```

---

## Step 4: Discover Guides

Scan for guide/documentation files.

```bash
echo "=== Discovering Guides ==="
find .pi -path "*guides/*.md" -type f 2>/dev/null | sort
find .pi -path "*examples/*.md" -type f 2>/dev/null | sort
```

---

## Step 5: Scan for Cross-References

Scan documentation files to find where resources are referenced.

**Files to scan for references:**
```bash
echo "=== Scanning for References ==="
# Main documentation files
ls CLAUDE.md .pi/base/README.md .pi/react/README.md .pi/nestjs/README.md 2>/dev/null
```

For each resource discovered in Steps 1-4, search for references:
```bash
# Example: Search for references to "design-qa" skill
grep -r "design-qa" CLAUDE.md .pi/*/README.md .pi/base/commands/*.md 2>/dev/null
```

**Build cross-reference map:**
- `documentedIn` - Files that mention this resource
- `usedByCommands` - Commands that invoke this skill
- `relatedSkills` - Skills that reference each other

---

## Step 6: Identify Submodules

```bash
echo "=== Identifying Submodules ==="
cat .pi/.gitmodules 2>/dev/null
```

For each submodule, record:
- Path
- Git URL (if available)
- List of resources it provides

---

## Step 7: Generate Registry JSON

Combine all discovered data into `pi-registry.json`:

```json
{
  "$schema": "./claude-registry.schema.json",
  "version": "1.0",
  "generated": "<current ISO timestamp>",
  "resources": {
    "commands": { ... },
    "skills": { ... },
    "agents": { ... },
    "guides": { ... }
  },
  "submodules": { ... }
}
```

**Write the file:**
```bash
# The JSON will be written to .pi/pi-registry.json
```

---

## Step 8: Generate Documentation (if --generate-docs)

If `$ARGUMENTS` contains `--generate-docs`, update CLAUDE.md with generated sections.

**Look for markers:**
```markdown
<!-- BEGIN GENERATED: commands -->
... content to replace ...
<!-- END GENERATED: commands -->

<!-- BEGIN GENERATED: skills -->
... content to replace ...
<!-- END GENERATED: skills -->
```

**Generate content from registry:**

For commands section:
```markdown
## Available Commands

| Command | Description |
|---------|-------------|
| /ralph | Run autonomous workflow loops |
| /commit | Create commits on feature branches |
...
```

For skills section:
```markdown
## Available Skills

### From base/
- **skill-developer** - Creating and managing Claude Code skills

### From react/
- **design-qa-patterns** - Compare UI screens against Figma designs
...
```

---

## Output Format

### Success Output

```
=== Claude Registry Builder ===

Discovered:
  Commands: 12
  Skills: 18
  Agents: 8
  Guides: 5

Cross-references mapped:
  Total references: 47

Registry written to: .pi/pi-registry.json

[If --generate-docs]
Updated CLAUDE.md:
  - commands section (12 entries)
  - skills section (18 entries)
```

### Verbose Mode

If `$ARGUMENTS` contains `--verbose`, show:
- Full list of discovered files
- Each cross-reference found
- Warnings for resources without documentation

---

## Registry Schema Reference

The output must conform to `.pi/claude-registry.schema.json`.

Key constraints:
- `version` must be "1.0"
- `generated` must be ISO 8601 format
- All file paths must be relative to project root
- Source must be one of: "base", "react", "nestjs", "project"

---

## Tips for Implementation

1. **Parse YAML frontmatter** - Use regex or YAML parser:
   ```
   ---
   description: ...
   ---
   ```

2. **Extract skill info from skill-rules.json** - The `skills` object contains:
   - `type`, `enforcement`, `priority`
   - `promptTriggers.keywords`, `promptTriggers.intentPatterns`
   - `fileTriggers.pathPatterns`

3. **Normalize paths** - Always use forward slashes, relative to project root

4. **Handle missing files gracefully** - Some resources may not exist at all tiers

5. **Preserve manual content in CLAUDE.md** - Only replace content between markers
