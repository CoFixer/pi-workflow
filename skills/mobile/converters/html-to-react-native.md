# HTML to React Native Conversion Guide

Step-by-step guide for converting static HTML/Tailwind CSS templates into React Native components using Expo, NativeWind, and React Native Paper.

---

## When to Use This Guide

- Converting HTML mockups or prototypes to React Native mobile app
- Migrating web designs to cross-platform mobile
- Extracting reusable components from HTML templates
- Refactoring inline JavaScript to React Native patterns

---

## Quick Conversion Reference

| HTML Pattern | React Native Equivalent |
|--------------|------------------------|
| `<div class="...">` | `<View className="...">` |
| `<span>text</span>` | `<Text>text</Text>` |
| `<p>`, `<h1>`-`<h6>` | `<Text className="text-xl">` (styled) |
| `<img src="url">` | `<Image source={{uri: 'url'}} />` |
| `<a href="/page">` | `<Link href="/page">` (Expo Router) |
| `<button onclick>` | `<Pressable onPress>` or `<Button>` (Paper) |
| `<input type="text">` | `<TextInput>` (Paper) |
| `<ul><li>` | `<FlatList>` or `<ScrollView>` |
| `class="hidden"` | `{isVisible && <Component />}` |
| `overflow: scroll` | `<ScrollView>` or `<FlatList>` |
| `position: fixed` | `position: 'absolute'` (with SafeAreaView) |
| `onclick="fn()"` | `onPress={handleFn}` |
| `window.location.href` | `router.push('/path')` (Expo Router) |

---

## Platform-Specific Considerations

### Critical Differences from Web

1. **No `div` or `span`**: Use `<View>` for containers, `<Text>` for any text
2. **Text must be wrapped**: All text content must be inside `<Text>` components
3. **No CSS pseudo-elements**: `::before` and `::after` require additional View/Image components
4. **No hover states**: Use `active:` prefix in NativeWind for press feedback
5. **No cursor styles**: Touch is the only input method
6. **SafeAreaView required**: Handle notch/home indicator with `react-native-safe-area-context`
7. **Flexbox is default**: No need for `display: flex`
8. **Column is default**: Flex direction is column by default (opposite of web)

### Box Shadow Differences

```typescript
// Web CSS
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

// React Native - Platform specific
// iOS: Use shadow props
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
}}

// Android: Use elevation
style={{ elevation: 4 }}

// NativeWind: Use shadow utilities (handles both platforms)
className="shadow-md"
```

---

## Component Extraction Strategy

### Step 1: Identify React Native Equivalents

Map each HTML element to its React Native counterpart:

```html
<!-- HTML -->
<div class="flex flex-col p-4 bg-white rounded-xl">
  <h2 class="text-lg font-bold">Title</h2>
  <p class="text-gray-500">Description</p>
  <button class="bg-blue-500 text-white px-4 py-2 rounded">
    Click Me
  </button>
</div>
```

```typescript
// React Native with NativeWind
import { View, Text, Pressable } from 'react-native';

<View className="flex flex-col p-4 bg-white rounded-xl">
  <Text className="text-lg font-bold">Title</Text>
  <Text className="text-gray-500">Description</Text>
  <Pressable className="bg-blue-500 px-4 py-2 rounded active:bg-blue-600">
    <Text className="text-white text-center">Click Me</Text>
  </Pressable>
</View>
```

### Step 2: Extract Layout Components

Create reusable screen layouts:

```typescript
// src/components/layout/ScreenLayout.tsx
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function ScreenLayout({
  children,
  scrollable = true
}: ScreenLayoutProps) {
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Container
        className="flex-1"
        contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}
```

### Step 3: Handle State & Interactions

Convert inline JavaScript to React hooks:

```html
<!-- HTML with inline JS -->
<button onclick="toggleMenu()">Menu</button>
<div id="menu" class="hidden">Menu Content</div>

<script>
function toggleMenu() {
  document.getElementById('menu').classList.toggle('hidden');
}
</script>
```

```typescript
// React Native
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

function MenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setIsMenuOpen(!isMenuOpen)}>
        <Text>Menu</Text>
      </Pressable>
      {isMenuOpen && (
        <View>
          <Text>Menu Content</Text>
        </View>
      )}
    </View>
  );
}
```

---

## Before/After Examples

