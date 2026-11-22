import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const { site_key } = req.query;
  if (!site_key) return res.status(400).json({ error: 'site_key is required' });

  const { data, error } = await supabase
    .from('rentals')
    .select('totp_secret, expires_at, is_active')
    .eq('site_key', site_key)
    .single();

  if (error || !data || !data.is_active) {
    return res.status(403).json({ error: 'Ключ не найден или аренда окончена' });
  }

  if (new Date(data.expires_at) < new Date()) {
    return res.status(403).json({ error: 'Время аренды истекло' });
  }

  const code = authenticator.generate(data.totp_secret);
  return res.status(200).json({ code });
}
