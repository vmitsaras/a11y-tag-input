import { beforeEach, describe, expect, it } from "vitest";

import { inspectTagInputs, type TagInputDiagnosticCode } from "../src/dev";

function codes(markup: string): TagInputDiagnosticCode[] {
  document.body.innerHTML = markup;
  return inspectTagInputs({ root: document }).map((item) => item.code);
}

describe("inspectTagInputs", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns no diagnostics for clean markup with a wrapping label", () => {
    expect(
      codes(`<div data-a11y-tag-input-root><label>Tags <textarea id="tags" data-a11y-tag-input></textarea></label></div>`)
    ).toEqual([]);
  });

  it("supports external labels, multiple controls, and document fragments", () => {
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <label for="one">First tags</label>
      <div data-a11y-tag-input-root><textarea id="one" data-a11y-tag-input></textarea></div>
      <div data-a11y-tag-input-root><label for="two">Second tags</label><input id="two" data-a11y-tag-input></div>`;
    fragment.append(wrapper);

    expect(inspectTagInputs({ root: fragment })).toEqual([]);
  });

  it("reports naming, relationship, duplicate ID, and nested-root diagnostics", () => {
    const result = codes(`
      <div data-a11y-tag-input-root>
        <div class="a11y-tag-input">
          <textarea id="same" data-a11y-tag-input aria-labelledby="missing"></textarea>
          <span id="same"></span>
        </div>
      </div>`);

    expect(result).toEqual(
      expect.arrayContaining(["duplicate-id", "nested-root", "broken-labelledby-reference", "missing-accessible-name"])
    );
  });

  it("reports invalid output selectors, missing targets, and invalid target elements", () => {
    expect(
      codes(`
        <label for="a">A</label><div data-a11y-tag-input-root><textarea id="a" data-a11y-tag-input data-output-target="["></textarea></div>
        <label for="b">B</label><div data-a11y-tag-input-root><textarea id="b" data-a11y-tag-input data-output-target="#missing"></textarea></div>
        <label for="c">C</label><div data-a11y-tag-input-root><textarea id="c" data-a11y-tag-input data-output-target="#target"></textarea><output id="target"></output></div>`)
    ).toEqual(
      expect.arrayContaining([
        "invalid-output-target-selector",
        "output-target-not-found",
        "output-target-invalid-element"
      ])
    );
  });

  it("reports malformed data and contradictory attributes", () => {
    const result = codes(`
      <div data-a11y-tag-input-root>
        <label for="tags">Tags</label>
        <textarea id="tags" data-a11y-tag-input disabled readonly
          data-disabled="false" data-readonly="false"
          data-output-format="xml" data-messages="{bad"
          data-min-length="9" data-max-length="2"></textarea>
      </div>`);

    expect(result).toEqual(
      expect.arrayContaining([
        "invalid-output-format",
        "malformed-messages-json",
        "contradictory-disabled-state",
        "contradictory-readonly-state",
        "contradictory-length-limits"
      ])
    );
  });

  it("reports non-object JSON message options", () => {
    expect(
      codes(`<label for="tags">Tags</label><textarea id="tags" data-a11y-tag-input data-messages="[]"></textarea>`)
    ).toContain("invalid-messages-value");
  });

  it("reports an invalid inspection selector without throwing", () => {
    expect(inspectTagInputs({ root: document, selector: "[" })).toMatchObject([{ code: "invalid-selector" }]);
  });

  it("does not mutate inspected markup", () => {
    document.body.innerHTML = `<div data-a11y-tag-input-root><textarea data-a11y-tag-input data-output-format="bad"></textarea></div>`;
    const before = document.body.innerHTML;

    inspectTagInputs({ root: document });

    expect(document.body.innerHTML).toBe(before);
  });

  it("matches the flawed and corrected states published in the development inspector demo", () => {
    document.body.innerHTML = `
      <div id="flawed-inspection-root" inert aria-hidden="true">
        <div data-a11y-tag-input-root>
          <textarea id="flawed-demo-tags" data-a11y-tag-input data-output-format="xml"
            data-output-target="#missing-output" data-messages="{not-json"></textarea>
        </div>
      </div>
      <div id="corrected-inspection-root" inert aria-hidden="true">
        <div data-a11y-tag-input-root>
          <label for="corrected-demo-tags">Article tags</label>
          <textarea id="corrected-demo-tags" data-a11y-tag-input data-output-format="json"
            data-output-target="#corrected-tags-value"
            data-messages='{"inputLabel":"Add article tag"}'></textarea>
          <input id="corrected-tags-value" name="tags" type="hidden">
        </div>
      </div>`;

    const flawedRoot = document.querySelector("#flawed-inspection-root");
    const correctedRoot = document.querySelector("#corrected-inspection-root");

    expect(inspectTagInputs({ root: flawedRoot ?? undefined }).map((item) => item.code)).toEqual([
      "missing-accessible-name",
      "invalid-output-format",
      "output-target-not-found",
      "malformed-messages-json"
    ]);
    expect(inspectTagInputs({ root: correctedRoot ?? undefined })).toEqual([]);
  });
});
