<!-- DEPRECATED: Replaced by meal-library/import -->
<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  
  let loading = $state(false);
  let recipe = $state({
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    calories: '',
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
    time_mins: 15,
    category: 'Breakfast',
    image_url: ''
  });

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks', 
    'Post-Workout', 'Anti-inflammatory', 'High Protein'
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true;
    try {
      const payload = {
        ...recipe,
        calories: parseInt(recipe.calories),
        protein_g: parseInt(recipe.protein_g),
        carbs_g: parseInt(recipe.carbs_g),
        fats_g: parseInt(recipe.fats_g),
        time_mins: parseInt(recipe.time_mins)
      };

      const { error } = await supabase
        .from('recipes')
        .insert([payload]);
      
      if (error) throw error;
      
      // Go back to the dietary library
      goto('/admin/diets');
    } catch (err) {
      alert('Error saving recipe: ' + err.message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="page" style="animation: fadeIn 0.4s ease">
  <div class="page-head">
    <div class="head-left">
      <a href="/admin/diets" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Library
      </a>
      <h1>Add New Recipe</h1>
      <p>Contribute a clinical recipe to the global nutrition database.</p>
    </div>
  </div>

  <div class="form-grid">
    <div class="main-form card">
      <form onsubmit={handleSubmit} id="recipe-form">
        <div class="form-section">
          <h3>General Information</h3>
          <div class="group">
            <label>Recipe Title</label>
            <input type="text" bind:value={recipe.name} placeholder="e.g. Quinoa & Roasted Veggie Bowl" required />
          </div>
          <div class="group">
            <label>Short Description</label>
            <textarea bind:value={recipe.description} rows="2" placeholder="Describe the health benefits and flavor profile..."></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Preparation</h3>
          <div class="group">
            <label>Ingredients (one per line)</label>
            <textarea bind:value={recipe.ingredients} rows="6" placeholder="1 cup Quinoa&#10;2 cups Water&#10;1 Bell Pepper..."></textarea>
          </div>
          <div class="group">
            <label>Instructions</label>
            <textarea bind:value={recipe.instructions} rows="6" placeholder="1. Rinse quinoa under cold water..."></textarea>
          </div>
        </div>
      </form>
    </div>

    <div class="side-panel">
      <div class="card panel-card">
        <h3>Nutrition & Stats</h3>
        
        <div class="group">
          <label>Category</label>
          <select bind:value={recipe.category}>
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>

        <div class="group">
          <label>Prep Time (mins)</label>
          <input type="number" bind:value={recipe.time_mins} />
        </div>

        <div class="group">
          <label>Calories (kcal)</label>
          <input type="number" bind:value={recipe.calories} placeholder="450" required />
        </div>

        <div class="macros-grid">
          <div class="m-box">
            <label>Protein</label>
            <input type="number" bind:value={recipe.protein_g} />
            <span class="unit">grams</span>
          </div>
          <div class="m-box">
            <label>Carbs</label>
            <input type="number" bind:value={recipe.carbs_g} />
            <span class="unit">grams</span>
          </div>
          <div class="m-box">
            <label>Fats</label>
            <input type="number" bind:value={recipe.fats_g} />
            <span class="unit">grams</span>
          </div>
        </div>
      </div>

      <div class="card panel-card">
        <h3>Media</h3>
        <div class="group">
          <label>Image URL</label>
          <input type="text" bind:value={recipe.image_url} placeholder="https://images.unsplash.com/..." />
        </div>
        {#if recipe.image_url}
          <div class="img-preview">
            <img src={recipe.image_url} alt="Preview" />
          </div>
        {/if}
      </div>

      <div class="sticky-footer">
        <button type="button" class="btn-outline" onclick={() => history.back()}>Discard</button>
        <button type="submit" form="recipe-form" class="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Publish Recipe'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .page { max-width: 1100px; margin: 0 auto; }
  
  .page-head { margin-bottom: 2.5rem; }
  .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 700; font-size: 0.8125rem; margin-bottom: 1rem; }
  .back-link:hover { color: var(--primary-accent); }
  
  h1 { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  p { color: var(--text-muted); font-size: 0.875rem; }

  .form-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: flex-start; }
  
  .card { background: white; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
  
  .main-form { padding: 2.5rem; }
  .form-section { margin-bottom: 3rem; }
  .form-section h3 { font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light); }
  
  .group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
  label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  
  input, textarea, select {
    padding: 0.875rem 1.125rem; border-radius: 14px;
    border: 1.5px solid var(--border); background: var(--bg);
    font-size: 0.9375rem; font-weight: 600; color: var(--text);
    outline: none; transition: all 0.2s;
  }
  input:focus, textarea:focus, select:focus { border-color: var(--primary-accent); background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08); }

  .side-panel { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 2rem; }
  .panel-card { padding: 1.5rem; }
  .panel-card h3 { font-size: 0.875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.25rem; color: var(--text-secondary); }

  .macros-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  .m-box { background: var(--bg); padding: 0.75rem; border-radius: 12px; border: 1px solid var(--border-light); text-align: center; }
  .m-box label { font-size: 0.625rem; margin-bottom: 0.25rem; display: block; }
  .m-box input { padding: 0.25rem; border: none; background: none; width: 100%; text-align: center; font-size: 1rem; font-weight: 800; color: var(--primary-accent); }
  .m-box .unit { font-size: 0.625rem; color: var(--text-muted); font-weight: 600; }

  .img-preview { margin-top: 1rem; border-radius: 12px; overflow: hidden; height: 160px; border: 1px solid var(--border); }
  .img-preview img { width: 100%; height: 100%; object-fit: cover; }

  .sticky-footer { display: flex; gap: 0.75rem; margin-top: 1rem; }
  .btn-primary { flex: 1; background: var(--primary-accent); color: white; border: none; padding: 1rem; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: var(--primary-accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
  .btn-outline { padding: 1rem 1.5rem; background: white; border: 1.5px solid var(--border); color: var(--text-secondary); border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
</style>
