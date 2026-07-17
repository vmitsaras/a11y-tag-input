# Manual Accessibility Test Scenarios

## Summary

These scenarios cover the A11y Tag Input package, the static `examples/basic` demo, and the addon-style example pages. The main risk areas are keyboard focus movement between the generated input and remove buttons, live status/error announcements, synchronized form values, narrow layouts, forced-colors support, wrapped-label enhancement, paste/limit edge cases, and avoiding unsupported accessibility claims.

## Test Environment

- Keyboard only: latest Chrome, Firefox, or Safari.
- Desktop browser: test the built `examples/basic/index.html` and at least one addon-style example after `npm run build`.
- Mobile/touch viewport: 390px wide and 320px wide responsive checks.
- Screen reader combination: NVDA with Firefox or Chrome on Windows, or VoiceOver with Safari on macOS.
- 200% zoom: desktop browser zoom at 200%.
- Forced colors / high contrast: Windows forced colors when available.
- Reduced motion: OS-level reduce motion preference enabled.

## Scenario Index

| ID | Area | Mode | Priority |
|---|---|---|---|
| A11Y-KBD-001 | Add and remove tags | Keyboard | Critical |
| A11Y-KBD-002 | Limit and duplicate handling | Keyboard | High |
| A11Y-KBD-003 | Multilingual IME composition | Keyboard / IME | Critical |
| A11Y-SR-001 | Names, roles, and descriptions | Screen reader | High |
| A11Y-SR-002 | Live status and error announcements | Screen reader | High |
| A11Y-TCH-001 | Mobile/touch operation | Touch | Medium |
| A11Y-ZOOM-001 | Reflow and zoom | Zoom | High |
| A11Y-HC-001 | Forced colors | Forced colors | Medium |
| A11Y-RM-001 | Reduced motion | Reduced motion | Low |
| A11Y-FORM-001 | Form value synchronization | Forms | High |
| A11Y-FORM-002 | Required-field validation ownership | Forms | Critical |
| A11Y-DYN-001 | Generated content lifecycle | Dynamic content | Medium |
| A11Y-DYN-002 | Weird input and paste recovery | Dynamic content | Medium |

## Keyboard Scenarios

### Scenario ID: A11Y-KBD-001 - Add and remove tags without a mouse

**Area:** Tag input component and basic example  
**Mode:** Keyboard  
**Priority:** Critical  
**User goal:** Add, review, and remove tags using only the keyboard.  
**Setup:** Build the package and open `examples/basic/index.html`. Use `test/fixtures/keyboard-focus.html` for the focused browser regression check.  
**Steps:**
1. Press Tab until focus reaches the Topics input.
2. Type `Design` and press Enter.
3. Confirm the input clears and a `design` tag appears.
4. Press Backspace from the empty input.
5. Use ArrowLeft and ArrowRight between remove buttons.
6. Confirm exactly one generated field or remove button has `tabindex="0"`.
7. Press Tab and Shift+Tab from a remove button and confirm focus leaves the component.
8. Re-enter, then press Delete on a focused remove button.

**Expected result:**
- Tags can be added and removed without a mouse.
- Focus moves from the empty input to the final remove button, then between remove buttons.
- The input is the initial Tab stop, exactly one generated control remains in the Tab sequence, and Tab is not intercepted.
- Focus returns to a useful control after deletion.
- Visible focus is present at every step.

**Failure signs:**
- Focus disappears, gets trapped, or moves to hidden source controls.
- Tab visits every remove button or cannot leave the component.
- Delete or Backspace does not remove the focused tag.
- A mouse is required to complete the flow.

**Notes / likely files:**
- `src/index.ts`: `onFieldKeyDown`, `handleRemoveKeyDown`, `removeTag`
- `src/styles.css`: focus-visible rules

### Scenario ID: A11Y-KBD-002 - Limit and duplicate handling

**Area:** Validation and status behavior  
**Mode:** Keyboard  
**Priority:** High  
**User goal:** Understand why a tag cannot be added.  
**Setup:** Use the basic example.  
**Steps:**
1. Focus the Topics input.
2. Type an existing tag, such as `forms`, and press Enter.
3. Add unique tags until the five-tag limit is reached.
4. Try typing one more character after the limit is reached.

