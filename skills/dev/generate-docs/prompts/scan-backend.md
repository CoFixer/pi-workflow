# Backend Folder Scanning Rules

Scan backend project folders to discover implemented endpoints, services, and tests.

---

## Target Folders

| Type | Glob Pattern |
|------|--------------|
| Controllers | `backend/src/modules/*/*.controller.ts` |
| Services | `backend/src/modules/*/*.service.ts` |
| Entities | `backend/src/modules/*/*.entity.ts` |
| E2E Tests | `backend/test/**/*.e2e-spec.ts` |

---

## Controller Scanning

### Extract Endpoints

Parse controller files for HTTP decorators:

```typescript
@Get()           → GET /[base]
@Get(':id')      → GET /[base]/:id
@Post()          → POST /[base]
@Patch(':id')    → PATCH /[base]/:id
@Delete(':id')   → DELETE /[base]/:id
```

### Extract Base Path

From `@Controller()` decorator:
```typescript
@Controller('ideas')  → base path = /ideas
@Controller('auth')   → base path = /auth
```

### Identify Auth Requirements

| Decorator | Auth Status |
|-----------|-------------|
| `@Public()` | Public |
| `@UseGuards(JwtAuthGuard)` | JWT |
| `@UseGuards(AdminGuard)` | Admin |
| No guard decorator | JWT (default) |

---

## Service Scanning

Identify service methods that map to endpoints:

```typescript
// Method patterns to detect
async create(dto: CreateDto): Promise<Entity>
async findAll(query: QueryDto): Promise<Entity[]>
async findOne(id: string): Promise<Entity>
async update(id: string, dto: UpdateDto): Promise<Entity>
async remove(id: string): Promise<void>
```

---

## E2E Test Scanning

Map test files to modules:

```
backend/test/auth.e2e-spec.ts → Auth module
backend/test/ideas.e2e-spec.ts → Ideas module
```

Parse test structure:
```typescript
describe('AuthController (e2e)', () => {
  it('/auth/login (POST)')   → endpoint tested
  it('/auth/logout (GET)')   → endpoint tested
})
```

---

## Output Structure

Generate structured data for each module:

```yaml
module: ideas
controller_file: idea.controller.ts
base_path: /ideas
endpoints:
  - method: GET
    path: /ideas
    auth: public
    has_test: true
  - method: POST
    path: /ideas
    auth: jwt
    has_test: true
  - method: GET
    path: /ideas/:id
    auth: public
    has_test: false
service_methods:
  - create
  - findAll
  - findOne
  - update
  - remove
```

---

## Cross-Reference

Compare discovered endpoints with:

1. **PROJECT_API.md** - Expected endpoints from PRD
2. **Existing status file** - Previous scan results

Report:
- New endpoints found (not in docs)
- Missing endpoints (in docs but not implemented)
- Test coverage gaps
