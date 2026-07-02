import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const { id } = params;

  const [userResponse, scheduleResponse, recipesResponse, assignmentResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('user_meal_schedule')
      .select('*, recipes(*)')
      .eq('user_id', id)
      .order('day_index'),
    supabase
      .from('recipes')
      .select('*')
      .order('name'),
    supabase
      .from('user_diet_assignments')
      .select('*, diet_templates(diet_code, diet_name, total_weeks), subscription_plans(id, name, target_calories)')
      .eq('user_id', id)
      .order('assigned_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  if (userResponse.error) {
    throw error(404, 'User not found');
  }

  let templateMeals = [];
  let totalWeeks = 0;
  let accessibleWeeks = 0;

  if (assignmentResponse.data) {
    const a = assignmentResponse.data;
    const dietCode = a.diet_templates?.diet_code;
    totalWeeks = a.weeks_granted || 0;
    accessibleWeeks = a.weeks_granted || 0;

    if (dietCode) {
      const startWeek = a.actual_start_week || 1;
      const endWeek = a.actual_end_week || (startWeek + totalWeeks - 1);

      const { data: meals } = await supabase
        .from('diet_template_meals')
        .select('*, meal_library(*)')
        .eq('diet_code', dietCode)
        .gte('week_no', startWeek)
        .lte('week_no', endWeek)
        .order('week_no')
        .order('day_no')
        .order('meal_time');

      templateMeals = meals || [];
    }
  }

  return {
    profile: userResponse.data,
    schedule: scheduleResponse.data || [],
    recipes: recipesResponse.data || [],
    assignment: assignmentResponse.data || null,
    templateMeals,
    totalWeeks,
    accessibleWeeks
  };
}
