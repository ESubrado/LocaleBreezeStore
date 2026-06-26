# LocaleBreezeStore Client Guidelines

## Project Structure

- This project root is the Next.js web application.
- Retain Next.js. Do not convert, migrate, or scaffold this app as React Vite.
- Source files belong in `src/`.
- Public assets belong in `public/`.
- Do not create Vite config files, React Vite entry files, or duplicate app folders.

## Commands

- Install dependencies with `corepack enable && pnpm install --frozen-lockfile`.
- Run the app with `corepack enable && pnpm dev -- --hostname 0.0.0.0`.
- Build the app with `corepack enable && pnpm build`.
- Start the production app with `corepack enable && pnpm start -- --hostname 0.0.0.0`.

## Package Management

- Use pnpm because `pnpm-lock.yaml` is present.
- Do not use npm, npm install, npm run, or React Vite templates.
- Keep generated lockfiles and dependency folders inside this `client/` app.
