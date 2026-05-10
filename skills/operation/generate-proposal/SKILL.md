---
name: generate-proposal
description: Generate interactive HTML slide proposals (PPT-style) with bilingual support
---

# Generate Proposal - Client Proposal HTML Generator

Generate professional client proposals as **interactive HTML slide presentations (PPT-style)** with bilingual support (Korean/English).

---

## Step-by-Step Generation Process

### Step 1: Gather Information

Ask the user for these **required** inputs (if not already provided):

| Input | Question | Default |
|-------|----------|---------|
| Client name | "What is the client company name?" | — |
| Project name | "What is the project title?" | — |
| Language | "Korean or English?" | `ko` |
| Total cost | "What is the total project cost (USD)?" | — |
| Key features | "List the key features of the project" | — |
| Service flow | "Describe the user/service flow steps" | — |

**Optional** (use your best judgment to fill these if user doesn't provide):
- Admin features, Our comments, Tech stack, Timeline
- Milestone breakdown (default: 30/30/40 split)
- MVP vs Post-MVP feature grouping
- Team composition for FAQ

### Step 2: Copy Template

```bash
cp templates/proposal-template.html proposals/PROP-[CLIENT]-[DATE]-[LANG].html
```

**Naming**: `PROP-Artlive-2026-02-ko.html`

### Step 3: Set Language

Change `<html lang="ko">` or `<html lang="en">` on line 2.
The CSS handles showing/hiding `data-lang` spans automatically.

### Step 4: Replace All Variables

Replace every `{{PLACEHOLDER}}` with project-specific content. See **Variables Reference** below.

### Step 5: Embed Images as Base64

Read each image file and convert to inline base64 for self-contained HTML:

```html
<img src="data:image/png;base64,{BASE64_DATA}" alt="Project Name" class="w-full h-auto object-contain" />
```

- **Cover image**: **ALWAYS** use `images/projects/1st for cover.png` as the Slide 1 hero/cover image (the main dashboard card). Never use any other project image for the cover slide.
- **Portfolio images**: Read each project PNG from `images/projects/` and embed inline
- **Featured project images**: Read from `images/projects/featured project [1-4].png` for the Behance Featured Projects slide
- **Team images**: Read from `images/team-image/` — only include when names are specified in the request
- **Tech stack icons**: Read from `images/tech-stack/[category]/` and embed inline
- **Client logos**: Read from `images/our-clients/` and embed inline
- **Office icons**: Read from `images/offices/` for Contact slide
- **Project name = image filename** (strip the `.png` extension)

### Step 6: Validate

Run this to confirm no unreplaced placeholders remain:

```bash
grep -c '{{' proposals/PROP-[CLIENT]-[DATE]-[LANG].html
```

Expected: `0`

---

## Variables Reference (26 total)

### Basic Info

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{CLIENT_NAME}}` | text | Client company name | `Artlive` |
| `{{PROJECT_NAME}}` | text | Project title | `Expert Artwork Appraisal Platform` |
| `{{TIMELINE}}` | text | Project duration | `3 months` |

### Client Request (Chapter 02)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{FEATURES_LIST}}` | HTML `<li>` | Key features list | `<li>Stripe Integration</li>` |
| `{{SERVICE_FLOW_TITLE}}` | text | Title for service flow diagram | `Basic Appraisal Flow` |
| `{{SERVICE_FLOW_STEPS}}` | HTML `<li>` | Numbered flow steps | `<li>Customer searches Expert</li>` |
| `{{ADMIN_FEATURES}}` | HTML `<div>` | Admin dashboard features (pill-badge) | `<div class="pill-badge">User Management</div>` |
| `{{OUR_COMMENT_TITLE}}` | text | Title for comments section | `2 things to IMPROVE` |
| `{{OUR_COMMENTS}}` | HTML `<li>` | Improvement suggestions | `<li>Simplify UX for MVP</li>` |

