# Form Value Formats

This developer-focused example compares the exact native form values produced by default CSV, custom comma-and-space, and strict space-delimited serialization. It also includes a JSON configuration snippet for unambiguous multiword tags.

## What this example shows

- Live synchronized source values beside three editable tag inputs.
- The distinction between input separators and output serialization.
- Custom `serializer` and matching `parser` functions.
- A whitespace validation rule that keeps space-delimited output unambiguous.
- A native `FormData` submission preview and form reset behavior.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/form-value-formats/index.html`.

## What to try

- Add and remove tags in each editor and inspect the synchronized value.
- Add a multiword tag to the CSV and comma-and-space examples.
- Try a multiword tag in the strict space-delimited example and review the validation message.
- Preview the submitted values, then reset the form.

## Accessibility notes

- Each textarea has a visible label and associated help text before enhancement.
- The plugin supplies its standard keyboard model, remove-button names, validation relationships, and status announcements.
- Continuously changing value previews are intentionally non-live; only the explicit submission preview is announced.
- Native reset behavior does not intentionally move focus or add a reset announcement; the submitted preview remains a historical snapshot.
- The shared demo stylesheet supports small screens, visible focus, reduced motion, and forced colors.

## Limitations

Space-delimited serialization cannot safely represent tags that contain spaces without an escaping convention. Prefer JSON when values may contain spaces or delimiter characters. The example intercepts submission and does not send data to a server.

## Files

- `index.html`
- `README.md`
- Shared presentation: `examples/addon-demo.css`
