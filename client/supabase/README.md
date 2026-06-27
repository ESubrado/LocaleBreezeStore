# Supabase Setup

The app is wired to read from two public tables:

- `catalogs`
- `products`

Use `schema.sql` first if those tables do not exist yet. Use `seed.sql` after
that if you want the database to contain the same sample data the app previously
kept in the app source.

## Recommended Order

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Run `schema.sql`.
4. Run `seed.sql`.
5. Restart the Next dev server so it reloads `.env`.

## Notes

- The frontend uses `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Do not put a `service_role` key in a `NEXT_PUBLIC_*` environment variable.
- The read policies in `schema.sql` allow anonymous visitors to read only rows
  where `is_active = true`.
- Inserts and updates should be done through the Supabase dashboard, SQL Editor,
  a protected admin route, or a server-only script with a secret key.
