# Character Count Addon Recipe

This example shows an addon-style character count beside the generated tag input.

## What this example shows

- A maximum tag length enforced through the core plugin.
- A visible count that updates while a user types.
- A polite status update for the current character count.
- A realistic research-topic tagging scenario.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/character-count/index.html`.

## What to try

- Type a short tag and press Enter.
- Type a long tag and inspect the count.
- Remove an existing tag with the keyboard.
- Confirm the original textarea value stays synchronized.

## Accessibility notes

- The textarea has a label and description before JavaScript initializes.
- The generated input keeps plugin keyboard behavior.
- The count uses an `output` with polite updates.
- This is an addon-style recipe, not a separate exported addon module.

## Files

- `index.html`
- `../addon-demo.css`