**Expected result:**
- Duplicate tags are rejected with visible error text and status feedback.
- The field has `aria-invalid="true"` while invalid.
- The max-tag state prevents new character input, exposes the generated input as read-only, and announces a limit message.
- Focus remains on or near the relevant control.
- Backspace from the empty limit-reached input still moves focus to a remove button so the user can recover.

**Failure signs:**
- The user cannot tell why input was rejected.
- Error text is visual only or not programmatically connected.
- Limit state blocks recovery or traps focus.
- The generated input is exposed as disabled even though users still need to focus it to remove tags.

**Notes / likely files:**
- `src/index.ts`: `runValidators`, `setError`, `updateLimitState`
- `test/index.test.ts`: duplicate and semantic state coverage

### Scenario ID: A11Y-KBD-003 - Compose multilingual tags without premature commands

**Area:** Tag entry and input-method compatibility  
**Mode:** Keyboard / IME  
**Priority:** Critical  
**User goal:** Enter Japanese, Chinese, Korean, accented, or other composition-based text without composition keys being treated as tag commands.  
**Setup:** Use the basic example with a Japanese, Chinese, or Korean IME enabled. Repeat once with the tag limit reached.  
**Steps:**
1. Focus the Topics input and begin composing a multilingual tag.
2. Use Enter to select or confirm an IME candidate while composition is active.
3. Include a configured separator character in the composition flow when the IME permits it.
4. Confirm the composition, then press Enter once more to add the completed tag.
5. Reach the max-tag limit and repeat an active composition keystroke.

**Expected result:**
- Enter and configured separators do not add a tag while composition is active.
- The draft composition remains intact and no success, validation, or limit message is produced by composing keystrokes.
- Enter adds the completed multilingual value after composition ends.
- At the max-tag limit, composing keystrokes are not canceled; ordinary non-composing character input remains blocked as documented.

**Failure signs:**
- A partial candidate becomes a tag, composition text is cleared, or a separator is swallowed.
- A false add, validation, or limit announcement occurs during composition.
- The completed value cannot be committed normally after composition ends.

**Notes / likely files:**
- `src/index.ts`: `onFieldKeyDown`
- `test/index.test.ts`: IME composition and legacy key-code coverage

## Touch Scenarios

### Scenario ID: A11Y-TCH-001 - Add and remove tags on a small touch viewport

**Area:** Basic example  
**Mode:** Touch  
**Priority:** Medium  
**User goal:** Complete the same tag task on a phone-sized screen.  
**Setup:** Browser responsive mode at 390px and 320px wide. Use `test/fixtures/responsive-layout.html` for the automated width, long-content, and target-size regression checks.  
**Steps:**
1. Tap the Topics input.
2. Type `mobile` and use the virtual keyboard Enter key if available.
3. Tap a remove button.
4. Submit the form.

**Expected result:**
- The input, remove buttons, and submit button are large enough to tap.
- The virtual keyboard does not obscure all relevant context.
- Tags wrap without page-level horizontal scrolling.
- Submit output remains readable.

**Failure signs:**
- Tiny remove targets cause accidental activation.
- Chips or code blocks force horizontal page scrolling.
- Text overlaps or becomes clipped.

**Notes / likely files:**
- `src/styles.css`: minimum target size and wrapping
- `examples/basic/index.html`: demo layout CSS

## Screen Reader Scenarios

### Scenario ID: A11Y-SR-001 - Names, roles, and relationships

**Area:** Generated tag input UI  
**Mode:** Screen reader  
**Priority:** High  
**User goal:** Understand the field purpose, existing tags, and remove controls.  
**Setup:** NVDA with Firefox/Chrome, or VoiceOver with Safari. Test an in-root label, an explicit label outside the component root, multiple labels, `aria-labelledby`, and `aria-label`.  
**Steps:**
1. Navigate to the Topics field.
2. Read the field name and description.
3. Navigate through the selected tags and remove buttons.
4. Repeat with each supported naming pattern.
5. Check the original textarea is not exposed as an extra editable field.

