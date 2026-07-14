<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let templates = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const { data } = await supabase.from('diet_templates').select('*').order('diet_code');
    templates = data || [];
    loading = false;
  });

  async function deleteTemplate(id) {
    if (!confirm('Delete this diet template?')) return;
    const { error } = await supabase.from('diet_templates').delete().eq('id', id);
    if (error) alert(error.message);
    else templates = templates.filter(t => t.id !== id);
  }
</script>

<div class="page">
  <div class="page-head">
    <div class="title-area">
      <h1>Diet Templates</h1>
      <p>Master reusable diet plans.</p>
    </div>
    <div class="head-actions">
      <a href="/admin/diet-templates/import" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Import Excel
      </a>
    </div>
  </div>

  {#if loading}
    <div class="loading">Loading templates...</div>
  {:else if templates.length === 0}
    <div class="empty">
      <p>No diet templates found. <a href="/admin/diet-templates/import">Import templates</a> to get started.</p>
    </div>
  {:else}
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Target</th>
            <th>Food Type</th>
            <th>Calories</th>
            <th>Weeks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each templates as t}
            <tr>
              <td><a href="/admin/diet-templates/{t.id}" class="template-link"><code>{t.diet_code}</code></a></td>
              <td><a href="/admin/diet-templates/{t.id}" class="template-link"><strong>{t.diet_name}</strong></a></td>
              <td><span class="badge">{t.target}</span></td>
              <td>{t.food_type}</td>
              <td>{t.calories_min} - {t.calories_max}</td>
              <td>{t.total_weeks}</td>
              <td>
                <button class="btn-danger-sm" onclick={() => deleteTemplate(t.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .page { animation: fadeIn 0.3s ease; }
  .page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .title-area h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  .title-area p { color: var(--text-muted); font-size: 0.875rem; }
  .head-actions { display: flex; gap: 0.75rem; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.875rem 1.25rem; background: var(--bg); font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
  td { padding: 0.875rem 1.25rem; font-size: 0.8125rem; border-bottom: 1px solid var(--border-light); }
  .badge { font-size: 0.6875rem; font-weight: 700; background: var(--bg); padding: 2px 8px; border-radius: 4px; }
  .btn-danger-sm { background: none; border: 1px solid var(--border); padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; color: #EF4444; }
  .btn-danger-sm:hover { background: #FEF2F2; }
  .template-link { color: var(--primary-accent); text-decoration: none; }
  .template-link:hover { text-decoration: underline; color: var(--primary-accent-hover); }
  .loading, .empty { text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
