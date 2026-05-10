---
name: project-init
phase: 1
prerequisites: []
description: Initialize project structure with Claude config and documentation folders
---

# Project Init Skill

Phase 1 of the fullstack pipeline. Sets up project infrastructure.

## Context

- **Project**: Read from PIPELINE_STATUS.md or prompt
- **Previous phase**: None (first phase)
- **Expected output**: `.pi-project/` folder, `.pi/` submodule (if new)

## Smart Detection

Before executing, detect the current project state:

### Check 1: Is this a new project?

```bash
# Check if .pi/ exists
ls -la .pi/ 2>/dev/null
```

**If `.pi/` does NOT exist:**
- This is a brand new project
- Execute full `/new-project` workflow (see below)

**If `.pi/` EXISTS:**
- Skip to Check 2

### Check 2: Does .pi-project/ exist?

```bash
# Check if .pi-project/ exists
ls -la .pi-project/ 2>/dev/null
```

**If `.pi-project/` does NOT exist:**
- Project has Claude config but no documentation
- Execute `/init-workspace` workflow (see below)

**If `.pi-project/` EXISTS:**
- Verify structure is complete
- Report ready

---

## Execution Path A: Full New Project Setup

When `.pi/` doesn't exist, run the full project setup:

### A.1 Gather Tech Stack

Use **AskUserQuestion** to determine the tech stack. This information will be persisted to PIPELINE_STATUS.md for all subsequent phases.

**Question 1: Backend Framework** (single selection)
```
Question: "Which backend framework will this project use?"
Header: "Backend"
Options:
  - label: "NestJS (Recommended)"
    description: "TypeScript, TypeORM, JWT, Swagger - Full-featured Node.js framework"
```
Store as: `$BACKEND` = "nestjs"

**Question 2: Frontend Framework(s)** (multiSelect: true)
```
Question: "Which frontend framework(s) will this project use?"
Header: "Frontend"
Options:
  - label: "React Web"
    description: "React 19, TailwindCSS 4, shadcn/ui - Modern web application"
  - label: "React Native"
    description: "NativeWind, React Navigation - Cross-platform mobile app"
```
Store as: `$FRONTENDS` = ["react"] | ["react-native"] | ["react", "react-native"]

**Question 3: Dashboards** (multiSelect: true, optional)
```
Question: "Do you need any dashboard applications?"
Header: "Dashboards"
Options:
  - label: "Admin Dashboard"
    description: "System administration interface (uses React)"
  - label: "Coach Dashboard"
    description: "Coach/user-specific management interface (uses React)"
  - label: "None"
    description: "No dashboard needed for this project"
```
Store as: `$DASHBOARDS` = [] | ["admin"] | ["coach"] | ["admin", "coach"]

### A.2 Create Claude Config Repository

```bash
# Create config repo on GitHub
gh repo create CoFixer/{project}-claude --public

# Clone and set up submodules
git clone https://github.com/CoFixer/{project}-claude.git /tmp/{project}-claude
cd /tmp/{project}-claude

# Add base submodule (always)
git submodule add https://github.com/CoFixer/claude-base.git base

# Add framework submodules based on selection
# NestJS: git submodule add https://github.com/CoFixer/claude-nestjs.git nestjs
# React: git submodule add https://github.com/CoFixer/claude-react.git react
# React Native: git submodule add https://github.com/CoFixer/claude-react-native.git react-native

git submodule update --init --recursive
```

### A.3 Create Config Structure

```bash
mkdir -p agents hooks skills
ln -s base/commands commands

# Create settings.json
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

# Push config repo
git add -A
git commit -m "feat: Initialize Claude Code config"
git push -u origin main
```

### A.4 Add .pi to Project

```bash
cd $PROJECT_DIR
git submodule add https://github.com/CoFixer/{project}-claude.git .claude
git submodule update --init --recursive
```

### A.5 Clone Boilerplate Repositories

Based on tech stack selection:

| Selection | Repository | Target Folder |
|-----------|------------|---------------|
| NestJS | CoFixer/nestjs-starter-kit | backend/ |
| React Web | CoFixer/react-starter-kit | frontend/ |
| Dashboard | CoFixer/react-starter-kit | dashboard/ |
| Coach Dashboard | CoFixer/react-starter-kit | frontend-coach-dashboard/ |
| React Native | CoFixer/react-native-starter-kit | mobile/ |

```bash
# For each selected boilerplate:
git clone --branch main --single-branch $REPO_URL $FOLDER
rm -rf $FOLDER/.git $FOLDER/.gitmodules
rm -f $FOLDER/Dockerfile* $FOLDER/docker-compose*.yml
```

### A.6 Generate docker-compose.yml

Create root `docker-compose.yml` with services for each selected component.

### A.7 Persist Tech Stack to PIPELINE_STATUS.md

After creating the status file, update the Configuration section with the selected tech stack:

