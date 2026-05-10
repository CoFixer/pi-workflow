# Frontend Codebase Alignment Assessment

Checklist for evaluating React codebase alignment with project conventions. Referenced by the frontend-developer agent.

---

## Codebase Alignment Assessment

**Purpose**: Systematically verify that the codebase adheres to patterns, conventions, and workflows documented in the framework tier.

**Framework Tier Paths:**
- **React**: `.pi/react/guides/`, `.pi/react/skills/`, `.pi/react/agents/`
- **React Native**: `.pi/react-native/guides/`, `.pi/react-native/skills/`, `.pi/react-native/agents/`

### When to Run Assessment

**Mandatory Triggers:**
- Before starting work on features involving 3+ files
- After completing major features (affects 5+ files)
- When onboarding to an existing codebase
- Before creating a PR for review
- When explicitly requested by user

**Optional Triggers:**
- Weekly codebase health check
- Before major refactoring efforts

### Pre-Assessment: Load Framework Resources

**Step 1: Identify Framework Tier**

| Framework | Tier Path | Source Directory |
|-----------|-----------|------------------|
| React | `.pi/react` | `frontend*/app` or `dashboard*/app` |
| NestJS | `.pi/nestjs` | `backend/src` |
| React Native | `.pi/react-native` | `mobile/src` |

**Step 2: Read Critical Guides FIRST**

| Priority | Guide | Purpose |
|----------|-------|---------|
| **CRITICAL** | `.pi/{react|react-native}/guides/file-organization.md` | Directory structure, naming, imports |
| **CRITICAL** | `.pi/{react|react-native}/guides/best-practices.md` | Coding standards, mandatory patterns |
| HIGH | `.pi/{react|react-native}/guides/component-patterns.md` | Component/architecture patterns |
| MEDIUM | `.pi/{react|react-native}/skills/README.md` | Available skills and triggers |
| MEDIUM | `.pi/{react|react-native}/agents/README.md` | Agent capabilities and workflows |

### Alignment Checklist Categories

#### Category A: File Organization Alignment
**Check Against**: `.pi/{react|react-native}/guides/file-organization.md`

- Components in correct directories (ui/, layout/, pages/)
- Services in correct location (httpServices/)
- No deep relative imports (should use `~/` alias)

#### Category B: Naming Convention Alignment
**Check Against**: `.pi/{react|react-native}/guides/file-organization.md`

| File Type | Expected Pattern |
|-----------|------------------|
| Components | PascalCase.tsx |
| Shadcn/UI | lowercase.tsx |
| Services | camelCase+Service.ts |
| Redux Slices | camelCase+Slice.ts |
| Routes | kebab-case.routes.ts |
| Types | camelCase.d.ts |

#### Category C: Import Pattern Alignment
- Using `~/` alias consistently (not `../../../`)
- Using single quotes (not double quotes)
- Import order: React → external libs → internal → types

#### Category D: Pattern Implementation Alignment
**Check Against**: `.pi/{react|react-native}/guides/best-practices.md`

- TypeScript strict mode enabled
- Minimal use of `any` type
- Proper error handling patterns
- Loading states use approved components

#### Category E: Service Layer Alignment
- Services use httpService wrapper (not raw axios)
- Query hooks only in designated locations
- No direct API calls in components

#### Category F: Skills Utilization Check
**Check Against**: `.pi/{react|react-native}/skills/README.md`

- Relevant skills consulted for current work
- Skills documentation referenced when applicable

### Scoring System

| Score Range | Status | Action Required |
|-------------|--------|-----------------|
| 90-100% | ALIGNED | No action needed |
| 70-89% | MINOR_MISALIGNMENT | Fix during current task |
| 50-69% | MODERATE_MISALIGNMENT | Plan refactoring sprint |
| 0-49% | MAJOR_MISALIGNMENT | Immediate refactoring required |

### Refactoring Trigger Conditions

**Trigger Full Codebase Refactoring When:**
1. MAJOR_MISALIGNMENT in 2 or more categories
2. Category A (File Organization) has MAJOR_MISALIGNMENT alone
3. More than 20 total issues across all categories
4. Critical patterns violated (business logic in components, no error handling)

### Refactoring Delegation Workflow

When refactoring is required, delegate to appropriate agents:

**Step 1: Planning & Execution**
- Use `refactorer` agent to analyze code, create comprehensive refactoring plan, and execute it
- Reference framework tier guides for correct patterns
- Update ALL imports after file moves
- Verify build passes after each phase

**Step 2: Validation**
- Use `reviewer` agent to verify alignment
- Confirm all assessment issues resolved
- Check build and type checks pass

### Assessment Report Format

```markdown
## Codebase Alignment Assessment Report

**Date**: YYYY-MM-DD
**Framework Tier**: .pi/{react|react-native}
**Scope**: [files/directories assessed]

### Overall Status: [ALIGNED | MINOR_MISALIGNMENT | MAJOR_MISALIGNMENT]

| Category | Status | Issues | Priority |
|----------|--------|--------|----------|
| A. File Organization | [status] | [count] | [HIGH/MEDIUM/LOW] |
| B. Naming Conventions | [status] | [count] | [HIGH/MEDIUM/LOW] |
| C. Import Patterns | [status] | [count] | [HIGH/MEDIUM/LOW] |
| D. Pattern Implementation | [status] | [count] | [HIGH/MEDIUM/LOW] |
| E. Service Layer | [status] | [count] | [HIGH/MEDIUM/LOW] |
| F. Skills Utilization | [status] | [count] | [LOW] |

### Critical Issues (Require Immediate Action)
1. [Issue description with file path]

### Recommendations
1. [Recommendation with reference to guide]

### Refactoring Required: [YES/NO]
```

### Quick Reference Commands

```bash
# === FILE ORGANIZATION ===
fd -e tsx . {frontend*/app|dashboard*/app|mobile/src}/components/ui/     # Check Shadcn/UI placement
fd -e tsx . {frontend*/app|dashboard*/app|mobile/src}/components/layout/ # Check layout placement
fd -e ts . {frontend*/app|dashboard*/app|mobile/src}/services/           # Check service structure

# === IMPORT PATTERNS ===
rg "from '\.\./\.\./\.\." {frontend*/app|dashboard*/app|mobile/src}/ --glob '*.tsx' -c  # Deep relative imports
rg 'from "' {frontend*/app|dashboard*/app|mobile/src}/ --glob '*.tsx' -c                # Double quote imports

# === PATTERN COMPLIANCE ===
rg ': any' {frontend*/app|dashboard*/app|mobile/src}/ --count           # Any type usage
rg 'isLoading \? return' {frontend*/app|dashboard*/app|mobile/src}/     # Early return anti-pattern

# === BUILD VERIFICATION ===
npm run typecheck && npm run build
```

### Post-Refactoring Validation

After refactoring completes:
1. **Re-run Assessment** using the same checklist
2. **Verify All Categories** show ALIGNED status
3. **Run Build Verification** (typecheck + build)
4. **Update Status**: Mark assessment complete
