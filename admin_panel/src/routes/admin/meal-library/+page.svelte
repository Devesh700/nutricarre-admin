<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';

  let meals = $state([]);
  let loading = $state(true);
  let search = $state('');

  let filtered = $derived(
    search ? meals.filter(m => m.meal_code.toLowerCase().includes(search.toLowerCase()) || m.meal_name.toLowerCase().includes(search.toLowerCase())) : meals
  );

  onMount(async () => {
    const { data } = await supabase.from('meal_library').select('*').order('meal_code');
    meals = data || [];
    loading = false;
  });
</script>

<div class="page">
  <div class="page-head">
    <div class="title-area">
      <h1>Meal Library</h1>
      <p>Reusable meal catalog for diet templates.</p>
    </div>
    <div class="head-actions">
      <a href="/admin/meal-library/import" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Import Excel
      </a>
    </div>
  </div>

  <div class="search-bar">
    <input type="text" placeholder="Search meals by code or name..." bind:value={search} />
  </div>

  {#if loading}
    <div class="loading">Loading meal library...</div>
  {:else if filtered.length === 0}
    <div class="empty"><p>No meals found.</p></div>
  {:else}
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Food Type</th>
            <th>Calories</th>
            <th>P</th>
            <th>C</th>
            <th>F</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as m}
            <tr>
              <td><code>{m.meal_code}</code></td>
              <td><strong>{m.meal_name}</strong></td>
              <td>{m.meal_type}</td>
              <td>{m.food_type}</td>
              <td>{m.calories}</td>
              <td>{m.protein}g</td>
              <td>{m.carbs}g</td>
              <td>{m.fat}g</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .page { animation: fadeIn 0.3s ease; }
  .page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .title-area h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  .title-area p { color: var(--text-muted); font-size: 0.875rem; }
  .head-actions { display: flex; gap: 0.75rem; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
  .search-bar { margin-bottom: 1rem; }
  .search-bar input { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border); font-size: 0.875rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.75rem 1rem; background: var(--bg); font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
  td { padding: 0.75rem 1rem; font-size: 0.8125rem; border-bottom: 1px solid var(--border-light); }
  .loading, .empty { text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
