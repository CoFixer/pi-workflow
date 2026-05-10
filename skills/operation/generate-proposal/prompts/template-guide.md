# Template Guide - How to Fill Project-Specific Variables

## Workflow

1. Copy `templates/proposal-template.html` to `proposals/PROP-[CLIENT]-[DATE]-[LANG].html`
2. Replace all `{{PLACEHOLDER}}` variables with actual content
3. For language: set `<html lang="ko">` or `<html lang="en">`
4. Convert to PDF via Puppeteer

---

## Variable Replacement Examples

### Using Artlive project as reference:

#### Cover & Basic Info

```
{{CLIENT_NAME}}        → Artlive
{{PROJECT_NAME}}       → Expert-driven Artwork Appraisal Platform
{{TIMELINE}}           → 3 months
```

#### Features List (HTML `<li>` items)

```html
{{FEATURES_LIST}} →
<li>Stripe Integration</li>
<li>Mutual Review System</li>
<li>Payment Settlement</li>
<li>Photo / Video Review</li>
<li>Virtual Call Review</li>
<li>Expert-Specific Quote</li>
<li>Platform-Wide Quote</li>
```

#### Service Flow Title (text)

```
{{SERVICE_FLOW_TITLE}} → Basic Appraisal Flow
```

#### Service Flow Steps (HTML `<li>` items)

```html
{{SERVICE_FLOW_STEPS}} →
<li>Customer searches an Expert</li>
<li>Customer selects a service and finishes payment</li>
<li>Customer sends Object Info</li>
<li>[Optional] Customer arranges a call with Expert</li>
<li>Expert hands over final result</li>
<li>Customer consents disclosure of Project</li>
<li>Payment settlements</li>
<li>Customer and Expert leave a review mutually</li>
```

#### Admin Features (HTML `<div class="pill-badge">` items)

**Note**: Admin features use pill-badge divs, NOT `<li>` items.

```html
{{ADMIN_FEATURES}} →
<div class="pill-badge">Inquiry Management</div>
<div class="pill-badge">Settlement Management</div>
<div class="pill-badge">Project Management</div>
<div class="pill-badge">User Management</div>
<div class="pill-badge">Notice Management</div>
<div class="pill-badge">Review Management</div>
<div class="pill-badge">Order Management</div>
<div class="pill-badge">Expert Management</div>
```

#### Our Comment Title (text)

```
{{OUR_COMMENT_TITLE}} → 2 things to IMPROVE
```

#### Our Comments (HTML `<li>` items)

```html
{{OUR_COMMENTS}} →
<li>Complex UX needs simplification — especially for MVP</li>
<li>Different service combinations may confuse customers (Photo/Video vs Virtual Call, Fixed Price vs Quote)</li>
<li>Consider Expert Dashboard alongside Admin Dashboard</li>
```

#### Pricing - MVP Milestones

```
{{TOTAL_COST}}            → $20,000
{{MILESTONE_1_NAME}}      → Project Kickoff (Contract Signed)
{{MILESTONE_1_PERCENT}}   → 30%
{{MILESTONE_1_AMOUNT}}    → $6,000
{{MILESTONE_2_NAME}}      → After Design Approval
{{MILESTONE_2_PERCENT}}   → 30%
{{MILESTONE_2_AMOUNT}}    → $6,000
{{MILESTONE_3_NAME}}      → After Development Completed
{{MILESTONE_3_PERCENT}}   → 40%
{{MILESTONE_3_AMOUNT}}    → $8,000
```

#### Pricing - Feature-Based (3 groups)

The feature-based pricing slide has **3 groups**: MVP, Post-MVP, and Post-MVP 2.

```
{{MVP_AMOUNT}}            → $20,000  (total amount shown next to MVP group)
{{POST_MVP_AMOUNT}}       → $3,000   (amount for post-MVP group 1)
{{POST_MVP_2_AMOUNT}}     → $5,000   (amount for post-MVP group 2)
```

#### MVP Features (HTML `<li>` items)

```html
{{MVP_FEATURES}} →
<li>Photo / Video Only</li>
<li>Fixed Price Service by Expert</li>
<li>Stripe Payment & Settlement</li>
<li>Admin Dashboard</li>
<li>Expert Dashboard</li>
```

#### Post-MVP Features - Group 1 (HTML `<li>` items)

```html
{{POST_MVP_FEATURES}} →
<li>Virtual Call Integration</li>
<li>Calendar Management</li>
<li>Vacation Management</li>
```

#### Post-MVP Features - Group 2 (HTML `<li>` items)

```html
{{POST_MVP_FEATURES_2}} →
<li>Expert-Specific Quote</li>
<li>Platform-Wide Quote</li>
```

#### Team Members FAQ (HTML `<li>` items)

```html
{{TEAM_MEMBERS_FAQ}} →
<li>10 year experienced PM</li>
<li>8 year SR backend developer</li>
<li>7 year SR frontend developer</li>
<li>8 year SR UI/UX designer</li>
<li>5 year QA engineer</li>
<li>[Backup] 5 year frontend developer, 3 year frontend developer</li>
```

