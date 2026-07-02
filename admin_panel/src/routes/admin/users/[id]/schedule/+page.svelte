<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  
  let { data } = $props();
  let profile = $derived(data.profile);
  let schedule = $derived(data.schedule);
  let recipes = $derived(data.recipes);
  let assignment = $derived(data.assignment);
  let templateMeals = $derived(data.templateMeals);
  let totalWeeks = $derived(data.totalWeeks);
  let accessibleWeeks = $derived(data.accessibleWeeks);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const categories = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];
  const categoryTimes = {
    'Early Morning': '06:00 AM',
    'Breakfast': '08:00 AM',
    'Mid Morning': '10:30 AM',
    'Lunch': '01:30 PM',
    'Evening': '05:00 PM',
    'Dinner': '08:00 PM',
    'Post Dinner': '09:30 PM'
  };

  let currentWeek = $state(1);
  let loading = $state(false);
  let viewMode = $state('grid'); // 'grid' or 'table'
  let scheduleSource = $state(assignment ? 'template' : 'custom');
  
  // Modals State
  let showEditModal = $state(false);
  let showAddModal = $state(false);
  
  let activeMeal = $state(null);
  let targetDayIndexForAdd = $state(null);

  // For editing a meal
  let editForm = $state({
    id: null,
    meal_name: '',
    meal_time: '',
    meal_category: '',
    recipe_id: null,
    calories: 0,
    quantity: 1.0,
    comments: ''
  });

  // For adding a meal to schedule
  let addForm = $state({
    meal_name: '',
    meal_time: '08:00 AM',
    meal_category: 'Breakfast',
    recipe_id: null,
    calories: 0,
    quantity: 1.0,
    comments: ''
  });

  function handleAddCategoryChange(cat) {
    addForm.meal_category = cat;
    if (categoryTimes[cat]) {
      addForm.meal_time = categoryTimes[cat];
    }
  }

  function handleEditCategoryChange(cat) {
    editForm.meal_category = cat;
    if (categoryTimes[cat]) {
      editForm.meal_time = categoryTimes[cat];
    }
  }

  function handleRecipeSelectForAdd(recipeId) {
    const r = recipes.find(rec => rec.id === parseInt(recipeId));
    if (r) {
      addForm.recipe_id = r.id;
      addForm.meal_name = r.name;
      addForm.calories = r.calories;
    }
  }

  function handleRecipeSelectForEdit(recipeId) {
    const r = recipes.find(rec => rec.id === parseInt(recipeId));
    if (r) {
      editForm.recipe_id = r.id;
      editForm.meal_name = r.name;
      editForm.calories = r.calories;
    }
  }

  // Convert template meals to schedule-like items with day_index
  let templateScheduleItems = $derived(
    (templateMeals || [])
      .filter(m => m.week_no === currentWeek)
      .map(m => ({
        id: `tpl-${m.id}`,
        day_index: ((m.week_no - 1) * 7) + (m.day_no || 1),
        meal_name: m.meal_name || m.meal_library?.name || 'Untitled Meal',
        meal_time: categoryTimes[m.meal_time] || '08:00 AM',
        meal_category: m.meal_time || 'Breakfast',
        recipe_id: m.meal_library?.recipe_id || null,
        calories: m.calories || m.meal_library?.calories || 0,
        quantity: m.quantity || 1,
        comments: m.meal_library?.name || '',
        _readonly: true,
        _meal_library: m.meal_library
      }))
      .sort((a, b) => {
        const catOrder = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];
        const catDiff = catOrder.indexOf(a.meal_category) - catOrder.indexOf(b.meal_category);
        if (catDiff !== 0) return catDiff;
        return a.day_index - b.day_index;
      })
  );

  let activeSchedule = $derived(scheduleSource === 'template' ? templateScheduleItems : (schedule || []));

  // Get meals for a specific day in the selected week
  function getMealsForDay(dayIndexInWeek) {
    // Day index represents Monday (0) to Sunday (6)
    const targetDayIndex = ((currentWeek - 1) * 7) + dayIndexInWeek + 1;
    return activeSchedule
      .filter((s) => s.day_index === targetDayIndex)
      .sort((a, b) => {
        const timeA = a.meal_time?.includes('PM') && !a.meal_time?.startsWith('12') ? 12 : 0;
        const hourA = parseInt(a.meal_time?.split(':')[0] || '0') + timeA;
        const timeB = b.meal_time?.includes('PM') && !b.meal_time?.startsWith('12') ? 12 : 0;
        const hourB = parseInt(b.meal_time?.split(':')[0] || '0') + timeB;
        return hourA - hourB;
      });
  }

  function openEditModal(meal) {
    if (meal._readonly) return;
    activeMeal = meal;
    editForm = {
      id: meal.id,
      meal_name: meal.meal_name || '',
      meal_time: meal.meal_time || '08:00 AM',
      meal_category: meal.meal_category || 'Breakfast',
      recipe_id: meal.recipe_id,
      calories: meal.calories || 0,
      quantity: parseFloat(meal.quantity) || 1.0,
      comments: meal.comments || ''
    };
    showEditModal = true;
  }

  function openAddModal(dayIndexInWeek, category = 'Breakfast') {
    targetDayIndexForAdd = ((currentWeek - 1) * 7) + dayIndexInWeek + 1;
    addForm = {
      meal_name: '',
      meal_time: categoryTimes[category] || '08:00 AM',
      meal_category: category,
      recipe_id: null,
      calories: 0,
      quantity: 1.0,
      comments: ''
    };
    showAddModal = true;
  }

  function getCategoryIcon(cat) {
    switch (cat) {
      case 'Early Morning': return '🌅';
      case 'Breakfast': return '🍳';
      case 'Mid Morning': return '🍎';
      case 'Lunch': return '🍲';
      case 'Evening': return '🍵';
      case 'Dinner': return '🍽️';
      case 'Post Dinner': return '🥛';
      default: return '🍴';
    }
  }

  function getMealsForCell(dayIndexInWeek, category) {
    const targetDayIndex = ((currentWeek - 1) * 7) + dayIndexInWeek + 1;
    return activeSchedule.filter(s => s.day_index === targetDayIndex && s.meal_category === category);
  }

  // Derived states for weekly totals
  let weeklyCaloriesSum = $derived(
    activeSchedule
      .filter(s => {
        const startDayIndex = ((currentWeek - 1) * 7) + 1;
        const endDayIndex = currentWeek * 7;
        return s.day_index >= startDayIndex && s.day_index <= endDayIndex;
      })
      .reduce((sum, s) => sum + Math.round((s.calories || s.recipes?.calories || 0) * (s.quantity || 1)), 0)
  );

  let averageDailyCalories = $derived(Math.round(weeklyCaloriesSum / 7));

  // Derived state to get chronological meals for the active week
  let activeWeekMeals = $derived(
    activeSchedule
      .filter(s => {
        const startDayIndex = ((currentWeek - 1) * 7) + 1;
        const endDayIndex = currentWeek * 7;
        return s.day_index >= startDayIndex && s.day_index <= endDayIndex;
      })
      .sort((a, b) => {
        if (a.day_index !== b.day_index) {
          return a.day_index - b.day_index;
        }
        const catOrder = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];
        return catOrder.indexOf(a.meal_category) - catOrder.indexOf(b.meal_category);
      })
  );

  async function saveEdit() {
    loading = true;
    try {
      const { error } = await supabase
        .from('user_meal_schedule')
        .update({
          meal_name: editForm.meal_name,
          meal_time: editForm.meal_time,
          meal_category: editForm.meal_category,
          recipe_id: editForm.recipe_id,
          calories: parseInt(editForm.calories) || 0,
          quantity: parseFloat(editForm.quantity) || 1.0,
          comments: editForm.comments
        })
        .eq('id', editForm.id);

      if (error) throw error;
      showEditModal = false;
      await invalidateAll();
    } catch (err) {
      alert('Error updating meal: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function saveAdd() {
    loading = true;
    try {
      const { error } = await supabase
        .from('user_meal_schedule')
        .insert([{
          user_id: profile.id,
          plan_id: assignment?.subscription_plans?.id || profile.active_plan_id,
          day_index: targetDayIndexForAdd,
          meal_name: addForm.meal_name,
          meal_time: addForm.meal_time,
          meal_category: addForm.meal_category,
          recipe_id: addForm.recipe_id,
          calories: parseInt(addForm.calories) || 0,
          quantity: parseFloat(addForm.quantity) || 1.0,
          comments: addForm.comments
        }]);

      if (error) throw error;
      showAddModal = false;
      await invalidateAll();
    } catch (err) {
      alert('Error adding meal: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function deleteMeal(id) {
    if (!confirm('Are you sure you want to remove this meal from the user\'s schedule?')) return;
    loading = true;
    try {
      const { error } = await supabase
        .from('user_meal_schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await invalidateAll();
    } catch (err) {
      alert('Error deleting meal: ' + err.message);
    } finally {
      loading = false;
    }
  }

  function getCategoryColor(cat) {
    switch (cat) {
      case 'Early Morning':
        return { bg: '#ECFEFF', text: '#0891B2', dot: '#06B6D4' };
      case 'Breakfast':
        return { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' };
      case 'Mid Morning':
        return { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' };
      case 'Lunch':
        return { bg: '#F0FDF4', text: '#16A34A', dot: '#10B981' };
      case 'Evening':
        return { bg: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6' };
      case 'Dinner':
        return { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
      case 'Post Dinner':
        return { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' };
      default:
        return { bg: '#F8FAFC', text: '#64748B', dot: '#94A3B8' };
    }
  }
</script>

<div class="builder-container" style="animation: fadeIn 0.3s ease">
  <!-- Back Link & Main Header -->
  <div class="header-action-row">
    <a href="/admin/users/{profile.id}" class="back-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
      Back to Client Profile
    </a>
  </div>

  <!-- Client Vitals Banner -->
  <div class="vitals-banner shadow-sm">
    <div class="v-section client-info">
      <div class="v-avatar">
        {profile.full_name ? profile.full_name.charAt(0) : 'U'}
      </div>
      <div class="v-details">
        <h2>{profile.full_name || 'Client Name'}</h2>
        <span class="active-tag">Active Schedule Planning</span>
      </div>
    </div>

    <div class="v-section metrics">
      <div class="metric-item">
        <span class="m-label">Diet Preference</span>
        <span class="m-val">{profile.dietary_preference || 'Not Set'}</span>
      </div>
      <div class="metric-item">
        <span class="m-label">Health Goal</span>
        <span class="m-val">{profile.health_goal || 'General Focus'}</span>
      </div>
      <div class="metric-item">
        <span class="m-label">Target Weight</span>
        <span class="m-val">
          {#if profile.current_weight}
            {profile.current_weight} kg →
          {/if}
          {profile.target_weight || '—'} kg
        </span>
      </div>
    </div>

    <div class="v-section calorie-analysis">
      <div class="metric-item">
        <span class="m-label">Diet Calorie Goal</span>
        <span class="m-val highlight">{assignment?.subscription_plans?.target_calories || '—'} kcal</span>
      </div>
      <div class="metric-item">
        <span class="m-label">Scheduled Avg (Week {currentWeek})</span>
        <span class="m-val" class:warning-text={averageDailyCalories > (assignment?.subscription_plans?.target_calories || 2000) + 100 || averageDailyCalories < (assignment?.subscription_plans?.target_calories || 2000) - 100}>
          {averageDailyCalories} kcal
        </span>
      </div>
      <div class="metric-item">
        <span class="m-label">Deviation</span>
        <span class="deviation-badge" class:deficit={averageDailyCalories <= (assignment?.subscription_plans?.target_calories || 2000)} class:surplus={averageDailyCalories > (assignment?.subscription_plans?.target_calories || 2000)}>
          {averageDailyCalories - (assignment?.subscription_plans?.target_calories || 0)} kcal
        </span>
      </div>
    </div>

    {#if profile.medical_history}
      <div class="v-section medical">
        <div class="warning-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Clinical Alerts
        </div>
        <p class="history-text">{profile.medical_history}</p>
      </div>
    {/if}
  </div>

  <!-- Assignment Info Banner -->
  {#if assignment}
    <div class="assignment-banner shadow-sm">
      <div class="assignment-info">
        <span class="assignment-label">Diet Assignment</span>
        <span class="assignment-value">{assignment.subscription_plans?.name || 'N/A'}</span>
        <span class="assignment-sep">•</span>
        <span class="assignment-value">{assignment.diet_templates?.diet_name || assignment.diet_templates?.diet_code || 'N/A'}</span>
        <span class="assignment-sep">•</span>
        <span class="assignment-value">Week {assignment.actual_start_week} – {assignment.actual_end_week || (assignment.actual_start_week + totalWeeks - 1)}</span>
      </div>
    </div>
  {/if}

  <!-- Source Toggle & Week Switcher toolbar -->
  <div class="toolbar-row">
    <div class="title-meta">
      <h3>Weekly Schedule Planner</h3>
      <p>
        {#if scheduleSource === 'template'}
          Read-only view from diet template. Switch to "Custom Schedule" to edit.
        {:else}
          Click any scheduled meal card to edit, or tap any empty slot to instantly schedule a meal.
        {/if}
      </p>
    </div>

    <div style="display: flex; align-items: center; gap: 1rem;">

      <!-- Source Toggle -->
      {#if assignment}
        <div class="view-toggle shadow-sm" style="background: white; border: 1px solid var(--border); padding: 0.25rem; border-radius: 99px; display: flex; gap: 0.25rem; align-items: center;">
          <button class="toggle-view-btn" class:active={scheduleSource === 'template'} onclick={() => { scheduleSource = 'template'; currentWeek = 1; }} title="Template Schedule" style="padding: 0.5rem 1rem; border: none; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s;">
            📋 Template Schedule
          </button>
          <button class="toggle-view-btn" class:active={scheduleSource === 'custom'} onclick={() => { scheduleSource = 'custom'; currentWeek = 1; }} title="Custom Schedule" style="padding: 0.5rem 1rem; border: none; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s;">
            ✏️ Custom Schedule
          </button>
        </div>
      {/if}

      <div class="view-toggle shadow-sm" style="background: white; border: 1px solid var(--border); padding: 0.25rem; border-radius: 99px; display: flex; gap: 0.25rem; align-items: center;">
        <button class="toggle-view-btn" class:active={viewMode === 'grid'} onclick={() => viewMode = 'grid'} title="Grid View" style="padding: 0.5rem 1rem; border: none; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s;">
          🎛️ Grid View
        </button>
        <button class="toggle-view-btn" class:active={viewMode === 'table'} onclick={() => viewMode = 'table'} title="Table View" style="padding: 0.5rem 1rem; border: none; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s;">
          📊 Table View
        </button>
      </div>

      <div class="week-selector shadow-sm">
        <button
          class="nav-btn"
          onclick={() => (currentWeek = Math.max(1, currentWeek - 1))}
          disabled={currentWeek === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div class="week-display">
          <span class="label">{scheduleSource === 'template' ? 'TEMPLATE WEEK' : 'FORECAST FOCUS'}</span>
          <span class="val">Week {currentWeek} / {scheduleSource === 'template' ? totalWeeks : '—'}</span>
        </div>

        <button class="nav-btn" onclick={() => currentWeek++}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  </div>

  {#if viewMode === 'grid'}
    <!-- Matrix Planner Grid -->
    <div class="matrix-grid-wrapper shadow-sm">
      <div class="matrix-grid">
      <!-- Headers -->
      <div class="matrix-header-cell corner-cell">
        <span class="main-label">Slots Menu</span>
        <span class="sub-label">Weekly View</span>
      </div>
      {#each days as day, i}
        <div class="matrix-header-cell day-header-cell">
          <span class="day-name">{day}</span>
          <span class="day-meals-count">
            {activeSchedule.filter(s => s.day_index === ((currentWeek - 1) * 7) + i + 1).length} meals
          </span>
        </div>
      {/each}

      <!-- Rows -->
      {#each categories as category}
        <!-- Category Row Label -->
        <div class="matrix-category-cell">
          <span class="cat-icon">{getCategoryIcon(category)}</span>
          <div class="cat-meta">
            <span class="cat-name">{category}</span>
            <span class="cat-time">{categoryTimes[category]}</span>
          </div>
        </div>

        <!-- Meal Cells -->
        {#each days as day, i}
          {@const meals = getMealsForCell(i, category)}
          <div class="matrix-cell">
            {#if meals.length > 0}
              <div class="meals-stack">
                {#each meals as meal}
                  {@const colors = getCategoryColor(meal.meal_category)}
                  <div 
                    class="matrix-meal-card animate-in" 
                    role="button"
                    tabindex="0"
                    style="border-left: 4px solid {colors.dot};" 
                    onclick={() => openEditModal(meal)}
                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditModal(meal); } }}
                  >
                    <div class="meal-card-top">
                      <span class="meal-time">{meal.meal_time}</span>
                      {#if !meal._readonly}
                        <div class="card-action-btns">
                          <button class="btn-card-edit" onclick={(e) => { e.stopPropagation(); openEditModal(meal); }} title="Edit meal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button class="btn-card-delete" onclick={(e) => { e.stopPropagation(); deleteMeal(meal.id); }} title="Remove meal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      {:else}
                        <span class="template-badge">Template</span>
                      {/if}
                    </div>
                    <h4 class="meal-title-text">{meal.meal_name || meal.recipes?.name || 'Untitled Meal'}</h4>
                    <div class="meal-stats-bar">
                      <span class="meal-kcal-badge">{Math.round((meal.calories || meal.recipes?.calories || 0) * (meal.quantity || 1))} kcal</span>
                      {#if meal.quantity && Number(meal.quantity) !== 1}
                        <span class="qty-badge-inline">x{meal.quantity}</span>
                      {/if}
                    </div>
                    {#if meal.comments}
                      <p class="meal-notes-text">{meal.comments}</p>
                    {/if}
                  </div>
                {/each}
                {#if scheduleSource !== 'template'}
                  <button class="btn-add-inline-plus" onclick={() => openAddModal(i, category)}>
                    + Add Item
                  </button>
                {/if}
              </div>
            {:else}
              <button class="btn-empty-matrix-slot" onclick={() => { if (scheduleSource !== 'template') openAddModal(i, category); }}>
                <span class="slot-plus-char">{scheduleSource === 'template' ? '—' : '+'}</span>
                <span class="slot-plus-lbl">{scheduleSource === 'template' ? 'Read Only' : 'Add ' + category}</span>
              </button>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  </div>
  {:else}
    <!-- Tabular Chronological List View -->
    <div class="table-view-container card shadow-sm animate-in" style="overflow: hidden;">
      <table class="schedule-list-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Category</th>
            <th>Scheduled Time</th>
            <th>Meal / Recipe Name</th>
            <th class="text-right">Calories</th>
            <th style="width: 100px; text-align: center;">Portions</th>
            <th>Admin Notes / Comments</th>
            <th style="width: 150px; text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each activeWeekMeals as meal}
            {@const dayName = days[(meal.day_index - 1) % 7]}
            {@const colors = getCategoryColor(meal.meal_category)}
            <tr class="schedule-table-row">
              <td class="day-cell"><strong>{dayName}</strong></td>
              <td>
                <span class="category-pill" style="background: {colors.bg}; color: {colors.text}">
                  <span class="pill-dot" style="background: {colors.dot}"></span>
                  {meal.meal_category}
                </span>
              </td>
              <td class="time-cell">{meal.meal_time}</td>
              <td class="meal-name-cell">
                <strong>{meal.meal_name || meal.recipes?.name || 'Untitled Meal'}</strong>
              </td>
              <td class="text-right kcal-cell">
                {Math.round((meal.calories || meal.recipes?.calories || 0) * (meal.quantity || 1))} kcal
              </td>
              <td class="text-center">x{meal.quantity || 1.0}</td>
              <td class="comments-cell">{meal.comments || '—'}</td>
              <td class="actions-cell">
                {#if !meal._readonly}
                  <div class="action-btn-group">
                    <button class="action-table-btn edit" onclick={() => openEditModal(meal)} title="Edit meal">
                      ✏️ Edit
                    </button>
                    <button class="action-table-btn delete" onclick={() => deleteMeal(meal.id)} title="Delete meal">
                      🗑️ Delete
                    </button>
                  </div>
                {:else}
                  <span class="template-badge" style="display: inline-block; padding: 0.25rem 0.5rem;">Template</span>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="empty-table-state">
                <div class="empty-icon">🍽️</div>
                <p>No meals scheduled for Week {currentWeek} yet.</p>
                {#if scheduleSource !== 'template'}
                  <button class="btn-primary" onclick={() => openAddModal(0, 'Breakfast')}>Schedule First Meal</button>
                {:else}
                  <p style="font-size: 0.75rem; color: var(--text-muted);">This template has no meals defined for this week.</p>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Edit Meal Modal -->
{#if showEditModal}
  <div class="modal-overlay" onclick={() => (showEditModal = false)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Edit Scheduled Meal</h3>
        <button class="btn-close" onclick={() => (showEditModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        
        <div class="form-group">
          <label>Select Recipe from Library</label>
          <select bind:value={editForm.recipe_id} onchange={(e) => handleRecipeSelectForEdit(e.target.value)}>
            <option value="">-- Custom Meal (No Recipe Link) --</option>
            {#each recipes as rec}
              <option value={rec.id}>{rec.name} ({rec.calories} kcal)</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Meal Name</label>
          <input type="text" bind:value={editForm.meal_name} required />
        </div>

        <div class="row">
          <div class="form-group">
            <label>Meal Category</label>
            <select bind:value={editForm.meal_category} onchange={(e) => handleEditCategoryChange(e.target.value)}>
              {#each categories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Meal Time</label>
            <input type="text" bind:value={editForm.meal_time} required />
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Calories (kcal)</label>
            <input type="number" bind:value={editForm.calories} required />
          </div>
          <div class="form-group">
            <label>Quantity / Multiplier</label>
            <input type="number" step="0.05" bind:value={editForm.quantity} required />
          </div>
        </div>

        <div class="form-group">
          <label>Comments / Notes</label>
          <input type="text" bind:value={editForm.comments} />
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

<!-- Add Meal Modal -->
{#if showAddModal}
  <div class="modal-overlay" onclick={() => (showAddModal = false)}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Add Meal to Schedule</h3>
        <button class="btn-close" onclick={() => (showAddModal = false)}>&times;</button>
      </div>
      <div class="modal-body">
        
        <div class="form-group">
          <label>Select Recipe from Library</label>
          <select bind:value={addForm.recipe_id} onchange={(e) => handleRecipeSelectForAdd(e.target.value)}>
            <option value="">-- Custom Meal (No Recipe Link) --</option>
            {#each recipes as rec}
              <option value={rec.id}>{rec.name} ({rec.calories} kcal)</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Meal Name</label>
          <input type="text" bind:value={addForm.meal_name} placeholder="e.g. Eggs and Toast" required />
        </div>

        <div class="row">
          <div class="form-group">
            <label>Meal Category</label>
            <select bind:value={addForm.meal_category} onchange={(e) => handleAddCategoryChange(e.target.value)}>
              {#each categories as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Meal Time</label>
            <input type="text" bind:value={addForm.meal_time} required />
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Calories (kcal)</label>
            <input type="number" bind:value={addForm.calories} required />
          </div>
          <div class="form-group">
            <label>Quantity / Multiplier</label>
            <input type="number" step="0.05" bind:value={addForm.quantity} required />
          </div>
        </div>

        <div class="form-group">
          <label>Comments / Notes</label>
          <input type="text" bind:value={addForm.comments} />
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

<style>
  .builder-container {
    animation: fadeIn 0.3s ease;
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .header-action-row {
    margin-bottom: 0.25rem;
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.8125rem;
    transition: color 0.2s;
  }
  .back-link:hover {
    color: var(--primary-accent);
  }

  /* Vitals Banner Styles */
  .vitals-banner {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    overflow: hidden;
  }
  .v-section {
    padding: 1.5rem;
    border-right: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .v-section:last-child {
    border-right: none;
  }
  
  .client-info {
    flex: 1.2;
    min-width: 250px;
    flex-direction: row !important;
    align-items: center;
    gap: 1.25rem;
  }
  .v-avatar {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--primary-accent-light);
    color: var(--primary-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    font-weight: 800;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.1);
  }
  .v-details h2 {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.125rem;
  }
  .active-tag {
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #10b981;
    background: #ecfdf5;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .metrics {
    flex: 1.5;
    min-width: 320px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
  .calorie-analysis {
    flex: 1.5;
    min-width: 320px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    background: #f8fafc;
  }
  .metric-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
  }
  .m-label {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .m-val {
    font-size: 0.9375rem;
    font-weight: 800;
    color: var(--text);
  }
  .m-val.highlight {
    color: var(--primary-accent);
  }
  .warning-text {
    color: #ef4444 !important;
  }
  
  .deviation-badge {
    align-self: flex-start;
    font-size: 0.6875rem;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 6px;
  }
  .deviation-badge.deficit {
    background: #ecfdf5;
    color: #10b981;
  }
  .deviation-badge.surplus {
    background: #fef2f2;
    color: #ef4444;
  }

  .medical {
    flex: 1.8;
    min-width: 280px;
    gap: 0.375rem;
  }
  .warning-header {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.6875rem;
    font-weight: 800;
    color: #b45309;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .history-text {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #78350f;
    line-height: 1.35;
    background: #fffbeb;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid #fde68a;
  }

  /* Toolbar Grid Headers */
  .toolbar-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title-meta h3 {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--text);
  }
  .title-meta p {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }
  
  .week-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    border: 1px solid var(--border);
    padding: 0.375rem;
    border-radius: 99px;
  }
  .nav-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nav-btn:hover:not(:disabled) {
    background: var(--primary-accent);
    color: white;
  }
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .week-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1rem;
    min-width: 120px;
  }
  .week-display .label {
    font-size: 0.5625rem;
    font-weight: 800;
    color: var(--text-muted);
    letter-spacing: 0.05em;
  }
  .week-display .val {
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--text);
  }

  /* Matrix Planner Grid layout */
  .matrix-grid-wrapper {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .matrix-grid {
    display: grid;
    grid-template-columns: 150px repeat(7, minmax(160px, 1fr));
    align-items: stretch;
    overflow-x: auto;
  }

  .matrix-header-cell {
    background: #f8fafc;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid var(--border-light);
    border-right: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 70px;
  }
  .corner-cell {
    background: #f1f5f9;
  }
  .corner-cell .main-label {
    font-size: 0.8125rem;
    font-weight: 800;
    color: var(--text);
  }
  .corner-cell .sub-label {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  
  .day-header-cell {
    align-items: center;
    text-align: center;
  }
  .day-header-cell:last-child {
    border-right: none;
  }
  .day-name {
    font-size: 0.8125rem;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .day-meals-count {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--text-muted);
    background: white;
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid var(--border-light);
    margin-top: 0.25rem;
  }

  /* Category Side Cells */
  .matrix-category-cell {
    background: #f8fafc;
    padding: 1rem 0.75rem;
    border-bottom: 1px solid var(--border-light);
    border-right: 2px solid var(--border);
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .cat-icon {
    font-size: 1.35rem;
    display: inline-flex;
  }
  .cat-meta {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .cat-name {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .cat-time {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--text-muted);
  }

  /* Grid Cell Content */
  .matrix-cell {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-light);
    border-right: 1px solid var(--border-light);
    background: #fafafb;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 140px;
  }
  .matrix-cell:last-child {
    border-right: none;
  }
  .meals-stack {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    justify-content: center;
  }

  /* Tabular Compact Cards */
  .matrix-meal-card {
    background: white;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    padding: 0.625rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .matrix-meal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    border-color: var(--accent);
  }
  .meal-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  .meal-time {
    font-size: 0.625rem;
    font-weight: 800;
    color: var(--text-muted);
  }
  .btn-delete {
    background: none;
    border: none;
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1;
    cursor: pointer;
    padding: 0;
    margin-top: -4px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .matrix-meal-card:hover .btn-delete {
    opacity: 1;
  }
  .btn-delete:hover {
    color: #ef4444;
  }
  
  .meal-title-text {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    margin-bottom: 0.375rem;
    word-break: break-word;
  }
  
  .meal-stats-bar {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .meal-kcal-badge {
    font-size: 0.625rem;
    font-weight: 800;
    color: var(--primary-accent);
    background: var(--primary-accent-light);
    padding: 1px 5px;
    border-radius: 4px;
  }
  .qty-badge-inline {
    font-size: 0.5625rem;
    font-weight: 800;
    color: #4b5563;
    background: #f3f4f6;
    padding: 1px 4px;
    border-radius: 4px;
  }
  .meal-notes-text {
    font-size: 0.625rem;
    font-style: italic;
    color: var(--text-muted);
    border-top: 1px dashed var(--border-light);
    margin-top: 0.375rem;
    padding-top: 0.375rem;
    word-break: break-word;
  }
  
  .btn-add-inline-plus {
    width: 100%;
    padding: 0.25rem;
    border: 1px dashed var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--primary-accent);
    font-size: 0.625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-add-inline-plus:hover {
    background: var(--primary-accent-light);
    border-color: var(--primary-accent);
  }

  /* Dashed Empty Slot */
  .btn-empty-matrix-slot {
    width: 100%;
    height: 100%;
    min-height: 120px;
    border: 1.5px dashed var(--border);
    border-radius: 12px;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    color: var(--text-muted);
    transition: all 0.2s ease-in-out;
  }
  .btn-empty-matrix-slot:hover {
    border-color: var(--primary-accent);
    color: var(--primary-accent);
    background: var(--primary-accent-light);
  }
  .slot-plus-char {
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
  }
  .slot-plus-lbl {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Modal Overlay Centering Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(6px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .modal {
    background: white;
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 480px;
    box-shadow: var(--shadow-lg);
    animation: fadeIn 0.2s ease;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-header h3 {
    font-size: 1rem;
    font-weight: 800;
    color: var(--text);
  }
  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
  }
  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }
  .form-group label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .form-group select,
  .form-group input {
    padding: 0.625rem 0.875rem;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    outline: none;
    transition: all 0.2s;
  }
  .form-group select:focus,
  .form-group input:focus {
    border-color: var(--primary-accent);
    background: white;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .modal-footer {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .modal-footer button {
    flex: 1;
    padding: 0.75rem;
    border-radius: var(--radius);
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  @media (max-width: 1400px) {
    .matrix-grid {
      grid-template-columns: 140px repeat(7, 200px);
    }
  }

  /* Explicit Edit and Delete Button Group in Grid Card */
  .card-action-btns {
    display: flex;
    gap: 0.375rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .matrix-meal-card:hover .card-action-btns {
    opacity: 1;
  }
  .btn-card-edit, .btn-card-delete {
    border: none;
    background: #f1f5f9;
    color: var(--text-secondary);
    padding: 0.25rem;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease-in-out;
    width: 22px;
    height: 22px;
  }
  .btn-card-edit:hover {
    background: var(--primary-accent-light);
    color: var(--primary-accent);
  }
  .btn-card-delete:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  /* View Switcher Styles */
  .toggle-view-btn.active {
    background: var(--primary-accent) !important;
    color: white !important;
    box-shadow: var(--shadow-sm);
  }
  .toggle-view-btn:hover:not(.active) {
    background: #f1f5f9;
    color: var(--text);
  }

  /* Table View Styles */
  .table-view-container {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .schedule-list-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .schedule-list-table th {
    background: #f8fafc;
    padding: 1rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border-light);
  }
  .schedule-list-table td {
    padding: 1rem 1.25rem;
    font-size: 0.875rem;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
  }
  .schedule-table-row:hover {
    background: #fafafb;
  }
  .schedule-table-row:last-child td {
    border-bottom: none;
  }
  
  .day-cell {
    color: var(--text);
    text-transform: uppercase;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
  }
  .category-pill {
    font-size: 0.6875rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 99px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 1px solid rgba(0, 0, 0, 0.03);
  }
  .pill-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  .time-cell {
    font-weight: 700;
    color: var(--text-muted);
    font-size: 0.8125rem;
  }
  .meal-name-cell {
    color: var(--text);
    font-size: 0.875rem;
  }
  .kcal-cell {
    font-weight: 800;
    color: var(--primary-accent);
  }
  .comments-cell {
    color: var(--text-muted);
    font-style: italic;
    font-size: 0.8125rem;
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Table Actions */
  .action-btn-group {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  .action-table-btn {
    border: 1px solid var(--border);
    background: white;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .action-table-btn.edit {
    color: var(--text-secondary);
  }
  .action-table-btn.edit:hover {
    border-color: var(--primary-accent);
    color: var(--primary-accent);
    background: var(--primary-accent-light);
  }
  .action-table-btn.delete {
    color: #ef4444;
  }
  .action-table-btn.delete:hover {
    border-color: #fca5a5;
    background: #fee2e2;
  }

  .empty-table-state {
    text-align: center;
    padding: 4rem 2rem !important;
    color: var(--text-muted);
  }
  .empty-table-state .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
    display: block;
    opacity: 0.6;
  }
  .empty-table-state p {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .assignment-banner {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1px solid #bfdbfe;
    border-radius: var(--radius-lg);
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
  }
  .assignment-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .assignment-label {
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #1e40af;
    background: #bfdbfe;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .assignment-value {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #1e3a5f;
  }
  .assignment-sep {
    color: #93c5fd;
    font-weight: 300;
  }
  .template-badge {
    font-size: 0.5625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #1e40af;
    background: #dbeafe;
    padding: 1px 6px;
    border-radius: 4px;
  }
</style>
