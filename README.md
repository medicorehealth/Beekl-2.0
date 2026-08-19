# BeeKL — The Community Makes The Clothes.

BeeKL is a Gen-Z, Indian, community-first fashion ecommerce platform. It blends
**fashion + memes + pop culture + creators + communities + user-generated ideas
+ limited drops + creator merchandise** into one scalable startup-grade app.

> Built from scratch with Next.js (App Router), TypeScript, Tailwind CSS,
> Prisma/PostgreSQL, NextAuth, and a Shopify-backed commerce architecture.

---

## ✨ What's inside

One unified Next.js application containing **four surfaces**, gated by a single
unified login and role-based authorization:

- **Public storefront** — homepage, shop, collections, product pages, drops,
  memes, movies & TV, anime, creators, communities, contest, search, wishlist,
  cart, legal pages.
- **Customer account** — profile, orders, addresses, communities, wishlist.
- **Creator dashboard** — overview, community, products, submissions, orders,
  analytics, commissions.
- **Admin panel** — dashboard, products, orders, customers, creators,
  communities, submissions, contests, drops, POD, shipping, returns,
  commissions, payouts, banners, homepage CMS, analytics, settings.

There is **no separate admin website or admin login**. Everyone signs in through
`/login`; the user's role determines what they can access. All access is
re-verified server-side.

---

## 🧱 Tech stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 14 (App Router, Server Components)         |
| Language       | TypeScript                                         |
| Styling        | Tailwind CSS (custom BeeKL design system)          |
| Database       | PostgreSQL via Prisma ORM                          |
| Auth           | NextAuth (credentials) + role-based permissions    |
| Commerce       | Shopify Storefront API (public) + Admin API (server) |
| Checkout       | Shopify checkout (real — never a fake payment page) |
| POD            | Provider abstraction (Printful/Qikink-ready)       |

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in values:

```bash
cp .env.example .env
```

At minimum you need a `DATABASE_URL` (PostgreSQL) and `AUTH_SECRET`. Shopify and
POD variables are optional — the app **degrades gracefully** and clearly shows
"not connected" states when they're absent.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/beekl?schema=public
AUTH_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npm run db:push      # create tables from the Prisma schema
npm run db:seed      # load clearly-marked DEVELOPMENT demo data
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

### Demo logins (from the seed — password `password123`)

| Email                | Role         | Access                    |
| -------------------- | ------------ | ------------------------- |
| `admin@beekl.dev`    | SUPER_ADMIN  | Full admin + store        |
| `finance@beekl.dev`  | FINANCE      | Finance admin areas       |
| `riya@beekl.dev`     | CREATOR      | Creator dashboard + store |
| `customer@beekl.dev` | CUSTOMER     | Store + account           |

> ⚠️ Seed data is **development data** — not real production analytics or sales.

---

## 🔐 Security model

- Secrets (`DATABASE_URL`, `AUTH_SECRET`, `SHOPIFY_ADMIN_ACCESS_TOKEN`,
  `POD_API_KEY`, …) are **server-side only** and never shipped to the browser.
- Shopify Admin + POD clients are marked `import "server-only"`.
- Every protected route (page **and** API) re-verifies **session + role +
  permission** on the server (`src/lib/session.ts`, `src/lib/api-guards.ts`).
- The registration endpoint can only create `CUSTOMER` or (pending) `CREATOR` —
  the client can never request an elevated role. Roles are changed only by a
  `SUPER_ADMIN`.

### Roles

`CUSTOMER · CREATOR · ADMIN · SUPER_ADMIN · CONTENT_MANAGER · MODERATOR ·
FINANCE · SUPPORT` — mapped to fine-grained permissions in `src/lib/rbac.ts`.

---

## 🛍️ Commerce & Shopify

Shopify is the **source of truth** for products, variants, cart, checkout,
payments, orders, shipping and fulfillment.

- **Storefront API** powers public product/collection/cart data and returns a
  real Shopify `checkoutUrl` — checkout always redirects to Shopify.
- **Admin API** (server-only) powers privileged reads (orders → commission
  attribution).
- The DB stores BeeKL-native concepts (creators, communities, drops, contests,
  banners, commissions, payouts, wishlists) and **lightweight references** to
  Shopify entities by GID — no unnecessary duplication.

When Shopify isn't configured, the app runs a clearly-labelled **demo catalog**
from seeded `ProductReference` rows so you can explore the full UX locally.

---

## 🎨 Design system

A premium, mono-first Indian Gen-Z streetwear aesthetic:

- **Palette:** ink/black, off-white paper, charcoal, greys + a selective honey &
  flame accent. No neon, no cyberpunk, no glassmorphism.
- **Typography:** bold display headings, clean body.
- Reusable primitives in `src/components/ui` (Button, Badge, Card, Input, Modal,
  Drawer, Toast, States) and content cards in `src/components/cards`.

---

## 💸 Commission & payout system

- Server-side commission **ledger** (`src/lib/commissions.ts`): each eligible
  creator sale line generates a `Commission` (gross, deductions, rate, creator
  share, BeeKL share, status).
- Lifecycle: `PENDING → APPROVED → PAYABLE → PAID / CANCELLED`.
- Admins batch payable commissions into **payouts**. BeeKL never stores raw bank
  or payment credentials — only an external reference.

---

## 🖨️ POD architecture

`src/lib/pod/provider.ts` defines a `PodProvider` interface. If no provider is
configured, a `NullPodProvider` reports **"POD provider not connected."** — the
pipeline UI works but never fakes a POD call. A real provider can be added
without rewriting the app.

---

## 📁 Project structure

```
prisma/
  schema.prisma          # full data model
  seed.ts                # DEV demo data
src/
  app/
    (store)/             # public storefront + customer account + legal
    (auth)/              # unified login / register
    creator/             # creator dashboard (guarded)
    admin/               # admin panel (guarded)
    api/                 # cart, wishlist, search, register, community,
                         # contest, account, creator, admin/* routes
  components/            # ui/, layout/, commerce/, cards/, community/,
                         # dashboard/, admin/, providers/
  lib/                   # auth, session, rbac, db, shopify/, pod/, catalog,
                         # content, commissions, utils
```

---

## 📜 Scripts

```bash
npm run dev        # start dev server
npm run build      # prisma generate + next build
npm run start      # start production server
npm run db:push    # push schema to the database
npm run db:seed    # seed development data
npm run db:studio  # open Prisma Studio
npm run lint       # lint
```

---

## ⚖️ Legal / content note

BeeKL supports **original and properly licensed** designs only. Movie, anime,
web-series and pop-culture merchandise is offered strictly where legally
licensed. Placeholder Privacy, Terms, Refund and Shipping policies are included
and must be replaced with finalized, legally-reviewed text before launch.

---

**BeeKL — The community makes the clothes.**
