---
name: generate-prd
description: Generate comprehensive Product Requirements Documents from client input
---

# Generate PRD

Generate a structured Product Requirements Document (PRD) for any software project. This skill provides generic templates and guidelines for each required section, adaptable to any product type.

---

## Quick Start

When asked to generate a PRD, gather project context first, then assemble the document using the section templates in the resource files.

**Typical invocations:**
```
generate prd
write product requirements document for [project]
create prd
```

**Before generating:** Ask the user for:
1. Product name and brief description
2. Target users (who uses it?)
3. Main technology choices (if known)
4. Scope — full product or specific feature?

---

## PRD Output Structure

```markdown
# [Product Name] — Product Requirements Document

## 0. Project Overview
## 1. Terminology
## 2. System Modules
## 3. User Application
  ### 3.1 Page Architecture
  ### 3.2 Feature List by Page
## 4. Admin Dashboard
  ### 4.1 Page Architecture
  ### 4.2 Feature List by Page
## 5. Tech Stack
## 6. Open Questions
```

---

## Section Templates

| Section | Template File | Purpose |
|---------|--------------|---------|
| Project Overview | [resources/project-overview.md](resources/project-overview.md) | Product description, goals, audience, user types, MVP scope |
| Terminology | [resources/terminology.md](resources/terminology.md) | Define all project-specific terms |
| System Modules | [resources/modules.md](resources/modules.md) | Major feature areas with step-by-step technical flows |
| User App Architecture | [resources/user-app-architecture.md](resources/user-app-architecture.md) | Routes and page map for the user-facing app |
| User App Features | [resources/user-app-architecture.md](resources/user-app-architecture.md) | Feature list per page for user app |
| Admin Dashboard Architecture | [resources/admin-dashboard-architecture.md](resources/admin-dashboard-architecture.md) | Routes and page map for admin |
| Admin Dashboard Features | [resources/admin-dashboard-architecture.md](resources/admin-dashboard-architecture.md) | Feature list per page for admin |
| Tech Stack | [resources/tech-stack.md](resources/tech-stack.md) | Technologies, integrations, infrastructure |
| Open Questions | [resources/open-questions.md](resources/open-questions.md) | Unresolved decisions and client dependencies |

→ Full assembled template: [resources/prd-template.md](resources/prd-template.md)

---

## Guidelines

- **Project Overview first** — sets context before any technical details
- **Modules before pages** — explain how features work end-to-end before detailing each screen
- Use tables for page architecture and feature lists — easier to scan
- Every page gets its own feature list subsection
- Terminology comes first so readers share the same vocabulary
- Tech stack includes versions, purpose, and key decisions
- Keep descriptions concise — one sentence per feature is enough
- If admin dashboard doesn't exist, skip Section 4
- **Open Questions last** — living list, remove entries when resolved

---

**Line Count**: < 500 ✅
**Scope**: Generic — applies to any project ✅
