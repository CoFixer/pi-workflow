---
description: Convert PRD PDF file to structured markdown format
argument-hint: Path to the PDF file (e.g., /path/to/prd.pdf)
---

You are a PRD (Product Requirement Document) analyst. Your task is to convert a PDF document into a structured markdown file following the standard PRD format.

## Input

PDF File Path: $ARGUMENTS

## Step 1: Validate Input

1. Check if the file path is provided
2. Verify the file exists and is readable
3. Confirm it's a PDF file (ends with .pdf)

If validation fails, report the error and stop.

## Step 2: Read the PDF

Use the Read tool to read the PDF file. Claude Code can read PDF files directly.

## Step 3: Extract and Structure Content

Analyze the PDF content and extract information for these 6 sections:

### 3.1 Overview
- Look for: Executive summary, introduction, project description, goals
- Extract the high-level purpose and scope of the product

### 3.2 Terminology
- Look for: Glossary, definitions, acronyms, domain-specific terms
- Create a table with Term and Definition columns

### 3.3 User Types
- Look for: User roles, personas, actors, user permissions
- Identify all user types and their access levels/permissions

### 3.4 Project Structure
- Look for: System architecture, application components, tech stack
- Identify: Frontend, Backend, Admin Dashboard, other dashboards
- Note any microservices or separate applications

### 3.5 Page Architecture
- Look for: Navigation structure, page hierarchy, sitemap, user flows
- Describe how pages are organized and connected

### 3.6 Page List with Features
- Look for: Feature list, requirements, user stories, functional specs
- Create a table mapping pages to their features

## Step 4: Generate Markdown

Create the markdown file with this exact structure:

```markdown
# [Document Title]

> **Source**: [original filename]
> **Converted**: [today's date]

## 1. Overview

[Extracted overview content]

## 2. Terminology

| Term | Definition |
|------|------------|
| [term] | [definition] |

## 3. User Types

### [User Type Name]
- **Description**: [description]
- **Permissions**: [list of permissions]

## 4. Project Structure

### Frontend
[Frontend application details]

### Backend
[Backend service details]

### Admin Dashboard
[Admin dashboard details]

### [Other Dashboards]
[Other dashboard details if applicable]

## 5. Page Architecture

[Page hierarchy and navigation structure]

## 6. Page List with Features

| Page Name | Features | User Type | Priority |
|-----------|----------|-----------|----------|
| [page] | [feature list] | [user type] | [P0/P1/P2] |

---
*Generated from PRD PDF using /pdf-to-prd skill*
```

## Step 5: Save Output

1. Create output directory if needed:
   ```bash
   mkdir -p .project/prd
   ```

2. Save the markdown file:
   - Filename: [original-pdf-name].md (without .pdf extension)
   - Location: .project/prd/

3. Report the output file location

## Step 6: Summary Report

After conversion, provide:
- Confirmation of successful conversion
- Output file path
- Summary of sections extracted
- Any sections that were missing or inferred

## Error Handling

- **File not found**: Report the error and suggest checking the path
- **Not a PDF**: Report that only PDF files are supported
- **Unreadable PDF**: Report that the PDF could not be read
- **Missing sections**: Note which sections couldn't be extracted from the source

## Example Usage

**Input:**
```
/pdf-to-prd /Users/user/Documents/coaching-record-prd.pdf
```

**Output:**
- File created: `.project/prd/coaching-record-prd.md`
- Sections extracted: Overview, Terminology, User Types, Project Structure, Page Architecture, Page List
