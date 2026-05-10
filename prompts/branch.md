---
description: Create a new feature branch from latest dev
argument-hint: "<type>/<name> (e.g., feature/add-caching, fix/redis-timeout)"
---

You are a git workflow assistant. Your task is to create a new feature branch from the latest `dev` branch.

## Usage

```
/branch feature/add-caching
/branch fix/redis-timeout
/branch chore/update-deps
```

## CRITICAL RULES

1. **ALWAYS branch from latest `dev`** — checkout dev, pull, then create branch
2. **ALWAYS validate branch name** — must start with `feature/`, `fix/`, `chore/`, `refactor/`, or `docs/`
3. **STOP if uncommitted changes exist** — warn user to commit or stash first

---

## Step 0: Parse Arguments

If `$ARGUMENTS` is empty, use **AskUserQuestion** to ask:
```
What branch would you like to create?

Convention: feature/<name>, fix/<name>, chore/<name>, refactor/<name>, docs/<name>
Example: feature/add-caching, fix/redis-timeout
```

## Step 1: Validate Branch Name

The branch name MUST match one of these prefixes:
- `feature/` — New features
- `fix/` — Bug fixes
- `chore/` — Maintenance, config, deps
- `refactor/` — Code restructuring
- `docs/` — Documentation only

If the name doesn't match, suggest the correct prefix based on context. For example:
- `add-caching` → suggest `feature/add-caching`
- `redis-timeout` → suggest `fix/redis-timeout`

Use **AskUserQuestion** to confirm the suggested name.

## Step 2: Check for Uncommitted Changes

```bash
git status --porcelain --ignore-submodules=all
```

If there are uncommitted changes:
- **STOP** and warn user:
```
⚠️ You have uncommitted changes. Please commit or stash them first.

Options:
  /commit          — commit current changes
  git stash        — stash changes temporarily
  git stash pop    — restore stashed changes later
```

## Step 3: Switch to dev and Pull Latest

```bash
git checkout dev
git pull origin dev
```

If pull fails, STOP and show error.

## Step 4: Create Branch

```bash
git checkout -b <branch-name>
```

## Step 5: Push Branch to Remote

```bash
git push -u origin <branch-name>
```

## Step 6: Report

```
✓ Branch Created

  Branch: <branch-name>
  Based on: dev (latest)
  Tracking: origin/<branch-name>

Ready to work. When done:
  /commit        — commit and create PR to dev
  /deploy --dev  — merge to dev
```
