# Color Contrast And Forced-Colors QA

## Recorded Result

- Date: 2026-07-15
- Browser: Google Chrome 150.0.7871.124
- Fixture: `test/fixtures/color-contrast.html`
- Normal mode: passed 15 computed-style checks.
- Forced-colors emulation: passed 12 boundary, focus, state, and link checks using Chrome's high-contrast mode.
- Visual inspection: focused invalid and disabled components, demo controls, outputs, code blocks, section dividers, and footer links remained distinguishable.
- Production CSS changes: none. The recorded default styles already met the tested thresholds.

## Measured Default Contrast

| Pair | Ratio | Requirement used |
|---|---:|---:|
| Component border / white | 5.90:1 | 3:1 non-text |
| Chip text / chip background | 15.48:1 | 4.5:1 text |
| Error text / white | 6.57:1 | 4.5:1 text |
| Component focus / white | 6.70:1 | 3:1 non-text |
| Muted component text / white | 7.56:1 | 4.5:1 text |
| Disabled muted text / disabled background | 6.87:1 | Informational; disabled controls are exempt |
| Demo text / demo background | 16.14:1 | 4.5:1 text |
| Demo muted text / demo background | 6.55:1 | 4.5:1 text |
| Demo focus / demo background | 6.27:1 | 3:1 non-text |
| Demo output border / output background | 5.16:1 | 3:1 non-text |
| Warning text / warning background | 8.46:1 | 4.5:1 text |
| Danger text / danger background | 6.01:1 | 4.5:1 text |
| Code text / code background | 16.22:1 | 4.5:1 text |
| Footer muted text / footer background | 9.60:1 | 4.5:1 text |
| Footer link / footer background | 16.08:1 | 4.5:1 text |

Ratios use computed sRGB colors and the WCAG relative-luminance formula. They cover the package's default component and demo palette; consuming applications must recheck any overridden custom properties or surrounding backgrounds.

## Fixture Coverage

Normal mode checks component borders, chip and error text, focus and placeholder contrast, plus demo body, muted, button, output, code, and footer colors. Forced-colors mode checks system-color boundaries for normal, invalid, disabled, and remove-button states; component and demo focus outlines; demo section, button, output, and code boundaries; and the footer link underline.

Run after building:

```text
test/fixtures/color-contrast.html?mode=normal
test/fixtures/color-contrast.html?mode=forced
```

The forced query records the expected mode but does not activate it. Enable an operating-system forced-colors mode or an equivalent browser emulation before opening that URL.

## Remaining Manual Checks

- Repeat in a real Windows High Contrast theme; Chrome emulation is useful evidence but is not a substitute for the operating-system rendering stack.
- Check application-specific theme token overrides, custom backgrounds, and downstream CSS.
- Confirm focus and boundaries on the physical displays and target browsers in the support matrix.
- Keep contrast evidence separate from screen reader, 200% zoom, touch, and virtual-keyboard testing.

