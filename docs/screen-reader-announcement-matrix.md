# Screen Reader Announcement Matrix

## Purpose

This matrix defines the intended spoken-information contract for the generated tag input. Automated tests and the Chrome fixture verify DOM relationships, message timing, coalescing, and cleanup. They cannot prove what a screen reader actually speaks, so the named assistive technology combinations remain manual release checks.

## Announcement Contract

- The generated input keeps its authored accessible name and is described by concise instructions plus the current tag counter.
- A single persistent `role="status"` region receives polite, atomic updates. It is present before any message is written and never receives focus.
- One add or remove action produces one concise status message.
- A paste operation suppresses per-item announcements and produces one final added/skipped summary.
- An identical message from a later action is cleared and reinserted in a separate update so it remains eligible for announcement.
- Repeated character keys at the max-tag limit do not keep rewriting the same status message.
- Validation renders visible error text and connects it through `aria-invalid="true"` and `aria-errormessage`. The error is not also added to `aria-describedby`, avoiding an extra competing description path.

## State Matrix

| User action or state | Visual result | Programmatic result | Expected spoken information | DOM evidence | Manual AT check |
|---|---|---|---|---|---|
| Focus generated field | Field, existing tags, and counter are visible | Authored name is preserved; instructions and counter are in `aria-describedby` | Field name, role, instructions, and current count without a duplicate hidden source field | Unit naming tests and required fixture | NVDA/Firefox or Chrome; VoiceOver/Safari |
| Add one valid tag | Chip appears and input clears | Persistent status becomes `Added tag {tag}.` | One polite confirmation naming the added tag | Unit test | Confirm one announcement and sensible ordering |
| Remove one tag | Chip disappears and focus recovers | Persistent status becomes `Removed tag {tag}.` | One polite confirmation naming the removed tag; newly focused control remains identifiable | Unit keyboard tests | Confirm status and focus announcement do not become confusing |
| Reject a duplicate or invalid tag | Visible error appears | Field gets `aria-invalid="true"` and `aria-errormessage`; status receives the same concise error | One useful explanation of the rejected value, without two competing live-region announcements | Unit test and status fixture | Confirm the browser/AT reads the error once per action |
| Repeat the same invalid action | Existing visible error remains | Status text clears, then the same message is reinserted after 100 ms | The same useful error is available again for the later action | Timer unit test and status fixture | Repeat the identical error twice and confirm one announcement per attempt |
| Paste mixed valid/invalid values | Accepted chips appear; final validation state is visible if relevant | Per-item announcements are suppressed; one added/skipped summary is written | One concise summary, not a burst of individual messages | Unit test and status fixture | Paste a mixed list and confirm only the summary is heard |
| Type after max-tag limit | No character is inserted; limit styling remains | First character action writes the limit message; subsequent identical keys leave it unchanged | One limit explanation until another status-producing action changes the message | Unit test and status fixture | Hold a character key and confirm the message is not repeated continuously |
| Empty required validation | Visible required error appears and browser focus targets the generated field | Generated field owns required validity, `aria-invalid`, and `aria-errormessage`; status receives the error | Field identity and one actionable required error | Unit test and required fixture | Submit twice and confirm the repeated error remains available without excessive duplication |
| New message arrives while a repeated message is pending | Latest visual/status state wins | Pending repeated timer is canceled before the new text is written | Only the newest relevant message | Timer unit test and status fixture | Rapidly trigger two outcomes and listen for stale speech |
| Destroy during a pending repeat | Generated UI is removed | Pending timer is canceled and cannot update detached status content | No delayed stale announcement from the destroyed component | Timer unit test | Optional lifecycle check in an integrating app |

## Manual Test Record

Record browser, browser version, screen reader, screen reader version, date, scenario, result, and notes. Do not convert DOM-only evidence into a claim of assistive technology support.

| Date | Browser | Screen reader | Scenario | Result | Notes |
|---|---|---|---|---|---|
| Not yet run | NVDA with Firefox or Chrome | NVDA | Full matrix | Pending | Required before claiming this combination was verified |
| Not yet run | Safari | VoiceOver | Full matrix | Pending | Required before claiming this combination was verified |
