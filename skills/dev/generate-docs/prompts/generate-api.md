# PROJECT_API.md Generation Rules

## Overview

This prompt guides the generation of the PROJECT_API.md file, which documents all REST API endpoints, authentication, request/response formats, and error handling.

---

## Document Structure

```markdown
# Project API - {PROJECT_NAME}

## Base URL
## Authentication
## Common Headers
## Response Format
## Pagination
## Error Handling
## Endpoints by Module
## Admin Endpoints
## Enum Reference
```

---

## Section Generation Rules

### 1. Base URL Section

```markdown
## Base URL

- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.example.com/api`
- **Production**: `https://api.example.com/api`

All endpoints are prefixed with `/api`.
```

### 2. Authentication Section

```markdown
## Authentication

### Methods

| Method | Description | Header |
|--------|-------------|--------|
| JWT Bearer | Primary auth method | `Authorization: Bearer <token>` |
| API Key | Service-to-service | `X-API-Key: <key>` |

### Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth/login | POST | Login with email/password |
| /auth/register | POST | Create new account |
| /auth/refresh | POST | Refresh access token |
| /auth/logout | POST | Invalidate tokens |
| /auth/forgot-password | POST | Request password reset |
| /auth/reset-password | POST | Reset password with token |

### Login Request

```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```
```

### 3. Common Headers Section

```markdown
## Common Headers

| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| Content-Type | application/json | Yes | Request body format |
| Authorization | Bearer {token} | For protected routes | JWT access token |
| Accept | application/json | Recommended | Response format |
| X-Request-ID | uuid | Optional | Request tracing |
```

### 4. Response Format Section

```markdown
## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### List Response (with pagination)

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  }
}
```
```

### 5. Pagination Section

```markdown
## Pagination

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-indexed) |
| limit | integer | 10 | Items per page (max 100) |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order (asc/desc) |

### Example

```
GET /api/ideas?page=2&limit=20&sort=title&order=asc
```

### Response Meta

```json
{
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true
  }
}
```
```

### 6. Error Handling Section

```markdown
## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 204 | No Content | Successful delete |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable | Validation error |
| 500 | Server Error | Internal error |

### Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication required |
| AUTH_INVALID | Invalid credentials |
| AUTH_EXPIRED | Token expired |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Validation failed |
| DUPLICATE_ENTRY | Resource already exists |
```

### 7. Endpoints by Module Section

**Format for each module:**

```markdown
## Endpoints by Module

### Ideas

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /ideas | No | List all published ideas |
| GET | /ideas/:id | No | Get idea by ID |
| POST | /ideas | Yes | Create new idea |
| PUT | /ideas/:id | Yes | Update own idea |
| DELETE | /ideas/:id | Yes | Delete own idea |
| POST | /ideas/:id/vote | Yes | Vote on idea |
| DELETE | /ideas/:id/vote | Yes | Remove vote |

#### List Ideas

```
GET /api/ideas?status=published&category=tech&page=1&limit=10
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| category | string | Filter by category |
| search | string | Search in title/description |
| user_id | uuid | Filter by author |

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "My Idea",
      "description": "Description here",
      "status": "published",
      "category": "tech",
      "vote_count": 42,
      "user": {
        "id": "uuid",
        "name": "John Doe"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### Create Idea

```
POST /api/ideas
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "title": "My New Idea",
  "description": "Detailed description",
  "category": "tech"
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "title": "My New Idea",
    "description": "Detailed description",
    "status": "draft",
    "category": "tech",
    "user_id": "uuid",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```
```

**Rules for each module:**

- Group endpoints by resource
- Include method, path, auth requirement
- Show request/response examples
- Document query parameters
- List possible error responses

### 8. Admin Endpoints Section

```markdown
## Admin Endpoints

All admin endpoints require `admin` or `super_admin` role.

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List all users |
| GET | /admin/users/:id | Get user details |
| PUT | /admin/users/:id | Update user |
| PUT | /admin/users/:id/role | Change user role |
| DELETE | /admin/users/:id | Deactivate user |

### Content Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/ideas/pending | List pending ideas |
| PUT | /admin/ideas/:id/approve | Approve idea |
| PUT | /admin/ideas/:id/reject | Reject idea |
| DELETE | /admin/ideas/:id | Force delete idea |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/reports | List user reports |
| PUT | /admin/reports/:id/resolve | Resolve report |
```

### 9. Enum Reference Section

```markdown
## Enum Reference

### IdeaStatusEnum

| Value | Description | Allowed Transitions |
|-------|-------------|---------------------|
| draft | Initial state | → pending |
| pending | Awaiting review | → published, rejected |
| published | Visible to users | → archived |
| rejected | Not approved | → draft |
| archived | Hidden | - |

### CategoryEnum

| Value | Display Name |
|-------|--------------|
| tech | Technology |
| business | Business |
| creative | Creative |
| social | Social Impact |

### RolesEnum

| Value | Access Level |
|-------|--------------|
| guest | 0 - Public only |
| user | 1 - Authenticated |
| admin | 2 - Admin panel |
| super_admin | 3 - Full access |
```

---

## Formatting Guidelines

1. **Endpoints**: Use code blocks for URLs
2. **Methods**: Use all caps (GET, POST, PUT, DELETE)
3. **JSON**: Use code blocks with json syntax
4. **Tables**: Use for listing multiple items
5. **Parameters**: Document type and whether required

---

## Footer

Always end with:

```markdown
---
*Generated by project-doc-writer skill*
*Last Updated: {timestamp}*
*Source: {prd_filename}*
```
