# Keyboard And Focus State Matrix

## Classification And Contract

- Repository: normalized TypeScript plugin package.
- Pattern: progressively enhanced form helper with a text field and removable tag controls.
- Focus contract: the generated tag editor has exactly one sequential Tab stop while enabled. The text field is the initial stop; keyboard navigation can move that stop to a remove button without intercepting Tab.
- Semantic contract: tags remain a native list and removal actions remain native buttons. No toolbar, listbox, or other unsupported composite role is added.
- Guidance note: the Modern Web Guidance CLI could not be executed safely in this environment. The contract follows the W3C APG focus-management principles and targets Baseline 2024; real browser and assistive-technology verification remains required.

## State Matrix

| State | Trigger / entry condition | Visual UI | DOM / semantic state | Keyboard and focus behavior | Expected screen reader behavior | Event | Automated evidence | Manual evidence needed | Risk |
|---|---|---|---|---|---|---|---|---|---|
| Initialized, empty | Empty source is enhanced | Empty editor | Field is labelled; tag list is hidden | Field has `tabindex="0"` | Field name and instructions are expected | `a11y-tag-input:init` | Initialization tests | Browser Tab entry | Low |
| Initialized, populated | Source contains tags | Chips precede the field | List and native remove buttons are present | Field is the only initial Tab stop; remove buttons use `tabindex="-1"` | Tags and tag-specific remove names remain available in browse/navigation modes | `a11y-tag-input:init` | Roving-tab-stop test | Screen reader browse-mode navigation | Medium |
| Field active | Field receives focus, label activation, public `focus()`, or invalid-form focus | Control focus ring | Field has `tabindex="0"`; remove buttons have `-1` | Typing and caret behavior remain native; Tab leaves the component | Field name, instructions, and state are expected | None | Focus and validation tests | Forward and reverse Tab | Low |
| Remove navigation active | Backspace from an empty field or focus enters a remove button | Focus ring on one remove button | Active remove button has `tabindex="0"`; field and other remove buttons have `-1` | Left/Right navigate; Home goes first; End returns to field; Tab leaves | Active button's tag-specific name is expected | None | Keyboard navigation test | Screen reader focus announcement | Medium |
| Focused tag removed | Delete, Backspace, Enter, Space, or pointer activates removal | Chip disappears | List/buttons rerender; value and status update | Focus moves to the next tag, previous final tag, or field when empty | Removal status is expected; new focus target should be identifiable | remove/change/render | Removal focus test | Native Enter/Space in target browsers | Medium |
| Max limit | Tag count reaches `maxTags` | Limit styling and placeholder | Field exposes read-only limit state without being disabled | Field remains recoverable; empty-field Backspace enters remove navigation | Limit state and status are expected | limit/invalid | Limit recovery test | AT announcement quality | Medium |
| Required invalid | Native form validation finds no committed tags | Visible error | Generated field owns invalid state and required validity | Browser focus activates the field Tab stop | Error relationship and status are expected | None | Validation tests and Chrome fixture | Firefox/Safari and AT | Medium |
| Read-only | Option or method enables read-only | Read-only styling | Field is read-only; remove buttons are disabled | Field becomes the only Tab stop; focused remove control returns to field | Read-only state is expected | render when applicable | Read-only focus test | Browser focus transition | Low |
| Disabled | Option or method disables component | Disabled styling | Field and remove buttons are disabled | No generated control participates in sequential focus | Disabled state is expected | None | Disabled-state test | Focus behavior when disabled asynchronously | Medium |
| Destroyed / reinitialized | `destroy()` followed by optional initialization | Generated UI removed/restored | Source attributes and labels are restored | Generated listeners and roving state are removed; reinit starts at field | Original control is expected again | destroy/init | Cleanup and duplicate-init tests | Browser Tab order after reinit | Low |

## Key Matrix

| Key / action | State | Result | Focus result |
|---|---|---|---|
| Tab / Shift+Tab | Any active internal control | Native behavior is not canceled | Leaves the component; re-entry uses the current roving stop |
| Backspace | Empty field with tags | Enters tag navigation | Final remove button |
| ArrowLeft / ArrowRight | Remove button | Moves through remove buttons; Right from final returns to field | Previous/next remove button or field |
| Home / End | Remove button | Moves to the start or editing endpoint | First remove button or field |
| Delete / Backspace | Remove button | Removes focused tag | Next tag, previous final tag, or field |
| Enter / Space | Remove button | Uses native button activation | Next tag, previous final tag, or field |
| Escape | Field | Clears only the draft value | Field remains focused |
| Enter or configured separator during IME composition | Field | Composition continues; no tag, validation, limit, or status action runs | Field remains focused |

## Stop Conditions For Future Changes

- Do not add a toolbar, listbox, or application role merely to justify focus management.
- Do not intercept Tab or Shift+Tab.
- Do not intercept ArrowLeft/ArrowRight while focus is in the text field.
- Any change to tag order, removal, disabled/read-only behavior, or rerendering must preserve exactly one enabled internal Tab stop and a safe focus destination.
- Do not claim named screen reader output without testing that combination.