### Example 1: Glassmorphic Card

**HTML:**
```html
<div class="glass-panel bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
  <h3 class="text-white font-medium">Card Title</h3>
  <p class="text-white/60">Card description text</p>
</div>

<style>
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
</style>
```

**React Native:**
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  title: string;
  description: string;
}

export default function GlassCard({ title, description }: GlassCardProps) {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      className="rounded-2xl overflow-hidden"
    >
      <View className="p-4 bg-white/10 border border-white/10 rounded-2xl">
        <Text className="text-white font-medium">{title}</Text>
        <Text className="text-white/60">{description}</Text>
      </View>
    </BlurView>
  );
}
```

**Note:** `expo-blur` BlurView works well on iOS. On Android, the blur effect may be limited. Consider a fallback:

```typescript
import { Platform } from 'react-native';

const GlassBackground = Platform.select({
  ios: () => <BlurView intensity={40} tint="dark" className="absolute inset-0" />,
  android: () => <View className="absolute inset-0 bg-black/60" />,
})!;
```

### Example 2: Carousel with Touch/Swipe

**HTML with JavaScript:**
```html
<div class="carousel-container overflow-hidden">
  <div class="carousel-track flex transition-transform" id="track">
    <div class="carousel-slide min-w-full">Slide 1</div>
    <div class="carousel-slide min-w-full">Slide 2</div>
    <div class="carousel-slide min-w-full">Slide 3</div>
  </div>
</div>

<script>
let currentIndex = 0;
const track = document.getElementById('track');

function goToSlide(index) {
  currentIndex = index;
  track.style.transform = `translateX(-${index * 100}%)`;
}

// Touch handling
let startX = 0;
track.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
track.addEventListener('touchend', (e) => {
  const diff = startX - e.changedTouches[0].clientX;
  if (diff > 50) goToSlide(currentIndex + 1);
  if (diff < -50) goToSlide(currentIndex - 1);
});
</script>
```

**React Native:**
```typescript
import { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, ViewToken } from 'react-native';

interface CarouselItem {
  id: string;
  content: string;
}

