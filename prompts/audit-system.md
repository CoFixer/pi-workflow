---
description: Comprehensive audit of .pi configuration system (overlaps, drift, triggers, architecture, completeness)
argument-hint: "[--fix] [--focus <dimension>] [--tier <name>] [--json]"
---

# Claude System Audit

Launch a 2-agent team to perform a comprehensive audit of the `.pi/` configuration system. Detects overlaps, configuration drift, trigger conflicts, architecture violations, and completeness gaps. Produces a severity-ranked report with actionable recommendations.

## Quick Start

```bash
# Full audit (report only, default)
/dev:audit-system

# Auto-fix safe issues
/dev:audit-system --fix

# Audit a single dimension
/dev:audit-system --focus overlaps
/dev:audit-system --focus drift
/dev:audit-system --focus triggers
/dev:audit-system --focus architecture
/dev:audit-system --focus completeness

# Scope to a specific tier
/dev:audit-system --tier nestjs

# Machine-readable output alongside markdown
/dev:audit-system --json
```

---

## Execution Instructions

### Step 1: Parse Arguments

```
action = --fix | (default = report-only)
focus = --focus value (optional: overlaps | drift | triggers | architecture | completeness)
tier = --tier value (optional: base | nestjs | react | react-native | marketing)
json_output = --json flag (optional)
```

Set variables:
```
team_name = "audit-system"
pi_dir = ".pi"
report_dir = ".pi-project/status/audit"
report_file = "${report_dir}/SYSTEM_AUDIT_REPORT.md"
timestamp = current date/time
```

### Step 2: Detect .pi System Paths

Read `${claude_dir}/stack-config.json` to determine enabled stacks.

Build the path registry:
```
$SKILL_RULES_PATHS = []
$AGENT_DIRS = []
$GUIDE_DIRS = []
$HOOK_DIRS = []

# Always include base
$SKILL_RULES_PATHS += "${claude_dir}/skills/skill-rules.json"        # root level
$AGENT_DIRS += "${claude_dir}/base/agents/"

# Add per enabled stack
for stack in enabled_stacks:
    if exists "${claude_dir}/${stack}/skills/skill-rules.json":
        $SKILL_RULES_PATHS += it
    if exists "${claude_dir}/${stack}/agents/":
        $AGENT_DIRS += it
    if exists "${claude_dir}/${stack}/guides/":
        $GUIDE_DIRS += it

# Check for standalone marketing module
if exists "${claude_dir}/marketing/skills/skill-rules.json":
    $SKILL_RULES_PATHS += it

# Hook paths
$HOOK_DIRS += "${claude_dir}/hooks/"
$HOOK_DIRS += "${claude_dir}/base/hooks/"
for stack in enabled_stacks:
    if exists "${claude_dir}/${stack}/hooks/":
        $HOOK_DIRS += it

$SETTINGS_PATH = "${claude_dir}/settings.json"
$GITMODULES_PATH = "${claude_dir}/.gitmodules"
$STACK_CONFIG_PATH = "${claude_dir}/stack-config.json"
```

### Step 3: Route by Mode

#### If `--focus` is set (Single Dimension Mode):

Skip team creation. Run the analyst logic inline for the requested dimension only.
Use the dimension specifications from Step 5's analyst prompt below.
Write a focused report to `${report_file}`.
Skip to Step 8 (Report to User).

#### If full audit (no --focus):

Continue to Step 4.

### Step 4: Create Output Directory

```bash
mkdir -p ${report_dir}
```

Copy and populate the report template:
```
.pi/base/templates/audit/AUDIT_REPORT.template.md → ${report_file}
Replace {TIMESTAMP} with current timestamp
Replace {SCOPE} with "full" or focused dimension name
Replace {TIER} with "all" or specific tier name
Replace {MODE} with "report" or "fix"
```

### Step 5: Create Team

```
TeamCreate:
  team_name: "${team_name}"
  description: "Claude system configuration audit"
```

---

### Step 6: Spawn Agents

Spawn agents sequentially (coordinator first, then analyst).

#### 6.1: Spawn Coordinator Agent

```
Task:
  name: "coordinator"
  team_name: "${team_name}"
  subagent_type: "general-purpose"
  model: "sonnet"
  prompt: <see COORDINATOR_PROMPT below>
```

**COORDINATOR_PROMPT:**

