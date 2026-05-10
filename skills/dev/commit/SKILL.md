---
name: "commit"
description: "Runs build/type checks, updates bun.lock if needed, then commits current branch, opens a PR to dev, and merges it. Invoke when user says '/commit' to ship changes."
---

# Commit (PR → dev → merge)

This skill ships the **current branch** through a PR into `dev`:

- Validates branch (no direct commits to `dev`, `main`, or `master`)
- Detects which package(s) changed and runs their **build/typecheck**
- If dependencies changed and a package uses **bun.lock**, regenerates it via `bun install`
- Warns about submodule changes without committing them
- Commits, pushes, creates a PR to `dev`, runs audit checks, and conditionally merges

## CRITICAL RULES (NEVER VIOLATE)

1. **NEVER push directly to `dev`, `main`, or `master`** — All changes MUST go through PRs
2. **ALWAYS use the current branch** — Do NOT create new branches
3. **ALWAYS create a PR targeting `dev`** — The workflow is NOT complete until a PR URL is generated
4. **STOP if on `main`, `dev`, or `master`** — Ask user to create/checkout a feature branch first
5. **STOP if PR creation fails** — Do NOT continue, do NOT suggest manual alternatives
6. **NEVER commit submodule changes** — This command is for main project only; use `/commit-all` for submodules
7. **NEVER merge without user approval** — Always ask before merging PR to dev
8. **ALWAYS run audit checks** — PR review is mandatory before merge decision

---

## Workflow (PowerShell)

### Step 0: Branch Validation (CRITICAL)

```powershell
$branch = (git branch --show-current).Trim()

# 0.1 Detached HEAD check
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Detached HEAD state detected. Please checkout or create a feature branch first (e.g., feature/<name>, fix/<name>)."
}

# 0.2 Protected branch check
if ($branch -in @('dev','main','master')) {
    throw "Cannot commit directly to protected branch '$branch'. Please create a feature branch first."
}

# 0.3 Ensure dev branch exists
$devExists = git show-ref --verify --quiet refs/remotes/origin/dev 2>$null
if (-not $?) {
    Write-Host "Creating dev branch from main..."
    $original = $branch
    git checkout main
    git checkout -b dev
    git push -u origin dev
    git checkout $original
    Write-Host "Created dev branch"
}

Write-Host "Using branch: $branch"
Write-Host "PR will target: dev"
```

### Step 1: Check for Submodule Changes (Warning Only)

```powershell
$statusFull = git status
$submodulePatterns = @('modified:\s+\.claude', 'modified:\s+\.pi', '\(modified content\)', '\(new commits\)')
$hasSubmoduleChanges = $false
foreach ($pat in $submodulePatterns) {
    if ($statusFull | Select-String $pat) { $hasSubmoduleChanges = $true; break }
}

if ($hasSubmoduleChanges) {
    Write-Host "`n⚠️  Submodule Changes Detected`n"
    Write-Host "Submodule changes will NOT be committed by /commit."
    Write-Host "Use /commit-all to include submodules.`n"
}
```

### Step 2: Detect Projects with Changes

```powershell
$status = git status --porcelain
if (-not $status) { throw "No changes to commit." }

$changedFiles = $status | ForEach-Object { $_.Substring(3) }

# StorePilot-specific packages
$hasBackend      = $changedFiles | Where-Object { $_ -like 'backend/*' }
$hasFrontend     = $changedFiles | Where-Object { $_ -like 'frontend/*' }
$hasDashboard    = $changedFiles | Where-Object { $_ -like 'dashboard/*' }
$hasPlugin       = $changedFiles | Where-Object { $_ -like 'storepilot-plugin/*' }
$hasPiProject    = $changedFiles | Where-Object { $_ -like '.pi-project/*' }

# Determine scope
$scope = if (($hasBackend -and $hasFrontend) -or
              ($hasBackend -and $hasDashboard) -or
              ($hasBackend -and $hasPlugin) -or
              ($hasFrontend -and $hasDashboard) -or
              ($hasFrontend -and $hasPlugin) -or
              ($hasDashboard -and $hasPlugin) -or
               $hasPiProject) {
    'monorepo'
} elseif ($hasBackend) {
    'backend'
} elseif ($hasFrontend) {
    'frontend'
} elseif ($hasDashboard) {
    'dashboard'
} elseif ($hasPlugin) {
    'plugin'
} else {
    'monorepo'
}
```

### Step 3: Sync with dev (Conflict Prevention)

```powershell
git fetch origin dev
$mergeResult = git merge origin/dev --no-edit 2>&1
if ($LASTEXITCODE -ne 0 -or ($mergeResult -join " ") -like "*CONFLICT*") {
    throw "Merge conflicts with dev detected. Resolve conflicts, then re-run /commit.`nConflicting files may be shown above."
}
```

### Step 4: bun.lock Sync (Only When Needed)

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

if ($hasBackend)   { Sync-BunLock 'backend' }
if ($hasFrontend)  { Sync-BunLock 'frontend' }
if ($hasDashboard) { Sync-BunLock 'dashboard' }
if ($hasPlugin)    { Sync-BunLock 'storepilot-plugin' }
```

