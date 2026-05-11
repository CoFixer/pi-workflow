---
description: Analyze conversation for learnings and update skill/memory files
argument-hint: [optional: focus area like "backend", "frontend", "testing"]
---

# Reflect Command

Analyze the current conversation session to extract learnings from corrections, approvals, and successful patterns. Propose updates to memory files with user approval.

---

## What This Command Does

1. **Scans Conversation** - Looks for correction signals, explicit preferences, successful patterns
2. **Categorizes Learnings** - Assigns confidence levels (HIGH/MEDIUM/LOW)
3. **Proposes Updates** - Shows proposed changes to memory files
4. **Requires Approval** - User must confirm before changes are applied
5. **Commits Changes** - Version-controls all updates in git

---

## Signal Detection

### HIGH Confidence (Propose for immediate update)

| Signal Type | Examples |
|-------------|----------|
| Explicit correction | "No, don't do X, do Y instead", "Wrong, use X" |
| Direct preference | "I prefer X over Y", "Always use X" |
| Explicit instruction | "Never use X in this project" |

### MEDIUM Confidence (Suggest for review)

| Signal Type | Examples |
|-------------|----------|
| Partial correction | "That's mostly right, but..." |
| Implied preference | "We usually do it this way" |
| Repeated pattern | Same approach accepted multiple times |

### LOW Confidence (Log for observation)

| Signal Type | Examples |
|-------------|----------|
| One-time adjustment | Single instance of different approach |
| Contextual decision | Project-specific choice |
| Unclear feedback | Ambiguous or mixed signals |

---

## Step 1: Analyze Current Conversation

Review the conversation from the beginning and identify:

### Corrections (look for these signals):
- User saying "no", "don't", "wrong", "instead", "actually", "not what I"
- User providing alternative code/approach after your suggestion
- User asking you to redo or fix something
- Phrases like "should be X not Y", "never do X"

### Preferences (look for these signals):
- "I prefer...", "I like to...", "Always use..."
- "We always...", "We never...", "Our convention is..."
- "Make sure to...", "Don't forget to..."

### Approvals (look for these signals):
- "Yes", "Perfect", "Exactly", "That's right"
- "Great", "Good", "Nice", "Well done"
- User accepting and building on your suggestion

---

## Step 2: Categorize Each Learning

For each identified signal, create a learning entry:

```markdown
### Learning: [Brief descriptive title]

**Signal Type**: correction | preference | pattern | approval
**Confidence**: HIGH | MEDIUM | LOW
**Category**: code-style | architecture | naming | process | testing | communication

**What was said/done**:
[The actual user message or action]

**What this means**:
[Your interpretation of the learning]

**Proposed action**:
[What should be remembered/updated]
```

---

## Step 3: Present Summary to User

Output a summary in this format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REFLECTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Summary:
- Messages analyzed: [count]
- Corrections detected: [count]
- Preferences detected: [count]
- Approvals detected: [count]

---

HIGH CONFIDENCE (will propose updates):

1. [Title]
   Signal: "[quoted user message]"
   Proposed: Add to LEARNINGS.md

2. [Title]
   Signal: "[quoted user message]"
   Proposed: Add to PREFERENCES.md

---

MEDIUM CONFIDENCE (suggestions to review):

1. [Title]
   Signal: "[quoted user message]"
   Note: Consider adding if pattern repeats

---

LOW CONFIDENCE (logged for observation):

1. [Title]
   Signal: "[quoted user message]"
   Note: May be context-specific

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 4: Ask for Memory Level

After presenting the summary, ask the user which memory level to save to:

**Use the AskUserQuestion tool with these options:**

Question: "Which memory level should these learnings be saved to?"

| Level | Location | When to Use |
|-------|----------|-------------|
| **Personal** | `~/.pi/memory/` | Your individual preferences (follows you everywhere) |
| **Team** | `.pi/base/docs/` | Team conventions (shared via submodule) |
| **Project** | `.project/memory/` | Project-specific details (default) |