**Expected result:**
- The visible input is announced with the "Topics" label.
- Every associated explicit or wrapping label targets the generated input, including labels outside the component root.
- `aria-labelledby` takes precedence over `aria-label`, followed by associated native labels and the default input message.
- Instructions and counter are associated with the generated field.
- Remove buttons include tag-specific names.
- The hidden source control does not create duplicate form controls.

**Failure signs:**
- The input is unnamed or announced only as "edit text".
- External, wrapping, multiple-label, or ARIA-labelled source controls lose their authored name after initialization.
- Remove buttons are announced without tag names.
- The original textarea remains exposed and confusing.

**Notes / likely files:**
- `src/index.ts`: `preserveAccessibleName`, `aria-describedby`, remove button labels

### Scenario ID: A11Y-SR-002 - Live status and error announcements

**Area:** Dynamic announcements and validation  
**Mode:** Screen reader  
**Priority:** High  
**User goal:** Hear useful feedback after adding, removing, pasting, or failing validation.  
**Setup:** Screen reader running with the basic example. Use `test/fixtures/screen-reader-status.html` for the DOM/timing browser regression check and `docs/screen-reader-announcement-matrix.md` for the complete contract.  
**Steps:**
1. Add a new tag with Enter.
2. Remove a tag.
3. Try adding a duplicate tag.
4. Repeat the same duplicate attempt and confirm the identical error remains available once for the later action.
5. Paste multiple tags separated by commas or semicolons, including at least one duplicate or value beyond the limit.
6. Reach the max-tag limit, then hold a character key briefly.
7. In a required empty example, submit twice and listen to the field/error sequence.

**Expected result:**
- Add and remove messages are announced politely.
- Duplicate or invalid input exposes an error and status message.
- Repeating the same invalid action makes the same concise message available once for that later action.
- Paste feedback summarizes how many tags were added and skipped.
- Pasting does not produce rapid per-item announcements, and repeated max-limit keypresses do not continuously rewrite the same message.
- Validation feedback is concise and does not repeat the same message through multiple competing live mechanisms.
- Announcements are useful but not overly noisy.

**Failure signs:**
- No announcement occurs after a dynamic change.
- Error text is visible but not announced or connected.
- Announcements repeat excessively or use stale values.
- Pasting several invalid tags produces multiple rapid announcements instead of one useful summary.
- An identical later error is silent, or holding a key at the limit repeats the same message continuously.

**Notes / likely files:**
- `src/index.ts`: `announce`, `announceIfChanged`, `status`, `setError`, paste handling
- `docs/screen-reader-announcement-matrix.md`: expected information and manual result record

## Zoom And Reflow Scenarios

### Scenario ID: A11Y-ZOOM-001 - 200% zoom and 320px reflow

**Area:** Basic example and generated component  
**Mode:** Zoom  
**Priority:** High  
**User goal:** Use the demo with enlarged content and narrow layouts.  
**Setup:** 200% browser zoom and 320px CSS viewport width. Use `test/fixtures/responsive-layout.html` for exact-width automated checks and `docs/responsive-layout-qa.md` for the complete matrix.  
**Steps:**
1. Open the example at 200% zoom.
2. Add several tags including a long value such as `Donaudampfschifffahrtsgesellschaft`.
3. Navigate through all interactive controls.
4. Review code blocks and documentation sections on the demo page.

**Expected result:**
- Content reflows without two-dimensional scrolling for normal page content.
- Long tag text wraps instead of overlapping remove buttons or nearby content.
- Focus indicators remain visible.
- Code blocks may scroll internally if needed without breaking page layout.

**Failure signs:**
- Page-level horizontal scrolling appears because of chips or code blocks.
- Focus outline is clipped.
- Text overlaps or disappears.

**Notes / likely files:**
- `src/styles.css`: chip wrapping and field sizing
- `examples/basic/index.html`: documentation layout

## Forced Colors / High Contrast Scenarios

### Scenario ID: A11Y-HC-001 - Forced-colors visibility

**Area:** Component styling  
**Mode:** Forced colors  
**Priority:** Medium  
**User goal:** See controls, selected tags, errors, and focus outlines in high contrast.  
**Setup:** Build the package, open `test/fixtures/color-contrast.html?mode=forced`, and enable Windows forced colors or equivalent browser emulation. See `docs/color-contrast-forced-colors-qa.md` for the recorded baseline.  
**Steps:**
1. Enable forced colors.
2. Focus the input and remove buttons.
3. Add and remove a tag.
4. Trigger a duplicate error.

