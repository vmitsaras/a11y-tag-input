type FormValueElement = HTMLInputElement | HTMLTextAreaElement;

export type TagInputOutputFormat = "csv" | "json" | "newline" | "array";

export interface TagInputMessages {
  removeTag: string;
  addedTag: string;
  removedTag: string;
  duplicateTag: string;
  maxTagsReached: string;
  invalidTag: string;
  emptyTag: string;
  tooShortTag: string;
  tooLongTag: string;
  invalidChars: string;
  tagListLabel: string;
  inputLabel: string;
  instructions: string;
  counterText: string;
  pasteAdded: string;
  pasteAddedSkipped: string;
  limitReached: string;
}

export interface TagInputValidationResult {
  valid: boolean;
  reason?: string;
  message?: string;
  messageKey?: keyof TagInputMessages | string;
  values?: Record<string, number | string>;
}

export interface TagInputState {
  tags: string[];
  isDisabled: boolean;
  isReadonly: boolean;
  isInvalid: boolean;
  lastError: string | null;
}

export interface TagInputParserContext {
  separators: string[];
  source: FormValueElement;
  instance: TagInputInstance;
}

export interface TagInputTransformContext {
  tags: string[];
  source: FormValueElement;
  instance: TagInputInstance;
  trim: boolean;
  lowercase: boolean;
}

export interface TagInputValidatorContext {
  tags: string[];
  source: FormValueElement;
  instance: TagInputInstance;
  messages: TagInputMessages;
  allowDuplicates: boolean;
  maxTags: number;
  minLength: number;
  maxLength: number;
  invalidChars: RegExp | string | null;
}

export interface TagInputSerializerContext {
  outputFormat: TagInputOutputFormat;
  source: FormValueElement;
  instance: TagInputInstance;
}

export type TagInputParser = (
  input: string,
  context: TagInputParserContext
) => string[];

export type TagInputSerializer = (
  tags: string[],
  context: TagInputSerializerContext
) => string[] | string;

export type TagInputTransform = (
  value: string,
  context: TagInputTransformContext
) => false | string | void;

export type TagInputValidator = (
  value: string,
  context: TagInputValidatorContext
) => TagInputValidationResult | void;

export interface TagInputHooks {
  beforeAdd(value: string, context: TagInputContext): false | string | void;
  beforeValidate(value: string, context: TagInputContext): false | string | void;
  afterValidate(result: TagInputValidationResult, context: TagInputContext): void;
  afterAdd(value: string, context: TagInputContext): void;
  beforeRemove(value: string, context: TagInputContext): false | void;
  afterRemove(value: string, context: TagInputContext): void;
  beforeRender(context: TagInputContext): void;
  afterRender(context: TagInputContext): void;
  beforeSerialize(tags: string[], context: TagInputContext): string[] | void;
  afterSerialize(value: string[] | string, context: TagInputContext): string[] | string | void;
}

export interface TagInputOptions {
  separators?: string[] | string;
  maxTags?: number;
  allowDuplicates?: boolean;
  trim?: boolean;
  lowercase?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  inputMode?: string;
  outputFormat?: TagInputOutputFormat;
  minLength?: number;
  maxLength?: number;
  invalidChars?: RegExp | string | null;
  parser?: TagInputParser | null;
  serializer?: TagInputSerializer | null;
  transforms?: TagInputTransform[];
  validators?: TagInputValidator[];
  messages?: Partial<TagInputMessages>;
  hooks?: Partial<TagInputHooks>;
  valueElement?: FormValueElement | string | null;
}

export interface InitTagInputsOptions extends TagInputOptions {
  root?: ParentNode;
  selector?: string;
}

export interface TagInputContext {
  instance: TagInputInstance;
  root: HTMLElement;
  source: FormValueElement;
  options: NormalizedTagInputOptions;
  messages: TagInputMessages;
  state: TagInputState;
  getTags(): string[];
  setTags(tags: string[]): void;
  addTag(value: string, meta?: TagMutationMeta): boolean;
  removeTag(indexOrValue: number | string, meta?: TagMutationMeta): boolean;
  announce(message: string): void;
  emit(name: string, detail?: Record<string, unknown>, eventOptions?: TagInputEventOptions): CustomEvent;
}

