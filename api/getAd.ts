import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'cross-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const publisher = process.env.ADEX_PUBLISHER_ID;
  if (!publisher) {
    return res.status(500).json({ error: 'ADEX_PUBLISHER_ID not set' });
  }
  try {
    const r = await fetch(`https://api.adex.network/ad?format=video&publisher=${publisher}`);
    if (!r.ok) throw new Error('AdEx response not ok');
    const ad = await r.json();
    // Return minimal fields the frontend expects
    res.status(200).json({ id: ad.id ?? ad.adId ?? 'unknown', videoUrl: ad.video ?? ad.assets?.video, trackers: ad.trackers ?? [] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
} 