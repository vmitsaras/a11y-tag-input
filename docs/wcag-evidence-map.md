# WCAG Evidence Map

## Repository Classification

- Type: TypeScript plugin package with static HTML examples.
- Pattern: progressive form-control enhancement for tag entry, selected-tag removal, validation, and status messaging.
- Main purpose: keep native form values synchronized while adding keyboard-friendly tag editing.
- Current maturity: implementation, tests, examples, and docs provide useful evidence; actual zoom, real Windows forced colors, touch, and assistive technology checks remain required.

## Evidence Summary

- Overall accessibility evidence: moderate to strong for DOM semantics, keyboard behavior, lifecycle cleanup, validation state, live status text, narrow-container behavior, and responsive page reflow.
- Strongest evidence: Vitest coverage for initialization, in-root/external/multiple label retargeting, ARIA naming precedence, one-stop keyboard focus management, add/remove focus recovery, duplicate initialization, required validation ownership, repeated status timing and cancellation, paste summaries, limit-message noise suppression, output formats, disabled/read-only state, and destroy/reinit cleanup.
- Weakest evidence: mobile touch and virtual-keyboard comfort, actual 200% browser zoom, real Windows High Contrast rendering, and real screen reader announcement quality.
- Highest-risk WCAG areas: keyboard/focus behavior and status/error announcements.
- Manual verification required: required-field submission focus outside the recorded Chrome fixture, NVDA/Firefox or NVDA/Chrome, VoiceOver/Safari, actual 200% zoom, real Windows forced colors, and touch operation.

## WCAG Coverage Table

| WCAG criterion | Status | Evidence strength | Notes |
|---|---:|---:|---|
| 1.3.1 Info and Relationships | Supports | Strong | Generated input preserves `aria-labelledby`/`aria-label` precedence, retargets all associated explicit or wrapping labels, and retains instruction/counter/error relationships. |
| 1.4.1 Use of Color | Supports | Strong DOM and browser evidence | Error and limit states use visible text, programmatic state, and status feedback rather than color alone; normal and forced-colors browser checks preserve their boundaries and focus indicators. |
| 1.4.3 Contrast Minimum | Supports with authoring dependency | Strong computed evidence | Recorded default component and demo text pairs exceed 4.5:1; downstream theme and background overrides remain the integrator's responsibility. |
| 1.4.10 Reflow | Supports with manual zoom check | Strong browser layout evidence | Chrome fixture verifies all demos at 320–1920 CSS pixels, 640px zoom-equivalent width, 240–640px component containers, and long content. Actual browser zoom interaction remains manual. |
| 1.4.11 Non-text Contrast | Supports with environment check | Strong computed and browser evidence | Default control, output, and focus colors exceed 3:1, and Chrome forced-colors emulation preserves system-color boundaries; real Windows High Contrast remains manual. |
| 2.1.1 Keyboard | Supports with browser check | Strong DOM evidence plus Chrome fixture | Tests cover the initial field Tab stop, non-canceled Tab, Backspace focus handoff, arrows, Home/End, Delete/Backspace removal, native click activation, and disabled/read-only guards. Actual hardware Tab/Shift+Tab remains a manual check. |
| 2.1.2 No Keyboard Trap | Supports | Strong | Focus can return from remove buttons to input; destroy removes generated UI; no modal/overlay trap exists. |
| 2.4.3 Focus Order | Supports with browser check | Strong DOM evidence plus Chrome fixture | Exactly one enabled generated control has `tabindex="0"`; focus after rerendered removal moves to an adjacent tag or the field. Actual forward/reverse Tab order remains manual. |
| 2.4.6 Headings and Labels | Supports | Strong | Examples use headings and visible labels; tests cover in-root, external, wrapping, and multiple label retargeting. |
| 2.4.7 Focus Visible | Supports with environment check | Strong browser evidence | Component and demo focus outlines remain visible in normal rendering and Chrome forced-colors emulation; target-browser and real Windows checks remain manual. |
| 2.5.3 Label in Name | Supports with authoring dependency | Strong | Native label text is preserved when labels provide the authored name; explicit ARIA names retain their authored precedence and therefore remain the integrator's responsibility. |
| 2.5.8 Target Size | Supports with touch check | Strong measured evidence | Chrome fixture measures the generated field and remove button at 44px or larger; physical/emulated touch comfort and spacing remain manual. |
| 3.3.1 Error Identification | Supports with browser check | Strong DOM evidence plus Chrome fixture | Invalid state sets visible error text, `aria-invalid`, and `aria-errormessage`; tests cover required ownership, uncommitted drafts, recovery, and restoration. Chrome 150 focused the generated invalid field; other target browsers remain manual checks. |
| 3.3.2 Labels or Instructions | Supports | Strong | Source markup requires labels; generated instructions and counters are linked to the input. |
| 3.3.3 Error Suggestion | Supports with authoring dependency | Strong component evidence | Built-in messages explain duplicate, empty, length, invalid-character, and limit failures. Custom validators can provide a direct message; missing keys fall back to a non-empty invalid-tag message, while domain-specific recovery wording remains the integrator's responsibility. |
| 4.1.2 Name, Role, Value | Supports | Strong | Generated group/list/input/buttons expose names and states; tests cover state sync and cleanup. |
| 4.1.3 Status Messages | Supports with risk | Strong for DOM, manual for AT | One persistent polite/atomic status region updates for add/remove/paste/limit/validation. Tests cover repeated-message timing, stale-message cancellation, one paste summary, and limit-message suppression; real screen reader timing and verbosity still require manual checks. |

