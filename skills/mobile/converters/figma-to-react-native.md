# Figma to React Native Conversion Guide

Convert Figma designs to **pixel-perfect** React Native components using Figma MCP server, with full integration into the project's NativeWind (Tailwind CSS for RN), React Native Paper, and TypeScript patterns.

---

## When to Use This Guide

- Converting Figma designs directly to React Native components
- Implementing UI from Figma mockups for mobile apps
- Extracting design tokens from Figma
- Building component libraries from design systems
- Ensuring pixel-perfect implementations for iOS and Android
- Handling platform-specific design differences

---

## Figma MCP Server Tools

The Figma MCP server provides direct access to design data through 6 specialized tools.

### Tool Overview

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `get_design_context` | Get structured design representation | **PRIMARY** - First tool for fetching design data |
| `get_screenshot` | Capture visual screenshot | **ALWAYS** - For visual comparison |
| `get_metadata` | Get sparse XML structure | When response is too large |
| `get_variable_defs` | Get design tokens | For colors, spacing, typography |
| `create_design_system_rules` | Generate design system rules | New project setup |
| `get_figjam` | Get FigJam board content | FigJam files only |

---

## Pre-Implementation Checklist (REQUIRED)

**Before creating ANY new component or screen**, you MUST check for existing implementations.

### Step 1: Identify Target Project Structure

| Directory | Purpose | Example Files |
|-----------|---------|---------------|
| `src/screens/` | Screen components | `HomeScreen.tsx`, `LoginScreen.tsx` |
| `src/components/` | Reusable components | `Button.tsx`, `Card.tsx` |
| `src/components/common/` | Shared components | `LoadingSpinner.tsx`, `Avatar.tsx` |
| `src/navigation/` | Navigation configuration | `AppNavigator.tsx`, `AuthStack.tsx` |

### Step 2: Check Existing Components

**Always search for existing components before creating new ones.**

#### Common React Native Paper Components

| Component | Import | Description |
|-----------|--------|-------------|
| `Button` | `react-native-paper` | Material Design buttons |
| `Card` | `react-native-paper` | Content containers |
| `TextInput` | `react-native-paper` | Form inputs with labels |
| `Avatar` | `react-native-paper` | User avatars |
| `Chip` | `react-native-paper` | Selection chips |
| `FAB` | `react-native-paper` | Floating action buttons |
| `Snackbar` | `react-native-paper` | Toast notifications |
| `Dialog` | `react-native-paper` | Modal dialogs |
| `Menu` | `react-native-paper` | Dropdown menus |
| `ActivityIndicator` | `react-native-paper` | Loading spinners |

### Step 3: Check Existing Screens

Review the `src/screens/` directory for existing implementations before creating new screens.

### Step 4: Component Discovery Commands

```bash
# Find existing components by name pattern
ls src/components/
ls src/components/common/
ls src/screens/

# Search for specific component implementations
grep -r "export.*Button" src/components/
grep -r "export.*Card" src/components/
```

### Step 5: Reuse Decision

Before creating new components, ask:

1. **Does a React Native Paper component match?** -> Use it directly
2. **Does an existing custom component match?** -> Use it
3. **Does an existing component almost match?** -> Extend it with props
4. **Is this truly unique?** -> Create new component following existing patterns

```tsx
// GOOD: Reuse React Native Paper components
import { Button, Card } from 'react-native-paper';
<Button mode="contained" onPress={handlePress}>Submit</Button>
<Card><Card.Content>Content</Card.Content></Card>

// GOOD: Reuse existing custom components
import CustomButton from '~/components/CustomButton';
<CustomButton variant="primary" size="lg">Submit</CustomButton>

// AVOID: Creating duplicate components
// Don't create MyButton.tsx if Button exists
// Don't create CustomCard.tsx if Card.tsx exists
```

---

## Tool 1: get_design_context (PRIMARY TOOL)

**Purpose**: Get structured design representation with all properties needed for React Native implementation.

