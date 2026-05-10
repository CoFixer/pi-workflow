# TanStack Query (React Query) Guide

> Server state management with automatic caching, background updates, and optimistic UI

## Overview

TanStack Query manages **server state** (API data) separately from **client state** (Redux). It provides automatic caching, background refetching, request deduplication, and optimistic updates.

## Architecture

### Three-Layer Data Fetching

```
Component
    ↓
TanStack Query Hook (useExercises, useMeetings, etc.)
    ↓
Domain Service (exerciseService, meetingService, etc.)
    ↓
httpService (Axios instance)
    ↓
API Server
```

**Layer Responsibilities:**
- **TanStack Query Hooks**: Server state management, caching, invalidation
- **Domain Services**: API endpoint definitions, request/response handling
- **httpService**: HTTP client, interceptors, error handling

## Configuration

### QueryClient Setup

**File:** `app/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // Cache cleanup after 5 minutes
      retry: 2,                    // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
})
```

**Configuration Options:**
- `staleTime`: How long data is considered fresh (1 minute)
- `gcTime`: When to garbage collect inactive queries (5 minutes)
- `retry`: Number of automatic retries on failure (2 times)
- `refetchOnWindowFocus`: Disabled to prevent unnecessary requests

### Provider Setup

**File:** `app/hooks/providers/providers.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '~/lib/queryClient';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>{children}</Provider>
      </I18nextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Query Key Factory Pattern

Query keys use a **hierarchical factory pattern** for consistency and easy invalidation.

### Pattern Structure

```typescript
export const resourceKeys = {
  all: ['resource'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (filters: string) => [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: number) => [...resourceKeys.details(), id] as const,
}
```

### Example: Exercise Query Keys

**File:** `app/services/httpServices/queries/useExercises.ts`

```typescript
export const exerciseKeys = {
  all: ['exercises'] as const,
  todaySummary: () => [...exerciseKeys.all, 'today-summary'] as const,
  history: () => [...exerciseKeys.all, 'history'] as const,
  detail: (date: string) => [...exerciseKeys.all, 'detail', date] as const,
};
```

**Benefits:**
- **Consistency**: All exercise queries start with `['exercises']`
- **Granular invalidation**: Can invalidate all exercises or just specific ones
- **Type safety**: `as const` ensures exact key matching

## Creating Query Hooks

### Basic Query Hook

```typescript
export function useTodayExerciseSummary() {
  return useQuery({
    queryKey: exerciseKeys.todaySummary(),
    queryFn: async () => {
      const response = await exerciseService.getTodaySummary();
      return response.data || null;
    },
  });
}
```

### Query Hook with Parameters

```typescript
export function useExerciseDetail(date: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(date),
    queryFn: async () => {
      const response = await exerciseService.getByDate(date);
      return response.data;
    },
    enabled: Boolean(date),  // Only fetch when date is provided
  });
}
```

### Query Hook with Date Range

```typescript
export function useExerciseHistory(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...exerciseKeys.history(), startDate, endDate],
    queryFn: async () => {
      const response = await exerciseService.getHistory(startDate, endDate);
      return response.data || [];
    },
  });
}
```

## Creating Mutation Hooks

Mutations modify server data. Always invalidate relevant queries after successful mutations.

### Create Mutation

```typescript
export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MeetingCreateRequest) => {
      const response = await meetingService.create(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all meeting queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
  });
}
```

### Update Mutation

```typescript
export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MeetingUpdateRequest }) => {
      const response = await meetingService.update(id.toString(), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all meeting lists
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
      // Invalidate specific meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(variables.id) });
    },
  });
}
```

### Delete Mutation

```typescript
export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await meetingService.cancel(id.toString());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
  });
}
```

## Using Queries in Components

### Basic Usage

```typescript
import { View, Text } from 'react-native';
import { useTodayExerciseSummary } from '@/services/httpServices';

export function ExerciseSummary() {
  const { data, isLoading, error } = useTodayExerciseSummary();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text className="text-xl font-bold">Today's Exercise</Text>
      <Text>Completed: {data.completedCount} / {data.totalCount}</Text>
    </View>
  );
}
```

### Multiple Queries

```typescript
import {
  useTodaySurveyStatus,
  useTodayExerciseSummary,
  useNextMeetingForPatient
} from "~/services/httpServices"

