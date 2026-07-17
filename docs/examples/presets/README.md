# Presets Addon Recipe

This example shows preset tag sets for a support-triage workflow.

## What this example shows

- Preset buttons built from semantic HTML.
- `setTags()` used to replace the current tag list.
- A status output that announces which preset was applied.
- Continued keyboard editing after a preset change.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/presets/index.html`.

## What to try

- Apply each preset.
- Add a custom tag after applying a preset.
- Remove a preset tag with the keyboard.
- Confirm the source textarea value changes with each preset.

## Accessibility notes

- Presets are real buttons, not clickable spans.
- The status output reports preset changes.
- The tag input keeps the same label, keyboard behavior, and remove buttons.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