### Pricing - Milestone Based (Chapter 10, Slide 31)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{TOTAL_COST}}` | text | Total project cost | `$20,000` |
| `{{MILESTONE_1_NAME}}` | text | Milestone 1 name | `Project Kickoff (Contract Signed)` |
| `{{MILESTONE_1_PERCENT}}` | text | Milestone 1 percentage | `30%` |
| `{{MILESTONE_1_AMOUNT}}` | text | Milestone 1 dollar amount | `$6,000` |
| `{{MILESTONE_2_NAME}}` | text | Milestone 2 name | `After Design Approval` |
| `{{MILESTONE_2_PERCENT}}` | text | Milestone 2 percentage | `30%` |
| `{{MILESTONE_2_AMOUNT}}` | text | Milestone 2 dollar amount | `$6,000` |
| `{{MILESTONE_3_NAME}}` | text | Milestone 3 name | `After Development Completed` |
| `{{MILESTONE_3_PERCENT}}` | text | Milestone 3 percentage | `40%` |
| `{{MILESTONE_3_AMOUNT}}` | text | Milestone 3 dollar amount | `$8,000` |

### Pricing - Feature Based (Chapter 10, Slide 32)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{MVP_FEATURES}}` | HTML `<li>` | MVP feature list | `<li>Photo/Video Only</li>` |
| `{{MVP_AMOUNT}}` | text | MVP cost (can differ from TOTAL_COST) | `$20,000` |
| `{{POST_MVP_FEATURES}}` | HTML `<li>` | Post-MVP group 1 features | `<li>Virtual Call</li>` |
| `{{POST_MVP_AMOUNT}}` | text | Post-MVP group 1 cost | `$3,000` |
| `{{POST_MVP_FEATURES_2}}` | HTML `<li>` | Post-MVP group 2 features | `<li>Expert Quote</li>` |
| `{{POST_MVP_2_AMOUNT}}` | text | Post-MVP group 2 cost | `$5,000` |

### FAQ (Slide 30)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{TEAM_MEMBERS_FAQ}}` | HTML `<li>` | Team composition for FAQ | `<li>10 year experienced PM</li>` |

---

## Common Pitfalls

1. **`{{MVP_AMOUNT}}` vs `{{TOTAL_COST}}`**: These are different variables on different slides. `TOTAL_COST` goes on the milestone-based pricing slide (slide 31). `MVP_AMOUNT` goes on the feature-based pricing slide (slide 32). They may have the same value but they can also differ.

2. **Admin features use `<div>` not `<li>`**: `{{ADMIN_FEATURES}}` uses `<div class="pill-badge">` elements, not `<li>` elements like all other list variables.

3. **HTML entities**: Use `&amp;` for `&` in HTML content (e.g., `Design &amp; Development`).

4. **Nested lists**: `{{OUR_COMMENTS}}` should contain flat `<li>` items, not nested `<ul>` structures.

5. **Logo SVG**: The logo is defined once as a `<symbol>` at the top of the template and referenced via `<use href="#potential-logo"/>` across all slides. Do not modify individual logo references.

6. **Vertical centering**: Slides use `justify-content: center` to vertically center content. Do NOT add `flex:1` to the main content div inside a slide (it fills the full height, defeating centering). Do NOT add `padding-top` to offset for the logo — the logo is absolutely positioned.

7. **Title position**: All section titles (`title-line1` / `title-line2`) must be placed at the **top** of the slide content in their own wrapper div (`margin-bottom:24px`), with content below. Do NOT place titles in a left-right flex layout next to content.

---

## Template Structure (Slides)

