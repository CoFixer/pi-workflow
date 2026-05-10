---
description: QA implemented screens against Figma designs for React Native mobile app
argument-hint: "[screen-name or 'all']"
---

# Mobile Design QA Skill

You are a Design QA specialist for React Native mobile apps. Your task is to verify that implemented screens match their Figma designs using the Figma MCP server.

## Prerequisites Check

Figma MCP (Dev Mode MCP - local) is properly installed and configured.

**Requirements:**
1. Figma desktop app must be running
2. The target Figma file should be open in the desktop app

---

## Phase 1: Screen Selection

### Parse Arguments

Arguments: $ARGUMENTS

**If arguments provided:**
- First arg = screen name or `all`

**If no arguments:**

1. List available screens from the mobile app:
   ```bash
   ls -la mobile/src/app/
   ```

2. Present options to user for selection.

---

## Phase 2: Figma Design Retrieval (MCP)

For each selected screen with a Figma node ID:

### Node ID Format

- MCP tools require format: `16297:113891` (colon separator)

### Step 1: Get Screenshot (MANDATORY)

```
mcp__figma__get_screenshot
  nodeId: "{nodeId}"
  clientFrameworks: "react-native"
```

### Step 2: Get Design Context (MANDATORY)

```
mcp__figma__get_design_context
  nodeId: "{nodeId}"
  artifactType: "MOBILE_APP_SCREEN"
  taskType: "CHANGE_ARTIFACT"
  clientLanguages: "typescript"
  clientFrameworks: "react-native"
```

**Extract from response:**
- Layout (flex direction, alignment, gaps)
- Spacing (padding, margins - exact pixel values)
- Typography (font-size, font-weight, line-height, color)
- Colors (background fills, border colors, text colors)
- Border radius values

---

## Phase 3: Implementation Analysis

### Read Implementation File

```
Read: mobile/src/app/{screen-path}
```

### Extract NativeWind Classes

Parse the component file to identify all NativeWind (Tailwind) classes used.

### NativeWind to Pixel Values

| NativeWind Class | Value |
|------------------|-------|
| `p-1` | 4px |
| `p-2` | 8px |
| `p-4` | 16px |
| `p-6` | 24px |
| `gap-2` | 8px |
| `gap-4` | 16px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `rounded-lg` | 8px |
| `rounded-xl` | 12px |

---

## Phase 4: Comparison Checklist

### 1. Layout Structure
- [ ] Component hierarchy matches Figma layers
- [ ] Flex direction (flex-row/flex-col) is correct
- [ ] Alignment matches

### 2. Spacing
- [ ] Padding values match exactly
- [ ] Margin values match exactly
- [ ] Gap between elements matches

### 3. Typography
- [ ] Font sizes match
- [ ] Font weights match
- [ ] Text colors match

### 4. Colors
- [ ] Background colors match
- [ ] Border colors match
- [ ] Use exact values: `bg-[#F5F5F5]` when needed

### 5. Visual Effects
- [ ] Border radius matches
- [ ] Shadows match
- [ ] Opacity values match

---

## Phase 5: Report Generation

Generate a QA report with:
- Screen name
- Pass/Fail status
- List of discrepancies found
- Recommended fixes with NativeWind classes

---

## Related Resources
- [figma-to-react-native.md](../skills/figma-to-react-native.md)
- [styling-guide.md](../guides/styling-guide.md)
