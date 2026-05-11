# Claude Commit Workflow Guide

This guide explains how to use Claude to commit code and create pull requests.

---

## Quick Start

Simply tell Claude:

```
/commit
```

or

```
Please commit my changes
```

Claude will commit to your **current branch** and create a PR to `dev`.

---

## How It Works

### The Workflow

1. **You make code changes** in any project folder
2. **Ensure you're on your personal branch** (e.g., `siam`, `john`)
3. **Run `/commit`** or ask Claude to commit
4. **Claude validates your branch** - must not be `main` or `dev`
5. **Claude commits and pushes** to your current branch
6. **Claude creates a PR** targeting `dev`
7. **You receive a PR URL** to review and share

### Key Principle

**Use current branch** - Claude does NOT create new branches. It commits to whatever branch you're currently on.

---

## Branch Requirements

### Valid Branches (Personal)
- `siam`
- `john`
- `lukas`
- Any branch that is NOT `main` or `dev`

### Invalid Branches (Protected)
- `main` - Cannot commit directly
- `dev` - Cannot commit directly
- Detached HEAD - Must checkout a branch first

If you're on a protected branch, Claude will ask you to create a personal branch.

---

## Commands & Phrases

### Basic Commands

| What to Say | What Happens |
|-------------|--------------|
| `/commit` | Commit to current branch, create PR to dev |
| `commit my changes` | Same as above |
| `create a PR for my changes` | Same as above |
| `/commit fix login bug` | Commit with custom message |

### With Custom Commit Messages

```
/commit feat: Add user dashboard
```

```
Please commit with message "fix: Resolve authentication timeout"
```

---

## Step-by-Step Example

### 1. Checkout Your Branch

First, make sure you're on your personal branch:

```bash
git checkout siam
```

Or create one if it doesn't exist:

```bash
git checkout -b siam
git push -u origin siam
```

### 2. Make Your Changes

Edit files in any project folder:
- `frontend/`
- `backend/`
- `mobile/`
- etc.

### 3. Run Commit

Type:
```
/commit
```

### 4. Review the Results

Claude will show you:
```
✓ Workflow Complete

PR Created:
https://github.com/org/repo/pull/42
  - Branch: siam
  - Commit: abc1234 - feat(admin): Add user management
  - Files: 8

Submodule PRs (if any):
1. https://github.com/org/claude-base/pull/15 (base)
2. https://github.com/org/project-claude/pull/8 (.claude)
```

### 5. Share PR Link

Copy the PR URL and share with your team for code review.

---

## Submodule Handling

Our project uses nested submodules:

```
project/                    (Parent repo)
├── .pi/                (Submodule)
│   ├── base/               (Nested submodule)
│   ├── nestjs/             (Nested submodule)
│   └── react/              (Nested submodule)
```

### What Claude Does Automatically

1. **Detects submodule changes** - If you modified files in `.pi/base/` or other submodules
2. **Commits deepest first** - Starts with nested submodules, then `.claude`, then parent
3. **Uses current branch in each** - Each submodule commits to its own current branch
4. **Creates PRs for each level** - Every repo gets a PR targeting `dev`

### Example with Submodule Changes

If you edited files in `.pi/base/`:

```
PRs Created:

1. https://github.com/org/claude-base/pull/15
   - Branch: siam (in base submodule)

2. https://github.com/org/project-claude/pull/8
   - Branch: siam (in .claude submodule)

3. https://github.com/org/project/pull/42
   - Branch: siam (in parent repo)
```

---

## Pull Command

To pull latest changes:

```
/pull
```

This will:
1. Pull your current branch in the parent repo
2. Update and pull all submodules on their current branches

---

## Important Rules

### Always Remember

- **All changes go through PRs** - No direct pushes to `main` or `dev`
- **PRs target `dev` branch** - Not `main`
- **Use your personal branch** - Create one if needed
- **Workflow stops if PR creation fails** - Check GitHub access

### What NOT to Commit

Claude automatically excludes:
- `.env` files (secrets)
- `credentials.json` (sensitive data)
- `node_modules/` (dependencies)
- `dist/`, `build/` (build artifacts)
- `playwright-report/`, `test-results/` (test output)

---

## Troubleshooting

### "You are on a protected branch"

Solution: Create and checkout your personal branch:
```bash
git checkout -b <your-name>
git push -u origin <your-name>
```

### "Detached HEAD state"

Solution: Checkout a branch:
```bash
git checkout siam
```

### "PR creation failed"

1. Check GitHub authentication:
   ```bash
   gh auth status
   ```

2. If not logged in:
   ```bash
   gh auth login
   ```

### "No changes detected"

Make sure you:
1. Saved all your files
2. Are in the correct project directory
3. Haven't already committed the changes

---

## Commit Message Format

Claude generates commit messages following this format:

```
<type>(<scope>): <description>

<optional body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Maintenance |
| `style` | Formatting only |

### Scopes

| Scope | Project Folder |
|-------|----------------|
| `dashboard` | dashboard (admin/privileged roles) |
| `mobile` | mobile |
| `backend` | backend |
| `docs` | .project |

### Examples

```
feat(admin): Add user management API integration
fix(backend): Resolve authentication token expiry
refactor(mobile): Simplify navigation logic
docs: Update API integration plan
```

---

## FAQ

**Q: Can I commit to `main` directly?**
A: No. All changes must go through PRs targeting `dev`.

**Q: What if I only want to commit, not create a PR?**
A: This is not supported. PRs are mandatory for code review.

**Q: Can I use my own commit message?**
A: Yes! Add it after `/commit`: `/commit your message here`

**Q: What happens to my changes after the PR is merged?**
A: Your branch remains. You can continue working on it or delete it.

**Q: Do I need to handle submodules manually?**
A: No. Claude detects and handles all submodule changes automatically.

**Q: What if I'm on `dev` and want to commit?**
A: Claude will ask you to create a personal branch first.

---

## Summary

1. Checkout your personal branch (e.g., `siam`)
2. Make changes to your code
3. Run `/commit`
4. Get PR URL and share with team
5. Review and merge PR
6. Continue working on your branch
