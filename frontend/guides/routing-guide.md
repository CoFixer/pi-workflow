# Routing Guide

React Router 7 implementation with declarative routing and layout-based organization.

---

## React Router 7 Overview

The project uses **React Router 7** with:

- Declarative route configuration
- Layout-based route organization
- Server-side rendering (SSR) enabled
- Type-safe navigation

---

## Configuration Files

### Main Route Configuration

Location: `~/routes.ts`

```typescript
import { type RouteConfig, layout } from '@react-router/dev/routes';
import { publicRoutes } from './routes/public.routes';
import { authRoutes } from './routes/auth.routes';

export default [
  layout('pages/layout.tsx', publicRoutes),
  layout('pages/auth/layout.tsx', authRoutes),
] satisfies RouteConfig;
```

### React Router Configuration

Location: `frontend/react-router.config.ts`

```typescript
import type { Config } from '@react-router/dev/config';

export default {
  // Server-side render by default
  ssr: true,
} satisfies Config;
```

---

## Route Definitions

### Public Routes

Location: `~/routes/public.routes.ts`

```typescript
import { route, index } from '@react-router/dev/routes';

export const publicRoutes = [
  index('pages/home.tsx'),
  route('about', 'pages/public/about.tsx'),
];
```

### Auth Routes

Location: `~/routes/auth.routes.ts`

```typescript
import { route } from '@react-router/dev/routes';

export const authRoutes = [
  route('login', 'pages/auth/login.tsx'),
  route('register', 'pages/auth/register.tsx'),
];
```

---

## Route Helpers

### Available Functions

```typescript
import { route, index, layout } from '@react-router/dev/routes';

// index - Home route for a path
index('pages/home.tsx')  // Renders at parent path

// route - Named route
route('about', 'pages/about.tsx')  // /about

// layout - Wraps child routes with a layout component
layout('pages/layout.tsx', childRoutes)
```

### Route with Parameters

```typescript
// Dynamic route parameter
route('users/:id', 'pages/users/detail.tsx')  // /users/123

// Optional parameter
route('posts/:id?', 'pages/posts/index.tsx')  // /posts or /posts/123

// Catch-all
route('*', 'pages/not-found.tsx')  // Any unmatched route
```

---

## Layout Components

### Main Layout

Location: `~/pages/layout.tsx`

```typescript
import { Outlet } from 'react-router';
import { Header } from '~/components/layout/header';
import { Footer } from '~/components/layout/footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### Auth Layout

Location: `~/pages/auth/layout.tsx`

```typescript
import { Outlet } from 'react-router';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Outlet />
    </div>
  );
}
```

---

## Navigation

### Link Component

```typescript
import { Link } from 'react-router';

// Basic link
<Link to="/about">About</Link>

// With classes
<Link to="/dashboard" className="text-primary hover:underline">
  Dashboard
</Link>

// External link (use anchor)
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  External
</a>
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router';

export default function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to route
    navigate('/dashboard');

    // Navigate with replace (no history entry)
    navigate('/login', { replace: true });

    // Go back
    navigate(-1);
  };

  return <button onClick={handleClick}>Navigate</button>;
}
```

### Using Button with Link (asChild)

```typescript
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';

<Button asChild>
  <Link to="/dashboard">Go to Dashboard</Link>
</Button>
```

---

## Route Parameters

### Accessing Parameters

```typescript
import { useParams } from 'react-router';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();

  return <div>User ID: {id}</div>;
}
```

### Search Parameters

```typescript
import { useSearchParams } from 'react-router';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';

  const updateSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, page: '1' });
  };

  return (
    <input
      value={query}
      onChange={(e) => updateSearch(e.target.value)}
    />
  );
}
```

---

## Route Organization

### Adding a New Route Group

1. Create route definitions file:

```typescript
// ~/routes/dashboard.routes.ts
import { route, index } from '@react-router/dev/routes';

export const dashboardRoutes = [
  index('pages/dashboard/index.tsx'),
  route('settings', 'pages/dashboard/settings.tsx'),
  route('profile', 'pages/dashboard/profile.tsx'),
];
```

2. Create layout (if needed):

```typescript
// ~/pages/dashboard/layout.tsx
import { Outlet } from 'react-router';
import { Sidebar } from '~/components/layout/sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

3. Add to main routes:

```typescript
// ~/routes.ts
import { dashboardRoutes } from './routes/dashboard.routes';

export default [
  layout('pages/layout.tsx', publicRoutes),
  layout('pages/auth/layout.tsx', authRoutes),
  layout('pages/dashboard/layout.tsx', dashboardRoutes),
] satisfies RouteConfig;
```

---

## Protected Routes

### Auth Check in Layout

```typescript
// ~/pages/dashboard/layout.tsx
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '~/redux/store/hooks';

export default function ProtectedLayout() {
  const isAuthenticated = useAppSelector((state) => !!state.auth.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

---

## Summary

**Routing Checklist:**

- ✅ Define routes in `routes/*.routes.ts` files
- ✅ Use `layout()` for shared layouts
- ✅ Use `route()` for named routes
- ✅ Use `index()` for default routes
- ✅ Use `Link` for navigation (not `<a>`)
- ✅ Use `useNavigate` for programmatic navigation
- ✅ Use `useParams` for route parameters
- ✅ Add route files to main `routes.ts`

**See Also:**

- [file-organization.md](file-organization.md) - Route file structure
- [common-patterns.md](common-patterns.md) - Auth patterns
- [complete-examples.md](complete-examples.md) - Full routing examples
