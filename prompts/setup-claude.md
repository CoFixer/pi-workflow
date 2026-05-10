---
description: Interactively manage framework-specific Claude configurations as git submodules — add new ones, keep or remove existing ones
argument-hint: Select frameworks via checkbox prompt
---

# setup-claude

Interactively manage framework and department-specific Claude configurations (Django, NestJS, React, React Native, Marketing, Operations, Content) as git submodules. Supports both adding new configurations and removing ones you no longer need.

**Related**: `/init-claude-config` (new project) | `/migrate-submodules` (batch with flags) | `/submodule-check` (validate health)

---

## Execution Plan

```
Step 0   → Validate prerequisites (git, directory, network, branch, working tree)
Step 1   → Detect currently installed submodules under .claude
Step 1.5 → Auto-detect tech stack from project CLAUDE.md (skip to Step 3 if user accepts)
Step 2   → Present unified selection (installed pre-checked, available unchecked)
Step 3   → Compute diff: TO_ADD, TO_KEEP, TO_REMOVE
Step 4   → Confirm removals (base requires double-confirmation)
Step 5a  → Execute additions (local-submodule-add.sh)
Step 5b  → Execute removals (safe deinit sequence)
Step 6   → Sync stack-config.json
Step 7   → Update .gitignore (additions only)
Step 8   → Validate symlinks and repair broken ones
Step 9   → Post-operation validation
Step 10  → Report results
```

---

## Instructions

### Step 0: Validate Prerequisites

Run all checks before proceeding:

#### 0.1 — Core Checks

| Check | Command | On Failure |
|-------|---------|------------|
| Git repo | `git rev-parse --git-dir` | `❌ ERROR: Not in a git repository. Run 'git init' or navigate to your project.` |
| Directory | `pwd && basename "$(pwd)"` | If in project root with `.pi/` subdirectory: `cd .claude`. If neither `.pi/` dir: `⚠️ Navigate to your project's .claude directory first.` |
| Network | `git ls-remote https://github.com/CoFixer/claude-django.git HEAD` | `⚠️ Cannot access GitHub repos (network/auth issue). Continue anyway?` — ask user to confirm. |

#### 0.2 — Working Directory Safety Check

```bash
# Abort if working directory is not clean
DIRTY=$(git status --porcelain 2>/dev/null)
if [ -n "$DIRTY" ]; then
  echo "❌ ERROR: Your working directory has uncommitted changes."
  echo ""
  echo "   Modified files:"
  git status --short
  echo ""
  echo "   Please commit or stash your changes before running /setup-claude."
  echo "   → git stash        (to stash temporarily)"
  echo "   → git commit -am   (to commit changes)"
  exit 1
fi
```

#### 0.3 — Branch Safety Check

```bash
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
```

If `$CURRENT_BRANCH` is `main` or `dev`, use **AskUserQuestion** before continuing:

```
⚠️ You are on branch '{CURRENT_BRANCH}'.

Modifying submodules on this branch can affect shared state.
Do you want to continue?
```

Options: `"Yes, continue on {CURRENT_BRANCH}"` | `"No, let me switch branches first"`

If user selects No: exit with `ℹ️ Aborted. Create a feature branch first: git checkout -b feature/setup-claude`

---

### Step 1: Detect Installed Submodules

Detect which framework submodules are currently installed under `.pi/`:

```bash
# Method 1: Check .git/config for registered submodule URLs
# (local-only submodules are stored here, not in .gitmodules)
INSTALLED_FROM_CONFIG=$(git config --get-regexp 'submodule\..*\.url' 2>/dev/null \
  | sed 's/submodule\.\(.*\)\.url.*/\1/' \
  | grep -v '^\.' )

# Method 2: Check directory presence with .git marker
# (covers submodules and standard checkouts)
INSTALLED_DIRS=()
for dir in base django nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && ([ -f "$dir/.git" ] || [ -d "$dir/.git" ]); then
    INSTALLED_DIRS+=("$dir")
  fi
done

# Merge both sources, deduplicate
INSTALLED=( $(echo "${INSTALLED_FROM_CONFIG[@]} ${INSTALLED_DIRS[@]}" | tr ' ' '\n' | sort -u) )
```

Build display state for each known submodule:

| Submodule | Status |
|-----------|--------|
| `base` | `[INSTALLED]` or `[NOT INSTALLED]` |
| `django` | `[INSTALLED]` or `[NOT INSTALLED]` |
| `nestjs` | … |
| `react` | … |
| `react-native` | … |
| `marketing` | … |
| `operations` | … |
| `content` | … |