## Findings

### Finding 1: Screen Reader Announcement Quality Still Needs Manual AT Evidence

- Severity: Medium
- Affected users: screen reader users.
- Affected interaction: add, remove, duplicate, paste, limit, required validation.
- Likely WCAG impact: 4.1.3 Status Messages, 3.3.1 Error Identification, 4.1.2 Name, Role, Value.
- Evidence found: persistent `role="status"` region, visible error text, `aria-invalid`, `aria-errormessage`, repeated-message reinsertion, stale-timer cancellation, paste summarization, max-limit noise suppression, and DOM tests for each behavior.
- Evidence missing: actual NVDA/VoiceOver announcement order and duplicate verbosity.
- Recommended fix: run the manual scenarios before release and document named AT/browser results only after they are performed.
- Automated test needed: covered for DOM state, timing, cleanup, and status text; no automated test can prove real AT output.
- Documentation update needed: use the screen reader announcement matrix and add named results only after they are performed.
- Manual verification needed: NVDA with Firefox or Chrome, VoiceOver with Safari.

### Finding 2: Real-System Zoom, High Contrast, And Touch Evidence Is Not Complete

- Severity: Medium
- Affected users: low vision, touch, and forced-colors users.
- Affected interaction: viewing chips, remove buttons, status/error text, and examples at narrow widths.
- Likely WCAG impact: 1.4.3 Contrast Minimum, 1.4.10 Reflow, 1.4.11 Non-text Contrast, 2.5.8 Target Size.
- Evidence found: Chrome checks for 320–1920px demo reflow, 240–640px component containers, long label/tag/error wrapping, measured 44px controls, default contrast ratios, normal and forced-colors focus/boundary rendering, and reduced-motion rules.
- Evidence missing: actual 200% browser zoom interaction, real Windows High Contrast rendering, virtual-keyboard obstruction, and touch comfort.
- Recommended fix: perform the remaining manual QA checklist and capture failures as focused issues.
- Automated test needed: responsive layout fixture is present; optional screenshot comparison can be added if visual regression tooling is adopted.
- Documentation update needed: keep manual verification caveats in README and examples.
- Manual verification needed: 200% zoom, Windows High Contrast when available, physical touch, and virtual-keyboard operation.

### Finding 3: Custom Validation Feedback Could Become Empty Or Inconsistent

- Severity: High before fix; resolved in the current worktree.
- Affected users: screen reader users, users with cognitive disabilities, and anyone recovering from invalid input.
- Likely WCAG impact: 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages.
- Evidence found: global and sticky regular expressions carry a mutable `lastIndex`, and unknown custom message keys previously resolved to an empty string.
- Fix implemented: clone authored invalid-character expressions per validation run, accept a direct custom-validator `message`, and fall back to the default invalid-tag message when a key is missing or empty.
- Automated test added: repeated stateful-expression rejection, direct custom error text, and unknown-key fallback are covered in `test/index.test.ts`.
- Remaining authoring dependency: integrators must still write domain-specific messages that explain how to recover.

## Test Evidence Map

| Behavior | Existing test evidence | Missing test | Recommended test |
|---|---|---|---|
| Initialization and semantics | Source hidden, group role, list label, describedby, init event | Browser accessibility tree | Manual DOM/a11y tree inspection |
| Accessible naming | In-root, external, wrapping, multiple-label, `aria-labelledby`, and `aria-label` tests | Browser accessibility tree | Manual DOM/a11y tree inspection |
| Keyboard focus and removal | Initial single Tab stop, non-canceled Tab, Backspace handoff, arrows, Home/End, deletion/click focus recovery, read-only transition | Actual forward/reverse browser Tab sequence and native Enter/Space activation | Manual keyboard scenario |
| Limit reached | `aria-readonly`, blocked character key, Backspace recovery, repeated-message suppression | Screen reader announcement quality | Manual SR scenario |
| Validation | Duplicate validation plus required ownership, draft rejection, recovery, and destroy restoration | Target-browser invalid focus | Submit an empty required fixture in each target browser |
| Custom validation | Repeated stateful-regex rejection, direct validator messages, and non-empty fallback for unknown keys | Domain-specific message quality | Review custom validator wording in the consuming form |
| Status messaging | Persistent polite/atomic region, repeated-message reinsertion, stale timer cancellation, destroy cleanup | Actual spoken order and interruption behavior | Screen reader announcement matrix |
| Paste | Mixed accept/reject summary test | Clipboard behavior and spoken summary in real browsers | Manual paste scenario |
| Output formats | JSON and newline sync tests | Custom serializer edge cases | Add if custom serializer bugs appear |
| Form reset | Initial/empty defaults, alternate value element, required/error cleanup, multiple widgets, focus suppression, destroyed instance, and duplicate initialization | Target-browser reset timing and AT silence | Run the native reset manual scenario in each target browser |
| Lifecycle | Duplicate init, destroy/reinit, and reset-listener cleanup tests | Browser memory/listener profiling | Optional edge-case pass |

