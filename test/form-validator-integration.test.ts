import { beforeEach, describe, expect, it } from "vitest";
import {
  A11yFormValidator,
  ErrorRenderer,
  createDefaultPreset,
  createFormValidator,
  type FieldController,
  type ValidationContext,
  type ValidatorRenderer
} from "a11y-form-validator";

import { A11yTagInput, createTagInput, type TagInputInstance } from "../src/index";

function createIntegrationRenderer(tagInput: TagInputInstance): ValidatorRenderer {
  let fallbackRenderer: ErrorRenderer | undefined;
  const getFallbackRenderer = (field: FieldController): ErrorRenderer => {
    fallbackRenderer ??= new ErrorRenderer(field.validator);
    return fallbackRenderer;
  };

  return {
    render(field, message) {
      if (field.primaryElement === tagInput.field) {
        tagInput.setValidationError(message);
        field.setVisualState("invalid");
        return;
      }

      getFallbackRenderer(field).render(field, message);
    },
    clear(field) {
      if (field.primaryElement === tagInput.field) {
        tagInput.setValidationError(null);
        field.setVisualState("valid");
        return;
      }

      getFallbackRenderer(field).clear(field);
    },
    destroy() {
      tagInput.setValidationError(null);
      fallbackRenderer?.destroy();
    }
  };
}

describe("A11y Form Validator integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("validates committed tags through one tag-field error owner and cleans up", async () => {
    document.body.innerHTML = `<form id="publish-form">
      <label for="title">Article title</label>
      <input id="title" name="title" required>
      <label for="email">Editor email</label>
      <input id="email" name="email" type="email" required>
      <div data-a11y-tag-input-root>
        <label for="topics">Topic tags</label>
        <textarea id="topics" name="topics" data-a11y-tag-input></textarea>
      </div>
      <button type="submit">Publish</button>
      <button type="reset">Reset</button>
    </form>`;

    const form = document.querySelector("#publish-form");
    const source = document.querySelector("#topics");
    const title = document.querySelector("#title");
    const email = document.querySelector("#email");

    if (
      !(form instanceof HTMLFormElement) ||
      !(source instanceof HTMLTextAreaElement) ||
      !(title instanceof HTMLInputElement) ||
      !(email instanceof HTMLInputElement)
    ) {
      throw new Error("Integration fixture is incomplete.");
    }

    const tagInput = createTagInput(source) as A11yTagInput;
    const validator = createFormValidator(form, {
      ...createDefaultPreset(),
      validateOn: ["submit"],
      renderer: createIntegrationRenderer(tagInput),
      rules: {
        [tagInput.field.id]: {
          "minimum-tags": { min: 2 }
        }
      }
    }) as A11yFormValidator;

    validator.registerRule("minimum-tags", ({ options }: ValidationContext) => {
      const minimum = Number(options.min ?? 2);
      const count = tagInput.getTags().length;
      return {
        valid: count >= minimum,
        message: `Add at least ${minimum} committed topic tags. You currently have ${count}.`
      };
    });

    let tagChangeValidation: Promise<boolean> = Promise.resolve(true);
    source.addEventListener("a11y-tag-input:change", () => {
      if (validator.hasSubmitted) {
        tagChangeValidation = validator.validate({ reason: "change" });
      }
    });

    expect(validator.fieldMap.has(tagInput.field.id)).toBe(true);
    expect(validator.fieldMap.get(tagInput.field.id)?.primaryElement).toBe(tagInput.field);

    tagInput.field.value = "uncommitted-draft";
    expect(await validator.validate({ reason: "submit" })).toBe(false);
    expect(tagInput.getTags()).toEqual([]);
    expect(tagInput.error.textContent).toContain("currently have 0");
    expect(tagInput.field.getAttribute("aria-errormessage")).toBe(tagInput.error.id);
    expect(form.querySelectorAll(".a11y-form-validator__summary")).toHaveLength(1);
    expect(form.querySelectorAll(".a11y-form-validator__summary-link")).toHaveLength(3);

    validator.focusOnError();
    const summary = form.querySelector<HTMLElement>(".a11y-form-validator__summary");
    expect(document.activeElement).toBe(summary);

    const tagSummaryLink = Array.from(
      form.querySelectorAll<HTMLAnchorElement>(".a11y-form-validator__summary-link")
    ).find((link) => link.getAttribute("href") === `#${tagInput.field.id}`);
    expect(tagSummaryLink?.textContent).toContain("Topic tags");
    tagSummaryLink?.click();
    expect(document.activeElement).toBe(tagInput.field);

    title.value = "Accessible form patterns";
    email.value = "editor@example.com";
    tagInput.field.value = "";
    expect(tagInput.addTag("accessibility")).toBe(true);
    expect(await validator.validate({ reason: "submit" })).toBe(false);
    expect(tagInput.error.textContent).toContain("currently have 1");

    expect(tagInput.addTag("forms")).toBe(true);
    expect(await validator.validate({ reason: "submit" })).toBe(true);
    expect(tagInput.getTags()).toEqual(["accessibility", "forms"]);
    expect(source.value).toBe("accessibility,forms");
    expect(tagInput.field.hasAttribute("aria-invalid")).toBe(false);
    expect(tagInput.error.hidden).toBe(true);

    validator.hasSubmitted = true;
    expect(tagInput.removeTag("forms")).toBe(true);
    await tagChangeValidation;
    expect(tagInput.error.textContent).toContain("currently have 1");
    expect(summary?.hidden).toBe(false);

    expect(tagInput.addTag("forms")).toBe(true);
    await tagChangeValidation;
    expect(tagInput.field.hasAttribute("aria-invalid")).toBe(false);
    expect(summary?.hidden).toBe(true);

    email.value = "invalid-email";
    expect(await validator.validate({ reason: "submit" })).toBe(false);
    expect(form.querySelector("#a11y-form-validator-error-publish-form-email")?.textContent).toMatch(/email/i);
    expect(tagInput.field.hasAttribute("aria-invalid")).toBe(false);

    form.reset();
    await Promise.resolve();
    validator.reset();
    expect(tagInput.getTags()).toEqual([]);
    expect(tagInput.field.value).toBe("");
    expect(tagInput.field.hasAttribute("aria-errormessage")).toBe(false);
    expect(form.querySelector("#a11y-form-validator-error-publish-form-email")).toBeNull();

    validator.destroy();
    tagInput.destroy();
    expect(source.hidden).toBe(false);
    expect(source.hasAttribute("aria-hidden")).toBe(false);
    expect(form.querySelector(".a11y-form-validator__summary")).toBeNull();
    expect(form.querySelector(".a11y-tag-input__error")).toBeNull();
  });
});
