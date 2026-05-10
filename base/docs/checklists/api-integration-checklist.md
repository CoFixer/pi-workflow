# API Integration Checklist

Detailed validation checklists for API integration auditing. Referenced by the api-integration-agent during Phase 2.5.

---

## Common Gap Checklist

### Pagination Gaps
- [ ] Frontend passes page/limit but backend ignores
- [ ] Backend returns total but frontend doesn't use
- [ ] "Load More" calls incorrect offset
- [ ] Page state not persisted in URL
- [ ] Pagination resets on filter change

### Search Gaps
- [ ] Search input exists but not wired to API
- [ ] Backend has search DTO field but no implementation
- [ ] Search not debounced (too many requests)
- [ ] Search results not highlighted
- [ ] Empty search shows no results vs all results

### Filter Gaps
- [ ] UI filter options don't match backend enum values
- [ ] Filter params use wrong key names
- [ ] Date filters sent in wrong format
- [ ] Boolean filters sent as strings
- [ ] Nested filters not flattened properly

### Sort Gaps
- [ ] Frontend uses 'asc'/'desc', backend expects 'ASC'/'DESC'
- [ ] sortBy field names don't match entity columns
- [ ] Default sort not applied on initial load
- [ ] Sort direction icon doesn't reflect state

### Response Handling Gaps
- [ ] Frontend expects array, backend returns object wrapper
- [ ] Error response structure not handled
- [ ] Loading state not shown during API call
- [ ] Empty state not shown for no results
- [ ] Stale data shown after mutation

### Type Safety Gaps
- [ ] Frontend uses `any` for API responses
- [ ] DTO fields optional in backend, required in frontend
- [ ] Enum values don't match between frontend/backend
- [ ] Date fields: string vs Date object mismatch
- [ ] ID fields: number vs string (UUID) mismatch

### Dashboard Chart Gaps
- [ ] Chart data endpoint not implemented in backend
- [ ] Chart component fetches data but API returns wrong format
- [ ] Aggregation logic missing (sum, count, avg by date/category)
- [ ] Date range filter not passed to chart API
- [ ] Chart refresh not triggered after data mutations
- [ ] Real-time chart updates not implemented (WebSocket/polling)
- [ ] Chart loading skeleton not shown during fetch
- [ ] Empty chart state not handled (no data in range)
- [ ] Chart color mapping doesn't match backend status enums
- [ ] Export chart data endpoint missing

### Activity/Audit Log Gaps
- [ ] Activity log endpoint not integrated in frontend
- [ ] Activity log missing pagination (infinite scroll)
- [ ] Activity log missing date range filter
- [ ] Activity log missing entity type filter
- [ ] Activity log missing user/actor filter
- [ ] Activity details modal/expansion not fetching full data
- [ ] Activity log not updating after user actions
- [ ] Read/unread activity status not synced
- [ ] Activity notification badge not updated from API
- [ ] Activity log export endpoint not integrated

### Table Action Button Gaps
- [ ] Row action buttons exist but API not called
- [ ] Bulk action (multi-select) endpoint not integrated
- [ ] Delete confirmation calls wrong endpoint
- [ ] Edit action navigates but doesn't pre-fetch data
- [ ] Status toggle (active/inactive) API not wired
- [ ] Duplicate/clone action missing backend endpoint
- [ ] Export row data action not integrated
- [ ] Print/PDF generation endpoint missing
- [ ] Archive/restore actions not implemented
- [ ] Row reorder (drag-drop) not saving to backend

### Dropdown/Select Gaps
- [ ] Dropdown options hardcoded instead of from API
- [ ] Dependent dropdowns not chaining API calls
- [ ] Async search dropdown not debounced
- [ ] Selected option not validating against current API data
- [ ] Dropdown options not refreshing after related entity changes
- [ ] Multi-select values sent in wrong format to API
- [ ] Default dropdown value not from API preference/config

### Modal/Dialog Gaps
- [ ] Create modal submits but API not called
- [ ] Edit modal doesn't fetch latest data on open
- [ ] Delete confirmation modal missing API call
- [ ] Modal form validation client-only (no server validation)
- [ ] Modal success/error not showing API response message
- [ ] Modal doesn't close on successful API response
- [ ] Nested modal (e.g., create child entity) not integrated
- [ ] Modal loading state not shown during API call

