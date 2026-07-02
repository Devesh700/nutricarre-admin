<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let plans = $state([]);
  let loading = $state(true);

  const clinicalObjectives = [
    'General',
    'Weight Loss',
    'Muscle Build',
    'Weight Gain',
    'Therapeutic',
    'Vitality & Energy',
    'Medical Condition'
  ];

  let systemSettings = $state({ is_general_plan_enabled: false });
  let settingsLoading = $state(false);

  onMount(async () => {
    await fetchPlans();
    await fetchSettings();
  });

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data) {
      systemSettings = data;
    } else {
      // If no settings exist, create a default row
      const { data: newData } = await supabase
        .from('system_settings')
        .insert([{ is_general_plan_enabled: false }])
        .select()
        .single();
      if (newData) systemSettings = newData;
    }
  }

  async function toggleGeneralMode() {
    if (!systemSettings.id) {
      await fetchSettings();
    }
    
    settingsLoading = true;
    const newValue = !systemSettings.is_general_plan_enabled;
    const { error } = await supabase
      .from('system_settings')
      .update({ is_general_plan_enabled: newValue })
      .eq('id', systemSettings.id);
    
    if (!error) {
      systemSettings.is_general_plan_enabled = newValue;
    } else {
      alert('Error updating settings: ' + error.message);
    }
    settingsLoading = false;
  }

  async function fetchPlans() {
    loading = true;
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) console.error(error);
    else plans = data;
    loading = false;
  }

  async function deletePlan(id) {
    if (!confirm('Delete this plan?')) return;
    const { error } = await supabase.from('subscription_plans').delete().eq('id', id);
    if (!error) fetchPlans();
  }

  function getPlansByObjective(objective) {
    return plans.filter(p => p.target_goal === objective);
  }
</script>

