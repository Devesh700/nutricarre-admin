<!-- DEPRECATED: Replaced by diet-templates/ -->
<script>
	import { supabase } from '$lib/supabase';
	import { invalidateAll } from '$app/navigation';
	let { data } = $props();

	let plan = $derived(data.plan);
	let recipes = $derived(data.recipes);
	let schedule = $derived(data.schedule);

	const categories = ['Early Morning', 'Breakfast', 'Mid Morning', 'Lunch', 'Evening', 'Dinner', 'Post Dinner'];
	let loading = $state(false);
	let showEditModal = $state(false);
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

	const categoryTimes = {
		'Early Morning': '06:00 AM',
		'Breakfast': '08:00 AM',
		'Mid Morning': '10:30 AM',
		'Lunch': '01:30 PM',
		'Evening': '05:00 PM',
		'Dinner': '08:00 PM',
		'Post Dinner': '09:30 PM'
	};

	function handleEditCategoryChange(cat) {
		editForm.meal_category = cat;
		if (categoryTimes[cat]) {
			editForm.meal_time = categoryTimes[cat];
		}
	}

	function handleRecipeSelect(recipeId) {
		const r = recipes.find(rec => rec.id === parseInt(recipeId));
		if (r) {
			editForm.recipe_id = r.id;
			editForm.meal_name = r.name;
			editForm.calories = r.calories;
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
			comments: meal.comments || ''
		};
		showEditModal = true;
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

	async function deleteEntry(id) {
		if (!confirm('Remove this meal from the plan pool?')) return;
		const { error } = await supabase.from('diet_plan_schedule').delete().eq('id', id);
		if (error) alert(error.message);
		else await invalidateAll();
	}

	function getMealsForCategory(cat) {
		return schedule
			.filter((s) => s.meal_category === cat)
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
</script>

<div class="builder-container">
	<!-- Header -->
	<div class="page-head">
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
				<h1>{plan?.name} <span class="tag">Meal Pool</span></h1>
				<p>Curate approved lists of meals for round-robin subscription distribution.</p>
			</div>
		</div>

		<div class="head-right">
			<div class="action-btns">
				<a href="/admin/diets/{plan?.id}/add-meal" class="btn-primary">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
					Add Meal to Pool
				</a>
			</div>
		</div>
	</div>

	<!-- Category Pools Grid -->
	<div class="planner-grid">
		{#each categories as cat}
			{@const meals = getMealsForCategory(cat)}
			<div class="day-col">
				<div class="day-header" style="border-bottom: 2px solid {getCategoryColor(cat).dot}">
					<span class="day-name">{cat}</span>
					<span class="meal-count">{meals.length} items</span>
				</div>

				<div class="meal-canvas">
					{#each meals as meal}
						{@const colors = getCategoryColor(meal.meal_category)}
						<div class="meal-card" role="button" tabindex="0" style="--accent: {colors.dot}; cursor: pointer;" onclick={() => openEditModal(meal)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditModal(meal); } }}>
							<div class="m-top">
								<span class="m-cat" style="background: {colors.bg}; color: {colors.text}">
									<span class="dot" style="background: {colors.dot}"></span>
									{meal.meal_category}
								</span>
								<div class="btn-group">
									<button class="btn-edit" onclick={(e) => { e.stopPropagation(); openEditModal(meal); }} title="Edit meal">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
									</button>
									<button class="btn-del" onclick={(e) => { e.stopPropagation(); deleteEntry(meal.id); }} title="Remove meal">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
										></line></svg
									>
								</button>
								</div>
							</div>

							<div class="m-info">
								<span class="m-time">{meal.meal_time || 'Any Time'}</span>
								<h4 class="m-name">{meal.meal_name || meal.recipes?.name || 'Untitled Meal'}</h4>
								{#if meal.calories || meal.recipes?.calories}
									<span class="m-kcal">
										{Math.round((meal.calories || meal.recipes?.calories || 0) * (meal.quantity || 1))} kcal
										{#if meal.quantity && Number(meal.quantity) !== 1}
											<span class="qty-pill" style="font-size: 0.625rem; font-weight: 700; color: #4B5563; background: #F3F4F6; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">x{meal.quantity}</span>
										{/if}
									</span>
								{/if}
								{#if meal.comments}
									<p class="m-comments">{meal.comments}</p>
								{/if}
							</div>
						</div>
					{:else}
						<div class="empty-state">
							<div class="empty-icon">🍽️</div>
							<p>Empty meal pool</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Edit Meal Modal -->
{#if showEditModal}
	<div class="modal-overlay" onclick={() => (showEditModal = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Edit Pool Meal</h3>
				<button class="btn-close" onclick={() => (showEditModal = false)}>&times;</button>
			</div>
			<div class="modal-body">

				<div class="form-group">
					<label>Select Meal from Library</label>
					<select bind:value={editForm.recipe_id} onchange={(e) => handleRecipeSelect(e.target.value)}>
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
</style>
