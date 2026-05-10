---
description: Create a complete new project with Claude config and boilerplate code
argument-hint: "<project-name> [--docs-only]"
---

You are a full project setup assistant. This command creates a new project with the shared claude-workflow as `.claude` submodule.

## Step 0: Parse Arguments and Select Mode

### 0.1 Parse Project Name

Parse `$ARGUMENTS` for `$PROJECT_NAME`.

```
Examples:
  /new-project my-app           → Full setup
  /new-project my-app --docs-only → Documentation only
```

If no project name provided, ask:
```
What is the project name? (e.g., monkey, coaching-platform)
```

Store as `$PROJECT_NAME` (lowercase, hyphenated).

### 0.2 Determine Setup Mode

Check if `--docs-only` flag is present in `$ARGUMENTS`:

**If `--docs-only` flag is present:**
```bash
DOCS_ONLY_MODE=true
```

**If `--docs-only` flag is NOT present:**

Use **AskUserQuestion** to ask the user:

```
Question: "What type of setup do you want to perform?"
Header: "Setup Mode"
Options:
  1. Full Project Setup (Recommended)
     Description: "Create new project with boilerplate code, .claude config, and documentation"

  2. Documentation Only
     Description: "Set up documentation for existing project (requires .pi/ submodule)"
```

Store result:
- Option 1 selected → `$DOCS_ONLY_MODE = false`
- Option 2 selected → `$DOCS_ONLY_MODE = true`

### 0.2.1 Detect Compress Mode

Check if `--compress` flag is present in `$ARGUMENTS`:

```bash
COMPRESS_MODE=false
if [[ "$ARGUMENTS" =~ --compress ]]; then
  COMPRESS_MODE=true
  echo "✓ Compress mode enabled: Minimal templates will be generated"
fi
```

**Note:** Compress mode creates lightweight versions of CLAUDE.md and README.md by removing verbose sections, reducing file sizes by ~40-50%.

### 0.3 Display Selected Mode

Display confirmation:
```
=== Setup Mode Selected ===
Mode: ${DOCS_ONLY_MODE ? "Documentation Only" : "Full Project Setup"}
Project: $PROJECT_NAME
```

## Step 0.5: Detect and Migrate Resources

**This step ALWAYS runs in both normal and --docs-only modes.**

This step automatically detects existing project resources (HTML prototypes, PRD documents) at the root directory and migrates them to the proper locations within `.pi-project/`.

### 0.5.1 Check for Existing Resources

```bash
# Check for HTML folder
HTML_FOLDER_EXISTS=false
HTML_FILE_COUNT=0
if [ -d "HTML" ]; then
  HTML_FOLDER_EXISTS=true
  HTML_FILE_COUNT=$(find HTML -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
fi

# Check for PRD PDF
PRD_PDF_EXISTS=false
if [ -f "prd.pdf" ]; then
  PRD_PDF_EXISTS=true
fi
```

### 0.5.2 Report Detected Resources

If resources are found, display:

```
=== Detected Project Resources ===

HTML Folder:  ${HTML_FOLDER_EXISTS ? "Found ($HTML_FILE_COUNT HTML files)" : "Not found"}
PRD PDF:      ${PRD_PDF_EXISTS ? "Found (prd.pdf)" : "Not found"}
```

### 0.5.3 Execute Migration (Automatic)

Automatically migrate resources without prompting:

```bash
# Create target directories
mkdir -p .pi-project/resources
mkdir -p .pi-project/prd

# Move HTML folder
if [ "$HTML_FOLDER_EXISTS" = true ]; then
  mv HTML .pi-project/resources/HTML
  echo "Migrated: HTML/ → .pi-project/resources/HTML/ ($HTML_FILE_COUNT files)"
fi

# Move PRD PDF
if [ "$PRD_PDF_EXISTS" = true ]; then
  mv prd.pdf .pi-project/prd/prd.pdf
  echo "Migrated: prd.pdf → .pi-project/prd/prd.pdf"
fi
```

### 0.5.4 Auto-Detect Tech Stack from Resources

After migration, analyze resources to pre-populate tech stack variables.

#### From PRD PDF (if exists):

Read the PDF and search for "Project Type" section:

```
Detection Patterns:
  - "Backend - NestJS" or "Backend: NestJS" → $BACKEND_DETECTED = "nestjs"
  - "Backend - Django" or "Backend: Django" → $BACKEND_DETECTED = "django"
  - "Web Application - React" → add "react" to $FRONTENDS_DETECTED
  - "Mobile App - React Native" → add "react-native" to $FRONTENDS_DETECTED
  - "Admin Dashboard - React" → add "admin" to $DASHBOARDS_DETECTED
  - "Operations Dashboard - React" → add "operations" to $DASHBOARDS_DETECTED
  - "Analytics Dashboard - React" → add "analytics" to $DASHBOARDS_DETECTED
  - "Coach Dashboard - React" → add "coach" to $DASHBOARDS_DETECTED
```

#### From HTML Files (if exist):

Analyze first 3 HTML files for framework hints:

```bash
# Check for TailwindCSS CDN (strongly suggests React)
if grep -l "tailwindcss.com" .pi-project/resources/HTML/*.html 2>/dev/null | head -1; then
  FRAMEWORK_HINT="react"
  CSS_FRAMEWORK="tailwindcss"
fi

# Check for Vue.js
if grep -l "vue.js\|vue.min.js" .pi-project/resources/HTML/*.html 2>/dev/null | head -1; then
  FRAMEWORK_HINT="vue"
fi

# Check for Angular
if grep -l "angular" .pi-project/resources/HTML/*.html 2>/dev/null | head -1; then
  FRAMEWORK_HINT="angular"
fi
```

