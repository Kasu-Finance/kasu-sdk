# Risk Reporting Implementation Progress

This document tracks the implementation progress of the Risk Reporting page styling based on Figma designs.

## Overview

Three different funding types have slightly different UI and labeling:

1. **Tax Pay** (Taxation Funding)
2. **Whole Ledger** (Whole Ledger Funding)
3. **Professional Fee** (Professional Fee Funding)

---

## Section 1: Summary Dashboard

### Status: ✅ Complete

### Label Differences by Funding Type

| KPI Card | Tax Pay              | Whole Ledger                     | Professional Fee                  |
| -------- | -------------------- | -------------------------------- | --------------------------------- |
| Card 1   | Total Tax Paid       | Total WIP & Outstanding Invoices | Total Outstanding Invoices        |
| Card 2   | Total Tax Funding    | Total Current Ledger Funding     | Total Outstanding Invoices Funded |
| Card 3   | Advance Rate         | Advance Rate                     | Advance Rate                      |
| Card 4   | Current Arrears ($)  | Current Arrears ($)              | Current Arrears ($)               |
| Card 5   | Current Arrears (%)  | Current Arrears (%)              | Current Arrears (%)               |
| Card 6   | Historical Loss Rate | Historical Loss Rate             | Historical Loss Rate              |

### Implementation Notes

- [x] Basic KPI card styling (height 116px, padding, typography)
- [x] Grid layout (3 columns, 32px gap)
- [x] Dynamic labels based on funding type
- [x] Pass funding type to component for conditional labels
- [x] Removed Borrowers Distribution chart (not part of this section per Figma)

### Files to Modify

- `src/components/organisms/lending/RiskReportingTab/SummaryDashboard/index.tsx`
- `src/components/organisms/lending/RiskReportingTab/index.tsx` (pass funding type)

---

## Section 2: Duration/Borrower Schedule Table

### Status: ✅ Complete

### Section Title by Funding Type

| Funding Type     | Section Title     |
| ---------------- | ----------------- |
| Tax Pay          | Duration Schedule |
| Whole Ledger     | Borrower Schedule |
| Professional Fee | Duration Schedule |

### Column Differences by Funding Type

- **Tax Pay**: Monthly buckets (12 mos → 1 mo), columns: Borrower ID, [months], Total Funding, Portion of Arrears
- **Whole Ledger**: Day-based buckets (0-30, 31-60, 61-90, 91-120, 121-150, 151-180, 181+ Days)
- **Professional Fee**: Monthly buckets (12 mos → 0 mos)

### Figma Styling (from CSS export)

