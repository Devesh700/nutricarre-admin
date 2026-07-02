<script>
  let { data } = $props();

  let file = $state(null);
  let preview = $state(null);
  let validation = $state(null);
  let importing = $state(false);
  let result = $state(null);
  let activeTab = $state('upload');
  let errorMessage = $state('');

  async function handlePreviewClick() {
    if (!file) return;
    errorMessage = '';
    console.log('[Import] Preview clicked, file:', file.name);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'preview');
      const resp = await fetch('/api/diet/import-templates', { method: 'POST', body: fd });
      const d = await resp.json();
      console.log('[Import] Response:', JSON.stringify(d).slice(0, 500));
      if (d.error) { errorMessage = d.error; return; }
      preview = d.preview;
      validation = d.validation;
      activeTab = 'preview';
    } catch (e) { console.error('[Import] Exception:', e); errorMessage = e.message; }
  }

  async function handleImport() {
    if (!preview?.templates?.length) return;
    importing = true;
    errorMessage = '';
    try {
      const fd = new FormData();
      fd.append('rawData', JSON.stringify(preview.templates));
      fd.append('mode', 'import');
      const resp = await fetch('/api/diet/import-templates', { method: 'POST', body: fd });
      const d = await resp.json();
      console.log('[Import] Import result:', JSON.stringify(d).slice(0, 300));
      if (d.error) { errorMessage = d.error; importing = false; return; }
      result = d;
      if (d.success) activeTab = 'result';
    } catch (e) { console.error('[Import] Exception:', e); errorMessage = e.message; }
    importing = false;
  }
</script>