### 0.5.5 Report Detection Results

```
=== Tech Stack Auto-Detection Results ===

From PRD (prd.pdf):
  Backend:    $BACKEND_DETECTED (or "Not detected")
  Frontend:   $FRONTENDS_DETECTED (or "Not detected")
  Dashboards: $DASHBOARDS_DETECTED (or "None detected")

From HTML Analysis:
  Framework Hint: $FRAMEWORK_HINT (or "None")
  CSS Framework:  $CSS_FRAMEWORK (or "None")
  File Count:     $HTML_FILE_COUNT files

These values will be used as defaults in Step 1.
```

### 0.5.6 Populate Documentation from PRD

After stack detection, automatically populate `.pi-project/docs/` with detailed information extracted from the PRD.

#### 0.5.6.0 Organize HTML Files by Type

Before populating docs, organize HTML files into subfolders by user type:

```bash
cd .pi-project/resources/HTML

# Create type folders
mkdir -p auth business-user data-analyst ops-manager admin settings modals

# Move by filename pattern (simple numeric prefix mapping)
mv 01-*.html 02-*.html 03-*.html 04-*.html 05-*.html 06-*.html auth/ 2>/dev/null
mv 07-*.html 08-*.html 09-*.html 10-*.html 11-*.html 12-*.html business-user/ 2>/dev/null
mv 13-*.html 14-*.html 15-*.html 16-*.html 17-*.html data-analyst/ 2>/dev/null
mv 18-*.html 19-*.html 20-*.html 21-*.html 22-*.html ops-manager/ 2>/dev/null
mv 23-*.html 24-*.html 25-*.html 26-*.html 27-*.html 28-*.html 29-*.html 30-*.html admin/ 2>/dev/null
mv settings-*.html settings/ 2>/dev/null
mv modal-*.html modals/ 2>/dev/null
# Remaining files stay at root (misc screens like alert-details, user-details, etc.)

cd -
```

**Result structure:**
```
.pi-project/resources/HTML/
├── auth/           # 01-06 (landing, login, signup, forgot-pwd, reset-pwd, email-verify)
├── business-user/  # 07-12 (home, dashboard-list, dashboard-view, reports, alerts, settings)
├── data-analyst/   # 13-17 (home, builder, query, models, model-editor)
├── ops-manager/    # 18-22 (dashboard, team, member-detail, workflows, sla)
├── admin/          # 23-30 (dashboard, users, sources, keys, branding, health, audit, billing)
├── settings/       # settings-*.html
├── modals/         # modal-*.html
└── *.html          # remaining detail/misc screens
```

#### 0.5.6.1 Prepare PRD Content for PROJECT_KNOWLEDGE.md

**Important**: The PROJECT_KNOWLEDGE.template.md already contains comprehensive Architecture sections for all frameworks (NestJS, Django, React, React Native). These will be automatically populated in Step 7 when templates are copied and placeholders are replaced.

**This step only extracts PRD-specific content** to populate the following sections:

```
Extract from PRD Part 1:
  - Description → Overview section
  - Goals → Goals list (numbered)
  - User Types → User Types table with permissions
  - Terminology → Terminology table (Term | Definition)
  - 3rd Party API List → External Services table
  - System Modules → Key Features summary
```

**Store extracted content in memory for Step 7.8** (will be added to PROJECT_KNOWLEDGE.md after template is copied):

```markdown
## Overview Section Content:
[Extract project description from PRD Part 1]

## Goals Section Content:
1. [Goal 1 from PRD]
2. [Goal 2 from PRD]
...

## User Types Section Content:
| Role | Permissions |
|------|-------------|
| [Role from PRD] | [Permissions from PRD] |
| ... | ... |

## Terminology Section Content:
| Term | Definition |
|------|------------|
| [Term from PRD] | [Definition from PRD] |
| ... | ... |

## External Services Section Content:
| Service | Purpose | Documentation |
|---------|---------|---------------|
| [Service from PRD] | [Purpose from PRD] | [Link from PRD] |
| ... | ... | ... |
```

**Note**: The Tech Stack section will be automatically populated from `{BACKEND}` and `{FRONTENDS}` placeholders. The Architecture section is already comprehensive in the template and requires no modification.

#### 0.5.6.2 Update PROJECT_API.md

Extract API structure from PRD System Modules and Page Architecture.

**BEFORE POPULATING API DOCS**: Read `.pi/templates/examples/new-project-prd-example.md` Section "Example API Endpoints" for the expected output format.

Generate endpoint tables following the example format, organized by resource group (Auth, Dashboards, Alerts, Data Sources, Reports, Query Editor, Data Models, Operations, Admin, Billing). Each table has columns: Method | Endpoint | Description | Auth.

#### 0.5.6.3 Prepare PRD-Specific Tables for PROJECT_DATABASE.md

**Important**: The PROJECT_DATABASE.template.md already contains comprehensive ERD with example tables. These will be automatically populated in Step 7.

**This step extracts PRD-specific database tables** to be added to the Tables section in Step 7.8.

Read PRD and extract project-specific tables:

