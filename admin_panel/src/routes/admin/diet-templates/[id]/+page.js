import { supabase } from '$lib/supabase';

export async function load({ params }) {
  const { id } = params;

  // Fetch the diet template
  const { data: template, error: templateError } = await supabase
    .from('diet_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (templateError || !template) {
    return {
      template: null,
      meals: [],
      mealLibrary: [],
      error: templateError?.message || 'Diet template not found'
    };
  }

  // Fetch the meals for this template, and all available meals in the library
  const [mealsRes, libraryRes] = await Promise.all([
    supabase
      .from('diet_template_meals')
      .select('*, meal_library(*)')
      .eq('diet_code', template.diet_code)
      .order('week_no')
      .order('day_no')
      .order('meal_time'),
    supabase
      .from('meal_library')
      .select('*')
      .order('meal_code')
  ]);

  return {
    template,
    meals: mealsRes.data || [],
    mealLibrary: libraryRes.data || []
  };
}
