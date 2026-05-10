# Frontend Folder Scanning Rules

Scan frontend project folders to discover implemented screens, API integrations, and tests.

---

## Target Folders

| Type | Glob Pattern |
|------|--------------|
| Pages/Routes | `frontend/app/routes/**/*.tsx` |
| Services | `frontend/app/services/**/*.ts` |
| Redux Slices | `frontend/app/store/**/*Slice.ts` |
| Redux Thunks | `frontend/app/store/**/*Thunks.ts` |
| E2E Tests | `frontend/e2e/**/*.spec.ts` |

**For frontend-admin-dashboard**, use same patterns with `frontend-admin-dashboard/` prefix.

---

## Route/Page Scanning

### React Router 7 Convention

File path maps to route:
```
app/routes/_index.tsx        → /
app/routes/login.tsx         → /login
app/routes/dashboard.tsx     → /dashboard
app/routes/ideas.$id.tsx     → /ideas/:id
app/routes/dashboard_.ideas.tsx → /dashboard/ideas
```

### Extract Page Info

For each page file, identify:
- Route path (from filename)
- Component name
- Imports (services, Redux hooks)

---

## API Integration Detection

### Service Imports

```typescript
import { ideaService } from '~/services/ideaService';
// → Uses ideaService for API calls
```

### Redux Thunk Usage

```typescript
import { loginThunk } from '~/store/authThunks';
dispatch(loginThunk(credentials));
// → Calls POST /auth/login
```

### Direct API Calls

```typescript
await axios.get('/api/ideas');
// → Direct GET /ideas call
```

---

## Service File Scanning

Parse service files to map methods to endpoints:

```typescript
// ideaService.ts
export const ideaService = {
  getAll: () => api.get('/ideas'),           // GET /ideas
  getById: (id) => api.get(`/ideas/${id}`),  // GET /ideas/:id
  create: (data) => api.post('/ideas', data), // POST /ideas
};
```

---

## Redux Thunk Scanning

Map thunks to API endpoints:

```typescript
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    const response = await authService.login(credentials);
    // → POST /auth/login
  }
);
```

---

## E2E Test Scanning

Map test files to pages:

```
frontend/e2e/auth.spec.ts → Login, Register pages
frontend/e2e/ideas.spec.ts → Ideas list, detail pages
```

Parse test structure:
```typescript
test('user can login', async ({ page }) => {
  await page.goto('/login');
  // → /login page tested
});
```

---

## Output Structure

Generate structured data for each screen:

```yaml
screens:
  - route: /login
    file: app/routes/login.tsx
    api_integrations:
      - endpoint: POST /auth/login
        method: Redux thunk (loginThunk)
        status: complete
    has_e2e: true

  - route: /dashboard
    file: app/routes/dashboard.tsx
    api_integrations:
      - endpoint: GET /ideas/my/ideas
        method: Redux thunk (getMyIdeasThunk)
        status: complete
      - endpoint: GET /users/:id
        method: Not integrated
        status: pending
    has_e2e: false
```

---

## Cross-Reference

Compare discovered screens with:

1. **PROJECT_KNOWLEDGE.md** - Expected pages from PRD
2. **API_IMPLEMENTATION_STATUS.md** - Available backend endpoints
3. **Existing status file** - Previous scan results

Report:
- New screens found
- Missing screens (in docs but not implemented)
- API integration gaps (screen exists but missing API calls)
- Test coverage gaps
