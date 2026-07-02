<!-- DEPRECATED: Replaced by diet-templates/import -->
<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  
  let loading = $state(false);
  let plan = $state({
    name: '',
    subtitle: '',
    target_calories: '',
    description: '',
    protein_target_pct: 30,
    carbs_target_pct: 40,
    fats_target_pct: 30,
    is_template: false
  });

  async function handleSubmit(e) {
    e.preventDefault();
    loading = true;
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .insert([plan])
        .select()
        .single();
      
      if (error) throw error;
      
      // Redirect to the new plan's schedule builder
      goto(`/admin/diets/${data.id}`);
    } catch (err) {
      alert('Error creating plan: ' + err.message);
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
        Back to Protocols
      </a>
      <h1>Create New Diet Plan</h1>
      <p>Define the nutritional parameters and goals for this protocol.</p>
    </div>
  </div>

  <div class="form-container card">
    <form onsubmit={handleSubmit} class="creation-form">
      <div class="form-section">
        <div class="section-header">
          <div class="s-icon">📝</div>
          <div>
            <h3>Basic Information</h3>
            <p>Name and branding for the plan</p>
          </div>
        </div>
        
        <div class="grid-2">
          <div class="form-group full">
            <label>Plan Name</label>
            <input type="text" bind:value={plan.name} placeholder="e.g. Ketogenic Weight Loss" required />
          </div>
          <div class="form-group full">
            <label>Subtitle / Short Goal</label>
            <input type="text" bind:value={plan.subtitle} placeholder="e.g. High-fat, low-carb metabolic focus" />
          </div>
          <div class="form-group full" style="flex-direction: row; align-items: center; gap: 0.75rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
            <input type="checkbox" id="is_template" bind:checked={plan.is_template} style="width: auto; margin: 0; cursor: pointer;" />
            <label for="is_template" style="cursor: pointer; text-transform: none; font-size: 0.875rem; font-weight: 600; color: var(--text);">
              Save as Master Template (36-Week Database Plan)
            </label>
          </div>
          <div class="form-group full">
            <label>Detailed Description</label>
            <textarea bind:value={plan.description} rows="3" placeholder="Explain the therapeutic focus of this plan..."></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <div class="s-icon">🔥</div>
          <div>
            <h3>Nutritional Targets</h3>
            <p>Define caloric and macronutrient distribution</p>
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group full">
            <label>Daily Calorie Target (kcal)</label>
            <input type="number" bind:value={plan.target_calories} placeholder="2000" required />
          </div>
          
          <div class="macro-inputs full">
            <div class="m-input">
              <label>Protein (%)</label>
              <input type="number" bind:value={plan.protein_target_pct} />
              <div class="m-track p" style="width: {plan.protein_target_pct}%"></div>
            </div>
            <div class="m-input">
              <label>Carbs (%)</label>
              <input type="number" bind:value={plan.carbs_target_pct} />
              <div class="m-track c" style="width: {plan.carbs_target_pct}%"></div>
            </div>
            <div class="m-input">
              <label>Fats (%)</label>
              <input type="number" bind:value={plan.fats_target_pct} />
              <div class="m-track f" style="width: {plan.fats_target_pct}%"></div>
            </div>
          </div>
          
          {#if (plan.protein_target_pct + plan.carbs_target_pct + plan.fats_target_pct) !== 100}
            <div class="warning full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Macro distribution sums to {plan.protein_target_pct + plan.carbs_target_pct + plan.fats_target_pct}%. It should ideally be 100%.
            </div>
          {/if}
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn-outline" onclick={() => history.back()}>Cancel</button>
        <button type="submit" class="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Initialize & Build Schedule'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .page { max-width: 800px; margin: 0 auto; }
  
  .page-head { margin-bottom: 2.5rem; }
  .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 700; font-size: 0.8125rem; margin-bottom: 1rem; }
  .back-link:hover { color: var(--primary-accent); }
  
  h1 { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.25rem; }
  p { color: var(--text-muted); font-size: 0.875rem; }

  .form-container { background: white; border-radius: 24px; padding: 2.5rem; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
  
  .form-section { margin-bottom: 3rem; }
  .section-header { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem; }
  .s-icon { width: 40px; height: 40px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
  .section-header h3 { font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 0.125rem; }
  .section-header p { font-size: 0.8125rem; color: var(--text-muted); }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .form-group.full { grid-column: span 2; }
  
  label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  
  input, textarea {
    padding: 0.875rem 1.125rem; border-radius: 14px;
    border: 1.5px solid var(--border); background: var(--bg);
    font-size: 0.9375rem; font-weight: 600; color: var(--text);
    outline: none; transition: all 0.2s;
  }
  input:focus, textarea:focus { border-color: var(--primary-accent); background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08); }

  .macro-inputs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 0.5rem; }
  .m-input { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
  .m-track { height: 4px; border-radius: 99px; position: absolute; bottom: -10px; left: 0; transition: width 0.3s ease; }
  .m-track.p { background: #3B82F6; }
  .m-track.c { background: #10B981; }
  .m-track.f { background: #8B5CF6; }

  .warning {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1rem; background: #FFFBEB; border: 1px solid #FEF3C7;
    border-radius: 12px; color: #B45309; font-size: 0.75rem; font-weight: 600;
  }

  .form-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid var(--border-light); }
  .btn-primary { background: var(--primary-accent); color: white; border: none; padding: 1rem 2rem; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: var(--primary-accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
  .btn-outline { background: white; border: 1.5px solid var(--border); color: var(--text-secondary); padding: 1rem 2rem; border-radius: 14px; font-weight: 700; font-size: 0.9375rem; cursor: pointer; }
</style>
