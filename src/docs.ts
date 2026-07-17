export interface PluginDocs {
  slug: string;
  name: string;
  packageName: string;
  description: string;
  repo?: string;
  npm?: string;
  install: {
    npm: string;
    pnpm: string;
    yarn: string;
  };
  usage: string;
  selectors?: string[];
  css?: {
    import: string;
    block: string;
    customProperties: string[];
    stateClasses: string[];
  };
  dataAttributes?: Array<{
    name: string;
    option: string;
    description: string;
  }>;
  keyboard?: Array<{
    key: string;
    description: string;
  }>;
  api: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  options?: Array<{
    name: string;
    type: string;
    default: string;
    description: string;
  }>;
  methods?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  events?: Array<{
    name: string;
    description: string;
    cancelable?: boolean;
  }>;
  accessibility?: string[];
  limitations?: string[];
  examples?: Array<{
    name: string;
    description: string;
    path: string;
  }>;
}

const packageName = "a11y-tag-input";

export const docs = {
  slug: "a11y-tag-input",
  name: "A11y Tag Input",
  packageName,
  description: "Accessible, framework-agnostic tag input behavior for semantic form controls.",
  repo: "https://github.com/vmitsaras/a11y-tag-input",
  install: {
    npm: `npm install ${packageName}`,
    pnpm: `pnpm add ${packageName}`,
    yarn: `yarn add ${packageName}`
  },
  usage: `import { createTagInput } from "${packageName}";
import "${packageName}/styles.css";

const source = document.querySelector("[data-a11y-tag-input]");

if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) {
  createTagInput(source, {
    maxTags: 10,
    separators: [",", ";", "Enter"],
    lowercase: true
  });
}`,
  selectors: [
    "input[data-a11y-tag-input]",
    "textarea[data-a11y-tag-input]",
    "input[data-tag-input]",
    "textarea[data-tag-input]",
    "[data-a11y-tag-input-root]",
    ".a11y-tag-input"
  ],
  css: {
    import: `${packageName}/styles.css`,
    block: ".a11y-tag-input",
    customProperties: [
      "--a11y-tag-input-gap",
      "--a11y-tag-input-radius",
      "--a11y-tag-input-border-color",
      "--a11y-tag-input-background",
      "--a11y-tag-input-chip-background",
      "--a11y-tag-input-chip-color",
      "--a11y-tag-input-error-color",
      "--a11y-tag-input-focus-ring",
      "--a11y-tag-input-disabled-background",
      "--a11y-tag-input-muted-color",
      "--a11y-tag-input-min-target-size"
    ],
    stateClasses: [
      ".a11y-tag-input--invalid",
      ".a11y-tag-input--disabled",
      ".a11y-tag-input--readonly",
      ".a11y-tag-input--limit-reached"
    ]
  },
  dataAttributes: [
    {
      name: "data-separators",
      option: "separators",
      description: "Sets delimiter keys or characters for parsing and committing tags."
    },
    {
      name: "data-max-tags",
      option: "maxTags",
      description: "Sets the maximum number of tags."
    },
    {
      name: "data-allow-duplicates",
      option: "allowDuplicates",
      description: "Allows repeated tag values when true."
    },
    {
      name: "data-trim",
      option: "trim",
      description: "Controls whether candidate tags are trimmed."
    },
    {
      name: "data-lowercase",
      option: "lowercase",
      description: "Controls whether candidate tags are lowercased."
    },
    {
      name: "data-readonly",
      option: "readonly",
      description: "Starts the generated control in read-only mode."
    },
    {
      name: "data-disabled",
      option: "disabled",
      description: "Starts the generated control in disabled mode."
    },
    {
      name: "data-output-format",
      option: "outputFormat",
      description: "Sets serialized output as csv, json, newline, or array."
    },
    {
      name: "data-min-length",
      option: "minLength",
      description: "Sets the minimum tag length."
    },
    {
      name: "data-max-length",
      option: "maxLength",
      description: "Sets the maximum tag length."
    },
    {
      name: "data-invalid-chars",
      option: "invalidChars",
      description: "Sets a pattern for characters that reject a tag."
    },
    {
      name: "data-messages",
      option: "messages",
      description: "Provides JSON message overrides."
    },
    {
      name: "data-output-target",
      option: "valueElement",
      description: "Selects an alternate value element inside the root."
    },
    {
      name: "data-autocomplete",
      option: "autocomplete",
      description: "Sets the generated text input autocomplete value."
    },
    {
      name: "data-input-mode",
      option: "inputMode",
      description: "Sets the generated text input input mode."
    }
  ],
  keyboard: [
    {
      key: "Tab / Shift+Tab",
      description: "Enters or leaves the tag editor through its current single Tab stop; the input is the initial stop."
    },
    {
      key: "Enter",
      description: "Adds the current input value as a tag after any active IME composition ends."
    },
    {
      key: ", / ;",
      description: "Adds the current input value when those separators are configured and IME composition has ended."
    },
    {
      key: "Backspace",
      description: "From an empty field, moves focus to the final tag remove button."
    },
    {
      key: "ArrowLeft / ArrowRight",
      description: "Moves focus between tag remove buttons or back to the input from the final button."
    },
    {
      key: "Home / End",
      description: "Moves to the first tag remove button or back to the input field."
    },
    {
      key: "Delete / Backspace",
      description: "Removes a focused tag."
    },
    {
      key: "Escape",
      description: "Clears the current input field value."
    },
    {
      key: "Character input at max limit",
      description: "Prevents new text entry, keeps focus on the generated input, and updates the status message."
    }
  ],
  api: [
    {
      name: "createTagInput(source, options)",
      type: "(source: HTMLInputElement | HTMLTextAreaElement, options?: TagInputOptions) => TagInputInstance",
      description: "Initializes one native form control and returns a tag input instance."
    },
    {
      name: "initTagInputs(options)",
      type: "(options?: InitTagInputsOptions) => TagInputInstance[]",
      description: "Initializes every matching tag input source in a root document or fragment."
    },
    {
      name: "inspectTagInputs(options)",
      type: "(options?: InspectTagInputsOptions) => TagInputDiagnostic[]",
      description: "Development-only a11y-tag-input/dev export that inspects authored markup without mutation or automatic logging."
    },
    {
      name: "A11yTagInput",
      type: "class A11yTagInput implements TagInputInstance",
      description: "Plugin class with duplicate-initialization protection, lifecycle events, and cleanup."
    },
    {
      name: "A11yTagInput.getInstance(source)",
      type: "(source: HTMLInputElement | HTMLTextAreaElement) => A11yTagInput | undefined",
      description: "Returns the existing instance for an initialized source element."
    },
    {
      name: "defaultMessages",
      type: "Readonly<TagInputMessages>",
      description: "Default localized message templates."
    },
    {
      name: "builtinTransforms",
      type: "Readonly<{ trim; lowercase; normalizeWhitespace }>",
      description: "Built-in transform helpers."
    },
    {
      name: "formatMessage(template, values)",
      type: "(template: string, values?: Record<string, number | string>) => string",
      description: "Interpolates message placeholders such as {tag}."
    },
    {
      name: "parseSeparators(separators)",
      type: "(separators: string[] | string | undefined) => string[]",
      description: "Normalizes separator configuration."
    },
    {
      name: "defaultParser(input, context)",
      type: "(input: string, context: Pick<TagInputParserContext, \"separators\">) => string[]",
      description: "Splits text into candidate tags using configured separators."
    },
    {
      name: "serializeTags(tags, context)",
      type: "(tags: string[], context: TagInputSerializerContext) => string[] | string",
      description: "Serializes tags as csv, json, newline text, array, or a custom serializer result."
    },
    {
      name: "runTransforms(value, context)",
      type: "(value: string, context: TagInputTransformContext) => false | string",
      description: "Applies built-in and custom transforms to a candidate tag."
    },
    {
      name: "runValidators(tag, context)",
      type: "(tag: string, context: TagInputValidatorContext) => TagInputValidationResult",
      description: "Applies built-in and custom validators to a candidate tag."
    }
  ],
  options: [
    {
      name: "separators",
      type: "string[] | string",
      default: "[\",\", \";\", \"Enter\"]",
      description: "Separators that commit typed or pasted text."
    },
    {
      name: "maxTags",
      type: "number",
      default: "Infinity",
      description: "Maximum number of tags before new character input is blocked until a tag is removed."
    },
    {
      name: "allowDuplicates",
      type: "boolean",
      default: "false",
      description: "Allows repeated tag values."
    },
    {
      name: "trim",
      type: "boolean",
      default: "true",
      description: "Trims candidate tags before validation."
    },
    {
      name: "lowercase",
      type: "boolean",
      default: "false",
      description: "Lowercases candidate tags before validation."
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Prevents user edits and disables remove buttons."
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the generated field and synchronized source control."
    },
    {
      name: "autocomplete",
      type: "string",
      default: "off",
      description: "Sets autocomplete on the generated input."
    },
    {
      name: "inputMode",
      type: "string",
      default: "text",
      description: "Sets inputMode on the generated input."
    },
    {
      name: "outputFormat",
      type: "\"csv\" | \"json\" | \"newline\" | \"array\"",
      default: "csv",
      description: "Controls serialized form value output."
    },
    {
      name: "minLength",
      type: "number",
      default: "1",
      description: "Minimum tag length."
    },
    {
      name: "maxLength",
      type: "number",
      default: "50",
      description: "Maximum tag length."
    },
    {
      name: "invalidChars",
      type: "RegExp | string | null",
      default: "null",
      description: "Rejects tags that match the pattern."
    },
    {
      name: "parser",
      type: "TagInputParser | null",
      default: "defaultParser",
      description: "Custom parser for typed, pasted, and initial text."
    },
    {
      name: "serializer",
      type: "TagInputSerializer | null",
      default: "null",
      description: "Custom serializer for synchronized values."
    },
    {
      name: "transforms",
      type: "TagInputTransform[]",
      default: "[]",
      description: "Custom candidate tag transforms."
    },
    {
      name: "validators",
      type: "TagInputValidator[]",
      default: "[]",
      description: "Custom validation checks that can provide a direct message or a configured message key; unknown keys fall back to the default invalid-tag message."
    },
    {
      name: "messages",
      type: "Partial<TagInputMessages>",
      default: "defaultMessages",
      description: "Message overrides for labels, status text, and validation."
    },
    {
      name: "hooks",
      type: "Partial<TagInputHooks>",
      default: "{}",
      description: "Lifecycle hooks around add, validate, render, remove, and serialize steps."
    },
    {
      name: "valueElement",
      type: "HTMLInputElement | HTMLTextAreaElement | string | null",
      default: "source",
      description: "Alternate element or selector for synchronized value output."
    }
  ],
  methods: [
    {
      name: "getTags()",
      type: "() => string[]",
      description: "Returns a copy of the current tags."
    },
    {
      name: "setTags(tags)",
      type: "(tags: string[]) => void",
      description: "Replaces the current tags and synchronizes the value."
    },
    {
      name: "addTag(value, meta)",
      type: "(value: string, meta?: TagMutationMeta) => boolean",
      description: "Adds a tag when transforms, hooks, events, and validators allow it."
    },
    {
      name: "removeTag(indexOrValue, meta)",
      type: "(indexOrValue: number | string, meta?: TagMutationMeta) => boolean",
      description: "Removes a tag by index or value when state, hooks, and events allow it."
    },
    {
      name: "clear()",
      type: "() => void",
      description: "Removes all tags and clears validation state."
    },
    {
      name: "focus()",
      type: "() => void",
      description: "Moves focus to the generated input."
    },
    {
      name: "validate()",
      type: "() => boolean",
      description: "Validates the required empty-state behavior."
    },
    {
      name: "setValidationError(message)",
      type: "(message: string | null) => void",
      description: "Sets or clears the existing visible and semantic tag-field error without announcing automatically."
    },
    {
      name: "disable()",
      type: "() => void",
      description: "Disables the generated input and source control."
    },
    {
      name: "enable()",
      type: "() => void",
      description: "Re-enables the generated input and source control."
    },
    {
      name: "readonly(value)",
      type: "(value?: boolean) => void",
      description: "Sets or clears read-only state."
    },
    {
      name: "destroy()",
      type: "() => void",
      description: "Removes generated UI, event listeners, state classes, and restores the source control."
    }
  ],
  events: [
    {
      name: "a11y-tag-input:init",
      description: "Fires after generated UI is created and initial tags load."
    },
    {
      name: "a11y-tag-input:before-add",
      description: "Fires before a tag is added.",
      cancelable: true
    },
    {
      name: "a11y-tag-input:add",
      description: "Fires after a tag is added."
    },
    {
      name: "a11y-tag-input:invalid",
      description: "Fires when validation rejects a tag."
    },
    {
      name: "a11y-tag-input:limit",
      description: "Fires when the max tag limit rejects a tag."
    },
    {
      name: "a11y-tag-input:before-remove",
      description: "Fires before a tag is removed.",
      cancelable: true
    },
    {
      name: "a11y-tag-input:remove",
      description: "Fires after a tag is removed."
    },
    {
      name: "a11y-tag-input:render",
      description: "Fires after tags are rendered."
    },
    {
      name: "a11y-tag-input:change",
      description: "Fires after an add or remove changes the tag list."
    },
    {
      name: "a11y-tag-input:destroy",
      description: "Fires before generated UI is removed."
    }
  ],
  accessibility: [
    "Progressively enhances labelled native input and textarea controls.",
    "Retargets every associated explicit or wrapping label to the generated visible input, including labels outside the component root.",
    "Preserves authored aria-labelledby and aria-label names using their normal accessible-name precedence.",
    "Uses a grouped generated control with instructions, counter, validation error, and status region relationships.",
    "Renders tags in a labelled list with real remove buttons.",
    "Uses aria-invalid, aria-errormessage, visible error text, and status feedback for validation errors without adding a competing description path.",
    "Writes add, remove, paste, limit, and validation feedback to one persistent polite status region.",
    "Makes identical messages from later actions eligible for announcement through a separate update, summarizes paste once, and avoids rewriting the same limit message for repeated character keys.",
    "Reflects disabled and read-only states on the generated field, source control, root classes, and remove buttons.",
    "Moves required constraint validation to the generated focusable field while enhanced and restores the source state on destroy.",
    "Synchronizes visible tags from the post-reset source or alternate value element after native form reset without forcing focus or adding an announcement.",
    "Exposes the max-tag limit as read-only on the generated input while keeping focus and removal recovery available.",
    "Maintains one generated Tab stop at a time and uses empty-field Backspace, arrows, Home, and End for internal focus movement without intercepting Tab.",
    "Wraps long labels, tags, and errors in narrow containers while preserving 44px generated field and remove-button targets.",
    "Default CSS includes visible focus styles, measured default contrast, forced-colors system-color fallbacks, and reduced-motion handling."
  ],
  limitations: [
    "Does not claim full WCAG conformance or universal assistive technology support.",
    "Default parsing is delimiter-based and does not handle quoted CSV or escaped delimiters.",
    "Tag values render as plain text only.",
    "The package does not auto-initialize on import.",
    "The development inspector provides static authoring diagnostics, not a conformance claim, full accessibility audit, or assistive technology test.",
    "valueElement selectors are resolved inside the tag input root.",
    "Form-reset synchronization listens only to the source control's owning form, or the alternate value element's form when the source has none; unrelated programmatic value changes require setTags().",
    "Paste validation is summarized in the status region; DOM timing and relationships are tested, while custom validators and actual speech still need target assistive technology checks.",
    "Manual testing is still needed for each consuming form, actual 200% browser zoom, real Windows High Contrast rendering, touch and virtual-keyboard comfort, and the target assistive technology stack; recheck contrast after overriding theme tokens or backgrounds."
  ],
  examples: [
    {
      name: "Basic",
      description: "Progressively enhances a textarea into an accessible tag input with lowercase normalization and a max-tag limit.",
      path: "examples/basic"
    },
    {
      name: "Character Count",
      description: "Addon-style recipe that shows a visible character count for the current tag value.",
      path: "examples/character-count"
    },
    {
      name: "Clear All Confirmation",
      description: "Addon-style inline confirmation for clear(), with focus recovery and one status announcement.",
      path: "examples/clear-all-confirmation"
    },
    {
      name: "Duplicate Feedback",
      description: "Addon-style recipe for clearer duplicate tag rejection feedback.",
      path: "examples/duplicate-feedback"
    },
    {
      name: "Development Inspector",
      description: "Compares flawed and corrected markup while demonstrating development-only structured diagnostics.",
      path: "examples/development-inspector"
    },
    {
      name: "Form Validator Integration",
      description: "Publish-article form combining committed-tag validation with A11y Form Validator's error summary.",
      path: "examples/form-validator-integration"
    },
    {
      name: "Form Reset Playground",
      description: "Form-state lab comparing initial, current, submitted, and natively reset tag values.",
      path: "examples/form-reset-playground"
    },
    {
      name: "Form Value Formats",
      description: "Developer lab for default CSV, custom readable, strict space-delimited, and JSON form values.",
      path: "examples/form-value-formats"
    },
    {
      name: "Localization",
      description: "German localization recipe for labels, instructions, validation errors, counters, and live status messages.",
      path: "examples/localization"
    },
    {
      name: "Multilingual Stress Test",
      description: "Stress-test recipe for IME composition, bidirectional text, emoji, and long values.",
      path: "examples/multilingual-stress-test"
    },
    {
      name: "Presets",
      description: "Addon-style recipe for applying preset tag sets with semantic buttons.",
      path: "examples/presets"
    },
    {
      name: "Recent Tags",
      description: "Addon-style recipe for adding frequently used tags from a recent list.",
      path: "examples/recent-tags"
    },
    {
      name: "Validation Hints",
      description: "Addon-style recipe for visible validation rules and custom validation messages.",
      path: "examples/validation-hints"
    },
    {
      name: "Visible Counter",
      description: "Addon-style recipe that mirrors the max tag limit with a visible counter.",
      path: "examples/visible-counter"
    }
  ]
} satisfies PluginDocs;
