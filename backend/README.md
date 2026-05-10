# claude-nestjs

NestJS-specific configuration for Claude Code.

## Contents

- **guides/**: Comprehensive NestJS development guides (11 guides)
  - Authentication, Controllers, Error Handling, DTOs, Decorators, etc.

## Usage

This submodule is designed to be used with [claude-base](https://github.com/CoFixer/claude-base) for shared commands, hooks, and skills.

### Project Structure
```
.pi/
├── base/          # Shared commands, hooks, skills (claude-base)
├── nestjs/        # NestJS-specific guides (this repo)
├── react/         # React-specific guides (claude-react)
└── react-native/  # React Native-specific guides (claude-react-native)
```

## Guide Catalog

See [guides/README.md](guides/README.md) for the complete guide catalog.

## Skills

NestJS-specific skills for automated code generation:

1. **[crud-module-generator](skills/crud-module-generator/SKILL.md)** - Generate complete CRUD modules
   - Entity, Repository, Service, Controller, DTOs, Module
   - Three-layer architecture enforcement
   - TypeORM + validation + Swagger
   - **Automation**: 80%

2. **[response-dto-factory](skills/response-dto-factory/SKILL.md)** - Generate standardized response wrappers
   - CreatedResponseDto, SuccessResponseDto, PaginatedResponseDto
   - Consistent API responses
   - **Automation**: 90%

3. **[swagger-doc-generator](skills/swagger-doc-generator/SKILL.md)** - Auto-generate Swagger documentation
   - @ApiOperation, @ApiResponse, @ApiProperty decorators
   - Complete OpenAPI documentation
   - **Automation**: 85%

4. **[guard-decorator-builder](skills/guard-decorator-builder/SKILL.md)** - Generate authorization patterns
   - @Public(), @Roles(), @CurrentUser() decorators
   - JWT guards and RBAC
   - **Automation**: 75%

5. **[e2e-test-generator](skills/e2e-test-generator/SKILL.md)** - Generate E2E tests for controllers
   - Supertest + Jest test suites
   - Authentication + validation tests
   - **Automation**: 85%

6. **[code-quality-checker](skills/code-quality-checker/SKILL.md)** - Analyze and improve code quality
   - ESLint + Prettier + TypeScript checks
   - Anti-pattern detection
   - **Automation**: 95%

### Using Skills

Skills are automatically suggested when you use trigger keywords:
- "generate crud module for Product"
- "create response DTO"
- "add swagger documentation"
- "generate roles guard"

Or explicitly invoke with:
```
/skill crud-module-generator
```

## Agents

NestJS-specific agents for development automation:

- **[module-scaffolder](agents/development/module-scaffolder.md)** - Automatically scaffold complete modules with three-layer architecture
  - Generates entity, repository, service, controller, DTOs, and module
  - Follows Coffee Club patterns (UUID keys, soft delete, validation)
  - **Automation**: 80%

See [agents/README.md](agents/README.md) for details.

## Commands

Quick commands for common NestJS tasks:

- **[/generate-crud](commands/dev/generate-crud.md)** - Generate complete CRUD module interactively
- **[/add-swagger](commands/dev/add-swagger.md)** - Add Swagger documentation to existing controller
- **[/generate-dto](commands/dev/generate-dto.md)** - Generate DTOs (Create, Update, Response) for an entity
- **[/add-auth](commands/dev/add-auth.md)** - Add JWT authentication and role-based authorization

See [commands/README.md](commands/README.md) for usage.

## Examples

Complete, working examples of NestJS patterns:
- **[crud-module](examples/crud-module/)** - Product CRUD module with all layers

## NestJS Development Patterns

This submodule provides guides for:
- Three-layer architecture (Controller → Service → Repository)
- TypeORM patterns (no raw SQL)
- DTO and validation patterns
- Error handling and exceptions
- Authentication and authorization
- API documentation with Swagger
- Testing strategies
- Production deployment

---

**Part of the Claude Code ecosystem**
- [claude-base](https://github.com/CoFixer/claude-base) - Shared configuration
- [claude-react](https://github.com/CoFixer/claude-react) - React guides
- [claude-react-native](https://github.com/CoFixer/claude-react-native) - React Native guides
