---
skill_name: organize-types
applies_to_local_project_only: true
auto_trigger_regex: [organize types, typescript types, type organization, refactor types, centralize types, barrel exports]
tags: [code-quality, typescript, types, organization]
related_skills: [figma-to-react-converter, html-to-react-converter]
---

# organize-types

Analyze and maintain TypeScript type organization in the frontend codebase.

## What this skill does

Scans the frontend codebase to identify type organization issues and maintain the established type structure:

1. **Find misplaced types**: Identify type definitions outside the `types/` folder
2. **Detect duplicates**: Find duplicate type definitions across multiple files
3. **Check reusability**: Identify types used in 2+ files that should be centralized
4. **Suggest organization**: Recommend proper location based on type category
5. **Validate structure**: Ensure types follow the established directory structure
6. **Check barrel exports**: Validate that all barrel exports (`index.d.ts`) are up-to-date

## When to use this skill

Run this skill when:
- **Adding new API endpoints** - to ensure request/response types are properly organized
- **Creating new features** - to organize domain entities and related types
- **Refactoring components** - to check for duplicate types or better organization opportunities
- **Before releases** - to maintain clean type organization and catch any issues
- **After major changes** - to verify type organization consistency

## Type Organization Structure

The frontend uses a structured approach to organize TypeScript types:

```
frontend/app/types/
├── index.d.ts                    # Root barrel export
├── enums/                        # Shared enums and union types
│   ├── index.d.ts
│   ├── status.d.ts              # EntityStatus, ItemStatus, OrderStatus, etc.
│   ├── category.d.ts            # Category-related enums
│   └── common.d.ts              # UserRole, MessageType, Priority, etc.
├── api/                          # API Request/Response contracts
│   ├── index.d.ts
│   ├── auth.d.ts                # Auth API types
│   ├── entity.d.ts              # Entity API types
│   ├── category.d.ts            # Category API types
│   └── common.d.ts              # ApiResponse<T>, ErrorResponse
├── entities/                     # Domain entities
│   ├── index.d.ts
│   ├── user.d.ts
│   ├── entity.d.ts              # Main domain entity
│   ├── item.d.ts                # Related items
│   ├── order.d.ts               # Orders/transactions
│   └── message.d.ts             # Messages/chat
├── ui/                           # Reusable UI component props
│   ├── index.d.ts
│   ├── layout.d.ts              # PageHeaderProps, DetailPageLayoutProps
│   └── shared.d.ts              # EventType, CalendarEvent, Tab
└── redux/                        # Redux type re-exports
    ├── index.d.ts
    ├── auth.d.ts                # Re-export from authSlice
    └── store.d.ts               # Re-export RootState, AppDispatch
```

## Organization Rules

### 1. Enum Types → `types/enums/`
- Status types (EntityStatus, ItemStatus, OrderStatus, ProcessStatus)
- Category enums (CategoryType, Priority, Difficulty)
- Common enums (UserRole, MessageType, NotificationType, AvatarVariant)

### 2. API Types → `types/api/`
- Request types (LoginRequest, RegisterRequest, CreateEntityRequest, etc.)
- Response types (LoginResponse, RegisterResponse, EntitiesApiResponse, etc.)
- Generic wrappers (ApiResponse<T>, ApiErrorResponse, ErrorResponse, PaginatedResponse<T>)

### 3. Entity Types → `types/entities/`
- Domain models (User, Entity, Item, Order, Message, etc.)
- Related interfaces (EntityUser, MessageThread, OrderHistory, etc.)

### 4. UI Types → `types/ui/`
**Only move props if used by 2+ components**
- Shared UI types (EventType, CalendarEvent, CalendarDay, Tab)
- Layout props (PageHeaderProps, DetailPageLayoutProps)
- **Keep component-specific props inline** (BadgeProps, ChatBubbleProps, etc.)

### 5. Redux Types → `types/redux/`
**Re-exports only, keep definitions with slices**
- Auth types (AuthUser, AuthState, UserRole)
- Store types (RootState, AppDispatch)

## What to Check

### ✅ Good Practices
- All service types in `types/api/`
- All domain entities in `types/entities/`
- All enums in `types/enums/`
- Component-specific props inline
- Shared UI types (used by 2+ components) in `types/ui/`
- Redux types co-located with slices, re-exported from `types/redux/`
- All directories have barrel exports (`index.d.ts`)
- Root barrel export includes all subdirectories

### ❌ Issues to Flag
- Type definitions in service files (should be in `types/api/`)
- Duplicate type definitions across files
- Types used in 2+ files but not centralized
- Enum definitions outside `types/enums/`
- UI types in components when used elsewhere
- Missing barrel exports
- Outdated barrel exports (not including all types)

## Example Output

When running this skill, provide a report like this:

```
## Type Organization Report

### ✅ Well Organized
- enums/status.d.ts - All status enums properly defined
- api/auth.d.ts - Auth API types centralized
- entities/meeting.d.ts - Meeting entity properly structured

### ⚠️ Issues Found

**1. Duplicate Types**
- `EntityStatus` defined in:
  - types/enums/status.d.ts ✅
  - components/entities/entity-card.tsx ❌
  **Action**: Remove from entity-card.tsx, import from types

**2. Misplaced Types**
- `ItemDay` in services/httpServices/itemService.ts ❌
  **Action**: Move to types/entities/item.d.ts

**3. Centralization Opportunities**
- `Tab` interface used in:
  - components/ui/tab-switcher.tsx
  - pages/patient/settings.tsx
  **Action**: Move to types/ui/shared.d.ts

### 📊 Summary
- Total types: 127
- Well organized: 115 (90%)
- Issues: 12 (10%)
- Duplicates: 3
- Misplaced: 5
- Should centralize: 4
```

## Common Patterns

### Good Import Patterns
```typescript
// Granular imports
import type { LoginResponse } from '~/types/api/auth';
import type { Meeting } from '~/types/entities/meeting';
import type { SessionStatus } from '~/types/enums/status';

// Barrel import (when importing many types)
import type { LoginResponse, Meeting, SessionStatus } from '~/types';
```

### Keep Inline (Component-specific props)
```typescript
// In components/ui/badge.tsx
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success"
  // ...only used in this component
}
```

### Move to types/ui/ (Shared props)
```typescript
// types/ui/shared.d.ts
export interface Tab {
  id: string;
  label: string;
  badge?: boolean;
  href?: string;
}
// Used by tab-switcher.tsx AND other components
```

## Instructions for Claude

When this skill is invoked:

1. **Scan for type definitions**:
   - Search for `export interface`, `export type`, `export enum` outside `types/` folder
   - Check service files, component files, utility files

2. **Check for duplicates**:
   - Find identical type names defined in multiple locations
   - Compare type definitions to ensure they're truly duplicates

3. **Identify reusability**:
   - Use grep to find where each type is imported
   - Flag types used in 2+ files but not centralized

4. **Validate structure**:
   - Check that all directories have barrel exports
   - Verify barrel exports include all types in their directory
   - Confirm types are in correct directories based on rules above

5. **Generate report**:
   - List well-organized types
   - Flag issues with specific actions
   - Provide summary statistics
   - Suggest specific file moves/updates

## Related Documentation

- Type organization principles based on:
  - Domain-driven design for entities
  - API contract separation
  - Co-location for Redux (best practice)
  - Reusability threshold (2+ uses = centralize)