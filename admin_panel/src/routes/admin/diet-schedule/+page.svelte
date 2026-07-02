<script>
  let { data } = $props();
  let schedule = $derived(data.schedule || []);
  let search = $state('');

  let filtered = $derived(
    search ? schedule.filter(s => s.diet_code.toLowerCase().includes(search.toLowerCase()) || s.meal_code?.toLowerCase().includes(search.toLowerCase())) : schedule
  );
</script>

<div class="page">
  <div class="page-head">
    <div class="title-area">
      <h1>Diet Schedule</h1>
      <p>Template meal schedules mapped by week, day, and meal type.</p>
    </div>
    <div class="head-actions">
      <a href="/admin/diet-schedule/import" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Import Excel
      </a>
    </div>
  </div>

  <div class="search-bar">
    <input type="text" placeholder="Search by diet code or meal code..." bind:value={search} />
  </div>

  {#if filtered.length === 0}
    <div class="empty"><p>No schedule data found. <a href="/admin/diet-schedule/import">Import a schedule</a>.</p></div>
  {:else}
    <div class="card">
      <table>
        <thead>
          <tr><th>Diet Code</th><th>Week</th><th>Day</th><th>Meal Type</th><th>Time</th><th>Meal Code</th></tr>
        </thead>
        <tbody>
          {#each filtered as s}
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
      <p class="total">{filtered.length} schedule rows</p>
    </div>
  {/if}
</div>

<style>
  .page { animation: fadeIn 0.3s ease; }
  .page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
  .title-area h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
  .title-area p { color: var(--text-muted); font-size: 0.875rem; }
  .head-actions { display: flex; gap: 0.75rem; }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
  .search-bar { margin-bottom: 1rem; }
  .search-bar input { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid var(--border); font-size: 0.875rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.75rem 1rem; background: var(--bg); font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
  td { padding: 0.75rem 1rem; font-size: 0.8125rem; border-bottom: 1px solid var(--border-light); }
  .total { padding: 0.75rem 1rem; font-size: 0.75rem; color: var(--text-muted); background: var(--bg); }
  .loading, .empty { text-align: center; padding: 3rem; color: var(--text-muted); }
</style>