---

## Template Structure (34 Slides)

| # | Slide | Type | Content |
|---|-------|------|---------|
| 1 | Cover | PROJECT | Client name, portfolio preview, stats |
| 2 | Table of Contents | BOILERPLATE | 10 chapters |
| 3 | Who We Are | BOILERPLATE | Company stats, description |
| 4 | Client Request | PROJECT | Key features list |
| 5 | Service Flow | PROJECT | Numbered flow steps |
| 6 | Admin Dashboard | PROJECT | Pill-badge grid |
| 7 | Our Comment | PROJECT | Improvement suggestions |
| 8 | Our Process | BOILERPLATE | 4-step workflow |
| 9 | Our Portfolio | BOILERPLATE | Title slide |
| 10 | DiaFit - Intro | BOILERPLATE | Project details + screenshots |
| 11 | DiaFit - Screenshots | BOILERPLATE | Full-bleed screenshots |
| 12 | Stockify - Intro | BOILERPLATE | Project details + screenshots |
| 13 | Stockify - Screenshots | BOILERPLATE | Full-bleed screenshots |
| 14 | PET - Intro | BOILERPLATE | Project details + screenshots |
| 15 | PET - Screenshots | BOILERPLATE | Full-bleed screenshots |
| 16 | Mentora - Intro | BOILERPLATE | Project details + screenshots |
| 17 | Mentora - Screenshots | BOILERPLATE | Full-bleed screenshots |
| 18 | Agrilo - Intro | BOILERPLATE | Project details + screenshots |
| 19 | Agrilo - Screenshots | BOILERPLATE | Full-bleed screenshots |
| 20 | What is Behance? | BOILERPLATE | Behance explanation |
| 21 | Featured Projects | BOILERPLATE | 2x2 featured grid |
| 22 | Our Clients | BOILERPLATE | 4x3 client grid |
| 23 | Expert Team - Leadership | BOILERPLATE | CEO, CTO |
| 24 | Design Team | BOILERPLATE | 6+3 two-row layout |
| 25 | Full-Stack Team | BOILERPLATE | 6+2 two-row layout |
| 26 | Backend Team | BOILERPLATE | Team grid |
| 27 | Mobile & QA Team | BOILERPLATE | Team grid |
| 28 | Tech Stack | BOILERPLATE | 5-column grid |
| 29 | Clutch Reviews | BOILERPLATE | 4 review cards |
| 30 | To Client FAQ | PROJECT | 5 Q&A cards (TIMELINE, TEAM_MEMBERS_FAQ) |
| 31 | Pricing - MVP | PROJECT | Milestone table |
| 32 | Pricing - Feature Based | PROJECT | 3-group feature list |
| 33 | Contact Us | BOILERPLATE | 3 office locations |
| 34 | Thank You | BOILERPLATE | Closing slide |

---

## Language Switching

The template uses `data-lang` attributes for bilingual support:

```html
<!-- Set language in <html> tag -->
<html lang="ko">  <!-- Korean -->
<html lang="en">  <!-- English -->
```

The CSS automatically shows/hides the correct language blocks:
- `<span data-lang="ko">한국어</span>` — visible when `lang="ko"`
- `<span data-lang="en">English</span>` — visible when `lang="en"`

---

## PDF Generation

### Option 1: Puppeteer Node.js Script (Recommended)

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = path.resolve('proposals/PROP-Artlive-2026-02-ko.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.pdf({
    path: 'proposals/PROP-Artlive-2026-02-ko.pdf',
    landscape: true,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await browser.close();
})();
```

### Option 2: Puppeteer CLI

```bash
npx puppeteer print proposals/PROP-Artlive-2026-02-ko.html \
  proposals/PROP-Artlive-2026-02-ko.pdf \
  --landscape --format A4 \
  --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0
```

---

## Image Assets

Before generating, ensure images exist in the `images/` folder relative to the HTML file. When copying the template to `proposals/`, either:

1. **Copy images too**: `cp -r images/ proposals/images/`
2. **Use absolute paths**: Update `src="images/..."` to absolute paths
3. **Use base64**: Embed images as base64 data URIs for self-contained HTML

### Required Image Folders

```
images/
├── portfolio/          # Project screenshots (recommended: 800x500px)
│   ├── diafit-1.png, diafit-2.png
│   ├── stockify-1.png, stockify-2.png
│   ├── pet-1.png, pet-2.png
│   ├── mentora-1.png, mentora-2.png
│   └── agrilo-1.png, agrilo-2.png
├── team/               # Team photos (recommended: 200x200px, square)
│   ├── ceo-dongsub.png, cto-siam.png
│   └── ... (all team members)
├── partners/           # Client logos (recommended: 120x40px)
│   └── ...
└── behance/            # Behance featured screenshots
    └── ...
```
