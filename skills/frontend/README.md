# React/Next.js Skills Directory

Comprehensive skill library for React/Next.js frontend development following Anthropic's best practices for Claude Code.

---

## 📚 Skills Index

### Frontend Development

#### [frontend-dev-guidelines](../agents/frontend-developer.md)
**Type**: Agent | **Priority**: High

Complete end-to-end frontend development workflow from documentation analysis to tested UI components.

**Triggers**: `frontend`, `react`, `component`, `page`, `api integration`, `playwright`, `e2e test`

**Use When**:
- Implementing new features from PRD
- Integrating backend APIs into frontend pages
- Updating API integration documentation
- Creating Playwright E2E tests
- Following React/TypeScript best practices

---

### Quality Assurance

#### [design-qa-figma](qa/design-qa-figma.md)
**Type**: Skill | **Priority**: High

QA workflow for comparing Figma designs with React implementation to ensure pixel-perfect accuracy.

**Triggers**: `design qa`, `figma qa`, `pixel-perfect`, `visual comparison`, `design verification`

**Use When**:
- Comparing implementation vs Figma designs
- Performing visual QA on components
- Ensuring design fidelity
- Creating QA reports

#### [design-qa-html](qa/design-qa-html.md)
**Type**: Skill | **Priority**: High

QA workflow for comparing HTML prototypes with React implementation.

**Triggers**: `design qa`, `html qa`, `html prototype`, `prototype qa`, `visual comparison`

**Use When**:
- Converting HTML prototypes to React
- Verifying implementation matches prototype
- Performing visual comparison QA

---

### Testing

#### [e2e-testing](e2e-testing/SKILL.md)
**Type**: Skill | **Priority**: High

Comprehensive guide for E2E testing including test generation, fixtures, and page object patterns using Playwright.

**Triggers**: `e2e test`, `playwright`, `end-to-end`, `generate test`, `create test`, `test fixtures`, `page objects`, `POM`

**Use When**:
- Generating tests for new pages/flows
- Setting up Playwright test infrastructure
- Creating test fixtures (auth, users)
- Implementing page object patterns
- Writing user flow tests
- Testing against real backend (no mocking)

**Includes**:
- Quick start templates
- Test infrastructure setup
- Page Object Pattern (POM)
- Test fixtures (authentication, custom fixtures)
- Test patterns (auth, forms, lists/CRUD)
- Best practices (no API mocking)

**Reference Files**:
- [Test Patterns](e2e-testing/resources/test-patterns.md) - Common test scenarios
- [Page Object Templates](e2e-testing/resources/page-object-templates.md) - Page object examples

---

### Converters

#### [figma-to-react-converter](converters/figma-to-react-converter.md)
**Type**: Skill | **Priority**: High

Convert Figma designs to React/TypeScript components with Tailwind CSS.

**Triggers**: `figma`, `convert figma`, `figma to react`, `implement design`

**Use When**:
- Converting Figma designs to React components
- Implementing new UI from designs
- Creating components from mockups

#### [html-to-react-converter](converters/html-to-react-converter.md)
**Type**: Skill | **Priority**: Medium

Convert static HTML prototypes to React/TypeScript components.

**Triggers**: `convert html`, `html to react`, `migrate html`, `static html`

**Use When**:
- Converting HTML prototypes to React
- Migrating static pages to React
- Transforming HTML mockups

---

### Builders

#### [dashboard-builder](builders/dashboard-builder.md)
**Type**: Skill | **Priority**: Medium

Build admin dashboards and CRUD interfaces with React/TypeScript.

**Triggers**: `dashboard`, `admin dashboard`, `admin panel`, `crud operations`, `admin ui`

**Use When**:
- Building admin dashboards
- Creating CRUD interfaces
- Implementing analytics dashboards
- Setting up admin panels

---

### Code Quality

#### [organize-types](code-quality/organize-types.md)
**Type**: Skill | **Priority**: Medium

Analyze and maintain TypeScript type organization following React project structure.

**Triggers**: `organize types`, `typescript types`, `type organization`, `refactor types`, `centralize types`, `.d.ts`, `barrel exports`

**Use When**:
- Adding new components
- Creating new features
- Refactoring type definitions
- Before releases

---

### Debugging

#### [fix-bug](debugging/fix-bug.md)
**Type**: Skill | **Priority**: Medium

Structured approach to debugging and fixing React/TypeScript bugs including rendering issues, state problems, and API errors.

**Triggers**: `fix bug`, `debug`, `react error`, `frontend bug`, `typescript error`, `runtime error`, `redux error`

**Use When**:
- Encountering React rendering issues
- Debugging state management problems
- Fixing routing errors
- Resolving API/data fetching failures
- Troubleshooting TypeScript type errors

---

## 🎯 Quick Start

### For New Features

1. **Design & Plan**: Use [frontend-dev-guidelines](../agents/frontend-developer.md) agent for complete workflow
2. **Design Conversion**: Use [figma-to-react-converter](converters/figma-to-react-converter.md) or [html-to-react-converter](converters/html-to-react-converter.md)
3. **Implementation**: Follow React/TypeScript best practices
4. **QA**: Use [design-qa-figma](qa/design-qa-figma.md) or [design-qa-html](qa/design-qa-html.md) to verify
5. **Test**: Use [e2e-testing](e2e-testing/SKILL.md) to create comprehensive tests
6. **Quality Check**: Run [organize-types](code-quality/organize-types.md) before commit

### For Bug Fixes

1. **Debug**: Use [fix-bug](debugging/fix-bug.md) to identify issue
2. **Fix**: Apply appropriate solution pattern
3. **Test**: Verify fix with existing or new tests
4. **Validate**: Run full test suite

