// DEPRECATED: Use diet-schedule/import instead
import { supabase } from '$lib/supabase';

export async function load({ params, url }) {
  const planId = params.id;
  const day = url.searchParams.get('day') || 0;
  const week = url.searchParams.get('week') || 1;

  const { data: plan } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('id', planId)
    .single();

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .order('name');

  return {
    plan,
    recipes,
    initialDay: parseInt(day),
    initialWeek: parseInt(week)
  };
}
