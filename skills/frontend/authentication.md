# Authentication Patterns

## Overview

The frontend uses **httpOnly cookie-based authentication** for secure session management. Authentication state is managed via Redux, and routes are protected at the layout level using custom auth guards.

---

## Security Architecture

### httpOnly Cookies

- **Backend**: Sets authentication tokens as httpOnly cookies via `SetToken` interceptor
- **Frontend**: Automatically includes cookies with requests via `withCredentials: true`
- **Security**: JavaScript cannot access tokens, preventing XSS token theft
- **Storage**: No tokens in localStorage or sessionStorage

### Key Security Features

1. **httpOnly cookies** - Tokens inaccessible to JavaScript
2. **Server-side validation** - Every request validated by backend
3. **Automatic session restore** - On app load via `GET /auth/check-login`
4. **CSRF protection** - Cookies with `sameSite` policy
5. **Route protection** - Layout-level authentication guards

---

## Authentication Flow

```
App Load
    ↓
AuthInitializer (Redux isLoading: true)
    ↓
authService.checkLogin() → GET /auth/check-login
    ↓
Backend validates httpOnly cookie
    ↓
Success?
├─ YES → dispatch(loginSuccess(user)) [isLoading: false]
└─ NO → dispatch(setLoading(false))
    ↓
Layout Component Mounts
    ↓
useAuthGuard() → Read Redux state
    ↓
Protected Route (coach/patient):
├─ isLoading? → <LoadingSpinner fullScreen />
├─ !authenticated? → <Navigate to="/login" />
├─ wrong role? → <Navigate to="/correct-dashboard" />
└─ OK → Render protected content

Auth Route (login/register):
├─ isLoading? → <LoadingSpinner fullScreen />
├─ authenticated? → <Navigate to="/dashboard" />
└─ OK → Render auth forms
```

---

## Core Components

### 1. Redux Auth Slice

**File**: [app/redux/features/authSlice.ts](../../../frontend/app/redux/features/authSlice.ts)

```typescript
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;       // Starts as TRUE
  isInitialized: boolean;   // Starts as FALSE
  error: string | null;
}

// Actions
loginStart()              // Set loading state
loginSuccess(user)        // Set authenticated user, isInitialized: true
loginFailure(error)       // Clear auth, set error, isInitialized: true
logout()                  // Clear all auth state (keeps isInitialized)
setInitialized()          // Mark auth check as complete
clearError()              // Clear error message
```

**Why `isLoading: true` initially?**
- Prevents flash of login page while checking auth
- Shows loading spinner until `checkLogin()` completes
- Better UX on app load and page refresh

**Why `isInitialized`?**
- Distinguishes between "loading" and "not yet checked"
- AuthGuard waits for `isInitialized: true` before making routing decisions
- Prevents premature redirects during initial auth check

---

### 2. Auth Initializer

**File**: [app/hooks/providers/providers.tsx](../../../frontend/app/hooks/providers/providers.tsx)

```typescript
import { mapToAuthUser } from '~/lib/utils/auth';
import { loginSuccess, setInitialized } from '~/redux/features/authSlice';

function AuthInitializer({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    authService.checkLogin()
      .then((response) => {
        if (response?.success && response?.data?.id) {
          const authUser = mapToAuthUser(response.data);
          dispatch(loginSuccess(authUser));
        } else {
          dispatch(setInitialized());
        }
      })
      .catch(() => {
        dispatch(setInitialized());
      });
  }, [dispatch]);

  return <>{children}</>;
}
```

**Purpose**:
- Runs on app load
- Validates existing session with backend
- Restores Redux auth state
- Marks auth as initialized (success or failure)

---

### 3. AuthGuard Component

**File**: [app/components/auth/AuthGuard.tsx](../../../frontend/app/components/auth/AuthGuard.tsx)

