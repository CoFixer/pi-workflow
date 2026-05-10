---
description: Convert HTML prototypes to React components with routing
argument-hint: "[--analyze | --map | --prompts | --status]"
---

# HTML to React Conversion Command

You are an HTML-to-React conversion specialist. Your task is to generate structured conversion prompts for transforming static HTML prototype screens into React components across discovered frontend applications.

---

## Overview

**System Goals:**
- Discover HTML files and frontend structure dynamically
- Generate mapping from HTML files → React frontends + routes
- Create token-optimized conversion prompts
- Extract shared components from repeated patterns
- Follow PROJECT_KNOWLEDGE architecture patterns

**Output Location:** `.pi-project/resources/prompts/html-to-react/`

**HTML Source:** `.pi-project/resources/HTML/` (auto-discovered)

---

## Prerequisites Check

Before running any command phase, verify:

1. **HTML files exist:**
   ```bash
   fd -e html . .pi-project/resources/HTML
   ```
   - Should contain HTML prototype files
   - Can be organized in subfolders by category (optional)

2. **Project documentation exists (optional but recommended):**
   - `.pi-project/docs/PROJECT_KNOWLEDGE.md` - Architecture and frontend definitions
   - `.pi-project/docs/PROJECT_API.md` - API endpoints
   - `.pi/react/skills/converters/html-to-react-converter.md` - Conversion patterns

3. **Frontend directories exist:**
   ```bash
   fd -t d '^frontend' . --max-depth 1
   ```
   - Discovers all directories starting with "frontend"
   - Extracts port numbers from package.json

---

## Command Usage

### Arguments

**No arguments** - Show status and inventory
```bash
/html-to-react
```

**--analyze** - Analyze HTML files and identify shared components
```bash
/html-to-react --analyze
```

**--map** - Generate mapping.json (HTML → Frontend + Route)
```bash
/html-to-react --map
```

**--prompts** - Generate all conversion prompt files
```bash
/html-to-react --prompts
```

**--status** - Show conversion progress
```bash
/html-to-react --status
```

---

## Argument Detection (EXECUTE FIRST)

**CRITICAL: Before executing ANY phase, you MUST parse `$ARGUMENTS` and execute ONLY the matching phase.**

### Parse $ARGUMENTS

```
argument = $ARGUMENTS (one of: --analyze, --map, --prompts, --status, or empty)
```

### Routing Table

| $ARGUMENTS | Execute Phase | Skip |
|------------|---------------|------|
| (empty) | Phase 1: Status Overview | Phases 2-5 |
| `--analyze` | Phase 2: Analyze | Phases 1,3,4,5 |
| `--map` | Phase 3: Map | Phases 1,2,4,5 |
| `--prompts` | Phase 4: Prompts | Phases 1,2,3,5 |
| `--status` | Phase 5: Status | Phases 1,2,3,4 |

### Execution Instructions

1. **PARSE** `$ARGUMENTS` for: `--analyze`, `--map`, `--prompts`, `--status`
2. **SKIP** directly to the matching phase section
3. **EXECUTE** all steps within that phase only
4. **DISPLAY** the phase completion message
5. **STOP** - do NOT continue to other phases

### Example

```
User: /html-to-react --analyze
$ARGUMENTS = "--analyze"

Step 1: Parse $ARGUMENTS → detected "--analyze"
Step 2: Skip to "## Phase 2: Analyze"
Step 3: Execute Phase 2 steps (read HTML, extract patterns, create analysis.md)
Step 4: Display "✅ Analysis complete!"
Step 5: STOP - do not execute Phase 1, 3, 4, or 5
```

---

## Phase 1: No Arguments (Status Overview)

**Execute this phase ONLY when `$ARGUMENTS` is empty. If `$ARGUMENTS` contains any flag (--analyze, --map, --prompts, --status), SKIP this phase.**

When invoked without arguments, show:

### 1. HTML File Inventory

