# LocaleBreezeStore Project Guidelines

## Project Structure

- The web application is a Next.js app located in `client/`.
- The mobile application is an Expo app located in `mobile/`.
- Do not create web app files at the repository root.
- Do not create root-level `package.json`, `src/`, `app/`, `pages/`, `components/`, `.next/`, or `node_modules/` for the web app.
- Put web source changes under `client/src/`.
- Put web public assets under `client/public/`.
- Only modify `mobile/` when the request is specifically about the mobile app.

## Commands

- Install web dependencies with `cd client && npm install`.
- Run the web app with `cd client && npm run dev -- --hostname 0.0.0.0`.
- Build the web app with `cd client && npm run build`.
- Start the production web app with `cd client && npm run start -- --hostname 0.0.0.0`.

## Package Management

- Use npm for the `client/` app because `client/package-lock.json` is present.
- Do not infer or install web dependencies from the repository root.
- Keep generated lockfiles and dependency folders inside the app they belong to.