```typescript
import { AuthGuard } from '~/components/auth';

// For auth pages (login, signup) - blocks logged-in users
<AuthGuard guestOnly>
  <LoginPage />
</AuthGuard>

// For protected pages - requires authentication + role
<AuthGuard requiredRole="patient">
  <PatientDashboard />
</AuthGuard>

<AuthGuard requiredRole="coach">
  <CoachDashboard />
</AuthGuard>
```

**Props**:
- `guestOnly`: Block authenticated users (for auth pages)
- `requiredRole`: Require specific role ('coach' | 'patient')
- `fallback`: Custom loading component

**See**: [auth-guards.md](./auth-guards.md) for detailed patterns

---

### 4. Auth Utility Functions

**File**: [app/lib/utils/auth.ts](../../../frontend/app/lib/utils/auth.ts)

```typescript
import { mapToAuthUser, getHomeRouteForRole, isCoachRole } from '~/lib/utils/auth';

// Map backend user to AuthUser
const authUser = mapToAuthUser(backendUser);

// Get home route for role
getHomeRouteForRole('coach')    // → '/coach'
getHomeRouteForRole('patient')  // → '/patient'

// Check if role is coach
isCoachRole('COACH')  // → true
isCoachRole('4')      // → true
isCoachRole('PATIENT')// → false
```

---

## Route Protection Patterns

### Pattern 1: Auth Layout (Guest Only)

**File**: [app/pages/auth/layout.tsx](../../../frontend/app/pages/auth/layout.tsx)

```typescript
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";

export default function AuthLayout() {
  return (
    <AuthGuard guestOnly>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
          <Outlet />
        </div>
      </div>
    </AuthGuard>
  );
}
```

**Protection Logic**:
1. Not initialized → Show loading spinner
2. Authenticated → Redirect to their home (/coach or /patient)
3. Not authenticated → Render login/register pages

---

### Pattern 2: Protected Layout (Coach)

**File**: [app/pages/coach/layout.tsx](../../../frontend/app/pages/coach/layout.tsx)

```typescript
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";
import { BottomNav } from "~/components/layout/bottom-nav";

export default function CoachLayout() {
  return (
    <AuthGuard requiredRole="coach">
      <div className="max-w-md mx-auto min-h-screen bg-neutral-50">
        <Outlet />
        <BottomNav variant="coach" />
      </div>
    </AuthGuard>
  );
}
```

**Protection Logic**:
1. Not initialized → Show loading spinner
2. Not authenticated → Redirect to /login
3. Wrong role (patient) → Redirect to /patient
4. Correct role (coach) → Render protected content

---

### Pattern 3: Patient Layout

**File**: [app/pages/patient/layout.tsx](../../../frontend/app/pages/patient/layout.tsx)

```typescript
import { Outlet } from "react-router";
import { AuthGuard } from "~/components/auth";
import { BottomNav } from "~/components/layout/bottom-nav";

export default function PatientLayout() {
  return (
    <AuthGuard requiredRole="patient">
      <div className="max-w-md mx-auto min-h-screen bg-neutral-50">
        <Outlet />
        <BottomNav variant="patient" />
      </div>
    </AuthGuard>
  );
}
```

---

## Authentication Services

### Auth Service

**File**: [app/services/httpServices/authService.ts](../../../frontend/app/services/httpServices/authService.ts)

```typescript
export const authService = {
  // Login with username/password
  login: (data: LoginRequest) =>
    httpService.post<LoginResponse>('/auth/login', data),

  // Validate current session
  checkLogin: () =>
    httpService.get<CheckLoginResponse>('/auth/check-login'),

  // Logout and clear session
  logout: () =>
    httpService.post('/auth/logout'),

  // Refresh access token
  refreshToken: (refreshToken: string) =>
    httpService.get(`/auth/refresh-access-token?refreshToken=${refreshToken}`),

  // OTP verification for registration
  sendPhoneOtp: (data: SendPhoneOtpRequest) =>
    httpService.post('/auth/send-phone-otp', data),

  verifyPhoneOtp: (data: VerifyPhoneOtpRequest) =>
    httpService.post('/auth/verify-phone-otp', data),

  // User registration
  register: (data: RegisterRequest) =>
    httpService.post('/auth/register', data),
};
```

