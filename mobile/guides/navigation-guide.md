# Navigation Guide

Expo Router implementation for React Native apps with file-based routing and TypeScript support.

---

## Expo Router Overview

The project uses **Expo Router** (file-based routing) with:

- File-system based routing (no manual route configuration)
- Stack Navigator via layouts
- Bottom Tab Navigator via layouts
- Deep linking support (automatic from file structure)
- TypeScript integration for type-safe navigation
- Automatic code splitting per route

---

## Installation

### Required Packages

```bash
# Install Expo Router and dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### Configuration

#### package.json
```json
{
  "main": "expo-router/entry"
}
```

#### app.json
```json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"]
  }
}
```

#### metro.config.js
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

---

## File-Based Routing

### Directory Structure

Expo Router uses the `app/` directory for routes:

```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Home screen (/)
├── about.tsx                # About screen (/about)
└── users/
    ├── index.tsx            # Users list (/users)
    └── [id].tsx             # User details (/users/:id)
```

### Basic Route File

```typescript
// app/index.tsx
import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Home Screen</Text>
    </View>
  );
}
```

**Convention:** Each file exports a default component that renders the screen.

---

## Layouts

### Root Layout

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="about" />
        <Stack.Screen name="users/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
```

### Layout with Providers

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ReduxProvider } from '@/redux/store';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ReduxProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}
```

**Key Points:**
- `_layout.tsx` wraps all child routes
- Wrap providers around `<Stack>` to make them available to all routes
- Configure screen options per route or globally

---

## Stack Navigator Options

### Screen Configuration

```typescript
<Stack>
  <Stack.Screen
    name="index"
    options={{
      title: 'Home',
      headerShown: true,
      headerStyle: { backgroundColor: '#6200EE' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  />
  <Stack.Screen
    name="details"
    options={{
      presentation: 'modal',
      headerBackVisible: false,
    }}
  />
</Stack>
```

### Dynamic Options

```typescript
// app/users/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';

export default function UserDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: `User ${id}` }} />
      <View>{/* Screen content */}</View>
    </>
  );
}
```

---

## Tab Navigation

### Tab Layout Structure

```
app/
├── _layout.tsx              # Root layout (Stack)
└── (tabs)/                  # Tab group
    ├── _layout.tsx          # Tab configuration
    ├── index.tsx            # Home tab
    ├── search.tsx           # Search tab
    └── profile.tsx          # Profile tab
```

### Tab Layout Configuration

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Tab Screen

```typescript
// app/(tabs)/index.tsx
import { View, Text } from 'react-native';

export default function HomeTab() {
  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold">Home Tab</Text>
    </View>
  );
}
```

### Tab with Badge

```typescript
<Tabs.Screen
  name="notifications"
  options={{
    title: 'Notifications',
    tabBarBadge: 3,
    tabBarBadgeStyle: { backgroundColor: 'red' },
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="notifications" size={size} color={color} />
    ),
  }}
/>
```

**Convention:**
- `(tabs)` creates a route group (doesn't affect URL)
- `index.tsx` inside `(tabs)/` is the first tab
- Each file in `(tabs)/` becomes a tab

---

## Navigation

### Using useRouter Hook

```typescript
import { useRouter } from 'expo-router';
import { View, Button } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleNavigate = () => {
    // Navigate to route
    router.push('/details');
  };

  const handleNavigateWithParams = () => {
    // Navigate with params
    router.push('/users/123');
  };

  const handleReplace = () => {
    // Replace current route
    router.replace('/login');
  };

  const handleGoBack = () => {
    // Go back
    router.back();
  };

  return (
    <View className="flex-1 p-4">
      <Button title="Go to Details" onPress={handleNavigate} />
      <Button title="Go to User" onPress={handleNavigateWithParams} />
    </View>
  );
}
```

### Navigation Methods

| Method | Description |
|--------|-------------|
| `push(href)` | Navigate to route (adds to stack) |
| `replace(href)` | Replace current route (no back) |
| `back()` | Go back to previous route |
| `canGoBack()` | Check if can go back |
| `setParams(params)` | Update current route params |

---

## Dynamic Routes

### Creating Dynamic Routes

```
app/
└── users/
    ├── index.tsx            # /users
    └── [id].tsx             # /users/:id