export interface TagInputInstance {
  readonly source: FormValueElement;
  readonly root: HTMLElement;
  readonly options: NormalizedTagInputOptions;
  readonly messages: TagInputMessages;
  readonly context: TagInputContext;
  readonly state: TagInputState;
  readonly field: HTMLInputElement;
  readonly control: HTMLDivElement;
  readonly list: HTMLUListElement;
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

export interface NormalizedTagInputOptions {
  separators: string[];
  maxTags: number;
  allowDuplicates: boolean;
  trim: boolean;
  lowercase: boolean;
  readonly: boolean;
  disabled: boolean;
  autocomplete: string;
  inputMode: string;
  outputFormat: TagInputOutputFormat;
  minLength: number;
  maxLength: number;
  invalidChars: RegExp | string | null;
  parser: TagInputParser;
  serializer: TagInputSerializer | null;
  transforms: TagInputTransform[];
  validators: TagInputValidator[];
  messages: TagInputMessages;
  hooks: Partial<TagInputHooks>;
  valueElement: FormValueElement | string | null;
}

export interface TagMutationMeta {
  announce?: boolean;
  force?: boolean;
  originalEvent?: Event;
}

interface TagInputEventOptions {
  cancelable?: boolean;
}

interface PreviousState {
  hidden: HTMLElement["hidden"];
  ariaHidden: string | null;
  tabIndex: string | null;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  labels: Array<{
    element: HTMLLabelElement;
    htmlFor: string | null;
    id: string | null;
  }>;
  hadRootClass: boolean;
  hadInitializedClass: boolean;
}

const COMPONENT_NAME = "a11y-tag-input";
const REPEATED_ANNOUNCEMENT_DELAY = 100;

const SELECTORS = Object.freeze({
  source:
    "input[data-a11y-tag-input], textarea[data-a11y-tag-input], input[data-tag-input], textarea[data-tag-input]",
  root: "[data-a11y-tag-input-root], .a11y-tag-input",
  removeButton: "[data-a11y-tag-input-remove]"
});

const CLASSES = Object.freeze({
  root: COMPONENT_NAME,
  initialized: "is-initialized",
  control: `${COMPONENT_NAME}__control`,
  list: `${COMPONENT_NAME}__list`,
  chip: `${COMPONENT_NAME}__chip`,
  chipText: `${COMPONENT_NAME}__chip-text`,
  chipRemove: `${COMPONENT_NAME}__chip-remove`,
  field: `${COMPONENT_NAME}__field`,
  instructions: `${COMPONENT_NAME}__instructions`,
  counter: `${COMPONENT_NAME}__counter`,
  error: `${COMPONENT_NAME}__error`,
  status: `${COMPONENT_NAME}__status`,
  visuallyHidden: `${COMPONENT_NAME}__visually-hidden`,
  invalid: `${COMPONENT_NAME}--invalid`,
  disabled: `${COMPONENT_NAME}--disabled`,
  readonly: `${COMPONENT_NAME}--readonly`,
  limitReached: `${COMPONENT_NAME}--limit-reached`
});

const ATTRIBUTES = Object.freeze({
  ariaAtomic: "aria-atomic",
  ariaDescribedBy: "aria-describedby",
  ariaDisabled: "aria-disabled",
  ariaErrormessage: "aria-errormessage",
  ariaHidden: "aria-hidden",
  ariaInvalid: "aria-invalid",
  ariaLabel: "aria-label",
  ariaLabelledBy: "aria-labelledby",
  ariaLive: "aria-live",
  ariaRequired: "aria-required",
  ariaReadonly: "aria-readonly",
  hidden: "hidden",
  role: "role",
  tabIndex: "tabindex",
  removeButton: "data-a11y-tag-input-remove",
  removeIndex: "data-a11y-tag-input-index"
});

const EVENTS = Object.freeze({
  init: `${COMPONENT_NAME}:init`,
  beforeAdd: `${COMPONENT_NAME}:before-add`,
  add: `${COMPONENT_NAME}:add`,
  invalid: `${COMPONENT_NAME}:invalid`,
  limit: `${COMPONENT_NAME}:limit`,
  beforeRemove: `${COMPONENT_NAME}:before-remove`,
  remove: `${COMPONENT_NAME}:remove`,
  render: `${COMPONENT_NAME}:render`,
  change: `${COMPONENT_NAME}:change`,
  destroy: `${COMPONENT_NAME}:destroy`
});

export const defaultMessages = Object.freeze({
  removeTag: "Remove tag {tag}",
  addedTag: "Added tag {tag}.",
  removedTag: "Removed tag {tag}.",
  duplicateTag: "Tag {tag} already exists.",
  maxTagsReached: "Maximum of {max} tags reached.",
  invalidTag: "Tag is not valid.",
  emptyTag: "Enter a tag before adding it.",
  tooShortTag: "Tags must be at least {min} characters.",
  tooLongTag: "Tags must be {max} characters or fewer.",
  invalidChars: "Tag contains invalid characters.",
  tagListLabel: "Selected tags",
  inputLabel: "Add tag",
  instructions:
    "Type a tag, then press Enter or use a separator to add it. Use Backspace from an empty field to move to the last tag, then Delete or Backspace to remove it.",
  counterText: "{count} of {max} tags used.",
  pasteAdded: "Added {count} tags.",
  pasteAddedSkipped: "Added {count} tags. {skipped} skipped.",
  limitReached: "Tag limit reached."
}) satisfies TagInputMessages;

const DEFAULT_OPTIONS = Object.freeze({
  separators: [",", ";", "Enter"],
  maxTags: Number.POSITIVE_INFINITY,
  allowDuplicates: false,
  trim: true,
  lowercase: false,
  readonly: false,
  disabled: false,
  autocomplete: "off",
  inputMode: "text",
  outputFormat: "csv" as TagInputOutputFormat,
  minLength: 1,
  maxLength: 50,
  invalidChars: null,
  parser: null,
  serializer: null,
  transforms: [],
  validators: [],
  messages: defaultMessages,
  hooks: {},
  valueElement: null
});

export const builtinTransforms = Object.freeze({
  trim: (value: string): string => value.trim(),
  lowercase: (value: string): string => value.toLowerCase(),
  normalizeWhitespace: (value: string): string => value.replace(/\s+/g, " ").trim()
});

let generatedId = 0;

function createId(prefix = COMPONENT_NAME): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return `${prefix}-${randomUUID.call(globalThis.crypto)}`;
  }

  generatedId += 1;
  return `${prefix}-${generatedId}`;
}

function isFormValueElement(value: unknown): value is FormValueElement {
  return value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toSafeBoolean(value: boolean | string | undefined, fallback: boolean): boolean {
  if (value === true || value === "true" || value === "") return true;
  if (value === false || value === "false") return false;
  return fallback;
}

function toSafeInteger(
  value: number | string | undefined,
  fallback: number,
  options: { min?: number; max?: number } = {}
): number {
  if (value === undefined || value === "") return fallback;

  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsed)) return fallback;
  if (options.min !== undefined && parsed < options.min) return fallback;
  if (options.max !== undefined && parsed > options.max) return fallback;

  return parsed;
}

function toSafeString(value: string | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : fallback;
}

function toOutputFormat(value: string | undefined, fallback: TagInputOutputFormat): TagInputOutputFormat {
  if (value === "csv" || value === "json" || value === "newline" || value === "array") {
    return value;
  }

  return fallback;
}

function parseMessages(value: string | undefined): Partial<TagInputMessages> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [keyof TagInputMessages, string] => {
        const [, message] = entry;
        return typeof message === "string";
      })
    );
  } catch {
    return {};
  }
}

export function formatMessage(template: string, values: Record<string, number | string> = {}): string {
  return String(template ?? "").replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ""));
}

export function parseSeparators(separators: string[] | string | undefined): string[] {
  if (Array.isArray(separators)) {
    const parsed = separators.map(String).filter(Boolean);
    return parsed.length > 0 ? parsed : [...DEFAULT_OPTIONS.separators];
  }

  const raw = String(separators || ",;Enter").trim();

  if (raw.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const list = parsed.map(String).filter(Boolean);
        if (list.length > 0) return list;
      }
    } catch {
      // Fall back to compact string parsing.
    }
  }

  const output: string[] = [];
  if (raw.includes(",")) output.push(",");
  if (raw.includes(";")) output.push(";");
  if (raw.includes("Enter")) output.push("Enter");
  if (raw.includes("\\n") || raw.includes("newline")) output.push("newline");

  return output.length > 0 ? output : [...DEFAULT_OPTIONS.separators];
}

