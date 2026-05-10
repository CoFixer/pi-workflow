---
skill_name: fix-bug
applies_to_local_project_only: true
auto_trigger_regex: [fix bug, debug, react error, frontend bug, typescript error, runtime error, redux error]
tags: [debugging, react, typescript, troubleshooting]
related_skills: [e2e-testing, organize-types]
---

# Fix Frontend Bug Guide

This guide provides a structured approach to debugging and fixing frontend bugs in React/TypeScript applications.

---

## Purpose

Use this guide when you encounter frontend bugs including:
- React rendering issues
- State management problems (Redux)
- Routing errors (React Router 7)
- API/data fetching failures
- TypeScript type errors
- Styling/CSS issues
- Console errors and warnings

---

## Quick Diagnostic Checklist

Before diving into debugging, quickly check:

- [ ] Browser console for errors/warnings
- [ ] Network tab for failed API requests
- [ ] React DevTools for component state
- [ ] Redux DevTools for state changes
- [ ] TypeScript errors in IDE/terminal
- [ ] Check if issue reproduces in incognito mode

---

## Debugging Workflow

### Step 1: Reproduce the Bug

```typescript
// Document the reproduction steps
// 1. Navigate to [page]
// 2. Perform [action]
// 3. Observe [unexpected behavior]
```

### Step 2: Identify the Error Type

| Error Type | Where to Look | Tools |
|------------|---------------|-------|
| Runtime Error | Browser Console | DevTools |
| Type Error | IDE/Terminal | TypeScript |
| Network Error | Network Tab | DevTools |
| State Issue | Redux DevTools | Redux DevTools Extension |
| Render Issue | React DevTools | React DevTools Extension |

### Step 3: Isolate the Problem

```typescript
// Add console.log to trace data flow
console.log('Component render:', { props, state });
console.log('API response:', response);
console.log('Redux state:', store.getState());
```

---

## Common Bug Categories & Solutions

### 1. React Rendering Issues

**Symptoms:**
- Component not updating
- Infinite re-renders
- Stale data displayed

**Common Causes & Fixes:**

```typescript
// ❌ Missing dependency in useEffect
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Correct dependency array
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Mutating state directly
const handleClick = () => {
  items.push(newItem); // Direct mutation
  setItems(items);
};

// ✅ Creating new array
const handleClick = () => {
  setItems([...items, newItem]);
};

// ❌ Object identity causing re-renders
<ChildComponent options={{ key: 'value' }} /> // New object each render

// ✅ Memoize object
const options = useMemo(() => ({ key: 'value' }), []);
<ChildComponent options={options} />
```

### 2. Redux State Issues

**Symptoms:**
- State not updating after dispatch
- Components not receiving new state
- Action dispatched but no effect

**Common Causes & Fixes:**

```typescript
// ❌ Returning wrong state structure
extraReducers: (builder) => {
  builder.addCase(fetchData.fulfilled, (state, action) => {
    state = action.payload; // Wrong - replacing state reference
  });
}

// ✅ Correct state update with Immer
extraReducers: (builder) => {
  builder.addCase(fetchData.fulfilled, (state, action) => {
    state.data = action.payload; // Correct - mutating draft
    state.loading = false;
  });
}

// ❌ Wrong selector path
const data = useAppSelector((state) => state.user.data);
// If slice name is 'users' not 'user'

// ✅ Check slice name in store configuration
const data = useAppSelector((state) => state.users.data);
```

### 3. React Router 7 Issues

**Symptoms:**
- Navigation not working
- Route not matching
- Loader/action not firing

**Common Causes & Fixes:**

```typescript
// ❌ Using wrong import
import { useNavigate } from 'react-router-dom'; // Old import

// ✅ Use react-router (not react-router-dom)
import { useNavigate } from 'react-router';

// ❌ Route path mismatch
// Route: /patient/:id
// Link: /patient/123/details  // No match

// ✅ Ensure exact path match or use wildcard
// Route: /patient/:id/*

// ❌ Protected route redirect loop
// Checking auth in useEffect after render

// ✅ Use loader for auth checks
export async function loader() {
  const user = await checkAuth();
  if (!user) throw redirect('/login');
  return user;
}
```