If `INSTALLED` is empty (fresh project with nothing installed), skip to **Step 1.5** in "add-only" mode.

---

### Step 1.5: Auto-detect Tech Stack from CLAUDE.md

Check if the project already has a `CLAUDE.md` with a defined tech stack. If so, offer the detected stack as a one-click option to skip the manual 3-question selection.

#### 1.5.1 — Detect CLAUDE.md

```bash
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
CLAUDE_MD="$PROJECT_ROOT/CLAUDE.md"
```

If `CLAUDE_MD` does not exist → skip to **Step 2**.

#### 1.5.2 — Parse Tech Stack Section

Extract the `## Tech Stack` section and detect framework names:

```bash
DETECTED_STACKS=()

if [ -f "$CLAUDE_MD" ]; then
  # Extract content between "## Tech Stack" and the next "##" heading
  TECH_SECTION=$(sed -n '/^## Tech Stack/,/^## /p' "$CLAUDE_MD" | head -n -1)

  if [ -n "$TECH_SECTION" ]; then
    # Check for framework names (case-insensitive)
    echo "$TECH_SECTION" | grep -qi "nestjs"        && DETECTED_STACKS+=("nestjs")
    echo "$TECH_SECTION" | grep -qi "django"        && DETECTED_STACKS+=("django")
    # Check "React Native" BEFORE bare "React" to avoid false positives
    echo "$TECH_SECTION" | grep -qi "react native"  && DETECTED_STACKS+=("react-native")
    # Match "React" only on lines that DON'T mention "React Native"
    echo "$TECH_SECTION" | grep -i "react" | grep -qvi "react native" && DETECTED_STACKS+=("react")
  fi
fi
```

**Name mapping** (detected → submodule directory):

| Detected | Directory |
|----------|-----------|
| NestJS | `nestjs` |
| Django | `django` |
| React Native | `react-native` |
| React | `react` |

> **Note**: Department submodules (marketing, operations, content) are NOT auto-detected from CLAUDE.md — they are organizational, not technical. The user can add them via the "Custom" path.

#### 1.5.3 — Present Choice

If `DETECTED_STACKS` is **non-empty**, use **AskUserQuestion**:

```
Your project's CLAUDE.md has a defined tech stack:

  {for each in DETECTED_STACKS}
  • {item}

Would you like to use this detected stack or customize your selection?
```

Options:
- `"Use existing tech stack ({e.g., NestJS + React Native + React})"` → Sets `DESIRED=("${DETECTED_STACKS[@]}")` and **skips Step 2 entirely** — proceeds directly to Step 3 (Compute Diff).
- `"Custom"` → Falls through to Step 2 (normal 3-question selection).

If `DETECTED_STACKS` is **empty** (no `## Tech Stack` section found, or no known frameworks detected) → skip to **Step 2** silently.

---

### Step 2: Unified Framework Selection

> **Note**: This step is skipped if the user chose "Use existing tech stack" in Step 1.5. In that case, `DESIRED` is already populated and execution continues at Step 3.

Present **all three questions in a single AskUserQuestion call**. Pre-check options that match `INSTALLED` array. The label format for installed items should include `(installed)` in the description.

```json
{
  "questions": [
    {
      "question": "Which backend framework configurations would you like to keep or add?",
      "header": "Backend",
      "multiSelect": true,
      "options": [
        {
          "label": "Django",
          "description": "Python backend — DRF, SimpleJWT, pytest-django patterns [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "NestJS",
          "description": "TypeScript backend — Controllers, Services, TypeORM, Swagger patterns [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "Skip",
          "description": "No backend framework (will REMOVE any installed backend submodules)"
        }
      ]
    },
    {
      "question": "Which frontend/mobile framework configurations would you like to keep or add?",
      "header": "Frontend",
      "multiSelect": true,
      "options": [
        {
          "label": "React",
          "description": "Web frontend — React 19, TailwindCSS, shadcn/ui, Playwright testing [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "React Native",
          "description": "Mobile — NativeWind, React Navigation, Detox testing [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "Skip",
          "description": "No frontend framework (will REMOVE any installed frontend submodules)"
        }
      ]
    },
    {
      "question": "Which department-specific Claude configurations would you like to keep or add?",
      "header": "Departments",
      "multiSelect": true,
      "options": [
        {
          "label": "Marketing",
          "description": "CRO, copywriting, SEO, analytics, campaign optimization [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "Operations",
          "description": "Process automation, documentation, project management [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "Content",
          "description": "Blog posts, guides, educational content, video scripts [INSTALLED if in INSTALLED array]"
        },
        {
          "label": "None",
          "description": "No department configurations (will REMOVE any installed department submodules)"
        }
      ]
    }
  ]
}
```