```bash
# Count total HTML files
HTML_COUNT=$(fd -e html . .pi-project/resources/HTML | wc -l)
echo "Total HTML files: $HTML_COUNT"

# List files with relative paths
fd -e html . .pi-project/resources/HTML
```

### 2. Category Detection

Analyze folder structure to detect categories:
```bash
# Detect categories from folder names
fd -t d . .pi-project/resources/HTML --max-depth 1 | sed 's|.*/||'
```

Display discovered categories and file counts per category.

### 3. Frontend Discovery

Discover all frontend directories:
```bash
# Find frontend directories
FRONTENDS=$(fd -t d '^frontend' . --max-depth 1)

# For each frontend, extract info
for frontend in $FRONTENDS; do
  # Get directory name
  NAME=$(basename $frontend)

  # Extract port from package.json
  PORT=$(cat $frontend/package.json | jq -r '.scripts.dev' | grep -oP ':\d+' | tr -d ':')

  # Check if frontend exists and is configured
  echo "$NAME (port: $PORT)"
done
```

### 4. Check PROJECT_KNOWLEDGE.md

```bash
# Check if architecture docs exist
if [ -f .pi-project/docs/PROJECT_KNOWLEDGE.md ]; then
  echo "✅ PROJECT_KNOWLEDGE.md found - will use for frontend mapping"

  # Extract frontend structure from docs
  grep -A 10 "Project Structure" .pi-project/docs/PROJECT_KNOWLEDGE.md
else
  echo "⚠️  PROJECT_KNOWLEDGE.md not found - will infer from directory structure"
fi
```

### 5. Output Directory Status

```bash
ls -la .pi-project/resources/prompts/html-to-react/ 2>&1
```

Show status:
- ✅ Created - Directory exists with prompts
- ❌ Not created - Run `/html-to-react --prompts` to generate

### 6. Next Steps

Display recommended workflow:
```
1. /html-to-react --analyze   # Analyze HTML patterns
2. /html-to-react --map       # Generate mapping
3. /html-to-react --prompts   # Create conversion prompts
4. Review prompts in output directory
5. Execute conversions following prompt instructions
```

---

## Phase 2: Analyze (`--analyze`)

**Execute this phase ONLY when `--analyze` is provided. SKIP all other phases.**

### Purpose

Analyze all HTML files dynamically to:
1. Identify repeating patterns (components used in 3+ files)
2. Extract design system (colors, fonts, spacing)
3. Catalog interactive elements (forms, toggles, modals)
4. List shared component candidates

### Actions

#### Step 1: Discover and Read All HTML Files

```bash
# Discover all HTML files
HTML_FILES=$(fd -e html . .pi-project/resources/HTML)

# Read each file
for file in $HTML_FILES; do
  echo "Reading: $file"
  # Use Read tool for each file
done
```

**Automatic categorization:**
- Group files by parent folder name (e.g., auth/, admin/, business-user/)
- If no subfolders, all files treated as single category

#### Step 2: Identify Shared Component Patterns

Scan for repeating HTML structures across multiple files (threshold: 3+ occurrences):

**Pattern Recognition Categories:**
1. **Navigation patterns** (sidebar, header, breadcrumbs)
2. **Data display patterns** (cards, tables, lists)
3. **Form patterns** (inputs, selects, checkboxes, radio)
4. **Modal/overlay patterns**
5. **Badge/status indicators**
6. **Button patterns**

**Detection Method:**
- Track CSS class patterns: `class="[pattern]"`
- Count occurrences across files
- Components with 3+ instances → shared component candidates

#### Step 3: Extract Design System

**Color Palette:**
- Extract Tailwind color classes from all HTML files
- Parse color values from inline styles or `<style>` blocks
- Group by color family (slate, indigo, emerald, etc.)

**Typography:**
- Extract font families from `<link>` tags or inline styles
- Identify font weights used (`font-light`, `font-semibold`, etc.)
- List text size classes (`text-xs`, `text-sm`, `text-lg`, etc.)

