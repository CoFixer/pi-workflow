---
name: deployment
phase: 9
prerequisites: [qa]
description: Deploy to dev/staging/production environments
---

# Deployment Skill

Phase 9 (final) of the fullstack pipeline. Deploys the application.

## Context

- **Project**: Read from PIPELINE_STATUS.md
- **Previous phase**: qa (must be complete with 95%+ pass rate)
- **Expected output**: Live deployment

## Deployment Strategy

### Environment Progression

```
1. Development  → Dokploy (auto-deploy on push)
2. Staging      → Dokploy (manual trigger)
3. Production   → AWS ECS (manual trigger with approval)
```

## Step 1: Deploy to Development (Dokploy)

```bash
# Ensure Dokploy is configured
dokploy status

# Deploy backend
dokploy deploy backend --env dev

# Deploy frontend
dokploy deploy frontend --env dev

# Verify health
curl https://dev-api.{project}.com/health
curl https://dev.{project}.com
```

## Step 2: Deploy to Staging (Dokploy)

```bash
# Deploy to staging after dev verification
dokploy deploy backend --env staging
dokploy deploy frontend --env staging

# Run smoke tests
npm run test:smoke -- --env staging
```

## Step 3: Deploy to Production (AWS)

### AWS ECS Deployment

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account}.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t {project}-backend .
docker tag {project}-backend:latest {account}.dkr.ecr.us-east-1.amazonaws.com/{project}-backend:latest
docker push {account}.dkr.ecr.us-east-1.amazonaws.com/{project}-backend:latest

# Build and push frontend
cd ../frontend
docker build -t {project}-frontend .
docker tag {project}-frontend:latest {account}.dkr.ecr.us-east-1.amazonaws.com/{project}-frontend:latest
docker push {account}.dkr.ecr.us-east-1.amazonaws.com/{project}-frontend:latest

# Update ECS services
aws ecs update-service --cluster {project}-cluster --service {project}-backend --force-new-deployment
aws ecs update-service --cluster {project}-cluster --service {project}-frontend --force-new-deployment
```

### Verify Production

```bash
# Health checks
curl https://api.{project}.com/health
curl https://{project}.com

# Run production smoke tests
npm run test:smoke -- --env production
```

## Step 4: Generate Handover Documentation

Create deployment documentation:

```markdown
# Deployment Guide - {project}

## Environments

| Environment | URL | Platform |
|-------------|-----|----------|
| Development | dev.{project}.com | Dokploy |
| Staging | staging.{project}.com | Dokploy |
| Production | {project}.com | AWS ECS |

## Deployment Commands

### Dokploy (Dev/Staging)
```bash
dokploy deploy <service> --env <dev|staging>
```

### AWS (Production)
```bash
./scripts/deploy-production.sh
```

## Rollback Procedure

### Dokploy
```bash
dokploy rollback <service> --env <env>
```

### AWS
```bash
aws ecs update-service --cluster {project}-cluster --service <service> --task-definition <previous-task-def>
```

## Environment Variables

See `.env.example` for required variables.

## Monitoring

- **Logs**: CloudWatch / Dokploy logs
- **Metrics**: CloudWatch / Dokploy metrics
- **Alerts**: Configured in AWS SNS / Dokploy
```

## Completion Criteria

- [ ] Development environment deployed and healthy
- [ ] Staging environment deployed and healthy
- [ ] Production environment deployed and healthy
- [ ] Smoke tests passing on all environments
- [ ] Deployment documentation created

## On Success

Update PIPELINE_STATUS.md: `ship = :white_check_mark:`

**Pipeline Complete!**

```
Fullstack Pipeline - COMPLETE

All phases completed successfully.
Production URL: https://{project}.com
API URL: https://api.{project}.com
```

## On Failure

Update PIPELINE_STATUS.md: `ship = :x:` with error in Notes column

Common failures:
- Docker build fails → Check Dockerfile
- AWS credentials invalid → Refresh credentials
- Health check fails → Check logs
- ECS service unstable → Check task definition