```

### Accessing Route Parameters

```typescript
// app/users/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function UserDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">User ID: {id}</Text>
    </View>
  );
}
```

### Navigating to Dynamic Routes

```typescript
const router = useRouter();

// Navigate to dynamic route
router.push(`/users/${userId}`);

// Or with object syntax
router.push({
  pathname: '/users/[id]',
  params: { id: userId },
});
```

### Multiple Dynamic Segments

```
app/
└── posts/
    └── [category]/
        └── [id].tsx         # /posts/:category/:id
```

```typescript
// app/posts/[category]/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PostScreen() {
  const { category, id } = useLocalSearchParams();

  return (
    <View>
      <Text>Category: {category}</Text>
      <Text>Post ID: {id}</Text>
    </View>
  );
}
```

### Query Parameters

```typescript
// Navigate with query params
router.push('/search?query=shoes&sort=price');

// Access query params
const { query, sort } = useLocalSearchParams();
// query = 'shoes', sort = 'price'
```

---

## TypeScript Integration

### Typed Routes (Experimental)

Expo Router can generate types for your routes:

```typescript
// expo-env.d.ts (auto-generated)
declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface Routes {
      '/': never;
      '/about': never;
      '/users/[id]': { id: string };
      '/(tabs)': never;
      '/settings': never;
    }
  }
}
```

### Using Typed Routes

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// TypeScript knows these routes exist
router.push('/');
router.push('/users/123');

// TypeScript error - route doesn't exist
router.push('/invalid'); // ❌
```

### Typed Parameters

```typescript
import { useLocalSearchParams } from 'expo-router';
import type { ExpoRouter } from 'expo-router';

type Params = ExpoRouter.Routes['/users/[id]'];

export default function UserScreen() {
  const params = useLocalSearchParams<Params>();
  // params.id is typed as string
}
```

---

## Route Groups

### Creating Route Groups

Route groups use `()` to organize routes without affecting the URL:

```
app/
├── _layout.tsx
├── (tabs)/              # Group: doesn't appear in URL
│   ├── _layout.tsx
│   ├── index.tsx        # URL: /
│   └── search.tsx       # URL: /search
├── (auth)/              # Group: doesn't appear in URL
│   ├── _layout.tsx
│   ├── login.tsx        # URL: /login
│   └── register.tsx     # URL: /register
└── settings.tsx         # URL: /settings
```

### Benefits of Route Groups

1. **Organization:** Group related routes logically
2. **Shared Layouts:** Each group can have its own layout
3. **URL Clean:** Groups don't add path segments

