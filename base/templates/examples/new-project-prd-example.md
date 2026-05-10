# New Project PRD Extraction Examples

> This file is loaded by the `new-project` command during Steps 0.5.6.2, 0.5.6.4, and 0.5.6.5.
> Contains example API endpoints, cross-check tables, and HTML-to-API screen mappings
> showing the expected extraction format from a PRD document.
>
> **Source**: Extracted from `commands/dev/new-project.md` for context window optimization.

---

## Example API Endpoints

Extract API structure from PRD System Modules and Page Architecture. Generate endpoint tables following this format, organized by resource group:

```markdown
## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/refresh` | Refresh access token | Yes |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/google` | Google OAuth redirect | No |
| GET | `/auth/okta` | Okta SSO redirect | No |

### Dashboards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboards` | List user's dashboards | Yes |
| POST | `/dashboards` | Create new dashboard | Yes (Analyst) |
| GET | `/dashboards/:id` | Get dashboard by ID | Yes |
| PATCH | `/dashboards/:id` | Update dashboard | Yes (Owner) |
| DELETE | `/dashboards/:id` | Delete dashboard | Yes (Owner) |
| POST | `/dashboards/:id/duplicate` | Duplicate dashboard | Yes |
| POST | `/dashboards/:id/share` | Share dashboard with users | Yes (Owner) |
| GET | `/dashboards/:id/widgets` | Get dashboard widgets | Yes |
| POST | `/dashboards/:id/widgets` | Add widget to dashboard | Yes (Analyst) |
| PATCH | `/dashboards/:id/widgets/:widgetId` | Update widget | Yes (Analyst) |
| DELETE | `/dashboards/:id/widgets/:widgetId` | Remove widget | Yes (Analyst) |

### Alerts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/alerts` | List user's alerts | Yes |
| POST | `/alerts` | Create new alert | Yes |
| GET | `/alerts/:id` | Get alert details | Yes |
| PATCH | `/alerts/:id` | Update alert config | Yes |
| DELETE | `/alerts/:id` | Delete alert | Yes |
| POST | `/alerts/:id/acknowledge` | Acknowledge triggered alert | Yes |
| POST | `/alerts/:id/snooze` | Snooze alert | Yes |
| POST | `/alerts/:id/resolve` | Resolve alert | Yes |

### Data Sources

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/data-sources` | List connected data sources | Yes (Admin) |
| POST | `/data-sources` | Add new data source | Yes (Admin) |
| GET | `/data-sources/:id` | Get data source details | Yes (Admin) |
| PATCH | `/data-sources/:id` | Update data source | Yes (Admin) |
| DELETE | `/data-sources/:id` | Remove data source | Yes (Admin) |
| POST | `/data-sources/:id/test` | Test connection | Yes (Admin) |
| POST | `/data-sources/:id/sync` | Sync metadata | Yes (Admin) |
| GET | `/data-sources/:id/tables` | List available tables | Yes |

### Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports` | List scheduled reports | Yes |
| POST | `/reports` | Create scheduled report | Yes |
| GET | `/reports/:id` | Get report details | Yes |
| PATCH | `/reports/:id` | Update report schedule | Yes |
| DELETE | `/reports/:id` | Delete scheduled report | Yes |
| GET | `/reports/:id/history` | Get delivery history | Yes |
| POST | `/reports/:id/regenerate` | Regenerate report | Yes |

### Query Editor (Analyst)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/queries/execute` | Execute SQL query | Yes (Analyst) |
| GET | `/queries/history` | Get query history | Yes (Analyst) |
| POST | `/queries/save` | Save query | Yes (Analyst) |
| GET | `/queries/saved` | List saved queries | Yes (Analyst) |

### Data Models (Analyst)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/models` | List data models | Yes |
| POST | `/models` | Create data model | Yes (Analyst) |
| GET | `/models/:id` | Get model details | Yes |
| PATCH | `/models/:id` | Update model | Yes (Analyst) |
| DELETE | `/models/:id` | Delete model | Yes (Analyst) |
| POST | `/models/:id/validate` | Validate model | Yes (Analyst) |

