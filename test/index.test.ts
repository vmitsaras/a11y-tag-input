import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  A11yTagInput,
  createTagInput,
  defaultParser,
  formatMessage,
  initTagInputs,
  runTransforms,
  runValidators,
  serializeTags
} from "../src/index";

function renderFixture(markup = ""): HTMLTextAreaElement {
  document.body.innerHTML =
    markup ||
    `<div class="a11y-tag-input" data-a11y-tag-input-root>
      <label for="post-tags">Tags</label>
      <textarea id="post-tags" name="tags" data-a11y-tag-input data-max-tags="3">html,css</textarea>
    </div>`;

  const source = document.querySelector("[data-a11y-tag-input]");
  if (!(source instanceof HTMLTextAreaElement)) {
    throw new Error("Fixture did not create a textarea source.");
  }

  return source;
}

function keydown(
  target: Element,
  key: string,
  options: { isComposing?: boolean; keyCode?: number } = {}
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    isComposing: options.isComposing
  });
  if (options.keyCode !== undefined) {
    Object.defineProperty(event, "keyCode", { value: options.keyCode });
  }
  target.dispatchEvent(event);
  return event;
}

function paste(target: Element, text: string): ClipboardEvent {
  const event = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: {
      getData: (type: string) => (type === "text" ? text : "")
    }
  });
  target.dispatchEvent(event);
  return event;
}

describe("A11y Tag Input helpers", () => {
  it("parses, serializes, transforms, validates, and formats messages", () => {
    const parsed = defaultParser("html, css;javascript\naria", { separators: [",", ";", "Enter"] })
      .map((value) => value.trim())
      .filter(Boolean);

    expect(parsed).toEqual(["html", "css", "javascript", "aria"]);
    expect(
      serializeTags(["html", "css"], {
        outputFormat: "json",
        source: renderFixture(),
        instance: createTagInput(renderFixture())
      })
    ).toBe("[\"html\",\"css\"]");

    const source = renderFixture();
    const instance = createTagInput(source, { lowercase: true }) as A11yTagInput;
    expect(
      runTransforms("  JaVaScript  ", {
        tags: [],
        source,
        instance,
        trim: true,
        lowercase: true
      })
    ).toBe("javascript");
    expect(
      runValidators("html", {
        tags: ["html"],
        source,
        instance,
        messages: instance.messages,
        allowDuplicates: false,
        maxTags: 5,
        minLength: 1,
        maxLength: 50,
        invalidChars: null
      })
    ).toMatchObject({ valid: false, reason: "duplicate" });

    const globalInvalidCharacters = /[^a-z0-9-]/g;
    const validationContext = {
      tags: [],
      source,
      instance,
      messages: instance.messages,
      allowDuplicates: false,
      maxTags: 5,
      minLength: 1,
      maxLength: 50,
      invalidChars: globalInvalidCharacters
    };
    expect(runValidators("not valid", validationContext)).toMatchObject({
      valid: false,
      reason: "invalidChars"
    });
    expect(runValidators("not valid", validationContext)).toMatchObject({
      valid: false,
      reason: "invalidChars"
    });
    expect(globalInvalidCharacters.lastIndex).toBe(0);
    expect(formatMessage("Remove tag {tag}", { tag: "HTML" })).toBe("Remove tag HTML");
  });
});

