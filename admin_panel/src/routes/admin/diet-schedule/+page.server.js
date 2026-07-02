import { supabaseAdmin } from '$lib/supabaseAdmin';

export async function load() {
  const { data } = await supabaseAdmin
    .from('diet_template_meals')
    .select('*')
    .order('diet_code')
    .order('week_no')
    .order('day_no');

  return { schedule: data || [] };
}
