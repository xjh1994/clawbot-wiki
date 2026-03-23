# Deploy to Cloudflare Pages

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial clawbot.wiki"
git remote add origin https://github.com/xjh1994/clawbot.wiki.git
git push -u origin main
```

## 2. Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages → Create Project
2. Connect GitHub → select `xjh1994/clawbot.wiki`
3. Build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy

## 3. Custom Domain

In Cloudflare Pages → Custom Domains → Add `clawbot.wiki`
(Domain already on Cloudflare, DNS auto-configured)

## 4. Enable Decap CMS (Community Contributions)

Decap CMS with GitHub backend requires an OAuth app:

1. GitHub → Settings → Developer Settings → OAuth Apps → New
   - Application name: `ClawBot Wiki CMS`
   - Homepage: `https://clawbot.wiki`
   - Callback URL: `https://clawbot.wiki/admin/`

2. Install `netlify-cms-github-oauth-provider` on a free Cloudflare Worker
   OR use [decap-proxy](https://github.com/stereobooster/decap-proxy) on Cloudflare Workers

3. Add to `public/admin/config.yml`:
   ```yaml
   backend:
     base_url: https://your-oauth-worker.workers.dev
   ```

> Simpler alternative: Contributors can edit YAML directly on GitHub
> without the CMS — they fork → edit → PR. The `/submit` page links there.

## Contributing Workflow

- **With CMS**: `/admin/` → Login with GitHub → Fill form → Submit → PR created automatically
- **With GitHub**: Fork → add/edit `src/data/claws/*.yaml` → PR → you review & merge → auto-deploys
