# Figma to Tailwind Reference Tables

Comprehensive reference for mapping Figma design properties to Tailwind CSS classes.

## Table of Contents

- [Layout Properties](#layout-properties)
- [Sizing Properties](#sizing-properties)
- [Spacing Scale Reference](#spacing-scale-reference)
- [Visual Properties](#visual-properties)
- [Border Radius Scale](#border-radius-scale)
- [Typography Properties](#typography-properties)
- [Font Size Scale](#font-size-scale)
- [Font Weight Scale](#font-weight-scale)
- [Shadcn/UI Component Mapping](#shadcnui-component-mapping)
- [Color Conversion](#color-conversion)
- [Utility Functions](#utility-functions)
- [Common Patterns](#common-patterns)

---

## Layout Properties

| Figma Property | Tailwind Class | Notes |
|----------------|----------------|-------|
| `layoutMode: "HORIZONTAL"` | `flex flex-row` | Auto-layout horizontal |
| `layoutMode: "VERTICAL"` | `flex flex-col` | Auto-layout vertical |
| `itemSpacing: 8` | `gap-2` or `gap-[8px]` | Gap between items |
| `paddingLeft/Right/Top/Bottom` | `p-{n}`, `px-{n}`, `py-{n}` | Use exact values |
| `primaryAxisAlignItems: "CENTER"` | `justify-center` | Main axis alignment |
| `counterAxisAlignItems: "CENTER"` | `items-center` | Cross axis alignment |
| `layoutGrow: 1` | `flex-1` | Flex grow |
| `layoutAlign: "STRETCH"` | `self-stretch` | Align self |

---

## Sizing Properties

| Figma Property | Tailwind Class | Notes |
|----------------|----------------|-------|
| `width: 100` | `w-[100px]` | Fixed width - use exact value |
| `height: 48` | `h-[48px]` or `h-12` | Fixed height |
| `constraints.horizontal: "SCALE"` | `w-full` | Full width |
| `minWidth: 200` | `min-w-[200px]` | Minimum width |
| `maxWidth: 400` | `max-w-[400px]` | Maximum width |

---

## Spacing Scale Reference

| Pixels | Tailwind | Pixels | Tailwind |
|--------|----------|--------|----------|
| 4px | 1 | 48px | 12 |
| 8px | 2 | 64px | 16 |
| 12px | 3 | 80px | 20 |
| 16px | 4 | 96px | 24 |
| 20px | 5 | 128px | 32 |
| 24px | 6 | 160px | 40 |
| 32px | 8 | 192px | 48 |

**Note:** For non-standard values, ALWAYS use `[Xpx]` syntax for pixel-perfect results.

---

## Visual Properties

| Figma Property | Tailwind Class | Notes |
|----------------|----------------|-------|
| `cornerRadius: 8` | `rounded-lg` or `rounded-[8px]` | Border radius |
| `fills[0].color` | `bg-{color}` or `bg-[#hex]` | Background color |
| `strokes[0].color` | `border-{color}` | Border color |
| `strokeWeight: 1` | `border` | Border width |
| `effects[0].type: "DROP_SHADOW"` | `shadow-{size}` | Shadow |
| `opacity: 0.5` | `opacity-50` | Opacity |

---

## Border Radius Scale

| Pixels | Tailwind |
|--------|----------|
| 2px | `rounded-sm` |
| 4px | `rounded` |
| 6px | `rounded-md` |
| 8px | `rounded-lg` |
| 12px | `rounded-xl` |
| 16px | `rounded-2xl` |
| 24px | `rounded-3xl` |
| 9999px | `rounded-full` |

---

## Typography Properties

| Figma Property | Tailwind Class | Notes |
|----------------|----------------|-------|
| `fontSize: 14` | `text-sm` or `text-[14px]` | Font size |
| `fontWeight: 600` | `font-semibold` | Font weight |
| `lineHeightPx: 20` | `leading-5` or `leading-[20px]` | Line height |
| `letterSpacing: 0.5` | `tracking-wide` or `tracking-[0.5px]` | Letter spacing |
| `textAlignHorizontal: "CENTER"` | `text-center` | Text alignment |

---

## Font Size Scale

| Pixels | Tailwind |
|--------|----------|
| 12px | `text-xs` |
| 14px | `text-sm` |
| 16px | `text-base` |
| 18px | `text-lg` |
| 20px | `text-xl` |
| 24px | `text-2xl` |
| 30px | `text-3xl` |

---

## Font Weight Scale

| Weight | Tailwind |
|--------|----------|
| 100 | `font-thin` |
| 300 | `font-light` |
| 400 | `font-normal` |
| 500 | `font-medium` |
| 600 | `font-semibold` |
| 700 | `font-bold` |
| 800 | `font-extrabold` |

---

## Shadcn/UI Component Mapping

Map Figma patterns to existing Shadcn/UI components:

| Figma Pattern | Shadcn/UI Component | Import |
|---------------|---------------------|--------|
| Button with text | `Button` | `~/components/ui/button` |
| Text input field | `Input` | `~/components/ui/input` |
| Card container | `Card`, `CardContent`, `CardHeader` | `~/components/ui/card` |
| Form with labels | `Form`, `FormField`, `FormItem` | `~/components/ui/form` |
| Modal/overlay | `Dialog`, `DialogContent` | `~/components/ui/dialog` |
| Dropdown menu | `DropdownMenu` | `~/components/ui/dropdown-menu` |
| Select field | `Select`, `SelectTrigger`, `SelectContent` | `~/components/ui/select` |
| Checkbox | `Checkbox` | `~/components/ui/checkbox` |
| Switch/toggle | `Switch` | `~/components/ui/switch` |
| Avatar | `Avatar`, `AvatarImage`, `AvatarFallback` | `~/components/ui/avatar` |
| Badge/tag | `Badge` | `~/components/ui/badge` |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `~/components/ui/tabs` |
| Tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent` | `~/components/ui/tooltip` |

---

## Color Conversion

### Figma RGBA to CSS

```typescript
function figmaColorToCSS(color: { r: number; g: number; b: number; a?: number }): string {
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

### Mapping to Theme Colors

When Figma colors match theme colors, use semantic classes:

| Figma Color Name | Tailwind Class |
|------------------|----------------|
| Primary | `bg-primary`, `text-primary` |
| Secondary | `bg-secondary`, `text-secondary` |
| Destructive/Error | `bg-destructive`, `text-destructive` |
| Muted | `bg-muted`, `text-muted-foreground` |
| Accent | `bg-accent`, `text-accent-foreground` |
| Background | `bg-background` |
| Foreground | `text-foreground` |
| Border | `border-border` |

### Custom Colors - EXACT Values

For pixel-perfect implementation, use exact hex values:

```tsx
// Use exact Figma color values
<div className="bg-[#3B82F6]" />

// With opacity
<div className="bg-[#3B82F6]/80" />

// Project-specific colors (from tailwind config)
<div className="bg-orange text-white" />
<div className="text-title" />
<div className="text-body" />
```

---

## Utility Functions

### Pixel to Tailwind Spacing (Exact Match Only)

```typescript
function pxToTailwind(px: number): string {
  const scale: Record<number, string> = {
    4: '1', 8: '2', 12: '3', 16: '4', 20: '5',
    24: '6', 32: '8', 40: '10', 48: '12', 64: '16',
  };
  // Return exact value if not in scale
  return scale[px] ?? `[${px}px]`;
}
```

### Corner Radius to Tailwind (Exact Match Only)

```typescript
function radiusToTailwind(radius: number): string {
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
<div className="p-[18px] gap-[14px] rounded-[10px]" />

// Avoid - Approximating to standard scale
<div className="p-4 gap-3.5 rounded-lg" />
```

### DO: Use Shadcn/UI Components When Matching
```tsx
// Good - Use existing components
import { Button } from '~/components/ui/button';
<Button variant="default">Click me</Button>

// Avoid - Recreating from scratch unless necessary
```

### DO: Use cn() for Conditional Styles
```tsx
// Good
<div className={cn("base-classes", isActive && "active-classes")} />

// Avoid - Template literals
<div className={`base-classes ${isActive ? 'active-classes' : ''}`} />
```

### DO: Compare With Screenshot
```tsx
// ALWAYS verify against Figma screenshot
// 1. Get screenshot via MCP
// 2. Implement component
// 3. View side-by-side
// 4. Adjust any differences
```
