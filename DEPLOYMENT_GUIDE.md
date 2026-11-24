# S/ASH Academy — Production Static Frontend Deployment Guide

This guide details how to build and deploy the frontend of the **S/ASH Academy Interview Booking System** to zero-cost, enterprise-grade static hosting platforms (Cloudflare Pages, Vercel, or Netlify).

---

## 1. Preparing the Production Build

Before deploying, build the optimized static distribution:

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build
```

This compiles all React components, icons, brand CSS, and logic into the `dist/` directory:
- `dist/index.html`
- `dist/assets/index-[hash].js`
- `dist/assets/index-[hash].css`
- `dist/assets/slash-logo.jpg`

---

## 2. Option A: Deploying on Vercel (Recommended)

Vercel provides instant global CDN deployment with automatic HTTPS and preview branches.

### Method 1: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
1. Set Framework preset to **Vite**.
2. Set Build command to **`npm run build`**.
3. Set Output directory to **`dist`**.
4. In Environment Variables, set:
   - `VITE_APPS_SCRIPT_URL`: *(Your Google Apps Script Web App URL)*

### Method 2: Via Git Repository
1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), import the repository.
3. Add the environment variable `VITE_APPS_SCRIPT_URL`.
4. Click **Deploy**.

---

## 3. Option B: Deploying on Cloudflare Pages

Cloudflare Pages provides hyper-fast edge hosting with unlimited bandwidth.

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Compute &gt; Pages**.
2. Click **Create application** &gt; **Pages** &gt; **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables**, add:
   - `VITE_APPS_SCRIPT_URL`: *(Your Google Apps Script Web App URL)*
6. Click **Save and Deploy**.

---

## 4. Option C: Deploying on Netlify

1. In the [Netlify Dashboard](https://app.netlify.com/), click **Add new site** &gt; **Import an existing project**.
2. Select your repository.
3. Build Settings:
   - **Base directory**: `.`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variable `VITE_APPS_SCRIPT_URL`.
5. Click **Deploy Site**.

---

## 5. Production Testing & Verification Checklist

After deploying to production, run through this quick verification checklist:

| Verification Item | Action | Expected Result |
|---|---|---|
| **Logo & Branding** | Load homepage | S/ASH Academy logo renders crisp with navy obsidian theme |
| **Available Slots** | View slot cards | Only active slots with seats remaining are visible |
| **Student Booking** | Submit a test booking | Confirmation screen appears with reference ID and celebration |
| **Google Sheets Sync** | Inspect Spreadsheet | Row appears in `Bookings` and `Booked Count` increments in `Appointment Slots` |
| **Overbooking Block** | Book remaining seats of a slot | Slot automatically disappears from public view when full |
| **Duplicate Prevention** | Re-enter same phone on same slot | Server rejects with duplicate phone notification |
| **Admin Authorization** | Log in with invalid key | Server rejects access |
| **Capacity Management** | Change slot capacity from Admin | New capacity takes effect dynamically |
| **Mobile Responsiveness** | Test on smartphone | Touch controls, cards, modals, and tables scale seamlessly |