---

## Login Implementation

**File**: [app/pages/auth/login.tsx](../../../frontend/app/pages/auth/login.tsx)

```typescript
import { mapToAuthUser, getHomeRouteForRole } from '~/lib/utils/auth';
import { loginSuccess } from '~/redux/features/authSlice';

const handleLogin = async (data: LoginFormData) => {
  setIsLoading(true);
  setLoginError(null);

  try {
    const response = await authService.login({
      username: data.username,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (response.success && response.data) {
      const { user } = response.data;

      // Backend sets httpOnly cookie automatically
      // No need to manually store tokens in localStorage

      // Map backend user to AuthUser format
      const authUser = mapToAuthUser(user);

      // Update Redux state (triggers socket connection)
      dispatch(loginSuccess(authUser));

      // Redirect based on user role
      navigate(getHomeRouteForRole(authUser.role));
    }
  } catch (error) {
    const errorResponse = handleAxiosError(error);
    setLoginError(errorResponse.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Key Points**:
- **NO localStorage.setItem()** - Backend handles cookie setting
- Use `mapToAuthUser()` utility for consistent user mapping
- Use `getHomeRouteForRole()` for role-based routing
- Error handling with user-friendly messages

---

## Logout Implementation

**Example**: Admin Sidebar

```typescript
const handleLogout = async () => {
  try {
    await authService.logout();
    dispatch(logout());
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
    // Still clear local state even if API fails
    dispatch(logout());
    navigate('/login');
  }
};
```

**Logout Flow**:
1. Call `authService.logout()` → Backend clears httpOnly cookie
2. Dispatch `logout()` action → Clear Redux state
3. Navigate to `/login`

---

## Error Handling

### 401 Unauthorized

**File**: [app/utils/errorHandler.ts](../../../frontend/app/utils/errorHandler.ts)

```typescript
export const handleUnauthorized = (): void => {
  // Backend manages httpOnly cookies - no localStorage cleanup needed
  // The cookie will be cleared when user logs in again or explicitly logs out

  // Don't redirect if already on login or auth pages to prevent infinite loops
  const currentPath = window.location.pathname;
  const authPaths = ['/', '/login', '/signup', '/register', '/forgot-password'];

  if (!authPaths.some(path => currentPath === path || currentPath.startsWith('/signup/'))) {
    window.location.href = '/login';
  }
};
```

**Why no localStorage cleanup?**
- httpOnly cookies are managed by backend
- Browser automatically sends/removes cookies
- No manual token cleanup needed

---

## Loading Spinner Component

**File**: [app/components/ui/loading-spinner.tsx](../../../frontend/app/components/ui/loading-spinner.tsx)

```typescript
import { LoadingSpinner } from '~/components/ui/loading-spinner';

// Full-screen loading for route protection
<LoadingSpinner fullScreen text="Loading..." />

// Inline loading
<LoadingSpinner size="md" text="Processing..." />