<div class="import-page">
  <div class="page-head">
    <h1>Diet Template Import</h1>
    <p>Upload Excel files to import or update diet templates.</p>
  </div>

  {#if errorMessage}
    <div class="error-banner">{errorMessage}
      <button class="dismiss" onclick={() => errorMessage = ''}>x</button>
    </div>
  {/if}

  <div class="tab-bar">
    <button class="tab" class:active={activeTab === 'upload'} onclick={() => activeTab = 'upload'}>Upload</button>
    <button class="tab" class:active={activeTab === 'preview'} disabled={!preview}>Preview</button>
    <button class="tab" class:active={activeTab === 'result'} disabled={!result}>Result</button>
  </div>

  {#if activeTab === 'upload'}
    <div class="card upload-area">
      <div class="drop-zone">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p>Select your Excel file</p>
        <input type="file" accept=".xlsx,.xls,.csv" onchange={(e) => { file = e.target.files[0]; }} />
      </div>
      <p class="hint">Expected columns: diet_code, diet_name, target, food_type, calories_min, calories_max, total_weeks</p>
      <button class="btn-primary" disabled={!file} onclick={handlePreviewClick}>Preview Import</button>
    </div>

    <div class="info-card">
      <h3>Format Reference</h3>
      <table class="ref-table">
        <thead><tr><th>Column</th><th>Required</th><th>Example</th></tr></thead>
        <tbody>
          <tr><td>diet_code</td><td>Yes</td><td>WL_VEG_1800_01</td></tr>
          <tr><td>diet_name</td><td>Yes</td><td>Weight Loss Veg Plan</td></tr>
          <tr><td>target</td><td>Yes</td><td>weight_loss</td></tr>
          <tr><td>food_type</td><td>Yes</td><td>veg</td></tr>
          <tr><td>calories_min</td><td>Yes</td><td>1700</td></tr>
          <tr><td>calories_max</td><td>Yes</td><td>1900</td></tr>
          <tr><td>total_weeks</td><td>Yes</td><td>36</td></tr>
        </tbody>
      </table>
    </div>
  {/if}

  {#if activeTab === 'preview' && preview}
    <div class="card preview-area">
      <div class="summary-strip">
        <div class="stat"><strong>{preview.total || 0}</strong> Templates Found</div>
        <div class="stat new"><strong>{preview.new || 0}</strong> New</div>
        <div class="stat update"><strong>{preview.updates || 0}</strong> Updates</div>
      </div>

      {#if validation?.warnings?.length}
        <div class="warnings"><h4>Warnings</h4>{#each validation.warnings as w}<p>{w}</p>{/each}</div>
      {/if}
      {#if validation?.errors?.length}
        <div class="errors"><h4>Validation Errors</h4>{#each validation.errors as e}<p>{e}</p>{/each}</div>
      {/if}

      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Target</th><th>Food Type</th><th>Cal Min</th><th>Cal Max</th><th>Weeks</th></tr></thead>
          <tbody>
            {#each preview.templates as t}
              <tr>
                <td><code>{t.diet_code}</code></td>
                <td>{t.diet_name}</td>
                <td>{t.target}</td>
                <td>{t.food_type}</td>
                <td>{t.calories_min}</td>
                <td>{t.calories_max}</td>
                <td>{t.total_weeks}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="actions">
        <button class="btn-primary" onclick={handleImport} disabled={importing || !validation?.valid}>
          {importing ? 'Importing...' : `Import ${preview.total} Templates`}
        </button>
      </div>
    </div>
  {/if}

  {#if activeTab === 'result' && result}
    <div class="card result-area">
      <div class="success-icon">&#10003;</div>
      <h2>Import Complete</h2>
      <div class="result-stats">
        <div class="r-stat"><strong>{result.imported}</strong> Templates Imported</div>
      </div>
      {#if result.errors?.length}
        <div class="errors"><h4>Errors</h4>{#each result.errors as e}<p>{e}</p>{/each}</div>
      {/if}
      <button class="btn-primary" onclick={() => { activeTab = 'upload'; preview = null; validation = null; result = null; errorMessage = ''; }}>Import Another File</button>
    </div>
  {/if}
</div>

<style>
  .import-page { animation: fadeIn 0.3s ease; }
  .page-head { margin-bottom: 2rem; }
  .page-head h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  .page-head p { color: var(--text-muted); font-size: 0.875rem; }
  .error-banner { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center; }
  .error-banner .dismiss { background: none; border: none; color: #DC2626; cursor: pointer; font-weight: 700; font-size: 1rem; }
  .tab-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .tab { padding: 0.5rem 1.25rem; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); font-weight: 700; font-size: 0.8125rem; cursor: pointer; }
  .tab.active { background: var(--primary-accent); color: white; border-color: var(--primary-accent); }
  .tab:disabled { opacity: 0.5; cursor: not-allowed; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 1.5rem; }
  .drop-zone { border: 2px dashed var(--border); border-radius: 1rem; padding: 3rem; text-align: center; color: var(--text-muted); cursor: pointer; margin-bottom: 1rem; }
  .drop-zone input { margin-top: 1rem; }
  .hint { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; }
  .info-card { background: #F8FAFC; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
  .info-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
  .ref-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
  .ref-table th { text-align: left; padding: 0.5rem; background: var(--bg); font-weight: 700; color: var(--text-muted); }
  .ref-table td { padding: 0.5rem; border-bottom: 1px solid var(--border-light); }
  .summary-strip { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
  .stat { font-size: 0.875rem; padding: 0.75rem 1rem; background: var(--bg); border-radius: 8px; }
  .stat.new { border-left: 3px solid #10B981; }
  .stat.update { border-left: 3px solid #3B82F6; }
  .warnings, .errors { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8125rem; }
  .warnings { background: #FFFBEB; border: 1px solid #FDE68A; }
  .errors { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
  .warnings h4, .errors h4 { font-weight: 700; margin-bottom: 0.5rem; }
  .table-wrap { overflow-x: auto; margin-bottom: 1.5rem; }
  .table-wrap table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
  .table-wrap th { text-align: left; padding: 0.75rem; background: var(--bg); font-weight: 700; border-bottom: 1px solid var(--border); }
  .table-wrap td { padding: 0.75rem; border-bottom: 1px solid var(--border-light); }
  .actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .result-area { text-align: center; }
  .success-icon { font-size: 3rem; color: #10B981; margin-bottom: 1rem; }
  .result-stats { display: flex; justify-content: center; gap: 2rem; margin: 1.5rem 0; }
  .r-stat { font-size: 1.125rem; }
</style>
