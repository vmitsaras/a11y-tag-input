# Duplicate Feedback Addon Recipe

This example shows how to turn built-in duplicate rejection into clearer feedback for a release-label workflow.

## What this example shows

- Duplicate tags rejected by the core plugin.
- Custom duplicate message text.
- One canonical field-level error that explains the rejection.
- A separate status region reserved for successful additions.
- Recovery by removing a tag and adding it again.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/duplicate-feedback/index.html`.

## What to try

- Add a unique label.
- Add `docs` again and inspect the feedback.
- Confirm focus remains usable after the rejected tag.
- Remove the existing `docs` tag and add it again.

## Accessibility notes

- The duplicate error is exposed once through the plugin's associated field-level error.
- Successful additions use a separate polite status message.
- The field keeps the visible label and instructions.
- The demo uses text, not color alone, to explain the duplicate state.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
