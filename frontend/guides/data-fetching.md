# Data Fetching Patterns

Data fetching using Axios HttpService with Redux Toolkit async thunks for the ActivityCoaching application.

---

## Architecture Overview

The frontend uses a layered approach for data fetching:

1. **HttpService** - Centralized Axios wrapper with interceptors
2. **Feature Services** - Domain-specific API methods
3. **Async Thunks** - Redux Toolkit for state management
4. **Redux Slices** - State storage with loading/error states

---

## Service Architecture

The frontend uses a modular httpMethods architecture:

```
services/
├── httpService.ts              # Axios orchestrator
├── httpMethods/                # HTTP method factories
│   ├── index.ts                # Export all methods
│   ├── get.ts                  # GET factory
│   ├── post.ts                 # POST factory
│   ├── put.ts                  # PUT factory
│   ├── delete.ts               # DELETE factory
│   ├── patch.ts                # PATCH factory
│   ├── requestInterceptor.ts   # Request interceptor
│   └── responseInterceptor.ts  # Response interceptor
└── httpServices/               # Domain-specific services
    ├── authService.ts
    ├── exerciseService.ts
    ├── meetingService.ts
    ├── userService.ts
    └── index.ts                # Barrel export
```

---

## HttpService (Axios Orchestrator)

### Core Implementation

Location: `~/services/httpService.ts`

```typescript
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { setupRequestInterceptor } from './httpMethods/requestInterceptor';
import { setupResponseInterceptor } from './httpMethods/responseInterceptor';

const httpService: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Setup interceptors
setupRequestInterceptor(httpService);
setupResponseInterceptor(httpService);

export default httpService;
```

### Key Features

- **Base URL**: Configured from `VITE_API_URL` environment variable
- **Timeout**: 10 second default timeout
- **Modular Interceptors**: Request and response interceptors in separate files
- **Type Safety**: Generic methods for typed responses

---

## HTTP Method Factories

### Request Interceptor

Location: `~/services/httpMethods/requestInterceptor.ts`

```typescript
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export function setupRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Token is handled via httpOnly cookies - no manual injection needed
      return config;
    },
    (error) => Promise.reject(error)
  );
}
```

### Response Interceptor

Location: `~/services/httpMethods/responseInterceptor.ts`

```typescript
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { createErrorResponse } from '~/utils/errorHandler';

export function setupResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const errorResponse = createErrorResponse(error);
      return Promise.reject(errorResponse);
    }
  );
}
```

### GET Factory

Location: `~/services/httpMethods/get.ts`

```typescript
import httpService from '../httpService';
import type { AxiosRequestConfig } from 'axios';

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpService.get<T>(url, config);
  return response.data;
}
```

### POST Factory

Location: `~/services/httpMethods/post.ts`

```typescript
import httpService from '../httpService';
import type { AxiosRequestConfig } from 'axios';

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpService.post<T>(url, data, config);
  return response.data;
}
```

### PUT Factory

Location: `~/services/httpMethods/put.ts`

```typescript
import httpService from '../httpService';
import type { AxiosRequestConfig } from 'axios';

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpService.put<T>(url, data, config);
  return response.data;
}
```

### PATCH Factory

Location: `~/services/httpMethods/patch.ts`

```typescript
import httpService from '../httpService';
import type { AxiosRequestConfig } from 'axios';

export async function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpService.patch<T>(url, data, config);
  return response.data;
}
```

### DELETE Factory

Location: `~/services/httpMethods/delete.ts`

```typescript
import httpService from '../httpService';
import type { AxiosRequestConfig } from 'axios';

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpService.delete<T>(url, config);
  return response.data;
}
```

### Index Export

Location: `~/services/httpMethods/index.ts`

```typescript
export { get } from './get';
export { post } from './post';
export { put } from './put';
export { patch } from './patch';
export { del } from './delete';
```

---

## Feature Services

### Service Pattern

Location: `~/services/httpServices/{feature}Service.ts`

```typescript
// ~/services/httpServices/userService.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post, put, del } from '../httpMethods';
import type { User } from '~/types/user';

// Service object with API methods using httpMethods
export const userService = {
  getUsers: () => get<User[]>('/users'),
  getUserById: (id: number) => get<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id'>) => post<User>('/users', user),
  updateUser: (id: number, user: Partial<User>) => put<User>(`/users/${id}`, user),
  deleteUser: (id: number) => del(`/users/${id}`),
};

// Async thunks for Redux
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUsers();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id'>, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### URL Format

```typescript
// ✅ CORRECT - No /api prefix (base URL includes it)
httpService.get('/users')
httpService.get('/users/123')
httpService.post('/auth/login', credentials)

