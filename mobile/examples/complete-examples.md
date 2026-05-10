# Complete Examples

Full working examples combining all patterns: Expo Router, Redux Toolkit, NativeWind, React Native Paper, Axios HttpService, and React Hook Form with Zod.

---

## Example 1: Complete Screen with Redux

Combines: Redux state, data fetching, loading/error handling, NativeWind styling, React Native Paper components

```typescript
/**
 * User List Screen
 * Demonstrates Redux + Axios + React Native Paper patterns
 */
import { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { fetchUsers } from '~/services/httpServices/userService';
import type { User } from '~/types/user';

export default function UsersScreen() {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4">
          <Text variant="headlineMedium" className="mb-4">Users</Text>
          <View className="gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <View className="h-6 w-32 bg-muted rounded animate-pulse" />
                <View className="h-4 w-48 bg-muted rounded mt-2 animate-pulse" />
              </Card>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="p-4">
          <View className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <Text className="text-destructive">{error}</Text>
            <Button
              mode="outlined"
              onPress={() => dispatch(fetchUsers())}
              className="mt-4"
            >
              Retry
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-4">
        <Text variant="headlineMedium" className="mb-4">Users</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-4 gap-4 pb-4"
        renderItem={({ item }) => <UserCard user={item} />}
        ListEmptyComponent={
          <View className="items-center justify-center p-8">
            <Text className="text-muted-foreground">No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// Extracted component for reusability
function UserCard({ user }: { user: User }) {
  return (
    <Card className="overflow-hidden">
      <Card.Title title={user.name} subtitle={user.email} />
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
 * Demonstrates React Hook Form + Zod + Redux patterns for React Native
 */
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { createUser } from '~/services/httpServices/userService';

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

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);

  const {
    control,
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
      console.error('Failed to create user:', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="p-4 gap-4">
          <Text variant="headlineMedium" className="mb-4">Create User</Text>

          {/* Error Banner */}
          {error && (
            <View className="bg-destructive/10 p-4 rounded-lg mb-4">
              <Text className="text-destructive">{error}</Text>
            </View>
          )}

          {/* Name Field */}
          <View>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Name"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.name}
                  autoCapitalize="words"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name?.message}
            </HelperText>
          </View>

          {/* Email Field */}
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email?.message}
            </HelperText>
          </View>

          {/* Password Field */}
          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.password}
                  secureTextEntry
                />
              )}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password?.message}
            </HelperText>
          </View>

          {/* Confirm Password Field */}
          <View>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.confirmPassword}
                  secureTextEntry
                />
              )}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword?.message}
            </HelperText>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
            className="mt-4"
          >
            Create User
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

## Example 3: Login Screen with Navigation

Complete login flow with form validation, API call, and navigation.

```typescript
/**
 * Login Screen
 * Demonstrates authentication flow with Expo Router
 */
import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '~/redux/store/hooks';
import { login } from '~/redux/slices/authSlice';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      await dispatch(login(data)).unwrap();
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6">
          <Text variant="headlineLarge" className="text-center mb-8">
            Welcome Back
          </Text>

          {error && (
            <View className="bg-destructive/10 p-4 rounded-lg mb-4">
              <Text className="text-destructive text-center">{error}</Text>
            </View>
          )}

          <View className="gap-4">
            {/* Email */}
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="login-email-input"
                    label="Email"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email?.message}
              </HelperText>
            </View>

            {/* Password */}
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    testID="login-password-input"
                    label="Password"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    secureTextEntry
                    autoComplete="password"
                  />
                )}
              />
              <HelperText type="error" visible={!!errors.password}>
                {errors.password?.message}
              </HelperText>
            </View>

            {/* Submit */}
            <Button
              testID="login-submit-button"
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>

            {/* Links */}
            <View className="flex-row justify-center gap-4 mt-4">
              <Link href="/forgot-password" asChild>
                <Button mode="text" compact>
                  Forgot Password?
                </Button>
              </Link>
              <Link href="/register" asChild>
                <Button mode="text" compact>
                  Create Account
                </Button>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

## Example 4: Detail Screen with Data Fetching

Screen that fetches and displays item details.

```typescript
/**
 * Item Detail Screen
 * Demonstrates data fetching with TanStack Query and navigation params
 */
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { httpService } from '~/services/httpService';

interface Item {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading, error, refetch } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const response = await httpService.get<Item>(`/items/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-destructive mb-4">Failed to load item</Text>
        <Button mode="outlined" onPress={() => refetch()}>
          Retry
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: item.title,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => router.back()}
            />
          ),
        }}
      />

      <ScrollView contentContainerClassName="p-4 gap-4">
        <Card>
          <Card.Title
            title={item.title}
            subtitle={`Created: ${new Date(item.createdAt).toLocaleDateString()}`}
          />
          <Card.Content>
            <Text className="text-foreground">{item.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="text" onPress={() => router.push(`/items/${id}/edit`)}>
              Edit
            </Button>
            <Button mode="contained">Share</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Example 5: List with Pull-to-Refresh

FlatList with pull-to-refresh, infinite scroll, and search.

```typescript
/**
 * Items List Screen
 * Demonstrates FlatList with refresh, pagination, and search
 */
import { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Searchbar, Card, ActivityIndicator } from 'react-native-paper';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { httpService } from '~/services/httpService';
import { useDebounce } from '~/hooks/useDebounce';

interface Item {
  id: string;
  title: string;
  subtitle: string;
}

interface ItemsResponse {
  items: Item[];
  nextPage: number | null;
}

export default function ItemsListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['items', debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpService.get<ItemsResponse>('/items', {
        params: { page: pageParam, search: debouncedSearch },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <Card
        className="mx-4 mb-3"
        onPress={() => router.push(`/items/${item.id}`)}
      >
        <Card.Title title={item.title} subtitle={item.subtitle} />
      </Card>
    ),
    [router]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-muted-foreground">
          {searchQuery ? 'No items match your search' : 'No items found'}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="p-4">
        <Searchbar
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
```

---

## Example 6: Tab Layout with Bottom Navigation

Tab-based navigation using Expo Router.

```typescript
/**
 * Tab Layout
 * Demonstrates Expo Router tabs with custom styling
 * File: app/(tabs)/_layout.tsx
 */
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## Summary

These examples demonstrate:

1. **State Management**: Redux Toolkit with typed hooks
2. **Forms**: React Hook Form + Zod for validation
3. **Styling**: NativeWind (Tailwind CSS) classes
4. **UI Components**: React Native Paper
5. **Navigation**: Expo Router with typed params
6. **Data Fetching**: TanStack Query with infinite scroll
7. **Loading/Error States**: Proper handling patterns
8. **Platform Handling**: KeyboardAvoidingView, SafeAreaView
9. **Testing**: testID props for E2E tests

**See Also:**
- [component-patterns.md](../guides/component-patterns.md) - Component architecture
- [styling-guide.md](../guides/styling-guide.md) - NativeWind patterns
- [navigation-guide.md](../guides/navigation-guide.md) - Expo Router setup
- [data-fetching.md](../guides/data-fetching.md) - TanStack Query patterns