**Spacing:**
- Catalog padding classes (`p-2`, `p-4`, `px-6`, etc.)
- List gap classes (`gap-2`, `gap-4`, etc.)
- Identify border radius patterns (`rounded-lg`, `rounded-xl`, etc.)

#### Step 4: Catalog Interactive Elements

**Form Interactions:**
- Login/signup forms
- Search inputs
- Filter selects
- Toggle switches

**Toggle/Visibility:**
- Dropdown menus (detect `class="hidden"` with JS toggles)
- Modal overlays
- Accordion sections
- Sidebar collapse

**Navigation:**
- File-based links: `<a href="./page.html">` or `<a href="/page.html">`
- Back buttons: `window.history.back()` or `onclick="history.back()"`
- External links: `<a href="http...">`

#### Step 5: Extract JavaScript Event Handlers (CRITICAL)

**Purpose:** Catalog ALL JavaScript functions and event handlers for React conversion.

**Scan each HTML file for:**

1. **Inline event attributes:**
   ```
   onclick, onchange, onsubmit, onfocus, onblur, oninput, onkeydown, onkeyup
   ```

2. **Script block functions:**
   - Read all `<script>...</script>` content
   - Extract function definitions: `function functionName(...) { ... }`
   - Extract arrow functions: `const functionName = (...) => { ... }`

3. **DOM manipulation anti-patterns (count occurrences):**
   ```javascript
   document.getElementById()      // → useRef() or controlled inputs
   document.querySelector()       // → useRef() or controlled inputs
   element.classList.add/remove/toggle()  // → conditional rendering
   element.innerHTML =            // → JSX with state
   element.value                  // → controlled input state
   ```

4. **Navigation patterns:**
   ```javascript
   window.location.href =         // → useNavigate() hook
   window.location.replace()      // → useNavigate() hook
   window.history.back()          // → useNavigate(-1)
   ```

5. **Storage patterns:**
   ```javascript
   localStorage.setItem/getItem   // → Redux or Context
   sessionStorage.setItem/getItem // → Redux or Context
   ```

**For each HTML file with `<script>`, extract:**

| Function Name | Purpose | Anti-Patterns Used | React Conversion Strategy |
|---------------|---------|-------------------|---------------------------|
| `handleLogin(event)` | Form submission | getElementById(4x), sessionStorage, window.location | React Hook Form + useNavigate + Redux |
| `togglePassword()` | Toggle visibility | getElementById(2x), setAttribute | useState<boolean> |
| `showError(message)` | Display error | getElementById, innerHTML | Toast notification or error state |

### Output: Create `analysis.md`

```bash
# Create output directory
mkdir -p .pi-project/resources/prompts/html-to-react

# Write analysis.md
Write: .pi-project/resources/prompts/html-to-react/analysis.md
```

**analysis.md Structure:**

```markdown
# HTML Screens Analysis Report

Generated: [Current Date]

---

## HTML File Inventory

**Total Files:** [Dynamic Count]

### By Category

| Category | Count | Files |
|----------|-------|-------|
| [Category 1] | [Count] | [File list] |
| [Category 2] | [Count] | [File list] |
...

---

## Shared Component Candidates

### High Priority (P0 - 3+ instances)

[List discovered components with usage counts]

Example:
1. **Sidebar** (X instances)
   - Used in: [file list]
   - Pattern: `<aside class="...">` or similar

2. **StatCard** (X instances)
   - Used in: [file list]
   - Pattern: `<div class="bg-... rounded-... p-...">`

### Medium Priority (P1 - 2-3 instances)

[Additional components]

---

## Design System

### Color Palette

[Extracted colors from Tailwind classes or inline styles]

### Typography

- Font: [Detected font family]
- Weights: [List of weights found]

### Spacing

[Common padding, margin, gap values]

---

## Interactive Patterns

### Forms
[List of form patterns discovered]

### Navigation
[Navigation patterns found]

### Toggles
[Toggle/visibility patterns]

---

## JavaScript Event Handlers

### Anti-Pattern Summary

| Pattern | Total Count | React Equivalent |
|---------|-------------|------------------|
| `document.getElementById()` | [count] | `useRef()` or controlled inputs |
| `window.location.href` | [count] | `useNavigate()` hook |
| `classList.toggle()` | [count] | Conditional rendering with useState |
| `innerHTML =` | [count] | JSX with state |
| `sessionStorage/localStorage` | [count] | Redux or Context |

### Event Handlers by File

[For each HTML file with JavaScript, list:]

#### [filename].html

| Function | Purpose | Anti-Patterns | React Strategy |
|----------|---------|---------------|----------------|
| `functionName()` | [inferred purpose] | [pattern list] | [conversion approach] |

---
```

