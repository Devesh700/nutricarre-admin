<script>
  let { data } = $props();

  let file = $state(null);
  let importData = $state(null);
  let validations = $state(null);
  let summary = $state(null);
  let importing = $state(false);
  let result = $state(null);
  let mode = $state('upload');
  let errorMessage = $state('');

  async function handlePreview(event) {
    event.preventDefault();
    if (!file) return;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'preview');
      const resp = await fetch('/api/diet/import-combined', { method: 'POST', body: fd });
      const d = await resp.json();
      if (d.error) { errorMessage = d.error; return; }
      importData = d.data;
      validations = d.validations;
      summary = d.summary;
      mode = 'preview';
    } catch (e) { errorMessage = e.message; }
  }

  async function handleImport() {
    importing = true;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('rawData', JSON.stringify(importData));
      fd.append('mode', 'import');
      const resp = await fetch('/api/diet/import-combined', { method: 'POST', body: fd });
      const d = await resp.json();
      if (d.error) { errorMessage = d.error; importing = false; return; }
      result = d;
      if (d.success) mode = 'result';
    } catch (e) { errorMessage = e.message; }
    importing = false;
  }
</script>

<div class="import-page">
  <div class="page-head">
    <h1>Combined Diet Import</h1>
    <p>Upload a single workbook containing all diet data.</p>
  </div>

  {#if errorMessage}
    <div class="error-banner">{errorMessage}<button class="dismiss" onclick={() => errorMessage = ''}>x</button></div>
  {/if}

  <div class="tab-bar">
    <button class="tab" class:active={mode === 'upload'} onclick={() => mode = 'upload'}>Upload</button>
    <button class="tab" class:active={mode === 'preview'} disabled={!importData}>Preview</button>
    <button class="tab" class:active={mode === 'result'} disabled={!result}>Result</button>
  </div>

  {#if mode === 'upload'}
    <div class="card upload-area">
      <form onsubmit={handlePreview}>
        <div class="drop-zone">
          <p>Upload a single Excel workbook with sheets: <strong>DietTemplates</strong>, <strong>Meals</strong>, <strong>MealItems</strong>, <strong>DietPlanMeals</strong></p>
          <input type="file" name="file" accept=".xlsx,.xls" required onchange={(e) => file = e.target.files[0]} />
        </div>
        <button type="submit" class="btn-primary" disabled={!file}>Preview All Sheets</button>
      </form>
    </div>
  {/if}

  {#if mode === 'preview' && summary}
    <div class="card">
      <div class="summary-strip">
        <div class="stat"><strong>{summary.templatesFound}</strong> Templates</div>
        <div class="stat"><strong>{summary.mealsFound}</strong> Meals</div>
        <div class="stat"><strong>{summary.mealItemsFound}</strong> Meal Items</div>
        <div class="stat"><strong>{summary.scheduleRowsFound}</strong> Schedule Rows</div>
      </div>

      {#if summary.warnings?.length}
        <div class="warnings"><h4>Warnings</h4>{#each summary.warnings as w}<p>{w}</p>{/each}</div>
      {/if}

      {#each ['templates', 'meals', 'items', 'schedule'] as section}
        {#if validations?.[section]?.errors?.length}
          <div class="errors">
            <h4>Validation Errors - {section}</h4>
            {#each validations[section].errors as e}<p>{e}</p>{/each}
          </div>
        {/if}
      {/each}

      {#if importData?.templates?.length}
        <h3 style="margin:1rem 0 0.5rem;">Diet Templates ({importData.templates.length})</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Code</th><th>Name</th><th>Target</th><th>Type</th><th>Cal Min</th><th>Cal Max</th><th>Weeks</th></tr></thead>
          <tbody>{#each importData.templates as t}<tr><td><code>{t.diet_code}</code></td><td>{t.diet_name}</td><td>{t.target}</td><td>{t.food_type}</td><td>{t.calories_min}</td><td>{t.calories_max}</td><td>{t.total_weeks}</td></tr>{/each}</tbody>
        </table></div>
      {/if}

      {#if importData?.meals?.length}
        <h3 style="margin:1.5rem 0 0.5rem;">Meals ({importData.meals.length})</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Cal</th><th>P</th><th>C</th><th>F</th></tr></thead>
          <tbody>{#each importData.meals as m}<tr><td><code>{m.meal_code}</code></td><td>{m.meal_name}</td><td>{m.meal_type}</td><td>{m.calories}</td><td>{m.protein}</td><td>{m.carbs}</td><td>{m.fat}</td></tr>{/each}</tbody>
        </table></div>
      {/if}

      {#if importData?.items?.length}
        <h3 style="margin:1.5rem 0 0.5rem;">Meal Items ({importData.items.length})</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Meal Code</th><th>Food</th><th>Qty</th><th>Unit</th></tr></thead>
          <tbody>{#each importData.items as i}<tr><td>{i.meal_code}</td><td>{i.food_name}</td><td>{i.quantity}</td><td>{i.unit}</td></tr>{/each}</tbody>
        </table></div>
      {/if}

      {#if importData?.schedule?.length}
        <h3 style="margin:1.5rem 0 0.5rem;">Schedule Rows ({importData.schedule.length})</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Diet Code</th><th>Week</th><th>Day</th><th>Type</th><th>Time</th><th>Meal Code</th></tr></thead>
          <tbody>{#each importData.schedule as s}<tr><td><code>{s.diet_code}</code></td><td>{s.week_no}</td><td>{s.day_no}</td><td>{s.meal_type}</td><td>{s.meal_time}</td><td><code>{s.meal_code}</code></td></tr>{/each}</tbody>
        </table></div>
      {/if}

      <div class="actions"><button class="btn-primary" onclick={handleImport} disabled={importing}>{importing ? 'Importing...' : 'Import All Data'}</button></div>
    </div>
  {/if}

  {#if mode === 'result' && result}
    <div class="card result-area">
      <div class="success-icon">&#10003;</div>
      <h2>Import Complete</h2>
      <div class="result-stats">
        <div class="r-stat">{result.templates} Templates</div>
        <div class="r-stat">{result.meals} Meals</div>
        <div class="r-stat">{result.items} Items</div>
        <div class="r-stat">{result.schedule} Schedule Rows</div>
      </div>
      {#if result.errors?.length}<div class="errors"><h4>Errors</h4>{#each result.errors as e}<p>{e}</p>{/each}</div>{/if}
      <button class="btn-primary" onclick={() => { mode = 'upload'; importData = null; result = null; errorMessage = ''; }}>Import Another</button>
    </div>
  {/if}
</div>

<style>
  .import-page { animation: fadeIn 0.3s ease; }
  .page-head { margin-bottom: 2rem; }
  .page-head h1 { font-size: 1.75rem; font-weight: 800; }
  .page-head p { color: var(--text-muted); font-size: 0.875rem; }
  .error-banner { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center; }
  .error-banner .dismiss { background: none; border: none; color: #DC2626; cursor: pointer; font-weight: 700; }
  .tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .tab { padding: 0.5rem 1.25rem; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); font-weight: 700; font-size: 0.8125rem; cursor: pointer; }
  .tab.active { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
  .tab:disabled { opacity: 0.5; cursor: not-allowed; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 1.5rem; }
  .drop-zone { border: 2px dashed var(--border); border-radius: 1rem; padding: 3rem; text-align: center; margin-bottom: 1rem; }
  .drop-zone input { margin-top: 1rem; }
  .summary-strip { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }
  .stat { font-size: 0.875rem; padding: 0.75rem 1rem; background: var(--bg); border-radius: 8px; }
  .warnings { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FFFBEB; border: 1px solid #FDE68A; }
  .errors { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
  .table-wrap { overflow-x: auto; margin-bottom: 1rem; }
  .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
  .table-wrap th { text-align: left; padding: 0.75rem; background: var(--bg); font-weight: 700; border-bottom: 1px solid var(--border); }
  .table-wrap td { padding: 0.75rem; border-bottom: 1px solid var(--border-light); }
  h3 { font-weight: 700; color: var(--text); }
  .actions { margin-top: 1.5rem; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .result-area { text-align: center; }
  .success-icon { font-size: 3rem; color: #10B981; margin-bottom: 1rem; }
  .result-stats { display: flex; justify-content: center; gap: 2rem; margin: 1.5rem 0; flex-wrap: wrap; }
  .r-stat { font-size: 1rem; font-weight: 700; }
</style>
