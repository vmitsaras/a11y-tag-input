# A11y Tag Input

Accessible, framework-agnostic tag input behavior for native `input` and `textarea` controls.

The plugin progressively enhances existing form markup, keeps a native value control synchronized for submission, and exposes a typed JavaScript API for custom parsing, validation, serialization, hooks, and lifecycle cleanup.

## Installation

Use the package name below when the package is available from your registry. During local development, use your workspace setup or a tarball from `npm pack`.

```bash
npm install a11y-tag-input
pnpm add a11y-tag-input
yarn add a11y-tag-input
```

## Usage

Import the JavaScript entry and the optional default stylesheet. Importing the package does not auto-initialize controls.

```ts
import { createTagInput } from "a11y-tag-input";
import "a11y-tag-input/styles.css";

const source = document.querySelector("[data-a11y-tag-input]");

if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
  const tagInput = createTagInput(source, {
    maxTags: 10,
    separators: [",", ";", "Enter"],
    lowercase: true
  });

  tagInput.addTag("accessibility");
}
```

Use `initTagInputs()` to initialize every matching control in a document or fragment:

```ts
import { initTagInputs } from "a11y-tag-input";
import "a11y-tag-input/styles.css";

initTagInputs({
  root: document,
  selector: "[data-a11y-tag-input]"
});
```

## HTML Structure

Start with a labelled native form control. The original control is hidden from interaction after initialization, stays synchronized for form submission, and is restored on `destroy()`.

When the source belongs to a form, the widget listens to that form's native `reset` event. After the browser restores form-control defaults, the visible tags are rebuilt from the synchronized value element. Reset reconciliation clears draft input and stale validation/status content, recomputes required, limit, disabled, and read-only presentation, and does not move focus or add a reset announcement.

```html
<div class="a11y-tag-input" data-a11y-tag-input-root>
  <label for="post-tags">Tags</label>
  <textarea
    id="post-tags"
    name="tags"
    data-a11y-tag-input
    data-max-tags="10"
    placeholder="Add a tag"
  >accessibility,forms</textarea>
</div>
```

The plugin recognizes `input[data-a11y-tag-input]`, `textarea[data-a11y-tag-input]`, and the legacy `data-tag-input` attribute. A root wrapper can be marked with `data-a11y-tag-input-root` or `.a11y-tag-input`.

## CSS And Theming

Import the default stylesheet when you want baseline layout, visible focus states, readable tag chips, validation states, and disabled/read-only styling:

```ts
import "a11y-tag-input/styles.css";
```

The stylesheet uses the `.a11y-tag-input` block. Public custom properties are scoped to that block:

| Custom property | Purpose |
|---|---|
| `--a11y-tag-input-gap` | Space between chips and the editable field. |
| `--a11y-tag-input-radius` | Border radius for the control, chips, and remove buttons. |
| `--a11y-tag-input-border-color` | Default control border. |
| `--a11y-tag-input-background` | Control background. |
| `--a11y-tag-input-chip-background` | Chip background. |
| `--a11y-tag-input-chip-color` | Chip text and remove-button color. |
| `--a11y-tag-input-error-color` | Error border and text color. |
| `--a11y-tag-input-focus-ring` | Focus outline color. |
| `--a11y-tag-input-disabled-background` | Disabled, read-only, and limit-reached background. |
| `--a11y-tag-input-muted-color` | Placeholder and supporting text color. |
| `--a11y-tag-input-min-target-size` | Minimum interactive target size. |

State classes include `.a11y-tag-input--invalid`, `.a11y-tag-input--disabled`, `.a11y-tag-input--readonly`, and `.a11y-tag-input--limit-reached`. The default CSS includes forced-colors adjustments and reduces transition duration for `prefers-reduced-motion: reduce`.

## API

### `createTagInput(source, options)`

Initializes one `HTMLInputElement` or `HTMLTextAreaElement` and returns a `TagInputInstance`.

```ts
const instance = createTagInput(source, options);
```

Calling `createTagInput()` again with the same source element returns the existing instance instead of duplicating generated markup.

### `initTagInputs(options)`

Initializes every matching source control in `document` or a provided `root`.

