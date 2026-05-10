---
description: Audit all skill-rules.json files and verify skill file references across all stacks
argument-hint: Optional --verbose for detailed output
---

You are a Claude Code skills auditor. Your task is to generate a comprehensive audit report of all skills across all stacks.

## Purpose

Generate a production readiness report that verifies:
1. All skill-rules.json files are valid
2. All skills with "file" properties have existing files
3. Commands are synced between base and root
4. Guides are properly referenced

---

## Step 1: Audit All skill-rules.json Files

Read each skill-rules.json file and collect data:

```bash
# Root/Base skills
cat skills/skill-rules.json
cat base/skills/skill-rules.json

# Stack-specific skills
cat react/skills/skill-rules.json
cat react-native/skills/skill-rules.json
cat nestjs/skills/skill-rules.json
```

For each file, count:
- Total skills defined
- Skills WITH "file" property
- Skills WITHOUT "file" property

---

## Step 2: Verify File References

For each skill that has a "file" property, verify the file exists:

```bash
# Example: If skill has "file": "qa/design-qa.md"
ls react/skills/qa/design-qa.md
```

Track:
- Files that exist (PASS)
- Files that are missing (FAIL)

---

## Step 3: Count Commands

```bash
# Count base commands
find base/commands -name "*.md" -type f | wc -l

# Count root commands
find commands -name "*.md" -type f | wc -l
```

Compare counts to determine sync status.

---

## Step 4: Count Guides

For each stack, count guide files and compare to referenced guides in skill-rules.json:

```bash
# React guides
find react/guides -name "*.md" -type f | wc -l

# React-Native guides
find react-native/guides -name "*.md" -type f | wc -l

# NestJS guides
find nestjs/guides -name "*.md" -type f | wc -l
```

---

## Step 5: Generate Report

Output the following report format:

```
╔═══════════════════════════════════════════════════════════════╗
║                    SKILLS AUDIT REPORT                         ║
╠═══════════════════════════════════════════════════════════════╣

## SKILL-RULES.JSON STATUS

| Stack        | Skills | With "file" | Files Exist |
|--------------|--------|-------------|-------------|
| Root         | X      | X           | ✅ PASS     |
| Base         | X      | X           | ✅ PASS     |
| React        | X      | X           | ✅ PASS     |
| React-Native | X      | X           | ✅ PASS     |
| NestJS       | X      | X           | ✅ PASS     |
| **TOTAL**    | **X**  | **X**       | **100%**    |

## COMMANDS SYNC STATUS

| Location          | Files | Status      |
|-------------------|-------|-------------|
| base/commands/    | X     | ✅          |
| commands/ (root)  | X     | ✅ SYNCED   |

## GUIDES INVENTORY

| Stack        | Files | Referenced | Status       |
|--------------|-------|------------|--------------|
| React        | X     | X          | ✅ OK        |
| React-Native | X     | X          | ✅ COMPLETE  |
| NestJS       | X     | X          | ✅ OK        |
| **TOTAL**    | **X** | **X**      |              |

## VERIFICATION CHECKLIST

| Check                                      | Status  |
|--------------------------------------------|---------|
| All skill-rules.json valid JSON            | ✅ PASS |
| All "file" references exist                | ✅ PASS |
| Base/root commands synced                  | ✅ PASS |
| All guide references valid                 | ✅ PASS |

## OVERALL STATUS: ✅ PRODUCTION READY

╚═══════════════════════════════════════════════════════════════╝
```

---

## Verbose Mode

If `$ARGUMENTS` contains `--verbose`:

For each stack, list all skills with their file paths and existence status:

```
### ROOT SKILLS (5)

| Skill                  | File Reference                    | Status     |
|------------------------|-----------------------------------|------------|
| skill-developer        | skill-developer/SKILL.md          | ✅ EXISTS  |
| generate-ppt           | generate-ppt/SKILL.md             | ✅ EXISTS  |
| notion-ticket-reviewer | notion-ticket-reviewer/SKILL.md   | ✅ EXISTS  |
| git-workflow           | git-workflow/create-dev-pr.md     | ✅ EXISTS  |
| fullstack              | (no file - pipeline skill)        | ✅ OK      |

### REACT SKILLS (9)
...
```

---

## Error Handling

If any issues are found:

```
## ISSUES FOUND

❌ Missing file: react/skills/qa/missing-skill.md
❌ Invalid JSON: nestjs/skills/skill-rules.json (parse error at line 45)
⚠️ Commands out of sync: base has 34, root has 33

## OVERALL STATUS: ❌ ISSUES FOUND
```

---

## Exit Codes

- `0` - All checks passed, production ready
- `1` - Issues found (missing files, invalid JSON)
- `2` - Warnings only (minor inconsistencies)

---

## Related Commands

- `/validate-references` - Validate cross-references in documentation
- `/build-registry` - Build the claude-registry.json file
