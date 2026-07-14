<!-- DEPRECATED: Replaced by diet-templates/ -->
<script>
	import { supabase } from '$lib/supabase';
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	let plan = $derived(data.plan);
	let recipes = $derived(data.recipes);
	let schedule = $derived(data.schedule || []);

	const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	const categories = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];
	
	let currentWeek = $state(1);
	let loading = $state(false);
	
	let showEditModal = $state(false);
	let showAddModal = $state(false);
	
	let targetDayForAdd = $state(null);
	let targetCategoryForAdd = $state('');

	let editForm = $state({
		id: null,
		meal_name: '',
		meal_time: '',
		meal_category: '',
		recipe_id: null,
		calories: 0,
		quantity: 1.0,
		comments: '',
		week_number: 1,
		day_of_week: 1
	});

	let addForm = $state({
		meal_name: '',
		meal_time: '08:00 AM',
		meal_category: 'Breakfast',
		recipe_id: null,
		calories: 0,
		quantity: 1.0,
		comments: ''
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

	// Calculated total weeks based on existing schedule items
	let totalWeeks = $derived(
		schedule.reduce((max, s) => Math.max(max, s.week_number || 0), 0)
	);

	// Derived state for unscheduled pool meals (legacy records with null week or day)
	let unscheduledMeals = $derived(
		schedule.filter(s => s.week_number === null || s.day_of_week === null)
	);

	function handleEditCategoryChange(cat) {
		editForm.meal_category = cat;
		if (categoryTimes[cat]) {
			editForm.meal_time = categoryTimes[cat];
		}
	}

	function handleAddCategoryChange(cat) {
		addForm.meal_category = cat;
		if (categoryTimes[cat]) {
			addForm.meal_time = categoryTimes[cat];
		}
	}

	function handleRecipeSelectForEdit(recipeId) {
		const r = recipes.find(rec => rec.id === parseInt(recipeId));
		if (r) {
			editForm.recipe_id = r.id;
			editForm.meal_name = r.name;
			editForm.calories = r.calories;
		} else {
			editForm.recipe_id = null;
		}
	}

	function handleRecipeSelectForAdd(recipeId) {
		const r = recipes.find(rec => rec.id === parseInt(recipeId));
		if (r) {
			addForm.recipe_id = r.id;
			addForm.meal_name = r.name;
			addForm.calories = r.calories;
		} else {
			addForm.recipe_id = null;
		}
	}

	function openEditModal(meal) {
		editForm = {
			id: meal.id,
			meal_name: meal.meal_name || '',
			meal_time: meal.meal_time || '08:00 AM',
			meal_category: meal.meal_category || 'Breakfast',
			recipe_id: meal.recipe_id,
			calories: meal.calories || 0,
			quantity: parseFloat(meal.quantity) || 1.0,
			comments: meal.comments || '',
			week_number: meal.week_number || currentWeek || 1,
			day_of_week: meal.day_of_week || 1
		};
		showEditModal = true;
	}

	function openAddModal(dayIndex, category) {
		targetDayForAdd = dayIndex + 1; // 1-indexed (Monday is 1)
		targetCategoryForAdd = category;
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

	async function saveEdit() {
		loading = true;
		try {
			const { error } = await supabase
				.from('diet_plan_schedule')
				.update({
					meal_name: editForm.meal_name,
					meal_time: editForm.meal_time,
					meal_category: editForm.meal_category,
					recipe_id: editForm.recipe_id,
					calories: parseInt(editForm.calories) || 0,
					quantity: parseFloat(editForm.quantity) || 1.0,
					comments: editForm.comments,
					week_number: parseInt(editForm.week_number) || 1,
					day_of_week: parseInt(editForm.day_of_week) || 1
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
				.from('diet_plan_schedule')
				.insert([{
					plan_id: plan.id,
					meal_category: addForm.meal_category,
					meal_time: addForm.meal_time,
					recipe_id: addForm.recipe_id,
					meal_name: addForm.meal_name,
					calories: parseInt(addForm.calories) || 0,
					quantity: parseFloat(addForm.quantity) || 1.0,
					comments: addForm.comments,
					day_of_week: targetDayForAdd,
					week_number: currentWeek
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

	async function deleteEntry(id) {
		if (!confirm('Remove this meal from the plan?')) return;
		const { error } = await supabase.from('diet_plan_schedule').delete().eq('id', id);
		if (error) alert(error.message);
		else await invalidateAll();
	}

	function getMealsForCell(dayIndex, category) {
		return schedule
			.filter((s) => 
				s.week_number === currentWeek && 
				s.day_of_week === (dayIndex + 1) && 
				s.meal_category === category
			)
			.sort((a, b) => {
				const timeA = a.meal_time?.includes('PM') && !a.meal_time?.startsWith('12') ? 12 : 0;
				const hourA = parseInt(a.meal_time?.split(':')[0] || '0') + timeA;
				const timeB = b.meal_time?.includes('PM') && !b.meal_time?.startsWith('12') ? 12 : 0;
				const hourB = parseInt(b.meal_time?.split(':')[0] || '0') + timeB;
				return hourA - hourB;
			});
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
</script>

<div class="builder-container">
	<!-- Header -->
	<div class="page-head" style="align-items: center;">
		<div class="head-left">
			<a href="/admin/diets" class="back-link">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg
				>
				Back to Diet Plans
			</a>
			<div class="title-wrap">
				<h1>{plan?.name} <span class="tag">Weekly Matrix</span></h1>
				<p>Curate scheduled week-by-week meals for subscribers.</p>
			</div>
		</div>

		<div class="head-right" style="flex-direction: row; gap: 1rem; align-items: center;">
			<!-- Weekly Navigation -->
			<div class="week-pill shadow-sm" style="display: flex; align-items: center; background: white; border: 1px solid var(--border); padding: 0.25rem; border-radius: 99px; gap: 0.25rem;">
				<button 
					class="nav-btn" 
					onclick={() => currentWeek = Math.max(1, currentWeek - 1)}
					disabled={currentWeek === 1}
				>
					◀
				</button>
				<div class="week-info" style="text-align: center; min-width: 100px; display: flex; flex-direction: column; align-items: center; padding: 0 0.5rem;">
					<span class="label" style="font-size: 0.5625rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Active Week</span>
					<span class="val" style="font-size: 0.8125rem; font-weight: 800; color: var(--text);">Week {currentWeek}</span>
				</div>
				<button 
					class="nav-btn" 
					onclick={() => currentWeek++}
				>
					▶
				</button>
			</div>

			<div class="action-btns">
				<a href="/admin/diets/{plan?.id}/add-meal" class="btn-outline">
					Legacy Add Page
				</a>
			</div>
		</div>
	</div>

	<!-- Weekly Matrix Planner Grid -->
	<div class="matrix-grid-wrapper shadow-sm" style="border: 1px solid var(--border); border-radius: var(--radius-lg); background: white; overflow: hidden; margin-top: 1.5rem;">
		<div class="matrix-grid">
			<!-- Headers -->
			<div class="matrix-header-cell corner-cell">
				<span class="main-label">Slots Menu</span>
				<span class="sub-label">Weekly View</span>
			</div>
			{#each days as day, i}
				<div class="matrix-header-cell day-header-cell" style="text-align: center;">
					<span class="day-name">{day}</span>
				</div>
			{/each}

			<!-- Rows -->
			{#each categories as category}
				<div class="matrix-category-cell">
					<span class="cat-icon">{getCategoryIcon(category)}</span>
					<div class="cat-meta">
						<span class="cat-name">{category}</span>
						<span class="cat-time">{categoryTimes[category]}</span>
					</div>
				</div>

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
											<div class="card-action-btns">
												<button class="btn-card-edit" onclick={(e) => { e.stopPropagation(); openEditModal(meal); }} title="Edit meal">
													✏️
												</button>
												<button class="btn-card-delete" onclick={(e) => { e.stopPropagation(); deleteEntry(meal.id); }} title="Remove meal">
													🗑️
												</button>
											</div>
										</div>
										<h4 class="meal-title-text" style="font-size: 0.75rem; font-weight: 700; margin: 2px 0 4px 0;">{meal.meal_name || meal.recipes?.name || 'Untitled Meal'}</h4>
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
								<button class="btn-add-inline-plus" onclick={() => openAddModal(i, category)}>
									+ Add Item
								</button>
							</div>
						{:else}
							<button class="btn-empty-matrix-slot" onclick={() => openAddModal(i, category)} style="min-height: 80px; width: 100%;">
								<span class="slot-plus-char" style="font-size: 1rem;">+</span>
								<span class="slot-plus-lbl" style="font-size: 0.5625rem;">Add</span>
							</button>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>

	<!-- Unscheduled Pool (Legacy Items) -->
	{#if unscheduledMeals.length > 0}
		<div class="unscheduled-section card glass" style="margin-top: 2.5rem; padding: 1.5rem; border: 1px dashed var(--border); background: rgba(0,0,0,0.01);">
			<h3 style="font-size: 1rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
				<span>⚠️</span> Unscheduled Meals Pool ({unscheduledMeals.length})
			</h3>
			<p class="subtitle" style="margin-bottom: 1.25rem;">These legacy meals are not assigned to a week or day. Edit them to assign them to the matrix grid.</p>
			
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
				{#each unscheduledMeals as meal}
					{@const colors = getCategoryColor(meal.meal_category)}
					<div class="matrix-meal-card animate-in" style="border-left: 4px solid {colors.dot}; background: white; padding: 0.75rem;" onclick={() => openEditModal(meal)} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditModal(meal); } }}>
						<div class="meal-card-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem;">
							<span class="meal-time" style="font-size: 0.625rem; font-weight: 800; color: var(--text-muted);">{meal.meal_category}</span>
							<div class="card-action-btns">
								<button class="btn-card-edit" onclick={(e) => { e.stopPropagation(); openEditModal(meal); }} title="Edit meal">✏️</button>
								<button class="btn-card-delete" onclick={(e) => { e.stopPropagation(); deleteEntry(meal.id); }} title="Delete meal">🗑️</button>
							</div>
						</div>
						<h4 style="font-size: 0.75rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem;">{meal.meal_name || meal.recipes?.name || 'Untitled Meal'}</h4>
						<span class="meal-kcal-badge" style="font-size: 0.625rem; font-weight: 800; color: var(--primary-accent); background: var(--primary-accent-light); padding: 1px 5px; border-radius: 4px;">
							{Math.round((meal.calories || meal.recipes?.calories || 0) * (meal.quantity || 1))} kcal
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Edit Meal Modal -->
{#if showEditModal}
	<div class="modal-overlay" onclick={() => (showEditModal = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Edit Pool Meal</h3>
				<button class="btn-close" onclick={() => (showEditModal = false)}>&times;</button>
			</div>
			<div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding-right: 0.5rem;">

				<div class="form-group">
					<label>Select Meal from Library</label>
					<select value={editForm.recipe_id || ''} onchange={(e) => handleRecipeSelectForEdit(e.target.value)}>
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

				<div class="form-row">
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

				<div class="form-row">
					<div class="form-group">
						<label>Calories (kcal)</label>
						<input type="number" bind:value={editForm.calories} required />
					</div>
					<div class="form-group">
						<label>Quantity / Multiplier</label>
						<input type="number" step="0.05" bind:value={editForm.quantity} required />
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label>Week Number</label>
						<input type="number" bind:value={editForm.week_number} min="1" required />
					</div>
					<div class="form-group">
						<label>Day of Week</label>
						<select bind:value={editForm.day_of_week}>
							{#each days as day, index}
								<option value={index + 1}>{day}</option>
							{/each}
						</select>
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
				<h3>Add Meal to Plan</h3>
				<button class="btn-close" onclick={() => (showAddModal = false)}>&times;</button>
			</div>
			<div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding-right: 0.5rem;">

				<div class="form-group">
					<label>Select Meal from Library</label>
					<select value={addForm.recipe_id || ''} onchange={(e) => handleRecipeSelectForAdd(e.target.value)}>
						<option value="">-- Custom Meal (No Recipe Link) --</option>
						{#each recipes as rec}
							<option value={rec.id}>{rec.name} ({rec.calories} kcal)</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label>Meal Name</label>
					<input type="text" bind:value={addForm.meal_name} required />
				</div>

				<div class="form-row">
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

				<div class="form-row">
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
	}

	/* Header */
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
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}
	.title-wrap .tag {
		font-size: 0.6875rem;
		font-weight: 800;
		padding: 0.25rem 0.625rem;
		background: #eff6ff;
		color: #3b82f6;
		border-radius: 6px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.title-wrap p {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.head-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
	}

	.week-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		padding: 0.375rem;
		border-radius: 99px;
		box-shadow: var(--shadow-sm);
	}
	.nav-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: var(--bg);
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

	.week-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 1rem;
		min-width: 120px;
	}
	.week-info .label {
		font-size: 0.625rem;
		font-weight: 800;
		color: var(--text-muted);
		letter-spacing: 0.05em;
	}
	.week-info .val {
		font-size: 0.875rem;
		font-weight: 800;
		color: var(--text);
	}

	.action-btns {
		display: flex;
		gap: 0.75rem;
	}

	/* Grid */
	.planner-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1rem;
		align-items: flex-start;
	}

	.day-col {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		min-height: 500px;
	}

	.day-header {
		padding: 0.875rem 1rem;
		background: var(--bg);
		border-bottom: 1px solid var(--border-light);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.day-name {
		font-size: 0.75rem;
		font-weight: 800;
		color: var(--text);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.meal-count {
		font-size: 0.625rem;
		font-weight: 700;
		color: var(--text-muted);
		background: white;
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid var(--border-light);
	}

	.meal-canvas {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.meal-card {
		background: white;
		border: 1px solid var(--border-light);
		border-radius: 12px;
		padding: 0.75rem;
		position: relative;
		transition: all 0.2s;
		border-left: 3px solid var(--accent);
	}
	.meal-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--accent);
	}

	.m-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}
	.m-cat {
		font-size: 0.625rem;
		font-weight: 800;
		padding: 2px 8px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.m-cat .dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
	}

	.btn-group {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.meal-card:hover .btn-group {
		opacity: 1;
	}

	.btn-edit,
	.btn-del {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.btn-edit:hover {
		background: #eff6ff;
		color: #3b82f6;
	}
	.btn-del:hover {
		background: #fef2f2;
		color: #ef4444;
	}

	.m-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.m-time {
		font-size: 0.6875rem;
		font-weight: 800;
		color: var(--text-muted);
	}
	.m-name {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--text);
		line-height: 1.3;
	}
	.m-kcal {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--primary-accent);
		margin-bottom: 0.25rem;
	}
	.m-comments {
		font-size: 0.6875rem;
		font-style: italic;
		color: var(--text-muted);
		border-top: 1px dashed var(--border-light);
		margin-top: 0.5rem;
		padding-top: 0.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.empty-icon {
		font-size: 1.5rem;
		opacity: 0.5;
	}
	.empty-state p {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--text-muted);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(6px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}
	.modal {
		background: var(--surface);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 480px;
		box-shadow: var(--shadow-lg);
		animation: fadeIn 0.2s ease;
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

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	.number-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--bg);
		padding: 0.5rem;
		border-radius: 12px;
		border: 1.5px solid var(--border);
	}
	.n-btn {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: none;
		background: white;
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
		color: var(--primary-accent);
		box-shadow: var(--shadow-sm);
	}
	.number-input input {
		flex: 1;
		text-align: center;
		background: none;
		border: none;
		font-size: 1rem;
		font-weight: 800;
		color: var(--text);
		-moz-appearance: textfield;
	}
	.number-input input::-webkit-outer-spin-button,
	.number-input input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.hint {
		font-size: 0.6875rem;
		color: var(--text-muted);
		font-weight: 600;
		margin-top: 0.5rem;
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

	.btn-primary {
		background: var(--primary-accent);
		color: white;
		border: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 10px;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
	}
	.btn-primary:hover {
		background: var(--primary-accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
	}
	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.btn-outline {
		background: var(--surface);
		color: var(--text-secondary);
		border: 1.5px solid var(--border);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 10px;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
	}
	.btn-outline:hover {
		border-color: var(--primary-accent);
		color: var(--primary-accent);
		background: var(--bg);
	}

	@media (max-width: 1400px) {
		.planner-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	@media (max-width: 900px) {
		.planner-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	/* Weekly Matrix styles */
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
	.card-action-btns {
		display: flex;
		gap: 0.125rem;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.matrix-meal-card:hover .card-action-btns {
		opacity: 1;
	}
	.btn-card-edit,
	.btn-card-delete {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.6875rem;
		padding: 1px 3px;
		border-radius: 3px;
	}
	.btn-card-edit:hover { background: #eff6ff; }
	.btn-card-delete:hover { background: #fef2f2; }

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
	.btn-empty-matrix-slot {
		border: 1px dashed var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		transition: all 0.2s;
	}
	.btn-empty-matrix-slot:hover {
		border-color: var(--primary-accent);
		color: var(--primary-accent);
		background: var(--primary-accent-light);
	}
</style>
