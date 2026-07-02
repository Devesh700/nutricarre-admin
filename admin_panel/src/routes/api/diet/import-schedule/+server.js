import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdmin';
import { parseWorkbook, sheetToJson, parseDietSchedule, validateDietSchedule } from '$lib/server/importService';

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const mode = form.get('mode');
    const rawData = form.get('rawData');
    const file = form.get('file');
    const replaceExisting = form.get('replaceExisting') === 'true';

    if (mode === 'preview') {
      if (!file || !(file instanceof Blob)) return json({ error: 'No file uploaded' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      const wb = parseWorkbook(buffer);
      const rows = sheetToJson(wb, wb.SheetNames[0]);
      if (rows.length === 0) return json({ error: 'No data found' }, { status: 400 });
      const schedule = parseDietSchedule(rows);
      const [templatesRes, mealsRes] = await Promise.all([
        supabaseAdmin.from('diet_templates').select('diet_code, total_weeks'),
        supabaseAdmin.from('meal_library').select('meal_code')
      ]);
      const validDietCodes = (templatesRes.data || []).map(t => t.diet_code);
      const validMealCodes = (mealsRes.data || []).map(m => m.meal_code);
      const templateWeeks = Object.fromEntries((templatesRes.data || []).map(t => [t.diet_code, t.total_weeks]));
      const validation = validateDietSchedule(schedule, validDietCodes, validMealCodes, templateWeeks);
      return json({ schedule, validation });
    }

    if (mode === 'import') {
      if (!rawData) return json({ error: 'No data provided' }, { status: 400 });
      const schedule = JSON.parse(rawData);
      let imported = 0;
      const errors = [];
      const byDiet = {};
      for (const s of schedule) {
        if (!byDiet[s.diet_code]) byDiet[s.diet_code] = [];
        byDiet[s.diet_code].push(s);
      }
      for (const [dietCode, rows] of Object.entries(byDiet)) {
        if (replaceExisting) {
          const { error: delErr } = await supabaseAdmin.from('diet_template_meals').delete().eq('diet_code', dietCode);
          if (delErr) { errors.push(`Error clearing schedule for ${dietCode}: ${delErr.message}`); continue; }
        }
        for (const s of rows) {
          const { error } = await supabaseAdmin.from('diet_template_meals').upsert({
            diet_code: s.diet_code, week_no: s.week_no, day_no: s.day_no,
            meal_type: s.meal_type, meal_time: s.meal_time, meal_code: s.meal_code
          }, { onConflict: 'id' });
          if (error) errors.push(`Row ${s._row}: ${error.message}`);
          else imported++;
        }
      }
      return json({ success: true, imported, errors: errors.length > 0 ? errors : null });
    }

    return json({ error: 'Invalid mode' }, { status: 400 });
  } catch (e) {
    console.error('[API] import-schedule error:', e);
    return json({ error: e.message }, { status: 500 });
  }
}