**Function**: `mcp__figma__get_design_context`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID (e.g., "123:456" or "123-456"). Uses current selection if omitted |
| `artifactType` | string | No | Type: `WEB_PAGE_OR_APP_SCREEN`, `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN`, `REUSABLE_COMPONENT`, `DESIGN_SYSTEM` |
| `taskType` | string | No | Task: `CREATE_ARTIFACT`, `CHANGE_ARTIFACT`, `DELETE_ARTIFACT` |
| `forceCode` | boolean | No | Force code output even for large designs |
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- **First call** when implementing any Figma design
- Getting full component properties (layout, colors, typography, spacing)
- Understanding component hierarchy and structure
- Extracting exact values for pixel-perfect implementation

### Example Usage

```
// From Figma URL: https://figma.com/design/ABC123/MyFile?node-id=1-2
// Extract nodeId: "1:2" (replace hyphen with colon)

mcp__figma__get_design_context
  nodeId: "1:2"
  artifactType: "WEB_PAGE_OR_APP_SCREEN"
  taskType: "CREATE_ARTIFACT"
  clientLanguages: "typescript"
  clientFrameworks: "react-native"
```

### Node ID Extraction from URLs

```
URL formats:
- https://www.figma.com/file/{file_key}/{file_name}?node-id={node_id}
- https://www.figma.com/design/{file_key}/{file_name}?node-id={node_id}

Node ID conversion:
- URL format: node-id=123-456 (hyphen)
- MCP format: nodeId: "123:456" (colon)
```

### Response Contains

- Layout properties (flex direction, alignment, gaps)
- Sizing (width, height, min/max constraints)
- Spacing (padding, margins)
- Typography (font size, weight, line height, letter spacing)
- Colors (fills, strokes, effects)
- Border radius and shadows
- Component hierarchy

---

## Tool 2: get_screenshot (ALWAYS USE)

**Purpose**: Capture visual screenshot for side-by-side comparison during implementation.

**Function**: `mcp__figma__get_screenshot`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID. Uses current selection if omitted |
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- **ALWAYS** - Before and during implementation
- Visual verification of pixel-perfect accuracy
- Comparing implementation against design
- Documenting the target design

### Why Essential

Screenshots are **critical** for pixel-perfect implementation because:
1. Design context may not capture every visual nuance
2. Visual comparison catches subtle differences
3. Ensures exact spacing, alignment, and proportions
4. Catches issues that numeric values might miss

### Example Usage

```
mcp__figma__get_screenshot
  nodeId: "1:2"
  clientFrameworks: "react-native"
```

---

## Tool 3: get_metadata

**Purpose**: Get sparse XML structure with layer IDs, names, positions, and sizes.

**Function**: `mcp__figma__get_metadata`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID or page ID (e.g., "0:1" for page) |
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- When `get_design_context` response is too large or truncated
- Getting overview of complex screen structure
- Finding specific node IDs within a large design
- Understanding layer hierarchy before deep diving

### Workflow for Large Designs

1. Call `get_metadata` first to get structure overview
2. Identify specific node IDs you need
3. Call `get_design_context` on individual nodes

### Example Usage

```
// Get page structure first
mcp__figma__get_metadata
  nodeId: "0:1"  // Page ID

// Then fetch specific components
mcp__figma__get_design_context
  nodeId: "123:456"  // Specific node from metadata
```

---

## Tool 4: get_variable_defs

**Purpose**: Get design token definitions (colors, spacing, typography variables).

**Function**: `mcp__figma__get_variable_defs`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID to get variables for |
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- Extracting design system tokens
- Getting semantic color names and values
- Understanding spacing scale
- Typography variable definitions

### Response Format

```json
{
  "icon/default/secondary": "#949494",
  "text/primary": "#1A1A1A",
  "spacing/md": "16px",
  "font/body": "Inter"
}
```

### Example Usage

```
mcp__figma__get_variable_defs
  nodeId: "1:2"
```

---

