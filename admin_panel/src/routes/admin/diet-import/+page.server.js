import { supabaseAdmin } from '$lib/supabaseAdmin';

export async function load() {
  const [templatesRes, mealsRes] = await Promise.all([
    supabaseAdmin.from('diet_templates').select('diet_code, total_weeks'),
    supabaseAdmin.from('meal_library').select('meal_code')
  ]);

  return {
    existingTemplateCodes: (templatesRes.data || []).map(t => t.diet_code),
    existingMealCodes: (mealsRes.data || []).map(m => m.meal_code),
    templateWeeks: Object.fromEntries(
      (templatesRes.data || []).map(t => [t.diet_code, t.total_weeks])
    )
  };
}
