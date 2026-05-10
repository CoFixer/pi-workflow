# {PROJECT_NAME}

> [Project description extracted from PROJECT_KNOWLEDGE.md]

## Features

- Feature 1 (from PROJECT_KNOWLEDGE.md Goals)
- Feature 2
- Feature 3

## Tech Stack

- **Backend**: {BACKEND}
- **Frontend**: {FRONTENDS}
- **Database**: PostgreSQL
- **Deployment**: Docker

## Architecture

```
{PROJECT_NAME}/
├── backend/              # {BACKEND} API server
[if react]
├── frontend/             # React web application
[endif]
[if dashboard]
├── dashboard/                  # Admin dashboard
[endif]
[if dashboard-admin]
├── dashboard-admin/            # Admin Dashboard
[endif]
[if dashboard-ops]
├── dashboard-ops/              # Ops Dashboard
[endif]
[if dashboard-organizer]
├── dashboard-organizer/        # Organizer Dashboard
[endif]
[if react-native]
├── mobile/               # React Native mobile app
[endif]
├── .pi/              # Claude configuration & skills
├── .pi-project/      # Project documentation
└── docker-compose.yml    # Service orchestration
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Installation

```bash
# Clone repository with submodules
git clone --recurse-submodules <repo-url>
cd {PROJECT_NAME}

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### Service URLs

- **Backend API**: http://localhost:3000
[if react]
- **Frontend**: http://localhost:5173
[endif]
[if dashboard]
- **Dashboard**: http://localhost:5174
[endif]
[if dashboard-admin]
- **Admin Dashboard**: http://localhost:5174
[endif]
[if dashboard-ops]
- **Ops Dashboard**: http://localhost:5175
[endif]
[if dashboard-organizer]
- **Organizer Dashboard**: http://localhost:5176
[endif]

## Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

[if react]
```bash
cd frontend
npm install
npm run dev
```
[endif]

### Database Migrations

```bash
cd backend
npm run migration:generate -- MigrationName
npm run migration:run
```

## Documentation

- **Quick Reference**: See [CLAUDE.md](CLAUDE.md) for Claude context
- **Full Documentation**: See `.pi-project/docs/`
  - [PROJECT_KNOWLEDGE.md](.pi-project/docs/PROJECT_KNOWLEDGE.md) - Architecture
  - [PROJECT_API.md](.pi-project/docs/PROJECT_API.md) - API specs
  - [PROJECT_DATABASE.md](.pi-project/docs/PROJECT_DATABASE.md) - Database schema

## Project Structure

```
backend/
├── src/
│   ├── modules/         # Feature modules
│   ├── entities/        # TypeORM entities
│   ├── dto/             # Data transfer objects
│   └── guards/          # Auth guards
└── test/                # E2E tests
```

[if react]
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── types/           # TypeScript types
└── public/              # Static assets
```
[endif]

## Testing

```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

[if react]
```bash
cd frontend
npm run test             # Vitest tests
```
[endif]

## Deployment

### Production Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Create feature branch from `dev`
2. Make changes and commit
3. Push and create PR to `dev`
4. After review, merge to `dev`
5. `dev` → `main` for production releases

## Claude Code Configuration

This project uses [Claude Code](https://claude.ai) for AI-assisted development with a structured configuration system.

### Configuration Structure

```
.pi/                    # How Claude works (shared via submodules)
├── agents/                 # Agent definitions (specialized AI roles)
├── commands/               # Slash commands (/commit, /fullstack, etc.)
├── hooks/                  # Automation hooks (pre/post execution)
├── memory/                 # Team-wide memory (corrections, learnings)
├── skills/                 # Domain-specific skill definitions
├── templates/              # Project templates
└── settings.json           # Configuration

.pi-project/            # What Claude knows (project-specific)
├── docs/                   # Technical documentation
├── memory/                 # Project memory (decisions, learnings, preferences)
├── prd/                    # Product requirements
└── secrets/                # Credentials (gitignored)
```

### Memory System

Claude maintains persistent context across sessions at three levels:

| Level | Location | Purpose |
|-------|----------|---------|
| Team | `.pi/memory/` | Shared patterns and corrections across all projects |
| Project | `.pi-project/memory/` | Project-specific decisions, learnings, preferences |
| Agent | `.pi/agent-memory/` | Per-agent state and knowledge |

For full documentation, see [.pi/README.md](.pi/README.md).

## License

[Specify license]

---

**Generated:** {DATE}