> **Note**: `base` is never presented for removal in this selection. It is core infrastructure. See Step 4.1 for the special `base` removal flow.

#### Process Selections

**Name mapping** (case-insensitive):

| Selection | Directory |
|-----------|-----------|
| Django | `django` |
| NestJS | `nestjs` |
| React | `react` |
| React Native | `react-native` |
| Marketing | `marketing` |
| Operations | `operations` |
| Content | `content` |

Filter out "Skip", "None", "Other", empty values. Merge all three answers into `DESIRED` array.

**If no valid selections remain** and `INSTALLED` is empty:
`ℹ️ No configurations selected. Run /setup-claude or /migrate-submodules later.` → exit.

---

### Step 3: Compute Diff

Compute three sets from `INSTALLED` vs `DESIRED`:

```bash
# Frameworks user wants but doesn't have yet → ADD
TO_ADD=()
for item in "${DESIRED[@]}"; do
  if [[ ! " ${INSTALLED[*]} " =~ " ${item} " ]]; then
    TO_ADD+=("$item")
  fi
done

# Frameworks user has and wants to keep → no action
TO_KEEP=()
for item in "${DESIRED[@]}"; do
  if [[ " ${INSTALLED[*]} " =~ " ${item} " ]]; then
    TO_KEEP+=("$item")
  fi
done

# Frameworks user has but did NOT select → REMOVE
# Note: 'base' is excluded from automatic removal here — handled separately in Step 4.1
TO_REMOVE=()
for item in "${INSTALLED[@]}"; do
  if [[ "$item" == "base" ]]; then continue; fi
  if [[ ! " ${DESIRED[*]} " =~ " ${item} " ]]; then
    TO_REMOVE+=("$item")
  fi
done
```

If `TO_ADD` and `TO_REMOVE` are both empty: show current state → suggest `/submodule-check` → exit.

---

### Step 4: Confirm Removals

#### 4.1 — Special: base Submodule Protection

> `base` is never in `TO_REMOVE` from the diff. It requires a separate explicit flow.

If the user did NOT select any items AND `base` is installed, show this check via **AskUserQuestion**:

```
⚠️  WARNING: base is the core infrastructure submodule.

    It provides 14 symlinks used by the entire .claude system:
    agents, commands, docs, guides, hooks, memory, monitoring,
    orchestration, presentations, react-native, scripts, skills,
    templates, brand

    Removing base will BREAK your entire .claude configuration.

    Do you want to remove base?
```

Options:
- `"No, keep base (Recommended)"` → keep `base`, do not add to `TO_REMOVE`
- `"Yes, remove base (DANGEROUS)"` → trigger double confirmation (AskUserQuestion):

  ```
  ⚠️  FINAL WARNING: Removing base is irreversible without re-running /init-claude-config.
      All 14 symlinks and all skill/command/agent definitions will be lost.

      Are you absolutely certain?
  ```

  Options: `"Cancel (keep base)"` | `"Remove base permanently"`

  Only if user confirms twice: append `base` to `TO_REMOVE`.

#### 4.2 — Standard Removal Confirmation

If `TO_REMOVE` is non-empty, use **AskUserQuestion**:

```
The following submodules will be permanently removed from your local .claude setup:

  {for each in TO_REMOVE}
  - {item}/  →  https://github.com/CoFixer/claude-{item}.git

This removes all skill definitions, commands, guides, and configurations for these stacks.
Data is not lost from GitHub — you can re-add them later with /setup-claude.

Confirm removal?
```

Options: `"Yes, remove {count} submodule(s)"` | `"Cancel, keep everything"`

If user cancels: clear `TO_REMOVE`, continue with additions only.

---

### Step 5a: Execute Additions

For each item in `TO_ADD`, add sequentially as a proper committed submodule:

```bash
ADDED=()
FAILED=()

for FRAMEWORK in "${TO_ADD[@]}"; do
  REPO_URL="https://github.com/CoFixer/claude-${FRAMEWORK}.git"
  echo "Adding ${FRAMEWORK}..."

  git submodule add --branch dev "$REPO_URL" "$FRAMEWORK"
  if [ $? -eq 0 ]; then
    echo "✓ ${FRAMEWORK} added"
    ADDED+=("${FRAMEWORK}")
  else
    echo "✗ ${FRAMEWORK} failed"
    FAILED+=("${FRAMEWORK}")
    # Cleanup partial add
    git submodule deinit -f "${FRAMEWORK}" 2>/dev/null
    rm -rf ".git/modules/${FRAMEWORK}" 2>/dev/null
    rm -rf "${FRAMEWORK}" 2>/dev/null
    git config --remove-section "submodule.${FRAMEWORK}" 2>/dev/null
    git rm --cached "${FRAMEWORK}" 2>/dev/null || true
  fi
done

# Initialize all added submodules
if [ ${#ADDED[@]} -gt 0 ]; then
  git submodule update --init --recursive
  # Stage .gitmodules and new submodule gitlinks for commit
  git add .gitmodules "${ADDED[@]}"
fi
```

---

### Step 5b: Execute Removals

## Submodule Removal Strategy

For each item in `TO_REMOVE`, execute this **exact sequence**. The order is critical — deinit before directory removal, config cleanup after.

```bash
REMOVED=()
REMOVE_FAILED=()

for FRAMEWORK in "${TO_REMOVE[@]}"; do
  echo "Removing ${FRAMEWORK}..."

  # ── Git Command Sequence ──────────────────────────────────────────────────

  # 1. Deinitialize: clears the submodule's working tree and marks it inactive
  #    -f forces even if working tree has modifications
  git submodule deinit -f "${FRAMEWORK}" 2>/dev/null || true

  # 2. Remove cached git modules data
  rm -rf ".git/modules/${FRAMEWORK}"

  # 3. Remove the actual directory
  rm -rf "${FRAMEWORK}"

  # 4. Remove from .git/config (local submodule registration)
  git config --remove-section "submodule.${FRAMEWORK}" 2>/dev/null || true

  # 5. Remove from .gitmodules and stage the change
  if [ -f ".gitmodules" ]; then
    git config -f .gitmodules --remove-section "submodule.${FRAMEWORK}" 2>/dev/null || true
    # If .gitmodules is now empty, remove it entirely
    if [ ! -s ".gitmodules" ] || ! grep -q "\[submodule" ".gitmodules" 2>/dev/null; then
      rm -f ".gitmodules"
    fi
    git add .gitmodules 2>/dev/null || true
  fi

  # 6. Remove framework-specific .gitignore patterns
  if [ -f ".gitignore" ]; then
    # Remove lines that start with the framework prefix
    grep -v "^${FRAMEWORK}/" ".gitignore" > ".gitignore.tmp" && \
      mv ".gitignore.tmp" ".gitignore"
  fi

  # ── Verify removal succeeded ──────────────────────────────────────────────
  if [ ! -d "${FRAMEWORK}" ] && \
     ! git config --get "submodule.${FRAMEWORK}.url" >/dev/null 2>&1; then
    echo "  ✓ ${FRAMEWORK} removed cleanly"
    REMOVED+=("${FRAMEWORK}")
  else
    echo "  ✗ ${FRAMEWORK} removal incomplete — manual cleanup may be needed"
    REMOVE_FAILED+=("${FRAMEWORK}")
  fi
done
```

> **Scope enforcement**: This sequence only runs on paths within `.pi/`. Paths containing `../` or starting with `/` are rejected before execution.

---

### Step 6: Sync stack-config.json

After all additions and removals, update `stack-config.json` to reflect the actual installed state:

```bash
# Compute final installed list
FINAL_INSTALLED=()
for dir in base django nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && ([ -f "$dir/.git" ] || [ -d "$dir/.git" ]); then
    FINAL_INSTALLED+=("$dir")
  fi
done

# Build JSON array string
STACKS_JSON=$(printf '"%s",' "${FINAL_INSTALLED[@]}" | sed 's/,$//')

# Update stack-config.json using python3 (available on macOS by default)
python3 - <<PYEOF
import json

config_path = "stack-config.json"

try:
    with open(config_path, "r") as f:
        config = json.load(f)
except FileNotFoundError:
    config = {"version": "2.0", "description": "Stack and module configuration for selective loading"}

config["enabledStacks"] = [s for s in ["base", "django", "nestjs", "react", "react-native", "marketing", "operations", "content"] if __import__("os").path.isdir(s) and (__import__("os").path.isfile(s + "/.git") or __import__("os").path.isdir(s + "/.git"))]

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)
    f.write("\n")

print("  ✓ stack-config.json updated: enabledStacks =", config["enabledStacks"])
PYEOF
```

