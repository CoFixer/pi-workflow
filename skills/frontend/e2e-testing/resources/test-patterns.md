# Test Patterns by Page Type

Complete test pattern templates for different page types.

## Table of Contents

- [Form Page Tests](#form-page-tests)
- [List Page Tests](#list-page-tests)
- [Detail Page Tests](#detail-page-tests)
- [Multi-Step Flow Tests](#multi-step-flow-tests)

---

## Form Page Tests

For login, signup, create/edit forms:

```typescript
test.describe('[FormPage] Tests', () => {
  test.describe('Page Load', () => {
    test('should display form elements', async () => {
      // Assert all form inputs are visible
      // Assert submit button is visible
      // Assert form title/heading is correct
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty required fields', async () => {
      // Submit without filling required fields
      // Assert validation errors appear
    });

    test('should show error for invalid format', async () => {
      // Fill with invalid format (email, phone, etc.)
      // Assert format validation errors
    });

    test('should show error for password mismatch', async () => {
      // For signup forms with confirm password
    });
  });

  test.describe('Successful Submission', () => {
    test('should submit form with valid data', async () => {
      // Fill all fields with valid data
      // Submit form
      // Assert redirect or success message
    });
  });

  test.describe('Error Handling', () => {
    test('should display error for invalid credentials', async () => {
      // Use real invalid credentials to trigger error
      await loginPage.login('invaliduser', 'wrongpassword');
      // Assert error message displayed
      await expect(page.getByText(/아이디 또는 비밀번호가 올바르지 않습니다/)).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to related pages', async () => {
      // Click links (register, forgot password, etc.)
      // Assert navigation works
    });
  });
});
```

---

## List Page Tests

For patients, exercises, chat lists:

```typescript
test.describe('[ListPage] Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before accessing protected pages
    await authenticateAsCoach(page);
  });

  test.describe('Page Load', () => {
    test('should display page header', async () => {
      // Assert title, count, breadcrumbs
    });

    test('should display list items', async ({ page }) => {
      // Assert list is populated
      const count = await page.locator('[data-testid="list-item"]').count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Search/Filter', () => {
    test('should filter items by search query', async () => {
      // Enter search term
      // Assert filtered results
    });

    test('should show empty state for no results', async () => {
      // Search for non-existent term
      // Assert empty state message
    });

    test('should clear search and show all items', async () => {
      // Search, then clear
      // Assert all items visible again
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to detail page on item click', async ({ page }) => {
      // Click on list item
      await page.waitForURL(/\/detail\/\d+/);
    });
  });

  test.describe('Actions', () => {
    test('should handle delete action', async () => {
      // If list has delete functionality
    });

    test('should handle bulk actions', async () => {
      // If list has bulk selection
    });
  });
});
```

---

## Detail Page Tests

For patient detail, exercise detail:

```typescript
test.describe('[DetailPage] Tests', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsPatient(page);
    // Navigate to specific detail page
    await page.goto('/patient/exercise/1');
  });

  test.describe('Page Load', () => {
    test('should display item details', async () => {
      // Assert title, description, metadata
    });

    test('should display related sections', async () => {
      // Assert related data sections (history, progress, etc.)
    });
  });

  test.describe('Actions', () => {
    test('should handle primary action', async () => {
      // Click main action button
      // Assert result
    });

    test('should handle edit action', async () => {
      // If editable
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to list', async ({ page }) => {
      await page.getByRole('button', { name: /back/i }).click();
      await page.waitForURL('/patient/exercise');
    });
  });
});
```

---

## Multi-Step Flow Tests

For patient signup with OTP, wizards:

```typescript
test.describe('[MultiStepFlow] Tests', () => {
  test.describe('Step 1: Form Input', () => {
    test('should validate and proceed to step 2', async () => {
      // Fill step 1 fields
      // Submit
      // Assert step 2 is visible
    });
  });

  test.describe('Step 2: OTP Verification', () => {
    test('should send OTP and show input', async () => {
      // Complete step 1
      // Assert OTP input appears
      // Assert countdown timer visible
    });

    test('should verify valid OTP', async () => {
      // Enter valid OTP
      // Submit
      // Assert proceed to step 3
    });

    test('should allow OTP resend after countdown', async () => {
      // Wait for countdown
      // Assert resend button enabled
    });
  });

  test.describe('Step 3: Completion', () => {
    test('should complete registration and redirect', async () => {
      // Complete all steps
      // Assert redirect to dashboard
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid OTP', async () => {
      // Enter invalid OTP
      // Assert error message
    });

    test('should handle expired OTP', async () => {
      // Test expired OTP scenario
    });
  });
});
```

---

## Complete Example: Login Page Tests

```typescript
// frontend/test/tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test.describe('Page Load', () => {
    test('should display login form', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.signInButton).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty email', async () => {
      await loginPage.passwordInput.fill('password123');
      await loginPage.signInButton.click();
      await loginPage.expectEmailError();
    });
  });

  test.describe('Successful Login', () => {
    test('should redirect to dashboard on valid credentials', async ({ page }) => {
      await loginPage.login('coach@test.com', 'CoachTest@123');
      await page.waitForURL('/coach');
    });
  });
});
```

---

## Complete Example: List Page Tests

```typescript
// frontend/test/tests/coach/patients.spec.ts
import { test, expect } from '@playwright/test';
import { PatientsPage } from '../../pages/coach/patients.page';
import { authenticateAsCoach } from '../../fixtures/auth.fixture';

test.describe('Patients List Page', () => {
  let patientsPage: PatientsPage;

  test.beforeEach(async ({ page }) => {
    await authenticateAsCoach(page);
    patientsPage = new PatientsPage(page);
    await patientsPage.navigate();
  });

  test('should display patient list', async () => {
    await expect(patientsPage.title).toBeVisible();
    const count = await patientsPage.getPatientCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter patients by name', async () => {
    await patientsPage.searchPatient('이재활');
    await patientsPage.expectPatientVisible('이재활');
  });

  test('should navigate to patient detail', async ({ page }) => {
    await patientsPage.clickPatient('이재활');
    await page.waitForURL(/\/coach\/patient\/\d+/);
  });
});
```
