# LocaleBreezeStore Project Guidelines

## Project Structure

- This is an imported GitHub repository, not a new Replit-generated app.
- The web application is a Next.js app located in `client/`.
- Retain Next.js. Do not convert, migrate, or scaffold this app as React Vite.
- The mobile application is an Expo app located in `mobile/`.
- Treat the repository root as a container only.
- Do not create web app files at the repository root.
- Do not create root-level `package.json`, `src/`, `app/`, `pages/`, `components/`, `.next/`, or `node_modules/` for the web app.
- Put web source changes under `client/src/`.
- Put web public assets under `client/public/`.
- Only modify `mobile/` when the request is specifically about the mobile app.

## Commands

- Install web dependencies with `cd client && corepack enable && pnpm install --frozen-lockfile`.
- Run the web app with `cd client && corepack enable && pnpm dev -- --hostname 0.0.0.0`.
- Build the web app with `cd client && corepack enable && pnpm build`.
- Start the production web app with `cd client && corepack enable && pnpm start -- --hostname 0.0.0.0`.

## Package Management

- Use pnpm for the `client/` app because `client/pnpm-lock.yaml` is present.
- Do not use npm, npm install, npm run, or React Vite templates for the web app.
- Do not infer or install web dependencies from the repository root.
- Keep generated lockfiles and dependency folders inside the app they belong to.
