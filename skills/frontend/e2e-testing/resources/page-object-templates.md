# Page Object Templates

Complete templates for different page types in Playwright E2E tests.

## Table of Contents

- [Form Page Object Template](#form-page-object-template)
- [List Page Object Template](#list-page-object-template)
- [Detail Page Object Template](#detail-page-object-template)
- [Multi-Step Page Object Template](#multi-step-page-object-template)

---

## Form Page Object Template

For pages with forms (login, signup, create/edit forms):

```typescript
// frontend/test/pages/auth/login.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  // =====================
  // LOCATORS
  // =====================
  // Define all interactive elements
  readonly emailInput = this.page.getByPlaceholder('Enter your email');
  readonly passwordInput = this.page.getByPlaceholder('Enter your password');
  readonly signInButton = this.page.getByRole('button', { name: /sign in/i });
  readonly registerLink = this.page.getByRole('link', { name: /create.*account/i });
  readonly forgotPasswordLink = this.page.getByRole('link', { name: /forgot/i });

  // Error elements
  readonly emailError = this.emailInput.locator('..').locator('.text-destructive');
  readonly passwordError = this.passwordInput.locator('..').locator('.text-destructive');
  readonly formError = this.page.locator('[role="alert"]');

  constructor(page: Page) {
    super(page);
  }

  // =====================
  // ACTIONS
  // =====================
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.signInButton.click();
  }

  async navigateToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.page.waitForURL('/register');
  }

  async navigateToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('/forgot-password');
  }

  // =====================
  // ASSERTIONS
  // =====================
  async expectEmailError(message?: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    if (message) {
      await expect(this.emailError).toContainText(message);
    }
  }

  async expectPasswordError(message?: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    if (message) {
      await expect(this.passwordError).toContainText(message);
    }
  }

  async expectFormError(message: string): Promise<void> {
    await expect(this.formError).toContainText(message);
  }

  async expectSubmitDisabled(): Promise<void> {
    await expect(this.signInButton).toBeDisabled();
  }

  async expectSubmitEnabled(): Promise<void> {
    await expect(this.signInButton).toBeEnabled();
  }
}
```

---

## List Page Object Template

For pages with lists/tables (patients, exercises, chat):

```typescript
// frontend/test/pages/coach/patients.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class PatientsPage extends BasePage {
  readonly url = '/coach/patients';

  // =====================
  // LOCATORS - Header
  // =====================
  readonly title = this.page.getByRole('heading', { name: '담당 환자' });
  readonly patientCount = this.page.locator('p').filter({ hasText: /총.*명/ });

  // =====================
  // LOCATORS - Search/Filter
  // =====================
  readonly searchInput = this.page.getByPlaceholder('이름 검색...');
  readonly sortButton = this.page.getByRole('button', { name: /sort/i });
  readonly filterButton = this.page.getByRole('button', { name: /filter/i });

  // =====================
  // LOCATORS - List Items
  // =====================
  readonly patientCards = this.page.locator('[data-testid="patient-card"]');
  readonly emptyState = this.page.getByText('검색 결과가 없습니다');
  readonly loadingSpinner = this.page.locator('[data-loading="true"]');

  constructor(page: Page) {
    super(page);
  }

  // =====================
  // ACTIONS - Search/Filter
  // =====================
  async searchPatient(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForLoadState('networkidle');
  }

  async sortBy(option: string): Promise<void> {
    await this.sortButton.click();
    await this.page.getByRole('option', { name: option }).click();
  }

  // =====================
  // ACTIONS - List Items
  // =====================
  async clickPatient(name: string): Promise<void> {
    await this.patientCards.filter({ hasText: name }).click();
  }

  async clickPatientByIndex(index: number): Promise<void> {
    await this.patientCards.nth(index).click();
  }

  async getPatientCard(name: string): Promise<Locator> {
    return this.patientCards.filter({ hasText: name });
  }

  // =====================
  // GETTERS
  // =====================
  async getPatientCount(): Promise<number> {
    return this.patientCards.count();
  }

  async getPatientNames(): Promise<string[]> {
    const cards = await this.patientCards.all();
    const names: string[] = [];
    for (const card of cards) {
      const name = await card.locator('.patient-name, h3').textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  // =====================
  // ASSERTIONS
  // =====================
  async expectPatientVisible(name: string): Promise<void> {
    await expect(this.patientCards.filter({ hasText: name })).toBeVisible();
  }

  async expectPatientNotVisible(name: string): Promise<void> {
    await expect(this.patientCards.filter({ hasText: name })).not.toBeVisible();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  async expectPatientCount(count: number): Promise<void> {
    await expect(this.patientCards).toHaveCount(count);
  }

  async expectLoading(): Promise<void> {
    await expect(this.loadingSpinner).toBeVisible();
  }

  async expectLoadingComplete(): Promise<void> {
    await expect(this.loadingSpinner).not.toBeVisible();
  }
}
```

---

## Detail Page Object Template

For detail/single-item pages:

```typescript
// frontend/test/pages/patient/exercise-detail.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class ExerciseDetailPage extends BasePage {
  readonly exerciseId: string;

  get url(): string {
    return `/patient/exercise/${this.exerciseId}`;
  }

  // =====================
  // LOCATORS - Header
  // =====================
  readonly backButton = this.page.getByRole('button', { name: /back|뒤로/i });
  readonly title = this.page.getByRole('heading').first();

  // =====================
  // LOCATORS - Content
  // =====================
  readonly videoPlayer = this.page.locator('video, [data-testid="video-player"]');
  readonly playButton = this.page.getByRole('button', { name: /play/i });
  readonly pauseButton = this.page.getByRole('button', { name: /pause/i });
  readonly instructions = this.page.locator('[data-testid="instructions"]');

  // =====================
  // LOCATORS - Progress
  // =====================
  readonly setIndicator = this.page.locator('[data-testid="set-indicator"]');
  readonly progressBar = this.page.locator('[data-testid="progress-bar"]');
  readonly nextSetButton = this.page.getByRole('button', { name: /next|다음/i });
  readonly restartButton = this.page.getByRole('button', { name: /restart|다시/i });
  readonly completeButton = this.page.getByRole('button', { name: /complete|완료/i });

  constructor(page: Page, exerciseId: string) {
    super(page);
    this.exerciseId = exerciseId;
  }

  // =====================
  // ACTIONS
  // =====================
  async clickPlayButton(): Promise<void> {
    await this.playButton.click();
  }

  async clickPauseButton(): Promise<void> {
    await this.pauseButton.click();
  }

  async clickNextSet(): Promise<void> {
    await this.nextSetButton.click();
  }

  async clickRestart(): Promise<void> {
    await this.restartButton.click();
  }

  async completeExercise(): Promise<void> {
    await this.completeButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForURL('/patient/exercise');
  }

  // =====================
  // ASSERTIONS
  // =====================
  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toContainText(title);
  }

  async expectSetProgress(current: number, total: number): Promise<void> {
    await expect(this.setIndicator).toContainText(`${current} / ${total}`);
  }

  async expectVideoPlaying(): Promise<void> {
    await expect(this.pauseButton).toBeVisible();
  }

  async expectVideoPaused(): Promise<void> {
    await expect(this.playButton).toBeVisible();
  }

  async expectExerciseComplete(): Promise<void> {
    await expect(this.page.getByText(/완료|complete/i)).toBeVisible();
  }
}
```

---

## Multi-Step Page Object Template

For multi-step flows (signup with OTP, wizards):

```typescript
// frontend/test/pages/auth/patient-signup.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class PatientSignupPage extends BasePage {
  readonly url = '/signup/patient';

  // =====================
  // STEP INDICATORS
  // =====================
  readonly stepIndicator = this.page.locator('[data-testid="step-indicator"]');

  // =====================
  // STEP 1 - Form Input
  // =====================
  readonly usernameInput = this.page.getByPlaceholder('아이디');
  readonly passwordInput = this.page.getByPlaceholder('비밀번호');
  readonly confirmPasswordInput = this.page.getByPlaceholder('비밀번호 확인');
  readonly nameInput = this.page.getByPlaceholder('이름');
  readonly phoneInput = this.page.getByPlaceholder('전화번호');
  readonly emailInput = this.page.getByPlaceholder('이메일');
  readonly sendOtpButton = this.page.getByRole('button', { name: /인증번호 받기/i });

  // =====================
  // STEP 2 - OTP Verification
  // =====================
  readonly otpInput = this.page.getByPlaceholder('인증번호');
  readonly verifyOtpButton = this.page.getByRole('button', { name: /인증 확인/i });
  readonly resendOtpButton = this.page.getByRole('button', { name: /재전송/i });
  readonly countdown = this.page.locator('[data-testid="countdown"]');
  readonly otpSentMessage = this.page.getByText(/인증번호.*전송/i);

  // =====================
  // STEP 3 - Complete
  // =====================
  readonly registerButton = this.page.getByRole('button', { name: /가입하기/i });
  readonly verifiedBadge = this.page.locator('[data-testid="verified-badge"]');

  constructor(page: Page) {
    super(page);
  }

  // =====================
  // STEP 1 ACTIONS
  // =====================
  async fillRegistrationForm(data: {
    username: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
  }): Promise<void> {
    await this.usernameInput.fill(data.username);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    await this.nameInput.fill(data.name);
    await this.phoneInput.fill(data.phone);
    if (data.email) {
      await this.emailInput.fill(data.email);
    }
  }

  async clickSendOtp(): Promise<void> {
    await this.sendOtpButton.click();
  }

  // =====================
  // STEP 2 ACTIONS
  // =====================
  async enterOtp(otp: string): Promise<void> {
    await this.otpInput.fill(otp);
  }

  async verifyOtp(): Promise<void> {
    await this.verifyOtpButton.click();
  }

  async resendOtp(): Promise<void> {
    await this.resendOtpButton.click();
  }

  async waitForCountdownEnd(): Promise<void> {
    await expect(this.resendOtpButton).toBeEnabled({ timeout: 185000 });
  }

  // =====================
  // STEP 3 ACTIONS
  // =====================
  async completeRegistration(): Promise<void> {
    await this.registerButton.click();
  }

  // =====================
  // FULL FLOW
  // =====================
  async completeFullSignup(data: {
    username: string;
    password: string;
    name: string;
    phone: string;
    otp: string;
  }): Promise<void> {
    // Step 1
    await this.fillRegistrationForm(data);
    await this.clickSendOtp();

    // Step 2
    await expect(this.otpInput).toBeVisible();
    await this.enterOtp(data.otp);
    await this.verifyOtp();

    // Step 3
    await expect(this.registerButton).toBeVisible();
    await this.completeRegistration();
  }

  // =====================
  // ASSERTIONS
  // =====================
  async expectOnStep(step: 1 | 2 | 3): Promise<void> {
    await expect(this.stepIndicator).toContainText(`${step}`);
  }

  async expectOtpSent(): Promise<void> {
    await expect(this.otpSentMessage).toBeVisible();
    await expect(this.otpInput).toBeVisible();
  }

  async expectOtpVerified(): Promise<void> {
    await expect(this.verifiedBadge).toBeVisible();
  }

  async expectOtpError(message?: string): Promise<void> {
    const error = this.otpInput.locator('..').locator('.text-destructive');
    await expect(error).toBeVisible();
    if (message) {
      await expect(error).toContainText(message);
    }
  }

  async expectCountdownVisible(): Promise<void> {
    await expect(this.countdown).toBeVisible();
  }

  async expectResendEnabled(): Promise<void> {
    await expect(this.resendOtpButton).toBeEnabled();
  }

  async expectResendDisabled(): Promise<void> {
    await expect(this.resendOtpButton).toBeDisabled();
  }
}
```
