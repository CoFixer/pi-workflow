---
description: Commit and push changes for one or more user-selected submodules with validation, PR creation, and optional merge
argument-hint: Optional commit message override (leave empty for AI-generated message)
---

You are a git workflow assistant. Your task is to let the user **select one or more submodules**, validate the branch, commit and push changes within each selected submodule, run validation and QA checks, create PRs to `dev`, and optionally merge upon approval.

**Workflow summary:**
1. Detect submodules and ask user to select one or more
2. For each selected submodule (processed sequentially, deepest-first):
   a. Validate branch safety (no protected branches)
   b. Commit and push within the submodule
   c. Run validation checks (build, type, lint, dependency, integration)
   d. Run AI QA review on the diff
   e. Create PR from feature branch to `dev`
   f. Ask user for approval — merge or keep PR open
   g. Merge with conflict detection (if approved)
3. Display aggregated final report

**Note:** This command operates on **one or more user-selected submodules**. Use `/commit` for main project only, or `/commit-all` for everything.

## CRITICAL RULES (NEVER VIOLATE)

1. **NEVER push directly to `dev`, `main`, or `master`** — All changes MUST go through PRs
2. **ALWAYS operate from a feature branch** — If on a protected branch, stop and ask user to create one
3. **ONLY operate on user-selected submodules** — Never touch unselected submodules or parent repo files
4. **ALWAYS create a PR targeting `dev`** — The workflow is NOT complete until a PR URL is generated
5. **STOP if PR creation fails** — Do NOT continue, do NOT suggest manual alternatives
6. **NEVER merge without explicit user approval** — Always ask before merging
7. **ALWAYS run validation + QA before PR creation** — Do NOT skip checks
8. **DETECT merge conflicts before merging** — If conflicts exist, stop and ask user to resolve

## Branch Policy

- **Feature branches only** — `feature/<name>`, `fix/<name>`, `<your-name>`, etc.
- **Protected branches** — `main`, `dev`, `master` are off-limits for direct pushes
- **PRs target `dev`** — All PRs merge into `dev`, not `main`

---

## Step 0: Submodule Detection & User Selection

### 0.1 Detect Available Submodules

From the repo root, discover all registered submodules:

```bash
git submodule status --recursive
```

Parse the output to build a list of submodule paths (e.g., `.pi/base`, `.pi/react`, `.pi/django`, `.pi/nestjs`, `.pi/react-native`).

Also check which submodules have changes:

```bash
git status
```

Look for paths with `(modified content)` or `(new commits)`.

### 0.2 Ask User to Select Submodule(s)

Use **AskUserQuestion** to present the list with multi-select options:

```
Available submodules:

1. .pi/base         [has changes / no changes]
2. .pi/react        [has changes / no changes]
3. .pi/django       [has changes / no changes]
4. .pi/nestjs       [has changes / no changes]
5. .pi/react-native [has changes / no changes]

Selection options:
- Enter a single number (e.g., "2") to select one submodule
- Enter multiple numbers separated by commas (e.g., "1,3,5") to select specific submodules
- Enter "all" to select all submodules with changes

Which submodule(s) would you like to commit?
```

### 0.3 Validate Selection

Parse the user's input and build the `$SELECTED_SUBMODULES` list:

- **If "all"**: Filter to only submodules that have changes. If none have changes, STOP:
  ```
  No submodules have changes. Nothing to commit.
  ```

- **If specific numbers**: Validate each number is in range. For each selected submodule:
  - If it has no changes, warn and exclude it from the list.
  - If all selected submodules have no changes, STOP:
    ```
    No changes detected in the selected submodule(s). Nothing to commit.
    ```

**Sort the final list deepest-first** (count `/` path separators — deepest paths first, alphabetical tiebreak within same depth). This ensures nested submodules are pushed before their parents.

### 0.4 Confirm Processing Plan

If more than one submodule is selected, use **AskUserQuestion** to confirm:

```
Will process the following submodules (in order):

1. .pi/react        (branch: <branch>)
2. .pi/base         (branch: <branch>)

Each submodule will go through:
  Branch Safety → Commit → Validation → QA → PR → Approval → Merge

Proceed? (Y/N)
```

If user selects N, STOP.

If only one submodule is selected, skip confirmation and proceed directly.

---

## Processing Loop

For each submodule in `$SELECTED_SUBMODULES` (processed sequentially in deepest-first order):

