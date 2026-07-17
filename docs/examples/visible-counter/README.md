# Visible Counter Addon Recipe

This example shows a visible max-tag counter for a hiring skills field.

## What this example shows

- A four-tag limit.
- A visible counter and meter that update after add, remove, and limit events.
- A synchronized form value preview.
- Limit recovery by removing a tag.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/visible-counter/index.html`.

## What to try

- Add two more tags.
- Try adding a fifth tag.
- Remove one tag and add another.
- Submit the form and inspect the serialized value.

## Accessibility notes

- The visible counter uses an `output` with polite updates.
- The plugin keeps its internal counter connected to the field when `maxTags` is finite.
- The limit state is explained in text, not color alone.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
