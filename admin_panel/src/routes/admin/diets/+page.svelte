<!-- DEPRECATED: Replaced by diet-templates/ and meal-library/ + diet-schedule/ -->
<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  let { data } = $props();
  
  let activeTab = $state('plans');
  let viewMode = $state('grid'); // 'grid' or 'list'
  let diets = $derived(data.diets || []);
  let recipes = $derived(data.recipes || []);
  
  let searchQuery = $state('');
  let selectedCategory = $state('All');

  let filteredDiets = $derived(
    diets.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.subtitle && d.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  let filteredRecipes = $derived(
    recipes.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  );

  let recipeCategories = $derived(['All', ...new Set(recipes.map(r => r.category).filter(Boolean))]);

  async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    const { error } = await supabase.from('diet_plans').delete().eq('id', id);
    if (error) alert(error.message);
    else await invalidateAll();
  }
</script>

<div class="diets-page">
  <!-- Header -->
  <div class="page-head">
    <div class="title-area">
      <h1>Dietary Protocols</h1>
      <p>Configure therapeutic meal plans and nutritional recipes.</p>
    </div>
    <div class="head-actions">
      <div style="display: flex; gap: 0.75rem;">
        <a href="/admin/diets/batch-create" class="btn-outline btn-batch" style="display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; transition: all 0.2s;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
          Batch Create Meals
        </a>
        {#if activeTab === 'plans'}
          <a href="/admin/diets/new-plan" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Plan
          </a>
        {:else}
          <a href="/admin/diets/new-recipe" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Recipe
          </a>
        {/if}
      </div>
    </div>
  </div>

  <!-- Content Navigation -->
  <div class="toolbar-row">
    <div class="tab-switcher">
      <button class="tab-btn" class:active={activeTab === 'plans'} onclick={() => { activeTab = 'plans'; searchQuery = ''; }}>
        Plans <span class="count">{diets.length}</span>
      </button>
      <button class="tab-btn" class:active={activeTab === 'recipes'} onclick={() => { activeTab = 'recipes'; searchQuery = ''; }}>
        Recipes <span class="count">{recipes.length}</span>
      </button>
    </div>

    <div class="filters">
      <div class="view-toggle">
        <button class="v-btn" class:active={viewMode === 'grid'} onclick={() => viewMode = 'grid'} title="Grid View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button class="v-btn" class:active={viewMode === 'list'} onclick={() => viewMode = 'list'} title="List View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>

      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder={activeTab === 'plans' ? 'Find a plan...' : 'Find a recipe...'} bind:value={searchQuery} />
      </div>
      {#if activeTab === 'recipes'}
        <select class="category-select" bind:value={selectedCategory}>
          {#each recipeCategories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      {/if}
    </div>
  </div>

  <!-- Plans View -->
  {#if activeTab === 'plans'}
    {#if viewMode === 'grid'}
      <div class="plans-grid">
        {#each filteredDiets as diet}
          <div class="plan-card">
            <div class="p-header">
              <div class="p-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div class="p-badges" style="display: flex; gap: 0.5rem; align-items: center;">
                {#if diet.is_template}
                  <span class="template-pill" style="font-size: 0.6875rem; font-weight: 800; color: #8B5CF6; background: #F5F3FF; padding: 4px 10px; border-radius: 99px; border: 1px solid #DDD6FE;">Template</span>
                {/if}
                <span class="kcal-pill">{diet.target_calories} kcal</span>
              </div>
            </div>
            
            <div class="p-info">
              <h3>{diet.name}</h3>
              <p>{diet.subtitle || 'Custom nutritional protocol'}</p>
            </div>

            <div class="p-macros">
              <div class="macro-stats">
                <div class="m-item">
                  <span class="m-val">{diet.protein_target_pct}%</span>
                  <span class="m-lbl">Protein</span>
                </div>
                <div class="m-item">
                  <span class="m-val">{diet.carbs_target_pct}%</span>
                  <span class="m-lbl">Carbs</span>
                </div>
                <div class="m-item">
                  <span class="m-val">{diet.fats_target_pct}%</span>
                  <span class="m-lbl">Fats</span>
                </div>
              </div>
              <div class="macro-bar">
                <div class="bar-seg p" style="width: {diet.protein_target_pct}%"></div>
                <div class="bar-seg c" style="width: {diet.carbs_target_pct}%"></div>
                <div class="bar-seg f" style="width: {diet.fats_target_pct}%"></div>
              </div>
            </div>

            <div class="p-footer">
              <a href="/admin/diets/{diet.id}" class="btn-configure">
                Build Schedule
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
              <button class="btn-icon danger" onclick={() => deletePlan(diet.id)} title="Delete Plan">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        {:else}
          <div class="empty-state">
            <p>No diet plans match your search.</p>
          </div>
        {/each}
      </div>
    {:else}
      <!-- List Mode Plans -->
      <div class="list-mode card">
        <table>
          <thead>
            <tr>
              <th>Protocol Name</th>
              <th>Goal</th>
              <th>Calories</th>
              <th>Macros (P/C/F)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredDiets as diet}
              <tr>
                <td>
                  <strong>{diet.name}</strong>
                  {#if diet.is_template}
                    <span class="template-badge-inline" style="font-size: 0.625rem; font-weight: 800; color: #8B5CF6; background: #F5F3FF; padding: 2px 6px; border-radius: 4px; margin-left: 0.5rem; border: 1px solid #DDD6FE; display: inline-block; vertical-align: middle;">Template</span>
                  {/if}
                </td>
                <td><span class="text-muted">{diet.subtitle || 'General'}</span></td>
                <td><span class="kcal-pill">{diet.target_calories}</span></td>
                <td>
                  <div class="macro-mini">
                    <span class="p">{diet.protein_target_pct}%</span>
                    <span class="c">{diet.carbs_target_pct}%</span>
                    <span class="f">{diet.fats_target_pct}%</span>
                  </div>
                </td>
                <td>
                  <div class="list-actions">
                    <a href="/admin/diets/{diet.id}" class="btn-sm">Configure</a>
                    <button class="btn-icon-sm danger" onclick={() => deletePlan(diet.id)}>&times;</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  {:else}
    <!-- Recipes View -->
    {#if viewMode === 'grid'}
      <div class="recipes-grid">
        {#each filteredRecipes as recipe}
          <div class="recipe-card">
            <div class="r-img">
              {#if recipe.image_url}
                <img src={recipe.image_url} alt={recipe.name} />
              {:else}
                <div class="img-ph">🥗</div>
              {/if}
              <span class="r-cat">{recipe.category || 'Meal'}</span>
            </div>
            <div class="r-content">
              <h3>{recipe.name}</h3>
              <div class="r-stats">
                <span><strong>{recipe.calories}</strong> kcal</span>
                <span class="sep">|</span>
                <span><strong>{recipe.protein_g}g</strong> P</span>
              </div>
            </div>
          </div>
        {:else}
          <div class="empty-state">
            <p>No recipes found in this category.</p>
          </div>
        {/each}
      </div>
    {:else}
      <!-- List Mode Recipes -->
      <div class="list-mode card">
        <table>
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Category</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fats</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredRecipes as recipe}
              <tr>
                <td><strong>{recipe.name}</strong></td>
                <td><span class="badge-cat">{recipe.category || '—'}</span></td>
                <td>{recipe.calories} kcal</td>
                <td>{recipe.protein_g}g</td>
                <td>{recipe.carbs_g}g</td>
                <td>{recipe.fats_g}g</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .diets-page { animation: fadeIn 0.3s ease; }

  /* Header */
  .page-head {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 2.5rem;
  }
  .title-area h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  .title-area p { color: var(--text-muted); font-size: 0.875rem; }

  /* Toolbar */
  .toolbar-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 2rem;
  }
  .tab-switcher {
    display: flex; background: var(--surface); border: 1px solid var(--border);
    padding: 0.25rem; border-radius: 12px; gap: 0.25rem;
  }
  .tab-btn {
    padding: 0.5rem 1.25rem; border-radius: 9px; border: none;
    font-size: 0.8125rem; font-weight: 700; cursor: pointer;
    background: transparent; color: var(--text-muted); transition: all 0.2s;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .tab-btn.active { background: var(--bg); color: var(--primary-accent); }
  .tab-btn .count { font-size: 0.6875rem; background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 4px; }

  .filters { display: flex; gap: 0.75rem; }
  .search-box {
    display: flex; align-items: center; gap: 0.625rem;
    background: var(--surface); border: 1px solid var(--border);
    padding: 0.5rem 0.875rem; border-radius: 10px; width: 260px;
    color: var(--text-muted); transition: all 0.2s;
  }
  .search-box:focus-within { border-color: var(--primary-accent); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .search-box input { border: none; background: none; outline: none; flex: 1; font-size: 0.8125rem; color: var(--text); }
  .category-select { padding: 0.5rem 1rem; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }

  .view-toggle {
    display: flex; background: var(--surface); border: 1px solid var(--border);
    padding: 0.25rem; border-radius: 10px; gap: 0.125rem;
  }
  .v-btn {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    border: none; background: transparent; border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
  }
  .v-btn.active { background: white; color: var(--primary-accent); box-shadow: var(--shadow-sm); }

  /* List Mode */
  .list-mode { padding: 0 !important; overflow: hidden; }
  .list-mode table { width: 100%; border-collapse: collapse; }
  .list-mode th { text-align: left; padding: 0.875rem 1.25rem; background: var(--bg); font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-light); }
  .list-mode td { padding: 1rem 1.25rem; font-size: 0.8125rem; border-bottom: 1px solid var(--border-light); }
  
  .macro-mini { display: flex; gap: 0.5rem; }
  .macro-mini span { font-size: 0.6875rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; }
  .macro-mini .p { background: #EFF6FF; color: #3B82F6; }
  .macro-mini .c { background: #ECFDF5; color: #10B981; }
  .macro-mini .f { background: #F5F3FF; color: #8B5CF6; }

  .badge-cat { font-size: 0.6875rem; font-weight: 700; background: var(--bg); padding: 2px 8px; border-radius: 99px; }

  .list-actions { display: flex; align-items: center; gap: 0.75rem; }
  .btn-sm { font-size: 0.75rem; font-weight: 700; text-decoration: none; color: var(--primary-accent); }
  .btn-sm:hover { text-decoration: underline; }
  .btn-icon-sm { background: none; border: none; font-size: 1.125rem; color: var(--text-muted); cursor: pointer; }
  .btn-icon-sm.danger:hover { color: #EF4444; }

  /* Plans Grid */
  .plans-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;
  }
  .plan-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 1.5rem;
    box-shadow: var(--shadow-sm); transition: all 0.2s;
    display: flex; flex-direction: column; gap: 1.25rem;
  }
  .plan-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

  .p-header { display: flex; justify-content: space-between; align-items: center; }
  .p-icon { width: 36px; height: 36px; background: #EFF6FF; color: #3B82F6; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .kcal-pill { font-size: 0.6875rem; font-weight: 800; color: #10B981; background: #ECFDF5; padding: 4px 10px; border-radius: 99px; }

  .p-info h3 { font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  .p-info p { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }

  .p-macros { display: flex; flex-direction: column; gap: 0.75rem; }
  .macro-stats { display: flex; justify-content: space-between; }
  .m-item { display: flex; flex-direction: column; }
  .m-val { font-size: 0.875rem; font-weight: 800; color: var(--text); }
  .m-lbl { font-size: 0.625rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  
  .macro-bar { height: 6px; background: var(--bg); border-radius: 99px; overflow: hidden; display: flex; }
  .bar-seg { height: 100%; }
  .bar-seg.p { background: #3B82F6; }
  .bar-seg.c { background: #10B981; }
  .bar-seg.f { background: #8B5CF6; }

  .p-footer { display: flex; gap: 0.75rem; margin-top: auto; }
  .btn-configure {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    padding: 0.625rem; background: var(--bg); border: 1.5px solid var(--border-light);
    border-radius: 10px; font-size: 0.8125rem; font-weight: 700; color: var(--text);
    text-decoration: none; transition: all 0.2s;
  }
  .btn-configure:hover { border-color: var(--primary-accent); color: var(--primary-accent); background: white; }
  .btn-icon { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid var(--border-light); background: var(--surface); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .btn-icon.danger:hover { color: #EF4444; border-color: #FEE2E2; background: #FEF2F2; }

  /* Recipes Grid */
  .recipes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; }
  .recipe-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);
    transition: all 0.2s;
  }
  .recipe-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .r-img { height: 140px; background: var(--bg); position: relative; }
  .r-img img { width: 100%; height: 100%; object-fit: cover; }
  .img-ph { height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
  .r-cat { position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 6px; font-size: 0.625rem; font-weight: 800; color: var(--primary-accent); backdrop-filter: blur(4px); }
  .r-content { padding: 1rem; }
  .r-content h3 { font-size: 0.875rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
  .r-stats { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
  .r-stats strong { color: var(--text-secondary); }
  .sep { opacity: 0.3; }

  .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); font-size: 0.875rem; font-style: italic; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .modal { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 500px; box-shadow: var(--shadow-lg); animation: fadeIn 0.2s ease; }
  .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
  .modal-header h3 { font-size: 1rem; font-weight: 800; }
  .close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
  .modal-body { padding: 1.5rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
  .form-group.full { grid-column: span 2; }
  .form-group label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
  .form-group input, .form-group select { padding: 0.625rem 0.875rem; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg); font-size: 0.875rem; font-weight: 600; outline: none; }
  .form-group input:focus { border-color: var(--primary-accent); background: white; }
  .modal-footer { display: flex; gap: 0.75rem; margin-top: 1rem; }
  .modal-footer button { flex: 1; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

  .btn-primary { background: var(--primary-accent); color: white; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; }
  .btn-primary:hover { background: var(--primary-accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
  .btn-outline { background: var(--surface); color: var(--text); border: 1.5px solid var(--border); }

  /* Tabular Batch Creator Styles */
  .batch-modal {
    max-width: 1100px;
    width: 95%;
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }
  .batch-body {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .batch-table-container {
    overflow-x: auto;
    border: 1px solid var(--border-light);
    border-radius: 12px;
    background: var(--bg);
  }
  .batch-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }
  .batch-table th {
    background: #f1f5f9;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-light);
    text-align: left;
  }
  .batch-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
  }
  .batch-row:hover {
    background: white;
  }
  .row-num {
    text-align: center;
    font-weight: 800;
    color: var(--text-muted);
    font-size: 0.8125rem;
  }
  .table-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text);
    outline: none;
    transition: all 0.2s;
  }
  .table-input:focus {
    border-color: var(--primary-accent);
    background: white;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.05);
  }
  .table-input.text-right {
    text-align: right;
  }
  .btn-remove-row {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
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
    margin-top: 0.5rem;
  }
  .btn-add-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1.5px dashed var(--border);
    background: var(--bg);
    color: var(--primary-accent);
    font-weight: 700;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-add-row:hover {
    background: var(--primary-accent-light);
    border-color: var(--primary-accent);
  }
  .count-hint {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--text-muted);
  }
  .batch-footer {
    padding: 1.25rem 2rem;
    background: #f8fafc;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    align-items: center;
  }
  .btn-batch:hover {
    background: var(--bg);
    border-color: var(--primary-accent);
    color: var(--primary-accent);
  }
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
    display: inline-block;
    margin-right: 6px;
    vertical-align: middle;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
