# New Project Database Schema Example

> This file is loaded by the `new-project` command during Step 7.8.2.
> Contains the example ERD diagram and full table definitions showing the expected
> database schema extraction format from a PRD document.
>
> **Source**: Extracted from `commands/dev/new-project.md` for context window optimization.

---

## Entity Relationship Diagram

### Application ERD

This ERD represents the application's database schema as specified in the PRD.

```
┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│            users                 │              │          dashboards              │
├──────────────────────────────────┤              ├──────────────────────────────────┤
│ 🔑 id (PK)          UUID         │──────1:N─────│ 🔑 id (PK)          UUID         │
│   email             VARCHAR(255) │   (creator)  │ 🔗 user_id (FK)     UUID         │
│   password          VARCHAR(255) │              │   name              VARCHAR(255) │
│   name              VARCHAR(100) │              │   description       TEXT         │
│   role              ENUM         │              │   layout            JSONB        │
│   created_at        TIMESTAMP    │              │   is_public         BOOLEAN      │
│   updated_at        TIMESTAMP    │              │   created_at        TIMESTAMP    │
└──────────────────────────────────┘              │   updated_at        TIMESTAMP    │
                │                                 └──────────────────────────────────┘
                │ 1:N                                            │
                │ (creator)                                      │ 1:N (parent)
                ▼                                                ▼
┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│            alerts                │              │           widgets                │
├──────────────────────────────────┤              ├──────────────────────────────────┤
│ 🔑 id (PK)          UUID         │              │ 🔑 id (PK)          UUID         │
│ 🔗 user_id (FK)     UUID         │              │ 🔗 dashboard_id (FK) UUID        │
│   name              VARCHAR(255) │              │ 🔗 data_source_id (FK) UUID      │
│   metric            VARCHAR(255) │              │   type              ENUM         │
│   threshold_type    ENUM         │              │   config            JSONB        │
│   threshold_value   DECIMAL      │              │   query             TEXT         │
│   status            ENUM         │              │   position          JSONB        │
│   created_at        TIMESTAMP    │              │   refresh_interval  INTEGER      │
│   updated_at        TIMESTAMP    │              │   created_at        TIMESTAMP    │
└──────────────────────────────────┘              │   updated_at        TIMESTAMP    │
                                                  └──────────────────────────────────┘

┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│         data_sources             │              │           reports                │
├──────────────────────────────────┤              ├──────────────────────────────────┤
│ 🔑 id (PK)          UUID         │              │ 🔑 id (PK)          UUID         │
│   name              VARCHAR(255) │              │ 🔗 dashboard_id (FK) UUID        │
│   type              ENUM         │              │   name              VARCHAR(255) │
│   connection_config JSONB        │              │   schedule          VARCHAR(50)  │
│   status            ENUM         │              │   format            ENUM         │
│   last_sync         TIMESTAMP    │              │   recipients        TEXT[]       │
│   created_at        TIMESTAMP    │              │   created_at        TIMESTAMP    │
└──────────────────────────────────┘              │   next_run          TIMESTAMP    │
                                                  └──────────────────────────────────┘

┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│         data_models              │              │          workflows               │
├──────────────────────────────────┤              ├──────────────────────────────────┤
│ 🔑 id (PK)          UUID         │              │ 🔑 id (PK)          UUID         │
│ 🔗 user_id (FK)     UUID         │              │ 🔗 requester_id (FK) UUID        │
│   name              VARCHAR(255) │              │ 🔗 approver_id (FK) UUID         │
│   query             TEXT         │              │   type              ENUM         │
│   tables            JSONB        │              │   status            ENUM         │
│   created_at        TIMESTAMP    │              │   request_data      JSONB        │
│   updated_at        TIMESTAMP    │              │   created_at        TIMESTAMP    │
└──────────────────────────────────┘              │   resolved_at       TIMESTAMP    │
                                                  └──────────────────────────────────┘

┌──────────────────────────────────┐              ┌──────────────────────────────────┐
│       dashboard_shares           │              │          audit_logs              │
│      (Junction Table)            │              ├──────────────────────────────────┤
├──────────────────────────────────┤              │ 🔑 id (PK)          UUID         │
│ 🔑🔗 dashboard_id (PK,FK) UUID   │              │ 🔗 user_id (FK)     UUID         │
│ 🔑🔗 user_id (PK,FK)     UUID    │              │   action            VARCHAR(255) │
│ 🔗 shared_by (FK)        UUID    │              │   resource_type     VARCHAR(100) │
│   permission             ENUM    │              │   resource_id       UUID         │
│   created_at             TIMESTAMP│             │   details           JSONB        │
└──────────────────────────────────┘              │   ip_address        INET         │
                                                  │   created_at        TIMESTAMP    │
┌──────────────────────────────────┐              └──────────────────────────────────┘
│           api_keys               │
├──────────────────────────────────┤
│ 🔑 id (PK)          UUID         │
│ 🔗 user_id (FK)     UUID         │
│   key_hash          VARCHAR(255) │
│   name              VARCHAR(255) │
│   permissions       JSONB        │
│   last_used         TIMESTAMP    │
│   expires_at        TIMESTAMP    │
│   created_at        TIMESTAMP    │
└──────────────────────────────────┘

Legend:
🔑 Primary Key (PK)
🔗 Foreign Key (FK)
──  Relationship line
1:1 One-to-One relationship
1:N One-to-Many relationship
N:N Many-to-Many relationship (requires junction table with composite PK)
```

