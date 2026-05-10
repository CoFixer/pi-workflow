# Common Patterns

Frequently used patterns for forms, camera integration, animations, storage, and other common React Native elements.

---

## React Hook Form + Zod Validation

### Form Schema with Zod

```typescript
// src/utils/validations/auth.ts
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration with confirmation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Form Component Pattern

```typescript
import { View, Text, TextInput, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/utils/validations/auth';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form data:', data);
  };

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={cn(
                'h-12 px-4 rounded-lg border bg-background text-foreground',
                errors.email ? 'border-destructive' : 'border-input'
              )}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text className="text-sm text-destructive">{errors.email.message}</Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={cn(
                'h-12 px-4 rounded-lg border bg-background text-foreground',
                errors.password ? 'border-destructive' : 'border-input'
              )}
              placeholder="Enter password"
              placeholderTextColor="#999"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
          )}
        />
        {errors.password && (
          <Text className="text-sm text-destructive">{errors.password.message}</Text>
        )}
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={cn(
          'h-12 rounded-lg bg-primary items-center justify-center',
          isSubmitting && 'opacity-50'
        )}
      >
        <Text className="text-base font-semibold text-primary-foreground">
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Text>
      </Pressable>
    </View>
  );
}
```

---

## Camera Integration (Vision Camera)

### Installation

```bash
npm install react-native-vision-camera
npx expo install expo-camera
```

### Camera Permissions

```typescript
// src/hooks/useCamera.ts
import { useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera';
import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';

export function useCamera() {
  const device = useCameraDevice('front'); // or 'back'
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const openSettings = () => {
    Alert.alert(
      'Camera Permission Required',
      'Please enable camera access in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return {
    device,
    hasPermission,
    requestPermission,
    openSettings,
  };
}
```

### Camera Component

```typescript
import { View, Text, Pressable } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';

export default function CameraScreen() {
  const { device, hasPermission, openSettings } = useCamera();
  const cameraRef = useRef<Camera>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-foreground mb-4">
          Camera permission is required
        </Text>
        <Pressable
          onPress={openSettings}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white">Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground">No camera device found</Text>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash,
        enableShutterSound: true,
      });
      console.log('Photo taken:', photo.path);
    }
  };

  return (
    <View className="flex-1">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Capture Button */}
      <View className="absolute bottom-8 left-0 right-0 items-center">
        <Pressable
          onPress={takePhoto}
          className="w-20 h-20 rounded-full bg-white border-4 border-primary"
        />
      </View>
    </View>
  );
}
```

### QR Code Scanner

```typescript
import { Camera, useCodeScanner } from 'react-native-vision-camera';

export default function QRScanner() {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value;
      if (value) {
        console.log('Scanned:', value);
        // Handle scanned code
      }
    },
  });

  if (!device) return null;

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      codeScanner={codeScanner}
    />
  );
}
```

---

## React Native Reanimated

### Installation

```bash
npm install react-native-reanimated
```

### Basic Animation

```typescript
import { View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function AnimatedButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={animatedStyle}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Press Me</Text>
      </Animated.View>
    </Pressable>
  );
}
```

### Fade In Animation

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

// Using entering/exiting animations
export function FadeInView({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
      {children}
    </Animated.View>
  );
}

// Using shared values
export function CustomFadeIn({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
```

### Slide Animation

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function SwipeToDelete({ onDelete }: { onDelete: () => void }) {
  const translateX = useSharedValue(0);
  const THRESHOLD = -100;

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < THRESHOLD) {
        translateX.value = withSpring(-200);
        runOnJS(onDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle} className="bg-card p-4 rounded-lg">
        <Text>Swipe to delete</Text>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## MMKV Storage

### Installation

```bash
npm install react-native-mmkv
```

### Storage Service

```typescript
// src/services/storageService.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

// Typed storage helper
export const storageService = {
  // String operations
  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  // Boolean operations
  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  // Object operations (JSON)
  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  },
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Delete
  delete: (key: string): void => {
    storage.delete(key);
  },

  // Clear all
  clearAll: (): void => {
    storage.clearAll();
  },
};
```

### Redux Persist with MMKV

```typescript
// src/redux/storage.ts
import { MMKV } from 'react-native-mmkv';
import type { Storage } from 'redux-persist';

const storage = new MMKV();

export const reduxStorage: Storage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
```

---

## Modal Patterns

### Bottom Sheet Modal

```typescript
import { Modal, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={animatedStyle}
            className="bg-background rounded-t-3xl p-4 pb-8"
          >
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="w-10 h-1 bg-muted rounded-full" />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
```

### Alert Dialog

```typescript
import { Modal, View, Text, Pressable } from 'react-native';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function AlertDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: AlertDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-background rounded-xl p-6 w-full max-w-sm">
          <Text className="text-xl font-bold text-foreground mb-2">
            {title}
          </Text>
          <Text className="text-muted-foreground mb-6">{message}</Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 h-12 rounded-lg border border-input items-center justify-center"
            >
              <Text className="font-medium text-foreground">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 h-12 rounded-lg bg-primary items-center justify-center"
            >
              <Text className="font-medium text-primary-foreground">
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

## List Patterns

### Pull to Refresh

```typescript
import { FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';

export default function RefreshableList() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Item[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const newData = await fetchData();
      setData(newData);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemCard item={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']} // Android
        />
      }
    />
  );
}
```

### Infinite Scroll

```typescript
import { FlatList, ActivityIndicator, View } from 'react-native';

export default function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers();

  const items = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemCard item={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}
```

---

## Authentication Pattern

### Secure Token Storage

```typescript
// src/services/authStorage.ts
import { storage } from './storageService';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authStorage = {
  getToken: (): string | undefined => {
    return storage.getString(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    storage.set(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    storage.delete(TOKEN_KEY);
  },

  getUser: <T>(): T | undefined => {
    const user = storage.getString(USER_KEY);
    return user ? JSON.parse(user) : undefined;
  },

  setUser: <T>(user: T): void => {
    storage.set(USER_KEY, JSON.stringify(user));
  },

  clearAll: (): void => {
    storage.delete(TOKEN_KEY);
    storage.delete(USER_KEY);
  },
};
```

### Protected Route (Expo Router)

```typescript
// app/(tabs)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';

export default function TabLayout() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
```

---

## WebSocket / Real-time

### Socket.IO Service

```typescript
// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }
}

export const socketService = new SocketService();
```

### Using in Components

```typescript
import { useEffect } from 'react';
import { socketService } from '@/services/socketService';

export function useRealtimeMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribe = socketService.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return unsubscribe;
  }, []);

  const sendMessage = (content: string) => {
    socketService.emit('send_message', { content });
  };

  return { messages, sendMessage };
}
```

---

## Summary

**Common Patterns Checklist:**

- ✅ Use React Hook Form + Zod for form validation
- ✅ Use Vision Camera for camera features
- ✅ Use Reanimated for smooth 60fps animations
- ✅ Use MMKV for fast key-value storage
- ✅ Use Redux Persist with MMKV adapter
- ✅ Handle loading, error, and empty states
- ✅ Implement pull-to-refresh and infinite scroll
- ✅ Use bottom sheets for modal content

**See Also:**

- [data-fetching.md](data-fetching.md) - API service patterns
- [component-patterns.md](component-patterns.md) - Component structure
- [performance.md](performance.md) - Optimization patterns
