# PHCCI Asset Registry

A progressive web app (PWA) for tracking PHCCI's fixed assets across all branches and Head Office. Staff scan an asset's QR sticker with their phone's own QR app, then paste the code into this app to see a photo, serial number, and who it's assigned to.

## What's included

- **List view** — every asset, with a QR-code lookup bar at the top
- **Branch view** — filter assets by branch
- **Department view** — filter assets by department
- **Share view** — a read-only master table combining all branches, for reviews/audits
- PWA support (installable on phones, works via a service worker)

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your project and run everything in `supabase/schema.sql`. This creates the `branches`, `departments`, and `assets` tables.
3. In **Storage**, create a public bucket named `asset-photos` (used to store the photos staff upload for each asset).
4. In **Project Settings > API**, copy your **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cp .env.example .env
```

Paste your Supabase URL and anon key into `.env`.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open the local URL it prints (usually `http://localhost:5173`).

## 4. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), click **New Project** and import that repo.
3. Vercel auto-detects Vite — accept the defaults.
4. Add your two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under **Project Settings > Environment Variables**.
5. Deploy. Vercel gives you a free `*.vercel.app` URL immediately; you can point a custom domain (bought from Hostinger, GoDaddy, or anywhere) at it later under **Project Settings > Domains**.

## Adding icons

The manifest expects two files that aren't included yet:
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

Drop in a PHCCI logo at those sizes before deploying, so the install prompt and home-screen icon look right.

## Next steps to build out

- An **add/edit asset** form (name, serial number, branch, department, assigned-to, photo upload to the `asset-photos` bucket, and QR code value)
- Seeding `branches` with PHCCI's actual 14 branches + Head Office
- Login/auth per branch, if you want to restrict who can add or edit entries (Supabase Auth handles this)
