# Publish Article Form Validator Integration

This real-world example combines A11y Tag Input with A11y Form Validator in an editorial publishing form.

## What this example shows

- A11y Tag Input initialized before A11y Form Validator so the generated text field is discovered.
- A custom `minimum-tags` form rule that counts committed tags through `getTags()` instead of draft text.
- An adapter renderer that keeps A11y Tag Input in control of its visible tag error and ARIA state.
- Native required and email rules for ordinary fields, plus a focusable error summary on blocked submission.
- Empty, invalid, recovery, successful submission, and native reset states.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/form-validator-integration/index.html`. The build creates the local `demo-vendor/a11y-form-validator` assets used by this page.

## What to try

- Submit the empty form and follow the error-summary links.
- Enter an invalid email address and type an uncommitted tag draft; submit again and confirm the draft does not satisfy the two-tag rule.
- Commit one tag with Enter and submit to see the minimum-tag error.
- Commit a second tag and submit to inspect the synchronized form values.
- Reset the form and confirm generated errors, tags, draft text, and submitted output clear.

## Accessibility notes

- Real labels, inputs, a textarea source, and buttons provide a semantic baseline.
- A11y Form Validator focuses one summary after a blocked submit; tag candidate feedback remains owned by A11y Tag Input.
- The adapter writes the tag field error through `setValidationError()`, avoiding competing error elements and `aria-errormessage` values.
- The external form rule runs on submit, so its message is presented through the focused summary rather than a second live announcement.
- After the first submit, tag changes refresh the visible summary and semantic state without moving focus or adding a competing announcement.
- Keyboard behavior remains native around the form, while the tag input retains its documented Enter, arrow, Home, End, Backspace, and Delete behavior.
- The page respects reduced motion and forced colors, but production integrations still need testing with their target browser and assistive technology combinations.

## Developer notes

- Tag input root: `[data-a11y-tag-input-root]`.
- Tag input source: `#article-topics`; the generated field is available as `tagInput.field`.
- Form root: `[data-a11y-form-validator]`.
- Initialization order is required: create the tag input, prepare its renderer adapter, then create the form validator.
- CSS imports come from `../../dist/styles.css`, the local demo-vendor validator stylesheet, `../addon-demo.css`, and `./styles.css`.
- Tag options used: `maxTags: 6`, `lowercase: true`, `minLength: 2`, and `invalidChars: /[^a-z0-9-]/`.
- Form options start with `createDefaultPreset()` and restrict validation to submit so the summary controls form-level announcements.

## Limitations

- This adapter is intentionally scoped to one tag input instance. Applications with several tag inputs should map each generated field to its matching instance.
- Client-side validation does not replace server-side validation or sanitization.
- Form-level tag validation begins on submit; later tag changes refresh that state without refocusing the summary.

## Files

- `index.html`
- `styles.css`
- `../addon-demo.css`