1. Set `$SELECTED_SUBMODULE` = current submodule path
2. Set `$SUBMODULE_INDEX` = current position (1-based)
3. Set `$TOTAL_SUBMODULES` = total number of selected submodules
4. Display: `"Processing submodule $SUBMODULE_INDEX of $TOTAL_SUBMODULES: $SELECTED_SUBMODULE"`
5. Execute Steps 1 through 7 for this submodule
6. Record the result in `$RESULTS[$SELECTED_SUBMODULE]`:
   - PR URL (or null if failed)
   - Validation summary (PASS/WARN/FAIL counts)
   - QA score and verdict
   - Merge status (merged / PR open / failed)
   - Error description (if any)

### On Failure Within a Submodule

If any STOP condition triggers during Steps 1-7 for the current submodule and there are remaining submodules to process:

Use **AskUserQuestion**:

```
Submodule '$SELECTED_SUBMODULE' failed at Step X: <error description>

Remaining submodules to process:
- <submodule_a>
- <submodule_b>

Options:
A. Skip this submodule and continue with remaining
B. Stop entire workflow (PRs already created will remain open)
```

- If user selects **A**: Record the failure in `$RESULTS`, continue to next submodule.
- If user selects **B**: Jump directly to Step 8 (Final Report) with partial results.

If only one submodule was selected (or this is the last one), standard STOP behavior applies — no skip option.

---

## Step 1: Branch Safety Validation

### 1.1 Check Current Branch (in selected submodule)

```bash
cd $SELECTED_SUBMODULE
SUB_BRANCH=$(git branch --show-current)
echo "Current branch in $SELECTED_SUBMODULE: $SUB_BRANCH"
```

### 1.2 Check for Detached HEAD

```bash
if [ -z "$SUB_BRANCH" ]; then
  echo "Detached HEAD in $SELECTED_SUBMODULE"
  # STOP - Use AskUserQuestion to get branch name
fi
```

**If detached HEAD:** Use **AskUserQuestion**:
```
The submodule <submodule> is in detached HEAD state.
What feature branch name would you like to use?
(e.g., feature/<feature-name>, fix/<bug-name>)
```

Then create the branch:
```bash
git checkout -b "<user-provided>"
SUB_BRANCH="<user-provided>"
```

### 1.3 Check for Protected Branches

```bash
if [ "$SUB_BRANCH" = "main" ] || [ "$SUB_BRANCH" = "dev" ] || [ "$SUB_BRANCH" = "master" ]; then
  echo "Cannot commit directly to '$SUB_BRANCH' — this is a protected branch."
  # STOP - Use AskUserQuestion to get a feature branch name
fi
```

**If on protected branch:** Use **AskUserQuestion**:
```
You are on '$SUB_BRANCH' which is a protected branch in <submodule>.
Please provide a feature branch name to use.

Example: git checkout -b feature/<feature-name>
```

Then create the branch:
```bash
git checkout -b "<user-provided>"
SUB_BRANCH="<user-provided>"
```

### 1.4 Also Validate Parent Repo Branch

```bash
cd <repo-root>
PARENT_BRANCH=$(git branch --show-current)
if [ "$PARENT_BRANCH" = "main" ] || [ "$PARENT_BRANCH" = "dev" ] || [ "$PARENT_BRANCH" = "master" ]; then
  echo "Parent repo is on protected branch '$PARENT_BRANCH'."
  # STOP - Ask user to create a feature branch in parent repo first
fi
```

### 1.5 Confirm Ready

```bash
echo "Selected submodule: $SELECTED_SUBMODULE"
echo "Submodule branch:   $SUB_BRANCH"
echo "Parent branch:      $PARENT_BRANCH"
echo "PR target:          dev"
```

---

## Step 2: Commit Preparation

Within the selected submodule, stage and commit changes.

### 2.1 Ensure `dev` Branch Exists in Submodule

```bash
cd $SELECTED_SUBMODULE

if ! git show-ref --verify --quiet refs/heads/dev; then
  if git show-ref --verify --quiet refs/remotes/origin/dev; then
    git checkout -b dev origin/dev
    git checkout "$SUB_BRANCH"
  else
    ORIG="$SUB_BRANCH"
    git checkout main 2>/dev/null || git checkout master
    git checkout -b dev
    git push -u origin dev
    git checkout "$ORIG"
  fi
fi
```

### 2.2 Stage Changes

```bash
git add -A
```

### 2.3 Review Staged Changes

```bash
git diff --cached --stat
git diff --cached
```

Display the summary to understand what will be committed.

### 2.4 Create Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <concise description of changes>