```bash
# Create PIPELINE_STATUS.md from template
mkdir -p .pi-project/status/{project}
cp .pi/base/templates/PIPELINE_STATUS.template.md .pi-project/status/{project}/PIPELINE_STATUS.md

# Replace placeholders
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" .pi-project/status/{project}/PIPELINE_STATUS.md
sed -i '' "s/{DATE}/$(date +%Y-%m-%d)/g" .pi-project/status/{project}/PIPELINE_STATUS.md
```

**Update the tech_stack configuration:**

```yaml
tech_stack:
  backend: $BACKEND          # e.g., "nestjs"
  frontends: $FRONTENDS      # e.g., ["react"]
  dashboards: $DASHBOARDS    # e.g., ["admin"]
```

This persisted configuration will be used by all subsequent phases to resolve the correct skill paths.

### A.8 Validate Submodules

Before completing, verify all required submodules exist:

```bash
# Check backend submodule
if [ ! -d ".pi/$BACKEND" ]; then
  echo "ERROR: Missing backend submodule .pi/$BACKEND/"
  echo "Install with: git submodule add https://github.com/CoFixer/claude-$BACKEND.git .pi/$BACKEND"
  exit 1
fi

# Check frontend submodule(s)
for frontend in "${FRONTENDS[@]}"; do
  if [ ! -d ".pi/$frontend" ]; then
    echo "ERROR: Missing frontend submodule .pi/$frontend/"
    echo "Install with: git submodule add https://github.com/CoFixer/claude-$frontend.git .pi/$frontend"
    exit 1
  fi
done
```

### A.9 Continue to Init Project Docs

After setup, continue to Execution Path B.

---

## Execution Path B: Initialize Project Documentation

When `.pi/` exists but `.pi-project/` doesn't:

### B.1 Auto-Detect Project Info

```bash
# Get project name from git remote or folder name
project_name=$(basename $(git rev-parse --show-toplevel))

# Detect tech stack from .pi/ submodules
tech_stack=$(ls .pi/ | grep -E "nestjs|react|react-native")
```

### B.2 Create Documentation Structure

```bash
mkdir -p .pi-project/{docs,memory,plans,prd}

# Create docs files
touch .pi-project/docs/PROJECT_KNOWLEDGE.md
touch .pi-project/docs/PROJECT_API.md
touch .pi-project/docs/PROJECT_DATABASE.md
touch .pi-project/docs/PROJECT_API_INTEGRATION.md

# Create memory files
touch .pi-project/memory/DECISIONS.md
touch .pi-project/memory/LEARNINGS.md
touch .pi-project/memory/PREFERENCES.md

# Create plan folders for each project folder
for folder in backend frontend frontend-* mobile; do
  if [ -d "$folder" ]; then
    mkdir -p ".pi-project/status/$folder"
  fi
done
```

### B.3 Create Initial Templates

Copy templates from `.pi/base/templates/claude-project/` and replace placeholders:

- `{PROJECT_NAME}` → actual project name
- `{DATE}` → current date
- `{BACKEND}` → detected backend framework
- `{FRONTENDS}` → detected frontend frameworks

---

## Execution Path C: Verify Existing Structure

When both `.pi/` and `.pi-project/` exist:

### C.1 Verify Required Folders

```bash
required_folders=(
  ".pi-project/docs"
  ".pi-project/memory"
  ".pi-project/status"
)

for folder in "${required_folders[@]}"; do
  if [ ! -d "$folder" ]; then
    echo "Missing: $folder"
    # Create missing folder
    mkdir -p "$folder"
  fi
done
```

### C.2 Verify Required Files

```bash
required_files=(
  ".pi-project/docs/PROJECT_KNOWLEDGE.md"
  ".pi-project/docs/PROJECT_API.md"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing: $file"
    # Create from template
  fi
done
```

### C.3 Report Status

```
Project Init Verification
=========================
.pi/           ✅ Present
.pi-project/   ✅ Present
  docs/            ✅ Complete
  memory/          ✅ Complete
  plans/           ✅ Complete

Project is ready for next phase.
```

---

## Completion Criteria

- [ ] `.pi/` submodule exists and is initialized
- [ ] `.pi-project/` folder structure exists
- [ ] `.pi-project/docs/` has required files
- [ ] `.pi-project/memory/` has required files
- [ ] `.pi-project/status/` has project-specific subfolders
- [ ] `PIPELINE_STATUS.md` exists with valid `tech_stack` configuration
- [ ] All required framework submodules exist (`.pi/$BACKEND/`, `.pi/$FRONTEND/`)

## On Success

Update PIPELINE_STATUS.md:
```
| init | project-init.md | :white_check_mark: | - | .pi-project/ | Done |
```

Add to Execution Log:
```
| {DATE} | init | {DURATION} | :white_check_mark: | - |
```

## On Failure

Update PIPELINE_STATUS.md:
```
| init | project-init.md | :x: | - | - | {ERROR_MESSAGE} |
```

Common failures:
- GitHub CLI not authenticated → Run `gh auth login`
- Repository already exists → Ask to use existing or rename
- Network error during clone → Retry or check connection

---

## Related Commands

- `/new-project` - Full project setup (used in Path A)
- `/init-workspace` - Documentation setup only (used in Path B)
- `/init-claude-config` - Claude config setup only
