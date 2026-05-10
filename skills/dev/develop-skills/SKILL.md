---
name: develop-skills
description: Creating and managing Claude Code skills, hooks, and skill-rules configuration
---

# Skill Developer Guide

## Purpose

Comprehensive guide for creating and managing skills in Claude Code with auto-activation system, following Anthropic's official best practices including the 500-line rule and progressive disclosure pattern.

## When to Use This Skill

Automatically activates when you mention:

- Creating or adding skills
- Modifying skill triggers or rules
- Understanding how skill activation works
- Debugging skill activation issues
- Working with skill-rules.json
- Hook system mechanics
- Claude Code best practices
- Progressive disclosure
- YAML frontmatter
- 500-line rule

---

## System Overview

### Hook Architecture

**UserPromptSubmit Hook** (Proactive Suggestions)

- **File**: `.pi/hooks/skill-activation-prompt.ts`
- **Trigger**: BEFORE Claude sees user's prompt
- **Purpose**: Suggest relevant skills based on keywords + intent patterns
- **Method**: Injects formatted reminder as context (stdout → Claude's input)
- **Use Cases**: Topic-based skills, implicit work detection

### Configuration File

**Location**: `.pi/skills/skill-rules.json`

Defines:

- All skills and their trigger conditions
- Enforcement levels (block, suggest, warn)
- File path patterns (glob)
- Content detection patterns (regex)
- Skip conditions (session tracking, file markers, env vars)

---

## Skill Types

### 1. Guardrail Skills

**Purpose:** Enforce critical best practices that prevent errors

**Characteristics:**

- Type: `"guardrail"`
- Enforcement: `"block"`
- Priority: `"critical"` or `"high"`
- Block file edits until skill used
- Prevent common mistakes (column names, critical errors)
- Session-aware (don't repeat nag in same session)

**Examples:**

- `error-tracking` - Enforce Sentry error capture in all code
- `frontend-dev-guidelines` - Enforce React/TypeScript patterns

**When to Use:**

- Mistakes that cause runtime errors
- Data integrity concerns
- Critical compatibility issues

### 2. Domain Skills

**Purpose:** Provide comprehensive guidance for specific areas

**Characteristics:**

- Type: `"domain"`
- Enforcement: `"suggest"`
- Priority: `"high"` or `"medium"`
- Advisory, not mandatory
- Topic or domain-specific
- Comprehensive documentation

**Examples:**

- `backend-dev-guidelines` - NestJS/TypeORM/TypeScript patterns
- `frontend-dev-guidelines` - React/TypeScript best practices
- `route-tester` - NestJS API testing guidance

**When to Use:**

- Complex systems requiring deep knowledge
- Best practices documentation
- Architectural patterns
- How-to guides

---

## Quick Start: Creating a New Skill

### Step 1: Create Skill File

**Location:** `.pi/skills/{skill-name}/SKILL.md`

**Template:**

````markdown
---
skill_name: my-new-skill
applies_to_local_project_only: true
auto_trigger_regex: [keyword1, keyword2, key phrase]
tags: [tag1, tag2, tag3]
related_skills: [related-skill-1, related-skill-2]
---

# My New Skill

Brief introduction - what this skill helps with and when to use it.

---

## Quick Start

The most important information first - what the user needs to know immediately.

### Example Pattern

```typescript
// Example code showing the pattern
```
````

---

## Detailed Sections

More comprehensive information organized in clear sections.

---

## Related Documentation

Links to related skills and project files.

````

**Best Practices:**
- ✅ **Name**: Lowercase, hyphens, gerund form (verb + -ing) preferred
- ✅ **Frontmatter**: Use YAML format with required fields
- ✅ **auto_trigger_regex**: Array of keywords/phrases that trigger this skill
- ✅ **Content**: Under 500 lines - use reference files for details
- ✅ **Examples**: Real code examples from your project
- ✅ **Structure**: Clear headings, lists, code blocks

### Step 2: Add to skill-rules.json

See [SKILL_RULES_REFERENCE.md](SKILL_RULES_REFERENCE.md) for complete schema.

**Basic Template:**
```json
{
  "my-new-skill": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "medium",
    "promptTriggers": {
      "keywords": ["keyword1", "keyword2"],
      "intentPatterns": ["(create|add).*?something"]
    }
  }
}
````

### Step 3: Test Triggers

**Test UserPromptSubmit:**

```bash
echo '{"session_id":"test","prompt":"your test prompt"}' | \
  npx tsx .pi/hooks/skill-activation-prompt.ts
```

**Expected output:**

- If triggered: Skill reminder injected into context
- If not triggered: Empty output or no skill suggestion

### Step 4: Refine Patterns

Based on testing:

- Add missing keywords to `auto_trigger_regex`
- Refine intent patterns to reduce false positives
- Adjust file path patterns
- Test content patterns against actual files

### Step 5: Follow Anthropic Best Practices

✅ Keep SKILL.md under 500 lines
✅ Use progressive disclosure with reference files
✅ Add table of contents to reference files > 100 lines
✅ Write detailed description with trigger keywords
✅ Test with 3+ real scenarios before documenting
✅ Iterate based on actual usage

---

## Skill Frontmatter Format

### Required Fields

```yaml
---
skill_name: my-skill-name
applies_to_local_project_only: true
auto_trigger_regex: [trigger1, trigger2, 'multi word trigger']
tags: [category1, category2]
related_skills: [skill1, skill2]
---
```

### Field Descriptions

**skill_name**

- Lowercase with hyphens
- Should match directory name
- Gerund form preferred (e.g., "testing-routes" not "test-routes")

**applies_to_local_project_only**

- Always `true` for project-specific skills
- `false` only for universal Claude Code skills

**auto_trigger_regex**

- Array of keywords and phrases
- Case-insensitive matching
- Can include multi-word phrases
- Examples: `[nestjs, controller, "@Controller"]`

**tags**

- Categorize the skill
- Helps with discovery and organization
- Common tags: `[testing, backend, frontend, database, api]`

**related_skills**

- Array of related skill names
- Links to complementary skills
- Used for cross-referencing

---

## Enforcement Levels

### BLOCK (Critical Guardrails)

- Physically prevents Edit/Write tool execution
- Exit code 2 from hook, stderr → Claude
- Claude sees message and must use skill to proceed
- **Use For**: Critical mistakes, data integrity, security issues

**Example:** Error tracking enforcement

```json
{
    "error-tracking": {
        "type": "guardrail",
        "enforcement": "block",
        "priority": "critical"
    }
}
```

### SUGGEST (Recommended)

- Reminder injected before Claude sees prompt
- Claude is aware of relevant skills
- Not enforced, just advisory
- **Use For**: Domain guidance, best practices, how-to guides

**Example:** Backend development guidelines

```json
{
    "backend-dev-guidelines": {
        "type": "domain",
        "enforcement": "suggest",
        "priority": "high"
    }
}
```

### WARN (Optional)

- Low priority suggestions
- Advisory only, minimal enforcement
- **Use For**: Nice-to-have suggestions, informational reminders

**Rarely used** - most skills are either BLOCK or SUGGEST.

---

## Trigger Types

### 1. Keyword Triggers

**Purpose:** Explicit topic matching

**Example:**

```json
{
    "keywords": [
        "nestjs",
        "controller",
        "@Injectable",
        "typeorm",
        "guard",
        "interceptor"
    ]
}
```

**Best Practices:**

- Use specific terms, not generic words
- Include framework-specific decorators
- Add common abbreviations
- Include file type keywords

### 2. Intent Patterns

**Purpose:** Implicit action detection

**Example:**

```json
{
    "intentPatterns": [
        "(create|add|implement).*?(controller|service|guard)",
        "(test|testing).*?(route|endpoint|api)",
        "(setup|configure|integrate).*?sentry"
    ]
}
```

**Best Practices:**

- Use regex alternation for variations
- Make patterns specific enough
- Test against real user prompts
- Avoid overly broad patterns

### 3. File Path Triggers

**Purpose:** Location-based activation

**Example:**

```json
{
    "filePaths": [
        "src/modules/**/*.controller.ts",
        "src/modules/**/*.service.ts",
        "src/core/guards/**/*.ts",
        "src/core/filters/**/*.ts"
    ]
}
```

**Best Practices:**

- Use glob patterns
- Target specific directories
- Include relevant file extensions
- Avoid matching too broadly

### 4. Content Patterns

**Purpose:** Technology-specific detection

**Example:**

```json
{
    "contentPatterns": [
        "@Controller\\(",
        "@Injectable\\(",
        "extends BaseController",
        "class.*Service extends BaseService"
    ]
}
```

**Best Practices:**

- Escape special regex characters
- Match unique code patterns
- Use class/decorator signatures
- Test against actual file contents

---

## Progressive Disclosure Pattern

### Main Skill File (SKILL.md)

**Purpose:** Quick reference and overview

**Should Include:**

- Essential patterns and examples
- Quick start guide
- Common use cases
- Links to detailed reference files

**Should NOT Include:**

- Exhaustive API documentation
- Every edge case
- Detailed troubleshooting
- Advanced configurations

**Line Limit:** < 500 lines

### Reference Files (resources/\*.md)

**Purpose:** Deep dive into specific topics

**Examples from backend-dev-guidelines:**

- `architecture-overview.md` - Four-layer architecture
- `routing-and-controllers.md` - NestJS controllers
- `services-and-repositories.md` - Business logic patterns
- `validation-patterns.md` - class-validator usage
- `database-patterns.md` - TypeORM patterns
- `middleware-guide.md` - Guards, interceptors, pipes
- `async-and-errors.md` - Exception handling

**Structure:**

```markdown
# Topic Name

Table of Contents (if > 100 lines)

## Section 1

Detailed information...

## Section 2

More details...

---

**Related Files:**

- [Other related file](./other-file.md)
```

---

## Real Examples from This Project

### backend-dev-guidelines

**Structure:**

```
.pi/skills/backend-dev-guidelines/
├── SKILL.md                          # Main entry (< 500 lines)
└── resources/
    ├── architecture-overview.md      # Four-layer pattern
    ├── routing-and-controllers.md    # NestJS controllers
    ├── services-and-repositories.md  # Business logic
    ├── validation-patterns.md        # class-validator
    ├── database-patterns.md          # TypeORM
    ├── middleware-guide.md           # Guards/Interceptors
    └── async-and-errors.md           # Exception handling
```

**Frontmatter:**

```yaml
---
skill_name: backend-dev-guidelines
applies_to_local_project_only: true
auto_trigger_regex:
    [
        nestjs,
        controller,
        service,
        repository,
        typeorm,
        guard,
        interceptor,
        dto,
        entity,
        module,
    ]
tags: [backend, nestjs, typescript, patterns, architecture]
related_skills: [error-tracking, route-tester]
---
```

### error-tracking

**Structure:**

```
.pi/skills/error-tracking/
└── SKILL.md                          # Single file (comprehensive)
```

**Frontmatter:**

```yaml
---
skill_name: error-tracking
applies_to_local_project_only: true
auto_trigger_regex:
    [sentry, error tracking, performance monitoring, error handling]
tags: [sentry, errors, monitoring, nestjs, performance]
related_skills: [backend-dev-guidelines]
---
```

### route-tester

**Structure:**

```
.pi/skills/route-tester/
└── SKILL.md                          # Single file (testing guide)
```

**Frontmatter:**

```yaml
---
skill_name: route-tester
applies_to_local_project_only: true
auto_trigger_regex:
    [test route, test endpoint, test api, route testing, endpoint testing]
tags: [testing, routes, api, nestjs, jwt, authentication]
related_skills: [backend-dev-guidelines, error-tracking]
---
```

---

## Testing Checklist

When creating a new skill, verify:

- [ ] Skill file created in `.pi/skills/{name}/SKILL.md`
- [ ] Proper YAML frontmatter with all required fields
- [ ] Entry added to `skill-rules.json` (if using legacy system)
- [ ] Keywords tested with real prompts
- [ ] Intent patterns tested with variations
- [ ] File path patterns tested with actual files
- [ ] Content patterns tested against file contents
- [ ] Block message is clear and actionable (if guardrail)
- [ ] Skip conditions configured appropriately
- [ ] Priority level matches importance
- [ ] No false positives in testing
- [ ] No false negatives in testing
- [ ] Performance is acceptable (<100ms or <200ms)
- [ ] JSON syntax validated: `jq . skill-rules.json`
- [ ] **SKILL.md under 500 lines** ⭐
- [ ] Reference files created if needed
- [ ] Table of contents added to files > 100 lines
- [ ] Examples use code from actual project
- [ ] Links to related skills are correct
- [ ] File references use relative paths

---

## Reference Files

For detailed information on specific topics, see:

### [TRIGGER_TYPES.md](TRIGGER_TYPES.md)

Complete guide to all trigger types:

- Keyword triggers (explicit topic matching)
- Intent patterns (implicit action detection)
- File path triggers (glob patterns)
- Content patterns (regex in files)
- Best practices and examples for each
- Common pitfalls and testing strategies

### [SKILL_RULES_REFERENCE.md](SKILL_RULES_REFERENCE.md)

Complete skill-rules.json schema:

- Full TypeScript interface definitions
- Field-by-field explanations
- Complete guardrail skill example
- Complete domain skill example
- Validation guide and common errors

### [HOOK_MECHANISMS.md](HOOK_MECHANISMS.md)

Deep dive into hook internals:

- UserPromptSubmit flow (detailed)
- Exit code behavior table (CRITICAL)
- Session state management
- Performance considerations

### [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Comprehensive debugging guide:

- Skill not triggering (UserPromptSubmit)
- False positives (too many triggers)
- Hook not executing at all
- Performance issues

### [PATTERNS_LIBRARY.md](PATTERNS_LIBRARY.md)

Ready-to-use pattern collection:

- Intent pattern library (regex)
- File path pattern library (glob)
- Content pattern library (regex)
- Organized by use case
- Copy-paste ready

### [ADVANCED.md](ADVANCED.md)

Future enhancements and ideas:

- Dynamic rule updates
- Skill dependencies
- Conditional enforcement
- Skill analytics
- Skill versioning

---

## Quick Reference Summary

### Create New Skill (5 Steps)

1. Create `.pi/skills/{name}/SKILL.md` with YAML frontmatter
2. Add entry to `.pi/skills/skill-rules.json` (if using legacy)
3. Test with `npx tsx` commands
4. Refine patterns based on testing
5. Keep SKILL.md under 500 lines

### Frontmatter Template

```yaml
---
skill_name: my-skill
applies_to_local_project_only: true
auto_trigger_regex: [keyword1, keyword2]
tags: [tag1, tag2]
related_skills: [related-skill]
---
```

### Trigger Types

- **Keywords**: Explicit topic mentions
- **Intent**: Implicit action detection
- **File Paths**: Location-based activation
- **Content**: Technology-specific detection

See [TRIGGER_TYPES.md](TRIGGER_TYPES.md) for complete details.

### Enforcement

- **BLOCK**: Exit code 2, critical only
- **SUGGEST**: Inject context, most common
- **WARN**: Advisory, rarely used

### Anthropic Best Practices

✅ **500-line rule**: Keep SKILL.md under 500 lines
✅ **Progressive disclosure**: Use reference files for details
✅ **Table of contents**: Add to reference files > 100 lines
✅ **One level deep**: Don't nest references deeply
✅ **Rich frontmatter**: Include all trigger keywords in auto_trigger_regex
✅ **Test first**: Build 3+ evaluations before extensive documentation
✅ **Gerund naming**: Prefer verb + -ing (e.g., "processing-pdfs")

### Troubleshoot

Test hooks manually:

```bash
# UserPromptSubmit
echo '{"prompt":"test"}' | npx tsx .pi/hooks/skill-activation-prompt.ts
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for complete debugging guide.

---

## Related Files

**Configuration:**

- `.pi/skills/skill-rules.json` - Master configuration (legacy)
- `.pi/hooks/state/` - Session tracking
- `.pi/settings.json` - Hook registration

**Hooks:**

- `.pi/hooks/skill-activation-prompt.ts` - UserPromptSubmit

**All Skills:**

- `.pi/skills/*/SKILL.md` - Skill content files
- `.pi/skills/*/resources/*.md` - Reference files

**Project Examples:**

- `.pi/skills/backend-dev-guidelines/` - Comprehensive multi-file skill
- `.pi/skills/error-tracking/` - Single-file guardrail skill
- `.pi/skills/route-tester/` - Testing-focused skill

---

**Skill Status**: COMPLETE - Updated for NestJS project ✅
**Line Count**: < 500 (following 500-line rule) ✅
**Progressive Disclosure**: Reference files for detailed information ✅

**Next**: Create more skills, refine patterns based on usage
