---
name: find-gaps
description: Methodology and checklists for finding implementation gaps across the full stack
---

# Gap Finder Skill

Systematic gap detection comparing the current implementation against PRD, design guidelines, HTML prototypes, and API specifications.

## Quick Start

```
/dev:gap-finder                  # Full scan (frontend + backend)
/dev:gap-finder frontend         # Frontend only
/dev:gap-finder backend          # Backend only
```

## Reference Documents

Dynamically discover and load before scanning:

| Document | Discovery | What to Extract |
|----------|-----------|-----------------|
| PRD files | `Glob(pattern="**/*.{md,pdf}", path=".project/prd/")` | Required screens, features, flows |
| Project docs | `Glob(pattern="*.md", path=".project/docs/")` | Design system, API specs, DB schema, architecture (use all found) |
| CLAUDE.md | Read `CLAUDE.md` at project root | Design values, conventions, architecture rules |
| Tailwind config | `Glob(pattern="tailwind.config.*")` | Theme colors, fonts, spacing tokens |
| HTML Prototypes | `Glob(pattern="**/*.html", path=".project/resources/HTML/")` | Visual reference (optional, skip if missing) |

**Discovery rules:**
- PRD files are required — at least one must exist for meaningful gap analysis
- All other docs are optional — adapt the scan to use whatever is available
- CLAUDE.md is the best fallback for design system values when no dedicated design guidelines doc exists
- Never fail if specific named docs are missing — proceed with what you have

---

## Gap Categories & Detection Patterns

### 1. Design System Compliance

**Step 1a: Extract design values from available sources**

Check these in priority order:
1. Design guidelines doc (if found in `.project/docs/`)
2. `CLAUDE.md` at project root (look for color hex codes, font names, spacing values)
3. Tailwind config file (`tailwind.config.js` or `tailwind.config.ts`) for theme customizations

Extract these tokens:
- **Primary color(s):** hex value and/or Tailwind class name
- **Status colors:** success, warning, error variants
- **Typography:** heading font, body font
- **Spacing/borders:** card border-radius, button border-radius
- **Shadows:** card shadows, button shadows
- **Backgrounds:** page background colors

**Step 1b: Scan for violations**

Using the extracted values, find deviations:

```
# Find custom hex colors — compare against approved palette
Grep(pattern="bg-\\[#", glob="*.tsx", path="frontend/")
Grep(pattern="text-\\[#", glob="*.tsx", path="frontend/")

# Find heading-sized text — verify it uses project's heading font
Grep(pattern="text-(2xl|3xl|4xl)", glob="*.tsx", path="frontend/")

# Check Tailwind config for theme definition
Grep(pattern="colors|fontFamily|borderRadius", glob="tailwind.config.*")
```

**Status colors:**
```
# Verify status color usage consistency
Grep(pattern="bg-red", glob="*.tsx", path="frontend/")
Grep(pattern="bg-yellow", glob="*.tsx", path="frontend/")
Grep(pattern="bg-green", glob="*.tsx", path="frontend/")
```

**Spacing & Borders:**
```
# Audit border-radius usage
Grep(pattern="rounded-", glob="*.tsx", path="frontend/")

# Check shadow usage
Grep(pattern="shadow-", glob="*.tsx", path="frontend/")
```

**If NO design system values found:** Skip color/typography/spacing compliance checks. Report: "Design system compliance skipped — no design guidelines or design values found."

### 2. Missing Icons

```
# Pages that import from icon library (e.g., lucide-react)
Grep(pattern="from 'lucide-react'", glob="*.tsx", path="frontend/", output_mode="files_with_matches")

# All page files — compare against icon-importing files to find gaps
Glob(pattern="pages/**/*.tsx", path="frontend/app/")

# Count icon imports per file
Grep(pattern="from 'lucide-react'", glob="*.tsx", path="frontend/", output_mode="count")

# Buttons that might need icons (look for text-only buttons)
Grep(pattern="<button|<Button", glob="*.tsx", path="frontend/", output_mode="content", -A=2)
```