## Recorded Browser Evidence

- 2026-07-15, Google Chrome 150.0.7871.124, `test/fixtures/required-form.html`: passed. `reportValidity()` returned `false`, focus moved to the generated field, the hidden source released `required`, the generated field remained invalid, and the external label was retargeted.
- 2026-07-15, Google Chrome 150.0.7871.124, `test/fixtures/keyboard-focus.html`: passed. The fixture verified one enabled internal Tab stop, Backspace/arrow/End movement, non-canceled Tab, focus recovery after Delete and native click, and return to the field when empty.
- 2026-07-15, Google Chrome 150.0.7871.124, `test/fixtures/screen-reader-status.html`: passed. The fixture verified the persistent polite/atomic status region, instruction/counter relationships, separate updates for repeated identical messages and errors, stale-message cancellation, one paste summary, status persistence across rerenders, error relationships, and repeated max-limit suppression.
- 2026-07-16, Google Chrome 150.0.7871.124, `test/fixtures/responsive-layout.html`: passed. The fixture verified the generated landing page and all eight demos at nine CSS viewport widths from 320px through 1920px, the component at 240–640px container widths, long label/tag/error wrapping, and measured 44px generated field/remove targets.
- 2026-07-15, Google Chrome 150.0.7871.124, `test/fixtures/color-contrast.html`: passed 15 normal-mode computed-style checks and 12 forced-colors checks. Default text pairs exceeded 4.5:1, tested boundaries and focus indicators exceeded 3:1, and Chrome high-contrast emulation preserved system-color boundaries, state differentiation, focus outlines, and the footer link underline.
- The keyboard fixture dispatches key events and inspects focus/tabindex state; it does not replace an actual hardware Tab/Shift+Tab or screen reader pass.
- The status fixture inspects DOM state and timing; it does not observe or prove screen reader speech.
- The responsive fixture verifies layout dimensions and overflow; it does not replace actual 200% browser zoom, touch, virtual-keyboard, or visual-polish checks.
- The color fixture covers the default palette and Chrome emulation; it does not replace rechecking downstream theme overrides or testing a real Windows High Contrast theme.
- These browser results do not establish equivalent behavior in Firefox, Safari, or assistive technology combinations.

## Documentation Evidence Map

| Topic | Current docs evidence | Risk | Recommended docs update |
|---|---|---|---|
| Semantic HTML | README HTML structure and examples | Low | Keep examples labelled before JS. |
| Keyboard behavior | README table, docs metadata, manual scenarios | Low | Update when behavior changes. |
| ARIA/state behavior | README accessibility notes and tests | Low | Avoid claiming AT verification. |
| Status/live region behavior | README notes, announcement matrix, manual scenarios, timer tests, Chrome fixture | Medium | Add named AT results only after manual checks. |
| Responsive/forced colors | CSS notes, responsive and color QA matrices, Chrome fixtures, and manual scenarios | Medium | Keep emulated evidence separate from actual zoom, real Windows High Contrast, and touch checks. |
| Limitations | README and docs metadata limitations | Low | Keep no-compliance language. |

## Manual Verification Checklist

- Keyboard-only flow in Chrome, Firefox, or Safari.
- NVDA with Firefox or Chrome for names, descriptions, errors, and status messages.
- VoiceOver with Safari for the same core flow when available.
- 200% browser zoom.
- Real Windows forced-colors/high-contrast rendering.
- Touch operation for input, remove buttons, addon buttons, and submit output.
- Reduced-motion setting enabled.

## Summary

The package now has stronger implementation and automated evidence for the highest-risk accessibility behavior: labels, keyboard focus, validation state, status updates, paste recovery, and lifecycle cleanup. This evidence supports several likely WCAG criteria, but it does not certify compliance. The remaining risk is mostly rendered and assistive-technology behavior that requires manual browser and screen reader checks before making stronger claims.
