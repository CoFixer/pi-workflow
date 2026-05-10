# Performance Optimization

Patterns for optimizing React Native performance, preventing unnecessary re-renders, and leveraging the New Architecture.

---

## New Architecture Benefits

React Native 0.76+ with the New Architecture provides:

- **Fabric**: New rendering system with synchronous layout
- **TurboModules**: Lazy-loaded native modules
- **JSI**: Direct JavaScript-to-Native communication (no bridge)
- **Concurrent Features**: Improved responsiveness

### Enabling New Architecture

```json
// app.json (Expo)
{
  "expo": {
    "newArchEnabled": true
  }
}
```

```json
// android/gradle.properties (bare React Native)
newArchEnabled=true
```

---

## FlatList Optimization

### Key Props for Performance

```typescript
import { FlatList, View, Text } from 'react-native';

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}

  // Performance props
  removeClippedSubviews={true}           // Unmount off-screen items
  maxToRenderPerBatch={10}               // Items per batch render
  updateCellsBatchingPeriod={50}         // Batch update interval (ms)
  windowSize={21}                        // Render window (screens)
  initialNumToRender={10}                // Initial render count
  getItemLayout={(data, index) => ({     // Skip measurement if fixed height
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}

  // Optimize separator
  ItemSeparatorComponent={Separator}
  ListEmptyComponent={EmptyState}
  ListFooterComponent={Footer}
/>
```

### Memoized Render Item

```typescript
import { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ItemProps {
  item: Item;
  onPress: (id: string) => void;
}

// Memoized list item
const ItemCard = memo(function ItemCard({ item, onPress }: ItemProps) {
  return (
    <Pressable onPress={() => onPress(item.id)} className="p-4 border-b border-border">
      <Text className="text-foreground">{item.name}</Text>
    </Pressable>
  );
});

// Parent component
export default function ItemList() {
  // Stable callback reference
  const handlePress = useCallback((id: string) => {
    console.log('Pressed:', id);
  }, []);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ItemCard item={item} onPress={handlePress} />
      )}
    />
  );
}
```

---

## useMemo for Expensive Computations

### When to Use

Use `useMemo` for:
- Filtering/sorting large arrays
- Complex calculations
- Derived data

```typescript
import { useMemo } from 'react';

interface DataDisplayProps {
  items: Item[];
  searchTerm: string;
}

export default function DataDisplay({ items, searchTerm }: DataDisplayProps) {
  // ✅ CORRECT - Only recalculates when dependencies change
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

  return <FlatList data={filteredItems} /* ... */ />;
}
```

---

## useCallback for Event Handlers

### When to Use

Use `useCallback` for:
- Event handlers passed to child components
- Functions used in dependency arrays
- Callbacks passed to memoized components

```typescript
import { useCallback, useState } from 'react';

export default function Parent() {
  const [items, setItems] = useState<Item[]>([]);

  // ❌ AVOID - Creates new function on every render
  const handleSelect = (id: string) => {
    console.log('Selected:', id);
  };

  // ✅ CORRECT - Stable function reference
  const handleSelect = useCallback((id: string) => {
    console.log('Selected:', id);
  }, []);

  // ✅ CORRECT - With dependencies
  const handleSave = useCallback(() => {
    saveItems(items);
  }, [items]);

  return <ItemList items={items} onSelect={handleSelect} />;
}
```

---

## React.memo for List Items

### When to Use

Use `React.memo` for:
- List item components
- Components that render often with same props
- Pure presentational components

```typescript
import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';

interface ItemCardProps {
  item: Item;
  onSelect: (id: string) => void;
}

// Memoized component
export const ItemCard = memo(function ItemCard({ item, onSelect }: ItemCardProps) {
  return (
    <Pressable onPress={() => onSelect(item.id)} className="p-4">
      <Text className="text-foreground">{item.name}</Text>
    </Pressable>
  );
});

// With custom comparison
export const ItemCardWithCompare = memo(
  function ItemCard({ item, onSelect }: ItemCardProps) {
    return (/* ... */);
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.updatedAt === nextProps.item.updatedAt;
  }
);
```

---

## Animation Performance

### Use Native Driver

```typescript
import { Animated } from 'react-native';

const fadeAnim = new Animated.Value(0);

// ✅ CORRECT - Uses native driver (runs on UI thread)
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Essential for performance
}).start();

// Native driver supports: opacity, transform
// Does NOT support: width, height, margin, padding, colors
```

### Reanimated for Complex Animations

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function AnimatedComponent() {
  // Shared values run on UI thread
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Runs on UI thread - no bridge crossing
    scale.value = withSpring(scale.value === 1 ? 1.2 : 1);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle} className="w-20 h-20 bg-primary rounded-lg" />
    </Pressable>
  );
}
```

---

## Image Optimization

### Use FastImage or expo-image

```bash
npm install expo-image
# or
npm install react-native-fast-image
```

```typescript
import { Image } from 'expo-image';