### File Upload Gaps
- [ ] Upload component exists but no upload endpoint
- [ ] File preview not using correct API URL
- [ ] File delete not calling backend endpoint
- [ ] Multiple file upload not handled by backend
- [ ] File type validation mismatch (frontend vs backend)
- [ ] File size limit not enforced server-side
- [ ] Upload progress not tracked from API
- [ ] Uploaded file URL not saved to parent entity

### Real-time/WebSocket Gaps
- [ ] Real-time updates shown in UI but no WebSocket connection
- [ ] Notification count not synced via WebSocket
- [ ] Chat/message feature not using real-time API
- [ ] Live status updates (processing, completed) not working
- [ ] Real-time presence (online users) not integrated
- [ ] WebSocket reconnection not handled
- [ ] Fallback polling not implemented when WebSocket fails

### Form Submission Gaps
- [ ] Form submit handler exists but no API call
- [ ] Form doesn't reset after successful submission
- [ ] Form doesn't show API validation errors
- [ ] Optimistic update not reverted on API failure
- [ ] Auto-save/draft not calling save endpoint
- [ ] Form dirty state not preventing accidental navigation
- [ ] Multi-step form not persisting progress to API

### Settings/Configuration Gaps
- [ ] Settings page not loading user preferences from API
- [ ] Settings save button not calling update endpoint
- [ ] Theme/language preference not persisted to backend
- [ ] Notification preferences not synced
- [ ] Profile settings missing avatar upload endpoint
- [ ] Password change form not calling auth endpoint
- [ ] Two-factor setup not integrated with backend

### Dashboard Widget Gaps
- [ ] Widget data not fetched from API
- [ ] Widget refresh button not calling endpoint
- [ ] Widget date range not affecting API call
- [ ] Stat cards showing hardcoded/stale values
- [ ] KPI metrics not calculated from real API data
- [ ] Quick action widgets not wired to backend
- [ ] Recent items widget not paginated
- [ ] Dashboard layout preferences not saved to API

### Missing UI Pages/Screens Gaps
- [ ] Backend CRUD endpoints exist but no corresponding list page
- [ ] Backend CRUD endpoints exist but no corresponding detail page
- [ ] Backend CRUD endpoints exist but no corresponding create page
- [ ] Backend CRUD endpoints exist but no corresponding edit page
- [ ] Admin management pages missing for entities with admin APIs
- [ ] Mobile screens missing for APIs available on web
- [ ] Dashboard pages missing for analytics/stats endpoints
- [ ] Settings/config pages missing for preference APIs
- [ ] User profile sections missing for profile endpoints
- [ ] Report pages missing for report generation APIs
- [ ] Search results page missing for search APIs
- [ ] Notification page/panel missing for notification APIs
- [ ] Help/FAQ page missing for help content APIs

### Missing UI Sections/Components Gaps
- [ ] List page exists but missing create/add button
- [ ] Detail page exists but missing edit button/functionality
- [ ] Page exists but missing delete button/capability
- [ ] Sidebar/navigation missing links to available features
- [ ] Header missing notification/alert section for notification APIs
- [ ] Header missing user menu items for profile APIs
- [ ] Footer missing quick links section
- [ ] Breadcrumb navigation incomplete for nested routes
- [ ] Tab sections missing for related sub-resources
- [ ] Action toolbar missing for bulk operations
- [ ] Filter panel missing for filterable list APIs
- [ ] Sort controls missing for sortable list APIs
- [ ] Empty state missing for no-data scenarios
- [ ] Error boundary missing for API failure states

### Missing Admin/Management UI Gaps
- [ ] User management page missing for user CRUD APIs
- [ ] Role/permission management UI missing for RBAC APIs
- [ ] Content moderation UI missing for moderation APIs
- [ ] System configuration page missing for config APIs
- [ ] Audit/activity log viewer page missing
- [ ] Analytics/metrics dashboard missing for analytics APIs
- [ ] Email template management missing for email APIs
- [ ] Notification management missing for notification APIs
- [ ] File/media management missing for upload APIs
- [ ] Cache/job queue management missing for admin APIs
- [ ] API key/webhook management missing

