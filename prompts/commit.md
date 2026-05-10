---
description: Commit changes to current branch, create PR to dev, run audit review, and optionally merge (main project only, skips submodules)
argument-hint: Optional commit message override (leave empty for AI-generated message)
---

You are a git workflow assistant. Your task is to commit changes to the **current branch**, create PRs targeting `dev`, run automated audit checks, and merge upon user approval.

**Note:** This command commits the **main project only**. Use `/commit-all` to include submodule changes.

## CRITICAL RULES (NEVER VIOLATE)

1. **NEVER push directly to `dev`, `main`, or `master`** - All changes MUST go through PRs
2. **ALWAYS use the current branch** - Do NOT create new branches
3. **ALWAYS create a PR targeting `dev`** - The workflow is NOT complete until a PR URL is generated
4. **STOP if on `main`, `dev`, or `master`** - Ask user to create/checkout a feature branch first
5. **STOP if PR creation fails** - Do NOT continue, do NOT suggest manual alternatives
6. **NEVER commit submodule changes** - This command is for main project only
7. **NEVER merge without user approval** - Always ask before merging PR to dev
8. **ALWAYS run audit checks** - PR review is mandatory before merge decision

## Branch Policy

- **Feature branches only** (e.g., `feature/<name>`, `fix/<name>`, `<your-name>`) - Never commit on `main`, `dev`, or `master`
- **PRs target `dev`** - All PRs merge into `dev`, not `main`
- **Use current branch** - No new branch creation during commit

---

## Step 0: Branch Validation (CRITICAL)

Before any commit, validate the current branch:

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

### 0.1 Check for Detached HEAD

```bash
if [ -z "$CURRENT_BRANCH" ]; then
  echo "⚠️ Detached HEAD state detected"
  # STOP - Use AskUserQuestion to get branch name from user
fi
```

**If detached HEAD:** Use **AskUserQuestion** to ask the user for their branch name:
```
You are in detached HEAD state. What branch name would you like to use?
(e.g., feature/<name>, fix/<name>, or your name)
```

Then checkout/create and push:
```bash
git checkout -b <user-branch>
git push -u origin <user-branch>
```

### 0.2 Check for Protected Branches

```bash
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "dev" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "⚠️ Cannot commit directly to '$CURRENT_BRANCH'"
  # STOP - Use AskUserQuestion to get branch name from user
fi
```

**If on protected branch:** Use **AskUserQuestion** to ask the user for their branch name:
```
You are on '$CURRENT_BRANCH' which is a protected branch.
What branch name would you like to use?
(e.g., feature/<name>, fix/<name>, or your name)
```

Then checkout/create and push:
```bash
git checkout -b <user-branch>
git push -u origin <user-branch>
```

### 0.3 Ensure `dev` Branch Exists

```bash
if ! git show-ref --verify --quiet refs/heads/dev; then
  echo "Creating dev branch from main..."
  ORIGINAL_BRANCH="$CURRENT_BRANCH"
  git checkout main
  git checkout -b dev
  git push -u origin dev
  git checkout "$ORIGINAL_BRANCH"
  echo "✓ Created dev branch"
fi
```

### 0.4 Confirm Ready

```bash
echo "✓ Using branch: $CURRENT_BRANCH"
echo "✓ PR will target: dev"
```

---

## Step 1: Check for Submodule Changes (Warning Only)

**IMPORTANT:** This command does NOT commit submodules. Check if any exist and warn the user.

```bash
git status
```

### 1.1 Detect Submodule Changes

Look for patterns like:
- `modified:   .claude (modified content)`
- `modified:   .pi (modified content)`
- `modified:   .claude (new commits)`
- `modified:   .pi (new commits)`
- Any path ending with `(modified content)` or `(new commits)`

### 1.2 Warn User (Do NOT Commit Submodules)

If submodule changes are detected:

```
⚠️ Submodule Changes Detected

The following submodules have uncommitted changes:
- .claude (modified content)
- .pi (modified content)

These will NOT be committed by /commit.
Use /commit-all to commit both submodules and main project.

Proceeding with main project changes only...
```

**Continue with main project commit - do NOT commit submodules.**

---

## Step 2: Detect Projects with Changes

Run `git status --porcelain` and group changes by their root folder.

**IMPORTANT:** Exclude submodule paths from staging.

### Project Folder Detection Rules:

