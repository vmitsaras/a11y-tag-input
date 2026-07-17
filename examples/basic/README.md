# Basic Example

This example progressively enhances a labelled `textarea` into an accessible tag input. It demonstrates initial value parsing, lowercase normalization from `data-lowercase="true"`, a five-tag limit from `data-max-tags="5"`, keyboard removal, live status messages, and synchronized form submission values.

## Run It

Build the package first so the example can import the generated files:

```bash
npm run build
```

Then open `examples/basic/index.html` in a browser. The page imports `../../dist/index.js` and links `../../dist/styles.css`.

## What To Try

1. Tab to the Topics input.
2. Type `Design` and press Enter.
3. Type `Research;Forms` to add two tags with a configured separator.
4. Press Backspace from an empty input to move focus to the final remove button.
5. Use ArrowLeft and ArrowRight between remove buttons.
6. Press Tab from a remove button and confirm focus leaves the tag editor instead of visiting every tag.
7. Press Delete or Backspace on a focused remove button.
8. Add tags until the five-tag limit is reached.
9. Type after the limit and confirm new text is blocked while Backspace still reaches the final remove button.
10. Submit the form and confirm the serialized textarea value is shown in the demo output.

## Accessibility Checks

- Confirm the visible input is labelled by "Topics".
- Confirm remove buttons have names such as "Remove tag accessibility".
- Confirm validation errors set `aria-invalid` and expose an error message.
- Confirm add, remove, duplicate, paste, and limit feedback is announced through the status region.
- Confirm the limit-reached input is exposed as read-only, not disabled, so keyboard recovery still works.
- Confirm form submission updates the demo output politely.
- Confirm focus remains visible on the input, remove buttons, and submit button.
- Confirm the layout works at 320px wide and 200% browser zoom.
- Confirm forced-colors mode preserves text, borders, and focus outlines.

## Limitations

This example is a static package demo, not a full application form. It does not submit data to a server, and it does not prove support for every screen reader/browser combination. Test the plugin with your target form validation, backend format, browsers, and assistive technologies before shipping.
