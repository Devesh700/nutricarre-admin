import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabaseAdmin';
import { parseWorkbook, sheetToJson, parseDietTemplates, validateDietTemplates, buildDietTemplatePreview } from '$lib/server/importService';

export async function POST({ request }) {
  console.log('[API] import-templates POST called');
  try {
    const form = await request.formData();
    const rawData = form.get('rawData');
    const file = form.get('file');

    let templates;

    if (rawData) {
      templates = JSON.parse(rawData);
    } else if (file && file instanceof Blob) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const wb = parseWorkbook(buffer);
      const rows = sheetToJson(wb, wb.SheetNames[0]);
      if (rows.length === 0) {
        return json({ error: 'No data found in the uploaded file' }, { status: 400 });
      }
      templates = parseDietTemplates(rows);
    } else {
      return json({ error: 'No file or data provided' }, { status: 400 });
    }

    // If this is a preview request (no import flag), return preview
    if (form.get('mode') === 'preview') {
      const validation = validateDietTemplates(templates);
      const { data: existing } = await supabaseAdmin.from('diet_templates').select('diet_code');
      const existingCodes = (existing || []).map(t => t.diet_code);
      const preview = buildDietTemplatePreview(templates, existingCodes);
      return json({ preview, validation });
    }

    // Otherwise, import
    let imported = 0;
    const errors = [];
    for (const t of templates) {
      const { error } = await supabaseAdmin
        .from('diet_templates')
        .upsert({
          diet_code: t.diet_code,
          diet_name: t.diet_name,
          target: t.target,
          food_type: t.food_type,
          calories_min: t.calories_min,
          calories_max: t.calories_max,
          total_weeks: t.total_weeks,
          updated_at: new Date().toISOString()
        }, { onConflict: 'diet_code' });
      if (error) errors.push(`Row ${t._row}: ${error.message}`);
      else imported++;
    }

    return json({ success: true, imported, errors: errors.length > 0 ? errors : null });
  } catch (e) {
    console.error('[API] Error:', e);
    return json({ error: e.message }, { status: 500 });
  }
}
