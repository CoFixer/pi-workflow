---
description: Commit all changes - push submodules separately, then push parent without submodules, create PRs to dev, run audit review, and optionally merge
argument-hint: Optional commit message override (leave empty for AI-generated message)
---

You are a git workflow assistant. Your task is to commit and push changes on the **current branch**, handling submodules separately from the parent repo, then run audit checks and merge upon user approval.

**Workflow summary:**
1. Validate branch (if on `dev`, `main`, or `master`, ask user for a new branch name and create it)
2. Push deepest nested submodules first (`.pi/nestjs`, `.pi/react`, etc.), each on its own branch, create PR to `dev`
3. Push `.claude` itself **without nested submodule pointer changes**, create PR to `dev`
4. Sync parent repo with dev (conflict prevention)
5. Push the parent repo **without `.claude` pointer changes**, create PR to `dev`
6. Run automated audit checks on the parent repo PR
7. Show audit report and ask user for approval
8. If approved: auto-merge parent PR to dev

**Note:** Submodules and the parent repo are pushed independently. `.claude` is pull-only for nested submodules. Use `/commit` for main project only (no submodules at all).

## CRITICAL RULES (NEVER VIOLATE)

1. **NEVER push directly to `dev`, `main`, or `master`** - All changes MUST go through PRs
2. **ALWAYS use a personal branch** - If on dev/main/master, ask the user for a branch name and create it
3. **ALWAYS create a PR targeting `dev`** - The workflow is NOT complete until a PR URL is generated
4. **ASK if on `main`, `dev`, or `master`** - Use AskUserQuestion to get a branch name, then create it with `git checkout -b`. Never push directly to protected branches.
5. **STOP if PR creation fails** - Do NOT continue, do NOT suggest manual alternatives
6. **Commit submodules FIRST, separately** - Each submodule is pushed independently
7. **Parent repo excludes ALL submodule changes** - Never include submodule pointer updates in parent commit
8. **`.claude` excludes nested submodule changes** - Never include nested submodule pointer updates (nestjs, react, etc.) in `.claude` commit. `.claude` is pull-only for nested submodules.
9. **NEVER merge without user approval** - Always ask before merging PR to dev
10. **ALWAYS run audit checks** - PR review is mandatory on the parent repo PR before merge decision

## Branch Policy

- **Personal branches only** (e.g., `<your-name>`, `feature-xyz`) - Never commit on `main` or `dev`
- **PRs target `dev`** - All PRs merge into `dev`, not `main`
- **Use current branch if valid** - If on dev/main, ask user for a branch name and create it
- **Submodules are independent** - Each submodule pushes on its own branch (ask for branch name if on dev/main)
- **`.claude` is pull-only for nested submodules** - Never push nested submodule pointer changes from `.claude`

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
(e.g., your name, feature name, or ticket ID)
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
  # Use AskUserQuestion to get branch name from user
fi
```

**If on `main` or `dev`:** Use **AskUserQuestion** to ask the user for their branch name:
```
You are on '$CURRENT_BRANCH' which is a protected branch.
What branch name would you like to use?
(e.g., your name, feature name, or ticket ID)
```

Then checkout/create and push:
```bash
git checkout -b <user-branch>
git push -u origin <user-branch>
CURRENT_BRANCH="<user-branch>"
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

## Step 1: Detect All Submodules

Dynamically discover all submodules registered in the repo:

```bash
git submodule status --recursive
```

This lists all submodules (including nested ones). Parse the output to identify:
- Submodule paths
- Their current commit status
- Whether they have changes (indicated by `+` prefix)

Also check:
```bash
git status
```

Look for any path showing `(modified content)` or `(new commits)` — these are submodules with uncommitted changes.

---

## Step 2: Push Submodules Separately (Deepest First)

For each submodule with changes, commit from **deepest to shallowest** (nested submodules before their parents).

### 2.1 For EACH Submodule with Changes:

