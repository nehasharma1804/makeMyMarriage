---
name: Warm Architectural Modern
colors:
  surface: '#fff8f7'
  surface-dim: '#dfd8d8'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2f1'
  surface-container: '#f4ecec'
  surface-container-high: '#eee6e6'
  surface-container-highest: '#e8e1e0'
  on-surface: '#1e1b1b'
  on-surface-variant: '#534246'
  inverse-surface: '#333030'
  inverse-on-surface: '#f7efee'
  outline: '#867276'
  outline-variant: '#d8c1c5'
  surface-tint: '#94445d'
  primary: '#5a152f'
  on-primary: '#ffffff'
  primary-container: '#762c45'
  on-primary-container: '#f997b2'
  inverse-primary: '#ffb1c5'
  secondary: '#7b5902'
  on-secondary: '#ffffff'
  secondary-container: '#fdce73'
  on-secondary-container: '#775600'
  tertiary: '#243327'
  on-tertiary: '#ffffff'
  tertiary-container: '#3a4a3c'
  on-tertiary-container: '#a7b9a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3f001b'
  on-primary-fixed-variant: '#772d46'
  secondary-fixed: '#ffdea4'
  secondary-fixed-dim: '#eec067'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#d5e7d5'
  tertiary-fixed-dim: '#b9cbb9'
  on-tertiary-fixed: '#101f13'
  on-tertiary-fixed-variant: '#3a4b3d'
  background: '#fff8f7'
  on-background: '#1e1b1b'
  surface-variant: '#e8e1e0'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an editorial, high-trust digital environment tailored for collaborative Indian wedding management. The visual language balances the intimacy of family celebration with the rigorous utility of a modern enterprise-grade SaaS platform. It deliberately avoids traditional visual clichés—such as overpowering marigold saturation, ornate filigree, and metallic gold foil gradients—in favor of a contemporary, structural aesthetic influenced by modern Indo-saracenic architecture, generous negative space, and disciplined typography.

The emotional tone is calm, composed, and dependable. Wedding coordination involves multiple generations, disparate budgets, and complex multi-day timelines; the interface counters this inherent logistical chaos by functioning as a quiet, reassuring canvas. Subtle Indian architectural motifs, specifically soft multi-foil and jharokha-inspired arch framing, appear strictly as decorative masks for imagery and media containers, never as intrusive interface ornamentation.

## Colors

The palette is anchored by a warm architectural foundation. The background canvas uses an inviting warm ivory (`#FAF7F2`) rather than a sterile digital white, creating an editorial, tactile tone reminiscent of premium stationery. 

- **Primary (`#762C45`)**: A deep, sophisticated burgundy. Applied with strict restraint for key interaction triggers, active state indicators, primary actions, and hero metrics. It commands attention without introducing cognitive fatigue.
- **Secondary (`#C49A45`)**: A muted, matte turmeric/brass accent used sparingly for celebratory highlights, VIP guest badges, and milestone indicators. It provides warmth without simulated metallic luster or gradients.
- **Tertiary (`#5A6B5C`)**: A soft eucalyptus sage used for logistical confirmations, completed checklist items, and RSVP acceptances.
- **Neutral Canvas & Surfaces**: 
  - Application Background: `#FAF7F2`
  - Elevated Card Surface: `#FFFFFF`
  - Muted Surface / Secondary Containers: `#F3EFEA`
  - Subtle Borders & Dividers: `#E8E3DC`
- **Text & Content**: 
  - Primary Text: `#262323` (deep charcoal providing accessible contrast without the harshness of pure `#000000`)
  - Secondary Text: `#696363`
  - Subtle / Placeholder Text: `#9C9494`

## Typography

The design system relies on a single typographic family—Plus Jakarta Sans—to achieve clarity, geometric precision, and an approachable human warmth. Its clear apertures and wide proportions ensure legibility across multi-column data views such as budget matrices, multi-event itineraries, and guest seating charts.

- **Display & Headlines**: Emphasize architectural structure through subtle negative letter spacing and tight vertical metrics. Used sparingly for high-level dashboard summaries, event suite transitions, and couple names.
- **Body & Data**: Engineered for high-density readability. The base scale standardizes on `15px` (`body-md`) with a `24px` line-height to provide breathing room during sustained planning sessions.
- **Labels & Microcopy**: Form tags, table column headers, and status badges utilize `label-md` and uppercase `label-sm` with widened letter-spacing to delineate metadata from core content.

## Layout & Spacing

The layout is built upon an 8pt architectural rhythm, utilizing an adaptable fluid grid designed for desktop collaboration while scaling cleanly down to mobile viewports for on-the-go coordinators and family members.

- **Desktop (1024px+)**: 12-column grid with `1.5rem` (24px) gutters and max-width clamping at 1440px with `2rem` (32px) margins. Workspace views (e.g., Run of Show, Seating Allocations) utilize full-width split-pane viewports with pinned navigation rails.
- **Tablet (768px - 1023px)**: 8-column layout with `1.5rem` gutters. Multi-tier management panels collapse into tabbed segment controllers.
- **Mobile (Below 768px)**: 4-column layout with `1rem` (16px) gutters and `1rem` canvas margins. Complex tables shift into vertical card stacks with sticky floating action bars.