**Known project patterns** (each gets its own commit):
- `backend/` - Backend API (NestJS)
- `frontend/` - Main frontend app
- `frontend-*/` - Any frontend variant
- `mobile/` - Mobile app
- `.pi-project/` - Project documentation

**Exclusions** (never commit):
- `.env` files or files containing secrets
- `credentials.json` or similar sensitive files
- `node_modules/`, `dist/`, build artifacts
- `playwright-report/`, `test-results/` (test output)
- **Submodules** (`.pi/`, or any path marked as submodule)

---

## Step 3: Stage Files

### Stage files (excluding submodules):

```bash
# Stage all changes EXCEPT submodules
git add -A
git reset HEAD .claude .pi 2>/dev/null || true   # Unstage submodule if accidentally staged
git reset HEAD .gitmodules 2>/dev/null || true # Never commit .gitmodules (local-only submodules)

# Unstage any local-only framework submodule paths
for framework in nestjs react react-native marketing operations content; do
  git reset HEAD "$framework" 2>/dev/null || true
done
```

Or stage specific project folders:
```bash
git add "<project-folder>/"
```

---

## Step 4: Sync with dev (Conflict Prevention)

**Purpose:** Ensure branch is up-to-date with `dev` before committing, so merge conflicts are caught locally.

### 4.1 Fetch and merge latest dev

```bash
git fetch origin dev
git merge origin/dev --no-edit
```

### 4.2 Handle conflicts

**If merge conflicts occur → STOP immediately:**

```
⚠️ Merge Conflicts with dev Detected

Conflicting files:
  - <file1>
  - <file2>

Resolve conflicts, then re-run /commit:
  1. Fix the conflicting files
  2. git add <resolved-files>
  3. git commit (to complete the merge)
  4. Re-run /commit
```

**Do NOT proceed to commit if conflicts exist.**

**If merge succeeds or already up-to-date → continue to Step 5.**

---

## Step 5: Commit

### Create commit with proper message:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <concise description>

<optional body explaining the "why">

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

**Type prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance tasks
- `style:` - Formatting, no code change

**Scope abbreviations:**
- Use folder name or meaningful short name
- Examples: `frontend`, `backend`, `mobile`, `api`, `docs`
- For multi-frontend projects: `admin`, `dashboard`, `portal`

If $ARGUMENTS is provided by the user, use it as the commit message.

---

## Step 6: Push and Create PR (MANDATORY)

### Push to current branch:

```bash
git push origin "$CURRENT_BRANCH"
```

### Create PR targeting dev:

```bash
PR_URL=$(gh pr create --base dev --head "$CURRENT_BRANCH" --title "<PR title>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points describing the changes>

## Changes
- <list key changes>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)")

PR_NUMBER=$(gh pr view "$CURRENT_BRANCH" --json number --jq '.number')
```

### Verify PR was created (REQUIRED):

```bash
gh pr view "$CURRENT_BRANCH" --json url --jq '.url'
```

**If this command fails or returns empty: STOP immediately.**

---

## Step 7: Run Automated Audit Checks

After PR is created, run a battery of checks against the changed files. Each check produces a result: **PASS / WARN / FAIL**.

### 7.0 Auto-Detect Stacks

Scan the project structure to determine which stacks are present:

```bash
CHANGED_FILES=$(gh pr diff "$PR_NUMBER" --name-only)

# Detect stacks
HAS_REACT=false; HAS_REACT_NATIVE=false; HAS_DJANGO=false; HAS_NESTJS=false

# React (web)
[ -f frontend/package.json ] && grep -q '"react"' frontend/package.json && HAS_REACT=true

# React Native (mobile)
[ -f mobile/package.json ] && grep -q '"react-native"' mobile/package.json && HAS_REACT_NATIVE=true

# Django
[ -f backend/manage.py ] && HAS_DJANGO=true

# NestJS
([ -f backend/nest-cli.json ] || ([ -f backend/package.json ] && grep -q '"@nestjs' backend/package.json)) && HAS_NESTJS=true
```

Only run checks for detected stacks. Skip checks for stacks not present.

### 7.1 Build Validation

| Stack | Command |
|-------|---------|
| **React** | `cd frontend && npx tsc --noEmit` |
| **React Native** | `cd mobile && npx tsc --noEmit` |
| **Django** | `cd backend && python manage.py check --deploy` |
| **NestJS** | `cd backend && npx tsc --noEmit` |

**Result:** PASS if exit code 0, FAIL if errors found.

