---
name: Popcorn Time
description: A private, cinematic shared-tracking experience for what to watch together.
colors:
  nocturne-green: '#0f1412'
  screening-surface: '#1c211e'
  elevated-surface: '#262b29'
  screen-white: '#dfe4e0'
  quiet-sage: '#bbcabf'
  border-sage: '#3c4a42'
  outline-sage: '#86948a'
  screening-mint: '#4edea3'
  daylight-emerald: '#006c43'
  signal-success: '#67d99a'
  signal-warning: '#f0bd68'
  signal-info: '#91bac5'
  signal-error: '#ffb4ab'
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: '-0.055em'
  headline:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '2rem'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.33
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: '0.01em'
rounded:
  standard: '8px'
  poster-showcase: '24px'
spacing:
  compact: '8px'
  standard: '16px'
  roomy: '24px'
  section: '48px'
components:
  button-primary:
    backgroundColor: '{colors.screening-mint}'
    textColor: '#003824'
    rounded: '{rounded.standard}'
    padding: '0 24px'
    height: '46px'
  button-primary-hover:
    backgroundColor: '#6ffbbe'
  paper-surface:
    backgroundColor: '{colors.screening-surface}'
    rounded: '{rounded.standard}'
  navigation-item:
    rounded: '{rounded.standard}'
---

# Design System: Popcorn Time

## Overview

**Creative North Star: "The Quiet Screening Room"**

Popcorn Time should feel like settling into a private screening room: dark, calm, and focused on the next story rather than a loud entertainment feed. The interface gives each user an orderly place for a personal collection while making shared tracking feel deliberate and close-knit.

The visual system uses deep green-black surfaces, pale screen-like text, and one deliberate flash of Screening Mint. Components should feel tactile and expressive through clear states, a confident accent, and restrained ambient lift—not through visual noise or ornamental effects.

**Key Characteristics:**

- Cinematic darkness with an organic green cast rather than neutral black.
- Screening Mint reserved for decisive actions, active states, and meaningful progress.
- High-legibility Inter typography with compact, confident hierarchy.
- Border-led structure and soft ambient elevation for tactile interaction.

## Colors

The palette is a nocturnal green room with a deliberate daylight counterpart: dark enough for content to lead, and composed enough in light mode for actions to remain obvious and accessible.

### Primary

- **Screening Mint** (`#4edea3`): Contained primary actions, selected navigation, active tabs, notification counts, and focused interaction states in dark mode.
- **Daylight Emerald** (`#006c43`): Primary text, icons, outlined controls, and contained actions in light mode.

### Semantic Signals

- **Confirmation Green** (`#67d99a` dark / `#167a45` light): Success and affirmative completion; never use it to replace primary selection.
- **Projection Amber** (`#f0bd68` dark / `#8a5a00` light): Warnings requiring attention without the finality of an error.
- **Cool Cue** (`#91bac5` dark / `#276b7a` light): Informational messages and helpful system context.
- **Signal Error** (`#ffb4ab` dark / `#ba1a1a` light): Failures and destructive paths.

### Neutral

- **Nocturne Green** (`#0f1412`): Default dark canvas and full-page background.
- **Screening Surface** (`#1c211e`): Primary panels, sidebars, dialogs, and cards.
- **Elevated Surface** (`#262b29`): Higher-emphasis containers and layered states.
- **Screen White** (`#dfe4e0`): Primary text and high-emphasis icons.
- **Quiet Sage** (`#bbcabf`): Secondary copy and supporting metadata.
- **Border Sage** (`#3c4a42`): Structural borders and dividers in dark mode.
- **Outline Sage** (`#86948a`): Stronger outlines where a boundary needs to be found quickly.

**The Screening Mint Rule.** Use bright Screening Mint to communicate selection, progress, and a clear next action on the dark canvas. In light mode, use Daylight Emerald for foreground controls. Do not flood an entire screen with either color or introduce competing neon accents.

## Typography

**Display Font:** Inter, with system sans-serif fallbacks.

**Body Font:** Inter, with system sans-serif fallbacks.

**Character:** The type system is direct, compact, and screen-readable. Strong headings create cinematic focus while body copy remains practical for dense library and planning workflows.

### Hierarchy

- **Display** (800, responsive `2.5rem`–`4.25rem`, 1.05): Landing-page statements and rare high-impact moments.
- **Headline** (600, `2rem`, 1.25): Page-level task headings.
- **Title** (600, `1.5rem`, 1.33): Section and dialog titles.
- **Body** (400, `1rem`, 1.5): Descriptions and primary reading copy.
- **Label** (500, `0.875rem`, 1.43, `0.01em`): Buttons, navigation, filters, and compact metadata.