<optional body explaining the why>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

If `$ARGUMENTS` is provided by the user, use it as the commit message instead.

**Type prefixes:** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `style:`

### 2.5 Push to Feature Branch

```bash
git push -u origin "$SUB_BRANCH"
```

```bash
cd <repo-root>
```

**STOP if push fails — show error and ask user to resolve.**

---

## Step 3: Validation Phase

Run validation checks on the selected submodule. Checks are adapted based on what the submodule contains.

### 3.1 Build Check

For code-containing submodules, verify the build compiles:

- **React/TypeScript submodules**: `npx tsc --noEmit` (if `tsconfig.json` exists)
- **Django submodules**: `python manage.py check` (if `manage.py` exists)
- **Config-only submodules** (`.pi/base`): Check that all referenced files exist

```bash
cd $SELECTED_SUBMODULE
if [ -f "tsconfig.json" ]; then
  npx tsc --noEmit 2>&1 && echo "PASS" || echo "FAIL"
elif [ -f "manage.py" ]; then
  python manage.py check 2>&1 && echo "PASS" || echo "FAIL"
else
  echo "PASS (config-only submodule — no build step)"
fi
cd <repo-root>
```

Result: **PASS** / **FAIL**

### 3.2 Type Check

- **TypeScript**: `npx tsc --noEmit --strict` (if applicable)
- **Python/Django**: `python -m mypy . --ignore-missing-imports` (if mypy installed)
- **Config submodules**: Verify YAML frontmatter in `.md` files, valid JSON in `.json` files

```bash
cd $SELECTED_SUBMODULE
# For config submodules like .pi/base:
for jsonfile in $(find . -name "*.json" -not -path "*/node_modules/*" 2>/dev/null); do
  python3 -c "import json; json.load(open('$jsonfile'))" 2>&1 || echo "FAIL: $jsonfile invalid JSON"
done
cd <repo-root>
```

Result: **PASS** / **WARN** / **FAIL**

### 3.3 Lint Check

- **TypeScript/JS**: `npx eslint` on changed files (if `.eslintrc` exists)
- **Python**: `flake8` or `ruff` (if configured)
- **Markdown**: Check for broken markdown structure, unclosed code blocks
- **Config submodules**: Verify no placeholder text (`<TODO>`, `FIXME`, `lorem ipsum`)

```bash
cd $SELECTED_SUBMODULE
# Check for placeholder text in committed files
PLACEHOLDERS=$(git diff HEAD~1 --name-only | xargs grep -l '<TODO>\|FIXME\|lorem ipsum' 2>/dev/null)
if [ -z "$PLACEHOLDERS" ]; then
  echo "PASS"
else
  echo "WARN: Placeholder text found in: $PLACEHOLDERS"
fi
cd <repo-root>
```

Result: **PASS** / **WARN** / **FAIL**

### 3.4 Dependency Validation

Verify that file references and dependencies within the submodule are intact:

- All `import` / `require` paths resolve to existing files
- All file path references in config files point to existing targets
- Symlinks resolve correctly

```bash
cd $SELECTED_SUBMODULE
# Check symlinks
BROKEN_LINKS=$(find . -type l ! -exec test -e {} \; -print 2>/dev/null)
if [ -z "$BROKEN_LINKS" ]; then
  echo "PASS"
else
  echo "FAIL: Broken symlinks: $BROKEN_LINKS"
fi

# Check file references in skill-rules.json, command files, etc.
for ref in $(grep -roE '(agents|commands|guides|skills)/[a-zA-Z0-9/_-]+\.md' . 2>/dev/null | cut -d: -f2 | sort -u); do
  if [ ! -f "$ref" ] && [ ! -f "../$ref" ] && [ ! -f "../../$ref" ]; then
    echo "WARN: Unresolved reference: $ref"
  fi
done
cd <repo-root>
```

Result: **PASS** / **WARN** / **FAIL**

### 3.5 Basic Integration Validation

Verify that changes don't break integration with other parts of the system:

- If command files changed: verify they have required frontmatter (`description` field)
- If agent files changed: verify they have description and tools sections
- If skill rules changed: verify all `file` references exist

```bash
cd $SELECTED_SUBMODULE
CHANGED_MD=$(git diff HEAD~1 --name-only -- '*.md' 2>/dev/null)
for file in $CHANGED_MD; do
  if [ -f "$file" ]; then
    if ! head -1 "$file" | grep -q "^---$"; then
      echo "WARN: $file missing YAML frontmatter"
    fi
  fi
done
cd <repo-root>
```

