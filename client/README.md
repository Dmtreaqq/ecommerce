# GameVault

A gaming storefront built with React 19, TypeScript, Vite and MUI. The focus of
the project is an **Amazon-style product review system**.

Products and reviews are served by the NestJS backend in [`../server`](../server).
Auth is still mocked behind an API-shaped seam (see [The API](#the-api)).

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # typecheck + production build
npm run lint     # eslint
npm run preview  # serve the production build
```

## Demo account

```
gamer@example.com / password123
```

The sign-in page shows these credentials and has a **Use** button that fills
them in. There is no registration flow and no email confirmation.

A second account (`sam@example.com / password123`) also exists. Signing in has no
effect on reviews yet — they are guest-only until auth lands server-side.

## The review feature

Everything lives under [`src/components/review/`](src/components/review/).

- **Rating summary + histogram** — average score with a 5★→1★ breakdown. Each
  histogram row is a button that filters the list to that star rating.
- **Guest reviews** — anyone can review by filling in a name field. Reviews are
  guest-only until authentication lands server-side.
- **Sorting** — most recent, highest rated, lowest rated.
- **Pagination** — 5 per page.
- **Validation** — rating required, title 3–100 chars, body 10–2000 chars, with
  live character counters. The server enforces the same ranges.

Sorting, filtering and pagination are sent to the API as query params rather than
applied in the browser, so the server owns the ordering and the page window.

Writing a review updates the product's `ratingAverage` / `ratingCount` server-side
in the same transaction, so the stars on the card and the histogram never disagree.

### Not yet implemented

The Verified Purchase badge, helpful votes, and editing or deleting your own
review all need a signed-in identity the server does not have yet. `PUT` and
`DELETE /reviews/:id` exist and are wired in
[`src/api/reviews.api.ts`](src/api/reviews.api.ts), but nothing in the UI calls
them — they are unauthenticated until auth lands. `Review.authorId`,
`verifiedPurchase` and `helpfulCount` are still on the type; the server returns
`null` / `false` / `0` for them.

## Project structure

```
src/
  api/          REST layer — the only place that knows auth is still faked
  mocks/        Seed data for the mock auth: users
  types/        Shared TypeScript types
  context/      AuthProvider + the context object (split for Fast Refresh)
  hooks/        useAuth, useProducts, useProduct, useReviews
  components/
    common/     Loading / error / empty states
    layout/     Header (responsive drawer), Layout
    product/    ProductCard
    review/     The review feature
  pages/        Home, Product, SignIn, NotFound
  theme.ts      MUI dark gaming theme
```

Components never import from `api/` or `mocks/` directly — data reaches them
through hooks and props.

## The API

**Products and reviews are live.** They come from the NestJS server in
[`../server`](../server), which must be running on `http://localhost:3000`
(override with `VITE_API_URL` — see [`.env.example`](.env.example)). Start it with
`npm run start:dev` from `server/`.

| Function | Endpoint |
|---|---|
| `getProducts` | `GET /products?category=&search=&sort=` |
| `getProductById` | `GET /products/:id` |
| `listReviews` | `GET /products/:id/reviews?sort=&rating=&page=&perPage=` |
| `getReviewStats` | `GET /products/:id/reviews/stats` |
| `createReview` | `POST /reviews` |
| `updateReview` | `PUT /reviews/:id` |
| `deleteReview` | `DELETE /reviews/:id` |

Filtering, search, sort and pagination are server-side; the server validates the
query params and returns `400` for an unknown `category`, `sort` or an out-of-range
`perPage`. Product images are served by the same host from `/images/products/`, and
[`src/api/products.api.ts`](src/api/products.api.ts) resolves them to absolute URLs
so components can use `product.image` directly.

**Auth is still mocked**, backed by `localStorage` via [`src/api/db.ts`](src/api/db.ts):

| Function | Endpoint it stands in for |
|---|---|
| `signIn` / `signOut` / `getSession` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |

To finish the migration: rewrite `auth.api.ts` to call `http()` instead of
`request()`, then delete `request()`, [`src/api/db.ts`](src/api/db.ts) and
[`src/mocks/`](src/mocks/).

## Persistence

Reviews live in Postgres and are served by the API. Only the signed-in session is
kept in `localStorage` (key `gg:v1:session`), so it survives a refresh. Every
storage access is wrapped in `try/catch`, so the app still works where storage is
unavailable (private browsing, storage disabled) — it just falls back to
session-only.

To sign out everywhere, clear the site's local storage.

## Notes

- Passwords are stored in plain text in the mock user list. It's mock data
  standing in for a server; the real API will handle credentials.
- Responsive from 320px up: the header collapses to a drawer, the product grid
  reflows 1→2→3→4 columns, and the review form becomes a full-screen dialog on
  mobile.
- Routes are code-split with `React.lazy`.