```bash
cd <submodule-path>

# Check current branch
SUBMODULE_BRANCH=$(git branch --show-current)

# Validate branch (ask for branch if on main/dev/detached)
if [ -z "$SUBMODULE_BRANCH" ] || [ "$SUBMODULE_BRANCH" = "main" ] || [ "$SUBMODULE_BRANCH" = "dev" ]; then
  echo "⚠️ Submodule '<submodule-path>' on invalid branch: $SUBMODULE_BRANCH"
  # Use AskUserQuestion to ask user for branch name
  # Then: git checkout -b <user-branch> && git push -u origin <user-branch>
  # Update SUBMODULE_BRANCH to the new branch name
fi

# Ensure dev exists in this submodule repo
if ! git show-ref --verify --quiet refs/heads/dev; then
  ORIG="$SUBMODULE_BRANCH"
  git checkout main && git checkout -b dev && git push -u origin dev
  git checkout "$ORIG"
fi

# Stage and commit
git add -A
git commit -m "$(cat <<'EOF'
<type>: <description of changes>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

# Push to submodule's own current branch
git push origin "$SUBMODULE_BRANCH"

# Create PR targeting dev in the submodule repo (REQUIRED)
gh pr create --base dev --head "$SUBMODULE_BRANCH" --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points describing the changes>

## Submodule
<submodule-path>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# Verify PR was created
gh pr view "$SUBMODULE_BRANCH" --json url --jq '.url'

# Return to parent
cd <back-to-parent>
```

**STOP if PR creation fails for any submodule.**

### 2.2 Push `.claude` Submodule (WITHOUT Nested Submodule Pointers)

After all nested submodules under `.claude` (e.g., `nestjs`, `react`) are pushed, handle `.claude` itself.
**CRITICAL:** `.claude` must NOT include nested submodule pointer changes. It is "pull-only" for nested submodules.

```bash
cd .claude

# Check current branch
CLAUDE_BRANCH=$(git branch --show-current)

# Validate branch (ask for branch if on main/dev/detached)
if [ -z "$CLAUDE_BRANCH" ] || [ "$CLAUDE_BRANCH" = "main" ] || [ "$CLAUDE_BRANCH" = "dev" ]; then
  echo "⚠️ Submodule '.claude' on invalid branch: $CLAUDE_BRANCH"
  # Use AskUserQuestion to ask user for branch name
  # Then: git checkout -b <user-branch> && git push -u origin <user-branch>
  # Update CLAUDE_BRANCH to the new branch name
fi

# Ensure dev exists in .claude repo
if ! git show-ref --verify --quiet refs/heads/dev; then
  ORIG="$CLAUDE_BRANCH"
  git checkout main && git checkout -b dev && git push -u origin dev
  git checkout "$ORIG"
fi

# Stage all changes
git add -A

# EXCLUDE nested submodule pointer changes (pull-only for nested submodules)
NESTED_SUBMODULE_PATHS=$(git config --file .gitmodules --get-regexp path | awk '{ print $2 }' 2>/dev/null)
for nested in $NESTED_SUBMODULE_PATHS; do
  git reset HEAD "$nested" 2>/dev/null || true
done
git reset HEAD .gitmodules 2>/dev/null || true

# Verify no nested submodule pointer changes are staged
git diff --cached --name-only
# Confirm NO nested submodule paths (nestjs, react, etc.) appear in this list

# Skip if only submodule pointer changes existed (no .claude-own files changed)
STAGED_FILES=$(git diff --cached --name-only)
if [ -z "$STAGED_FILES" ]; then
  echo "ℹ️ No .claude-specific changes to commit (only nested submodule pointers). Skipping .claude push."
  cd ..
  # Continue to parent repo step
else
  # Commit .claude's own files only (no nested submodule pointers)
  git commit -m "$(cat <<'EOF'
<type>: <description of .claude changes>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"

  # Push to .claude's own current branch
  git push origin "$CLAUDE_BRANCH"

  # Create PR targeting dev in .claude repo (REQUIRED)
  gh pr create --base dev --head "$CLAUDE_BRANCH" --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points describing .claude changes>

## Note
Nested submodule pointers (nestjs, react) are excluded. `.claude` is pull-only for nested submodules.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

  # Verify PR was created
  gh pr view "$CLAUDE_BRANCH" --json url --jq '.url'

  cd ..
fi
```

**STOP if PR creation fails for `.claude`.**

---

## Step 3: Sync Parent Repo with dev (Conflict Prevention)

**Purpose:** Before committing parent repo, ensure branch is up-to-date with `dev` so merge conflicts are caught locally.

