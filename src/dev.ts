export type TagInputDiagnosticSeverity = "error" | "warning";

export type TagInputDiagnosticCode =
  | "invalid-selector"
  | "duplicate-id"
  | "nested-root"
  | "missing-accessible-name"
  | "broken-labelledby-reference"
  | "invalid-output-format"
  | "invalid-output-target-selector"
  | "output-target-not-found"
  | "output-target-invalid-element"
  | "malformed-messages-json"
  | "invalid-messages-value"
  | "contradictory-disabled-state"
  | "contradictory-readonly-state"
  | "contradictory-length-limits";

export interface TagInputDiagnostic {
  code: TagInputDiagnosticCode;
  severity: TagInputDiagnosticSeverity;
  message: string;
  element: Element;
  relatedElements?: Element[];
  /** Review pointers only. Their presence is not a claim of WCAG conformance or failure. */
  wcag?: string[];
}

export interface InspectTagInputsOptions {
  root?: ParentNode;
  selector?: string;
}

const SOURCE_SELECTOR =
  "input[data-a11y-tag-input], textarea[data-a11y-tag-input], input[data-tag-input], textarea[data-tag-input]";
const ROOT_SELECTOR = "[data-a11y-tag-input-root], .a11y-tag-input";
const OUTPUT_FORMATS = new Set(["csv", "json", "newline", "array"]);

function diagnostic(
  code: TagInputDiagnosticCode,
  severity: TagInputDiagnosticSeverity,
  message: string,
  element: Element,
  extra: Pick<TagInputDiagnostic, "relatedElements" | "wcag"> = {}
): TagInputDiagnostic {
  return { code, severity, message, element, ...extra };
}

function ownerDocument(root: ParentNode): Document | null {
  return root instanceof Document ? root : root.ownerDocument;
}

function findById(root: ParentNode, doc: Document | null, id: string): Element | null {
  const inDocument = doc?.getElementById(id);
  if (inDocument && (root instanceof Document || root.contains(inDocument))) return inDocument;
  return Array.from(root.querySelectorAll("[id]")).find((element) => element.id === id) ?? null;
}

function hasAccessibleName(
  source: HTMLInputElement | HTMLTextAreaElement,
  inspectionRoot: ParentNode,
  doc: Document | null
): boolean {
  if (source.getAttribute("aria-label")?.trim()) return true;

  const labelledBy = source.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (labelledBy.some((id) => findById(inspectionRoot, doc, id)?.textContent?.trim())) return true;

  if (Array.from(source.labels ?? []).some((label) => label.textContent?.trim())) return true;
  if (source.closest("label")?.textContent?.trim()) return true;
  return Array.from(inspectionRoot.querySelectorAll("label")).some(
    (label) => label instanceof HTMLLabelElement && label.htmlFor === source.id && Boolean(label.textContent?.trim())
  );
}

