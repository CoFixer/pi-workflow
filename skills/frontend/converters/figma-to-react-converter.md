---
skill_name: figma-to-react-converter
applies_to_local_project_only: true
auto_trigger_regex: [figma, convert figma, figma to react, implement design, pixel-perfect]
tags: [converters, figma, react, design-implementation]
related_skills: [html-to-react-converter, design-qa-figma]
---

# Figma to React Conversion Guide

Convert Figma designs to **pixel-perfect** React components using Figma MCP server, with full integration into the project's Shadcn/UI, Tailwind CSS, and TypeScript patterns.

> **Figma MCP Status**: Figma MCP (Dev Mode MCP - local) is properly installed and configured. All 6 MCP tools are available for use.

---

## When to Use This Guide

- Converting Figma designs directly to React components
- Implementing UI from Figma mockups
- Extracting design tokens from Figma
- Building component libraries from design systems
- Ensuring pixel-perfect implementations

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

**Before creating ANY new component or page**, you MUST check for existing implementations.

### Step 1: Identify Target Project

Discover frontend projects in the codebase:

```bash
# Find all frontend projects
ls -d frontend* 2>/dev/null
```

| Project Pattern | Typical Framework | Common Use Case |
|----------------|-------------------|-----------------|
| `frontend/` | React Router / Next.js | Main application |
| `frontend-{name}/` | React Router / Next.js | Additional apps (admin, dashboard, mobile) |
| `{name}-frontend/` | Various | Alternative naming pattern |

**Check each project's framework:**
- Look for `package.json` to identify React Router, Next.js, Vite, etc.
- Check routing configuration to understand structure

### Step 2: Check Existing Components

**Always search for existing components before creating new ones.**

```bash
# Find existing components by name pattern (adjust path based on discovered structure)
ls {frontend-project}/app/components/
ls {frontend-project}/components/

# Search for specific component implementations
grep -r "export.*Button" {frontend-project}/
grep -r "export.*Card" {frontend-project}/
grep -r "export.*{ComponentName}" {frontend-project}/
```

### Step 3: Reuse Decision

1. **Does an existing component match?** → Use it directly
2. **Does an existing component almost match?** → Extend it with variants
3. **Is this truly unique?** → Create new component following existing patterns

---

## Tool 1: get_design_context (PRIMARY TOOL)

**Purpose**: Get structured design representation with all properties needed for React implementation.

**Function**: `mcp__figma__get_design_context`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodeId` | string | No | Node ID (e.g., "123:456" or "123-456"). Uses current selection if omitted |
| `artifactType` | string | No | Type: `WEB_PAGE_OR_APP_SCREEN`, `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN`, `REUSABLE_COMPONENT`, `DESIGN_SYSTEM` |
| `taskType` | string | No | Task: `CREATE_ARTIFACT`, `CHANGE_ARTIFACT`, `DELETE_ARTIFACT` |
| `forceCode` | boolean | No | Force code output even for large designs |
| `clientLanguages` | string | No | e.g., "typescript,html,css" |
| `clientFrameworks` | string | No | e.g., "react" |

### Example Usage

```
mcp__figma__get_design_context
  nodeId: "1:2"
  artifactType: "COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN"
  taskType: "CREATE_ARTIFACT"
  clientLanguages: "typescript"
  clientFrameworks: "react"
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

---

## Tool 2: get_screenshot (ALWAYS USE)

**Purpose**: Capture visual screenshot for side-by-side comparison during implementation.

**Function**: `mcp__figma__get_screenshot`

### When to Use

- **ALWAYS** - Before and during implementation
- Visual verification of pixel-perfect accuracy
- Comparing implementation against design

### Example Usage

```
mcp__figma__get_screenshot
  nodeId: "1:2"
  clientFrameworks: "react"
```

---

## Tool 3: get_metadata

**Purpose**: Get sparse XML structure with layer IDs, names, positions, and sizes.

**Function**: `mcp__figma__get_metadata`

### When to Use

- When `get_design_context` response is too large or truncated
- Getting overview of complex page structure
- Finding specific node IDs within a large design

### Workflow for Large Designs

1. Call `get_metadata` first to get structure overview
2. Identify specific node IDs you need
3. Call `get_design_context` on individual nodes

---

## Tool 4: get_variable_defs

**Purpose**: Get design token definitions (colors, spacing, typography variables).

**Function**: `mcp__figma__get_variable_defs`

### When to Use

- Extracting design system tokens
- Getting semantic color names and values
- Understanding spacing scale
- Typography variable definitions

---

## Tool 5: create_design_system_rules

**Purpose**: Generate design system context rules for your project.

**Function**: `mcp__figma__create_design_system_rules`

### When to Use

- Setting up new projects
- Creating design system documentation
- Establishing component patterns

---

## Tool 6: get_figjam

**Purpose**: Get content from FigJam boards (whiteboard/brainstorming files).

**Function**: `mcp__figma__get_figjam`

### When to Use

- **Only for FigJam files** (not regular Figma design files)
- Extracting wireframes from whiteboard sessions
- Workflow diagrams

---

## Pixel-Perfect Implementation Guidelines

### CRITICAL: Pixel-Perfect Requirements

1. **ALWAYS get a screenshot** using `get_screenshot` MCP tool
2. **Match exact pixel values** - Use arbitrary Tailwind values `[Xpx]` when standard scale doesn't match
3. **Compare side-by-side** - View your implementation against the Figma screenshot
4. **No rounding** - If Figma says `17px`, use `[17px]`, not `text-base` (16px)

