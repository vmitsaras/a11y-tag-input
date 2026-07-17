//#region src/index.ts
const COMPONENT_NAME = "a11y-tag-input";
const REPEATED_ANNOUNCEMENT_DELAY = 100;
const SELECTORS = Object.freeze({
	source: "input[data-a11y-tag-input], textarea[data-a11y-tag-input], input[data-tag-input], textarea[data-tag-input]",
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
const defaultMessages = Object.freeze({
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
	instructions: "Type a tag, then press Enter or use a separator to add it. Use Backspace from an empty field to move to the last tag, then Delete or Backspace to remove it.",
	counterText: "{count} of {max} tags used.",
	pasteAdded: "Added {count} tags.",
	pasteAddedSkipped: "Added {count} tags. {skipped} skipped.",
	limitReached: "Tag limit reached."
});
const DEFAULT_OPTIONS = Object.freeze({
	separators: [
		",",
		";",
		"Enter"
	],
	maxTags: Number.POSITIVE_INFINITY,
	allowDuplicates: false,
	trim: true,
	lowercase: false,
	readonly: false,
	disabled: false,
	autocomplete: "off",
	inputMode: "text",
	outputFormat: "csv",
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
const builtinTransforms = Object.freeze({
	trim: (value) => value.trim(),
	lowercase: (value) => value.toLowerCase(),
	normalizeWhitespace: (value) => value.replace(/\s+/g, " ").trim()
});
let generatedId = 0;
function createId(prefix = COMPONENT_NAME) {
	const randomUUID = globalThis.crypto?.randomUUID;
	if (typeof randomUUID === "function") return `${prefix}-${randomUUID.call(globalThis.crypto)}`;
	generatedId += 1;
	return `${prefix}-${generatedId}`;
}
function isFormValueElement(value) {
	return value instanceof HTMLInputElement || value instanceof HTMLTextAreaElement;
}
function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function toSafeBoolean(value, fallback) {
	if (value === true || value === "true" || value === "") return true;
	if (value === false || value === "false") return false;
	return fallback;
}
function toSafeInteger(value, fallback, options = {}) {
	if (value === void 0 || value === "") return fallback;
	const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
	if (!Number.isFinite(parsed)) return fallback;
	if (options.min !== void 0 && parsed < options.min) return fallback;
	if (options.max !== void 0 && parsed > options.max) return fallback;
	return parsed;
}
function toSafeString(value, fallback) {
	const normalized = String(value ?? "").trim();
	return normalized.length > 0 ? normalized : fallback;
}
function toOutputFormat(value, fallback) {
	if (value === "csv" || value === "json" || value === "newline" || value === "array") return value;
	return fallback;
}
function parseMessages(value) {
	if (!value) return {};
	try {
		const parsed = JSON.parse(value);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
		return Object.fromEntries(Object.entries(parsed).filter((entry) => {
			const [, message] = entry;
			return typeof message === "string";
		}));
	} catch {
		return {};
	}
}
function formatMessage(template, values = {}) {
	return String(template ?? "").replace(/\{(\w+)\}/g, (_match, key) => String(values[key] ?? ""));
}
function parseSeparators(separators) {
	if (Array.isArray(separators)) {
		const parsed = separators.map(String).filter(Boolean);
		return parsed.length > 0 ? parsed : [...DEFAULT_OPTIONS.separators];
	}
	const raw = String(separators || ",;Enter").trim();
	if (raw.startsWith("[")) try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			const list = parsed.map(String).filter(Boolean);
			if (list.length > 0) return list;
		}
	} catch {}
	const output = [];
	if (raw.includes(",")) output.push(",");
	if (raw.includes(";")) output.push(";");
	if (raw.includes("Enter")) output.push("Enter");
	if (raw.includes("\\n") || raw.includes("newline")) output.push("newline");
	return output.length > 0 ? output : [...DEFAULT_OPTIONS.separators];
}
function defaultParser(input, context) {
	const value = String(input ?? "");
	const separators = parseSeparators(context.separators);
	const chars = separators.filter((separator) => separator.length === 1).map(escapeRegex);
	const usesNewline = separators.includes("Enter") || separators.includes("\\n") || separators.includes("newline");
	const splitPattern = [chars.length > 0 ? `[${chars.join("")}]` : null, usesNewline ? "\\n+" : null].filter(Boolean).join("|") || "\\n+";
	return value.split(new RegExp(splitPattern, "g"));
}
function serializeTags(tags, context) {
	const list = Array.isArray(tags) ? tags : [];
	if (typeof context.instance.options.serializer === "function") return context.instance.options.serializer(list.slice(), context);
	switch (context.outputFormat) {
		case "json": return JSON.stringify(list);
		case "newline": return list.join("\n");
		case "array": return list.slice();
		default: return list.join(",");
	}
}
function runTransforms(value, context) {
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
function toRegExp(invalidChars) {
	if (!invalidChars) return null;
	if (invalidChars instanceof RegExp) return new RegExp(invalidChars.source, invalidChars.flags);
	try {
		return new RegExp(String(invalidChars));
	} catch {
		return null;
	}
}
function runValidators(tag, context) {
	const invalidChars = toRegExp(context.invalidChars);
	const builtinValidators = [
		(value) => value ? { valid: true } : {
			valid: false,
			reason: "empty",
			messageKey: "emptyTag"
		},
		(value) => value.length < context.minLength ? {
			valid: false,
			reason: "minLength",
			messageKey: "tooShortTag",
			values: { min: context.minLength }
		} : { valid: true },
		(value) => value.length > context.maxLength ? {
			valid: false,
			reason: "maxLength",
			messageKey: "tooLongTag",
			values: { max: context.maxLength }
		} : { valid: true },
		() => Number.isFinite(context.maxTags) && context.tags.length >= context.maxTags ? {
			valid: false,
			reason: "limit",
			messageKey: "maxTagsReached",
			values: { max: context.maxTags }
		} : { valid: true },
		(value) => !context.allowDuplicates && context.tags.includes(value) ? {
			valid: false,
			reason: "duplicate",
			messageKey: "duplicateTag",
			values: { tag: value }
		} : { valid: true },
		(value) => invalidChars?.test(value) ? {
			valid: false,
			reason: "invalidChars",
			messageKey: "invalidChars"
		} : { valid: true }
	];
	for (const validator of [...builtinValidators, ...context.instance.options.validators]) {
		const result = validator(tag, context);
		if (result?.valid === false) return result;
	}
	return { valid: true };
}
function resolveRoot(source) {
	const root = source.closest(SELECTORS.root) ?? source.parentElement;
	if (!(root instanceof HTMLElement)) throw new Error("A11yTagInput requires the source control to have an HTML element parent.");
	return root;
}
function resolveValueElement(source, root, options) {
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
function normalizeOptions(source, root, options) {
	const data = source.dataset;
	const dataMessages = parseMessages(data.messages);
	const mergedMessages = {
		...defaultMessages,
		...dataMessages,
		...options.messages ?? {}
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
function normalizeEventName(name) {
	return name.startsWith(`${COMPONENT_NAME}:`) ? name : `${COMPONENT_NAME}:${name}`;
}
function eventTargetElement(event) {
	return event.target instanceof Element ? event.target : null;
}
var A11yTagInput = class A11yTagInput {
	static instances = /* @__PURE__ */ new WeakMap();
	source;
	document;
	root;
	options;
	messages;
	context;
	valueElement;
	state;
	field;
	control;
	list;
	counter;
	error;
	status;
	removeButtons = [];
	instructions;
	previous;
	isRequired = false;
	activeRemoveIndex = null;
	announcementTimer = null;
	announcementRevision = 0;
	pendingAnnouncement = null;
	destroyed = false;
	suppressRenderFocus = false;
	owningForm = null;
	handleFieldKeyDown;
	handleFieldPaste;
	handleFieldInput;
	handleFieldInvalid;
	handleFieldFocus;
	handleControlClick;
	handleListClick;
	handleListKeyDown;
	handleListFocusIn;
	handleFormReset;
	constructor(source, options = {}) {
		const existingInstance = A11yTagInput.instances.get(source);
		if (existingInstance) return existingInstance;
		if (!isFormValueElement(source)) throw new TypeError("A11yTagInput requires an input or textarea source element.");
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
	static getInstance(source) {
		return A11yTagInput.instances.get(source);
	}
	init() {
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
		if (Number.isFinite(sourceMaxLength) && sourceMaxLength > 0) this.options.maxLength = Math.min(this.options.maxLength, sourceMaxLength);
		if (Number.isFinite(this.options.maxLength)) this.field.maxLength = this.options.maxLength;
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
		].filter(Boolean).join(" ");
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
	createHiddenParagraph(className, id) {
		const element = this.document.createElement("p");
		element.className = `${className} ${CLASSES.visuallyHidden}`;
		element.id = id;
		return element;
	}
	hideSourceControl() {
		this.source.hidden = true;
		this.source.setAttribute(ATTRIBUTES.ariaHidden, "true");
		this.source.setAttribute(ATTRIBUTES.tabIndex, "-1");
		this.source.required = false;
	}
	addListeners() {
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
	removeListeners() {
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
	onFormReset() {
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
	preserveAccessibleName() {
		const labels = Array.from(this.source.labels ?? []);
		this.previous.labels = labels.map((element) => ({
			element,
			htmlFor: element.getAttribute("for"),
			id: element.getAttribute("id")
		}));
		labels.forEach((label, index) => {
			label.setAttribute("for", this.field.id);
			if (!label.id) label.id = index === 0 ? `${this.field.id}--label` : `${this.field.id}--label-${index + 1}`;
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
	loadInitialTags() {
		const current = this.valueElement.value || "";
		if (!current) return;
		const parsed = this.options.outputFormat === "json" ? this.safeJsonParse(current) : this.options.parser(current, {
			separators: this.options.separators,
			source: this.source,
			instance: this
		});
		if (Array.isArray(parsed)) this.setTags(parsed);
	}
	safeJsonParse(value) {
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed.map(String) : [];
		} catch {
			return [];
		}
	}
	onFieldKeyDown(event) {
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
		if (event.key === "Enter" || event.key.length === 1 && this.options.separators.includes(event.key)) {
			event.preventDefault();
			this.addFromInput(event);
		}
	}
	onFieldInvalid() {
		if (!this.isRequired || this.state.tags.length > 0) return;
		const message = this.message("emptyTag");
		this.setError(message);
		this.announce(message);
	}
	onControlClick(event) {
		if (event.target === this.control || event.target === this.list) this.focus();
	}
	onListClick(event) {
		const button = this.getRemoveButtonFromEvent(event);
		if (!button || button.disabled) return;
		const index = this.getRemoveButtonIndex(button);
		if (index < 0) return;
		if (!this.removeTag(index, { originalEvent: event })) return;
		const nextFocusIndex = Math.min(index, this.removeButtons.length - 1);
		if (nextFocusIndex >= 0) this.focusTag(nextFocusIndex);
		else this.focus();
	}
	onListKeyDown(event) {
		const button = this.getRemoveButtonFromEvent(event);
		if (!button) return;
		const index = this.getRemoveButtonIndex(button);
		if (index < 0) return;
		this.handleRemoveKeyDown(event, index);
	}
	onListFocusIn(event) {
		const button = this.getRemoveButtonFromEvent(event);
		if (!button) return;
		const index = this.getRemoveButtonIndex(button);
		if (index < 0) return;
		this.activeRemoveIndex = index;
		this.syncRovingTabStop();
	}
	getRemoveButtonFromEvent(event) {
		const button = eventTargetElement(event)?.closest(SELECTORS.removeButton);
		return button instanceof HTMLButtonElement && this.list.contains(button) ? button : null;
	}
	getRemoveButtonIndex(button) {
		const index = Number.parseInt(button.getAttribute(ATTRIBUTES.removeIndex) || "", 10);
		return Number.isInteger(index) ? index : -1;
	}
	handleRemoveKeyDown(event, index) {
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
	focusTag(index) {
		if (this.state.isDisabled || this.state.isReadonly) return;
		const button = this.removeButtons[index];
		if (!button) return;
		this.activeRemoveIndex = index;
		this.syncRovingTabStop();
		button.focus();
	}
	activateFieldTabStop() {
		this.activeRemoveIndex = null;
		this.syncRovingTabStop();
	}
	syncRovingTabStop() {
		if (!(!this.state.isDisabled && !this.state.isReadonly && this.removeButtons.length > 0)) this.activeRemoveIndex = null;
		else if (this.activeRemoveIndex !== null && this.activeRemoveIndex >= this.removeButtons.length) this.activeRemoveIndex = this.removeButtons.length - 1;
		this.field.tabIndex = this.state.isDisabled ? -1 : this.activeRemoveIndex === null ? 0 : -1;
		this.removeButtons.forEach((button, index) => {
			button.tabIndex = index === this.activeRemoveIndex ? 0 : -1;
		});
	}
	onFieldPaste(event) {
		if (this.state.isDisabled || this.state.isReadonly) return;
		const text = event.clipboardData?.getData("text") ?? "";
		if (!text) return;
		event.preventDefault();
		const values = this.options.parser(text, {
			separators: this.options.separators,
			source: this.source,
			instance: this
		}).map(String).filter(Boolean);
		let added = 0;
		let skipped = 0;
		for (const value of values) if (this.addTag(value, {
			announce: false,
			originalEvent: event
		})) added += 1;
		else skipped += 1;
		if (added > 0 || skipped > 0) {
			const summary = skipped > 0 ? this.message("pasteAddedSkipped", {
				count: added,
				skipped
			}) : this.message("pasteAdded", { count: added });
			this.announce(summary);
		}
	}
	addFromInput(originalEvent) {
		const value = this.field.value;
		if (this.addTag(value, { originalEvent })) this.field.value = "";
	}
	runHook(name, payload) {
		const hook = this.options.hooks[name];
		if (typeof hook !== "function") return payload;
		return hook(payload, this.context);
	}
	message(key, values = {}) {
		return formatMessage(this.messages[key] ?? defaultMessages[key] ?? "", values);
	}
	emit(name, detail = {}, eventOptions = {}) {
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
	announce(message) {
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
		const commit = () => {
			if (this.destroyed || revision !== this.announcementRevision) return;
			this.status.textContent = nextMessage;
			this.pendingAnnouncement = null;
			this.announcementTimer = null;
		};
		if (view) this.announcementTimer = view.setTimeout(commit, REPEATED_ANNOUNCEMENT_DELAY);
		else queueMicrotask(commit);
	}
	announceIfChanged(message) {
		if (this.status.textContent === message || this.pendingAnnouncement === message) return;
		this.announce(message);
	}
	cancelPendingAnnouncement() {
		this.announcementRevision += 1;
		this.pendingAnnouncement = null;
		if (this.announcementTimer === null) return;
		this.document.defaultView?.clearTimeout(this.announcementTimer);
		this.announcementTimer = null;
	}
	setError(message) {
		this.state.isInvalid = true;
		this.state.lastError = message;
		this.field.setAttribute(ATTRIBUTES.ariaInvalid, "true");
		this.field.setAttribute(ATTRIBUTES.ariaErrormessage, this.error.id);
		this.error.hidden = false;
		this.error.textContent = message;
		this.root.classList.add(CLASSES.invalid);
	}
	clearError() {
		this.state.isInvalid = false;
		this.state.lastError = null;
		this.field.removeAttribute(ATTRIBUTES.ariaInvalid);
		this.field.removeAttribute(ATTRIBUTES.ariaErrormessage);
		this.error.hidden = true;
		this.error.textContent = "";
		this.root.classList.remove(CLASSES.invalid);
	}
	addTag(value, meta = {}) {
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
		if (this.emit(EVENTS.beforeAdd, {
			tag: next,
			originalEvent: meta.originalEvent
		}, { cancelable: true }).defaultPrevented) return false;
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
				...validation.values ?? {}
			};
			const message = validation.message?.trim() || this.message(validation.messageKey || "invalidTag", messageValues) || this.message("invalidTag", messageValues);
			this.setError(message);
			if (meta.announce !== false) this.announce(message);
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
		if (meta.announce !== false) this.announce(this.message("addedTag", { tag: next }));
		this.emit(EVENTS.add, {
			tag: next,
			index: this.state.tags.length - 1,
			originalEvent: meta.originalEvent
		});
		this.emit(EVENTS.change, {
			tag: next,
			originalEvent: meta.originalEvent
		});
		this.runHook("afterAdd", next);
		return true;
	}
	removeTag(indexOrValue, meta = {}) {
		if (this.state.isDisabled || this.state.isReadonly) return false;
		const index = typeof indexOrValue === "number" ? indexOrValue : this.state.tags.indexOf(indexOrValue);
		if (index < 0 || index >= this.state.tags.length) return false;
		const tag = this.state.tags[index];
		if (this.runHook("beforeRemove", tag) === false) return false;
		if (this.emit(EVENTS.beforeRemove, {
			tag,
			index,
			originalEvent: meta.originalEvent
		}, { cancelable: true }).defaultPrevented) return false;
		this.state.tags.splice(index, 1);
		this.render();
		this.syncValue();
		this.clearError();
		if (meta.announce !== false) this.announce(this.message("removedTag", { tag }));
		this.emit(EVENTS.remove, {
			tag,
			index,
			originalEvent: meta.originalEvent
		});
		this.emit(EVENTS.change, {
			tag,
			index,
			originalEvent: meta.originalEvent
		});
		this.runHook("afterRemove", tag);
		return true;
	}
	render() {
		const focusedRemoveIndex = this.removeButtons.findIndex((button) => button === this.document.activeElement);
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
			remove.innerHTML = "<span aria-hidden=\"true\">&times;</span>";
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
			if (nextFocusIndex >= 0 && !this.state.isReadonly && !this.state.isDisabled) this.focusTag(nextFocusIndex);
			else if (!this.state.isDisabled) this.focus();
		} else if (!this.suppressRenderFocus && fieldWasFocused) this.activateFieldTabStop();
		this.emit(EVENTS.render, { tags: this.getTags() });
		this.runHook("afterRender", this.context);
	}
	syncValue() {
		const before = this.runHook("beforeSerialize", this.getTags());
		const value = serializeTags(Array.isArray(before) ? before : this.getTags(), {
			outputFormat: this.options.outputFormat,
			source: this.source,
			instance: this
		});
		const finalValue = this.runHook("afterSerialize", value) ?? value;
		this.valueElement.value = Array.isArray(finalValue) ? JSON.stringify(finalValue) : String(finalValue);
	}
	setTags(tags) {
		this.state.tags = [];
		for (const tag of tags || []) this.addTag(String(tag), {
			announce: false,
			force: true
		});
		this.render();
		this.syncValue();
	}
	getTags() {
		return this.state.tags.slice();
	}
	clear() {
		this.state.tags = [];
		this.render();
		this.syncValue();
		this.clearError();
	}
	focus() {
		this.activateFieldTabStop();
		this.field.focus();
	}
	syncRequiredState() {
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
	validate() {
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
	setValidationError(message) {
		const nextMessage = String(message ?? "").trim();
		if (!nextMessage) {
			this.clearError();
			return;
		}
		this.setError(nextMessage);
	}
	disable() {
		this.state.isDisabled = true;
		this.field.disabled = true;
		this.syncDisabledState();
	}
	enable() {
		this.state.isDisabled = false;
		this.field.disabled = false;
		this.syncDisabledState();
	}
	readonly(value = true) {
		this.state.isReadonly = Boolean(value);
		this.field.readOnly = this.state.isReadonly;
		this.syncDisabledState();
	}
	isLimitReached() {
		return Number.isFinite(this.options.maxTags) && this.state.tags.length >= this.options.maxTags;
	}
	updateLimitState() {
		const limitReached = this.isLimitReached();
		this.root.classList.toggle(CLASSES.limitReached, limitReached);
		this.field.setAttribute(ATTRIBUTES.ariaDisabled, String(this.state.isDisabled));
		this.field.setAttribute(ATTRIBUTES.ariaReadonly, String(this.state.isReadonly || limitReached));
		if (limitReached && !this.state.isDisabled && !this.state.isReadonly) this.field.placeholder = this.message("limitReached");
		else this.field.placeholder = this.source.getAttribute("placeholder") || "";
	}
	updateCounter() {
		if (Number.isFinite(this.options.maxTags)) this.counter.textContent = this.message("counterText", {
			count: this.state.tags.length,
			max: this.options.maxTags
		});
		else this.counter.textContent = "";
	}
	syncDisabledState() {
		const focusedRemoveButton = this.removeButtons.some((button) => button === this.document.activeElement);
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
		for (const button of this.removeButtons) button.disabled = inactive;
		this.syncRovingTabStop();
		if (focusedRemoveButton && this.state.isReadonly && !this.state.isDisabled) this.focus();
	}
	destroy() {
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
};
function createTagInput(source, options = {}) {
	return new A11yTagInput(source, options);
}
function initTagInputs(options = {}) {
	const { root, selector, ...tagInputOptions } = options;
	const searchRoot = root ?? (typeof document === "undefined" ? null : document);
	if (!searchRoot) return [];
	return Array.from(searchRoot.querySelectorAll(selector ?? SELECTORS.source)).filter((element) => isFormValueElement(element)).map((element) => createTagInput(element, tagInputOptions));
}
//#endregion
export { A11yTagInput, builtinTransforms, createTagInput, defaultMessages, defaultParser, formatMessage, initTagInputs, parseSeparators, runTransforms, runValidators, serializeTags };

//# sourceMappingURL=index.js.map