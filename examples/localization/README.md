# German Localization Recipe

This example shows how to replace the complete `TagInputMessages` catalog with German text while keeping dynamic message tokens, keyboard behavior, focus handling, and status announcements intact.

## What this example shows

- A complete `messages` override passed to `createTagInput()`.
- Localized visible labels, hidden instructions, errors, counters, remove-button names, and live status messages.
- The `lang="de"` attribute applied to the localized widget region.
- Dynamic `{tag}`, `{count}`, `{max}`, `{min}`, and `{skipped}` message tokens.
- Duplicate, paste-summary, limit-reached, add, and remove states.

## How to run

Build the package first:

```bash
npm run build
```

Then open or serve `examples/localization/index.html`.

## What to try

- Add a new German topic and listen for the localized success message.
- Add `barrierefreiheit` again to trigger the duplicate error.
- Paste `forschung,tests` to trigger the localized paste summary.
- Reach the four-tag limit and inspect the localized counter and limit feedback.
- Remove a tag and confirm its accessible button name and status message are in German.

## Accessibility notes

- Set the correct `lang` on the localized widget or an ancestor so assistive technologies can select the intended pronunciation rules.
- Translate visible and non-visible messages together; hidden instructions and live announcements are part of the user experience.
- Preserve interpolation tokens wherever the translated message needs the corresponding runtime value. Tokens can be reordered to match the target language.
- Review translations in context because longer text may affect layout and concise announcements are easier to understand.
- Test localized wording with the target browser and assistive technology combination before shipping.

## Developer notes

- The source control selector is `#content-topics`.
- The example imports `createTagInput` from `../../dist/index.js` and package styles from `../../dist/styles.css`.
- The shared demo presentation comes from `../addon-demo.css`.
- `createTagInput(source, { messages: { ... } })` accepts partial overrides, so an application can replace only the messages it needs. A complete override is shown here to make the localization surface explicit.

## Files

- `index.html`
- `../addon-demo.css`
