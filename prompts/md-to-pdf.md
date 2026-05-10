---
description: Convert a markdown file to PDF using md-to-pdf
argument-hint: <path-to-markdown-file>
---

# Markdown to PDF Converter

Convert a markdown file to PDF format using the `md-to-pdf` npm package.

---

## Usage

```bash
/md-to-pdf /path/to/file.md
/md-to-pdf .pi-project/prd/MyApp_PRD_260115.md
```

---

## Step 1: Validate Input

Read the file path from `$ARGUMENTS`.

**Validation checks:**
1. File path is provided
2. File exists and is readable
3. File has `.md` extension

**If validation fails**, output error and stop:
```
Error: [specific error message]
Usage: /md-to-pdf /path/to/file.md
```

---

## Step 2: Check md-to-pdf Availability

Check if `md-to-pdf` is available:

```bash
npx md-to-pdf --version 2>/dev/null || echo "NOT_FOUND"
```

**If not found**, inform user:
```
The md-to-pdf package will be downloaded on first use via npx.
This may take a moment...
```

---

## Step 3: Convert to PDF

Run the conversion:

```bash
npx md-to-pdf "[input-file-path]"
```

**Default behavior:**
- Output PDF is saved in the same directory as input file
- Output filename: `[input-filename].pdf` (e.g., `MyApp_PRD_260115.md` → `MyApp_PRD_260115.pdf`)

---

## Step 4: Verify Output

After conversion, verify the PDF was created:

```bash
ls -la "[output-pdf-path]"
```

**If file exists**, report success:
```markdown
## PDF Generated Successfully

**Input:** [input-file-path]
**Output:** [output-pdf-path]
**Size:** [file-size]
```

**If file doesn't exist**, report error:
```
Error: PDF generation failed. Please check:
1. The input file is valid markdown
2. You have write permissions in the output directory
3. md-to-pdf is working correctly
```

---

## Error Handling

**No file path provided:**
```
Error: No file path provided.
Usage: /md-to-pdf /path/to/file.md
```

**File not found:**
```
Error: File not found: [path]
Please check the file path and try again.
```

**Invalid file type:**
```
Error: File must be a markdown file (.md)
Provided: [path]
```

**Conversion failed:**
```
Error: PDF conversion failed.
[Error details from md-to-pdf]

Troubleshooting:
1. Ensure the markdown file is valid
2. Check write permissions in the output directory
3. Try running manually: npx md-to-pdf "[path]"
```

---

## Example

Running `/md-to-pdf .pi-project/prd/HealthBridge_PRD_260115.md`:

```
## PDF Generated Successfully

**Input:** .pi-project/prd/HealthBridge_PRD_260115.md
**Output:** .pi-project/prd/HealthBridge_PRD_260115.pdf
**Size:** 245 KB
```

---

## Notes

- Uses `npx md-to-pdf` which auto-downloads the package if not installed
- Supports GitHub-flavored markdown
- Includes syntax highlighting for code blocks
- PDF styling follows md-to-pdf defaults (can be customized with CSS)