// ✅ CORRECT - Optimized image loading
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  cachePolicy="memory-disk"
/>

// For local images, use require
<Image
  source={require('@/assets/icon.png')}
  style={{ width: 40, height: 40 }}
/>
```

### Optimize Image Sizes

```typescript
// Request appropriately sized images from server
const imageUrl = `${baseUrl}?width=${screenWidth}&quality=80`;

// Use WebP format when possible (smaller file size)
const webpUrl = imageUrl.replace('.jpg', '.webp');
```

---

## JavaScript Thread Optimization

### Heavy Computation Off Main Thread

```typescript
import { InteractionManager } from 'react-native';

export default function HeavyScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Wait for navigation animation to complete
    InteractionManager.runAfterInteractions(() => {
      // Now safe to do heavy work
      const processed = processLargeDataset(rawData);
      setData(processed);
    });
  }, []);

  return data ? <DataView data={data} /> : <LoadingView />;
}
```

### Avoid Expensive Operations in Render

```typescript
// ❌ AVOID - Expensive in render
function BadComponent({ items }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return <FlatList data={sorted} />;
}

// ✅ CORRECT - Memoized
function GoodComponent({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
  return <FlatList data={sorted} />;
}
```

---

## Memory Management

### Cleanup in useEffect

```typescript
import { useEffect, useState } from 'react';

export default function DataFetcher({ id }: { id: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const result = await api.getData(id, { signal: controller.signal });
        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error(error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  return <DataView data={data} />;
}
```

### Cleanup Timers and Listeners

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Periodic task
  }, 1000);

  const subscription = eventEmitter.addListener('event', handleEvent);

  return () => {
    clearInterval(timer);
    subscription.remove();
  };
}, []);
```

---

## Render Optimization

### Avoid Inline Objects/Functions

```typescript
// ❌ AVOID - Creates new object every render
<View style={{ marginTop: 10 }}>

// ✅ CORRECT - Use NativeWind or StyleSheet
<View className="mt-2.5">

// ❌ AVOID - Creates new function every render
<Pressable onPress={() => handlePress(item.id)}>

// ✅ CORRECT - Stable callback
const handleItemPress = useCallback((id: string) => {
  handlePress(id);
}, [handlePress]);

<Pressable onPress={() => handleItemPress(item.id)}>
```

### Stable Key Props

```typescript
// ✅ CORRECT - Stable unique key
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}

// ❌ AVOID - Index as key (breaks reordering)
{items.map((item, index) => (
  <ItemCard key={index} item={item} />
))}

// ❌ AVOID - Random key (forces re-render)
{items.map((item) => (
  <ItemCard key={Math.random()} item={item} />
))}
```

---

## Hermes Engine Optimization

Hermes is the default JS engine for React Native and provides:
- Faster startup time
- Reduced memory usage
- Smaller app size

### Verify Hermes is Enabled

```typescript
// Check at runtime
const isHermes = () => !!global.HermesInternal;

console.log('Using Hermes:', isHermes());
```

### Hermes-Specific Optimizations

```typescript
// Hermes optimizes for:
// - Object literals
// - Arrow functions
// - Template literals

// ✅ Hermes-friendly
const config = {
  enabled: true,
  timeout: 1000,
};

const handler = (x) => x * 2;

const message = `Hello ${name}`;
```

---

## Profiling Tools

### React DevTools Profiler

```bash
# Start React DevTools
npx react-devtools
```

### Flipper Performance Plugin

- CPU profiler
- Memory profiler
- Network inspector
- Layout inspector

### Console Performance

```typescript
// Measure render time
console.time('render');
// ... render logic
console.timeEnd('render');

// Log component updates
useEffect(() => {
  console.log('Component updated:', Date.now());
});
```

---

## Summary

**React Native Performance Checklist:**

- ✅ Enable New Architecture (0.76+)
- ✅ Use `FlatList` with performance props for lists
- ✅ Memoize list items with `React.memo`
- ✅ Use `useMemo` for expensive computations
- ✅ Use `useCallback` for handlers passed to children
- ✅ Use `useNativeDriver: true` for Animated
- ✅ Use Reanimated for complex animations
- ✅ Use expo-image or FastImage
- ✅ Defer heavy work with `InteractionManager`
- ✅ Clean up effects (timers, subscriptions, fetches)
- ✅ Avoid inline objects/functions in JSX
- ✅ Use stable keys in lists
- ✅ Profile with React DevTools and Flipper

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [common-patterns.md](common-patterns.md) - Animation patterns
