---
description: Build React Native app using Expo for iOS/Android
argument-hint: "[platform: ios|android|all] [profile: development|preview|production]"
---

# Mobile Build Command

Build the React Native mobile app using Expo Application Services (EAS).

## Prerequisites

1. Expo CLI installed: `npm install -g expo-cli`
2. EAS CLI installed: `npm install -g eas-cli`
3. Authenticated with Expo: `eas login`

---

## Phase 1: Parse Arguments

Arguments: $ARGUMENTS

**Defaults:**
- Platform: `all` (both iOS and Android)
- Profile: `development`

**Available profiles:**
- `development` - Debug build with development server
- `preview` - Internal testing build
- `production` - Release build for app stores

---

## Phase 2: Pre-Build Checks

### 1. Verify Dependencies

```bash
cd mobile && npm install
```

### 2. TypeScript Check

```bash
cd mobile && npx tsc --noEmit
```

### 3. Lint Check

```bash
cd mobile && npm run lint
```

If any checks fail, report errors and stop.

---

## Phase 3: Build Execution

### Development Build (Local)

```bash
# iOS Simulator
cd mobile && npx expo run:ios

# Android Emulator
cd mobile && npx expo run:android
```

### EAS Build (Cloud)

```bash
# iOS
cd mobile && eas build --platform ios --profile {profile}

# Android
cd mobile && eas build --platform android --profile {profile}

# Both platforms
cd mobile && eas build --platform all --profile {profile}
```

---

## Phase 4: Build Output

### Development
- iOS: Opens in Simulator
- Android: Opens in Emulator

### Preview/Production
- Provides download links for:
  - iOS: `.ipa` file
  - Android: `.apk` or `.aab` file

---

## Common Issues

### iOS Build Fails
```
Check:
1. Valid Apple Developer account
2. Provisioning profiles configured in eas.json
3. Bundle identifier matches App Store Connect
```

### Android Build Fails
```
Check:
1. Keystore configured in eas.json
2. Package name is unique
3. SDK versions compatible
```

### Metro Bundler Issues
```bash
# Clear cache and restart
cd mobile && npx expo start --clear
```

---

## Related Resources
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
