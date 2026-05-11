---
skill_name: design-qa-figma
applies_to_local_project_only: true
auto_trigger_regex: [design qa, design-qa, pixel-perfect, qa report, visual comparison, design verification, figma qa]
tags: [qa, design-qa, figma, pixel-perfect]
related_skills: [figma-to-react-converter, design-qa-html]
description: Design QA skill for verifying React implementations against Figma designs using Figma MCP tools.
---

# Design QA Guide (Figma)

Verify implemented screens against Figma designs using **Figma MCP tools** to ensure pixel-perfect accuracy.

---

## Required MCP Tools

> **⚠️ CRITICAL: For EVERY screen, you MUST call BOTH tools in parallel:**
> 1. `mcp__figma__get_screenshot` - Visual reference
> 2. `mcp__figma__get_design_context` - Exact CSS values
>
> **Never call only one tool. Always call both together for each screen.**

| Tool | Purpose | Required |
|------|---------|----------|
| `mcp__figma__get_screenshot` | Visual screenshot for comparison | **ALWAYS** |
| `mcp__figma__get_design_context` | Exact design values (spacing, colors, typography) | **ALWAYS** |
| `mcp__figma__get_metadata` | Structure overview for complex screens | As needed |

### Tool Call Tracking (MANDATORY)

At the end of each QA session, verify tool call parity:

```
Screenshot calls: X
Design context calls: X  ← MUST EQUAL screenshot calls
```

### Handling Large Responses

When `get_design_context` exceeds token limits, it's **automatically saved to a file**:

```
Output has been saved to /Users/.../.pi/projects/.../tool-results/mcp-figma-get_design_context-XXXXX.txt
```

**Do NOT skip - read the file and extract values:**
1. Read the saved file using Read tool
2. Use Grep to search for specific CSS values (font-size, padding, color)
3. Continue QA with extracted values

---

## When to Use This Guide

- Verifying implemented screens match Figma designs
- QA review before release or PR merge
- Identifying visual discrepancies
- Generating QA reports

---

## Quick QA Workflow

```
1. Discover Projects → ls -d frontend*

2. Ask User to Select Project → "Which project to QA?"

3. Load Status File
   → .project/plans/{project}/SCREEN_IMPLEMENTATION_STATUS.md

4. Select Screen(s) → From status file OR Figma URL

5. For each screen (IN PARALLEL):
   ┌────────────────────────────────────────────────────┐
   │ CALL BOTH TOOLS IN SAME MESSAGE:                  │
   │ • mcp__figma__get_screenshot(nodeId)              │
   │ • mcp__figma__get_design_context(nodeId)          │
   │ • Read implementation file                         │
   └────────────────────────────────────────────────────┘
   Then compare values and document discrepancies

6. Generate Report → Summary with specific Tailwind fixes
```

---

## Phase 1: Project Selection

Scan for frontend projects:

```bash
ls -d frontend* 2>/dev/null
```

Locate status file:
```
.project/plans/{project-name}/SCREEN_IMPLEMENTATION_STATUS.md
```

---

## Phase 2: Screen Selection

### Option A: From Status File
Parse and present screens by category from the status file.

### Option B: Direct Figma URL
```
Figma URL: https://www.figma.com/design/{fileKey}/{fileName}?node-id={nodeId}

Extracted:
- File Key: {fileKey}
- Node ID: {nodeId} (convert hyphen to colon for MCP)
```

### Option C: By Route
Match route to Figma design from status file.

---

## Phase 3: Figma Data Retrieval

**Call BOTH tools in a SINGLE message (parallel execution):**

| Tool Call 1 | Tool Call 2 |
|-------------|-------------|
| `mcp__figma__get_screenshot` | `mcp__figma__get_design_context` |
| nodeId: "{nodeId}" | nodeId: "{nodeId}" |
| clientFrameworks: "react" | artifactType: "WEB_PAGE_OR_APP_SCREEN" |

**get_screenshot** provides: Visual reference, layout appearance
**get_design_context** provides: Exact px values for padding, gap, font-size, colors

---

## Phase 4: Implementation Review

Read the React component file and extract Tailwind classes to compare:

| Tailwind Class | Extracted Value |
|----------------|-----------------|
| `p-4` | padding: 16px |
| `gap-2` | gap: 8px |
| `text-sm` | font-size: 14px |
| `rounded-lg` | border-radius: 8px |

---

## Phase 5: Visual Comparison Checklist

- [ ] **Layout**: Component hierarchy, flex direction, alignment
- [ ] **Spacing**: Padding, margin, gap (use `[Xpx]` for non-standard)
- [ ] **Typography**: Font size, weight, line-height, color
- [ ] **Colors**: Background, text, border (use `bg-[#hex]`)
- [ ] **Visual Effects**: Border radius, shadows, opacity
- [ ] **Components**: All elements present, icons match

---

## Phase 6: Report Generation

```markdown
# Design QA Report

**Project**: {project-name}
**Date**: {date}
**Screens Reviewed**: {count}

---

## Screen: {screen-name}

**Figma Node**: `{nodeId}`
**File**: `{filePath}`
**Status**: PASS / FAIL

### Checklist Results

| Category | Status | Issues |
|----------|--------|--------|
| Layout | PASS | - |
| Spacing | FAIL | 2 issues |
| Typography | PASS | - |
| Colors | PASS | - |

### Discrepancies Found

1. **Spacing Issue** (Line XX)
   - Figma: `padding: 24px`
   - Implementation: `p-4` (16px)
   - Fix: Change to `p-6` or `p-[24px]`

---

## Summary

| Screen | Status | Issues |
|--------|--------|--------|
| Screen 1 | PASS | 0 |
| Screen 2 | FAIL | 3 |

**Total Issues Found**: {count}
**Screens Passing**: {pass}/{total}
```

---

## Common Discrepancies

### Spacing Issues

| Issue | Figma | Common Mistake | Fix |
|-------|-------|----------------|-----|
| Non-standard padding | 18px | `p-4` (16px) | `p-[18px]` |
| Non-standard gap | 14px | `gap-3` (12px) | `gap-[14px]` |

### Typography Issues

| Issue | Figma | Common Mistake | Fix |
|-------|-------|----------------|-----|
| Non-standard size | 15px | `text-sm` (14px) | `text-[15px]` |
| Line height | 24px | default | `leading-[24px]` |

### Color Issues

| Issue | Figma | Common Mistake | Fix |
|-------|-------|----------------|-----|
| Custom gray | #6B7280 | `text-gray-500` | `text-[#6B7280]` |
| Custom primary | #FF6B35 | `text-orange-500` | `text-[#FF6B35]` |

---

## Troubleshooting

### MCP Connection Issues
Ensure Figma desktop app is running with the target file open.

### Node ID Not Found
- Verify node exists in Figma file
- Check node ID format: use colon `:` for MCP (not hyphen `-`)

### Status File Not Found
Ask user for direct Figma URL or status file location.

---

## QA Session Completion Checklist

Before completing any Design QA session, verify:

- [ ] Screenshot count equals screen count
- [ ] Design context count equals screen count
- [ ] All large responses were read from saved files
- [ ] All discrepancies documented with Figma px values
- [ ] QA report generated with pass/fail status per screen

---

## See Also

- [Figma to React Converter](../converters/figma-to-react-converter.md) - Implementation guide
- [Design QA HTML](./design-qa-html.md) - QA against HTML prototypes