```ts
const instances = initTagInputs({
  root: document,
  selector: "[data-a11y-tag-input]"
});
```

### `A11yTagInput`

The exported class implements `TagInputInstance` and includes `A11yTagInput.getInstance(source)` for looking up an initialized source element.

### Helper Exports

The package also exports helper utilities used by the runtime:

| Export | Purpose |
|---|---|
| `defaultMessages` | Default localized message templates. |
| `builtinTransforms` | Built-in `trim`, `lowercase`, and `normalizeWhitespace` transforms. |
| `formatMessage(template, values)` | Replaces `{token}` placeholders in messages. |
| `parseSeparators(separators)` | Normalizes separator option values. |
| `defaultParser(input, context)` | Splits text into candidate tags. |
| `serializeTags(tags, context)` | Serializes tags as CSV, JSON, newline text, or array. |
| `runTransforms(value, context)` | Applies built-in and custom transforms. |
| `runValidators(tag, context)` | Applies built-in and custom validators. |

## Options

```ts
interface TagInputOptions {
  separators?: string[] | string;
  maxTags?: number;
  allowDuplicates?: boolean;
  trim?: boolean;
  lowercase?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  inputMode?: string;
  outputFormat?: "csv" | "json" | "newline" | "array";
  minLength?: number;
  maxLength?: number;
  invalidChars?: RegExp | string | null;
  parser?: TagInputParser | null;
  serializer?: TagInputSerializer | null;
  transforms?: TagInputTransform[];
  validators?: TagInputValidator[];
  messages?: Partial<TagInputMessages>;
  hooks?: Partial<TagInputHooks>;
  valueElement?: HTMLInputElement | HTMLTextAreaElement | string | null;
}
```

| Option | Default | Description |
|---|---|---|
| `separators` | `[",", ";", "Enter"]` | Separators that commit typed or pasted text. |
| `maxTags` | `Infinity` | Maximum number of tags before the generated input is treated as limit-reached. New character input is blocked until a tag is removed. |
| `allowDuplicates` | `false` | Allows repeated tag values when `true`. |
| `trim` | `true` | Trims candidate tags before validation. |
| `lowercase` | `false` | Converts candidate tags to lowercase before validation. |
| `readonly` | `false` | Prevents user edits and disables remove buttons. |
| `disabled` | `false` | Disables the generated field and synchronized source control. |
| `autocomplete` | `"off"` | Sets the generated text input autocomplete value. |
| `inputMode` | `"text"` | Sets the generated text input input mode. |
| `outputFormat` | `"csv"` | Serializes tags as `csv`, `json`, `newline`, or `array`. Array output is written as JSON when synchronized to a form value. |
| `minLength` | `1` | Minimum tag length. |
| `maxLength` | `50` | Maximum tag length. The source control `maxLength` can cap this value. |
| `invalidChars` | `null` | Regular expression or pattern string that rejects matching tags. |
| `parser` | `defaultParser` | Custom parser for typed, pasted, and initial text. |
| `serializer` | `null` | Custom serializer for the synchronized value. |
| `transforms` | `[]` | Custom transforms that can change or reject a candidate tag. |
| `validators` | `[]` | Custom validators that can reject a candidate tag with a direct `message`, a configured `messageKey`, or the default invalid-tag fallback. |
| `messages` | `defaultMessages` | Message overrides for labels, status text, and validation errors. |
| `hooks` | `{}` | Lifecycle hooks around add, validate, render, remove, and serialize steps. |
| `valueElement` | source control | Alternate input or textarea, or a selector inside the root, used for serialized form value output. |

Options can also be provided with safe `data-*` attributes:

| Attribute | Maps to |
|---|---|
| `data-separators` | `separators` |
| `data-max-tags` | `maxTags` |
| `data-allow-duplicates` | `allowDuplicates` |
| `data-trim` | `trim` |
| `data-lowercase` | `lowercase` |
| `data-readonly` | `readonly` |
| `data-disabled` | `disabled` |
| `data-autocomplete` | `autocomplete` |
| `data-input-mode` | `inputMode` |
| `data-output-format` | `outputFormat` |
| `data-min-length` | `minLength` |
| `data-max-length` | `maxLength` |
| `data-invalid-chars` | `invalidChars` |
| `data-messages` | JSON object of message overrides |
| `data-output-target` | selector for an alternate synchronized value element |

