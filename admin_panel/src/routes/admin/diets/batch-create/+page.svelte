<!-- DEPRECATED: Replaced by diet-templates/import -->
<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let isSavingBatch = $state(false);
  let batchRows = $state([
    { name: '', category: 'Breakfast', calories: '', protein_g: '', carbs_g: '', fats_g: '', description: '' },
    { name: '', category: 'Lunch', calories: '', protein_g: '', carbs_g: '', fats_g: '', description: '' },
    { name: '', category: 'Dinner', calories: '', protein_g: '', carbs_g: '', fats_g: '', description: '' }
  ]);

  function addBatchRow() {
    batchRows = [...batchRows, { name: '', category: 'Breakfast', calories: '', protein_g: '', carbs_g: '', fats_g: '', description: '' }];
  }

  function removeBatchRow(index) {
    batchRows = batchRows.filter((_, i) => i !== index);
    if (batchRows.length === 0) {
      addBatchRow();
    }
  }

  function clearBatchRows() {
    batchRows = [
      { name: '', category: 'Breakfast', calories: '', protein_g: '', carbs_g: '', fats_g: '', description: '' }
    ];
  }

  async function submitBatchRecipes() {
    const validRows = batchRows.filter(row => row.name.trim() !== '');
    if (validRows.length === 0) {
      alert('Please enter at least one recipe/meal name.');
      return;
    }

    const rowsToInsert = validRows.map(row => ({
      name: row.name,
      category: row.category,
      calories: parseInt(row.calories) || 0,
      protein_g: parseInt(row.protein_g) || 0,
      carbs_g: parseInt(row.carbs_g) || 0,
      fats_g: parseInt(row.fats_g) || 0,
      description: row.description || ''
    }));

    isSavingBatch = true;
    try {
      const { error } = await supabase
        .from('recipes')
        .insert(rowsToInsert);

      if (error) throw error;

      alert(`Successfully created ${rowsToInsert.length} recipes in the global database!`);
      goto('/admin/diets');
    } catch (err) {
      alert('Error batch saving: ' + err.message);
    } finally {
      isSavingBatch = false;
    }
  }
</script>

<div class="batch-page" style="animation: fadeIn 0.4s ease">
  <!-- Header -->
  <div class="page-head">
    <div class="head-left">
      <a href="/admin/diets" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Protocols
      </a>
      <div class="title-wrap">
        <h1>Batch Meal & Recipe Creator</h1>
        <p>Enter multiple recipes in a tabular, high-density spreadsheet layout to expand the global library instantly.</p>
      </div>
    </div>
  </div>

  <!-- Spreadsheet Card -->
  <div class="batch-container card">
    <div class="batch-table-wrapper">
      <table class="batch-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Meal/Recipe Name *</th>
            <th style="width: 150px;">Category</th>
            <th style="width: 110px;">Calories (kcal)</th>
            <th style="width: 95px;">Protein (g)</th>
            <th style="width: 95px;">Carbs (g)</th>
            <th style="width: 95px;">Fats (g)</th>
            <th>Ingredients / Description</th>
            <th style="width: 60px; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each batchRows as row, i}
            <tr class="batch-row">
              <td class="row-num">{i + 1}</td>
              <td>
                <input type="text" class="table-input name-input" placeholder="e.g. Avocado Toast with Egg" bind:value={row.name} required />
              </td>
              <td>
                <select class="table-input" bind:value={row.category}>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="High-Protein">High-Protein</option>
                  <option value="Keto">Keto</option>
                  <option value="General">General</option>
                </select>
              </td>
              <td>
                <input type="number" class="table-input text-right" placeholder="0" min="0" bind:value={row.calories} />
              </td>
              <td>
                <input type="number" class="table-input text-right" placeholder="0" min="0" bind:value={row.protein_g} />
              </td>
              <td>
                <input type="number" class="table-input text-right" placeholder="0" min="0" bind:value={row.carbs_g} />
              </td>
              <td>
                <input type="number" class="table-input text-right" placeholder="0" min="0" bind:value={row.fats_g} />
              </td>
              <td>
                <input type="text" class="table-input" placeholder="Ingredients, portion details, instructions..." bind:value={row.description} />
              </td>
              <td style="text-align: center;">
                <button type="button" class="btn-remove-row" onclick={() => removeBatchRow(i)} title="Remove row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Controls -->
    <div class="batch-controls">
      <button type="button" class="btn-add-row animate-hover" onclick={addBatchRow}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add New Row
      </button>
      <span class="count-hint">{batchRows.filter(r => r.name.trim() !== '').length} recipe(s) configured successfully</span>
    </div>

    <!-- Actions Footer -->
    <div class="batch-footer">
      <div class="footer-left">
        <button type="button" class="btn text danger" onclick={clearBatchRows}>Clear All Rows</button>
      </div>
      <div class="footer-right">
        <button type="button" class="btn btn-outline" onclick={() => history.back()}>Cancel</button>
        <button type="button" class="btn btn-primary shadow" onclick={submitBatchRecipes} disabled={isSavingBatch || batchRows.filter(r => r.name.trim() !== '').length === 0}>
          {#if isSavingBatch}
            <div class="spinner"></div> Creating Recipes...
          {:else}
            Save All Recipes ({batchRows.filter(r => r.name.trim() !== '').length})
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .batch-page {
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 3rem;
  }

  .page-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2.5rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.8125rem;
    margin-bottom: 1rem;
    transition: color 0.2s;
  }
  .back-link:hover {
    color: var(--primary-accent);
  }

  .title-wrap h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.25rem;
  }
  .title-wrap p {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .card {
    background: white;
    border-radius: 24px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .batch-container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
  }

  .batch-table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--border-light);
    border-radius: 16px;
    background: var(--bg);
  }

  .batch-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1100px;
  }

  .batch-table th {
    background: #f8fafc;
    padding: 1rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-light);
    text-align: left;
  }

  .batch-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
  }

  .batch-row {
    transition: background-color 0.15s ease;
  }
  .batch-row:hover {
    background: white;
  }

  .row-num {
    text-align: center;
    font-weight: 800;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .table-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    outline: none;
    transition: all 0.2s ease-in-out;
  }
  .table-input:focus {
    border-color: var(--primary-accent);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.06);
  }
  .table-input.text-right {
    text-align: right;
  }

  .btn-remove-row {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .btn-remove-row:hover {
    background: #fef2f2;
    color: #ef4444;
  }

  .batch-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn-add-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    border: 1.5px dashed var(--border);
    background: var(--bg);
    color: var(--primary-accent);
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-add-row:hover {
    background: var(--primary-accent-light);
    border-color: var(--primary-accent);
  }

  .count-hint {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-muted);
  }

  .batch-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-light);
    padding-top: 1.5rem;
    margin-top: 0.5rem;
  }

  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.875rem 1.75rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-primary {
    background: var(--primary-accent);
    color: white;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--primary-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-outline {
    background: white;
    border: 1.5px solid var(--border);
    color: var(--text-secondary);
  }
  .btn-outline:hover {
    background: var(--bg);
  }

  .btn.text {
    background: transparent;
    padding-left: 0;
    padding-right: 0;
  }
  .btn.text.danger {
    color: #ef4444;
  }
  .btn.text.danger:hover {
    text-decoration: underline;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
    display: inline-block;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