### Missing Mobile UI Gaps
- [ ] Mobile app missing screens available on web frontend
- [ ] Mobile bottom navigation missing menu items for APIs
- [ ] Mobile missing offline-capable UI for cached APIs
- [ ] Mobile missing push notification permission UI
- [ ] Mobile missing deep link handlers for shared content
- [ ] Mobile missing biometric auth UI for auth APIs
- [ ] Mobile missing camera/gallery UI for upload APIs
- [ ] Mobile missing location permission UI for geo APIs
- [ ] Mobile missing pull-to-refresh for list APIs
- [ ] Mobile missing swipe actions for quick operations

### UI Update/Refresh Gaps
- [ ] Page not reflecting new backend fields added to DTO
- [ ] UI missing new status options from updated enum
- [ ] Form missing new required fields from updated DTO
- [ ] Table missing new sortable/filterable columns
- [ ] UI not updated after API response structure change
- [ ] Dropdown options outdated (new values added to backend)
- [ ] Validation rules not matching new backend constraints
- [ ] UI labels/text not matching renamed API fields
- [ ] Deprecated fields still shown in UI
- [ ] New optional features not exposed in UI

### Dummy Data Replacement Gaps
- [ ] List page using hardcoded mock data instead of API fetch
- [ ] Detail page showing placeholder data instead of real entity
- [ ] Dashboard charts using static sample data instead of API
- [ ] Form dropdowns using hardcoded options instead of API-fetched values
- [ ] Table rows using mock data array instead of API response
- [ ] User profile section showing dummy user info
- [ ] Statistics/KPIs using hardcoded numbers instead of API calculations
- [ ] Recent activity using static placeholder entries
- [ ] Search results returning fake data instead of API search
- [ ] Notifications using mock notification list
- [ ] Comments/reviews showing placeholder content
- [ ] File/image URLs pointing to placeholder images instead of real assets
- [ ] Price/currency values hardcoded instead of from API
- [ ] Date/time values using static dates instead of real timestamps
- [ ] Status badges showing mock statuses instead of real entity status

### React TypeScript Error Gaps
- [ ] Type errors on page components due to missing/incorrect prop types
- [ ] API response types not matching actual backend response structure
- [ ] Event handler type mismatches (onClick, onChange, onSubmit)
- [ ] State variable types incorrectly defined or using `any`
- [ ] Generic component props missing proper type constraints
- [ ] useEffect dependency array type warnings
- [ ] Context provider/consumer type mismatches
- [ ] Redux action/reducer type inconsistencies
- [ ] Form field types not matching form library requirements
- [ ] Router params/query types incorrectly typed
- [ ] Ref types not matching DOM element types
- [ ] Custom hook return types incorrect or missing
- [ ] Async function return types not properly typed as Promise
- [ ] Array/object destructuring with incorrect types
- [ ] Null/undefined checks missing causing potential runtime errors
- [ ] Import type errors from third-party libraries
- [ ] JSX element type errors in conditional rendering
- [ ] Map/filter callback parameter types incorrect

### Framework Compliance Gaps

This section provides a generic, framework-agnostic checklist for verifying that the codebase follows established patterns from the `.pi/[framework-tier]/` directory structure. Replace `[framework-tier]` with the actual framework being audited (e.g., `nestjs`, `react`, `react-native`).

#### Framework Detection Checklist
- [ ] Framework tier directories identified in `.pi/` (e.g., nestjs, react, react-native)
- [ ] Backend framework tier detected (check `backend/package.json` or `backend/requirements.txt`)
- [ ] Frontend framework tier detected (check `frontend*/package.json`)
- [ ] Mobile framework tier detected (check `mobile/package.json`)
- [ ] Framework-specific guides directory exists at `.pi/[framework-tier]/guides/`
- [ ] Framework-specific skills directory exists at `.pi/[framework-tier]/skills/`
- [ ] Framework-specific agents directory exists at `.pi/[framework-tier]/agents/`