Result: **PASS** / **WARN** / **FAIL**

### 3.6 Validation Report

```
Validation Checks ($SELECTED_SUBMODULE):
  Build check             — PASS / WARN / FAIL
  Type check              — PASS / WARN / FAIL
  Lint check              — PASS / WARN / FAIL
  Dependency validation   — PASS / WARN / FAIL
  Integration validation  — PASS / WARN / FAIL

  Result: X PASS, X WARN, X FAIL
```

**Gate rule:**
- Any **FAIL** → Show issues. Ask user if they want to continue anyway or fix first.
- Any **WARN** → Continue with warnings displayed.
- All **PASS** → Proceed to Step 4.

---

## Step 4: AI QA Review

Launch the `code-architecture-reviewer` agent to review the committed changes:

```
Agent(
  subagent_type='code-architecture-reviewer',
  description='QA review of submodule changes',
  prompt='Review the git diff for the submodule at $SELECTED_SUBMODULE.

  Run: cd $SELECTED_SUBMODULE && git diff HEAD~1

  Review the changes for:
  1. API integration correctness — are endpoints, methods, and payloads correct?
  2. Type mismatches — do types align between function signatures and usage?
  3. Mock data usage — is mock/hardcoded data left in production code?
  4. Null/undefined issues — are there potential null reference errors?
  5. Route consistency — do routes match expected patterns?
  6. Auth role validation — are permission checks correct (if applicable)?
  7. Code quality — follows existing patterns, no regressions

  Return a short QA report (under 25 lines):
  QA SCORE: X/100
  VERDICT: PASS / WARN / FAIL

  Then list issues found with severity:
  1. [CRITICAL] <description>
  2. [WARNING] <description>
  3. [INFO] <description>'
)
```

**Output example:**
```
AI QA Review ($SELECTED_SUBMODULE):
  QA Score: 85/100
  VERDICT: WARN

  Issues:
  1. [WARNING] New command file references non-existent agent path
  2. [INFO] Consider adding error handling example in bash block

  Summary: Changes are safe to merge with minor improvements suggested.
```

**Gate rule:**
- **FAIL** → Show issues. Ask user if they want to continue or fix first.
- **WARN** → Continue with warnings displayed.
- **PASS** → Proceed to Step 5.

---

## Step 5: Pull Request Creation

Create a PR from the feature branch to `dev` in the submodule's repo.

### 5.1 Create PR

```bash
cd $SELECTED_SUBMODULE

gh pr create \
  --base dev \
  --head "$SUB_BRANCH" \
  --title "<type>(<submodule-name>): <concise description>" \
  --body "$(cat <<'EOF'
## Summary
- <bullet point 1>
- <bullet point 2>
- <bullet point 3>

## Submodule
$SELECTED_SUBMODULE

## QA Report
- **QA Score:** X/100
- **Validation:** X PASS, X WARN, X FAIL
- **AI Review:** VERDICT

### Issues Detected
- <issue 1 or "No issues detected">

## Branch
$SUB_BRANCH → dev

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

cd <repo-root>
```

### 5.2 Verify PR URL (REQUIRED)

```bash
cd $SELECTED_SUBMODULE
PR_URL=$(gh pr view "$SUB_BRANCH" --json url --jq '.url' 2>/dev/null)
if [ -z "$PR_URL" ]; then
  echo "PR creation failed for $SELECTED_SUBMODULE. STOPPING."
  exit 1
fi
echo "PR created: $PR_URL"
cd <repo-root>
```

**STOP immediately if PR creation fails.**

---

## Step 6: User Approval Decision

Use **AskUserQuestion** to present results and ask for explicit approval:

```
PR created successfully for $SELECTED_SUBMODULE.

PR URL: $PR_URL
Branch: $SUB_BRANCH → dev

Validation: X PASS, X WARN, X FAIL
AI QA Score: X/100
AI Verdict: PASS / WARN / FAIL

Issues:
<list detected issues or "No issues detected">

Do you approve validation and want to merge this PR?

A. Approve & Merge to dev
B. Keep PR open (do not merge)
```

### If user selects A (Approve & Merge):

Proceed to Step 7 (Merge Safety).

### If user selects B (Keep PR open):

```
PR stays open at: $PR_URL
You can review and merge manually when ready.
```

STOP — workflow complete without merge.

---

## Step 7: Merge Safety

Before merging, perform safety checks.

### 7.1 Ensure Branch is Up to Date with `dev`

