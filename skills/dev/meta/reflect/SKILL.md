---
name: reflect
description: Analyze conversation for learnings and update skill/memory files
---

# Reflection & Self-Improvement Skill

## Purpose

Guide Claude in analyzing conversations for learnings and systematically updating memory files to improve future interactions. This skill enables continuous learning from user corrections, preferences, and successful patterns.

---

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `/reflect` | Manual analysis of current session |
| `/reflect-on` | Enable auto-reflection on session end |
| `/reflect-off` | Disable auto-reflection |
| `/reflect-status` | Show reflection status and history |

### Confidence Levels

| Level | Trigger | Action |
|-------|---------|--------|
| HIGH | Explicit correction or preference | Propose/auto-capture |
| MEDIUM | Implicit correction or pattern | Suggest for review |
| LOW | One-time or unclear signal | Log only |

---

## Signal Detection Patterns

### Correction Indicators (HIGH confidence)

Look for these patterns in user messages:

```
- "no," / "nope" / "don't" / "do not"
- "wrong" / "incorrect" / "that's not right"
- "instead" / "rather" / "actually"
- "I meant" / "what I wanted was"
- "please change" / "can you fix"
- "never do X" / "always do Y instead"
- User provides different code/approach after Claude's suggestion
```

### Preference Indicators (MEDIUM-HIGH confidence)

```
- "I prefer" / "I like to"
- "always use" / "never use"
- "we do it this way" / "our convention is"
- "make sure to" / "don't forget to"
- "the standard here is"
```

### Approval Indicators (confirmation of good patterns)

```
- "yes" / "perfect" / "exactly"
- "that's right" / "correct"
- "thanks" / "great" / "good"
- User accepts and builds on suggestion
```

---

## Learning Categories

When categorizing learnings, use these categories:

### 1. Code Style
- Naming conventions (camelCase, PascalCase, etc.)
- Formatting preferences (spacing, line breaks)
- Import organization
- Comment style

### 2. Architecture
- File organization patterns
- Module structure
- Layer separation (controllers, services, etc.)
- API design conventions

### 3. Technology
- Preferred libraries
- Framework conventions
- Database patterns
- Testing approaches

### 4. Process
- Commit message style
- PR conventions
- Documentation requirements
- Code review preferences

### 5. Communication
- Response format preferences
- Level of detail desired
- Explanation style

---

## Three-Tier Memory System

Memory exists at three levels, read in order (lower priority → higher priority):

```
~/.pi/memory/              # PERSONAL: Your individual preferences
    ↓ (overridden by)
.pi/base/memory/           # TEAM: Shared conventions via submodule
    ↓ (overridden by)
.pi-project/memory/        # PROJECT: Project-specific details
```

### Personal Level (`~/.pi/memory/`)

**Scope:** Follows you across ALL projects on your machine
**Examples:**
- "I prefer concise responses"
- "Always use async/await over .then()"
- "I like detailed commit messages"

**When to use:** Personal coding style, communication preferences

### Team Level (`.pi/base/memory/`)

**Scope:** Shared with team via git submodule
**Examples:**
- "We use Tailwind, not styled-components"
- "API endpoints follow REST conventions"
- "Team uses Playwright for E2E tests"

**When to use:** Team conventions, shared library preferences

### Project Level (`.pi-project/memory/`)

**Scope:** Only this specific project
**Examples:**
- "This project uses MySQL, not PostgreSQL"
- "Auth is handled by custom JWT implementation"
- "Legacy code in /src/old/ should not be modified"

**When to use:** Project-specific patterns, business logic details

---

## Memory File Structure

Each level contains three files:

### LEARNINGS.md
General learnings from corrections and patterns.

Entry format:
```markdown
### [Date]: [Brief Title]

**Type**: correction | preference | pattern
**Confidence**: HIGH | MEDIUM | LOW
**Source**: Session reflection | Auto-reflection

**Description**: [What was learned]

**Evidence**:
- "[Quoted user message or action]"

---
```

### PREFERENCES.md
Explicit preferences organized by category.

### CORRECTIONS.md
Mistakes to avoid - what NOT to do.

---

## Choosing the Right Level

| Signal | Suggested Level |
|--------|-----------------|
| "I prefer..." | Personal |
| "I always..." | Personal |
| "We always...", "Our team..." | Team |
| "Our convention is..." | Team |
| "In this project..." | Project |
| "This codebase uses..." | Project |
| Unclear | Default to Project (safest) |

---

## Auto-Reflection Behavior

When auto-reflection is enabled (`/reflect-on`):

1. **Trigger**: Runs on session Stop event
2. **Analysis**: Scans conversation for correction patterns
3. **Filter**: Only HIGH confidence learnings are auto-captured
4. **Storage**: Appends to `LEARNINGS.md`
5. **Commit**: Auto-commits changes to git
6. **Notification**: Shows brief message about captured learnings

### Safety Features

- Only HIGH confidence corrections are auto-applied
- MEDIUM/LOW require manual `/reflect` command
- All changes are version-controlled
- Can be disabled with `/reflect-off` or `SKIP_AUTO_REFLECT=1`

---

## Best Practices

### When Detecting Signals

1. **Context matters** - Consider the full conversation context
2. **Don't over-interpret** - One-time adjustments may not be preferences
3. **Explicit beats implicit** - Prioritize direct statements
4. **Ask if unclear** - When in doubt, ask user to confirm

### When Storing Learnings

1. **Be specific** - Include concrete examples
2. **Quote evidence** - Include the actual user message
3. **Categorize properly** - Use appropriate category
4. **Don't duplicate** - Check for existing similar learnings

### When Applying Learnings

1. **Read memory files** at start of relevant tasks
2. **Prioritize HIGH confidence** learnings
3. **Consider context** - Not all learnings apply everywhere
4. **Evolve over time** - Learnings can be updated/removed

---

## Integration Points

### With Other Skills

- **skill-developer**: Can create new skills from patterns
- **code-review**: Apply learnings during reviews

### With Hooks

- **Stop hook**: Triggers auto-reflection
- **UserPromptSubmit**: Could suggest reflection when patterns detected

### With Git

- All memory file changes are committed
- Commit messages follow `reflect:` prefix convention
- Version history shows learning evolution

---

## Troubleshooting

### Auto-reflection not running

1. Check if enabled: `/reflect-status`
2. Verify hook is registered in `settings.json`
3. Check for `SKIP_AUTO_REFLECT` env variable
4. Ensure `.pi-project/state/` directory exists

### Learnings not being captured

1. Run manual `/reflect` to see what's detected
2. Check if signals match HIGH confidence patterns
3. Verify write permissions to the target memory directory:
   - Personal: `~/.pi/memory/`
   - Team: `.pi/base/memory/`
   - Project: `.pi-project/memory/`

### Git commits failing

1. Ensure project is a git repository
2. Check for uncommitted conflicts
3. Verify git user is configured

### Memory not being applied

1. Check that memory files exist at the expected level
2. Verify the reading order: personal → team → project
3. Higher levels override lower levels for the same topic