#### Guide Compliance Gaps - Architecture & Patterns
- [ ] Architecture patterns in code don't match `.pi/[framework-tier]/guides/architecture-overview.md`
- [ ] Code structure deviates from directory conventions in guides
- [ ] Layer separation not following documented architecture (e.g., controller/service/repository)
- [ ] Module organization inconsistent with guide recommendations
- [ ] Naming conventions not following documented standards
- [ ] Import patterns deviating from guide specifications
- [ ] File organization not matching `.pi/[framework-tier]/guides/file-organization.md`

#### Guide Compliance Gaps - Best Practices
- [ ] Code doesn't follow `.pi/[framework-tier]/guides/best-practices.md` patterns
- [ ] Error handling patterns not matching documented approach
- [ ] Logging patterns inconsistent with guide recommendations
- [ ] Configuration management deviating from documented patterns
- [ ] Environment variable access not following guide (e.g., direct process.env vs config service)
- [ ] Dependency injection patterns not matching documented standards
- [ ] Code comments/documentation not following guide conventions

#### Guide Compliance Gaps - Data Layer
- [ ] Database patterns not following `.pi/[backend-tier]/guides/database-patterns.md`
- [ ] Entity/Model definitions missing base class inheritance
- [ ] Repository patterns deviating from documented approach
- [ ] Query patterns not optimized per guide recommendations
- [ ] Migration patterns not following documented workflow
- [ ] Relationship definitions inconsistent with guide patterns
- [ ] Index usage not following performance guidelines

#### Guide Compliance Gaps - API Layer
- [ ] Controller patterns not matching `.pi/[backend-tier]/guides/routing-and-controllers.md`
- [ ] DTO/Serializer patterns not following `.pi/[backend-tier]/guides/validation-patterns.md`
- [ ] Response format inconsistent with documented standards
- [ ] Error response structure deviating from guide patterns
- [ ] Pagination implementation not matching documented approach
- [ ] Authentication decorators/guards not following guide patterns
- [ ] API documentation (Swagger/OpenAPI) not following guide conventions

#### Guide Compliance Gaps - Frontend Patterns
- [ ] Component patterns not following `.pi/[frontend-tier]/guides/component-patterns.md`
- [ ] State management deviating from `.pi/[frontend-tier]/guides/common-patterns.md`
- [ ] Data fetching not following `.pi/[frontend-tier]/guides/data-fetching.md`
- [ ] API integration not matching `.pi/[frontend-tier]/guides/api-integration.md`
- [ ] Styling approach inconsistent with `.pi/[frontend-tier]/guides/styling-guide.md`
- [ ] TypeScript usage deviating from `.pi/[frontend-tier]/guides/typescript-standards.md`
- [ ] Loading/error states not following `.pi/[frontend-tier]/guides/loading-and-error-states.md`
- [ ] Routing patterns not matching `.pi/[frontend-tier]/guides/routing-guide.md`

#### Guide Compliance Gaps - Testing
- [ ] Test patterns not following `.pi/[framework-tier]/guides/testing-guide.md`
- [ ] Test file naming conventions inconsistent with guide
- [ ] Test organization deviating from documented structure
- [ ] Mock patterns not following guide recommendations
- [ ] Fixture patterns inconsistent with documented approach
- [ ] E2E test patterns not matching `.pi/[framework-tier]/skills/e2e-testing/SKILL.md`

#### Skill Compliance Gaps - Backend
- [ ] API development not following `.pi/[backend-tier]/skills/api-development/` patterns
- [ ] Database seeding not using `.pi/[backend-tier]/skills/database-seeding/` approach
- [ ] Debugging approach not following `.pi/[backend-tier]/skills/debugging/` methodology
- [ ] Code quality checks not using `.pi/[backend-tier]/skills/code-quality/` standards
- [ ] E2E testing not following `.pi/[backend-tier]/skills/e2e-testing/` patterns

#### Skill Compliance Gaps - Frontend
- [ ] API integration not following `.pi/[frontend-tier]/skills/api-integration/` patterns
- [ ] Component building not using `.pi/[frontend-tier]/skills/builders/` approach
- [ ] Design QA not following `.pi/[frontend-tier]/skills/qa/` methodology
- [ ] Converter patterns not using `.pi/[frontend-tier]/skills/converters/` approach
- [ ] Debugging not following `.pi/[frontend-tier]/skills/debugging/` methodology
- [ ] E2E testing not matching `.pi/[frontend-tier]/skills/e2e-testing/` patterns
- [ ] Code quality not following `.pi/[frontend-tier]/skills/code-quality/` standards

