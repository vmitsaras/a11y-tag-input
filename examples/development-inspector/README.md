# Development inspector example

This example shows how a design-system or documentation team can inspect tag input markup before initialization. It compares an intentionally flawed fixture with corrected markup and renders the returned diagnostics without modifying either fixture. A separate live example shows the corrected markup after normal runtime initialization.

Both inspection fixtures are hidden, wrapped in `inert`, and excluded from the accessibility tree. The inspector can still query those DOM subtrees, while users interact with the clearly identified live example instead of encountering raw, unavailable textareas.

## Run it

Build the package first so the example can import `../../dist/dev.js`:

```bash
npm run build
```

Then serve the repository with a local web server and open `examples/development-inspector/`.

## What to try

1. Tab to **Inspect flawed markup** and activate it.
2. Confirm that the status reports four diagnostics.
3. Review the ordered list for these codes:
   - `missing-accessible-name`
   - `invalid-output-format`
   - `output-target-not-found`
   - `malformed-messages-json`
4. Activate **Inspect corrected markup**.
5. Confirm that the status reports no diagnostics and the previous list is cleared.
6. In **Try the corrected tag input**, add a tag with <kbd>Enter</kbd> and remove an existing tag.

## Accessibility behavior

- Both inspection actions are native buttons.
- The result count is exposed through a status region.
- Diagnostic details remain in a normal ordered list for deliberate review instead of being announced as one long live-region update.
- The static inspection fixtures are not visible, keyboard reachable, or exposed to assistive technologies.
- The separate corrected example is initialized with the normal package entry and remains available for keyboard and assistive-technology testing.

## Development integration

Importing `a11y-tag-input/dev` does not initialize controls or log diagnostics. `inspectTagInputs()` returns structured results so the consuming test runner, documentation preview, or development overlay can decide how to present them.

The normal `a11y-tag-input` entry does not run the inspector automatically.

## Limitations

The inspector checks static authored markup and selected configuration relationships. It is not a complete accessible-name computation, runtime accessibility audit, screen-reader test, or WCAG conformance check. WCAG references in diagnostics are review pointers only.
