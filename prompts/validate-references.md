---
description: Validate all skill/command references and detect broken or stale documentation
argument-hint: Optional --strict to fail on warnings, --fix to suggest fixes
---

You are a Claude Code reference validator. Your task is to check that all references to skills, commands, and agents are valid and up-to-date.

## Purpose

Detect three types of issues:
1. **Broken references** - Documentation mentions skills/commands that don't exist
2. **Orphaned resources** - Skills/commands exist but aren't documented anywhere
3. **Stale documentation** - Documentation describes resources incorrectly

---

## Prerequisites

This command requires `claude-registry.json` to exist. If not found:

```bash
ls .pi/claude-registry.json
```

If missing, prompt user:
```
Registry not found. Run /build-registry first to generate it.
```

---

## Step 1: Load Registry

```bash
cat .pi/claude-registry.json
```

Parse the registry to get:
- All command IDs and their file paths
- All skill IDs and their file paths
- All agent IDs and their file paths
- All documented cross-references

---

## Step 2: Validate File Existence

For each resource in the registry, verify the file exists:

```bash
# Check each file path from registry
for file in <list of file paths>; do
  if [ ! -f "$file" ]; then
    echo "MISSING: $file"
  fi
done
```

**Example checks:**
```bash
ls .pi/base/commands/dev/ralph.md
ls .pi/react/skills/design-qa-patterns.md
ls .pi/react/agents/frontend-developer.md
```

**Report format:**
```
=== File Existence Check ===

MISSING FILES:
  - .pi/react/skills/old-skill.md (referenced in registry)

All other files: OK (45 files verified)
```

---

## Step 3: Validate Cross-References

For each `documentedIn` reference, verify the document still mentions the resource:

```bash
# Example: Check if CLAUDE.md mentions "ralph"
grep -l "ralph" CLAUDE.md
```

**Check each cross-reference:**
```bash
# For skill "design-qa-patterns" documented in ".pi/react/README.md"
grep -i "design-qa" .pi/react/README.md
```

**Report format:**
```
=== Cross-Reference Validation ===

STALE REFERENCES:
  - design-qa-patterns: Listed as documented in CLAUDE.md but not found there
  - route-tester: Listed as documented in .pi/nestjs/README.md but not found there

Valid references: 42
```

---

## Step 4: Detect Orphaned Resources

Find resources in registry that have no `documentedIn` references:

**Report format:**
```
=== Orphaned Resources ===

Skills not documented anywhere:
  - organize-types (react) - No references in documentation
  - fix-bug (react) - No references in documentation

Commands not documented anywhere:
  - migrate-submodules (base) - No references in documentation
```

---

## Step 5: Scan for Undocumented References

Scan documentation files for skill/command names NOT in the registry:

```bash
# Extract potential skill/command references from CLAUDE.md
grep -oE '/[a-z-]+' CLAUDE.md | sort -u
grep -oE '\*\*[a-z-]+\*\*' CLAUDE.md | sort -u
```

Compare against registry to find references to non-existent resources.

**Files to scan:**
```bash
# Main documentation
CLAUDE.md
.pi/base/README.md
.pi/react/README.md
.pi/nestjs/README.md

# Command files (they reference skills)
.pi/base/commands/**/*.md
```

**Report format:**
```
=== Undocumented References ===

References to non-existent resources:
  - CLAUDE.md:45 mentions "database-verification" skill (NOT IN REGISTRY)
  - .pi/base/commands/dev/fullstack.md:23 references "api-validator" (NOT IN REGISTRY)

Possible causes:
  - Skill was renamed or removed
  - Typo in documentation
  - Registry needs rebuilding (/build-registry)
```

---

## Step 6: Validate Related Skills (Bidirectional)

Check that `relatedSkills` references are bidirectional:

If skill A lists skill B as related, skill B should list skill A.

```
=== Related Skills Validation ===

Missing bidirectional references:
  - design-qa-patterns → e2e-test-generator (OK)
  - e2e-test-generator → design-qa-patterns (MISSING)

Recommendation: Add "design-qa-patterns" to relatedSkills in e2e-test-generator
```

---

## Step 7: Check skill-rules.json Consistency

Verify skills defined in skill-rules.json have corresponding markdown files:

```bash
# Parse skill-rules.json files
cat .pi/skills/skill-rules.json
cat .pi/react/skills/skill-rules.json
cat .pi/nestjs/skills/skill-rules.json
cat .pi/base/skills/skill-rules.json
```

For each skill defined, check if its documentation file exists.

**Report format:**
```
=== Skill Rules Consistency ===

Skills in skill-rules.json without documentation:
  - convert-html-to-react (react) - No .md file found

Skills with documentation but not in skill-rules.json:
  - component-patterns (react) - Has .md but no trigger rules
```

---

## Step 8: Generate Summary Report

```
╔════════════════════════════════════════════════════════════╗
║              Reference Validation Report                    ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  Resources Checked:                                         ║
║    Commands:  12                                           ║
║    Skills:    18                                           ║
║    Agents:     8                                           ║
║                                                             ║
║  Issues Found:                                              ║
║    ❌ Missing files:           2                            ║
║    ❌ Stale references:        3                            ║
║    ⚠️  Orphaned resources:      5                            ║
║    ⚠️  Undocumented refs:       1                            ║
║    ⚠️  Missing bidirectional:   2                            ║
║                                                             ║
║  Overall Status: ISSUES FOUND                              ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝

Run with --fix to see suggested fixes.
```

---

## Strict Mode

If `$ARGUMENTS` contains `--strict`:
- Treat warnings (⚠️) as errors
- Return non-zero exit status if any issues found
- Useful for CI/CD integration

---

## Fix Mode

If `$ARGUMENTS` contains `--fix`, provide actionable suggestions:

```
=== Suggested Fixes ===

1. MISSING FILE: .pi/react/skills/old-skill.md
   Action: Remove from registry, run /build-registry

2. STALE REFERENCE: design-qa-patterns not in CLAUDE.md
   Action: Add to CLAUDE.md or remove documentedIn entry

3. ORPHANED: organize-types not documented
   Action: Add to .pi/react/README.md:

   ## Skills
   - **organize-types** - Organize TypeScript types and interfaces

4. UNDOCUMENTED REF: "database-verification" in CLAUDE.md:45
   Action: Either create the skill or remove the reference
```

---

## Integration with /build-registry

After fixing issues, rebuild the registry:

```bash
/build-registry
/validate-references
```

Recommended workflow:
1. Run `/validate-references` to find issues
2. Fix issues manually or with suggestions
3. Run `/build-registry` to update registry
4. Run `/validate-references` again to confirm all clear

---

## Common Patterns to Detect

| Pattern | Example | Issue Type |
|---------|---------|------------|
| File path reference | `Command File: .pi/base/commands/foo.md` | Check file exists |
| Skill name in prose | "use the **design-qa** skill" | Check skill in registry |
| Slash command | `/ralph design-qa` | Check command exists |
| Related skill | `related_skills: [e2e-test-generator]` | Check skill exists |
| Code reference | `design-qa-patterns.md` | Check file exists |

---

## Exit Codes

- `0` - All checks passed
- `1` - Errors found (missing files, stale refs)
- `2` - Warnings only (orphaned, undocumented)
- `3` - Registry not found