---

### Step 6.5: Commit Submodule Changes

After all additions and removals, commit the staged changes (`.gitmodules` + gitlinks) so the submodule registrations are persisted in the repo:

```bash
CHANGES=$(git diff --cached --name-only)
if [ -n "$CHANGES" ]; then
  git commit -m "chore: update claude framework submodules

Added: ${ADDED[*]:-none}
Removed: ${REMOVED[*]:-none}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  echo "  ✓ Submodule changes committed"
fi
```

---

### Step 7: Update .gitignore (Additions Only)

For each successfully **added** config, append framework-specific patterns (skip if already present):

| Config | Patterns |
|--------|----------|
| nestjs | `nestjs/node_modules/`, `nestjs/dist/`, `nestjs/.env`, `nestjs/.env.local`, `nestjs/package-lock.json` |
| react | `react/node_modules/`, `react/build/`, `react/.next/`, `react/dist/`, `react/.env.local`, `react/package-lock.json` |
| react-native | `react-native/node_modules/`, `react-native/.expo/`, `react-native/android/app/build/`, `react-native/ios/Pods/`, `react-native/.env` |
| django | `django/__pycache__/`, `django/.venv/`, `django/venv/`, `django/*.egg-info/`, `django/.env`, `django/db.sqlite3` |
| marketing | `marketing/node_modules/`, `marketing/.env` |
| operations | `operations/node_modules/`, `operations/.env` |
| content | `content/node_modules/`, `content/.env`, `content/dist/`, `content/build/`, `content/*.log` |

Use `grep -qF` to skip existing patterns, append missing ones.

---

### Step 8: Symlink Validation and Repair

After all removals, scan `.pi/` for broken symlinks:

```bash
echo ""
echo "── Validating symlinks ──────────────────────────────────────────────────"

BROKEN_SYMLINKS=()
find . -maxdepth 1 -type l | while read -r symlink; do
  target=$(readlink "$symlink")
  if [ ! -e "$target" ]; then
    BROKEN_SYMLINKS+=("$symlink")
    echo "  ⚠️  BROKEN: $symlink → $target (target missing)"
  fi
done

if [ ${#BROKEN_SYMLINKS[@]} -eq 0 ]; then
  echo "  ✓ All symlinks intact"
fi
```

#### Repair Strategy

**If `base` was removed** (in `REMOVED`) and broken symlinks exist:

```bash
# All 14 base/* symlinks are now dangling — remove them
BASE_SYMLINKS=(agents brand commands docs guides hooks memory monitoring orchestration presentations react-native scripts skills templates)

echo ""
echo "  base was removed — cleaning up its 14 symlinks..."
for link in "${BASE_SYMLINKS[@]}"; do
  if [ -L "$link" ]; then
    rm "$link"
    echo "  ✓ Removed broken symlink: $link → base/$link"
  fi
done
```

**If a non-base submodule was removed** and a broken symlink points to it:

```bash
# Check if any symlink target starts with the removed framework name
for FRAMEWORK in "${REMOVED[@]}"; do
  find . -maxdepth 1 -type l | while read -r symlink; do
    target=$(readlink "$symlink")
    if [[ "$target" == "${FRAMEWORK}/"* ]] && [ ! -e "$target" ]; then
      rm "$symlink"
      echo "  ✓ Removed broken symlink: $symlink → $target"
    fi
  done
done
```

**If a symlink is broken but NOT related to any removed submodule**:

```bash
echo "  ⚠️  Unrelated broken symlink detected: $symlink → $target"
echo "     This may be a pre-existing issue. Run /submodule-check for details."
```

---

### Step 9: Post-Operation Validation

## Validation Checklist

Run after all changes:

