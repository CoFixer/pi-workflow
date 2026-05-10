---
description: Deploy current branch through the git workflow (feature -> dev -> main -> production)
argument-hint: "--main (default: full deploy to production) | --dev (merge to dev only)"
---

You are a git deploy workflow assistant. Your task is to promote the current branch through the deployment pipeline: feature branch -> dev -> main -> production (GitHub Actions).

## Arguments

| Argument | Description |
|----------|-------------|
| `--main` | Full pipeline: feature -> dev -> main -> wait for production deploy (default when no argument) |
| `--dev` | Partial pipeline: feature -> dev only |

Parse `$ARGUMENTS`:
- If empty or `--main`: Set `DEPLOY_TARGET=main`
- If `--dev`: Set `DEPLOY_TARGET=dev`
- Anything else: STOP with error "Unknown argument. Use --main or --dev"

## CRITICAL RULES (NEVER VIOLATE)

1. **NEVER push directly to `dev` or `main`** - All changes MUST go through PRs
2. **NEVER force-merge PRs** - If merge fails due to conflicts, STOP and inform user
3. **STOP if on `main` or `dev`** - Must be on a feature branch to deploy
4. **STOP if any PR creation fails** - Do NOT continue to the next stage
5. **STOP if any PR merge fails** - Do NOT continue to the next stage
6. **STOP if GitHub Actions fails** - Report the failure URL, do NOT retry
7. **ALWAYS verify each step before proceeding** - Check PR merged status before next PR
8. **ALWAYS use `--merge` strategy** - No squash, no rebase for deploy merges
9. **ALWAYS confirm with user before merging to main** - Production deploy is irreversible
10. **NEVER commit or push submodule changes** - This command is for the parent repo only. Use /commit-all for submodules

---

## Step 0: Prerequisites and Branch Validation

### 0.1 Verify gh CLI

```bash
gh auth status
```

**If this fails:** STOP. Instruct user to run `gh auth login`.

### 0.2 Get Current Branch

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

### 0.3 Check for Detached HEAD

```bash
if [ -z "$CURRENT_BRANCH" ]; then
  echo "ERROR: Detached HEAD state detected"
  # STOP - Cannot deploy from detached HEAD
fi
```

**If detached HEAD:** STOP. Tell user: "You are in detached HEAD state. Please checkout a branch first with `git checkout -b <branch-name>`."

### 0.4 Check for Protected Branches

```bash
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "dev" ]; then
  echo "ERROR: Cannot deploy from '$CURRENT_BRANCH'"
  # STOP
fi
```

**If on main or dev:** STOP. Tell user:
```
You are on '$CURRENT_BRANCH'. Deploy must be run from a feature branch.

Create one first:
  git checkout dev && git pull origin dev
  git checkout -b feature/<name>

Convention: feature/<name>, fix/<name>, chore/<name>, refactor/<name>, docs/<name>
```

### 0.5 Ensure dev Branch Exists on Remote

```bash
if ! git ls-remote --heads origin dev | grep -q dev; then
  echo "ERROR: 'dev' branch does not exist on remote"
  # STOP - Use AskUserQuestion to ask if user wants to create dev from main
fi

git fetch origin dev
git fetch origin main
```

### 0.6 Get Repository Info

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
echo "Repository: $REPO"
```

### 0.7 Confirm Deploy Plan

```bash
echo "Deploy plan:"
echo "  Branch: $CURRENT_BRANCH"
if [ "$DEPLOY_TARGET" = "dev" ]; then
  echo "  Pipeline: $CURRENT_BRANCH -> dev (stop)"
else
  echo "  Pipeline: $CURRENT_BRANCH -> dev -> main -> production"
fi
```

---

## Step 1: Ensure Working Directory is Clean (Parent Repo Only)

**IMPORTANT:** This command only commits and pushes the **parent repo**. Submodule changes are excluded. Use `/commit-all` first if submodules need to be committed separately.

### 1.1 Check for Uncommitted Changes (Excluding Submodules)

```bash
git status --porcelain --ignore-submodules=all
```

Use `--ignore-submodules=all` to exclude submodule changes from the check.

### 1.2 If Changes Exist, Commit Them

If `git status --porcelain --ignore-submodules=all` returns output (uncommitted changes exist):

1. Stage changes — add specific files/folders, **never submodules**:
```bash
# Stage only parent repo files, NOT submodules
git add -A
git reset HEAD .claude 2>/dev/null  # Always unstage submodule
```

2. Verify no submodule is staged:
```bash
git diff --cached --name-only | grep -v "^\.claude$"
```

3. Create commit with an appropriate conventional commit message:
```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <concise description based on staged changes>

<optional body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

Analyze the staged diff to determine the appropriate type (feat/fix/refactor/chore) and scope.

