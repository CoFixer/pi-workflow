---
description: Execute design prompts on Aura.build to generate HTML screens using Playwright MCP
argument-hint: "<prompts-file> [--output <dir>] [--project <name>]"
---

# Prompts to Aura.build

Use Playwright MCP to execute design prompt files on Aura.build and generate HTML.
**Dynamically parses any project's prompt file for processing.**

---

## Prerequisites

1. **Playwright MCP Configuration** (`.mcp.json`)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

2. **Aura.build Account** - Keep logged in
3. **Design Prompts File** - Follow the standard format below

---

## Standard Prompts File Format

Standard format that `/prd-to-design-prompts` generates and this command parses:

```markdown
---
# YAML Frontmatter - Project metadata
project_name: "Project Name"
# output_dir is auto-generated: ./generated-screens/{project_name}/
total_pages: 11
design_system:
  style: "dark"
  primary_bg: "zinc-950"
  accent: "violet-500/indigo-600"
  effects: "glassmorphism"
  font: "Inter"
  icons: "lucide"
---

# [Project Name] Design Prompts

## Design System

[Common design spec - automatically prefixed to all page prompts]

Dark mode SaaS design with zinc-950 background...

---

## Page: 01-landing
name: Landing Page
category: marketing

Create a landing page for "[Project Name]"...

---

## Page: 02-login
name: Login
category: auth

Create a login page...

---
```

### Parsing Rules

| Element | Parsing Method | Usage |
|---------|----------------|-------|
| `project_name` | YAML frontmatter | Aura project name |
| `output_dir` | YAML frontmatter | HTML save path |
| `## Design System` | Section content | Common prompt prefix |
| `## Page: [filename]` | Regex match | HTML filename |
| `name:` | First line parse | Aura page display name |
| `---` | Delimiter | Page separator |

---

## Usage

```bash
/prompts-to-aura <prompts-file>
/prompts-to-aura <prompts-file> --output ./my-screens
/prompts-to-aura <prompts-file> --project "Custom Project Name"
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `<prompts-file>` | Design prompts MD file path | (required) |
| `--output <dir>` | HTML save directory | `./generated-screens/{project_name}/` |
| `--project <name>` | Aura.build project name | frontmatter.project_name |
| `--skip-login` | Skip login step | false |

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Parse & Setup                                      │
│  - Parse prompts file (frontmatter + pages)                  │
│  - Extract project_name, output_dir, design_system           │
│  - Build dynamic page list                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Aura.build Setup                                   │
│  - Open browser & navigate to Aura.build                     │
│  - Login if needed                                           │
│  - Create project: {project_name}-screens                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Batch Generate                                     │
│  - For each page in parsed_pages:                            │
│    - Create page with filename                               │
│    - Enter: design_system_prefix + page_prompt               │
│    - Submit & move to next (don't wait)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Export & Organize                                  │
│  - Wait for all generations                                  │
│  - Export → Download Site Files (ZIP)                        │
│  - Unzip to output_dir                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Execution Steps

### Step 1: Parse Prompts File (Dynamic)

```
1. Read $ARGUMENTS prompts file path
2. Extract YAML frontmatter:
   - project_name → Aura project name
   - design_system → Style metadata

3. Set output_dir:
   - If --output flag provided → use that
   - Else → ./generated-screens/{project_name}/
   - Create directory if not exists

4. Extract "## Design System" section content → design_system_prefix

5. Find all "## Page: [filename]" sections using regex:
   Pattern: /^## Page: (.+)$/gm
   For each match:
   - filename → page.filename (e.g., "01-landing")
   - name: line → page.display_name
   - category: line → page.category
   - remaining content → page.prompt

5. Build pages array:
   [
     { filename: "01-landing", display_name: "Landing Page", prompt: "..." },
     { filename: "02-login", display_name: "Login", prompt: "..." },
     ...
   ]
```

### Step 2: Open Aura.build

```
1. mcp__playwright__browser_navigate → https://www.aura.build
2. mcp__playwright__browser_snapshot → Check login status
3. If "Sign In" button visible:
   - Click Sign In
   - Enter credentials (prompt user if needed)
   - Wait for redirect
4. Confirm logged in (user avatar visible)
```

### Step 3: Create Project

```
1. Click "New Project" or navigate to create
2. Enter project name: {project_name}-screens
3. Wait for editor to load
4. Confirm at editor URL
```

### Step 4: Batch Generate Pages

For each page in pages array:

```
1. Click "Pages - [current]" button
2. Click "Create page"
3. Enter page name: page.filename (e.g., "01-landing")
4. Confirm creation
5. In prompt textbox, enter:
   "{design_system_prefix}

   {page.prompt}"