## Entity Relationships

### One-to-Many (1:N)

| Parent | Child | Relationship | FK Column | Constraint |
|--------|-------|--------------|-----------|------------|
| users | dashboards | One user creates many dashboards | dashboards.user_id -> users.id | ON DELETE CASCADE |
| users | alerts | One user creates many alerts | alerts.user_id -> users.id | ON DELETE CASCADE |
| users | data_models | One analyst creates many models | data_models.user_id -> users.id | ON DELETE CASCADE |
| dashboards | widgets | One dashboard has many widgets | widgets.dashboard_id -> dashboards.id | ON DELETE CASCADE |
| dashboards | reports | One dashboard has many reports | reports.dashboard_id -> dashboards.id | ON DELETE CASCADE |
| data_sources | widgets | One data source used by many widgets | widgets.data_source_id -> data_sources.id | ON DELETE SET NULL |
| users | workflows | One user initiates many workflows | workflows.requester_id -> users.id | ON DELETE CASCADE |
| users | audit_logs | One user generates many audit logs | audit_logs.user_id -> users.id | ON DELETE CASCADE |
| users | api_keys | One admin generates many API keys | api_keys.user_id -> users.id | ON DELETE CASCADE |

### Many-to-Many (N:N)

| Entity 1 | Entity 2 | Junction Table | Composite PK | Description |
|----------|----------|----------------|--------------|-------------|
| dashboards | users | dashboard_shares | (dashboard_id, user_id) | Users can access shared dashboards |

## Tables

### users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| email | VARCHAR(255) | No | - | Unique email address |
| password | VARCHAR(255) | No | - | Hashed password |
| name | VARCHAR(100) | Yes | NULL | Display name |
| role | ENUM | No | 'business_user' | business_user, analyst, ops_manager, admin |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- UNIQUE (email)

### dashboards

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | FK to users.id (creator) |
| name | VARCHAR(255) | No | - | Dashboard name |
| description | TEXT | Yes | NULL | Dashboard description |
| layout | JSONB | No | '[]' | Widget layout configuration |
| is_public | BOOLEAN | No | false | Public visibility |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### widgets

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| dashboard_id | UUID | No | - | FK to dashboards.id |
| data_source_id | UUID | Yes | NULL | FK to data_sources.id |
| type | ENUM | No | - | chart, table, metric, etc. |
| config | JSONB | No | '{}' | Widget configuration |
| query | TEXT | Yes | NULL | SQL query for data |
| position | JSONB | No | '{}' | Position and size |
| refresh_interval | INTEGER | Yes | NULL | Auto-refresh interval (seconds) |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
- FOREIGN KEY (data_source_id) REFERENCES data_sources(id) ON DELETE SET NULL

