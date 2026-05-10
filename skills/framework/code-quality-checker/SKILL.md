---
name: code-quality-checker
description: Analyze and improve code quality in NestJS projects with automated linting, formatting, and best practice checks.
---

# Code Quality Checker

Analyze and improve code quality in NestJS projects with automated linting, formatting, and best practice checks.

---

## Overview

This skill performs:
1. **ESLint Analysis** - Check code style and potential bugs
2. **Prettier Formatting** - Auto-format code consistently
3. **TypeScript Strict Checks** - Enforce type safety
4. **Circular Dependency Detection** - Find circular imports
5. **Code Smell Detection** - Identify anti-patterns
6. **Security Audit** - Check for vulnerabilities

---

## Quick Start

### Run Complete Code Quality Check

User prompt:
```
Check code quality for the project
```

Claude runs:
1. ESLint to find issues
2. Prettier to check formatting
3. TypeScript compiler with strict mode
4. Circular dependency checker
5. Security audit (npm audit)
6. Generates report with issues and fixes

---

## Patterns

### ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
    }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
    ],
    'no-console': 'warn',
    'no-debugger': 'error',
  },
};
```

---

### Prettier Configuration (.prettierrc)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

### TypeScript Strict Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Code Quality Checks

### 1. ESLint Check

```bash
# Check all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Common Issues Detected:**
- Unused variables
- Missing return types
- Use of `any` type
- Inconsistent naming
- Missing async/await
- Incorrect imports

---

### 2. Prettier Formatting

```bash
# Check formatting
npm run format:check

# Auto-format all files
npm run format
```

**Files to Format:**
- `**/*.ts`
- `**/*.js`
- `**/*.json`
- `**/*.md`

---

### 3. TypeScript Compiler Check

```bash
# Type check without emitting files
npx tsc --noEmit

# Type check with strict mode
npx tsc --noEmit --strict
```

**Strict Checks:**
- No implicit any
- Strict null checks
- Strict function types
- No unused parameters

---

### 4. Circular Dependency Detection

```bash
# Install madge
npm install --save-dev madge

# Check for circular dependencies
npx madge --circular --extensions ts src/
```

**Common Circular Dependencies:**
- Service imports another service that imports the first
- Entity circular references
- Module circular imports

---

### 5. Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

---

### 6. Code Smell Detection

**Anti-Patterns to Avoid:**

❌ **God Classes** (too many responsibilities)
```typescript
// Bad: Service doing everything
class OrderService {
  async createOrder() {}
  async processPayment() {}
  async sendEmail() {}
  async updateInventory() {}
  async generateInvoice() {}
  async notifyAdmin() {}
  // ... 20 more methods
}
```

✅ **Single Responsibility Principle**
```typescript
// Good: Separate concerns
class OrderService {
  async create(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.save(dto);
    await this.orderProcessingService.process(order);
    return order;
  }
}

class OrderProcessingService {
  async process(order: Order): Promise<void> {
    await this.paymentService.processPayment(order);
    await this.notificationService.notifyCreation(order);
  }
}
```

---

❌ **Magic Numbers**
```typescript
// Bad
if (user.age > 18 && order.total < 100) {
  discount = order.total * 0.05;
}
```

✅ **Named Constants**
```typescript
// Good
const MINIMUM_AGE = 18;
const DISCOUNT_THRESHOLD = 100;
const DISCOUNT_RATE = 0.05;

if (user.age > MINIMUM_AGE && order.total < DISCOUNT_THRESHOLD) {
  discount = order.total * DISCOUNT_RATE;
}
```

---

❌ **Raw SQL Queries**
```typescript
// Bad
const products = await this.connection.query(
  'SELECT * FROM products WHERE category_id = $1',
  [categoryId],
);
```

✅ **TypeORM QueryBuilder**
```typescript
// Good
const products = await this.productRepository
  .createQueryBuilder('product')
  .where('product.categoryId = :categoryId', { categoryId })
  .getMany();
```

---

❌ **Callback Hell**
```typescript
// Bad
getData((error, data) => {
  if (error) {
    handleError(error);
  } else {
    processData(data, (error, result) => {
      if (error) {
        handleError(error);
      } else {
        saveResult(result, (error) => {
          if (error) {
            handleError(error);
          }
        });
      }
    });
  }
});
```

✅ **Async/Await**
```typescript
// Good
try {
  const data = await getData();
  const result = await processData(data);
  await saveResult(result);
} catch (error) {
  handleError(error);
}
```

---

## Automated Quality Scripts

### package.json

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "type-check:strict": "tsc --noEmit --strict",
    "circular-check": "madge --circular --extensions ts src/",
    "audit": "npm audit",
    "quality:check": "npm run lint && npm run format:check && npm run type-check && npm run circular-check",
    "quality:fix": "npm run lint:fix && npm run format"
  }
}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "check code quality"
- "run lint on project"
- "format code"
- "find circular dependencies"
- "check for code smells"
- "audit security vulnerabilities"

### Automated Checks

Claude will:
1. Run ESLint and report issues
2. Check Prettier formatting
3. Run TypeScript strict checks
4. Detect circular dependencies
5. Identify common anti-patterns
6. Suggest fixes for issues

---

## Checklist

For comprehensive code quality, ensure:

- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent formatting
- [ ] TypeScript strict mode enabled
- [ ] No circular dependencies detected
- [ ] No security vulnerabilities (npm audit clean)
- [ ] No use of `any` type
- [ ] All functions have return types
- [ ] No unused variables or imports
- [ ] Consistent naming conventions
- [ ] No raw SQL queries (use TypeORM)
- [ ] No magic numbers (use constants)
- [ ] No callback hell (use async/await)
- [ ] Single Responsibility Principle followed

---

## Pre-commit Hooks (Husky)

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run quality:check"
```

### .lintstagedrc.json

```json
{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

---

## Related Skills

- [crud-module-generator](../crud-module-generator/SKILL.md) - Generate quality code from the start
- [e2e-test-generator](../e2e-test-generator/SKILL.md) - Ensure quality through testing

---

**Skill Status**: READY
**Automation Level**: 95%
**Complexity**: Low
