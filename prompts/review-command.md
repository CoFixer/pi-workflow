---
description: Review a command file and validate compatibility with downstream commands
argument-hint: "<command-file-path>"
---

# Command Review

Review a command file to validate its structure, quality, and compatibility with downstream commands in the pipeline.

---

## Purpose

This command helps you:
1. **Validate structure** - Check if the command follows standard format
2. **Check quality** - Ensure clear input/output definitions
3. **Verify compatibility** - Confirm output works with the next command in the pipeline

---

## Prerequisites

- A command file (`.md`) to review
- Knowledge of where the command's output will be used

---

## Usage

```bash
/review-command <command-file-path>
```

**Example:**
```bash
/review-command commands/design/prd-to-design-prompts.md
```

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: File Validation                                    │
│  - Check file exists, .md extension, YAML frontmatter       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Command Parsing                                    │
│  - Extract description, argument-hint                       │
│  - Analyze sections (Usage, Workflow, Error Handling, etc.) │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Ask Output Usage                                   │
│  "Where will this command's output be used?"                │
│  A. As input to another command → Go to Step 4              │
│  B. Final deliverable → Skip to Step 5                      │
│  C. Other                                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ (If Option A)
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Select Next Command                                │
│  "Which command will consume this output?"                  │
│  - Show categorized list from /commands folder              │
│  - Allow manual path input                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Compatibility Analysis                             │
│  - Read next command's input requirements                   │
│  - Compare output format with expected input                │
│  - Check required fields, parsing patterns                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Generate Review Report                             │
│  - Structure validation results                             │
│  - Quality validation results                               │
│  - Compatibility validation results                         │
│  - Overall score and recommendations                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Ask to Fix Issues                                  │
│  "Would you like me to fix the issues found?"               │
│  A. Fix all → Apply all fixes automatically                 │
│  B. Select fixes → Choose which items to fix                │
│  C. No → End without changes                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: File Validation

Read the command file from `$ARGUMENTS`.

**Validation checks:**
1. File path is provided
2. File exists and is readable
3. File has `.md` extension
4. File starts with YAML frontmatter (`---`)

**If validation fails:**
```
Error: [specific error message]
Usage: /review-command <command-file-path>
```

---

### Step 2: Command Parsing

Parse the command file and extract:

**From YAML frontmatter:**
- `description` - Command description
- `argument-hint` - Usage hint

**From markdown content:**
- H1 heading (command title)
- H2 sections present (Usage, Workflow, Steps, Error Handling, etc.)
- Code blocks (bash examples, output templates)
- Tables (arguments, options)

**Identify:**
- Input specification (what the command expects)
- Output specification (what the command produces)
- File paths mentioned (input/output locations)

---

### Step 3: Ask Output Usage

Ask the user about the command's output usage:

```
Where will this command's output be used?

A. As input to another command (part of a pipeline)
B. Final deliverable (user consumes directly)
C. System configuration (config files, settings)
D. Information display (status, reports)
```

**If user selects A (Pipeline Input):**
→ Proceed to Step 4

**If user selects B, C, or D:**
→ Skip to Step 5 (no compatibility check needed)

---

### Step 4: Select Next Command

If output is used by another command, ask which one:

```
Which command will consume this output?

[Design]
  1. /prd-to-design-guide
  2. /prd-to-design-prompts
  3. /design-guide-to-aura-prompts
  4. /prompts-to-aura
  ...

[Dev]
  5. /fullstack
  6. /ralph
  ...

[Operation]
  7. /generate-prd
  ...

[Other]
  Enter command path manually
```

Once selected, read the next command file to understand its input requirements.

---

### Step 5: Compatibility Analysis

#### 5.1 If Next Command Selected (Pipeline Mode)

Read the next command file and extract:
- Expected input format (file type, structure)
- Required sections/fields it parses
- Parsing patterns used (regex, YAML, etc.)

**Compare:**
| Current Output | Next Command Expects | Status |
|----------------|---------------------|--------|
| [Output item]  | [Expected input]    | MATCH/MISMATCH |

#### 5.2 If No Next Command (Standalone Mode)

Skip compatibility check, proceed to structure and quality validation only.

---

### Step 6: Generate Review Report

Run all checklist validations and generate the final report.

---

### Step 7: Ask to Fix Issues

If any issues are found, ask the user:

```
"Would you like me to fix the issues found?"

Options:
  A. Fix all (Recommended) - Fix all issues automatically
  B. Select fixes - Choose which items to fix
  C. No - Keep report only, no changes
```

**If user selects A (Fix All):**
→ Automatically apply all recommended fixes to the command file

**If user selects B (Select Fixes):**
→ Show multi-select list of issues:
```
"Which items would you like to fix?" (Select multiple)

  [ ] Add Error Handling section
  [ ] Add argument-hint field
  [ ] Align design_system fields
  [ ] ...
```
→ Apply only selected fixes

**If user selects C (No):**
→ End review without modifications

---

