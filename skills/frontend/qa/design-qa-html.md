---
skill_name: design-qa-html
applies_to_local_project_only: true
auto_trigger_regex: [design qa, design-qa, pixel-perfect, qa report, visual comparison, html qa, html prototype]
tags: [qa, design-qa, html, pixel-perfect]
related_skills: [html-to-react-converter, design-qa-figma]
description: Design QA skill for verifying React implementations against HTML prototypes. Use for pixel-perfect accuracy verification, visual comparison, and generating QA reports.
---

# Design QA Guide (HTML)

Verify implemented React screens against HTML prototypes to ensure pixel-perfect accuracy.

> **HTML Prototypes**: Static HTML files serve as the source of truth for visual design.

---

## Required Tools

Design QA against HTML prototypes uses these tools:

| Tool | Purpose | Required |
|------|---------|----------|
| `Read` | Read HTML file content and extract CSS/Tailwind classes | **ALWAYS** |
| `Bash` with Playwright MCP | Take screenshots for visual comparison | **RECOMMENDED** |
| `Grep` | Search for specific CSS patterns across files | As needed |

---

## When to Use This Guide

- Verifying implemented React screens match HTML prototypes
- QA review before release or PR merge
- Identifying visual discrepancies between HTML prototype and React implementation
- Generating QA reports for design review meetings

---

## Prerequisites

1. **HTML Prototypes** - Static HTML files (typically in `html/` folder)
2. **Screen Implementation Status File** - Contains HTML-to-React mappings
3. **Access to Implementation Files** - React component/page files to review

---

## Phase 1: Project Selection (REQUIRED)

**Before starting QA, discover and select which frontend project to review.**

### Project Discovery

Scan the project root for directories starting with `frontend`:

```bash
ls -d frontend* 2>/dev/null
```

### Ask User to Select Project

After discovering projects, present them to the user:

```
Which frontend project would you like to QA?

[List discovered projects here with numbers]
1. frontend
2. frontend-admin
...
```

### Locate Status File

After project selection, look for the screen implementation status file:

```
.project/plans/{project-name}/SCREEN_IMPLEMENTATION_STATUS.md
```

If the status file doesn't exist, ask the user to provide:
1. The path to their implementation status file, OR
2. Direct paths to HTML and React files to compare

---

## Phase 2: Screen Selection

### Option A: Select from Implementation Status

After loading the status file, parse and present screens by category:

```
Available screens in [PROJECT_NAME]:

[Dynamically list categories and screens from status file]

Each screen entry should show:
- Screen name
- Route
- HTML Source file
- Status (HTML Ready, In Progress, Complete, etc.)

Enter category number, screen name, or "all" for full QA:
```

### Option B: Direct File Paths

User can provide files directly:

```
HTML Prototype: html/login.html
React Implementation: frontend/app/pages/login.tsx
```

### Option C: QA by Route

Specify a route to find the corresponding files from status file:

```
Route: /login
Found in status file:
- Screen: Login
- HTML Source: html/login.html
- React File: frontend/app/pages/login.tsx
```

---

## Phase 3: HTML Prototype Analysis

For each selected screen, analyze the HTML prototype.

### Step 1: Read HTML File

```
Read file: {html-source-path}
```

### Step 2: Extract Design Values

Parse the HTML file to extract:

| Category | What to Extract |
|----------|-----------------|
| **Layout** | Container structure, flex/grid patterns, alignment |
| **Spacing** | Padding, margin, gap values (Tailwind classes) |
| **Typography** | Font sizes, weights, colors, line heights |
| **Colors** | Background colors, text colors, border colors |
| **Components** | Buttons, inputs, cards, icons used |
| **Visual Effects** | Border radius, shadows, opacity |

### Step 3: Document Key Values

Create a reference table of design values from HTML:

```markdown
## HTML Design Values: {screen-name}

### Layout
- Container: `max-w-7xl mx-auto px-4`
- Main flex: `flex flex-col gap-6`

### Spacing
- Section padding: `py-8 px-6`
- Card padding: `p-4`
- Element gap: `gap-4`

### Typography
- Heading: `text-2xl font-bold text-gray-900`
- Body: `text-base text-gray-600`
- Small: `text-sm text-gray-500`

### Colors
- Primary: `bg-blue-600`, `text-blue-600`
- Background: `bg-gray-50`, `bg-white`
- Border: `border-gray-200`

### Components
- Button primary: `bg-blue-600 text-white rounded-lg px-4 py-2`
- Input: `border border-gray-300 rounded-lg px-3 py-2`
- Card: `bg-white rounded-xl shadow-sm p-4`
```