<div class="analytics-container">
  <header class="page-header">
    <div class="title-group">
      <h1>Subscription Strategy</h1>
      <p>Configure clinical plans for each signup objective.</p>
    </div>
    <div class="action-group">
      <div class="mode-toggle" class:active={systemSettings.is_general_plan_enabled}>
        <div class="toggle-info">
          <span class="mode-label">General Plan Mode</span>
          <span class="mode-status">{systemSettings.is_general_plan_enabled ? 'ON' : 'OFF'}</span>
        </div>
        <button 
          class="switch" 
          onclick={toggleGeneralMode} 
          disabled={settingsLoading}
        >
          <div class="slider"></div>
        </button>
      </div>

      <button class="btn-primary" onclick={() => goto('/admin/subscriptions/create-plan')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Plan
      </button>
    </div>
  </header>

  {#if loading}
    <div class="loader-state">
      <div class="spinner"></div>
      <p>Synchronizing subscription metrics...</p>
    </div>
  {:else}
    <div class="goals-stack">
      {#each clinicalObjectives as objective}
        <section class="goal-card glass">
          <div class="goal-header">
            <div class="goal-info">
              <div class="goal-icon">
                {#if objective === 'Weight Loss'}⚖️{:else if objective === 'Medical Condition'}🏥{:else if objective === 'Muscle Build'}💪{:else if objective === 'Weight Gain'}⚖️{:else if objective === 'Therapeutic'}🩺{:else}🌿{/if}
              </div>
              <div>
                <h2>{objective}</h2>
                <p>Payment tiers for users who selected this objective during signup.</p>
              </div>
            </div>
          </div>

          <div class="plans-grid">
            {#each getPlansByObjective(objective) as plan}
              <div class="plan-item" class:popular={plan.is_popular}>
                {#if plan.is_popular}
                  <div class="popular-badge">Top Performer</div>
                {/if}
                
                <div class="plan-main">
                  <h3>{plan.name}</h3>
                  <div class="price">
                    <span class="currency">₹</span>
                    <span class="amount">{plan.price}</span>
                  </div>
                </div>

                <div class="plan-details">
                  <div class="duration">{plan.duration_months} Month Protocol</div>
                  <ul class="features">
                    {#each plan.features as feature}
                      <li>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        {feature}
                      </li>
                    {/each}
                  </ul>
                </div>

                <div class="card-actions">
                  <button class="edit-btn" onclick={() => goto(`/admin/subscriptions/edit/${plan.id}`)}>Edit Plan</button>
                  <button class="remove-btn" onclick={() => deletePlan(plan.id)}>Delete</button>
                </div>
              </div>
            {:else}
              <div class="empty-plans">No plans created for this objective yet.</div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}
</div>

<style>
  .analytics-container {
    animation: fadeIn 0.3s ease;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .title-group h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
  }

  .title-group p {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  .action-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mode-toggle {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.2s;
  }
  .mode-toggle.active {
    background: #EFF6FF;
    border-color: var(--primary-accent);
  }

  .toggle-info { display: flex; flex-direction: column; }
  .mode-label {
    font-size: 0.625rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.04em; color: var(--text-muted);
  }
  .mode-status { font-size: 0.8125rem; font-weight: 800; color: var(--text); }
  .mode-toggle.active .mode-status { color: var(--primary-accent); }

  .switch {
    width: 44px; height: 22px; background: #CBD5E1; border-radius: 99px;
    border: none; cursor: pointer; position: relative; padding: 0; transition: all 0.2s;
  }
  .mode-toggle.active .switch { background: var(--primary-accent); }
  .slider {
    width: 16px; height: 16px; background: white; border-radius: 50%;
    position: absolute; left: 3px; top: 3px; transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  .mode-toggle.active .slider { left: 25px; }
  .switch:disabled { opacity: 0.5; cursor: not-allowed; }

  .goals-stack {
    display: flex; flex-direction: column; gap: 1.5rem;
  }

  .glass {
    background: white;
    border: 1px solid var(--border-light);
  }

  .goal-card {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }

  .goal-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);
  }

  .goal-info { display: flex; gap: 1rem; align-items: center; }
  .goal-icon {
    width: 48px; height: 48px; background: var(--bg); border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  }
  .goal-info h2 { font-size: 1.125rem; font-weight: 700; color: var(--text); margin: 0; }
  .goal-info p { color: var(--text-muted); font-size: 0.8125rem; margin-top: 2px; }

  .plans-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;
  }

  .plan-item {
    background: white; border: 1px solid var(--border-light); border-radius: var(--radius-lg);
    padding: 1.25rem; position: relative; display: flex; flex-direction: column;
    transition: all 0.15s;
  }
  .plan-item:hover { border-color: var(--primary-accent); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .plan-item.popular { border: 2px solid var(--primary-accent); background: #FAFBFF; }

  .popular-badge {
    position: absolute; top: -10px; left: 1.25rem;
    background: var(--primary-accent); color: white;
    font-size: 0.5625rem; font-weight: 700; text-transform: uppercase;
    padding: 0.1875rem 0.625rem; border-radius: 99px; letter-spacing: 0.04em;
  }

  .plan-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .plan-main h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
  .price { display: flex; align-items: flex-start; color: var(--primary-accent); }
  .currency { font-size: 0.875rem; font-weight: 600; margin-top: 2px; margin-right: 1px; }
  .amount { font-size: 1.5rem; font-weight: 800; }

  .duration {
    font-size: 0.6875rem; font-weight: 700; color: var(--text-muted);
    margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.04em;
  }

  .features { list-style: none; padding: 0; margin: 0 0 1.25rem 0; flex-grow: 1; }
  .features li {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.5rem;
  }
  .features li svg { color: var(--success); flex-shrink: 0; }

  .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: auto; }
  .edit-btn {
    padding: 0.5rem; background: var(--primary); color: white; border: none;
    border-radius: var(--radius); font-weight: 600; font-size: 0.75rem; cursor: pointer;
    transition: all 0.15s;
  }
  .edit-btn:hover { background: #1E293B; }
  .remove-btn {
    padding: 0.5rem; background: transparent; border: 1px solid var(--border-light);
    border-radius: var(--radius); color: var(--text-muted); font-weight: 600;
    font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
  }
  .remove-btn:hover { background: #FEF2F2; color: var(--danger); border-color: #FECACA; }

  .loader-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 300px; gap: 1rem;
  }
  .loader-state p { color: var(--text-muted); font-size: 0.875rem; }

  .empty-plans {
    grid-column: 1 / -1; text-align: center; padding: 2rem;
    color: var(--text-muted); font-size: 0.8125rem;
    background: var(--bg); border-radius: var(--radius);
  }
</style>
