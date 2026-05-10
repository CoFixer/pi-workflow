# Styling Guide

Modern styling patterns using NativeWind (Tailwind CSS for React Native) and TypeScript.

---

## Core Concepts

### NativeWind Overview

NativeWind brings Tailwind CSS to React Native, allowing you to use utility classes for styling:

```typescript
import { View, Text } from 'react-native';

// Direct utility classes
<View className="p-4 mb-3 flex-col gap-2">
  <Text className="text-foreground">Content</Text>
</View>
```

### Key Differences from Web Tailwind

| Web Tailwind | NativeWind (React Native) |
|--------------|---------------------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `hover:` states | `active:` states (press feedback) |
| CSS Grid | Limited support (use Flexbox) |
| `display: block/inline` | Always Flexbox |
| Default `flex-row` | Default `flex-col` |

---

## cn() Utility

### Conditional Class Merging

Use `cn()` for conditional class merging (combines `clsx` + `tailwind-merge`):

```typescript
import { cn } from '~/lib/utils';

<View className={cn(
  'p-4 bg-background',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50'
)} />
```

### Implementation

```typescript
// ~/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Theme Colors

### Available Color Variables

Colors are configured in `tailwind.config.js` and accessed via NativeWind classes:

```typescript
// Via NativeWind classes (preferred)
<View className="bg-background" />
<Text className="text-foreground" />
<Text className="text-primary" />
<Text className="text-muted-foreground" />
<View className="border-border" />
<View className="bg-destructive" />

// Semantic usage
<Text className="text-muted-foreground">Secondary text</Text>
<View className="bg-primary p-4 rounded-lg">
  <Text className="text-primary-foreground">Button text</Text>
</View>
<View className="border border-input rounded-md">Input border</View>
```

### Common Theme Colors

| Class | Usage |
|-------|-------|
| `bg-background` | Main background |
| `text-foreground` | Primary text |
| `bg-primary` | Primary buttons, accents |
| `text-primary-foreground` | Text on primary background |
| `bg-secondary` | Secondary backgrounds |
| `text-muted-foreground` | Secondary/helper text |
| `bg-destructive` | Error/delete states |
| `border-border` | Default borders |
| `bg-card` | Card backgrounds |

---

## Dark Mode

### Using useColorScheme

React Native handles dark mode via the `useColorScheme` hook:

```typescript
import { useColorScheme } from 'react-native';

export default function ThemedComponent() {
  const colorScheme = useColorScheme(); // 'light' | 'dark' | null

  return (
    <View className="bg-background">
      <Text className="text-foreground">
        Current theme: {colorScheme}
      </Text>
    </View>
  );
}
```

### NativeWind Dark Mode

NativeWind automatically applies dark mode styles based on system preference:

```typescript
// Semantic colors adapt automatically
<View className="bg-background" />
// Light: white background
// Dark: dark background

// Explicit dark mode variants (if needed)
<View className="bg-white dark:bg-gray-900" />
<Text className="text-gray-900 dark:text-white" />
```

### Dark Mode Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
  // ...
};
```

---

## Common Utility Classes

### Spacing

```typescript
// Padding
<View className="p-4" />      // All sides: 16px
<View className="px-4" />     // Horizontal: 16px
<View className="py-4" />     // Vertical: 16px
<View className="pt-4" />     // Top only: 16px
<View className="p-2" />      // All sides: 8px

// Margin
<View className="m-4" />      // All sides
<View className="mx-auto" />  // Center horizontally (limited in RN)
<View className="mt-4 mb-2" />

// Gap (for flex containers)
<View className="gap-4" />    // 16px gap
<View className="gap-2" />    // 8px gap
```

### Spacing Scale Reference

| Pixels | Class |
|--------|-------|
| 4px | 1 |
| 8px | 2 |
| 12px | 3 |
| 16px | 4 |
| 20px | 5 |
| 24px | 6 |
| 32px | 8 |
| 40px | 10 |
| 48px | 12 |
| 64px | 16 |

---

## Flexbox

### Important: React Native Defaults

