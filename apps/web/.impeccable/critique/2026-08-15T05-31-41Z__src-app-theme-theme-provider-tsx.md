---
target: colorization and palette
total_score: 23
max_score: 40
na_heuristics:
p0_count: 1
p1_count: 3
timestamp: 2026-08-15T05-31-41Z
slug: src-app-theme-theme-provider-tsx
---

Method: dual-agent (A: /root/color_design_review · B: /root/color_detector_review)

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                           |
| --------- | ------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 2/4       | Semantic status roles are incomplete.                                               |
| 2         | Match System / Real World       | 2/4       | Light mode breaks the screening-room promise.                                       |
| 3         | User Control and Freedom        | 3/4       | Theme selection exists, but light mode is materially weaker.                        |
| 4         | Consistency and Standards       | 2/4       | State colors and light tokens are partly automatic or inline.                       |
| 5         | Error Prevention                | 2/4       | No explicit state scale protects consistent feedback.                               |
| 6         | Recognition Rather Than Recall  | 2/4       | Mint is asked to mean too many adjacent things.                                     |
| 7         | Flexibility and Efficiency      | 2/4       | Elevated, focus, selected, disabled, and semantic roles are not first-class tokens. |
| 8         | Aesthetic and Minimalist Design | 3/4       | Dark palette is restrained; light mode and duplicate greens dilute it.              |
| 9         | Error Recovery                  | 2/4       | Error is owned, but information, warning, and success are generic.                  |
| 10        | Help and Documentation          | 3/4       | DESIGN.md is clear, but its color roles are not fully encoded.                      |
| **Total** |                                 | **23/40** | **Needs targeted color-system work**                                                |

## Design Specificity Verdict

The dark theme is authored for Popcorn Time: green-black surfaces and one decisive mint signal create a private, cinematic environment that gives posters room to lead. Light mode is category-interchangeable, with a bright mint that loses foreground contrast on pale surfaces.

The detector found no structural violations in the centralized theme file. Source evidence still identified unused semantic roles, inline light-mode literals, an unconditional bright hover color, and missing semantic status scales. Browser inspection was unavailable because no browser binding was available; direct source inspection and contrast calculations were used as fallback.

## Overall Impression

The product already has the right color world. It should deepen that commitment, not add more hues: fix light-mode semantics, give feedback states their own quiet vocabulary, and keep Screening Mint scarce.

## What's Working

- The dark neutral ladder (`#0f1412`, `#1c211e`, `#262b29`) feels cinematic without becoming neutral-black generic.
- Primary CTA contrast is robust: Screening Mint on its deep green text is approximately 7.73:1.
- Restraint lets poster art supply emotional variety instead of competing with it through decorative interface color.

## Priority Issues

### [P0] Mint fails as foreground color in light mode

**Why it matters:** `#4edea3` against the pale `#dfe4e0` default background is approximately 1.33:1. Links, text buttons, and icons can become difficult to perceive.

**Fix:** Define a deeper light-mode emerald for foreground and outlined states, while reserving bright mint for contained surfaces; alternatively, make dark the only supported presentation until a complete daylight palette exists.

**Suggested command:** `$impeccable colorize`

### [P1] System mode can contradict the brand promise

**Why it matters:** System mode often resolves to a pale canvas although the product’s visual contract is a private screening room.

**Fix:** Default to dark mode or design a daylight palette that retains the same calm, cinematic hierarchy rather than merely inverting surfaces.

**Suggested command:** `$impeccable colorize`

### [P1] Semantic colors are not fully owned

**Why it matters:** Success, warning, and info currently inherit stock MUI behavior, so reassurance, warnings, and failures can feel imported from another product.

**Fix:** Define restrained scales for success, warning, info, and error. Keep mint for primary action/selection; use a quieter completion green, muted amber, and desaturated cool-sage information role.

**Suggested command:** `$impeccable colorize`

### [P1] Secondary is too close to primary

**Why it matters:** `#4edea3` and `#4de082` are both loud greens with no reliable functional distinction.

**Fix:** Remove the secondary role until it has a distinct job, or make it materially quieter and reserve it for affirmative completion.

**Suggested command:** `$impeccable distill`

### [P2] State and elevation roles are not encoded consistently

**Why it matters:** `surfaceHigh` and `outline` are declared but unavailable through MUI semantics; selected, focus, disabled, and hover values can drift into ad hoc component choices.

**Fix:** Expose named state roles and explicitly assign MUI shades/overrides for interaction states.

**Suggested command:** `$impeccable harden`

## Persona Red Flags

**Jordan (first-time family organizer):** In system-light mode, mint branding and primary icon signals can disappear against the pale canvas at the moment the landing page should establish confidence.

**Maya (low-vision mobile user):** Bright mint text and icons on light surfaces fail normal-text contrast, forcing reliance on position instead of clear perception.

**Alex (returning power user):** Pending, selected navigation, unread count, rating accent, and positive status do not have rigid enough semantic assignments for rapid scanning.

## Minor Observations

- Border Sage is appropriately quiet for structure but should not be the only active/focus boundary.
- Dark text and secondary-text contrast are strong; preserve these relationships.
- The current light-mode literals are absent from DESIGN.md, which invites maintenance drift.
- Keep the pale coral error color; errors should not become another shade of green.

## Questions to Consider

- If the promise is a private screening room, should OS preference be allowed to replace it with a generic pale workspace?
- Should watched, added, selected, and continue all use green, or does that erase the satisfaction of completion?
- Can poster art remain the expressive color layer while the interface uses mint once per immediate decision path?
