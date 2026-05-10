# Database Schema: {PROJECT_NAME}

## Overview

- **Database**: PostgreSQL
- **ORM**: TypeORM / Prisma
- **Migrations**: [Location of migration files]

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   Profile   │
├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │
│ email       │   └──>│ userId      │
│ password    │       │ avatar      │
│ createdAt   │       │ bio         │
└─────────────┘       └─────────────┘
```

## Tables

### users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | No | auto | Primary key |
| email | VARCHAR(255) | No | - | Unique email |
| password | VARCHAR(255) | No | - | Hashed password |
| name | VARCHAR(100) | Yes | NULL | Display name |
| role | ENUM | No | 'user' | user/admin |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

### profiles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | No | auto | Primary key |
| user_id | INTEGER | No | - | FK to users |
| avatar | VARCHAR(255) | Yes | NULL | Avatar URL |
| bio | TEXT | Yes | NULL | User bio |

## Indexes

| Table | Index | Columns | Type |
|-------|-------|---------|------|
| users | users_email_idx | email | UNIQUE |
| users | users_role_idx | role | BTREE |

## Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```