### Step 5: Build + Typecheck Gates (Only for Changed Packages)

```powershell
$auditResults = @{ }

function Run-Check([string]$Name, [string]$Path, [scriptblock]$Script) {
    Write-Host "`n[$Name] Running..."
    Push-Location $Path
    try {
        & $Script 2>&1 | Out-Host
        if ($LASTEXITCODE -eq 0) {
            $auditResults[$Name] = 'PASS'
            Write-Host "[$Name] PASS"
        } else {
            $auditResults[$Name] = 'FAIL'
            Write-Host "[$Name] FAIL"
        }
    } catch {
        $auditResults[$Name] = 'FAIL'
        Write-Host "[$Name] FAIL (exception)"
    } finally {
        Pop-Location
    }
}

if ($hasBackend) {
    Run-Check 'Backend Build'       'backend' { npm run type-check }
    Run-Check 'Backend Typecheck'   'backend' { npm run type-check }
    Run-Check 'Backend Lint'        'backend' { npm run lint:check }
}

if ($hasFrontend) {
    Run-Check 'Frontend Build'      'frontend' { npm run typecheck; npm run build }
    Run-Check 'Frontend Typecheck'  'frontend' { npm run typecheck }
}

if ($hasDashboard) {
    Run-Check 'Dashboard Build'     'dashboard' { npm run typecheck; npm run build }
    Run-Check 'Dashboard Typecheck' 'dashboard' { npm run typecheck }
}

if ($hasPlugin) {
    Run-Check 'Plugin Build'        'storepilot-plugin' { npm run build }
}

# If any gate FAILed, stop
if ($auditResults.Values -contains 'FAIL') {
    throw "One or more build/typecheck/lint checks failed. Fix the errors above before proceeding."
}
```

### Step 6: Stage Safely

```powershell
git add -A

# Never commit secrets
if (Test-Path .env)  { git reset HEAD -- .env .env.* 2>$null }
if (Test-Path credentials.json) { git reset HEAD -- credentials.json 2>$null }

# Never commit submodules or .gitmodules
if (Test-Path .claude)     { git reset HEAD -- .claude 2>$null }
if (Test-Path .pi)         { git reset HEAD -- .pi 2>$null }
if (Test-Path .gitmodules) { git reset HEAD -- .gitmodules 2>$null }

# Never commit build artifacts / test output
$artifactPatterns = @('node_modules','dist','playwright-report','test-results')
foreach ($pat in $artifactPatterns) {
    git reset HEAD -- $pat 2>$null
}

# Re-check for changes after unstaging
$remaining = git status --porcelain
if (-not $remaining) { throw "No remaining changes to commit after excluding secrets/submodules/artifacts." }
```

### Step 7: Commit

```powershell
# Conventional Commits:
# Type: fix|feat|chore|refactor|test|docs|build|ci|perf|revert
# Scope: backend|frontend|dashboard|plugin|monorepo
git commit -m "feat($scope): <concise description>`n`n<optional body>`n`n🤖 Generated with [Claude Code](https://claude.com/claude-code)`n`nCo-Authored-By: Claude <noreply@anthropic.com>"

$commitHash = (git rev-parse HEAD).Trim()
$commitSubject = (git log -1 --pretty=%s).Trim()
```

### Step 8: Push and Create PR

```powershell
# Verify gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "gh CLI is required. Install from https://cli.github.com and run 'gh auth login'."
}
gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { throw "gh CLI is not authenticated. Run 'gh auth login'." }

# Push
git push -u origin $branch

# Create PR
$prTitle = $commitSubject
$prBody = @"
## Summary
- Changes scoped to: `$scope`
- Files changed: `$(($changedFiles | Measure-Object).Count)`

## Packages Affected
$(if ($hasBackend)   { "- backend" })
$(if ($hasFrontend)  { "- frontend" })
$(if ($hasDashboard) { "- dashboard" })
$(if ($hasPlugin)    { "- storepilot-plugin" })

## Validation
$(if ($hasBackend)   { "- backend: npm run type-check; npm run build; npm run lint:check" })
$(if ($hasFrontend)  { "- frontend: npm run typecheck; npm run build" })
$(if ($hasDashboard) { "- dashboard: npm run typecheck; npm run build" })
$(if ($hasPlugin)    { "- storepilot-plugin: npm run build" })