```bash
git fetch origin dev
git merge origin/dev --no-edit
```

**If merge conflicts occur → STOP immediately:**

```
⚠️ Merge Conflicts with dev Detected

Conflicting files:
  - <file1>
  - <file2>

Resolve conflicts, then re-run /commit-all:
  1. Fix the conflicting files
  2. git add <resolved-files>
  3. git commit (to complete the merge)
  4. Re-run /commit-all
```

**If clean merge or already up-to-date → continue to Step 4.**

---

## Step 4: Stage and Commit Parent Repo (WITHOUT Submodules)

Back in the repo root, commit only the parent repo's own files. **Exclude all submodule paths.**

### 4.1 Detect all submodule paths to exclude:

```bash
# Get list of all submodule paths
SUBMODULE_PATHS=$(git config --file .gitmodules --get-regexp path | awk '{ print $2 }' 2>/dev/null)
```

### 4.2 Stage files excluding submodules:

```bash
git add -A

# Unstage every detected submodule path
for submodule in $SUBMODULE_PATHS; do
  git reset HEAD "$submodule" 2>/dev/null || true
done

# Also unstage .gitmodules (local-only submodule config)
git reset HEAD .gitmodules 2>/dev/null || true
```

### 4.3 Verify no submodule changes are staged:

```bash
git diff --cached --name-only
# Confirm NO submodule paths appear in this list
```

If only submodule changes existed and no parent files changed, skip the parent commit and jump to Step 9 (Final Report) — report that only submodules were pushed.

### 4.4 Create commit with proper message:

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

If $ARGUMENTS is provided by the user, use it as the commit message.

---

## Step 5: Push Parent Repo and Create PR (MANDATORY)

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

**Note:** Submodules were pushed separately with their own PRs.

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

## Step 6: Run Automated Audit Checks on Parent PR

Run the same audit checks as `/commit` (see `/commit` Step 7 for full details). The audit runs on the **parent repo PR only** — submodule PRs are not audited.

### 6.0 Auto-Detect Stacks

```bash
CHANGED_FILES=$(gh pr diff "$PR_NUMBER" --name-only)

HAS_REACT=false; HAS_REACT_NATIVE=false; HAS_DJANGO=false; HAS_NESTJS=false
[ -f frontend/package.json ] && grep -q '"react"' frontend/package.json && HAS_REACT=true
[ -f mobile/package.json ] && grep -q '"react-native"' mobile/package.json && HAS_REACT_NATIVE=true
[ -f backend/manage.py ] && HAS_DJANGO=true
([ -f backend/nest-cli.json ] || ([ -f backend/package.json ] && grep -q '"@nestjs' backend/package.json)) && HAS_NESTJS=true
```

### 6.1–6.8 Run All Checks

Run the same checks as `/commit` Step 7 (7.1–7.8):
1. **Build Validation** — tsc / manage.py check (per stack)
2. **Type Checking / Code Formatting** — typecheck / black+isort (per stack)
3. **Linting** — eslint / flake8 / agent fallback (per stack)
4. **Migration / Schema Check** — makemigrations --check (Django/NestJS)
5. **Code Quality Scan** — `code-architecture-reviewer` agent in quick diff mode
6. **API Integration Validation** — `api-integration-agent` (if API files changed)
7. **Routing Validation** — route/URL checks (if route files changed)
8. **Auth/Role Validation** — permission/guard checks (if auth files changed)

Each check produces: **PASS / WARN / FAIL**.

---

## Step 7: Generate PR Audit Report

Aggregate all check results and calculate QA score:
- Each PASS = full points, WARN = half points, FAIL = 0 points
- **QA Score** = (earned / total) × 100

Display the audit report:

```
╔══════════════════════════════════════════════╗
║            PR AUDIT REPORT                   ║
║   Branch: $CURRENT_BRANCH → dev              ║
║   PR: #$PR_NUMBER (Parent Repo)              ║
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
╚══════════════════════════════════════════════╝
```

---

## Step 8: Ask User for Approval

Use **AskUserQuestion** to present the results and ask for explicit approval:

```
PR Audit Complete — QA Score: XX/100
Stacks detected: [React, Django, etc.]
X CRITICAL issues, X warnings found.

What would you like to do?
```

