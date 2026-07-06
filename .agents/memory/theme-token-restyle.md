---
name: Theme token restyle approach for react-vite artifacts
description: How to fully reskin a react-vite artifact's color theme (e.g. teal/orange to dark-navy+blue) without breaking the app, when no dark-mode toggle exists.
---

When restyling an artifact's visual theme (not adding dark-mode support, just changing the brand palette):

1. Check first whether a `.dark` class is ever applied anywhere (grep for `classList.add("dark")`, `useTheme`, theme toggles). If none exists, only the `:root` CSS variables in `index.css` actually render — still fill in `.dark` variables too for future-proofing, but know they're inert today.

2. Component-level chrome (header/footer/hero) often bypasses the token system entirely via hardcoded hex colors (e.g. `bg-[#24786b]`) or Tailwind neutral scales (`stone-*`, `gray-*`) instead of `bg-primary`/`text-foreground`/etc. A full reskin requires editing both: the CSS custom properties AND every component using hardcoded hex/neutral-scale classes — grepping for the old brand hex codes plus the old neutral scale name (e.g. `stone-`) is the fastest way to find all remaining spots, across pages *and* shared `components/ui/*` primitives (tabs, pagination, etc. can carry hardcoded colors from scaffolding).

3. To convey a "dark neutral" brand mood while keeping page/body content readable and light (typical retail/SaaS pattern), it's acceptable to hardcode direct dark Tailwind neutrals (e.g. `bg-slate-950`) on nav/footer/hero-overlay rather than trying to force the whole `:root` background dark — reserve full dark `background`/`foreground` tokens for the `.dark` variant.

**Why:** Without this two-pronged check (tokens + hardcoded component colors, docs-vs-CSS-var reality), a "theme change" task looks done in `index.css` but leftover brand colors persist all over the actual rendered UI.