## Tool 5: create_design_system_rules

**Purpose**: Generate design system context rules for your project.

**Function**: `mcp__figma__create_design_system_rules`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- Setting up new projects
- Creating design system documentation
- Establishing component patterns

### Example Usage

```
mcp__figma__create_design_system_rules
  clientLanguages: "typescript"
  clientFrameworks: "react-native"
```

---

## Tool 6: get_figjam

**Purpose**: Get content from FigJam boards (whiteboard/brainstorming files).

**Function**: `mcp__figma__get_figjam`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID in FigJam file |
| `includeImagesOfNodes` | boolean | No | Include node images (default: true) |
| `clientLanguages` | string | No | e.g., "typescript" |
| `clientFrameworks` | string | No | e.g., "react-native" |

### When to Use

- **Only for FigJam files** (not regular Figma design files)
- Extracting wireframes from whiteboard sessions
- Getting brainstorm content
- Workflow diagrams

### URL Pattern for FigJam

```
FigJam URL: https://figma.com/board/{fileKey}/{fileName}?node-id=1-2
(Note: "board" instead of "design" or "file")
```

### Example Usage

```
mcp__figma__get_figjam
  nodeId: "1:2"
  includeImagesOfNodes: true
```

---

## Pixel-Perfect Implementation Guidelines

### CRITICAL: Pixel-Perfect Requirements

1. **ALWAYS get a screenshot** using `get_screenshot` MCP tool
2. **Match exact pixel values** - Use NativeWind arbitrary values `[Xpx]` when standard scale doesn't match
3. **Compare side-by-side** - View your implementation against the Figma screenshot
4. **No rounding** - If Figma says `17px`, use `[17px]`, not `text-base` (16px)
5. **Consider platform differences** - iOS and Android may render slightly differently

### Exact Value Mapping

```tsx
// WRONG - Approximating values
<View className="p-4 gap-2" />  // 16px, 8px

// CORRECT - Exact Figma values with NativeWind
<View className="p-[18px] gap-[10px]" />  // Matches Figma exactly
```

### Pixel-Perfect Checklist

- [ ] **Spacing**: Padding, margin, gap match exactly (use `[Xpx]` if needed)
- [ ] **Typography**: Font size, weight, line-height exact
- [ ] **Colors**: Use exact hex values from Figma, not approximations
- [ ] **Sizing**: Width, height values exact
- [ ] **Border radius**: Exact corner radius values
- [ ] **Shadows**: Match shadow settings exactly (note: shadows differ on iOS vs Android)
- [ ] **Layout**: Flex direction, alignment, justify match Figma auto-layout
- [ ] **Screenshot comparison**: Visually compare implementation to design
- [ ] **Platform testing**: Test on both iOS and Android

### When Standard NativeWind Values Match

Use standard classes ONLY when they match Figma exactly:

| Figma Value | Use Standard Class |
|-------------|-------------------|
| 16px padding | `p-4` |
| 17px padding | `p-[17px]` (NOT `p-4`) |
| 14px font | `text-sm` |
| 15px font | `text-[15px]` (NOT `text-sm`) |

---

## Figma Property to NativeWind Mapping

### Layout Properties (Flexbox)

| Figma Property | NativeWind Class | Notes |
|----------------|------------------|-------|
| `layoutMode: "HORIZONTAL"` | `flex-row` | Auto-layout horizontal |
| `layoutMode: "VERTICAL"` | `flex-col` | Auto-layout vertical (default in RN) |
| `itemSpacing: 8` | `gap-2` or `gap-[8px]` | Gap between items |
| `paddingLeft/Right/Top/Bottom` | `p-{n}`, `px-{n}`, `py-{n}` | Use exact values |
| `primaryAxisAlignItems: "CENTER"` | `justify-center` | Main axis alignment |
| `counterAxisAlignItems: "CENTER"` | `items-center` | Cross axis alignment |
| `layoutGrow: 1` | `flex-1` | Flex grow |
| `layoutAlign: "STRETCH"` | `self-stretch` | Align self |