| # | Slide | Type | Variables Used |
|---|-------|------|----------------|
| 1 | Cover | PROJECT | `CLIENT_NAME` |
| 2 | Table of Contents | BOILERPLATE | — |
| 3 | Who We Are | BOILERPLATE | — |
| 4 | Client Request - Features | PROJECT | `PROJECT_NAME`, `FEATURES_LIST` |
| 5 | Client Request - Flow | PROJECT | `SERVICE_FLOW_TITLE`, `SERVICE_FLOW_STEPS` |
| 6 | Client Request - Admin | PROJECT | `ADMIN_FEATURES` |
| 7 | Our Comment | PROJECT | `OUR_COMMENT_TITLE`, `OUR_COMMENTS` |
| 8 | Our Process | BOILERPLATE | — |
| 8+N | **Portfolio Projects (1 slide per project image)** | **AUTO-GENERATED** | — |
| — | What is Behance? | BOILERPLATE | — |
| — | Featured Projects | BOILERPLATE | — |
| — | Our Clients | BOILERPLATE | — |
| — | Expert Team | BOILERPLATE | — |
| — | Project Team | PROJECT | Team member names/images |
| — | Tech Stack | BOILERPLATE | — |
| — | Clutch Reviews | BOILERPLATE | — |
| — | To Client FAQ | PROJECT | `TIMELINE`, `TEAM_MEMBERS_FAQ` |
| — | Pricing - Milestones | PROJECT | `TOTAL_COST`, `MILESTONE_1/2/3_*` |
| — | Pricing - Feature Based | PROJECT | `MVP_FEATURES`, `MVP_AMOUNT`, `POST_MVP_*` |
| — | Contact Us | BOILERPLATE | — |
| — | Thank You | BOILERPLATE | — |

> **Note**: Slide numbers after Portfolio are dynamic because the total number of portfolio slides depends on how many images exist in `images/projects/`.

---

## Boilerplate Sections (Fixed Content)

These sections are pre-filled in the template. Do NOT modify unless updating company info:

- **Who We Are** — Company stats (40+ team, 100+ projects, 3+ years)
- **Our Process** — 4-step workflow (Discovery → Design → Testing → Maintenance)
- **Portfolio** — DiaFit, Stockify, PET, Mentora, Agrilo (5 projects × 2 slides each)
- **Behance** — Featured explanation + 2×2 grid (images from `images/projects/featured project [1-4].png`)
- **Clients** — Client logo grid (images from `images/our-clients/`)
- **Expert Team** — Leadership, Design (6+3), Full-Stack (6+2), Backend, Mobile & QA
- **Tech Stack** — 5-column technology grid (icons from `images/tech-stack/`)
- **Testimonials** — 4 Clutch review cards
- **Contact** — 3 office locations (icons from `images/offices/`)
- **Thank You** — Closing slide

---

## Brand Guidelines

> **Brand guidelines:** See `.pi/base/brand/BRAND_GUIDELINES.md` for the canonical color palette, typography, and logo rules.

This document uses the **Dark Theme** palette with the following proposal-specific overrides:

| Element | Value | CSS Variable |
|---------|-------|--------------|
| **Accent** | `#EBFE5B` (Lime Green) | `--accent` |
| Gradient Border | `linear-gradient(135deg, rgba(98,77,255,0.4), rgba(235,254,91,0.4))` | — |

### Layout

| Property | Value |
|----------|-------|
| Orientation | 16:9 Full Screen (100vw × 100vh) |
| Slide Padding | `56px 64px` |
| Content Alignment | Vertically centered (`justify-content: center`) |
| Logo | Fixed top-left (`position: absolute; top: 28px; left: 40px`) |
| Title Style | Line 1: White (400wt) + Line 2: Lime Green (700wt) |
| Title Position | **Always at the TOP** of the slide content, never side-by-side |
| Assets Source | https://potentialai.com |

### Title Layout Rule

**All slide titles MUST be placed at the top of the content, NOT in a left-right (side-by-side) layout.**

Correct pattern:
```html
<div style="margin-bottom:24px;">
  <div class="title-line1" style="font-size:48px;">Section</div>
  <div class="title-line2" style="font-size:48px;">Title</div>
</div>
<div>
  <!-- Content goes below the title -->
</div>
```

Do NOT use this pattern (left-right flex with title on the left):
```html
<!-- WRONG: title on the left, content on the right -->
<div style="display:flex; gap:48px;">
  <div style="flex:0 0 200px;">Title</div>
  <div style="flex:1;">Content</div>
</div>
```

