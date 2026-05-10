# Fix React Native Bug Guide

Structured approach to debugging and fixing bugs in React Native / Expo applications.

## Purpose

Use this guide when you encounter React Native bugs including:
- Metro bundler errors
- Native module issues (iOS/Android)
- Expo build/runtime errors
- Navigation errors
- State management issues
- NativeWind/Tailwind styling bugs
- API/Network errors

## Quick Diagnostic Checklist

Before diving into debugging, quickly check:

- [ ] Metro bundler console output
- [ ] Device/Simulator logs (Xcode/Android Studio)
- [ ] React Native Debugger or Flipper
- [ ] Network requests in debugger
- [ ] Component re-render patterns
- [ ] Navigation state

## Debugging Workflow

### Step 1: Reproduce the Bug

```typescript
// Document the reproduction steps
// 1. Navigate to [screen]
// 2. Perform [action]
// 3. Observe [unexpected behavior/error]
```

### Step 2: Identify the Error Type

| Error Type | Where to Look | Tools |
|------------|---------------|-------|
| Metro Bundler | Terminal output | Metro logs |
| JS Runtime | Red screen / LogBox | React Native Debugger |
| Native Module | Xcode/Android Studio | Native logs |
| Network | Network tab | Flipper / RN Debugger |
| Navigation | Navigation state | React Navigation DevTools |

### Step 3: Isolate the Problem

```typescript
// Add logging to trace data flow
console.log('[Screen] Props:', props);
console.log('[API] Response:', response);
console.log('[State] Current:', state);

// Use React DevTools to inspect component tree
// Use Flipper for network inspection
```

## Common Bug Categories & Solutions

### 1. Metro Bundler Errors

**Symptoms:**
- "Unable to resolve module"
- "Metro has encountered an error"
- Build failures

**Common Causes & Fixes:**

```bash
# ❌ Module not found
Error: Unable to resolve module @react-navigation/native

# ✅ Clear cache and reinstall
npx expo start --clear
# Or for bare RN:
npx react-native start --reset-cache

# ❌ Watchman issues
Error: Watchman took too long to load

# ✅ Reset Watchman
watchman watch-del-all
rm -rf node_modules
npm install

# ❌ Metro stuck / port in use
Error: EADDRINUSE: address already in use

# ✅ Kill process on port
lsof -ti:8081 | xargs kill -9
# Or use different port
npx expo start --port 8082
```

### 2. Native Module Errors

**Symptoms:**
- "Native module cannot be null"
- App crashes on startup
- Platform-specific issues

**Common Causes & Fixes:**

```typescript
// ❌ Native module not linked (bare RN)
Error: Native module RNGestureHandler is null

// ✅ For Expo:
npx expo install react-native-gesture-handler

// ✅ For bare RN - iOS:
cd ios && pod install && cd ..

// ✅ For bare RN - Android:
// Check android/app/build.gradle has the dependency

// ❌ Platform-specific code not handled
const { Platform } = require('react-native');

// ✅ Use Platform.select or Platform.OS
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    // Or use Platform.select
    ...Platform.select({
      ios: { shadowColor: '#000' },
      android: { elevation: 4 },
    }),
  },
});
```

### 3. Expo-Specific Errors

**Symptoms:**
- "Invariant Violation"
- Expo Go crashes
- Build failures

**Common Causes & Fixes:**

```bash
# ❌ Incompatible SDK version
Error: Your project requires a newer version of Expo

# ✅ Update Expo SDK
npx expo install expo@latest
npx expo install --fix

# ❌ Missing native module in Expo Go
Error: This module requires native code

# ✅ Use development build
npx expo run:ios
# Or use EAS Build
eas build --profile development --platform ios

# ❌ Asset loading failed
Error: Unable to resolve asset

# ✅ Check asset path and clear cache
npx expo start --clear
```

### 4. Navigation Errors

**Symptoms:**
- "Cannot read property 'navigate' of undefined"
- Screen not rendering
- Navigation state issues

**Common Causes & Fixes:**

