import * as XLSX from 'xlsx';

// ============ VALUE NORMALIZATION ============

export function normalizeFoodType(val) {
  if (!val) return 'veg';
  const s = val.toString().trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
  if (['veg', 'vegetarian'].includes(s)) return 'veg';
  if (['nonveg', 'non_veg'].includes(s)) return 'non_veg';
  return s;
}

export function normalizeTarget(val) {
  if (!val) return 'weight_loss';
  const s = val.toString().trim().toLowerCase().replace(/\s+/g, '_');
  if (['weight_loss', 'weightloss'].includes(s)) return 'weight_loss';
  if (['weight_gain', 'weightgain'].includes(s)) return 'weight_gain';
  if (s === 'maintenance') return 'maintenance';
  return s;
}

// ============ EXCEL PARSING ============

export function parseWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  return wb;
}

export function sheetToJson(wb, sheetName) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

// ============ DIET TEMPLATE IMPORT ============

export function parseDietTemplates(rows) {
  return rows.map((r, i) => {
    const row = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k.toString().trim().toLowerCase(), v])
    );
    return {
      _row: i + 2,
      diet_code: (row.diet_code || '').toString().trim(),
      diet_name: (row.diet_name || row.dietname || '').toString().trim(),
      target: normalizeTarget(row.target || ''),
      food_type: normalizeFoodType(row.food_type || row.foodtype || ''),
      calories_min: parseInt(row.calories_min || row.caloriesmin || 0, 10),
      calories_max: parseInt(row.calories_max || row.caloriesmax || 0, 10),
      total_weeks: parseInt(row.total_weeks || row.totalweeks || 0, 10)
    };
  });
}

export function validateDietTemplates(templates) {
  const errors = [];
  const codes = new Set();
  const warnings = [];

  for (const t of templates) {
    if (!t.diet_code) {
      errors.push(`Row ${t._row}: diet_code is required`);
    }
    if (codes.has(t.diet_code)) {
      warnings.push(`Row ${t._row}: Duplicate diet_code "${t.diet_code}"`);
    }
    codes.add(t.diet_code);

    if (!t.calories_min || t.calories_min <= 0) {
      errors.push(`Row ${t._row}: calories_min must be greater than 0`);
    }
    if (!t.calories_max || t.calories_max <= 0) {
      errors.push(`Row ${t._row}: calories_max must be greater than 0`);
    }
    if (t.calories_max <= t.calories_min) {
      errors.push(`Row ${t._row}: calories_max must be greater than calories_min`);
    }
    if (!t.total_weeks || t.total_weeks <= 0) {
      errors.push(`Row ${t._row}: total_weeks must be greater than 0`);
    }
    if (!['veg', 'non_veg'].includes(t.food_type)) {
      warnings.push(`Row ${t._row}: Unknown food_type "${t.food_type}" normalized to "${t.food_type}"`);
    }
    if (!['weight_loss', 'weight_gain', 'maintenance'].includes(t.target)) {
      warnings.push(`Row ${t._row}: Unknown target "${t.target}"`);
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

export function buildDietTemplatePreview(templates, existingCodes) {
  const newCount = templates.filter(t => !existingCodes.includes(t.diet_code)).length;
  const updateCount = templates.filter(t => existingCodes.includes(t.diet_code)).length;
  return {
    total: templates.length,
    new: newCount,
    updates: updateCount,
    templates
  };
}

// ============ MEAL LIBRARY IMPORT ============

export function parseMealLibrary(rows) {
  return rows.map((r, i) => {
    const row = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k.toString().trim().toLowerCase(), v])
    );
    return {
      _row: i + 2,
      meal_code: (row.meal_code || row.mealcode || '').toString().trim(),
      meal_name: (row.meal_name || row.mealname || '').toString().trim(),
      meal_type: (row.meal_type || row.mealtype || '').toString().trim().toLowerCase(),
      food_type: normalizeFoodType(row.food_type || row.foodtype || 'veg'),
      calories: parseInt(row.calories, 10) || 0,
      protein: parseFloat(row.protein) || 0,
      carbs: parseFloat(row.carbs || row.carbohydrates || 0),
      fat: parseFloat(row.fat || row.fats || 0)
    };
  });
}

export function validateMealLibrary(meals) {
  const errors = [];
  const codes = new Set();
  const warnings = [];

  for (const m of meals) {
    if (!m.meal_code) {
      errors.push(`Row ${m._row}: meal_code is required`);
    }
    if (codes.has(m.meal_code)) {
      warnings.push(`Row ${m._row}: Duplicate meal_code "${m.meal_code}"`);
    }
    codes.add(m.meal_code);

    if (!m.meal_name) {
      errors.push(`Row ${m._row}: meal_name is required`);
    }
    if (!m.calories || m.calories <= 0) {
      errors.push(`Row ${m._row}: calories must be greater than 0`);
    }
    if (!m.meal_type) {
      errors.push(`Row ${m._row}: meal_type is required`);
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

// ============ MEAL ITEMS IMPORT ============

export function parseMealItems(rows) {
  return rows.map((r, i) => {
    const row = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k.toString().trim().toLowerCase(), v])
    );
    return {
      _row: i + 2,
      meal_code: (row.meal_code || row.mealcode || '').toString().trim(),
      food_name: (row.food_name || row.foodname || '').toString().trim(),
      quantity: parseFloat(row.quantity) || 0,
      unit: (row.unit || '').toString().trim()
    };
  });
}

