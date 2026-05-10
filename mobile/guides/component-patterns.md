# Component Patterns

Modern React Native component architecture using React Native Paper, NativeWind, and TypeScript.

---

## Function Component Pattern (PREFERRED)

### Why Function Components

All components use function components with TypeScript for:

- Explicit type safety for props
- Consistent component signatures
- Clear prop interface documentation
- Better IDE autocomplete

### Basic Pattern

```typescript
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';

interface MyComponentProps {
  /** User ID to display */
  userId: number;
  /** Optional callback when action occurs */
  onAction?: () => void;
}

export default function MyComponent({ userId, onAction }: MyComponentProps) {
  return (
    <View className="p-4">
      <Text className="text-foreground">User: {userId}</Text>
      <Button mode="contained" onPress={onAction}>
        Action
      </Button>
    </View>
  );
}
```

**Key Points:**

- Props interface defined separately with JSDoc comments
- Destructure props in parameters
- Default export at bottom
- Use NativeWind classes for styling
- Use React Native Paper components for UI elements

---

## React Native Paper Component Usage

### Available Components

React Native Paper provides Material Design components:

```typescript
// Buttons
import { Button, FAB, IconButton } from 'react-native-paper';

// Forms
import { TextInput, Checkbox, Switch, RadioButton } from 'react-native-paper';

// Cards & Containers
import { Card, Surface } from 'react-native-paper';

// Feedback
import { Snackbar, Dialog, Portal, ActivityIndicator } from 'react-native-paper';

// Navigation
import { Appbar, BottomNavigation } from 'react-native-paper';

// Lists
import { List, Divider } from 'react-native-paper';
```

### Button Component

```typescript
import { Button } from 'react-native-paper';

// Modes
<Button mode="contained">Primary</Button>
<Button mode="outlined">Outlined</Button>
<Button mode="text">Text Button</Button>
<Button mode="elevated">Elevated</Button>
<Button mode="contained-tonal">Tonal</Button>

// With icon
<Button icon="camera" mode="contained">Take Photo</Button>

// States
<Button disabled>Disabled</Button>
<Button loading={isLoading}>Submit</Button>

// Full width
<Button mode="contained" style={{ width: '100%' }}>Full Width</Button>
```

### Card Component

```typescript
import { Card, Text } from 'react-native-paper';

<Card className="m-4 rounded-xl">
  <Card.Cover source={{ uri: imageUrl }} />
  <Card.Title title="Card Title" subtitle="Subtitle" />
  <Card.Content>
    <Text>Card content goes here</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Cancel</Button>
    <Button mode="contained">Confirm</Button>
  </Card.Actions>
</Card>
```

### TextInput Component

```typescript
import { TextInput } from 'react-native-paper';

// Outlined style (recommended)
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  keyboardType="email-address"
  autoCapitalize="none"
/>

// Flat style
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  mode="flat"
  secureTextEntry
  right={<TextInput.Icon icon="eye" />}
/>
```

### List Component

```typescript
import { List, Divider } from 'react-native-paper';

<List.Section>
  <List.Subheader>Settings</List.Subheader>
  <List.Item
    title="Notifications"
    description="Manage notification preferences"
    left={(props) => <List.Icon {...props} icon="bell" />}
    onPress={handleNotifications}
  />
  <Divider />
  <List.Item
    title="Privacy"
    left={(props) => <List.Icon {...props} icon="lock" />}
    onPress={handlePrivacy}
  />
</List.Section>
```

---

## cn() Utility for Class Merging

### What is cn()

`cn()` combines `clsx` and `tailwind-merge` for conditional class merging with NativeWind:

```typescript
// ~/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Usage Examples

```typescript
import { View, Text } from 'react-native';
import { cn } from '~/lib/utils';

// Conditional classes
<View className={cn(
  'p-4 bg-background',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50'
)} />

// Array of conditions
<Text className={cn([
  'text-base',
  isError && 'text-destructive',
  isSuccess && 'text-green-600',
])}>
  Status message
</Text>
```

---

## Component Structure Template

### Recommended Order

```typescript
import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Redux
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';

// UI Components
import { Button, Card } from 'react-native-paper';

// Utilities
import { cn } from '~/lib/utils';

// Types
import type { User } from '~/types/user';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 1. PROPS INTERFACE (with JSDoc)
interface MyComponentProps {
  /** The ID of the entity to display */
  entityId: number;
  /** Optional callback when action completes */
  onComplete?: () => void;
  /** Display mode */
  mode?: 'view' | 'edit';
}

// 2. COMPONENT DEFINITION
export default function MyComponent({
  entityId,
  onComplete,
  mode = 'view',
}: MyComponentProps) {
  // 3. HOOKS (in this order)
  // - Navigation hooks
  const navigation = useNavigation();

  // - Redux hooks
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const loading = useAppSelector((state) => state.user.loading);

  // - Local state
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');

  // - Memoized values
  const filteredData = useMemo(() => {
    return data.filter((item) => item.active);
  }, [data]);

  // - Effects
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  // 4. EVENT HANDLERS (with useCallback for passed handlers)
  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItem(itemId);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Save logic
      onComplete?.();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }, [onComplete]);

  // 5. RENDER
  return (
    <Card className="m-4">
      <Card.Title title="My Component" />
      <Card.Content className="gap-4">
        <Text className={cn('text-muted-foreground', loading && 'opacity-50')}>
          {user?.email}
        </Text>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={loading}
          loading={loading}
        >
          Save
        </Button>
      </Card.Content>
    </Card>
  );
}
```

---

## React Native Core Components

### View vs ScrollView vs SafeAreaView

```typescript
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// View - Basic container (does not scroll)
<View className="flex-1 p-4">
  <Text>Fixed content</Text>
