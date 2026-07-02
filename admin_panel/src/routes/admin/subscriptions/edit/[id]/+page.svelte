<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let id = page.params.id;
  let name = $state('');
  let target_goal = $state('Weight Loss');
  let diet_plan_id = $state('');
  let price = $state(999);
  let duration_months = $state(3);
  let is_popular = $state(false);
  let featureInput = $state('');
  let features = $state([]);
  let loading = $state(true);
  let dietPlans = $state([]);
  let dietTemplates = $state([]);
  let diet_template_id = $state('');
  let accessible_weeks = $state(8);
  let assignment_mode = $state('round_robin');
  let fixed_start_week = $state(null);
  let useTemplate = $state(false);

  const clinicalGoals = [
    'General',
    'Weight Loss',
    'Muscle Build',
    'Weight Gain',
    'Therapeutic',
    'Vitality & Energy',
    'Medical Condition'
  ];

  onMount(async () => {
    // 1. Fetch Plan Data
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (planError) {
      alert('Plan not found');
      goto('/admin/subscriptions');
      return;
    }

    name = plan.name;
    target_goal = plan.target_goal;
    diet_plan_id = plan.diet_plan_id || '';
    price = plan.price;
    duration_months = plan.duration_months;
    is_popular = plan.is_popular;
    features = plan.features || [];

    // 2. New template fields
    diet_template_id = plan.diet_template_id || '';
    accessible_weeks = plan.accessible_weeks || 8;
    assignment_mode = plan.assignment_mode || 'round_robin';
    fixed_start_week = plan.fixed_start_week || null;
    useTemplate = !!plan.diet_template_id;

    // 3. Fetch Diet Plans & Templates
    const [dietsRes, templatesRes] = await Promise.all([
      supabase.from('diet_plans').select('id, name'),
      supabase.from('diet_templates').select('id, diet_name, diet_code, total_weeks')
    ]);
    dietPlans = dietsRes.data || [];
    dietTemplates = templatesRes.data || [];
    
    loading = false;
  });

  function addFeature() {
    if (!featureInput) return;
    features = [...features, featureInput];
    featureInput = '';
  }

  function removeFeature(index) {
    features = features.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    loading = true;
    const updateData = {
      target_goal, name, price, duration_months, features, is_popular,
      diet_plan_id: diet_plan_id || null
    };
    if (useTemplate) {
      updateData.diet_template_id = diet_template_id || null;
      updateData.accessible_weeks = accessible_weeks;
      updateData.assignment_mode = assignment_mode;
      updateData.fixed_start_week = assignment_mode === 'fixed' ? fixed_start_week : null;
    } else {
      updateData.diet_template_id = null;
    }
    const { error } = await supabase.from('subscription_plans').update(updateData).eq('id', id);

    if (error) alert(error.message);
    else goto('/admin/subscriptions');
    loading = false;
  }
</script>