export function defaultParser(input: string, context: Pick<TagInputParserContext, "separators">): string[] {
  const value = String(input ?? "");
  const separators = parseSeparators(context.separators);
  const chars = separators.filter((separator) => separator.length === 1).map(escapeRegex);
  const usesNewline = separators.includes("Enter") || separators.includes("\\n") || separators.includes("newline");
  const pattern = chars.length > 0 ? `[${chars.join("")}]` : null;
  const splitPattern = [pattern, usesNewline ? "\\n+" : null].filter(Boolean).join("|") || "\\n+";

  return value.split(new RegExp(splitPattern, "g"));
}

export function serializeTags(tags: string[], context: TagInputSerializerContext): string[] | string {
  const list = Array.isArray(tags) ? tags : [];

  if (typeof context.instance.options.serializer === "function") {
    return context.instance.options.serializer(list.slice(), context);
  }

  switch (context.outputFormat) {
    case "json":
      return JSON.stringify(list);
    case "newline":
      return list.join("\n");
    case "array":
      return list.slice();
    case "csv":
    default:
      return list.join(",");
  }
}

export function runTransforms(value: string, context: TagInputTransformContext): false | string {
  let output = String(value ?? "");

  if (context.trim) output = builtinTransforms.trim(output);
  if (context.lowercase) output = builtinTransforms.lowercase(output);

  for (const transform of context.instance.options.transforms) {
    const next = transform(output, context);
    if (next === false) return false;
    if (typeof next === "string") output = next;
  }

  return output;
}

function toRegExp(invalidChars: RegExp | string | null): RegExp | null {
  if (!invalidChars) return null;
  // Clone authored expressions so global or sticky rules cannot leak their
  // mutable lastIndex between validation attempts.
  if (invalidChars instanceof RegExp) return new RegExp(invalidChars.source, invalidChars.flags);

  try {
    return new RegExp(String(invalidChars));
  } catch {
    return null;
  }
}

export function runValidators(tag: string, context: TagInputValidatorContext): TagInputValidationResult {
  const invalidChars = toRegExp(context.invalidChars);
  const builtinValidators: TagInputValidator[] = [
    (value) => (value ? { valid: true } : { valid: false, reason: "empty", messageKey: "emptyTag" }),
    (value) =>
      value.length < context.minLength
        ? { valid: false, reason: "minLength", messageKey: "tooShortTag", values: { min: context.minLength } }
        : { valid: true },
    (value) =>
      value.length > context.maxLength
        ? { valid: false, reason: "maxLength", messageKey: "tooLongTag", values: { max: context.maxLength } }
        : { valid: true },
    () =>
      Number.isFinite(context.maxTags) && context.tags.length >= context.maxTags
        ? { valid: false, reason: "limit", messageKey: "maxTagsReached", values: { max: context.maxTags } }
        : { valid: true },
    (value) =>
      !context.allowDuplicates && context.tags.includes(value)
        ? { valid: false, reason: "duplicate", messageKey: "duplicateTag", values: { tag: value } }
        : { valid: true },
    (value) =>
      invalidChars?.test(value)
        ? { valid: false, reason: "invalidChars", messageKey: "invalidChars" }
        : { valid: true }
  ];

  for (const validator of [...builtinValidators, ...context.instance.options.validators]) {
    const result = validator(tag, context);
    if (result?.valid === false) return result;
  }

  return { valid: true };
}

function resolveRoot(source: FormValueElement): HTMLElement {
  const root = source.closest(SELECTORS.root) ?? source.parentElement;

  if (!(root instanceof HTMLElement)) {
    throw new Error("A11yTagInput requires the source control to have an HTML element parent.");
  }

  return root;
}

function resolveValueElement(source: FormValueElement, root: HTMLElement, options: TagInputOptions): FormValueElement {
  if (isFormValueElement(options.valueElement)) return options.valueElement;

  if (typeof options.valueElement === "string") {
    const found = root.querySelector(options.valueElement);
    if (isFormValueElement(found)) return found;
  }

  const outputTarget = source.dataset.outputTarget;
  if (outputTarget) {
    const found = root.querySelector(outputTarget);
    if (isFormValueElement(found)) return found;
  }

  return source;
}

function normalizeOptions(source: FormValueElement, root: HTMLElement, options: TagInputOptions): NormalizedTagInputOptions {
  const data = source.dataset;
  const dataMessages = parseMessages(data.messages);
  const mergedMessages = {
    ...defaultMessages,
    ...dataMessages,
    ...(options.messages ?? {})
  };

  return {
    separators: parseSeparators(options.separators ?? data.separators ?? DEFAULT_OPTIONS.separators),
    maxTags: toSafeInteger(options.maxTags ?? data.maxTags, DEFAULT_OPTIONS.maxTags, { min: 0 }),
    allowDuplicates: toSafeBoolean(options.allowDuplicates ?? data.allowDuplicates, DEFAULT_OPTIONS.allowDuplicates),
    trim: toSafeBoolean(options.trim ?? data.trim, DEFAULT_OPTIONS.trim),
    lowercase: toSafeBoolean(options.lowercase ?? data.lowercase, DEFAULT_OPTIONS.lowercase),
    readonly: toSafeBoolean(options.readonly ?? data.readonly, DEFAULT_OPTIONS.readonly),
    disabled: toSafeBoolean(options.disabled ?? data.disabled, DEFAULT_OPTIONS.disabled),
    autocomplete: toSafeString(options.autocomplete ?? data.autocomplete, DEFAULT_OPTIONS.autocomplete),
    inputMode: toSafeString(options.inputMode ?? data.inputMode, DEFAULT_OPTIONS.inputMode),
    outputFormat: options.outputFormat ?? toOutputFormat(data.outputFormat, DEFAULT_OPTIONS.outputFormat),
    minLength: toSafeInteger(options.minLength ?? data.minLength, DEFAULT_OPTIONS.minLength, { min: 0 }),
    maxLength: toSafeInteger(options.maxLength ?? data.maxLength, DEFAULT_OPTIONS.maxLength, { min: 1 }),
    invalidChars: options.invalidChars ?? data.invalidChars ?? DEFAULT_OPTIONS.invalidChars,
    parser: options.parser ?? defaultParser,
    serializer: options.serializer ?? DEFAULT_OPTIONS.serializer,
    transforms: Array.isArray(options.transforms) ? options.transforms : [],
    validators: Array.isArray(options.validators) ? options.validators : [],
    messages: mergedMessages,
    hooks: options.hooks ?? {},
    valueElement: options.valueElement ?? data.outputTarget ?? resolveValueElement(source, root, options)
  };
}

function normalizeEventName(name: string): string {
  return name.startsWith(`${COMPONENT_NAME}:`) ? name : `${COMPONENT_NAME}:${name}`;
}