**Expected result:**
- Control and chip borders remain visible.
- Focus outlines use system highlight colors.
- Error state is not conveyed by color alone.
- Text remains readable.

**Failure signs:**
- Focus indicators disappear.
- Chip or control boundaries vanish.
- Remove buttons become indistinguishable.

**Notes / likely files:**
- `src/styles.css`: `@media (forced-colors: active)`

## Reduced Motion Scenarios

### Scenario ID: A11Y-RM-001 - Reduced transition motion

**Area:** Component styling  
**Mode:** Reduced motion  
**Priority:** Low  
**User goal:** Avoid unnecessary transition motion.  
**Setup:** Enable OS reduced motion preference.  
**Steps:**
1. Open the example.
2. Focus and blur the tag input.
3. Add and remove tags.
4. Trigger invalid and limit states.

**Expected result:**
- Transitions are effectively shortened.
- There is no large motion, smooth scrolling, animation loop, or focus animation.

**Failure signs:**
- Transitions remain prominent despite reduced-motion preference.
- Motion distracts from focus or validation state changes.

**Notes / likely files:**
- `src/styles.css`: `@media (prefers-reduced-motion: reduce)`

## Form Scenarios

### Scenario ID: A11Y-FORM-001 - Synchronized form value

**Area:** Form submission and hidden source control  
**Mode:** Forms  
**Priority:** High  
**User goal:** Submit the tags as a normal form value.  
**Setup:** Basic example.  
**Steps:**
1. Add `testing`.
2. Remove one existing tag.
3. Submit the form.
4. Review the demo output.

**Expected result:**
- The output shows the current serialized value from the original textarea.
- Removed tags are absent.
- The source control remains hidden from interaction but synchronized.
- The demo output update is exposed as a polite status-style update after form submit.

**Failure signs:**
- The output shows stale values.
- The hidden source receives focus.
- The submitted value format does not match the documented `outputFormat`.

**Notes / likely files:**
- `src/index.ts`: `syncValue`, `serializeTags`
- `examples/basic/index.html`: submit output

### Scenario ID: A11Y-FORM-002 - Required-field validation ownership

**Area:** Native constraint validation and focus  
**Mode:** Forms  
**Priority:** Critical  
**User goal:** Find and fix an empty required tag field during normal form submission.  
**Setup:** Build the package and open `test/fixtures/required-form.html`, or create an equivalent form containing an empty `textarea[required][data-a11y-tag-input]`.  
**Steps:**
1. Submit the empty form with the keyboard.
2. Confirm focus moves to the generated visible input, not the hidden source.
3. Type an uncommitted draft and submit again.
4. Commit a valid tag and submit.
5. Call `destroy()` and inspect the original textarea.

**Expected result:**
- The hidden source is not the form's invalid focus target while enhanced.
- The generated input receives the required error, visible error text, and focus.
- Uncommitted draft text does not satisfy the tag requirement.
- A committed tag satisfies native constraint validation.
- `destroy()` restores the source control's original `required` state.

**Failure signs:**
- The browser reports that an invalid form control is not focusable.
- Focus moves to the hidden textarea or does not move.
- Draft text without a committed tag satisfies the requirement.
- The source loses its `required` state after cleanup.

**Notes / likely files:**
- `src/index.ts`: `hideSourceControl`, `syncRequiredState`, `onFieldInvalid`, `destroy`
- `test/index.test.ts`: required validation ownership and restoration

## Dynamic Content Scenarios

### Scenario ID: A11Y-DYN-001 - Generated UI cleanup and reinitialization

**Area:** Component lifecycle  
**Mode:** Dynamic content  
**Priority:** Medium  
**User goal:** Avoid duplicate controls or stale listeners after lifecycle changes.  
**Setup:** Use automated tests or a browser console on a local fixture.  
**Steps:**
1. Initialize a source control.
2. Call `createTagInput(source)` again.
3. Confirm only one generated control exists.
4. Call `destroy()`.
5. Reinitialize the same source.

