# Browser Testing for UI & API Development

Always test your UI components and API integrations in the browser during development.

---

## When to Open the Browser

Open the browser and test after:

- Creating or modifying UI components
- Integrating API endpoints
- Implementing forms
- Changing routes
- Adding animations or transitions
- Modifying loading/error states

---

## Starting the Dev Server

### Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

**Expected URL**: `http://localhost:5173`

### Backend (NestJS)

```bash
cd backend
npm run start:dev
```

**Expected URL**: `http://localhost:3000`

---

## What to Test in Browser

### UI Components

| Check | How to Verify |
|-------|---------------|
| Visual rendering | Does it look correct? |
| Responsive design | Resize browser window |
| User interactions | Click buttons, fill forms |
| Hover/focus states | Mouse over, tab through |
| Loading states | Check spinners appear |
| Error states | Trigger errors intentionally |
| Empty states | Test with no data |

### API Integration

| Check | How to Verify |
|-------|---------------|
| Request sent | Network tab shows request |
| Correct endpoint | URL matches expected |
| Request payload | Check request body |
| Response received | Status 200/201 |
| Data displayed | UI updates correctly |
| Error handling | Check error messages |

---

## Browser DevTools Guide

### Open DevTools

- **Mac**: `Cmd + Option + I`
- **Windows/Linux**: `F12` or `Ctrl + Shift + I`

### Essential Tabs

#### Elements Tab
- Inspect DOM structure
- Check applied CSS classes
- Verify Tailwind classes are applied
- Debug layout issues

#### Console Tab
- Check for JavaScript errors
- View console.log output
- Debug React warnings
- Check for hydration errors

#### Network Tab
- Monitor API calls
- Check request/response data
- Verify headers (Authorization, Content-Type)
- Identify failed requests (red entries)

#### Application Tab
- Check localStorage (JWT tokens)
- View cookies
- Debug session storage

### React DevTools Extension

Install: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)

**Use for:**
- Inspect component hierarchy
- View component props and state
- Debug re-renders
- Check Redux state

---

## Testing Checklists

### UI Component Checklist

```
[ ] Component renders without errors
[ ] Correct content displayed
[ ] Styling matches design
[ ] Responsive on mobile (375px)
[ ] Responsive on tablet (768px)
[ ] Interactive elements work (buttons, links)
[ ] Form inputs accept values
[ ] Keyboard navigation works
[ ] No console errors
```

### API Integration Checklist

```
[ ] API call fires on expected trigger
[ ] Loading state shows during request
[ ] Success state updates UI
[ ] Error state displays message
[ ] Network tab shows correct endpoint
[ ] Request headers include auth token
[ ] Response data structure matches types
[ ] Edge cases handled (empty, null)
```

### Form Submission Checklist

```
[ ] Validation errors display
[ ] Submit button disabled during loading
[ ] Success feedback shown
[ ] Error feedback shown
[ ] Form resets after success (if needed)
[ ] Redirect works after submit
```

---

## Common Issues & Solutions

### Hydration Errors

**Symptom**: Console shows "Text content does not match server-rendered HTML"

**Causes**:
- Date/time formatting differences
- Browser-only APIs (localStorage, window)
- Random IDs or keys

**Solution**:
```typescript
// Use useEffect for browser-only code
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

### CORS Errors

**Symptom**: "Access to fetch blocked by CORS policy"

**Causes**:
- Backend not configured for frontend origin
- Wrong API URL

**Solution**:
- Check backend CORS configuration
- Verify API base URL in httpService

### Network Failures

**Symptom**: API calls fail or hang

**Debug Steps**:
1. Open Network tab
2. Find the failed request (red)
3. Check Status Code
4. Check Response body for error message
5. Verify request URL and payload

### Component Not Rendering

**Debug Steps**:
1. Check console for errors
2. Verify component is imported
3. Check route configuration
4. Inspect Elements tab for DOM
5. Add console.log in component

### State Not Updating

**Debug Steps**:
1. Open React DevTools
2. Find component in tree
3. Check current state/props
4. Verify Redux state (if using)
5. Check for stale closures in callbacks

---

## Quick Reference Commands

```bash
# Start frontend dev server
npm run dev

# Start with specific port
npm run dev -- --port 3001

# Build and preview production
npm run build && npm run preview

# Check for TypeScript errors
npm run typecheck
```

---

## Testing Flow Example

### After Creating a New Form Component

1. **Start dev server**: `npm run dev`
2. **Open browser**: Navigate to component page
3. **Check visual**: Does form look correct?
4. **Test inputs**: Type in each field
5. **Check validation**: Submit with invalid data
6. **Test submit**: Fill form correctly, submit
7. **Check Network tab**: API call sent correctly?
8. **Verify response**: Success/error handled?
9. **Check console**: Any errors or warnings?
10. **Test mobile**: Resize to mobile width

---

## Summary

**Always test in browser after:**
- UI changes
- API integration
- Form implementations
- Route modifications

**Use DevTools to:**
- Check console for errors
- Monitor network requests
- Inspect component state
- Debug layout issues

**See Also:**

- [loading-and-error-states.md](loading-and-error-states.md) - Handling async states
- [data-fetching.md](data-fetching.md) - API integration patterns
- [common-patterns.md](common-patterns.md) - Form patterns