<div class="form-container large">
  <button onclick={() => history.back()} class="back-btn">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    Back to Subscriptions
  </button>

  {#if loading}
    <div class="glass-card center">
      <div class="spinner"></div>
      <p>Retrieving plan configuration...</p>
    </div>
  {:else}
    <div class="glass-card dual-grid">
      <div class="form-section">
        <header class="card-header">
          <h1>Update Protocol</h1>
          <p>Modify the pricing, duration, or bundled clinical strategy.</p>
        </header>

        <div class="form-stack">
          <div class="input-group">
            <label for="target-goal">Target Signup Objective</label>
            <select id="target-goal" bind:value={target_goal}>
              {#each clinicalGoals as goal}
                <option value={goal}>{goal}</option>
              {/each}
            </select>
          </div>

          <div class="input-group">
            <label class="checkbox-group" style="margin-bottom:0.5rem;">
              <input type="checkbox" bind:checked={useTemplate} />
              <span>Use Diet Template System (New)</span>
            </label>
          </div>

          {#if useTemplate}
            <div class="input-group">
              <label for="diet-template">Diet Template</label>
              <select id="diet-template" bind:value={diet_template_id}>
                <option value="">Select Template</option>
                {#each dietTemplates as t}
                  <option value={t.id}>{t.diet_name} ({t.diet_code}) - {t.total_weeks} weeks</option>
                {/each}
              </select>
            </div>
            <div class="input-row">
              <div class="input-group">
                <label for="accessible-weeks">Accessible Weeks</label>
                <input id="accessible-weeks" type="number" bind:value={accessible_weeks} min="1" />
              </div>
              <div class="input-group">
                <label for="assignment-mode">Assignment Mode</label>
                <select id="assignment-mode" bind:value={assignment_mode}>
                  <option value="round_robin">Round Robin</option>
                  <option value="random">Random</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
            {#if assignment_mode === 'fixed'}
              <div class="input-group">
                <label for="fixed-start">Fixed Start Week</label>
                <input id="fixed-start" type="number" bind:value={fixed_start_week} min="1" />
              </div>
            {/if}
          {:else}
            <div class="input-group">
              <label for="bundle-diet">Bundle Diet Plan (Legacy)</label>
              <select id="bundle-diet" bind:value={diet_plan_id}>
                <option value="">No Bundle</option>
                {#each dietPlans as plan}
                  <option value={plan.id}>{plan.name}</option>
                {/each}
              </select>
            </div>
          {/if}

          <div class="input-group">
            <label for="tier-name">Tier Name</label>
            <input id="tier-name" bind:value={name} placeholder="e.g., Premium Transformation" />
          </div>

          <div class="input-row">
            <div class="input-group">
              <label for="price">Price (₹)</label>
              <input id="price" type="number" bind:value={price} />
            </div>
            <div class="input-group">
              <label for="months">Months</label>
              <input id="months" type="number" bind:value={duration_months} />
            </div>
          </div>

          <label class="checkbox-group">
            <input type="checkbox" bind:checked={is_popular} />
            <span>Mark as "Top Performer"</span>
          </label>
        </div>
      </div>

      <div class="feature-section">
        <h3 class="section-label">Protocol Benefits</h3>
        <div class="add-feature">
          <input 
            bind:value={featureInput} 
            placeholder="Add clinical benefit..." 
            onkeydown={e => e.key === 'Enter' && addFeature()}
          />
          <button class="add-btn" onclick={addFeature}>+</button>
        </div>

        <div class="feature-list">
          {#each features as feature, i}
            <div class="feature-pill">
              <span>{feature}</span>
              <button class="pill-remove" onclick={() => removeFeature(i)}>×</button>
            </div>
          {/each}
        </div>

        <button 
          onclick={handleSubmit}
          disabled={loading || !name}
          class="submit-btn"
        >
          {loading ? 'Saving Changes...' : 'Synchronize Updates'}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .form-container {
    max-width: 1000px;
    margin: 4rem auto;
    padding: 0 2rem;
    font-family: 'Inter', sans-serif;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: transparent;
    border: none;
    color: #64748b;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    margin-bottom: 2rem;
  }

  .glass-card {
    background: white;
    border-radius: 3rem;
    padding: 3rem;
    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.1);
    border: 1px solid #f1f5f9;
    overflow: hidden;
  }

  .dual-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 3rem;
  }

  .card-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .card-header p {
    color: #64748b;
    margin: 0.5rem 0 2rem 0;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .form-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label, .section-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
  }

  .input-group input, .input-group select {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;
    width: 100%;
  }

  .input-group input:focus, .input-group select:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 1rem;
    cursor: pointer;
    font-weight: 700;
    color: #1e293b;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .checkbox-group:hover {
    background: #e2e8f0;
  }

  .checkbox-group input {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #2563eb;
  }

  .feature-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .add-feature {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0 1.5rem 0;
  }

  .add-feature input {
    flex: 1;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    outline: none;
    font-size: 0.9rem;
    min-width: 0;
  }

  .add-btn {
    width: 48px;
    height: 48px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 1rem;
    font-weight: 800;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .feature-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    max-height: 280px;
    padding-right: 0.5rem;
  }

  .feature-pill {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #eff6ff;
    border-radius: 0.75rem;
    font-weight: 700;
    color: #1e40af;
    font-size: 0.85rem;
  }

  .pill-remove {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    color: #93c5fd;
    cursor: pointer;
    line-height: 1;
    margin-left: 0.5rem;
  }

  .pill-remove:hover {
    color: #ef4444;
  }

  .submit-btn {
    margin-top: 2rem;
    padding: 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 1.25rem;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 20px 30px -10px rgba(37, 99, 235, 0.3);
  }

  .submit-btn:hover {
    background: #1d4ed8;
    transform: translateY(-3px);
    box-shadow: 0 30px 40px -10px rgba(37, 99, 235, 0.4);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 1rem;
    color: #64748b;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f1f5f9;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
