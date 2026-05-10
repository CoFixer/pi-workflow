# PRD Analysis Instructions

## Overview

This prompt guides the extraction of structured data from PRD (Product Requirements Document) files for documentation generation.

---

## Extraction Process

### Step 1: Identify PRD Format

- **PDF**: Read using Claude's PDF capability
- **Markdown**: Parse directly
- **Multiple files**: Combine or prioritize by version number

### Step 2: Extract Project Metadata

```yaml
metadata:
  project_name: ""          # REQUIRED
  version: ""               # e.g., "1.0", "2.1"
  description: ""           # 2-3 sentence summary
  differentiator: ""        # Key unique value proposition
  client_name: ""           # Optional
  status: ""                # Draft, Review, Approved, In Development
  created_date: ""
  tech_stack:
    backend: ""             # e.g., "NestJS, TypeORM, PostgreSQL"
    frontend: ""            # e.g., "React, Redux, TypeScript"
    admin: ""               # e.g., "React Admin Dashboard"
    database: ""            # e.g., "PostgreSQL"
    auth: []                # e.g., ["JWT", "Email/Password", "Google OAuth"]
```

### Step 3: Extract User Types

For each user type mentioned in the PRD:

```yaml
user_types:
  - name: ""                # e.g., "Guest", "User", "Admin"
    description: ""         # What this user type represents
    access_level: ""        # e.g., "public", "authenticated", "admin"
    permissions:
      - ""                  # List of specific permissions
    features:
      - ""                  # List of features available to this user
```

**Common patterns to look for:**

- "Guest users can..."
- "Authenticated users have access to..."
- "Admin users can manage..."
- Role-based access control sections
- Permission matrices

### Step 4: Extract Database Entities

**Explicit entities**: Look for database schema sections, ER diagrams, or entity lists.

**Inferred entities**: Extract from feature descriptions:

| Feature Pattern | Inferred Entity |
|-----------------|-----------------|
| "users can submit ideas" | User, Idea |
| "voting on ideas" | Vote |
| "comments section" | Comment |
| "file uploads" | Media/Attachment |
| "save for later" | SavedItem |
| "admin reports" | Report |

For each entity:

```yaml
entities:
  - name: ""                # PascalCase, e.g., "User", "Idea"
    description: ""         # What this entity represents
    columns:
      - name: ""            # snake_case, e.g., "created_at"
        type: ""            # e.g., "uuid", "string", "integer", "timestamp"
        nullable: false     # true/false
        default: null       # default value if any
        constraints: []     # e.g., ["unique", "primary"]
    relationships:
      - type: ""            # "one-to-many", "many-to-one", "many-to-many"
        target: ""          # Related entity name
        description: ""     # e.g., "User has many Ideas"
    indexes:
      - columns: []         # Columns in the index
        unique: false       # Is it a unique index?
```

### Step 5: Extract API Endpoints

**Inferred from features:**

| Feature | HTTP Method | Endpoint Pattern |
|---------|-------------|------------------|
| "list all X" | GET | /api/x |
| "view X details" | GET | /api/x/:id |
| "create new X" | POST | /api/x |
| "update X" | PUT/PATCH | /api/x/:id |
| "delete X" | DELETE | /api/x/:id |
| "search X" | GET | /api/x?query=... |
| "filter by Y" | GET | /api/x?y=... |

For each endpoint:

```yaml
endpoints:
  - method: ""              # GET, POST, PUT, PATCH, DELETE
    path: ""                # e.g., "/api/ideas/:id"
    description: ""         # What this endpoint does
    auth_required: true     # true/false
    roles: []               # Which user types can access
    request_body: {}        # For POST/PUT/PATCH
    query_params: []        # For GET with filters
    response: {}            # Expected response structure
```

### Step 6: Extract Features

Group features by user type:

```yaml
features:
  public:                   # Available to all
    - name: ""
      description: ""
      pages: []             # Related pages/screens
      priority: ""          # high, medium, low

  authenticated:            # Logged-in users
    - name: ""
      description: ""
      pages: []
      priority: ""

  admin:                    # Admin only
    - name: ""
      description: ""
      pages: []
      priority: ""
```

---

## Output Format

Return a structured JSON object:

```json
{
  "metadata": {
    "project_name": "...",
    "version": "...",
    "description": "...",
    "tech_stack": {...}
  },
  "user_types": [...],
  "entities": [...],
  "endpoints": [...],
  "features": {
    "public": [...],
    "authenticated": [...],
    "admin": [...]
  },
  "enums": [...],
  "pages": {
    "public": [...],
    "user": [...],
    "admin": [...]
  }
}
```

---

## Common PRD Sections to Look For

1. **Executive Summary / Overview** → metadata
2. **User Roles / Personas** → user_types
3. **Functional Requirements** → features
4. **Non-Functional Requirements** → constraints
5. **Database Design / Data Model** → entities
6. **API Specification** → endpoints
7. **Screen Designs / Wireframes** → pages
8. **Tech Stack / Architecture** → metadata.tech_stack

---

## Handling Missing Information

If certain information is not in the PRD:

1. **User types**: Default to Guest, User, Admin
2. **Entities**: Infer from features
3. **Endpoints**: Infer standard CRUD from entities
4. **Tech stack**: Leave as "TBD" or infer from context

Mark inferred items with `[inferred]` in descriptions.
