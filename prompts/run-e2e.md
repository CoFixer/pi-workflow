---
description: Run E2E tests for React Native mobile app using Maestro or Detox
argument-hint: "[test-file or 'all'] [--platform ios|android]"
---

# Mobile E2E Testing Command

Run end-to-end tests for the React Native mobile app.

## Supported Frameworks

1. **Maestro** (Recommended) - Simple YAML-based mobile UI testing
2. **Detox** - Gray-box E2E testing by Wix

---

## Phase 1: Parse Arguments

Arguments: $ARGUMENTS

**Defaults:**
- Tests: `all`
- Platform: `ios` (or detect from environment)

---

## Phase 2: Prerequisites Check

### For Maestro

```bash
# Check Maestro installation
maestro --version

# If not installed
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### For Detox

```bash
# Check Detox CLI
detox --version

# If not installed
npm install -g detox-cli
```

---

## Phase 3: Build Test App

### Development Build Required

```bash
# iOS
cd mobile && npx expo run:ios --configuration Debug

# Android
cd mobile && npx expo run:android --variant debug
```

---

## Phase 4: Run Tests

### Maestro Tests

```bash
# Run single test
cd mobile && maestro test e2e/flows/{test-file}.yaml

# Run all tests
cd mobile && maestro test e2e/flows/

# Run with specific device
cd mobile && maestro test --device "iPhone 15" e2e/flows/
```

### Detox Tests

```bash
# Build test app
cd mobile && detox build --configuration ios.sim.debug

# Run tests
cd mobile && detox test --configuration ios.sim.debug

# Run specific test file
cd mobile && detox test --configuration ios.sim.debug e2e/{test-file}.test.ts
```

---

## Phase 5: Test Results

### Maestro Output
- Console output with pass/fail status
- Screenshots on failure saved to `.maestro/`
- Video recording available with `--record`

### Detox Output
- Jest-style test results
- Artifacts (screenshots, logs) in `artifacts/`

---

## Writing Tests

### Maestro Test Example (YAML)

```yaml
# e2e/flows/login.yaml
appId: com.anonymous.nativestarter

- launchApp
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome"
```

### Detox Test Example (TypeScript)

```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Welcome'))).toBeVisible();
  });
});
```

---

## Common Issues

### App Not Found
```
Ensure development build is installed on simulator/emulator.
Run: npx expo run:ios (or android) first.
```

### Element Not Found
```
Check:
1. testID prop is set on component
2. Element is visible on screen
3. Wait for async operations to complete
```

### Flaky Tests
```
Add explicit waits:
- Maestro: Use `waitForVisible` or `waitForAnimationEnd`
- Detox: Use `waitFor(...).toBeVisible().withTimeout(5000)`
```

---

## Related Resources
- [e2e-test-generator.md](../skills/e2e-test-generator.md)
- [e2e-fixtures.md](../skills/e2e-fixtures.md)
- [e2e-page-objects.md](../skills/e2e-page-objects.md)