#### Agent Delegation Gaps
- [ ] Backend implementation not delegated to `[backend-tier]/agents/backend-developer`
- [ ] Frontend implementation not delegated to `[frontend-tier]/agents/frontend-developer`
- [ ] Mobile implementation not delegated to `mobile-developer` agent
- [ ] Database design not delegated to `database-designer` agent
- [ ] Code review not delegated to `reviewer` agent
- [ ] Error resolution not delegated to `auto-error-resolver` agent
- [ ] Refactoring not delegated to `refactorer` agent
- [ ] Documentation not delegated to `documentation-architect` agent
- [ ] Design QA not delegated to `[frontend-tier]/agents/design-qa-agent`
- [ ] Auth/route debugging not delegated to `[backend-tier]/agents/auth-route-debugger`

#### Cross-Stack Framework Compliance Gaps
- [ ] Backend/frontend type definitions not synchronized
- [ ] API contracts not documented in both framework tiers
- [ ] Shared constants/enums not centralized per framework guides
- [ ] Error codes not consistent across framework tiers
- [ ] Date/time handling inconsistent between frameworks
- [ ] Pagination request/response format mismatch between tiers
- [ ] Authentication token handling inconsistent across frameworks

#### Framework Resource Discovery Gaps
- [ ] Guide files not read before implementation began
- [ ] Skill patterns not consulted for specialized tasks
- [ ] Agent delegation not considered for complex tasks
- [ ] Framework-specific best practices not applied
- [ ] Workflow guides not followed for multi-step tasks
- [ ] Resource files (in `resources/` subdirectories) not consulted for detailed patterns

---

## Framework Compliance Audit Procedure

When using the Framework Compliance Gaps checklist, follow this dynamic detection and audit process:

### Step 1: Detect Active Frameworks

```bash
# Detect backend framework
if [ -f "backend/package.json" ]; then
  rg -l "@nestjs/core" backend/package.json && echo "BACKEND_TIER=nestjs"
fi
if [ -f "backend/requirements.txt" ]; then
fi

# Detect frontend frameworks
fd package.json frontend* --max-depth 2 | xargs rg -l "react" && echo "FRONTEND_TIER=react"

# Detect mobile framework
if [ -f "mobile/package.json" ]; then
  rg -l "react-native" mobile/package.json && echo "MOBILE_TIER=react-native"
fi
```

### Step 2: Discover Framework Resources

For each detected `[framework-tier]`, enumerate available resources:

```bash
# List available guides
fd -e md . .pi/[framework-tier]/guides/

# List available skills
fd -e md . .pi/[framework-tier]/skills/

# List available agents
fd -e md . .pi/[framework-tier]/agents/
```

### Step 3: Read Mandatory Guides

Before auditing, read these guides in order:
1. `.pi/[framework-tier]/guides/README.md` - Index of all guides
2. `.pi/[framework-tier]/guides/best-practices.md` - Mandatory patterns
3. `.pi/[framework-tier]/guides/architecture-overview.md` - Structure patterns

### Step 4: Apply Framework-Specific Checklist Items

When auditing, replace placeholders dynamically:

| Placeholder | Backend | Frontend Web | Frontend Mobile |
|-------------|---------|--------------|-----------------|
| `[framework-tier]` | nestjs | react | react-native |
| `[backend-tier]` | nestjs | N/A | N/A |
| `[frontend-tier]` | N/A | react | react-native |

### Step 5: Cross-Reference with Existing Guides

For each gap identified, document:
1. **Guide Reference**: Which guide documents the expected pattern
2. **Current Implementation**: How the code currently implements it
3. **Gap Description**: What specifically doesn't comply
4. **Remediation**: Steps to bring into compliance

### Step 6: Agent Delegation Recommendations

When gaps require implementation changes:
- **Backend gaps** → Delegate to `backend-developer` agent
- **Frontend gaps** → Delegate to `frontend-developer` agent
- **Mobile gaps** → Delegate to `mobile-developer` agent
- **Database gaps** → Delegate to `database-designer` agent
- **Cross-stack gaps** → Handle directly or coordinate multiple agents

