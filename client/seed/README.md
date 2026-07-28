# Supabase Setup

The app is wired to read from two public tables:

- `catalogs`
- `products`

It also keeps private inventory history in `inventory_movements`.

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
- `inventory_movements` has row level security enabled with no public policy.
  The seed creates one `opening_balance` movement for every tracked physical
  product. Future restocks, sales, returns, and corrections should add new
  movement rows instead of editing history.
- Catalog `image_url` values store a filename or absolute image URL. Filename
  values are loaded from the public Supabase Storage bucket named
  `catalog-images` under `<catalog-slug>/<filename>`.
- Upload catalog images under `<catalog-slug>/<filename>` in that bucket, for
  example `digital-print/1.png`.
- Product `image_urls` values store ordered filenames such as `1.png`,
  `2.png`, and so on. The app combines those filenames with each product
  `slug` to serve files from the public Supabase Storage bucket named
  `product-images`.
- Upload objects under `<product-slug>/<filename>`, for example
  `budget-calculator-workbook/1.png`. The first filename is also stored as
  `image_url` for list defaults and backward-compatible reads.
- Inserts and updates should be done through the Supabase dashboard, SQL Editor,
  a protected admin route, or a server-only script with a secret key.
