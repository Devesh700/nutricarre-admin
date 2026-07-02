import { supabase } from '$lib/supabase';

export async function load({ params }) {
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single();

  return { recipe };
}