### Operations (Ops Manager)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/ops/dashboard` | Get operations metrics | Yes (Ops) |
| GET | `/ops/team` | List team members | Yes (Ops) |
| GET | `/ops/team/:id` | Get team member details | Yes (Ops) |
| GET | `/ops/workflows` | List pending workflows | Yes (Ops) |
| POST | `/ops/workflows/:id/approve` | Approve workflow | Yes (Ops) |
| POST | `/ops/workflows/:id/reject` | Reject workflow | Yes (Ops) |
| GET | `/ops/sla` | Get SLA status | Yes (Ops) |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Get admin statistics | Yes (Admin) |
| GET | `/admin/users` | List all users | Yes (Admin) |
| POST | `/admin/users` | Create user | Yes (Admin) |
| GET | `/admin/users/:id` | Get user details | Yes (Admin) |
| PATCH | `/admin/users/:id` | Update user | Yes (Admin) |
| DELETE | `/admin/users/:id` | Delete user | Yes (Admin) |
| POST | `/admin/users/:id/reset-password` | Reset user password | Yes (Admin) |
| GET | `/admin/api-keys` | List API keys | Yes (Admin) |
| POST | `/admin/api-keys` | Generate API key | Yes (Admin) |
| DELETE | `/admin/api-keys/:id` | Revoke API key | Yes (Admin) |
| GET | `/admin/audit-log` | Get audit log | Yes (Admin) |
| GET | `/admin/health` | Get system health | Yes (Admin) |
| GET | `/admin/branding` | Get branding settings | Yes (Admin) |
| PATCH | `/admin/branding` | Update branding | Yes (Admin) |

### Billing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/billing/subscription` | Get current subscription | Yes (Admin) |
| POST | `/billing/subscribe` | Subscribe to plan | Yes (Admin) |
| PATCH | `/billing/subscription` | Update subscription | Yes (Admin) |
| GET | `/billing/invoices` | List invoices | Yes (Admin) |
| GET | `/billing/invoices/:id` | Get invoice details | Yes (Admin) |
```

---

## Example HTML-PRD Cross-Check

Cross-reference HTML files with PRD to ensure accuracy. Generate a table in this format:

```markdown
## HTML <-> PRD Cross-Check

| HTML File | PRD Screen Match | PRD Section | Status |
|-----------|------------------|-------------|--------|
| 01-landing.html | Splash/Landing Page | Part 2: Common | Matched |
| 02-login.html | Login Page | Part 2: Common | Matched |
| 03-signup.html | Sign Up Page | Part 2: Common | Matched |
| 07-business-home.html | Home Tab - Dashboard Overview | Part 2: Business User | Matched |
| 14-dashboard-builder.html | Dashboard Builder Page | Part 2: Data Analyst | Matched |
| 18-ops-dashboard.html | Operations Dashboard Tab | Part 2: Ops Manager | Matched |
| 23-admin-dashboard.html | Dashboard Home Page | Part 3: Admin | Matched |
| custom-screen.html | - | - | Extra Screen |
| - | Mobile Settings Page | Part 2: Mobile | HTML Pending |
```

**Reconciliation Actions:**
- **Matched**: HTML file corresponds to PRD screen - document normally
- **Extra Screen**: HTML exists but not in PRD - add to PROJECT_API_INTEGRATION.md with note "Extra Screen - verify with design"
- **HTML Pending**: PRD screen exists but no HTML - mark status as "HTML Pending" in PROJECT_API_INTEGRATION.md
- **Name Mismatch**: Use PRD screen name as primary, note HTML filename in parentheses

---

## Example Frontend Pages to API Mapping

Map HTML screens to API endpoints with frontend project and role access information. Generate mapping tables in this format:

```markdown
## Frontend Pages -> API Mapping

### Public/Guest Pages (frontend)

| HTML File | Route | Frontend | API Endpoints | Status |
|-----------|-------|----------|---------------|--------|
| 01-landing.html | `/` | frontend | - | Pending |
| 02-login.html | `/login` | frontend | POST /auth/login | Pending |
| 03-signup.html | `/signup` | frontend | POST /auth/register | Pending |
| 04-forgot-password.html | `/forgot-password` | frontend | POST /auth/forgot-password | Pending |
| 05-reset-password.html | `/reset-password` | frontend | POST /auth/reset-password | Pending |
| 06-email-verification.html | `/verify-email` | frontend | POST /auth/verify-email | Pending |

### Business User Pages (frontend - Web Application)

| HTML File | Route | Frontend | API Endpoints | Status |
|-----------|-------|----------|---------------|--------|
| 07-business-home.html | `/home` | frontend | GET /dashboards/recent, GET /alerts/active | Pending |
| 08-dashboard-list.html | `/dashboards` | frontend | GET /dashboards | Pending |
| 09-dashboard-view.html | `/dashboards/:id` | frontend | GET /dashboards/:id, GET /widgets | Pending |
| 10-reports-list.html | `/reports` | frontend | GET /reports | Pending |
| 11-alerts-list.html | `/alerts` | frontend | GET /alerts | Pending |
| 12-user-settings.html | `/settings` | frontend | GET /users/me, PATCH /users/me | Pending |
| alert-details.html | `/alerts/:id` | frontend | GET /alerts/:id | Pending |
| modal-create-alert.html | - | frontend | POST /alerts | Pending |
| modal-schedule-report.html | - | frontend | POST /reports | Pending |

