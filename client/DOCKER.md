# Docker

Build the Next.js client image from the `client` directory:

```bash
docker build -t locale-breeze-client .
```

Run it with your existing `.env` file:

```bash
docker run --rm -p 3000:3000 --env-file .env locale-breeze-client
```

Then open:

```text
http://localhost:3000
```

Do not pass a Supabase `service_role` key to this image. The app only needs the
browser-safe anon or publishable key.