describe("A11yTagInput", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("exports a plugin-specific creation function and initializes valid markup", () => {
    const source = renderFixture();
    const initEvents: CustomEvent[] = [];
    source.addEventListener("a11y-tag-input:init", (event) => initEvents.push(event as CustomEvent));

    const instance = createTagInput(source) as A11yTagInput;
    const label = document.querySelector("label");

    expect(instance).toBeInstanceOf(A11yTagInput);
    expect(source.hidden).toBe(true);
    expect(source.getAttribute("aria-hidden")).toBe("true");
    expect(label?.getAttribute("for")).toBe(instance.field.id);
    expect(instance.control.getAttribute("role")).toBe("group");
    expect(instance.list.id).toBe(`${instance.field.id}--list`);
    expect(instance.list.getAttribute("aria-label")).toBe("Selected tags");
    expect(instance.field.getAttribute("aria-describedby")).toContain(`${instance.field.id}--instructions`);
    expect(instance.field.getAttribute("aria-describedby")).toContain(`${instance.field.id}--counter`);
    expect(instance.field.getAttribute("aria-describedby")).not.toContain(`${instance.field.id}--error`);
    expect(instance.getTags()).toEqual(["html", "css"]);
    expect(instance.removeButtons).toHaveLength(2);
    expect(instance.field.tabIndex).toBe(0);
    expect(instance.removeButtons.every((button) => button.tabIndex === -1)).toBe(true);
    expect(initEvents).toHaveLength(1);
    expect(initEvents[0]?.detail.instance).toBe(instance);
  });

  it("retargets wrapped labels when the source has no id and restores them on destroy", () => {
    const source = renderFixture(`<div class="a11y-tag-input">
      <label>Topics <textarea name="topics" data-a11y-tag-input>html</textarea></label>
    </div>`);
    const label = document.querySelector("label");
    const instance = createTagInput(source) as A11yTagInput;

    expect(instance.field.id).toMatch(/^a11y-tag-input-.+--field$/);
    expect(label?.getAttribute("for")).toBe(instance.field.id);
    expect(label?.id).toBe(`${instance.field.id}--label`);
    expect(instance.field.getAttribute("aria-labelledby")).toBe(label?.id);
    expect(instance.field.hasAttribute("aria-label")).toBe(false);

    instance.destroy();

    expect(label?.hasAttribute("for")).toBe(false);
    expect(label?.hasAttribute("id")).toBe(false);
  });

  it("retargets every associated label, including labels outside the root", () => {
    document.body.innerHTML = `
      <label id="primary-label" for="project-tags">Project tags</label>
      <div class="a11y-tag-input" data-a11y-tag-input-root>
        <textarea id="project-tags" data-a11y-tag-input></textarea>
      </div>
      <label for="project-tags">Used for filtering</label>
    `;
    const source = document.querySelector("[data-a11y-tag-input]");
    if (!(source instanceof HTMLTextAreaElement)) throw new Error("Fixture did not create a textarea source.");

    const labels = Array.from(source.labels ?? []);
    const instance = createTagInput(source) as A11yTagInput;

    expect(labels).toHaveLength(2);
    expect(labels.every((label) => label.htmlFor === instance.field.id)).toBe(true);
    expect(instance.field.getAttribute("aria-labelledby")).toBe(
      labels.map((label) => label.id).join(" ")
    );
    expect(instance.control.getAttribute("aria-labelledby")).toBe(
      labels.map((label) => label.id).join(" ")
    );

    instance.destroy();

    expect(labels.every((label) => label.htmlFor === "project-tags")).toBe(true);
    expect(labels[0]?.id).toBe("primary-label");
    expect(labels[1]?.hasAttribute("id")).toBe(false);
  });

  it("preserves authored aria-labelledby and aria-label naming precedence", () => {
    const labelledBySource = renderFixture(`<div class="a11y-tag-input">
      <span id="tag-name">Project topics</span>
      <label for="tags">Visible topics</label>
      <textarea
        id="tags"
        data-a11y-tag-input
        aria-label="Ignored fallback"
        aria-labelledby="tag-name"
      ></textarea>
    </div>`);
    const labelledByInstance = createTagInput(labelledBySource) as A11yTagInput;

    expect(labelledByInstance.field.getAttribute("aria-labelledby")).toBe("tag-name");
    expect(labelledByInstance.field.hasAttribute("aria-label")).toBe(false);
    expect(labelledByInstance.control.getAttribute("aria-labelledby")).toBe("tag-name");

    labelledByInstance.destroy();

    const ariaLabelSource = renderFixture(`<div class="a11y-tag-input">
      <textarea id="tags" data-a11y-tag-input aria-label="Project topics"></textarea>
    </div>`);
    const ariaLabelInstance = createTagInput(ariaLabelSource) as A11yTagInput;

    expect(ariaLabelInstance.field.getAttribute("aria-label")).toBe("Project topics");
    expect(ariaLabelInstance.control.getAttribute("aria-label")).toBe("Project topics");
  });

  it("prevents duplicate initialization with a WeakMap", () => {
    const source = renderFixture();
    const first = createTagInput(source) as A11yTagInput;
    const second = createTagInput(source) as A11yTagInput;

    expect(second).toBe(first);
    expect(document.querySelectorAll(".a11y-tag-input__control")).toHaveLength(1);
  });

  it("initializes all matching source controls", () => {
    document.body.innerHTML = `
      <div class="a11y-tag-input" data-a11y-tag-input-root>
        <label for="alpha-tags">Alpha</label>
        <input id="alpha-tags" data-a11y-tag-input value="alpha">
      </div>
      <div class="a11y-tag-input" data-a11y-tag-input-root>
        <label for="beta-tags">Beta</label>
        <textarea id="beta-tags" data-tag-input>beta</textarea>
      </div>
    `;

    const instances = initTagInputs();

    expect(instances).toHaveLength(2);
    expect(document.querySelectorAll(".a11y-tag-input__control")).toHaveLength(2);
  });

  it("adds tags with keyboard input and dispatches bubbling lifecycle events", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input></textarea></div>`);
    const changes: CustomEvent[] = [];
    source.addEventListener("a11y-tag-input:change", (event) => changes.push(event as CustomEvent));
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.value = "ARIA";
    keydown(instance.field, "Enter");

    expect(instance.getTags()).toEqual(["ARIA"]);
    expect(instance.field.value).toBe("");
    expect(source.value).toBe("ARIA");
    expect(instance.status.textContent).toBe("Added tag ARIA.");
    expect(changes).toHaveLength(1);
    expect(changes[0]?.bubbles).toBe(true);
  });

  it("does not commit Enter or separators while IME composition is active", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input></textarea></div>`);
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.value = "日本";
    const enterEvent = keydown(instance.field, "Enter", { isComposing: true });
    const separatorEvent = keydown(instance.field, ",", { isComposing: true });

    expect(enterEvent.defaultPrevented).toBe(false);
    expect(separatorEvent.defaultPrevented).toBe(false);
    expect(instance.getTags()).toEqual([]);
    expect(instance.field.value).toBe("日本");
    expect(instance.status.textContent).toBe("");
  });

  it("commits normally after IME composition ends", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input></textarea></div>`);
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.value = "日本語";
    keydown(instance.field, "Enter", { isComposing: true });
    const enterEvent = keydown(instance.field, "Enter");

    expect(enterEvent.defaultPrevented).toBe(true);
    expect(instance.getTags()).toEqual(["日本語"]);
    expect(instance.field.value).toBe("");
    expect(instance.status.textContent).toBe("Added tag 日本語.");
  });

  it("does not enforce the tag limit against composing keystrokes", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input data-max-tags="1">html</textarea></div>`);
    const instance = createTagInput(source) as A11yTagInput;

    const composingEvent = keydown(instance.field, "あ", { isComposing: true });

    expect(composingEvent.defaultPrevented).toBe(false);
    expect(instance.getTags()).toEqual(["html"]);
    expect(instance.status.textContent).toBe("");
  });

  it("ignores legacy key code 229 while composition is active", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input></textarea></div>`);
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.value = "한국어";
    const event = keydown(instance.field, "Enter", { keyCode: 229 });

    expect(event.defaultPrevented).toBe(false);
    expect(instance.getTags()).toEqual([]);
    expect(instance.field.value).toBe("한국어");
  });

  it("keeps ordinary separator keyboard behavior unchanged", () => {
    const source = renderFixture(`<div class="a11y-tag-input"><label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input></textarea></div>`);
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.value = "css";
    const event = keydown(instance.field, ",");

    expect(event.defaultPrevented).toBe(true);
    expect(instance.getTags()).toEqual(["css"]);
  });

  it("maintains one roving tab stop while navigating and removing tags", () => {
    const source = renderFixture();
    const instance = createTagInput(source) as A11yTagInput;
    const activeTabStops = () =>
      [instance.field, ...instance.removeButtons].filter((element) => element.tabIndex === 0);

    expect(activeTabStops()).toEqual([instance.field]);

    instance.field.focus();
    const tabEvent = keydown(instance.field, "Tab");
    expect(tabEvent.defaultPrevented).toBe(false);

    keydown(instance.field, "Backspace");

    expect(document.activeElement).toBe(instance.removeButtons[1]);
    expect(instance.field.tabIndex).toBe(-1);
    expect(activeTabStops()).toEqual([instance.removeButtons[1]]);

    keydown(instance.removeButtons[1]!, "ArrowLeft");
    expect(document.activeElement).toBe(instance.removeButtons[0]);
    expect(activeTabStops()).toEqual([instance.removeButtons[0]]);

    keydown(instance.removeButtons[0]!, "ArrowRight");
    expect(document.activeElement).toBe(instance.removeButtons[1]);

    keydown(instance.removeButtons[1]!, "ArrowRight");
    expect(document.activeElement).toBe(instance.field);
    expect(activeTabStops()).toEqual([instance.field]);

    keydown(instance.field, "Backspace");
    keydown(instance.removeButtons[1]!, "Home");
    expect(document.activeElement).toBe(instance.removeButtons[0]);

    keydown(instance.removeButtons[0]!, "End");
    expect(document.activeElement).toBe(instance.field);

    keydown(instance.field, "Backspace");
    keydown(instance.removeButtons[1]!, "Delete");
    expect(instance.getTags()).toEqual(["html"]);
    expect(document.activeElement).toBe(instance.removeButtons[0]);
    expect(activeTabStops()).toEqual([instance.removeButtons[0]]);

    instance.removeButtons[0]!.click();
    expect(instance.getTags()).toEqual([]);
    expect(document.activeElement).toBe(instance.field);
    expect(activeTabStops()).toEqual([instance.field]);
  });

  it("keeps focus safe across programmatic rerenders and public focus calls", () => {
    const source = renderFixture();
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.focus();
    keydown(instance.field, "Backspace");
    expect(document.activeElement).toBe(instance.removeButtons[1]);

    instance.setTags(["one", "two", "three"]);

    expect(instance.getTags()).toEqual(["one", "two", "three"]);
    expect(instance.removeButtons).toContain(document.activeElement);
    expect(
      [instance.field, ...instance.removeButtons].filter((element) => element.tabIndex === 0)
    ).toHaveLength(1);

    instance.focus();

    expect(document.activeElement).toBe(instance.field);
    expect(instance.field.tabIndex).toBe(0);
    expect(instance.removeButtons.every((button) => button.tabIndex === -1)).toBe(true);
  });

  it("announces invalid duplicate tags and keeps semantic state aligned", () => {
    const source = renderFixture();
    const instance = createTagInput(source) as A11yTagInput;
    const invalidEvents: CustomEvent[] = [];
    source.addEventListener("a11y-tag-input:invalid", (event) => invalidEvents.push(event as CustomEvent));

    const result = instance.addTag("html");

    expect(result).toBe(false);
    expect(instance.field.getAttribute("aria-invalid")).toBe("true");
    expect(instance.field.getAttribute("aria-errormessage")).toBe(instance.error.id);
    expect(instance.field.getAttribute("aria-describedby")).not.toContain(instance.error.id);
    expect(instance.error.hidden).toBe(false);
    expect(instance.error.getAttribute("role")).toBeNull();
    expect(instance.status.textContent).toBe("Tag html already exists.");
    expect(invalidEvents[0]?.detail.reason).toBe("duplicate");
  });

  it("keeps custom validator errors actionable and never renders an empty message", () => {
    const directSource = renderFixture();
    const directInstance = createTagInput(directSource, {
      validators: [() => ({ valid: false, reason: "reserved", message: "Choose a tag other than reserved." })]
    }) as A11yTagInput;

    expect(directInstance.addTag("reserved")).toBe(false);
    expect(directInstance.error.textContent).toBe("Choose a tag other than reserved.");
    expect(directInstance.status.textContent).toBe("Choose a tag other than reserved.");

    const fallbackSource = renderFixture();
    const fallbackInstance = createTagInput(fallbackSource, {
      validators: [() => ({ valid: false, reason: "reserved", messageKey: "missingCustomKey" })]
    }) as A11yTagInput;

    expect(fallbackInstance.addTag("reserved")).toBe(false);
    expect(fallbackInstance.error.textContent).toBe("Tag is not valid.");
    expect(fallbackInstance.status.textContent).toBe("Tag is not valid.");
  });

  it("lets integrations set, replace, and clear validation errors without announcing", () => {
    const source = renderFixture();
    const instance = createTagInput(source) as A11yTagInput;

    instance.setValidationError("Add at least two committed tags.");

    expect(instance.state.isInvalid).toBe(true);
    expect(instance.state.lastError).toBe("Add at least two committed tags.");
    expect(instance.field.getAttribute("aria-invalid")).toBe("true");
    expect(instance.field.getAttribute("aria-errormessage")).toBe(instance.error.id);
    expect(instance.error.hidden).toBe(false);
    expect(instance.error.textContent).toBe("Add at least two committed tags.");
    expect(instance.root.classList.contains("a11y-tag-input--invalid")).toBe(true);
    expect(instance.status.textContent).toBe("");

    instance.setValidationError("Choose one more tag.");

    expect(instance.state.lastError).toBe("Choose one more tag.");
    expect(instance.error.textContent).toBe("Choose one more tag.");
    expect(instance.status.textContent).toBe("");

    instance.setValidationError("   ");
    expect(instance.state.isInvalid).toBe(false);
    expect(instance.error.hidden).toBe(true);

    instance.setValidationError("Add at least two committed tags.");
    instance.setValidationError(null);

    expect(instance.state.isInvalid).toBe(false);
    expect(instance.state.lastError).toBeNull();
    expect(instance.field.hasAttribute("aria-invalid")).toBe(false);
    expect(instance.field.hasAttribute("aria-errormessage")).toBe(false);
    expect(instance.error.hidden).toBe(true);
    expect(instance.error.textContent).toBe("");
    expect(instance.root.classList.contains("a11y-tag-input--invalid")).toBe(false);
    expect(instance.status.textContent).toBe("");
  });

  it("re-announces identical messages through a separate status update", () => {
    vi.useFakeTimers();
    try {
      const source = renderFixture();
      const instance = createTagInput(source) as A11yTagInput;

      instance.announce("Tag html already exists.");
      expect(instance.status.textContent).toBe("Tag html already exists.");

      instance.announce("Tag html already exists.");
      expect(instance.status.textContent).toBe("");

      vi.advanceTimersByTime(99);
      expect(instance.status.textContent).toBe("");

      vi.advanceTimersByTime(1);
      expect(instance.status.textContent).toBe("Tag html already exists.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("cancels stale repeated announcements when a newer message arrives", () => {
    vi.useFakeTimers();
    try {
      const source = renderFixture();
      const instance = createTagInput(source) as A11yTagInput;

      instance.announce("First message.");
      instance.announce("First message.");
      instance.announce("New message.");
      vi.runAllTimers();

      expect(instance.status.textContent).toBe("New message.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("exposes limit reached as read-only without disabling recovery keys", () => {
    const source = renderFixture(`<div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input data-max-tags="1">html</textarea>
    </div>`);
    const instance = createTagInput(source) as A11yTagInput;

    expect(instance.field.getAttribute("aria-disabled")).toBe("false");
    expect(instance.field.getAttribute("aria-readonly")).toBe("true");
    expect(instance.field.placeholder).toBe("Tag limit reached.");

    const event = keydown(instance.field, "a");
    expect(event.defaultPrevented).toBe(true);
    expect(instance.status.textContent).toBe("Maximum of 1 tags reached.");

    keydown(instance.field, "b");
    expect(instance.status.textContent).toBe("Maximum of 1 tags reached.");

    keydown(instance.field, "Backspace");
    expect(document.activeElement).toBe(instance.removeButtons[0]);
  });

  it("summarizes pasted tags without noisy per-item invalid announcements", () => {
    const source = renderFixture(`<div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input data-max-tags="2">html</textarea>
    </div>`);
    const instance = createTagInput(source) as A11yTagInput;

    paste(instance.field, "css;html;aria");

    expect(instance.getTags()).toEqual(["html", "css"]);
    expect(source.value).toBe("html,css");
    expect(instance.error.hidden).toBe(false);
    expect(instance.error.textContent).toBe("Maximum of 2 tags reached.");
    expect(instance.status.textContent).toBe("Added 1 tags. 2 skipped.");
  });

  it("validates required empty state and clears semantic errors after recovery", () => {
    const source = renderFixture(`<form><div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input required></textarea>
    </div><button type="submit">Submit</button></form>`);
    const instance = createTagInput(source) as A11yTagInput;
    const form = document.querySelector("form");

    if (!(form instanceof HTMLFormElement)) throw new Error("Fixture did not create a form.");

    expect(source.required).toBe(false);
    expect(source.validity.valid).toBe(true);
    expect(instance.field.required).toBe(true);
    expect(instance.field.getAttribute("aria-required")).toBe("true");
    expect(instance.field.validity.customError).toBe(true);
    expect(form.checkValidity()).toBe(false);
    expect(instance.field.getAttribute("aria-invalid")).toBe("true");
    expect(instance.error.textContent).toBe("Enter a tag before adding it.");

    instance.field.value = "uncommitted draft";
    expect(form.checkValidity()).toBe(false);

    expect(instance.validate()).toBe(false);
    expect(instance.field.getAttribute("aria-invalid")).toBe("true");
    expect(instance.field.getAttribute("aria-errormessage")).toBe(instance.error.id);
    expect(instance.error.textContent).toBe("Enter a tag before adding it.");

    expect(instance.addTag("html")).toBe(true);
    expect(instance.field.required).toBe(false);
    expect(instance.field.getAttribute("aria-required")).toBe("true");
    expect(instance.field.validity.valid).toBe(true);
    expect(form.checkValidity()).toBe(true);
    expect(instance.validate()).toBe(true);
    expect(instance.field.hasAttribute("aria-invalid")).toBe(false);
    expect(instance.field.hasAttribute("aria-errormessage")).toBe(false);
    expect(instance.error.hidden).toBe(true);

    instance.destroy();
    expect(source.required).toBe(true);
  });

  it("loads and synchronizes JSON and newline output formats", () => {
    const jsonSource = renderFixture(`<div class="a11y-tag-input">
      <label for="json-tags">JSON tags</label>
      <textarea id="json-tags" data-a11y-tag-input data-output-format="json">["html"]</textarea>
    </div>`);
    const jsonInstance = createTagInput(jsonSource) as A11yTagInput;

    jsonInstance.addTag("css");
    expect(jsonInstance.getTags()).toEqual(["html", "css"]);
    expect(jsonSource.value).toBe("[\"html\",\"css\"]");

    const newlineSource = renderFixture(`<div class="a11y-tag-input">
      <label for="newline-tags">Newline tags</label>
      <textarea id="newline-tags" data-a11y-tag-input data-output-format="newline">html
css</textarea>
    </div>`);
    const newlineInstance = createTagInput(newlineSource) as A11yTagInput;

    newlineInstance.addTag("aria");
    expect(newlineInstance.getTags()).toEqual(["html", "css", "aria"]);
    expect(newlineSource.value).toBe("html\ncss\naria");
  });

  it("restores initial tags after native form reset without announcing or moving focus", async () => {
    const source = renderFixture(`<form><div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input data-max-tags="2">html,css</textarea>
    </div><button type="reset">Reset</button></form>`);
    const instance = createTagInput(source) as A11yTagInput;
    const form = source.form;
    const resetButton = document.querySelector("button");

    if (!form || !(resetButton instanceof HTMLButtonElement)) throw new Error("Reset fixture is incomplete.");

    instance.removeTag("html");
    instance.addTag("aria");
    instance.readonly();
    instance.announce("Stale status");
    const fieldFocus = vi.spyOn(instance.field, "focus");
    resetButton.focus();
    form.reset();
    await Promise.resolve();

    expect(instance.getTags()).toEqual(["html", "css"]);
    expect(source.value).toBe("html,css");
    expect(instance.root.classList.contains("a11y-tag-input--limit-reached")).toBe(true);
    expect(instance.root.classList.contains("a11y-tag-input--readonly")).toBe(true);
    expect(instance.status.textContent).toBe("");
    expect(fieldFocus).not.toHaveBeenCalled();
  });

  it("restores an empty required default and clears stale validation state", async () => {
    const source = renderFixture(`<form><div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input required></textarea>
    </div></form>`);
    const instance = createTagInput(source) as A11yTagInput;
    const form = source.form;
    if (!form) throw new Error("Reset fixture has no form.");

    instance.addTag("html");
    instance.setTags([]);
    instance.validate();
    expect(instance.state.isInvalid).toBe(true);

    form.reset();
    await Promise.resolve();

    expect(instance.getTags()).toEqual([]);
    expect(instance.state.isInvalid).toBe(false);
    expect(instance.error.hidden).toBe(true);
    expect(instance.field.required).toBe(true);
    expect(instance.field.validity.customError).toBe(true);
  });

  it("uses the post-reset alternate value element and synchronizes multiple widgets", async () => {
    document.body.innerHTML = `<form>
      <div class="a11y-tag-input"><label for="alpha">Alpha</label>
        <textarea id="alpha" data-a11y-tag-input data-output-target="#alpha-value"></textarea>
        <input id="alpha-value" name="alpha" value="one,two">
      </div>
      <div class="a11y-tag-input"><label for="beta">Beta</label>
        <textarea id="beta" data-a11y-tag-input>three</textarea>
      </div>
    </form>`;
    const sources = Array.from(document.querySelectorAll("textarea"));
    const [alpha, beta] = sources.map((source) => createTagInput(source) as A11yTagInput);
    const form = document.querySelector("form");
    const alphaValue = document.querySelector("#alpha-value");
    if (!alpha || !beta || !(form instanceof HTMLFormElement) || !(alphaValue instanceof HTMLInputElement)) {
      throw new Error("Multiple reset fixture is incomplete.");
    }

    alpha.setTags(["changed"]);
    beta.clear();
    beta.disable();
    form.reset();
    await Promise.resolve();

    expect(alpha.getTags()).toEqual(["one", "two"]);
    expect(alphaValue.value).toBe("one,two");
    expect(beta.getTags()).toEqual(["three"]);
    expect(beta.state.isDisabled).toBe(true);
    expect(beta.root.classList.contains("a11y-tag-input--disabled")).toBe(true);
  });

  it("does not reconcile a destroyed instance and keeps duplicate initialization to one reset listener", async () => {
    const source = renderFixture(`<form><div class="a11y-tag-input">
      <label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input>html</textarea>
    </div></form>`);
    const first = createTagInput(source) as A11yTagInput;
    const duplicate = createTagInput(source) as A11yTagInput;
    const renderSpy = vi.spyOn(first as unknown as { render(): void }, "render");
    const form = source.form;
    if (!form) throw new Error("Reset fixture has no form.");

    expect(duplicate).toBe(first);
    first.destroy();
    source.value = "changed";
    form.reset();
    await Promise.resolve();

    expect(renderSpy).not.toHaveBeenCalled();
    expect(document.querySelector(".a11y-tag-input__control")).toBeNull();
  });

  it("updates disabled and readonly states", () => {
    const source = renderFixture();
    const instance = createTagInput(source) as A11yTagInput;

    instance.disable();
    expect(source.disabled).toBe(true);
    expect(instance.control.getAttribute("aria-disabled")).toBe("true");
    expect(instance.root.classList.contains("a11y-tag-input--disabled")).toBe(true);
    expect(instance.field.tabIndex).toBe(-1);
    expect(instance.removeButtons.every((button) => button.tabIndex === -1)).toBe(true);

    instance.enable();
    instance.field.focus();
    keydown(instance.field, "Backspace");
    expect(document.activeElement).toBe(instance.removeButtons[1]);

    instance.readonly();
    expect(source.disabled).toBe(false);
    expect(source.readOnly).toBe(true);
    expect(instance.field.getAttribute("aria-readonly")).toBe("true");
    expect(instance.removeButtons.every((button) => button.disabled)).toBe(true);
    expect(instance.removeButtons.every((button) => button.tabIndex === -1)).toBe(true);
    expect(instance.field.tabIndex).toBe(0);
    expect(document.activeElement).toBe(instance.field);
  });

  it("returns focus to the input after removing the only focused tag", () => {
    const source = renderFixture(`<div class="a11y-tag-input">
      <label for="tags">Tags</label>
      <textarea id="tags" data-a11y-tag-input>html</textarea>
    </div>`);
    const instance = createTagInput(source) as A11yTagInput;

    instance.field.focus();
    keydown(instance.field, "Backspace");
    expect(document.activeElement).toBe(instance.removeButtons[0]);

    keydown(instance.removeButtons[0]!, "Delete");

    expect(instance.getTags()).toEqual([]);
    expect(document.activeElement).toBe(instance.field);
  });

  it("restores the original control and removes listeners/state on destroy", () => {
    const source = renderFixture();
    const destroyEvents: CustomEvent[] = [];
    source.addEventListener("a11y-tag-input:destroy", (event) => destroyEvents.push(event as CustomEvent));
    const instance = createTagInput(source) as A11yTagInput;
    const field = instance.field;
    const label = document.querySelector("label");
    const removeSpy = vi.spyOn(instance, "removeTag");

    instance.destroy();
    keydown(field, "Enter");

    expect(source.hidden).toBe(false);
    expect(source.getAttribute("aria-hidden")).toBeNull();
    expect(source.getAttribute("tabindex")).toBeNull();
    expect(label?.getAttribute("for")).toBe("post-tags");
    expect(document.querySelector(".a11y-tag-input__control")).toBeNull();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(destroyEvents).toHaveLength(1);
    expect(createTagInput(source)).not.toBe(instance);
  });

  it("cancels pending repeated announcements on destroy", () => {
    vi.useFakeTimers();
    try {
      const source = renderFixture();
      const instance = createTagInput(source) as A11yTagInput;
      const status = instance.status;

      instance.announce("Repeated message.");
      instance.announce("Repeated message.");
      instance.destroy();
      vi.runAllTimers();

      expect(status.isConnected).toBe(false);
      expect(status.textContent).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });
});
