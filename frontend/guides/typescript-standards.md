# TypeScript Standards

TypeScript best practices for type safety and maintainability in the ActivityCoaching frontend.

---

## Strict Mode

### Configuration

TypeScript strict mode is **enabled** in the project:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**This means:**

- No implicit `any` types
- Null/undefined must be handled explicitly
- Type safety enforced

---

## Type Imports

### Use `import type` for Type-Only Imports

```typescript
// ✅ CORRECT - Use import type for types
import type { User, UserState } from '~/types/user';
import type { RootState, AppDispatch } from '~/redux/store/store';

// ✅ Mixed imports
import { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';

// ❌ AVOID - Regular import for types
import { User } from '~/types/user';
```

---

## No `any` Type

### Always Use Specific Types

```typescript
// ❌ AVOID - any type
const handleChange = (event: any) => {
  setName(event.target.value);
};

// ✅ CORRECT - Specific type
const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  setName(event.target.value);
};
```

### When Type is Unknown

```typescript
// Use unknown instead of any
function processData(data: unknown) {
  // Type guard to narrow the type
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (Array.isArray(data)) {
    return data.length;
  }
  return null;
}
```

---

## Component Props

### Interface Pattern

```typescript
// Props interface with JSDoc comments
interface UserCardProps {
  /** The user to display */
  user: User;
  /** Whether the card is selected */
  isSelected?: boolean;
  /** Callback when card is clicked */
  onClick?: (userId: number) => void;
}

export default function UserCard({ user, isSelected = false, onClick }: UserCardProps) {
  return (
    // ...
  );
}
```

### Children Props

```typescript
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
}
```

---

## Zod Schema Type Inference

### Derive Types from Schemas

```typescript
import * as z from 'zod';

// Define schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'user', 'guest']),
});

// Infer type from schema
export type User = z.infer<typeof userSchema>;

// Result:
// type User = {
//   id: number;
//   email: string;
//   name: string;
//   role: 'admin' | 'user' | 'guest';
// }
```

---

## Redux Types

### Typed Store

```typescript
// ~/redux/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks

```typescript
// ~/redux/store/hooks.ts
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Typed Slice State

```typescript
// ~/types/user.d.ts
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}
```

---

## Generic Types

### HTTP Service

```typescript
// Type-safe API calls
const users = await httpService.get<User[]>('/users');
const user = await httpService.get<User>(`/users/${id}`);
const newUser = await httpService.post<User>('/users', userData);
```

### Async Thunk

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk<
  User[],           // Return type
  void,             // Argument type
  { rejectValue: string }  // Config
>(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUsers();
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);
```

---

## Event Handlers

### Typed Events

```typescript
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';

// Input change
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Form submit
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

// Button click
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  // ...
};

// Custom handler
const handleSelect = (id: number) => {
  setSelectedId(id);
};
```

---

## Type Definition Files

### Location: `~/types/`

```typescript
// ~/types/user.d.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}
```

```typescript
// ~/types/httpService.d.ts
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

export interface ErrorResponse {
  message: string;
  status: number;
}
```

---

## Utility Types

### Common Patterns

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserEmail = Pick<User, 'id' | 'email'>;

// Omit - exclude properties
type CreateUser = Omit<User, 'id' | 'createdAt'>;

// Record - object with typed keys
type UserMap = Record<number, User>;

// Required - all properties required
type RequiredUser = Required<PartialUser>;
```

---

## Summary

**TypeScript Checklist:**

- ✅ Strict mode enabled, no `any` types
- ✅ Use `import type` for type-only imports
- ✅ Define component props as interfaces
- ✅ Use `z.infer<typeof schema>` for Zod types
- ✅ Use typed Redux hooks (`useAppDispatch`, `useAppSelector`)
- ✅ Type all event handlers properly
- ✅ Create type definitions in `~/types/`
- ✅ Use generics for type-safe API calls

**See Also:**

- [common-patterns.md](common-patterns.md) - Redux patterns
- [data-fetching.md](data-fetching.md) - Typed API calls
- [complete-examples.md](complete-examples.md) - Full examples
