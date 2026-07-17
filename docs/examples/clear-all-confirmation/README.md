# Clear All Confirmation Recipe

This example wraps the existing `clear()` method in an inline confirmation flow.

## What this example shows

- A persistent Clear all trigger with Confirm and Cancel controls.
- Focus recovery when the temporary confirmation controls close.
- One deliberate result announcement through the tag input's own status region.
- Empty-state disabling driven by `a11y-tag-input:render`.

## How to run

Run `npm run build`, then open or serve `examples/clear-all-confirmation/index.html`.

## What to try

- Open confirmation, press Escape, and confirm focus returns to Clear all tags.
- Open confirmation and choose Cancel.
- Confirm clearing and verify the source value is empty and the result is announced once.

This is an addon-style recipe. It adds no exported API or separate live region.
