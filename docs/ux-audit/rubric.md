# Weekly UX audit

Every Wednesday at 1 pm IST an Orca automation runs Claude on this repo with
one standing instruction:

> Check and fix the whole A to Z of every flow. Add the error, success and
> other cases at a good UX and UI level. Fix the components that already
> exist even further. Report what we did and by how much it improved.

This file is how a run does that, so every week is scored the same way and the
percentages can be compared.

## 1. Set up

- Work in the run's fresh worktree, from the latest `main`: `git pull --rebase origin main`, then `npm ci`.
- Read `AGENTS.md`, `README.md` and the last entry in `docs/ux-audit/reports.md`.
- Load the UI skills before touching any UI, as the global CLAUDE.md requires:
  `emil-design-eng`, `better-ui`, plus `better-writing` (errors, empty states),
  `better-accessibility`, `better-layout`, `mobile-native`, `animate` when
  motion changes. Apply them to the code that ships.
- Design direction is Apple. Arc was tried and revoked; never reintroduce it.
  Don't touch Central Icons or Bencho's pictures (licences).

## 2. Score before fixing

Build and start the site (`npm run build && npx next start -p 3123`), run
`npm run qa`, then walk every flow below in Chrome at 1280px and at 390px and
320px phone widths (Playwright, `hasTouch: true`). Score each state of each
flow:

| Score | Meaning |
| --- | --- |
| 2 | At the bar: clear, polished, recovers well, works on a phone and by keyboard |
| 1 | Present but rough: wording vague, no way forward, cramped on a phone, missing feedback |
| 0 | Missing or broken |
| n/a | Cannot occur in this flow (say why in one line) |

The states:

| State | What 2 looks like |
| --- | --- |
| **Happy path** | The flow completes end to end with no dead ends |
| **In progress** | Anything that takes time shows it (spinner, skeleton, disabled button with its label) |
| **Empty** | Nothing yet says what goes here and offers the next action |
| **Error** | Validation and failures say how to fix, beside the field, focused, announced; nothing is lost |
| **Success** | The outcome is confirmed, with what happens next |
| **Edges** | Long names, no match, back and undo, refresh keeps state, double taps, disabled controls |
| **Phone** | No overflow at 320px, 44px targets, 16px inputs, safe areas, haptics, press feedback |
| **Access** | Keyboard path, visible focus, names and roles, reduced motion |

The flows, A to Z:

1. Sign in: phone number
2. Sign in: one-time code
3. Dashboard: welcome card (desktop) and top sheet (phone)
4. Dashboard: Active, Pending, Inactive tabs and their lists, including an empty tab
5. Pending application timeline
6. Policy page: health card, flip on phone, members, download
7. Policy page: network hospitals (expand, directions, call, website)
8. Support: global help, WhatsApp
9. Claims list and a claim's page, including delete
10. New claim v2: the chat (cashless, reimbursement, hospital check, cover window)
11. New claim v1: the one flow (cashless and reimbursement)
12. Uploading documents
13. The claim ticket (print, stamp, copy reference, View claim, Print again)
14. Ditto Buddy
15. Header: notifications, profile, breadcrumbs
16. Lost: unknown URLs, unknown policy or claim ids, a crash (error boundary)

A flow's score is its points over twice its applicable states. **The site's
score is all points over all applicable maximums**, as a percentage. Write
the table, so next week can see what moved.

## 3. Fix

Work from the lowest scores up. For each fix:

- Fix the cause, in the project's tokens and components; extend a component
  rather than forking it.
- Errors say how to fix, never blame, no "oops". Empty states point forward.
  Success says what happens next.
- Every new state works at 320px and by keyboard.
- Add or extend a check in `scripts/qa/flows/` (and list it in
  `scripts/qa/run.mjs`) for anything a script can see, so it stays fixed.

Keep the week's work reviewable: a dozen or so focused fixes beats a rewrite.
Don't redesign what the user has signed off (the README records those
decisions); polish it.

## 4. Score after, and ship

- `npx tsc --noEmit`, `npx eslint app components lib`, `npm run build` and
  `npm run qa` must all pass. If something can't be made to pass, revert that
  fix rather than ship it broken, and say so in the report.
- Re-score every flow the same way.
- Commit in focused commits ending with the co-author line, rebase on
  `origin/main`, and `git push origin HEAD:main`. Vercel deploys `main`
  to https://ditto-customer-dashboard.vercel.app.
- Run `npm run qa -- https://ditto-customer-dashboard.vercel.app` once the
  deploy is ready.

## 5. Report

Add an entry at the top of `docs/ux-audit/reports.md`:

```markdown
## 14 Oct 2026

**Score: 71% → 84% (+13 points, 18% better).** Flow checks: 13/13 → 15/15 live.

| Flow | Before | After | What changed |
| --- | --- | --- | --- |
| Sign in: one-time code | 12/16 | 15/16 | Resend countdown; expired code error |

### What we fixed
- One line per fix: what was wrong for the person, what it does now.

### Still open
- What scored below 2 and why it waits.

### Needs a real phone
- Anything only hardware can confirm (haptics, safe areas, keyboard).
```

"Points better" is after minus before; "% better" is that over before. Also
record the totals in `docs/ux-audit/scores.json` (append one object:
`{ "date", "before", "after", "flows": { name: [before, after, max] } }`).
Write the report in plain words for a designer, not a changelog of files.