6. Submit (press Enter)
7. DON'T WAIT - Immediately proceed to next page
```

### Step 5: Wait for Generations

```
1. Calculate wait time: pages.length × 60 seconds
2. Wait with periodic status checks
3. Verify all pages have generated content
```

### Step 6: Export All Pages

```
1. Click "Export" button
2. Click "Download Site Files"
3. Wait for ZIP download
   - Downloaded to: .playwright-mcp/site-files.zip
```

### Step 7: Extract and Organize

```bash
# Create output directory
mkdir -p {output_dir}

# Unzip
unzip -o .playwright-mcp/site-files.zip -d {output_dir}

# Verify files
ls -la {output_dir}/*.html
```

### Step 8: Report Results

```
Output:
- Project: {project_name}
- Pages generated: {pages.length}
- Output directory: {output_dir}
- Files:
  - {output_dir}/01-landing.html
  - {output_dir}/02-login.html
  - ...
- Total time: X minutes
```

---

## Aura.build UI Patterns

### Element References (Playwright Selectors)

| Action | Selector | Notes |
|--------|----------|-------|
| Pages toggle | `button "Pages - [name]"` | Page management panel |
| Create page | `button "Create page"` | New page creation |
| Page name input | `textbox` in dialog | Page name input |
| Prompt input | `textbox "Ask for revisions..."` | AI prompt input |
| Export | `button "Export"` | Export menu |
| Download Site Files | `button "Download Site Files"` | Full ZIP download |
| Copy HTML | `button "Copy HTML"` | Individual HTML copy |

### Timing Guidelines

| Operation | Wait Time |
|-----------|-----------|
| Page navigation | 2-3 seconds |
| Page creation | 1-2 seconds |
| AI generation (simple) | 30-45 seconds |
| AI generation (complex) | 60-90 seconds |
| Export preparation | 3-5 seconds |
| ZIP download | 2-5 seconds |

---

## Export Options Reference

| Option | Description | Use Case |
|--------|-------------|----------|
| Copy HTML | Copy current page HTML to clipboard | Quick individual copy |
| Download HTML | Download current page HTML file | Individual file |
| **Download Site Files** | **Full project ZIP** | **Batch download (recommended)** |
| Copy to Figma | Copy design to Figma | Figma integration |

Download path: `.playwright-mcp/site-files.zip`

---

## Error Handling

### Login Required
```
If "Sign In" button visible:
  1. Click Sign In
  2. Prompt user for credentials or use stored
  3. Wait for redirect to dashboard
```

### Generation Failed
```
If page shows error or timeout:
  1. Log the failed page filename
  2. Continue with next page
  3. Report failures at end
  4. Option: Retry failed pages individually
```

### Export Failed
```
If Download Site Files fails:
  1. Fallback: Individual "Download HTML" for each page
  2. Or: "Copy HTML" + clipboard extraction
  3. Report partial success
```

---

## Example Session

```
User: /prompts-to-aura .pi-project/design-prompts/myproject-prompts.md

Claude:
1. Parsing prompts file...
   - Project: MyProject
   - Output: ./generated-screens
   - Pages: 8 found

2. Opening Aura.build...
   - Already logged in ✓

3. Creating project "MyProject-screens"...
   - Editor loaded ✓

4. Generating pages (batch mode):
   - [1/8] 01-landing... submitted
   - [2/8] 02-login... submitted
   - [3/8] 03-dashboard... submitted
   ...
   - [8/8] 08-settings... submitted

5. Waiting for generations (~8 minutes)...
   - Progress: 8/8 complete ✓

6. Exporting (Download Site Files)...
   - ZIP downloaded ✓

7. Extracting to ./generated-screens/...
   - 8 HTML files extracted ✓

Done! Generated 8 pages:
- ./generated-screens/01-landing.html
- ./generated-screens/02-login.html
- ./generated-screens/03-dashboard.html
...

Total time: 10 minutes
```

---

## Related Commands

- `/prd-to-design-prompts` - Generate standard format design prompts from PRD
- `/set-html-routing` - Set up routing in generated HTML files
- `/git-create` - Create Git repository and set up live link

---

## Tips

1. **Follow standard format** - Use frontmatter and `## Page: [filename]` format
2. **Leverage Design System** - Define common styles in Design System section
3. **Batch generation** - Submit consecutively without waiting to save time
4. **Download Site Files** - More efficient than individual Copy for batch operations
5. **Filename convention** - Use `## Page: 01-landing` format for easy sorting