### Completion Message

Display:
```
✅ Analysis complete!

Discovered:
- [X] HTML files
- [Y] categories
- [Z] shared component candidates
- [N] JavaScript event handlers extracted
- [M] anti-pattern occurrences cataloged

Output: .pi-project/resources/prompts/html-to-react/analysis.md

Design Guidelines:
  📄 .pi-project/docs/PROJECT_DESIGN_GUIDELINES.md

  Reference during conversion for:
  ✓ Component states (Section 6) - hover, focus, active, disabled
  ✓ Color tokens (Section 1) - use extracted values, not hardcoded
  ✓ Transition timing (Section 7) - duration and easing functions
  ✓ Spacing system (Section 3) - padding, margins, gaps
  ✓ Typography scale (Section 2) - font sizes, weights, line heights

Next step: Run /html-to-react --map to generate mapping.json
```

---

## Phase 3: Map (`--map`)

**Execute this phase ONLY when `--map` is provided. SKIP all other phases.**

### Purpose

Generate `mapping.json` that dynamically maps each HTML file to:
- Target frontend (discovered)
- Route path (inferred from filename)
- Page component path
- Required API endpoints (from PROJECT_API.md if available)
- Shared/new components

### Actions

#### Step 1: Discover Project Structure

```bash
# 1. Find all frontend directories
FRONTENDS=$(fd -t d '^frontend' . --max-depth 1)

# 2. Extract frontend info
for frontend in $FRONTENDS; do
  NAME=$(basename $frontend)

  # Get port from package.json
  if [ -f "$frontend/package.json" ]; then
    PORT=$(cat $frontend/package.json | jq -r '.scripts.dev' | grep -oP ':\d+' | tr -d ':')
  else
    PORT="unknown"
  fi

  # Infer purpose from name
  # frontend -> main app
  # dashboard -> admin/privileged roles
done
```

#### Step 2: Read Documentation

```bash
# Read project docs if available
if [ -f .pi-project/docs/PROJECT_KNOWLEDGE.md ]; then
  Read: .pi-project/docs/PROJECT_KNOWLEDGE.md
  # Extract frontend structure and purpose from docs
fi

if [ -f .pi-project/docs/PROJECT_API.md ]; then
  Read: .pi-project/docs/PROJECT_API.md
  # Extract API endpoint mappings
fi
```

#### Step 3: Read Analysis

```bash
Read: .pi-project/resources/prompts/html-to-react/analysis.md
```

#### Step 4: Infer Mapping Rules

**Category → Frontend Mapping:**

1. **Read PROJECT_KNOWLEDGE.md** for explicit frontend definitions
   - Look for "Frontend Architecture" or "Project Structure" sections
   - Extract frontend purpose/role

2. **If not documented, infer from names:**
   - `auth/` folder → Main frontend (frontend/)
   - `admin/`, `ops/`, `organizer/` folders → Dashboard (dashboard/ or dashboard-{role}/)
     - Single dashboard: all privileged roles → dashboard/
     - Separate dashboards: admin/ → dashboard-admin/, ops/ → dashboard-ops/, etc.
   - Files without category → Main frontend

3. **If only one frontend exists:**
   - All HTML files → That single frontend

**Route Generation Rules:**