---

## File Organization Compliance Checklist

This checklist verifies that files are organized according to framework guides and established project conventions.

### Backend File Organization (NestJS)

#### NestJS Structure
- [ ] Controllers in module directories (`backend/src/modules/*/`)
- [ ] Controller files follow `*.controller.ts` naming
- [ ] Services colocated in module directories
- [ ] Service files follow `*.service.ts` naming
- [ ] DTOs in dedicated folders (`backend/src/modules/*/dtos/`)
- [ ] DTO files follow `*Dto.ts` or `*-dto.ts` naming
- [ ] Entities in module directories (`*.entity.ts`)
- [ ] Repositories in module directories (`*.repository.ts`)
- [ ] Shared utilities in `backend/src/shared/`
- [ ] Common DTOs in `backend/src/shared/dtos/`
- [ ] Configuration in `backend/src/config/`
- [ ] Guards in `backend/src/shared/guards/` or module-specific location
- [ ] Interceptors in `backend/src/shared/interceptors/`
- [ ] Pipes in `backend/src/shared/pipes/`
- [ ] Filters in `backend/src/shared/filters/`
- [ ] Decorators in `backend/src/shared/decorators/`
- [ ] Module files follow `*.module.ts` naming
- [ ] Index files (barrel exports) present in shared directories
- [ ] No orphan files outside standard directory structure
- [ ] No files in `backend/src/` root (except main.ts, app.module.ts)

### Frontend File Organization (React)

#### Core Structure
- [ ] Components in `app/components/` with proper subdirectories
- [ ] Component files follow `*.tsx` extension
- [ ] Component folders contain index.ts barrel exports
- [ ] Pages in `app/pages/` matching routing structure
- [ ] Page files follow `*Page.tsx` or `*/index.tsx` naming
- [ ] Layouts in `app/layouts/` or `app/components/layouts/`

#### Services & Data
- [ ] Services in `app/services/`
- [ ] Service files follow `*Service.ts` naming
- [ ] HTTP base service in `app/services/httpService.ts`
- [ ] Types in `app/types/`
- [ ] Type files follow `*.d.ts` or `*.types.ts` naming
- [ ] API response types match backend DTOs

#### State Management
- [ ] Redux store in `app/redux/` or `app/store/`
- [ ] Slices follow `*Slice.ts` naming
- [ ] Selectors colocated with slices or in `selectors/`
- [ ] Thunks/actions clearly organized

#### Utilities & Hooks
- [ ] Custom hooks in `app/hooks/`
- [ ] Hook files follow `use*.ts` naming (e.g., `useAuth.ts`)
- [ ] Utility functions in `app/utils/`
- [ ] Constants in `app/constants/` or `app/config/`

#### Assets
- [ ] Images in `app/assets/images/`
- [ ] Fonts in `app/assets/fonts/`
- [ ] Icons in `app/assets/icons/` or `app/components/icons/`
- [ ] Static files properly organized

#### No Orphans
- [ ] No files directly in `app/` root (except entry points)
- [ ] No orphan component files not imported anywhere
- [ ] No duplicate file structures across directories

### Mobile File Organization (React Native)

- [ ] Components in `mobile/app/components/`
- [ ] Screens in `mobile/app/screens/`
- [ ] Navigation in `mobile/app/navigation/`
- [ ] Services in `mobile/app/services/`
- [ ] Types in `mobile/app/types/`
- [ ] Hooks in `mobile/app/hooks/`
- [ ] Utils in `mobile/app/utils/`
- [ ] Assets in `mobile/app/assets/`
- [ ] Platform-specific files use `.ios.ts` / `.android.ts` suffixes
- [ ] No orphan files outside standard directories

### Common Organization Issues
- [ ] No mixed naming conventions (camelCase vs kebab-case vs PascalCase)
- [ ] No inconsistent folder depth for similar components
- [ ] No duplicated functionality in different locations
- [ ] No test files mixed with source files (unless using `*.spec.ts` convention)
- [ ] Index files present for clean imports
- [ ] Circular dependencies avoided through proper structure

---

## Codebase Cleanup Checklist

This checklist identifies and tracks cleanup of dummy data, unused code, and unnecessary files.