// Sizes: 'sm' | 'md' | 'lg'
```

**Usage**:
- Route protection loading states
- Form submissions
- Async operations

---

## Best Practices

### ✅ DO

1. **Use httpOnly cookies** - Never store tokens in localStorage
2. **Check auth in layouts** - Protect entire route groups
3. **Show loading states** - Prevent flashes and improve UX
4. **Handle role mismatches** - Redirect to correct dashboard
5. **Use useAuthGuard hook** - Avoid Redux boilerplate
6. **Call checkLogin on load** - Restore session automatically
7. **Clear Redux on logout** - Prevent stale state
8. **Use withCredentials: true** - Include cookies in requests

### ❌ DON'T

1. **DON'T store tokens in localStorage** - XSS vulnerability
2. **DON'T check auth per-page** - Use layout-level guards
3. **DON'T forget loading states** - Causes bad UX
4. **DON'T skip role validation** - Security risk
5. **DON'T manually set cookies** - Backend handles this
6. **DON'T redirect in loops** - Check current path first
7. **DON'T use `any` types** - Use AuthUser, AuthState types

---

## TypeScript Types

### AuthUser

```typescript
export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'patient' | 'coach' | null;
  email?: string;
  phone?: string;
}
```

### AuthState

```typescript
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
```

### API Response Types

```typescript
interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string | number;
    };
  };
}
```

---

## Testing Checklist

After implementing authentication:

- [ ] Logged-in users cannot access `/login`, `/register`, etc.
- [ ] Non-logged-in users cannot access `/coach/*` or `/patient/*`
- [ ] Coach users redirected to `/coach` after login
- [ ] Patient users redirected to `/patient` after login
- [ ] Page refresh maintains auth state via cookies
- [ ] Logout clears session and redirects to login
- [ ] No tokens stored in localStorage
- [ ] Loading spinner shows during auth check
- [ ] 401 errors trigger redirect to login
- [ ] Role mismatches redirect to correct dashboard
- [ ] Auth check runs only once on app load

---

## Common Issues & Solutions

### Issue: Flash of login page on protected routes

**Solution**: Start with `isLoading: true` in authSlice initial state.

### Issue: Infinite redirect loops

**Solution**: Check current path before redirecting in `handleUnauthorized()`.

### Issue: Auth state not persisting on refresh

**Solution**: Ensure `withCredentials: true` in httpService and backend sets httpOnly cookies.

### Issue: User sees protected content before redirect

**Solution**: Use loading spinner in layouts while checking auth.

### Issue: Role check failing

**Solution**: Backend may return role as string ('COACH') or number (4) - handle both.

---

## Related Files

| File | Purpose |
|------|---------|
| [authSlice.ts](../../../frontend/app/redux/features/authSlice.ts) | Redux state management |
| [AuthGuard.tsx](../../../frontend/app/components/auth/AuthGuard.tsx) | Route protection component |
| [auth.ts](../../../frontend/app/lib/utils/auth.ts) | Auth utility functions |
| [providers.tsx](../../../frontend/app/hooks/providers/providers.tsx) | Auth initializer |
| [authService.ts](../../../frontend/app/services/httpServices/authService.ts) | API calls |
| [errorHandler.ts](../../../frontend/app/utils/errorHandler.ts) | 401 handling |
| [auth/layout.tsx](../../../frontend/app/pages/auth/layout.tsx) | Auth routes protection |
| [coach/layout.tsx](../../../frontend/app/pages/coach/layout.tsx) | Coach routes protection |
| [patient/layout.tsx](../../../frontend/app/pages/patient/layout.tsx) | Patient routes protection |
| [auth-guards.md](./auth-guards.md) | Detailed guard patterns |

---

## Backend API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login` | POST | No | Login with username/password |
| `/auth/check-login` | GET | Yes | Validate current session |
| `/auth/logout` | GET | Yes | Clear session and cookies |
| `/auth/refresh-access-token` | GET | No | Refresh access token |
| `/auth/register` | POST | No | Register new user |

**Cookie Configuration**:
- `httpOnly: true`
- `secure: true` (HTTPS only)
- `sameSite: 'none'`
- Cookie name: `AUTH_TOKEN_COOKIE_NAME` (from env)

---

## Further Reading

- [Backend Auth Guide](../../nestjs/skills/authentication.md) (if exists in backend)
- [HTTP Service Architecture](./data-fetching.md#http-service-architecture)
- [Redux Patterns](./common-patterns.md#redux-slice-patterns)
- [Routing Guide](./routing-guide.md)