1. **Strip numbering prefix:** `02-login.html` → `login.html`
2. **Remove extension:** `login.html` → `login`
3. **Convert to kebab-case:** `businessHome` → `business-home`
4. **Apply category prefix:**
   - Auth category → `/auth/{page}`
   - Settings category → `/settings/{page}`
   - Other categories → `/{page}`

#### Step 5: Cross-Reference API Endpoints

For each screen, identify API endpoints from PROJECT_API.md (if available):
- Search for endpoint patterns matching the screen purpose
- Example: Login page → search for `/auth/login` endpoint
- User management → search for `/users` endpoints

### Output: Create `mapping.json`

```bash
Write: .pi-project/resources/prompts/html-to-react/mapping.json
```

**mapping.json Structure:**

```json
{
  "version": "1.0",
  "generated_at": "[ISO timestamp]",
  "html_source": ".pi-project/resources/HTML",
  "html_inventory": {
    "total_files": "[discovered count]",
    "by_category": {
      "[category]": "[count]",
      ...
    }
  },
  "frontends": [
    {
      "name": "[discovered frontend name]",
      "directory": "[frontend directory]",
      "port": "[discovered port]",
      "purpose": "[inferred or from docs]",
      "file_count": "[mapped files count]"
    }
  ],
  "mappings": [
    {
      "html_path": "[relative path]",
      "target_frontend": "[discovered frontend name]",
      "target_route": "[generated route]",
      "page_component": "[inferred component path]",
      "category": "[detected category]",
      "requires_auth": "[inferred from category]",
      "shared_components": "[from analysis.md]",
      "new_components": "[inferred from filename]",
      "api_endpoints": "[from PROJECT_API.md or empty array]",
      "priority": "[high/medium/low based on category]",
      "status": "pending"
    }
  ]
}
```

### Validation

After generating mapping.json:

1. **File count:** Verify all discovered HTML files are mapped
2. **No duplicates:** Each HTML file mapped exactly once
3. **Frontend distribution:** All frontends have at least one file
4. **Routes unique:** No duplicate route paths within same frontend

### Completion Message

Display:
```
✅ Mapping complete!

Output: .pi-project/resources/prompts/html-to-react/mapping.json

Discovered:
- [X] HTML files mapped
- [Y] frontend applications
- [Z] categories

Validation:
- ✅ All HTML files mapped
- ✅ No duplicates
- ✅ Routes unique per frontend

Next step: Run /html-to-react --prompts to generate conversion prompts
```

---

## Phase 4: Prompts (`--prompts`)

**Execute this phase ONLY when `--prompts` is provided. SKIP all other phases.**

### Purpose

Generate token-optimized conversion prompt files for each discovered frontend, organized by category.

### Actions

#### Step 1: Read Dependencies

```bash
Read: .pi-project/resources/prompts/html-to-react/mapping.json
Read: .pi-project/resources/prompts/html-to-react/analysis.md
Read: .pi/react/skills/converters/html-to-react-converter.md

# Optional: Read project docs if available
if [ -f .pi-project/docs/PROJECT_KNOWLEDGE.md ]; then
  Read: .pi-project/docs/PROJECT_KNOWLEDGE.md
fi

if [ -f .pi-project/docs/PROJECT_API.md ]; then
  Read: .pi-project/docs/PROJECT_API.md
fi
```

#### Step 2: Create Dynamic Directory Structure

```bash
# Parse mapping.json to get frontend list
FRONTENDS=$(jq -r '.frontends[].name' mapping.json)

# Create directory for each frontend
for frontend in $FRONTENDS; do
  mkdir -p .pi-project/resources/prompts/html-to-react/$frontend
done
```

#### Step 3: Generate Shared Components Catalog

```bash
Write: .pi-project/resources/prompts/html-to-react/shared-components.json
```

**Content:** Dynamic JSON based on analysis.md shared components

```json
{
  "components": [
    {
      "name": "[Component Name]",
      "path": "app/components/[category]/[ComponentName].tsx",
      "usage_count": "[from analysis]",
      "used_in": "[file list from analysis]",
      "html_pattern": "[extracted pattern]",
      "props": {
        "[prop_name]": "[inferred type]"
      }
    }
  ]
}
```