**Expected icon patterns:**
- Nav items: icon + label
- Action buttons: icon + text (or icon-only with aria-label)
- Status badges: colored dot or icon + text
- Loading: spinner icon with `animate-spin`
- Error: alert/warning icon
- Empty state: large icon + heading + description

### 3. Missing Pages/Features

```
# List all implemented pages
Glob(pattern="pages/**/*.tsx", path="frontend/app/")

# Check route definitions
Grep(pattern="path:", glob="*.tsx", path="frontend/app/")
Grep(pattern="Route ", glob="*.tsx", path="frontend/app/")

# List HTML prototypes (if directory exists)
Glob(pattern="**/*.html", path=".project/resources/HTML/")
```

**Cross-reference:**
- Each PRD screen should have a `.tsx` page file
- If HTML prototypes were found, each should have a React implementation
- Each route in the router should resolve to an existing component

#### 3a. Navigation Integrity

Check that internal links use SPA navigation and point to valid destinations:

```
# Find <a href> tags used for internal navigation (SPA anti-pattern)
Grep(pattern="<a[^>]*href=\"/", glob="*.tsx", path="frontend/app/", output_mode="content")

# Extract all internal link destinations for cross-reference
Grep(pattern="href=\"(/[^\"]*)\"", glob="*.tsx", path="frontend/app/", output_mode="content")
Grep(pattern="to=\"(/[^\"]*)\"", glob="*.tsx", path="frontend/app/", output_mode="content")

# Compare against defined routes
Grep(pattern="path:", glob="*.tsx", path="frontend/app/")
```

**Flag:**
- `<a href="/...">` for internal routes (should be `<Link to>` or `useNavigate`)
- Destinations that don't match any defined route
- Link text implying a page/flow that doesn't exist (e.g., "Login here" linking to a dashboard)
- Links to auth-guarded routes that would cause redirect loops for unauthenticated users

#### 3b. Semantic Link Text Mismatch

Cross-reference link visible text against destination to detect misleading navigation:

```
# Step 1: Find auth pages with auth-action link text
Grep(pattern="(login|sign.in|sign.up|register)", glob="*.tsx", path="frontend/app/pages/auth/", output_mode="files_with_matches")

# Step 2: In those files, check for links pointing to guarded routes
Grep(pattern="(to|href)=\"(/admin|/projects|/dashboard)", glob="*.tsx", path="frontend/app/pages/auth/", output_mode="content")

# Reverse: dashboard/home text pointing to auth routes
Grep(pattern="to=\"(/login|/register|/auth)", glob="*.tsx", path="frontend/app/", output_mode="content", -A=3)
```

**Detection matrix:**

| Link Text Contains | Destination Must Match | Severity if Mismatched |
|---|---|---|
| "login", "sign in" | `/login`, `/auth/*` | HIGH |
| "register", "sign up" | `/register`, `/signup` | HIGH |
| Any text on auth pages | Must NOT target guarded routes | CRITICAL (redirect loop) |

**Flag:**
- Auth-action text pointing to protected routes (confusing UX + potential redirect loops)
- Links on public pages whose destination is behind auth guards
- Redundant self-referencing links on auth pages

> See also 9c for auth guard redirect loop analysis.

### 4. Missing UI States

```
# Loading states per page
Grep(pattern="(isLoading|loading|LoadingSpinner|Loader2)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")

# Error states per page
Grep(pattern="(isError|error && |Error message|AlertTriangle)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")

# Empty states per page
Grep(pattern="(EmptyState|empty|No .* found|no data)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")

# Form validation
Grep(pattern="(error|invalid|required|validation)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")

# Confirmation dialogs
Grep(pattern="(ConfirmModal|confirm|Are you sure)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")

# Toast/notifications
Grep(pattern="(toast|notification|success|alert)", glob="*.tsx", path="frontend/app/pages/", output_mode="files_with_matches")
```