```
Extract from PRD:
  - All entities mentioned in System Modules
  - Relationships between entities
  - Special fields and constraints from PRD
```

**Store extracted PRD-specific table schemas in memory for Step 7.8**:

```markdown
### [table_name_from_PRD]

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| [column] | [type] | [Yes/No] | [default] | [description from PRD] |
| created_at | timestamp | No | now() | Creation time |
| updated_at | timestamp | No | now() | Last update |

**Constraints:**
- FOREIGN KEY [column] REFERENCES [table](id) ON DELETE [CASCADE/SET NULL]
- UNIQUE ([column])
```

**Extract project-specific entity relationships for ERD**:

```
[entity1] 1──N [entity2] ([relationship_description])
[entity3] N──N [entity4] (via [junction_table])
```

**Note**:
- The template ERD will serve as reference examples
- PRD-specific tables should be added to the Tables section (not replace examples)
- PRD-specific relationships should be added to Entity Relationships section
- The comprehensive ERD with all relationship types remains as documentation reference

#### 0.5.6.4 Cross-Check HTML Files with PRD

Before populating API integration documentation, cross-reference HTML files with PRD screens.

**BEFORE CROSS-CHECKING**: Read `.pi/templates/examples/new-project-prd-example.md` Section "Example HTML-PRD Cross-Check" for the expected format.

**Cross-Check Process:**

```
1. List all HTML files from .pi-project/resources/HTML/
2. Extract screen names from PRD Part 2 & Part 3 (Page Architecture sections)
3. Match HTML files to PRD screens
4. Identify discrepancies:
   - HTML files not in PRD → mark as "Extra Screen" in docs
   - PRD screens without HTML → mark as "HTML Pending" in status
   - Name mismatches → use PRD naming, note HTML filename in parentheses
```

Generate cross-check table and apply reconciliation actions (Matched, Extra Screen, HTML Pending, Name Mismatch) as shown in the example.

#### 0.5.6.5 Update PROJECT_API_INTEGRATION.md

Map HTML screens to API endpoints with frontend project and role access information.

**BEFORE POPULATING API INTEGRATION**: Read `.pi/templates/examples/new-project-prd-example.md` Section "Example Frontend Pages to API Mapping" for the expected output format.

Generate mapping tables organized by user role/page group. Each table maps: HTML File | Route | Frontend | API Endpoints | Status. Admin dashboard tables include an additional Role Access column. Include routing strategy notes and single-codebase benefits for consolidated dashboards.

---

## Mode Branching

After completing Step 0.5 (resource detection and migration), the command branches based on the mode:

### If --docs-only Mode

1. **Verify Prerequisites:**
   ```bash
   if [ ! -d ".claude" ]; then
     echo "ERROR: Cannot use --docs-only without .pi/ submodule."
     echo "Run without --docs-only flag for full setup."
     exit 1
   fi
   ```

2. **Auto-detect Tech Stack from Existing Folders:**
   ```bash
   # Detect backend
   if [ -f "backend/package.json" ] && grep -q "@nestjs/core" backend/package.json; then
     BACKEND="nestjs"
   elif [ -f "backend/manage.py" ]; then
     BACKEND="django"
   fi

   # Detect frontends
   FRONTENDS=()
   [ -d "frontend" ] && FRONTENDS+=("react")
   [ -d "mobile" ] && FRONTENDS+=("react-native")

   # Detect dashboards
   DASHBOARDS=()
   [ -d "dashboard" ] && DASHBOARDS+=("admin")
   [ -d "frontend-operations-dashboard" ] && DASHBOARDS+=("operations")
   [ -d "frontend-analytics-dashboard" ] && DASHBOARDS+=("analytics")
   [ -d "frontend-coach-dashboard" ] && DASHBOARDS+=("coach")

   # Also use values from Step 0.5.4 (PRD detection)
   ```

3. **Skip to Step 7:** Jump directly to "Step 7: Create Project Documentation Structure"

### If Normal Mode

1. **Continue to Step 1:** Proceed with "Step 1: Gather Tech Stack"
2. Use detected values from Step 0.5 as defaults in user prompts

---

## Step 1: Gather Tech Stack

Use **AskUserQuestion** to ask for the complete tech stack.

**If Step 0.5 detected tech stack values, use them as defaults (pre-selected).**

### Backend Framework (Required)

Default Selected: `$BACKEND_DETECTED` (if available from Step 0.5)

- **NestJS** (Recommended) - TypeScript, TypeORM, JWT, Swagger
- **Django** - Python, DRF, SimpleJWT, drf-spectacular

Store as:
- `$BACKEND` = "nestjs" | "django"

### Component Selection Mode

Use **AskUserQuestion** to determine how components should be created:

```
Question: "How should frontend/dashboard components be created?"
Header: "Creation Mode"
Options:
  1. Auto (Recommended) - "Claude analyzes PRD/HTML and decides what to create"
  2. Manual - "You select each component to create"
```

Store result:
- Option 1 selected → `$CREATION_MODE = "auto"`
- Option 2 selected → `$CREATION_MODE = "manual"`

---

### If Auto Mode Selected (`$CREATION_MODE = "auto"`):

**Frontend Detection:**
Default Selected: `$FRONTENDS_DETECTED` (if available from Step 0.5)

- **React Web** - React 19, TailwindCSS 4, shadcn/ui (if detected in PRD)
- **React Native** - NativeWind, React Navigation, Detox (if detected in PRD)

