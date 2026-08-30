---
name: ACME Global
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin: 24px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-stakes enterprise environments, specifically tailored for global HR management. The aesthetic is **Corporate / Modern**, characterized by a restrained, "expensive" minimalism that prioritizes information density and clarity. It draws inspiration from the precision of modern developer tools—utilizing sharp lines, ample white space, and a systematic approach to hierarchy.

The brand personality is institutional yet technologically advanced. It avoids unnecessary flourishes, relying instead on perfect alignment, consistent rhythmic spacing, and high-quality typography to convey reliability. The goal is to evoke a sense of "quiet authority" where the interface recedes to let critical employee data and organizational structures take center stage.

## Colors

The palette is anchored by **Slate-900 (#0f172a)**, providing a deep, authoritative foundation for primary text and brand moments. The system operates primarily in a light mode to ensure maximum legibility and a clean, "document-like" feel.

- **Primary Blue (#2563eb):** Reserved strictly for primary Actions and CTAs. It provides a clear signal for progression.
- **Success Emerald (#10b981):** Used sparingly for "Active" statuses, positive growth metrics, and completion states.
- **Neutral Scale:** A comprehensive range of Slate grays (50-900) manages the UI's structural hierarchy. Backgrounds utilize Slate-50 for subtle sectioning, while Slate-200 is the standard for 1px borders.
- **Surface:** Pure white (#ffffff) is the default surface color to maintain a high-contrast, professional environment.

## Typography

This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian aesthetic. The type scale is intentionally compact to facilitate data-heavy HR dashboards.

A **tight leading** (line-height) is applied to keep related information clusters together, essential for table-based views and profile summaries. 
- **Headlines:** Use Semi-Bold (600) or Bold (700) weights with slight negative letter spacing to create a precise, "locked-in" appearance.
- **Body:** The 14px size is the workhorse of the system, optimized for long-form reading of policies and employee records.
- **Labels:** Small caps or increased letter spacing are used for secondary metadata (e.g., timestamps or small headings) to provide visual distinction without increasing size.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid Grid**. Content is housed in a centered container with a maximum width of 1440px, ensuring line lengths remain readable on ultra-wide monitors common in corporate offices.

- **Rhythm:** An 8px base grid is used, with 4px increments for micro-adjustments in components.
- **The 12-Column System:** Standard layouts utilize a 12-column grid with 16px gutters.
- **Desktop:** 24px outer margins and 24px vertical padding between sections.
- **Mobile/Tablet:** Gutters compress to 12px, and margins reduce to 16px. Content typically reflows into a single column, with horizontal navigation shifting to a bottom bar or a collapsed "hamburger" menu.

## Elevation & Depth

To maintain the restrained, professional aesthetic, this design system avoids heavy shadows. Depth is communicated primarily through **Tonal Layers** and **Low-contrast Outlines**.

- **Level 0 (Background):** Slate-50 or White.
- **Level 1 (Cards/Sections):** White surface with a 1px Slate-200 border. No shadow.
- **Level 2 (Dropdowns/Popovers):** White surface, 1px Slate-200 border, and a very subtle, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
- **Active State:** Elements may use a subtle inset shadow or a slightly darker background tint (Slate-100) to indicate they are pressed or selected.

## Shapes

The shape language is strictly **Soft (1)**. This translates to a standard **4px corner radius** for primary components like buttons, inputs, and cards.

- **Standard (4px):** Used for buttons, input fields, and small cards.
- **Large (8px):** Reserved for larger layout containers or modals.
- **Pill:** Only used for status badges and tags to distinguish them from interactive buttons.

This subtle rounding breaks the harshness of a pure 0px edge while retaining a disciplined, structured appearance that feels more professional than highly rounded "consumer" interfaces.

## Components

### Buttons
- **Primary:** Slate-900 background, White text. No border. High contrast.
- **Secondary/Outline:** White background, Slate-200 border, Slate-700 text.
- **CTA:** Primary Blue background. Used only for the "final" action in a flow.
- **Sizing:** Fixed heights (32px for small, 40px for default, 48px for large).

### Badges & Status
- Small, uppercase 11px text. 
- Backgrounds are 10% opacity of the status color (e.g., Emerald-100 background with Emerald-700 text for "Active"). 

### Input Fields
- 1px Slate-200 border. 
- Focus state: 1px Blue-600 border with a 2px soft Blue-100 outer glow.
- Labels are 12px Medium (500) weight, positioned 8px above the field.

### Select & Segmented Controls
- Segmented controls use a Slate-100 background "track" with a white, slightly elevated (1px shadow) active segment.
- Icons are 16px, using a "Regular" stroke weight to match the Inter typeface.

### Tables
- Essential for HR data. 
- Rows are 48px high. 
- Header row uses Slate-50 background and Slate-500, 12px uppercase text.
- 1px horizontal dividers only; no vertical borders.