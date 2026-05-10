# NestJS Commands

Quick commands for common NestJS development tasks.

## Available Commands

### /generate-crud

**Description**: Generate a complete CRUD module interactively.

**Usage**:
```bash
/generate-crud
```

**Interactive Prompts**:
1. Entity name (e.g., "Product")
2. Fields (name, type, validation)
3. Relationships (optional)
4. Custom methods (optional)

**Output**:
- Entity file
- Repository file
- Service file
- Controller file
- DTOs (Create, Update, Response)
- Module file

---

### /add-swagger

**Description**: Add Swagger documentation to existing controller.

**Usage**:
```bash
/add-swagger <controller-path>
```

**Example**:
```bash
/add-swagger src/modules/products/product.controller.ts
```

**Output**: Updated controller with @ApiTags, @ApiOperation, @ApiResponse decorators.

---

### /generate-dto

**Description**: Generate DTOs for an entity.

**Usage**:
```bash
/generate-dto <entity-name>
```

**Example**:
```bash
/generate-dto Product
```

**Output**:
- create-product.dto.ts
- update-product.dto.ts
- product-response.dto.ts

---

### /add-auth

**Description**: Add JWT authentication and authorization to module.

**Usage**:
```bash
/add-auth
```

**Interactive Prompts**:
1. Roles to create (e.g., "admin, manager, staff")
2. Which endpoints should be public?
3. Role requirements per endpoint

**Output**:
- @Public() decorator
- @Roles() decorator
- @CurrentUser() decorator
- JwtAuthGuard
- RolesGuard
- Updated controller with decorators

---

## Command Guidelines

NestJS commands should:
- Be interactive when configuration is needed
- Provide clear feedback on what was generated
- Follow project conventions
- Update existing files non-destructively
- Create new files in appropriate directories
- Add imports automatically
- Format code correctly

---

## See Also

- [Skills](../skills/README.md) - NestJS skills (more detailed than commands)
- [Agents](../agents/README.md) - NestJS agents (fully automated)
- [Guides](../guides/README.md) - NestJS development guides
