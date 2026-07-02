// DEPRECATED: Use diet-templates/ instead
import { supabase } from '$lib/supabase';

export async function load({ params }) {
  const { id } = params;

  const [planRes, scheduleRes, recipesRes] = await Promise.all([
    supabase.from('diet_plans').select('*').eq('id', id).single(),
    supabase.from('diet_plan_schedule').select('*, recipes(*)').eq('plan_id', id).order('day_of_week').order('meal_time'),
    supabase.from('recipes').select('*').order('name')
  ]);

  return {
    plan: planRes.data,
    schedule: scheduleRes.data || [],
    recipes: recipesRes.data || []
  };
}
