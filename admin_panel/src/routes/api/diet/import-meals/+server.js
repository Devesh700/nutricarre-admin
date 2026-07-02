import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdmin';
import { parseWorkbook, sheetToJson, parseMealLibrary, parseMealItems, validateMealLibrary, validateMealItems } from '$lib/server/importService';

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const mode = form.get('mode');
    const rawData = form.get('rawData');
    const file = form.get('file');

    if (mode === 'preview') {
      if (!file || !(file instanceof Blob)) return json({ error: 'No file uploaded' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const wb = parseWorkbook(buffer);
      const mealsSheet = sheetToJson(wb, 'Meals');
      const itemsSheet = sheetToJson(wb, 'MealItems');
      const hasMeals = mealsSheet.length > 0;
      const hasItems = itemsSheet.length > 0;

      let meals = [], items = [];
      let mealsValidation = { valid: true, errors: [], warnings: [] };
      let itemsValidation = { valid: true, errors: [], warnings: [] };

      if (hasMeals) {
        meals = parseMealLibrary(mealsSheet);
        mealsValidation = validateMealLibrary(meals);
      } else if (!hasItems) {
        const rows = sheetToJson(wb, wb.SheetNames[0]);
        meals = parseMealLibrary(rows);
        mealsValidation = validateMealLibrary(meals);
      }

      if (hasItems) {
        items = parseMealItems(itemsSheet);
        const validMealCodes = meals.map(m => m.meal_code);
        itemsValidation = validateMealItems(items, validMealCodes);
      }

      const { data: existing } = await supabaseAdmin.from('meal_library').select('meal_code');
      const existingCodes = (existing || []).map(m => m.meal_code);

      return json({ meals, items, mealsValidation, itemsValidation, existingCodes, hasBoth: hasMeals && hasItems });
    }

    if (mode === 'importMeals' || mode === 'importItems') {
      if (!rawData) return json({ error: 'No data provided' }, { status: 400 });
      const records = JSON.parse(rawData);
      let imported = 0;
      const errors = [];
      const table = mode === 'importMeals' ? 'meal_library' : 'meal_items';

      for (const r of records) {
        const payload = mode === 'importMeals'
          ? { meal_code: r.meal_code, meal_name: r.meal_name, meal_type: r.meal_type, food_type: r.food_type, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, updated_at: new Date().toISOString() }
          : { meal_code: r.meal_code, food_name: r.food_name, quantity: r.quantity, unit: r.unit };
        const { error } = await supabaseAdmin.from(table).upsert(payload, { onConflict: mode === 'importMeals' ? 'meal_code' : 'id' });
        if (error) errors.push(`Row ${r._row}: ${error.message}`);
        else imported++;
      }

      return json({ success: true, imported, errors: errors.length > 0 ? errors : null });
    }

    return json({ error: 'Invalid mode' }, { status: 400 });
  } catch (e) {
    console.error('[API] import-meals error:', e);
    return json({ error: e.message }, { status: 500 });
  }
}
