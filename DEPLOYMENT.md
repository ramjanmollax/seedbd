# Seed Haven BD — Hosting & Deployment Guide

This guide provides step-by-step instructions to deploy, run, and migrate the **Seed Haven BD** website across multiple hosting platforms (Vercel, Netlify, Cloudflare Pages, Firebase Hosting, cPanel/Shared Hosting, VPS/Dedicated Server, and Docker).

---

## 1. Hosting Compatibility Matrix

| Hosting Provider | Deployment Model | Supported Features | Required Configuration |
| :--- | :--- | :--- | :--- |
| **Docker (Any VPS/PaaS)** | Full-Stack Container | ✅ All (Frontend, Admin, Node APIs, Local DB, Uploads) | `Dockerfile`, `docker-compose.yml` |
| **VPS / Dedicated (Ubuntu/Debian)** | Node.js + PM2 | ✅ All (Frontend, Admin, Node APIs, Local DB, Uploads) | `npm run build`, `ecosystem.config.cjs` |
| **cPanel (Node.js App Enabled)** | Node.js Service | ✅ All (Frontend, Admin, Node APIs, Local DB, Uploads) | Setup Node.js App in cPanel |
| **cPanel (Static HTML/Apache)** | Static Web / Apache | ⚠️ Frontend + Admin UI + Direct Firestore / Sheet Sync | Upload `dist/` folder + `.htaccess` |
| **Vercel** | Serverless / Static SPA | ⚡ High-Performance Static + Client Integrations | `vercel.json`, Output: `dist` |
| **Netlify** | Static Edge SPA | ⚡ High-Performance Static + Client Integrations | `netlify.toml`, Output: `dist` |
| **Cloudflare Pages** | Cloudflare Edge SPA | ⚡ Edge Static + Client Integrations | `wrangler.jsonc`, Output: `dist` |
| **Firebase Hosting** | Google CDN Static | ⚡ Google Global CDN + Firestore Database | `firebase.json`, Output: `dist` |

> **Note on Architecture:**
> The codebase is built with **Vite + React (Frontend SPA)**, **Standalone Admin Panel (`admin.html`)**, and an **Express.js (Node Backend)**.
> - On **Node/Docker/VPS**, both frontend and backend run seamlessly together on a single port.
> - On **Static Edge Platforms (Vercel, Netlify, Cloudflare, Firebase)**, the built `dist/` folder serves the high-performance store and admin panel, communicating directly with Firebase Firestore and Google Sheets.

---

## 2. Environment Variables Overview

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for the Node.js server | `3000` |
| `NODE_ENV` | Environment mode (`production` or `development`) | `production` |
| `SITE_URL` | Canonical public site URL (sitemaps, SEO, Meta CAPI) | `https://seedhavenbd.com` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS domains for API access | `*` or comma-separated domains |
| `DATA_DIR` | Directory for orders and secure configurations | `./data` |
| `UPLOADS_DIR` | Directory for uploaded media and pictures | `./public/uploads` |
| `GOOGLE_SHEET_ID` | Google Sheet ID for dynamic product catalog sync | `1kPzbYFUkgN8dW5BVqeNtoKM8LbRvHAIfQIQZBKkv-Ws` |
| `META_PIXEL_ID` | Facebook Pixel ID for tracking | *(Optional)* |
| `META_CAPI_ACCESS_TOKEN` | Meta Conversions API Access Token | *(Optional)* |

---

## 3. Deployment Guides by Platform

### A. Docker / Docker Compose (Recommended for Full-Stack)

Deploy everywhere (DigitalOcean, Hetzner, AWS, Linode, Coolify, Portainer):

1. **Build and launch with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```
2. **View running logs:**
   ```bash
   docker compose logs -f
   ```
3. **Data persistence:**
   Orders and uploads are saved in named Docker volumes (`seedhaven_data` and `seedhaven_uploads`) and survive container redeployments.

---

### B. Ubuntu / Debian VPS or Dedicated Server (Node.js + PM2 + Nginx)

1. **Install Node.js 20+ and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Build:**
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

3. **Start the application with PM2:**
   ```bash
   pm2 start ecosystem.config.cjs --env production
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Config (`/etc/nginx/sites-available/seedhaven`):**
   ```nginx
   server {
       listen 80;
       server_name seedhavenbd.com www.seedhavenbd.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d seedhavenbd.com -d www.seedhavenbd.com
   ```

---

### C. cPanel Hosting

