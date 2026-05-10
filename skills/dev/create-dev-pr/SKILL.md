---
name: create-dev-pr
description: Git and PR workflow automation for creating pull requests to dev branch
---

# Create PR to Dev Branch

Create a Pull Request targeting `origin/dev` branch after completing a bug fix or new feature.

---

## Purpose

This skill automates PR creation when development work is complete. It ensures:
- All changes are properly committed
- PRs target the correct `dev` branch
- PR descriptions include meaningful summaries
- Consistent PR format across the team

---

## When to Use This Skill

Use this skill when:
- You've finished fixing a bug
- You've completed implementing a new feature
- Code is ready for review
- You want to submit changes to the dev branch

**Trigger phrases:**
- "fix completed" / "bug fixed"
- "feature done" / "feature completed"
- "ready for PR" / "create PR to dev"
- "issue resolved" / "submit to dev"

---

## Pre-flight Checks

Before creating a PR, verify:

### 1. Not on Protected Branch
```bash
# Check current branch
git branch --show-current

# Should NOT be: main, master, dev, develop
```

### 2. No Uncommitted Changes
```bash
# Check for uncommitted changes
git status

# If changes exist, commit them first
git add .
git commit -m "Your commit message"
```

### 3. Remote is Configured
```bash
# Verify remote exists
git remote -v

# Should show origin pointing to GitHub
```

---

## PR Creation Workflow

### Step 1: Analyze Changes

```bash
# Get current branch name
git branch --show-current

# View commits since diverging from dev
git log origin/dev..HEAD --oneline

# View changed files
git diff origin/dev --stat
```

### Step 2: Push Branch to Remote

```bash
# Push current branch with upstream tracking
git push -u origin HEAD
```

### Step 3: Create Pull Request

```bash
# Create PR targeting dev branch
gh pr create --base dev --title "PR_TITLE" --body "$(cat <<'EOF'
## Summary
- Brief description of changes
- List key modifications

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Refactoring

## Changes Made
- File/component changes
- API changes (if any)
- Database changes (if any)

## Test Plan
- How changes were tested
- Manual testing steps

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

---
Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR Title Format

Use conventional commit style:

| Type | Description | Example |
|------|-------------|---------|
| `fix:` | Bug fix | `fix: Resolve login redirect loop` |
| `feat:` | New feature | `feat: Add coach dashboard API integration` |
| `refactor:` | Code refactoring | `refactor: Simplify auth token storage` |
| `docs:` | Documentation | `docs: Update API integration guide` |
| `style:` | Styling changes | `style: Update button hover states` |
| `test:` | Test additions | `test: Add E2E tests for login flow` |

### Generate Title from Branch Name

```bash
# Branch: feature/coach-dashboard-api
# Title: feat: Coach dashboard api

# Branch: fix/login-redirect
# Title: fix: Login redirect

# Branch: bugfix/token-storage
# Title: fix: Token storage
```

---

## Quick Reference

### One-liner PR Creation

```bash
# Push and create PR in one command
git push -u origin HEAD && gh pr create --base dev --fill
```

### With Custom Title

```bash
gh pr create --base dev --title "fix: Resolve authentication issue" --body "Fixed token storage in localStorage after login"
```

### Interactive Mode

```bash
# Opens interactive PR creation
gh pr create --base dev
```

---

## After PR Creation

1. **Review the PR URL** - Returned by `gh pr create`
2. **Add reviewers** (optional):
   ```bash
   gh pr edit --add-reviewer username
   ```
3. **Add labels** (optional):
   ```bash
   gh pr edit --add-label "bug,frontend"
   ```

---

## Common Issues

### "No commits between dev and HEAD"
Your branch is already up to date with dev. Make sure you have committed changes.

### "gh: command not found"
Install GitHub CLI:
```bash
brew install gh
gh auth login
```

### "Remote branch already exists"
The branch was already pushed. Just create the PR:
```bash
gh pr create --base dev
```

---

## Related Skills

- **frontend-dev-guidelines** - React/TypeScript best practices
- **backend-dev-guidelines** - NestJS development patterns