## Hooks

Hooks are optional and run with the instance context.

```ts
createTagInput(source, {
  hooks: {
    beforeAdd(value) {
      return value.replace(/^#/, "");
    },
    afterAdd(value, context) {
      console.log("Added", value, context.getTags());
    }
  }
});
```

Available hook names are `beforeAdd`, `beforeValidate`, `afterValidate`, `afterAdd`, `beforeRemove`, `afterRemove`, `beforeRender`, `afterRender`, `beforeSerialize`, and `afterSerialize`.

## Instance Methods

```ts
interface TagInputInstance {
  getTags(): string[];
  setTags(tags: string[]): void;
  addTag(value: string, meta?: TagMutationMeta): boolean;
  removeTag(indexOrValue: number | string, meta?: TagMutationMeta): boolean;
  clear(): void;
  focus(): void;
  validate(): boolean;
  setValidationError(message: string | null): void;
  disable(): void;
  enable(): void;
  readonly(value?: boolean): void;
  destroy(): void;
}
```

`addTag()` and `removeTag()` return `false` when validation, read-only/disabled state, hooks, or cancelable events prevent the mutation. `setValidationError()` lets a form-level validator route a message through the tag input's existing visible error and `aria-errormessage` relationship; pass `null` or an empty string to clear it. The method does not announce automatically, so the integration can use one deliberate summary or live-region strategy. `destroy()` removes generated UI, event listeners, state classes, and restores the original source control.

## Events

Lifecycle events bubble from the original source control and include the current `tags` array plus the `instance` in `event.detail`.

| Event | Notes |
|---|---|
| `a11y-tag-input:init` | Fires after generated UI is created and initial tags load. |
| `a11y-tag-input:before-add` | Cancelable. Fires before a tag is added. |
| `a11y-tag-input:add` | Fires after a tag is added. |
| `a11y-tag-input:invalid` | Fires when validation rejects a tag. |
| `a11y-tag-input:limit` | Fires when the max tag limit rejects a tag. |
| `a11y-tag-input:before-remove` | Cancelable. Fires before a tag is removed. |
| `a11y-tag-input:remove` | Fires after a tag is removed. |
| `a11y-tag-input:render` | Fires after tags are rendered. |
| `a11y-tag-input:change` | Fires after an add or remove changes the tag list. |
| `a11y-tag-input:destroy` | Fires before generated UI is removed. |

## Keyboard Behavior

| Key | Behavior |
|---|---|
| `Tab` / `Shift+Tab` | Enters or leaves the tag editor through its current single Tab stop. The generated input is the initial stop. |
| `Enter` | Adds the current input value as a tag after any active IME composition ends. |
| Configured single-character separators, such as `,` or `;` | Add the current input value as a tag after any active IME composition ends. |
| `Backspace` from an empty input | Moves focus to the final tag remove button. |
| `ArrowLeft` / `ArrowRight` on remove buttons | Moves between remove buttons, or back to the input from the final button. |
| `Home` / `End` on remove buttons | Moves to the first remove button or back to the input. |
| `Delete` / `Backspace` on a remove button | Removes the focused tag. |
| `Escape` in the input | Clears the current input value. |
| Character input after the max-tag limit | Prevents new text entry, keeps focus on the generated input, and updates the status message. |

## Accessibility Notes

The plugin is designed to support progressive enhancement of labelled form controls. It still needs testing with your target browsers, devices, and assistive technologies.

