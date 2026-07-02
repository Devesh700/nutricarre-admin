import { supabaseAdmin } from '$lib/supabaseAdmin';
import { json } from '@sveltejs/kit';

/**
 * GET /api/diet/user-schedule?user_id=X&week=Y
 *
 * Returns the user's schedule for a given user-facing week number.
 * Template weeks are remapped: User Week 1 = Template Week actual_start_week
 */
export async function GET({ url }) {
  const userId = url.searchParams.get('user_id');
  const userWeek = parseInt(url.searchParams.get('week') || '1', 10);
  const includeAll = url.searchParams.get('all') === 'true';

  if (!userId) {
    return json({ error: 'user_id is required' }, { status: 400 });
  }

  // Get current assignment
  const { data: assignments } = await supabaseAdmin
    .from('user_diet_assignments')
    .select('*')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })
    .limit(1);

  if (!assignments || assignments.length === 0) {
    return json({ error: 'No diet assignment found. User may not have an active subscription.' }, { status: 404 });
  }

  const assignment = assignments[0];
  const totalUserWeeks = assignment.weeks_granted;

  // Remap: User Week N → Template Week (actual_start_week + N - 1)
  if (userWeek < 1 || userWeek > totalUserWeeks) {
    return json({
      error: `Invalid week. User has ${totalUserWeeks} weeks (1-${totalUserWeeks})`,
      total_weeks: totalUserWeeks,
      assignment
    }, { status: 400 });
  }

  const templateWeek = assignment.actual_start_week + userWeek - 1;

  // Get the diet code for this template
  const { data: template } = await supabaseAdmin
    .from('diet_templates')
    .select('diet_code, diet_name')
    .eq('id', assignment.diet_template_id)
    .single();

  if (!template) {
    return json({ error: 'Diet template not found' }, { status: 500 });
  }

  // Get the schedule from template meals
  const { data: meals } = await supabaseAdmin
    .from('diet_template_meals')
    .select('*, meal_library!inner(*)')
    .eq('diet_code', template.diet_code)
    .eq('week_no', templateWeek)
    .order('day_no')
    .order('meal_time');

  if (!meals || meals.length === 0) {
    return json({
      user_week: userWeek,
      template_week: templateWeek,
      diet_name: template.diet_name,
      meals: [],
      message: 'No meals scheduled for this week'
    });
  }

  // Group by day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const byDay = {};
  for (let d = 1; d <= 7; d++) {
    byDay[days[d - 1]] = {
      day_no: d,
      meals: meals
        .filter(m => m.day_no === d)
        .map(m => ({
          meal_type: m.meal_type,
          meal_time: m.meal_time,
          meal_code: m.meal_code,
          meal_name: m.meal_library?.meal_name || '',
          calories: m.meal_library?.calories || 0,
          protein: m.meal_library?.protein || 0,
          carbs: m.meal_library?.carbs || 0,
          fat: m.meal_library?.fat || 0
        }))
    };
  }

  // Also get the user's stored schedule if it exists
  const { data: storedSchedule } = await supabaseAdmin
    .from('user_meal_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('day_index');

  return json({
    user_week: userWeek,
    template_week: templateWeek,
    total_user_weeks: totalUserWeeks,
    assignment: {
      actual_start_week: assignment.actual_start_week,
      actual_end_week: assignment.actual_end_week,
      weeks_granted: assignment.weeks_granted
    },
    diet: {
      name: template.diet_name,
      code: template.diet_code
    },
    week: {
      days: Object.values(byDay)
    },
    all_meals: includeAll ? storedSchedule : undefined
  });
}