### 7.2 Type Checking / Code Formatting

| Stack | Command |
|-------|---------|
| **React** | `cd frontend && npm run typecheck` |
| **React Native** | `cd mobile && npm run typecheck` (or `npx tsc`) |
| **Django** | `cd backend && python -m black --check . && python -m isort --check-only --profile black .` |
| **NestJS** | `cd backend && npx prettier --check "src/**/*.ts"` (if configured) |

**Result:** PASS if clean, WARN if formatting issues found.

### 7.3 Linting

| Stack | Command (if tool exists) | Fallback |
|-------|--------------------------|----------|
| **React** | `cd frontend && npm run lint` | Agent-based scan |
| **React Native** | `cd mobile && npm run lint` | Agent-based scan |
| **Django** | `cd backend && flake8 .` or `ruff check .` | Agent-based scan |
| **NestJS** | `cd backend && npm run lint` | Agent-based scan |

**Detect if linter exists:** Check `package.json` for `lint` script, or check if `flake8`/`ruff` is in `requirements.txt`.

**Fallback:** If no linter is configured, this check is covered by the Code Quality Scan (Step 7.5).

### 7.4 Migration / Schema Check

| Stack | Command |
|-------|---------|
| **Django** | `cd backend && python manage.py makemigrations --check --dry-run` |
| **NestJS** | `cd backend && npx typeorm migration:generate --check` (if TypeORM configured) |
| **React / RN** | Skip — not applicable |

**Result:** PASS if no pending migrations, FAIL if model changes are missing migrations.

### 7.5 Code Quality Scan (Agent-Based)

Launch `code-architecture-reviewer` agent in **quick diff mode** against the PR diff:

```
Agent(
  subagent_type='code-architecture-reviewer',
  description='Quick PR audit review',
  prompt='QUICK REVIEW MODE — diff-only scan for PR audit.

PR diff:
$(gh pr diff "$PR_NUMBER")

Detected stacks: [list detected stacks]

Apply the appropriate checklist per stack. Check for:
- Security issues (hardcoded secrets, XSS, SQL injection)
- Type safety (no `any` in TypeScript, proper typing)
- Code patterns (per CLAUDE.md conventions)
- No console.logs, TODOs, or commented-out code
- Proper error handling
- Auth/permissions on new endpoints or routes

Return a structured verdict:
VERDICT: PASS | WARN | FAIL
ISSUES: (numbered list, each with severity CRITICAL/WARNING)
Keep response under 20 lines.'
)
```

### 7.6 API Integration Validation

**Runs when:** Changed files include API service files (`services/httpServices/`), backend views/controllers, or URL/route files.

Launch `api-integration-agent` to check:
- Frontend/mobile service calls match backend endpoints
- Missing parameters (search, pagination, filters, sort)
- Response shape matches TypeScript types / serializer output

```
Agent(
  subagent_type='api-integration-agent',
  description='API integration audit',
  prompt='Quick audit of API integration for PR #$PR_NUMBER.
Changed files: $CHANGED_FILES
Check: endpoint consistency, missing params, type mismatches.
Return: PASS / WARN / FAIL with brief list of issues.'
)
```

### 7.7 Routing Validation

**Runs when:** Changed files include route/URL/navigation files.

| Stack | What to Check |
|-------|---------------|
| **React** | Routes in `routes/*.ts` — new routes registered, no orphans |
| **React Native** | Navigation screens registered in navigator stacks |
| **Django** | `urls.py` — new views have URL patterns, naming conventions |
| **NestJS** | Controllers registered in modules, route decorators present |

### 7.8 Authentication & Role Validation

**Runs when:** Changed files touch auth, guards, permissions, or protected routes.

| Stack | What to Check |
|-------|---------------|
| **React** | Protected routes use auth guards, role-based access correct |
| **React Native** | Auth screens gated, token handling secure |
| **Django** | `permission_classes` set, no `AllowAny` on sensitive endpoints |
| **NestJS** | `@UseGuards(JwtAuthGuard)` applied, `@Roles()` decorators correct |

---

## Step 8: Generate PR Audit Report

Aggregate all check results and calculate QA score:
- Each PASS = full points
- Each WARN = half points
- Each FAIL = 0 points
- **QA Score** = (earned / total) × 100

Display the audit report to the user:

```
╔══════════════════════════════════════════════╗
║            PR AUDIT REPORT                   ║
║   Branch: $CURRENT_BRANCH → dev              ║
║   PR: #$PR_NUMBER                            ║
╠══════════════════════════════════════════════╣
║                                              ║
║  Build Validation       ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Type Check / Format    ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Linting                ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Migration Check        ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Code Quality           ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  API Integration        ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Routing                ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║  Auth/Role              ✓ PASS / ⚠ WARN / ✗ FAIL  ║
║                                              ║
╠══════════════════════════════════════════════╣
║  QA Score: XX/100                            ║
║  Severity: X CRITICAL, X WARNINGS           ║
║                                              ║
║  Issues:                                     ║
║  1. [CRITICAL] <description>                 ║
║  2. [WARNING] <description>                  ║
║                                              ║
║  Suggestions:                                ║
║  1. <actionable fix>                         ║
║  2. <actionable fix>                         ║
╚══════════════════════════════════════════════╝
```

**Notes:**
- Only show checks that were actually run (skip N/A checks)
- List all issues with severity levels
- Provide actionable suggestions for each issue

---

## Step 9: Ask User for Approval

Use **AskUserQuestion** to present the results and ask for explicit approval:

```
PR Audit Complete — QA Score: XX/100
Stacks detected: [React, Django, etc.]
X CRITICAL issues, X warnings found.

[Show summary of critical issues if any]

What would you like to do?
```

**Options:**
- **"Approve & Merge to dev"** — Merge the PR into dev immediately
- **"Reject — Fix issues first"** — PR stays open, user fixes issues and re-runs /commit
- **"Keep PR open (no merge)"** — PR is created but not merged, user merges manually later

**IMPORTANT:** NEVER merge without explicit user approval from this step.

---

## Step 10: Conditional Merge

### If user selects "Approve & Merge to dev":

```bash
gh pr merge "$PR_NUMBER" --merge --delete-branch=false
```

Verify merge succeeded:
```bash
PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
if [ "$PR_STATE" = "MERGED" ]; then
  echo "✓ PR auto-merged to dev"
fi
```

Sync current branch with dev:
```bash
git fetch origin dev
git merge origin/dev --no-edit
```

**If merge fails** (unexpected conflicts, branch protection):
- Do NOT STOP — the PR is already created
- Report: "PR created at <URL> but merge failed: <reason>. Merge manually or resolve conflicts."

### If user selects "Reject — Fix issues first":

- PR stays open
- Report: "PR open at <URL>. Fix the issues listed above, then re-run /commit."

### If user selects "Keep PR open (no merge)":

- PR stays open
- Report: "PR created at <URL>. Merge manually when ready."

---

## Step 11: Final Report

```
✓ Workflow Complete

Branch: $CURRENT_BRANCH
Commit: <hash> - <commit message>
PR: <URL>
Audit: QA Score XX/100 — X critical, X warnings
Merge: ✓ Auto-merged to dev / ⚠️ PR open — pending fixes / ℹ️ PR open — manual merge
Branch synced: ✓ / N/A

Note: Submodule changes were skipped. Use /commit-all to include them.
```

---

## Error Handling

### STOP conditions (halt workflow immediately):
- **On `main`, `dev`, or `master` branch** → Ask user for feature branch name
- **Detached HEAD** → Ask user for branch name
- **Merge conflicts with dev** → Ask user to resolve conflicts
- **PR creation fails** → STOP, show error
- **Push fails** → STOP, show error
- **`gh` CLI not authenticated** → STOP, instruct user to run `gh auth login`
- **No changes detected** → STOP, inform user

### NEVER do these:
- ❌ Push directly to `dev`, `main`, or `master` in ANY repo
- ❌ Create new branches (use current branch only)
- ❌ Push without creating a PR
- ❌ Report "success" if PR was not created
- ❌ Suggest "manual PR creation" as an alternative
- ❌ Commit submodule changes (use /commit-all for that)
- ❌ Merge PR without explicit user approval
- ❌ Skip audit checks

---

## Important Notes

- **Use current branch** - Never create new branches during commit
- **PR is mandatory** - The workflow does not complete without a PR URL
- **Audit is mandatory** - Always run checks and show report before merge decision
- **User approval required** - Never auto-merge without asking
- **Submodules are skipped** - Use `/commit-all` for full workflow including submodules
- **Stack auto-detection** - Checks are tailored to detected stacks (React, React Native, Django, NestJS)
- **After merging PR** - Delete the branch to keep repo clean