React Native uses `flexDirection: 'column'` by default (unlike web's `row`).

```typescript
// Basic flex (column by default in RN)
<View className="flex-1" />
<View className="flex-col" />    // Explicit column (default)
<View className="flex-row" />    // Row layout

// Alignment
<View className="items-center" />
<View className="justify-center" />
<View className="justify-between" />
<View className="items-center justify-center" />

// Gap
<View className="flex-col gap-4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// Common row pattern
<View className="flex-row items-center justify-between gap-4">
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

### Flex Layout Patterns

```typescript
// Full screen centered content
<View className="flex-1 items-center justify-center">
  <Text>Centered content</Text>
</View>

// Header with content and footer
<View className="flex-1">
  <View className="p-4">Header</View>
  <View className="flex-1 p-4">Content (grows)</View>
  <View className="p-4">Footer</View>
</View>

// Two columns
<View className="flex-row flex-1">
  <View className="flex-1 bg-red-100">Left</View>
  <View className="flex-1 bg-blue-100">Right</View>
</View>
```

---

## Typography

### Font Size

```typescript
<Text className="text-xs" />    // 12px
<Text className="text-sm" />    // 14px
<Text className="text-base" />  // 16px
<Text className="text-lg" />    // 18px
<Text className="text-xl" />    // 20px
<Text className="text-2xl" />   // 24px
<Text className="text-3xl" />   // 30px
```

### Font Weight

```typescript
<Text className="font-normal" />    // 400
<Text className="font-medium" />    // 500
<Text className="font-semibold" />  // 600
<Text className="font-bold" />      // 700
```

### Text Color

```typescript
<Text className="text-foreground" />       // Primary text
<Text className="text-muted-foreground" /> // Secondary text
<Text className="text-primary" />          // Accent color
<Text className="text-destructive" />      // Error text
```

### Text Alignment

```typescript
<Text className="text-left" />
<Text className="text-center" />
<Text className="text-right" />
```

---

## Sizing

### Width and Height

```typescript
// Width
<View className="w-full" />     // 100%
<View className="w-1/2" />      // 50%
<View className="w-[200px]" />  // Exact width

// Height
<View className="h-full" />
<View className="h-[100px]" />  // Exact height

// Min/Max
<View className="min-h-[200px]" />
<View className="max-w-[400px]" />

// Square (size utility)
<View className="size-10" />    // 40px x 40px
<View className="size-12" />    // 48px x 48px
```

### Flex Sizing

```typescript
// Flex grow
<View className="flex-1" />     // Grow to fill space
<View className="flex-none" />  // Don't grow or shrink

// Self stretch
<View className="self-stretch" />
```

---

## Borders and Rounded Corners

### Borders

```typescript
// Border width
<View className="border" />       // 1px border
<View className="border-2" />     // 2px border
<View className="border-b" />     // Bottom only
<View className="border-t" />     // Top only

// Border color
<View className="border border-border" />
<View className="border border-primary" />
<View className="border border-destructive" />
```

### Border Radius

```typescript
<View className="rounded" />        // 4px
<View className="rounded-md" />     // 6px
<View className="rounded-lg" />     // 8px
<View className="rounded-xl" />     // 12px
<View className="rounded-2xl" />    // 16px
<View className="rounded-full" />   // Circular

// Specific corners
<View className="rounded-t-lg" />   // Top corners
<View className="rounded-b-lg" />   // Bottom corners
```

### Border Radius Scale

| Class | Pixels |
|-------|--------|
| `rounded-sm` | 2px |
| `rounded` | 4px |
| `rounded-md` | 6px |
| `rounded-lg` | 8px |
| `rounded-xl` | 12px |
| `rounded-2xl` | 16px |
| `rounded-3xl` | 24px |
| `rounded-full` | 9999px |

---

## Platform-Specific Styling

### Shadows (iOS vs Android)

React Native handles shadows differently per platform:

```typescript
import { Platform, StyleSheet, View } from 'react-native';

// Using StyleSheet for complex shadows
const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});

// Usage
<View style={styles.shadow} className="bg-card p-4 rounded-lg">
  <Text>Card with shadow</Text>
</View>
```

### NativeWind Shadow Classes

```typescript
// iOS shadow classes (limited on Android)
<View className="shadow-sm" />
<View className="shadow" />
<View className="shadow-md" />
<View className="shadow-lg" />

// Android elevation
<View className="elevation-2" />
<View className="elevation-4" />
```

### Cross-Platform Shadow Pattern

```typescript
import { Platform, StyleSheet, View, Text } from 'react-native';

const shadowStyle = StyleSheet.create({
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
});

export default function Card({ children }) {
  return (
    <View style={shadowStyle.card} className="bg-card p-4 rounded-xl">
      {children}
    </View>
  );
}
```

---

## Touch Feedback

### Active States (Press Feedback)

Unlike web's `hover:`, use `active:` for touch feedback:

```typescript
import { Pressable, Text } from 'react-native';