#### Method 1: cPanel with "Setup Node.js App" (Full-Stack)
1. In cPanel, click **Setup Node.js App**.
2. Create application:
   - **Node.js version:** Select `20.x` or latest.
   - **Application root:** `seedhaven` (or your folder name).
   - **Application startup file:** `dist/server.cjs`.
3. Upload project files via File Manager or Git.
4. Run NPM Install and NPM Build:
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```
5. Click **Restart** in the Node.js selector.

#### Method 2: cPanel Shared Hosting (Static Apache)
1. Run `npm run build` locally or on CI/CD.
2. Open the generated `dist/` directory.
3. Upload all contents of `dist/` into your `public_html/` folder.
4. The pre-configured `.htaccess` file inside `dist/` will automatically handle:
   - Direct link to Admin Panel (`/admin` -> `admin.html`)
   - SPA page refreshes and direct URLs
   - Browser caching and Gzip compression

---

### D. Vercel

1. **Push repository to GitHub / GitLab:**
   Commit all files (including `vercel.json` and `api/index.ts`).
2. **Import Project into Vercel:**
   - Log in to [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
   - Select your GitHub repository and click **Import**.
3. **Verify Build & Output Settings:**
   - **Framework Preset:** Vite (or Other)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Configure Environment Variables (in Vercel Project Settings):**
   Under **Settings** -> **Environment Variables**, add the following (values are automatically kept secure and never exposed in browser JS):
   - `STEADFAST_API_KEY` (Your Steadfast Courier API Key)
   - `STEADFAST_SECRET_KEY` (Your Steadfast Courier Secret Key)
   - `META_PIXEL_ID` (Your Meta Pixel / Dataset ID)
   - `META_CAPI_ACCESS_TOKEN` (Your Facebook System User Access Token)
   - `ADMIN_SECRET_KEY` (Strong secret key for admin authentication)
   - `NODE_ENV` = `production`
5. **Deploy:**
   - Click **Deploy**.
   - Vercel deploys the frontend SPA to `dist/`, maps `/admin` to `dist/admin.html`, and compiles `api/index.ts` as high-performance Serverless Functions for all `/api/*` endpoints.
   - You get a free production URL: `https://your-project-name.vercel.app`.
6. **Free Subdomain & Services Verification:**
   - Main Storefront: `https://your-project-name.vercel.app/`
   - Admin Panel: `https://your-project-name.vercel.app/admin`
   - Steadfast Courier, Meta CAPI: Handled by `/api/*` Serverless Functions.
   - Database: Realtime sync via Google Firebase Firestore.
   - Images & Banners: Stored permanently in Firebase Storage.

---

### E. Netlify

1. Connect repository in Netlify.
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy. The included `netlify.toml` handles routing redirects and caching headers.

---

### F. Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect Git repository.
3. Build configuration:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. The included `wrangler.jsonc` and `_redirects` file handle clean routing.

---

### G. Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login and initialize:
   ```bash
   firebase login
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
4. The included `firebase.json` automatically serves `dist` with SPA rules and admin routing.

---

## 4. Easy Hosting Migration Checklist

To migrate this website from one server/hosting to another without losing data:

1. **Backup Database Records:**
   - Copy `data/orders.json` and `data/integrations_secure.json` to your local machine or backup drive.
2. **Backup Uploaded Images:**
   - Copy `public/uploads/` to your backup drive.
3. **Move Code:**
   - Transfer repository files to the new host.
4. **Restore Data:**
   - Place your backed-up `orders.json` into `data/` and images into `public/uploads/` on the new server.
5. **Update DNS Settings:**
   - Point your domain's `A` record or `CNAME` record to the new server's IP or host address.
6. **Activate SSL:**
   - Ensure HTTPS is configured via Let's Encrypt, Cloudflare SSL, or host certificate manager.

---

## 5. Health Check & Verification

Once deployed, verify your setup:

1. **Uptime & Health:** Visit `https://your-domain.com/api/health` — should return `{"status":"ok", ...}`.
2. **Admin Panel:** Visit `https://your-domain.com/admin` — admin dashboard should open directly.
3. **Product Catalog:** Visit `https://your-domain.com/` — products should load from Google Sheet / Firestore.
4. **Sitemap:** Visit `https://your-domain.com/sitemap.xml` — valid XML sitemap should render.
5. **Direct Page Refresh:** Navigate to `https://your-domain.com/track-order` and hit refresh (F5) — page must load without 404 errors.
