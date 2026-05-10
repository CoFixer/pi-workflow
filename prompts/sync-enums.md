# Sync Enums Across Stacks (Bidirectional)

You are a full-stack code organization specialist. Your task is to synchronize enum definitions **bidirectionally** across all stacks — backend ↔ frontend(s). Whichever stack was modified becomes the **source**; all other stacks are **targets**.

## Enum Categories

| Category | Definition | Sync Behavior |
|----------|-----------|---------------|
| **Shared enum** | Exists in both backend AND at least one frontend | Synced bidirectionally |
| **Stack-specific enum** | Exists in only one stack | NEVER synced unless user explicitly promotes it |

---

## PHASE 0: Detect Project Stacks & Sync Direction

### Step 0A: Detect Backend Stack

```bash
# NestJS
ls backend/src/shared/enums/ 2>/dev/null && echo "STACK=nestjs"

# Django
fd -e py "enums" backend/ --max-depth 3 2>/dev/null && echo "STACK=django"
```

**Backend enum locations by stack:**

| Stack | Enum Directory | File Extension | Declaration |
|-------|---------------|----------------|-------------|
| **NestJS** | `backend/src/shared/enums/` | `.enum.ts` | `export enum XxxEnum { ... }` |
| **Django** | `backend/<app>/enums/` or `backend/shared/enums/` | `.py` | `class XxxEnum(str, Enum): ...` or `class XxxEnum(models.TextChoices): ...` |

### Step 0B: Detect Frontend Targets

```bash
ls frontend/app/ 2>/dev/null && echo "TARGET=frontend"
ls dashboard/app/ 2>/dev/null && echo "TARGET=dashboard"
ls mobile/app/ 2>/dev/null && echo "TARGET=mobile"
ls apps/*/app/ 2>/dev/null && echo "TARGET=monorepo"
```

**Frontend enum locations by stack:**

| Stack | Enum Directory | Import Alias |
|-------|---------------|--------------|
| **React (web)** | `frontend/app/enums/` | `~/enums` |
| **React (dashboard)** | `dashboard/app/enums/` | `~/enums` |
| **React Native** | `mobile/app/enums/` | `~/enums` or `@/enums` |

### Step 0C: Detect Sync Direction (Source → Targets)

```bash
# Check git diff for modified enum files
git diff --name-only HEAD -- '**/enums/**'
# Also check staged changes
git diff --name-only --cached -- '**/enums/**'
# Also check untracked new enum files
git ls-files --others --exclude-standard -- '**/enums/**'
```

**Direction rules:**

| Modified Files | Source | Targets |
|---------------|--------|---------|
| Backend enums only | Backend | All frontends |
| Frontend enums only | That frontend | Backend + other frontends |
| Both backend AND frontend | **ASK USER** which to use as source | The other stacks |
| No diff (clean tree) | **ASK USER** or compare all stacks for drift | Whichever is out of sync |

**Run all subsequent phases using the detected source → target direction.**

---

## PHASE 1: Discovery

### Step 1A: Scan ALL Enum Locations

**Backend (NestJS):**
```bash
fd -e ts . backend/src/shared/enums/
rg -n "export enum" backend/src/shared/enums/ --glob '*.ts'
```

**Backend (Django):**
```bash
fd -e py "enums" backend/ --max-depth 3
rg -n "class \w+Enum" backend/ --glob '*.py' --glob '!**/migrations/**'
```

**Each Frontend Target:**
```bash
fd -e ts . <target>/app/enums/ 2>/dev/null
rg -n "export enum" <target>/app/enums/ --glob '*.ts' 2>/dev/null
```

For each enum found, record:
- File name (e.g., `role.enum.ts`)
- Enum name (e.g., `RolesEnum`)
- Members with values (e.g., `ADMIN = 'admin'`)
- Which stack it lives in

### Step 1B: Classify Enums

For each unique enum name:
- If found in backend AND at least one frontend → **shared enum**
- If found in backend only → **backend-specific**
- If found in frontend only → **frontend-specific**

