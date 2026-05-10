# migrate-submodules

Add framework and department-specific Claude Code submodules to a project that has claude-base.

## Usage

```
/migrate-submodules [options]
```

### Options

| Flag | Submodule | Description |
|------|-----------|-------------|
| `--nestjs` | `claude-nestjs` | NestJS backend (controllers, services, DTOs, Swagger) |
| `--django` | `claude-django` | Django REST Framework backend (models, serializers, ViewSets) |
| `--react` | `claude-react` | React web frontend (components, state, Playwright tests) |
| `--react-native` | `claude-react-native` | React Native mobile (NativeWind, React Navigation, Detox) |
| `--marketing` | `claude-marketing` | Marketing tools (CRO, copywriting, SEO, analytics) |
| `--operations` | `claude-operations` | Operations workflows (automation, documentation, project management) |

### Common Combinations

| Project Type | Command |
|--------------|---------|
| NestJS + React Web | `/migrate-submodules --nestjs --react` |
| NestJS + React Native | `/migrate-submodules --nestjs --react-native` |
| Django + React Web | `/migrate-submodules --django --react` |
| With Marketing Tools | `/migrate-submodules --nestjs --react --marketing` |
| With Operations Tools | `/migrate-submodules --django --operations` |

## Instructions

When the user runs this command with flags, execute the following steps:

### Step 1: Check Current State

```bash
cd $CLAUDE_PROJECT_DIR/.claude

# Check existing submodule directories (local-only, no .gitmodules check)
for dir in django nestjs react react-native marketing operations content; do
  if [ -d "$dir" ] && [ -e "$dir/.git" ]; then
    echo "EXISTS: $dir/"
  fi
done

# Check .git/config for registered submodules
git config --get-regexp 'submodule\..*\.url' 2>/dev/null || echo "No submodules registered"
ls -la
```

Verify:
- Requested submodules do NOT already exist

### Step 2: Add Requested Submodules (Local-Only)

Based on the flags provided, add the appropriate submodules using the local-only helper script.
This adds each submodule, unstages it from the index, and excludes it via `.git/info/exclude`.

**For `--nestjs`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-nestjs.git nestjs
```

**For `--django`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-django.git django
```

**For `--react`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-react.git react
```

**For `--react-native`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-react-native.git react-native
```

**For `--marketing`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-marketing.git marketing
```

**For `--operations`:**
```bash
cd $CLAUDE_PROJECT_DIR/.claude
bash scripts/local-submodule-add.sh https://github.com/potentialInc/claude-operations.git operations
```

**After adding submodules:**
```bash
git submodule update --init --recursive
```

### Step 2.5: Update .gitignore

**Purpose:** Automatically add framework-specific patterns to `.gitignore` to prevent committing build artifacts, dependencies, and secrets.

**For each added framework**, apply the appropriate patterns:

```bash
GITIGNORE_FILE=".gitignore"

# Ensure .gitignore exists
touch "$GITIGNORE_FILE"

# Helper function to add pattern if not exists
add_pattern() {
  local pattern="$1"
  if ! grep -qF "$pattern" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "$pattern" >> "$GITIGNORE_FILE"
    echo "  + Added: $pattern"
  fi
}

# Apply patterns based on flags used
if [ "$NESTJS_FLAG" = true ]; then
  echo "Updating .gitignore for NestJS..."
  add_pattern "nestjs/node_modules/"
  add_pattern "nestjs/dist/"
  add_pattern "nestjs/.env"
  add_pattern "nestjs/.env.local"
  add_pattern "nestjs/package-lock.json"
fi

if [ "$REACT_FLAG" = true ]; then
  echo "Updating .gitignore for React..."
  add_pattern "react/node_modules/"
  add_pattern "react/build/"
  add_pattern "react/.next/"
  add_pattern "react/dist/"
  add_pattern "react/.env.local"
  add_pattern "react/package-lock.json"
fi

if [ "$REACT_NATIVE_FLAG" = true ]; then
  echo "Updating .gitignore for React Native..."
  add_pattern "react-native/node_modules/"
  add_pattern "react-native/.expo/"
  add_pattern "react-native/android/app/build/"
  add_pattern "react-native/ios/Pods/"
  add_pattern "react-native/.env"
fi

if [ "$DJANGO_FLAG" = true ]; then
  echo "Updating .gitignore for Django..."
  add_pattern "django/__pycache__/"
  add_pattern "django/.venv/"
  add_pattern "django/venv/"
  add_pattern "django/*.egg-info/"
  add_pattern "django/.env"
  add_pattern "django/db.sqlite3"
fi

if [ "$MARKETING_FLAG" = true ]; then
  echo "Updating .gitignore for Marketing..."
  add_pattern "marketing/node_modules/"
  add_pattern "marketing/.env"
fi

if [ "$OPERATIONS_FLAG" = true ]; then
  echo "Updating .gitignore for Operations..."
  add_pattern "operations/node_modules/"
  add_pattern "operations/.env"
fi

echo "✓ .gitignore updated with framework-specific patterns"
```

### Step 3: Verify Structure

```bash
ls -la */  # List all submodule directories
git config --get-regexp 'submodule\..*\.url' 2>/dev/null  # Show registered submodules
git status  # Verify nothing is staged
```

Expected contents per submodule:
- `nestjs/`: agents/, skills/, docs/, hooks/
- `django/`: agents/, skills/, hooks/
- `react/`: agents/, skills/, docs/
- `react-native/`: agents/, skills/

### Step 4: Report

Submodules are **local-only** — they are NOT tracked by git and will never be pushed to remote.
Each developer must run `/setup-claude` or `/migrate-submodules` independently.

Only `.gitignore` build artifact pattern changes need committing:
```bash
cd $CLAUDE_PROJECT_DIR/.claude
git add .gitignore
git commit -m "chore: Add framework .gitignore patterns"
```

## Project Structure Examples

### NestJS + React Web
```
.pi/
├── nestjs/         # NestJS backend (local-only submodule)
├── react/          # React frontend (local-only submodule)
├── agents/         # Project-specific overrides
├── skills/         # Project-specific + skill-rules.json
└── settings.json
```

### NestJS + React Native
```
.pi/
├── nestjs/         # NestJS backend (local-only submodule)
├── react-native/   # React Native (local-only submodule)
├── agents/         # Project-specific
└── settings.json
```

### Django + React Web
```
.pi/
├── django/         # Django backend (local-only submodule)
├── react/          # React frontend (local-only submodule)
├── agents/         # Project-specific
└── settings.json
```

## Submodule Repository URLs

| Submodule | Repository |
|-----------|------------|
| base | https://github.com/potentialInc/claude-base |
| nestjs | https://github.com/potentialInc/claude-nestjs |
| django | https://github.com/potentialInc/claude-django |
| react | https://github.com/potentialInc/claude-react |
| react-native | https://github.com/potentialInc/claude-react-native |
| marketing | https://github.com/potentialInc/claude-marketing |
| operations | https://github.com/potentialInc/claude-operations |

## Benefits

- Backend updates (NestJS/Django) propagate to all projects using that framework
- Frontend updates (React/React Native) propagate to all projects using that framework
- Clear separation of framework concerns
- Mix and match: NestJS+React, NestJS+RN, Django+React, etc.