---

## Phase 4: Implementation Review

### Read React Implementation File

Based on the file path from status file:

```typescript
// Read the React component file and extract:
// - Component structure (JSX hierarchy)
// - Tailwind classes used
// - Layout patterns
```

### Extract Styling Values

Parse Tailwind classes from the React implementation to compare:

| React Class | Extracted Value |
|-------------|-----------------|
| `p-4` | padding: 16px |
| `gap-2` | gap: 8px |
| `text-sm` | font-size: 14px |
| `rounded-lg` | border-radius: 8px |

---

## Phase 5: Visual Comparison Checklist

For each screen, evaluate these categories:

### Layout Structure
- [ ] Component hierarchy matches HTML structure
- [ ] Flex direction (row/column) is correct
- [ ] Alignment (items-center, justify-between, etc.) matches
- [ ] Container widths/heights match
- [ ] Responsive breakpoints match

### Spacing
- [ ] Padding values match exactly
- [ ] Margin values match exactly
- [ ] Gap between elements matches
- [ ] Section spacing matches

### Typography
- [ ] Font sizes match
- [ ] Font weights match
- [ ] Line heights match
- [ ] Letter spacing matches
- [ ] Text colors match

### Colors
- [ ] Background colors match
- [ ] Text colors match
- [ ] Border colors match
- [ ] Hover/focus state colors match

### Visual Effects
- [ ] Border radius matches
- [ ] Shadows match
- [ ] Opacity values match
- [ ] Transitions/animations match

### Components
- [ ] All UI elements present
- [ ] Icons match (correct icon, size, color)
- [ ] Images/illustrations present
- [ ] Interactive states (hover, focus) match
- [ ] Form elements styled correctly

---

## Phase 6: Report Generation

### QA Report Format

```markdown
# Design QA Report (HTML Comparison)

**Project**: {project-name}
**Date**: {date}
**Screens Reviewed**: {count}

---

## Screen: {screen-name}

**HTML Prototype**: `{html-file-path}`
**React Implementation**: `{react-file-path}`
**Status**: PASS / FAIL

### Checklist Results

| Category | Status | Issues |
|----------|--------|--------|
| Layout | PASS | - |
| Spacing | FAIL | 2 issues |
| Typography | PASS | - |
| Colors | PASS | - |
| Visual Effects | PASS | - |
| Components | FAIL | 1 issue |

### Discrepancies Found

1. **Spacing Issue** (Line XX)
   - HTML: `p-6` (24px padding)
   - React: `p-4` (16px padding)
   - Fix: Change to `p-6`

2. **Missing Component**
   - HTML shows "Element Name"
   - React: Not present
   - Fix: Add element

3. **Color Mismatch**
   - HTML: `text-gray-700`
   - React: `text-gray-500`
   - Fix: Change to `text-gray-700`

---

## Summary

| Screen | Status | Issues |
|--------|--------|--------|
| Screen 1 | PASS | 0 |
| Screen 2 | FAIL | 3 |
| ... | ... | ... |

**Total Issues Found**: {count}
**Screens Passing**: {pass}/{total} ({percentage}%)
```

---

## Common Discrepancies

### Spacing Issues

| Issue | HTML | Common Mistake | Fix |
|-------|------|----------------|-----|
| Padding mismatch | `p-6` | `p-4` | Use `p-6` |
| Gap mismatch | `gap-4` | `gap-2` | Use `gap-4` |
| Uneven padding | `pt-6 pb-4` | `py-4` | Use `pt-6 pb-4` |

### Typography Issues

| Issue | HTML | Common Mistake | Fix |
|-------|------|----------------|-----|
| Font size | `text-lg` | `text-base` | Use `text-lg` |
| Font weight | `font-semibold` | `font-medium` | Use `font-semibold` |
| Text color | `text-gray-700` | `text-gray-600` | Use `text-gray-700` |

### Color Issues

