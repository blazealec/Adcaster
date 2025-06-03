# Adcaster – Farcaster Mini App

Watch ads and earn crypto directly inside Farcaster clients.

## Quick start (local development)

1. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

2. Vite will start on `http://localhost:5173` (default). Open the [Mini App Debug Tool](https://farcaster.xyz/~/developers/mini-apps/debug) and enter that URL (or your tunnel URL) to preview the app in Warpcast.

## Deployment

Deploy the contents of this repository to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

Make sure the domain you deploy to matches the `homeUrl` in `/.well-known/farcaster.json`.

## Extending

* Integrate server-side rewards: when the video finishes, make a request to your backend to transfer tokens to the user's address (available via `sdk.wallet.getEthereumProvider()`).
* Add multiple ads by dynamically loading video creatives.
* Track completion rates and earnings with a backend database. 