Store as:
- `$FRONTENDS` = array of ["react", "react-native"] (can be empty if none detected)

**Dashboard Auto-Detection:**
```bash
CREATE_DASHBOARD=false
MULTIPLE_ROLES_DETECTED=false
DETECTED_ROLES=()

if [ -d ".pi-project/resources/HTML/admin" ]; then
  DETECTED_ROLES+=("admin")
fi
if [ -d ".pi-project/resources/HTML/organizer" ]; then
  DETECTED_ROLES+=("organizer")
fi
if [ -d ".pi-project/resources/HTML/ops-manager" ]; then
  DETECTED_ROLES+=("ops-manager")
fi

if [ ${#DETECTED_ROLES[@]} -gt 0 ]; then
  CREATE_DASHBOARD=true
  echo "✓ Detected privileged roles (${DETECTED_ROLES[*]}) - will create dashboard/"
fi

if [ ${#DETECTED_ROLES[@]} -gt 1 ]; then
  MULTIPLE_ROLES_DETECTED=true
fi
```

**If Multiple Roles Detected (`$MULTIPLE_ROLES_DETECTED = true`):**

Use **AskUserQuestion** to ask about dashboard consolidation:

```
Question: "Multiple admin roles detected (${DETECTED_ROLES[*]}). How should dashboards be organized?"
Header: "Dashboard Strategy"
Options:
  1. Single Dashboard (Recommended) - "One dashboard/ with role-based routing (/admin/*, /ops/*)"
  2. Separate Dashboards - "Create dashboard-admin/, dashboard-ops/, etc. for each role"
  3. No Dashboard - "Skip dashboard creation entirely"
```

Store result:
- Option 1 → `$DASHBOARD_STRATEGY = "single"`, `$CREATE_DASHBOARD = true`
- Option 2 → `$DASHBOARD_STRATEGY = "separate"`, `$CREATE_DASHBOARD = true`, create `dashboard-{role}/` for each detected role
- Option 3 → `$CREATE_DASHBOARD = false`

---

### If Manual Mode Selected (`$CREATION_MODE = "manual"`):

**Frontend Framework(s) Selection (multiSelect: true):**

```
Question: "Which frontend(s) do you want to create?"
Header: "Frontend"
Options:
  1. React Web - "Web application (port 5173)"
  2. React Native - "Mobile application"
  3. None - "Skip frontend creation"
```

Store as:
- `$FRONTENDS` = array of selected options (can be empty if "None" selected)

**Dashboard Selection:**

```
Question: "Create a dashboard for admin/privileged roles?"
Header: "Dashboard"
Options:
  1. Yes - "Single dashboard for admin/ops/privileged roles (port 5174)"
  2. No - "No dashboard needed"
```

Store result:
- Option 1 → `$CREATE_DASHBOARD = true`
- Option 2 → `$CREATE_DASHBOARD = false`

---

### Dashboard Consolidation Strategy (when created):

- **Single Dashboard**: ONE `dashboard/` with role-based routing (`/admin/*`, `/organizer/*`, `/ops/*`)
- **Separate Dashboards**: Individual `dashboard-{role}/` for each detected role
- Shared components, unified navigation, single auth context across all roles

Store as:
- `$CREATE_DASHBOARD` = true | false

## Step 2: Confirm Project Structure

Display the planned structure and ask for confirmation:

```
=== Project Setup Plan: $PROJECT_NAME ===

Claude Configuration:
  - Uses shared claude-workflow submodule
  - Contains: base, nestjs, django, react, react-native skills

Boilerplate Code:
  - backend/                       ← nestjs-starter-kit (if NestJS)
  - backend/                       ← django-starter-kit (if Django)
  - frontend/                      ← react-starter-kit (if React Web selected)
  - dashboard/                     ← react-starter-kit (if dashboard selected/detected)
                                     Consolidated dashboard for all privileged roles
  - mobile/                        ← react-native-starter-kit (if React Native)

Project Documentation:
  - .pi-project/status/
  - .pi-project/memory/
  - .pi-project/docs/

Proceed with this setup?
```

## Step 3: Create Project Directory

```bash
# Check if we're in an empty directory or need to create one
if [ "$(ls -A .)" ]; then
    mkdir $PROJECT_NAME
    cd $PROJECT_NAME
fi

# Initialize git if not already
git init 2>/dev/null || true
```

## Step 4: Add Claude Configuration

Add the shared claude-workflow as `.claude` submodule:

```bash
git submodule add https://github.com/potentialInc/claude-workflow.git .claude
git submodule update --init --recursive
```

This provides:
- `base/` - shared commands and skills
- `nestjs/` - NestJS backend skills
- `django/` - Django REST Framework skills
- `react/` - React web skills
- `react-native/` - React Native mobile skills

## Step 5: Clone Boilerplate Repositories

### Boilerplate Mapping

| Selection | Repository | Folder | Notes |
|-----------|------------|--------|-------|
| NestJS | `https://github.com/potentialInc/nestjs-starter-kit` | `backend/` | Backend framework |
| Django | `https://github.com/potentialInc/django-starter-kit` | `backend/` | Backend framework |
| React Web | `https://github.com/potentialInc/react-starter-kit` | `frontend/` | Web application |
| Dashboard | `https://github.com/potentialInc/react-starter-kit` | `dashboard/` | Consolidated dashboard for admin/organizer/ops-manager roles |
| React Native | `https://github.com/potentialInc/react-native-starter-kit` | `mobile/` | Mobile app |