### Dummy/Mock Data Cleanup

#### Hardcoded Data
- [ ] No hardcoded mock data arrays in production components
- [ ] No placeholder user data (John Doe, test@example.com)
- [ ] No lorem ipsum text in UI components
- [ ] No hardcoded IDs or UUIDs that should be dynamic
- [ ] No hardcoded dates/timestamps that should be real
- [ ] No placeholder images (placeholder.com, via.placeholder.com)
- [ ] No hardcoded API URLs (should use environment variables)

#### Commented Mock Data
- [ ] No commented-out mock data blocks
- [ ] No `TODO: replace with API` comments with stale mock data
- [ ] No `// Mock data for testing` blocks in production code
- [ ] No `/* temporary data */` sections

#### Proper Data Separation
- [ ] Seed data only in dedicated seeder files (`backend/src/database/seeds/`)
- [ ] Test fixtures in test directories only (`__tests__/`, `*.spec.ts`)
- [ ] Demo/sample data clearly marked and conditionally loaded
- [ ] No production code referencing test fixtures

### Unused Code Cleanup

#### Imports & Variables
- [ ] No unused imports (run ESLint `no-unused-vars`)
- [ ] No unused variables declared
- [ ] No unused function parameters (prefix with `_` if intentional)
- [ ] No unused type definitions
- [ ] No unused enum values

#### Dead Code
- [ ] No unreachable code after return/throw statements
- [ ] No always-false conditions
- [ ] No functions that are never called
- [ ] No event handlers not attached to any element
- [ ] No API endpoints with no consumers
- [ ] No Redux actions that are never dispatched

#### Commented Code
- [ ] No commented-out function implementations (>5 lines)
- [ ] No commented-out imports
- [ ] No commented-out component JSX
- [ ] No `// OLD:` or `// PREVIOUS:` code blocks
- [ ] No version-control-style comments (`// v1`, `// backup`)

#### Deprecated Code
- [ ] No deprecated functions still in use
- [ ] No TODO markers for removal that are overdue
- [ ] No legacy code paths marked for deletion
- [ ] No backward-compatibility shims no longer needed

### Unused Files/Folders Cleanup

#### Orphan Files
- [ ] No component files not imported anywhere
- [ ] No service files with no consumers
- [ ] No type definition files not referenced
- [ ] No utility files not used
- [ ] No configuration files for removed features

#### Empty/Unnecessary Directories
- [ ] No empty directories
- [ ] No directories with only `.gitkeep`
- [ ] No abandoned feature directories
- [ ] No duplicate directory structures

#### Temporary/Backup Files
- [ ] No backup files (`*.bak`, `*.old`, `*.backup`, `*.copy`)
- [ ] No temp files (`*.tmp`, `*.temp`)
- [ ] No OS-generated files (`.DS_Store`, `Thumbs.db`, `desktop.ini`)
- [ ] No editor swap files (`*.swp`, `*.swo`, `*~`)
- [ ] No archive files in source (`*.zip`, `*.tar.gz`)

#### Build Artifacts
- [ ] No `node_modules` in unexpected locations
- [ ] No `dist/` or `build/` directories committed
- [ ] No compiled JavaScript in TypeScript projects (except dist)
- [ ] No `.next/` or `.nuxt/` directories committed
- [ ] No coverage reports committed (`coverage/`)
- [ ] No log files committed (`*.log`, `npm-debug.log`)

### Configuration Cleanup

#### Environment Files
- [ ] No `.env` files committed (should be gitignored)
- [ ] No hardcoded secrets or API keys
- [ ] No credentials in configuration files
- [ ] No production credentials in development configs
- [ ] `.env.example` exists with all required variables (no values)

#### Configuration Consistency
- [ ] No duplicate configuration across files
- [ ] No conflicting config values between environments
- [ ] No unused configuration options
- [ ] No outdated configuration for removed features

#### IDE/Tool Configurations
- [ ] No personal IDE settings committed (`.idea/`, `.vscode/settings.json`)
- [ ] Shared configs properly gitignored or team-agreed
- [ ] No conflicting linter/formatter configurations

### Debug/Development Artifacts

