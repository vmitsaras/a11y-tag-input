# Accessibility Findings Disposition

## Purpose

This record separates repository defects and useful optimizations from checks that require a specific operating system, browser zoom implementation, physical input device, or assistive technology. An external-only check should become a code finding only when that environment reproduces a failure.

## Current Disposition

| Finding or evidence gap | Disposition | Repository action | Remaining proof |
|---|---|---|---|
| Stateful global or sticky `invalidChars` expressions could accept the same invalid value on a later attempt | Fixed | Validation clones authored regular expressions so mutable `lastIndex` cannot leak between attempts; regression coverage repeats the same invalid value | None; the full test and package gate passed |
| Unknown custom-validator message keys could produce empty visible and status errors | Fixed and optimized | `TagInputValidationResult` accepts a direct `message`; unknown or empty keys fall back to `invalidTag`; tests cover direct and fallback messages | Integrators still own the clarity of domain-specific wording |
| Default text, boundary, and focus contrast | Verified; no fix needed | Computed ratios and normal-mode browser checks are recorded | Recheck downstream theme overrides and backgrounds |
| Chrome forced-colors rendering | Verified; no fix needed | System-color boundaries, states, focus, and link differentiation are covered by the browser fixture and visual review | Repeat in real Windows High Contrast before claiming that environment |
| Screen-reader announcement wording and timing | Optimized in DOM; external verification required | Persistent live region, repeat timing, paste summarization, stale-timer cancellation, and limit-noise suppression have automated coverage | NVDA/Firefox or Chrome and VoiceOver/Safari must confirm actual speech |
| Actual 200% browser zoom | External verification required | Narrow-container and 320–1920 CSS-pixel reflow fixtures reduce layout risk | Run real browser zoom because width simulation is not equivalent to browser zoom |
| Physical touch and virtual keyboard comfort | External verification required | Generated targets measure at least 44px and narrow layouts pass | Test a physical or representative touch device and its virtual keyboard |

## Decision Rule

- Fix a repository issue when a supported configuration reproduces incorrect semantics, focus, validation, status, layout, or styling.
- Add automation when the browser exposes authoritative state that can be asserted without pretending to emulate another environment.
- Improve documentation when an accessible outcome depends on integrator-provided copy, colors, markup, or application flow.
- Keep a named manual check when actual speech, operating-system rendering, browser zoom, touch accuracy, or virtual-keyboard obstruction is the evidence being requested.
