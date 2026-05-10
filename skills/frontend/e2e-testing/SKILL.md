---
name: e2e-testing
description: Comprehensive guide for end-to-end testing in React applications using Playwright, including test generation, fixtures, and page object patterns.
---

# E2E Testing for React/Playwright

Comprehensive guide for end-to-end testing in React applications using Playwright, including test generation, fixtures, and page object patterns.

## Table of Contents

- [Quick Start](#quick-start)
- [Test Infrastructure](#test-infrastructure)
- [Test Patterns](#test-patterns)
- [Page Objects](#page-objects)
- [Test Fixtures](#test-fixtures)
- [Reference Documentation](#reference-documentation)

---

## Quick Start

### Prerequisites

E2E tests run against the **real backend** (no mocking).

**Required:**
1. Backend server running: `cd backend && npm run start:dev`
2. Frontend dev server running: `cd frontend && npm run dev`
3. Test users seeded in database

### Generate Test

```bash
# Create test file
touch frontend/test/tests/[page].spec.ts
```

### Basic Test Template

```typescript
// frontend/test/tests/[page].spec.ts
import { test, expect } from '@playwright/test';
import { authenticateAsCoach, testUsers } from '../fixtures/auth.fixture';

test.describe('[PageName] Page', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsCoach(page);
    await page.goto('/coach/[route]');
  });

  test('should display page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/[Expected Title]/);
    await expect(page.getByRole('heading', { name: '[Page Title]' })).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    await page.getByRole('button', { name: '[Button]' }).click();
    await expect(page.getByText('[Expected Result]')).toBeVisible();
  });
});
```

---

## Test Infrastructure

### Directory Structure

```
frontend/
├── playwright.config.ts
└── test/
    ├── tests/                     # Test files by feature
    │   ├── auth/
    │   │   ├── login.spec.ts
    │   │   └── signup.spec.ts
    │   ├── coach/
    │   └── patient/
    ├── pages/                     # Page Object Models
    │   ├── base.page.ts
    │   ├── auth/
    │   ├── coach/
    │   └── patient/
    ├── fixtures/                  # Test fixtures
    │   ├── auth.fixture.ts
    │   └── user.fixture.ts
    └── utils/                     # Test utilities
        └── test-helpers.ts
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Patterns

### Authentication Tests

```typescript
test('should login successfully', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(testUsers.coach.username);
  await page.getByPlaceholder('Password').fill(testUsers.coach.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('/coach');
  await expect(page).toHaveURL('/coach');
});

test('should show error for invalid credentials', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('invalid');
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText(/invalid credentials/i)).toBeVisible();
});
```

### Form Submission Tests

```typescript
test('should submit form successfully', async ({ page }) => {
  await page.goto('/patient/exercise/new');

  await page.getByLabel('Exercise Name').fill('Morning Run');
  await page.getByLabel('Duration').fill('30');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Exercise created successfully')).toBeVisible();
  await page.waitForURL(/\/patient\/exercise\/\d+/);
});

test('should show validation errors', async ({ page }) => {
  await page.goto('/patient/exercise/new');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Name is required')).toBeVisible();
});
```

### List/CRUD Tests

```typescript
test('should display list of items', async ({ page }) => {
  await page.goto('/coach/patients');

  // Wait for either content or empty state
  await Promise.race([
    page.locator('[data-testid="patient-list"]').waitFor(),
    page.getByText('No patients found').waitFor(),
  ]);

  // Test shows data or empty state
  const hasData = await page.locator('[data-testid="patient-item"]').count() > 0;
  if (hasData) {
    await expect(page.locator('[data-testid="patient-item"]').first()).toBeVisible();
  } else {
    await expect(page.getByText('No patients found')).toBeVisible();
  }
});

test('should navigate to detail page', async ({ page }) => {
  await page.goto('/coach/patients');
  await page.locator('[data-testid="patient-item"]').first().click();

  await expect(page).toHaveURL(/\/coach\/patient\/\d+/);
  await expect(page.getByRole('heading')).toBeVisible();
});
```

---

## Page Objects

### Base Page Pattern

```typescript
// frontend/test/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}
  abstract readonly url: string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected async waitForContentOrEmptyState(
    contentLocator: Locator,
    emptyStateLocator: Locator,
  ): Promise<void> {
    await Promise.race([
      contentLocator.waitFor({ state: 'visible' }),
      emptyStateLocator.waitFor({ state: 'visible' }),
    ]);
  }
}
```

### Example Page Object

```typescript
// frontend/test/pages/coach/patients.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class CoachPatientsPage extends BasePage {
  readonly url = '/coach/patients';

  // Locators
  readonly patientList: Locator;
  readonly emptyState: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    this.patientList = page.locator('[data-testid="patient-list"]');
    this.emptyState = page.getByText('No patients found');
    this.addButton = page.getByRole('button', { name: 'Add Patient' });
  }

  async waitForPatients(): Promise<void> {
    await this.waitForContentOrEmptyState(this.patientList, this.emptyState);
  }

  async clickPatient(index: number): Promise<void> {
    await this.patientList.locator('[data-testid="patient-item"]').nth(index).click();
  }

  async addNewPatient(): Promise<void> {
    await this.addButton.click();
  }
}
```

### Using Page Objects

```typescript
import { CoachPatientsPage } from '../pages/coach/patients.page';

test('should navigate to patient detail', async ({ page }) => {
  const patientsPage = new CoachPatientsPage(page);

  await patientsPage.navigate();
  await patientsPage.waitForPatients();
  await patientsPage.clickPatient(0);

  await expect(page).toHaveURL(/\/coach\/patient\/\d+/);
});
```

---

## Test Fixtures

### Authentication Fixtures

```typescript
// frontend/test/fixtures/auth.fixture.ts
import { Page } from '@playwright/test';

export const testUsers = {
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '12341234',
    role: 'ADMIN',
  },
  coach: {
    username: 'coach',
    email: 'coach@example.com',
    password: '12341234',
    role: 'COACH',
  },
  patient: {
    username: 'patient',
    email: 'patient@example.com',
    password: '12341234',
    role: 'PATIENT',
  },
};