export function PatientDashboard() {
  const { data: survey, isLoading: surveyLoading } = useTodaySurveyStatus();
  const { data: exercise, isLoading: exerciseLoading } = useTodayExerciseSummary();
  const { data: meeting, isLoading: meetingLoading } = useNextMeetingForPatient();

  const isLoading = surveyLoading || exerciseLoading || meetingLoading;

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SurveyCard status={survey} />
      <ExerciseCard summary={exercise} />
      <MeetingCard meeting={meeting} />
    </>
  );
}
```

### Conditional Queries

```typescript
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export function ExerciseDetailPage() {
  const { date } = useLocalSearchParams<{ date: string }>();

  // Only fetch when date is available
  const { data, isLoading } = useExerciseDetail(date || '');

  if (!date) return <Text>Please select a date</Text>;
  if (isLoading) return <LoadingSkeleton />;

  return <ExerciseDetail data={data} />;
}
```

## Using Mutations in Components

### Create Example

```typescript
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useCreateMeeting } from '@/services/httpServices';

export function CreateMeetingForm() {
  const createMeeting = useCreateMeeting();

  const handleSubmit = async (formData: MeetingCreateRequest) => {
    try {
      await createMeeting.mutateAsync(formData);
      Alert.alert('Success', 'Meeting created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create meeting');
    }
  };

  return (
    <View className="gap-4">
      {/* form fields */}
      <Button
        mode="contained"
        onPress={() => handleSubmit(formData)}
        loading={createMeeting.isPending}
        disabled={createMeeting.isPending}
      >
        {createMeeting.isPending ? 'Creating...' : 'Create Meeting'}
      </Button>
    </View>
  );
}
```

### Update Example

```typescript
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useUpdateMeeting } from '@/services/httpServices';

export function EditMeetingForm({ meetingId }: { meetingId: number }) {
  const updateMeeting = useUpdateMeeting();

  const handleUpdate = async (data: MeetingUpdateRequest) => {
    try {
      await updateMeeting.mutateAsync({ id: meetingId, data });
      Alert.alert('Success', 'Meeting updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update meeting');
    }
  };

  return (
    <View className="gap-4">
      {/* form fields */}
      <Button
        mode="contained"
        onPress={() => handleUpdate(formData)}
        loading={updateMeeting.isPending}
        disabled={updateMeeting.isPending}
      >
        Update
      </Button>
    </View>
  );
}
```

## File Organization

### Services Directory Structure

```
src/services/
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
    ├── queries/                # TanStack Query hooks (PUBLIC PAGES ONLY)
    │   ├── index.ts            # Barrel export
    │   ├── useExercises.ts     # Exercise queries
    │   ├── useMeetings.ts      # Meeting queries & mutations
    │   └── useSurveys.ts       # Survey queries
    ├── exerciseService.ts      # Axios service
    ├── meetingService.ts       # Axios service
    └── surveyService.ts        # Axios service
```

### Creating New Query Hook File

**Template:** `src/services/httpServices/queries/useWidgets.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { widgetService } from '../widgetService';
import type { Widget, WidgetCreateRequest } from '@/types';

// 1. Define query keys
export const widgetKeys = {
  all: ['widgets'] as const,
  lists: () => [...widgetKeys.all, 'list'] as const,
  details: () => [...widgetKeys.all, 'detail'] as const,
  detail: (id: number) => [...widgetKeys.details(), id] as const,
};

// 2. Query hooks
export function useWidgets() {
  return useQuery({
    queryKey: widgetKeys.lists(),
    queryFn: async () => {
      const response = await widgetService.getAll();
      return response.data;
    },
  });
}

export function useWidget(id: number) {
  return useQuery({
    queryKey: widgetKeys.detail(id),
    queryFn: async () => {
      const response = await widgetService.getById(id);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

// 3. Mutation hooks
export function useCreateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WidgetCreateRequest) => {
      const response = await widgetService.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: widgetKeys.all });
    },
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Widget> }) => {
      const response = await widgetService.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: widgetKeys.all });
      queryClient.invalidateQueries({ queryKey: widgetKeys.detail(variables.id) });
    },
  });
}
```

**Don't forget to export from** `src/services/httpServices/queries/index.ts`:

```typescript
export * from './useWidgets';
```

## Best Practices

### 1. Always Use Query Key Factory

❌ **Bad:**
```typescript
useQuery({
  queryKey: ['exercises', 'today'],  // Inconsistent, hard to invalidate
  queryFn: fetchExercises,
})
```

✅ **Good:**
```typescript
useQuery({
  queryKey: exerciseKeys.todaySummary(),  // Consistent, easy to invalidate
  queryFn: fetchExercises,
})
```

### 2. Invalidate Queries After Mutations

❌ **Bad:**
```typescript
useMutation({
  mutationFn: createMeeting,
  // No invalidation - UI shows stale data!
})
```

✅ **Good:**
```typescript
useMutation({
  mutationFn: createMeeting,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: meetingKeys.all });
  },
})
```

### 3. Use Conditional Queries

❌ **Bad:**
```typescript
// Fetches even when id is undefined!
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
})
```

✅ **Good:**
```typescript
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  enabled: Boolean(id),  // Only fetch when id exists
})
```

### 4. Handle Loading and Error States

❌ **Bad:**
```typescript
const { data } = useQuery({ /* ... */ });
return <Text>{data.name}</Text>;  // Crashes when loading or error!
```

✅ **Good:**
```typescript
const { data, isLoading, error } = useQuery({ /* ... */ });