function eventTargetElement(event: Event): Element | null {
  return event.target instanceof Element ? event.target : null;
}

export class A11yTagInput implements TagInputInstance {
  private static readonly instances = new WeakMap<FormValueElement, A11yTagInput>();

  public readonly source!: FormValueElement;
  public readonly document!: Document;
  public readonly root!: HTMLElement;
  public readonly options!: NormalizedTagInputOptions;
  public readonly messages!: TagInputMessages;
  public readonly context!: TagInputContext;
  public readonly valueElement!: FormValueElement;
  public readonly state!: TagInputState;
  public field!: HTMLInputElement;
  public control!: HTMLDivElement;
  public list!: HTMLUListElement;
  public counter!: HTMLParagraphElement;
  public error!: HTMLParagraphElement;
  public status!: HTMLParagraphElement;
  public removeButtons: HTMLButtonElement[] = [];

  private instructions!: HTMLParagraphElement;
  private previous!: PreviousState;
  private isRequired = false;
  private activeRemoveIndex: number | null = null;
  private announcementTimer: number | null = null;
  private announcementRevision = 0;
  private pendingAnnouncement: string | null = null;
  private destroyed = false;
  private suppressRenderFocus = false;
  private owningForm: HTMLFormElement | null = null;
  private readonly handleFieldKeyDown!: (event: KeyboardEvent) => void;
  private readonly handleFieldPaste!: (event: ClipboardEvent) => void;
  private readonly handleFieldInput!: () => void;
  private readonly handleFieldInvalid!: () => void;
  private readonly handleFieldFocus!: () => void;
  private readonly handleControlClick!: (event: MouseEvent) => void;
  private readonly handleListClick!: (event: MouseEvent) => void;
  private readonly handleListKeyDown!: (event: KeyboardEvent) => void;
  private readonly handleListFocusIn!: (event: FocusEvent) => void;
  private readonly handleFormReset!: () => void;

  public constructor(source: FormValueElement, options: TagInputOptions = {}) {
    const existingInstance = A11yTagInput.instances.get(source);
    if (existingInstance) return existingInstance;

    if (!isFormValueElement(source)) {
      throw new TypeError("A11yTagInput requires an input or textarea source element.");
    }

    this.source = source;
    this.document = source.ownerDocument;
    this.root = resolveRoot(source);
    this.options = normalizeOptions(source, this.root, options);
    this.messages = this.options.messages;
    this.valueElement = resolveValueElement(source, this.root, this.options);
    this.state = {
      tags: [],
      isDisabled: false,
      isReadonly: false,
      isInvalid: false,
      lastError: null
    };
    this.context = {
      instance: this,
      root: this.root,
      source: this.source,
      options: this.options,
      messages: this.messages,
      state: this.state,
      getTags: () => this.getTags(),
      setTags: (tags) => this.setTags(tags),
      addTag: (value, meta) => this.addTag(value, meta),
      removeTag: (indexOrValue, meta) => this.removeTag(indexOrValue, meta),
      announce: (message) => this.announce(message),
      emit: (name, detail, eventOptions) => this.emit(name, detail, eventOptions)
    };
    this.handleFieldKeyDown = this.onFieldKeyDown.bind(this);
    this.handleFieldPaste = this.onFieldPaste.bind(this);
    this.handleFieldInput = this.clearError.bind(this);
    this.handleFieldInvalid = this.onFieldInvalid.bind(this);
    this.handleFieldFocus = this.activateFieldTabStop.bind(this);
    this.handleControlClick = this.onControlClick.bind(this);
    this.handleListClick = this.onListClick.bind(this);
    this.handleListKeyDown = this.onListKeyDown.bind(this);
    this.handleListFocusIn = this.onListFocusIn.bind(this);
    this.handleFormReset = this.onFormReset.bind(this);

    A11yTagInput.instances.set(source, this);
    this.init();
  }

  public static getInstance(source: FormValueElement): A11yTagInput | undefined {
    return A11yTagInput.instances.get(source);
  }

  private init(): void {
    this.previous = {
      hidden: this.source.hidden,
      ariaHidden: this.source.getAttribute(ATTRIBUTES.ariaHidden),
      tabIndex: this.source.getAttribute(ATTRIBUTES.tabIndex),
      disabled: this.source.disabled,
      readOnly: this.source.readOnly,
      required: this.source.required,
      labels: [],
      hadRootClass: this.root.classList.contains(CLASSES.root),
      hadInitializedClass: this.root.classList.contains(CLASSES.initialized)
    };
    this.isRequired = this.previous.required;

    this.root.classList.add(CLASSES.root, CLASSES.initialized);

    this.control = this.document.createElement("div");
    this.control.className = CLASSES.control;
    this.control.setAttribute(ATTRIBUTES.role, "group");

    this.list = this.document.createElement("ul");
    this.list.className = CLASSES.list;
    this.list.hidden = true;
    this.list.setAttribute(ATTRIBUTES.ariaLabel, this.message("tagListLabel"));

    this.field = this.document.createElement("input");
    this.field.type = "text";
    this.field.className = CLASSES.field;
    this.field.setAttribute("autocomplete", this.options.autocomplete || this.source.autocomplete || "off");
    this.field.inputMode = this.options.inputMode || this.source.inputMode || "text";
    this.field.placeholder = this.source.getAttribute("placeholder") || "";
    this.field.id = `${this.source.id || createId()}--field`;
    this.list.id = `${this.field.id}--list`;
    this.field.setAttribute(ATTRIBUTES.ariaLabel, this.message("inputLabel"));

    const sourceMaxLength = this.source.maxLength;
    if (Number.isFinite(sourceMaxLength) && sourceMaxLength > 0) {
      this.options.maxLength = Math.min(this.options.maxLength, sourceMaxLength);
    }

    if (Number.isFinite(this.options.maxLength)) {
      this.field.maxLength = this.options.maxLength;
    }

    this.field.disabled = Boolean(this.options.disabled || this.source.disabled);
    this.field.readOnly = Boolean(this.options.readonly || this.source.readOnly);
    this.state.isDisabled = this.field.disabled;
    this.state.isReadonly = this.field.readOnly;

    this.instructions = this.createHiddenParagraph(CLASSES.instructions, `${this.field.id}--instructions`);
    this.instructions.textContent = this.message("instructions");

    this.counter = this.createHiddenParagraph(CLASSES.counter, `${this.field.id}--counter`);

    this.error = this.document.createElement("p");
    this.error.className = CLASSES.error;
    this.error.hidden = true;
    this.error.id = `${this.field.id}--error`;

    this.status = this.createHiddenParagraph(CLASSES.status, `${this.field.id}--status`);
    this.status.setAttribute(ATTRIBUTES.ariaLive, "polite");
    this.status.setAttribute(ATTRIBUTES.ariaAtomic, "true");
    this.status.setAttribute(ATTRIBUTES.role, "status");

    const describedBy = [
      this.source.getAttribute(ATTRIBUTES.ariaDescribedBy),
      this.instructions.id,
      Number.isFinite(this.options.maxTags) ? this.counter.id : null
    ]
      .filter(Boolean)
      .join(" ");

    if (describedBy) {
      this.field.setAttribute(ATTRIBUTES.ariaDescribedBy, describedBy);
      this.control.setAttribute(ATTRIBUTES.ariaDescribedBy, describedBy);
    }

    this.control.append(this.list, this.field);
    this.root.append(this.control, this.instructions, this.counter, this.error, this.status);
    this.preserveAccessibleName();
    this.hideSourceControl();
    this.addListeners();
    this.syncDisabledState();
    this.updateCounter();
    this.loadInitialTags();
    this.syncRequiredState();
    this.emit(EVENTS.init, { tags: this.getTags() });
  }