**Important**: Do NOT use `flex:1` on the main content wrapper inside a slide — it defeats vertical centering. Use `flex:1` only on inner column elements for horizontal layout. Do NOT add `padding-top` to push content below the logo — the logo is absolutely positioned and does not affect content flow.

### Project Team Card Layout

**Project team members MUST be displayed horizontally in a single row**, not stacked vertically by role group. Each card shows the member photo, name, role, and a color-coded badge for their department.

Correct pattern:
```html
<div class="flex justify-center gap-8 stagger-enter">
    <!-- Each member card: 200px wide, displayed side by side -->
    <div class="flex flex-col w-[200px] group">
        <div class="h-52 bg-[#111] rounded-xl overflow-hidden mb-3 border border-white/5 ...">
            <img src="..." class="w-full h-full object-cover grayscale group-hover:grayscale-0 ...">
        </div>
        <h4 class="text-sm font-bold text-white ...">Member Name</h4>
        <p class="text-[10px] text-gray-500 uppercase ...">Role Title</p>
        <span class="inline-block w-fit bg-lime-400 text-black font-bold px-3 py-0.5 rounded-full text-[10px] uppercase ...">Department</span>
    </div>
    <!-- ... more members in the same row -->
</div>
```

Badge colors by department:
- **Design**: `bg-lime-400 text-black`
- **Full-Stack**: `bg-brand-purple text-white`
- **Operations**: `bg-white/10 text-white border border-white/20`

---

## Portfolio Projects & Images

**Image Source**: `images/projects/`
**Rules**:
- **Auto-generate portfolio slides from ALL images** in `images/projects/`, creating one slide per image file
- **Excluded images** (do NOT create portfolio slides for these):
  - `1st for cover.png` — Reserved for Slide 1 cover only
  - `featured project 1.png` — Reserved for Behance Featured slide
  - `featured project 2.png` — Reserved for Behance Featured slide
  - `featured project 3.png` — Reserved for Behance Featured slide
  - `featured project 4.png` — Reserved for Behance Featured slide
- **If new images are added** to the `images/projects/` folder, they MUST automatically get a portfolio slide. Do not hardcode a fixed list — always scan the folder and include every image except the excluded ones above.
- **Project name = image filename** (strip the file extension). If the filename contains ` - ` or ` -  `, split into project name (before) and project type (after). E.g. `DiaFit -  Healthtech AI App.png` → name: "DiaFit", type: "Healthtech AI App"
- **Base64 embed images** — Read image files and convert to inline `data:image/png;base64,` for self-contained HTML

### Portfolio Slide HTML Pattern

**CRITICAL**: Every project image MUST get its own slide using this exact pattern. Do NOT skip any images.

```html
<!-- SLIDE N: PORTFOLIO - PROJECT_NAME -->
<section class="slide">
    <div class="w-full max-w-7xl mx-auto px-6 grid grid-cols-12 gap-8 items-center relative z-20">
        <div class="col-span-4 stagger-enter">
            <h2 class="text-5xl font-bold mb-4">{{PROJECT_NAME}} -</h2>
            <h2 class="text-5xl font-bold text-lime-400 mb-12">{{PROJECT_TYPE}}</h2>
            <div class="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <div class="text-sm text-gray-400 mb-1">Platform</div>
                    <div class="text-xl text-lime-400 font-medium">Design &amp; Development</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400 mb-1">Project Duration</div>
                    <div class="text-xl text-lime-400 font-medium">{{DURATION}}</div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button class="bg-brand-purple text-white px-8 py-3 rounded-full font-medium hover:bg-brand-purple/90 transition">Live Link</button>
                <button class="w-12 h-12 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple hover:bg-brand-purple hover:text-white transition">→</button>
            </div>
        </div>
        <div class="col-span-8 stagger-enter relative">
            <div class="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src="data:image/png;base64,{{BASE64}}" class="w-full h-auto object-cover opacity-80" alt="{{PROJECT_NAME}}">
            </div>
        </div>
    </div>
</section>
```