```bash
echo ""
echo "── Post-operation validation ─────────────────────────────────────────────"

VALIDATION_PASSED=true

# ✅ 1. Verify remaining submodules are initialized
echo "Checking submodule initialization..."
git submodule status 2>/dev/null | while read -r line; do
  # Lines starting with '-' are uninitialized
  if [[ "$line" == -* ]]; then
    path=$(echo "$line" | awk '{print $2}')
    echo "  ⚠️  Uninitialized submodule: $path"
    echo "     → Run: git submodule update --init $path"
    VALIDATION_PASSED=false
  else
    path=$(echo "$line" | awk '{print $2}')
    echo "  ✓ Initialized: $path"
  fi
done

# ✅ 2. Check for detached HEAD states in remaining submodules
echo ""
echo "Checking for detached HEAD states..."
for dir in "${TO_KEEP[@]}" "${ADDED[@]}"; do
  if [ -d "$dir" ]; then
    branch=$(git -C "$dir" branch --show-current 2>/dev/null)
    if [ -z "$branch" ]; then
      echo "  ⚠️  $dir is in detached HEAD state"
      echo "     → Run: git -C $dir checkout main"
    else
      echo "  ✓ $dir on branch: $branch"
    fi
  fi
done

# ✅ 3. Confirm .gitmodules consistency
echo ""
echo "Checking .gitmodules consistency..."
if [ -f ".gitmodules" ]; then
  GITMODULES_ENTRIES=$(git config -f .gitmodules --list 2>/dev/null | grep "submodule\." | sed 's/submodule\.\([^.]*\)\..*/\1/' | sort -u)
  for entry in $GITMODULES_ENTRIES; do
    if [ ! -d "$entry" ]; then
      echo "  ⚠️  .gitmodules references $entry/ but directory is missing"
    else
      echo "  ✓ .gitmodules entry valid: $entry"
    fi
  done
else
  echo "  ✓ No .gitmodules file (local-only submodules use .git/config)"
fi

# ✅ 4. Confirm no orphan entries in .git/config
echo ""
echo "Checking .git/config for orphan entries..."
git config --get-regexp 'submodule\..*\.url' 2>/dev/null | while read -r key url; do
  # Extract path: submodule.<path>.url
  path=$(echo "$key" | sed 's/submodule\.\(.*\)\.url/\1/')
  if [ ! -d "$path" ]; then
    echo "  ⚠️  Orphan config entry: $path (directory missing)"
    echo "     → Run: git config --remove-section submodule.$path"
  else
    echo "  ✓ Config entry valid: $path → $url"
  fi
done

# ✅ 5. Confirm no broken symlinks remain
echo ""
echo "Final symlink check..."
REMAINING_BROKEN=$(find . -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null)
if [ -z "$REMAINING_BROKEN" ]; then
  echo "  ✓ No broken symlinks"
else
  echo "  ⚠️  Remaining broken symlinks:"
  echo "$REMAINING_BROKEN" | while read -r link; do
    echo "     $link → $(readlink $link)"
  done
fi

# ✅ 6. Confirm stack-config.json matches reality
echo ""
echo "Checking stack-config.json consistency..."
if [ -f "stack-config.json" ]; then
  python3 -c "
import json, os
with open('stack-config.json') as f:
    cfg = json.load(f)
stacks = cfg.get('enabledStacks', [])
for s in stacks:
    exists = os.path.isdir(s) and (os.path.isfile(s+'/.git') or os.path.isdir(s+'/.git'))
    status = '✓' if exists else '⚠️ '
    label = 'directory found' if exists else 'MISSING — stack-config.json may be stale'
    print(f'  {status} {s}: {label}')
"
fi
```

---

### Step 10: Report Results

Display a comprehensive summary:

```
═══════════════════════════════════════════════════════════
  Claude Framework Setup — Results
═══════════════════════════════════════════════════════════

✓ Prerequisites passed (clean working tree, branch: {BRANCH})

Changes Made:
  Added ({count}):
    ✓ django    →  https://github.com/CoFixer/claude-django.git
    ✓ nestjs    →  https://github.com/CoFixer/claude-nestjs.git

  Kept ({count}):
    ─ react     (already installed, no changes)
    ─ base      (core infrastructure, always kept)

  Removed ({count}):
    ✓ marketing →  local copy deleted, config cleaned
    ✓ content   →  local copy deleted, config cleaned

  Failed ({count}):
    ✗ react-native  →  Could not add (network error)

stack-config.json updated:
  enabledStacks: ["base", "react", "django", "nestjs"]

Symlinks: ✓ All symlinks valid  (or list of repaired/removed ones)

Validation: ✓ All checks passed  (or list of warnings)

───────────────────────────────────────────────────────────
Next Steps:
  1. Validate health:         /submodule-check
  2. Explore new skills:      ls -la nestjs/skills/
  3. Update to latest:        git submodule update --remote
  4. Re-run this command:     /setup-claude   (to add/remove more)
═══════════════════════════════════════════════════════════
```

