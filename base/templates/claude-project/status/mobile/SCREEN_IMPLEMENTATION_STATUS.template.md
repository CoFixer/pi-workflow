# Mobile Screen Implementation Status: {PROJECT_NAME}

> **Framework:** {FRAMEWORK}
> **Last Updated:** YYYY-MM-DD

## Overview

This document tracks the implementation status of all mobile app screens.

---

## Figma Design Mapping

> **Figma File URL:** `{FIGMA_FILE_URL}`
> **Page Node ID:** `{PAGE_NODE_ID}`

### All Screens Index

| Section | Screen Count | Status |
|---------|--------------|--------|
| Authentication | 0 | :x: Not Started |
| Main Application | 0 | :x: Not Started |
| [Feature] | 0 | :x: Not Started |

### Authentication Screens

| Screen | Navigation | Figma Node ID | Figma URL | Status | Last QA |
|--------|------------|---------------|-----------|--------|---------|
| Login | `Auth/Login` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |
| Register | `Auth/Register` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |
| Forgot Password | `Auth/ForgotPassword` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |
| OTP Verification | `Auth/OTP` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |

### Main Application Screens

| Screen | Navigation | Figma Node ID | Figma URL | Status | Last QA |
|--------|------------|---------------|-----------|--------|---------|
| Home | `Main/Home` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |
| {Screen Name} | `Main/{Screen}` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |

### [Feature] Screens

<!-- Copy this section for each feature area -->

| Screen | Navigation | Figma Node ID | Figma URL | Status | Last QA |
|--------|------------|---------------|-----------|--------|---------|
| {Screen Name} | `{Stack}/{Screen}` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - |

### Profile & Settings Screens

> **Note:** If multiple screens share a parent node ID, break them out with individual sub-node IDs.
> Run `mcp__figma__get_metadata nodeId: "{parent-node-id}"` to extract actual sub-node IDs.

| Screen | Navigation | Figma Node ID | Figma URL | Status | Last QA | Notes |
|--------|------------|---------------|-----------|--------|---------|-------|
| Profile | `Profile/Main` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - | |
| Edit Profile | `Profile/Edit` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - | |
| Settings | `Settings/Main` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - | |
| Notifications | `Settings/Notifications` | `{node-id}` | {figma-file-url}?node-id={node-id} | :x: Not Started | - | |

---

## Implementation Status

### Authentication Screens

| Screen | Navigation | Status | Components | Notes |
|--------|------------|--------|------------|-------|
| | | | | |

---

### Main Application Screens

| Screen | Navigation | Status | Components | Notes |
|--------|------------|--------|------------|-------|
| | | | | |

---

### [Feature] Screens

<!-- Copy this section for each feature area -->

| Screen | Navigation | Status | Components | Notes |
|--------|------------|--------|------------|-------|
| | | | | |

---

## Status Legend

| Status | Icon | Meaning |
|--------|------|---------|
| Not Started | :x: | Not started |
| In Progress | :hourglass_flowing_sand: | Currently being implemented |
| Review | :mag: | Implemented, needs review |
| Complete | :white_check_mark: | Implemented and tested |
| Blocked | :no_entry: | Waiting on API/design |

---

## Design QA Tracking

The **Last QA** column tracks when each screen was last verified against Figma designs.

### QA Workflow
1. Select screen from table above
2. Note the Figma Node ID (use colon format: `123:456`)
3. Run MCP tools:
   - `mcp__figma__get_screenshot nodeId: "{node-id}"`
   - `mcp__figma__get_design_context nodeId: "{node-id}"`
4. Compare implementation against Figma values
5. Document discrepancies and fix
6. Update "Last QA" column with date

### QA Report Template

```markdown
## Design QA Report: {Screen Name}

**Screen**: {screen-name}
**Figma Node**: `{nodeId}`
**File**: `{filePath}`
**QA Date**: YYYY-MM-DD
**Status**: PASS / FAIL

### Discrepancies Found

| # | Category | Figma Value | Implementation | Line | Fix |
|---|----------|-------------|----------------|------|-----|
| 1 | Spacing | `padding: 24` | `p-4` (16) | 45 | Change to `p-6` |

### Summary
- Total Issues: X
- Files Modified: Y
- Final Status: PASS/FAIL
```

---

## Implementation Checklist

### Per Screen
- [ ] Screen component created
- [ ] Navigation configured (React Navigation)
- [ ] API integration
- [ ] Loading/Error/Empty states
- [ ] Platform-specific handling (iOS/Android)
- [ ] Safe area handling
- [ ] Unit tests
- [ ] E2E tests (Detox)
- [ ] **Design QA completed** (Last QA date updated)

### Global
- [ ] Navigation structure setup
- [ ] Auth flow with protected screens
- [ ] Deep linking configuration
- [ ] Push notification handling
- [ ] Offline support
- [ ] App state handling (background/foreground)

### Platform-Specific
- [ ] iOS permissions configured
- [ ] Android permissions configured
- [ ] iOS App Store screenshots
- [ ] Android Play Store screenshots

---

## Change Log

| Date | Changes |
|------|---------|
| YYYY-MM-DD | Initial documentation created |

---

## Notes

<!-- Add implementation notes, design decisions, blockers -->