```bash
cd $SELECTED_SUBMODULE

git fetch origin dev
git merge origin/dev --no-edit
```

### 7.2 Detect Merge Conflicts

If merge conflicts occur:

```
Merge conflicts detected in $SELECTED_SUBMODULE.

Conflicting files:
  - <file1>
  - <file2>

Cannot merge automatically. Please resolve conflicts:
  1. Fix the conflicting files
  2. git add <resolved-files>
  3. git commit (to complete the merge)
  4. git push origin $SUB_BRANCH
  5. Re-run /commit-workflow to retry merge
```

**STOP — do not merge if conflicts exist.**

### 7.3 Push Merge Commit (if needed)

```bash
# If merge created a new commit, push it
git push origin "$SUB_BRANCH"
cd <repo-root>
```

### 7.4 Merge the PR

```bash
cd $SELECTED_SUBMODULE

PR_NUMBER=$(gh pr view "$SUB_BRANCH" --json number --jq '.number')
gh pr merge "$PR_NUMBER" --merge --delete-branch

# Verify merge
PR_STATE=$(gh pr view "$PR_NUMBER" --json state --jq '.state')
if [ "$PR_STATE" = "MERGED" ]; then
  echo "PR merged to dev successfully."
fi

cd <repo-root>
```

---

## Step 8: Final Report

After all selected submodules have been processed (or the workflow was stopped early), display an aggregated report.

### Success Report Format (all submodules processed):

```
Workflow Complete

Processed: X of Y submodules

Results:
  1. <submodule_path>
     Branch:     <branch> → dev
     PR:         <PR_URL>
     Validation: X PASS, X WARN, X FAIL
     QA Score:   X/100
     Merge:      Merged to dev / PR open (no merge)

  2. <submodule_path>
     Branch:     <branch> → dev
     PR:         <PR_URL>
     Validation: X PASS, X WARN, X FAIL
     QA Score:   X/100
     Merge:      Merged to dev / PR open (no merge)

Summary:
  PRs created:  X
  PRs merged:   X
  PRs open:     X
  Failures:     X
```

### Partial Failure Report Format:

```
Workflow Complete (with errors)

Processed: X of Y submodules

Results:
  1. <submodule_path>  — Merged to dev (PR: <URL>)
  2. <submodule_path>  — FAILED at Step X (<error>)
  3. <submodule_path>  — Skipped (user chose to stop)

Summary:
  PRs created:  X
  PRs merged:   X
  PRs open:     X
  Failures:     X
  Skipped:      X

Action Required:
  - <submodule>: <what user should do to resolve>
```

### Single Submodule Report Format:

When only one submodule was selected, use the simpler format:

```
Workflow Complete

Submodule:  $SELECTED_SUBMODULE
Branch:     $SUB_BRANCH → dev
PR:         $PR_URL

Validation:
  Build check           — PASS / WARN / FAIL
  Type check            — PASS / WARN / FAIL
  Lint check            — PASS / WARN / FAIL
  Dependency validation — PASS / WARN / FAIL
  Integration check     — PASS / WARN / FAIL
  Total: X PASS, X WARN, X FAIL

AI QA Review:
  Score: X/100
  Verdict: PASS / WARN / FAIL

Merge: Merged to dev / PR open (no merge)
```

---

## Error Handling

### STOP conditions (halt current submodule processing):

- **On protected branch (`main`, `dev`, `master`)** → Ask user to create a feature branch
- **Detached HEAD** → Ask user for branch name
- **No changes in selected submodule** → Inform user, skip this submodule
- **Push fails** → Show error, stop this submodule
- **PR creation fails** → Show error, stop this submodule
- **Merge conflicts detected** → Ask user to resolve, stop this submodule
- **`gh` CLI not authenticated** → Instruct user: `gh auth login`

### Multi-submodule failure handling:

- **Partial failure** → When a submodule fails and others remain, ask user: skip or stop entire workflow
- **Record all results** → Whether success, failure, or skipped, track every submodule's outcome for the final report
- **Never silently skip** → Always inform the user when a submodule is skipped or fails

### NEVER do these:

- Never push directly to `main`, `dev`, or `master`
- Never operate on a submodule the user did not select
- Never merge without explicit user approval
- Never skip validation or QA checks
- Never continue if PR creation fails
- Never suggest "manual PR creation" as an alternative
- Never report "success" if PR was not created
- Never force-merge when conflicts exist
- Never silently skip a failed submodule without informing the user
- Never process submodules the user did not select
- Never change the processing order without user consent
