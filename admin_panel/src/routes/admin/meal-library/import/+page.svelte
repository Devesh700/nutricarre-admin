<script>
  let { data } = $props();

  let file = $state(null);
  let previewData = $state(null);
  let validation = $state(null);
  let importing = $state(false);
  let result = $state(null);
  let mode = $state('upload');
  let errorMessage = $state('');

  async function handlePreview() {
    if (!file) return;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'preview');
      const resp = await fetch('/api/diet/import-meals', { method: 'POST', body: fd });
      const d = await resp.json();
      if (d.error) { errorMessage = d.error; return; }
      previewData = d;
      validation = { meals: d.mealsValidation, items: d.itemsValidation };
      mode = 'preview';
    } catch (e) { errorMessage = e.message; }
  }

  async function handleImport(type) {
    importing = true;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('rawData', JSON.stringify(type === 'meals' ? previewData.meals : previewData.items));
      fd.append('mode', type === 'meals' ? 'importMeals' : 'importItems');
      const resp = await fetch('/api/diet/import-meals', { method: 'POST', body: fd });
      const d = await resp.json();
      if (d.error) { errorMessage = d.error; importing = false; return; }
      result = { ...d, type: type === 'meals' ? 'Meals' : 'Meal Items' };
      if (d.success) mode = 'result';
    } catch (e) { errorMessage = e.message; }
    importing = false;
  }
</script>

<div class="import-page">
  <div class="page-head">
    <h1>Meal Library Import</h1>
    <p>Upload Excel to import or update meals and meal items.</p>
  </div>

  {#if errorMessage}
    <div class="error-banner">{errorMessage}<button class="dismiss" onclick={() => errorMessage = ''}>x</button></div>
  {/if}

  <div class="tab-bar">
    <button class="tab" class:active={mode === 'upload'} onclick={() => mode = 'upload'}>Upload</button>
    <button class="tab" class:active={mode === 'preview'} disabled={!previewData}>Preview</button>
    <button class="tab" class:active={mode === 'result'} disabled={!result}>Result</button>
  </div>

  {#if mode === 'upload'}
    <div class="card upload-area">
      <div class="drop-zone">
        <p>Upload Excel file with <strong>Meals</strong> and/or <strong>MealItems</strong> sheets</p>
        <input type="file" accept=".xlsx,.xls" onchange={(e) => file = e.target.files[0]} />
      </div>
      <p class="hint">Meals: meal_code, meal_name, meal_type, food_type, calories, protein, carbs, fat<br/>MealItems: meal_code, food_name, quantity, unit</p>
      <button class="btn-primary" disabled={!file} onclick={handlePreview}>Preview</button>
    </div>
  {/if}

  {#if mode === 'preview' && previewData}
    <div class="card">
      <div class="summary-strip">
        <div class="stat"><strong>{previewData.meals?.length || 0}</strong> Meals</div>
        <div class="stat"><strong>{previewData.items?.length || 0}</strong> Meal Items</div>
      </div>

      {#if validation?.meals?.warnings?.length || validation?.items?.warnings?.length}
        <div class="warnings">
          <h4>Warnings</h4>
          {#each [...(validation.meals?.warnings || []), ...(validation.items?.warnings || [])] as w}
            <p>{w}</p>
          {/each}
        </div>
      {/if}

      {#if previewData.meals?.length}
        <h3 style="margin-bottom:0.75rem;">Meals Preview</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Food Type</th><th>Cal</th><th>P</th><th>C</th><th>F</th></tr></thead>
            <tbody>
              {#each previewData.meals as m}
                <tr><td><code>{m.meal_code}</code></td><td>{m.meal_name}</td><td>{m.meal_type}</td><td>{m.food_type}</td><td>{m.calories}</td><td>{m.protein}</td><td>{m.carbs}</td><td>{m.fat}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
        <button class="btn-primary" onclick={() => handleImport('meals')} disabled={importing}>{importing ? 'Importing...' : 'Import Meals'}</button>
      {/if}

      {#if previewData.items?.length}
        <h3 style="margin:1.5rem 0 0.75rem;">Meal Items Preview</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Meal Code</th><th>Food Name</th><th>Quantity</th><th>Unit</th></tr></thead>
            <tbody>
              {#each previewData.items as item}
                <tr><td>{item.meal_code}</td><td>{item.food_name}</td><td>{item.quantity}</td><td>{item.unit}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
        <button class="btn-primary" onclick={() => handleImport('items')} disabled={importing}>{importing ? 'Importing...' : 'Import Meal Items'}</button>
      {/if}
    </div>
  {/if}

  {#if mode === 'result' && result}
    <div class="card result-area">
      <div class="success-icon">&#10003;</div>
      <h2>{result.type} Import Complete</h2>
      <p><strong>{result.imported}</strong> records imported</p>
      {#if result.errors?.length}
        <div class="errors"><h4>Errors</h4>{#each result.errors as e}<p>{e}</p>{/each}</div>
      {/if}
      <button class="btn-primary" onclick={() => { mode = 'upload'; previewData = null; result = null; errorMessage = ''; }}>Import Another</button>
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
  .drop-zone { border: 2px dashed var(--border); border-radius: 1rem; padding: 3rem; text-align: center; color: var(--text-muted); margin-bottom: 1rem; }
  .drop-zone input { margin-top: 1rem; }
  .hint { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; }
  .summary-strip { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
  .stat { font-size: 0.875rem; padding: 0.75rem 1rem; background: var(--bg); border-radius: 8px; }
  .warnings { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FFFBEB; border: 1px solid #FDE68A; }
  .errors { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
  .table-wrap { overflow-x: auto; margin-bottom: 1rem; }
  .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
  .table-wrap th { text-align: left; padding: 0.75rem; background: var(--bg); font-weight: 700; border-bottom: 1px solid var(--border); }
  .table-wrap td { padding: 0.75rem; border-bottom: 1px solid var(--border-light); }
  h3 { font-weight: 700; color: var(--text); }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; margin-right: 0.75rem; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .result-area { text-align: center; }
  .success-icon { font-size: 3rem; color: #10B981; margin-bottom: 1rem; }
</style>
