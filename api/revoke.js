import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { site_key } = req.body;
  if (!site_key) return res.status(400).json({ error: 'site_key is required' });

  const { error } = await supabase
    .from('rentals')
    .update({ is_active: false })
    .eq('site_key', site_key);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