  private createHiddenParagraph(className: string, id: string): HTMLParagraphElement {
    const element = this.document.createElement("p");
    element.className = `${className} ${CLASSES.visuallyHidden}`;
    element.id = id;
    return element;
  }

  private hideSourceControl(): void {
    this.source.hidden = true;
    this.source.setAttribute(ATTRIBUTES.ariaHidden, "true");
    this.source.setAttribute(ATTRIBUTES.tabIndex, "-1");
    this.source.required = false;
  }

  private addListeners(): void {
    this.field.addEventListener("keydown", this.handleFieldKeyDown);
    this.field.addEventListener("paste", this.handleFieldPaste);
    this.field.addEventListener("input", this.handleFieldInput);
    this.field.addEventListener("invalid", this.handleFieldInvalid);
    this.field.addEventListener("focus", this.handleFieldFocus);
    this.control.addEventListener("click", this.handleControlClick);
    this.list.addEventListener("click", this.handleListClick);
    this.list.addEventListener("keydown", this.handleListKeyDown);
    this.list.addEventListener("focusin", this.handleListFocusIn);
    this.owningForm = this.source.form ?? this.valueElement.form;
    this.owningForm?.addEventListener("reset", this.handleFormReset);
  }

  private removeListeners(): void {
    this.field.removeEventListener("keydown", this.handleFieldKeyDown);
    this.field.removeEventListener("paste", this.handleFieldPaste);
    this.field.removeEventListener("input", this.handleFieldInput);
    this.field.removeEventListener("invalid", this.handleFieldInvalid);
    this.field.removeEventListener("focus", this.handleFieldFocus);
    this.control.removeEventListener("click", this.handleControlClick);
    this.list.removeEventListener("click", this.handleListClick);
    this.list.removeEventListener("keydown", this.handleListKeyDown);
    this.list.removeEventListener("focusin", this.handleListFocusIn);
    this.owningForm?.removeEventListener("reset", this.handleFormReset);
    this.owningForm = null;
  }

  private onFormReset(): void {
    queueMicrotask(() => {
      if (this.destroyed) return;

      this.suppressRenderFocus = true;
      try {
        this.field.value = "";
        this.cancelPendingAnnouncement();
        this.status.textContent = "";
        this.clearError();
        this.state.isDisabled = Boolean(this.options.disabled || this.source.disabled);
        this.state.isReadonly = Boolean(this.options.readonly || this.source.readOnly);
        this.loadInitialTags();
        if (!this.valueElement.value) {
          this.state.tags = [];
          this.render();
          this.syncValue();
        }
      } finally {
        this.suppressRenderFocus = false;
      }
    });
  }

  private preserveAccessibleName(): void {
    const labels = Array.from(this.source.labels ?? []);
    this.previous.labels = labels.map((element) => ({
      element,
      htmlFor: element.getAttribute("for"),
      id: element.getAttribute("id")
    }));

    labels.forEach((label, index) => {
      label.setAttribute("for", this.field.id);
      if (!label.id) {
        label.id = index === 0 ? `${this.field.id}--label` : `${this.field.id}--label-${index + 1}`;
      }
    });

    const sourceLabelledBy = this.source.getAttribute(ATTRIBUTES.ariaLabelledBy)?.trim();
    const sourceAriaLabel = this.source.getAttribute(ATTRIBUTES.ariaLabel)?.trim();

    if (sourceLabelledBy) {
      this.field.setAttribute(ATTRIBUTES.ariaLabelledBy, sourceLabelledBy);
      this.control.setAttribute(ATTRIBUTES.ariaLabelledBy, sourceLabelledBy);
      this.field.removeAttribute(ATTRIBUTES.ariaLabel);
      return;
    }

    if (sourceAriaLabel) {
      this.field.setAttribute(ATTRIBUTES.ariaLabel, sourceAriaLabel);
      this.control.setAttribute(ATTRIBUTES.ariaLabel, sourceAriaLabel);
      return;
    }

    if (labels.length > 0) {
      const labelledBy = labels.map((label) => label.id).join(" ");
      this.field.setAttribute(ATTRIBUTES.ariaLabelledBy, labelledBy);
      this.control.setAttribute(ATTRIBUTES.ariaLabelledBy, labelledBy);
      this.field.removeAttribute(ATTRIBUTES.ariaLabel);
    }
  }

  private loadInitialTags(): void {
    const current = this.valueElement.value || "";
    if (!current) return;

    const parsed =
      this.options.outputFormat === "json"
        ? this.safeJsonParse(current)
        : this.options.parser(current, {
            separators: this.options.separators,
            source: this.source,
            instance: this
          });

    if (Array.isArray(parsed)) {
      this.setTags(parsed);
    }
  }

