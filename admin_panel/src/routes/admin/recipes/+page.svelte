<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  import { fade, slide, scale } from 'svelte/transition';
  
  let { data } = $props();
  let recipes = $derived(data.recipes || []);
  let searchQuery = $state('');
  
  let filteredRecipes = $derived(
    recipes.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  async function deleteRecipe(id) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) alert('Error deleting recipe: ' + error.message);
    else await invalidateAll();
  }
</script>

<div class="recipes-page">
  <div class="page-header">
    <div class="title-area">
      <h1>Recipe Library</h1>
      <p>Manage clinical nutrition and therapeutic meal options.</p>
    </div>
    <div class="header-actions">
      <div class="search-wrapper glass">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search recipes..." bind:value={searchQuery} />
      </div>
      <a href="/admin/recipes/new" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Recipe
      </a>
    </div>
  </div>

  <div class="recipes-grid">
    {#each filteredRecipes as recipe (recipe.id)}
      <div class="recipe-card card" in:fade>
        <div class="recipe-image">
          {#if recipe.image_url}
            <img src={recipe.image_url} alt={recipe.name} />
          {:else}
            <div class="image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
          {/if}
          <div class="category-badge">{recipe.category || 'General'}</div>
        </div>
        
        <div class="recipe-content">
          <div class="recipe-main-info">
            <h3>{recipe.name}</h3>
            <p class="description">{recipe.description || 'No description provided.'}</p>
          </div>
          
          <div class="recipe-stats">
            <div class="stat">
              <span class="label">Calories</span>
              <span class="value">{recipe.calories} <small>kcal</small></span>
            </div>
            <div class="stat">
              <span class="label">Time</span>
              <span class="value">{recipe.time_mins} <small>min</small></span>
            </div>
          </div>

          <div class="macros-row">
            <div class="macro-dot protein"><span>P</span> {recipe.protein_g}g</div>
            <div class="macro-dot carbs"><span>C</span> {recipe.carbs_g}g</div>
            <div class="macro-dot fats"><span>F</span> {recipe.fats_g}g</div>
          </div>

          <div class="card-footer">
            <a href="/admin/recipes/{recipe.id}/edit" class="action-btn edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit
            </a>
            <button class="action-btn delete" onclick={() => deleteRecipe(recipe.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .recipes-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.3s ease;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 0.25rem;
  }

  .page-header p { color: var(--text-muted); font-size: 0.875rem; }

  .btn-primary {
    display: flex; align-items: center; gap: 0.625rem;
    padding: 0.625rem 1.25rem; border-radius: 12px;
    background: var(--primary-accent); color: white;
    font-weight: 700; font-size: 0.875rem; border: none; cursor: pointer;
    text-decoration: none; transition: all 0.2s;
  }
  .btn-primary:hover { background: var(--primary-accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1.5px solid var(--border);
    width: 280px;
    transition: all 0.2s;
  }
  .search-wrapper:focus-within {
    border-color: var(--primary-accent);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .search-wrapper input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.8125rem;
    color: var(--text);
  }

  .search-wrapper svg {
    color: var(--text-muted);
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }

  .recipe-card {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .recipe-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  .recipe-image {
    height: 200px;
    position: relative;
    background: #f1f5f9;
  }

  .recipe-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .category-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    padding: 0.35rem 0.75rem;
    border-radius: 2rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .recipe-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    flex: 1;
  }

  .recipe-main-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text);
  }

  .description {
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recipe-stats {
    display: flex;
    gap: 1.5rem;
    padding: 0.75rem 0;
    border-top: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--text-muted);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .stat .value {
    font-weight: 700;
    color: var(--text);
    font-size: 1rem;
  }

  .stat .value small {
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .macros-row {
    display: flex;
    gap: 0.75rem;
  }

  .macro-dot {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.25rem 0.6rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .macro-dot span {
    font-weight: 800;
  }

  .macro-dot.protein { background: rgba(16, 185, 129, 0.1); color: #10b981; }
  .macro-dot.carbs { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  .macro-dot.fats { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

  .card-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border-light);
    background: transparent;
  }

  .action-btn.edit {
    color: var(--primary);
  }

  .action-btn.edit:hover {
    background: rgba(0, 64, 161, 0.05);
    border-color: var(--primary);
  }

  .action-btn.delete {
    color: var(--danger);
  }

  .action-btn.delete:hover {
    background: rgba(239, 68, 68, 0.05);
    border-color: var(--danger);
  }


</style>
