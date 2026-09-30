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

Structure and content come from the Figma page. The visual system is
[Arc](https://uiarc.dev) (uiarc.dev), with Ditto's blue as the accent.

- **Arc foundation**: `registry/foundation.css` holds the tokens (colour roles,
  radii 18/26/34, shadows, spacing, motion) and is imported once in
  `app/layout.tsx` with `data-accent="blue"`. Tailwind names in
  `app/globals.css` point at Arc's roles, so utilities and Arc components agree.
- **Arc components** (installed from the registry into `registry/components/`):
  button, segmented control, badge, OTP input, avatar, empty state, progress
  and scroll area. The scroll area runs the claims conversation.
- **Type**: Geist for headings 30px and up, Inter for everything else, weights
  400 and 500 only, sizes from Arc's scale.
- **Surfaces**: cards rest on a 1px border with no shadow; only floating layers
  (menus, the sheet) cast one. Nested corners are concentric.
- **Motion**: Arc's motion tokens and springs; the segmented highlight glides,
  and every animation has a reduced-motion branch.
- **One deliberate departure**: Arc removes focus rings by design. Ditto keeps
  them (`--focus-ring` is the accent) so keyboard users can see where they
  are.

### Sign-in glow

The sign-in screen uses the glow from the reference
(pinterest.com/pin/16747829862479363), rebuilt from pixel samples: white to
about 42%, a domed soft edge into cyan `#00ccff`, deepening to `#0471fa` at the
edge. The rebuild is within about 3% per channel of the reference. It rests at
the bottom while you enter a number, travels up the screen to rest, mirrored,
at the top for the code, then turns red for a wrong code or green for the right
one. Red and green keep every stop's lightness and chroma and change only the
hue (OKLCH). Values are in `components/login/glow-ramps.ts`.

### Frosted side sheet

`components/ui/frosted-side-sheet/` is the side sheet from DD-Kitchen
(ryoiki-tenkai.vercel.app/projects/side-sheet), as a reusable component driven
by one config object. The tuned values are the defaults, verbatim:
physics spring (stiffness 274, damping 51, mass 3.1), stagger 160ms then 70ms
apart, 28px blur feathered over 160px, `#F7F7F7` tint at 0.72. `transitionType`
switches between "easing", "time" and "physics". It's a dialog: focus moves
in, stays in, and returns to the row that opened it; Escape or a click outside
closes it.

### Progressive blur

At both edges of the dashboard and policy pages, ported from Deena's
portfolio (4px blur, masked; technique from Skiper UI): 80px at the bottom,
and 150px behind the header (120px on phones) that fades in over the first
80px of scroll.

## What works

- **Sign in**: a 10-digit mobile number, or a policy number (letters, digits
  and hyphens, 8 to 20 characters). Either leads to **Verify your number**. The
  prototype sends no SMS: **2168** signs in; any other code turns the glow red,
  explains, and clears the boxes. A full code verifies itself. There's a
  30-second resend timer and Change number.
- **Segmented controls** keep each view in the URL.
- **Claims support** replaces saved documents. Four topics (make a claim,
  documents, what's covered, track a claim) each open the frosted sheet with a
  short guided conversation. While it's open, the other rows dim to 40%. The
  same card is on the policy page. Guidance lives in `lib/claims-flow.ts`.
- **Notifications** (the bell) lists the latest application updates.
- **Avatar menu** switches between the customer with pending applications and
  the one with none, and logs out.
- **Active health policy** opens the policy page; the back link returns.

Buttons with no destination yet: Chat with us, Talk to our team, Download
policy, and Talk to a claims expert (which says so in the conversation).

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
| Design system | Arc (uiarc.dev): `registry/foundation.css` and `registry/components/` |
| Styling | Tailwind CSS v4, names mapped to Arc roles in `app/globals.css` |
| Motion | `motion` (Motion for React), Arc motion tokens in `lib/motion-tokens.ts` |
| Icons | `lucide-react` at 16 and 20px, stroke 1.75 |
| Fonts | Geist and Inter via `next/font/google` |
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
  globals.css                 Tailwind names mapped to Arc roles
  page.tsx                    Sign in
  dashboard/page.tsx          The three tabs, welcome and claims support
  dashboard/policies/[id]/    Policy view
components/
  login-form.tsx              Number step and code step
  login/                      The sign-in glow and its colour ramps
  claims/                     Claims support card and conversation
  ui/frosted-side-sheet/      The reusable sheet and its config
  dashboard/  policy/         Cards, timeline, empty state, policy view
  ui/                         Header menus, logo tiles, segmented control
registry/
  foundation.css              Arc tokens
  components/                 Arc components, installed from uiarc.dev
lib/
  claims-flow.ts              The claims conversation
  dashboard-data.ts           Everything the dashboard shows
  policy-detail.ts            The policy view's content
  routes.ts                   URL state for tab, view and customer
```
