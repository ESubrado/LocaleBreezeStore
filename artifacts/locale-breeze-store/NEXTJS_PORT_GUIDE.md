# Fluid Motion Dark Theme — Porting Notes for Next.js

This documents everything that changed while restyling Locale Breeze Store to the
"Fluid Motion" dark theme (navy background, glass cards, blue accents, hero/section
background photos), so it can be re-applied to the separate Next.js build.

## 1. New npm packages to install

Only one package was newly added during this update (everything else — `framer-motion`,
`wouter`, `next-themes`, etc. — was already present before the restyle):

```bash
npm install lenis
```

- `lenis` — smooth-scroll library used on the home page.
- `framer-motion` was already a dependency; if your Next.js build doesn't have it yet,
  add it too (`npm install framer-motion`) since the animated sections rely on it.

## 2. Font — add "Outfit" (Google Font)

The theme uses **Outfit** (with **Inter** as the existing secondary font). In this Vite
app it's loaded via `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

In Next.js, prefer `next/font/google` instead:

```ts
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-outfit" });
```

Apply the `.variable` classes to `<html>`/`<body>` in your root layout, and reference
`var(--font-outfit)` wherever `.fluid-home { font-family: "Outfit", sans-serif; }` is
used (see file 3 below).

## 3. New/changed files (file listing)

### New files (copy these directly)
| File | Purpose |
|---|---|
| `src/styles/fluid-theme.css` | Shared theme utility classes: `.fluid-home`, `.fluid-home-noise` (SVG noise overlay), `.fluid-home-gradient-blur` (radial blue glow). Import this once, e.g. in your global CSS or layout. |
| `src/assets/hero-tech-bg.png` | Home page hero/full-page background (dark circuit-board photo). |
| `src/assets/products-tech-bg.png` | Products page background (keyboard/cables/components flat-lay). |
| `src/assets/product-detail-tech-bg.png` | Product detail page background (glowing fiber-optic connectors). |

### Modified files (re-apply the equivalent changes to your Next.js pages/components)
| File (Vite) | Next.js equivalent | What changed |
|---|---|---|
| `src/pages/home.tsx` | `app/page.tsx` (or `pages/index.tsx`) | Full Fluid Motion redesign: hero, sections, framer-motion animations, Lenis smooth scroll, full-page fixed background image + gradient overlay. |
| `src/pages/products.tsx` | `app/products/page.tsx` | Dark theme, glass cards, added fixed `products-tech-bg.png` background. |
| `src/pages/product-detail.tsx` | `app/products/[id]/page.tsx` | Dark theme, glass cards, added fixed `product-detail-tech-bg.png` background. |
| `src/pages/admin.tsx` | `app/admin/page.tsx` | Dark theme applied to admin shell. |
| `src/pages/not-found.tsx` | `app/not-found.tsx` | Dark theme styling. |
| `src/components/ProductCard.tsx` | same | Glass card styling (`rounded-3xl`, `bg-white/5`, `border-white/10`), blue-400 accents. |
| `src/components/Navigation.tsx` | same | Dark nav styling. |
| `src/components/SiteFooter.tsx` | same | Dark footer styling. |
| `src/components/TopProductsCarousel.tsx` | same | Dark theme + carousel restyle. |
| `src/components/AdminAccessGate.tsx` | same | Dark theme. |
| `src/components/AdminCatalogTable.tsx` | same | Dark theme + table restyle. |
| `src/components/AdminProductsTable.tsx` | same | Dark theme + table restyle. |
| `src/components/AdminTablePagination.tsx` | same | Dark theme. |
| `src/components/AdminLoginDropdown.tsx` | same | Dark theme. |
| `src/components/ui/tabs.tsx` | same | Minor style overrides for dark background. |
| `src/index.css` | `app/globals.css` | Updated CSS variables (navy background/foreground, blue-400 accent tokens), 140 lines changed — diff this carefully against your existing globals since it likely also contains Tailwind v4 `@theme` tokens. |

## 4. Key implementation patterns to replicate

**a. Full-viewport fixed background per page**
Each themed page wraps its content in a container with `isolate` (critical — without it,
negatively z-indexed background layers can escape their stacking context and render
behind the whole document) and two `fixed inset-0 -z-30` layers as the first children:

```tsx
<main className="fluid-home dark isolate bg-background text-foreground">
  <div
    className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
    style={{ backgroundImage: `url(${pageBg})` }}
  />
  <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950" />
  <div className="fluid-home-noise" />
  {/* page content */}
</main>
```

In Next.js/`next/image`, you can still use this pattern with a plain `<div>` +
`style={{ backgroundImage: ... }}`, or swap to `next/image` with `fill` and `-z-30`
positioning if you prefer optimized image loading — just make sure the parent has
`position: relative` (or keep `fixed` as-is, since fixed doesn't need a positioned
ancestor) and `isolate` is present on the nearest positioned ancestor.

**b. Card styling** — glass-morphism cards: `rounded-3xl bg-white/5 border border-white/10 backdrop-blur`, with `text-blue-400` for accents/links/badges.

**c. Animations** — `framer-motion`'s `motion.div` with fade/slide-up on scroll (`whileInView`), and `lenis` initialized once (likely in `home.tsx` or a top-level layout effect) for smooth scrolling.

## 5. Gotcha to remember

Negative z-index background `<div>`s (`-z-20`/`-z-30`) only stack correctly relative to
their **nearest positioned ancestor that establishes a new stacking context**. Add
`isolate` to that ancestor (the `<section>` or `<main>`) — otherwise the background
renders behind the entire document and appears invisible.
