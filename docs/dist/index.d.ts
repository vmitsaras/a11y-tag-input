//#region src/index.d.ts
type FormValueElement = HTMLInputElement | HTMLTextAreaElement;
type TagInputOutputFormat = "csv" | "json" | "newline" | "array";
interface TagInputMessages {
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
interface TagInputValidationResult {
  valid: boolean;
  reason?: string;
  message?: string;
  messageKey?: keyof TagInputMessages | string;
  values?: Record<string, number | string>;
}
interface TagInputState {
  tags: string[];
  isDisabled: boolean;
  isReadonly: boolean;
  isInvalid: boolean;
  lastError: string | null;
}
interface TagInputParserContext {
  separators: string[];
  source: FormValueElement;
  instance: TagInputInstance;
}
interface TagInputTransformContext {
  tags: string[];
  source: FormValueElement;
  instance: TagInputInstance;
  trim: boolean;
  lowercase: boolean;
}
interface TagInputValidatorContext {
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
interface TagInputSerializerContext {
  outputFormat: TagInputOutputFormat;
  source: FormValueElement;
  instance: TagInputInstance;
}
type TagInputParser = (input: string, context: TagInputParserContext) => string[];
type TagInputSerializer = (tags: string[], context: TagInputSerializerContext) => string[] | string;
type TagInputTransform = (value: string, context: TagInputTransformContext) => false | string | void;
type TagInputValidator = (value: string, context: TagInputValidatorContext) => TagInputValidationResult | void;
interface TagInputHooks {
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
interface InitTagInputsOptions extends TagInputOptions {
  root?: ParentNode;
  selector?: string;
}
interface TagInputContext {
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
interface TagInputInstance {
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
interface NormalizedTagInputOptions {
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
interface TagMutationMeta {
  announce?: boolean;
  force?: boolean;
  originalEvent?: Event;
}
interface TagInputEventOptions {
  cancelable?: boolean;
}
declare const defaultMessages: Readonly<{
  removeTag: "Remove tag {tag}";
  addedTag: "Added tag {tag}.";
  removedTag: "Removed tag {tag}.";
  duplicateTag: "Tag {tag} already exists.";
  maxTagsReached: "Maximum of {max} tags reached.";
  invalidTag: "Tag is not valid.";
  emptyTag: "Enter a tag before adding it.";
  tooShortTag: "Tags must be at least {min} characters.";
  tooLongTag: "Tags must be {max} characters or fewer.";
  invalidChars: "Tag contains invalid characters.";
  tagListLabel: "Selected tags";
  inputLabel: "Add tag";
  instructions: "Type a tag, then press Enter or use a separator to add it. Use Backspace from an empty field to move to the last tag, then Delete or Backspace to remove it.";
  counterText: "{count} of {max} tags used.";
  pasteAdded: "Added {count} tags.";
  pasteAddedSkipped: "Added {count} tags. {skipped} skipped.";
  limitReached: "Tag limit reached.";
}>;
declare const builtinTransforms: Readonly<{
  trim: (value: string) => string;
  lowercase: (value: string) => string;
  normalizeWhitespace: (value: string) => string;
}>;
declare function formatMessage(template: string, values?: Record<string, number | string>): string;
declare function parseSeparators(separators: string[] | string | undefined): string[];
declare function defaultParser(input: string, context: Pick<TagInputParserContext, "separators">): string[];
declare function serializeTags(tags: string[], context: TagInputSerializerContext): string[] | string;
declare function runTransforms(value: string, context: TagInputTransformContext): false | string;
declare function runValidators(tag: string, context: TagInputValidatorContext): TagInputValidationResult;
declare class A11yTagInput implements TagInputInstance {
  private static readonly instances;
  readonly source: FormValueElement;
  readonly document: Document;
  readonly root: HTMLElement;
  readonly options: NormalizedTagInputOptions;
  readonly messages: TagInputMessages;
  readonly context: TagInputContext;
  readonly valueElement: FormValueElement;
  readonly state: TagInputState;
  field: HTMLInputElement;
  control: HTMLDivElement;
  list: HTMLUListElement;
  counter: HTMLParagraphElement;
  error: HTMLParagraphElement;
  status: HTMLParagraphElement;
  removeButtons: HTMLButtonElement[];
  private instructions;
  private previous;
  private isRequired;
  private activeRemoveIndex;
  private announcementTimer;
  private announcementRevision;
  private pendingAnnouncement;
  private destroyed;
  private suppressRenderFocus;
  private owningForm;
  private readonly handleFieldKeyDown;
  private readonly handleFieldPaste;
  private readonly handleFieldInput;
  private readonly handleFieldInvalid;
  private readonly handleFieldFocus;
  private readonly handleControlClick;
  private readonly handleListClick;
  private readonly handleListKeyDown;
  private readonly handleListFocusIn;
  private readonly handleFormReset;
  constructor(source: FormValueElement, options?: TagInputOptions);
  static getInstance(source: FormValueElement): A11yTagInput | undefined;
  private init;
  private createHiddenParagraph;
  private hideSourceControl;
  private addListeners;
  private removeListeners;
  private onFormReset;
  private preserveAccessibleName;
  private loadInitialTags;
  private safeJsonParse;
  private onFieldKeyDown;
  private onFieldInvalid;
  private onControlClick;
  private onListClick;
  private onListKeyDown;
  private onListFocusIn;
  private getRemoveButtonFromEvent;
  private getRemoveButtonIndex;
  private handleRemoveKeyDown;
  private focusTag;
  private activateFieldTabStop;
  private syncRovingTabStop;
  private onFieldPaste;
  private addFromInput;
  private runHook;
  message(key: keyof TagInputMessages | string, values?: Record<string, number | string>): string;
  emit(name: string, detail?: Record<string, unknown>, eventOptions?: TagInputEventOptions): CustomEvent;
  announce(message: string): void;
  private announceIfChanged;
  private cancelPendingAnnouncement;
  private setError;
  clearError(): void;
  addTag(value: string, meta?: TagMutationMeta): boolean;
  removeTag(indexOrValue: number | string, meta?: TagMutationMeta): boolean;
  private render;
  private syncValue;
  setTags(tags: string[]): void;
  getTags(): string[];
  clear(): void;
  focus(): void;
  private syncRequiredState;
  validate(): boolean;
  setValidationError(message: string | null): void;
  disable(): void;
  enable(): void;
  readonly(value?: boolean): void;
  private isLimitReached;
  private updateLimitState;
  private updateCounter;
  private syncDisabledState;
  destroy(): void;
}
declare function createTagInput(source: FormValueElement, options?: TagInputOptions): TagInputInstance;
declare function initTagInputs(options?: InitTagInputsOptions): TagInputInstance[];
//#endregion
export { A11yTagInput, InitTagInputsOptions, NormalizedTagInputOptions, TagInputContext, TagInputHooks, TagInputInstance, TagInputMessages, TagInputOptions, TagInputOutputFormat, TagInputParser, TagInputParserContext, TagInputSerializer, TagInputSerializerContext, TagInputState, TagInputTransform, TagInputTransformContext, TagInputValidationResult, TagInputValidator, TagInputValidatorContext, TagMutationMeta, builtinTransforms, createTagInput, defaultMessages, defaultParser, formatMessage, initTagInputs, parseSeparators, runTransforms, runValidators, serializeTags };
//# sourceMappingURL=index.d.ts.map