if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage error={error} />;

return <Text>{data.name}</Text>;
```

### 5. Wrap Services, Don't Duplicate Logic

❌ **Bad:**
```typescript
// Duplicating axios logic in query hook
export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.all,
    queryFn: async () => {
      const response = await axios.get('/api/exercises');  // Don't do this!
      return response.data;
    },
  });
}
```

✅ **Good:**
```typescript
// Wrapping existing service
export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.all,
    queryFn: async () => {
      const response = await exerciseService.getAll();  // Use service layer
      return response.data;
    },
  });
}
```

## When to Use TanStack Query vs Redux

### Use TanStack Query For:
- ✅ API data fetching (server state)
- ✅ Data that needs caching
- ✅ Data that needs background refetching
- ✅ Paginated or infinite scroll data
- ✅ Data shared across multiple components

### Use Redux For:
- ✅ Global UI state (modals, sidebars, theme)
- ✅ User preferences and settings
- ✅ Authentication state (current user, tokens)
- ✅ Form state across multiple steps
- ✅ Client-side computed state

### Example Architecture:

```typescript
// TanStack Query: Fetch meetings from API
const { data: meetings } = useMeetings();

// Redux: Track which meeting is selected
const selectedMeetingId = useAppSelector(state => state.ui.selectedMeetingId);
const dispatch = useAppDispatch();

// Find selected meeting from TanStack Query data
const selectedMeeting = meetings?.find(m => m.id === selectedMeetingId);

// Update Redux when user selects a meeting
const handleSelect = (id: number) => {
  dispatch(setSelectedMeetingId(id));
};
```

## Debugging

### React Query Devtools

Devtools are automatically enabled in development:

```typescript
<ReactQueryDevtools initialIsOpen={false} />
```

**Features:**
- View all active queries and their states
- See query keys and cached data
- Manually trigger refetch or invalidation
- Monitor network requests
- Debug stale/fresh data status

**Access:** Click the React Query icon in bottom-right corner during development

### Common Issues

**Issue 1: Data not updating after mutation**
- ✅ Solution: Invalidate queries in `onSuccess`

**Issue 2: Queries refetching too often**
- ✅ Solution: Increase `staleTime` in QueryClient config

**Issue 3: Queries not running**
- ✅ Solution: Check `enabled` option, ensure it's not set to `false`

**Issue 4: TypeScript errors with query data**
- ✅ Solution: Specify generic types: `useQuery<MyDataType>(...)`

## Migration Guide

### Converting Axios Call to TanStack Query

**Before (Direct Axios):**
```typescript
import { View, Text, ActivityIndicator } from 'react-native';

export function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await exerciseService.getAll();
        setExercises(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <ActivityIndicator />;
  return <View>{/* render exercises */}</View>;
}
```

**After (TanStack Query):**

1. Create query hook in `app/services/httpServices/queries/useExercises.ts`:

```typescript
export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.lists(),
    queryFn: async () => {
      const response = await exerciseService.getAll();
      return response.data;
    },
  });
}
```

2. Use in component:

```typescript
import { View } from 'react-native';
import { useExercises } from '@/services/httpServices';

export function ExerciseList() {
  const { data: exercises = [], isLoading } = useExercises();

  if (isLoading) return <LoadingSkeleton />;
  return <View>{/* render exercises */}</View>;
}
```

**Benefits:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Request deduplication
- ✅ Less boilerplate code
- ✅ Better TypeScript support

## Summary

TanStack Query provides:
- **Automatic Caching**: Data cached for 1 minute (configurable)
- **Background Updates**: Stale data refetched in background
- **Request Deduplication**: Multiple components calling same query only triggers one request
- **Optimistic Updates**: Update UI before server response
- **DevTools**: Built-in debugging tools
- **Type Safety**: Full TypeScript support

**Next Steps:**
- Review existing query hooks in `app/services/httpServices/queries/`
- Use query key factories for all new queries
- Always invalidate after mutations
- Check React Query Devtools during development