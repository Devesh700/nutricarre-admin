// DEPRECATED: Use diet-templates/ meal-library/ diet-schedule/ instead
import { supabase } from '$lib/supabase';

export async function load() {
  const [plansResponse, recipesResponse] = await Promise.all([
    supabase.from('diet_plans').select('*').order('created_at', { ascending: false }),
    supabase.from('recipes').select('*').order('name')
  ]);

  return {
    diets: plansResponse.data || [],
    recipes: recipesResponse.data || []
  };
}
