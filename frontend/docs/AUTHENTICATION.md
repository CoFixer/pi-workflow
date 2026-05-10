# Authentication Architecture

## Overview

The ActivityCoaching platform uses **httpOnly cookie-based authentication** for secure session management. This document provides a high-level overview of the authentication architecture.

---

## Security Model

### Why httpOnly Cookies?

| Storage Method | XSS Vulnerable | CSRF Vulnerable | Recommendation |
|----------------|----------------|-----------------|----------------|
| localStorage | YES | No | NOT recommended |
| sessionStorage | YES | No | NOT recommended |
| httpOnly Cookie | No | Possible (mitigated) | RECOMMENDED |

### Cookie Configuration

```
httpOnly: true      # JavaScript cannot access
secure: true        # HTTPS only (production)
sameSite: 'none'    # Cross-origin requests allowed
```

---

## Authentication Flow

```
User Login
    ↓
POST /auth/login (username, password)
    ↓
Backend validates credentials
    ↓
Backend sets httpOnly cookies (access + refresh tokens)
    ↓
Frontend receives user data (no tokens in response body)
    ↓
dispatch(loginSuccess(user)) → Redux state updated
    ↓
AuthGuard allows access to protected routes

---

App Load (Refresh)
    ↓
AuthInitializer runs
    ↓
GET /auth/check-login (cookies sent automatically)
    ↓
Backend validates cookies
    ↓
Valid? → loginSuccess(user)
Invalid? → setInitialized() (user stays logged out)
    ↓
AuthGuard makes routing decisions
```

---

## Role-Based Access Control

### Roles

| Role | Backend Value | Dashboard | Description |
|------|---------------|-----------|-------------|
| COACH | 'COACH' or 4 | /coach | Physical therapists, trainers |
| PATIENT | 'PATIENT' | /patient | Users receiving coaching |

### Route Protection

| Route Pattern | Guard | Behavior |
|---------------|-------|----------|
| `/`, `/login`, `/signup` | `guestOnly` | Redirect logged-in users to home |
| `/coach/*` | `requiredRole="coach"` | Require coach role |
| `/patient/*` | `requiredRole="patient"` | Require patient role |

---

## Key Components

### 1. AuthGuard Component
**Location**: `frontend/app/components/auth/AuthGuard.tsx`

Wraps layouts to enforce authentication rules:
- `guestOnly`: Block authenticated users (for auth pages)
- `requiredRole`: Require specific role

### 2. Auth Utilities
**Location**: `frontend/app/lib/utils/auth.ts`

```typescript
mapToAuthUser(backendUser)    // Map API user to AuthUser
getHomeRouteForRole(role)     // Get home route for role
isCoachRole(role)             // Check if role is coach
```

### 3. Redux Auth Slice
**Location**: `frontend/app/redux/features/authSlice.ts`

```typescript
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
```

### 4. AuthInitializer
**Location**: `frontend/app/hooks/providers/providers.tsx`

Runs on app load to restore session from cookies.

---

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | No | Authenticate user |
| `/auth/logout` | GET | Yes | Clear session |
| `/auth/check-login` | GET | Yes | Validate session |
| `/auth/register` | POST | No | Create account |
| `/auth/refresh-access-token` | GET | No | Refresh token |

---

## Troubleshooting

### Flash of login page on protected routes
**Cause**: `isInitialized` not checked before routing
**Solution**: Ensure AuthGuard waits for `isInitialized: true`

### Infinite redirect loops
**Cause**: Redirect happening on every render
**Solution**: Check current path before redirecting

### Auth state not persisting
**Cause**: Cookies not being sent with requests
**Solution**: Ensure `withCredentials: true` in httpService

### Role check failing
**Cause**: Backend returns role as string ('COACH') or number (4)
**Solution**: Use `isCoachRole()` utility which handles both

---

## Implementation Guides

For detailed implementation patterns, see:

- [Authentication Patterns](authentication.md)
- [Auth Guards](auth-guards.md)
- [Common Patterns](common-patterns.md)