// NativeWind active states
<Pressable className="p-4 bg-primary rounded-lg active:bg-primary/80 active:scale-[0.98]">
  <Text className="text-primary-foreground text-center font-semibold">
    Press Me
  </Text>
</Pressable>

// Opacity feedback
<Pressable className="p-4 bg-card rounded-lg active:opacity-70">
  <Text>Pressable item</Text>
</Pressable>
```

### Pressable Style Function

```typescript
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    { opacity: pressed ? 0.7 : 1 },
    { transform: [{ scale: pressed ? 0.98 : 1 }] },
  ]}
  className="p-4 bg-primary rounded-lg"
>
  <Text className="text-primary-foreground">Press Me</Text>
</Pressable>
```

---

## Common Component Patterns

### Card Pattern

```typescript
<View className="m-4 p-6 bg-card rounded-xl border border-border">
  <Text className="text-lg font-semibold text-foreground">Title</Text>
  <Text className="text-muted-foreground mt-1">Description</Text>
</View>
```

### Input Pattern

```typescript
import { TextInput } from 'react-native';

<View className="gap-2">
  <Text className="text-sm font-medium text-foreground">Label</Text>
  <TextInput
    className="h-12 px-4 rounded-lg border border-input bg-background text-foreground"
    placeholder="Enter value"
    placeholderTextColor="#9CA3AF"
  />
</View>
```

### Button Pattern

```typescript
// Primary button
<Pressable className="h-12 px-6 bg-primary rounded-lg items-center justify-center active:bg-primary/90">
  <Text className="text-primary-foreground font-semibold">Button</Text>
</Pressable>

// Outline button
<Pressable className="h-12 px-6 border border-input bg-background rounded-lg items-center justify-center active:bg-muted">
  <Text className="text-foreground font-medium">Outline</Text>
</Pressable>
```

### Screen Layout Pattern

```typescript
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView className="flex-1 bg-background">
  {/* Header */}
  <View className="px-4 py-3 border-b border-border">
    <Text className="text-xl font-bold">Screen Title</Text>
  </View>

  {/* Content */}
  <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
    <Text>Content goes here</Text>
  </ScrollView>
</SafeAreaView>
```

---

## Arbitrary Values

### Pixel-Perfect Styling

Use arbitrary values when standard scale doesn't match:

```typescript
// Exact pixel values
<View className="p-[18px]" />
<View className="w-[320px]" />
<View className="rounded-[14px]" />
<Text className="text-[15px]" />
<View className="gap-[10px]" />

// Percentages
<View className="w-[80%]" />

// Colors
<View className="bg-[#3B82F6]" />
<Text className="text-[#1A1A1A]" />
```

---

## What NOT to Do

### Avoid Inline Style Objects (When Possible)

```typescript
// AVOID - Inline style objects for basic styling
<View style={{ padding: 16, marginBottom: 12 }}>
  <Text>Content</Text>
</View>

// PREFERRED - NativeWind classes
<View className="p-4 mb-3">
  <Text>Content</Text>
</View>
```

### When to Use StyleSheet

Use `StyleSheet.create` only for:
- Platform-specific shadows
- Complex animations
- Dynamic values that can't be expressed in classes

```typescript
// OK - Platform-specific code
const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: { shadowColor: '#000', ... },
    android: { elevation: 4 },
  }),
});

// OK - Dynamic values
const dynamicStyle = { width: calculatedWidth };
```

### Avoid Web-Only Classes

```typescript
// AVOID - Web-only features
<View className="grid grid-cols-3" />     // Limited grid support
<View className="hover:bg-primary" />     // No hover on mobile
<View className="cursor-pointer" />       // No cursor on mobile

// PREFERRED - React Native equivalents
<View className="flex-row flex-wrap" />   // Instead of grid
<Pressable className="active:bg-primary" /> // Instead of hover
```

---

## Summary

**Styling Checklist:**

- ✅ Use NativeWind utility classes directly
- ✅ Use `cn()` for conditional class merging
- ✅ Use semantic color variables (`bg-background`, `text-foreground`)
- ✅ Remember React Native defaults to `flex-col`
- ✅ Use `active:` states for touch feedback (not `hover:`)
- ✅ Handle shadows with Platform.select for iOS/Android
- ✅ Use SafeAreaView for screen layouts
- ❌ No CSS Grid (use Flexbox)
- ❌ No hover states (use active states)
- ❌ Avoid inline styles for basic styling

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [figma-to-react-native.md](figma-to-react-native.md) - Pixel-perfect conversion
- [complete-examples.md](complete-examples.md) - Full styling examples