Portfolio slides are inserted **after the "Our Process" slide** and **before the "What is Behance?" slide**.

### Portfolio Priority Ordering Rule

**Portfolio slides MUST be sorted by relevance to the proposal's project type.** Projects whose tags match the proposal domain appear first, followed by the rest alphabetically.

**How to apply:**
1. Identify the proposal's domain keywords (e.g. "fintech mobile app" → keywords: `fintech`, `mobile`, `app`, `finance`, `payment`)
2. Score each project: count how many of its tags match the proposal keywords
3. Sort: highest-scoring projects first, then alphabetically for ties

| Project | Image File | Type | Duration | Tags |
|---------|-----------|------|----------|------|
| 343Pet | `343Pet -  Pet HealthCare App.png` | Pet HealthCare App | 3 Months | `mobile`, `healthtech`, `app` |
| Agrilo | `Agrilo -  Agritech AI Agent.png` | Agritech AI Agent | 4 Months | `ai`, `agritech`, `agent` |
| CART | `CART -  Card Traders App.png` | Card Traders App | 3 Months | `mobile`, `marketplace`, `e-commerce`, `fintech` |
| Dexulin | `Dexulin -  Smart Health & Fitness Tracking App.png` | Smart Health & Fitness Tracking | 3 Months | `mobile`, `healthtech`, `fitness`, `app` |
| DiaFit | `DiaFit -  Healthtech AI App.png` | Healthtech AI App | 4 Months | `mobile`, `healthtech`, `ai`, `app` |
| Elite4print | `Elite4print -  E-commerce & ERP Solution.png` | E-commerce & ERP | 3 Months | `web`, `e-commerce`, `erp`, `dashboard` |
| Hacamong | `Hacamong -  Reliable Babysitter Finder App.png` | Babysitter Finder App | 3 Months | `mobile`, `marketplace`, `app` |
| K-Talk | `K-Talk -  Korean Language Learning Platform.png` | Language Learning Platform | 3 Months | `web`, `education`, `platform` |
| Maloha | `Maloha -  Real-time Voice Translation App.png` | Voice Translation App | 3 Months | `mobile`, `ai`, `translation`, `app` |
| Mentora | `Mentora -  AI Student Managment.png` | AI Student Management | 3 Months | `web`, `ai`, `education`, `dashboard` |
| NearWork | `NearWork -  Smart job portal website.png` | Smart Job Portal | 3 Months | `web`, `marketplace`, `portal` |
| Omni | `Omni -  Fitness Tracking App.png` | Fitness Tracking App | 3 Months | `mobile`, `fitness`, `healthtech`, `app` |
| Park Park | `Park Park -  Smart Parking Lot Sharing Platform.png` | Smart Parking | 3 Months | `mobile`, `platform`, `sharing` |
| Personal Expense Tracking | `Personal Expense Tracking - AI Agent.png` | AI Agent | 3 Months | `mobile`, `fintech`, `ai`, `finance`, `app` |
| Silvara | `Silvara -  Personal Health Companion App.png` | Health Companion | 1 Month | `mobile`, `healthtech`, `ai`, `app` |
| Stockify | `Stockify -   AI Business Automation.png` | AI Business Automation | 3 Months | `web`, `ai`, `fintech`, `automation`, `dashboard` |
| Thrill | `Thrill -  Adventure Matching Platform.png` | Adventure Matching | 3 Months | `mobile`, `social`, `platform` |
| Tobeone | `Tobeone -  Community app.png` | Community App | 3 Months | `mobile`, `social`, `community`, `app` |
| Tustix | `Tustix -  Ticket & Supplier Management Dashboard.png` | Ticket Dashboard | 3 Months | `web`, `dashboard`, `management` |

**Example** — Proposal for "fintech mobile app":
- Keywords: `fintech`, `mobile`, `finance`, `app`
- Priority order: Personal Expense Tracking (4 tags match) → CART (2) → Stockify (1) → DiaFit, Dexulin, Omni, Silvara, etc. (1 each: `mobile`/`app`) → rest alphabetically

