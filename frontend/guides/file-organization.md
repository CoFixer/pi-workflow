# File Organization

Proper file and directory structure for maintainable, scalable frontend code in the ActivityCoaching application.

---

## Directory Structure

```
frontend/app/
├── components/
│   ├── ui/                    # Shadcn/UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── form.tsx
│   └── layout/                # Layout components
│       ├── header.tsx
│       └── footer.tsx
├── hooks/                     # Custom hooks
│   └── providers/             # Context providers
│       └── providers.tsx      # Redux provider setup
├── lib/                       # Utilities
│   └── utils.ts               # cn() utility
├── pages/                     # Page components
│   ├── layout.tsx             # Main layout
│   ├── auth/                  # Auth pages
│   │   ├── layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── public/                # Public pages
│       ├── home.tsx
│       └── about.tsx
├── redux/                     # State management
│   ├── features/              # Redux slices
│   │   └── userSlice.ts
│   └── store/                 # Store configuration
│       ├── store.ts
│       ├── rootReducer.ts
│       └── hooks.ts           # useAppDispatch, useAppSelector
├── routes/                    # Route definitions
│   ├── public.routes.ts
│   └── auth.routes.ts
├── services/                  # API services
│   ├── httpService.ts         # Axios orchestrator
│   ├── httpMethods/           # HTTP method factories
│   │   ├── index.ts           # Export all methods
│   │   ├── get.ts             # GET factory
│   │   ├── post.ts            # POST factory
│   │   ├── put.ts             # PUT factory
│   │   ├── delete.ts          # DELETE factory
│   │   ├── patch.ts           # PATCH factory
│   │   ├── requestInterceptor.ts   # Request interceptor
│   │   └── responseInterceptor.ts  # Response interceptor
│   └── httpServices/          # Domain-specific services
│       ├── queries/           # TanStack Query hooks (PUBLIC PAGES ONLY)
│       │   ├── index.ts
│       │   └── usePublicCategories.ts
│       ├── authService.ts
│       ├── exerciseService.ts
│       ├── meetingService.ts
│       └── userService.ts
├── styles/                    # CSS files
│   └── app.css                # Tailwind + theme variables
├── types/                     # TypeScript types
│   ├── user.d.ts
│   └── httpService.d.ts
├── utils/                     # Utility functions
│   ├── errorHandler.ts
│   ├── actions/               # Server actions
│   └── validations/           # Zod schemas
│       └── auth.ts
├── root.tsx                   # Root component
└── routes.ts                  # Main route config
```

---

## Folder Purposes

### components/

Reusable components organized by type:

```
components/
├── ui/                  # Shadcn/UI primitives (Button, Input, Card, Form)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── form.tsx
│   └── label.tsx
└── layout/              # Layout wrappers
    ├── header.tsx
    └── footer.tsx
```

**Rules:**
- `ui/` contains only Shadcn/UI primitive components
- `layout/` contains page layout components (header, footer, sidebar)
- Components here are truly reusable across the application

---

### pages/

Page components organized by route area:

```
pages/
├── layout.tsx           # Main layout wrapper
├── auth/                # Authentication-related pages
│   ├── layout.tsx       # Auth-specific layout
│   ├── login.tsx
│   └── register.tsx
└── public/              # Public pages
    ├── home.tsx
    └── about.tsx
```

**Rules:**
- Each page is a default export
- Layout files wrap child routes
- Organize by route hierarchy

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
- `httpService.ts` is the Axios orchestrator with interceptors
- `httpMethods/` contains factory functions for each HTTP method
- `httpServices/` contains domain-specific API services
- `queries/` contains TanStack Query hooks for **public pages only**
- Feature services use `httpService` for all requests

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

### routes/

Route configuration files:

```
routes/
├── public.routes.ts     # Public route definitions
└── auth.routes.ts       # Auth route definitions
```

**Rules:**
- Separate files for route groups
- Imported into main `routes.ts`

---

## Import Alias

The project uses `~/` as an alias for the `/app/` directory:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

**Examples:**

```typescript
// ✅ Correct - using alias
import { Button } from '~/components/ui/button';
import { useAppDispatch } from '~/redux/store/hooks';
import type { User } from '~/types/user';

// ❌ Avoid - relative paths for distant imports
import { Button } from '../../../components/ui/button';
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
1. app/pages/posts/
   └── index.tsx              # Main page component

2. app/services/httpServices/
   └── postService.ts         # API service

3. app/services/httpServices/queries/
   └── usePosts.ts            # TanStack Query hooks

4. app/redux/features/
   └── postSlice.ts           # Redux slice (if needed)

5. app/types/
   └── post.d.ts              # TypeScript types

6. app/routes/
   └── post.routes.ts         # Route definitions

7. app/utils/validations/
   └── post.ts                # Zod schemas (if forms needed)
```

Then update:
- `app/routes.ts` - Add new routes
- `app/redux/store/rootReducer.ts` - Add new reducer (if using Redux)
- `app/services/httpServices/queries/index.ts` - Export new query hooks

---

## Import Organization

### Import Order (Recommended)

```typescript
// 1. React and React-related
import { useState, useCallback, useMemo } from 'react';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';

// 3. Redux hooks and actions
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { someAction } from '~/redux/features/someSlice';

// 4. Components
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

// 5. Utilities
import { cn } from '~/lib/utils';
import { httpService } from '~/services/httpService';

// 6. Type imports (grouped)
import type { User } from '~/types/user';
import type { Post } from '~/types/post';

// 7. Relative imports (same feature)
import { MySubComponent } from './MySubComponent';
```

**Use single quotes** for all imports (project standard)

---

## Summary

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | Shadcn/UI primitives |
| `components/layout/` | Layout wrappers |
| `pages/` | Page components by route |
| `redux/features/` | Redux slices |
| `redux/store/` | Store configuration |
| `services/httpService.ts` | Axios orchestrator |
| `services/httpMethods/` | HTTP method factories |
| `services/httpServices/` | Domain-specific API services |
| `services/httpServices/queries/` | TanStack Query hooks |
| `types/` | TypeScript types |
| `utils/` | Utility functions |
| `utils/validations/` | Zod schemas |
| `routes/` | Route definitions |
| `hooks/` | Custom hooks |
| `lib/` | Utility libraries (`cn()`) |
| `styles/` | CSS files |

---

## Related Resources

- [Component Patterns](component-patterns.md) - How to structure components
- [Data Fetching](data-fetching.md) - Service layer patterns
- [Routing Guide](routing-guide.md) - Route organization
