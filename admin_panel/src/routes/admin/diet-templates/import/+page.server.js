import { supabaseAdmin } from '$lib/supabaseAdmin';

export async function load() {
  const { data: existing } = await supabaseAdmin
    .from('diet_templates')
    .select('diet_code');

  return {
    existingCodes: (existing || []).map(t => t.diet_code)
  };
}
