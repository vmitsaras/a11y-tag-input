# Validation Hints Addon Recipe

This example shows validation guidance for machine-friendly automation tags.

## What this example shows

- Visible rule text before the user types.
- Core validation options for length and invalid characters.
- Custom validation messages.
- Plugin-managed visible errors and live status messages for rejected tags.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/validation-hints/index.html`.

## What to try

- Add `build-queue`.
- Add `QA` and confirm it becomes lowercase.
- Try `bad tag`.
- Try a one-character tag.

## Accessibility notes

- Rules are visible and programmatically associated with the source control.
- Invalid tags use the plugin's visible error state and live status message.
- Rejections are not mirrored into a second live region, avoiding duplicate feedback.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
