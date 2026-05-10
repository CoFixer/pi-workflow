# File Organization

Proper file and directory structure for maintainable, scalable React Native code.

---

## Directory Structure

```
src/
├── app/                       # Expo Router pages
│   ├── (tabs)/                # Tab navigation
│   ├── (auth)/                # Auth screens
│   └── _layout.tsx            # Root layout
├── components/                # Reusable components
│   ├── ui/                    # React Native Paper components
│   └── layout/                # Layout components
├── hooks/                     # Custom React hooks
│   └── providers/             # Context providers
├── lib/                       # Utility libraries
├── redux/                     # State management
│   ├── features/              # Redux slices
│   └── store/                 # Store configuration
├── services/                  # API services
│   ├── httpService.ts         # Axios orchestrator
│   ├── httpMethods/           # HTTP method factories
│   │   ├── index.ts           # Export all methods
│   │   ├── get.ts             # GET factory
│   │   ├── post.ts            # POST factory
│   │   ├── put.ts             # PUT factory
│   │   ├── delete.ts          # DELETE factory
│   │   ├── patch.ts           # PATCH factory
│   │   ├── requestInterceptor.ts
│   │   └── responseInterceptor.ts
│   └── httpServices/          # Domain-specific services
│       ├── queries/           # TanStack Query hooks (PUBLIC PAGES ONLY)
│       │   ├── index.ts
│       │   └── usePublicCategories.ts
│       ├── authService.ts
│       ├── exerciseService.ts
│       ├── meetingService.ts
│       └── userService.ts
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
│   └── validations/           # Zod validation schemas
├── styles/                    # Global styles
└── App.tsx                    # App entry point
```

---

## Folder Purposes

### components/

Reusable components organized by type:

```
components/
├── ui/                  # React Native Paper & custom components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Skeleton.tsx
└── layout/              # Layout wrappers
    ├── Header.tsx
    ├── TabBar.tsx
    └── SafeContainer.tsx
```

**Rules:**
- `ui/` contains React Native Paper wrappers and custom UI components
- `layout/` contains layout components (header, tab bar, safe containers)
- Components here are truly reusable across the application

---

### app/ (Expo Router)

Screen components organized by route groups:

```
app/
├── _layout.tsx          # Root layout
├── index.tsx            # Home screen
├── (tabs)/              # Tab navigation group
│   ├── _layout.tsx      # Tab bar layout
│   ├── home.tsx
│   ├── profile.tsx
│   └── settings.tsx
├── (auth)/              # Auth screens group
│   ├── _layout.tsx      # Auth layout
│   ├── login.tsx
│   └── register.tsx
└── [id].tsx             # Dynamic route
```

**Rules:**
- Each screen is a default export
- `_layout.tsx` files wrap child routes
- Parentheses `()` create route groups without affecting URL
- Brackets `[]` create dynamic routes

---

### redux/

Redux state management:

```
redux/
├── features/            # Redux slices by domain
│   ├── userSlice.ts
│   └── counterSlice.ts
└── store/               # Store configuration
    ├── store.ts         # Store setup
    ├── rootReducer.ts   # Combined reducers
    └── hooks.ts         # Typed hooks (useAppDispatch, useAppSelector)
```

**Rules:**
- One slice per domain/feature
- Async thunks defined in service files, not slices
- Always use typed hooks from `store/hooks.ts`

---

### services/

API services and HTTP client:

```
services/
├── httpService.ts         # Axios orchestrator
├── httpMethods/           # HTTP method factories
│   ├── index.ts           # Export all methods
│   ├── get.ts             # GET factory
│   ├── post.ts            # POST factory
│   ├── put.ts             # PUT factory
│   ├── delete.ts          # DELETE factory
│   ├── patch.ts           # PATCH factory
│   ├── requestInterceptor.ts   # Request interceptor
│   └── responseInterceptor.ts  # Response interceptor
└── httpServices/          # Domain-specific services
    ├── queries/           # TanStack Query hooks (PUBLIC PAGES ONLY)
    │   ├── index.ts
    │   └── usePublicCategories.ts
    ├── authService.ts
    ├── exerciseService.ts
    ├── meetingService.ts
    └── userService.ts
```

**Rules:**
- `httpService.ts` is the Axios orchestrator
- `httpMethods/` contains HTTP method factories and interceptors
- Feature services in `httpServices/` use method factories for all requests
- `queries/` for TanStack Query hooks (public pages only)