```
You are the **Coordinator** of a 2-agent system audit team.

## Your Team
- **analyst** - Performs deep read-only analysis of the .pi/ configuration system per dimension

## Your Mission
Orchestrate a comprehensive audit of the .pi/ configuration system across 5 dimensions:
1. **Overlaps** - Duplicate content across tiers
2. **Config Drift** - Registered entries vs actual filesystem
3. **Trigger Conflicts** - Overlapping skill activation keywords
4. **Architecture** - 3-tier model compliance
5. **Completeness** - Missing expected resources

## Project Context
- **Working directory**: ${CWD}
- **Claude config**: ${claude_dir}/
- **Report file**: ${report_file}
- **Mode**: ${action} (report-only or fix)
- **Tier scope**: ${tier or "all"}

## Audit Protocol

### Phase 1: Dispatch Dimensions

Send the analyst each dimension as a separate task. You can send multiple dimensions in parallel since they are independent.

For each dimension, message analyst with:
```
## Audit Dimension: {name}

Perform the {name} analysis as specified in your prompt.
${IF tier} Scope: only the "${tier}" tier. ${ENDIF}

Report back with structured findings in this format:
- Finding ID (e.g., OVR-001, DRF-001, TRG-001, ARC-001, CMP-001)
- Severity: CRITICAL | WARNING | INFO
- Title
- Affected files/locations
- Description
- Recommendation
- Auto-fixable: Yes/No (and what the fix would be)
```

### Phase 2: Aggregate Findings

After receiving ALL dimension reports from analyst:

1. Collect all findings
2. Sort by severity (CRITICAL first, then WARNING, then INFO)
3. Count totals per dimension and severity
4. Build the Fix Plan table (list auto-fixable items)
5. Build the Resource Inventory table

### Phase 3: Write Report

Write the final report to `${report_file}` using this structure:

```markdown
# .pi System Audit Report
Generated: ${timestamp}
Scope: full | Tier: ${tier or "all"} | Mode: ${action}

## Summary
| Dimension     | Findings | Critical | Warning | Info |
|---------------|----------|----------|---------|------|
| Overlaps      | X        | X        | X       | X    |
| Config Drift  | X        | X        | X       | X    |
| Triggers      | X        | X        | X       | X    |
| Architecture  | X        | X        | X       | X    |
| Completeness  | X        | X        | X       | X    |
| **Total**     | **X**    | **X**    | **X**   | **X**|

## Findings by Dimension

### 1. Overlaps
{findings from analyst}

### 2. Config Drift
{findings from analyst}

### 3. Trigger Conflicts
{findings from analyst}

### 4. Architecture
{findings from analyst}

### 5. Completeness
{findings from analyst}

## Fix Plan
| # | Finding | Severity | Auto-fixable | Action |
|---|---------|----------|-------------|--------|
{auto-fixable findings listed here}

## Resource Inventory
| Category | Base | {stack columns} | Total |
|----------|------|-----------------|-------|
| Commands | X    | -               | X     |
| Skills   | X    | X               | X     |
| Agents   | X    | X               | X     |
| Guides   | X    | X               | X     |
| Hooks    | X    | -               | X     |
```

${IF action == "fix"}
### Phase 4: Execute Auto-Fixes

For each finding marked as auto-fixable:
1. Read the current file
2. Apply the fix
3. Re-verify the fix worked
4. Log the result

**Safe auto-fixes (execute these):**
- Remove orphaned hook entries from settings.json
- Remove duplicate skill entries from skill-rules.json (keep the canonical tier's copy)
- Fix file permissions on .sh scripts (chmod +x)

**Unsafe fixes (report only, do NOT execute):**
- Delete duplicate agent files (requires human decision on which tier owns it)
- Modify skill trigger keywords (could break existing workflows)
- Initialize uninitialized submodules (may not be desired)

After all fixes, append a "Fix Results" section to the report:

```markdown
## Fix Results
| # | Finding | Action Taken | Result |
|---|---------|-------------|--------|
| 1 | DRF-001 | Removed hook from settings.json | FIXED |
| 2 | OVR-003 | Removed from root skill-rules.json | FIXED |
```
${ENDIF}

### Phase 5: Report to PM (you are PM)

After writing the report, message the user (output text) with a summary:
- Total findings count by severity
- Most critical issues found
- Number of auto-fixable items
- Report file path

Then initiate team shutdown.

## Communication Rules
- ALWAYS use SendMessage to talk to the analyst.
- Wait for analyst to complete ALL dimensions before writing the report.
- If analyst seems stuck on a dimension, send a follow-up.
```

---

#### 6.2: Spawn Analyst Agent

```
Task:
  name: "analyst"
  team_name: "${team_name}"
  subagent_type: "general-purpose"
  model: "sonnet"
  prompt: <see ANALYST_PROMPT below>
```

**ANALYST_PROMPT:**