- [ ] No `console.log` statements in production code
- [ ] No `console.debug` or `console.warn` for debugging
- [ ] No `debugger` statements
- [ ] No `alert()` calls
- [ ] No `// @ts-ignore` without justification
- [ ] No `// eslint-disable` without justification
- [ ] No hardcoded `localhost` URLs in production code
- [ ] No development-only feature flags left enabled

---

## Automated Detection Commands

Use these commands to automatically detect organization and cleanup issues:

### File Organization Detection

```bash
# Find files in unexpected locations (backend)
fd -e ts . backend/src --max-depth 1 --exclude main.ts --exclude app.module.ts

# Find misnamed controllers
fd -e ts . backend/src/modules --type f | rg -v "(controller|service|module|entity|repository|dto)" | head -20

# Find orphan components (not imported anywhere)
for f in $(fd -e tsx . frontend/app/components); do
  rg -l "$(basename $f .tsx)" frontend/app --glob "*.tsx" --glob "*.ts" | wc -l | xargs -I {} test {} -eq 1 && echo "Possibly orphan: $f"
done

# Find empty directories
fd -t d -e '' .
```

### Dummy Data Detection

```bash
# Find hardcoded mock data patterns
rg -n "mockData|dummyData|fakeData|testData" --glob "*.ts" --glob "*.tsx" -g "!*.spec.ts" -g "!*.test.ts" -g "!**/seeds/**" -g "!**/fixtures/**"

# Find placeholder content
rg -n "lorem ipsum|John Doe|jane@example|test@test|placeholder\.com" --glob "*.ts" --glob "*.tsx" -g "!*.spec.ts"

# Find TODO comments about mock data
rg -n "TODO.*mock|TODO.*dummy|TODO.*replace.*API|FIXME.*hardcoded" --glob "*.ts" --glob "*.tsx"

# Find hardcoded UUIDs
rg -n "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" --glob "*.ts" --glob "*.tsx" -g "!*.spec.ts" -g "!**/migrations/**"
```

### Unused Code Detection

```bash
# Find unused imports (requires eslint-plugin-unused-imports)
npx eslint --rule 'unused-imports/no-unused-imports: error' --ext .ts,.tsx src/

# Find console.log statements
rg -n "console\.(log|debug|warn|info)" --glob "*.ts" --glob "*.tsx" -g "!*.spec.ts" -g "!*.test.ts"

# Find debugger statements
rg -n "debugger" --glob "*.ts" --glob "*.tsx"

# Find commented code blocks (lines starting with // followed by code-like content)
rg -n "^\s*//\s*(const|let|var|function|class|import|export|if|for|while|return)" --glob "*.ts" --glob "*.tsx"

# Find @ts-ignore without comments
rg -n "@ts-ignore(?!\s+--)" --glob "*.ts" --glob "*.tsx"
```

### File Cleanup Detection

```bash
# Find backup/temp files
fd -e bak -e old -e tmp -e copy -e backup -e temp .

# Find OS-generated files
fd -H "\.DS_Store|Thumbs\.db|desktop\.ini" .

# Find log files
fd -e log .

# Find potentially committed env files
fd -H "^\.env$|^\.env\." . --exclude ".env.example"

# Find node_modules in unexpected places
fd -H -t d "node_modules" . --exclude "node_modules"
```

### Comprehensive Cleanup Report

```bash
# Generate cleanup report
echo "=== CLEANUP REPORT ===" > cleanup-report.txt
echo "" >> cleanup-report.txt

echo "## Backup/Temp Files" >> cleanup-report.txt
fd -e bak -e old -e tmp -e copy . >> cleanup-report.txt

echo "" >> cleanup-report.txt
echo "## Console Statements" >> cleanup-report.txt
rg -c "console\.(log|debug)" --glob "*.ts" --glob "*.tsx" -g "!*.spec.ts" >> cleanup-report.txt

echo "" >> cleanup-report.txt
echo "## TODO/FIXME Comments" >> cleanup-report.txt
rg -c "TODO|FIXME" --glob "*.ts" --glob "*.tsx" >> cleanup-report.txt

echo "" >> cleanup-report.txt
echo "## Empty Directories" >> cleanup-report.txt
fd -t d -e '' . >> cleanup-report.txt

cat cleanup-report.txt
```
