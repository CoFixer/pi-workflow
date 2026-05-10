# React Native Best Practices

## Component Best Practices

### Component File Organization

```typescript
// GOOD: Component with typed props, hooks at top
interface ButtonProps {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  onPress,
  disabled,
  loading,
}: ButtonProps) {
  const handlePress = () => {
    if (onPress && !disabled && !loading) onPress();
  };

  return (
    <Pressable
      className={cn(
        'px-4 py-3 rounded-lg items-center justify-center',
        variant === 'primary' && 'bg-blue-500',
        variant === 'outline' && 'border border-gray-300',
        (disabled || loading) && 'opacity-50'
      )}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white font-semibold">{children}</Text>
      )}
    </Pressable>
  );
}

// BAD: Untyped props, inline styles
export function Button(props) {
  return (
    <TouchableOpacity style={{ padding: 10 }} onPress={props.onPress}>
      <Text>{props.children}</Text>
    </TouchableOpacity>
  );
}
```

### Component Organization Pattern

```
src/components/
├── ui/                    # Reusable UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── navigation/            # Navigation components
│   ├── AppStack.tsx
│   └── TabBar.tsx
├── layout/                # Layout components
│   ├── SafeScreen.tsx
│   └── KeyboardAvoid.tsx
└── features/              # Feature-specific components
    ├── auth/
    │   ├── LoginForm.tsx
    │   └── OTPInput.tsx
    └── profile/
        ├── Avatar.tsx
        └── ProfileCard.tsx
```

---

## State Management Patterns

### When to Use Each State Type

| State Type | Use Case | Example |
|------------|----------|---------|
| **Local State** (`useState`) | UI-only state, form inputs | Modal open/close, input values |
| **Redux** | Global client state | Auth state, UI preferences |
| **TanStack Query** | Server state, API data | User profile, notifications |
| **URL/Route State** | Navigation params | Screen params, deep links |

### Redux Toolkit Slice Pattern

```typescript
// GOOD: Typed slice with initial state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types/auth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { login, logout, setInitialized } = authSlice.actions;
```

### TanStack Query Key Factory Pattern

```typescript
// GOOD: Centralized query key factory
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Usage in hooks
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
  });
}
```

### TanStack Query with Mutations

```typescript
// GOOD: Mutation with cache invalidation
export function useLogin() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (response) => {
      dispatch(login(response.data.user));
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
```

---

## Form Handling (React Hook Form + Zod)

### Zod Schema Definition

```typescript
// GOOD: Schema with custom error messages
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema with cross-field validation
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

### Form Component Pattern

```typescript
// GOOD: Form with React Hook Form + Zod
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/utils/validations/auth';

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Username"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
        Login
      </Button>
    </View>
  );
}
```

---

## NativeWind Styling Patterns

### Basic Styling

```typescript
// GOOD: NativeWind className
<View className="flex-1 bg-white dark:bg-gray-900 p-4">
  <Text className="text-lg font-bold text-gray-800 dark:text-white">
    Hello World
  </Text>
</View>

// BAD: Inline StyleSheet
<View style={styles.container}>
  <Text style={styles.title}>Hello World</Text>
</View>
```

### Conditional Classes

```typescript
// GOOD: Conditional styling with cn()
import { cn } from '@/lib/utils';

<View
  className={cn(
    'flex-row items-center gap-2 p-4 rounded-lg',
    isActive && 'bg-blue-100',
    disabled && 'opacity-50'
  )}
/>

// With variants
<Text
  className={cn(
    'font-medium',
    variant === 'title' && 'text-2xl font-bold',
    variant === 'subtitle' && 'text-lg text-gray-600',
    variant === 'body' && 'text-base'
  )}
>
  {children}
</Text>
```

### Responsive Design (Not applicable in RN)

```typescript
// React Native handles responsiveness differently
// Use Dimensions API or react-native-responsive-screen

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

// Or use useWindowDimensions hook
import { useWindowDimensions } from 'react-native';

function ResponsiveComponent() {
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 3 : 2;

  return (
    <FlatList
      numColumns={columns}
      key={columns} // Force re-render on column change
      data={items}
      renderItem={({ item }) => <Card {...item} />}
    />
  );
}
```

---

## Safe Area Handling

```typescript
// GOOD: Proper safe area handling
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

// With keyboard avoidance
import { KeyboardAvoidingView, Platform } from 'react-native';

export function FormScreen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

## Animation Patterns (Reanimated)

```typescript
// GOOD: Reanimated animation
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

function AnimatedCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={animatedStyle} className="bg-white p-4 rounded-lg shadow">
        <Text>Animated Card</Text>
      </Animated.View>
    </Pressable>
  );
}
```

---

## Gesture Handling

```typescript
// GOOD: Gesture handler for swipe actions
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function SwipeableCard() {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > 100) {
        // Swipe threshold reached
        translateX.value = withSpring(translateX.value > 0 ? 300 : -300);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle} className="bg-white p-4 rounded-lg">
        <Text>Swipe me</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## List Performance

```typescript
// GOOD: Optimized FlatList
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ListItem item={item} />}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  // Pull to refresh
  refreshControl={
    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
  }
  // Infinite scroll
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
  // Empty state
  ListEmptyComponent={<EmptyState message="No items found" />}
/>

// GOOD: Memoized list item
const ListItem = memo(function ListItem({ item }: { item: Item }) {
  return (
    <View className="p-4 border-b border-gray-200">
      <Text>{item.title}</Text>
    </View>
  );
});
```

---

## Navigation Patterns

```typescript
// GOOD: Typed navigation with Expo Router
import { router } from 'expo-router';

// Navigate
router.push('/profile');
router.push({ pathname: '/user/[id]', params: { id: '123' } });

// Replace (no back)
router.replace('/home');

// Go back
router.back();

// Navigate with options
router.push({
  pathname: '/modal',
  params: { title: 'Settings' },
});
```

---

**Related Documentation**:

- [Component Patterns](../guides/component-patterns.md)
- [Styling Guide](../guides/styling-guide.md)
- [Navigation Guide](../guides/navigation-guide.md)
- [Data Fetching](../guides/data-fetching.md)