export function validateMealItems(items, validMealCodes) {
  const errors = [];
  const warnings = [];

  for (const item of items) {
    if (!item.meal_code) {
      errors.push(`Row ${item._row}: meal_code is required`);
    }
    if (!validMealCodes.includes(item.meal_code)) {
      warnings.push(`Row ${item._row}: meal_code "${item.meal_code}" not found in meal library`);
    }
    if (!item.food_name) {
      errors.push(`Row ${item._row}: food_name is required`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Row ${item._row}: quantity must be greater than 0`);
    }
    if (!item.unit) {
      errors.push(`Row ${item._row}: unit is required`);
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

// ============ DIET SCHEDULE IMPORT ============

export function parseDietSchedule(rows) {
  return rows.map((r, i) => {
    const row = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k.toString().trim().toLowerCase(), v])
    );
    return {
      _row: i + 2,
      diet_code: (row.diet_code || row.dietcode || '').toString().trim(),
      week_no: parseInt(row.week_no || row.weekno || 0, 10),
      day_no: parseInt(row.day_no || row.dayno || 0, 10),
      meal_type: (row.meal_type || row.mealtype || '').toString().trim().toLowerCase(),
      meal_time: formatTime(row.meal_time || row.mealtime || ''),
      meal_code: (row.meal_code || row.mealcode || '').toString().trim()
    };
  });
}

function formatTime(val) {
  if (!val) return '00:00';
  const s = val.toString().trim();
  if (/^\d{1,2}:\d{2}$/.test(s)) return s;
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) return s.substring(0, 5);
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return s;
}

export function validateDietSchedule(rows, validDietCodes, validMealCodes, templateWeeks) {
  const errors = [];
  const warnings = [];

  for (const r of rows) {
    if (!r.diet_code) {
      errors.push(`Row ${r._row}: diet_code is required`);
    } else if (!validDietCodes.includes(r.diet_code)) {
      errors.push(`Row ${r._row}: diet_code "${r.diet_code}" does not exist in diet_templates`);
    }

    if (!r.meal_code) {
      errors.push(`Row ${r._row}: meal_code is required`);
    } else if (!validMealCodes.includes(r.meal_code)) {
      errors.push(`Row ${r._row}: meal_code "${r.meal_code}" does not exist in meal_library`);
    }

    if (!r.week_no || r.week_no <= 0) {
      errors.push(`Row ${r._row}: week_no must be greater than 0`);
    } else if (templateWeeks[r.diet_code] && r.week_no > templateWeeks[r.diet_code]) {
      errors.push(`Row ${r._row}: week_no ${r.week_no} exceeds total_weeks ${templateWeeks[r.diet_code]} for diet_code "${r.diet_code}"`);
    }

    if (!r.day_no || r.day_no < 1 || r.day_no > 7) {
      errors.push(`Row ${r._row}: day_no must be between 1 and 7`);
    }

    if (!r.meal_type) {
      errors.push(`Row ${r._row}: meal_type is required`);
    }

    if (!r.meal_time || !/^\d{1,2}:\d{2}$/.test(r.meal_time)) {
      errors.push(`Row ${r._row}: meal_time must be a valid time (HH:MM)`);
    }
  }

  return { errors, warnings, valid: errors.length === 0 };
}

// ============ COMBINED WORKBOOK IMPORT ============

export function parseSingleWorkbook(buffer) {
  const wb = parseWorkbook(buffer);

  const sheets = {
    dietTemplates: sheetToJson(wb, 'DietTemplates'),
    meals: sheetToJson(wb, 'Meals'),
    mealItems: sheetToJson(wb, 'MealItems'),
    dietPlanMeals: sheetToJson(wb, 'DietPlanMeals')
  };

  const result = {};

  if (sheets.dietTemplates.length > 0) {
    result.templates = parseDietTemplates(sheets.dietTemplates);
  }
  if (sheets.meals.length > 0) {
    result.meals = parseMealLibrary(sheets.meals);
  }
  if (sheets.mealItems.length > 0) {
    result.items = parseMealItems(sheets.mealItems);
  }
  if (sheets.dietPlanMeals.length > 0) {
    result.schedule = parseDietSchedule(sheets.dietPlanMeals);
  }

  return result;
}

// ============ BUILD PREVIEW SUMMARY ============

export function buildImportPreview(data, existingData = {}) {
  const summary = {
    templatesFound: 0,
    mealsFound: 0,
    mealItemsFound: 0,
    scheduleRowsFound: 0,
    warnings: []
  };

  if (data.templates) {
    summary.templatesFound = data.templates.length;
    const existingCodes = existingData.templateCodes || [];
    const dupes = data.templates.filter(t => existingCodes.includes(t.diet_code));
    if (dupes.length > 0) {
      summary.warnings.push(`${dupes.length} diet templates will be updated (existing codes matched)`);
    }
  }

  if (data.meals) {
    summary.mealsFound = data.meals.length;
    const existingCodes = existingData.mealCodes || [];
    const dupes = data.meals.filter(m => existingCodes.includes(m.meal_code));
    if (dupes.length > 0) {
      summary.warnings.push(`${dupes.length} meals will be updated (existing codes matched)`);
    }
  }

  if (data.items) {
    summary.mealItemsFound = data.items.length;
  }

  if (data.schedule) {
    summary.scheduleRowsFound = data.schedule.length;
  }

  return summary;
}
