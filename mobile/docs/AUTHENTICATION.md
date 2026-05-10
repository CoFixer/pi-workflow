# Authentication Architecture

## Overview

React Native mobile apps use **token-based authentication** with secure storage. This document provides a high-level overview of the authentication architecture.

---

## Security Model

### Token Storage Options

| Storage Method | Security Level | Use Case |
|----------------|----------------|----------|
| MMKV | Medium | General tokens, fast access |
| SecureStore | High | Sensitive tokens, biometric |
| AsyncStorage | Low | NOT recommended for tokens |

### Recommended Configuration

```typescript
// Use MMKV for auth tokens with encryption
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'auth-storage',
  encryptionKey: 'your-encryption-key', // Optional
});
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
Backend returns tokens (access + refresh)
    ↓
Store tokens in MMKV
    ↓
dispatch(loginSuccess(user)) → Redux state updated
    ↓
Navigator allows access to protected screens

---

App Load (Cold Start)
    ↓
Check MMKV for stored token
    ↓
GET /auth/me (token in Authorization header)
    ↓
Backend validates token
    ↓
Valid? → loginSuccess(user)
Invalid? → Clear tokens, show login
    ↓
Navigator makes routing decisions
```

---

## Role-Based Access Control

### Roles

| Role | Description | Home Screen |
|------|-------------|-------------|
| COACH | Physical therapists, trainers | /(tabs)/coach |
| PATIENT | Users receiving coaching | /(tabs)/patient |

### Route Protection (Expo Router)

```typescript
// app/(auth)/_layout.tsx - Guest only screens
export default function AuthLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack />;
}

// app/(tabs)/_layout.tsx - Protected screens
export default function TabsLayout() {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Tabs />;
}
```

---

## Key Components

### 1. Auth Service
**Location**: `src/services/httpServices/authService.ts`

```typescript
export const authService = {
  login: (credentials: LoginFormData) =>
    httpService.post<LoginResponse>('/auth/login', credentials),
  logout: () =>
    httpService.post('/auth/logout'),
  checkAuthStatus: () =>
    httpService.get<AuthMeResponse>('/auth/me'),
};
```

### 2. Auth Query Hooks
**Location**: `src/services/httpServices/queries/useAuth.ts`

```typescript
// Query key factory
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Hooks
export function useLogin() { ... }
export function useLogout() { ... }
export function useAuthSession() { ... }
```

### 3. Redux Auth Slice
**Location**: `src/redux/slices/authSlice.ts`

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}
```

### 4. Storage Service
**Location**: `src/services/storageService.ts`

```typescript
export const StorageService = {
  setToken: (token: string) => storage.set('auth_token', token),
  getToken: () => storage.getString('auth_token'),
  clearToken: () => storage.delete('auth_token'),
};
```

---

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | No | Authenticate user |
| `/auth/logout` | POST | Yes | Clear session |
| `/auth/me` | GET | Yes | Get current user |
| `/auth/forgot-password` | POST | No | Request OTP |
| `/auth/verify-otp` | POST | No | Verify OTP |
| `/auth/reset-password` | POST | No | Reset password |

---

## Request Interceptor

**Location**: `src/services/httpMethods/requestInterceptor.ts`

```typescript
export const requestInterceptor = async (config) => {
  const token = StorageService.getToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
```

---

## Troubleshooting

### Token not persisting after app restart
**Cause**: MMKV not properly initialized
**Solution**: Ensure MMKV is initialized before accessing storage

### 401 errors on protected routes
**Cause**: Token not being sent with requests
**Solution**: Check requestInterceptor is attached to Axios instance

### Auth state not syncing with storage
**Cause**: Redux and MMKV out of sync
**Solution**: Use Redux Persist with MMKV storage adapter

### Infinite login loop
**Cause**: Auth check failing and redirecting repeatedly
**Solution**: Add `isInitialized` flag to prevent checks during initialization

---

## Implementation Guides

For detailed implementation patterns, see:

- [Data Fetching Guide](../guides/data-fetching.md)
- [TanStack Query Guide](../guides/tanstack-query.md)
- [Navigation Guide](../guides/navigation-guide.md)
