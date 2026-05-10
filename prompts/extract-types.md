# Extract Inline Types to Type Files

You are a frontend code organization specialist. Your task is to find and extract ALL inline type declarations and inline type assertions from source files into centralized `types/*.ts` files in a **single pass**.

## CRITICAL: Run-Once Guarantee

You MUST complete the FULL SCAN PHASE (Phase 1) before editing ANY file. Build a complete extraction manifest first, then execute all changes. This prevents cascading discovery gaps that require multiple runs.

## Scope

Scan these directories in `frontend/` (and `dashboard/` if present):
- `app/components/**/*.tsx`
- `app/pages/**/*.tsx`
- `app/utils/**/*.ts`
- `app/hooks/**/*.ts`
- `app/redux/**/*.ts`
- `app/services/**/*.ts`

**Exclude**: `app/types/**` (these are the destination files)

## Exceptions — DO NOT Extract

- **Zod-inferred types**: `z.infer<typeof schema>` — must stay co-located with schema
- **Local constant types**: `typeof CONST[number]` — must stay co-located with constant
- **shadcn/ui internals**: types inside `components/ui/` shadcn primitive files (e.g., `FormFieldContextValue` in `form.tsx`)
- **Redux store derived types**: `RootState = ReturnType<typeof store.getState>` and `AppDispatch` in `store.ts`
- **Simple primitive casts**: `value as string`, `payload as number` — acceptable inline
- **Single-field router generics**: `useParams<{ id: string }>` — router-framework pattern, acceptable inline
- **Single-field DOM refs**: `useRef<HTMLDivElement>(null)` — acceptable inline
- **Generic type parameters**: not inline assertions, leave as-is

## Type File Mapping Rules

| Type category | Target file |
|---|---|
| Domain entity (Project, Screen, Pin, etc.) | `types/{domain}.ts` |
| Component props for domain components | `types/{domain}.ts` or `types/components.ts` |
| Shared component props (used 2+ files) | `types/components.ts` |
| Hook option types | `types/hooks.ts` (create if needed) |
| HTTP/API error shapes | `types/httpService.d.ts` |
| Redux slice state interfaces | `types/{domain}.ts` |
| Redux action payload shapes | `types/{domain}.ts` |
| State shapes with 3+ fields from `useState<{...}>` | `types/{domain}.ts` |
| Utility parameter/return types | relevant domain type file or `types/components.ts` |

---

## PHASE 1: Complete Discovery

Run ALL scan groups below. Record every finding before proceeding to Phase 2.

### Group A — Interface/type declarations

```bash
# A1: All interface/type declarations (including indented — no ^ anchor)
rg -n "(interface|type) [A-Z]" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'

# A2: Export declarations specifically
rg -n "export (interface|type) " app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'
```

### Group B — Type assertion patterns

```bash
# B1: Direct type assertions with object literals
rg -n " as \{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'

# B2: Cast expressions
rg -n "\(.*? as \{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'

# B3: getState/context assertions
rg -n "getState\(\) as \{" app/redux --glob '*.ts'
```

### Group C — Generic inline object types

```bash
# C1: useState with inline object type
rg -n "useState<\{" app/components app/pages app/utils app/hooks --glob '*.tsx' --glob '*.ts'

# C2: useRef with inline object type
rg -n "useRef<\{" app/components app/pages app/utils app/hooks --glob '*.tsx' --glob '*.ts'

# C3: Promise with inline return type
rg -n "Promise<\{" app/services app/utils --glob '*.ts'

# C4: Any generic with large inline object (20+ chars between braces)
rg -n "<\{[^>]{20,}\}>" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'
```

### Group D — Inline parameter types

```bash
# D1: Named callback parameters with inline object types (expanded list)
rg -n "\((params|options|config|payload|args|input|request|body|formData|item|result|response|error|event|props|state|context|data|values|dto|form):\s*\{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'

# D2: Destructured parameter with inline type annotation
rg -n "\(\{[^}]+\}:\s*\{" app/components app/pages app/hooks --glob '*.tsx' --glob '*.ts'

# D3: Arrow function parameter with inline object type
rg -n "\([a-zA-Z]+:\s*\{[^)]{10,}\}\)" app/components app/pages app/utils app/hooks app/services --glob '*.tsx' --glob '*.ts'
```

### Group E — Redux-specific patterns