// ❌ WRONG - Don't include /api prefix
httpService.get('/api/users')  // Will result in /api/api/users
```

---

## Redux Integration

### Redux Slice Pattern

Location: `~/redux/features/{feature}Slice.ts`

```typescript
// ~/redux/features/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { createUser, fetchUsers } from '~/services/httpServices/userService';
import type { UserState } from '~/types/user';

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Synchronous reducers here
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
```

### State Interface

```typescript
// ~/types/user.d.ts
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}
```

---

## Using in Components

### Fetching Data

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { fetchUsers } from '~/services/httpServices/userService';

export default function UserList() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Creating/Updating Data

```typescript
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { createUser } from '~/services/httpServices/userService';

export default function CreateUserForm() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);

  const handleSubmit = async (data: { name: string; email: string }) => {
    try {
      await dispatch(createUser(data)).unwrap();
      // Success - user added to state automatically
    } catch (error) {
      // Error handled in slice
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}
```

---

## Error Handling

### Error Handler Utility

Location: `~/utils/errorHandler.ts`

```typescript
import axios from 'axios';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse, ErrorResponse } from '~/types/httpService';

export const createErrorResponse = (error: AxiosError<ApiErrorResponse>): ErrorResponse => {
  const errorResponse: ErrorResponse = {
    message: 'An unexpected error occurred',
    status: 500,
  };

  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.message = error.response.data?.message || error.message;

    switch (error.response.status) {
      case 401:
        handleUnauthorized();
        break;
      case 403:
        errorResponse.message = 'Access denied';
        break;
      case 404:
        errorResponse.message = 'Resource not found';
        break;
      case 422:
        errorResponse.message = 'Validation failed';
        break;
      case 500:
        errorResponse.message = 'Server error';
        break;
    }
  } else if (error.request) {
    errorResponse.message = 'No response from server';
    errorResponse.status = 503;
  }

  return errorResponse;
};

export const handleUnauthorized = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

### Error Types

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

## Direct Service Usage (Without Redux)

For one-off API calls that don't need global state:

```typescript
import { userService } from '~/services/httpServices/userService';

export default function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserById(userId);
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  // Render based on state...
}
```

---

## Best Practices

### 1. Always Use Typed Responses

```typescript
// ✅ CORRECT - Type the response using httpMethods
import { get } from '~/services/httpMethods';
const users = await get<User[]>('/users');

// ❌ AVOID - Untyped response
const users = await get('/users');
```

### 2. Handle Errors in Thunks

```typescript
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUsers();
    } catch (error: any) {
      // Always use rejectWithValue for proper error handling
      return rejectWithValue(error.message);
    }
  }
);
```

### 3. Use unwrap() for Async Thunks

```typescript
// In components, use unwrap() to handle promise
try {
  const result = await dispatch(createUser(data)).unwrap();
  // Success
} catch (error) {
  // Handle rejection
}
```

### 4. Organize Services by Domain

```
services/
├── httpService.ts           # Axios orchestrator
├── httpMethods/             # HTTP method factories
│   ├── index.ts
│   ├── get.ts
│   ├── post.ts
│   ├── put.ts
│   ├── patch.ts
│   ├── delete.ts
│   ├── requestInterceptor.ts
│   └── responseInterceptor.ts
└── httpServices/            # Domain-specific services
    ├── userService.ts       # User-related API + thunks
    ├── authService.ts       # Auth-related API + thunks
    └── meetingService.ts    # Meeting-related API + thunks
```

---

## Summary

**Data Fetching Checklist:**

- ✅ Use `httpMethods` factories for all HTTP requests
- ✅ Create feature services in `services/httpServices/`
- ✅ Import from `httpMethods` (get, post, put, patch, del)
- ✅ Define async thunks with `createAsyncThunk`
- ✅ Handle loading/error states in Redux slices
- ✅ Use `useAppDispatch` and `useAppSelector` in components
- ✅ Type all API responses with generics
- ✅ Handle errors with `rejectWithValue`
- ✅ Use `.unwrap()` when dispatching thunks in components

**See Also:**

- [loading-and-error-states.md](loading-and-error-states.md) - Error handling patterns
- [common-patterns.md](common-patterns.md) - Redux slice patterns
- [complete-examples.md](complete-examples.md) - Full working examples
