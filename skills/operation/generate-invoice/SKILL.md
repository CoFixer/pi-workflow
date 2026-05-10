---
name: generate-invoice
description: Generate software development invoices and quotations as PDF (Korean/English)
---

# Generate Invoice - 소프트웨어 개발 견적서/청구서 PDF 생성기

소프트웨어 개발 서비스를 위한 전문 견적서/청구서를 **PDF 형식**으로 생성합니다.

---

## Quick Start

### 견적서 PDF 생성

```bash
/generate-invoice "프로젝트명" --client "고객사명" --output invoices/INV-2024-001.pdf
```

### 예시

```bash
/generate-invoice "모바일 앱 개발" --client "ABC 주식회사" --total 50000000
```

---

## PDF Generation Workflow

### Step 1: HTML 템플릿 생성
HTML 템플릿의 `{{PLACEHOLDER}}` 값을 채워 `/tmp/invoice-temp.html`을 생성합니다.

> **Important**: 임시 HTML 파일은 반드시 `/tmp/` 폴더에 생성합니다. 프로젝트 폴더에 생성하지 마세요.

### Step 2: PDF 변환 (Playwright CLI 사용)

```bash
npx playwright pdf "file:///tmp/invoice-temp.html" "invoices/[견적서] {{PROJECT_NAME}}.pdf"
```

### Step 3: 임시 파일 정리

```bash
rm /tmp/invoice-temp.html
```

---

## 회사 정보 (Potential Inc)

| 항목 | 내용 |
|------|------|
| **회사명** | Potential Inc |
| **주소** | 서울시 신도림 핀포인트타워 1715 |
| **대표자** | 신동섭 |
| **사업자번호** | 491-81-02498 |
| **이메일** | contact@potentialai.com |
| **웹사이트** | https://potentialai.com |

---

## 기본 항목 구조

### 소프트웨어 개발 서비스 항목

| 번호 | 항목명 | 설명 |
|------|--------|------|
| 1 | **Frontend 개발** | 웹/앱 프론트엔드 개발, UI 구현, 반응형 디자인 |
| 2 | **Backend 개발** | 서버 개발, API 설계 및 구현, 데이터베이스 설계 |
| 3 | **UI/UX 디자인** | 사용자 경험 설계, UI 디자인, 프로토타이핑 |

### 추가 가능 항목

| 항목명 | 설명 |
|--------|------|
| **기획/PM** | 프로젝트 기획 및 관리 |
| **QA/테스트** | 품질 보증, 테스트 자동화 |
| **인프라/DevOps** | 클라우드 설정, CI/CD 구축 |
| **유지보수** | 월별/연간 유지보수 계약 |

---

## 세금 계산

### VAT (부가가치세) 10%

```
공급가액 = 항목 합계
부가세 = 공급가액 × 0.10
총액 = 공급가액 + 부가세
```

### 예시 계산

| 항목 | 금액 |
|------|------|
| Frontend 개발 | ₩15,000,000 |
| Backend 개발 | ₩20,000,000 |
| UI/UX 디자인 | ₩10,000,000 |
| **공급가액** | **₩45,000,000** |
| **부가세 (10%)** | **₩4,500,000** |
| **총액** | **₩49,500,000** |

---

## Brand Guidelines

> **Brand guidelines:** See `.pi/base/brand/BRAND_GUIDELINES.md` for the canonical color palette, typography, and logo rules.

This document uses the **Light Theme** palette. Key values for quick reference:

| Usage | Color | Hex |
|-------|-------|-----|
| Primary Accent | Purple | `#624DFF` |
| Headings | Dark Navy | `#050042` |
| Body Text | Slate | `#1e293b` |

### Typography

- **Korean**: Pretendard
- **English Headings**: Manrope 600-700 weight
- **English Body**: Inter 400-500 weight
- **Numbers**: `font-variant-numeric: tabular-nums` for financial alignment

---

## HTML Template (for PDF conversion)