If $ARGUMENTS contains a commit message (not just --main/--dev), use it.

### 1.3 Ensure Branch is Pushed to Remote

```bash
if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null; then
  git push -u origin "$CURRENT_BRANCH"
else
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse @{u} 2>/dev/null)
  if [ "$LOCAL" != "$REMOTE" ]; then
    git push origin "$CURRENT_BRANCH"
  fi
fi
```

**If push fails:** STOP. Show error.

---

## Step 2: Create and Merge PR to dev ($CURRENT_BRANCH -> dev)

### 2.1 Check for Existing PR

```bash
EXISTING_PR=$(gh pr list --head "$CURRENT_BRANCH" --base dev --json number,url --jq '.[0]')
```

### 2.2 Create PR if None Exists

If no existing PR:

```bash
gh pr create \
  --base dev \
  --head "$CURRENT_BRANCH" \
  --title "deploy: merge $CURRENT_BRANCH into dev" \
  --body "$(cat <<'EOF'
## Summary
<1-3 bullet points summarizing key changes from this branch>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**If PR already exists:** Use the existing PR. Print: "Using existing PR: <url>"

### 2.3 Get PR Number

```bash
PR_DEV_NUMBER=$(gh pr list --head "$CURRENT_BRANCH" --base dev --json number --jq '.[0].number')
PR_DEV_URL=$(gh pr view "$PR_DEV_NUMBER" --json url --jq '.url')
echo "PR #$PR_DEV_NUMBER: $PR_DEV_URL"
```

**If this fails or returns empty:** STOP immediately.

### 2.4 Check if Already Merged

```bash
PR_DEV_STATE=$(gh pr view "$PR_DEV_NUMBER" --json state --jq '.state')
```

If `PR_DEV_STATE` is `MERGED`, skip to Step 2.6.

### 2.5 Merge PR to dev

```bash
gh pr merge "$PR_DEV_NUMBER" --merge --delete-branch=false
```

**If merge fails:** STOP. Common causes:
- Merge conflicts: "Resolve conflicts manually, then re-run /deploy"
- Required reviews: "Get review approval, then re-run /deploy"
- Status checks failing: "Fix failing checks, then re-run /deploy"

### 2.6 Verify Merge Succeeded

```bash
PR_DEV_MERGED=$(gh pr view "$PR_DEV_NUMBER" --json state --jq '.state')
if [ "$PR_DEV_MERGED" != "MERGED" ]; then
  echo "ERROR: PR #$PR_DEV_NUMBER not in MERGED state"
  # STOP
fi
```

### 2.7 Report Stage 1

```
✓ Stage 1 Complete
  PR: $PR_DEV_URL
  Merged: $CURRENT_BRANCH -> dev
```

**If `$DEPLOY_TARGET` is `dev`:** Skip to Step 6 (Report Results).

---

## Step 3: Create and Merge PR to main (dev -> main)

**Only executed when `$DEPLOY_TARGET` is `main`.**

### 3.1 Check for Existing PR (dev -> main)

```bash
EXISTING_MAIN_PR=$(gh pr list --head dev --base main --json number,url --jq '.[0]')
```

### 3.2 Create PR if None Exists

```bash
gh pr create \
  --base main \
  --head dev \
  --title "deploy: release dev to production" \
  --body "$(cat <<'EOF'
## Summary
- Production release from `dev` branch
- Triggered by deployment of `$CURRENT_BRANCH`

## Deployment
Merging this PR triggers GitHub Actions:
1. Cross-compile agent binaries
2. SCP binaries to production server
3. git pull + docker compose build + up

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 3.3 Get PR Number

```bash
PR_MAIN_NUMBER=$(gh pr list --head dev --base main --json number --jq '.[0].number')
PR_MAIN_URL=$(gh pr view "$PR_MAIN_NUMBER" --json url --jq '.url')
```

**If this fails:** STOP immediately.

### 3.4 Check if Already Merged

```bash
PR_MAIN_STATE=$(gh pr view "$PR_MAIN_NUMBER" --json state --jq '.state')
```

If `MERGED`, skip to Step 3.7.

### 3.5 Confirm with User Before Production Deploy

Use **AskUserQuestion** to confirm:

```
Ready to merge dev -> main, which will trigger production deployment.

PR: $PR_MAIN_URL

This will deploy to:
  API: http://211.188.49.111:8080
  Dashboard: http://211.188.49.111:3000

Proceed?
```

Options: "Yes, deploy to production" / "No, stop here"

**If user says no:** STOP. Report "Deployment paused. PR is ready at $PR_MAIN_URL — merge manually when ready."

### 3.6 Merge PR to main

```bash
gh pr merge "$PR_MAIN_NUMBER" --merge --delete-branch=false
```