### Exact Value Mapping

```tsx
// WRONG - Approximating values
<div className="p-4 text-sm gap-2" />  // 16px, 14px, 8px

// CORRECT - Exact Figma values
<div className="p-[18px] text-[15px] gap-[10px]" />  // Matches Figma exactly
```

### Pixel-Perfect Checklist

- [ ] **Spacing**: Padding, margin, gap match exactly (use `[Xpx]` if needed)
- [ ] **Typography**: Font size, weight, line-height, letter-spacing exact
- [ ] **Colors**: Use exact hex values from Figma, not approximations
- [ ] **Sizing**: Width, height, min/max values exact
- [ ] **Border radius**: Exact corner radius values
- [ ] **Shadows**: Match shadow blur, spread, color, offset exactly
- [ ] **Layout**: Flex direction, alignment, justify match Figma auto-layout
- [ ] **Screenshot comparison**: Visually compare implementation to design

> **For detailed Figma-to-Tailwind mapping tables, see:** [Figma Tailwind Reference](./resources/figma-tailwind-reference.md)

---

## Complete Conversion Workflow

### Phase 1: Design Analysis (REQUIRED)

1. **Get design context via MCP**
   ```
   mcp__figma__get_design_context
     nodeId: "extracted-from-url"
     artifactType: "COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN"
     clientFrameworks: "react"
   ```

2. **Get screenshot for visual reference**
   ```
   mcp__figma__get_screenshot
     nodeId: "same-node-id"
   ```

3. **If response too large or truncated** - Use `get_metadata` first, then fetch specific nodes

4. **Identify components and variants**
   - Note all design variants (hover, active, disabled states)
   - Check for existing Shadcn/UI components that match
   - Document color values and typography used

### Phase 2: Structure Setup

1. Create component file with TypeScript
2. Define props interface with JSDoc comments
3. Identify dynamic vs static content
4. Map Figma layers to React component hierarchy

### Phase 3: Pixel-Perfect Styling

1. **Extract exact values** from Figma design context
2. **Use arbitrary values** `[Xpx]` for non-standard spacing
3. **Match colors exactly** - Use `bg-[#hex]` for custom colors
4. **Compare with screenshot** - Visual comparison is mandatory

### Phase 4: Integration & Verification

1. Replace with Shadcn/UI components where applicable
2. Add proper TypeScript types
3. Add responsive classes if specified in design
4. **Visual comparison** - Side-by-side with Figma screenshot

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
  "width": 320
}
```

### Generated React Component (Pixel-Perfect)

```tsx
import { cn } from '~/lib/utils';

interface ProductCardProps {
  title: string;
  price: string;
  imageUrl: string;
  className?: string;
}

export default function ProductCard({
  title,
  price,
  imageUrl,
  className
}: ProductCardProps) {
  return (
    <div className={cn(
      // Exact Figma values - NOT approximations
      "w-[320px] flex flex-col gap-[18px]",
      "px-[20px] pt-[24px] pb-[20px]",
      "bg-white rounded-[14px]",
      "shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
      className
    )}>
      <div className="aspect-video w-full overflow-hidden rounded-[10px]">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      </div>
      <h3 className="text-[18px] font-semibold leading-[24px]">{title}</h3>
      <p className="text-[16px] font-medium text-[#6B7280]">{price}</p>
    </div>
  );
}
```

---

## Conversion Checklist

### Phase 1: Design Analysis
- [ ] Get Figma design context via MCP (`get_design_context`)
- [ ] Get screenshot via MCP (`get_screenshot`)
- [ ] If response large, use `get_metadata` first
- [ ] Note all design variants (hover, active, disabled states)
- [ ] Check for existing Shadcn/UI components that match

### Phase 2: Structure Setup
- [ ] Create component file with TypeScript
- [ ] Define props interface with JSDoc comments
- [ ] Map Figma layers to React component hierarchy

### Phase 3: Pixel-Perfect Styling
- [ ] Convert layout (auto-layout to flex) with exact gaps
- [ ] Convert spacing with exact values (use `[Xpx]`)
- [ ] Convert colors with exact hex values
- [ ] Convert typography with exact sizes
- [ ] Use `cn()` for conditional classes

### Phase 4: Integration & Verification
- [ ] Replace with Shadcn/UI components where applicable
- [ ] Add proper TypeScript types
- [ ] **VISUAL COMPARISON** with Figma screenshot
- [ ] Test component rendering

---

## Troubleshooting

### MCP Tool Issues

| Issue | Solution |
|-------|----------|
| MCP not responding | Ensure Figma desktop app is running with the file open |
| No design context | Ensure you have the correct Figma URL with node-id |
| Response too large | Use `get_metadata` first, then fetch specific nodes |
| Node not found | Verify node ID format (use colon `:` for MCP, hyphen `-` in URLs) |

### Node ID Format Issues

| Context | Format | Example |
|---------|--------|---------|
| Figma URL | Hyphen | `node-id=123-456` |
| MCP Tools | Colon | `nodeId: "123:456"` |

**Conversion**: Replace hyphen `-` with colon `:` when extracting from URL.

---

## See Also

- [Figma Tailwind Reference](./resources/figma-tailwind-reference.md) - Complete property mapping tables
- [Component Patterns](../../guides/component-patterns.md) - React component architecture
- [Styling Guide](../../guides/styling-guide.md) - Tailwind CSS patterns
- [Convert HTML to React](html-to-react-converter.md) - Similar conversion patterns

## Sources

- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
