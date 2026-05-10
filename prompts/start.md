---
description: Start development by pulling latest changes and launching dev servers
argument-hint: (no arguments)
---

# Development Startup

You are starting a development session. This command ensures you have the latest code before starting servers.

## Step 1: Pull Latest Changes

**IMPORTANT:** First, run the `/git:pull` command to get the latest changes from dev branch.

Use the Skill tool to invoke the git:pull command:
```
skill: "git:pull"
```

Wait for the pull to complete before proceeding.

## Step 2: Check for Issues

After pulling, check if there were any issues:
- If there are merge conflicts, STOP and inform the user to resolve them first
- If pull was successful, proceed to Step 3

## Step 3: Start Development Servers

Check if PM2 is set up by looking for ecosystem.config.js:

```bash
ls ecosystem.config.js 2>/dev/null
```

**If ecosystem.config.js exists:**
```bash
npm run dev
```

**If no PM2 setup:**
Ask the user how they want to start development:
1. Run `/dev:pm2-init` to set up PM2 first
2. Start manually (user will handle it)

## Step 4: Report Status

```
Development Session Started

Git Status:
  - Pulled latest from: dev
  - Current branch: <branch-name>

Servers:
  - <list of started services or "Manual start required">

Ready to code!
```

## Error Handling

| Issue | Action |
|-------|--------|
| Merge conflicts from pull | STOP, tell user to resolve conflicts first |
| PM2 not set up | Offer to run /dev:pm2-init |
| Server start fails | Show error, suggest checking logs with `pm2 logs` |