  private safeJsonParse(value: string): string[] {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  private onFieldKeyDown(event: KeyboardEvent): void {
    if (this.state.isDisabled || this.state.isReadonly) return;

    if (event.isComposing || event.keyCode === 229) return;

    if (event.key === "Backspace" && !this.field.value && this.removeButtons.length > 0) {
      event.preventDefault();
      this.focusTag(this.removeButtons.length - 1);
      return;
    }

    if (event.key === "Escape") {
      this.field.value = "";
      return;
    }

    if (this.isLimitReached() && event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.announceIfChanged(this.message("maxTagsReached", { max: this.options.maxTags }));
      return;
    }

    if (event.key === "Enter" || (event.key.length === 1 && this.options.separators.includes(event.key))) {
      event.preventDefault();
      this.addFromInput(event);
    }
  }

  private onFieldInvalid(): void {
    if (!this.isRequired || this.state.tags.length > 0) return;

    const message = this.message("emptyTag");
    this.setError(message);
    this.announce(message);
  }

  private onControlClick(event: MouseEvent): void {
    if (event.target === this.control || event.target === this.list) {
      this.focus();
    }
  }

  private onListClick(event: MouseEvent): void {
    const button = this.getRemoveButtonFromEvent(event);
    if (!button || button.disabled) return;

    const index = this.getRemoveButtonIndex(button);
    if (index < 0) return;

    const removed = this.removeTag(index, { originalEvent: event });
    if (!removed) return;

    const nextFocusIndex = Math.min(index, this.removeButtons.length - 1);
    if (nextFocusIndex >= 0) this.focusTag(nextFocusIndex);
    else this.focus();
  }

  private onListKeyDown(event: KeyboardEvent): void {
    const button = this.getRemoveButtonFromEvent(event);
    if (!button) return;

    const index = this.getRemoveButtonIndex(button);
    if (index < 0) return;

    this.handleRemoveKeyDown(event, index);
  }

  private onListFocusIn(event: FocusEvent): void {
    const button = this.getRemoveButtonFromEvent(event);
    if (!button) return;

    const index = this.getRemoveButtonIndex(button);
    if (index < 0) return;

    this.activeRemoveIndex = index;
    this.syncRovingTabStop();
  }

  private getRemoveButtonFromEvent(event: Event): HTMLButtonElement | null {
    const target = eventTargetElement(event);
    const button = target?.closest(SELECTORS.removeButton);

    return button instanceof HTMLButtonElement && this.list.contains(button) ? button : null;
  }

  private getRemoveButtonIndex(button: HTMLButtonElement): number {
    const index = Number.parseInt(button.getAttribute(ATTRIBUTES.removeIndex) || "", 10);
    return Number.isInteger(index) ? index : -1;
  }

  private handleRemoveKeyDown(event: KeyboardEvent, index: number): void {
    const lastIndex = this.removeButtons.length - 1;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.focusTag(Math.max(0, index - 1));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index >= lastIndex) this.focus();
      else this.focusTag(index + 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.focusTag(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      this.focus();
      return;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && !this.state.isReadonly) {
      event.preventDefault();
      this.removeTag(index, { originalEvent: event });
    }
  }

  private focusTag(index: number): void {
    if (this.state.isDisabled || this.state.isReadonly) return;

    const button = this.removeButtons[index];
    if (!button) return;

    this.activeRemoveIndex = index;
    this.syncRovingTabStop();
    button.focus();
  }

  private activateFieldTabStop(): void {
    this.activeRemoveIndex = null;
    this.syncRovingTabStop();
  }

  private syncRovingTabStop(): void {
    const removeButtonsAvailable =
      !this.state.isDisabled && !this.state.isReadonly && this.removeButtons.length > 0;

    if (!removeButtonsAvailable) {
      this.activeRemoveIndex = null;
    } else if (
      this.activeRemoveIndex !== null &&
      this.activeRemoveIndex >= this.removeButtons.length
    ) {
      this.activeRemoveIndex = this.removeButtons.length - 1;
    }

    this.field.tabIndex = this.state.isDisabled
      ? -1
      : this.activeRemoveIndex === null
        ? 0
        : -1;
    this.removeButtons.forEach((button, index) => {
      button.tabIndex = index === this.activeRemoveIndex ? 0 : -1;
    });
  }

  private onFieldPaste(event: ClipboardEvent): void {
    if (this.state.isDisabled || this.state.isReadonly) return;

    const text = event.clipboardData?.getData("text") ?? "";
    if (!text) return;

    event.preventDefault();

    const values = this.options
      .parser(text, {
        separators: this.options.separators,
        source: this.source,
        instance: this
      })
      .map(String)
      .filter(Boolean);

    let added = 0;
    let skipped = 0;

    for (const value of values) {
      const success = this.addTag(value, { announce: false, originalEvent: event });
      if (success) added += 1;
      else skipped += 1;
    }

    if (added > 0 || skipped > 0) {
      const summary =
        skipped > 0
          ? this.message("pasteAddedSkipped", { count: added, skipped })
          : this.message("pasteAdded", { count: added });
      this.announce(summary);
    }
  }

  private addFromInput(originalEvent: Event): void {
    const value = this.field.value;
    const success = this.addTag(value, { originalEvent });
    if (success) this.field.value = "";
  }

  private runHook<T>(name: keyof TagInputHooks, payload: T): T | false | string | string[] {
    const hook = this.options.hooks[name];
    if (typeof hook !== "function") return payload;

    return hook(payload as never, this.context) as T | false | string | string[];
  }

  public message(key: keyof TagInputMessages | string, values: Record<string, number | string> = {}): string {
    const template = this.messages[key as keyof TagInputMessages] ?? defaultMessages[key as keyof TagInputMessages] ?? "";
    return formatMessage(template, values);
  }

  public emit(
    name: string,
    detail: Record<string, unknown> = {},
    eventOptions: TagInputEventOptions = {}
  ): CustomEvent {
    const event = new CustomEvent(normalizeEventName(name), {
      bubbles: true,
      cancelable: Boolean(eventOptions.cancelable),
      detail: {
        ...detail,
        tags: this.getTags(),
        instance: this
      }
    });

    this.source.dispatchEvent(event);
    return event;
  }

  public announce(message: string): void {
    const nextMessage = String(message ?? "");
    this.cancelPendingAnnouncement();

    if (!nextMessage.trim()) {
      this.status.textContent = "";
      return;
    }

    if (this.status.textContent !== nextMessage) {
      this.status.textContent = nextMessage;
      return;
    }

    this.status.textContent = "";
    this.pendingAnnouncement = nextMessage;
    const revision = this.announcementRevision;
    const view = this.document.defaultView;
    const commit = (): void => {
      if (this.destroyed || revision !== this.announcementRevision) return;

      this.status.textContent = nextMessage;
      this.pendingAnnouncement = null;
      this.announcementTimer = null;
    };

    if (view) {
      this.announcementTimer = view.setTimeout(commit, REPEATED_ANNOUNCEMENT_DELAY);
    } else {
      queueMicrotask(commit);
    }
  }

  private announceIfChanged(message: string): void {
    if (this.status.textContent === message || this.pendingAnnouncement === message) return;
    this.announce(message);
  }

  private cancelPendingAnnouncement(): void {
    this.announcementRevision += 1;
    this.pendingAnnouncement = null;

    if (this.announcementTimer === null) return;

    this.document.defaultView?.clearTimeout(this.announcementTimer);
    this.announcementTimer = null;
  }

  private setError(message: string): void {
    this.state.isInvalid = true;
    this.state.lastError = message;
    this.field.setAttribute(ATTRIBUTES.ariaInvalid, "true");
    this.field.setAttribute(ATTRIBUTES.ariaErrormessage, this.error.id);
    this.error.hidden = false;
    this.error.textContent = message;
    this.root.classList.add(CLASSES.invalid);
  }

  public clearError(): void {
    this.state.isInvalid = false;
    this.state.lastError = null;
    this.field.removeAttribute(ATTRIBUTES.ariaInvalid);
    this.field.removeAttribute(ATTRIBUTES.ariaErrormessage);
    this.error.hidden = true;
    this.error.textContent = "";
    this.root.classList.remove(CLASSES.invalid);
  }

  public addTag(value: string, meta: TagMutationMeta = {}): boolean {
    if ((this.state.isDisabled || this.state.isReadonly) && !meta.force) return false;

    let next = runTransforms(value, {
      tags: this.state.tags,
      source: this.source,
      instance: this,
      trim: this.options.trim,
      lowercase: this.options.lowercase
    });

    if (next === false) return false;

    const hookValue = this.runHook("beforeAdd", next);
    if (hookValue === false) return false;
    if (typeof hookValue === "string") next = hookValue;

    const beforeEvent = this.emit(
      EVENTS.beforeAdd,
      { tag: next, originalEvent: meta.originalEvent },
      { cancelable: true }
    );
    if (beforeEvent.defaultPrevented) return false;

    const validationInput = this.runHook("beforeValidate", next);
    if (validationInput === false) return false;
    if (typeof validationInput === "string") next = validationInput;

    const validation = runValidators(next, {
      tags: this.state.tags,
      source: this.source,
      instance: this,
      messages: this.messages,
      allowDuplicates: this.options.allowDuplicates,
      maxTags: this.options.maxTags,
      minLength: this.options.minLength,
      maxLength: this.options.maxLength,
      invalidChars: this.options.invalidChars
    });

    this.runHook("afterValidate", validation);

    if (!validation.valid) {
      const messageValues = {
        tag: next,
        ...(validation.values ?? {})
      };
      const message =
        validation.message?.trim() ||
        this.message(validation.messageKey || "invalidTag", messageValues) ||
        this.message("invalidTag", messageValues);

      this.setError(message);
      if (meta.announce !== false) {
        this.announce(message);
      }
      this.emit(validation.reason === "limit" ? EVENTS.limit : EVENTS.invalid, {
        tag: next,
        reason: validation.reason,
        message,
        originalEvent: meta.originalEvent
      });
      return false;
    }

    this.clearError();
    this.state.tags.push(next);
    this.render();
    this.syncValue();

    if (meta.announce !== false) {
      this.announce(this.message("addedTag", { tag: next }));
    }

    this.emit(EVENTS.add, { tag: next, index: this.state.tags.length - 1, originalEvent: meta.originalEvent });
    this.emit(EVENTS.change, { tag: next, originalEvent: meta.originalEvent });
    this.runHook("afterAdd", next);

    return true;
  }

  public removeTag(indexOrValue: number | string, meta: TagMutationMeta = {}): boolean {
    if (this.state.isDisabled || this.state.isReadonly) return false;

    const index = typeof indexOrValue === "number" ? indexOrValue : this.state.tags.indexOf(indexOrValue);
    if (index < 0 || index >= this.state.tags.length) return false;

    const tag = this.state.tags[index]!;
    const hook = this.runHook("beforeRemove", tag);
    if (hook === false) return false;

    const beforeEvent = this.emit(
      EVENTS.beforeRemove,
      { tag, index, originalEvent: meta.originalEvent },
      { cancelable: true }
    );
    if (beforeEvent.defaultPrevented) return false;

    this.state.tags.splice(index, 1);
    this.render();
    this.syncValue();
    this.clearError();

    if (meta.announce !== false) {
      this.announce(this.message("removedTag", { tag }));
    }

    this.emit(EVENTS.remove, { tag, index, originalEvent: meta.originalEvent });
    this.emit(EVENTS.change, { tag, index, originalEvent: meta.originalEvent });
    this.runHook("afterRemove", tag);

    return true;
  }

  private render(): void {
    const focusedRemoveIndex = this.removeButtons.findIndex(
      (button) => button === this.document.activeElement
    );
    const fieldWasFocused = this.document.activeElement === this.field;

    this.runHook("beforeRender", this.context);

    this.list.textContent = "";
    this.removeButtons = [];
    this.list.hidden = this.state.tags.length === 0;

    this.state.tags.forEach((tag, index) => {
      const item = this.document.createElement("li");
      item.className = CLASSES.chip;

      const text = this.document.createElement("span");
      text.className = CLASSES.chipText;
      text.textContent = tag;

      const remove = this.document.createElement("button");
      remove.className = CLASSES.chipRemove;
      remove.type = "button";
      remove.setAttribute(ATTRIBUTES.ariaLabel, this.message("removeTag", { tag }));
      remove.setAttribute(ATTRIBUTES.removeButton, "");
      remove.setAttribute(ATTRIBUTES.removeIndex, String(index));
      remove.disabled = this.state.isDisabled || this.state.isReadonly;
      remove.tabIndex = -1;
      remove.innerHTML = '<span aria-hidden="true">&times;</span>';
      this.removeButtons.push(remove);

      item.append(text, remove);
      this.list.append(item);
    });

    this.updateLimitState();
    this.updateCounter();
    this.syncDisabledState();
    this.syncRequiredState();

    if (!this.suppressRenderFocus && focusedRemoveIndex >= 0) {
      const nextFocusIndex = Math.min(focusedRemoveIndex, this.removeButtons.length - 1);
      if (nextFocusIndex >= 0 && !this.state.isReadonly && !this.state.isDisabled) {
        this.focusTag(nextFocusIndex);
      } else if (!this.state.isDisabled) {
        this.focus();
      }
    } else if (!this.suppressRenderFocus && fieldWasFocused) {
      this.activateFieldTabStop();
    }

    this.emit(EVENTS.render, { tags: this.getTags() });
    this.runHook("afterRender", this.context);
  }

  private syncValue(): void {
    const before = this.runHook("beforeSerialize", this.getTags());
    const tags = Array.isArray(before) ? before : this.getTags();
    const value = serializeTags(tags, {
      outputFormat: this.options.outputFormat,
      source: this.source,
      instance: this
    });
    const finalValue = this.runHook("afterSerialize", value) ?? value;

    this.valueElement.value = Array.isArray(finalValue) ? JSON.stringify(finalValue) : String(finalValue);
  }

  public setTags(tags: string[]): void {
    this.state.tags = [];

    for (const tag of tags || []) {
      this.addTag(String(tag), { announce: false, force: true });
    }

    this.render();
    this.syncValue();
  }

  public getTags(): string[] {
    return this.state.tags.slice();
  }

  public clear(): void {
    this.state.tags = [];
    this.render();
    this.syncValue();
    this.clearError();
  }

  public focus(): void {
    this.activateFieldTabStop();
    this.field.focus();
  }

  private syncRequiredState(): void {
    if (!this.isRequired) {
      this.field.required = false;
      this.field.removeAttribute(ATTRIBUTES.ariaRequired);
      this.field.setCustomValidity("");
      return;
    }

    const isEmpty = this.state.tags.length === 0;
    this.field.required = isEmpty;
    this.field.setAttribute(ATTRIBUTES.ariaRequired, "true");
    this.field.setCustomValidity(isEmpty ? this.message("emptyTag") : "");
  }

  public validate(): boolean {
    this.syncRequiredState();

    if (this.isRequired && this.state.tags.length === 0) {
      const message = this.message("emptyTag");
      this.setError(message);
      this.announce(message);
      return false;
    }

    this.clearError();
    return true;
  }

  public setValidationError(message: string | null): void {
    const nextMessage = String(message ?? "").trim();

    if (!nextMessage) {
      this.clearError();
      return;
    }

    this.setError(nextMessage);
  }

  public disable(): void {
    this.state.isDisabled = true;
    this.field.disabled = true;
    this.syncDisabledState();
  }

  public enable(): void {
    this.state.isDisabled = false;
    this.field.disabled = false;
    this.syncDisabledState();
  }

  public readonly(value = true): void {
    this.state.isReadonly = Boolean(value);
    this.field.readOnly = this.state.isReadonly;
    this.syncDisabledState();
  }

  private isLimitReached(): boolean {
    return Number.isFinite(this.options.maxTags) && this.state.tags.length >= this.options.maxTags;
  }

  private updateLimitState(): void {
    const limitReached = this.isLimitReached();
    this.root.classList.toggle(CLASSES.limitReached, limitReached);
    this.field.setAttribute(ATTRIBUTES.ariaDisabled, String(this.state.isDisabled));
    this.field.setAttribute(ATTRIBUTES.ariaReadonly, String(this.state.isReadonly || limitReached));

    if (limitReached && !this.state.isDisabled && !this.state.isReadonly) {
      this.field.placeholder = this.message("limitReached");
    } else {
      this.field.placeholder = this.source.getAttribute("placeholder") || "";
    }
  }

  private updateCounter(): void {
    if (Number.isFinite(this.options.maxTags)) {
      this.counter.textContent = this.message("counterText", {
        count: this.state.tags.length,
        max: this.options.maxTags
      });
    } else {
      this.counter.textContent = "";
    }
  }

  private syncDisabledState(): void {
    const focusedRemoveButton = this.removeButtons.some(
      (button) => button === this.document.activeElement
    );
    const inactive = this.state.isDisabled || this.state.isReadonly;
    this.field.disabled = this.state.isDisabled;
    this.field.readOnly = this.state.isReadonly;
    this.source.disabled = this.state.isDisabled;
    this.source.readOnly = this.state.isReadonly;
    this.control.setAttribute(ATTRIBUTES.ariaDisabled, String(this.state.isDisabled));
    this.control.setAttribute(ATTRIBUTES.ariaReadonly, String(this.state.isReadonly));
    this.root.classList.toggle(CLASSES.disabled, this.state.isDisabled);
    this.root.classList.toggle(CLASSES.readonly, this.state.isReadonly);
    this.updateLimitState();

    for (const button of this.removeButtons) {
      button.disabled = inactive;
    }

    this.syncRovingTabStop();

    if (focusedRemoveButton && this.state.isReadonly && !this.state.isDisabled) {
      this.focus();
    }
  }

  public destroy(): void {
    if (this.destroyed) return;

    this.emit(EVENTS.destroy, { tags: this.getTags() });
    this.cancelPendingAnnouncement();
    this.removeListeners();
    this.control.remove();
    this.instructions.remove();
    this.counter.remove();
    this.error.remove();
    this.status.remove();

    this.source.hidden = this.previous.hidden;
    this.source.disabled = this.previous.disabled;
    this.source.readOnly = this.previous.readOnly;
    this.source.required = this.previous.required;

    if (this.previous.ariaHidden === null) this.source.removeAttribute(ATTRIBUTES.ariaHidden);
    else this.source.setAttribute(ATTRIBUTES.ariaHidden, this.previous.ariaHidden);

    if (this.previous.tabIndex === null) this.source.removeAttribute(ATTRIBUTES.tabIndex);
    else this.source.setAttribute(ATTRIBUTES.tabIndex, this.previous.tabIndex);

    for (const { element, htmlFor, id } of this.previous.labels) {
      if (htmlFor === null) element.removeAttribute("for");
      else element.setAttribute("for", htmlFor);

      if (id === null) element.removeAttribute("id");
      else element.id = id;
    }

    this.root.classList.remove(CLASSES.invalid, CLASSES.disabled, CLASSES.readonly, CLASSES.limitReached);
    if (!this.previous.hadInitializedClass) this.root.classList.remove(CLASSES.initialized);
    if (!this.previous.hadRootClass) this.root.classList.remove(CLASSES.root);

    this.removeButtons = [];
    this.destroyed = true;
    A11yTagInput.instances.delete(this.source);
  }
}

export function createTagInput(source: FormValueElement, options: TagInputOptions = {}): TagInputInstance {
  return new A11yTagInput(source, options);
}

export function initTagInputs(options: InitTagInputsOptions = {}): TagInputInstance[] {
  const { root, selector, ...tagInputOptions } = options;
  const searchRoot = root ?? (typeof document === "undefined" ? null : document);
  if (!searchRoot) return [];

  return Array.from(searchRoot.querySelectorAll(selector ?? SELECTORS.source))
    .filter((element): element is FormValueElement => isFormValueElement(element))
    .map((element) => createTagInput(element, tagInputOptions));
}
