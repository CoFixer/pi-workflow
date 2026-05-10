# Styling Guide

Modern styling patterns using Tailwind CSS 4, Shadcn/UI, and CSS variables for the ActivityCoaching application.

---

## Core Concepts

### Tailwind CSS 4

The project uses Tailwind CSS 4 with utility-first styling:

```typescript
// Direct utility classes
<div className="p-4 mb-3 flex flex-col gap-2">
  Content
</div>
```

### cn() Utility

Use `cn()` for conditional class merging (combines `clsx` + `tailwind-merge`):

```typescript
import { cn } from '~/lib/utils';

<div className={cn(
  'p-4 bg-background',
  isActive && 'bg-primary text-primary-foreground',
  isDisabled && 'opacity-50 pointer-events-none'
)} />
```

---

## CSS Variables (Theme)

### Available Color Variables

Colors are defined in `~/styles/app.css` using oklch color space:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  /* Chart colors, sidebar colors, etc. */
}
```

### Using Color Variables

```typescript
// Via Tailwind classes (preferred)
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="text-muted-foreground" />
<div className="border-border" />
<div className="bg-destructive" />

// Semantic usage
<p className="text-muted-foreground">Secondary text</p>
<button className="bg-primary text-primary-foreground">Button</button>
<div className="border border-input">Input border</div>
```

---

## Dark Mode

### How Dark Mode Works

Dark mode is activated by adding `.dark` class to the document:

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... other overrides */
}
```

### Dark Mode Variants

```typescript
// Automatic with semantic colors (preferred)
<div className="bg-background text-foreground" />
// Light: white bg, dark text
// Dark: dark bg, light text

// Explicit dark mode variants
<div className="bg-white dark:bg-gray-900" />
<div className="text-gray-900 dark:text-white" />
```

---

## Common Utility Classes

### Spacing

```typescript
// Padding
<div className="p-4" />      // All sides: 1rem (16px)
<div className="px-4" />     // Horizontal: 1rem
<div className="py-4" />     // Vertical: 1rem
<div className="pt-4" />     // Top only: 1rem
<div className="p-2" />      // All sides: 0.5rem (8px)

// Margin
<div className="m-4" />      // All sides
<div className="mx-auto" />  // Center horizontally
<div className="mt-4 mb-2" />

// Gap (for flex/grid)
<div className="gap-4" />    // 1rem gap
<div className="gap-2" />    // 0.5rem gap
```

### Flexbox

```typescript
// Basic flex
<div className="flex" />
<div className="flex flex-col" />
<div className="flex flex-row" />

// Alignment
<div className="flex items-center" />
<div className="flex justify-center" />
<div className="flex justify-between" />
<div className="flex items-center justify-center" />

// Gap
<div className="flex gap-4" />
<div className="flex flex-col gap-2" />

// Common pattern
<div className="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Grid

```typescript
// Basic grid
<div className="grid grid-cols-2 gap-4" />
<div className="grid grid-cols-3 gap-4" />

// Responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// Auto-fit columns
<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4" />
```

### Typography

```typescript
// Font size
<p className="text-sm" />    // 14px
<p className="text-base" />  // 16px
<p className="text-lg" />    // 18px
<p className="text-xl" />    // 20px
<p className="text-2xl" />   // 24px
<p className="text-3xl" />   // 30px

// Font weight
<p className="font-normal" />
<p className="font-medium" />
<p className="font-semibold" />
<p className="font-bold" />

// Text color
<p className="text-foreground" />
<p className="text-muted-foreground" />
<p className="text-primary" />
<p className="text-destructive" />
```

### Sizing

```typescript
// Width
<div className="w-full" />     // 100%
<div className="w-1/2" />      // 50%
<div className="w-auto" />
<div className="max-w-md" />   // max-width: 28rem
<div className="max-w-lg" />   // max-width: 32rem
<div className="max-w-xl" />   // max-width: 36rem

// Height
<div className="h-full" />
<div className="h-screen" />   // 100vh
<div className="min-h-screen" />

