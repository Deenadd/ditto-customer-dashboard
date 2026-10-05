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

The 3D art is gone. A wash of colour hangs from the top of the screen for the
whole flow, taken from the reference's vectorised gradient (Fuse's onboarding,
1179 × 1817 under a 126px blur) and mirrored: a deep blue dome (`#3063DB`
through `#4EA1E8`) in a cyan band (`#65C9F1`, `#62C2F5`, `#60C3F1`) that pales
through sky `#C0E6F9` into white. It doesn't move. A wrong code turns it red,
the right one green, then the dashboard opens. Values are in
`components/login/glow-ramps.ts`.

The sign-in block is centred on screen, both ways. The two steps differ in
height, so it's centred on their midpoint: the logo, heading and inputs stay
in the same place on both steps and when an error appears. The defaults (54dvh deep at 0.4 intensity, a soft bowed edge) are the ones
tuned in the panel on 1 Oct 2026.

### Glow controls

On the sign-in page, **Shift+Option+C** (Shift+Alt+C) opens a tuning panel for
the wash:

- **Preview:** force it blue, red or green.
- **Shape:** height, how much the lower edge bows, how soft it is, intensity.
- **Blue dome:** a pad you drag to move it (with Across and Down sliders for
  the keyboard), plus width and depth.
- **Dome colours** and **Band colours:** a strip previewing each gradient,
  then one row per colour: the swatch opens a colour picker, the slider moves
  it, and minus removes it (two at least). **Add colour** puts a new one in
  the widest gap, mixed from its neighbours, up to ten.
- **Animation:** colour-change speed.

Red and green are made from whatever blue is set, by hue alone, so edited
colours carry through to the wrong-code and right-code states.

Changes apply live and are remembered in that browser. **Copy config** copies
the JSON; paste it into `defaultGlowConfig` in
`components/login/glow-config.ts` to make it the default for everyone.
Escape or the shortcut closes the panel, and the colour goes back to following
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
  prototype sends no SMS: **2168** signs in; any other code turns the wash red,
  explains, and clears the boxes. A full code verifies itself. There's a
  30-second resend timer and Change number.
- **Segmented controls** are links, so every view has its own URL. The
  policy tabs run Active, Pending, Inactive, and Active opens by default.
- **Active policies are cards** (Figma node 152:12881): the policy on the
  front and its people on the back, each a white card in a gradient frame
  with wave lines, blue for health and green for term (the blue's hues moved
  in OKLCH). A card with a policy page opens it from anywhere on the card.
  White text on the frame measures 2.1 to 2.8:1, below 4.5:1; it's the
  design's palette, so it's left as drawn.
- **Glare and tilt** on hover, after Aceternity's glare card: the face under
  the pointer tilts toward it, a white glare follows it and a faint rainbow
  foil shifts. Reduced motion keeps the glare and drops the tilt; touch
  screens, with no hover, get none of it.

### Mobile

- Edge to edge on iPhones (`viewport-fit=cover`), with safe-area padding on
  the header, sheet and bottom bars. The header is solid page white: iOS 26
  Safari tints the status bar from it (otherwise content scrolls sharp
  behind the clock), and a short progressive blur sits just below it.
- The page is scroll-locked behind the side sheet and dialogs
  (`lib/use-scroll-lock.ts`), on iOS too, while the chat itself scrolls.
- Touch screens get the cards without the glare layers, which they can't
  use and Safari composites at a cost.

### Card controls

On the dashboard, **Shift+Option+C** opens a panel for the cards. Pick Health
or Term to edit its gradient: a mesh pad (drag the ring to move the gradient's
centre; add, drag, recolour, resize or remove colour points; arrow keys move
the focused point), the centre, ring and edge colours, where the ring sits and
how far it reaches, and the wave, shade and glow colours. Glare, foil, tilt,
perspective, lift and settle time apply to every card. Copy config gives the
JSON for `components/dashboard/card-config.ts`.