</View>

// ScrollView - For scrollable content
<ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
  <Text>Scrollable content</Text>
</ScrollView>

// SafeAreaView - Handles notches and safe areas
<SafeAreaView className="flex-1 bg-background">
  <View className="flex-1 p-4">
    <Text>Safe content</Text>
  </View>
</SafeAreaView>
```

### FlatList for Lists

```typescript
import { FlatList, View, Text, Pressable } from 'react-native';

interface Item {
  id: string;
  title: string;
}

interface ItemListProps {
  items: Item[];
  onItemPress: (item: Item) => void;
}

export default function ItemList({ items, onItemPress }: ItemListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerClassName="p-4 gap-3"
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onItemPress(item)}
          className="p-4 bg-card rounded-lg active:opacity-70"
        >
          <Text className="text-foreground font-medium">{item.title}</Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-muted-foreground">No items found</Text>
        </View>
      }
    />
  );
}
```

### Pressable with Feedback

```typescript
import { Pressable, Text } from 'react-native';

// NativeWind active state
<Pressable
  onPress={handlePress}
  className="p-4 bg-primary rounded-lg active:bg-primary/80 active:scale-[0.98]"
>
  <Text className="text-primary-foreground font-semibold text-center">
    Press Me
  </Text>
</Pressable>

// With custom feedback using style function
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    { opacity: pressed ? 0.7 : 1 },
  ]}
  className="p-4 bg-primary rounded-lg"
>
  <Text className="text-primary-foreground">Press Me</Text>
</Pressable>
```

---

## Component Separation

### When to Split Components

**Split into multiple components when:**

- Component exceeds 200 lines
- Multiple distinct responsibilities
- Reusable sections
- Complex nested JSX

**Example:**

```typescript
// AVOID - Monolithic
function MassiveScreen() {
  // 500+ lines
  // Header logic
  // Form logic
  // List logic
  // Modal logic
}

// PREFERRED - Modular
function Screen() {
  return (
    <SafeAreaView className="flex-1">
      <ScreenHeader />
      <SearchForm onSearch={handleSearch} />
      <ItemList data={filteredData} />
      <ActionModal visible={isOpen} onClose={handleClose} />
    </SafeAreaView>
  );
}
```

### When to Keep Together

**Keep in same file when:**

- Component < 100 lines
- Tightly coupled logic
- Not reusable elsewhere
- Simple presentation component

---

## Platform-Specific Patterns

### Platform Detection

```typescript
import { Platform, View, Text } from 'react-native';

// Conditional rendering
<View>
  {Platform.OS === 'ios' && <Text>iOS only content</Text>}
  {Platform.OS === 'android' && <Text>Android only content</Text>}
</View>

// Platform.select for values
const styles = {
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
};
```

### Platform-Specific Files

```
components/
├── Button.tsx          # Shared logic
├── Button.ios.tsx      # iOS-specific implementation
└── Button.android.tsx  # Android-specific implementation
```

React Native automatically imports the correct file based on platform.

---

## Component Communication

### Props Down, Events Up

```typescript
// Parent
function Parent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Child
      data={data}           // Props down
      onSelect={setSelectedId}  // Events up
    />
  );
}

// Child
interface ChildProps {
  data: Data[];
  onSelect: (id: string) => void;
}

export default function Child({ data, onSelect }: ChildProps) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item.id)}>
          <Text>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}
```

### Using Redux for Shared State

```typescript
// When state needs to be shared across components
import { useAppDispatch, useAppSelector } from '~/redux/store/hooks';
import { selectItem } from '~/redux/features/itemSlice';

function Child() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.item.selectedId);

  const handleSelect = (id: string) => {
    dispatch(selectItem(id));
  };

  return (
    <Pressable onPress={() => handleSelect('123')}>
      <Text>Select</Text>
    </Pressable>
  );
}
```

---

## Screen Component Pattern

### Standard Screen Template

```typescript
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  loading?: boolean;
}

export default function Screen({
  children,
  scrollable = true,
  loading = false,
}: ScreenProps) {
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

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

---

## Summary

**Modern Component Recipe:**

1. Function components with TypeScript props interface
2. React Native Paper components for UI elements
3. `cn()` utility for conditional NativeWind classes
4. NativeWind for styling
5. `useAppSelector` and `useAppDispatch` for Redux
6. Event handlers with `useCallback` when passed to children
7. Default export at bottom
8. Platform-specific handling when needed

**See Also:**

- [styling-guide.md](styling-guide.md) - NativeWind patterns
- [navigation-guide.md](navigation-guide.md) - React Navigation setup
- [common-patterns.md](common-patterns.md) - Form patterns
- [complete-examples.md](complete-examples.md) - Full working examples