### Example: Auth Group with Layout

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Sign Up' }} />
    </Stack>
  );
}
```

---

## Authentication Flow

### Auth Router Pattern

```typescript
// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading during auth check
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
```

### Auth Context

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Login Screen

```typescript
// app/login.tsx
import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Call your auth API
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const { token } = await response.json();
      await login(token);

      // Redirect will happen via app/index.tsx
    } catch (error) {
      Alert.alert('Login Failed', 'Please try again');
    }
  };

  return (
    <View className="flex-1 p-4 justify-center">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

### Protecting Routes

No special logic needed - `app/index.tsx` handles redirects automatically based on auth state.

---

## Deep Linking

### Automatic Configuration

Expo Router automatically configures deep linking based on your file structure:

```
app/
├── index.tsx            → myapp://
├── about.tsx            → myapp://about
├── users/
│   └── [id].tsx         → myapp://users/123
```

### app.json Configuration

```json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"]
  }
}
```

### iOS Configuration (Info.plist)

Added automatically by Expo Router plugin.

### Android Configuration (AndroidManifest.xml)

Added automatically by Expo Router plugin.

### Testing Deep Links

```bash
# iOS Simulator
xcrun simctl openurl booted myapp://users/123

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://users/123"
```

### Web URLs

```json
{
  "expo": {
    "scheme": "myapp",
    "plugins": ["expo-router"],
    "extra": {
      "router": {
        "origin": "https://myapp.com"
      }
    }
  }
}
```

URLs: `https://myapp.com/users/123` → `myapp://users/123`

---

## Modal Presentation

### Creating Modal Routes

```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
  <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
</Stack>
```

### Modal Screen

```typescript
// app/create-post.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CreatePostModal() {
  const router = useRouter();

  return (
    <View className="flex-1 p-4">
      <Button title="Close" onPress={() => router.back()} />
      <Text className="text-xl font-bold">Create Post</Text>
    </View>
  );
}
```

### Modal with Presentation Options

```typescript
<Stack.Screen
  name="settings"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
  }}
/>
```

---

## Header Customization

### Setting Header Options

```typescript
// app/details.tsx
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function DetailsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Details',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <View>{/* Screen content */}</View>
    </>
  );
}
```

### Custom Header Component

```typescript
<Stack.Screen
  options={{
    header: ({ navigation, route, options }) => (
      <View className="flex-row items-center p-4 bg-primary">
        <Text className="text-xl font-bold text-white">
          {options.title || route.name}
        </Text>
      </View>
    ),
  }}
/>
```

### Dynamic Header

```typescript
import { Stack, useLocalSearchParams } from 'expo-router';

export default function UserScreen() {
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: `User ${id}` }} />
      <View>{/* Content */}</View>
    </>
  );
}
```

---

## Navigation Events

### Using useFocusEffect

```typescript
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileScreen() {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused');
      // Fetch data, start animation, etc.

      return () => {
        console.log('Screen unfocused');
        // Cleanup
      };
    }, [])
  );

  return <View />;
}
```

### Preventing Navigation

```typescript
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function EditScreen() {
  const router = useRouter();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeRemove = (e: any) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes.',
        [
          { text: "Don't leave", style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    };

    // Note: Expo Router doesn't have direct beforeRemove
    // Use React Navigation's useFocusEffect if needed
  }, [hasUnsavedChanges, router]);

  return <View />;
}
```

---

## Common Patterns

### Nested Stack in Tabs

```
app/
├── _layout.tsx              # Root Stack
└── (tabs)/
    ├── _layout.tsx          # Tabs
    ├── home/
    │   ├── _layout.tsx      # Nested Stack
    │   ├── index.tsx        # Home main
    │   └── details.tsx      # Home details
    └── profile.tsx          # Profile tab
```

```typescript
// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
    </Stack>
  );
}
```

### 404 / Not Found Screen

```typescript
// app/+not-found.tsx
import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Page Not Found</Text>
      <Link href="/" className="text-blue-500 mt-4">
        Go to Home
      </Link>
    </View>
  );
}
```

### Loading States

```typescript
// app/_layout.tsx
import { Stack, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load resources
        await loadFonts();
        await checkAuth();
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) return null;

  return <Stack />;
}
```

---

## Migration from React Navigation

If you're migrating from React Navigation:

### Hook Changes

| React Navigation | Expo Router |
|------------------|-------------|
| `useNavigation()` | `useRouter()` |
| `useRoute()` | `useLocalSearchParams()` |
| `navigation.navigate('Screen', { id })` | `router.push('/screen/' + id)` |
| `navigation.goBack()` | `router.back()` |
| `navigation.replace('Screen')` | `router.replace('/screen')` |
| `route.params.id` | `const { id } = useLocalSearchParams()` |

### Structure Changes

- Move screens from `src/screens/` to `app/`
- Replace navigator components with `_layout.tsx` files
- Use route groups `()` for organization
- Use `[param]` for dynamic routes

---

## Summary

**Expo Router Checklist:**

- ✅ Use file-based routing in `app/` directory
- ✅ Create `_layout.tsx` for layouts and navigators
- ✅ Use route groups `()` for organization
- ✅ Use `[param]` for dynamic routes
- ✅ Use `useRouter()` for navigation
- ✅ Use `useLocalSearchParams()` for route params
- ✅ Configure deep linking in `app.json`
- ✅ Use `useFocusEffect()` for screen focus events
- ✅ Use `<Redirect>` for auth routing
- ✅ Set `presentation: 'modal'` for modal screens

**Key Benefits:**

- **Automatic routing** - No manual route configuration
- **Type safety** - Auto-generated route types
- **Code splitting** - Automatic per-route
- **Deep linking** - Works out of the box
- **Better DX** - File-based is intuitive

**See Also:**

- [file-organization.md](file-organization.md) - Directory structure
- [component-patterns.md](component-patterns.md) - Screen patterns
- [typescript-standards.md](typescript-standards.md) - TypeScript patterns
- [common-patterns.md](common-patterns.md) - Auth patterns