**Important**: 견적서는 footer 없이 1페이지에 맞춰야 합니다. 입금 계좌, 유효기간 안내, 회사 footer는 포함하지 않습니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>견적서 - {{PROJECT_NAME}}</title>

  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

    :root {
      --primary: #624DFF;
      --heading: #050042;
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --bg: #ffffff;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 15mm 15mm;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.5;
      font-size: 10pt;
    }

    .invoice {
      max-width: 100%;
      padding: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary);
    }

    .logo svg {
      max-width: 140px;
      height: auto;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      font-size: 24pt;
      color: var(--heading);
      margin-bottom: 6px;
    }

    .invoice-number {
      color: var(--muted);
      font-size: 11pt;
      font-weight: 500;
    }

    .parties {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 24px;
    }

    .party {
      flex: 1;
    }

    .party h3 {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .party-name {
      font-size: 14pt;
      font-weight: 600;
      color: var(--heading);
      margin-bottom: 6px;
    }

    .party-details {
      font-size: 10pt;
      color: var(--text);
    }

    .party-details p {
      margin-bottom: 3px;
    }

    .project-info {
      margin-bottom: 14px;
      padding: 10px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .project-info h3 {
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      margin-bottom: 6px;
    }

    .project-info p {
      font-size: 14pt;
      font-weight: 600;
      color: var(--heading);
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .items-table th {
      background: #f8fafc;
      padding: 10px 12px;
      text-align: left;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }

    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }

    .items-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      font-size: 10pt;
    }

    .item-name {
      font-weight: 500;
    }

    .item-description {
      font-size: 9pt;
      color: var(--muted);
      margin-top: 3px;
    }

    .amount {
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }

    .totals {
      margin-left: auto;
      width: 260px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
      font-size: 10pt;
    }

    .total-row.grand-total {
      border-bottom: none;
      border-top: 2px solid var(--heading);
      margin-top: 6px;
      padding-top: 12px;
    }

    .total-label {
      color: var(--muted);
    }

    .total-value {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .grand-total .total-label,
    .grand-total .total-value {
      font-size: 14pt;
      color: var(--heading);
    }

  </style>
</head>
<body>
  <div class="invoice">
    <!-- Header with Logo -->
    <div class="header">
      <div class="logo">
        <svg width="140" height="62" viewBox="0 0 2000 883" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="2000" height="883" rx="100" fill="white"/>
          <path d="M1798.68 553V319.802H1845.89V553H1798.68Z" fill="#050042"/>
          <path d="M1734.05 384.88H1777.76V553H1734.05V534.497C1721.93 548.853 1704.39 557.147 1682.37 557.147C1633.88 557.147 1598.79 519.185 1598.79 469.1C1598.79 418.696 1633.88 383.923 1682.37 383.923C1704.39 383.923 1721.93 391.58 1734.05 405.297V384.88ZM1689.07 515.356C1714.91 515.356 1732.46 496.535 1732.46 469.1C1732.46 441.665 1714.91 422.524 1689.07 422.524C1663.87 422.524 1645.69 442.303 1645.69 469.1C1645.69 495.897 1663.87 515.356 1689.07 515.356Z" fill="#050042"/>
          <path d="M1562.14 360.316C1544.91 360.316 1531.19 347.875 1531.19 330.329C1531.19 313.103 1544.91 300.342 1562.14 300.342C1579.36 300.342 1592.76 313.103 1592.76 330.329C1592.76 347.875 1579.36 360.316 1562.14 360.316ZM1538.21 553V384.88H1585.42V553H1538.21Z" fill="#050042"/>
          <path d="M1500.79 553C1459 553 1437.62 528.117 1437.62 490.154V425.076H1408.91V384.88H1423.27C1434.75 384.88 1440.49 378.819 1440.49 366.697V340.538H1486.43V384.88H1527.26V425.076H1484.84V484.412C1484.84 502.277 1494.09 511.847 1510.68 511.847H1528.54V553H1500.79Z" fill="#050042"/>
          <path d="M1339.79 380.733C1379.99 380.733 1405.51 407.849 1405.51 447.088V553H1358.62V456.339C1358.62 434.965 1344.58 422.843 1325.44 422.843C1306.62 422.843 1291.94 436.241 1291.62 453.468V553H1244.41V384.88H1289.07V400.512C1300.56 388.708 1318.1 380.733 1339.79 380.733Z" fill="#050042"/>
          <path d="M1105.4 483.455C1110.82 505.467 1128.05 517.909 1150.38 517.909C1171.11 517.909 1181.64 510.571 1188.98 497.173L1225.03 521.099C1211.95 540.239 1190.25 557.147 1149.1 557.147C1094.55 557.147 1059.14 519.185 1059.14 469.1C1059.14 420.291 1097.74 381.052 1145.91 381.052C1200.14 381.052 1232.36 423.481 1232.36 465.591C1232.36 472.928 1232.05 479.308 1231.41 483.455H1105.4ZM1104.76 452.511H1188.02C1183.56 430.499 1168.88 416.782 1147.19 416.782C1125.5 416.782 1109.54 429.542 1104.76 452.511Z" fill="#050042"/>
          <path d="M1033.75 553C991.964 553 970.59 528.117 970.59 490.154V425.076H941.879V384.88H956.234C967.719 384.88 973.461 378.819 973.461 366.697V340.538H1019.4V384.88H1060.23V425.076H1017.8V484.412C1017.8 502.277 1027.06 511.847 1043.64 511.847H1061.51V553H1033.75Z" fill="#050042"/>
          <path d="M855.028 557.147C801.753 557.147 764.109 519.185 764.109 469.1C764.109 418.696 801.753 381.052 855.028 381.052C907.984 381.052 945.946 418.696 945.946 469.1C945.946 519.185 907.984 557.147 855.028 557.147ZM855.347 515.037C880.868 515.037 898.733 495.897 898.733 468.781C898.733 441.984 881.506 423.162 855.347 423.162C829.188 423.162 811.642 441.984 811.642 469.1C811.642 495.897 829.188 515.037 855.347 515.037Z" fill="#050042"/>
          <path d="M688.916 331.286C736.449 331.286 766.436 358.721 766.436 401.15C766.436 443.259 736.13 471.014 688.916 471.014H645.849V553H598.316V331.286H688.916ZM686.364 429.542C707.419 429.542 718.265 417.738 718.265 401.15C718.265 384.561 707.419 372.758 686.364 372.758H645.849V429.542H686.364Z" fill="#050042"/>
          <path d="M339.907 528.48H234.516C226.433 528.48 218.826 531.491 213.121 537.196C207.415 543.06 204.246 550.667 204.404 558.75C204.404 575.232 218.351 588.703 235.15 588.703H310.905C320.413 588.703 328.972 582.205 331.666 573.013L343.235 532.917C343.552 531.808 343.394 530.698 342.76 529.748C342.126 528.955 341.016 528.48 339.907 528.48Z" fill="#624DFF"/>
          <path d="M481.588 470.476H381.11C373.027 470.476 365.42 473.487 359.715 479.193C354.01 485.056 350.84 492.664 350.84 500.746C350.998 517.229 364.945 530.7 381.744 530.7H452.586C462.095 530.7 470.653 524.202 473.347 515.168L484.916 474.914C485.233 473.804 485.075 472.695 484.282 471.902C483.648 470.952 482.698 470.476 481.588 470.476Z" fill="#624DFF"/>
          <path d="M493.952 317.064C479.847 302.801 461.146 294.876 441.178 294.876H370.97C362.729 294.876 355.28 300.423 353.061 308.348L344.186 339.093C341.809 347.176 334.202 352.881 325.802 352.881H242.757C225.799 352.881 211.853 366.352 211.695 382.834C211.695 390.917 214.864 398.524 220.57 404.23C226.275 409.935 233.882 413.105 241.965 413.105H315.184C324.851 413.105 333.251 406.607 335.945 397.415L344.503 367.937C346.722 360.488 353.695 355.258 361.461 355.258H429.133C432.936 355.258 436.74 356.843 439.434 359.537C442.128 362.232 443.396 365.56 443.396 369.046C443.396 372.691 441.97 376.02 439.434 378.555C436.899 381.25 433.412 382.676 429.767 382.676H367.959C359.717 382.676 352.269 388.223 350.05 396.147L341.175 426.734C338.798 434.817 331.349 440.522 322.791 440.522H168.112C151.63 440.522 138 453.993 138 470.634C138 487.275 151.63 500.746 168.112 500.746H312.173C321.84 500.746 330.398 494.406 332.934 485.214L341.492 455.578C343.711 448.129 350.525 443.058 358.291 443.058H439.91C480.798 443.058 514.397 410.41 515.189 370.156C515.506 350.187 507.899 331.328 493.952 317.064Z" fill="#624DFF"/>
        </svg>
      </div>
      <div class="invoice-title">
        <h1>견적서</h1>
        <p class="invoice-number">No. {{YYYYMMDDNN}}</p>
        <p class="invoice-number">발행일: {{DATE}}</p>
      </div>
    </div>

    <!-- Parties -->
    <div class="parties">
      <div class="party">
        <h3>공급자</h3>
        <p class="party-name">Potential Inc</p>
        <div class="party-details">
          <p>서울시 신도림 핀포인트타워 1715</p>
          <p>대표자: 신동섭</p>
          <p>사업자번호: 491-81-02498</p>
          <p>contact@potentialai.com</p>
        </div>
      </div>
      <div class="party">
        <h3>공급받는자</h3>
        <p class="party-name">{{CLIENT_NAME}}</p>
        <div class="party-details">
          <p>{{CLIENT_ADDRESS}}</p>
          <p>담당자: {{CLIENT_CONTACT}}</p>
          <p>{{CLIENT_EMAIL}}</p>
        </div>
      </div>
    </div>

    <!-- Project Info -->
    <div class="project-info">
      <h3>프로젝트</h3>
      <p>{{PROJECT_NAME}}</p>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 35px;">No.</th>
          <th>항목</th>
          <th style="width: 60px;">수량</th>
          <th style="width: 100px;">단가</th>
          <th style="width: 120px;">금액</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <div class="item-name">Frontend 개발</div>
            <div class="item-description">웹/앱 프론트엔드 개발, UI 구현</div>
          </td>
          <td>1</td>
          <td class="amount">₩{{FRONTEND_PRICE}}</td>
          <td class="amount">₩{{FRONTEND_PRICE}}</td>
        </tr>
        <tr>
          <td>2</td>
          <td>
            <div class="item-name">Backend 개발</div>
            <div class="item-description">서버 개발, API 설계 및 구현</div>
          </td>
          <td>1</td>
          <td class="amount">₩{{BACKEND_PRICE}}</td>
          <td class="amount">₩{{BACKEND_PRICE}}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>
            <div class="item-name">UI/UX 디자인</div>
            <div class="item-description">사용자 경험 설계, UI 디자인</div>
          </td>
          <td>1</td>
          <td class="amount">₩{{UIUX_PRICE}}</td>
          <td class="amount">₩{{UIUX_PRICE}}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <span class="total-label">공급가액</span>
        <span class="total-value">₩{{SUBTOTAL}}</span>
      </div>
      <div class="total-row">
        <span class="total-label">부가세 (10%)</span>
        <span class="total-value">₩{{VAT}}</span>
      </div>
      <div class="total-row grand-total">
        <span class="total-label">총액</span>
        <span class="total-value">₩{{TOTAL}}</span>
      </div>
    </div>

  </div>
</body>
</html>
```

---

## Usage Examples

### 기본 사용

```
/generate-invoice "모바일 앱 MVP 개발"
  --client "테크스타트업 주식회사"
  --frontend 15000000
  --backend 20000000
  --uiux 10000000
```

### 생성되는 견적서 (PDF)

- 프로젝트: 모바일 앱 MVP 개발
- 공급가액: ₩45,000,000
- 부가세 (10%): ₩4,500,000
- **총액: ₩49,500,000**

---

## Output Location

생성된 견적서 PDF 저장 위치:

```
invoices/
├── [견적서] 모바일 앱 MVP 개발.pdf
├── [견적서] ABC 스타일 자사몰.pdf
└── [견적서] 관리자 대시보드.pdf
```

---

## Number Formatting

한국 원화 금액 포맷팅 함수:

```javascript
function formatKRW(amount) {
  return amount.toLocaleString('ko-KR');
}

// Example: formatKRW(45000000) → "45,000,000"
```

---

## PDF Generation Command

```bash
# Playwright CLI (recommended — no header/footer, clean single page)
# 임시 HTML은 /tmp에 생성, 최종 PDF만 invoices/에 저장
npx playwright pdf "file:///tmp/invoice-temp.html" "invoices/[견적서] {{PROJECT_NAME}}.pdf"
```

---

## 참고 사항

1. **견적서 번호 형식**: `YYYYMMDDXX` (XX = 00~99 랜덤, 예: 2026022613)
2. **PDF 최적화**: A4 1페이지에 맞춤 (footer 없음)
3. **PDF 도구**: Playwright CLI 사용 (`npx playwright pdf`)
4. **한글 폰트**: Pretendard 웹폰트 사용 (PDF 변환 시 자동 임베드)
5. **임시 파일**: `/tmp/invoice-temp.html`에 생성 (프로젝트 폴더 오염 방지)
6. **gitignore**: `invoices/` 폴더의 PDF 파일은 `.gitignore`로 추적 제외

---

## Related Files

- **Logo**: `.pi/base/templates/logo.svg`
- **Template Location**: `.pi/base/skills/operation/generate-invoice/`

---

**Skill Status**: COMPLETE
**Output Format**: PDF
**Language**: Korean (한국어)
