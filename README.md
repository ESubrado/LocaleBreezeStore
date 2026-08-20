# Locale Breeze Store

Locale Breeze Store is a modern sample storefront for everyday products and digital goods. Its web client lets visitors browse catalog collections, view product details, manage a session-based cart, and get catalog-grounded suggestions from **Breeze Assist**. Authenticated administrators can maintain the store catalog, products, metadata options, and inventory.

## What's included

- A responsive Next.js storefront with a dark, fluid visual design and animated product browsing experience.
- Product catalogs for practical goods such as digital downloads, print materials, office supplies, calculators, inks, computer parts, and other everyday essentials.
- Product detail pages with pricing, images, availability, and low-stock indicators.
- A browser-session cart with quantity limits based on the available stock. Checkout and payments are intentionally not implemented yet.
- A Supabase-backed catalog with public active-product reads, authenticated admin access, Supabase Storage images, and an append-only inventory movement trail.
- An optional AI shopping assistant that can use Ollama, Cloudflare Workers AI, or another OpenAI-compatible provider. It is restricted to recommendations grounded in the active catalog.
- An Expo mobile project, currently a minimal starter shell for the future mobile experience.

## Repository layout

```text
.
+-- client/          Next.js web storefront and admin workspace
|   +-- seed/        Supabase schema, metadata, and sample catalog data
|   +-- src/         Pages, components, API routes, and data access code
+-- mobile/          Expo / React Native starter app
```

## Web client setup

### Prerequisites

- Node.js compatible with Next.js 16
- pnpm 11 (recommended; the client pins `pnpm@11.5.1`)
- A Supabase project for the catalog, authentication, and storage

### 1. Configure Supabase

From the Supabase SQL Editor, run the scripts in this order:

1. `client/seed/schema.sql`
2. `client/seed/metadata.sql`
3. `client/seed/seed.sql`

Create public Storage buckets named `catalog-images` and `product-images`. See [the database setup notes](client/seed/README.md) for required object paths, policies, and inventory behavior.

### 2. Configure environment variables

Copy `client/.env.example` to `client/.env`, then set these browser-safe Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
```

To enable Breeze Assist, also configure one supported server-side AI provider. The example file documents the settings for Ollama, Cloudflare Workers AI, and OpenAI-compatible APIs. Keep `AI_API_KEY` server-only; never prefix it with `NEXT_PUBLIC_`.

### 3. Run the storefront

```bash
cd client
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

Other useful commands:

```bash
pnpm lint
pnpm build
pnpm start
```

The client can also run in Docker; see [client/DOCKER.md](client/DOCKER.md).

## Admin workspace

The `/admin` route requires a signed-in Supabase Auth user. The current implementation assumes that every account created in the Supabase project is an administrator. If customer accounts are added later, protect the route and data policies with an explicit role or profile check.

Administrators can edit catalogs and products, adjust inventory, manage metadata values used in edit forms, and delete products that have no inventory history. Products with history should be marked inactive to preserve the audit trail.

## Mobile app

The `mobile` directory contains an Expo Router application. To start it:

```bash
cd mobile
npm install
npx expo start
```

It currently displays the Expo starter screen and is not yet connected to the storefront backend.

## Technology

- Next.js 16, React 19, TypeScript, and Tailwind CSS 4
- Supabase (Postgres, Auth, Storage, and Row Level Security)
- Framer Motion, Radix UI, shadcn components, and Lucide icons
- Expo, React Native, and Expo Router for the mobile shell

## Security notes

- Only active catalogs and products are publicly readable through Supabase Row Level Security.
- Inventory adjustments use a database function to update the current quantity and add the matching movement in one transaction.
- Keep Supabase service-role keys and AI provider keys out of public environment variables and out of source control.
