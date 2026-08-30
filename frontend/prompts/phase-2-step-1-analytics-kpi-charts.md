# Implementation Prompt: Phase 2 Step 1 — Top Section Analytics & KPI Visualizations ("How ACME Pays")

## 1. Goal & Scope
Implement the **"How ACME Pays"** analytics dashboard section with high-density enterprise aesthetic matching the design mockups in `2 how_acme_pays_analytics_dark_mode_high_density` and `2 how_acme_pays_analytics_light_mode_high_density`.

### Scope
1. **Analytics Data Hooks (`hooks/use-analytics.ts`)**:
   - `useAnalyticsSummary(currency)`: TanStack Query hook fetching summary KPI metrics (payroll total, mean salary, median salary, active headcount, status & currency breakdowns) with fallback to deterministic mock engine.
   - `useDepartmentAnalytics(currency)`: TanStack Query hook fetching department payroll spend, average pay, and headcounts.
   - `useCountryAnalytics(currency)`: TanStack Query hook fetching geographic compensation distribution.
2. **KPI Metrics Strip (`components/dashboard/kpi-metrics-strip.tsx`)**:
   - High-density 4-metric strip with dark/light theme tokens, hover animations, currency units, trend badges, and currency tag badges.
   - Micro-skeleton loaders during loading/currency transition states.
3. **Analytical Visualizations Row (`components/dashboard/compensation-charts.tsx`)**:
   - **Departmental Spend Card**: High-density horizontal bar breakdown with percentage bars, formatted currency values, run-rate subtitles, and interactive hover tooltips.
   - **Geographic Distribution Card**: Dual-bar spend vs. headcount comparison across international offices (US, UK, Germany, Canada, Nigeria, etc.) with custom legend and interactive tooltips.
4. **Dashboard Integration (`app/page.tsx`)**:
   - Connect the KPI Strip and Analytical Visualizations Row to live URL currency state (`useCurrency`).
   - Add section header and seamless dark/light responsive layout.

---

## 2. Skills & Code Inspected
- `.agents/skills/shadcn/` & `components/ui/` (card, skeleton, button, dropdown-menu primitives)
- `assesesment details/acme ui/2 how_acme_pays_analytics_dark_mode_high_density/code.html` (Dark mode layout & styling)
- `assesesment details/acme ui/2 how_acme_pays_analytics_light_mode_high_density/code.html` (Light mode layout & styling)
- `lib/mock-data.ts` (Analytics calculations: `getMockAnalyticsSummary`, `getMockDepartmentAnalytics`, `getMockCountryAnalytics`)
- `lib/utils.ts` (Currency formatting: `formatCurrency`, `convertCurrency`)
- `hooks/use-currency.ts` (URL currency state)
- `context/AGENTS.md` and `context/ui-context.md` (Design guidelines & color tokens)

---

## 3. Architectural Decisions & Assumptions
1. **Multi-Currency Normalization**: All analytical metrics dynamically recalculate based on the active global currency (`USD`, `EUR`, `GBP`) selected in the header.
2. **TanStack Query Caching & Fallback**: Custom hooks utilize React Query with `staleTime: 60_000` and gracefully fall back to the deterministic in-memory mock engine if the backend is unreachable.
3. **Precision Visualizations with Responsive Fallback**: Support both Recharts charts and high-density SVG/CSS visual meters matching the exact pixel proportions and typography of the design mockups.
4. **Dual Theme Harmony**: Ensure all borders, backgrounds, typography colors, and bar accents seamlessly adapt between Dark Mode (`acme_global_1`) and Light Mode (`acme_global_2`).

---

## 4. Files to Modify or Create
- `[NEW]` `hooks/use-analytics.ts`: TanStack Query hooks for analytics summary, departments, and countries.
- `[NEW]` `components/dashboard/kpi-metrics-strip.tsx`: 4-card high-density KPI metrics strip with skeleton loaders.
- `[NEW]` `components/dashboard/compensation-charts.tsx`: Departmental spend and geographic distribution visualization components.
- `[MODIFY]` `app/page.tsx`: Integrate the new analytics components and connect with `useCurrency`.
- `[MODIFY]` `context/progress-tracker.md`: Update Phase 2 Step 1 completion status.

---

## 5. Acceptance Criteria & Verification Checks
- [ ] 4 KPI cards render accurately with formatted currency and subtitle annotations.
- [ ] Changing currency via header switcher updates all KPI values, department numbers, and country totals instantaneously.
- [ ] Departmental Spend displays sorted departments with proportional bar meters and hover value tags.
- [ ] Geographic Distribution displays dual spend & headcount bars with country breakdowns.
- [ ] Dark Mode and Light Mode render with crisp contrast and no style artifacts.
- [ ] `npm run lint` and `npm run build` pass with zero errors.

---

## 6. Manual Test Steps
1. Navigate to `/` and verify the "How ACME Pays" section renders the 4 KPI cards and 2 analytical charts.
2. Switch currency between `USD`, `EUR`, and `GBP` via the global header dropdown; verify numbers and currency indicators refresh immediately.
3. Toggle between Dark and Light mode via the theme toggle; verify background contrast, borders, and bar colors.
4. Hover over department bars and country metrics to inspect micro-interactions.
