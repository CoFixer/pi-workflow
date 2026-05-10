---
description: Initialize PM2 development server management for a fullstack project
argument-hint: (no arguments)
---

# PM2 Development Server Setup

You are initializing PM2 for managing multiple development servers in a fullstack project.

## Step 0: Check Project Structure

First, verify this is a fullstack project by checking for expected directories:

```bash
ls -d backend frontend frontend-*-dashboard 2>/dev/null || echo "Checking structure..."
```

Look for:
- `backend/` directory with `package.json`
- `frontend/` directory with `package.json`
- Any `frontend-*-dashboard/` directories

If no backend or frontend exists, ask the user if they want to proceed anyway.

## Step 1: Check Existing PM2 Setup

Check if PM2 files already exist:

```bash
ls -la ecosystem.config.js package.json 2>/dev/null || echo "No existing PM2 config found"
```

**If ecosystem.config.js exists:**
Ask the user using **AskUserQuestion**:
1. **Overwrite** - Replace existing config with new dynamic version
2. **Skip** - Keep existing config, only update package.json scripts
3. **Cancel** - Exit without changes

## Step 2: Check PM2 Installation

```bash
which pm2 && pm2 --version || echo "PM2 not installed"
```

**If PM2 is not installed globally:**
Inform the user and run:
```bash
npm install -g pm2
```

## Step 3: Create ecosystem.config.js

Create the dynamic service discovery config at project root:

```javascript
const fs = require('fs');
const path = require('path');

// Port configuration — resolved from .pi/base/port-map.json
// Fallback: PORT_BASE env var, then deterministic hash for unregistered projects
const { resolvePorts } = require('./.pi/base/scripts/resolve-ports');
const PORTS = resolvePorts(__dirname);

// Auto-detect services from folder structure
function discoverServices() {
  const apps = [];
  const rootDir = __dirname;

  // Check for backend
  if (fs.existsSync(path.join(rootDir, 'backend', 'package.json'))) {
    apps.push({
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:dev',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: PORTS.backend,
      },
    });
  }

  // Check for main frontend (with explicit --port for Vite)
  if (fs.existsSync(path.join(rootDir, 'frontend', 'package.json'))) {
    apps.push({
      name: 'frontend',
      cwd: './frontend',
      script: 'npm',
      args: `run dev -- --port ${PORTS.frontend}`,
      watch: false,
      env: {
        NODE_ENV: 'development',
        VITE_API_URL: `http://localhost:${PORTS.backend}/api`,
        VITE_API_BASE_URL: `http://localhost:${PORTS.backend}/api`,
      },
    });
  }

  // Check for single consolidated dashboard
  if (fs.existsSync(path.join(rootDir, 'dashboard', 'package.json'))) {
    apps.push({
      name: 'dashboard',
      cwd: './dashboard',
      script: 'npm',
      args: `run dev -- --port ${PORTS.dashboardBasePort}`,
      watch: false,
      env: {
        NODE_ENV: 'development',
        VITE_API_URL: `http://localhost:${PORTS.backend}/api`,
        VITE_API_BASE_URL: `http://localhost:${PORTS.backend}/api`,
      },
    });
  }

  // Auto-discover all dashboard-* folders (separate dashboards)
  const folders = fs.readdirSync(rootDir);
  let dashboardPort = PORTS.dashboardBasePort;

  folders
    .filter(folder => folder.startsWith('dashboard-'))
    .sort() // Alphabetical order for consistent port assignment
    .forEach(folder => {
      const packagePath = path.join(rootDir, folder, 'package.json');
      if (fs.existsSync(packagePath)) {
        // Use folder name as service name (e.g., 'dashboard-admin')
        apps.push({
          name: folder,
          cwd: `./${folder}`,
          script: 'npm',
          args: `run dev -- --port ${dashboardPort}`,
          watch: false,
          env: {
            NODE_ENV: 'development',
          },
        });
        dashboardPort++;
      }
    });

  // Legacy: Auto-discover frontend-*-dashboard folders (for backward compatibility)
  folders
    .filter(folder => folder.startsWith('frontend-') && folder.endsWith('-dashboard'))
    .sort() // Alphabetical order for consistent port assignment
    .forEach(folder => {
      const packagePath = path.join(rootDir, folder, 'package.json');
      if (fs.existsSync(packagePath)) {
        // Extract dashboard name (e.g., 'coach' from 'frontend-coach-dashboard')
        const dashboardName = folder.replace('frontend-', '').replace('-dashboard', '');
        apps.push({
          name: dashboardName,
          cwd: `./${folder}`,
          script: 'npm',
          args: `run dev -- --port ${dashboardPort}`,
          watch: false,
          env: {
            NODE_ENV: 'development',
          },
        });
        dashboardPort++;
      }
    });

  return apps;
}

module.exports = {
  apps: discoverServices(),
};
```

## Step 4: Create/Update Root package.json

Check if root package.json exists:

**If it exists:** Read it and merge the PM2 scripts into the existing scripts.

**If it doesn't exist:** Create a new one with project name derived from directory name.

Add these scripts:
```json
{
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

## Step 4.5: Sync Backend CORS Origins

After creating ecosystem.config.js, synchronize the backend's `.env` files so CORS origins match the assigned ports. Without this step, the backend will reject requests from frontends on the new ports.

```bash
node .pi/base/scripts/sync-env-ports.js
```

This updates `PORT`, `FRONTEND_URL`, `ALLOW_ORIGINS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` in all backend env files (`.env`, `.env.example`, `.env.dummy`).

**Important:** If the developer has a custom `.env` file, they should re-run this script or manually update the CORS origins to include `http://localhost:{frontend_port}`.

## Step 5: Verify Setup

Run the discovery to show what services were detected:

```bash
node -e "const config = require('./ecosystem.config.js'); console.log('Detected services:'); config.apps.forEach(app => console.log('  -', app.name, 'on port', app.env?.PORT || app.args.match(/--port (\d+)/)?.[1]))"
```

## Step 6: Report Results

Output a summary:

```
PM2 Setup Complete

Files created/updated:
- ecosystem.config.js (dynamic service discovery)
- package.json (PM2 scripts added)

Detected services:
- backend → port [base+0]
- frontend → port [base+1]
- [dashboard names] → port [base+2]+

Port source: .pi/base/port-map.json
Override: PORT_BASE=XXXX pm2 start ecosystem.config.js

Quick Start:
  npm run dev          # Start all servers
  npm run dev:logs     # View all logs
  npm run dev:restart  # Restart all

Individual control:
  pm2 restart backend  # Restart one server
  pm2 logs frontend    # View one server's logs

Documentation: See .pi/base/docs/pm2-setup.md
```

## Error Handling

- **No backend/frontend found**: Warn user but allow them to proceed
- **PM2 install fails**: Check node/npm installation, suggest manual install
- **Port conflicts**: Run `.pi/base/hooks/check-ports.sh --kill` or set `PORT_BASE=XXXX` env var to override
- **Existing config**: Always ask before overwriting

## Port Reference

Ports are assigned per-project via `.pi/base/port-map.json`. Each project gets a block of 10 ports:

| Offset | Service |
|--------|---------|
| +0 | Backend |
| +1 | Frontend |
| +2+ | Dashboards / auxiliary services |

See `.pi/base/port-map.json` for the full project-to-port mapping.
To add a new project, append an entry with the next available base port (increments of 10).

## Related

- [PM2 Setup Guide](../../guides/pm2-setup.md) - Full documentation
- [LEARNINGS.md](../../docs/LEARNINGS.md) - PM2 learnings from team sessions