function inspectSource(
  source: HTMLInputElement | HTMLTextAreaElement,
  inspectionRoot: ParentNode,
  doc: Document | null,
  diagnostics: TagInputDiagnostic[]
): void {
  const root = source.closest(ROOT_SELECTOR) ?? source.parentElement;
  const labelledBy = source.getAttribute("aria-labelledby")?.trim().split(/\s+/).filter(Boolean) ?? [];
  const missingReferences = labelledBy.filter((id) => !findById(inspectionRoot, doc, id));

  if (missingReferences.length > 0) {
    diagnostics.push(
      diagnostic(
        "broken-labelledby-reference",
        "error",
        `aria-labelledby references missing ID${missingReferences.length === 1 ? "" : "s"}: ${missingReferences.join(", ")}.`,
        source,
        { wcag: ["1.3.1", "4.1.2"] }
      )
    );
  }

  if (!hasAccessibleName(source, inspectionRoot, doc)) {
    diagnostics.push(
      diagnostic("missing-accessible-name", "error", "Tag input source has no detectable accessible name.", source, {
        wcag: ["1.3.1", "3.3.2", "4.1.2"]
      })
    );
  }

  const outputFormat = source.dataset.outputFormat;
  if (outputFormat && !OUTPUT_FORMATS.has(outputFormat)) {
    diagnostics.push(
      diagnostic(
        "invalid-output-format",
        "error",
        `data-output-format must be csv, json, newline, or array; received ${JSON.stringify(outputFormat)}.`,
        source
      )
    );
  }

  const outputTarget = source.dataset.outputTarget;
  if (outputTarget && root) {
    let target: Element | null = null;
    try {
      target = root.querySelector(outputTarget);
    } catch {
      diagnostics.push(
        diagnostic("invalid-output-target-selector", "error", `data-output-target is not a valid selector: ${outputTarget}.`, source)
      );
    }
    if (!target) {
      if (!diagnostics.some((item) => item.code === "invalid-output-target-selector" && item.element === source)) {
        diagnostics.push(
          diagnostic("output-target-not-found", "error", `No output target inside the tag input root matches ${outputTarget}.`, source)
        );
      }
    } else if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      diagnostics.push(
        diagnostic(
          "output-target-invalid-element",
          "error",
          "The output target must be an input or textarea.",
          source,
          { relatedElements: [target] }
        )
      );
    }
  }

  const messages = source.dataset.messages;
  if (messages) {
    try {
      const parsed: unknown = JSON.parse(messages);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        diagnostics.push(
          diagnostic("invalid-messages-value", "error", "data-messages must contain a JSON object.", source)
        );
      }
    } catch {
      diagnostics.push(diagnostic("malformed-messages-json", "error", "data-messages contains malformed JSON.", source));
    }
  }

  if (source.disabled && source.dataset.disabled === "false") {
    diagnostics.push(
      diagnostic("contradictory-disabled-state", "warning", "The native disabled attribute contradicts data-disabled=\"false\".", source)
    );
  }
  if (source.readOnly && source.dataset.readonly === "false") {
    diagnostics.push(
      diagnostic("contradictory-readonly-state", "warning", "The native readonly attribute contradicts data-readonly=\"false\".", source)
    );
  }

  const min = Number(source.dataset.minLength);
  const max = Number(source.dataset.maxLength);
  if (source.dataset.minLength && source.dataset.maxLength && Number.isFinite(min) && Number.isFinite(max) && min > max) {
    diagnostics.push(
      diagnostic("contradictory-length-limits", "error", "data-min-length cannot be greater than data-max-length.", source)
    );
  }
}

export function inspectTagInputs(options: InspectTagInputsOptions = {}): TagInputDiagnostic[] {
  const root = options.root ?? (typeof document === "undefined" ? null : document);
  if (!root) return [];

  const diagnostics: TagInputDiagnostic[] = [];
  const selector = options.selector ?? SOURCE_SELECTOR;
  let matches: Element[];
  try {
    if (!hasBalancedSelectorSyntax(selector)) throw new SyntaxError("Unbalanced selector");
    matches = Array.from(root.querySelectorAll(selector));
  } catch {
    const element =
      root instanceof Element
        ? root
        : "documentElement" in root && root.documentElement instanceof Element
          ? root.documentElement
          : ownerDocument(root)?.documentElement;
    return element
      ? [diagnostic("invalid-selector", "error", `Inspector selector is invalid: ${selector}.`, element)]
      : [];
  }

  const sources = matches.filter(
    (element): element is HTMLInputElement | HTMLTextAreaElement =>
      element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
  );
  const doc = ownerDocument(root);

  const idElements = Array.from(root.querySelectorAll("[id]"));
  const ids = new Map<string, Element[]>();
  for (const element of idElements) {
    const id = element.id;
    if (id) ids.set(id, [...(ids.get(id) ?? []), element]);
  }
  for (const [id, elements] of ids) {
    if (elements.length > 1) {
      diagnostics.push(
        diagnostic("duplicate-id", "error", `ID ${JSON.stringify(id)} is used ${elements.length} times in the inspection root.`, elements[0], {
          relatedElements: elements.slice(1),
          wcag: ["1.3.1", "4.1.2"]
        })
      );
    }
  }

  const componentRoots = Array.from(root.querySelectorAll(ROOT_SELECTOR));
  for (const componentRoot of componentRoots) {
    const ancestor = componentRoot.parentElement?.closest(ROOT_SELECTOR);
    if (ancestor) {
      diagnostics.push(
        diagnostic("nested-root", "error", "Tag input roots must not be nested.", componentRoot, { relatedElements: [ancestor] })
      );
    }
  }

  for (const source of sources) inspectSource(source, root, doc, diagnostics);
  return diagnostics;
}

function hasBalancedSelectorSyntax(selector: string): boolean {
  const pairs: Record<string, string> = { "]": "[", ")": "(" };
  const stack: string[] = [];
  let quote = "";
  let escaped = false;
  for (const character of selector) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "[" || character === "(") stack.push(character);
    else if (character === "]" || character === ")") {
      if (stack.pop() !== pairs[character]) return false;
    }
  }
  return Boolean(selector.trim()) && !quote && stack.length === 0;
}