export async function authenticateAsCoach(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(testUsers.coach.username);
  await page.getByPlaceholder('Password').fill(testUsers.coach.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/coach');
}

export async function authenticateAsPatient(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(testUsers.patient.username);
  await page.getByPlaceholder('Password').fill(testUsers.patient.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/patient');
}
```

### Custom Fixtures

```typescript
// Extend base test with custom fixtures
import { test as base } from '@playwright/test';
import { CoachPatientsPage } from './pages/coach/patients.page';

type MyFixtures = {
  patientsPage: CoachPatientsPage;
  authenticatedCoach: void;
};

export const test = base.extend<MyFixtures>({
  authenticatedCoach: async ({ page }, use) => {
    await authenticateAsCoach(page);
    await use();
  },

  patientsPage: async ({ page }, use) => {
    const patientsPage = new CoachPatientsPage(page);
    await use(patientsPage);
  },
});

// Usage
test('should load patients', async ({ authenticatedCoach, patientsPage }) => {
  await patientsPage.navigate();
  await patientsPage.waitForPatients();
});
```

---

## Best Practices

### 1. No Mocking - Use Real APIs

```typescript
// ✅ GOOD - Tests real backend
test('should create patient', async ({ page }) => {
  await page.goto('/coach/patients/new');
  await page.getByLabel('Name').fill('John Doe');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Patient created')).toBeVisible();
});

// ❌ BAD - Don't mock APIs in E2E tests
test('should create patient', async ({ page }) => {
  await page.route('**/api/patients', (route) => {
    route.fulfill({ json: { id: 1, name: 'John Doe' } });
  });
  // This defeats the purpose of E2E testing
});
```

### 2. Use data-testid for Stability

```typescript
// ✅ GOOD - Stable selector
await page.locator('[data-testid="submit-button"]').click();

// ⚠️ OK - Semantic selector
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ BAD - Fragile selector
await page.locator('button.bg-blue-500.px-4').click();
```

### 3. Wait for Content or Empty State

```typescript
// ✅ GOOD - Handles both cases
await Promise.race([
  page.locator('[data-testid="content"]').waitFor(),
  page.getByText('No data').waitFor(),
]);

// ❌ BAD - Assumes data exists
await page.locator('[data-testid="content"]').waitFor();
```

### 4. Clean Test Data

```typescript
// For tests that create data
test.afterEach(async ({ page }) => {
  // Clean up created resources if needed
  // Or use test database that resets between runs
});
```

---

## Reference Documentation

For detailed patterns and templates, see:

### Core Documentation
- [Test Patterns](./resources/test-patterns.md) - Common test scenarios
- [Page Object Templates](./resources/page-object-templates.md) - Page object examples

### Related Skills
- [design-qa-figma](../qa/design-qa-figma.md) - Figma design QA
- [design-qa-html](../qa/design-qa-html.md) - HTML prototype QA
- [fix-bug](../debugging/fix-bug.md) - Debugging guide

### Official Documentation
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

**Line Count**: ~470 lines (under 500 limit ✅)