| Issue | HTML | Common Mistake | Fix |
|-------|------|----------------|-----|
| Background | `bg-gray-50` | `bg-gray-100` | Use `bg-gray-50` |
| Border | `border-gray-200` | `border-gray-300` | Use `border-gray-200` |
| Primary color | `bg-blue-600` | `bg-blue-500` | Use `bg-blue-600` |

---

## Quick QA Workflow

```
1. Discover Projects
   └─> ls -d frontend*

2. Ask User to Select Project
   └─> "Which project to QA?"

3. Load Status File
   └─> .project/plans/{project}/SCREEN_IMPLEMENTATION_STATUS.md

4. Select Screen(s)
   └─> From status file OR direct file paths

5. For each screen:
   a. Read HTML prototype file
   b. Extract all Tailwind classes and design values
   c. Read React implementation file
   d. Extract Tailwind classes from React
   e. Compare HTML values vs React values
   f. Document discrepancies with exact class fixes

6. Generate Report
   └─> Summary with specific Tailwind class fixes

7. Update Status File
   └─> Mark "Last QA" date for reviewed screens
```

### Per-Screen QA Checklist

For EACH screen, ensure you have:
- [ ] HTML prototype file read
- [ ] Design values extracted (classes, structure)
- [ ] React implementation file read
- [ ] Classes compared (HTML vs React)
- [ ] Discrepancies documented with specific Tailwind class fixes

---

## Pixel-Perfect Requirements

### CRITICAL: Exact Match Required

For pixel-perfect accuracy, the following MUST match exactly:

1. **Tailwind Classes**: Use identical classes from HTML
2. **Class Order**: While not affecting rendering, maintain consistent order
3. **Arbitrary Values**: If HTML uses `text-[15px]`, React must use `text-[15px]`
4. **Responsive Classes**: Match all breakpoint-specific classes
5. **State Classes**: Match hover, focus, active states exactly

### Common Pixel-Perfect Violations

| Violation | Impact | Fix |
|-----------|--------|-----|
| Missing responsive class | Layout breaks at breakpoint | Add missing class |
| Wrong spacing unit | 4px off | Use exact class |
| Missing transition | Jarring state change | Add transition class |
| Wrong shadow depth | Visual inconsistency | Match shadow class |

---

## Integration with Status File

The `SCREEN_IMPLEMENTATION_STATUS.md` file provides:

- **HTML Source** column: Path to HTML prototype file
- **Route** column: React route for the screen
- **Status** column: Implementation status (HTML Ready, In Progress, Complete)
- **Last QA** column: Date of last QA verification

### Updating Status After QA

After completing QA for a screen:

1. Update the **Last QA** column with current date
2. Update **Status** if implementation passes QA (mark as Complete)
3. Document any remaining issues in Notes

---

## Integration with Other Skills

- **[design-qa-figma.md](./design-qa-figma.md)** - QA against Figma designs (use Figma MCP)
- **[convert-html-to-react.md](../convert-html-to-react.md)** - HTML to React conversion guide

---

## Troubleshooting

### Status File Not Found

If no status file exists for the project:
1. Ask user for direct file paths (HTML and React)
2. Or ask user to create/provide status file location
3. Suggest using the template: `.project/plans/frontend/SCREEN_IMPLEMENTATION_STATUS.template.md`

### HTML File Not Found

- Verify file exists at the path specified in status file
- Check filename spelling (case-sensitive)
- Ensure correct extension (.html)
- Ask user to update status file with correct path

### Class Extraction Issues

- Some HTML files may use inline styles instead of Tailwind
- Convert inline styles to equivalent Tailwind classes
- Document any custom CSS that needs to be created

---

## QA Session Completion Checklist

Before completing any Design QA session, verify:

### File Analysis Report

```markdown
## File Analysis Summary

| Screen | HTML Read | React Read | Compared |
|--------|-----------|------------|----------|
| {screen} | Yes | Yes | Yes |
```

### Final Verification

- [ ] All HTML prototype files read
- [ ] All React implementation files read
- [ ] All classes compared between HTML and React
- [ ] All discrepancies documented with exact Tailwind class fixes
- [ ] QA report generated with pass/fail status per screen
- [ ] Status file updated with Last QA dates

---

## See Also

- [Design QA (Figma)](./design-qa-figma.md) - QA against Figma designs
- [Screen Implementation Status Template](../../../.project/plans/frontend/SCREEN_IMPLEMENTATION_STATUS.template.md) - Status tracking template
