# Loading & Error States

Redux-based loading and error state handling for React Native applications.

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
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { fetchUsers } from '@/services/httpServices/userService';

export default function UserList() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="p-4 items-center">
        <Text className="text-destructive">Error: {error}</Text>
        <Pressable
          onPress={() => dispatch(fetchUsers())}
          className="mt-4 bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  // Success state
  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View className="p-4 border-b border-border">
          <Text>{item.name}</Text>
        </View>
      )}
      contentContainerClassName="gap-2"
    />
  );
}
```

### Loading with Skeleton

```typescript
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { Skeleton } from '@/components/ui/Skeleton';

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
      <Text className="font-semibold text-foreground">{user?.name}</Text>
      <Text className="text-muted-foreground">{user?.email}</Text>
    </Card>
  );
}
```

### Inline Loading States

For form submissions and button actions:

```typescript
import { Button } from 'react-native-paper';

export default function SubmitButton() {
  const { loading } = useAppSelector((state) => state.form);

  return (
    <Button
      mode="contained"
      onPress={handleSubmit}
      loading={loading}
      disabled={loading}
    >
      {loading ? 'Submitting...' : 'Submit'}
    </Button>
  );
}
```

---

## Error Handling

### Centralized Error Handler

Location: `src/utils/errorHandler.ts`

```typescript
import type { AxiosError } from 'axios';
import { storage } from '@/services/storageService';
import { router } from 'expo-router';

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
  storage.delete('token');
  router.replace('/login');
};
```

### Error Display Component

```typescript
import { View, Text, Pressable } from 'react-native';

interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
}

export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <View className="rounded-lg border border-destructive bg-destructive/10 p-4">
      <Text className="text-destructive">{error}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-2 border border-input rounded-lg px-3 py-2"
        >
          <Text>Try Again</Text>
        </Pressable>
      )}
    </View>
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
import { View, Text, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { createUser } from '@/services/httpServices/userService';

export default function CreateUserForm() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(createUser(data)).unwrap();
      reset();
      // Success handling
    } catch (err) {
      // Error is already in Redux state
    }
  };

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="h-12 px-4 rounded-lg border border-input"
            placeholder="Name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {error && (
        <Text className="text-sm text-destructive">{error}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </View>
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
import { View, ActivityIndicator } from 'react-native';

// Use the same loading component across the app
<View className="flex-1 items-center justify-center p-8">
  <ActivityIndicator size="large" color="#007AFF" />
</View>
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