#### Step 4: Generate Frontend Prompts (Dynamic)

For each discovered frontend:

1. **Query mapping.json** for files mapped to this frontend
2. **Group by category** (from HTML folder structure)
3. **Generate prompts:**
   - `00-shared-components.md` (always first, P0 priority)
   - `01-[category]-screens.md` (one per category, sorted by priority)

**Priority Assignment:**
- Auth category → High (P1)
- Main/dashboard category → High (P1)
- Settings category → Medium (P2)
- Other categories → Medium (P2)

**Prompt Template (Dynamic):**

```markdown
---
frontend: "[discovered-frontend-name]"
port: [discovered-port]
category: "[discovered-category]"
html_files: [dynamic-count]
priority: "[P0/P1/P2]"
depends_on: "[dependency]"
---

# [Category] - React Conversion

## Context

Converting [count] HTML screens to React components for [frontend-name].

**Architecture:**
- React 19 + React Router v7 (or detected router)
- State management: [detected from package.json]
- UI library: [detected from package.json]
- Styling: Tailwind CSS

**Reference:**
- Conversion: `.pi/react/skills/converters/html-to-react-converter.md`
[If PROJECT_API.md exists:]
- API: `.pi-project/docs/PROJECT_API.md`
[If PROJECT_KNOWLEDGE.md exists:]
- Architecture: `.pi-project/docs/PROJECT_KNOWLEDGE.md`

---

## Screens to Convert

[For each HTML file in this category:]

### Screen [N]: [Inferred Name]

**HTML:** [html_path]
**Target Component:** [page_component from mapping]
**Route:** [target_route from mapping]

[If API endpoints found:]
**API Integration:**
- [List of endpoints from mapping]

**Shared Components:**
- [List from mapping.shared_components]

**New Components:**
- [List from mapping.new_components]

**Event Handlers to Convert:**
[From analysis.md, list each function for this screen:]

| HTML Function | React Implementation |
|---------------|---------------------|
| `handleLogin(event)` | `useForm()` + `onSubmit` handler |
| `togglePassword()` | `useState<boolean>` for visibility |
| `showError(msg)` | Toast notification or error state |

**Event Conversion Checklist:**
- [ ] All forms use React Hook Form with Zod validation
- [ ] All inputs are controlled components (no getElementById)
- [ ] Navigation uses `useNavigate()` hook (no window.location)
- [ ] Toggle states use `useState` (no classList manipulation)
- [ ] Error handling uses toast or state (no innerHTML)

**Implementation Notes:**
- [Inferred from analysis patterns]

---

[Repeat for each screen]

---

## Implementation Checklist

- [ ] Install required dependencies
- [ ] Create shared components (if not already present)
- [ ] Convert screen [1]: [name]
- [ ] Convert screen [2]: [name]
...
- [ ] Set up routing
- [ ] Test navigation flows
- [ ] Run design QA

## Post-Conversion Validation

**Run these commands after each screen conversion (should return 0 results):**

```bash
# Anti-pattern detection
rg "document\.(getElementById|querySelector)" [component-path]
rg "window\.location\.(href|replace)" [component-path]
rg "classList\.(add|remove|toggle)" [component-path]
rg "innerHTML\s*=" [component-path]

# Verify React patterns are present
rg "useForm|useNavigate|useState" [component-path]  # Should find matches
```

---
```

#### Step 5: Generate Shared Components Prompt

For each frontend, create `00-shared-components.md`:

```markdown
---
frontend: "[frontend-name]"
priority: "P0"
depends_on: null
---

# Shared Components - Create First

## Context

Before converting screens, create these shared components identified from HTML analysis.

**Components to Create:** [count from analysis.md]

---

[For each shared component from analysis.md:]

## Component: [Name]

**Usage:** [count] instances across [file list]

**HTML Pattern:**
```html
[extracted pattern]
```

**React Implementation:**

```tsx
// app/components/[category]/[ComponentName].tsx