### Clone Each Selected Repo

```bash
# Backend
if [ "$BACKEND" = "nestjs" ]; then
  git clone --branch main --single-branch https://github.com/potentialInc/nestjs-starter-kit backend/
  rm -f backend/Dockerfile* backend/docker-compose*.yml backend/.dockerignore
  rm -rf backend/.git backend/.gitmodules
  echo "✓ Cloned NestJS backend"
elif [ "$BACKEND" = "django" ]; then
  git clone --branch main --single-branch https://github.com/potentialInc/django-starter-kit backend/
  rm -f backend/Dockerfile* backend/docker-compose*.yml backend/.dockerignore
  rm -rf backend/.git backend/.gitmodules
  echo "✓ Cloned Django backend"
fi

# Frontend (React Web)
if [[ " ${FRONTENDS[@]} " =~ " react " ]]; then
  git clone --branch main --single-branch https://github.com/potentialInc/react-starter-kit frontend/
  rm -f frontend/Dockerfile* frontend/docker-compose*.yml frontend/.dockerignore
  rm -rf frontend/.git frontend/.gitmodules
  echo "✓ Cloned React frontend"
fi

# Dashboard (selected or auto-detected)
if [ "$CREATE_DASHBOARD" = true ]; then
  if [ "$DASHBOARD_STRATEGY" = "separate" ]; then
    # Create separate dashboard for each detected role
    DASHBOARD_PORT=5174
    for role in "${DETECTED_ROLES[@]}"; do
      echo "Creating dashboard-${role}..."
      git clone --branch main --single-branch https://github.com/potentialInc/react-starter-kit "dashboard-${role}/"
      rm -f "dashboard-${role}/Dockerfile"* "dashboard-${role}/docker-compose"*.yml "dashboard-${role}/.dockerignore"
      rm -rf "dashboard-${role}/.git" "dashboard-${role}/.gitmodules"
      echo "✓ Cloned dashboard-${role} (port ${DASHBOARD_PORT})"
      DASHBOARD_PORT=$((DASHBOARD_PORT + 1))
    done
  else
    # Single consolidated dashboard (default)
    echo "Creating consolidated dashboard for privileged roles..."
    git clone --branch main --single-branch https://github.com/potentialInc/react-starter-kit dashboard/
    rm -f dashboard/Dockerfile* dashboard/docker-compose*.yml dashboard/.dockerignore
    rm -rf dashboard/.git dashboard/.gitmodules
    echo "✓ Cloned React dashboard (serves admin, organizer, ops-manager roles)"
  fi
fi

# Mobile (React Native)
if [[ " ${FRONTENDS[@]} " =~ " react-native " ]]; then
  git clone --branch main --single-branch https://github.com/potentialInc/react-native-starter-kit mobile/
  rm -f mobile/Dockerfile* mobile/docker-compose*.yml mobile/.dockerignore
  rm -rf mobile/.git mobile/.gitmodules
  echo "✓ Cloned React Native mobile"
fi
```

## Step 5.5: Sync Backend Environment Ports

After cloning boilerplate, synchronize backend `.env.example` (and `.env.dummy`) with the project's assigned ports from `port-map.json`. This prevents CORS errors caused by hardcoded origins (e.g., `localhost:5173`) not matching the actual frontend port.

```bash
# Sync CORS origins, PORT, and FRONTEND_URL in backend env files
node .pi/base/scripts/sync-env-ports.js

# Also copy .env.example to .env for immediate local development
if [ -f "backend/.env.example" ] && [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "✓ Created backend/.env from .env.example with correct ports"
fi
```

**What this updates:**
- `PORT` → project's backend port (from port-map.json)
- `FRONTEND_URL` → `http://localhost:{frontend_port}`
- `ALLOW_ORIGINS` / `CORS_ALLOWED_ORIGINS` → all frontend/dashboard origins
- `CSRF_TRUSTED_ORIGINS` → same (Django projects)

## Step 6: Generate docker-compose.yml

Create root `docker-compose.yml` based on selected services:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: $PROJECT_NAME-backend
    restart: unless-stopped
    ports:
      - '${BACKEND_PORT:-3000}:${BACKEND_PORT:-3000}'
    environment:
      - NODE_ENV=${NODE_ENV:-development}
    networks:
      - $PROJECT_NAME-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: $PROJECT_NAME-frontend
    restart: unless-stopped
    ports:
      - '5173:5173'
    networks:
      - $PROJECT_NAME-network

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    container_name: $PROJECT_NAME-dashboard
    restart: unless-stopped
    ports:
      - '5174:5173'
    networks:
      - $PROJECT_NAME-network
    # Serves all privileged roles via role-based routing (/admin/*, /ops/*, /organizer/*)
    # If DASHBOARD_STRATEGY="separate", generate dashboard-{role} services with incrementing ports (5174, 5175, 5176...)

networks:
  $PROJECT_NAME-network:
    driver: bridge
```

## Step 7: Create Project Documentation Structure

This step can be run standalone with `--docs-only` flag for existing projects.

### 7.1 Check for existing .claude-project

```bash
if [ -d ".claude-project" ]; then
  # Ask user: Overwrite, Merge, or Skip?
  # - Overwrite: rm -rf .claude-project && continue
  # - Merge: continue (will skip existing files)
  # - Skip: exit step 7
