---
skill_name: dashboard-builder
applies_to_local_project_only: true
auto_trigger_regex: [dashboard, admin dashboard, admin panel, crud operations, admin ui]
tags: [builders, dashboard, admin, crud]
related_skills: [figma-to-react-converter, design-qa-figma]
phase: 6
prerequisites: [backend, frontend]
description: Build admin dashboard with CRUD operations for all backend models and analytics visualizations
---

# Dashboard Builder Skill

Phase 6 of the fullstack pipeline. Creates an admin dashboard with CRUD operations and analytics, following the project's existing design system.

## Context

- **Project**: Read from PIPELINE_STATUS.md
- **Previous phases**: backend (API endpoints), frontend (design patterns)
- **Expected input**:
  - `.project/docs/PROJECT_DATABASE.md` - Entity definitions
  - `.project/docs/PROJECT_API.md` - API endpoints
  - `frontend/` or `mobile/` - Existing design patterns
- **Expected output**: `frontend-admin-dashboard/` folder with complete admin UI

---

## Smart Detection

### Check 1: Does dashboard folder exist?

```bash
ls -la frontend-admin-dashboard/ 2>/dev/null
```

**If folder does NOT exist:**
- Create new dashboard from scratch
- Execute full setup (Path A)

**If folder EXISTS:**
- Check for existing components
- Execute incremental update (Path B)

### Check 2: Read Project Documentation

```bash
# Required docs for dashboard generation
cat .project/docs/PROJECT_DATABASE.md  # Entity definitions
cat .project/docs/PROJECT_API.md       # API endpoints
```

---

## Dashboard Path Selection

Use **AskUserQuestion** to determine implementation approach:

```
Question: "How would you like to create the admin dashboard?"
Header: "Dashboard Path"
Options:
  1. "Generate from scratch (Recommended)" - Auto-generate CRUD for all models using project design system
  2. "Use template" - Clone from existing admin dashboard template
  3. "Convert from Figma" - Implement from Figma dashboard designs
```

---

## Execution Path A: Generate from Scratch

### A.1 Project Setup

```bash
# Create dashboard folder structure
# Note: Replace {dashboard-folder} with actual folder name from user or detected pattern
mkdir -p {dashboard-folder}/{src/{components,pages,hooks,services,types,styles,layouts},public}

# Initialize React project (if not using template)
cd {dashboard-folder}
npm init -y
```

### A.2 Design System Configuration

Extract design tokens from the project's existing frontend:

**Steps to Extract Design System:**

1. **Check Tailwind Config** - Read `tailwind.config.ts` for color definitions:
   ```bash
   cat frontend/tailwind.config.ts
   ```

2. **Analyze Existing Components** - Review component styles for patterns:
   ```bash
   grep -r "bg-" frontend/app/components/ | head -20
   grep -r "text-" frontend/app/components/ | head -20
   ```

3. **Extract CSS Variables** - Check for design tokens in global CSS:
   ```bash
   cat frontend/app/globals.css
   ```

4. **Create Theme File** - Generate `src/styles/theme.ts` based on discovered patterns:
   ```typescript
   // Extract colors, fonts, spacing from existing frontend
   // Match the project's visual language exactly
   export const theme = {
     colors: { /* extracted from tailwind.config.ts */ },
     borderRadius: { /* extracted from project patterns */ },
     fonts: { /* extracted from project typography */ },
   };
   ```

**Key Principle:** The dashboard design system should match the existing frontend exactly.

### A.3 Model Discovery

Parse entities from PROJECT_DATABASE.md. Organize models by priority:

| Priority | Description | Examples |
|----------|-------------|----------|
| High | Core entities users interact with frequently | User, PrimaryEntity, MainResource |
| Medium | Supporting entities | Category, Tag, Metadata |
| Low | System/audit entities | Notification, Log, Setting |

**Example structure:**
- User: id, email, name, role, avatar
- {PrimaryEntity}: id, name, description, status, userId
- {Category}: id, name, type, parentId
- {RelatedEntity}: id, primaryId, data, createdAt

### A.4 Generate CRUD Components

For each model, generate:

#### List View Component
```typescript
// src/pages/{model}/List.tsx
// Features:
// - Data table with pagination
// - Search/filter bar
// - Sort by columns
// - Bulk actions
// - Row actions (view, edit, delete)
```

#### Detail View Component
```typescript
// src/pages/{model}/Detail.tsx
// Features:
// - Read-only view of all fields
// - Related entities display
// - Action buttons (edit, delete)
// - Back navigation
```

