# PROJECT_DATABASE.md Generation Rules

## Overview

This prompt guides the generation of the PROJECT_DATABASE.md file, which documents the database schema, entities, relationships, and data model.

---

## Document Structure

```markdown
# Project Database - {PROJECT_NAME}

## Entity Overview
## Entity Relationship Diagram
## Entity Specifications
## Enum Definitions
## Indexes
## Migration Commands
## Design Decisions
```

---

## Section Generation Rules

### 1. Entity Overview Section

**Format as table:**

```markdown
## Entity Overview

| Entity | Description | Key Fields | Relationships |
|--------|-------------|------------|---------------|
| User | Platform users | id, email, role | Has many Ideas, Votes |
| Idea | User submissions | id, title, status | Belongs to User, Has many Votes |
| Vote | Voting records | id, value, user_id | Belongs to User, Idea |
```

**Rules:**

- One row per entity
- List 3-4 key fields
- Summarize relationships
- Order by dependency (parent entities first)

### 2. Entity Relationship Diagram Section

**Format as ASCII art:**

```markdown
## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│     User     │       │     Idea     │
├──────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)      │
│ email        │   │   │ title        │
│ password     │   │   │ description  │
│ role         │   └──→│ user_id (FK) │
│ created_at   │       │ status       │
└──────────────┘       └──────────────┘
        │                     │
        │                     │
        ▼                     ▼
┌──────────────┐       ┌──────────────┐
│     Vote     │       │   Comment    │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │       │ user_id (FK) │
│ idea_id (FK) │       │ idea_id (FK) │
│ value        │       │ content      │
└──────────────┘       └──────────────┘
```
```

**Rules:**

- Use box-drawing characters for entities
- Show PK and FK labels
- Draw arrows for relationships
- Keep diagram readable (split into sections if needed)

### 3. Entity Specifications Section

**Format for each entity:**

```markdown
## Entity Specifications

### User

**Description**: Represents platform users including guests, regular users, and administrators.

**Columns**:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| email | varchar(255) | No | - | Unique email address |
| password_hash | varchar(255) | No | - | Bcrypt hashed password |
| first_name | varchar(100) | Yes | null | User's first name |
| last_name | varchar(100) | Yes | null | User's last name |
| role | RolesEnum | No | 'user' | User role |
| is_active | boolean | No | true | Account active status |
| created_at | timestamp | No | now() | Creation timestamp |
| updated_at | timestamp | No | now() | Last update timestamp |

**Relationships**:
- Has many `Idea` (user_id)
- Has many `Vote` (user_id)
- Has many `Comment` (user_id)

**Indexes**:
- `idx_user_email` on (email) - unique
- `idx_user_role` on (role)
```

**Rules:**

- One subsection per entity
- Include all columns with types
- Specify nullable and default values
- List all relationships with FK column
- Document indexes

### 4. Enum Definitions Section

**Format:**

```markdown
## Enum Definitions

### RolesEnum

| Value | Description |
|-------|-------------|
| guest | Unauthenticated user |
| user | Regular registered user |
| admin | Platform administrator |
| super_admin | Full system access |

### StatusEnum

| Value | Description |
|-------|-------------|
| draft | Not yet published |
| pending | Awaiting review |
| published | Visible to users |
| archived | Hidden from view |
```

**Rules:**

- One subsection per enum
- Use tables for values
- Include description for each value
- Use snake_case for enum values

### 5. Indexes Section

**Format:**

```markdown
## Indexes

### Performance Indexes

| Index Name | Table | Columns | Type | Purpose |
|------------|-------|---------|------|---------|
| idx_idea_user | ideas | user_id | btree | Query ideas by user |
| idx_idea_status | ideas | status | btree | Filter by status |
| idx_vote_composite | votes | user_id, idea_id | btree, unique | Prevent duplicate votes |

### Full-Text Search Indexes

| Index Name | Table | Columns | Type |
|------------|-------|---------|------|
| idx_idea_search | ideas | title, description | GIN |
```

**Rules:**

- Group by index type
- Include purpose for each index
- Specify unique constraints
- Document composite indexes

### 6. Migration Commands Section

**Format:**

```markdown
## Migration Commands

### Generate New Migration

```bash
npm run migration:generate -- src/database/migrations/CreateTableName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```
```

**Rules:**

- Include all common migration commands
- Use code blocks with bash syntax
- Add comments for each command

### 7. Design Decisions Section

**Format:**

```markdown
## Design Decisions

### Soft Deletes

All entities use soft delete pattern with `deleted_at` timestamp column instead of hard deletes. This preserves data integrity and allows recovery.

### UUID Primary Keys

Using UUIDs instead of auto-increment integers for:
- Better distributed system support
- No sequential ID exposure
- Easier data migration

### Timestamp Columns

All entities include:
- `created_at`: Immutable creation timestamp
- `updated_at`: Auto-updated on changes
- `deleted_at`: Null unless soft-deleted
```

**Rules:**

- Document key architectural decisions
- Explain reasoning
- Group related decisions

---

## Formatting Guidelines

1. **Entity names**: PascalCase (User, Idea, Vote)
2. **Column names**: snake_case (created_at, user_id)
3. **Tables**: Always use markdown tables for structured data
4. **Code blocks**: Use for SQL, commands, diagrams
5. **Relationships**: Use standard notation (Has many, Belongs to)

---

## Footer

Always end with:

```markdown
---
*Generated by project-doc-writer skill*
*Last Updated: {timestamp}*
*Source: {prd_filename}*
```