**Guidelines for suggesting level:**
- "I prefer..." → Personal (unless they say "we")
- "We always...", "Our team..." → Team
- "In this project...", "This codebase..." → Project
- When unclear, default to Project (safest)

---

## Step 5: Ask for Approval

After level selection, ask:

"Would you like me to save these learnings?"

Options:
- **Yes** - Save all HIGH confidence learnings to selected level
- **Select specific** - Let user choose which ones to save
- **Skip** - Don't save anything this time

---

## Step 6: Apply Changes (if approved)

### For each approved learning:

1. **Read** the target file based on selected level (create if doesn't exist):

   **Personal level** (`~/.pi/memory/`):
   - `LEARNINGS.md` - Personal learnings
   - `PREFERENCES.md` - Personal preferences
   - `CORRECTIONS.md` - Personal corrections

   **Team level** (`.pi/base/docs/`):
   - `LEARNINGS.md` - Team-wide learnings
   - `PREFERENCES.md` - Team conventions
   - `CORRECTIONS.md` - Team anti-patterns

   **Project level** (`.project/memory/`):
   - `LEARNINGS.md` - Project-specific learnings
   - `PREFERENCES.md` - Project preferences
   - `CORRECTIONS.md` - Project-specific mistakes to avoid

2. **Append** the new learning entry:

```markdown
### [Date]: [Learning Title]

**Type**: [correction|preference|pattern]
**Confidence**: [HIGH|MEDIUM|LOW]
**Source**: Session reflection

**Description**: [What was learned]

**Evidence**:
- "[Quoted user message]"

---
```

3. **Commit** the changes:

```bash
git add .project/memory/
git commit -m "reflect: [brief summary of learnings]

Captured from session:
- [Learning 1 title]
- [Learning 2 title]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Step 6: Confirm Completion

Output:

```
Reflection complete.

Saved [N] learning(s) to:
- .project/memory/LEARNINGS.md

Changes committed: [commit hash]

Use /reflect-status to see all captured learnings.
```

---

## Focus Area: $ARGUMENTS

If a focus area is provided, filter analysis to that domain:

| Focus | Filter to |
|-------|-----------|
| `backend` | NestJS, API, database, service patterns |
| `frontend` | React, UI, component, styling patterns |
| `testing` | Test patterns, fixtures, assertions |
| `git` | Commit, PR, branch conventions |
| `all` (default) | All categories |

---

## Memory File Locations (Three-Tier System)

Memory files exist at three levels (priority: personal < team < project):

### Personal Level (`~/.pi/memory/`)
- Follows you across ALL projects
- Your individual coding preferences
- Personal communication style

### Team Level (`.pi/base/docs/`)
- Shared with team via git submodule
- Team coding conventions
- Shared library preferences

### Project Level (`.project/memory/`)
- Project-specific learnings
- Codebase-specific patterns
- Business logic details

**Each level contains:**
- `LEARNINGS.md` - General learnings and corrections
- `PREFERENCES.md` - Explicit preferences
- `CORRECTIONS.md` - Mistakes to avoid

---

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REFLECTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session Summary:
- Messages analyzed: 24
- Corrections detected: 2
- Preferences detected: 1
- Approvals detected: 8

---

HIGH CONFIDENCE (will propose updates):

1. Use Tailwind instead of styled-components
   Signal: "No, don't use styled-components. We use Tailwind for all styling."
   Proposed: Add to CORRECTIONS.md

2. Group imports by type
   Signal: "Always group imports: React first, then external libs, then internal."
   Proposed: Add to PREFERENCES.md

---

MEDIUM CONFIDENCE (suggestions to review):

1. Prefer async/await over .then()
   Signal: User converted promise chain to async/await
   Note: Implicit preference, consider if it repeats

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like me to save the HIGH confidence learnings?
```
