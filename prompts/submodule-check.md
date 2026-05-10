---
description: Check submodule health and sync status
argument-hint: Optional --fix to auto-fix common issues
---

You are a git submodule health check assistant. Your task is to verify all submodules are properly configured and in sync.

## Submodule Architecture

This project uses **local-only submodules** — they exist on your machine but are never pushed to remote:

```
.pi/
├── <tech-stack>/       # Local-only submodule(s) → nestjs, react, etc.
├── agents/             # Project-specific (tracked)
├── skills/             # Project-specific (tracked)
└── settings.json       # Configuration (tracked)
```

Submodule info lives in `.git/config` and `.git/modules/`, NOT in `.gitmodules` (which is excluded via `.git/info/exclude`).

---

## Step 1: Check Submodule Initialization

```bash
git submodule status --recursive
```

**Expected output:**
- Each line should start with a commit hash (not `-` which means uninitialized)
- No error messages

**If uninitialized:**
```bash
git submodule update --init --recursive
```

---

## Step 2: Check Submodule URLs

Verify submodule URLs in `.git/config` (submodules are local-only, no `.gitmodules` tracked):

```bash
# Check registered submodule URLs from .git/config
git config --get-regexp 'submodule\..*\.url' 2>/dev/null || echo "No submodules registered"

# Check actual remotes for each submodule directory
for dir in nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && [ -e "$dir/.git" ]; then
    echo "=== $dir ==="
    cd "$dir" && git remote -v && cd ..
  fi
done

# Verify .gitmodules is NOT accidentally staged
if git diff --cached --name-only 2>/dev/null | grep -q ".gitmodules"; then
  echo "WARNING: .gitmodules is staged! Unstage it: git reset HEAD .gitmodules"
fi
```

**Common issues:**
- URL mismatch between `.git/config` and actual remote
- Submodule directory exists but not registered in `.git/config`

**Fix:** Update the URL in `.git/config`:
```bash
git config submodule.<name>.url <correct-url>
```

---

## Step 3: Check Branch Status

All submodules should be on `main` branch:

```bash
for dir in nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && [ -e "$dir/.git" ]; then
    echo "$dir: $(cd "$dir" && git branch --show-current)"
  fi
done
```

**If detached HEAD:**
```bash
cd <submodule>
git checkout main
cd ..
```

---

## Step 4: Check for Uncommitted Changes

```bash
# Check nested submodules
cd .claude
for dir in */; do
  if [ -e "$dir/.git" ] && [ ! -L "$dir" ]; then
    echo "=== .pi/$dir ==="
    cd "$dir"
    git status --short
    cd ..
  fi
done
cd ..

# Check .claude itself
echo "=== .claude ==="
cd .claude && git status --short && cd ..

# Check parent
echo "=== Parent repo ==="
git status --short
```

**If uncommitted changes exist:** Run `/commit` to commit them properly.

---

## Step 5: Check Sync with Remote

```bash
# Fetch all remotes in submodules
for dir in nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && [ -e "$dir/.git" ]; then
    echo "=== $dir ==="
    cd "$dir"
    git fetch --all 2>/dev/null
    git log HEAD..origin/main --oneline 2>/dev/null || echo "  (no remote tracking)"
    cd ..
  fi
done
```

**If behind:** Run `/pull` to update.

---

## Step 6: Report Results

Generate a health report:

```
=== Submodule Health Check (Local-Only) ===

Initialization:
  ✓ All local submodules initialized

URLs (from .git/config):
  ✓ nestjs -> https://github.com/potentialInc/claude-nestjs.git
  ✓ react  -> https://github.com/potentialInc/claude-react.git

Branches:
  ✓ nestjs on main
  ✓ react on main

Uncommitted Changes:
  ✓ No uncommitted changes in submodules

Sync Status:
  ✓ All submodules up to date
  OR
  ⚠ nestjs is 3 commits behind origin/main

Safety:
  ✓ .gitmodules is NOT staged (local-only)
  ✓ Submodule paths excluded via .git/info/exclude

Overall: ✓ Healthy / ⚠ Issues Found
```

---

## Auto-Fix Mode

If `$ARGUMENTS` contains `--fix`, attempt to fix common issues:

1. **Uninitialized submodules:** `git submodule update --init --recursive`
2. **URL mismatch:** `git config submodule.<name>.url <correct-url>`
3. **Detached HEAD:** `git checkout main` in each submodule
4. **Behind remote:** `git pull origin main` in each submodule
5. **Accidentally staged .gitmodules:** `git reset HEAD .gitmodules`

**Note:** Auto-fix will NOT commit uncommitted changes. Use `/commit` for that.

---

## Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Uninitialized | `-` prefix in status | `git submodule update --init --recursive` |
| Wrong URL | Clone fails | `git config submodule.<name>.url <correct-url>` |
| Detached HEAD | "(HEAD detached)" | `git checkout main` in submodule |
| Behind remote | "Your branch is behind" | `git submodule update --remote` or `/pull` |
| Ahead of remote | "Your branch is ahead" | `cd <submodule> && git push` |
| Uncommitted changes | "modified content" | Commit inside the submodule directory |
| .gitmodules staged | Shows in `git status` | `git reset HEAD .gitmodules` |
