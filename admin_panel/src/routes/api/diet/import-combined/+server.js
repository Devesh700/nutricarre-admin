import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdmin';
import { parseSingleWorkbook, validateDietTemplates, validateMealLibrary, validateMealItems, validateDietSchedule, buildImportPreview } from '$lib/server/importService';

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const mode = form.get('mode');
    const rawData = form.get('rawData');
    const file = form.get('file');

    if (mode === 'preview') {
      if (!file || !(file instanceof Blob)) return json({ error: 'No file uploaded' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = parseSingleWorkbook(buffer);
      const validations = {};
      if (data.templates) validations.templates = validateDietTemplates(data.templates);
      if (data.meals) validations.meals = validateMealLibrary(data.meals);
      if (data.items) {
        const validMealCodes = (data.meals || []).map(m => m.meal_code);
        validations.items = validateMealItems(data.items, validMealCodes);
      }
      if (data.schedule) {
        const [templatesRes, mealsRes] = await Promise.all([
          supabaseAdmin.from('diet_templates').select('diet_code, total_weeks'),
          supabaseAdmin.from('meal_library').select('meal_code')
        ]);
        const dbDietCodes = (templatesRes.data || []).map(t => t.diet_code);
        const dbMealCodes = (mealsRes.data || []).map(m => m.meal_code);
        const incomingDietCodes = (data.templates || []).map(t => t.diet_code);
        const incomingMealCodes = (data.meals || []).map(m => m.meal_code);
        const validDietCodes = [...new Set([...dbDietCodes, ...incomingDietCodes])];
        const validMealCodes = [...new Set([...dbMealCodes, ...incomingMealCodes])];
        const dbTemplateWeeks = Object.fromEntries((templatesRes.data || []).map(t => [t.diet_code, t.total_weeks]));
        const incomingTemplateWeeks = Object.fromEntries((data.templates || []).map(t => [t.diet_code, t.total_weeks]));
        const templateWeeks = { ...dbTemplateWeeks, ...incomingTemplateWeeks };
        validations.schedule = validateDietSchedule(data.schedule, validDietCodes, validMealCodes, templateWeeks);
      }
      const existingData = {
        templateCodes: (await supabaseAdmin.from('diet_templates').select('diet_code')).data?.map(t => t.diet_code) || [],
        mealCodes: (await supabaseAdmin.from('meal_library').select('meal_code')).data?.map(m => m.meal_code) || []
      };
      const summary = buildImportPreview(data, existingData);
      return json({ data, validations, summary });
    }

    if (mode === 'import') {
      if (!rawData) return json({ error: 'No data provided' }, { status: 400 });
      const data = JSON.parse(rawData);
      const results = { templates: 0, meals: 0, items: 0, schedule: 0, errors: [] };

      if (data.templates) {
        for (const t of data.templates) {
          const { error } = await supabaseAdmin.from('diet_templates').upsert({
            diet_code: t.diet_code, diet_name: t.diet_name, target: t.target, food_type: t.food_type,
            calories_min: t.calories_min, calories_max: t.calories_max, total_weeks: t.total_weeks, updated_at: new Date().toISOString()
          }, { onConflict: 'diet_code' });
          if (error) results.errors.push(`Template ${t.diet_code}: ${error.message}`); else results.templates++;
        }
      }
      if (data.meals) {
        for (const m of data.meals) {
          const { error } = await supabaseAdmin.from('meal_library').upsert({
            meal_code: m.meal_code, meal_name: m.meal_name, meal_type: m.meal_type, food_type: m.food_type,
            calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, updated_at: new Date().toISOString()
          }, { onConflict: 'meal_code' });
          if (error) results.errors.push(`Meal ${m.meal_code}: ${error.message}`); else results.meals++;
        }
      }
      if (data.items) {
        for (const item of data.items) {
          const { error } = await supabaseAdmin.from('meal_items').upsert({
            meal_code: item.meal_code, food_name: item.food_name, quantity: item.quantity, unit: item.unit
          }, { onConflict: 'id' });
          if (error) results.errors.push(`Item ${item.food_name}: ${error.message}`); else results.items++;
        }
      }
      if (data.schedule) {
        for (const s of data.schedule) {
          const { error } = await supabaseAdmin.from('diet_template_meals').upsert({
            diet_code: s.diet_code, week_no: s.week_no, day_no: s.day_no,
            meal_type: s.meal_type, meal_time: s.meal_time, meal_code: s.meal_code
          }, { onConflict: 'id' });
          if (error) results.errors.push(`Schedule row ${s._row}: ${error.message}`); else results.schedule++;
        }
      }
      return json({ success: true, ...results });
    }

    return json({ error: 'Invalid mode' }, { status: 400 });
  } catch (e) {
    console.error('[API] import-combined error:', e);
    return json({ error: e.message }, { status: 500 });
  }
}