**If failures occurred**, also show:

```
Failed Additions ({count}):
  - react-native  →  Repository not accessible or network timeout

  Possible causes: network issues, auth required (gh auth login), repo not found.
  Retry: bash scripts/local-submodule-add.sh <URL> <path>

Failed Removals ({count}):
  - <name>  →  Partial removal — check .git/config manually
  Run: git config --remove-section submodule.<name>
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Removing `base` breaks all 14 symlinks | High (if user confirms) | Critical | Double-confirmation gate + automatic symlink cleanup |
| Dirty working tree causes unexpected state | Medium | High | Pre-flight abort if `git status --porcelain` is non-empty |
| Partial removal leaves orphan `.git/config` entry | Low | Medium | Verification step after removal + validation report |
| Removal on `main`/`dev` affects shared state | Medium | Medium | Branch safety check with explicit user approval |
| Network failure during additions | Medium | Low | Per-framework error isolation + cleanup of partial adds |
| `.gitmodules` consistency drift | Low | Low | Step 9 validation compares file vs filesystem |
| Non-`.pi/` submodule accidentally removed | Very Low | Critical | Scope guard: only paths in known framework list are processed |

---

## Backward Compatibility Confirmation

| Behavior | Status |
|---------|--------|
| "Add only" flow (no submodules installed yet) | ✅ Preserved — `TO_REMOVE` is empty, only additions run |
| Existing installed submodules not in selection → removed | ✅ New behavior — explicit user confirmation required |
| `base` cannot be removed without double confirmation | ✅ Protected — never in auto-removal list |
| Submodule changes committed to repo | ✅ Additions/removals auto-committed in Step 6.5 |
| `stack-config.json` kept in sync | ✅ New — updated after every operation |
| Status tracking and memory behavior | ✅ Unaffected — stored in `base/memory/`, only removed if `base` removed |
| `/submodule-check`, `/migrate-submodules` compatibility | ✅ Both commands read from `git config` and filesystem — will reflect new state |
| `.gitignore` update for new additions | ✅ Preserved in Step 7 |
| `git submodule update --remote` still works | ✅ Local-only pattern unchanged — config remains in `.git/config` |
| No CLAUDE.md in project → normal 3-question flow | ✅ Preserved — Step 1.5 is skipped entirely |
| CLAUDE.md without Tech Stack section → normal flow | ✅ Preserved — detection yields empty array, step skipped |
| User selects "Custom" after detection → normal flow | ✅ Preserved — falls through to Step 2 unchanged |

---

## Reference

### Configuration Details

| Config | Repository | Contents |
|--------|-----------|----------|
| base | `CoFixer/claude-base` | Core infrastructure — all symlinks, shared commands, skills, agents |
| Django | `CoFixer/claude-django` | DRF, pytest-django, SimpleJWT, serializers, ViewSets |
| NestJS | `CoFixer/claude-nestjs` | TypeORM, Swagger, controllers, services, DTOs |
| React | `CoFixer/claude-react` | React 19, TailwindCSS 4, shadcn/ui, Playwright |
| React Native | `CoFixer/claude-react-native` | NativeWind, React Navigation, Detox |
| Marketing | `CoFixer/claude-marketing` | CRO, copywriting, SEO, analytics, A/B testing |
| Operations | `CoFixer/claude-operations` | Process automation, workflow docs, project management |
| Content | `CoFixer/claude-content` | Blog posts, guides, video scripts, content strategy |

### Removal Command Reference

```bash
# Manual removal of a single local-only submodule
FRAMEWORK="django"
git submodule deinit -f "$FRAMEWORK"            # Step 1: deinit
rm -rf ".git/modules/$FRAMEWORK"                 # Step 2: clear modules cache
rm -rf "$FRAMEWORK"                              # Step 3: remove directory
git config --remove-section "submodule.$FRAMEWORK"  # Step 4: clear .git/config
git config -f .gitmodules --remove-section "submodule.$FRAMEWORK" 2>/dev/null || true  # Step 5: clear local .gitmodules
grep -v "^$FRAMEWORK$" .git/info/exclude > .git/info/exclude.tmp && mv .git/info/exclude.tmp .git/info/exclude  # Step 6: clean exclude
```

### Error Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `Working directory has uncommitted changes` | Dirty repo | `git stash` or `git commit -am` |
| `Not a git repository` | Outside git repo | `git init` or navigate to repo |
| `Not in .claude directory` | Wrong location | `cd .pi/` |
| Network timeout | No internet / GitHub down | Retry later |
| Permission denied | No GitHub access | `gh auth login` or check SSH keys |
| Submodule already exists | Previously added | Skipped automatically |
| Repository not found | URL incorrect or deleted | Verify repo on GitHub |
| Destination path exists | Dir exists but not submodule | `rm -rf <dir>` then re-add |
| Empty submodule | Not initialized | `git submodule update --init --recursive` |
| Orphan .git/config entry | Incomplete previous removal | `git config --remove-section submodule.<name>` |
| Broken symlinks after removal | `base` or symlink source removed | Automatic cleanup in Step 8 |

### Quick Commands

```bash
git submodule status                              # Check all submodule states
git submodule update --remote                     # Update all to latest remote
git submodule update --remote django              # Update specific one
git config --get-regexp 'submodule\..*\.url'      # List all registered URLs
find . -maxdepth 1 -type l ! -exec test -e {} \; -print  # Find broken symlinks
cat stack-config.json | python3 -m json.tool      # View current stack config
```

### Rollback

If a removal goes wrong and you need to re-add a submodule:

```bash
# Re-add removed submodule (runs local-only add)
bash scripts/local-submodule-add.sh https://github.com/CoFixer/claude-<name>.git <name>
git submodule update --init --recursive <name>