### 4. API/Data Fetching Errors

**Symptoms:**
- API calls failing
- Data not loading
- Network errors in console

**Common Causes & Fixes:**

```typescript
// ❌ Missing error handling
const fetchData = async () => {
  const response = await httpService.get('/api/data');
  setData(response.data);
};

// ✅ Proper error handling
const fetchData = async () => {
  try {
    const response = await httpService.get('/api/data');
    setData(response.data);
  } catch (error) {
    console.error('API Error:', error);
    setError(error.message);
  }
};

// ❌ Auth token not included
httpService.get('/protected-route'); // 401 Unauthorized

// ✅ Check httpService configuration
// Ensure interceptors add Authorization header
// Check if token exists in localStorage/cookies

// ❌ Wrong endpoint path
httpService.get('/api/users'); // 404 if backend uses /users

// ✅ Verify endpoint in PROJECT_API.md
httpService.get('/users');
```

### 5. TypeScript Type Errors

**Symptoms:**
- Red squiggly lines in IDE
- Build failures
- Type mismatch errors

**Common Causes & Fixes:**

```typescript
// ❌ Missing type for props
const MyComponent = ({ data }) => { ... } // data is 'any'

// ✅ Define interface
interface MyComponentProps {
  data: UserData;
}
const MyComponent = ({ data }: MyComponentProps) => { ... }

// ❌ Optional property access without check
const name = user.profile.name; // Error if profile is undefined

// ✅ Optional chaining
const name = user?.profile?.name;

// ❌ Incorrect generic type
const [items, setItems] = useState([]); // items is never[]

// ✅ Specify generic type
const [items, setItems] = useState<Item[]>([]);
```

### 6. Styling/CSS Issues

**Symptoms:**
- Styles not applying
- Layout broken
- Responsive issues

**Common Causes & Fixes:**

```typescript
// ❌ Tailwind class not working
<div className="bg-primary"> // Custom color not defined

// ✅ Check tailwind.config.ts for custom colors
// Or use default Tailwind colors
<div className="bg-blue-500">

// ❌ Class name typo
<div className="flex-col items-centres"> // 'centres' is wrong

// ✅ Correct spelling
<div className="flex-col items-center">

// ❌ CSS specificity conflict
// Global styles overriding component styles

// ✅ Use cn() utility for class merging
import { cn } from '~/lib/utils';
<div className={cn("base-styles", conditional && "override-styles")}>
```

---

## Debugging Tools

### Browser DevTools

```bash
# Open DevTools
Cmd+Option+I (Mac) / F12 (Windows)

# Console - View errors and logs
# Network - Inspect API calls
# Elements - Inspect DOM/styles
# Application - View localStorage/cookies
```

### React DevTools

```bash
# Install extension from Chrome Web Store
# Use Components tab to inspect props/state
# Use Profiler to identify performance issues
```

### Redux DevTools

```bash
# Install extension from Chrome Web Store
# View action history
# Time-travel debugging
# Export/import state
```

---

## After Fixing the Bug

1. **Verify the fix** - Test the reproduction steps
2. **Check for side effects** - Ensure fix doesn't break other features
3. **Run type check**: `npm run typecheck`
4. **Run linting**: `npm run lint`
5. **Test related features** - Manual or E2E tests
6. **Create PR** - Use git workflow to submit fixes

---

## Related Resources

- [Component Patterns](../../guides/component-patterns.md) - React component best practices
- [Data Fetching](../../guides/data-fetching.md) - HTTP service patterns
- [Common Patterns](../../guides/common-patterns.md) - Redux and form patterns
- [TypeScript Standards](../../guides/typescript-standards.md) - Type safety guidelines
- [Browser Testing](../../guides/browser-testing.md) - Manual testing guide
