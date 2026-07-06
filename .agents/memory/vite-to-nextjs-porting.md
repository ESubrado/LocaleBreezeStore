---
name: Vite (wouter/Supabase) to Next.js porting checklist
description: Gotchas when copying a Vite+React page (esp. one using Lenis/Framer Motion animations) into a Next.js app.
---

When a client asks to port a Vite React page/component (e.g. the storefront homepage) into a separate Next.js project, flag these differences up front rather than assuming a direct copy-paste works:

- **"use client" boundary**: Any component using `useState`/`useEffect`/`useRef`, Framer Motion (`motion`, `useScroll`, `useTransform`, `useSpring`), or Lenis must have `"use client"` at the top in Next.js App Router. If the page also needs server-side data fetching, split into a server component (fetches data) that renders a client child (handles animation/state).
- **Lenis + rAF loop**: The `new Lenis()` + `requestAnimationFrame` smooth-scroll setup in `useEffect` works the same in Next.js, but only inside a client component; guard against SSR execution (it already is, since it's inside `useEffect`, which never runs server-side).
- **Routing**: `wouter`'s `Link`/`useLocation` must become `next/link`'s `Link` and `next/navigation`'s `useRouter`/`usePathname`. Path construction differs (no `wouter` `base` prop; Next.js uses file-based routing).
- **Env vars**: Vite exposes `import.meta.env.VITE_*`; Next.js requires `NEXT_PUBLIC_*` prefixed vars accessed via `process.env.NEXT_PUBLIC_*`. Rename any Supabase URL/key env vars accordingly.
- **Fonts**: Vite projects here load Google Fonts via a `<link>` tag in `index.html`. Next.js convention is `next/font/google` (e.g. `Outfit({ subsets: [...] })`), which avoids FOUC and layout shift better — recommend switching rather than copying the `<link>` tag.
- **Images**: Plain `<img>` tags copy over fine, but Next.js projects typically prefer `next/image` for optimization — worth asking whether the target project enforces that convention.
- **Theme scoping via a `dark` wrapper class**: If a page force-darkens itself by wrapping content in a `dark` class (relying on Tailwind's `.dark` CSS-variable overrides) while the rest of the site is light-themed, verify the target Next.js project defines the same `--background`/`--foreground` HSL variable pairs under `:root` and `.dark` — otherwise the trick silently no-ops and renders light.

**Why:** These are the exact seams where a copy-paste of a Vite/wouter/Supabase page into a Next.js app silently breaks (hydration mismatches, dead env vars, broken links) rather than erroring loudly at build time.

**How to apply:** Whenever asked to port a Vite page into a Next.js codebase, walk through this list against the actual source file before/while transforming it.