interface [ComponentName]Props {
  [inferred props]
}

export function [ComponentName]({ [props] }: [ComponentName]Props) {
  return (
    [converted JSX]
  );
}
```

**Usage Example:**
```tsx
<[ComponentName] [example props] />
```

---

[Repeat for each component]

---

## Validation Checklist

- [ ] All shared components created
- [ ] Props interfaces defined
- [ ] TypeScript types correct
- [ ] Components exported properly
- [ ] Basic usage tested

---
```

### Validation

After generating prompts:

1. **File count:** One directory per discovered frontend
2. **Prompt completeness:** Each frontend has at least `00-shared-components.md`
3. **Category coverage:** All categories from mapping.json have prompts
4. **Token budget:** Each prompt reasonable size (suggest 8k-12k tokens)

### Completion Message

Display dynamic summary:
```
✅ Prompts generated successfully!

Output directory: .pi-project/resources/prompts/html-to-react/

Files created:
- mapping.json
- shared-components.json
- analysis.md

[For each discovered frontend:]
[Frontend Name] ([X] files):
  ✅ 00-shared-components.md
  ✅ 01-[category]-screens.md ([Y] screens)
  ✅ 02-[category]-screens.md ([Z] screens)
  ...

---

Next Steps:
1. Review prompts in output directory
2. Start with [first-frontend]/00-shared-components.md (CRITICAL)
3. Then convert screens following category order (P0 → P1 → P2)
4. Run design QA after each conversion
```

---

## Phase 5: Status (`--status`)

**Execute this phase ONLY when `--status` is provided. SKIP all other phases.**

### Purpose

Show current conversion progress by checking mapping.json status field.

### Actions

#### Step 1: Check if Mapping Exists

```bash
if [ ! -f .pi-project/resources/prompts/html-to-react/mapping.json ]; then
  echo "❌ Mapping not found. Run /html-to-react --map first."
  exit 1
fi
```

#### Step 2: Read Mapping

```bash
Read: .pi-project/resources/prompts/html-to-react/mapping.json
```

#### Step 3: Calculate Progress Dynamically

Parse mapping.json and count:
- Total files: `jq '.html_inventory.total_files' mapping.json`
- Pending: `jq '[.mappings[] | select(.status=="pending")] | length' mapping.json`
- In Progress: `jq '[.mappings[] | select(.status=="in_progress")] | length' mapping.json`
- Completed: `jq '[.mappings[] | select(.status=="completed")] | length' mapping.json`

#### Step 4: Display Status by Frontend (Dynamic)

For each frontend in mapping.json:
```
[Frontend Name] Status ([X] files):
  ✅ Completed: [count]
  🔄 In Progress: [count]
  ⏳ Pending: [count]
  Progress: [percentage]% ([completed]/[total])
```

Calculate overall progress:
```
Overall Progress: [percentage]% ([completed]/[total])
```

#### Step 5: Show Next Actions

Display recommended next steps based on current progress:
```
Next Actions:
1. [If in_progress > 0] Complete in-progress screens first
2. [If pending > 0] Convert pending screens following priority order (P0 → P1 → P2)
3. Run design QA after each screen conversion
```

---

## Related Resources

**Skills:**
- `.pi/react/skills/converters/html-to-react-converter.md` - Conversion patterns
- `.pi/react/skills/design-qa-html.md` - Visual QA tool (if available)

**Project Docs (if available):**
- `.pi-project/docs/PROJECT_KNOWLEDGE.md` - Architecture
- `.pi-project/docs/PROJECT_API.md` - API endpoints

**Commands:**
- `/commit` - Commit changes
- `/design-qa` - Run visual QA (if available)

---

## Notes

- Always create shared components (00-shared-components.md) before converting screens
- Follow token optimization strategies (reference files, use snippets)
- Validate after each phase (file count, routes, types)
- Use frontend-developer agent for actual conversion execution (if available)
- Run design QA to verify implementation matches HTML (if available)
- Command adapts to any project structure through discovery
- Supports single or multiple frontend applications

---
