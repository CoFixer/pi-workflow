# Mobile Testing Guide

Debugging and testing strategies for React Native mobile applications.

---

## Development Environment Setup

### Prerequisites
- iOS: Xcode with iOS Simulator
- Android: Android Studio with Emulator
- React Native Debugger (recommended)
- Flipper (Facebook's debugging tool)

---

## Console Debugging

### LogBox (Built-in)

React Native's built-in logging system:

```typescript
// Basic logging
console.log('Debug message');
console.warn('Warning message');
console.error('Error message');

// Disable specific warnings in development
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Warning: componentWillMount',
  'Require cycle:',
]);

// Disable all warnings (not recommended)
LogBox.ignoreAllLogs();
```

### Structured Logging

```typescript
// src/utils/logger.ts
const logger = {
  debug: (tag: string, message: string, data?: unknown) => {
    if (__DEV__) {
      console.log(`[${tag}]`, message, data ?? '');
    }
  },
  error: (tag: string, error: Error) => {
    console.error(`[${tag}]`, error.message, error.stack);
  },
};

// Usage
logger.debug('Auth', 'Login attempt', { email });
logger.error('API', new Error('Request failed'));
```

---

## React Native Debugger

### Installation

```bash
# macOS
brew install react-native-debugger

# Windows/Linux
# Download from: https://github.com/jhen0409/react-native-debugger/releases
```

### Features
- React DevTools integration
- Redux DevTools integration
- Network inspector
- Console with source maps
- AsyncStorage viewer

### Usage

1. Start the debugger app
2. In your app, shake device or `Cmd+D` (iOS) / `Cmd+M` (Android)
3. Select "Debug with React Native Debugger"

---

## Flipper Debugging

### Setup

Flipper is pre-configured in React Native 0.62+.

```bash
# Install Flipper desktop app
# Download from: https://fbflipper.com/
```

### Key Plugins

| Plugin | Purpose |
|--------|---------|
| Logs | View console output |
| React DevTools | Component inspection |
| Network | HTTP request/response inspection |
| Layout | View hierarchy inspector |
| Databases | SQLite/Realm inspection |
| Shared Preferences | AsyncStorage viewer |
| Crash Reporter | Crash logs |

### Network Debugging in Flipper

```typescript
// Requests are automatically captured
// View in Flipper > Network tab:
// - Request/response headers
// - Request/response body
// - Timing information
// - Status codes
```

---

## iOS Debugging (Xcode)

### Simulator Controls

| Action | Shortcut |
|--------|----------|
| Shake gesture | `Cmd + Ctrl + Z` |
| Home button | `Cmd + Shift + H` |
| Screenshot | `Cmd + S` |
| Record video | `Cmd + R` |
| Rotate | `Cmd + Left/Right Arrow` |

### Xcode Instruments

Performance profiling tools:

```bash
# Open Instruments
Xcode > Open Developer Tool > Instruments
```

**Useful Templates:**
- **Time Profiler** - CPU usage analysis
- **Allocations** - Memory allocation tracking
- **Leaks** - Memory leak detection
- **Network** - Network activity monitoring
- **Energy Log** - Battery usage analysis

### View Hierarchy Debugger

1. Run app in Xcode
2. Debug > View Debugging > Capture View Hierarchy
3. Inspect 3D view of component tree

---

## Android Debugging (Android Studio)

### Emulator Controls

| Action | Shortcut |
|--------|----------|
| Shake gesture | `Cmd + M` |
| Home button | Home key |
| Back button | Backspace |
| Rotate | `Cmd + Left/Right Arrow` |

### Android Profiler

```bash
# Open Android Studio
View > Tool Windows > Profiler
```

**Available Profilers:**
- **CPU Profiler** - Method tracing, CPU usage
- **Memory Profiler** - Heap dumps, allocation tracking
- **Network Profiler** - Request/response inspection
- **Energy Profiler** - Battery drain analysis

### Layout Inspector

1. Run app on emulator/device
2. Tools > Layout Inspector
3. Select running process
4. Inspect component tree and properties

### Logcat Filtering

```bash
# Filter by tag
adb logcat -s ReactNative:V

# Filter by app package
adb logcat | grep "com.yourapp"

# Clear logs
adb logcat -c
```

---

## Network Debugging

### Viewing API Requests

**Option 1: Flipper Network Plugin**
- Best option for most cases
- Shows request/response bodies
- Supports search and filtering

**Option 2: React Native Debugger**
- Enable Network Inspect in debugger
- View in Network tab

**Option 3: Proxy Tools**
- Charles Proxy
- Proxyman (macOS)
- mitmproxy

### Debugging HTTPS

For inspecting HTTPS traffic:

```typescript
// android/app/src/main/res/xml/network_security_config.xml
// Allow cleartext for debugging (development only)
```

---

## State Debugging

### Redux DevTools

With React Native Debugger:

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  devTools: __DEV__, // Enable in development
});
```

### AsyncStorage Debugging

```typescript
// View all stored data
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log('AsyncStorage:', items);
};
```

---

## Performance Testing

### JavaScript Thread Performance

```typescript
// Enable performance monitoring
import { PerformanceObserver } from 'react-native';

// Or use React DevTools Profiler
// 1. Open React DevTools
// 2. Select Profiler tab
// 3. Record interactions
// 4. Analyze flame graph
```

### Frame Rate Monitoring

```typescript
// Enable FPS monitor
// Shake device > Show Perf Monitor

// Target: 60 FPS (16.67ms per frame)
// Warning: < 30 FPS indicates performance issues
```

### Memory Profiling

Signs of memory issues:
- App becomes sluggish over time
- Sudden crashes
- High memory warnings

Debug with:
1. Xcode Instruments > Allocations
2. Android Studio > Memory Profiler
3. Flipper > Memory plugin

---

## Common Debugging Scenarios

### App Crashes on Startup

```bash
# iOS - View crash logs
xcrun simctl spawn booted log stream --level=error

# Android - View crash logs
adb logcat *:E
```

### Component Not Rendering

1. Check console for errors
2. Verify component is imported correctly
3. Check conditional rendering logic
4. Use React DevTools to inspect component tree

### API Requests Failing

1. Check Network tab in Flipper
2. Verify base URL configuration
3. Check authentication tokens
4. Test API endpoint separately

### State Not Updating

1. Open Redux DevTools
2. Verify action is dispatched
3. Check reducer logic
4. Verify component is connected to store

---

## Testing Checklist

### Before Release
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Test different screen sizes
- [ ] Test offline behavior
- [ ] Test deep links
- [ ] Test push notifications
- [ ] Test app backgrounding/foregrounding
- [ ] Profile memory usage
- [ ] Profile CPU usage
- [ ] Test with slow network (Network Link Conditioner)

### Debugging Tools Summary

| Tool | Platform | Best For |
|------|----------|----------|
| React Native Debugger | All | Redux, console, general debugging |
| Flipper | All | Network, layout, databases |
| Xcode Instruments | iOS | Performance profiling |
| Android Studio Profiler | Android | Performance profiling |
| LogBox | All | Quick console debugging |
