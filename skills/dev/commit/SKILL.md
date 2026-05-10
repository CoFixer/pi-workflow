---
name: "commit"
description: "Runs build/type checks, updates bun.lock if needed, then commits current branch, opens a PR to dev, and merges it. Invoke when user says '/commit' to ship changes."
---

# Commit (PR → dev → merge)

This skill ships the **current branch** through a PR into `dev`:

- Verifies you are **not** on `dev`, `main`, or `master`
- Detects which package(s) changed and runs their **typecheck/build**
- If dependencies changed and a package uses **bun.lock**, regenerates it via `bun install`
- Commits, pushes, creates a PR to `dev`, and merges the PR

## Hard rules

- Stop immediately if current branch is `dev`, `main`, or `master`
- Do not create a new branch; use the current branch only
- Do not proceed if build/typecheck fails
- Do not proceed if PR creation fails
- Never stage secrets (for example `.env*`, credentials files)

## Workflow (PowerShell commands)

### 0) Branch guard

```powershell
$branch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($branch)) { throw "Detached HEAD. Checkout a feature branch first." }
if ($branch -in @('dev','main','master')) { throw "Refusing to run on protected branch: $branch" }
```

### 1) Ensure there are changes

```powershell
$status = git status --porcelain
if (-not $status) { throw "No changes to commit." }
```

### 2) Detect changed packages

Determine changed roots from `git status --porcelain`:

- `backend/`
- `frontend/`
- `dashboard/`
- `storepilot-plugin/`
- If none match, treat scope as `monorepo`

```powershell
$changedFiles = ($status | ForEach-Object { $_.Substring(3) })
$hasBackend = $changedFiles | Where-Object { $_ -like 'backend/*' }
$hasFrontend = $changedFiles | Where-Object { $_ -like 'frontend/*' }
$hasDashboard = $changedFiles | Where-Object { $_ -like 'dashboard/*' }
$hasPlugin = $changedFiles | Where-Object { $_ -like 'storepilot-plugin/*' }
```

### 3) bun.lock sync (only when needed)

Run only if **both** are true:
- package contains `bun.lock`
- `package.json` (or the lock itself) changed in that package

Also stop if `bun` is required but not installed.

```powershell
function Ensure-Bun {
  if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    throw "bun is required to update bun.lock, but bun is not installed/available in PATH."
  }
}

function Sync-BunLock([string]$pkgPath) {
  $pkgJsonChanged = $changedFiles | Where-Object { $_ -eq "$pkgPath/package.json" }
  $bunLockChanged = $changedFiles | Where-Object { $_ -eq "$pkgPath/bun.lock" }
  $hasBunLock = Test-Path (Join-Path $pkgPath 'bun.lock')
  if ($hasBunLock -and ($pkgJsonChanged -or $bunLockChanged)) {
    Ensure-Bun
    Push-Location $pkgPath
    bun install
    Pop-Location
  }
}

if ($hasBackend) { Sync-BunLock 'backend' }
if ($hasFrontend) { Sync-BunLock 'frontend' }
if ($hasDashboard) { Sync-BunLock 'dashboard' }
if ($hasPlugin) { Sync-BunLock 'storepilot-plugin' }
```

### 4) Build + typecheck gates (only for changed packages)

```powershell
if ($hasBackend) {
  Push-Location backend
  npm run type-check
  npm run build
  Pop-Location
}

if ($hasFrontend) {
  Push-Location frontend
  npm run typecheck
  npm run build
  Pop-Location
}

if ($hasDashboard) {
  Push-Location dashboard
  npm run typecheck
  npm run build
  Pop-Location
}

if ($hasPlugin) {
  Push-Location storepilot-plugin
  npm run build
  Pop-Location
}
```

### 5) Stage safely

```powershell
git add -A

# Never commit secrets / envs
git reset HEAD -- .env .env.* 2>$null

# Avoid committing the .claude submodule pointer if present/dirty
git reset HEAD -- .claude .pi .gitmodules 2>$null
```

### 6) Create commit (Conventional Commits)

- Type: `fix|feat|chore|refactor|test|docs|build|ci|perf|revert`
- Scope: prefer `backend|frontend|dashboard|plugin|monorepo`

If multiple packages changed, use `monorepo` scope.

```powershell
# Example:
git commit -m "fix(frontend): render recent activity content"
```

### 7) Push current branch

```powershell
git push -u origin $branch
```

### 8) Create PR to dev (requires gh)

Stop if `gh` is not installed or not authenticated.

```powershell
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "gh CLI is required." }
gh auth status

$title = (git log -1 --pretty=%s).Trim()
$body = @"
## Summary
- <fill based on diff>

## Validation
- <list the commands you ran, e.g. frontend: npm run typecheck; npm run build>
"@

$prUrl = gh pr create --base dev --head $branch --title $title --body $body
if ([string]::IsNullOrWhiteSpace($prUrl)) { throw "PR creation failed." }
```

### 9) Merge PR into dev

```powershell
$prNumber = gh pr view $branch --json number --jq '.number'
gh pr merge $prNumber --merge --delete-branch=false
```

Optional: keep the current branch synced with dev:

```powershell
git fetch origin dev
git merge origin/dev --no-edit
```

## Output to user

Return:
- branch name
- commit SHA + subject
- PR URL
- merge status (MERGED / NOT MERGED) and any failure reason