**Options:**
- **"Approve & Merge to dev"** — Merge the parent PR into dev immediately
- **"Reject — Fix issues first"** — PR stays open, user fixes issues and re-runs /commit-all
- **"Keep PR open (no merge)"** — PR is created but not merged, user merges manually later

**IMPORTANT:** NEVER merge without explicit user approval.

### If user selects "Approve & Merge to dev":

```bash
gh pr merge "$PR_NUMBER" --merge --delete-branch=false
```

Verify merge:
```bash
PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
if [ "$PR_STATE" = "MERGED" ]; then
  echo "✓ PR auto-merged to dev"
fi
```

Sync branch:
```bash
git fetch origin dev
git merge origin/dev --no-edit
```

### If user does NOT approve:

- PR stays open at the URL
- Report: "PR open at <URL>. Fix the issues, then re-run /commit-all."

---

## Step 9: Final Report

The workflow is ONLY successful if ALL of these are true:
- ✓ Each nested submodule with changes was pushed on its own branch
- ✓ Each nested submodule PR was created targeting `dev`
- ✓ `.claude` committed WITHOUT nested submodule pointer changes (pull-only)
- ✓ `.claude` PR was created targeting `dev` (if it had own-file changes)
- ✓ Parent repo committed WITHOUT `.claude` pointer changes
- ✓ Parent repo pushed to origin
- ✓ Parent repo PR created with valid URL
- ✓ Audit checks completed
- ✓ User approval obtained (if merging)

### Success Report Format:

```
✓ Workflow Complete

Nested Submodule PRs (pushed individually):
1. .pi/<submodule> → <PR URL>
2. .pi/<submodule> → <PR URL>

.claude PR (no nested submodule pointers):
<PR URL> (or "Skipped - no .claude-specific changes")
  - Branch: <branch>
  - Commit: <hash> - <commit message>

Parent Repo PR (no .claude pointer changes):
<PR URL>
  - Branch: <current-branch>
  - Commit: <hash> - <commit message>
  - Files: <count>
  - Audit: QA Score XX/100 — X critical, X warnings
  - Merge: ✓ Auto-merged to dev / ⚠️ PR open — pending fixes / ℹ️ PR open — manual merge
  - Branch synced: ✓ / N/A
```

### Failure Report Format:

```
✗ Workflow Failed

Error: <error description>
Action Required: <what user should do>
```

---

## Error Handling

### STOP conditions (halt workflow immediately):
- **On `main`, `dev`, or `master` branch** → Ask user for branch name, create it, then continue workflow
- **Detached HEAD** → Ask user for branch name
- **Merge conflicts with dev** → Ask user to resolve conflicts
- **PR creation fails** → STOP, show error
- **Push fails** → STOP, show error
- **`gh` CLI not authenticated** → STOP, instruct user to run `gh auth login`
- **No changes detected** → STOP, inform user

### NEVER do these:
- ❌ Push directly to `dev`, `main`, or `master` in ANY repo (parent or submodule)
- ❌ Include submodule pointer changes in the parent repo commit
- ❌ Include nested submodule pointer changes in `.claude` commit (pull-only)
- ❌ Push without creating a PR
- ❌ Report "success" if PR was not created
- ❌ Suggest "manual PR creation" as an alternative
- ❌ Merge PR without explicit user approval
- ❌ Skip audit checks on parent repo PR

---

## Important Notes

- **Use current branch if valid** - If on dev/main/master, ask user for a branch name and create it
- **PR is mandatory** - The workflow does not complete without a PR URL
- **Audit is mandatory** - Always run checks and show report before merge decision
- **User approval required** - Never auto-merge without asking
- **Submodules push independently** - Each submodule gets its own push and PR on its own branch
- **Parent repo is clean** - No submodule references in the parent commit
- **`.claude` is pull-only for nested submodules** - Never include nested submodule pointer changes (nestjs, react, etc.) in `.claude` commit
- **Protected branch = ask and branch** - When on `dev`, `main`, or `master`, ask user for a branch name, then create and switch to it
- **Generic detection** - Submodules are detected dynamically via `git submodule status`, not hardcoded
- **Stack auto-detection** - Audit checks are tailored to detected stacks (React, React Native, Django, NestJS)
- **After merging PR** - Delete the branch to keep repo clean