Whitespace must remain generous: cards feature internal padding governed by `space-lg` (24px), allowing financial and scheduling data to breathe against the warm `#FAF7F2` canvas.

## Elevation & Depth

Visual hierarchy is established primarily through tonal layering and low-contrast perimeter lines rather than heavy drop shadows. This preserves an editorial, non-distracting visual environment.

- **Flat/Subtle Boundary**: All cards, structural containers, and panels sit on pure `#FFFFFF` over `#FAF7F2`, bound by a 1px solid border of `#E8E3DC`.
- **Resting Elevation**: Elevated components (cards, vendor profile tiles) employ a warm-tinted ambient shadow: `box-shadow: 0 4px 20px -2px rgba(38, 35, 35, 0.04), 0 2px 6px -1px rgba(38, 35, 35, 0.02)`.
- **Interactive / Hover Elevation**: On hover or active drag, elements raise slightly: `box-shadow: 0 12px 28px -4px rgba(118, 44, 69, 0.07), 0 4px 10px -2px rgba(38, 35, 35, 0.03)`. The primary burgundy tint softens the transition and introduces brand warmth.
- **Overlays & Modals**: Bottom sheets and dialog modals use a deep charcoal backdrop scrim (`rgba(38, 35, 35, 0.4)` with 4px backdrop blur) accompanied by an ambient modal shadow: `box-shadow: 0 20px 40px -8px rgba(38, 35, 35, 0.16)`.

## Shapes

The design system uses a Level 2 (`0.5rem` base) shape structure. Standard container corners sit comfortably between `12px` and `16px`, providing an organic, warm contour that complements the Plus Jakarta Sans geometry without appearing childlike or overly pill-shaped.

- **Inputs, Buttons, and Tags**: Standardized at `8px` (`0.5rem`) for compact structural integrity.
- **Cards, Modals, and Surface Panels**: Standardized at `12px` to `16px` (`rounded-lg` to `rounded-xl`).
- **Architectural Arch Masks**: Specifically reserved for key celebratory media modules (e.g., the couple's hero banner, mood boards, and venue overview cards). These containers feature an upper border radius styling of `rounded-t-[80px]` or `rounded-t-full` paired with a flat bottom `rounded-b-none` or `rounded-b-lg`, mirroring traditional Indian arched alcoves.

## Components

### Buttons
- **Primary**: Solid deep burgundy (`#762C45`) fill with pure `#FFFFFF` text. Minimal `8px` corner radius. Hover state darkens to `#5E2236`. Pressed state: subtle scale down (`0.98`).
- **Secondary / Outline**: `#FFFFFF` background with a 1.5px border of `#E8E3DC`, `#262323` text. Hover transitions to `#FAF7F2` surface and `#762C45` border color.
- **Ghost**: Transparent background, `#762C45` text, used for secondary actions like "Add Sub-task" or "Download Invoice".

### Cards & Panels
- Resting on `#FFFFFF`, framed with a 1px border of `#E8E3DC` and resting ambient shadow.
- Interior layout separates header, body, and action footer with subtle divider lines (`#F3EFEA`).
- **Arch Photo Card**: For venue showcases and function intros, the top image frame adopts the signature architectural arch radius while the metadata card below retains standard 16px geometry.

### Inputs & Select Fields
- `#FFFFFF` surface with a crisp 1px `#E8E3DC` boundary. Height set to 44px for touch accessibility across family roles.
- Focus state switches border to `#762C45` with a 2px outer ring in `rgba(118, 44, 69, 0.12)`.
- Labels sit outside the field using `label-md` in `#262323` with secondary contextual hints in `#696363`.

### Chips & Badges
- **Status Tags**: RSVP Confirmed (`#EBF2EC` background, `#2C5E3B` text); RSVP Pending (`#FAF2E6` background, `#8A641B` text); RSVP Declined (`#F7EBEB` background, `#8C2E2E` text).
- **Function Filters**: Pill-shaped (`rounded-full`) toggle filters (e.g., "Mehendi", "Sangeet", "Pheras", "Reception") with soft warm-gray backgrounds (`#F3EFEA`), transitioning to solid `#762C45` text and tinted background (`rgba(118, 44, 69, 0.08)`) when selected.

### Checklists & Radio Buttons
- Custom circular radios and rounded-square (`4px` radius) checkboxes.
- Unchecked: `#FFFFFF` fill with 1.5px border of `#C5BEB5`.
- Checked: Solid `#762C45` fill with white iconography.

### Specialized Workflow Components
- **Multi-Event Timeline Tracker**: Horizontal rail using thin `#E8E3DC` tracks with burgundy node indicators denoting distinct wedding ceremonies.
- **Collaborative Family Permission Pill**: Compact user avatar stack with permission level badges ("Can Edit Budget", "View Only", "Ceremony Lead").
