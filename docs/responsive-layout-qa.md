# Responsive Layout QA

## Summary

The component and demo layouts are stable in the automated Chrome checks. The generated landing page needed a responsive hero adjustment so tablet widths use a single-column hero before returning to the desktop composition. Existing flex wrapping, minimum-size resets, long-word wrapping, responsive grids, internal code scrolling, and 44px control sizing handled the remaining tested conditions.

## Reviewed Areas

- Core generated field, chip list, long chip text, remove button, long label, and long validation error.
- Generated Pages landing page, basic demo, and all eleven addon-style example pages, for thirteen checked pages total.
- CSS viewport widths: 320, 360, 390, 640, 768, 1024, 1280, 1440, and 1920 pixels.
- Reusable component container widths: 240, 320, 480, and 640 pixels.
- 640 CSS pixels as the reflow-equivalent layout width for a 1280px browser viewport at 200% zoom.
- Minimum 44px generated field and remove-button targets.

## Automated Evidence

`test/fixtures/responsive-layout.html` loads every demo into same-origin iframes at exact CSS widths and checks page `scrollWidth` against `clientWidth`. It also creates a long-content component inside a 240px container and verifies:

- no container or control overflow;
- wrapping of `Donaudampfschifffahrtsgesellschaftskapitan`;
- wrapping of a long corrective validation message;
- a generated field and remove button at least 44px high, with the remove button at least 44px wide;
- component stability at 240, 320, 480, and 640px container widths.

Recorded result: Google Chrome 150.0.7871.124 passed all checks on 2026-07-16 after adding the generated landing page to the exact-width page matrix.

## Scenario Index

| ID | Area | Viewport / mode | Priority |
|---|---|---|---|
| RWD-MOB-001 | Basic add/remove/submit flow | 320, 360, and 390px | High |
| RWD-ZOOM-001 | Content reflow | 640px CSS layout width plus manual 200% zoom | High |
| RWD-CONT-001 | Embedded tag input | 240, 320, 480, and 640px containers | High |
| RWD-LONG-001 | Long label, tag, and error | 240px container | High |
| RWD-TCH-001 | Generated input and remove control | 390px mobile/device check | Medium |
| RWD-TAB-001 | Demo grids | 768 and 1024px | Medium |
| RWD-WIDE-001 | Reading width and spacing | 1440 and 1920px | Low |

## Findings

No Critical, High, Medium, or Low layout defect was reproduced in the automated matrix.

The initial direct 320px headless screenshot was cropped because the Chrome window used a larger minimum layout viewport than its output bitmap. It was not treated as product evidence. Exact-width iframe measurements and the visible 320px iframe probe remove that ambiguity.

## Manual Verification Still Required

- Use actual browser zoom at 200% to confirm focus outlines, scrolling, and browser UI interaction—not only the equivalent CSS layout width.
- Use a phone or touch emulator to judge target comfort, virtual-keyboard obstruction, and accidental activation.
- Inspect the full page at 320px and 200% zoom for visual rhythm; automated dimensions cannot judge polish.
- Confirm that intentionally scrollable code blocks have a discoverable horizontal scroll path.

## Final QA Checklist

- [x] No page-level horizontal overflow in the automated 320–1920px matrix.
- [x] Component fits 240–640px containers.
- [x] Long labels, tags, and errors wrap without clipping.
- [x] Generated input and remove controls meet the 44px measured target reference.
- [x] Basic and addon demo grids collapse without overflow.
- [x] Wide layouts retain their configured 74rem content maximum.
- [ ] Actual 200% browser zoom completed manually.
- [ ] Physical or emulated touch interaction completed manually.
- [ ] Virtual-keyboard obstruction checked on mobile.
