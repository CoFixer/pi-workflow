# Complete Examples

Full working examples combining all patterns: React Router 7, Redux Toolkit, Tailwind CSS, Shadcn/UI, Axios HttpService, and React Hook Form with Zod.

---

## Example 1: Complete Page with Redux

Combines: Redux state, data fetching, loading/error handling, Tailwind styling, Shadcn/UI components

```typescript
/**
 * User List Page
 * Demonstrates Redux + Axios + Shadcn/UI patterns
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { fetchUsers } from '~/services/httpServices/userService';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Skeleton } from '~/components/ui/skeleton';
import type { User } from '~/types/user';

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={() => dispatch(fetchUsers())}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

// Extracted component for reusability
function UserCard({ user }: { user: User }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{user.email}</p>
      </CardContent>
    </Card>
  );
}
```

---

## Example 2: Form with React Hook Form + Zod

Complete form with validation, Redux submission, and error handling.

```typescript
/**
 * Create User Form
 * Demonstrates React Hook Form + Zod + Redux patterns
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { createUser } from '~/services/httpServices/userService';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

// Zod schema for validation
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Infer type from schema
type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await dispatch(createUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })).unwrap();

      reset();
      onSuccess?.();
    } catch (err) {
      // Error handled by Redux
      console.error('Failed to create user:', err);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Enter password"
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm password"
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Redux Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## Example 3: Redux Slice with Async Thunks

Complete Redux slice with CRUD operations.

```typescript
/**
 * User Redux Slice
 * Demonstrates createSlice + createAsyncThunk patterns
 */
// ~/redux/features/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser
} from '~/services/httpServices/userService';
import type { UserState } from '~/types/user';

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
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

      // Create User
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
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
```

---

## Example 4: Feature Service with HttpService

Complete service file with API methods and async thunks.

```typescript
/**
 * User Service
 * Demonstrates HttpService + createAsyncThunk patterns
 */
// ~/services/httpServices/userService.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { httpService } from '../httpService';
import type { User } from '~/types/user';

// Type definitions
interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserPayload {
  id: number;
  data: Partial<User>;
}

// Service object with API methods
export const userService = {
  getUsers: () => httpService.get<User[]>('/users'),
  getUserById: (id: number) => httpService.get<User>(`/users/${id}`),
  createUser: (user: CreateUserPayload) => httpService.post<User>('/users', user),
  updateUser: (id: number, data: Partial<User>) => httpService.put<User>(`/users/${id}`, data),
  deleteUser: (id: number) => httpService.delete(`/users/${id}`),
};

// Async Thunks

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

export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await userService.getUserById(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: CreateUserPayload, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }: UpdateUserPayload, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id; // Return ID for slice to remove from state
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

---

## Example 5: Route Configuration

React Router 7 route configuration with layouts.

```typescript
/**
 * Route Configuration
 * Demonstrates React Router 7 patterns
 */
// ~/routes.ts
import { type RouteConfig, route, layout, index } from '@react-router/dev/routes';

export default [
  // Public routes with public layout
  layout('pages/layout.tsx', [
    index('pages/public/landing.tsx'),
    route('login', 'pages/auth/login.tsx'),
    route('register', 'pages/auth/register.tsx'),
    route('forgot-password', 'pages/auth/forgot-password.tsx'),
  ]),

  // Auth routes with auth layout (protected)
  layout('pages/auth-layout.tsx', [
    route('dashboard', 'pages/dashboard/index.tsx'),
    route('users', 'pages/users/index.tsx'),
    route('users/:id', 'pages/users/detail.tsx'),
    route('settings', 'pages/settings/index.tsx'),
    route('profile', 'pages/profile/index.tsx'),
  ]),
] satisfies RouteConfig;
```

### Layout Component Example

```typescript
/**
 * Auth Layout
 * Protected layout with navigation
 */
// ~/pages/auth-layout.tsx
import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAppSelector } from '~/redux/store/hooks';
import { Sidebar } from '~/components/layout/sidebar';
import { Header } from '~/components/layout/header';

export default function AuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## Example 6: Shadcn/UI Component Composition

Building complex components with Shadcn/UI primitives.

```typescript
/**
 * User Table Component
 * Demonstrates Shadcn/UI composition patterns
 */
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { User } from '~/types/user';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  loading?: boolean;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  loading
}: UserTableProps) {
  const [search, setSearch] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteUser) {
      onDelete(deleteUser.id);
      setDeleteUser(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={cn(loading && 'opacity-50')}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteUser(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Example 7: Custom Hook with Redux

Reusable hook combining multiple Redux operations.

```typescript
/**
 * useUsers Hook
 * Demonstrates custom hook patterns with Redux
 */
// ~/hooks/useUsers.ts
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser
} from '~/services/httpServices/userService';
import { clearError, setCurrentUser } from '~/redux/features/userSlice';
import type { User } from '~/types/user';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export function useUsers() {
  const dispatch = useAppDispatch();
  const { users, currentUser, loading, error } = useAppSelector((state) => state.user);

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Create user
  const handleCreate = useCallback(async (data: CreateUserData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  // Update user
  const handleUpdate = useCallback(async (id: number, data: Partial<User>) => {
    try {
      await dispatch(updateUser({ id, data })).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  // Delete user
  const handleDelete = useCallback(async (id: number) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      return true;
    } catch {
      return false;
    }
  }, [dispatch]);

  // Select user
  const selectUser = useCallback((user: User | null) => {
    dispatch(setCurrentUser(user));
  }, [dispatch]);

  // Clear error
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Refresh users
  const refresh = useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return {
    // State
    users,
    currentUser,
    loading,
    error,

    // Actions
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    select: selectUser,
    refresh,
    dismissError,
  };
}
```

**Usage:**

```typescript
export default function UsersPage() {
  const {
    users,
    loading,
    error,
    create,
    update,
    delete: deleteUser,
    dismissError
  } = useUsers();

  // Use in component...
}
```

---

## Example 8: Login Page with useActionState

Server action pattern for form submission.

```typescript
/**
 * Login Page
 * Demonstrates useActionState pattern
 */
// ~/pages/auth/login.tsx
import { useActionState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { loginAction } from '~/utils/actions/auth';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      navigate('/dashboard');
    }
  }, [state?.success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Server Action

```typescript
/**
 * Auth Actions
 * Server actions for authentication
 */
// ~/utils/actions/auth.ts
import { httpService } from '~/services/httpService';

interface LoginResult {
  success?: boolean;
  error?: string;
}

export async function loginAction(
  prevState: LoginResult | null,
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const response = await httpService.post<{ token: string }>('/auth/login', {
      email,
      password,
    });

    // Store token
    localStorage.setItem('token', response.token);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Invalid credentials' };
  }
}
```

---

## Summary

**Key Patterns Demonstrated:**

1. **Page Component**: Redux state + loading/error handling + Tailwind styling
2. **Form Component**: React Hook Form + Zod validation + Redux submission
3. **Redux Slice**: createSlice + extraReducers for async operations
4. **Feature Service**: HttpService + createAsyncThunk for API calls
5. **Route Configuration**: React Router 7 layouts and routes
6. **Component Composition**: Shadcn/UI primitives + custom components
7. **Custom Hooks**: Encapsulated Redux logic for reusability
8. **Server Actions**: useActionState for form submissions

**See Also:**

- [component-patterns.md](component-patterns.md) - Shadcn/UI patterns
- [data-fetching.md](data-fetching.md) - Axios + Redux patterns
- [common-patterns.md](common-patterns.md) - Forms and auth patterns
- [routing-guide.md](routing-guide.md) - React Router 7 patterns
