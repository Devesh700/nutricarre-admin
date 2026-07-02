import { supabase } from '$lib/supabase';

export const load = async () => {
  // Try fetching with join first
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('*, diet_plans:active_plan_id(name)');

  const { data: subscriptionPlans, error: planError } = await supabase
    .from('subscription_plans')
    .select('id, name, target_goal, price, duration_months, diet_template_id, accessible_weeks');

  if (userError) {
    console.error('Error fetching users with join:', userError);
    // Fallback to simple fetch if join fails
    const { data: simpleUsers, error: simpleError } = await supabase
      .from('profiles')
      .select('*');
    
    return {
      users: simpleUsers || [],
      subscriptionPlans: subscriptionPlans || [],
      error: simpleError ? simpleError.message : userError.message
    };
  }

  return {
    users: users || [],
    subscriptionPlans: subscriptionPlans || [],
    error: null
  };
};
