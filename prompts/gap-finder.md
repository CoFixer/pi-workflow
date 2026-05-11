---
description: Scan project for missing designs, icons, and implementation gaps across all detected stacks
argument-hint: [scope] — frontend, backend, or all (default: all)
---

# /dev:gap-finder

Scan the full project for missing designs, icons, incomplete pages, placeholder content, and other implementation gaps. Supports multi-app projects (React web + React Native mobile + backend). Generates a structured markdown report.

## Usage

```
/dev:gap-finder
/dev:gap-finder frontend
/dev:gap-finder backend
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| scope | No | `frontend`, `backend`, or `all` (default: `all`) |

## Workflow

### Step 0: Parse Scope and Detect Stacks

#### 0a. Parse Scope

Determine scan scope from the argument:
- `frontend` — scan only frontend stacks (React web and/or React Native mobile)
- `backend` — scan only backend stack (NestJS or Django)
- `all` (default) — scan all detected stacks

#### 0b. Multi-Stack Detection

Read `CLAUDE.md` (or `.project/docs/PROJECT_KNOWLEDGE.md`) and verify with package/config files to detect ALL stacks:

| Stack | Primary Signal | Verification | Detected Directory |
|-------|---------------|-------------|-------------------|
| NestJS | `- **Backend**: nestjs` | `@nestjs/core` in package.json | `backend/` |
| Django | `- **Backend**: django` | `Django` in requirements.txt | `backend/` |
| React | `- **Frontend**: react` | `react` (not `react-native`) in package.json | `frontend/` or `web/` |
| React Native | `- **Frontend**: react-native` | `react-native` in package.json | `mobile/` or root |

For multi-app projects, also scan:
```bash
fd package.json -d 2 --exclude node_modules
```

If detection fails, ask:
> "Stack could not be auto-detected. Please specify which stacks exist: Backend: nestjs | django, Frontend: react | react-native (or both)"

#### 0c. Match Documentation

Map each detected stack to its documentation from the shared `.project/`:

| Stack | PRD | Design | API | HTML Prototypes | Database |
|-------|-----|--------|-----|----------------|----------|
| React | Full | Web sections | Full | `resources/HTML/web/` | - |
| React Native | Full | Mobile sections | Full | `resources/HTML/mobile/` | - |
| NestJS/Django | Full | - | Full | - | Full |

**Single-app fallback:** If `resources/HTML/` has no `web/` or `mobile/` subdirs, all HTML files belong to the single detected frontend.

**Emit banner:**
```
═══════════════════════════════════════════
DETECTED STACKS
─────────────────────────────────────────
  Backend:  {NestJS | Django}     → {backend/}
  Web:      {React}               → {frontend/}
  Mobile:   {React Native}        → {mobile/}
─────────────────────────────────────────
Docs:     .project/ (shared)
  Web HTML:    resources/HTML/web/
  Mobile HTML: resources/HTML/mobile/
