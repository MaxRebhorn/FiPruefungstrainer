# Deploy to GitHub Pages

Deploys the **FI Prüfungstrainer** to:

```
https://maxrebhorn.github.io/fipruefungstrainer/
```

## Prerequisites

- **GitHub Personal Access Token (classic)** with `public_repo` scope
  - Create one at: https://github.com/settings/tokens
  - Save the token somewhere safe — you only see it once

---

## Option A — Deploy via Git (recommended, no extra tools)

### 1. Build the project (optional — `dist/` is already up to date)

```bash
# If you have the build tooling set up:
npm run build
# The output goes into dist/
```

### 2. Deploy the `dist/` folder to the `gh-pages` branch

Run these from the project root (`FIAEPT-Prototype/`):

```bash
# Step into the dist folder
cd dist

# Init a temporary git repo there
git init
git checkout -b gh-pages

# Stage everything (including the wasm binary!)
git add -A

# Commit
git commit -m "deploy: $(date +%Y-%m-%d)"

# Push to the gh-pages branch on GitHub
# Replace TOKEN with your actual PAT
git push https://<TOKEN>@github.com/MaxRebhorn/FiPruefungstrainer.git gh-pages --force

# Clean up
cd ..
rm -rf dist/.git
```

### 3. Enable GitHub Pages

1. Go to https://github.com/MaxRebhorn/FiPruefungstrainer/settings/pages
2. Under **Source**, select **Deploy from a branch**
3. **Branch**: `gh-pages` → `/ (root)`
4. Click **Save**

### 4. Wait & verify

After ~1–2 minutes, your site is live at:

```
https://maxrebhorn.github.io/fipruefungstrainer/
```

---

## Option B — Deploy via GitHub Actions (automatic on push)

### 1. Create `.github/workflows/deploy.yml` in the project root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Enable GitHub Pages

1. Go to https://github.com/MaxRebhorn/FiPruefungstrainer/settings/pages
2. Under **Source**, select **GitHub Actions**
3. Commit and push the workflow file — it deploys automatically on every push to `main`

---

## Important notes

- **The `dist/` is pre-built** with the correct base path `/FiPruefungstrainer/`. If you rebuild, make sure the Vite `base` config is set to `/FiPruefungstrainer/`.
- **`sql-wasm.wasm`** must be served with `application/wasm` MIME type. GitHub Pages handles this correctly out of the box.
- **Case sensitivity**: The repo is `FiPruefungstrainer` (capital F, P), but GitHub Pages lowercases the URL to `fipruefungstrainer`. The Vite base path is set to `/FiPruefungstrainer/` to match the repo name — this is correct.
- **Force push** is required for the git-based method because the `gh-pages` branch is replaced each time.