fi
```

### 7.2 Copy templates

```bash
# Create .claude-project directory
mkdir -p .claude-project

# Copy all templates from .pi/templates
cp -r .pi/templates/claude-project/* .pi-project/
```

### 7.3 Rename template files (remove .template suffix)

```bash
# Find all .template.md files recursively and rename them
find .claude-project -name "*.template.md" | while read f; do
  mv "$f" "${f%.template.md}.md"
done
```

### 7.4 Replace placeholders in all markdown files

Templates use `{PLACEHOLDER}` format (curly braces).

```bash
# Replace {PROJECT_NAME} placeholder
find .claude-project -name "*.md" -exec sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" {} \;

# Replace {BACKEND} placeholder
find .claude-project -name "*.md" -exec sed -i '' "s/{BACKEND}/$BACKEND/g" {} \;

# Replace {FRONTENDS} placeholder (join array with comma)
FRONTENDS_STR=$(IFS=', '; echo "${FRONTENDS[*]}")
find .claude-project -name "*.md" -exec sed -i '' "s/{FRONTENDS}/$FRONTENDS_STR/g" {} \;

# Replace {DATE} placeholder
find .claude-project -name "*.md" -exec sed -i '' "s/{DATE}/$(date +%Y-%m-%d)/g" {} \;
```

### 7.4.5 Filter Framework-Specific Sections Based on Tech Stack

**Purpose:** Automatically remove architecture sections for frameworks not in the selected tech stack.

```bash
# Remove unused backend architecture sections
if [ "$BACKEND" = "nestjs" ]; then
  sed -i '' '/<!-- Django Backend Architecture -->/,/<!-- End Django section -->/d' .pi-project/docs/PROJECT_KNOWLEDGE.md
elif [ "$BACKEND" = "django" ]; then
  sed -i '' '/<!-- NestJS Backend Architecture -->/,/<!-- End NestJS section -->/d' .pi-project/docs/PROJECT_KNOWLEDGE.md
fi

# Remove React Native section if not in frontends
if [[ ! " ${FRONTENDS[@]} " =~ " react-native " ]]; then
  sed -i '' '/<!-- React Native Mobile Architecture -->/,/<!-- End React Native section -->/d' .pi-project/docs/PROJECT_KNOWLEDGE.md
  sed -i '' '/├── mobile\//d' .pi-project/docs/PROJECT_KNOWLEDGE.md
fi

# Remove React section if not in frontends (edge case)
if [[ ! " ${FRONTENDS[@]} " =~ " react " ]]; then
  sed -i '' '/<!-- React Web Architecture -->/,/<!-- End React section -->/d' .pi-project/docs/PROJECT_KNOWLEDGE.md
fi

echo "✓ Filtered framework-specific sections based on tech stack"
```

### 7.4.6 Remove Generic Database Template if PRD Exists

```bash
if [ -f ".pi-project/prd/prd.pdf" ]; then
  echo "✓ PRD detected - will generate database schema from PRD entities"
  sed -i '' '/<!-- Generic Template ERD -->/,/<!-- End Generic Template ERD -->/d' \
    .pi-project/docs/PROJECT_DATABASE.md
else
  echo "⚠ No PRD found - keeping generic template ERD for reference"
fi
```

### 7.5 Handle gitignore template

```bash
if [ -f ".pi-project/gitignore.template" ]; then
  cat .pi-project/gitignore.template >> .gitignore
  rm .pi-project/gitignore.template
fi
```

### 7.6 Create status folders for detected project folders

```bash
# Create status subfolders for each existing project folder
for folder in backend frontend mobile; do
  if [ -d "$folder" ]; then
    mkdir -p ".pi-project/status/$folder"
    echo "✓ Created status folder for $folder"
  fi
done

# Dashboard status folder(s)
if [ "$DASHBOARD_STRATEGY" = "separate" ]; then
  for role in "${DETECTED_ROLES[@]}"; do
    if [ -d "dashboard-${role}" ]; then
      mkdir -p ".pi-project/status/dashboard-${role}"
      echo "✓ Created status folder for dashboard-${role}"
    fi
  done
elif [ -d "dashboard" ]; then
  mkdir -p ".pi-project/status/dashboard"
  echo "✓ Created status folder for dashboard (consolidated)"
fi

# Create temp folder for temporary/working files
mkdir -p ".pi-project/status/temp"
echo "✓ Created status/temp folder for working files"
```

### 7.7 Verify documentation was created

```bash
# Verify required files exist
required_files=(".pi-project/docs/PROJECT_KNOWLEDGE.md" ".pi-project/docs/PROJECT_API.md" ".pi-project/docs/PROJECT_DATABASE.md" "CLAUDE.md" "README.md")

echo "=== Verifying Documentation ==="
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then echo "✓ $file"; else echo "✗ $file - MISSING"; exit 1; fi
done

# Check for unreplaced placeholders and verify structure
for file in "CLAUDE.md" "README.md"; do
  if grep -q '{[A-Z_]*}' "$file" 2>/dev/null; then
    echo "⚠ $file contains unreplaced placeholders:"; grep -o '{[A-Z_]*}' "$file" | sort -u; exit 1
  fi
done

grep -q "^## Quick Stack Reference" "CLAUDE.md" || { echo "✗ CLAUDE.md missing required sections"; exit 1; }
grep -q "^## Quick Start" "README.md" || { echo "✗ README.md missing required sections"; exit 1; }

echo "✓ All documentation verified successfully"
```

### 7.8 Populate PRD-Specific Content into Documentation

After templates are copied and placeholders replaced, add PRD-specific content extracted in Step 0.5.6.

#### 7.8.1 Update PROJECT_KNOWLEDGE.md with PRD Content

```bash
# Add PRD-specific sections to PROJECT_KNOWLEDGE.md
# The template already has Tech Stack and Architecture sections populated
# We only add PRD-specific content: Overview, Goals, User Types, Terminology, External Services

# Insert after "## Overview" placeholder - Add extracted project description
# Insert after "### Goals" placeholder - Add numbered goals from PRD
# Add User Types section after Tech Stack - Add extracted user types table
# Add Terminology section - Add extracted terminology table
# Add External Services section (after Architecture) - Add extracted external services table
```

**Note**: Do NOT modify the Architecture section - it's already comprehensive from the template and shows the correct framework based on {BACKEND} and {FRONTENDS} placeholders.

#### 7.8.2 Generate Database Schema from PRD

**Purpose:** If PRD exists, generate project-specific ERD and table schemas. Otherwise, keep generic template as reference.

**Note:** Generic ERD was already removed in Step 7.4.6 if PRD exists. This step generates the replacement schema.

**BEFORE GENERATING SCHEMA**: Read `.pi/templates/examples/new-project-database-example.md` for the complete ERD diagram format and all table definition structures.

```bash
if [ -f ".pi-project/prd/prd.pdf" ]; then
  echo "Generating database schema from PRD..."

  # Append to PROJECT_DATABASE.md using heredoc with content following
  # the format from the database example template:
  # - Entity Relationship Diagram (ASCII box format with PK/FK markers)
  # - Entity Relationships tables (1:N and N:N)
  # - All table schemas (Column | Type | Nullable | Default | Description + Constraints)
  cat >> .pi-project/docs/PROJECT_DATABASE.md << 'DBEOF'
  [Generate ERD and table schemas from PRD entities following the example format]
DBEOF

  echo "✓ Generated database schema from PRD"
else
  echo "⚠ No PRD file found - using generic template"
fi
```

#### 7.8.3 Generate PROJECT_DESIGN_GUIDELINES.md

If HTML prototypes exist, extract comprehensive design guidelines from all HTML files.

**BEFORE EXTRACTING DESIGN**: Read `.pi/templates/guides/design-extraction-guide.md` for the complete extraction script.

Execute the design extraction script which: copies the design guidelines template, extracts Tailwind configs and CSS classes from all HTML files, identifies color system (primary/dark/light), typography (font family), spacing patterns, border radius, shadows, transitions, and populates PROJECT_DESIGN_GUIDELINES.md.

**Integration Point**: Executes automatically during `/dev:new-project` when HTML prototypes are detected.

### 7.9 Create CLAUDE.md

Create consolidated context file in root for token-efficient Claude interactions:

```bash
# Copy template to root
cp .pi/templates/CLAUDE.template.md CLAUDE.md

# Replace placeholders
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" CLAUDE.md
sed -i '' "s/{BACKEND}/$BACKEND/g" CLAUDE.md
sed -i '' "s/{FRONTENDS}/$FRONTENDS_STR/g" CLAUDE.md
sed -i '' "s/{DATE}/$(date +%Y-%m-%d)/g" CLAUDE.md

# Filter conditional sections based on selected frameworks
# Remove [if react] sections if react not selected
if [[ ! " ${FRONTENDS[@]} " =~ " react " ]]; then
  sed -i '' '/\[if react\]/,/\[endif\]/d' CLAUDE.md
fi

# Remove [if react-native] sections if react-native not selected
if [[ ! " ${FRONTENDS[@]} " =~ " react-native " ]]; then
  sed -i '' '/\[if react-native\]/,/\[endif\]/d' CLAUDE.md
fi

# Remove dashboard sections if not selected
if [ "$CREATE_DASHBOARD" != true ]; then
  sed -i '' '/\[if dashboard\]/,/\[endif\]/d' CLAUDE.md
fi

if [[ ! " ${DASHBOARDS[@]} " =~ " analytics " ]]; then
  sed -i '' '/\[if analytics-dashboard\]/,/\[endif\]/d' CLAUDE.md
fi

if [[ ! " ${DASHBOARDS[@]} " =~ " coach " ]]; then
  sed -i '' '/\[if coach-dashboard\]/,/\[endif\]/d' CLAUDE.md
fi

# Clean up remaining markers
sed -i '' '/\[if .*\]/d' CLAUDE.md
sed -i '' '/\[endif\]/d' CLAUDE.md

# Apply compress mode if enabled
if [ "$COMPRESS_MODE" = true ]; then
  # Remove verbose sections: Core BASH Tools and part of Essential Commands
  sed -i '' '/^## Core BASH Tools/,/^## Essential Commands/d' CLAUDE.md
  echo "✓ Created compressed CLAUDE.md (~900 tokens)"
else
  echo "✓ Created CLAUDE.md (~1500 tokens)"
fi
```

### 7.10 Create README.md

```bash
# Copy template to root
cp .pi/templates/README.template.md README.md

# Extract project description from PROJECT_KNOWLEDGE.md
if [ -f ".pi-project/docs/PROJECT_KNOWLEDGE.md" ]; then
  PROJECT_DESC=$(sed -n '/^## Overview/,/^##/p' .pi-project/docs/PROJECT_KNOWLEDGE.md | sed '1d;$d' | head -3)
  if [ -n "$PROJECT_DESC" ]; then
    sed -i '' "/^\> \[Project description/c\\
> $PROJECT_DESC" README.md
  fi

  # Extract features from Goals section
  GOALS=$(sed -n '/^### Goals/,/^##/p' .pi-project/docs/PROJECT_KNOWLEDGE.md | grep '^[0-9]' | sed 's/^[0-9]*\. /- /')
  if [ -n "$GOALS" ]; then
    sed -i '' "/^- Feature 1/,/^- Feature 3/d" README.md
    sed -i '' "/^## Features/a\\
$GOALS
" README.md
  fi
fi

# Replace placeholders
sed -i '' "s/{PROJECT_NAME}/$PROJECT_NAME/g" README.md
sed -i '' "s/{BACKEND}/$BACKEND/g" README.md
sed -i '' "s/{FRONTENDS}/$FRONTENDS_STR/g" README.md
sed -i '' "s/{DATE}/$(date +%Y-%m-%d)/g" README.md

# Filter conditional sections based on selected frameworks
if [[ ! " ${FRONTENDS[@]} " =~ " react " ]]; then
  sed -i '' '/\[if react\]/,/\[endif\]/d' README.md
fi

if [[ ! " ${FRONTENDS[@]} " =~ " react-native " ]]; then
  sed -i '' '/\[if react-native\]/,/\[endif\]/d' README.md
fi

# Filter backend-specific sections
if [ "$BACKEND" = "nestjs" ]; then
  sed -i '' '/\[if django\]/,/\[endif\]/d' README.md
elif [ "$BACKEND" = "django" ]; then
  sed -i '' '/\[if nestjs\]/,/\[endif\]/d' README.md
fi

# Filter dashboard sections
if [ "$CREATE_DASHBOARD" != true ]; then
  sed -i '' '/\[if dashboard\]/,/\[endif\]/d' README.md
fi

# Clean up remaining markers
sed -i '' '/\[if .*\]/d' README.md
sed -i '' '/\[endif\]/d' README.md

# Apply compress mode if enabled
if [ "$COMPRESS_MODE" = true ]; then
  sed -i '' '/^## Testing/,/^## Deployment/d' README.md
  sed -i '' '/^## Contributing/,/^## License/d' README.md
  echo "✓ Created compressed README.md (~50% size)"
else
  echo "✓ Created README.md in root directory"
fi
```

## Step 8: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Node
**/node_modules/
**/dist/
**/build/

