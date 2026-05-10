# E2E Test Generator Guide

Guide for generating end-to-end tests for React Native mobile apps using Detox and Maestro.

---

## When to Generate Tests

This guide activates when:
- Creating a new screen component
- Modifying existing screen functionality
- Adding form validation or API integration
- You ask to "generate e2e tests" or "create mobile tests"
- After finishing a screen implementation

---

## Test Infrastructure

### Directory Structure

```
mobile/
├── e2e/
│   ├── config/
│   │   ├── detox.config.js       # Detox configuration
│   │   └── jest.config.js        # Jest config for Detox
│   ├── screens/                  # Screen Page Objects
│   │   ├── BaseScreen.ts
│   │   ├── LoginScreen.ts
│   │   ├── HomeScreen.ts
│   │   └── ProfileScreen.ts
│   ├── tests/                    # Test files
│   │   ├── auth/
│   │   │   ├── login.test.ts
│   │   │   └── signup.test.ts
│   │   ├── home/
│   │   │   └── home.test.ts
│   │   └── profile/
│   │       └── profile.test.ts
│   ├── fixtures/                 # Test data
│   │   ├── users.ts
│   │   └── testData.ts
│   ├── helpers/                  # Test utilities
│   │   ├── device.ts
│   │   └── wait.ts
│   └── flows/                    # Maestro YAML flows
│       ├── common/
│       │   └── login.yaml
│       ├── auth/
│       │   └── signup-flow.yaml
│       └── home/
│           └── navigation.yaml
└── .detoxrc.js                   # Detox root config
```

---

## Prerequisites

### 1. Install Detox

```bash
# Install Detox CLI globally
npm install -g detox-cli

# Install project dependencies
cd mobile
npm install detox --save-dev
npm install jest --save-dev
```

### 2. Install Maestro

```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### 3. Build Development App

```bash
# iOS
cd mobile
npx expo run:ios --configuration Debug

# Android
npx expo run:android --variant debug
```

---

## Quick Start - Generate Detox Tests

### Step 1: Create Screen Page Object

```typescript
// e2e/screens/LoginScreen.ts
import { by, element, expect } from 'detox';
import { BaseScreen } from './BaseScreen';

export class LoginScreen extends BaseScreen {
  protected screenId = 'login-screen';

  // Locators
  private emailInput = by.id('login-email-input');
  private passwordInput = by.id('login-password-input');
  private loginButton = by.id('login-submit-button');
  private errorText = by.id('login-error-text');

  // Actions
  async enterEmail(email: string): Promise<void> {
    await element(this.emailInput).clearText();
    await element(this.emailInput).typeText(email);
  }

  async enterPassword(password: string): Promise<void> {
    await element(this.passwordInput).clearText();
    await element(this.passwordInput).typeText(password);
  }

  async tapLogin(): Promise<void> {
    await element(this.loginButton).tap();
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  // Assertions
  async expectErrorVisible(message?: string): Promise<void> {
    await expect(element(this.errorText)).toBeVisible();
    if (message) {
      await expect(element(this.errorText)).toHaveText(message);
    }
  }
}
```

### Step 2: Create Test File

```typescript
// e2e/tests/auth/login.test.ts
import { device, expect, element, by } from 'detox';
import { LoginScreen } from '../../screens/LoginScreen';
import { HomeScreen } from '../../screens/HomeScreen';
import { testUsers } from '../../fixtures/users';

describe('Login Screen', () => {
  let loginScreen: LoginScreen;
  let homeScreen: HomeScreen;

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    loginScreen = new LoginScreen();
    homeScreen = new HomeScreen();
  });

  describe('Screen Load', () => {
    it('should display login form', async () => {
      await loginScreen.isVisible();
      await expect(element(by.id('login-email-input'))).toBeVisible();
      await expect(element(by.id('login-password-input'))).toBeVisible();
      await expect(element(by.id('login-submit-button'))).toBeVisible();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      await loginScreen.enterPassword('password123');
      await loginScreen.tapLogin();
      await loginScreen.expectErrorVisible();
    });

    it('should show error for invalid email', async () => {
      await loginScreen.enterEmail('invalid-email');
      await loginScreen.enterPassword('password123');
      await loginScreen.tapLogin();
      await loginScreen.expectErrorVisible('Invalid email');
    });
  });

  describe('Successful Login', () => {
    it('should navigate to home on valid credentials', async () => {
      await loginScreen.login(testUsers.patient.email, testUsers.patient.password);
      await homeScreen.waitForScreen();
      await homeScreen.isVisible();
    });
  });

  describe('Failed Login', () => {
    it('should show error for wrong password', async () => {
      await loginScreen.login(testUsers.patient.email, 'wrongpassword');
      await loginScreen.expectErrorVisible();
    });
  });
});
```

---

## Quick Start - Generate Maestro Tests

### Create YAML Flow

```yaml
# e2e/flows/auth/login.yaml
appId: com.yourapp.mobile

- launchApp:
    clearState: true

# Verify login screen is visible
- assertVisible:
    id: "login-screen"

# Enter credentials
- tapOn:
    id: "login-email-input"
- inputText: "test@example.com"

- tapOn:
    id: "login-password-input"
- inputText: "password123"

# Submit form
- tapOn:
    id: "login-submit-button"

# Verify navigation to home
- assertVisible:
    id: "home-screen"
    timeout: 5000