- All labels associated with the source control are retargeted to the generated visible input, including explicit labels outside the component root and wrapping labels.
- Authored `aria-labelledby` and `aria-label` names are preserved using their normal accessible-name precedence.
- The generated control uses `role="group"` and links the label, instructions, counter, and validation message with ARIA relationships.
- Selected tags render as a labelled list with real `button` controls for removal.
- Validation errors use `aria-invalid`, `aria-errormessage`, visible error text, and status feedback without adding the error to a second competing description path.
- Add, remove, paste, limit, and validation feedback is written to one persistent polite live region with `role="status"`.
- Identical messages from later actions are cleared and reinserted in a separate update so they remain eligible for announcement. A paste operation produces one summary, and repeated character keys at the tag limit do not keep rewriting the same message.
- Disabled and read-only states are reflected on the generated field, source control, root classes, and remove buttons.
- The limit-reached state is exposed as read-only on the generated input so users can still focus the field and use Backspace to reach remove buttons.
- Focus can move from the empty input to remove buttons and back to the input with keyboard commands.
- Exactly one generated control participates in the page Tab sequence at a time. Tab is not intercepted; arrow keys, Home, End, and empty-field Backspace manage focus inside the editor.
- For required controls, the generated focusable field owns native constraint validation while enhanced. The hidden source remains synchronized for submission, and its original `required` state is restored on `destroy()`.
- Native form reset restores the visible tags from the post-reset source or alternate value element, keeping visible, submitted, and programmatic values aligned without forcing focus or announcing the reset.
- The original source control is hidden from interaction during enhancement and restored on `destroy()`.
- Default CSS preserves visible focus indicators, supports forced-colors mode, and respects reduced-motion preferences for transitions. Recorded Chrome checks measure the default text, boundary, and focus colors and exercise the system-color fallbacks.
- The component wraps long labels, tags, and errors inside narrow containers; automated browser evidence covers 240px component containers and demo layouts from 320px through 1920px.

## Development Setup Inspector

The optional development entry scans authored markup on demand and returns structured diagnostics. It does not initialize controls, mutate the DOM, or log automatically, and it is separate from the normal runtime entry.

```ts
import { inspectTagInputs } from "a11y-tag-input/dev";

const diagnostics = inspectTagInputs({
  root: document,
  selector: "[data-a11y-tag-input]"
});

for (const item of diagnostics) {
  // Send to your own test reporter, overlay, or documentation tooling.
  console.log(item.code, item.severity, item.message, item.element);
}
```

Each `TagInputDiagnostic` includes a stable `code`, `severity`, human-readable `message`, and the relevant `element`. Some diagnostics include `relatedElements` and likely `wcag` review pointers. WCAG pointers are triage aids only: they do not establish conformance or prove a failure.

| Code | Detects |
|---|---|
| `invalid-selector` | Invalid selector passed to the inspector. |
| `duplicate-id` | IDs repeated inside the inspection root. |
| `nested-root` | A tag input root nested inside another tag input root. |
| `missing-accessible-name` | No detectable label, `aria-label`, or usable `aria-labelledby` text. |
| `broken-labelledby-reference` | Missing IDs referenced by `aria-labelledby`. |
| `invalid-output-format` | Unsupported `data-output-format` value. |
| `invalid-output-target-selector` | Malformed `data-output-target` selector. |
| `output-target-not-found` | Output selector does not match inside the component root. |
| `output-target-invalid-element` | Output selector resolves to something other than an input or textarea. |
| `malformed-messages-json` | Invalid JSON in `data-messages`. |
| `invalid-messages-value` | Valid JSON in `data-messages` that is not an object. |
| `contradictory-disabled-state` | Native `disabled` conflicts with `data-disabled="false"`. |
| `contradictory-readonly-state` | Native `readonly` conflicts with `data-readonly="false"`. |
| `contradictory-length-limits` | Minimum length is greater than maximum length. |

The inspector checks static authored markup and simple relationships. It is not an accessibility audit, an accessible-name computation engine, runtime validation, or assistive-technology testing. Run it before initialization so generated plugin markup does not obscure authoring issues. See the [development inspector example](examples/development-inspector).

## Limitations

- The plugin does not claim complete WCAG conformance or universal screen reader support by itself.
- The default parser is delimiter-based; use a custom `parser` for quoted CSV, escaped delimiters, or locale-specific tokenization.
- Tag values are plain text only. The runtime does not render custom tag markup.
- The package does not auto-initialize on import.
- Selectors for `valueElement` and `data-output-target` are resolved inside the tag input root.
- Form-reset synchronization is scoped to the source control's owning form (or the alternate value element's form when the source has none). Changes made outside the native reset lifecycle require an explicit `setTags()` call.
- Paste validation is summarized in the status region. DOM tests cover status timing and relationships, but announcement order and wording still need checks with your target screen reader/browser stack.
- Manual testing is still needed for your form validation flow, submission behavior, actual 200% browser zoom, real Windows High Contrast rendering, touch/virtual-keyboard comfort, and assistive technology support. Recheck contrast whenever consuming CSS overrides the default theme tokens or surrounding backgrounds.