interface CarouselProps {
  items: CarouselItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Carousel({ items }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View
            style={{ width: SCREEN_WIDTH }}
            className="items-center justify-center p-4"
          >
            <Text className="text-white text-xl">{item.content}</Text>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View className="flex-row justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === activeIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
```

### Example 3: Bottom Tab Navigation

**HTML:**
```html
<nav class="fixed bottom-0 left-0 right-0 glass-panel">
  <div class="flex justify-around py-4">
    <a href="/" class="flex flex-col items-center text-white/60">
      <span class="iconify" data-icon="lucide:home"></span>
      <span class="text-xs">Home</span>
    </a>
    <a href="/search" class="flex flex-col items-center text-white/60">
      <span class="iconify" data-icon="lucide:search"></span>
      <span class="text-xs">Search</span>
    </a>
    <a href="/profile" class="flex flex-col items-center text-white/60">
      <span class="iconify" data-icon="lucide:user"></span>
      <span class="text-xs">Profile</span>
    </a>
  </div>
</nav>
```

**React Native (Expo Router):**
```typescript
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              className="absolute inset-0"
            />
          ) : (
            <View className="absolute inset-0 bg-black/80" />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Example 4: Form with Validation

**HTML:**
```html
<form onsubmit="handleSubmit(event)" class="space-y-4">
  <div>
    <label class="text-white/60 text-sm">Email</label>
    <input
      type="email"
      id="email"
      required
      class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
      placeholder="Enter your email"
    />
  </div>
  <div>
    <label class="text-white/60 text-sm">Password</label>
    <input
      type="password"
      id="password"
      required
      class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
      placeholder="Enter your password"
    />
  </div>
  <button type="submit" class="w-full bg-purple-500 text-white py-3 rounded-xl">
    Sign In
  </button>
</form>

<script>
function handleSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  // Handle login...
}
</script>
```

**React Native with React Hook Form + Zod:**
```typescript
import { View, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Login:', data);
    // Handle login...
  };

  return (
    <View className="gap-4">
      <View>
        <Text className="text-white/60 text-sm mb-1">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.email}
              outlineColor="rgba(255,255,255,0.2)"
              activeOutlineColor="#a855f7"
              textColor="#fff"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          )}
        />
        {errors.email && (
          <HelperText type="error">{errors.email.message}</HelperText>
        )}
      </View>

      <View>
        <Text className="text-white/60 text-sm mb-1">Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Enter your password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.password}
              outlineColor="rgba(255,255,255,0.2)"
              activeOutlineColor="#a855f7"
              textColor="#fff"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          )}
        />
        {errors.password && (
          <HelperText type="error">{errors.password.message}</HelperText>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        buttonColor="#a855f7"
        textColor="#fff"
        className="rounded-xl"
      >
        Sign In
      </Button>
    </View>
  );
}
```

---

## Glassmorphism in React Native

### Basic Glass Effect

```typescript
import { View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassPanelProps {
  children: React.ReactNode;
  intensity?: number;
}

export default function GlassPanel({
  children,
  intensity = 40
}: GlassPanelProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        className="rounded-2xl overflow-hidden"
      >
        <View className="p-4 bg-white/5 border border-white/10">
          {children}
        </View>
      </BlurView>
    );
  }

  // Android fallback (blur is limited)
  return (
    <View className="rounded-2xl overflow-hidden bg-black/70 border border-white/10 p-4">
      {children}
    </View>
  );
}
```

### Gradient Border Effect

CSS pseudo-element gradient borders need to be simulated with nested Views:

```typescript
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientBorderCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-2xl overflow-hidden">
      {/* Gradient border layer */}
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="p-[1px] rounded-2xl"
      >
        {/* Inner content */}
        <View className="bg-neutral-900 rounded-2xl p-4">
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}
```

---

## NativeWind Styling Patterns

### Using cn() Utility

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
// Usage in components
import { View, Text, Pressable } from 'react-native';
import { cn } from '~/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}

export default function Button({
  variant = 'primary',
  disabled = false,
  children,
  onPress
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'px-6 py-3 rounded-xl',
        variant === 'primary' && 'bg-purple-500 active:bg-purple-600',
        variant === 'secondary' && 'bg-white/10 active:bg-white/20',
        disabled && 'opacity-50'
      )}
    >
      <Text className={cn(
        'text-center font-medium',
        variant === 'primary' && 'text-white',
        variant === 'secondary' && 'text-white/80'
      )}>
        {children}
      </Text>
    </Pressable>
  );
}
```

### Platform-Specific Styles

```typescript
import { Platform, View, Text } from 'react-native';

// Using Platform.select with NativeWind
<View
  className={cn(
    'p-4 rounded-xl',
    Platform.OS === 'ios' ? 'shadow-lg' : 'elevation-4'
  )}
>
  <Text>Platform-aware content</Text>
</View>

// Using Platform.select for complex styles
const containerStyle = Platform.select({
  ios: 'shadow-lg bg-white',
  android: 'elevation-4 bg-white',
  default: 'border border-gray-200',
});
```

---

## Navigation Patterns

### File-Based Routing (Expo Router)

```
src/app/
├── _layout.tsx           # Root layout
├── (tabs)/               # Tab navigator group
│   ├── _layout.tsx       # Tab configuration
│   ├── index.tsx         # Home tab (/)
│   ├── search.tsx        # Search tab (/search)
│   └── profile.tsx       # Profile tab (/profile)
├── artwork/
│   └── [id].tsx          # Dynamic route (/artwork/123)
├── artist/
│   └── [id].tsx          # Dynamic route (/artist/456)
└── modal.tsx             # Modal screen
```

### Navigation Actions

```typescript
import { useRouter, Link } from 'expo-router';