# Python
**/__pycache__/
**/*.pyc
**/.venv/

# Environment
**/.env
**/.env.local
**/.env.*.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db
EOF
```

## Step 9: Initial Commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: Initial $PROJECT_NAME project setup

- .pi/ submodule using shared claude-workflow
- Backend: $BACKEND
- Frontend: $FRONTENDS
- Docker orchestration configured

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Step 10: Create GitHub Repo and Push

### 10.1 Create Main Project Repo on GitHub

```bash
gh repo create potentialInc/$PROJECT_NAME --private --description "$PROJECT_NAME - Full stack application"
```

### 10.2 Add Remote and Push main Branch

```bash
git remote add origin https://github.com/potentialInc/$PROJECT_NAME.git
git branch -M main
git push -u origin main
```

### 10.3 Create and Push dev Branch

```bash
git checkout -b dev
git push -u origin dev
```

### 10.4 Set dev as Default Branch (Optional)

```bash
gh repo edit potentialInc/$PROJECT_NAME --default-branch dev
```

### 10.5 Return to main Branch

```bash
git checkout main
```

## Step 11: Final Report

```
=== Project Setup Complete ===

$PROJECT_NAME/
├── .pi/              # Shared claude-workflow (base, nestjs, django, react, react-native)
├── .pi-project/      # Project docs (docs/, memory/, prd/, resources/, status/)
├── backend/              # $BACKEND boilerplate
├── frontend/             # React Web (if selected)
├── dashboard/            # Consolidated dashboard (if DASHBOARD_STRATEGY=single)
├── dashboard-{role}/     # Separate dashboards (if DASHBOARD_STRATEGY=separate)
├── mobile/               # React Native (if selected)
├── docker-compose.yml
├── .gitignore
├── CLAUDE.md
└── README.md

Migrated: HTML/ ($HTML_FILE_COUNT files) → .pi-project/resources/HTML/
Migrated: prd.pdf → .pi-project/prd/prd.pdf
Auto-Detected: Backend=$BACKEND_DETECTED, Frontend=$FRONTENDS_DETECTED, Dashboards=$DASHBOARDS_DETECTED

GitHub: https://github.com/potentialInc/$PROJECT_NAME (private)
Branches: main (production), dev (active development)

Next Steps:
1. cd $PROJECT_NAME
2. docker-compose up -d
3. Begin development on dev branch!
```

## Error Handling

| Error | Resolution |
|-------|------------|
| `gh` not authenticated | Run `gh auth login` |
| Repo already exists | Ask to use existing or choose new name |
| Clone failed | Check network and repo access |
| Directory not empty | Ask to proceed or choose new location |

## Rollback

If setup fails midway:

```bash
# Clean up local
rm -rf backend frontend frontend-dashboard mobile .claude .claude-project docker-compose.yml

# Clean up GitHub (if repo was created)
gh repo delete potentialInc/$PROJECT_NAME --yes
```
