// @ts-nocheck

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'cross-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pubKey = process.env.ADSHARES_PUB_KEY;
  const coinzillaZone = process.env.COINZILLA_ZONE_ID;

  try {
    let ad;
    if (coinzillaZone) {
      // Coinzilla request
      const r = await fetch(`https://request.coinzilla.com/api/ads?format=video&zone=${coinzillaZone}`);
      if (!r.ok) throw new Error('Coinzilla response not ok');
      const data = await r.json();
      ad = {
        id: data.id || 'cz',
        videoUrl: data.video,
        trackers: data.trackers || data.impression || [],
      };
    } else if (pubKey) {
      // Adshares fallback
      const r = await fetch(`https://adserver.adshares.net/get?pub=${pubKey}&format=video`);
      if (!r.ok) throw new Error('Adshares response not ok');
      const data = await r.json();
      ad = {
        id: data.id || data.creative || 'ads',
        videoUrl: data.media?.url || data.video || '',
        trackers: data.impression || [],
      };
    } else {
      return res.status(500).json({ error: 'No ad provider configured' });
    }

    res.status(200).json(ad);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
} 