### Featured Project Images (Behance Slide)

**Image Source**: `images/projects/`

| Image File | Used On |
|-----------|---------|
| `featured project 1.png` | Featured Projects slide (2×2 grid) |
| `featured project 2.png` | Featured Projects slide (2×2 grid) |
| `featured project 3.png` | Featured Projects slide (2×2 grid) |
| `featured project 4.png` | Featured Projects slide (2×2 grid) |

---

## Tech Stack Images

**Image Source**: `images/tech-stack/`
**Rule**: Embed each icon inline as base64 next to the tech name in the Tech Stack slide.

### Design
| Tech | Image File |
|------|-----------|
| Figma | `design/H1.png` |
| Motion | `design/Frame 2121455730.png` |
| After Effects | `design/Frame 2121455731.png` |
| Cinema 4D | `design/Frame 2121455136.png` |

### Frontend
| Tech | Image File |
|------|-----------|
| React | `front-end/Frame 2121455137.png` |
| Next.js | `front-end/Frame 2121455138.png` |
| Vue.js | `front-end/Logo.svg.png` |
| Angular | `front-end/angular_logo.svg.png` |

### Backend
| Tech | Image File |
|------|-----------|
| Python | `backend/Frame 2121455716.png` |
| Node.js | `backend/nodejs_logo.svg.png` |

### Mobile
| Tech | Image File |
|------|-----------|
| Flutter | `mobile/flutter_logo.svg.png` |
| React Native | `mobile/Frame 2121455717.png` |

### Infra
| Tech | Image File |
|------|-----------|
| AWS | `infra/amazon_web_services_logo.svg.png` |

---

## Client Logos

**Image Source**: `images/our-clients/`
**Rule**: Embed client logos inline as base64 in the Our Clients slide grid.

| Client | Image File |
|--------|-----------|
| Logo 1 | `Frame 2085664921.png` |
| Logo 2 | `Frame 2085666202.png` |
| Logo 3 | `Group 119520.png` |
| Logo 4 | `Group 1321316651.png` |
| Logo 5 | `Group 1321316653.png` |
| Logo 6 | `Group 1321317155.png` |
| Logo 7 | `Group 1321317156.png` |
| Logo 8 | `Group 1321317157.png` |
| Logo 9 | `Logo.png` |
| Logo 10 | `Mask group.png` |
| Silvara.AI | `Silvara.AI.png` |
| Logo 12 | `image 1131.png` |
| Logo 13 | `image 1132.png` |
| Logo 14 | `image 1133.png` |
| Logo 15 | `image 1133-1.png` |
| Logo 16 | `image 1135.png` |
| Logo 17 | `image 1137.png` |
| Logo 18 | `image 1138.png` |
| Logo 19 | `image 1138-1.png` |
| Logo 20 | `image 1139.png` |
| Logo 21 | `image 1140.png` |
| Logo 22 | `image 1141.png` |
| Logo 23 | `text.png` |

---

## Office Icons

**Image Source**: `images/offices/`
**Rule**: Embed office flag/icon SVGs inline for the Contact Us slide.

| Office | Image File |
|--------|-----------|
| HQ - South Korea | `HQ_-_South_Korea.svg` |
| USA | `USA.svg` |
| Bangladesh | `Bangladesh.svg` |

---

## Team Images

**Image Source**: `images/team-image/`
**Rule**: Only use a team member's image when their name is specifically mentioned in the proposal. Match the name from the filename.

### CEO & CTO
| Name | Image File |
|------|-----------|
| Shin Lukas Dongsub | `ceo-cto/Shin Lukas Dongsub CEO of Potential.png` |
| Siam Maruf | `ceo-cto/Siam Maruf CTO & Full-stack Team Lead.png` |