## Accessibility QA Artifacts

- Manual scenarios: [`docs/accessibility-test-scenarios.md`](docs/accessibility-test-scenarios.md)
- Keyboard/focus state matrix: [`docs/keyboard-focus-state-matrix.md`](docs/keyboard-focus-state-matrix.md)
- Screen reader announcement matrix: [`docs/screen-reader-announcement-matrix.md`](docs/screen-reader-announcement-matrix.md)
- Responsive layout QA: [`docs/responsive-layout-qa.md`](docs/responsive-layout-qa.md)
- Color contrast and forced-colors QA: [`docs/color-contrast-forced-colors-qa.md`](docs/color-contrast-forced-colors-qa.md)
- Findings disposition: [`docs/accessibility-findings-disposition.md`](docs/accessibility-findings-disposition.md)
- WCAG evidence notes: [`docs/wcag-evidence-map.md`](docs/wcag-evidence-map.md)

## Examples

All examples are static, framework-free pages that import from the built `dist` files.

| Example | What it demonstrates |
|---|---|
| [`examples/basic`](examples/basic) | Basic textarea enhancement, lowercase normalization, max tag limit, and form value sync. |
| [`examples/character-count`](examples/character-count) | Addon-style visible character count for the current tag value. |
| [`examples/clear-all-confirmation`](examples/clear-all-confirmation) | Inline clear-all confirmation using `clear()`, focus recovery, and one component status announcement. |
| [`examples/duplicate-feedback`](examples/duplicate-feedback) | Addon-style duplicate rejection feedback using built-in validation events. |
| [`examples/development-inspector`](examples/development-inspector) | Compare flawed and corrected markup while reviewing on-demand structured development diagnostics. |
| [`examples/form-validator-integration`](examples/form-validator-integration) | Publish-article form combining committed-tag validation with A11y Form Validator's error summary. |
| [`examples/form-reset-playground`](examples/form-reset-playground) | Visible comparison of initial, current, submitted, and natively reset values. |
| [`examples/form-value-formats`](examples/form-value-formats) | Compare default CSV, comma-and-space, strict space-delimited, and JSON form values with copyable JavaScript. |
| [`examples/localization`](examples/localization) | Complete German localization of labels, instructions, validation errors, counters, and live messages. |
| [`examples/multilingual-stress-test`](examples/multilingual-stress-test) | IME, bidirectional text, emoji, accented text, and long-value stress testing. |
| [`examples/presets`](examples/presets) | Addon-style preset buttons that call `setTags()`. |
| [`examples/recent-tags`](examples/recent-tags) | Addon-style recent tag buttons that call `addTag()`. |
| [`examples/validation-hints`](examples/validation-hints) | Addon-style validation hints for length and character rules. |
| [`examples/visible-counter`](examples/visible-counter) | Addon-style visible max-tag counter beside the field. |

Build first, then open an example:

```bash
npm run build
```

## GitHub Pages Demo

This repository can publish the demo and documentation from the committed `/docs` folder.

Regenerate the package output and Pages files with:

```bash
npm run pages:build
```

Then configure GitHub Pages once:

1. Open the repository Settings.
2. Go to Pages.
3. Set Build and deployment to "Deploy from a branch".
4. Choose the branch you publish from.
5. Choose `/docs` as the folder.

The generated `/docs` folder contains `index.html`, `.nojekyll`, demo pages under `docs/examples/`, and package runtime files under `docs/dist/`.

## Docs Metadata

The package exports structured docs metadata for local documentation tooling:

```ts
import { docs } from "a11y-tag-input/docs";
```

## Development Checks

The package currently defines these local checks:

```bash
npm run build
npm run typecheck
npm run test
npm run pack:check
```
