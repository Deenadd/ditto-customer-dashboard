# Ditto customer dashboard

A web prototype of the Ditto customer dashboard. It shares its stack, design
tokens and brand assets with the
[Ditto renewal flow](https://github.com/Deenadd/ditto-renewal-flow).

- Live: https://ditto-customer-dashboard.vercel.app
- Every push to `main` deploys to production on Vercel.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css` |
| Font | Inter via `next/font/google` |
| Hosting | Vercel |

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Layout

```
app/
  globals.css          Ditto design tokens (colours, shadow, type helpers)
  layout.tsx           Font wiring and document metadata
  page.tsx             The dashboard
components/
  site-header.tsx      Nav bar with the Ditto mark
public/
  brand/               Ditto logo
```