### Design Team
| Name | Image File |
|------|-----------|
| Nazirul Hoque | `design-team/Nazirul Hoque Team Leader.png` |
| Shamima Nasrin | `design-team/Shamima Nasrin Sr. UI UX Designer.png` |
| Md Forhad Alam | `design-team/Md Forhad Alam Sr. UI UX Designer.png` |
| MD Ahosan Habib | `design-team/MD Ahosan Habib Jr. UI UX Designer.png` |
| Abu MD Ehsan | `design-team/Abu MD Ehsan Jr. UI UX Designer.png` |
| Md Foysal Alam | `design-team/Md Foysal Alam Jr. UI UX Designer.png` |
| Redwanul Haque | `design-team/Redwanul Haque UI UX Designer.png` |
| Rukaiya Sharmeen | `design-team/Rukaiya Sharmeen Jr. UI UX Designer.png` |
| Tasfia | `design-team/Tasfia Jr. UI UX Designer.png` |
| MD Romjan | `design-team/MD Romjan 3D Motion Designer.png` |
| Mehedi Hasan | `design-team/Mehedi Hasan 3D Motion Designer.png` |
| Mosarrof Hossain | `design-team/Mosarrof Hossain 2D Motion Designer.png` |

### Full-Stack Team
| Name | Image File |
|------|-----------|
| Md Hossen Rana | `full-stack-team/Md Hossen Rana Assosiate Team Lead (Full Stack).png` |
| G M Zulkar Nine | `full-stack-team/G M Zulkar Nine Lead Backend Developer.png` |
| Atik Bhuiyan | `full-stack-team/Atik Bhuiyan Sr. Frontend developer.png` |
| Abdullah Al Nomaan | `full-stack-team/Abdullah Al Nomaan Full stack developer.png` |
| Shamim Hossain | `full-stack-team/Shamim Hossain Full stack developer.png` |
| Md. Mohibulla | `full-stack-team/Md. Mohibulla  Full stack developer.png` |
| Abdur Rahman | `full-stack-team/Abdur Rahman Senior Flutter Developer.png` |
| Muksitur Rahman | `full-stack-team/Muksitur Rahman  Flutter Developer.png` |
| Dolan Bairagi | `full-stack-team/Dolan Bairagi Backend Developer.png` |
| Hasan Al Mahmud | `full-stack-team/Hasan Al Mahmud Backend Developer.png` |
| Meherab Irfan | `full-stack-team/Meherab Irfan Backend Developer.png` |
| Talha Mahmud | `full-stack-team/Talha Mahmud Backend Developer.png` |
| Israt Jahan Rothy | `full-stack-team/Israt Jahan Rothy Jr. Frontend Developer.png` |
| Md. Tonmoy Khan | `full-stack-team/Md. Tonmoy Khan Jr. Frontend Developer.png` |
| Md. Zihad Hossion | `full-stack-team/Md. Zihad Hossion Jr. Frontend Developer.png` |
| Saiful Islam | `full-stack-team/Saiful Islam Jr. Frontend Developer.png` |

### Operations Team
| Name | Image File |
|------|-----------|
| Jayden | `operation-team/jayden Lead Project manager.png` |
| Riaz Uddin | `operation-team/Riaz Uddin Project & HR Manager.png` |
| Eddy | `operation-team/Eddy Project Manager.png` |
| Istimam Hossen Akib | `operation-team/Istimam Hossen Akib Project Manager.png` |
| Symon Barua | `operation-team/Symon Barua Project Manager.png` |
| Yasin Billah | `operation-team/Yasin Billah Project Manager.png` |
| Rahid Uddin Ahmed | `operation-team/Rahid Uddin Ahmed CEO Stuff.png` |

---

## Output Location

```
proposals/
├── PROP-[CLIENT]-[DATE]-ko.html
└── PROP-[CLIENT]-[DATE]-en.html
```

---

## Related Files

- **Template**: `templates/proposal-template.html`
- **Korean Content**: `prompts/content-korean.md`
- **English Content**: `prompts/content-english.md`
- **Guide**: `prompts/template-guide.md`

---

**Skill Status**: COMPLETE
**Output Format**: HTML (16:9 Full Screen)
**Languages**: Korean, English