### alerts

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | FK to users.id (creator) |
| name | VARCHAR(255) | No | - | Alert name |
| metric | VARCHAR(255) | No | - | Metric to monitor |
| threshold_type | ENUM | No | - | greater_than, less_than, equals |
| threshold_value | DECIMAL | No | - | Threshold value |
| status | ENUM | No | 'active' | active, triggered, snoozed, resolved |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### data_sources

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| name | VARCHAR(255) | No | - | Data source name |
| type | ENUM | No | - | postgresql, mysql, bigquery, etc. |
| connection_config | JSONB | No | '{}' | Connection configuration (encrypted) |
| status | ENUM | No | 'pending' | pending, connected, error |
| last_sync | TIMESTAMP | Yes | NULL | Last metadata sync |
| created_at | TIMESTAMP | No | NOW() | Creation time |

**Constraints:**
- UNIQUE (name)

### reports

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| dashboard_id | UUID | No | - | FK to dashboards.id |
| name | VARCHAR(255) | No | - | Report name |
| schedule | VARCHAR(50) | No | - | Cron expression |
| format | ENUM | No | 'pdf' | pdf, csv, excel |
| recipients | TEXT[] | No | '{}' | Email recipients |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| next_run | TIMESTAMP | Yes | NULL | Next scheduled run |

**Constraints:**
- FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE

### data_models

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | FK to users.id (analyst) |
| name | VARCHAR(255) | No | - | Model name |
| query | TEXT | No | - | SQL query defining the model |
| tables | JSONB | No | '[]' | Referenced tables |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| updated_at | TIMESTAMP | No | NOW() | Last update |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### workflows

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| requester_id | UUID | No | - | FK to users.id |
| approver_id | UUID | Yes | NULL | FK to users.id |
| type | ENUM | No | - | dashboard_publish, data_source_add, etc. |
| status | ENUM | No | 'pending' | pending, approved, rejected |
| request_data | JSONB | No | '{}' | Workflow request data |
| created_at | TIMESTAMP | No | NOW() | Creation time |
| resolved_at | TIMESTAMP | Yes | NULL | Resolution time |

**Constraints:**
- FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL

### dashboard_shares

Junction table for N:N relationship between dashboards and users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| dashboard_id | UUID | No | - | FK to dashboards.id |
| user_id | UUID | No | - | FK to users.id |
| shared_by | UUID | No | - | FK to users.id (who shared) |
| permission | ENUM | No | 'view' | view, edit |
| created_at | TIMESTAMP | No | NOW() | Share time |

**Constraints:**
- Primary Key: (dashboard_id, user_id)
- FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE

### audit_logs

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | Yes | NULL | FK to users.id |
| action | VARCHAR(255) | No | - | Action performed |
| resource_type | VARCHAR(100) | No | - | Resource type (dashboard, user, etc.) |
| resource_id | UUID | Yes | NULL | Resource ID |
| details | JSONB | No | '{}' | Additional details |
| ip_address | INET | Yes | NULL | IP address |
| created_at | TIMESTAMP | No | NOW() | Action timestamp |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

### api_keys

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| user_id | UUID | No | - | FK to users.id (admin) |
| key_hash | VARCHAR(255) | No | - | Hashed API key |
| name | VARCHAR(255) | No | - | Key description |
| permissions | JSONB | No | '[]' | Permission scope |
| last_used | TIMESTAMP | Yes | NULL | Last usage timestamp |
| expires_at | TIMESTAMP | Yes | NULL | Expiration timestamp |
| created_at | TIMESTAMP | No | NOW() | Creation time |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- UNIQUE (key_hash)
