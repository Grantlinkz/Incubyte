---
name: ACME Global
colors:
  surface: '#0f172a'
  surface-dim: '#051424'
  surface-bright: '#334155'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#1e293b'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#334155'
  outline-variant: '#1e293b'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#001c10'
  on-tertiary-container: '#009365'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
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
The design system for ACME Global transitions into a high-contrast dark mode while maintaining its core identity as an "expensive enterprise" platform. The aesthetic is **Corporate / Modern**, leaning into the precision and depth of a midnight palette. By moving from a light-document feel to a deep-space interface, the system evokes a sense of technical mastery and high-stakes reliability.

The dark mode implementation focuses on "quiet authority." It utilizes a hierarchy of darkness to organize information, ensuring that the interface feels expansive yet structured. The brand personality remains institutional and global, prioritizing data density and clarity above all else. The visual style avoids vibrant gradients, opting instead for a disciplined application of slate tones and sharp, purposeful borders that frame the critical HR data.

## Colors
The palette is centered around a deep charcoal/slate base (**#0f172a**), providing a high-contrast foundation that reduces eye strain while maintaining a premium feel.

- **Surface Layers:** The background utilizes the seed slate. Higher level containers (cards, sidebars) use **Slate-800 (#1e293b)** to create a perceptible lift.
- **Primary Actions:** In dark mode, the primary action remains authoritative, using white or high-contrast slate to stand out against the dark canvas.
- **Secondary Blue:** A refined **#3b82f6** is used for interactive elements and primary CTAs, ensuring visibility against the deep background.
- **Typography & Icons:** The "On-Surface" color is set to **#f8fafc** for maximum legibility, while secondary information uses **#94a3b8** to maintain visual hierarchy.
- **Borders:** 1px borders in **#334155** replace the light-mode dividers, providing structural definition without overwhelming the content.

## Typography
The typography system remains powered by **Inter**, emphasizing its utilitarian and systematic nature. In this dark mode environment, the negative space between characters and lines is vital for readability.

- **Legibility:** White-on-dark text can often appear "thicker" than dark-on-light. As such, weights are carefully managed to avoid visual bleeding.
- **Headlines:** Use Bold and Semi-Bold weights to anchor pages. The tight negative letter spacing is preserved to give titles a structured, architectural feel.
- **Body & Data:** The 14px size is the primary standard for HR data, ensuring that large volumes of information remain scannable. 
- **Small Caps & Labels:** Labels for metadata use a slightly higher letter spacing to ensure that small-font text remains distinct and clear against the deep slate surfaces.

## Layout & Spacing
This design system utilizes a **Fixed-Fluid Hybrid Grid** to ensure data density is optimized for enterprise screens. 

- **The Grid:** A 12-column system with 16px gutters allows for complex dashboard layouts. The content is capped at a 1440px container-max width to prevent excessive line lengths.
- **Rhythm:** An 8px spacing system governs the vertical rhythm, with 4px micro-increments used within components like input fields and button groups.
- **Sectioning:** Vertical padding of 24px is standard between major content sections, creating a clear "row-based" scan path for the user.
- **Adaptation:** On mobile devices, margins reduce to 16px and gutters to 12px. The multi-column layouts reflow into a single column, prioritizing vertical scrolling for long employee lists or policy documents.

## Elevation & Depth
Elevation in the dark mode variant is achieved through **Tonal Layers** and **Low-contrast Outlines** rather than traditional shadows, which can look "dirty" on deep slate backgrounds.

- **Level 0 (Background):** Slate-950 (#0f172a).
- **Level 1 (Cards/Surface):** Slate-900 (#1e293b) with a 1px Slate-800 border. This creates a subtle separation from the background.
- **Level 2 (Popovers/Modals):** Slate-800 (#334155) with a 1px Slate-700 border. A very subtle, high-spread shadow (`rgba(0, 0, 0, 0.4)`) may be used only to separate floating elements from the surface layers.
- **Interaction:** Hover states on interactive cards should transition the background color slightly lighter (e.g., from Slate-900 to Slate-850) rather than changing the border, maintaining a sophisticated "glow" effect.

## Shapes
The shape language follows a **Soft (1)** logic. This 4px base radius provides enough softness to feel modern while maintaining the rigid discipline required for a global HR tool.

- **4px (Standard):** Primary for buttons, input fields, and tags.
- **8px (Large):** Used for cards and content containers.
- **12px (Extra Large):** Reserved for global modals and main dashboard panels.
- **Pill:** Applied only to status indicators (e.g., "Active", "On Leave") to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Pure White background with Slate-950 text. Bold and high-contrast.
- **Secondary:** Slate-800 background with a 1px Slate-700 border. White text.
- **CTA:** Primary Blue (#3b82f6) background with White text.

### Input Fields
- **Surface:** Slate-900 background with a 1px Slate-700 border.
- **Focus:** Border changes to Blue-500 with a subtle Blue-500/20 outer glow.
- **Labels:** 12px Medium weight, appearing 8px above the input in Slate-400.

### Tables
- **Header:** Slate-800 background, 12px uppercase Slate-400 text.
- **Rows:** Slate-950 background with a 1px horizontal border in Slate-800. Row height fixed at 48px.
- **Selection:** Selected rows use a subtle Slate-800 tint to indicate the active state.

### Chips & Badges
- **Status:** 10% opacity of the status color for the background, with the full-strength color for the text (e.g., Green-500 text on a Green-500/10 background). 

### Cards
- Standard containers use the Slate-900 surface with a 1px Slate-800 border. This "ghost border" approach keeps the UI looking crisp and expensive without the heaviness of thick lines.