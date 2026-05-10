#!/usr/bin/env node
/**
 * sync-env-ports.js
 *
 * Synchronizes backend .env / .env.example / .env.dummy files with
 * port assignments from port-map.json.
 *
 * Updates these variables to match the project's assigned ports:
 *   - PORT              → backend port
 *   - FRONTEND_URL      → http://localhost:{frontend port}
 *   - ALLOW_ORIGINS     → http://localhost:{frontend},http://localhost:{dashboard}  (NestJS)
 *   - CORS_ALLOWED_ORIGINS → same pattern (Django)
 *   - CSRF_TRUSTED_ORIGINS → same pattern (Django)
 *
 * Usage:
 *   node .pi/base/scripts/sync-env-ports.js           # from project root
 *   node .pi/base/scripts/sync-env-ports.js /path/to/project
 */

const fs = require('fs');
const path = require('path');
const { resolvePorts } = require('./resolve-ports');

const projectRoot = process.argv[2] || process.cwd();
const PORTS = resolvePorts(projectRoot);

// Build the list of allowed frontend origins
const origins = [];
for (let i = 0; i < 8; i++) {
  // frontend (offset 1) and dashboards (offset 2+), up to 8 services
  const port = PORTS.frontend + i;
  origins.push(`http://localhost:${port}`);
}
// Trim to just frontend + a few dashboards (avoid excessive entries)
const compactOrigins = origins.slice(0, 4).join(',');

// Also include localhost with backend port (some apps need it for Swagger/docs)
const allOrigins = `http://localhost:${PORTS.backend},${compactOrigins}`;

// Env files to check (in order of preference)
const envFiles = [
  '.env.example',
  '.env.dummy',
  '.env',
];

// Variable patterns to update
const replacements = [
  // NestJS patterns
  { pattern: /^PORT=.*/m, replacement: `PORT=${PORTS.backend}` },
  { pattern: /^FRONTEND_URL=.*/m, replacement: `FRONTEND_URL=http://localhost:${PORTS.frontend}` },
  { pattern: /^ALLOW_ORIGINS=.*/m, replacement: `ALLOW_ORIGINS=${allOrigins}` },
  // Django patterns
  { pattern: /^CORS_ALLOWED_ORIGINS=.*/m, replacement: `CORS_ALLOWED_ORIGINS=${allOrigins}` },
  { pattern: /^CSRF_TRUSTED_ORIGINS=.*/m, replacement: `CSRF_TRUSTED_ORIGINS=${allOrigins}` },
];

const backendDir = path.join(projectRoot, 'backend');
if (!fs.existsSync(backendDir)) {
  console.log('No backend/ directory found. Skipping env port sync.');
  process.exit(0);
}

let updatedCount = 0;

for (const envFile of envFiles) {
  const filePath = path.join(backendDir, envFile);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: backend/${envFile}`);
    updatedCount++;
  } else {
    console.log(`No changes: backend/${envFile}`);
  }
}

if (updatedCount === 0) {
  console.log('No env files needed updating.');
}

console.log(`\nPort assignments for ${path.basename(projectRoot)}:`);
console.log(`  Backend:   ${PORTS.backend}`);
console.log(`  Frontend:  ${PORTS.frontend}`);
console.log(`  Dashboard: ${PORTS.dashboardBasePort}+`);
console.log(`  Origins:   ${allOrigins}`);