- Header: height 80px, padding 24px 16px, background #28282A
- Title: Barlow Condensed, 32px, 500 weight, #CDA370
- Table header row: height 100px, padding 24px 16px
- Cell backgrounds: Gradient from #FDF8F0 (lightest) to #C69B6E (darkest)
- Footer row: Different gradient from #EEE0CA (lightest) to #A87A49 (darkest)
- Total Funding column: Dark background (#5B5B60), white text
- Row height: 50px
- Font: Open Sans, 12px

### Implementation Notes

- [x] Basic table structure
- [x] Dynamic section title based on funding type
- [x] Proper column headers (dynamic from agingBuckets)
- [x] Cell background color gradient (heatmap style)
- [x] Total Funding column with dark styling
- [ ] Portion of Arrears column with bar indicator (not yet implemented - requires additional data)

### Files Modified

- `src/components/organisms/lending/RiskReportingTab/BorrowerSchedule/index.tsx` - Added reportType prop and dynamic title
- `src/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableHeader.tsx` - Updated styling
- `src/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableBody.tsx` - Added heatmap colors
- `src/components/organisms/lending/RiskReportingTab/BorrowerSchedule/BorrowerScheduleTableFooter.tsx` - Added footer heatmap colors
- `src/components/organisms/lending/RiskReportingTab/index.tsx` - Pass reportType to BorrowerSchedule

---

## Section 3: Arrears Charts

### Status: ✅ Complete

### Components

- Tax Pay Loans / Whole Ledger / Professional Fee - Arrears Schedule (pie chart with legend)
- Portion of Arrears (stacked bar chart)

### Section Title by Funding Type

| Funding Type     | Arrears Schedule Title              |
| ---------------- | ----------------------------------- |
| Tax Pay          | Tax Pay Loans - Arrears Schedule    |
| Whole Ledger     | Whole Ledger - Arrears Schedule     |
| Professional Fee | Professional Fee - Arrears Schedule |

### Figma Styling (from CSS export)

- Card: White background (#FFFFFF), box-shadow, border-radius 8px, padding 16px
- No card header (unlike other sections)
- Section titles: Barlow Condensed, 24px, 500 weight, #28282A with underline
- Pie chart: 210x210px, 12-color gradient from #F7F1E5 to #A47643
- Legend: Two columns, 32x16px color chips with rounded corners
- Stacked bar chart: Y-axis 0-100%, dashed grid lines (#C6C6C6)
- Bar colors: Current Funding #F9E0BB, Arrears #A47B4F

### Implementation Notes

- [x] Dynamic chart title based on funding type
- [x] Pie chart with 12-color gradient matching Figma
- [x] Two-column legend layout
- [x] Stacked bar chart for Portion of Arrears (replaced pie chart)
- [x] White card without dark header
- [x] Proper typography styling

### Files Modified

- `src/components/organisms/lending/RiskReportingTab/ArrearsCharts/index.tsx` - Updated card styling, added reportType prop
- `src/components/organisms/lending/RiskReportingTab/ArrearsCharts/ArrearsScheduleChart.tsx` - Updated colors and layout
- `src/components/organisms/lending/RiskReportingTab/ArrearsCharts/PortionOfArrearsChart.tsx` - Changed to stacked bar chart
- `src/components/organisms/lending/RiskReportingTab/index.tsx` - Pass reportType to ArrearsCharts

---

## Section 4: DTI Concentration Risk Table

### Status: ✅ Complete (Mock Data)

### Data Status

- No DTI concentration data in current JSON report
- Using mock data for UI development
- Per-column "N/A" badges indicate missing data
- Column selector panel allows showing/hiding columns

### Column Labels by Funding Type

| Column | Tax Pay                                      | Whole Ledger          | Professional Fee         |
| ------ | -------------------------------------------- | --------------------- | ------------------------ |
| Col 1  | DTI Range                                    | DTI Range             | DTI Range                |
| Col 2  | Total Tax Funding                            | Total Ledger Funding  | Total Invoice Funding    |
| Col 3  | Tax Pay Loans Outstanding ($)                | Loans Outstanding ($) | Invoices Outstanding ($) |
| Col 4  | DTI (%)                                      | DTI (%)               | DTI (%)                  |
| Col 5  | % Taxes Funded                               | % Funded              | % Invoices Funded        |
| Col 6  | DTI+Exposure Weighted Concentration Risk (%) | Same                  | Same                     |

### Risk Level Colors (from Figma)

- Low: #B9DA35 (Green)
- Moderate: #FFDC22 (Yellow)
- High: #FF9921 (Orange)
- Critical: #F1431C (Red)

### Figma Styling

- Header: Dark background (#28282A), Barlow Condensed 32px, gold text (#CDA370)
- Table rows: 50px height, dotted border separator
- Risk indicator: 9x42px colored bar on the left of concentration risk column

### Files Created

- `src/components/organisms/lending/RiskReportingTab/DTIConcentrationTable/index.tsx`

### Files Modified

- `src/components/organisms/lending/RiskReportingTab/index.tsx` - Added DTIConcentrationTable

---

## Section 5: Credit Risk Metrics

### Status: ✅ Complete (Real Data + Some N/A)

### Data Status

- Uses real borrower data from JSON report
- Per-column "N/A" badges indicate which columns have missing/unavailable data
- Column selector panel allows showing/hiding columns

### Available Columns (with visibility toggle)

**Columns with REAL data:**

1. Customer (borrowerId) - always visible
2. Current Funding ($) - default visible
3. Loans Outstanding ($) - default visible
4. Average Loan Duration (Months) - default visible
5. Loans Funded (Lifetime) ($) - default visible
6. Recovery Action ($) - default hidden
7. Unrealised Loss Rate (%) - default hidden
8. Historical Loss Rate (%) - default visible
9. Total Repayments (Lifetime) ($) - default visible

**Columns with N/A (not in JSON):** 10. Total Annual Turnover ($) - default hidden (data exists but usually 0)
11. Outstanding Taxes/Invoices ($) - default visible (marked N/A) 12. DTI (%) - default hidden 13. % Funded (%) - default hidden 14. DSCR - default hidden 15. Minimum Covenant ($) - default hidden 16. Borrower Concentration Risk (%) - default hidden

### Figma Styling

- Dark header (#28282A), gold title (#CDA370)
- White table body, dotted row separators
- Last rows (Total/Average) have gray background (#F4F4F4)
- All columns 114px width except Customer (120px)
- Column selector panel: gold background (#C4996C), 24px border radius, checkboxes with gold/dark styling

### Files Created

- `src/components/organisms/lending/RiskReportingTab/CreditRiskMetricsTable/index.tsx` (client component)

### Files Modified

- `src/components/organisms/lending/RiskReportingTab/index.tsx` - Added CreditRiskMetricsTable

---

## Section 6: Historical Charts

### Status: ⏳ Pending (Missing Data)

- Unhedged Loans
- Historical Loss Rate
- Expected Value at Risk

---

## Progress Log

| Date       | Section                    | Change                                                                            |
| ---------- | -------------------------- | --------------------------------------------------------------------------------- |
| 2025-01-27 | Summary Dashboard          | Initial implementation with static labels                                         |
| 2025-01-27 | Summary Dashboard          | Updated styling to match Figma (card height, padding, typography)                 |
| 2025-01-27 | Summary Dashboard          | Added dynamic labels based on funding type (taxPay, wholeLedger, professionalFee) |
| 2025-01-27 | Summary Dashboard          | Removed Borrowers Distribution chart (not in Figma for this section)              |
| 2025-01-27 | Summary Dashboard          | ✅ Section complete                                                               |
| 2025-01-27 | Duration/Borrower Schedule | Added dynamic section title (Duration Schedule vs Borrower Schedule)              |
| 2025-01-27 | Duration/Borrower Schedule | Implemented heatmap cell background colors from Figma CSS                         |
| 2025-01-27 | Duration/Borrower Schedule | Styled Total Funding column with dark background (#5B5B60)                        |
| 2025-01-27 | Duration/Borrower Schedule | Removed Current Funding column (not in Figma design)                              |
| 2025-01-27 | Duration/Borrower Schedule | ✅ Section complete (except Portion of Arrears indicator)                         |
| 2025-01-27 | Arrears Charts             | Removed dark card header, using white Paper with shadow                           |
| 2025-01-27 | Arrears Charts             | Added dynamic title based on funding type                                         |
| 2025-01-27 | Arrears Charts             | Updated pie chart colors to 12-color Figma gradient                               |
| 2025-01-27 | Arrears Charts             | Created two-column legend layout                                                  |
| 2025-01-27 | Arrears Charts             | Changed Portion of Arrears from pie to stacked bar chart                          |
| 2025-01-27 | Arrears Charts             | ✅ Section complete                                                               |
| 2025-01-28 | DTI Concentration          | Created component with mock data                                                  |
| 2025-01-28 | DTI Concentration          | Added MISSING_DATA badge to header                                                |
| 2025-01-28 | DTI Concentration          | Implemented risk level color indicators                                           |
| 2025-01-28 | DTI Concentration          | ✅ Section complete (pending real data)                                           |
| 2025-01-28 | Credit Risk Metrics        | Created component with mock data                                                  |
| 2025-01-28 | Credit Risk Metrics        | Added MISSING_DATA badge to header                                                |
| 2025-01-28 | Credit Risk Metrics        | Implemented 9-column table with Total/Average rows                                |
| 2025-01-28 | Credit Risk Metrics        | ✅ Section complete (pending real data)                                           |
| 2025-01-28 | DTI Concentration          | Replaced section-level MISSING_DATA badge with per-column N/A indicators          |
| 2025-01-28 | DTI Concentration          | Added column selector panel with checkboxes                                       |
| 2025-01-28 | Credit Risk Metrics        | Replaced section-level MISSING_DATA badge with per-column N/A indicators          |
| 2025-01-28 | Credit Risk Metrics        | Added column selector panel (11 toggleable columns)                               |
| 2025-01-28 | Credit Risk Metrics        | Updated to client component for state management                                  |
| 2025-01-28 | Credit Risk Metrics        | Wired up to real borrower data from JSON                                          |
| 2025-01-28 | Credit Risk Metrics        | 9 columns now use real data, 7 columns show N/A                                   |
