# GameVault

A gaming storefront built with React 19, TypeScript, Vite and MUI. The focus of
the project is an **Amazon-style product review system**.

There is no backend yet — all data is mocked behind an API-shaped seam (see
[Swapping in the real API](#swapping-in-the-real-api)).

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

A second account (`sam@example.com / password123`) owns most of the seeded
reviews.

## The review feature

Everything lives under [`src/components/review/`](src/components/review/).

- **Rating summary + histogram** — average score with a 5★→1★ breakdown. Each
  histogram row is a button that filters the list to that star rating.
- **Verified Purchase badge** — a cart icon beside the reviewer's name. See
  below for how it's decided.
- **Guest reviews** — signed-out visitors can review; they just fill in a name
  field. Signed-in users get their account name automatically.
- **Sorting** — most recent, most helpful, highest rated, lowest rated.
- **Helpful votes** — optimistic, with rollback if the request fails.
- **Edit / delete** — available on your own reviews only.
- **Pagination** — 5 per page.
- **Validation** — rating required, title 3–100 chars, body 10–2000 chars, with
  live character counters.

Sorting, filtering and pagination are sent to the API layer as query params
rather than applied in the browser, so real server-side pagination drops in
without touching the components.

### How the Verified Purchase badge is decided

Each user has a `purchasedProductIds` list ([`src/mocks/users.ts`](src/mocks/users.ts)).
When a review is created, the API resolves the flag from the stored user rather
than trusting the client, and freezes it onto the review:

```ts
verifiedPurchase = Boolean(authorId) && user.purchasedProductIds.includes(productId)
```

So there are three cases worth trying:

| Who | Product | Badge |
|---|---|---|
| Signed in | one they bought (e.g. Nexus Station X) | ✅ |
| Signed in | one they didn't (e.g. Nexus Station X Slim) | ❌ |
| Guest | any | ❌ |

The demo user's purchases cover roughly half the catalogue on purpose, so the
contrast is easy to see.

## Project structure

```
src/
  api/          Mock REST layer — the only place that knows the backend is fake
  mocks/        Seed data: products, reviews, users
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

## Swapping in the real API

The mock layer is deliberately shaped like the REST API that will replace it:

| Function | Endpoint it stands in for |
|---|---|
| `getProducts` / `getProductBySlug` | `GET /products`, `GET /products/:slug` |
| `listReviews` | `GET /products/:id/reviews?sort=&rating=&page=&perPage=` |
| `getReviewStats` | `GET /products/:id/reviews/stats` |
| `createReview` | `POST /reviews` |
| `updateReview` / `deleteReview` | `PATCH` / `DELETE /reviews/:id` |
| `voteHelpful` | `POST /reviews/:id/helpful` |
| `signIn` / `signOut` / `getSession` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |

To go live:

1. Replace `request()` in [`src/api/client.ts`](src/api/client.ts) with a
   `fetch` wrapper. It already accepts an `AbortSignal` and throws `ApiError`,
   so callers need no changes.
2. Rewrite the bodies of the `*.api.ts` modules to call real endpoints.
3. Delete [`src/api/db.ts`](src/api/db.ts) and [`src/mocks/`](src/mocks/).

No hook, context or component should need to change.

## Persistence

Reviews and the signed-in session are kept in `localStorage` (keys prefixed
`gg:v1:`), seeded from `src/mocks/` on first load, so new reviews survive a
refresh. Every storage access is wrapped in `try/catch`, so the app still works
where storage is unavailable (private browsing, storage disabled) — it just
falls back to session-only.

To reset to the seed data, clear the site's local storage.

## Notes

- Passwords are stored in plain text in the mock user list. It's mock data
  standing in for a server; the real API will handle credentials.
- Responsive from 320px up: the header collapses to a drawer, the product grid
  reflows 1→2→3→4 columns, and the review form becomes a full-screen dialog on
  mobile.
- Routes are code-split with `React.lazy`.