**Note:** React Native uses `flexDirection: 'column'` by default (unlike web's row).

### Sizing Properties

| Figma Property | NativeWind Class | Notes |
|----------------|------------------|-------|
| `width: 100` | `w-[100px]` | Fixed width |
| `height: 48` | `h-[48px]` or `h-12` | Fixed height |
| `constraints.horizontal: "SCALE"` | `w-full` | Full width |
| `minWidth: 200` | `min-w-[200px]` | Minimum width |
| `maxWidth: 400` | `max-w-[400px]` | Maximum width |

### Spacing Scale Reference

| Pixels | NativeWind | Pixels | NativeWind |
|--------|------------|--------|------------|
| 4px | 1 | 48px | 12 |
| 8px | 2 | 64px | 16 |
| 12px | 3 | 80px | 20 |
| 16px | 4 | 96px | 24 |
| 20px | 5 | 128px | 32 |
| 24px | 6 | 160px | 40 |
| 32px | 8 | 192px | 48 |

**Note:** For non-standard values, ALWAYS use `[Xpx]` syntax for pixel-perfect results.

### Visual Properties

| Figma Property | NativeWind Class | Notes |
|----------------|------------------|-------|
| `cornerRadius: 8` | `rounded-lg` or `rounded-[8px]` | Border radius |
| `fills[0].color` | `bg-{color}` or `bg-[#hex]` | Background color |
| `strokes[0].color` | `border-{color}` | Border color |
| `strokeWeight: 1` | `border` | Border width |
| `effects[0].type: "DROP_SHADOW"` | See Shadow section | Shadow (platform-specific) |
| `opacity: 0.5` | `opacity-50` | Opacity |

### Border Radius Scale

| Pixels | NativeWind |
|--------|------------|
| 2px | `rounded-sm` |
| 4px | `rounded` |
| 6px | `rounded-md` |
| 8px | `rounded-lg` |
| 12px | `rounded-xl` |
| 16px | `rounded-2xl` |
| 24px | `rounded-3xl` |
| 9999px | `rounded-full` |

### Typography Properties

| Figma Property | NativeWind Class | Notes |
|----------------|------------------|-------|
| `fontSize: 14` | `text-sm` or `text-[14px]` | Font size |
| `fontWeight: 600` | `font-semibold` | Font weight |
| `lineHeightPx: 20` | `leading-5` or `leading-[20px]` | Line height |
| `letterSpacing: 0.5` | `tracking-wide` or `tracking-[0.5px]` | Letter spacing |
| `textAlignHorizontal: "CENTER"` | `text-center` | Text alignment |

### Font Size Scale

| Pixels | NativeWind |
|--------|----------|
| 12px | `text-xs` |
| 14px | `text-sm` |
| 16px | `text-base` |
| 18px | `text-lg` |
| 20px | `text-xl` |
| 24px | `text-2xl` |
| 30px | `text-3xl` |

### Font Weight Scale

| Weight | NativeWind |
|--------|----------|
| 100 | `font-thin` |
| 300 | `font-light` |
| 400 | `font-normal` |
| 500 | `font-medium` |
| 600 | `font-semibold` |
| 700 | `font-bold` |
| 800 | `font-extrabold` |

---

## Platform-Specific Considerations

### Shadows (iOS vs Android)

React Native handles shadows differently on each platform:

**iOS (shadow properties):**
```tsx
// Using NativeWind with iOS shadow classes
<View className="shadow-lg" />

// Or StyleSheet for complex shadows
const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});
```

**Android (elevation):**
```tsx
// NativeWind elevation
<View className="elevation-4" />

// Or StyleSheet
const styles = StyleSheet.create({
  shadow: {
    elevation: 4,
  },
});
```

**Cross-Platform Shadow Pattern:**
```tsx
import { Platform, StyleSheet } from 'react-native';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
});
```

### Safe Areas

Always account for device notches and safe areas:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Screen content */}
    </SafeAreaView>
  );
}
```

### Status Bar

```tsx
import { StatusBar } from 'react-native';