### Step 1C: Detect Frontend String Literal Types

```bash
rg -n "export type \w+ = '[^']+'" <target>/app/types/ --glob '*.ts'
```

### Step 1D: Detect Hardcoded String Comparisons (all stacks)

```bash
# Frontend — build pattern from ALL shared enum values
rg -n "=== '(value1|value2|...)'" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**' --glob '!**/node_modules/**'
rg -n "!== '(value1|value2|...)'" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**'
rg -n "case '(value1|value2|...)'" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**'

# Backend — scan for hardcoded strings that match enum values
rg -n "'(value1|value2|...)'" backend/src/ --glob '*.ts' --glob '!**/enums/**' --glob '!**/node_modules/**' --glob '!**/migrations/**'
```

### Step 1E: Detect Hardcoded Enum Values in JSX/TSX

```bash
rg -n "value=\"(value1|value2|...)\"" <target>/app/ --glob '*.{tsx,jsx}' --glob '!**/enums/**'
rg -n "useState[<(].*'(value1|value2|...)'" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**'
rg -n "handleSort\('(value1|value2|...)'\)" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**'
```

---

## PHASE 2: Build Sync Manifest

Compare source enums against target enums:

```
### Sync Manifest (source: <detected_source>)

**SYNC DIRECTION: <source> → <target1>, <target2>, ...**

**NEW (source → targets):**
- <source>/role.enum.ts → <target>/enums/role.enum.ts (CREATE)

**UPDATED (values changed in source):**
- <source>/pin-status.enum.ts → <target>/enums/pin-status.enum.ts (UPDATE: added CLOSED)

**IN SYNC:**
- screen-status.enum.ts ✓

**STACK-SPECIFIC (not synced):**
- frontend/screen-filter-status.enum.ts (frontend-specific — skip)
- frontend/sort-order.enum.ts (frontend-specific — skip)

**NEW SHARED ENUM (promote?):**
- frontend/activity-type.enum.ts exists in frontend only
  → If user wants it shared, CREATE in backend too

**TYPE ALIASES TO UPDATE:**
- types/auth.ts: UserRole → RolesEnum

**HARDCODED STRINGS TO REPLACE:**
- Backend: guards/roles.guard.ts:26 — 'admin' → RolesEnum.ADMIN
- Frontend: guards/AdminGuard.tsx:26 — 'admin' → RolesEnum.ADMIN
```

---

## PHASE 3: Create/Update Enum Files in Targets

For each shared enum, copy from source to all targets:

### Backend → Frontend (NestJS → TypeScript)

1. **Create** the frontend enum file at `<target>/app/enums/{name}.enum.ts`
2. **Copy** the exact enum declaration (identical values and member names)
3. **Update** the barrel file at `<target>/app/enums/index.ts`

### Frontend → Backend (TypeScript → NestJS)

1. **Create** the backend enum file at `backend/src/shared/enums/{name}.enum.ts`
2. **Copy** the exact enum declaration (identical values and member names)
3. **Update** the barrel file at `backend/src/shared/enums/index.ts`

### Frontend → Backend (TypeScript → Django)

Convert TypeScript enum to Python:
- `export enum RolesEnum { ADMIN = 'admin' }` → `class RolesEnum(str, Enum): ADMIN = 'admin'`
- Create at `backend/<app>/enums/{name}_enum.py` or `backend/shared/enums/{name}_enum.py`
- Update `__init__.py` barrel

### Backend → Frontend (Django → TypeScript)

Convert Python enum to TypeScript:
- `class RolesEnum(str, Enum): ADMIN = 'admin'` → `export enum RolesEnum { ADMIN = 'admin' }`
- `class StatusEnum(models.TextChoices): ACTIVE = 'active', 'Active'` → `export enum StatusEnum { ACTIVE = 'active' }`

### Frontend → Frontend (cross-target sync)