```

### Run Maestro Test

```bash
# Run single flow
maestro test e2e/flows/auth/login.yaml

# Run all flows
maestro test e2e/flows/

# Run with recording
maestro test --record e2e/flows/auth/login.yaml
```

---

## Test Patterns by Screen Type

### 1. Form Screens (Login, Signup)

```typescript
describe('[FormScreen] Tests', () => {
  describe('Screen Load', () => {
    it('should display all form elements', async () => {
      // Assert inputs visible
      // Assert submit button visible
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty required fields', async () => {});
    it('should show error for invalid format', async () => {});
  });

  describe('Successful Submission', () => {
    it('should navigate on success', async () => {});
  });

  describe('Error Handling', () => {
    it('should display API error messages', async () => {});
  });
});
```

### 2. List Screens

```typescript
describe('[ListScreen] Tests', () => {
  describe('Screen Load', () => {
    it('should display list items', async () => {});
    it('should show empty state when no items', async () => {});
  });

  describe('Pull to Refresh', () => {
    it('should refresh data on pull down', async () => {
      await element(by.id('list-scroll')).swipe('down', 'slow');
      // Assert refresh indicator
    });
  });

  describe('Item Selection', () => {
    it('should navigate to detail on tap', async () => {});
  });

  describe('Search/Filter', () => {
    it('should filter items by search query', async () => {});
  });
});
```

### 3. Detail Screens

```typescript
describe('[DetailScreen] Tests', () => {
  beforeEach(async () => {
    // Navigate to detail screen
  });

  describe('Screen Load', () => {
    it('should display item details', async () => {});
  });

  describe('Actions', () => {
    it('should handle primary action', async () => {});
    it('should handle share action', async () => {});
  });

  describe('Navigation', () => {
    it('should go back on back button', async () => {
      await element(by.id('back-button')).tap();
      // Assert previous screen
    });
  });
});
```

### 4. Tab Navigation

```typescript
describe('Tab Navigation', () => {
  it('should navigate between tabs', async () => {
    await element(by.id('tab-home')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();

    await element(by.id('tab-profile')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });
});
```

---

## Mobile-Specific Test Scenarios

### Gestures

```typescript
// Swipe
await element(by.id('card')).swipe('left');
await element(by.id('card')).swipe('right', 'fast');

// Pull to refresh
await element(by.id('scroll-view')).swipe('down', 'slow', 0.5);

// Scroll to element
await waitFor(element(by.id('target')))
  .toBeVisible()
  .whileElement(by.id('scroll-view'))
  .scroll(100, 'down');

// Long press
await element(by.id('item')).longPress(2000);

// Double tap
await element(by.id('image')).multiTap(2);
```

### Deep Links

```typescript
it('should handle deep link', async () => {
  await device.openURL({ url: 'myapp://profile/123' });
  await expect(element(by.id('profile-screen'))).toBeVisible();
});
```

### Permissions

```typescript
it('should handle camera permission', async () => {
  // iOS
  await device.launchApp({ permissions: { camera: 'YES' } });

  // Android - handled via adb
});
```

### Push Notifications

```typescript
it('should handle push notification', async () => {
  await device.sendUserNotification({
    trigger: { type: 'push' },
    title: 'New Message',
    body: 'You have a new message',
    payload: { screen: 'chat', id: '123' },
  });
});
```

### Network Conditions

```typescript
it('should handle offline state', async () => {
  await device.setURLBlacklist(['.*']);
  // Test offline behavior
  await device.setURLBlacklist([]);
});
```

### Device Rotation

```typescript
it('should handle rotation', async () => {
  await device.setOrientation('landscape');
  await expect(element(by.id('content'))).toBeVisible();
  await device.setOrientation('portrait');
});
```

---

## Running Tests

### Detox Commands

```bash
# Build test app
detox build --configuration ios.sim.debug

# Run all tests
detox test --configuration ios.sim.debug

# Run specific test file
detox test --configuration ios.sim.debug e2e/tests/auth/login.test.ts

# Run with verbose output
detox test --configuration ios.sim.debug --loglevel verbose

# Run on specific device
detox test --configuration ios.sim.debug --device-name "iPhone 15"
```

### Maestro Commands

```bash
# Run single flow
maestro test e2e/flows/login.yaml

# Run with variables
maestro test -e EMAIL=test@example.com e2e/flows/login.yaml

# Run on specific device
maestro test --device "iPhone 15" e2e/flows/login.yaml

# Generate report
maestro test --format junit e2e/flows/
```

---

## Test Checklist

### For Every New Screen

- [ ] **Screen Load Tests**
  - [ ] All main elements visible
  - [ ] Loading state handled
  - [ ] Error state handled

- [ ] **Form Tests** (if applicable)
  - [ ] Required field validation
  - [ ] Format validation
  - [ ] Keyboard handling

- [ ] **Navigation Tests**
  - [ ] Back navigation works
  - [ ] Tab navigation works
  - [ ] Deep link handling

- [ ] **Gesture Tests**
  - [ ] Scroll behavior
  - [ ] Swipe actions
  - [ ] Pull to refresh

- [ ] **Device Tests**
  - [ ] Portrait/landscape
  - [ ] Different screen sizes
  - [ ] Keyboard appearance

---

## Related Files

- [mobile-testing.md](../../guides/mobile-testing.md) - Mobile testing guide