**Expected result:**
- Duplicate initialization returns the same instance.
- Generated controls and listeners are not duplicated.
- Destroy restores the original control and allows clean reinitialization.

**Failure signs:**
- Multiple generated inputs, counters, or status regions appear.
- Destroy leaves stale event listeners or state classes.
- Reinitialization fails or duplicates markup.

**Notes / likely files:**
- `src/index.ts`: WeakMap instance tracking and `destroy`
- `test/index.test.ts`: duplicate initialization and cleanup tests

### Scenario ID: A11Y-DYN-002 - Weird input and paste recovery

- **Area:** Parser, validation, live status, and layout resilience
- **Mode:** Dynamic content
- **Priority:** Medium
- **User goal:** Recover cleanly when pasted tags include duplicates, too many values, empty segments, or long text.
- **Setup:** Basic example or a local fixture with `data-max-tags="2"`.
- **Test data:** `css;html;aria`, `  ; ;`, `Donaudampfschifffahrtsgesellschaft`, `<script>alert(1)</script>`, and emoji tags such as `✅`.
**Steps:**
1. Paste several semicolon-separated tags where at least one should be rejected.
2. Paste only empty or whitespace segments.
3. Add a very long single-word tag.
4. Add text that looks like HTML.
5. Remove tags with the keyboard after the limit is reached.

**Expected result:**
- Accepted tags render as plain text, not HTML.
- Rejected pasted values are summarized without rapid repeated announcements.
- Empty pasted segments do not crash the component.
- Long text wraps inside the chip and does not hide the remove button.
- Focus remains recoverable after limit or validation failures.

**Failure signs:**
- HTML-like input is rendered as markup.
- Status messages become noisy or stale after paste.
- Long chips force page-level horizontal scrolling.
- Limit state prevents keyboard recovery.

**Notes / likely files:**
- `src/index.ts`: `onFieldPaste`, `addTag`, `render`, `updateLimitState`
- `src/styles.css`: chip wrapping and remove-button sizing

### Scenario ID: A11Y-DYN-003 - Native form reset synchronization

- **Area:** Form behavior and state synchronization
- **Mode:** Dynamic content
- **Priority:** High
- **User goal:** Reset visible tags to their authored defaults with the rest of the form.
- **Setup:** A form containing two initialized tag inputs, including one required empty control and one using an alternate `valueElement`, plus a native reset button.

**Steps:**
1. Add and remove tags in both widgets and trigger a validation error.
2. Move focus to the native reset button and activate it.
3. Compare the visible tags, serialized controls, required state, counters, limit state, and error content with their initial values.
4. Destroy one instance, reset again, and inspect the destroyed source.

**Expected result:**
- Each active widget reflects its post-reset source or alternate value element.
- Draft text, stale errors, and stale status text are cleared without a reset announcement.
- Required, disabled, read-only, counter, and limit presentation are consistent with the reset state.
- Focus follows native browser reset behavior and is not forced into the widget.
- The destroyed instance does not react, and duplicate initialization does not create duplicate reset handling.

**Notes / likely files:**
- `src/index.ts`: owning-form reset listener, deferred reconciliation, and `destroy`
- `test/index.test.ts`: initial, empty, alternate-value, multi-widget, cleanup, and duplicate-init reset coverage

## Suggested Fix Areas

- Keep automated tests aligned with paste summaries, max-tag limit input blocking, JSON/newline output formats, wrapped labels, required validation, and native form reset.
- Add screen reader evidence to release notes only after testing with named browser and screen reader combinations.
- Keep README accessibility language scoped to implemented behavior unless manual AT results are recorded.

## Final QA Checklist

- [ ] Core flow works with keyboard only.
- [ ] Focus order is logical.
- [ ] Focus is always visible.
- [ ] Escape behavior works where expected.
- [ ] Touch users can complete the same task.
- [ ] No hover-only information is required.
- [ ] Page works at 200% zoom.
- [ ] Content reflows without clipping.
- [ ] Screen reader users get names, roles, states, and useful announcements.
- [ ] Form errors are programmatically connected.
- [ ] Forced colors preserve text, controls, icons, and focus.
- [ ] Reduced motion users do not receive large or unnecessary animation.
- [ ] Dynamic updates are announced only when useful.
- [ ] No keyboard trap exists.