## Review Checklist

### Structure Validation

| ID | Item | Description | Severity |
|----|------|-------------|----------|
| S1 | YAML frontmatter | `---` block exists at start | ERROR |
| S2 | description field | Description is present and clear | ERROR |
| S3 | argument-hint field | Usage hint provided | WARNING |
| S4 | Usage section | Usage examples documented | WARNING |
| S5 | Workflow section | Execution flow documented | ERROR |
| S6 | Error Handling section | Error cases documented | WARNING |

### Quality Validation

| ID | Item | Description | Severity |
|----|------|-------------|----------|
| Q1 | Clear input definition | What input the command expects | ERROR |
| Q2 | Clear output definition | What output the command produces | ERROR |
| Q3 | Actionable steps | Steps are specific and executable | WARNING |
| Q4 | Code examples | Bash/code examples are valid | WARNING |
| Q5 | Consistent placeholders | `$ARGUMENTS`, `[VARIABLE]` used consistently | INFO |

### Compatibility Validation (Pipeline Mode Only)

| ID | Item | Description | Severity |
|----|------|-------------|----------|
| C1 | Output format match | Output matches next command's expected input | ERROR |
| C2 | Required fields present | All fields next command parses are included | ERROR |
| C3 | File naming convention | Output filename matches expected pattern | WARNING |
| C4 | Section structure | Markdown headings are parseable | ERROR |
| C5 | Data types consistent | Numbers, strings, lists match expectations | WARNING |

---

## Output Format

```
╔════════════════════════════════════════════════════════════╗
║              Command Review Report                          ║
╠════════════════════════════════════════════════════════════╣
║  Command:       /[command-name]                             ║
║  File:          [file-path]                                 ║
║  Review Date:   [YYYY-MM-DD HH:MM]                         ║
║  Overall Score: [N]/100                                     ║
║  Status:        [PASS | NEEDS IMPROVEMENT | FAIL]          ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Output Usage: [User's selection]                          ║
║  Next Command: [command-name or N/A]                       ║
║                                                             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  STRUCTURE VALIDATION                                       ║
║    [x] S1: YAML frontmatter present                        ║
║    [x] S2: description field defined                       ║
║    [ ] S3: argument-hint missing                           ║
║    ...                                                      ║
║                                                             ║
║  QUALITY VALIDATION                                         ║
║    [x] Q1: Clear input definition                          ║
║    [ ] Q2: Output format not specified                     ║
║    ...                                                      ║
║                                                             ║
║  COMPATIBILITY VALIDATION                                   ║
║    [x] C1: Output format matches /prompts-to-aura          ║
║    [ ] C2: Missing required field: total_pages             ║
║    ...                                                      ║
║                                                             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ISSUES FOUND                                               ║
║                                                             ║
║  [ERROR] C2: Missing required field                        ║
║    Next command /prompts-to-aura expects 'total_pages'     ║
║    in YAML frontmatter but current command doesn't         ║
║    document this in its output format.                     ║
║                                                             ║
║  [WARNING] S3: argument-hint missing                       ║
║    Add argument-hint to help users understand usage.       ║
║                                                             ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  RECOMMENDATIONS                                            ║
║                                                             ║
║  1. [Critical] Add total_pages to OUTPUT FORMAT section    ║
║     ```yaml                                                 ║
║     total_pages: [TOTAL_PAGE_COUNT]                        ║
║     ```                                                     ║
║                                                             ║
║  2. [Important] Add argument-hint to frontmatter           ║
║     ```yaml                                                 ║
║     argument-hint: "<prd-file-path>"                       ║
║     ```                                                     ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

---

## Score Calculation

| Category | Weight | Description |
|----------|--------|-------------|
| Structure | 25% | YAML, sections, format |
| Quality | 30% | Clarity, completeness |
| Compatibility | 45% | Pipeline integration (if applicable) |

**Severity scoring:**
- ERROR: 0 points (must fix)
- WARNING: 0.5 points (should fix)
- INFO: 1 point (nice to have)
- PASS: 1 point (full credit)

**Status thresholds:**
- **PASS**: >= 80 points
- **NEEDS IMPROVEMENT**: 60-79 points
- **FAIL**: < 60 points

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| File not found | Invalid path | Check file path and try again |
| Not a markdown file | Wrong extension | Ensure file ends with `.md` |
| No YAML frontmatter | Missing `---` block | Add YAML frontmatter to command |
| Next command not found | Invalid selection | Verify command path exists |

---

## Related Commands

- `/validate-references` - Validate skill/command references across documentation
- `/validate-claude-config` - Validate Claude configuration files
- `/build-registry` - Build command/skill registry

---

## Tips

1. **Review before committing** - Run this command before adding new commands to the repo
2. **Check pipeline compatibility** - If your command is part of a pipeline, always verify compatibility
3. **Fix ERRORs first** - ERRORs can break the pipeline, fix them before WARNINGs
4. **Use example commands** - Reference similar commands for best practices