---

### types/

TypeScript type definitions:

```
types/
├── user.d.ts            # User-related types
├── httpService.d.ts     # API response/error types
└── index.d.ts           # Shared types
```

**Rules:**
- Use `.d.ts` extension for type-only files
- Group types by domain
- Export types for reuse across the app

---

### utils/

Utility functions:

```
utils/
├── errorHandler.ts      # HTTP error handling
├── actions/             # React Router server actions
│   └── auth.ts
└── validations/         # Zod validation schemas
    └── auth.ts
```

**Rules:**
- Pure utility functions (no React hooks)
- Validation schemas use Zod
- Server actions for form submissions

---

### hooks/

Custom React hooks:

```
hooks/
└── providers/           # Context providers
    └── providers.tsx    # Redux provider setup
```

**Rules:**
- Custom hooks that use React hooks
- Provider setup for context

---

### Navigation

Expo Router uses file-based routing (no separate route files needed):

```
app/
├── _layout.tsx          # Root navigator (Stack/Tabs)
├── (tabs)/
│   └── _layout.tsx      # Tab navigator
└── (auth)/
    └── _layout.tsx      # Auth stack navigator
```

**Rules:**
- Use `_layout.tsx` files to configure navigators
- Route groups `()` don't affect the URL path
- Dynamic routes use `[param].tsx` syntax

---

## Import Alias

The project uses `@/` as an alias for the `/src/` directory:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Examples:**

```typescript
// ✅ Correct - using alias
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/redux/store/hooks';
import type { User } from '@/types/user';

// ❌ Avoid - relative paths for distant imports
import { Button } from '../../../components/ui/Button';
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `UserCard.tsx` |
| Shadcn/UI | lowercase | `button.tsx`, `card.tsx` |
| Redux slices | camelCase + Slice | `userSlice.ts` |
| Services | camelCase + Service | `userService.ts` |
| Types | camelCase | `user.d.ts` |
| Utils | camelCase | `errorHandler.ts` |
| Routes | kebab-case | `auth.routes.ts` |
| Validations | camelCase | `auth.ts` |

---

## Creating a New Feature

When adding a new feature (e.g., "posts"), create these files:

```
1. src/app/posts/
   └── index.tsx              # Main screen component

2. src/services/httpServices/
   └── postService.ts         # API service methods

3. src/services/httpServices/queries/
   └── usePosts.ts            # TanStack Query hooks (if needed)

4. src/redux/features/
   └── postSlice.ts           # Redux slice

5. src/types/
   └── post.d.ts              # TypeScript types

6. src/utils/validations/
   └── post.ts                # Zod schemas (if forms needed)
```

Then update:
- `src/redux/store/rootReducer.ts` - Add new reducer
- `src/services/httpServices/queries/index.ts` - Export new query hooks

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. React and React Native
import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'react-native-paper';

// 3. Redux hooks and actions
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { someAction } from '@/redux/features/someSlice';

// 4. Components
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';

// 5. Services and utilities
import { cn } from '@/lib/utils';
import { userService } from '@/services/httpServices/userService';

// 6. Type imports (grouped)
import type { User } from '@/types/user';
import type { Post } from '@/types/post';

// 7. Relative imports (same feature)
import { MySubComponent } from './MySubComponent';
```

**Use single quotes** for all imports (project standard)

---

## Summary

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | React Native Paper components |
| `components/layout/` | Layout wrappers |
| `app/` | Expo Router screens |
| `redux/features/` | Redux slices |
| `redux/store/` | Store configuration |
| `services/httpService.ts` | Axios orchestrator |
| `services/httpMethods/` | HTTP method factories & interceptors |
| `services/httpServices/` | Domain-specific API services |
| `services/httpServices/queries/` | TanStack Query hooks |
| `types/` | TypeScript types |
| `utils/` | Utility functions |
| `utils/validations/` | Zod schemas |
| `hooks/` | Custom hooks |
| `lib/` | Utility libraries (`cn()`) |
| `styles/` | Global styles |

---

## Related Resources

- [Component Patterns](component-patterns.md) - How to structure components
- [Data Fetching](data-fetching.md) - Service layer patterns
- [Navigation Guide](navigation-guide.md) - Navigation setup
