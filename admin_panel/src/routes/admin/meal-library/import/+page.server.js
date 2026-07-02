import { supabaseAdmin } from '$lib/supabaseAdmin';

export async function load() {
  const { data: existing } = await supabaseAdmin
    .from('meal_library')
    .select('meal_code');
  return { existingCodes: (existing || []).map(m => m.meal_code) };
}
