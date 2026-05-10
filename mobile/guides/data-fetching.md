# Data Fetching Patterns

Data fetching using Axios HttpService with TanStack Query v5 and Redux Toolkit for React Native applications.

---

## Architecture Overview

The app uses a layered approach for data fetching:

1. **HttpService** - Axios orchestrator using method factories
2. **HTTP Methods** - Method factories (get, post, put, patch, delete) with interceptors
3. **Feature Services** - Domain-specific API methods
4. **TanStack Query** - Server state management (caching, refetching)
5. **Redux Toolkit** - Client state management (auth, UI state)

### Services Directory Structure

```
src/services/
├── httpService.ts         # Axios orchestrator
├── httpMethods/           # HTTP method factories
│   ├── get.ts, post.ts, put.ts, delete.ts, patch.ts
│   ├── requestInterceptor.ts
│   └── responseInterceptor.ts
└── httpServices/          # Domain-specific services
    ├── queries/           # TanStack Query hooks
    └── [feature]Service.ts
```

---

## HttpService (Axios Orchestrator)

### Core Implementation

Location: `src/services/httpService.ts`

```typescript
import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { storage } from './storageService';

class HttpService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor - Auto-inject JWT token
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await storage.getString('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Centralized error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const errorResponse = createErrorResponse(error);
        return Promise.reject(errorResponse);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export const httpService = new HttpService();
```

---

## TanStack Query v5 Setup

### Installation

```bash
npm install @tanstack/react-query
```

### Query Client Configuration

Location: `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Disable for mobile
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Provider Setup

Location: `app/_layout.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
    </QueryClientProvider>
  );
}
```

---

## Feature Services with TanStack Query

### Service Pattern

Location: `src/services/userService.ts`

```typescript
import { httpService } from './httpService';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

// API methods
export const userService = {
  getUsers: () => httpService.get<User[]>('/users'),
  getUserById: (id: string) => httpService.get<User>(`/users/${id}`),
  createUser: (data: CreateUserDto) => httpService.post<User>('/users', data),
  updateUser: (id: string, data: UpdateUserDto) =>
    httpService.patch<User>(`/users/${id}`, data),
  deleteUser: (id: string) => httpService.delete(`/users/${id}`),
};

// Query keys factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### Query Hooks

Location: `src/hooks/useUsers.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, userKeys } from '@/services/userService';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

// Fetch all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userService.getUsers,
  });
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id, // Only fetch when id is truthy
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific user and list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

---

## Using in Components

### Fetching Data

```typescript
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useUsers } from '@/hooks/useUsers';

export default function UserList() {
  const { data: users, isLoading, error, refetch, isRefetching } = useUsers();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-destructive text-center">
          Error: {error.message}
        </Text>
        <Button onPress={() => refetch()}>Retry</Button>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="p-4 border-b border-border">
          <Text className="text-foreground">{item.name}</Text>
        </View>
      )}
      refreshing={isRefetching}
      onRefresh={refetch}
    />
  );
}
```

### Creating Data

```typescript
import { View, Alert } from 'react-native';
import { useCreateUser } from '@/hooks/useUsers';
import { Button } from 'react-native-paper';

export default function CreateUserButton() {
  const { mutate: createUser, isPending } = useCreateUser();

  const handleCreate = () => {
    createUser(
      { name: 'New User', email: 'new@example.com' },
      {
        onSuccess: (newUser) => {
          Alert.alert('Success', `Created user: ${newUser.name}`);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  return (
    <Button
      mode="contained"
      onPress={handleCreate}
      loading={isPending}
      disabled={isPending}
    >
      Create User
    </Button>
  );
}
```

### Optimistic Updates

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(userKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(id), (old: User | undefined) =>
        old ? { ...old, ...data } : old
      );

      return { previousUser };
    },

    // Rollback on error
    onError: (err, { id }, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser);
      }
    },

    // Refetch after success or error
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
```

---

## Infinite Queries (Pagination)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  nextPage: number | null;
  totalPages: number;
}

export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      return httpService.get<PaginatedResponse<User>>(
        `/users?page=${pageParam}&limit=20`
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

// Usage in component
function UserList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteUsers();

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserCard user={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

---

## Redux for Client State

Use Redux only for client-side state (auth, UI preferences):

### Auth Slice

```typescript
// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

### Redux Persist with MMKV

```typescript
// src/redux/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { reduxStorage } from './storage';
import authReducer from './slices/authSlice';

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['auth'], // Only persist auth
};

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Error Handling

### Error Handler Utility

```typescript
// src/utils/errorHandler.ts
import type { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status: number;
}

export const createErrorResponse = (error: AxiosError): ApiError => {
  if (error.response) {
    return {
      status: error.response.status,
      message: (error.response.data as any)?.message || error.message,
    };
  }

  if (error.request) {
    return {
      status: 503,
      message: 'Unable to connect to server',
    };
  }

  return {
    status: 500,
    message: error.message || 'An unexpected error occurred',
  };
};
```

### Global Error Handler with TanStack Query

```typescript
// src/lib/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Global error handling for queries
      console.error('Query error:', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Global error handling for mutations
      Alert.alert('Error', (error as Error).message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});
```

---

## Best Practices

### 1. Use Query Key Factories

```typescript
// ✅ CORRECT - Centralized query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

// ❌ AVOID - Inline query keys
useQuery({ queryKey: ['users', id] });
```

### 2. Separate Server State from Client State

```typescript
// ✅ TanStack Query for server data
const { data: users } = useUsers();

// ✅ Redux for client state
const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
```

### 3. Handle All States

```typescript
const { data, isLoading, error, isRefetching } = useQuery(/*...*/);

if (isLoading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

### 4. Use Enabled for Conditional Fetching

```typescript
// Only fetch when userId is available
const { data } = useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => userService.getUserById(userId),
  enabled: !!userId,
});
```

---

## Summary

**Data Fetching Checklist:**

- ✅ Use `httpService` for all HTTP requests
- ✅ Use TanStack Query for server state (caching, refetching)
- ✅ Use Redux only for client state (auth, UI)
- ✅ Create query key factories for each domain
- ✅ Use custom hooks for queries and mutations
- ✅ Handle loading, error, and empty states
- ✅ Use `enabled` for conditional fetching
- ✅ Invalidate queries after mutations

**See Also:**

- [tanstack-query.md](tanstack-query.md) - Advanced TanStack Query patterns
- [loading-and-error-states.md](loading-and-error-states.md) - Error handling patterns
- [common-patterns.md](common-patterns.md) - Redux patterns