─────────────────────────────────────────
Scope:    {all | frontend | backend}
═══════════════════════════════════════════
```

### Step 1: Load Reference Documents

Read all project documentation to establish the baseline:

```
.project/prd/prd.pdf              → Required features and screens
.project/docs/PROJECT_DESIGN_GUIDELINES.md → Design system rules
.project/docs/PROJECT_API.md       → API endpoint specifications
.project/docs/PROJECT_API_INTEGRATION.md → Frontend-API mapping
.project/docs/PROJECT_DATABASE.md  → Database schema
.project/docs/PROJECT_KNOWLEDGE.md → Architecture overview
```

HTML prototypes (matched to stack):
```
.project/resources/HTML/web/       → React web prototype screens
.project/resources/HTML/mobile/    → React Native prototype screens
```

### Step 2: Frontend Scan (if scope includes frontend)

For each detected frontend stack, read and execute the matching framework gap-finder:

| Stack | Gap-Finder File | SCAN_ROOT | HTML Prototypes |
|-------|----------------|-----------|----------------|
| React | `.pi/react/agents/gap-finder.md` | `frontend/` | `resources/HTML/web/` |
| React Native | `.pi/react-native/agents/gap-finder.md` | `mobile/` | `resources/HTML/mobile/` |

Read the gap-finder file and follow its instructions, substituting `{SCAN_ROOT}` with the detected directory. Check categories 1-7 and 9 for each page/screen.

Cross-reference:
- Compare implemented pages/screens vs PRD-required screens
- Compare against matched HTML prototypes
- Compare API calls vs `PROJECT_API_INTEGRATION.md`

### Step 3: Backend Scan (if scope includes backend)

Read and execute the matching backend gap-finder:

| Stack | Gap-Finder File | SCAN_ROOT | Categories |
|-------|----------------|-----------|------------|
| NestJS | `.pi/nestjs/agents/gap-finder.md` | `backend/` | 5, 8, 10a-b-d |
| Django | `.pi/django/agents/gap-finder.md` | `backend/` | 5, 7, 8, 10a-b-d |

Check the listed categories (backend-side) for each module/app.

### Step 4: Cross-Stack Analysis

Run coordinator-level checks that span multiple stacks:

1. **Data Binding Cross-Reference** — Compare frontend types against backend response shapes
2. **Rendered-but-Never-Returned Fields (Category 10e)** — Detect fields accessed/rendered in frontend JSX but never returned by the corresponding backend endpoint. Optional (`?`) typing masks these at compile time, but they produce empty UI at runtime. Includes special-case detection for destructure-then-spread patterns (`const { fieldA, ...rest } = entity; return { ...rest }`). See [gap-finder agent](../../agents/gap-finder.md) Step 4d for detailed bash commands.
3. **PRD Feature Coverage** — Check if features exist in all required stacks (web + mobile + API)
4. **Global Hardcoded Content** — One-time TODO/FIXME scan across entire project

### Severity Classification

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Missing pages/features required by PRD, infinite loops, empty UI from shape mismatch | Missing screen, broken route, unimplemented endpoint, infinite API calls, redirect loops, component accesses field backend never returns |
| **High** | Missing states or broken integrations, field name mismatches | No loading state, no error handling, API not connected, plural vs singular mismatch, camelCase vs snake_case without renderer |
| **Medium** | Design inconsistencies, missing icons, raw entity/model spreads | Wrong color, missing icon, wrong border-radius, raw entity spread, `fields = "__all__"` |
| **Low** | Accessibility, hardcoded content, undocumented shape differences | Missing aria-label/accessibilityLabel, hardcoded username, TODO comments |

### Step 5: Generate Report

Create the report directory if needed:

```bash
mkdir -p ./dev/reports
```

Write the gap analysis report to:
```
./dev/reports/gap-analysis-{YYYY-MM-DD}.md
```

The report includes stack-sectioned results:
- Executive Summary (combined totals)
- React Web Gaps (per-page, referencing `resources/HTML/web/`)
- React Native Gaps (per-screen, referencing `resources/HTML/mobile/`)
- Backend Gaps (per-module/app)
- Cross-Stack Gaps (data binding, PRD coverage, global hardcoded content)
- API Integration status (showing web + mobile columns)
- Top 10 priority recommendations

### Step 6: Display Summary

Show the user:
1. The Executive Summary table
2. Total gap count by severity
3. Top 3 most critical findings
4. Path to the full report file

## Examples

### Full Scan (Multi-App)
```
/dev:gap-finder
```
Detects NestJS + React + React Native, scans all three, generates unified report.

### Frontend Only
```
/dev:gap-finder frontend
```
Scans React web (`frontend/`) and React Native (`mobile/`) if both exist. Uses matched HTML prototypes for each.

### Backend Only
```
/dev:gap-finder backend
```
Scans only `backend/` modules for missing endpoints, validation, and documentation gaps.

## Error Handling

- If PRD file is missing: warn and continue with available docs
- If no page/module files found: report "No files found for scope: {scope}"
- If report directory creation fails: save to current directory instead
- If stack cannot be detected: ask user to specify stacks
- If framework gap-finder file is missing: warn user and suggest creating it at the expected path
- If `resources/HTML/` has no subdirectories: treat all HTML files as belonging to the single detected frontend

## Related

- [gap-finder agent](../../agents/gap-finder.md) — Multi-stack coordinator
- [react gap-finder](../../react/agents/gap-finder.md) — React-specific patterns
- [react-native gap-finder](../../react-native/agents/gap-finder.md) — React Native-specific patterns
- [nestjs gap-finder](../../nestjs/agents/gap-finder.md) — NestJS-specific patterns
- [django gap-finder](../../django/agents/gap-finder.md) — Django-specific patterns
- [gap-finder skill](../../skills/gap-finder/SKILL.md) — Methodology reference
- [code-architecture-reviewer](../../agents/code-architecture-reviewer.md)
- [api-integration-agent](../../agents/api-integration-agent.md)