// Square
<div className="size-4" />     // 1rem x 1rem
<div className="size-8" />     // 2rem x 2rem
```

### Borders & Rounded

```typescript
// Border
<div className="border" />
<div className="border-2" />
<div className="border border-input" />
<div className="border-b" />  // Bottom only

// Rounded corners
<div className="rounded" />
<div className="rounded-md" />
<div className="rounded-lg" />
<div className="rounded-full" />
```

---

## Responsive Design

### Breakpoints

```typescript
// Tailwind default breakpoints
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach

```typescript
// Start with mobile, add breakpoints for larger
<div className="
  flex flex-col          // Mobile: column layout
  md:flex-row            // Tablet+: row layout
  gap-4
">
  <div className="
    w-full               // Mobile: full width
    md:w-1/2             // Tablet+: half width
  ">
    Column 1
  </div>
  <div className="w-full md:w-1/2">
    Column 2
  </div>
</div>
```

### Common Responsive Patterns

```typescript
// Responsive padding
<div className="p-4 md:p-6 lg:p-8" />

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl" />

// Hide/show on screen sizes
<div className="hidden md:block" />  // Hidden on mobile, visible on tablet+
<div className="md:hidden" />        // Visible on mobile only

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" />
```

---

## Common Component Styling

### Card Pattern

```typescript
<div className="rounded-lg border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Form Input Pattern

```typescript
<div className="space-y-2">
  <label className="text-sm font-medium">Label</label>
  <input className="
    flex h-9 w-full rounded-md border border-input bg-background
    px-3 py-1 text-sm shadow-sm transition-colors
    placeholder:text-muted-foreground
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
  " />
</div>
```

### Button Pattern

```typescript
// Primary button
<button className="
  inline-flex items-center justify-center rounded-md
  bg-primary text-primary-foreground
  h-9 px-4 py-2 text-sm font-medium
  hover:bg-primary/90
  transition-colors
">
  Button
</button>

// Outline button
<button className="
  border border-input bg-background
  hover:bg-accent hover:text-accent-foreground
">
  Outline
</button>
```

### Page Layout Pattern

```typescript
<div className="min-h-screen bg-background">
  <header className="border-b">
    <div className="container mx-auto px-4 py-4">
      Header
    </div>
  </header>

  <main className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">Page Title</h1>
    Content
  </main>
</div>
```

---

## Shadcn/UI Component Styling

### Customizing Shadcn Components

```typescript
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';

// Add custom classes
<Button className="w-full">Full Width Button</Button>

// Conditional classes
<Button className={cn(
  'w-full',
  isLoading && 'opacity-50 cursor-not-allowed'
)}>
  Submit
</Button>

// Override padding
<Card className="p-8">More padding</Card>
```

### CVA Variants

Shadcn/UI components use CVA (Class Variance Authority) for variants:

```typescript
// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Danger</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

---

## What NOT to Do

### Avoid Inline Style Objects

```typescript
// ❌ AVOID - Inline style objects
<div style={{ padding: '16px', marginBottom: '12px' }}>
  Content
</div>

// ✅ PREFERRED - Tailwind classes
<div className="p-4 mb-3">
  Content
</div>
```

### Avoid CSS-in-JS Libraries

```typescript
// ❌ AVOID - styled-components, emotion, etc.
import styled from 'styled-components';

const StyledDiv = styled.div`
  padding: 16px;
`;

// ✅ PREFERRED - Tailwind utility classes
<div className="p-4">Content</div>
```

### Avoid Global CSS (except for themes)

```typescript
// ❌ AVOID - Custom CSS classes in separate files
// styles.css
.my-custom-button { padding: 16px; }

// ✅ PREFERRED - Tailwind classes or CVA variants
<Button className="px-4">Button</Button>
```

---

## Summary

**Styling Checklist:**

- ✅ Use Tailwind CSS utility classes directly
- ✅ Use `cn()` for conditional class merging
- ✅ Use semantic color variables (`bg-background`, `text-foreground`)
- ✅ Mobile-first responsive design
- ✅ Shadcn/UI component variants via CVA
- ✅ Dark mode via CSS variables (automatic)
- ❌ No inline style objects
- ❌ No CSS-in-JS libraries
- ❌ No custom CSS files (except themes)

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full styling examples
