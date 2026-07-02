<!-- DEPRECATED: Replaced by diet-schedule/import -->
<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  
  let { data } = $props();
  let plan = $derived(data.plan);
  let recipes = $derived(data.recipes);

  let loading = $state(false);
  let mode = $state('library'); // 'library' or 'custom'
  let searchQuery = $state('');

  // Meal Entry State
  let entry = $state({
    meal_category: 'Breakfast',
    meal_time: '08:00 AM',
    recipe_id: null,
    meal_name: '',
    description: '',
    calories: '',
    quantity: 1.0,
    comments: ''
  });

  // Recipe Creation State (for custom meal)
  let customRecipe = $state({
    name: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
    description: ''
  });

  const categoryTimes = {
    'Early Morning': '06:00 AM',
    'Breakfast': '08:00 AM',
    'Mid Morning': '10:30 AM',
    'Lunch': '01:30 PM',
    'Evening': '05:00 PM',
    'Dinner': '08:00 PM',
    'Post Dinner': '09:30 PM'
  };

  const categories = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];

  // Filter recipes based on search
  let filteredRecipes = $derived(
    searchQuery.trim() === ''
      ? recipes
      : recipes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function handleCategoryChange(cat) {
    entry.meal_category = cat;
    if (categoryTimes[cat]) {
      entry.meal_time = categoryTimes[cat];
    }
  }

  function selectRecipeFromLibrary(recipe) {
    entry.recipe_id = recipe.id;
    entry.meal_name = recipe.name;
    entry.description = recipe.description || '';
    entry.calories = recipe.calories;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true;
    try {
      let finalRecipeId = entry.recipe_id;

      // If creating a custom meal, insert into public.recipes first
      if (mode === 'custom') {
        const { data: newRecipe, error: recipeErr } = await supabase
          .from('recipes')
          .insert([{
            name: customRecipe.name,
            calories: parseInt(customRecipe.calories) || 0,
            protein_g: parseInt(customRecipe.protein_g) || 0,
            carbs_g: parseInt(customRecipe.carbs_g) || 0,
            fats_g: parseInt(customRecipe.fats_g) || 0,
            description: customRecipe.description,
            category: entry.meal_category
          }])
          .select()
          .single();

        if (recipeErr) throw recipeErr;
        finalRecipeId = newRecipe.id;
        entry.meal_name = newRecipe.name;
        entry.calories = newRecipe.calories;
        entry.description = newRecipe.description;
      }

      if (!finalRecipeId && mode === 'library') {
        alert('Please select a meal from the library first.');
        loading = false;
        return;
      }

      // Insert into diet_plan_schedule (pool)
      const { error } = await supabase
        .from('diet_plan_schedule')
        .insert([{
          plan_id: plan.id,
          meal_category: entry.meal_category,
          meal_time: entry.meal_time,
          recipe_id: finalRecipeId,
          meal_name: entry.meal_name,
          description: entry.description,
          calories: parseInt(entry.calories) || 0,
          quantity: parseFloat(entry.quantity) || 1.0,
          comments: entry.comments,
          day_of_week: null, // Nullable now
          week_number: null  // Nullable now
        }]);
      
      if (error) throw error;
      
      goto(`/admin/diets/${plan.id}`);
    } catch (err) {
      alert('Error scheduling meal: ' + err.message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="page" style="animation: fadeIn 0.4s ease">
  <div class="page-head">
    <div class="head-left">
      <a href="/admin/diets/{plan?.id}" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Plan
      </a>
      <h1>Add Meal to Pool</h1>
      <p>Adding dynamic pool meal to <strong>{plan?.name}</strong></p>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs-wrap">
    <button class="tab-btn" class:active={mode === 'library'} onclick={() => mode = 'library'}>
      Search Library
    </button>
    <button class="tab-btn" class:active={mode === 'custom'} onclick={() => mode = 'custom'}>
      Create Custom Meal
    </button>
  </div>

  <div class="creation-grid">
    <div class="main-card card">
      <form onsubmit={handleSubmit} id="meal-form">
        
        <div class="form-section">
          <h3>1. Timing & Category</h3>
          <div class="row">
            <div class="group">
              <label>Meal Category</label>
              <select bind:value={entry.meal_category} onchange={(e) => handleCategoryChange(e.target.value)}>
                {#each categories as cat}
                  <option value={cat}>{cat}</option>
                {/each}
              </select>
            </div>
            <div class="group">
              <label>Estimated Time</label>
              <input type="text" bind:value={entry.meal_time} placeholder="e.g. 08:30 AM" required />
            </div>
          </div>
        </div>

        {#if mode === 'library'}
          <div class="form-section">
            <h3>2. Select from Meal Library</h3>
            <div class="group">
              <label>Search Library</label>
              <input type="text" bind:value={searchQuery} placeholder="Search by meal name..." class="search-input" />
            </div>
            
            <div class="recipe-list">
              {#each filteredRecipes as recipe}
                <button 
                  type="button" 
                  class="recipe-card-option" 
                  class:selected={entry.recipe_id === recipe.id}
                  onclick={() => selectRecipeFromLibrary(recipe)}
                >
                  <div class="r-details">
                    <span class="r-name">{recipe.name}</span>
                    <span class="r-meta">{recipe.calories} kcal • P: {recipe.protein_g || 0}g • C: {recipe.carbs_g || 0}g • F: {recipe.fats_g || 0}g</span>
                  </div>
                  {#if entry.recipe_id === recipe.id}
                    <span class="check">✓</span>
                  {/if}
                </button>
              {:else}
                <div class="empty-list">No meals found matching your search.</div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="form-section">
            <h3>2. Create a Brand New Meal (Stores Globally)</h3>
            <div class="group">
              <label>Meal Name</label>
              <input type="text" bind:value={customRecipe.name} placeholder="e.g. Avocado Toast with Egg" required />
            </div>
            <div class="group">
              <label>Description / Ingredients</label>
              <textarea bind:value={customRecipe.description} placeholder="Describe the meal ingredients..." rows="3"></textarea>
            </div>
            <div class="row">
              <div class="group">
                <label>Calories (kcal)</label>
                <input type="number" bind:value={customRecipe.calories} placeholder="e.g. 400" required />
              </div>
              <div class="group">
                <label>Protein (g)</label>
                <input type="number" bind:value={customRecipe.protein_g} placeholder="e.g. 15" />
              </div>
            </div>
            <div class="row">
              <div class="group">
                <label>Carbs (g)</label>
                <input type="number" bind:value={customRecipe.carbs_g} placeholder="e.g. 30" />
              </div>
              <div class="group">
                <label>Fats (g)</label>
                <input type="number" bind:value={customRecipe.fats_g} placeholder="e.g. 12" />
              </div>
            </div>
          </div>
        {/if}

        <div class="form-section">
          <h3>3. Meal Options</h3>
          <div class="row">
            <div class="group">
              <label>Portion / Quantity (Multiplier)</label>
              <input type="number" step="0.05" min="0.05" bind:value={entry.quantity} placeholder="e.g. 1.0" required />
            </div>
            <div class="group">
              <label>Comments / Notes (Optional)</label>
              <input type="text" bind:value={entry.comments} placeholder="e.g. Drink water after 30 mins" />
            </div>
          </div>
        </div>

      </form>
    </div>

    <div class="side-panel">
      <div class="preview-card card">
        <div class="p-content">
          <span class="p-cat">Meal Preview</span>
          <h3>
            {#if mode === 'library'}
              {entry.meal_name || 'Select a Meal'}
            {:else}
              {customRecipe.name || 'Enter Meal Name'}
            {/if}
          </h3>
          <div class="p-stats">
            <div class="s-item">
              <span class="s-val">
                {#if mode === 'library'}
                  {Math.round((entry.calories || 0) * (entry.quantity || 1))}
                {:else}
                  {Math.round((customRecipe.calories || 0) * (entry.quantity || 1))}
                {/if}
              </span>
              <span class="s-lbl">total kcal</span>
            </div>
            {#if entry.quantity && Number(entry.quantity) !== 1}
              <div class="s-item">
                <span class="s-val">x{entry.quantity}</span>
                <span class="s-lbl">portions</span>
              </div>
            {/if}
          </div>
          <div class="p-desc" style="margin-top: 1rem; font-size: 0.8125rem; color: var(--text-muted);">
            {#if mode === 'library'}
              {entry.description || 'No description provided.'}
            {:else}
              {customRecipe.description || 'No description provided.'}
            {/if}
          </div>
        </div>
      </div>

      <div class="action-wrap">
        <button type="submit" form="meal-form" class="btn-primary" disabled={loading || (mode === 'library' && !entry.recipe_id) || (mode === 'custom' && !customRecipe.name)}>
          {loading ? 'Adding...' : 'Add to Plan Pool'}
        </button>
        <button type="button" class="btn-outline" onclick={() => history.back()}>Cancel</button>
      </div>
    </div>
  </div>
</div>

<style>
  .page { max-width: 1000px; margin: 0 auto; }
  .page-head { margin-bottom: 1.5rem; }
  .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 700; font-size: 0.8125rem; margin-bottom: 1rem; }
  .back-link:hover { color: var(--primary-accent); }
  h1 { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  p { color: var(--text-muted); font-size: 0.875rem; }
  p strong { color: var(--text); }

  .tabs-wrap { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: var(--bg); padding: 0.25rem; border-radius: 12px; border: 1px solid var(--border); width: fit-content; }
  .tab-btn { padding: 0.625rem 1.25rem; border-radius: 9px; border: none; background: none; font-size: 0.875rem; font-weight: 700; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .tab-btn.active { background: white; color: var(--primary-accent); box-shadow: var(--shadow-sm); }

  .creation-grid { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; align-items: flex-start; }
  .card { background: white; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); overflow: hidden; }
  .main-card { padding: 2.5rem; }
  .form-section { margin-bottom: 2.5rem; }
  .form-section h3 { font-size: 1rem; font-weight: 800; color: var(--text); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light); }
  
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
  label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  
  input, select, textarea {
    padding: 0.875rem 1.125rem; border-radius: 14px;
    border: 1.5px solid var(--border); background: var(--bg);
    font-size: 0.9375rem; font-weight: 600; color: var(--text);
    outline: none; transition: all 0.2s;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--primary-accent); background: white; }
  
  .search-input { margin-bottom: 1rem; }
  .recipe-list { max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 0.5rem; }
  
  .recipe-card-option {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem; border-radius: 12px; border: 1.5px solid var(--border);
    background: var(--surface); cursor: pointer; text-align: left; transition: all 0.2s;
  }
  .recipe-card-option:hover { border-color: var(--primary-accent); background: var(--bg); }
  .recipe-card-option.selected { border-color: var(--primary-accent); background: var(--primary-accent-light); }
  .r-details { display: flex; flex-direction: column; gap: 0.25rem; }
  .r-name { font-weight: 700; font-size: 0.875rem; color: var(--text); }
  .r-meta { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
  .check { color: var(--primary-accent); font-weight: 900; }

  .empty-list { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.875rem; font-style: italic; }

  .side-panel { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 2rem; }
  .p-content { padding: 1.5rem; }
  .p-cat { font-size: 0.625rem; font-weight: 800; background: #EFF6FF; color: #3B82F6; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-bottom: 0.5rem; display: inline-block; }
  .p-content h3 { font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 1rem; }
  
  .p-stats { display: flex; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 1rem; }
  .s-item { text-align: center; }
  .s-val { display: block; font-size: 1rem; font-weight: 800; color: var(--text); }
  .s-lbl { font-size: 0.625rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

  .action-wrap { display: flex; flex-direction: column; gap: 0.75rem; }
  .btn-primary { width: 100%; background: var(--primary-accent); color: white; border: none; padding: 1rem; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover:not(:disabled) { background: var(--primary-accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { width: 100%; background: white; border: 1.5px solid var(--border); color: var(--text-secondary); padding: 1rem; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
</style>