### For Testing

1. **Setup**: Use [e2e-testing](e2e-testing/SKILL.md) for complete testing workflow:
   - Test infrastructure setup (Playwright config)
   - Page Object Pattern implementation
   - Fixture creation (auth, users)
   - Test patterns (auth, forms, CRUD)
   - Real API testing (no mocking)

---

## 📖 Skill Structure

Each skill follows Anthropic's best practices:

### ✅ Required Components

1. **YAML Frontmatter**: Metadata for auto-discovery
   ```yaml
   ---
   skill_name: my-skill
   applies_to_local_project_only: true
   auto_trigger_regex: [keyword1, keyword2]
   tags: [tag1, tag2]
   related_skills: [skill1, skill2]
   ---
   ```

2. **Main Content**: Under 500 lines following progressive disclosure
3. **Reference Files**: Detailed content in `resources/` subdirectory
4. **Related Links**: Cross-references to related skills and guides

### 📁 Directory Structure

```
.pi/react/skills/
├── README.md                           # This file
├── skill-rules.json                    # Trigger configuration
├── qa/
│   ├── design-qa-figma.md              # Figma QA workflow
│   └── design-qa-html.md               # HTML QA workflow
├── e2e-testing/
│   ├── SKILL.md                        # Unified E2E testing guide
│   └── resources/                      # Reference files
│       ├── test-patterns.md            # Common test scenarios
│       └── page-object-templates.md    # Page object examples
├── converters/
│   ├── figma-to-react-converter.md     # Figma to React
│   └── html-to-react-converter.md      # HTML to React
├── builders/
│   └── dashboard-builder.md            # Dashboard builder
├── code-quality/
│   └── organize-types.md               # Type organization
└── debugging/
    └── fix-bug.md                      # Debugging guide
```

---

## 🔍 How Skills Are Triggered

Skills are automatically suggested by Claude based on:

1. **Keywords**: Explicit mentions in your prompt
2. **Intent Patterns**: Action phrases (e.g., "convert figma", "fix bug", "generate test")
3. **File Paths**: Working with specific file types (e.g., `*.spec.ts`)
4. **Content Patterns**: Code patterns detected in files

Configuration: [skill-rules.json](skill-rules.json)

---

## 🔗 Related Resources

### Guides (../guides/)
- [component-patterns.md](../guides/component-patterns.md) - React component best practices
- [data-fetching.md](../guides/data-fetching.md) - HTTP service patterns
- [common-patterns.md](../guides/common-patterns.md) - Redux and form patterns
- [typescript-standards.md](../guides/typescript-standards.md) - Type safety guidelines
- [browser-testing.md](../guides/browser-testing.md) - Manual testing guide

---

## 📊 Statistics

- **Total Skills**: 9 (1 agent reference + 8 skill documents)
- **Skills with YAML Frontmatter**: 8/8 (100%)
- **Skills Under 500 Lines**: 8/8 (100%)
- **Reference Files**: 2 (test-patterns, page-object-templates)
- **Total Trigger Keywords**: 80+
- **Coverage**: Frontend development, QA, E2E testing (unified), converters, builders, code quality, debugging

---

## 🎓 Best Practices

### For Skill Creators

1. **Keep main file under 500 lines** - Use progressive disclosure
2. **Add comprehensive YAML frontmatter** - Include all trigger keywords
3. **Use reference files** for detailed content
4. **Add table of contents** for files > 100 lines
5. **Cross-link related skills** - Help discovery
6. **Include practical examples** - Real code from the project
7. **Test triggers** - Verify keywords work as expected

### For Skill Users

1. **Use specific keywords** - More likely to trigger relevant skills
2. **Reference file paths** - Automatically trigger file-based skills
3. **Describe intent clearly** - Help intent pattern matching
4. **Check related resources** - Explore reference files for advanced patterns

---

## 🔧 Maintenance

### Adding New Skills

1. Create skill file in appropriate subdirectory
2. Add YAML frontmatter with all required fields
3. Keep main content under 500 lines
4. Create reference files in `resources/` if needed
5. Update [skill-rules.json](skill-rules.json)
6. Add entry to this README
7. Test triggers with sample prompts

### Updating Existing Skills

1. Maintain YAML frontmatter accuracy
2. Keep line count under 500
3. Update [skill-rules.json](skill-rules.json) if triggers change
4. Update cross-references in related skills
5. Update this README if description changes

---

## 📝 Skill Development Guide

For detailed information on creating and managing skills, see:
- [Skill Developer Guide](../../base/skills/skill-developer/SKILL.md)

---

## ✅ Compliance Status

**Last reviewed and updated**: 2026-01-16

- ✅ YAML frontmatter added to all skills
- ✅ All skills under 500-line limit
- ✅ Progressive disclosure implemented
- ✅ Reference files created for detailed content
- ✅ skill-rules.json aligned with frontmatter
- ✅ Cross-references updated
- ✅ E2E testing consolidated into single comprehensive skill
- ✅ README created with consolidated structure

### Consolidation Changes

**Merged**: `e2e-test-generator`, `e2e-fixtures`, and `e2e-page-objects` → **`e2e-testing`**

This consolidation provides:
- Single entry point for all E2E testing needs
- Unified workflow from setup to execution
- Better discoverability with comprehensive triggers
- Clear progressive disclosure to reference materials
- Reduced maintenance overhead

---

**Last Updated**: 2026-01-16
**Version**: 2.0 (Consolidated)
**Status**: Production Ready ✅