<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
```

---

## React Native Paper Component Mapping

Map Figma patterns to React Native Paper components:

| Figma Pattern | React Native Paper Component | Import |
|---------------|------------------------------|--------|
| Button with text | `Button` | `react-native-paper` |
| Text input field | `TextInput` | `react-native-paper` |
| Card container | `Card`, `Card.Content`, `Card.Title` | `react-native-paper` |
| Modal/dialog | `Dialog`, `Portal` | `react-native-paper` |
| Dropdown menu | `Menu` | `react-native-paper` |
| Checkbox | `Checkbox` | `react-native-paper` |
| Switch/toggle | `Switch` | `react-native-paper` |
| Avatar | `Avatar.Image`, `Avatar.Text` | `react-native-paper` |
| Badge/chip | `Chip`, `Badge` | `react-native-paper` |
| Bottom tabs | React Navigation `BottomTabNavigator` | `@react-navigation/bottom-tabs` |
| App bar | `Appbar`, `Appbar.Header` | `react-native-paper` |
| List items | `List.Item`, `List.Section` | `react-native-paper` |
| Progress indicator | `ActivityIndicator`, `ProgressBar` | `react-native-paper` |
| Snackbar/toast | `Snackbar` | `react-native-paper` |

### Button Component Usage

```tsx
import { Button } from 'react-native-paper';

// Variants
<Button mode="contained">Primary</Button>
<Button mode="outlined">Outlined</Button>
<Button mode="text">Text Button</Button>
<Button mode="elevated">Elevated</Button>
<Button mode="contained-tonal">Tonal</Button>

// With icon
<Button icon="camera" mode="contained">Take Photo</Button>

// Loading state
<Button loading={isLoading} disabled={isLoading}>Submit</Button>
```

### Card Component Usage

```tsx
import { Card } from 'react-native-paper';

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

### TextInput Component Usage

