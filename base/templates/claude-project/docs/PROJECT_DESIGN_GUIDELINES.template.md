# Design Guidelines - {PROJECT_NAME}

**Last Updated:** {DATE}
**Source:** Extracted from HTML prototypes in `.project/resources/HTML/`

This document provides comprehensive design system guidelines extracted from your HTML prototypes. Use this as the single source of truth for maintaining design consistency across React components during HTML-to-React conversion.

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Typography System](#2-typography-system)
3. [Spacing & Layout](#3-spacing--layout)
4. [Border Radius System](#4-border-radius-system)
5. [Shadow & Elevation](#5-shadow--elevation)
6. [Interactive States](#6-interactive-states)
7. [Animation & Transitions](#7-animation--transitions)
8. [Component Patterns](#8-component-patterns)
9. [Icon System](#9-icon-system)
10. [Responsive Breakpoints](#10-responsive-breakpoints)
11. [HR Lines & Dividers](#11-hr-lines--dividers)
12. [Form Elements](#12-form-elements)
13. [Accessibility Guidelines](#13-accessibility-guidelines)

---

## 1. Color System

### 1.1 Primary Colors

| Color Name | Hex Value | Tailwind Class | Usage |
|------------|-----------|----------------|-------|
| Primary | [EXTRACTED] | `bg-primary`, `text-primary`, `border-primary` | Main CTA buttons, links, active states |
| Primary Dark | [EXTRACTED] | `bg-primaryDark`, `hover:bg-primaryDark` | Button hover states, pressed states |
| Primary Light | [EXTRACTED] | `bg-primaryLight` | Backgrounds, subtle highlights, selected items |

### 1.2 Semantic Colors

| Color Name | Hex Value | Tailwind Class | Usage |
|------------|-----------|----------------|-------|
| Success | [EXTRACTED] | `bg-emerald-500`, `text-emerald-600` | Success messages, positive indicators |
| Warning | [EXTRACTED] | `bg-amber-500`, `text-amber-600` | Warning messages, caution states |
| Error | [EXTRACTED] | `bg-red-500`, `text-red-600` | Error messages, destructive actions |
| Info | [EXTRACTED] | `bg-blue-500`, `text-blue-600` | Info messages, neutral highlights |

### 1.3 Neutral Palette

| Color Name | Hex Value | Tailwind Class | Usage |
|------------|-----------|----------------|-------|
| Dark | [EXTRACTED] | `bg-slate-900`, `text-slate-900` | Dark backgrounds (admin sidebar), headings |
| Slate 850 | [EXTRACTED] | `bg-slate-850` | Secondary dark backgrounds |
| Gray 700 | [EXTRACTED] | `text-gray-700` | Body text, labels |
| Gray 600 | [EXTRACTED] | `text-gray-600` | Secondary text |
| Gray 400 | [EXTRACTED] | `text-gray-400`, `placeholder-gray-400` | Placeholders, muted text |
| Gray 200 | [EXTRACTED] | `border-gray-200` | Borders, dividers |
| Gray 100 | [EXTRACTED] | `bg-gray-100` | Light backgrounds |
| Gray 50 | [EXTRACTED] | `bg-gray-50` | Subtle backgrounds, hover states |
| White | `#FFFFFF` | `bg-white`, `text-white` | Backgrounds, button text |

### 1.4 State-Specific Colors

| State | Base Color | Hover | Focus | Active | Disabled |
|-------|------------|-------|-------|--------|----------|
| Primary Button | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] |
| Secondary Button | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] |
| Input Field | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | - | [EXTRACTED] |
| Link | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] |

### 1.5 Color Usage Guidelines

- **Primary Color**: Use for main actions, CTAs, and brand elements
- **Semantic Colors**: Reserve for status indicators and alerts
- **Neutral Grays**: Use for text hierarchy, backgrounds, and UI structure
- **Avoid Hardcoding**: Always use Tailwind classes or CSS custom properties, never hardcode hex values in components

---

## 2. Typography System

### 2.1 Font Families

| Type | Font Family | Weights Available | Tailwind Class |
|------|-------------|-------------------|----------------|
| Primary | [EXTRACTED from HTML] | 400, 500, 600, 700, 800 | `font-sans` |
| Monospace | [EXTRACTED or Mono] | 400, 500, 600 | `font-mono` |

**CDN Link:** [EXTRACTED from HTML <link> tags]

### 2.2 Font Size Scale

| Size Name | Size (px/rem) | Line Height | Tailwind Class | Usage |
|-----------|---------------|-------------|----------------|-------|
| xs | 12px / 0.75rem | 1rem | `text-xs` | Fine print, badges, labels |
| sm | 14px / 0.875rem | 1.25rem | `text-sm` | Secondary text, table data |
| base | 16px / 1rem | 1.5rem | `text-base` | Body text, default |
| lg | 18px / 1.125rem | 1.75rem | `text-lg` | Emphasis text, small headings |
| xl | 20px / 1.25rem | 1.75rem | `text-xl` | Card titles, section headings |
| 2xl | 24px / 1.5rem | 2rem | `text-2xl` | Page headings, modal titles |
| 3xl | 30px / 1.875rem | 2.25rem | `text-3xl` | Large headings |
| 4xl | 36px / 2.25rem | 2.5rem | `text-4xl` | Hero headings |

### 2.3 Font Weight Scale

| Weight Name | Numeric Value | Tailwind Class | Usage |
|-------------|---------------|----------------|-------|
| Normal | 400 | `font-normal` | Body text, paragraphs |
| Medium | 500 | `font-medium` | Labels, emphasized text |
| Semibold | 600 | `font-semibold` | Headings, buttons, strong emphasis |
| Bold | 700 | `font-bold` | Primary headings, important CTAs |
| Extrabold | 800 | `font-extrabold` | Hero text, major headings |

### 2.4 Letter Spacing & Line Height

| Property | Value | Tailwind Class | Usage |
|----------|-------|----------------|-------|
| Tight Tracking | -0.025em | `tracking-tight` | Large headings |
| Normal Tracking | 0 | `tracking-normal` | Body text |
| Wide Tracking | 0.05em | `tracking-wide` | Uppercase labels, buttons |
| Normal Leading | 1.5 | `leading-normal` | Default line height |
| Relaxed Leading | 1.75 | `leading-relaxed` | Readable paragraphs |

### 2.5 Typography Usage Guidelines

- **Headings**: Use semibold (600) or bold (700) weights with appropriate size scale
- **Body Text**: Use normal (400) weight at `text-base` size
- **Labels**: Use medium (500) weight at `text-xs` or `text-sm` size
- **Buttons**: Use semibold (600) weight with wide tracking

---

## 3. Spacing & Layout

### 3.1 Spacing Scale

| Size | Value (px/rem) | Tailwind Class | Usage |
|------|----------------|----------------|-------|
| 0 | 0 | `p-0`, `m-0` | Reset spacing |
| 1 | 4px / 0.25rem | `p-1`, `m-1`, `gap-1` | Minimal spacing, tight layouts |
| 2 | 8px / 0.5rem | `p-2`, `m-2`, `gap-2` | Small spacing |
| 3 | 12px / 0.75rem | `p-3`, `m-3`, `gap-3` | Compact spacing |
| 4 | 16px / 1rem | `p-4`, `m-4`, `gap-4` | Standard spacing |
| 5 | 20px / 1.25rem | `p-5`, `m-5`, `gap-5` | Medium spacing |
| 6 | 24px / 1.5rem | `p-6`, `m-6`, `gap-6` | Comfortable spacing (common default) |
| 8 | 32px / 2rem | `p-8`, `m-8`, `gap-8` | Large spacing |
| 10 | 40px / 2.5rem | `p-10`, `m-10`, `gap-10` | Extra large spacing |
| 12 | 48px / 3rem | `p-12`, `m-12`, `gap-12` | Section spacing |
| 16 | 64px / 4rem | `p-16`, `m-16` | Major section dividers |
| 20 | 80px / 5rem | `p-20`, `m-20` | Hero section spacing |
| 24 | 96px / 6rem | `p-24`, `m-24` | Major layout spacing |

### 3.2 Container Max-Widths

| Breakpoint | Max Width | Tailwind Class | Usage |
|------------|-----------|----------------|-------|
| Default | 100% | `max-w-full` | Full width containers |
| SM | 640px | `max-w-sm` | Narrow content |
| MD | 768px | `max-w-md` | Medium modals, forms |
| LG | 1024px | `max-w-lg` | Standard content |
| XL | 1280px | `max-w-xl` | Wide content |
| 2XL | 1536px | `max-w-2xl` | Very wide content |
| 7XL | 1280px | `max-w-7xl` | Main content container (common) |
| Custom | [EXTRACTED] | `max-w-[1200px]` | Project-specific max width |

### 3.3 Component-Specific Spacing

| Component | Padding | Margin | Gap | Notes |
|-----------|---------|--------|-----|-------|
| Page Container | `px-6` or `px-8` | - | - | Horizontal padding on main containers |
| Card | `p-6` | `mb-4` or `mb-6` | - | Standard card padding |
| Button | `px-6 py-3` | - | - | Medium button padding |
| Input | `px-4 py-3` | `mb-4` | - | Standard input padding |
| Section | `mb-8` to `mb-12` | - | - | Section bottom margins |
| Flex/Grid Gap | - | - | `gap-4` to `gap-6` | Standard grid gaps |

### 3.4 Layout Patterns

**Common Page Layout:**
```
Container (max-w-7xl mx-auto px-6)
  └─ Section (mb-8)
       └─ Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
            └─ Card (p-6 rounded-xl)
```

---

## 4. Border Radius System

### 4.1 Radius Levels

| Level | Value (px) | Tailwind Class | Usage |
|-------|------------|----------------|-------|
| None | 0 | `rounded-none` | Sharp corners, strict layouts |
| SM | 2px | `rounded-sm` | Subtle rounding |
| Default | 4px | `rounded` | Minimal rounding |
| MD | 6px | `rounded-md` | Input fields, small buttons |
| LG | 8px | `rounded-lg` | Standard buttons, badges |
| XL | 12px | `rounded-xl` | Cards, modals, large components |
| 2XL | 16px | `rounded-2xl` | Feature cards, hero sections |
| 3XL | 24px | `rounded-3xl` | Special emphasis cards |
| Full | 9999px | `rounded-full` | Circular buttons, avatars, pills |

### 4.2 Component Radius Mappings

| Component | Border Radius | Tailwind Class | Notes |
|-----------|---------------|----------------|-------|
| Button | [EXTRACTED] | `rounded-lg` or `rounded-xl` | Consistent with design |
| Input | [EXTRACTED] | `rounded-md` or `rounded-lg` | Slightly less than buttons |
| Card | [EXTRACTED] | `rounded-xl` or `rounded-2xl` | Prominent rounding |
| Modal | [EXTRACTED] | `rounded-xl` or `rounded-2xl` | Large, prominent |
| Badge/Pill | [EXTRACTED] | `rounded-full` | Fully rounded |
| Avatar | [EXTRACTED] | `rounded-full` | Circular |
| Image | [EXTRACTED] | `rounded-lg` or `rounded-xl` | Within cards |
| Dropdown | [EXTRACTED] | `rounded-lg` | Consistent with buttons |

---

## 5. Shadow & Elevation

### 5.1 Shadow Levels

| Level | CSS Shadow Value | Tailwind Class | Usage |
|-------|------------------|----------------|-------|
| None | `none` | `shadow-none` | Flat UI, no elevation |
| Subtle | [EXTRACTED] | `shadow-sm` or `shadow-subtle` | Minimal lift, hover state prep |
| Card | [EXTRACTED] | `shadow` or `shadow-card` | Default card elevation |
| Medium | [EXTRACTED] | `shadow-md` | Raised cards, dropdowns |
| Large | [EXTRACTED] | `shadow-lg` | Floating elements, hover states |
| Float | [EXTRACTED] | `shadow-xl` or `shadow-float` | Modals, popovers, prominent elements |
| Overlay | [EXTRACTED] | `shadow-2xl` | Top-level overlays, dialogs |

### 5.2 Custom Shadow Definitions

**From Tailwind Config (if extracted):**
```javascript
boxShadow: {
  'subtle': '[EXTRACTED]',
  'card': '[EXTRACTED]',
  'float': '[EXTRACTED]',
}
```

### 5.3 Z-Index Hierarchy

| Layer | Z-Index | Tailwind Class | Usage |
|-------|---------|----------------|-------|
| Base | 0 | `z-0` | Default layer, page content |
| Raised | 10 | `z-10` | Sticky headers, navigation bars |
| Dropdown | 20 | `z-20` | Dropdown menus, tooltips |
| Overlay | 30 | `z-30` | Overlays, side panels |
| Modal | 40 | `z-40` | Modal dialogs |
| Popover | 50 | `z-50` | Popovers, toasts, notifications |
| Tooltip | 60 | `z-60` | Tooltips |

---

## 6. Interactive States

### 6.1 Button States

| State | Background | Border | Text | Shadow | Transform | Cursor | Tailwind Classes |
|-------|------------|--------|------|--------|-----------|--------|------------------|
| **Default** | [EXTRACTED] | [EXTRACTED] | white | [EXTRACTED] | none | pointer | `bg-primary text-white shadow` |
| **Hover** | [EXTRACTED] | - | white | [EXTRACTED] | - | pointer | `hover:bg-primaryDark hover:shadow-lg` |
| **Focus** | [EXTRACTED] | [EXTRACTED] | white | ring | - | pointer | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
| **Active** | [EXTRACTED] | - | white | [EXTRACTED] | [EXTRACTED] | pointer | `active:scale-[0.99]` |
| **Disabled** | [EXTRACTED] | - | white | none | none | not-allowed | `disabled:opacity-50 disabled:cursor-not-allowed` |

**Transition:** [EXTRACTED or transition-all duration-200 ease-in-out]

### 6.2 Input Field States

| State | Border | Background | Ring | Placeholder | Tailwind Classes |
|-------|--------|------------|------|-------------|------------------|
| **Default** | [EXTRACTED] | white | none | [EXTRACTED] | `border-gray-200 bg-white placeholder-gray-400` |
| **Hover** | [EXTRACTED] | white | - | [EXTRACTED] | `hover:border-gray-300` |
| **Focus** | [EXTRACTED] | white | [EXTRACTED] | [EXTRACTED] | `focus:border-primary focus:ring-2 focus:ring-primary` |
| **Error** | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | `border-red-500 focus:ring-red-500` |
| **Disabled** | [EXTRACTED] | [EXTRACTED] | none | [EXTRACTED] | `disabled:bg-gray-100 disabled:cursor-not-allowed` |

### 6.3 Card States

| State | Border | Shadow | Transform | Background | Tailwind Classes |
|-------|--------|--------|-----------|------------|------------------|
| **Default** | [EXTRACTED] | [EXTRACTED] | none | white | `border border-gray-200 shadow-card bg-white` |
| **Hover** | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | white | `hover:shadow-lg hover:scale-[1.02]` |
| **Selected** | [EXTRACTED] | [EXTRACTED] | - | [EXTRACTED] | `border-primary bg-primaryLight` |

### 6.4 Link States

| State | Color | Text Decoration | Transform | Tailwind Classes |
|-------|-------|-----------------|-----------|------------------|
| **Default** | [EXTRACTED] | none | none | `text-primary` |
| **Hover** | [EXTRACTED] | underline | - | `hover:text-primaryDark hover:underline` |
| **Focus** | [EXTRACTED] | - | - | `focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded` |
| **Visited** | [EXTRACTED] | - | - | `visited:text-purple-600` |

### 6.5 Icon Button States

| State | Background | Icon Color | Scale | Tailwind Classes |
|-------|------------|------------|-------|------------------|
| **Default** | transparent | [EXTRACTED] | none | `bg-transparent text-gray-600` |
| **Hover** | [EXTRACTED] | [EXTRACTED] | - | `hover:bg-gray-100 hover:text-primary` |
| **Focus** | [EXTRACTED] | [EXTRACTED] | - | `focus:ring-2 focus:ring-primary` |
| **Active** | [EXTRACTED] | [EXTRACTED] | [EXTRACTED] | `active:scale-95` |
| **Disabled** | transparent | [EXTRACTED] | none | `disabled:opacity-40 disabled:cursor-not-allowed` |

---

## 7. Animation & Transitions

### 7.1 Timing Functions

| Name | Cubic Bezier | Tailwind Class | Usage |
|------|--------------|----------------|-------|
| Linear | `cubic-bezier(0, 0, 1, 1)` | `ease-linear` | Constant speed, loading indicators |
| Ease In-Out | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out` | Default transitions, smooth start & end |
| Ease In | `cubic-bezier(0.4, 0, 1, 1)` | `ease-in` | Acceleration, items leaving |
| Ease Out | `cubic-bezier(0, 0, 0.2, 1)` | `ease-out` | Deceleration, items entering |

### 7.2 Duration Scale

| Duration | Value (ms) | Tailwind Class | Usage |
|----------|------------|----------------|-------|
| Instant | 0ms | `duration-0` | Immediate changes |
| Fast | 100ms | `duration-100` | Quick micro-interactions |
| Quick | 150ms | `duration-150` | Button presses, toggles |
| Standard | [EXTRACTED or 200ms] | `duration-200` | **Default transition** - most UI interactions |
| Medium | [EXTRACTED or 300ms] | `duration-300` | Dropdown, modal open/close |
| Slow | [EXTRACTED or 500ms] | `duration-500` | Large layout changes, page transitions |
| Slower | 700ms | `duration-700` | Emphasis animations, hero effects |

### 7.3 Transition Properties

| Property | Tailwind Class | Usage |
|----------|----------------|-------|
| All | `transition-all` | Transition all properties (use sparingly) |
| Colors | `transition-colors` | Background, text, border color changes |
| Opacity | `transition-opacity` | Fade in/out effects |
| Transform | `transition-transform` | Scale, rotate, translate effects |
| Shadow | `transition-shadow` | Shadow changes on hover |

### 7.4 Common Animation Patterns

| Animation | Tailwind Classes | Usage |
|-----------|------------------|-------|
| Fade In | `opacity-0 hover:opacity-100 transition-opacity duration-300` | Reveal on hover |
| Scale Up | `hover:scale-105 transition-transform duration-200` | Card hover effect |
| Scale Down | `active:scale-95 transition-transform duration-150` | Button press effect |
| Slide In (X) | `translate-x-full transition-transform duration-300` | Slide-in panel |
| Slide In (Y) | `-translate-y-2 hover:translate-y-0 transition-transform` | Lift on hover |
| Bounce | `animate-bounce` | Scroll indicators, loading |

### 7.5 Standard Component Transitions

| Component | Transition Properties | Duration | Easing | Tailwind Classes |
|-----------|----------------------|----------|--------|------------------|
| Button | colors, shadow | [EXTRACTED or 200ms] | ease-in-out | `transition-all duration-200 ease-in-out` |
| Link | colors | 200ms | ease-in-out | `transition-colors duration-200` |
| Card | shadow, transform | [EXTRACTED or 300ms] | ease-out | `transition-all duration-300 ease-out` |
| Input | border, ring | 200ms | ease-in-out | `transition-all duration-200` |
| Dropdown | opacity, transform | 300ms | ease-out | `transition-all duration-300 ease-out` |
| Modal | opacity, scale | 300ms | ease-out | `transition-all duration-300` |

---

## 8. Component Patterns

### 8.1 Navigation Patterns

#### Horizontal Navbar (Attendee/User)
```
- Position: Sticky top (sticky top-0 z-10)
- Height: [EXTRACTED or 72px]
- Background: white with shadow
- Layout: flex items-center justify-between px-6
- Logo: Left side
- Nav Links: Center or right
- User Menu: Right side
```

**Tailwind Pattern:**
```html
<nav class="sticky top-0 z-10 bg-white shadow h-[72px] px-6 flex items-center justify-between">
```

#### Sidebar Navigation (Organizer/Admin)
```
- Position: Fixed left
- Width: [EXTRACTED or 240px]
- Background: [EXTRACTED - white for organizer, dark #1E293B for admin]
- Active State: [EXTRACTED - bg-blue-50 text-primary for organizer, bg-primary text-white for admin]
- Inactive State: [EXTRACTED - text-gray-600 for organizer, text-slate-300 for admin]
```

**Tailwind Pattern (Organizer):**
```html
<aside class="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-200">
  <a class="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50">
  <a class="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary"><!-- Active -->
```

**Tailwind Pattern (Admin - Dark):**
```html
<aside class="fixed left-0 top-0 h-screen w-[240px] bg-slate-900">
  <a class="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800">
  <a class="flex items-center gap-3 px-4 py-3 bg-primary text-white"><!-- Active -->
```

### 8.2 Card Patterns

#### Standard Card
```
- Border: border border-gray-200
- Radius: [EXTRACTED or rounded-xl]
- Padding: p-6
- Shadow: shadow-card
- Background: bg-white
```

**Tailwind Pattern:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-card">
```

#### Interactive Card (Clickable)
```
- Add hover state: hover:shadow-lg transition-all duration-300
- Add scale: hover:scale-[1.02]
- Add cursor: cursor-pointer
```

**Tailwind Pattern:**
```html
<div class="bg-white border border-gray-200 rounded-xl p-6 shadow-card hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
```

### 8.3 Button Patterns

#### Primary Button
```
- Background: bg-primary
- Text: text-white
- Padding: px-6 py-3
- Radius: rounded-lg
- Font: font-semibold
- States: hover:bg-primaryDark, focus:ring-2, active:scale-[0.99], disabled:opacity-50
```

**Tailwind Pattern:**
```html
<button class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primaryDark focus:ring-2 focus:ring-primary active:scale-[0.99] disabled:opacity-50 transition-all duration-200">
```

#### Secondary Button
```
- Background: bg-white
- Text: text-gray-700
- Border: border border-gray-200
- Padding: px-6 py-3
- States: hover:bg-gray-50, focus:ring-2
```

**Tailwind Pattern:**
```html
<button class="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-primary transition-all duration-200">
```

### 8.4 Form Patterns

#### Text Input
```
- Height: h-12 (48px)
- Padding: px-4
- Border: border border-gray-200
- Radius: rounded-md or rounded-lg
- States: focus:border-primary focus:ring-2 focus:ring-primary
```

**Tailwind Pattern:**
```html
<input type="text" class="w-full h-12 px-4 border border-gray-200 rounded-lg placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200" />
```

#### Label
```
- Size: text-xs or text-sm
- Weight: font-medium
- Color: text-gray-700
- Margin: mb-2 ml-1
```

**Tailwind Pattern:**
```html
<label class="block text-xs font-medium text-gray-700 mb-2 ml-1">
```

### 8.5 Modal Patterns

```
- Container: Fixed overlay with backdrop
- Background: rgba(0,0,0,0.5) backdrop-blur
- Content: bg-white rounded-2xl max-w-md mx-auto p-6
- Position: Centered (flex items-center justify-center)
- Z-Index: z-50
```

**Tailwind Pattern:**
```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
    <!-- Modal content -->
  </div>
</div>
```

### 8.6 Badge/Pill Patterns

```
- Display: inline-flex items-center
- Padding: px-2 py-1 or px-3 py-1
- Radius: rounded-full
- Size: text-xs
- Weight: font-medium
```

**Status Badge Examples:**
```html
<!-- Success -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">

<!-- Warning -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">

<!-- Error -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
```

### 8.7 Table Patterns

```
- Header: sticky top-0 z-10 bg-gray-50 font-semibold text-left
- Row: hover:bg-gray-50 transition-colors
- Cell Padding: px-4 py-3 or px-6 py-4
- Border: border-b border-gray-200
```

**Tailwind Pattern:**
```html
<table class="w-full">
  <thead class="bg-gray-50 sticky top-0 z-10">
    <tr>
      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">
  </thead>
  <tbody>
    <tr class="hover:bg-gray-50 transition-colors border-b border-gray-200">
      <td class="px-6 py-4 text-sm text-gray-700">
```

### 8.8 Dropdown Menu Patterns

```
- Container: Relative positioning
- Menu: Absolute, top-full, right-0, mt-2
- Background: bg-white
- Border: border border-gray-200 rounded-lg
- Shadow: shadow-lg
- Padding: py-2
```

**Tailwind Pattern:**
```html
<div class="relative">
  <button>Dropdown</button>
  <div class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
    <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Item</a>
  </div>
</div>
```

---

## 9. Icon System

### 9.1 Icon Library

**Library:** [EXTRACTED - Iconify, Lucide, Heroicons, etc.]
**CDN:** [EXTRACTED from HTML <script> tags]

### 9.2 Icon Sizes

| Size Name | Dimensions | Tailwind/Attribute | Usage |
|-----------|------------|-------------------|-------|
| Small | 16x16px | `w-4 h-4` or `data-width="16"` | Inline text icons, small buttons |
| Medium | 20x20px | `w-5 h-5` or `data-width="20"` | Default icon size, navigation |
| Large | 24x24px | `w-6 h-6` or `data-width="24"` | Prominent icons, large buttons |
| XLarge | 32x32px | `w-8 h-8` or `data-width="32"` | Feature icons, hero sections |

### 9.3 Icon Color Mappings

| Usage | Color Class | Notes |
|-------|-------------|-------|
| Inherit Text | `text-inherit` or no class | Match surrounding text color |
| Primary | `text-primary` | Branded icons, active states |
| Secondary | `text-gray-600` | Default icon color |
| Muted | `text-gray-400` | Disabled, inactive icons |
| White | `text-white` | Icons on dark backgrounds |

### 9.4 Icon Usage Patterns

**In Buttons:**
```html
<button class="flex items-center gap-2">
  <svg class="w-5 h-5" data-icon="lucide:plus"></svg>
  <span>Add Item</span>
</button>
```

**Icon-Only Buttons:**
```html
<button class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100">
  <svg class="w-5 h-5 text-gray-600" data-icon="lucide:search"></svg>
</button>
```

---

## 10. Responsive Breakpoints

### 10.1 Breakpoint Definitions

| Breakpoint | Min Width | Tailwind Prefix | Usage |
|------------|-----------|-----------------|-------|
| Mobile (Default) | 0px | *(none)* | Mobile-first base styles |
| SM | 640px | `sm:` | Large phones, small tablets |
| MD | 768px | `md:` | Tablets, sidebar appears |
| LG | 1024px | `lg:` | Laptops, full layouts activate |
| XL | 1280px | `xl:` | Desktops, max-width containers |
| 2XL | 1536px | `2xl:` | Large desktops |

### 10.2 Layout Patterns per Breakpoint

| Component | Mobile (Default) | MD (768px+) | LG (1024px+) |
|-----------|------------------|-------------|--------------|
| Grid Columns | 1 column | 2 columns | 3-4 columns |
| Sidebar | Hidden/Drawer | Visible (fixed) | Visible (fixed 240px) |
| Navbar | Hamburger menu | Full horizontal nav | Full horizontal nav |
| Card Grid | `grid-cols-1` | `md:grid-cols-2` | `lg:grid-cols-3` |
| Spacing | `px-4`, `gap-4` | `md:px-6`, `md:gap-6` | `lg:px-8`, `lg:gap-8` |

### 10.3 Mobile-First Strategy

**Default (Mobile):** Write base styles for mobile devices
**Progressive Enhancement:** Use `md:`, `lg:`, `xl:` prefixes to enhance for larger screens

**Example:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
</div>
```

---

## 11. HR Lines & Dividers

### 11.1 Horizontal Rule Styles

| Style | Tailwind Classes | Usage |
|-------|------------------|-------|
| Standard | `border-t border-gray-200` | Default section divider |
| Thick | `border-t-2 border-gray-300` | Prominent section breaks |
| Dotted | `border-t border-dotted border-gray-300` | Subtle visual separation |
| Gradient | `border-t border-gradient-to-r from-transparent via-gray-300 to-transparent` | Decorative |

### 11.2 Section Dividers

**Full-Width:**
```html
<hr class="border-t border-gray-200 my-8" />
```

**Inset (with margins):**
```html
<hr class="border-t border-gray-200 my-6 mx-4" />
```

**With Text:**
```html
<div class="relative my-8">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-gray-200"></div>
  </div>
  <div class="relative flex justify-center text-sm">
    <span class="px-2 bg-white text-gray-500">Or</span>
  </div>
</div>
```

### 11.3 Card/List Dividers

**Between List Items:**
```html
<li class="py-3 border-b border-gray-200 last:border-b-0">
```

**Within Cards:**
```html
<div class="p-6">
  <div class="pb-4 border-b border-gray-200">Header</div>
  <div class="pt-4">Content</div>
</div>
```

---

## 12. Form Elements

### 12.1 Text Input States

| State | Border | Background | Ring | Placeholder | Tailwind Classes |
|-------|--------|------------|------|-------------|------------------|
| Default | gray-200 | white | none | gray-400 | `border-gray-200 bg-white placeholder-gray-400` |
| Hover | gray-300 | white | - | gray-400 | `hover:border-gray-300` |
| Focus | primary | white | 2px primary | gray-400 | `focus:border-primary focus:ring-2 focus:ring-primary` |
| Error | red-500 | white | 2px red | gray-400 | `border-red-500 focus:ring-red-500` |
| Success | emerald-500 | white | 2px emerald | gray-400 | `border-emerald-500 focus:ring-emerald-500` |
| Disabled | gray-200 | gray-100 | none | gray-400 | `disabled:bg-gray-100 disabled:cursor-not-allowed` |

### 12.2 Select Dropdown

```html
<select class="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200">
  <option>Option 1</option>
</select>
```

### 12.3 Checkbox

**Custom Styled:**
```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary" />
  <span class="text-sm text-gray-700">Label</span>
</label>
```

### 12.4 Radio Button

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="radio" class="w-5 h-5 text-primary border-gray-300 focus:ring-2 focus:ring-primary" />
  <span class="text-sm text-gray-700">Option</span>
</label>
```

### 12.5 Textarea

```html
<textarea class="w-full px-4 py-3 border border-gray-200 rounded-lg placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200" rows="4"></textarea>
```

### 12.6 Error Message

```html
<p class="text-xs text-red-600 mt-1 ml-1">Error message here</p>
```

### 12.7 Help Text

```html
<p class="text-xs text-gray-500 mt-1 ml-1">Help text here</p>
```

---

## 13. Accessibility Guidelines

### 13.1 Focus Indicators

**Requirement:** All interactive elements MUST have visible focus indicators

| Element | Focus Ring | Tailwind Classes |
|---------|------------|------------------|
| Button | 2px ring, primary color, 2px offset | `focus:ring-2 focus:ring-primary focus:ring-offset-2` |
| Link | 2px ring, primary color, rounded | `focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:rounded` |
| Input | 2px ring, primary color | `focus:ring-2 focus:ring-primary` |
| Checkbox/Radio | 2px ring, primary color | `focus:ring-2 focus:ring-primary` |

### 13.2 Color Contrast Requirements

**WCAG AA Compliance:**
- Normal text (< 18px): Minimum contrast ratio **4.5:1**
- Large text (≥ 18px or ≥ 14px bold): Minimum contrast ratio **3:1**
- Interactive elements: Minimum contrast ratio **3:1**

**Verify Contrast:**
- Primary text on white: [EXTRACTED contrast ratio]
- White text on primary: [EXTRACTED contrast ratio]
- Gray-600 text on white: [EXTRACTED contrast ratio]

### 13.3 Touch Target Sizes

**Minimum Touch Target:** 44x44px (per WCAG 2.1 AAA)

| Element | Minimum Size | Recommended Size | Tailwind Classes |
|---------|--------------|------------------|------------------|
| Button | 44x44px | 48x48px | `min-h-[44px] px-6` or `w-12 h-12` |
| Icon Button | 44x44px | 44x44px | `w-11 h-11` or `w-12 h-12` |
| Checkbox | 20x20px | 24x24px | `w-5 h-5` or `w-6 h-6` |
| Link (text) | - | 44px height | `py-2` (min) |

### 13.4 Screen Reader Considerations

**ARIA Labels:**
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for form errors
- Use `aria-expanded` for dropdowns/accordions
- Use `aria-current="page"` for active nav links

**Example:**
```html
<button aria-label="Close dialog" class="...">
  <svg class="w-5 h-5" data-icon="lucide:x"></svg>
</button>
```

### 13.5 Keyboard Navigation

**Requirements:**
- All interactive elements reachable via Tab key
- Logical tab order (follows visual order)
- Enter/Space activates buttons
- Arrow keys navigate dropdowns/menus
- Escape closes modals/dropdowns

---

## Usage Notes for HTML-to-React Conversion

1. **Never Hardcode Design Values:** Always reference this document for colors, spacing, shadows, and transitions
2. **Implement All Interactive States:** Every button, input, card, and link must have all 5 states (default, hover, focus, active, disabled)
3. **Use Tailwind Classes:** Prefer Tailwind utility classes over inline styles or CSS-in-JS for design tokens
4. **Reference Section Numbers:** When converting, add comments like `// Section 6.1: Button States` for clarity
5. **Validate Accessibility:** Cross-check Section 13 before marking any component as complete
6. **Maintain Consistency:** If the design system says "rounded-xl for cards," ALL cards should use rounded-xl

---

**Generated by:** `/dev:new-project` command
**Version:** 1.0
**Last Extracted:** {DATE}
