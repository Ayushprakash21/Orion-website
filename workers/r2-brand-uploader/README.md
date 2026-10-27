# Orion-9 Cloudflare R2 Brand Assets Uploader Worker

This Cloudflare Worker provides a secure, production-grade upload bridge and public delivery CDN for the Orion-9 website brand logos, backed by the Cloudflare R2 bucket `orion9-brand-assets`.

---

## 1. Cloudflare Dashboard Provisioning Checklist

### Step 1: Create the R2 Bucket
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, select **R2** (or **Storage & Databases** &rarr; **R2**).
3. Click **Create bucket**.
4. Name the bucket: `orion9-brand-assets`.
5. Keep default location or select your preferred region (e.g. `Automatic` or `North America`).
6. Click **Create Bucket**.

### Step 2: (Optional but Recommended) Enable Public Access or Connect Custom Domain
To deliver logos via a dedicated domain:
- Option A: **Custom Domain**: In the bucket settings &rarr; **Settings** &rarr; **Public Access** &rarr; **Custom Domains** &rarr; click **Connect Domain** &rarr; enter e.g. `brand-assets.orion-9.com`.
- Option B: **R2.dev Subdomain**: In **Settings** &rarr; **Public Access** &rarr; click **Allow Access** under `r2.dev`. Copy the public URL (e.g. `https://pub-xxxxxxxxxxxxxx.r2.dev`).
- Option C: **Automatic Worker CDN (Default)**: If neither is configured, the worker automatically serves files via its own public CDN route at `https://<worker-subdomain>.workers.dev/cdn/...`. Zero extra configuration needed!

---

## 2. Worker Configuration (`wrangler.toml`)

The worker uses the native R2 binding `BRAND_ASSETS` pointing to `orion9-brand-assets`:

```toml
name = "orion9-r2-brand-uploader"
main = "src/index.ts"
compatibility_date = "2024-04-01"

[[r2_buckets]]
binding = "BRAND_ASSETS"
bucket_name = "orion9-brand-assets"

[vars]
FIREBASE_PROJECT_ID = "orion9-dev-db-2026"
ALLOWED_ORIGINS = "https://orion9.pages.dev,https://orion-9.ayushprakash0021.workers.dev,http://localhost:3000,http://localhost:5173"
R2_PUBLIC_BASE_URL = ""
```

If you configured a custom domain or `r2.dev` URL, set it in `R2_PUBLIC_BASE_URL`:
```bash
wrangler secret put R2_PUBLIC_BASE_URL
# Or edit wrangler.toml [vars] R2_PUBLIC_BASE_URL = "https://brand-assets.orion-9.com"
```

---

## 3. Deployment Commands

From the `workers/r2-brand-uploader` folder:

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Deploy the Worker
npx wrangler deploy
```

Once deployed, note the worker URL:
`https://orion9-r2-brand-uploader.<your-subdomain>.workers.dev`

---

## 4. Website Environment Variable

In your Orion-website environment (`.env` or Cloudflare Pages environment variables):

```env
VITE_R2_UPLOAD_ENDPOINT="https://orion9-r2-brand-uploader.<your-subdomain>.workers.dev/api/upload-logo"
```

Or configure it in Admin Console &rarr; **Branding & Identity** &rarr; **R2 Endpoint Settings**.