```tsx
import { TextInput } from 'react-native-paper';

// Outlined style
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

---

## Color Conversion

### Figma RGBA to React Native

```typescript
function figmaColorToRN(color: { r: number; g: number; b: number; a?: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a ?? 1;

  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
```

### Using Theme Colors

When using NativeWind with a theme:

```tsx
// Using theme colors via NativeWind classes
<View className="bg-background" />
<Text className="text-foreground" />
<Text className="text-primary" />
<Text className="text-muted-foreground" />

// Using exact hex values
<View className="bg-[#3B82F6]" />
<Text className="text-[#1A1A1A]" />
```

### Custom Colors

```tsx
// With opacity using NativeWind
<View className="bg-[#3B82F6]/80" />

// Theme colors
<View className="bg-primary" />
<Text className="text-destructive" />
```

---

## Complete Conversion Workflow

### Phase 1: Design Analysis (REQUIRED)

1. **Get design context via MCP**
   ```
   mcp__figma__get_design_context
     nodeId: "extracted-from-url"
     artifactType: "WEB_PAGE_OR_APP_SCREEN"
     clientFrameworks: "react-native"
   ```

2. **Get screenshot for visual reference**
   ```
   mcp__figma__get_screenshot
     nodeId: "same-node-id"
   ```

3. **If response too large or truncated**
   ```
   mcp__figma__get_metadata
     nodeId: "parent-or-page-id"
   ```
   Then fetch specific nodes individually.

4. **Extract design tokens (if needed)**
   ```
   mcp__figma__get_variable_defs
     nodeId: "same-node-id"
   ```

5. **Identify components and variants**
   - Note all design variants (pressed, disabled states)
   - Check for existing React Native Paper components that match
   - Document color values and typography used

### Phase 2: Structure Setup

1. Create screen/component file with TypeScript
2. Define props interface with JSDoc comments
3. Identify dynamic vs static content
4. Map Figma layers to React Native component hierarchy
5. Consider platform-specific requirements (iOS/Android)

### Phase 3: Pixel-Perfect Styling

1. **Extract exact values** from Figma design context
2. **Use arbitrary values** `[Xpx]` for non-standard spacing
3. **Match colors exactly** - Use `bg-[#hex]` for custom colors
4. **Handle shadows** - Use platform-specific shadow patterns
5. **Compare with screenshot** - Visual comparison is mandatory

### Phase 4: Integration & Verification

1. Replace with React Native Paper components where applicable
2. Add proper TypeScript types
3. Handle safe areas and platform differences
4. **Visual comparison** - Side-by-side with Figma screenshot on both platforms
5. Test on physical devices when possible

---

## Example: Pixel-Perfect Card Component

### Figma Design Properties (from get_design_context)

```json
{
  "name": "ProductCard",
  "type": "FRAME",
  "layoutMode": "VERTICAL",
  "itemSpacing": 18,
  "paddingLeft": 20,
  "paddingRight": 20,
  "paddingTop": 24,
  "paddingBottom": 20,
  "cornerRadius": 14,
  "width": 320,
  "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
  "effects": [{ "type": "DROP_SHADOW", "radius": 12, "offset": { "x": 0, "y": 4 } }]
}
```

### Generated React Native Component (Pixel-Perfect)

```tsx
import { View, Text, Image, Platform, StyleSheet } from 'react-native';

interface ProductCardProps {
  title: string;
  price: string;
  imageUrl: string;
}

export default function ProductCard({
  title,
  price,
  imageUrl,
}: ProductCardProps) {
  return (
    <View
      className="w-[320px] flex-col gap-[18px] px-[20px] pt-[24px] pb-[20px] bg-white rounded-[14px]"
      style={styles.shadow}
    >
      <View className="aspect-video w-full overflow-hidden rounded-[10px]">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <Text className="text-[18px] font-semibold leading-[24px] text-foreground">
        {title}
      </Text>
      <Text className="text-[16px] font-medium text-[#6B7280]">
        {price}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: Platform.select({
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
```

---

## React Native-Specific Patterns

### Screen Component Pattern

```tsx
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function Screen({ children, scrollable = true }: ScreenProps) {
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

### List Component Pattern

```tsx
import { FlatList, View, Text } from 'react-native';

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

```tsx
import { Pressable, Text } from 'react-native';

<Pressable
  onPress={handlePress}
  className="p-4 bg-primary rounded-lg active:bg-primary/80 active:scale-[0.98]"
>
  <Text className="text-primary-foreground font-semibold text-center">
    Press Me
  </Text>
</Pressable>
```

---

## Conversion Checklist

### Phase 1: Design Analysis
- [ ] Get Figma design context via MCP (`get_design_context`)
- [ ] Get screenshot via MCP (`get_screenshot`)
- [ ] If response large, use `get_metadata` first
- [ ] Note all design variants (pressed, disabled states)
- [ ] Check for existing React Native Paper components that match
- [ ] Document exact color values and typography

### Phase 2: Structure Setup
- [ ] Create component file with TypeScript
- [ ] Define props interface with JSDoc comments
- [ ] Identify dynamic vs static content
- [ ] Map Figma layers to React Native component hierarchy
- [ ] Plan for platform-specific needs (iOS/Android)

### Phase 3: Pixel-Perfect Styling
- [ ] Convert layout (auto-layout to flex) with exact gaps
- [ ] Convert spacing with exact values (use `[Xpx]`)
- [ ] Convert colors with exact hex values
- [ ] Convert typography with exact sizes
- [ ] Handle shadows with platform-specific code

### Phase 4: Integration & Verification
- [ ] Replace with React Native Paper components where applicable
- [ ] Add proper TypeScript types
- [ ] Handle safe areas (notches, bottom bars)
- [ ] **VISUAL COMPARISON** with Figma screenshot on both platforms
- [ ] Test on physical devices when possible
- [ ] Test component interactions (press states, etc.)

---

## Utility Functions

### Pixel to NativeWind Spacing (Exact Match Only)

```typescript
function pxToNativeWind(px: number): string {
  const scale: Record<number, string> = {
    4: '1', 8: '2', 12: '3', 16: '4', 20: '5',
    24: '6', 32: '8', 40: '10', 48: '12', 64: '16',
  };
  // Return exact value if not in scale
  return scale[px] ?? `[${px}px]`;
}
```

### Corner Radius to NativeWind (Exact Match Only)

```typescript
function radiusToNativeWind(radius: number): string {
  if (radius >= 9999) return 'rounded-full';
  const scale: Record<number, string> = {
    2: 'rounded-sm', 4: 'rounded', 6: 'rounded-md',
    8: 'rounded-lg', 12: 'rounded-xl', 16: 'rounded-2xl',
  };
  // Return exact value if not in scale
  return scale[radius] ?? `rounded-[${radius}px]`;
}
```

---

## Common Patterns

### DO: Use Exact Figma Values
```tsx
// Good - Exact values from Figma
<View className="p-[18px] gap-[14px] rounded-[10px]" />

// Avoid - Approximating to standard scale
<View className="p-4 gap-3.5 rounded-lg" />
```

### DO: Use React Native Paper When Matching
```tsx
// Good - Use existing components
import { Button, Card } from 'react-native-paper';
<Button mode="contained">Click me</Button>

// Avoid - Recreating from scratch unless necessary
```

### DO: Handle Platform Differences
```tsx
// Good - Platform-specific code
import { Platform } from 'react-native';

const shadowStyle = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.1, ... },
  android: { elevation: 4 },
});
```

### DO: Compare With Screenshot
```tsx
// ALWAYS verify against Figma screenshot
// 1. Get screenshot via MCP
// 2. Implement component
// 3. View side-by-side on both iOS and Android
// 4. Adjust any differences
```

---

## Troubleshooting

### MCP Tool Issues

| Issue | Solution |
|-------|----------|
| MCP not responding | Check `claude mcp list` - ensure figma server is connected |
| No design context | Ensure you have the correct Figma URL with node-id |
| Response too large | Use `get_metadata` first, then fetch specific nodes |
| Node not found | Verify node ID format (use colon `:` for MCP, hyphen `-` in URLs) |
| No variables returned | Design may not have variables defined - use explicit colors |

### Node ID Format Issues

| Context | Format | Example |
|---------|--------|---------|
| Figma URL | Hyphen | `node-id=123-456` |
| MCP Tools | Colon | `nodeId: "123:456"` |

**Conversion**: Replace hyphen `-` with colon `:` when extracting from URL.

### Common React Native Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Shadow not showing (Android) | Missing elevation | Add `elevation` property |
| Shadow not showing (iOS) | Missing backgroundColor | Add `backgroundColor` to view |
| Text cut off | Missing `numberOfLines` | Add `numberOfLines` prop or flexible height |
| Layout broken | Wrong flex direction | Remember RN defaults to `flexDirection: 'column'` |
| Image not displaying | Missing dimensions | Specify `width` and `height` for Image |

### Common MCP Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Node not found" | Invalid node ID | Check URL, verify node exists |
| "File not accessible" | Permission issue | Ensure Figma file is shared/accessible |
| "Response truncated" | Design too complex | Use `get_metadata` first |
| Empty response | No selection | Specify `nodeId` parameter |

---

## See Also

- [Component Patterns](component-patterns.md) - React Native component architecture
- [Styling Guide](styling-guide.md) - NativeWind patterns
- [Navigation Guide](navigation-guide.md) - React Navigation setup
- [TypeScript Standards](typescript-standards.md) - Type definitions
- [Common Patterns](common-patterns.md) - Reusable patterns
- [Complete Examples](complete-examples.md) - Full working examples

## Sources

- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Guide to the Figma MCP server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native Paper Documentation](https://callstack.github.io/react-native-paper/)