```typescript
// ❌ Using navigation outside NavigationContainer
const MyComponent = () => {
  const navigation = useNavigation(); // Error if not in navigator
};

// ✅ Ensure component is inside navigator
<NavigationContainer>
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
</NavigationContainer>

// ❌ Navigation params type mismatch
navigation.navigate('Profile', { userId: 123 });

// ✅ Define proper types
type RootStackParamList = {
  Profile: { userId: string }; // Use correct type
};

// ❌ Deep linking not working
// ✅ Check linking configuration
const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: 'home',
      Profile: 'profile/:id',
    },
  },
};
```

### 5. State Management Bugs

**Symptoms:**
- Component not re-rendering
- Stale data
- Infinite loops

**Common Causes & Fixes:**

```typescript
// ❌ Mutating state directly
const [items, setItems] = useState([]);
items.push(newItem); // Wrong!

// ✅ Create new array
setItems([...items, newItem]);

// ❌ Missing dependency in useEffect
useEffect(() => {
  fetchUser(userId);
}, []); // userId missing from deps

// ✅ Include all dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ Infinite loop with useEffect
useEffect(() => {
  setCount(count + 1); // Triggers re-render, which triggers effect
}, [count]);

// ✅ Use functional update
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // Only run once

// ❌ Zustand/Redux selector causing re-renders
const store = useStore(); // Re-renders on any change

// ✅ Select specific values
const count = useStore(state => state.count);
```

### 6. NativeWind/Styling Errors

**Symptoms:**
- Styles not applying
- Tailwind classes not working
- Platform-specific styling issues

**Common Causes & Fixes:**

```typescript
// ❌ NativeWind not configured
// tailwind.config.js missing or incorrect

// ✅ Check tailwind.config.js
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};

// ❌ babel.config.js missing preset
// ✅ Add NativeWind preset
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['nativewind/babel'],
};

// ❌ className not recognized
<View className="flex-1 bg-red-500" /> // May not work

// ✅ Ensure styled wrapper or proper setup
import { styled } from 'nativewind';
const StyledView = styled(View);
<StyledView className="flex-1 bg-red-500" />

// ❌ Platform-specific styles not working
// ✅ Use Platform prefix
<View className="ios:pt-12 android:pt-8" />
```

### 7. API/Network Errors

**Symptoms:**
- "Network request failed"
- CORS errors
- Timeout issues

**Common Causes & Fixes:**

```typescript
// ❌ HTTP blocked on iOS (needs HTTPS)
fetch('http://api.example.com/data');

// ✅ Use HTTPS or configure ATS exception
// ios/YourApp/Info.plist
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>

// ❌ Network timeout not handled
const response = await fetch(url);

// ✅ Add timeout handling
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request timed out');
  }
}

// ❌ API errors not handled properly
const data = await response.json();

// ✅ Check response status
if (!response.ok) {
  throw new Error(`API Error: ${response.status}`);
}
const data = await response.json();
```

## Debugging Tools

### React Native Debugger

```bash
# Install
brew install react-native-debugger

# Usage
# 1. Start app with debugging enabled
# 2. Shake device or Cmd+D (iOS) / Cmd+M (Android)
# 3. Select "Debug with React Native Debugger"
```

### Flipper

```bash
# Install from https://fbflipper.com/
# Features:
# - Network inspector
# - Layout inspector
# - Shared preferences viewer
# - Crash reporter
# - React DevTools
```

### Console Logging

```typescript
// Structured logging
const log = {
  debug: (tag: string, message: string, data?: unknown) => {
    if (__DEV__) {
      console.log(`[${tag}]`, message, data ?? '');
    }
  },
  error: (tag: string, error: Error) => {
    console.error(`[${tag}]`, error.message);
    // In production, send to error tracking
  },
};

// Usage
log.debug('Auth', 'Login attempt', { email });
log.error('API', new Error('Request failed'));
```

### React DevTools

```bash
# Standalone React DevTools
npx react-devtools

# Then connect from app:
# Shake device → Debug → Connect to React DevTools
```

## After Fixing the Bug

1. **Verify the fix** - Test on both iOS and Android
2. **Check for side effects** - Test related screens/features
3. **Clear caches** - `npx expo start --clear`
4. **Run tests**: `npm test`
5. **Test on real devices** - Simulators don't catch everything
6. **Create PR** - Use git workflow

## Related Resources

- [mobile-testing.md](../../guides/mobile-testing.md) - Testing guide
- [navigation-guide.md](../../guides/navigation-guide.md) - Navigation patterns
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
