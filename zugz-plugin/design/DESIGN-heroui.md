---
version: alpha
name: HeroUI Analysis
description: An analysis of HeroUI's design language — a clean, modern, and accessible design system based on Tailwind CSS. It features vibrant colors (especially the signature HeroUI blue), soft shadows, smooth transitions, and distinct border radii scales.

colors:
  primary: "#006fee"
  primary-active: "#005bc4"
  secondary: "#9353d3"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f4f4f5"
  surface: "#ffffff"
  ink: "#111827"
  ink-secondary: "#3f3f46"
  ink-muted: "#71717a"
  ink-faint: "#a1a1aa"
  hairline: "#e4e4e7"
  accent-blue: "#006fee"
  accent-purple: "#9353d3"
  accent-green: "#17c964"
  accent-yellow: "#f5a524"
  accent-red: "#f31260"

typography:
  display-1:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -1.5px
  display-2:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -1px
  heading-1:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.75px
  heading-2:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.5px
  heading-3:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.25px
  title:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0
  body-md:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  button:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: 0
  caption:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  eyebrow:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 1px

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

components:
  nav-bar:
    backgroundColor: "rgba(255, 255, 255, 0.8)"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 16px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
  button-primary-pressed:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
  button-utility:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  button-icon-circular:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  badge-pill:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  feature-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
  card-content:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
  text-input:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  divider-hairline:
    borderColor: "{colors.hairline}"
  footer:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
    padding: 32px 16px

  # Examples (for downstream preview/deriving)
  ex-pricing-tier:
    description: "Default Pricing tier card."
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-pricing-tier-featured:
    description: "Featured pricing tier card."
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-product-selector:
    description: "Product selector / features block."
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-cart-drawer:
    description: "Cart summary drawer content."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    item-divider: "{colors.hairline}"
  ex-app-shell-row:
    description: "Sidebar nav item."
    backgroundColor: "{colors.surface}"
    activeIndicator: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
  ex-data-table-cell:
    description: "Table cell definition."
    headerBackground: "{colors.canvas-soft}"
    headerTypography: "{typography.eyebrow}"
    bodyTypography: "{typography.body-sm}"
    cellPadding: "{spacing.xs} {spacing.sm}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    description: "Auth form card."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-modal-card:
    description: "Modal dialog container."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-empty-state-card:
    description: "Empty state card block."
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
    captionTypography: "{typography.body-md}"
  ex-toast:
    description: "Toast notification alert box."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
    typography: "{typography.body-sm}"
---

## Overview

HeroUI is a modern React UI library based on Tailwind CSS. It is characterized by vibrant colors (especially its signature primary blue), clean typography, smooth transitions, and distinct border radii scales.

### Key Characteristics:
- Vibrant, highly-saturated default color palette (signature blue primary `#006fee`).
- Responsive defaults built around Tailwind CSS layout constructs.
- Smooth component corner scaling (xs, sm, md, lg, xl, full).
- High visual contrast, readable Inter-driven typography.
- Standard shadow-driven elevation states.

## Do's and Don'ts

### Do
- Use the default HeroUI blue (`#006fee`) for primary actions.
- Keep typography crisp, utilizing system sans-serif or Inter family.
- Apply standard container padding matches Tailwind specs.

### Don't
- Mix high-density custom overrides with native HeroUI layout scales.
- Hardcode custom shadows that deviate from the standard Tailwind/HeroUI shadows.