🤖 Generated with [Claude Code](https://claude.com/claude-code)
"@

$prUrl = gh pr create --base dev --head $branch --title $prTitle --body $prBody
if ([string]::IsNullOrWhiteSpace($prUrl)) { throw "PR creation failed. No URL was returned by 'gh pr create'." }

$prNumber = gh pr view $branch --json number --jq '.number'
Write-Host "PR created: $prUrl"
```

### Step 9: PR Audit Checks

After the PR is created, run a quick audit against the diff.

```powershell
$changedFilesInPR = gh pr diff $prNumber --name-only | ForEach-Object { $_.Trim() } | Where-Object { $_ }

# Detect stacks from PR
$stacks = @()
if ($changedFilesInPR | Where-Object { $_ -like 'backend/*' }) {
    $stacks += 'NestJS'
    # NestJS-specific checks
    if ($changedFilesInPR | Where-Object { $_ -like 'backend/src/**/*.entity.ts' -or $_ -like 'backend/src/**/*.migration*' }) {
        Push-Location backend
        $migrationCheck = npx typeorm migration:generate -d src/data-source.ts --check 2>&1
        Pop-Location
        if ($LASTEXITCODE -ne 0) { $auditResults['Migration Check'] = 'FAIL' } else { $auditResults['Migration Check'] = 'PASS' }
    }
}
if ($changedFilesInPR | Where-Object { $_ -like 'frontend/*' })  { $stacks += 'React' }
if ($changedFilesInPR | Where-Object { $_ -like 'dashboard/*' }) { $stacks += 'React (Dashboard)' }
if ($changedFilesInPR | Where-Object { $_ -like 'storepilot-plugin/*' }) { $stacks += 'WordPress Plugin' }

# Save off the aggregated results for reporting
$qaPass = ($auditResults.Values | Where-Object { $_ -eq 'PASS' }).Count
$qaWarn = ($auditResults.Values | Where-Object { $_ -eq 'WARN' }).Count
$qaFail = ($auditResults.Values | Where-Object { $_ -eq 'FAIL' }).Count
$qaTotal = $auditResults.Count
$qaScore = if ($qaTotal -gt 0) { [math]::Round((($qaPass * 1.0 + $qaWarn * 0.5) / $qaTotal) * 100) } else { 100 }
```

### Step 10: Audit Report

```powershell
Write-Host "`n╔══════════════════════════════════════════════╗"
Write-Host "║            PR AUDIT REPORT                   ║"
Write-Host "║   Branch: $branch → dev" -NoNewline; Write-Host ((" " * [Math]::Max(0, 34 - $branch.Length)) + "║")
Write-Host "║   PR: #$prNumber" -NoNewline; Write-Host ((" " * [Math]::Max(0, 39 - $prNumber.Length)) + "║")
Write-Host "╠══════════════════════════════════════════════╣"

foreach ($key in $auditResults.Keys | Sort-Object) {
    $badge = switch ($auditResults[$key]) {
        'PASS'  { "  ✓ PASS  " }
        'WARN'  { "  ⚠ WARN  " }
        'FAIL'  { "  ✗ FAIL  " }
        default { "    N/A   " }
    }
    $padding = " " * [Math]::Max(0, 34 - $key.Length)
    Write-Host "║  $key$padding$badge  ║"
}

Write-Host "╠══════════════════════════════════════════════╣"
Write-Host "║  QA Score: $qaScore/100" -NoNewline; Write-Host ((" " * [Math]::Max(0, 31 - ([string]$qaScore).Length)) + "║")
Write-Host "╚══════════════════════════════════════════════╝"
```

### Step 11: Ask for Approval

Present the audit results and wait for user decision before merging.

**If user says "merge", "approve", or "yes":**

```powershell
gh pr merge $prNumber --merge --delete-branch=false

# Verify
$prState = gh pr view $prNumber --json state --jq '.state'
if ($prState -eq 'MERGED') {
    Write-Host "✓ PR auto-merged to dev"
    git fetch origin dev
    git merge origin/dev --no-edit
} else {
    Write-Host "⚠️ PR created at $prUrl but merge failed. State: $prState"
}
```

**If user says "reject", "fix", or "no":**

```powershell
Write-Host "PR open at $prUrl. Fix the issues, then re-run /commit."
```

**If user says "keep", "later", or "skip":**

```powershell
Write-Host "PR created at $prUrl. Merge manually when ready."
```

---

## Final Output

```
✓ Workflow Complete

Branch:     <branch>
Commit:     <hash> - <subject>
PR:         <url>
Audit:      QA Score <score>/100 — <pass> passes, <warn> warns, <fail> fails
Merge:      <MERGED / OPEN / REJECTED>
```

---

## Error Handling (STOP Conditions)

| Condition | Action |
|-----------|--------|
| Detached HEAD | Stop; ask user to checkout a feature branch |
| On `dev`, `main`, or `master` | Stop; ask user to create a feature branch |
| No changes after exclusions | Stop; inform user |
| Build / typecheck / lint FAIL | Stop; do not commit or create PR |
| Merge conflicts with `dev` | Stop; ask user to resolve conflicts |
| `gh` CLI missing or not auth'd | Stop; instruct user to install/authenticate |
| PR creation fails | Stop; do NOT continue |
| Merge fails after user approval | Report PR URL; ask user to merge manually |

---

## Important Notes

- **Use current branch** — Never create new branches during commit
- **PR is mandatory** — The workflow does not complete without a PR URL
- **Audit is mandatory** — Always run checks and show report before merge decision
- **User approval required** — Never auto-merge without asking
- **Submodules are skipped** — Use `/commit-all` for full workflow including submodules
- **After merging PR** — Delete the branch to keep repo clean
