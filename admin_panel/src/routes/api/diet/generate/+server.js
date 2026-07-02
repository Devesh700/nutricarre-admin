import { supabaseAdmin } from '$lib/supabaseAdmin';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { user_id, assignment_id, diet_template_id, start_week, end_week } = await request.json();

  let targetUserId = user_id;
  let actualStart = start_week;
  let actualEnd = end_week;
  let templateId = diet_template_id;

  // If assignment_id provided, load from assignment
  if (assignment_id && !user_id) {
    const { data: assignment, error: aErr } = await supabaseAdmin
      .from('user_diet_assignments')
      .select('*')
      .eq('id', assignment_id)
      .single();

    if (aErr) return json({ error: 'Assignment not found' }, { status: 404 });

    targetUserId = assignment.user_id;
    actualStart = assignment.actual_start_week;
    actualEnd = assignment.actual_end_week;
    templateId = assignment.diet_template_id;
  }

  if (!targetUserId) {
    return json({ error: 'user_id or assignment_id required' }, { status: 400 });
  }

  if (templateId) {
    const { data: schedule, error: genErr } = await supabaseAdmin.rpc(
      'generate_user_schedule',
      { p_user_id: targetUserId }
    );

    if (genErr) return json({ error: genErr.message }, { status: 500 });
    return json({ success: true, schedule });
  }

  // Manual schedule generation if no template
  if (!actualStart || !actualEnd) {
    return json({ error: 'start_week and end_week required when no template_id' }, { status: 400 });
  }

  // Get the diet template code
  const { data: template } = await supabaseAdmin
    .from('diet_templates')
    .select('diet_code')
    .eq('id', templateId)
    .single();

  if (!template) return json({ error: 'Template not found' }, { status: 404 });

  // Get or create a diet_plan for user
  let planId;
  const { data: existingPlan } = await supabaseAdmin
    .from('diet_plans')
    .select('id')
    .eq('name', 'User Plan - ' + targetUserId)
    .maybeSingle();

  if (existingPlan) {
    planId = existingPlan.id;
  } else {
    const { data: newPlan } = await supabaseAdmin
      .from('diet_plans')
      .insert({ name: 'User Plan - ' + targetUserId, description: 'Auto-generated plan from template', is_template: false })
      .select()
      .single();
    planId = newPlan?.id;
  }

  // Clear existing schedule
  await supabaseAdmin.from('user_meal_schedule').delete().eq('user_id', targetUserId);

  // Generate schedule
  let userWeek = 1;
  for (let tw = actualStart; tw <= actualEnd; tw++) {
    const { data: meals } = await supabaseAdmin
      .from('diet_template_meals')
      .select('*, meal_library!inner(*)')
      .eq('diet_code', template.diet_code)
      .eq('week_no', tw);

    if (meals) {
      const scheduleRows = meals.map(m => ({
        user_id: targetUserId,
        plan_id: planId,
        day_index: (userWeek - 1) * 7 + m.day_no,
        meal_time: m.meal_time,
        meal_category: m.meal_type,
        meal_name: m.meal_library?.meal_name || '',
        calories: m.meal_library?.calories || 0,
        quantity: 1.0,
        comments: `From template: ${template.diet_code} Week ${tw}`
      }));

      if (scheduleRows.length > 0) {
        await supabaseAdmin.from('user_meal_schedule').insert(scheduleRows);
      }
    }
    userWeek++;
  }

  // Update user profile
  await supabaseAdmin.from('profiles').update({
    active_plan_id: planId,
    active_plan_start_date: new Date().toISOString()
  }).eq('id', targetUserId);

  return json({ success: true, weeks_generated: userWeek - 1 });
}
