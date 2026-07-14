<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data } = $props();

  let template = $derived(data.template);
  let meals = $derived(data.meals);
  let mealLibrary = $derived(data.mealLibrary);
  let error = $derived(data.error);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  let currentWeek = $state(1);
  let loading = $state(false);

  // Modal State
  let showEditModal = $state(false);
  let showAddModal = $state(state => false);

  // Search State in Modal
  let mealSearchQuery = $state('');
  let showMealSearchResults = $state(false);
  let selectedMealInfo = $state(null);

  // Forms state
  let addForm = $state({
    day_no: 1,
    meal_type: 'meal_1',
    meal_time: '08:00',
    meal_code: ''
  });

  let editForm = $state({
    id: null,
    day_no: 1,
    meal_type: 'meal_1',
    meal_time: '08:00',
    meal_code: ''
  });

  // Filtered meals based on query
  let filteredMealsForSelect = $derived(
    mealSearchQuery
      ? mealLibrary.filter(
          m =>
            m.meal_code.toLowerCase().includes(mealSearchQuery.toLowerCase()) ||
            m.meal_name.toLowerCase().includes(mealSearchQuery.toLowerCase())
        )
      : mealLibrary
  );

  // Get meals for selected week and day
  function getMealsForDay(dayNo) {
    return meals
      .filter(m => m.week_no === currentWeek && m.day_no === dayNo)
      .sort((a, b) => a.meal_time.localeCompare(b.meal_time));
  }

  // Calculate day calories sum
  function getDayCalories(dayNo) {
    const dayMeals = meals.filter(m => m.week_no === currentWeek && m.day_no === dayNo);
    return dayMeals.reduce((sum, m) => sum + (m.meal_library?.calories || 0), 0);
  }

  // Calculate weekly totals
  let weeklyCaloriesSum = $derived(
    meals
      .filter(m => m.week_no === currentWeek)
      .reduce((sum, m) => sum + (m.meal_library?.calories || 0), 0)
  );

  let averageDailyCalories = $derived(Math.round(weeklyCaloriesSum / 7));

  // Modal operations
  function openAddModal(dayNo) {
    addForm = {
      day_no: dayNo,
      meal_type: 'meal_1',
      meal_time: '08:00',
      meal_code: ''
    };
    selectedMealInfo = null;
    mealSearchQuery = '';
    showMealSearchResults = false;
    showAddModal = true;
  }

  function openEditModal(meal) {
    editForm = {
      id: meal.id,
      day_no: meal.day_no,
      meal_type: meal.meal_type || 'meal_1',
      meal_time: meal.meal_time || '08:00',
      meal_code: meal.meal_code
    };
    selectedMealInfo = meal.meal_library || null;
    mealSearchQuery = meal.meal_library ? `${meal.meal_library.meal_code} - ${meal.meal_library.meal_name}` : '';
    showMealSearchResults = false;
    showEditModal = true;
  }

  function selectMealForAdd(meal) {
    addForm.meal_code = meal.meal_code;
    selectedMealInfo = meal;
    mealSearchQuery = `${meal.meal_code} - ${meal.meal_name}`;
    showMealSearchResults = false;
  }

  function selectMealForEdit(meal) {
    editForm.meal_code = meal.meal_code;
    selectedMealInfo = meal;
    mealSearchQuery = `${meal.meal_code} - ${meal.meal_name}`;
    showMealSearchResults = false;
  }

  async function saveAdd() {
    if (!addForm.meal_code) {
      alert('Please select a meal from the library.');
      return;
    }
    loading = true;
    try {
      const { error: insErr } = await supabase
        .from('diet_template_meals')
        .insert([{
          diet_code: template.diet_code,
          week_no: currentWeek,
          day_no: parseInt(addForm.day_no),
          meal_type: addForm.meal_type,
          meal_time: addForm.meal_time,
          meal_code: addForm.meal_code
        }]);

      if (insErr) throw insErr;
      showAddModal = false;
      await invalidateAll();
    } catch (err) {
      alert('Error adding meal: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function saveEdit() {
    if (!editForm.meal_code) {
      alert('Please select a meal from the library.');
      return;
    }
    loading = true;
    try {
      const { error: updErr } = await supabase
        .from('diet_template_meals')
        .update({
          day_no: parseInt(editForm.day_no),
          meal_type: editForm.meal_type,
          meal_time: editForm.meal_time,
          meal_code: editForm.meal_code
        })
        .eq('id', editForm.id);

      if (updErr) throw updErr;
      showEditModal = false;
      await invalidateAll();
    } catch (err) {
      alert('Error updating meal: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function deleteMeal(id) {
    if (!confirm('Are you sure you want to delete this meal from the template?')) return;
    loading = true;
    try {
      const { error: delErr } = await supabase
        .from('diet_template_meals')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;
      await invalidateAll();
    } catch (err) {
      alert('Error deleting meal: ' + err.message);
    } finally {
      loading = false;
    }
  }
</script>

<div class="page">
  {#if error}
    <div class="error-container">
      <h2>Error Loading Template</h2>
      <p>{error}</p>
      <a href="/admin/diet-templates" class="btn-outline">Back to Diet Templates</a>
    </div>
  {:else if !template}
    <div class="loading">Loading template details...</div>
  {:else}
    <div class="page-head">
      <div class="title-area">
        <div class="back-link">
          <a href="/admin/diet-templates">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Diet Templates
          </a>
        </div>
        <h1>{template.diet_name}</h1>
        <div class="meta-row">
          <span class="badge">Code: {template.diet_code}</span>
          <span class="badge badge-primary">Target: {template.target || 'N/A'}</span>
          <span class="badge badge-success">Food Type: {template.food_type || 'N/A'}</span>
          <span class="badge badge-warning">Calories: {template.calories_min} - {template.calories_max} kcal</span>
          <span class="badge">Weeks: {template.total_weeks}</span>
        </div>
      </div>
    </div>

    <!-- Week Selector Tabs -->
    <div class="week-selector-card">
      <div class="week-label">Select Week:</div>
      <div class="tabs-scroll">
        <div class="tabs-list">
          {#each Array(template.total_weeks) as _, i}
            {@const wk = i + 1}
            <button
              class="tab-btn {currentWeek === wk ? 'active' : ''}"
              onclick={() => currentWeek = wk}
            >
              Week {wk}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Weekly Summary Block -->
    <div class="summary-box">
      <div class="summary-item">
        <span class="summary-title">Weekly Calorie Budget</span>
        <span class="summary-val">{weeklyCaloriesSum} kcal total</span>
      </div>
      <div class="summary-item">
        <span class="summary-title">Daily Average Calorie Count</span>
        <span class="summary-val">{averageDailyCalories} kcal/day</span>
      </div>
    </div>

    <!-- 7 Days Grid -->
    <div class="days-grid">
      {#each Array(7) as _, dayIdx}
        {@const dayNo = dayIdx + 1}
        {@const dayName = days[dayIdx]}
        {@const dayMeals = getMealsForDay(dayNo)}
        {@const dayCals = getDayCalories(dayNo)}

        <div class="day-card">
          <div class="day-header">
            <h3>{dayName}</h3>
            <span class="day-cals-badge">{dayCals} kcal</span>
          </div>

          <div class="meals-list">
            {#each dayMeals as meal}
              <div class="meal-item-card">
                <div class="meal-actions">
                  <button class="action-btn edit" onclick={() => openEditModal(meal)} title="Edit meal">✏️</button>
                  <button class="action-btn delete" onclick={() => deleteMeal(meal.id)} title="Delete meal">🗑️</button>
                </div>
                <div class="meal-meta">
                  <span class="meal-time">{meal.meal_time}</span>
                  <span class="meal-type">{meal.meal_type}</span>
                </div>
                <h4 class="meal-title">{meal.meal_library?.meal_name || 'Untitled Meal'}</h4>
                <div class="meal-code-line">Code: <code>{meal.meal_code}</code></div>
                {#if meal.meal_library}
                  <div class="meal-macros">
                    <span><strong>Cal:</strong> {meal.meal_library.calories}</span>
                    <span><strong>P:</strong> {meal.meal_library.protein}g</span>
                    <span><strong>C:</strong> {meal.meal_library.carbs}g</span>
                    <span><strong>F:</strong> {meal.meal_library.fat}g</span>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="no-meals">No meals scheduled</div>
            {/each}
          </div>

          <button class="btn-add-meal" onclick={() => openAddModal(dayNo)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Meal
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Meal Modal -->
{#if showAddModal}
  <div class="modal-overlay" onclick={() => (showAddModal = false)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Add Meal to Week {currentWeek}</h3>
        <button class="btn-close" onclick={() => (showAddModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        <!-- Searchable meal library select -->
        <div class="form-group select-search-container">
          <label>Select Meal from Library</label>
          <input
            type="text"
            placeholder="Type to search meal library by name or code..."
            bind:value={mealSearchQuery}
            onfocus={() => showMealSearchResults = true}
            onblur={() => setTimeout(() => showMealSearchResults = false, 200)}
          />
          {#if showMealSearchResults}
            <div class="search-results-dropdown">
              {#each filteredMealsForSelect.slice(0, 15) as meal}
                <button
                  type="button"
                  class="search-result-item"
                  onclick={() => selectMealForAdd(meal)}
                >
                  <span class="result-meal-code"><code>{meal.meal_code}</code></span>
                  <div class="result-meal-details">
                    <strong>{meal.meal_name}</strong>
                    <span class="result-meal-meta">{meal.meal_type} | {meal.food_type} | {meal.calories} kcal</span>
                  </div>
                </button>
              {:else}
                <div class="no-results">No meals found matching "{mealSearchQuery}"</div>
              {/each}
            </div>
          {/if}
        </div>

        {#if selectedMealInfo}
          <div class="selected-meal-card">
            <div class="selected-meal-header">
              <span class="badge badge-primary">{selectedMealInfo.meal_code}</span>
              <strong>{selectedMealInfo.meal_name}</strong>
            </div>
            <div class="selected-meal-stats">
              <span><strong>Calories:</strong> {selectedMealInfo.calories} kcal</span>
              <span><strong>Protein:</strong> {selectedMealInfo.protein}g</span>
              <span><strong>Carbs:</strong> {selectedMealInfo.carbs}g</span>
              <span><strong>Fat:</strong> {selectedMealInfo.fat}g</span>
            </div>
          </div>
        {/if}

        <div class="row">
          <div class="form-group">
            <label>Day of Week</label>
            <select bind:value={addForm.day_no}>
              {#each days as day, idx}
                <option value={idx + 1}>{day}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Meal Time</label>
            <input type="text" bind:value={addForm.meal_time} placeholder="e.g. 08:00" required />
          </div>
        </div>

        <div class="form-group">
          <label>Meal Type / Slot (e.g. meal_1, Breakfast)</label>
          <input type="text" bind:value={addForm.meal_type} placeholder="e.g. meal_1" required />
        </div>

        <div class="modal-footer">
          <button class="btn-outline" onclick={() => (showAddModal = false)}>Cancel</button>
          <button class="btn-primary" onclick={saveAdd} disabled={loading}>
            {loading ? 'Adding...' : 'Add Meal'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Meal Modal -->
{#if showEditModal}
  <div class="modal-overlay" onclick={() => (showEditModal = false)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Edit Scheduled Meal</h3>
        <button class="btn-close" onclick={() => (showEditModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        <!-- Searchable meal library select -->
        <div class="form-group select-search-container">
          <label>Select Meal from Library</label>
          <input
            type="text"
            placeholder="Type to search meal library by name or code..."
            bind:value={mealSearchQuery}
            onfocus={() => showMealSearchResults = true}
            onblur={() => setTimeout(() => showMealSearchResults = false, 200)}
          />
          {#if showMealSearchResults}
            <div class="search-results-dropdown">
              {#each filteredMealsForSelect.slice(0, 15) as meal}
                <button
                  type="button"
                  class="search-result-item"
                  onclick={() => selectMealForEdit(meal)}
                >
                  <span class="result-meal-code"><code>{meal.meal_code}</code></span>
                  <div class="result-meal-details">
                    <strong>{meal.meal_name}</strong>
                    <span class="result-meal-meta">{meal.meal_type} | {meal.food_type} | {meal.calories} kcal</span>
                  </div>
                </button>
              {:else}
                <div class="no-results">No meals found matching "{mealSearchQuery}"</div>
              {/each}
            </div>
          {/if}
        </div>

        {#if selectedMealInfo}
          <div class="selected-meal-card">
            <div class="selected-meal-header">
              <span class="badge badge-primary">{selectedMealInfo.meal_code}</span>
              <strong>{selectedMealInfo.meal_name}</strong>
            </div>
            <div class="selected-meal-stats">
              <span><strong>Calories:</strong> {selectedMealInfo.calories} kcal</span>
              <span><strong>Protein:</strong> {selectedMealInfo.protein}g</span>
              <span><strong>Carbs:</strong> {selectedMealInfo.carbs}g</span>
              <span><strong>Fat:</strong> {selectedMealInfo.fat}g</span>
            </div>
          </div>
        {/if}

        <div class="row">
          <div class="form-group">
            <label>Day of Week</label>
            <select bind:value={editForm.day_no}>
              {#each days as day, idx}
                <option value={idx + 1}>{day}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Meal Time</label>
            <input type="text" bind:value={editForm.meal_time} placeholder="e.g. 08:00" required />
          </div>
        </div>

        <div class="form-group">
          <label>Meal Type / Slot (e.g. meal_1, Breakfast)</label>
          <input type="text" bind:value={editForm.meal_type} placeholder="e.g. meal_1" required />
        </div>

        <div class="modal-footer">
          <button class="btn-outline" onclick={() => (showEditModal = false)}>Cancel</button>
          <button class="btn-primary" onclick={saveEdit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .page { animation: fadeIn 0.3s ease; max-width: 1400px; margin: 0 auto; }
  .page-head { margin-bottom: 1.5rem; }
  .back-link { margin-bottom: 0.75rem; }
  .back-link a { color: var(--text-secondary); text-decoration: none; font-size: 0.8125rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.375rem; transition: color 0.15s; }
  .back-link a:hover { color: var(--primary-accent); }
  .title-area h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem; }
  .meta-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .badge { font-size: 0.6875rem; font-weight: 700; background: var(--bg); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); }
  .badge-primary { background: #DBEAFE; color: #1E40AF; border-color: #BFDBFE; }
  .badge-success { background: #DCFCE7; color: #166534; border-color: #BBF7D0; }
  .badge-warning { background: #FEF3C7; color: #92400E; border-color: #FDE68A; }

  /* Week Selector Card */
  .week-selector-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); }
  .week-label { font-size: 0.8125rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
  .tabs-scroll { flex: 1; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tabs-list { display: flex; gap: 0.5rem; }
  .tab-btn { background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
  .tab-btn:hover { background: var(--border-light); border-color: var(--text-muted); }
  .tab-btn.active { background: var(--primary-accent); border-color: var(--primary-accent); color: white; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2); }

  /* Summary Box */
  .summary-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
  .summary-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; box-shadow: var(--shadow-sm); }
  .summary-title { font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .summary-val { font-size: 1.125rem; font-weight: 800; color: var(--text); }

  /* 7 Days Grid */
  .days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  .day-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; min-height: 400px; box-shadow: var(--shadow-sm); transition: border-color 0.2s; }
  .day-card:hover { border-color: var(--text-muted); }
  .day-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem; margin-bottom: 1rem; }
  .day-header h3 { font-size: 0.9375rem; font-weight: 800; color: var(--text); }
  .day-cals-badge { font-size: 0.75rem; font-weight: 800; background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); padding: 2px 8px; border-radius: 6px; }
  .meals-list { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; margin-bottom: 1rem; }
  
  /* Meal Card */
  .meal-item-card { background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius); padding: 0.75rem; position: relative; display: flex; flex-direction: column; gap: 0.25rem; transition: transform 0.2s, border-color 0.2s; }
  .meal-item-card:hover { transform: translateY(-2px); border-color: var(--border); background: var(--surface); box-shadow: var(--shadow); }
  .meal-actions { position: absolute; top: 0.625rem; right: 0.625rem; display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.2s; }
  .meal-item-card:hover .meal-actions { opacity: 1; }
  .action-btn { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; cursor: pointer; transition: all 0.15s; }
  .action-btn:hover { background: var(--bg); }
  .meal-meta { display: flex; align-items: center; gap: 0.5rem; }
  .meal-time { font-size: 0.6875rem; font-weight: 800; color: var(--primary-accent); }
  .meal-type { font-size: 0.625rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.02em; }
  .meal-title { font-size: 0.8125rem; font-weight: 700; color: var(--text); line-height: 1.4; word-break: break-word; padding-right: 2.25rem; }
  .meal-code-line { font-size: 0.6875rem; color: var(--text-muted); }
  .meal-code-line code { font-weight: 700; color: var(--text-secondary); }
  .meal-macros { display: flex; gap: 0.5rem; font-size: 0.6875rem; color: var(--text-secondary); border-top: 1px dashed var(--border-light); margin-top: 0.25rem; padding-top: 0.25rem; }

  .no-meals { text-align: center; padding: 2rem 0; font-size: 0.8125rem; color: var(--text-muted); font-style: italic; display: flex; align-items: center; justify-content: center; height: 100%; }
  
  .btn-add-meal { background: transparent; border: 1.5px dashed var(--border); border-radius: 8px; color: var(--text-secondary); width: 100%; padding: 0.5rem; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.375rem; transition: all 0.2s; }
  .btn-add-meal:hover { border-color: var(--primary-accent); color: var(--primary-accent); background: var(--primary-accent-light); }

  /* Modals */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; left: 0; top: 0; width: 100%; height: 100%; }
  .modal { background: white; border-radius: var(--radius-lg); width: 100%; max-width: 480px; box-shadow: var(--shadow-lg); overflow: hidden; animation: fadeIn 0.2s ease; display: flex; flex-direction: column; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); }
  .modal-header h3 { font-size: 1rem; font-weight: 800; color: var(--text); }
  .btn-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); }
  .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }
  
  /* Searchable select inside modal */
  .select-search-container { position: relative; }
  .search-results-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid var(--border); border-radius: var(--radius); max-height: 200px; overflow-y: auto; z-index: 2010; box-shadow: var(--shadow-lg); margin-top: 4px; }
  .search-result-item { width: 100%; display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.5rem 0.75rem; background: none; border: none; border-bottom: 1px solid var(--border-light); text-align: left; cursor: pointer; transition: background 0.15s; }
  .search-result-item:hover { background: var(--bg); }
  .result-meal-code { font-size: 0.75rem; font-weight: 700; color: var(--primary-accent); }
  .result-meal-details { display: flex; flex-direction: column; gap: 2px; }
  .result-meal-details strong { font-size: 0.8125rem; color: var(--text); }
  .result-meal-meta { font-size: 0.6875rem; color: var(--text-muted); }
  .no-results { padding: 0.75rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem; }

  /* Selected Meal Preview */
  .selected-meal-card { background: var(--primary-accent-light); border: 1.5px dashed var(--primary-accent); border-radius: var(--radius); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.375rem; }
  .selected-meal-header { font-size: 0.8125rem; color: var(--primary-accent-hover); display: flex; gap: 0.5rem; align-items: center; }
  .selected-meal-stats { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem; color: var(--text-secondary); }

  .error-container { text-align: center; padding: 4rem 2rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .error-container h2 { color: var(--danger); font-size: 1.5rem; }
  .loading { text-align: center; padding: 4rem; color: var(--text-muted); font-size: 0.875rem; }
</style>