```bash
# E1: Slice reducer action with inline payload type
rg -n "action:\s*\{" app/redux --glob '*.ts'

# E2: createAsyncThunk with inline param type
rg -n "createAsyncThunk\(" app/redux app/services --glob '*.ts' -A 3
```

### Group F — Variable/return annotation patterns

```bash
# F1: Const/let with inline object type annotation (3+ fields)
rg -n "const [a-zA-Z]+:\s*\{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'

# F2: Return type annotation with inline object
rg -n "\):\s*\{" app/components app/pages app/utils app/hooks app/services --glob '*.ts' --glob '*.tsx'
```

---

## PHASE 2: Build Extraction Manifest

Organize all Phase 1 findings into a structured manifest. Apply exception rules to filter out acceptable patterns.

```
### Extraction Manifest

**Target: types/{domain}.ts**
- source-file.ts:NN — `<inline pattern>` → extract as `NamedType`

**Target: types/components.ts**
- component-file.tsx:NN — `<inline pattern>` → extract as `ComponentProps`

**SKIP (exceptions)**
- file.ts:NN — reason it's an exception
```

For each finding, decide:
1. Is it an exception? → Add to SKIP list with reason
2. Does a compatible type already exist in `types/*.ts`? → Reuse it
3. Is it a new type? → Name it and assign to target file

---

## PHASE 3: Dependency Resolution

Before extracting, check for cascading dependencies:

1. If Type A (being extracted) references Type B (also inline) → extract B first, then A
2. If two types share a name in different files → prefix with domain (e.g., `ProjectPinPosition`, `FeedbackPinPosition`)
3. If a type already exists in a `types/*.ts` file with compatible shape → use the existing type, don't create a duplicate

Document the ordered extraction sequence.

---

## PHASE 4: Execute All Extractions

For each manifest item (in dependency order):

1. **Add to type file**: Add the named `export interface` or `export type` to the target `types/*.ts` file
2. **Update source imports**: Add `import type { NewTypeName } from '~/types/{target}'`
3. **Replace inline usage**: Replace the inline object literal with the named type
4. **Update barrel**: If `types/index.ts` already re-exports the target file, no change needed. If a new type file was created, add it to `types/index.ts`

### Replacement examples

**useState generic:**
```typescript
// Before:
const [creds, setCreds] = useState<{ accessId: string; password: string; url: string } | null>(null);
// After:
import type { ProjectCredentials } from '~/types/project';
const [creds, setCreds] = useState<ProjectCredentials | null>(null);
```

**Redux action payload:**
```typescript
// Before:
updateComment: (state, action: { payload: { commentId: string; content: string } }) => {
// After:
import type { UpdateCommentPayload } from '~/types/feedback';
updateComment: (state, action: { payload: UpdateCommentPayload }) => {
```

**Type assertion:**
```typescript
// Before:
return rejectWithValue((error as { message?: string }).message ?? 'Failed');
// After:
import type { ThunkError } from '~/types/httpService';
return rejectWithValue((error as ThunkError).message ?? 'Failed');
```

**Callback parameter:**
```typescript
// Before:
onCreate: (data: { name: string; description?: string }) => void;
// After:
import type { CreateProjectData } from '~/types/project';
onCreate: (data: CreateProjectData) => void;
```

---

## PHASE 5: Re-Scan Verification Loop

After completing all extractions, re-run ALL Phase 1 scans to confirm zero remaining extractable inline types:

```bash
rg -n "(interface|type) [A-Z]" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'
rg -n " as \{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'
rg -n "useState<\{" app/components app/pages --glob '*.tsx'
rg -n "action:\s*\{" app/redux --glob '*.ts'
rg -n "\((params|options|config|payload|args|input|request|body|formData|item|result|response|error|event|props|state|context|data|values|dto|form):\s*\{" app/components app/pages app/utils app/hooks app/redux app/services --glob '*.ts' --glob '*.tsx'
```

If any new violations are found:
- Classify: Is it a true violation or an exception?
- If violation: Add to manifest and extract
- Repeat until re-scan returns zero extractable violations

---

## PHASE 6: Build Verification

```bash
npm run typecheck && npm run build
```

Fix any type errors before declaring completion.

---

## Output Report

After completion, report:
- Number of types extracted
- Files modified
- Type files updated / created
- Exceptions skipped (count + brief reasons)
- Naming conflicts resolved
- Re-scan result: CLEAN / N remaining
- Build status: typecheck PASSED / FAILED, build PASSED / FAILED
