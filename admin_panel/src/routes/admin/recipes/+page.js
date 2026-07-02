import { supabase } from '$lib/supabase';

export async function load() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return { recipes: [] };
  }

  return { recipes: recipes || [] };
}