The sign-in glow panel has the same mesh pad: the ring is the blue dome, and
colour points layer over the wash.
- **Claims support** replaces saved documents: four topics (make a claim,
  documents, what's covered, track a claim) each open the frosted sheet with a
  short guided conversation. While it's open, the other rows dim to 40%. The
  same card is on the policy page, in place of the quick links. Guidance lives
  in `lib/claims-flow.ts`.
  - Ditto types for a moment before each reply; your answers show as blue
    bubbles. Policy answers are rows with the insurer's logo.
  - Claim steps are a numbered timeline. The documents are a checklist you
    tick off, with a count and a bar; photo ID starts ticked, as it's on file.
  - Talk to a claims expert books a callback (now, later today or tomorrow
    morning) and ends on a confirmation. No call is placed.
  - Some answers are interactive (gabriell_lab's tip: make it explorable).
    Not sure a hospital is in the network? Search it in the chat and it says
    whether cashless works, then carries on. Before and after a stay shows
    your exact cover window for a date and length of stay.
  - Every answer can be undone with Back; Start over asks the first question
    again. Each ending offers a next step, such as Check something else.
- **Notifications** (the bell) lists the latest application updates and marks
  them read; each opens the timeline.
- **Avatar menu** switches between the customer with pending applications and
  the one with none, and logs out.
- **Active health policy** opens the policy page; the back link returns.

Buttons with no destination yet: Chat now, Talk to our team and Download policy.

## Claims

The health policy page has a **Claims** card under Claims support, with **Start a claim**, the
page's one filled action, and the open claims once there are any.

- **Make a claim:** Cashless, or Reimbursement (marked Coming soon).
- **Four steps**, with progress and Continue in a bar at the bottom. Each step
  checks its answers on Continue and says what's missing beside the question;
  focus moves to each new step's heading.
  1. **Patient:** anyone on the policy, with relation and age.
  2. **Treatment:** category (hospitalisation or day care), the treatment's
     name, and the stage you're at. Each question folds away once answered; the
     stages depend on the category. Already discharged warns that cashless
     usually isn't possible then.
  3. **Dates:** whether you know the admission date, and the date. It must
     fall in the policy year (20 Aug 2026 to 19 Aug 2027), be today or later
     for a planned stay, and today or earlier once admitted.
  4. **Hospital:** search by name, area, city or PIN. Each hospital says
     whether it's in Care Health's network; picking one that isn't explains
     what that means. **Can't find your hospital?** lets you enter one or say
     you haven't chosen yet.
- **Your cashless claim:** status and request date; the health card itself,
  with its glare, to show at the hospital, beside the patient and a reference
  to copy; what happens next; the claim's details; and, quietly at the foot,
  Delete claim (with a confirmation that focuses Cancel).
- **Look:** each step opens with a small picture of the policy card and the
  policy's name. Answers are one card with hairline rows (inset grouped, as
  on iOS); the chosen row is tinted and its radio filled. People get the
  member icons from the policy card.
- **Claim ticket:** sending the claim prints a ticket (after msbr_dev's
  receipt animation): it feeds out of a printer slot in short pulls, torn
  edge and barcode first, then a "Request received" stamp lands. View claim
  opens it; Print again replays it. Reduced motion shows it finished.
- **Claims:** Active and Past, with an empty state. After a delete it says
  which claim went.

There's no backend, so claims are kept in the browser they were made in. The
hospitals are a made-up sample list. The policy's Valid till is now
19 Aug 2027, so the flow has a current policy year to work in.

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
| Icons | `components/ui/icons.tsx`, drawn with `lucide-react` for now. Central Icons is the intended set; its packages need a licence key (`CENTRAL_LICENSE_KEY`) on install, locally and on Vercel, and then only this file changes |
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
  …/[id]/claims/              Claims list; new/ is the flow, [claimId]/ a claim
components/
  login-form.tsx              Number step and code step
  login/                      The sign-in wash and its colour ramps
  claims/                     Claims support card and conversation
  ui/frosted-side-sheet/      The reusable sheet and its config
  dashboard/  policy/         Cards, timeline, empty state, policy view
  ui/                         Buttons, menus, logo tiles, segmented control
  ui/icons.tsx                Every interface icon, in one place
lib/
  claims-flow.ts              The claims conversation
  claims.ts                   Claims, the hospital list and the claim store
  dashboard-data.ts           Everything the dashboard shows
  policy-detail.ts            The policy view's content
  routes.ts                   URL state for tab, view and customer
```