### Data Analyst Pages (frontend - Web Application)

| HTML File | Route | Frontend | API Endpoints | Status |
|-----------|-------|----------|---------------|--------|
| 13-analyst-home.html | `/analyst` | frontend | GET /dashboards, GET /models | Pending |
| 14-dashboard-builder.html | `/builder/:id` | frontend | GET/POST/PATCH dashboards, widgets | Pending |
| 15-query-editor.html | `/query` | frontend | POST /queries/execute, GET /queries/history | Pending |
| 16-data-models.html | `/models` | frontend | GET /models | Pending |
| 17-data-model-editor.html | `/models/:id` | frontend | GET/PATCH /models/:id | Pending |

### Admin Dashboard Pages (dashboard - Consolidated)

**Role Consolidation:** Single dashboard serves Admin, Organizer, and Operations Manager roles

| HTML File | Route | Frontend | Role Access | API Endpoints | Status |
|-----------|-------|----------|-------------|---------------|--------|
| **Operations Manager Routes** |
| 18-ops-dashboard.html | `/ops/dashboard` | dashboard | Ops Manager | GET /ops/dashboard | Pending |
| 19-team-overview.html | `/ops/team` | dashboard | Ops Manager | GET /ops/team | Pending |
| 20-team-member-detail.html | `/ops/team/:id` | dashboard | Ops Manager | GET /ops/team/:id | Pending |
| 21-workflows.html | `/ops/workflows` | dashboard | Ops Manager | GET /ops/workflows | Pending |
| 22-sla-monitor.html | `/ops/sla` | dashboard | Ops Manager | GET /ops/sla | Pending |
| **Admin Routes** |
| 23-admin-dashboard.html | `/admin/dashboard` | dashboard | Admin | GET /admin/stats | Pending |
| 24-user-management.html | `/admin/users` | dashboard | Admin | GET /admin/users | Pending |
| user-details.html | `/admin/users/:id` | dashboard | Admin | GET /admin/users/:id | Pending |
| create-user.html | `/admin/users/new` | dashboard | Admin | POST /admin/users | Pending |
| 25-data-sources.html | `/admin/sources` | dashboard | Admin | GET /data-sources | Pending |
| data-source-details.html | `/admin/sources/:id` | dashboard | Admin | GET /data-sources/:id | Pending |
| add-connection.html | `/admin/sources/new` | dashboard | Admin | POST /data-sources | Pending |
| 26-api-keys.html | `/admin/keys` | dashboard | Admin | GET /admin/api-keys | Pending |
| api-key-details.html | `/admin/keys/:id` | dashboard | Admin | GET /admin/api-keys/:id | Pending |
| generate-api-key.html | `/admin/keys/new` | dashboard | Admin | POST /admin/api-keys | Pending |
| 27-branding.html | `/admin/branding` | dashboard | Admin | GET/PATCH /admin/branding | Pending |
| 28-system-health.html | `/admin/health` | dashboard | Admin | GET /admin/health | Pending |
| 29-audit-log.html | `/admin/audit` | dashboard | Admin | GET /admin/audit-log | Pending |
| audit-log-details.html | `/admin/audit/:id` | dashboard | Admin | GET /admin/audit-log/:id | Pending |
| 30-billing.html | `/admin/billing` | dashboard | Admin | GET /billing/subscription | Pending |
| invoice-details.html | `/admin/billing/invoices/:id` | dashboard | Admin | GET /billing/invoices/:id | Pending |

**Routing Strategy:**
- `/ops/*` routes -> Operations Manager features (team & workflow management)
- `/admin/*` routes -> Admin features (full system access)
- Organizer routes (if applicable) -> `/organizer/*` (limited to own resources)

**Single Codebase Benefits:**
- Shared components (header, sidebar, navigation, forms)
- Unified navigation with role-based menu filtering
- Single auth context and route guards
- Consistent design system across all privileged user experiences

### Settings Pages (frontend - Shared)

| HTML File | Route | Frontend | API Endpoints | Status |
|-----------|-------|----------|---------------|--------|
| settings-dashboard-prefs.html | `/settings/dashboard` | frontend | GET/PATCH /users/me/preferences | Pending |
| settings-notifications.html | `/settings/notifications` | frontend | GET/PATCH /users/me/notifications | Pending |
| settings-security.html | `/settings/security` | frontend | PATCH /users/me/password | Pending |
```
