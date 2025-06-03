import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@farcaster/quick-auth';

const qc = createClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, adId } = req.body as { token?: string; adId?: string };
  if (!token || !adId) return res.status(400).json({ error: 'Missing params' });

  try {
    const payload = await qc.verifyJwt({ token, domain: 'adcaster.vercel.app' });
    // TODO: store in DB, credit user payload.sub (fid) with reward for adId
    console.log('Ad completed', { fid: payload.sub, adId });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
} 