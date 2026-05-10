# Authentication Guards

## Overview

Route protection patterns for React Router 7 applications using httpOnly cookie-based authentication. Guards are implemented at the layout level to protect entire route trees.

---

## Guard Types

### 1. GuestGuard (guestOnly)
Protects auth pages (login, signup) - redirects authenticated users to their home.

### 2. RoleGuard (requiredRole)
Protects private routes - redirects unauthenticated users to login and enforces role-based access.

---

## AuthGuard Component

### Location
`frontend/app/components/auth/AuthGuard.tsx`

### Props

```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'coach' | 'patient';  // Strict role matching
  guestOnly?: boolean;                  // For auth pages
  fallback?: React.ReactNode;           // Loading spinner
}
```

### Usage Examples

```typescript
// Auth pages - redirect logged-in users to their home
<AuthGuard guestOnly>
  <LoginPage />
</AuthGuard>

// Patient-only pages
<AuthGuard requiredRole="patient">
  <PatientDashboard />
</AuthGuard>

// Coach-only pages
<AuthGuard requiredRole="coach">
  <CoachDashboard />
</AuthGuard>
```

---

## Layout-Level Protection Pattern

### Auth Layout (GuestOnly)

```typescript
// pages/auth/layout.tsx
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";

export default function AuthLayout() {
  return (
    <AuthGuard guestOnly>
      <div className="min-h-screen bg-neutral-50">
        <Outlet />
      </div>
    </AuthGuard>
  );
}
```

### Patient Layout (Role Required)

```typescript
// pages/patient/layout.tsx
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";

export default function PatientLayout() {
  return (
    <AuthGuard requiredRole="patient">
      <div className="...">
        <Outlet />
        <BottomNav variant="patient" />
      </div>
    </AuthGuard>
  );
}
```

### Coach Layout (Role Required)

```typescript
// pages/coach/layout.tsx
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";

export default function CoachLayout() {
  return (
    <AuthGuard requiredRole="coach">
      <div className="...">
        <Outlet />
        <BottomNav variant="coach" />
      </div>
    </AuthGuard>
  );
}
```

---

## Guard Decision Matrix

| Route Type | Guard Config | isLoading | !isAuthenticated | Wrong Role |
|------------|--------------|-----------|------------------|------------|
| Public (/, /about) | None | N/A | N/A | N/A |
| Auth (/login, /signup) | `guestOnly` | Spinner | Allow | N/A |
| Coach (/coach/*) | `requiredRole="coach"` | Spinner | → /login | → /patient |
| Patient (/patient/*) | `requiredRole="patient"` | Spinner | → /login | → /coach |

---

## Auth State Dependencies

The AuthGuard depends on Redux auth state:

```typescript
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;  // Set after initial auth check
  error: string | null;
}
```

### Key State Flags

- **isInitialized**: Set to `true` after initial auth check (success or failure)
- **isLoading**: `true` during auth operations
- **isAuthenticated**: `true` when user is logged in

---

## Auth Utility Functions

### Location
`frontend/app/lib/utils/auth.ts`

### Available Functions

```typescript
// Check if role is coach
isCoachRole(role: string | number | undefined): boolean

// Map backend user to AuthUser
mapToAuthUser(backendUser: BackendUser): AuthUser

// Get home route for role
getHomeRouteForRole(role: UserRole): string  // '/coach' or '/patient'

// Check if path is public auth path
isPublicAuthPath(pathname: string): boolean
```

---

## Best Practices

### DO

- Guard at layout level, not individual pages
- Show loading spinner during auth check (prevent flash of content)
- Use `replace: true` on Navigate to prevent back-button issues
- Check role AFTER authentication check
- Use the `isInitialized` flag to prevent premature redirects

### DON'T

- Guard every individual page component
- Skip loading state (causes flash of wrong content)
- Redirect without `replace` (creates broken history)
- Check role without checking authentication first
- Rely on localStorage for auth (use httpOnly cookies)

---

## Implementation Checklist

When implementing auth guards:

1. [ ] AuthGuard component created with proper props
2. [ ] Auth layout uses `guestOnly` prop
3. [ ] Protected layouts use `requiredRole` prop
4. [ ] Redux authSlice has `isInitialized` flag
5. [ ] AuthInitializer calls `setInitialized()` on completion
6. [ ] Loading skeleton shown during auth check
7. [ ] Redirects use `replace: true`

---

## Related Files

- [authentication.md](./authentication.md) - Core auth patterns
- [common-patterns.md](./common-patterns.md) - Redux patterns
- `frontend/app/components/auth/AuthGuard.tsx` - Guard component
- `frontend/app/lib/utils/auth.ts` - Auth utilities
- `frontend/app/redux/features/authSlice.ts` - Auth state
