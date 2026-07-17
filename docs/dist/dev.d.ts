//#region src/dev.d.ts
type TagInputDiagnosticSeverity = "error" | "warning";
type TagInputDiagnosticCode = "invalid-selector" | "duplicate-id" | "nested-root" | "missing-accessible-name" | "broken-labelledby-reference" | "invalid-output-format" | "invalid-output-target-selector" | "output-target-not-found" | "output-target-invalid-element" | "malformed-messages-json" | "invalid-messages-value" | "contradictory-disabled-state" | "contradictory-readonly-state" | "contradictory-length-limits";
interface TagInputDiagnostic {
  code: TagInputDiagnosticCode;
  severity: TagInputDiagnosticSeverity;
  message: string;
  element: Element;
  relatedElements?: Element[];
  /** Review pointers only. Their presence is not a claim of WCAG conformance or failure. */
  wcag?: string[];
}
interface InspectTagInputsOptions {
  root?: ParentNode;
  selector?: string;
}
declare function inspectTagInputs(options?: InspectTagInputsOptions): TagInputDiagnostic[];
//#endregion
export { InspectTagInputsOptions, TagInputDiagnostic, TagInputDiagnosticCode, TagInputDiagnosticSeverity, inspectTagInputs };
//# sourceMappingURL=dev.d.ts.map