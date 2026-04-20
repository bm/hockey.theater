# Deployment

hockey.theater is designed to deploy on Vercel with zero configuration.

## Vercel (recommended)

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no build settings needed
4. Click **Deploy**

No environment variables are required. The app has no database and calls only the public NHL API.

### Custom domain

In the Vercel dashboard → **Domains**, add your domain and follow the DNS instructions. The `proxy.ts` middleware handles all URL redirects and works on any domain automatically.

---

## Manual / self-hosted

### Prerequisites

- Node.js 20+
- pnpm 9+

### Build and start

```bash
pnpm install
pnpm build
pnpm start        # runs on http://localhost:3000
```

To run on a different port:

```bash
PORT=8080 pnpm start
```

### Reverse proxy

Put Nginx or Caddy in front of the Node process. Minimal Caddy config:

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

Minimal Nginx config:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Process management

Use PM2 to keep the process alive:

```bash
pnpm install -g pm2
pm2 start "pnpm start" --name hockey-theater
pm2 save
pm2 startup
```

---

## Docker

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note:** Next.js standalone output must be enabled. Add to `next.config.ts`:
> ```ts
> output: 'standalone'
> ```

Build and run:

```bash
docker build -t hockey-theater .
docker run -p 3000:3000 hockey-theater
```

---

## Notes

- **No environment variables** are required at runtime or build time
- **ISR revalidation** (schedule pages every 60s) works out of the box on Vercel. On self-hosted deployments it requires a persistent filesystem cache — standard with Next.js standalone mode
- **NHL API rate limits** — the app proxies all NHL API calls server-side; there are no known published rate limits but aggressive crawling is not recommended