**Per-page checklist:**
- [ ] Loading spinner while data fetches
- [ ] Error alert on API failure
- [ ] Empty state when list is empty
- [ ] Form validation messages
- [ ] Success feedback after create/update/delete
- [ ] Confirmation before delete actions

### 5. Hardcoded/Placeholder Content

```
# Hardcoded user info (generic patterns)
Grep(pattern="\"Admin User\"|\"admin@\"|\"dev@\"|\"test@\"", glob="*.tsx", path="frontend/")

# Hardcoded email addresses
Grep(pattern="\"[^\"]+@[^\"]+\\.(io|com|net|org)\"", glob="*.tsx", path="frontend/")

# Hardcoded numbers/stats
Grep(pattern="\"\\+[0-9]|\"[0-9]+ (this|last|new)\"", glob="*.tsx", path="frontend/")

# TODO/FIXME/HACK comments
Grep(pattern="(TODO|FIXME|HACK|XXX|TEMP)", glob="*.{ts,tsx}", path="frontend/")
Grep(pattern="(TODO|FIXME|HACK|XXX|TEMP)", glob="*.{ts,tsx}", path="backend/")

# Placeholder text
Grep(pattern="(placeholder|lorem|dummy|sample|example\\.com)", glob="*.{ts,tsx}", path="frontend/", -i=true)

# Hardcoded credentials
Grep(pattern="\"(password|secret|token|key)\"", glob="*.{ts,tsx}", path="frontend/", -i=true)
```

### 6. Accessibility

```
# Images without alt
# Two-step: Find all <img> tags, then check each for alt= attribute
Grep(pattern="<img ", glob="*.tsx", path="frontend/", output_mode="content")

# Icon-only buttons without labels
Grep(pattern="onClick.*icon|icon.*onClick", glob="*.tsx", path="frontend/", output_mode="content")

# Form inputs without labels
Grep(pattern="<(input|Input|textarea|Textarea|select|Select)", glob="*.tsx", path="frontend/", output_mode="content")

# Interactive divs/spans without role
# Two-step: Find onClick on div/span, then check for role= attribute
Grep(pattern="onClick", glob="*.tsx", path="frontend/", output_mode="content")
```

### 7. API Integration Gaps

```
# Service files and their endpoints
Grep(pattern="(get|post|put|patch|delete)\\(", glob="*.ts", path="frontend/app/services/", output_mode="content")

# Redux/state thunks
Grep(pattern="createAsyncThunk", glob="*.ts", path="frontend/app/", output_mode="content")

# Service files listing
Glob(pattern="**/*.ts", path="frontend/app/services/")

# Check for error handling in services
Grep(pattern="catch|error", glob="*.ts", path="frontend/app/services/", output_mode="files_with_matches")
```

**Cross-reference against API documentation (if found in `.project/docs/` or CLAUDE.md):**
- Each documented endpoint should have a service function
- Each service function should have error handling
- Each endpoint with pagination should pass page/limit params
- Each endpoint with search should pass search/filter params

### 8. Backend Gaps

```
# Controllers with Swagger — find controllers, then check each for @ApiTags
Grep(pattern="@Controller", glob="*.ts", path="backend/src/", output_mode="files_with_matches")
# Then for each file, check: Grep(pattern="@ApiTags", path="{file}")

# Missing @ApiOperation on endpoints
Grep(pattern="@(Get|Post|Patch|Delete)\\(", glob="*.ts", path="backend/src/", output_mode="content", -B=3)

# DTO files — check each for validation decorators
Glob(pattern="**/dto/**/*.ts", path="backend/src/")
# Then for each: Grep(pattern="(IsString|IsNumber|IsEmail|IsUUID|IsOptional)", path="{file}")

# Endpoints without guards
Grep(pattern="@(Get|Post|Patch|Delete)\\(", glob="*.ts", path="backend/src/", output_mode="content", -B=5)

# Service files — check each for proper exception usage
Glob(pattern="**/providers/**/*.ts", path="backend/src/modules/")
# Then for each: Grep(pattern="(NotFoundException|ConflictException|BadRequestException)", path="{file}")
```