#### Create/Edit Form Component
```typescript
// src/pages/{model}/Form.tsx
// Features:
// - Form fields based on entity schema
// - Validation
// - Image upload for imageUrl fields
// - Dropdown/select for foreign keys
// - Submit/cancel buttons
```

### A.5 Generate Analytics Dashboard

```typescript
// src/pages/Dashboard/index.tsx
// Features:
// - Model count cards (total users, artworks, etc.)
// - Recent activity feed
// - Verification queue (pending artists/galleries)
// - Charts: User growth, Artwork additions over time
```

### A.6 Layout Components

#### Sidebar Navigation
```typescript
// src/layouts/Sidebar.tsx
// Navigation items (generated from discovered models):
// - Dashboard (home)
// - Users
// - {PrimaryEntity} (plural)
// - {SecondaryEntity} (plural)
// - {Category} (plural)
// - Settings
// - Reports (if analytics needed)
```

#### Header
```typescript
// src/layouts/Header.tsx
// Features:
// - Search bar
// - User menu (profile, logout)
// - Notification bell
```

#### Panel Container
```typescript
// src/components/Panel.tsx
// Extract design from existing project:
// - Read tailwind.config.ts for card/panel styles
// - Match border radius from existing components
// - Use project's shadow/border patterns
// - Ensure consistent spacing with design system
```

### A.7 API Service Layer

```typescript
// src/services/api.ts
// Generic CRUD service factory:
// - list(params): GET /api/{model}
// - getById(id): GET /api/{model}/{id}
// - create(data): POST /api/{model}
// - update(id, data): PATCH /api/{model}/{id}
// - delete(id): DELETE /api/{model}/{id}
```

### A.8 Routing Setup

```typescript
// src/App.tsx routes:
// /dashboard - Analytics home
// /users - User list
// /users/:id - User detail
// /users/create - Create user
// /users/:id/edit - Edit user
// (repeat for each model)
```

---

## Execution Path B: Incremental Update

When dashboard already exists:

### B.1 Check Existing Models

Compare PROJECT_DATABASE.md with existing CRUD pages:
- List new models not yet implemented
- Identify schema changes requiring updates

### B.2 Generate Missing Components

Only generate components for:
- New models added to backend
- Models with schema changes

### B.3 Update Navigation

Add new models to sidebar navigation.

---

## Execution Path C: Convert from Figma

If user has Figma designs for dashboard:

### C.1 Gather Figma URL

Ask for dashboard Figma file URL.

### C.2 Extract Design Specs

Use Figma MCP tools:
```
mcp__figma__get_screenshot(nodeId)
mcp__figma__get_design_context(nodeId)
```

### C.3 Implement from Designs

Follow convert-figma-to-react.md skill for implementation.

---

## Component Templates

### Data Table Component

```typescript
// src/components/DataTable.tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  pagination?: PaginationConfig;
}
```

### Form Field Components

```typescript
// src/components/form/
// - TextField
// - SelectField
// - DateField
// - ImageUploadField
// - TextAreaField
// - SwitchField (boolean)
```

### Card Component

```typescript
// src/components/Card.tsx
// Stat card for dashboard:
// - Icon
// - Title
// - Value
// - Trend indicator
```

---

## Completion Criteria

- [ ] `frontend-admin-dashboard/` folder exists
- [ ] Design system matches existing frontend (dark theme, violet accent)
- [ ] CRUD pages exist for all priority models (User, Artist, Artwork minimum)
- [ ] Analytics dashboard home page with model counts
- [ ] Sidebar navigation with all model links
- [ ] API service layer connecting to backend endpoints
- [ ] Routing configured for all CRUD operations
- [ ] Build passes without errors

## On Success

Update PIPELINE_STATUS.md:
```
| dashboard | dashboard-builder.md | react | :white_check_mark: | backend, frontend | frontend-admin-dashboard/ | Complete |
```

Add to Execution Log:
```
| {DATE} | dashboard | {DURATION} | :white_check_mark: | Generated CRUD for {N} models |
```

## On Failure

Update PIPELINE_STATUS.md:
```
| dashboard | dashboard-builder.md | react | :x: | backend, frontend | - | {ERROR_MESSAGE} |
```

Common failures:
- PROJECT_DATABASE.md not found → Run database phase first
- PROJECT_API.md not found → Run backend phase first
- Build errors → Check dependencies and TypeScript config

---

## Related Skills

- [figma-to-react-converter.md](../converters/figma-to-react-converter.md) - Figma to React conversion
- [design-qa.md](../qa/design-qa.md) - Design verification
- [api-integration.md](../../guides/api-integration.md) - API connection patterns
