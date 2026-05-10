# PM2 Development Server Management

PM2 is a process manager for Node.js that enables managing multiple development servers from a single terminal.

## Why PM2?

| Problem | PM2 Solution |
|---------|--------------|
| Multiple terminal windows | Single `npm run dev` starts all servers |
| Can't see all logs | `npm run dev:logs` streams all logs together |
| Manual restart each server | `npm run dev:restart` or `pm2 restart <name>` |
| No visibility into status | `pm2 status` or `pm2 monit` |

## Port Conventions

| Service | Port | Notes |
|---------|------|-------|
| Backend (NestJS) | 3000 | Fixed |
| Frontend (React Router) | 5173 | Fixed |
| admin-dashboard | 5174 | First dashboard alphabetically |
| coach-dashboard | 5175 | Second dashboard |
| owner-dashboard | 5176 | Third dashboard |
| ... | 5177+ | Additional dashboards auto-increment |

Dashboards are assigned ports **alphabetically** starting from 5174.

## Quick Start

```bash
# One-time setup (or use /pm2-init command)
npm install -g pm2

# Daily usage
npm run dev          # Start all servers
npm run dev:logs     # View all logs in real-time
npm run dev:restart  # Restart all servers
npm run dev:stop     # Stop all servers
```

## All Commands

### NPM Scripts (from project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all detected servers |
| `npm run dev:logs` | View real-time logs from ALL servers |
| `npm run dev:stop` | Stop all servers (keeps PM2 daemon) |
| `npm run dev:restart` | Restart all servers |
| `npm run dev:status` | Show status table |
| `npm run dev:monit` | Interactive dashboard with CPU/memory |
| `npm run dev:kill` | Stop PM2 daemon completely |

### Direct PM2 Commands

```bash
# Individual server control
pm2 restart backend     # Restart only backend
pm2 logs frontend       # View only frontend logs
pm2 stop admin          # Stop only admin dashboard
pm2 restart coach       # Restart coach dashboard

# Log management
pm2 logs                # All logs, real-time
pm2 logs --lines 100    # Show last 100 lines then stream
pm2 logs backend        # Only backend logs
pm2 flush               # Clear all log files

# Monitoring
pm2 status              # Status table
pm2 monit               # Interactive TUI dashboard
```

## Dynamic Service Discovery

The `ecosystem.config.js` automatically detects services based on folder structure:

```
your-project/
├── backend/                      → port 3000
├── frontend/                     → port 5173
├── frontend-admin-dashboard/     → port 5174
├── frontend-coach-dashboard/     → port 5175
├── frontend-owner-dashboard/     → port 5176
```

**No config changes needed** when adding/removing dashboards.

### How It Works

1. Checks if `backend/package.json` exists → adds backend on port 3000
2. Checks if `frontend/package.json` exists → adds frontend on port 5173
3. Scans for `frontend-*-dashboard/` folders → adds each on 5174+

## Configuration Files

### ecosystem.config.js

```javascript
const fs = require('fs');
const path = require('path');

const PORTS = {
  backend: 3000,
  frontend: 5173,
  dashboardBasePort: 5174,
};

function discoverServices() {
  const apps = [];
  const rootDir = __dirname;

  // Backend
  if (fs.existsSync(path.join(rootDir, 'backend', 'package.json'))) {
    apps.push({
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:dev',
      watch: false,
      env: { NODE_ENV: 'development', PORT: PORTS.backend },
    });
  }

  // Frontend (with explicit --port for Vite)
  if (fs.existsSync(path.join(rootDir, 'frontend', 'package.json'))) {
    apps.push({
      name: 'frontend',
      cwd: './frontend',
      script: 'npm',
      args: `run dev -- --port ${PORTS.frontend}`,
      watch: false,
      env: { NODE_ENV: 'development' },
    });
  }

  // Auto-discover dashboards
  let dashboardPort = PORTS.dashboardBasePort;
  fs.readdirSync(rootDir)
    .filter(f => f.startsWith('frontend-') && f.endsWith('-dashboard'))
    .sort()
    .forEach(folder => {
      if (fs.existsSync(path.join(rootDir, folder, 'package.json'))) {
        const name = folder.replace('frontend-', '').replace('-dashboard', '');
        apps.push({
          name,
          cwd: `./${folder}`,
          script: 'npm',
          args: `run dev -- --port ${dashboardPort}`,
          watch: false,
          env: { NODE_ENV: 'development' },
        });
        dashboardPort++;
      }
    });

  return apps;
}

module.exports = { apps: discoverServices() };
```

### package.json (root)

```json
{
  "name": "project-name",
  "private": true,
  "scripts": {
    "dev": "pm2 start ecosystem.config.js",
    "dev:logs": "pm2 logs",
    "dev:stop": "pm2 stop all",
    "dev:restart": "pm2 restart all",
    "dev:status": "pm2 status",
    "dev:monit": "pm2 monit",
    "dev:kill": "pm2 kill"
  },
  "devDependencies": {
    "pm2": "^5.3.0"
  }
}
```

## Troubleshooting

### Port already in use

```bash
# Find and kill processes on specific ports
lsof -ti:3000,5173,5174 | xargs kill -9

# Then restart PM2
npm run dev:kill
npm run dev
```

### Vite not using correct port

Vite ignores the `PORT` environment variable. Must use `--port` flag:

```javascript
// Correct
args: `run dev -- --port ${port}`,

// Incorrect (ignored by Vite)
env: { PORT: 5173 }
```

### Services not detected

Check that each service has a `package.json` in its root:
- `backend/package.json`
- `frontend/package.json`
- `frontend-*-dashboard/package.json`

### View specific service errors

```bash
pm2 logs backend --err    # Only error logs
pm2 logs frontend --out   # Only stdout logs
```

## Related

- `/pm2-init` - Automatically set up PM2 for a project
- [LEARNINGS.md](../memory/LEARNINGS.md) - PM2 learnings captured from sessions
