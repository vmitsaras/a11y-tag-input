# Recent Tags Addon Recipe

This example shows recent-tag buttons for an editorial planning workflow.

## What this example shows

- Recent tags rendered as real buttons.
- `addTag()` used from outside the generated input.
- Duplicate and limit behavior still handled by the core plugin.
- A privacy note for teams that persist recent tags.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/recent-tags/index.html`.

## What to try

- Add a recent tag.
- Add a custom tag with Enter.
- Try adding the same recent tag twice.
- Remove a tag and add it again.

## Accessibility notes

- Recent tags are real buttons with visible text.
- The status output explains whether the recent tag was added.
- The generated tag input keeps its own keyboard and screen reader behavior.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
