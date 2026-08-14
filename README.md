# Blesspoke

**Create your own song. 1 prompt · 1 request. Song ownership is yours.**

Blesspoke is a bespoke song-commissioning platform with exactly one artist: **Dennis Lau**.
No rosters, no templates — you send a single prompt, Dennis writes and produces the
song, and a deed of ownership is signed over to you.

## What's inside

### The site (`/`)
- Scroll-cinema landing: a 420vh sticky stage where scrolling scrubs a canvas
  "performance" (spotlight, gold dust, violin strings, light sweeps) with kinetic
  typography cuts — the short-form promo feel, driven by the scrollbar.
- Three design acts: **Noir** (the artist), **Stage** (the ritual), **Vault** (the deed).
- Brief → checkout (escrow) → project room → preview approval → ownership deed.
- Studio view for Dennis to receive briefs and move songs along.

### Lumo — the admin portal (`/lumo`)
- **Dashboard** — top metrics, top bundle deposits/purchases, Top 50 deposits,
  Top 50 withdrawals, Top 50 profit.
- **Users** — filter/search (email, role, status, verification, created range),
  pagination, Excel export (all or filtered), and per-user Actions: edit info,
  manage permission, suspend / freeze / reactivate.
- **Transactions** — tabs for All / Withdrawals / Bundle Volume / Deposits; filters
  for username, wallet, network (TRC20/ERC20/BEP20), amount range, status, and date
  range; Excel export; withdrawal approve/reject.
- **Network** — franchise/community hierarchy in Tree and Table views; move members
  between branches / reassign uplines with cycle protection.

All admin data is a deterministic seeded ledger (640 members, 3.4k transactions)
persisted to localStorage, with admin actions stored as overlays.

## Develop

```bash
npm install
npm run dev
```

Demo logins (password `demo`): `you@blesspoke.com` (listener),
`dennis@blesspoke.com` (studio), `admin@lumo.gg` (Lumo).

## Deploy

Push to `main` — GitHub Actions builds and deploys to GitHub Pages at
`/blesspoke/`.
