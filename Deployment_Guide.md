# Deployment & Setup Guide

This guide details local setup, GitHub OAuth parameters, and deployment strategies for the Portfolio CMS platform.

---

## 1. Hosting Architecture Comparison

This codebase supports two deployment strategies:

### Option A: GitHub Pages (Primary)
- **Type**: 100% Static Export (`output: 'export'`)
- **Public Dashboard**: Statically loads committed data from `data/*.json`. Works natively and extremely fast on GitHub Pages.
- **Admin Dashboard**: Runs client-side. The page prompts the authorized admin (`RasikhAli`) for a **GitHub Personal Access Token (PAT)**. This token is securely saved in browser `localStorage`. Direct writes and image uploads are committed directly to the repository via the browser.
- **Dynamic Server**: None required.

### Option B: Render Static or Node Web Service (Recommended for full Server Security)
- **Type**: Next.js Node Server
- **Public Dashboard**: Standard SSR / Static regeneration.
- **Admin Dashboard**: Secured server-side via **NextAuth.js** and **GitHub OAuth**. Route changes are intercepted by middleware. Writes are proxied through server-side secure endpoints using the OAuth access token.
- **Requirements**: Active Node.js runtime environment.

---

## 2. Option A: GitHub Pages Deployment

To deploy the static website to `https://rasikhali.github.io`:

### Step 1: Create a Personal Access Token (PAT)
1. Go to your GitHub account **Settings > Developer Settings > Personal Access Tokens > Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Check the scope `repo` (which grants access to commit code/upload media).
4. Save the token securely. You will paste this token into the `/admin` portal login under Method A.

### Step 2: Push to GitHub & Enable Action Pages
1. Push the code to your repository on the `main` branch.
2. Go to repository **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The automated workflow `.github/workflows/deploy.yml` will trigger, build, and deploy the project to GitHub Pages.

---

## 3. Option B: Render Node Service Setup

To host the dynamic server-side application on Render:

### Step 1: Create GitHub OAuth Application
1. Go to your GitHub account **Settings > Developer Settings > OAuth Apps > New OAuth App**.
2. **Application Name**: `Portfolio CMS`
3. **Homepage URL**: `https://your-app-name.onrender.com` (use `http://localhost:3000` for local testing).
4. **Authorization Callback URL**: `https://your-app-name.onrender.com/api/auth/callback/github` (use `http://localhost:3000/api/auth/callback/github` for local testing).
5. Click **Register Application**, then generate a **Client Secret**.

### Step 2: Configure Environment Variables on Render
Set the following environment variables in the Render Dashboard under **Environment**:

- `GITHUB_ID`: *Your GitHub OAuth Client ID*
- `GITHUB_SECRET`: *Your GitHub OAuth Client Secret*
- `NEXTAUTH_SECRET`: *Generate a random base64 string* (e.g. run `openssl rand -base64 32`)
- `NEXTAUTH_URL`: `https://your-app-name.onrender.com`
- `AUTHORIZED_GITHUB_USERS`: `RasikhAli`
- `GITHUB_OWNER`: `RasikhAli`
- `GITHUB_REPO`: `rasikhali.github.io`
- `GITHUB_BRANCH`: `main`

---

## 4. Local Development

To run the application locally:

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your credentials.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Access `http://localhost:3000`. Navigate to `/admin` to verify log-in screens.

---

## 5. Backup & Recovery Guidelines

Since all data persists directly in raw JSON files inside the repository, backing up the portfolio CMS is simple:

- **Backup**: Simply clone or download the repository. Git history preserves all previous states, logs, and uploads.
- **Restore**: Push the JSON files under `/data` back to the repository on your branch. The static Pages rebuild will automatically update the public site.