If multiple frontend targets exist, copy the enum file as-is between TypeScript targets.

**Naming convention:**
- File: kebab-case (e.g., `pin-status.enum.ts`)
- Enum name: PascalCase with `Enum` suffix (e.g., `PinStatusEnum`)

**Stack-specific enums are NEVER synced** unless user explicitly requests promotion.

---

## PHASE 4: Update Type Aliases (Frontend targets only)

For each string literal union type that maps to a synced enum:

1. Add `import { XxxEnum } from '~/enums';` to the type file
2. Replace `export type Xxx = 'a' | 'b' | 'c';` with `export type Xxx = XxxEnum;`
3. All downstream interfaces that use the type alias continue to work unchanged

---

## PHASE 5: Replace Hardcoded Strings (All stacks)

For each file with hardcoded string values that match a shared enum:

### Frontend Files

1. Add `import { XxxEnum } from '~/enums';` at the appropriate position in the import block
2. Replace ALL occurrences:

| Pattern | Before | After |
|---------|--------|-------|
| **Comparisons** | `=== 'value'` | `=== XxxEnum.MEMBER` |
| **Negations** | `!== 'value'` | `!== XxxEnum.MEMBER` |
| **Record keys** | `{ 'value': ... }` | `{ [XxxEnum.MEMBER]: ... }` |
| **Switch cases** | `case 'value':` | `case XxxEnum.MEMBER:` |
| **useState defaults** | `useState('value')` | `useState(XxxEnum.MEMBER)` |
| **Option values** | `<option value="value">` | `<option value={XxxEnum.MEMBER}>` |
| **Function arguments** | `handleSort('value')` | `handleSort(XxxEnum.MEMBER)` |
| **JSX attributes** | `status="value"` | `status={XxxEnum.MEMBER}` |
| **Ternary values** | `x ? 'value' : ...` | `x ? XxxEnum.MEMBER : ...` |

### Backend Files (NestJS)

1. Add `import { XxxEnum } from '../shared/enums';` (adjust relative path)
2. Replace patterns:

| Pattern | Before | After |
|---------|--------|-------|
| **Comparisons** | `=== 'value'` | `=== XxxEnum.MEMBER` |
| **Decorators** | `@Roles('admin')` | `@Roles(RolesEnum.ADMIN)` |
| **Switch cases** | `case 'value':` | `case XxxEnum.MEMBER:` |
| **Object literals** | `{ role: 'admin' }` | `{ role: RolesEnum.ADMIN }` |
| **Conditionals** | `if (x === 'value')` | `if (x === XxxEnum.MEMBER)` |

### Backend Files (Django)

1. Add `from shared.enums.xxx_enum import XxxEnum`
2. Replace `'value'` → `XxxEnum.MEMBER.value` or `XxxEnum.MEMBER` depending on context

---

## PHASE 6: Verification

```bash
# Backend type check
cd backend && npx tsc --noEmit

# Frontend type check (per target)
cd <target> && npx tsc --noEmit

# Build check (per target)
cd <target> && npm run build

# Verify no remaining hardcoded strings for shared enum values
rg -n "=== '(value1|value2|...)'" <target>/app/ --glob '*.{ts,tsx}' --glob '!**/enums/**' --glob '!**/node_modules/**'
rg -n "'(value1|value2|...)'" backend/src/ --glob '*.ts' --glob '!**/enums/**' --glob '!**/node_modules/**' --glob '!**/migrations/**'
```

---

## Output Report

After completion, report:
- **Sync direction**: `<source> → <target1>, <target2>, ...`
- **Backend stack**: NestJS / Django
- **Frontend targets synced**: N (list each)
- **Shared enums synced**: N (list each with direction)
- **New enums created**: N (in which stacks)
- **Stack-specific enums preserved**: N (list each)
- **Type aliases updated**: N
- **Hardcoded strings replaced**: N across M files (per stack)
- **Build status**: typecheck PASSED / FAILED, build PASSED / FAILED (per stack)
