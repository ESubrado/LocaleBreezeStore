---
name: Next.js-to-Vite migration gotchas
description: Sharp edges found when converting an imported Next.js/shadcn app to Vite + React in the react-vite artifact scaffold.
---

- Some copied shadcn `ui/*.tsx` files import from the bare `radix-ui` meta-package
  (`import { Slot } from "radix-ui"`, `import { Tabs as TabsPrimitive } from "radix-ui"`)
  instead of the individual `@radix-ui/react-*` packages already listed in the
  react-vite scaffold's `package.json`. If `radix-ui` is removed as a dependency
  during Next.js cleanup, these imports break the dev server at runtime (not just
  typecheck). Fix by switching to the individual package and namespace import,
  e.g. `import { Slot } from "@radix-ui/react-slot"` and
  `import * as TabsPrimitive from "@radix-ui/react-tabs"`.
  **Why:** the combined `radix-ui` package re-exports each primitive as a
  namespace (`Slot.Root`), but the individual `@radix-ui/react-slot` package
  exports `Slot` directly (not `Slot.Root`) — a naive find/replace from the
  combined package's usage pattern to the individual package leaves a
  `Slot.Root` reference that silently renders `undefined` as a component
  ("Element type is invalid" React error).
  **How to apply:** after removing `next`/`radix-ui` deps in a Vercel-to-Replit
  port, grep the copied `src/components/ui/` tree for `from "radix-ui"` and fix
  each occurrence, then verify against the individual package's actual export
  shape rather than assuming a 1:1 rename.
- A "Invalid API key" / 401 error from Supabase when the stored anon key is
  suspiciously short (real Supabase anon keys are long JWTs, 150-250+ chars)
  usually means the previously-set `VITE_SUPABASE_ANON_KEY` secret is stale or
  a placeholder — not a code bug. Verify with a raw `fetch` to
  `${url}/rest/v1/<table>?select=*&limit=1` (not the REST root, which requires
  service_role) before assuming the migration code is at fault.
