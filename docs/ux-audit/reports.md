# UX audit reports

Newest first. Each weekly run adds an entry here; how it scores is in
[rubric.md](rubric.md).

## 7 Oct 2026

**Score: 82.5% → 99.5% (+17.0 points, 20.6% better).** Flow checks: 14/14 → 18/18 live.

This is the first run, so it sets the baseline: 170 of 206 points before, 205 after.
Sixteen flows were scored at 1280px and at 390px and 320px phone widths. New claim v2
is scored as the type-first flow (cashless and reimbursement steps) plus the claims
chat's hospital check and cover window. Three of the four new flow checks are this
run's (lost, states, recover); homeflip came with the home-card flip that landed on main
during the run. The first live run lost three checks to a full disk on the audit machine.
They passed when re-run, and a second full live run passed 18/18.

| Flow | Before | After | What changed |
| --- | --- | --- | --- |
| Sign in: phone number | 13/14 | 14/14 | A pasted number in any form (+91 98765-43210) is read as its 10 digits |
| Sign in: one-time code | 15/16 | 16/16 | A refresh stays on the code step |
| Dashboard: welcome card and top sheet | 9/10 | 10/10 | Tab stays inside the phone top sheet |
| Dashboard: tabs, lists and home cards | 10/12 | 11/12 | Waiting cards get a next step; empty Pending's Talk to our team works |
| Pending application timeline | 7/8 | 8/8 | The same next step on its cards |
| Policy page: card, flip, members, download | 9/14 | 14/14 | Download shows saving, then saved or a retry message, and is announced |
| Policy page: network hospitals | 9/10 | 10/10 | No-match search explains itself and offers Clear search |
| Support: global help, WhatsApp | 8/8 | 8/8 | At the bar already |
| Claims list and a claim's page | 13/16 | 16/16 | Loading outline, Undo after delete, Copy says if it failed, 44px Copy |
| New claim v2 (type first; cashless, reimbursement, chat widgets) | 14/16 | 16/16 | Answers survive a refresh; errors focused and beside the field; sends once |
| New claim v1 (one flow) | 14/16 | 16/16 | The same |
| Uploading documents | 10/14 | 14/14 | Wrong type, over 10 MB and duplicates explained; adds announced; 40px remove |
| The claim ticket | 12/14 | 14/14 | Refresh opens the claim; Copy says if it failed |
| Ditto Buddy | 15/16 | 16/16 | Long messages wrap inside the bubble |
| Header: notifications, profile, breadcrumbs | 9/12 | 12/12 | No updates yet state, signed-out note, Skip to content |
| Lost: unknown URLs, ids, a crash | 3/10 | 10/10 | Branded not-found and error pages with a way home |

### What we fixed
- **Lost pages.** A mistyped link or unknown policy showed a bare black-on-white "404" with no way back, and a crash showed the browser's error. Both now show the Ditto bar and one card that says what happened, with Go to your policies (and Try again after a crash).
- **Applications waiting on you.** "Pending uploads" and "Missing details" said something was wrong but gave nothing to do. Each card now ends with what's needed and Send on WhatsApp or Finish on WhatsApp, the application number already in the message.
- **Empty Pending tab.** Talk to our team did nothing. It opens WhatsApp, and says so under the button.
- **Saving the policy card.** The download tick showed even when the image failed, and a double tap saved two files. It now spins while drawing, ignores extra taps, then ticks or says "Couldn't save. Try again", and screen readers hear which.
- **Hospital search with no match.** It left an empty white strip. It now says nothing matched that search, suggests the area or PIN, and offers Clear search.
- **Claim answers kept.** A refresh in the middle of a claim threw every answer away. Cashless, reimbursement and v1 now keep them for the tab and say "We kept your answers", with Start over.
- **Sending a claim.** Two quick taps on Send could make two claims, and a refresh on the printed ticket dropped you back at an empty form, inviting a second claim. It now sends once, and a refresh opens the claim you made.
- **Errors at the field.** In the cashless flow a missing answer was named at the foot of the step without moving focus, and in reimbursement the message sat under a seven-field grid. Now focus goes to the answer at fault, the message sits beside it, and the page keeps it clear of the Continue bar. Enter your hospital no longer ignores an empty name.
- **Adding documents.** A Word file picked through All files, a 40 MB scan, or the same bill twice were all accepted silently. Each is now left out with a note beside its row saying what to add instead, adds and removals are announced, and the remove buttons are 40px targets on a phone.
- **Deleting a claim.** It couldn't be undone. The claims list now offers Undo for the rest of the visit.
- **Claims loading.** The claims list and a claim's page were blank for a moment while the browser read the claims. They now show the page's outline.
- **Copying a reference.** On the claim page and the ticket, a blocked clipboard did nothing. It now says it couldn't copy, and the Copy button takes a 44px tap area.
- **Header.** With no updates the bell disappeared; it stays, and says No updates yet. Log out now says "You've signed out" and clears this tab's claim drafts. Skip to content is the first Tab stop on every page.
- **Sign in.** Pasting "+91 98765-43210" filled the box with a cut-off number and an error. It now reads the 10 digits. A refresh on the code step stays there.
- **Smaller fixes.** Tab no longer slips out of the phone's welcome sheet onto the page behind. A long unbroken message wraps inside its Buddy bubble.

### Still open
- **Inactive tab (tabs, lists and home cards, happy path 1).** Expired policies and rejected applications still end without a next step, such as renew, or ask an advisor what to try instead. That changes the card design, so it's a design call for next week.
- **The rubric is near its ceiling.** Most flows now score 2 everywhere. Next week should look harder: a slow network on tab switches, the sign-in field relying on its placeholder as the visible label, and the header popovers not moving focus into themselves.

### Needs a real phone
- The haptics on the new buttons (Send on WhatsApp, Clear search, Undo) come from the global tap haptics; confirm they play on iOS Safari.
- That a claim-flow error lands clear of the Continue bar with Safari's toolbar collapsed and expanded.
- WhatsApp handing over from the new links, with the message filled in, on iOS and Android.
- The skip link and the error pages under the notch and home indicator in landscape.
