# API Integration Status: {PROJECT_NAME}

## Overview

This document tracks which frontend pages use which API endpoints, organized by frontend project and role access.

**Frontend Projects:**
- `frontend` - Main web application (public, business users, analysts)
- `dashboard` - Consolidated admin dashboard (admin, organizer, ops-manager roles)
- `mobile` - Mobile application

## Frontend Pages → API Mapping

### Public/Guest Pages (frontend)

| Route | Frontend | APIs Used | Status |
|-------|----------|-----------|--------|
| `/` | frontend | - | Pending |
| `/login` | frontend | `POST /auth/login` | Pending |
| `/register` | frontend | `POST /auth/register` | Pending |
| `/forgot-password` | frontend | `POST /auth/forgot-password` | Pending |
| `/reset-password` | frontend | `POST /auth/reset-password` | Pending |
| `/verify-email` | frontend | `POST /auth/verify-email` | Pending |

### User Pages (frontend - Web Application)

| Route | Frontend | APIs Used | Status |
|-------|----------|-----------|--------|
| `/home` | frontend | `GET /dashboards/recent`, `GET /alerts/active` | Pending |
| `/dashboards` | frontend | `GET /dashboards` | Pending |
| `/dashboards/:id` | frontend | `GET /dashboards/:id`, `GET /widgets` | Pending |
| `/profile` | frontend | `GET /users/me`, `PATCH /users/me` | Pending |
| `/settings` | frontend | `GET /users/me/preferences`, `PATCH /users/me` | Pending |

### Admin Dashboard Pages (dashboard - Consolidated)

**Role Consolidation:** Single dashboard serves Admin, Organizer, and Operations Manager roles

| Route | Frontend | Role Access | APIs Used | Status |
|-------|----------|-------------|-----------|--------|
| **Operations Manager Routes** |
| `/ops/dashboard` | dashboard | Ops Manager | `GET /ops/dashboard` | Pending |
| `/ops/team` | dashboard | Ops Manager | `GET /ops/team` | Pending |
| `/ops/workflows` | dashboard | Ops Manager | `GET /ops/workflows` | Pending |
| **Organizer Routes** (if applicable) |
| `/organizer/dashboard` | dashboard | Organizer | `GET /organizer/stats` | Pending |
| `/organizer/events` | dashboard | Organizer | `GET /events/mine` | Pending |
| **Admin Routes** |
| `/admin/dashboard` | dashboard | Admin | `GET /admin/stats` | Pending |
| `/admin/users` | dashboard | Admin | `GET /admin/users` | Pending |
| `/admin/users/:id` | dashboard | Admin | `GET /admin/users/:id`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id` | Pending |
| `/admin/settings` | dashboard | Admin | `GET /settings`, `PATCH /settings` | Pending |

**Routing Strategy:**
- `/ops/*` routes → Operations Manager features (team & workflow management)
- `/organizer/*` routes → Organizer features (limited to own resources)
- `/admin/*` routes → Admin features (full system access)

**Access Control:**
- Implemented via auth context and route guards
- Role-based menu filtering
- API-level permission checks

## API Service Files

| Service | Location | Endpoints |
|---------|----------|-----------|
| AuthService | `src/services/auth.ts` | login, register, logout |
| UserService | `src/services/user.ts` | getUsers, getUser, updateUser |

## Integration Checklist

- [ ] Set up Axios instance with base URL
- [ ] Configure auth interceptors
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Add error states
- [ ] Test all endpoints
