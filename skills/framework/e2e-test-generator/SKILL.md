---
name: e2e-test-generator
description: Generate end-to-end (E2E) tests for NestJS controllers and APIs.
---

# E2E Test Generator

Generate end-to-end (E2E) tests for NestJS controllers and APIs.

---

## Overview

This skill generates comprehensive E2E tests:
1. **Controller E2E Tests** - Test HTTP endpoints
2. **API Integration Tests** - Test complete workflows
3. **Database Integration** - Test with real database
4. **Authentication Tests** - Test protected endpoints
5. **Validation Tests** - Test input validation

---

## Quick Start

### Generate E2E Tests for Controller

User prompt:
```
Generate E2E tests for ProductController
```

Claude generates:
```typescript
// test/product.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProductController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should return an array of products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      const createProductDto = {
        name: 'Test Product',
        price: 99.99,
        description: 'Test description',
        categoryId: 'test-uuid',
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(createProductDto.name);
          expect(res.body.price).toBe(createProductDto.price);
        });
    });

    it('should fail validation with invalid data', () => {
      const invalidDto = {
        name: 'ab', // Too short
        price: -10, // Negative
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a product by id', async () => {
      // Create product first
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          categoryId: 'test-uuid',
        })
        .expect(201);

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update a product', async () => {
      // Create product first
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          categoryId: 'test-uuid',
        })
        .expect(201);

      const productId = createResponse.body.id;
      const updateDto = { name: 'Updated Product' };

      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateDto.name);
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should soft delete a product', async () => {
      // Create product first
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          categoryId: 'test-uuid',
        })
        .expect(201);

      const productId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);

      // Verify product is soft deleted
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });
});
```

---

## Patterns

### Test Setup Pattern

```typescript
describe('Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

### Authentication Test Pattern

```typescript
describe('Protected Endpoints', () => {
  it('should deny access without token', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(401);
  });

  it('should allow access with valid token', () => {
    return request(app.getHttpServer())
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should deny access with invalid role', () => {
    return request(app.getHttpServer())
      .delete('/products/test-id')
      .set('Authorization', `Bearer ${staffToken}`) // Staff can't delete
      .expect(403);
  });
});
```

---

### Database Integration Test Pattern

```typescript
describe('Database Integration', () => {
  let productId: string;

  beforeEach(async () => {
    // Clean database before each test
    await getRepository(Product).delete({});
  });

  it('should persist product to database', async () => {
    const createDto = {
      name: 'Test Product',
      price: 99.99,
      categoryId: 'test-uuid',
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201);

    productId = response.body.id;

    // Verify in database
    const product = await getRepository(Product).findOne({
      where: { id: productId },
    });

    expect(product).toBeDefined();
    expect(product.name).toBe(createDto.name);
  });
});
```

---

### Validation Test Pattern

```typescript
describe('Input Validation', () => {
  it('should reject missing required fields', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({}) // Empty body
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('name');
        expect(res.body.message).toContain('price');
      });
  });

  it('should reject invalid UUID', () => {
    return request(app.getHttpServer())
      .get('/products/invalid-uuid')
      .expect(400);
  });

  it('should enforce min/max constraints', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'ab', // Too short (min 3)
        price: -10, // Negative (min 0)
      })
      .expect(400);
  });
});
```

---

## Test Configuration

### jest-e2e.json

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1"
  }
}
```

### package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:e2e:watch": "jest --config ./test/jest-e2e.json --watch",
    "test:e2e:cov": "jest --config ./test/jest-e2e.json --coverage"
  }
}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "generate e2e tests for [Controller]"
- "create integration tests for [Module]"
- "add API tests for [Endpoint]"
- "generate end-to-end tests"

### Required Information

Claude should ask for:
1. **Controller Name** - Which controller to test
2. **Authentication** - Does it require auth?
3. **Database** - Should tests use real database or mocks?
4. **Workflows** - Any specific workflows to test?

---

## Checklist

When generating E2E tests, ensure:

- [ ] Test all HTTP methods (GET, POST, PATCH, DELETE)
- [ ] Test authentication (with/without token)
- [ ] Test authorization (role-based access)
- [ ] Test input validation (valid/invalid data)
- [ ] Test error cases (404, 400, 401, 403)
- [ ] Test database persistence (if applicable)
- [ ] Use proper setup/teardown (beforeEach, afterEach)
- [ ] Clean up test data after tests
- [ ] Use descriptive test names
- [ ] Group related tests with describe()

---

## Related Skills

- [crud-module-generator](../crud-module-generator/SKILL.md) - Generate CRUD modules

---

**Skill Status**: READY
**Automation Level**: 85%
**Complexity**: Medium