**`--delete-branch=false`** — `dev` is a permanent branch and must never be deleted.

**If merge fails:** STOP with error details.

### 3.7 Verify Merge

```bash
PR_MAIN_MERGED=$(gh pr view "$PR_MAIN_NUMBER" --json state --jq '.state')
if [ "$PR_MAIN_MERGED" != "MERGED" ]; then
  echo "ERROR: PR #$PR_MAIN_NUMBER not in MERGED state"
  # STOP
fi
```

---

## Step 4: Monitor GitHub Actions Deployment

**Only executed when `$DEPLOY_TARGET` is `main`.**

### 4.1 Wait for Workflow Run to Appear

```bash
sleep 5

RUN_ID=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')

# Retry if not found
if [ -z "$RUN_ID" ]; then
  for i in 1 2 3 4 5 6; do
    sleep 5
    RUN_ID=$(gh run list --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
    if [ -n "$RUN_ID" ]; then break; fi
  done
fi

if [ -z "$RUN_ID" ]; then
  echo "WARNING: Could not find GitHub Actions workflow run"
  echo "Check manually: https://github.com/$REPO/actions"
fi
```

### 4.2 Watch Workflow Run

```bash
gh run watch "$RUN_ID" --exit-status
```

### 4.3 Check Result

```bash
CONCLUSION=$(gh run view "$RUN_ID" --json conclusion --jq '.conclusion')
RUN_URL=$(gh run view "$RUN_ID" --json url --jq '.url')
```

**If `success`:** Continue to Step 5.

**If `failure`:** STOP. Report:
```
✗ DEPLOYMENT FAILED

GitHub Actions workflow failed.
Run: $RUN_URL

Check logs: gh run view $RUN_ID --log
```

---

## Step 5: Verify Production (Optional)

**Only executed when GitHub Actions succeeded.**

```bash
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://211.188.49.111:8080/api/health 2>/dev/null)
echo "API health check: HTTP $HTTP_STATUS"
```

If not 200: Warn but do NOT STOP. Server may still be restarting.

---

## Step 6: Report Results

### 6.1 Offer Branch Cleanup (--main only)

Use **AskUserQuestion**:

```
Deployment complete! Delete feature branch '$CURRENT_BRANCH'? (local + remote)
```

Options: "Yes, delete branch" / "No, keep it"

**If yes:**
```bash
git checkout dev
git pull origin dev
git push origin --delete "$CURRENT_BRANCH"
git branch -d "$CURRENT_BRANCH"
```

### 6.2 Success Report (--main)

```
✓ DEPLOYMENT COMPLETE

Pipeline: $CURRENT_BRANCH -> dev -> main -> production

Stage 1: $CURRENT_BRANCH -> dev
  PR: $PR_DEV_URL — MERGED

Stage 2: dev -> main
  PR: $PR_MAIN_URL — MERGED

Stage 3: GitHub Actions
  Run: $RUN_URL — $CONCLUSION

Production:
  API: http://211.188.49.111:8080
  Dashboard: http://211.188.49.111:3000
```

### 6.3 Success Report (--dev)

```
✓ DEV MERGE COMPLETE

Pipeline: $CURRENT_BRANCH -> dev

PR: $PR_DEV_URL — MERGED

To deploy to production later: /deploy --main
```

---

## Error Handling

### STOP conditions:
- **On `main` or `dev` branch** -> create a feature branch first (`feature/<name>`, `fix/<name>`)
- **Detached HEAD** -> create a feature branch first
- **`gh` CLI not authenticated** -> run `gh auth login`
- **PR creation fails** -> show error
- **PR merge fails** -> show error with cause (conflicts, reviews, checks)
- **GitHub Actions fails** -> show workflow URL and log command
- **Push fails** -> show error

### NEVER do these:
- ❌ Push directly to `dev` or `main`
- ❌ Force-merge PRs with conflicts
- ❌ Retry failed GitHub Actions automatically
- ❌ Delete the `dev` or `main` branch
- ❌ Continue pipeline after any stage failure
- ❌ Skip user confirmation before merging to main
- ❌ Use `--squash` or `--rebase` merge strategies
- ❌ Report "success" if any stage failed
- ❌ Commit or push submodule changes (parent repo only)

---

## Important Notes

- **Feature branch only** - Must be on a feature branch (`feature/<name>`, `fix/<name>`, etc.), never main or dev
- **Two-stage pipeline** - Always goes through dev first, never directly to main
- **User confirmation** - Always asks before merging to main (production deploy)
- **PR reuse** - Existing PRs are reused, not duplicated
- **Merge strategy** - Always `--merge` to preserve full commit history
- **Submodules** - This command does NOT handle submodule commits. Use /commit-all first if needed
- **No rollback** - If deployment fails, investigate and fix forward
