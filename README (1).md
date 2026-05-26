# Glassngloss Complete Website

This package contains two separate GitHub Pages websites connected to the same Supabase database.

## Folders

- `shop/` — customer website
- `admin/` — admin dashboard for adding/editing products

## How to upload to GitHub

1. Create a GitHub repository, for example `glassngloss-website`.
2. Upload the two folders exactly as they are:
   - `shop`
   - `admin`
3. Go to **Settings → Pages**.
4. Set **Source** to **Deploy from branch**.
5. Select branch **main** and folder **/root**.
6. Save.

## Your live links

After GitHub Pages builds, your links will be:

- Shop: `https://YOUR_USERNAME.github.io/glassngloss-website/shop/`
- Admin: `https://YOUR_USERNAME.github.io/glassngloss-website/admin/`

For your current username/repo, it is likely:

- Shop: `https://glassnglossraul.github.io/glassngloss-website/shop/`
- Admin: `https://glassnglossraul.github.io/glassngloss-website/admin/`

## Important

Both the shop and admin use the same Supabase URL/key already inside `script.js`.

Admin password default:

```text
glassngloss
```

Change it inside the admin dashboard after first login.

## If products do not show

Check Supabase policies. The shop needs public SELECT access to the `products`, `config`, `slides`, and `ticker` tables. The admin needs INSERT, UPDATE, DELETE access if you are using this simple static admin.