**Check for:**
- Missing Swagger documentation (@ApiTags, @ApiOperation, @ApiResponse)
- Missing DTO validation (class-validator decorators)
- Missing authentication guards on protected routes
- Missing endpoints that PRD requires but aren't implemented
- Missing error handling (NotFoundException, ConflictException, etc.)

### 9. Auth & State Management

Detect infinite API loops, auth guard re-entrance, and public-to-protected route links.

#### 9a. Infinite API Loop Detection

```
# Find guards/components that dispatch thunks inside useEffect
Grep(pattern="useEffect", glob="*.tsx", path="frontend/app/components/guards/", output_mode="content", -A=5)

# Find async thunk rejected handlers that reset state to initialState
Grep(pattern="\\.rejected.*initialState|\\.rejected.*=>.*\\{", glob="*.ts", path="frontend/app/redux/", output_mode="content")
```

**Flag:**
- useEffect dispatches thunk → thunk.rejected resets state that useEffect depends on → infinite loop
- No "checked" or "attempted" flag to break the dispatch cycle after first failure

#### 9b. Auth Guard Re-entrance

```
# Find guard components
Glob(pattern="**/*Guard*.tsx", path="frontend/app/")

# Check if guards track whether auth check was already attempted
Grep(pattern="authChecked|sessionChecked|hasChecked", glob="*.tsx", path="frontend/app/components/guards/", output_mode="content")
```

**Flag:**
- Guards dispatching auth-check thunks without tracking whether check was already attempted
- Guards where "not authenticated" state is indistinguishable from "never checked" state

#### 9c. Protected Route Links from Public Pages

```
# Find link targets in auth/public pages pointing to guarded routes
Grep(pattern="to=\"(/admin|/projects|/dashboard)", glob="*.tsx", path="frontend/app/pages/auth/", output_mode="content")

# Cross-reference against guarded route definitions
Grep(pattern="Guard", path="frontend/app/routes.ts", output_mode="content")
```

**Flag:**
- Public pages linking to protected routes (bypasses login flow, triggers guard redirect loops)
- Link text implying login form but actually pointing to a guarded dashboard/page

> See also 3b for semantic link text mismatch detection patterns.

---

## Scoring Methodology

Each category is scored 0-100% based on compliance:

| Category | Weight | Scoring |
|----------|--------|---------|
| Design System | 15% | (compliant items / total items) x 100 |
| Missing Icons | 5% | (pages with icons / total pages) x 100 |
| Missing Pages | 20% | (implemented pages / PRD-required pages) x 100 |
| Missing UI States | 15% | (states handled / states required) x 100 |
| Hardcoded Content | 5% | 100 - (hardcoded items x 5), min 0 |
| Accessibility | 10% | (accessible elements / total interactive elements) x 100 |
| API Integration | 15% | (connected endpoints / total endpoints) x 100 |
| Backend | 5% | (compliant modules / total modules) x 100 |
| Auth & State Mgmt | 10% | (guards with checked flag / total guards) x 100, minus infinite loop patterns |

**Overall Score** = weighted average of all categories.

| Score Range | Rating |
|-------------|--------|
| 90-100% | Excellent |
| 75-89% | Good |
| 50-74% | Needs Work |
| 0-49% | Critical |

---

## Report Output

Save to: `./dev/reports/gap-analysis-{YYYY-MM-DD}.md`

See the [gap-finder agent](../../agents/quality/gap-finder.md) for the full report template.

---

## Related

- **Agent:** [gap-finder](../../agents/quality/gap-finder.md) — Executes the scan
- **Command:** [/dev:gap-finder](../../commands/dev/gap-finder.md) — Invocation entry point
- **Related agents:** [reviewer](../../agents/quality/reviewer.md), [api-integration-agent](../../agents/development/api-integration-agent.md)