```
You are the **Analyst** on a 2-agent system audit team.

## Your Team
- **coordinator** - Orchestrates the audit, aggregates your findings into the final report

## Your Mission
Perform deep, read-only analysis of the .pi/ configuration system. The coordinator will send you one or more audit dimensions. For each, scan the relevant files and report structured findings.

## Project Context
- **Working directory**: ${CWD}
- **Claude config dir**: ${claude_dir}/

## File Paths to Scan

### Skill Rules Files
${for path in SKILL_RULES_PATHS: list each path}

### Agent Directories
${for dir in AGENT_DIRS: list each directory}

### Guide Directories
${for dir in GUIDE_DIRS: list each directory}

### Hook Directories
${for dir in HOOK_DIRS: list each directory}

### Configuration Files
- Settings: ${SETTINGS_PATH}
- Git modules: ${GITMODULES_PATH}
- Stack config: ${STACK_CONFIG_PATH}

## Finding Format

For EVERY finding, report in this exact structure:

```
#### [{SEVERITY}] {ID}: {Title}
- **Files:** {affected file paths, comma-separated}
- **Description:** {what's wrong and why it matters}
- **Recommendation:** {specific action to take}
- **Auto-fixable:** {Yes/No} {if Yes: describe the exact fix}
```

Severity levels:
- **CRITICAL** - Broken references, missing files that are actively used, duplicate content causing confusion
- **WARNING** - Inconsistencies, unused resources, potential trigger conflicts
- **INFO** - Minor conventions, optional improvements

Finding ID prefixes:
- OVR-NNN for Overlaps
- DRF-NNN for Config Drift
- TRG-NNN for Trigger Conflicts
- ARC-NNN for Architecture
- CMP-NNN for Completeness

## Dimension Specifications

### Dimension 1: Overlaps

**Goal:** Find duplicate content across tiers.

**Checks to perform:**

1. **Agent file duplicates**: For each agent directory, list all `.md` files with their byte sizes. Compare filenames across directories. For files with the same name in different tiers:
   - Read both files
   - If content is identical: CRITICAL (exact duplicate, wastes space, risks divergence)
   - If content differs slightly: WARNING (may be intentional specialization, but verify)

2. **Skill definition duplicates**: Read ALL skill-rules.json files. For each skill name, check if it appears in multiple files:
   - Same skill name, same definition: CRITICAL (exact duplicate)
   - Same skill name, different definition: WARNING (potential conflict)
   List which file to keep (the canonical location per 3-tier model).

3. **Marketing skill triple-duplication**: Specifically check if marketing skills appear in root `skills/skill-rules.json`, `base/skills/skill-rules.json` (if exists), AND `marketing/skills/skill-rules.json`. Report the duplication.

### Dimension 2: Config Drift

**Goal:** Find mismatches between registered configuration and actual filesystem.

**Checks to perform:**

1. **Hook registration vs files**: Read `settings.json`. Extract every hook command path. For each path:
   - Replace `$CLAUDE_PROJECT_DIR` with the actual project directory
   - Check if the file exists at that resolved path
   - If file exists, check if it's executable (has +x permission)
   - CRITICAL if registered but file missing
   - WARNING if file exists but not executable

2. **Orphaned hook files**: List all `.sh` files in ALL hook directories. For each, check if it's referenced in `settings.json`:
   - INFO if file exists but not registered (may be intentionally disabled)

3. **Submodule initialization**: Read `.gitmodules`. For each submodule entry, check if its directory exists and is populated:
   - WARNING if registered but directory is empty/missing
   - INFO if directory exists but submodule not initialized (starts with `-` in git submodule status)

4. **Stack config vs reality**: Read `stack-config.json`. For each enabled stack, verify the corresponding directory exists:
   - WARNING if enabled but directory missing

### Dimension 3: Trigger Conflicts

**Goal:** Find skills with overlapping activation keywords across tiers.

**Checks to perform:**

1. **Build keyword map**: Read ALL skill-rules.json files. For each skill, extract:
   - `promptTriggers.keywords` (array of strings)
   - `promptTriggers.intentPatterns` (array of regex)
   - `fileTriggers.pathPatterns` (array of globs)

2. **Keyword collision detection**: Build a map: keyword → [list of skills that use it]. For keywords appearing in 2+ skills:
   - If both skills are in the SAME tier: INFO (expected tier-internal organization)
   - If skills are in DIFFERENT tiers: WARNING (could cause wrong skill activation)
   - Special case: if one is backend-specific and the other is frontend-specific, check if `fileTriggers.pathPatterns` disambiguate them. If yes: INFO (resolved by file context). If no: WARNING.

3. **Intent pattern overlap**: For each intentPattern regex, check if it could match prompts that another tier's skill also matches:
   - Focus on broad patterns like `(create|add).*(test)` that span tiers

### Dimension 4: Architecture

**Goal:** Verify 3-tier model compliance.

**Checks to perform:**

1. **Tier placement**: For each resource (skill, agent, guide), verify it's at the correct tier:
   - Generic/cross-framework content should be in `base/`
   - Framework-specific content should be in `{framework}/`
   - Project-specific content should be in project-level directories
   - WARNING if framework-specific content is in base (e.g., NestJS patterns in base/skills/)
   - WARNING if generic content is duplicated into a framework tier

2. **Skill path consistency**: Compare skill `"file"` paths between root `skill-rules.json` and each tier's `skill-rules.json`:
   - WARNING if the same skill has different file paths in different registries

3. **Convention compliance**: For each skill directory, check:
   - Does it have a `SKILL.md` file? (convention requires it)
   - WARNING if no SKILL.md but has other .md files

4. **Reference integrity**: For skills that reference agents (via `"file"` pointing to an agent), verify the agent file exists:
   - CRITICAL if reference is broken

### Dimension 5: Completeness

**Goal:** Find missing expected resources.

**Checks to perform:**

1. **Tier structure**: For each initialized tier (base + enabled stacks), check expected directories exist:
   - Expected: `agents/`, `skills/`, `guides/` (for tech stacks), `hooks/` (optional)
   - WARNING if a tech stack tier is missing `guides/`

2. **Skill file existence**: For each skill in every skill-rules.json that has a `"file"` property:
   - Resolve the file path relative to the skill-rules.json location
   - CRITICAL if file does not exist

3. **Agent README coverage**: For each agents/ directory, check if a README.md exists listing all agents:
   - INFO if README missing
   - WARNING if README exists but doesn't mention all agent files in the directory

4. **Guide coverage**: For each tech stack tier, count guides. Compare against the guide list referenced in the tier 2 manifest (if the team command references specific guide counts):
   - INFO if guide count differs from documented count

## Your Workflow

1. Wait for coordinator to send you a dimension (or multiple dimensions)
2. For each dimension:
   a. Read ALL relevant files listed above
   b. Perform every check specified for that dimension
   c. Compile findings in the exact format specified
   d. Send findings back to coordinator via SendMessage
3. If coordinator asks for clarification or re-check, comply promptly

## Communication Rules
- ALWAYS use SendMessage to communicate with coordinator.
- Be thorough -- check EVERY file, not just a sample.
- Include exact file paths in every finding.
- When comparing files, state both file sizes for evidence.
- If a dimension has zero findings, report: "No issues found for {dimension}."
```

---

### Step 7: Kick Off

After both agents are spawned, send the initial message to coordinator:

```
SendMessage:
  type: "message"
  recipient: "coordinator"
  content: "Audit team initialized.

  Configuration:
  - Enabled stacks: ${enabled_stacks}
  - Skill rules files: ${SKILL_RULES_PATHS count} files
  - Agent directories: ${AGENT_DIRS count} directories
  - Mode: ${action}
  - Tier scope: ${tier or 'all'}
  - Focus: ${focus or 'all 5 dimensions'}

  File paths pre-loaded in analyst prompt. Begin the audit -- dispatch dimensions to analyst.
  ${IF action == 'fix'}Auto-fix mode is ON. Execute safe fixes after report generation.${ENDIF}
  ${IF focus}Focus mode: only run the '${focus}' dimension.${ENDIF}"
  summary: "Audit team ready, begin scanning"
```

### Step 8: Report to User

After the coordinator completes and writes the report, output to the user:

```
Claude System Audit Complete
=============================

Report: ${report_file}

Summary:
  Findings: {total} ({critical} critical, {warning} warnings, {info} info)
  Auto-fixable: {count}
  ${IF action == "fix"}Fixes applied: {count}${ENDIF}

Top issues:
  {list top 3 critical/warning findings}

Run `/dev:audit-system --fix` to auto-fix safe issues.
Run `/dev:audit-system --focus <dimension>` for a deeper dive.
```

### Step 9: Cleanup

```
TeamDelete
```

---

## Error Handling

### No .pi/ Directory
If `.pi/` doesn't exist: "Error: No .pi/ directory found. This command must be run from a project with Claude Code configuration."

### Missing stack-config.json
Fall back to detecting stacks from existing directories:
```
enabled_stacks = ["base"]
if exists .pi/nestjs/: enabled_stacks += "nestjs"
if exists .pi/react/: enabled_stacks += "react"
if exists .pi/react-native/: enabled_stacks += "react-native"
```

### Agent Communication Failure
If analyst doesn't respond within reasonable time, coordinator should:
1. Send a follow-up message
2. If still no response after 2 follow-ups, write partial report with available findings

---

## Related Commands

- `/dev:validate-claude-config` - Configuration structure validation (subset of this command's drift + architecture dimensions)
- `/dev:migrate-submodules` - One-time setup to add framework submodules
