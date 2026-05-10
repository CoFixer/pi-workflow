# Claude React

Claude Code configuration for React frontend development. This is a framework-specific submodule designed to be used alongside `claude-base` (shared/generic config).

## Contents

### Agents
- **[frontend-developer.md](agents/frontend-developer.md)** - Frontend development, API integration, and E2E test creation
- **[frontend-error-fixer.md](agents/frontend-error-fixer.md)** - Diagnose and fix frontend errors (build and runtime)
- **[design-qa-agent.md](agents/design-qa-agent.md)** - Design QA using Figma MCP tools for pixel-perfect verification

### Skills
Organized by domain in `skills/` directory. See [skills/README.md](skills/README.md) for the complete index.

- **qa/** - Design QA workflows (Figma, HTML prototypes)
- **e2e-testing/** - Playwright E2E testing, fixtures, page objects
- **converters/** - Figma-to-React, HTML-to-React conversion
- **builders/** - Dashboard and CRUD interface builders
- **code-quality/** - TypeScript type organization
- **debugging/** - Bug diagnosis and fixing

### Guides
Best practices and reference documentation in `guides/` directory.

Key guides:
- [component-patterns.md](guides/component-patterns.md) - React component best practices
- [data-fetching.md](guides/data-fetching.md) - TanStack Query and API integration
- [common-patterns.md](guides/common-patterns.md) - Redux and form patterns
- [typescript-standards.md](guides/typescript-standards.md) - Type safety guidelines
- [authentication.md](guides/authentication.md) - Auth patterns and guards

### Examples
Working code examples in `examples/` directory.
- [complete-examples.md](examples/complete-examples.md) - Full page implementations

## Usage

Add as a git submodule to your project:

```bash
git submodule add https://github.com/CoFixer/claude-react.git .pi/react
```

### Project Structure

```
.pi/
├── base/      # Generic/shared config (git submodule)
├── nestjs/    # NestJS-specific config (git submodule) - optional
├── react/     # This repo (git submodule)
└── settings.json
```

## Related Repos

- [claude-base](https://github.com/CoFixer/claude-base) - Shared/generic Claude Code config
- [claude-nestjs](https://github.com/CoFixer/claude-nestjs) - NestJS-specific Claude Code config
