import { supabaseAdmin } from '$lib/supabaseAdmin';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { user_id, subscription_plan_id } = await request.json();

  if (!user_id || !subscription_plan_id) {
    return json({ error: 'user_id and subscription_plan_id are required' }, { status: 400 });
  }

  const { data: plan, error: planErr } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('id', subscription_plan_id)
    .single();

  if (planErr || !plan) {
    return json({ error: 'Subscription plan not found' }, { status: 404 });
  }

  if (!plan.diet_template_id) {
    return json({ error: 'Plan does not use diet template system. Use legacy assignment.' }, { status: 400 });
  }

  const { data: assignment, error: assignErr } = await supabaseAdmin.rpc(
    'assign_user_diet_weeks',
    {
      p_user_id: user_id,
      p_subscription_plan_id: subscription_plan_id,
      p_diet_template_id: plan.diet_template_id
    }
  );

  if (assignErr) return json({ error: assignErr.message }, { status: 500 });
  if (assignment?.error) return json({ error: assignment.error }, { status: 400 });

  const { data: schedule, error: genErr } = await supabaseAdmin.rpc(
    'generate_user_schedule',
    { p_user_id: user_id }
  );

  if (genErr) return json({ error: genErr.message, assignment }, { status: 500 });

  return json({ success: true, assignment, schedule });
}

export async function GET({ url }) {
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return json({ error: 'user_id query parameter is required' }, { status: 400 });
  }

  const { data: assignments, error } = await supabaseAdmin
    .from('user_diet_assignments')
    .select('*, diet_templates:diet_template_id(*)')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false });

  if (error) return json({ error: error.message }, { status: 500 });

  if (!assignments || assignments.length === 0) {
    return json({ assignments: [] });
  }

  // Get user schedule
  const { data: schedule } = await supabaseAdmin
    .from('user_meal_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('day_index');

  return json({
    assignments,
    schedule: schedule || [],
    current_assignment: assignments[0]
  });
}