# Or re-run the full setup
/setup-claude
```

---

## Examples

### Example 1: Full Stack Setup (Fresh Install)

1. Run `/setup-claude` (nothing installed)
2. Backend: ✓ NestJS | Frontend: ✓ React | Departments: ✓ None
3. Result: `.pi/nestjs/` and `.pi/react/` added

### Example 2: Remove a Framework

1. Run `/setup-claude` (django, react installed)
2. Backend: ✓ Skip | Frontend: ✓ React | Departments: ✓ None
3. Diff: `TO_REMOVE=[django]`, `TO_KEEP=[react]`
4. Confirm: "Remove 1 submodule (django)?" → Yes
5. Result: `django/` cleanly removed, `stack-config.json` updated

### Example 3: Swap Frameworks

1. Run `/setup-claude` (nestjs installed)
2. Backend: ✓ Django (not nestjs) | Frontend: ✓ Skip | Departments: ✓ None
3. Diff: `TO_ADD=[django]`, `TO_REMOVE=[nestjs]`
4. Confirm removals → proceed
5. Result: `nestjs/` removed, `django/` added

### Example 4: Attempting to Remove base

1. Run `/setup-claude` (base, react installed)
2. User selects nothing in all 3 questions
3. System triggers `base` protection warning → first confirmation
4. User clicks "Yes, remove base (DANGEROUS)" → second confirmation
5. User clicks "Cancel (keep base)" → base is preserved
6. Result: No changes (nothing else was selected or deselected)

### Example 5: Department Only (Skip Frameworks)

1. Run `/setup-claude`
2. Backend: ✓ Skip | Frontend: ✓ Skip | Departments: ✓ Marketing, ✓ Content
3. Result: `.pi/marketing/` and `.pi/content/` added

### Example 6: Auto-detect from CLAUDE.md

1. Run `/setup-claude` (nothing installed)
2. Step 1.5 detects CLAUDE.md with Tech Stack: NestJS, React Native, React
3. Prompt: "Use existing tech stack (NestJS + React Native + React)" or "Custom"
4. User picks "Use existing tech stack" → `DESIRED=[nestjs, react-native, react]`
5. Step 2 is skipped, proceeds directly to Step 3
6. Diff: `TO_ADD=[nestjs, react-native, react]`, `TO_REMOVE=[]`
7. Result: 3 submodules added without answering 3 separate questions

### Example 7: Auto-detect with Custom Override

1. Run `/setup-claude` (nothing installed)
2. Step 1.5 detects CLAUDE.md with Tech Stack: NestJS, React Native, React
3. User picks "Custom" → falls through to Step 2
4. User manually selects: Backend: ✓ NestJS | Frontend: ✓ React Native | Departments: ✓ Marketing
5. Result: 3 submodules added (nestjs, react-native, marketing) — user chose to skip React and add Marketing

---

**Best Practices**: Run in `.pi/` dir → validate with `/submodule-check` → update periodically with `git submodule update --remote`

**See Also**: `/migrate-submodules` | `/init-claude-config` | `/submodule-check`
