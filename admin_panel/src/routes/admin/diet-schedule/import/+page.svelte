<script>
  let { data } = $props();

  let file = $state(null);
  let scheduleData = $state(null);
  let validation = $state(null);
  let importing = $state(false);
  let result = $state(null);
  let replaceExisting = $state(false);
  let mode = $state('upload');
  let errorMessage = $state('');

  const totalRows = $derived(scheduleData?.length || 0);

  async function handlePreview() {
    if (!file) return;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'preview');
      const resp = await fetch('/api/diet/import-schedule', { method: 'POST', body: fd });
      const d = await resp.json();
      if (d.error) { errorMessage = d.error; return; }
      scheduleData = d.schedule;
      validation = d.validation;
      mode = 'preview';
    } catch (e) { errorMessage = e.message; }
  }

  async function handleImport() {
    importing = true;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('rawData', JSON.stringify(scheduleData));
      fd.append('replaceExisting', String(replaceExisting));
      fd.append('mode', 'import');
      const resp = await fetch('/api/diet/import-schedule', { method: 'POST', body: fd });
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
    <h1>Diet Schedule Import</h1>
    <p>Upload Excel to map meals to diet templates by week, day, and meal type.</p>
  </div>

  {#if errorMessage}
    <div class="error-banner">{errorMessage}<button class="dismiss" onclick={() => errorMessage = ''}>x</button></div>
  {/if}

  <div class="tab-bar">
    <button class="tab" class:active={mode === 'upload'} onclick={() => mode = 'upload'}>Upload</button>
    <button class="tab" class:active={mode === 'preview'} disabled={!scheduleData}>Preview</button>
    <button class="tab" class:active={mode === 'result'} disabled={!result}>Result</button>
  </div>

  {#if mode === 'upload'}
    <div class="card upload-area">
      <div class="drop-zone">
        <p>Upload Excel file with diet schedule rows</p>
        <input type="file" accept=".xlsx,.xls" onchange={(e) => file = e.target.files[0]} />
      </div>
      <p class="hint">Columns: diet_code, week_no, day_no (1-7), meal_type, meal_time (HH:MM), meal_code</p>
      <button class="btn-primary" disabled={!file} onclick={handlePreview}>Preview</button>
    </div>
  {/if}

  {#if mode === 'preview' && scheduleData}
    <div class="card">
      <div class="summary-strip">
        <div class="stat"><strong>{totalRows}</strong> Schedule Rows</div>
        <div class="stat" class:valid={validation?.valid} class:invalid={!validation?.valid}>
          {validation?.valid ? 'All Valid' : `${validation?.errors?.length || 0} Errors`}
        </div>
      </div>

      {#if validation?.warnings?.length}
        <div class="warnings"><h4>Warnings</h4>{#each validation.warnings as w}<p>{w}</p>{/each}</div>
      {/if}
      {#if validation?.errors?.length}
        <div class="errors"><h4>Validation Errors</h4>{#each validation.errors as e}<p>{e}</p>{/each}</div>
      {/if}

      <div class="table-wrap">
        <table>
          <thead><tr><th>Diet Code</th><th>Week</th><th>Day</th><th>Meal Type</th><th>Time</th><th>Meal Code</th></tr></thead>
          <tbody>
            {#each scheduleData as s}
              <tr>
                <td><code>{s.diet_code}</code></td>
                <td>{s.week_no}</td>
                <td>{s.day_no}</td>
                <td>{s.meal_type}</td>
                <td>{s.meal_time}</td>
                <td><code>{s.meal_code}</code></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="actions">
        <label class="checkbox">
          <input type="checkbox" bind:checked={replaceExisting} />
          Replace existing schedule for matched diet codes
        </label>
        <button class="btn-primary" onclick={handleImport} disabled={importing || !validation?.valid}>
          {importing ? 'Importing...' : `Import ${totalRows} Rows`}
        </button>
      </div>
    </div>
  {/if}

  {#if mode === 'result' && result}
    <div class="card result-area">
      <div class="success-icon">&#10003;</div>
      <h2>Schedule Import Complete</h2>
      <p><strong>{result.imported}</strong> rows imported</p>
      {#if result.errors?.length}
        <div class="errors"><h4>Errors</h4>{#each result.errors as e}<p>{e}</p>{/each}</div>
      {/if}
      <button class="btn-primary" onclick={() => { mode = 'upload'; scheduleData = null; result = null; errorMessage = ''; }}>Import Another</button>
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
  .stat.valid { border-left: 3px solid #10B981; }
  .stat.invalid { border-left: 3px solid #EF4444; }
  .warnings { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FFFBEB; border: 1px solid #FDE68A; }
  .errors { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
  .warnings h4, .errors h4 { font-weight: 700; margin-bottom: 0.5rem; }
  .table-wrap { overflow-x: auto; margin-bottom: 1rem; }
  .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
  .table-wrap th { text-align: left; padding: 0.75rem; background: var(--bg); font-weight: 700; border-bottom: 1px solid var(--border); }
  .table-wrap td { padding: 0.75rem; border-bottom: 1px solid var(--border-light); }
  .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
  .checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; cursor: pointer; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .result-area { text-align: center; }
  .success-icon { font-size: 3rem; color: #10B981; margin-bottom: 1rem; }
</style>
