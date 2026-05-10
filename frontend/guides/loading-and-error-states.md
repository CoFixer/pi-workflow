# Loading & Error States

Redux-based loading and error state handling for the ActivityCoaching application.

---

## Redux Loading States

### State Pattern

Redux slices use a consistent loading/error state pattern:

```typescript
interface FeatureState {
  data: Data[];
  loading: boolean;
  error: string | null;
}

const initialState: FeatureState = {
  data: [],
  loading: false,
  error: null,
};
```

### Async Thunk States

When using `createAsyncThunk`, three action states are automatically generated:

```typescript
import { createSlice } from '@reduxjs/toolkit';
import { fetchData } from '~/services/httpServices/dataService';

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // PENDING - Request started
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // FULFILLED - Request succeeded
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      // REJECTED - Request failed
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

---

## Using Loading States in Components

### Basic Loading Pattern

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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={() => dispatch(fetchUsers())} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Success state
  return (
    <ul className="space-y-2">
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Loading with Skeleton

```typescript
import { Skeleton } from '~/components/ui/skeleton';

export default function UserCard() {
  const { user, loading } = useAppSelector((state) => state.user);

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold">{user?.name}</h3>
      <p className="text-muted-foreground">{user?.email}</p>
    </Card>
  );
}
```

### Inline Loading States

For form submissions and button actions:

```typescript
import { Button } from '~/components/ui/button';

export default function SubmitButton() {
  const { loading } = useAppSelector((state) => state.form);

  return (
    <Button type="submit" disabled={loading}>
      {loading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Submitting...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}
```

---

## Error Handling

### Centralized Error Handler

Location: `~/utils/errorHandler.ts`

```typescript
import type { AxiosError } from 'axios';

export const createErrorResponse = (error: AxiosError) => {
  const errorResponse = {
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
  }

  return errorResponse;
};

export const handleUnauthorized = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

### Error Display Component

```typescript
interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
}

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p className="text-destructive">{error}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
```

### Clearing Errors

```typescript
// In slice
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  // ...
});

export const { clearError } = dataSlice.actions;

// In component
import { clearError } from '~/redux/features/dataSlice';

const dispatch = useAppDispatch();
dispatch(clearError());
```

---

## Form Submission States

### React Hook Form with Loading

```typescript
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { createUser } from '~/services/httpServices/userService';

export default function CreateUserForm() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);

  const form = useForm({
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      form.reset();
      // Success handling
    } catch (err) {
      // Error is already in Redux state
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}
```

### Server Actions with useActionState

```typescript
import { useActionState } from 'react';
import { loginAction } from '~/utils/actions/auth';

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {/* Form fields */}

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state?.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

---

## Best Practices

### 1. Always Initialize Loading State

```typescript
// ✅ CORRECT
const initialState = {
  data: [],
  loading: false,  // Not undefined
  error: null,     // Not undefined
};
```

### 2. Clear Error on New Request

```typescript
.addCase(fetchData.pending, (state) => {
  state.loading = true;
  state.error = null;  // Clear previous error
})
```

### 3. Use Consistent Loading UI

```typescript
// Use the same loading component across the app
<div className="flex items-center justify-center p-8">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
</div>
```

### 4. Handle All States

```typescript
// ✅ Handle loading, error, empty, and success states
if (loading) return <Loading />;
if (error) return <Error error={error} />;
if (data.length === 0) return <Empty />;
return <Content data={data} />;
```

---

## Summary

**Loading/Error Checklist:**

- ✅ Use `loading: boolean` and `error: string | null` in Redux state
- ✅ Handle `pending`, `fulfilled`, `rejected` in extraReducers
- ✅ Clear errors when starting new requests
- ✅ Show loading indicators during async operations
- ✅ Display user-friendly error messages
- ✅ Provide retry options for failed requests
- ✅ Use `disabled={loading}` on submit buttons

**See Also:**

- [data-fetching.md](data-fetching.md) - Async thunk patterns
- [common-patterns.md](common-patterns.md) - Form patterns
- [complete-examples.md](complete-examples.md) - Full examples
