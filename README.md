# Ditto customer dashboard

A web prototype of the Ditto customer dashboard, built from the Figma page
**"🧁 Deena's draft" / Page 5** (file `kalCtplJimHm1xtOJGC60d`, node `5:5`).
It shares its stack and conventions with the
[Ditto renewal flow](https://github.com/Deenadd/ditto-renewal-flow).

- Live: https://ditto-customer-dashboard.vercel.app
- Every push to `main` deploys to production on Vercel.

## Screens

| Route | Screen | Figma node |
| --- | --- | --- |
| `/` | Sign in | `149:10704` |
| `/dashboard` | Pending applications, card view | `149:8862` |
| `/dashboard?view=timeline` | Pending applications, timeline view | `149:9509` |
| `/dashboard?tab=active` | Active policies | `149:9845` |
| `/dashboard?tab=inactive` | Inactive policies | `149:10213` |
| `/dashboard?customer=new` | No pending applications (empty state) | `149:10485` |
| `/dashboard/policies/474-981-34EDH20` | Policy view | `149:9188` |

State lives in the URL, so every screen has a link to share. The avatar menu
switches between the customer with pending applications and the one with
none, and logs out.

## Design direction

The screens follow the Figma page's structure and content, restyled in a
polished Apple style:

- **System type**: SF Pro on Apple devices, Inter elsewhere. There's a large
  bold page title, 17px semibold headlines, and tracking that tightens as size
  grows.
- **Surfaces**: a white page with white 22px cards edged by a hairline and a
  soft shadow, facts in inset grey tiles, and spacing instead of divider lines.
- **Controls**: segmented controls for the tabs and the grouped/timeline view,
  buttons with the input field's 14px corners (`--radius-control`), one
  filled action per view, and tinted status capsules
  with a dot.
- **Materials**: frosted popovers, and a header that floats on a progressive
  blur. Both turn solid under *Reduce transparency*.
- **Motion**: the segmented thumb slides as soon as a segment is picked and
  can be redirected mid-slide. Document rows glide into place when reordered
  (FLIP), popovers grow from their trigger, and presses scale to 0.96. Every
  motion drops to a cross-fade or nothing under *Reduce motion*.
- **Progressive blur** at both edges of the dashboard and policy pages,
  ported from Deena's portfolio (4px blur, masked; technique from Skiper
  UI). At the bottom it's 80px, so content softens instead of being cut off.
  At the top it's 150px behind the header (120px on phones) and fades in over
  the first 80px of scroll, so the header sits on the plain page at rest and
  nothing is smeared. It stays nearly solid through the header's height so
  the icons remain legible, and it replaces the header's frosted bar and
  hairline.
- **Colour**: every text/background pair is measured and meets WCAG AA; the
  values are listed at the top of `app/globals.css`.

## Sign in

The 3D art is gone; a circular glow in the colours of the reference
(pinterest.com/pin/16747829862479363, sampled from its pixels: deep blue
`#0471fa` at the core, cyan `#00ccff`, a soft edge into white) rises from the
bottom. The logo, heading, subtitle and input row sit in the same place on
both steps; only the words change and the glow moves. Entering a number sends
the glow up to hang from the top for the code step. A wrong code turns it red,
the right one green, then the dashboard opens. Values are in
`components/login/glow-ramps.ts`.

### Glow controls

On the sign-in page, **Shift+Option+C** (Shift+Alt+C) opens a tuning panel for
the glow:

- **Preview:** force it to the top or bottom, and blue, red or green.
- **Size:** radius, width cap, where the soft edge starts, and intensity.
- **Positions:** offset, horizontal position and scale for the bottom and top
  rest positions.
- **Animation:** move duration, easing presets or a custom curve with a
  preview, and colour-change speed.

Changes apply live and are remembered in that browser. **Copy config** copies
the JSON; paste it into `defaultGlowConfig` in
`components/login/glow-config.ts` to make it the default for everyone.
Escape or the shortcut closes the panel, and the glow goes back to following
the flow.

## Frosted side sheet

`components/ui/frosted-side-sheet/` is the side sheet from DD-Kitchen
(ryoiki-tenkai.vercel.app/projects/side-sheet), as a reusable component driven
by one config object with the tuned values as defaults: physics spring
(stiffness 274, damping 51, mass 3.1), stagger 160ms then 70ms apart, 28px blur
feathered over 160px, `#F7F7F7` tint at 0.72. `transitionType` switches between
"easing", "time" and "physics". It's a dialog: focus moves in, stays in, and
returns to the row that opened it; Escape or a click outside closes it.

## What works

- **Sign in**: a 10-digit mobile number, or a policy number (letters, digits
  and hyphens, 8 to 20 characters). Either leads to **Verify your number**. The
  prototype sends no SMS: **2168** signs in; any other code turns the glow red,
  explains, and clears the boxes. A full code verifies itself. There's a
  30-second resend timer and Change number.
- **Segmented controls** are links, so every view has its own URL.
- **Claims support** replaces saved documents: four topics (make a claim,
  documents, what's covered, track a claim) each open the frosted sheet with a
  short guided conversation. While it's open, the other rows dim to 40%. The
  same card is on the policy page, in place of the quick links. Guidance lives
  in `lib/claims-flow.ts`.
- **Notifications** (the bell) lists the latest application updates and marks
  them read; each opens the timeline.
- **Avatar menu** switches between the customer with pending applications and
  the one with none, and logs out.
- **Active health policy** opens the policy page; the back link returns.

Buttons with no destination yet: Chat now, Talk to our team, Download policy,
and Talk to a claims expert (which says so in the conversation).

## Content changes from the Figma draft

- Counts are real: 3 active policies (the draft said 2 but listed 3).
- Tabs are "Pending", "Active", "Inactive", in the same order on every screen.
- Group titles are shortened to "Needs your attention" and "With the
  insurer". The verification status reads "With the insurer".
- Every application has its own number (the draft reused one).
- The expired policy shows when it expired, not a future "valid till" date.
- Rejection reasons are rewritten in plain language, and the second card has
  its own reason.
- Cover descriptions replace the maternity text the draft reused for three
  items. "Treatment at home" is covered when no hospital bed is available and
  excluded by choice, which resolves the draft listing it as both covered and
  not covered.
- The quick links become the Claims support topics.
- Typos and casing: sentence case throughout; "drap", "Sucide" and
  "Domicillary" are fixed.

**Worth a check with the business**: the new cover descriptions, the
exclusion wording, the rejection reasons and the claims guidance (timelines,
documents) are plausible placeholders, not policy wording.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| Font | Inter via `next/font/google` (SF Pro first on Apple devices) |
| Motion | `motion` (Motion for React) for the side sheet and sign-in |
| Icons | `lucide-react` for the claims topics and sheet |
| Hosting | Vercel |

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Other scripts: `npm run build`,
`npm run start`, `npm run lint`.

## Layout

```
app/
  globals.css                 Design tokens
  page.tsx                    Sign in
  dashboard/page.tsx          The three tabs, welcome and claims support
  dashboard/policies/[id]/    Policy view
components/
  login-form.tsx              Number step and code step
  login/                      The sign-in glow and its colour ramps
  claims/                     Claims support card and conversation
  ui/frosted-side-sheet/      The reusable sheet and its config
  dashboard/  policy/         Cards, timeline, empty state, policy view
  ui/                         Buttons, menus, logo tiles, segmented control
lib/
  claims-flow.ts              The claims conversation
  dashboard-data.ts           Everything the dashboard shows
  policy-detail.ts            The policy view's content
  routes.ts                   URL state for tab, view and customer
```