**The Screen-Readable Rule.** Keep labels in sentence case and let size and weight, not all-caps, create functional hierarchy.

## Layout

The authenticated product uses a fixed 254px desktop sidebar and a four-action mobile bottom navigation, with the remaining canvas left open for task content. Pages use responsive horizontal padding and centered containers for long-form or catalog work. The spacing rhythm is based on 8px increments, most often 8px, 16px, 24px, and larger 48px+ section gaps.

Cards and controls should group related actions tightly; major page regions should have enough negative space to make a media collection feel browsable rather than dashboard-dense. On mobile, navigation stays permanently reachable at the bottom and content reserves its height.

**Progressive disclosure:** Explore keeps search, media type, and sort in the main flow. Genre, year, and rating live in a right-side filter panel and surface only when a user chooses to refine the catalog. The filter trigger names its active count so the reduced interface never hides state.

## Elevation & Depth

The implemented system is border-led and flat at rest: MUI Paper has no shadow and relies on tonal layers plus `#3c4a42` borders. The chosen direction permits a soft ambient lift for interactive or transient surfaces, such as active cards, menus, and dialogs; it should be diffuse and subtle, never a hard floating-card effect.

**The Quiet Lift Rule.** Base surfaces remain calm and structurally bordered. Reserve ambient elevation for interaction, hierarchy changes, and temporary overlays.

## Shapes

The base form language uses an 8px radius, squared enough for an organized media tool but softened at touch targets and panels. Larger showcase containers may use a 24px radius. Borders are visible, thin, and sage-tinted; avoid glassmorphism, thick outlines, and extreme pillification outside naturally compact controls.

## Components

### Buttons

- **Character:** Decisive and tactile without becoming glossy.
- **Shape:** 8px corners with a 46px minimum height for primary landing actions.
- **Primary:** Screening Mint background with deep green text in dark mode; Daylight Emerald with white text in light mode; horizontal 24px padding.
- **Hover / Focus:** Dark primary hover brightens to `#6ffbbe`; light primary shifts toward `#3d956a`; focus uses a high-contrast outline in both modes.
- **Secondary / Outlined:** Use the surface context, Screen White text, and a Border Sage outline.

### Cards / Containers

- **Corner Style:** 8px in product workflows; 24px for the landing-page poster showcase.
- **Background:** Screening Surface by default, Elevated Surface for stronger grouping.
- **Shadow Strategy:** Flat with borders at rest; soft ambient lift only for active or transient states.
- **Border:** 1px Border Sage in dark mode.
- **Internal Padding:** Usually 16px to 24px.

### Inputs / Fields

- **Style:** Surface-backed controls with visible sage outlines and compact label typography.
- **Focus:** Make the active boundary unmistakable with Screening Mint; do not rely on a color-only status message.
- **Error / Disabled:** Use the dedicated error palette for validation, and the dedicated success, warning, and information palettes for status; reduce contrast deliberately for disabled controls while preserving readable labels.

### Navigation

- **Style:** Icon-plus-label sidebar items with an 8px radius and a compact vertical rhythm.
- **Active State:** Use the primary role for selected navigation and unread notification badges.
- **Responsive Treatment:** Fixed desktop sidebar above the task canvas; four core actions in fixed mobile bottom navigation, with overflow in a bottom drawer.

### Dialogs

- **Character:** A focused, private interruption rather than a new page.
- **Background:** Screening Surface with a structural border, clear title, and contained action list.
- **Use:** Account actions, private experiences, and decisions that should not break task context.

## Do's and Don'ts

### Do:

- **Do** use Nocturne Green and Screening Surface to keep media and task content visually calm.
- **Do** reserve Screening Mint for selection, progress, and actions that move a user forward.
- **Do** preserve 8px rounding, sage borders, and sentence-case Inter labels across product workflows.
- **Do** add only soft, diffuse elevation when an element becomes active, interactive, or transient.

### Don't:

- **Don't** turn the interface into a neon entertainment feed or compete with Screening Mint using unrelated bright accents.
- **Don't** hide structure by removing borders from every surface or piling hard shadows onto cards.
- **Don't** use all-caps controls, generic dashboard density, glassmorphism, or exaggerated pill shapes as a substitute for hierarchy.
