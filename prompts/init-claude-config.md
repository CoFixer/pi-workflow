---
description: Initialize Claude Code configuration (.claude submodule) for a project
argument-hint: Optional project name (will prompt if not provided)
---

You are a project initialization assistant. Your task is to set up a new project with the modular `.claude` submodule architecture.

## Step 0: Gather Project Information

### Get Project Name

If $ARGUMENTS is provided, use it as the project name. Otherwise, ask the user:

```
What is the project name? (e.g., myapp, coaching-platform)
This will be used for the config repo: <project-name>-claude
```

Store the result as `$PROJECT_NAME` (lowercase, hyphenated).

### Get Tech Stack

Use **AskUserQuestion** to ask the user for their tech stack:

**Include Base Submodule:**
- **Yes** - Include shared base (agents, hooks, commands, marketing skills)
- **No** (Recommended) - Lightweight setup without base dependencies

**Backend Framework:**
1. **NestJS** (Recommended for TypeScript) - TypeORM, JWT, Swagger
2. **Django** - Django REST Framework, SimpleJWT, drf-spectacular

**Frontend Framework(s)** (can select multiple):
1. **React Web** - React 19, TailwindCSS 4, shadcn/ui
2. **React Native** - NativeWind, React Navigation, Detox

Store selections as:
- `$INCLUDE_BASE` = "true" | "false"
- `$BACKEND` = "nestjs" | "django"
- `$FRONTEND` = array of ["react", "react-native"]

## Step 1: Create Project-Specific Claude Config Repo

```bash
# Create the config repo on GitHub
gh repo create potentialInc/$PROJECT_NAME-claude --public --description "Claude Code configuration for $PROJECT_NAME"

# Clone it locally
git clone https://github.com/potentialInc/$PROJECT_NAME-claude.git /tmp/$PROJECT_NAME-claude
cd /tmp/$PROJECT_NAME-claude
```

## Step 2: Add Framework Submodules (Local-Only)

```bash
cd /tmp/$PROJECT_NAME-claude
```

Framework submodules are added as **local-only** — they are never committed or pushed to the remote config repo. Each developer adds them independently via `/setup-claude`.

For the initial setup, add submodules and immediately unstage them:

**If user selected to include base:**
```bash
git submodule add https://github.com/potentialInc/claude-base.git base
git reset HEAD .gitmodules base 2>/dev/null || true
```

Based on user selection, add backend submodule:

**For NestJS:**
```bash
git submodule add https://github.com/potentialInc/claude-nestjs.git nestjs
git reset HEAD .gitmodules nestjs 2>/dev/null || true
```

**For Django:**
```bash
git submodule add https://github.com/potentialInc/claude-django.git django
git reset HEAD .gitmodules django 2>/dev/null || true
```

Based on user selection, add frontend submodule(s):

**For React Web:**
```bash
git submodule add https://github.com/potentialInc/claude-react.git react
git reset HEAD .gitmodules react 2>/dev/null || true
```

**For React Native:**
```bash
git submodule add https://github.com/potentialInc/claude-react-native.git react-native
git reset HEAD .gitmodules react-native 2>/dev/null || true
```

Add `.gitmodules` and framework paths to `.git/info/exclude`:
```bash
EXCLUDE_FILE=".git/info/exclude"
mkdir -p .git/info
echo "" >> "$EXCLUDE_FILE"
echo "# Local-only submodules - never commit these" >> "$EXCLUDE_FILE"
echo ".gitmodules" >> "$EXCLUDE_FILE"
# Add each selected framework path to exclude
```

Then initialize nested submodules:
```bash
git submodule update --init --recursive
```

## Step 3: Create Project-Specific Structure

```bash
cd /tmp/$PROJECT_NAME-claude

# Create directories for project-specific overrides
mkdir -p agents hooks skills commands

# If base was added, create symlink to base commands (optional)
# Note: By default, commands/ is now a regular directory for project-specific commands
# If you want to use base commands, you can create a symlink:
# ln -s base/commands commands

# Create .gitignore
cat > .gitignore << 'EOF'
settings.local.json
*.local.*
EOF
```

## Step 4: Create settings.json

Create settings.json with hooks pointing to the appropriate framework:

```bash
cat > settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [],
    "PostToolUse": [],
    "Stop": []
  },
  "mcpServers": {}
}
EOF
```

## Step 5: Create skill-rules.json

Generate skill-rules.json based on the selected frameworks:

```bash
cat > skills/skill-rules.json << 'EOF'
{
  "version": "1.0",
  "skills": {
    "backend-dev-guidelines": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["api", "backend", "controller", "service", "entity", "repository"]
      }
    },
    "frontend-dev-guidelines": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["react", "component", "frontend", "ui", "tsx", "page"]
      }
    }
  }
}
EOF
```

## Step 6: Commit and Push Config Repo

Construct commit message based on selected frameworks:

Construct commit message based on what was included:

```bash
cd /tmp/$PROJECT_NAME-claude

# Stage only tracked project files (NOT .gitmodules or framework directories)
git add settings.json skills/ agents/ hooks/ commands/ .gitignore

# Build commit message dynamically
COMMIT_MSG="feat: Initialize Claude Code config

- Project-specific agents, skills, hooks, and settings
- Framework submodules are local-only (added per-developer via /setup-claude)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git commit -m "$COMMIT_MSG"
git push -u origin main
```

## Step 7: Add to Main Project (Optional)

Ask the user if they want to add the config repo to their main project:

**Options:**
1. **Yes, add as submodule now** - Add .claude submodule to current project
2. **No, I'll do it later** - Just report the repo URL

**If user selects "Yes":**

```bash
cd $CLAUDE_PROJECT_DIR

# Remove any existing .claude directory (if exists)
rm -rf .claude 2>/dev/null || true

# Add .claude as a submodule pointing to the config repo
git submodule add https://github.com/potentialInc/$PROJECT_NAME-claude.git .claude

# Initialize all nested submodules
git submodule update --init --recursive

# Commit
git add .gitmodules .claude
git commit -m "$(cat <<'EOF'
feat: Add .claude submodule for Claude Code configuration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Step 8: Report Results

Build the report dynamically based on what was included:

```
✓ Created project-specific Claude config repo:
  https://github.com/potentialInc/$PROJECT_NAME-claude

Configuration:
{if base included: - Base: claude-base (shared agents, hooks, commands, marketing skills)}
- Backend: claude-$BACKEND ($BACKEND patterns)
- Frontend: claude-$FRONTEND ($FRONTEND patterns)

Structure:
.pi/
{if base included: ├── base/           → claude-base}
├── $BACKEND/       → claude-$BACKEND
├── $FRONTEND/      → claude-$FRONTEND
├── agents/         (project-specific)
├── hooks/          (project-specific)
├── skills/         (skill-rules.json)
├── commands/       (project-specific commands)
└── settings.json

Next steps:
1. Clone the project: git clone <your-project-url>
2. Add framework submodules locally: cd .claude && /setup-claude
3. Framework submodules are local-only — each developer runs /setup-claude independently
```

## Error Handling

- If repo creation fails: Check gh auth status and permissions
- If submodule add fails: Ensure the framework repos exist
- If push fails: Check if main branch exists
- If user cancels: Stop gracefully and report what was created

## Available Framework Repos

| Repo | URL |
|------|-----|
| claude-base | https://github.com/potentialInc/claude-base |
| claude-nestjs | https://github.com/potentialInc/claude-nestjs |
| claude-django | https://github.com/potentialInc/claude-django |
| claude-react | https://github.com/potentialInc/claude-react |
| claude-react-native | https://github.com/potentialInc/claude-react-native |