function NavigationExamples() {
  const router = useRouter();

  return (
    <View className="gap-4">
      {/* Declarative navigation */}
      <Link href="/search" asChild>
        <Pressable className="p-4 bg-white/10 rounded-xl">
          <Text className="text-white">Go to Search</Text>
        </Pressable>
      </Link>

      {/* Programmatic navigation */}
      <Pressable
        onPress={() => router.push('/artwork/123')}
        className="p-4 bg-white/10 rounded-xl"
      >
        <Text className="text-white">View Artwork</Text>
      </Pressable>

      {/* Navigation with params */}
      <Pressable
        onPress={() => router.push({
          pathname: '/artist/[id]',
          params: { id: '456', name: 'Artist Name' }
        })}
        className="p-4 bg-white/10 rounded-xl"
      >
        <Text className="text-white">View Artist</Text>
      </Pressable>

      {/* Go back */}
      <Pressable
        onPress={() => router.back()}
        className="p-4 bg-white/10 rounded-xl"
      >
        <Text className="text-white">Go Back</Text>
      </Pressable>
    </View>
  );
}
```

---

## Step-by-Step Conversion Checklist

### Phase 1: Analysis
- [ ] Read through entire HTML file
- [ ] List all elements and their React Native equivalents
- [ ] Identify `<script>` blocks and inline event handlers
- [ ] List all interactive elements (buttons, forms, toggles)
- [ ] Identify repeating patterns that should be components
- [ ] Note any external CSS or inline styles
- [ ] Identify glassmorphism, gradients, or special effects

### Phase 2: Structure
- [ ] Create component file with TypeScript
- [ ] Define props interface with JSDoc comments
- [ ] Replace all HTML elements with React Native equivalents
- [ ] Wrap all text content in `<Text>` components
- [ ] Replace `class` with `className` throughout
- [ ] Add `SafeAreaView` for screen-level components

### Phase 3: Interactivity
- [ ] Convert `onclick` to `onPress` handlers
- [ ] Replace DOM manipulation with `useState`
- [ ] Convert `window.location.href` to `router.push()`
- [ ] Replace `<a href>` with `<Link>` or `Pressable`
- [ ] Convert touch/swipe handlers to Gesture Handler or FlatList

### Phase 4: Forms
- [ ] Set up React Hook Form with `useForm`
- [ ] Create Zod schema for validation
- [ ] Use React Native Paper `TextInput` components
- [ ] Add error display with `HelperText`
- [ ] Connect form to Redux or API as needed

### Phase 5: Styling & Polish
- [ ] Keep Tailwind classes (NativeWind compatible)
- [ ] Use `cn()` utility for conditional classes
- [ ] Replace `hover:` with `active:` for press feedback
- [ ] Add platform-specific fallbacks for blur/shadow
- [ ] Test on both iOS and Android

---

## Common Patterns

### DO: Use React Native Components

```typescript
// Good - React Native way
<View className="flex-row items-center gap-2">
  <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full" />
  <Text className="text-white font-medium">{name}</Text>
</View>

// Good - Conditional rendering
{isLoading ? <ActivityIndicator /> : <ContentView />}

// Good - FlatList for lists
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}
/>
```

### DON'T: Use Web-Only Patterns

```typescript
// Bad - div and span don't exist
<div><span>Text</span></div>

// Bad - class instead of className
<View class="p-4">

// Bad - onclick instead of onPress
<Pressable onclick={handleClick}>

// Bad - href on Pressable
<Pressable href="/page">

// Bad - direct text without Text component
<View>Some text here</View>

// Bad - hover states (don't work on mobile)
<View className="hover:bg-blue-500">
```

### DO: Handle Platform Differences

```typescript
import { Platform } from 'react-native';

// Platform-specific code
if (Platform.OS === 'ios') {
  // iOS-specific logic
}

// Platform-specific values
const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

---

## Icon Conversion

### HTML Iconify → React Native Icons

**HTML:**
```html
<span class="iconify" data-icon="lucide:search"></span>
<span class="iconify" data-icon="lucide:bell"></span>
<span class="iconify" data-icon="lucide:user"></span>
```

**React Native with @expo/vector-icons:**
```typescript
import { Ionicons, Feather } from '@expo/vector-icons';

// Ionicons (similar to Lucide)
<Ionicons name="search-outline" size={24} color="white" />
<Ionicons name="notifications-outline" size={24} color="white" />
<Ionicons name="person-outline" size={24} color="white" />

// Or Feather icons
<Feather name="search" size={24} color="white" />
<Feather name="bell" size={24} color="white" />
<Feather name="user" size={24} color="white" />
```

---

## See Also

- [component-patterns.md](../../guides/component-patterns.md) - React Native component architecture
- [navigation-guide.md](../../guides/navigation-guide.md) - Expo Router patterns
- [styling-guide.md](../../guides/styling-guide.md) - NativeWind usage
- [common-patterns.md](../../guides/common-patterns.md) - Forms with React Hook Form + Zod
- [data-fetching.md](../../guides/data-fetching.md) - TanStack Query patterns
