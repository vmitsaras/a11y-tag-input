# Form Reset Playground

This example compares a tag input's initial, current, submitted, and most recently reset values.

Run `npm run build`, then open or serve `examples/form-reset-playground/index.html`.

## What to try

- Edit the tags and observe Current while Initial remains unchanged.
- Submit and verify only Submitted captures the current snapshot.
- Edit again, then use the native Reset button.
- Confirm Current and Reset match the restored defaults without a reset announcement or focus move.

Values are rendered as JSON arrays so empty and multilingual tags remain unambiguous.
