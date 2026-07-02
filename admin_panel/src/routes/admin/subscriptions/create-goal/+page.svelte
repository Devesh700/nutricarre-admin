<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let name = $state('');
  let description = $state('');
  let icon_name = $state('fitness_center');
  let loading = $state(false);

  async function handleSubmit() {
    loading = true;
    const { error } = await supabase.from('subscription_goals').insert([{ name, description, icon_name }]);
    if (error) alert(error.message);
    else goto('/admin/subscriptions');
    loading = false;
  }
</script>

<div class="form-container">
  <button onclick={() => history.back()} class="back-btn">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    Back to Subscriptions
  </button>

  <div class="glass-card">
    <header class="card-header">
      <h1>Define Clinical Goal</h1>
      <p>Set a primary health objective for your transformation protocols.</p>
    </header>

    <div class="form-grid">
      <div class="input-group">
        <label>Goal Name</label>
        <input 
          bind:value={name}
          placeholder="e.g., Metabolic Weight Loss"
        />
      </div>

      <div class="input-group">
        <label>Primary Icon</label>
        <select bind:value={icon_name}>
          <option value="weight">⚖️ Weight Scale (Weight Loss)</option>
          <option value="fitness_center">💪 Dumbbell (Muscle Build)</option>
          <option value="medical_services">🏥 Medical Kit (Clinical)</option>
          <option value="spa">🌿 Wellness Leaf (Maintenance)</option>
        </select>
      </div>

      <div class="input-group full">
        <label>Clinical Description</label>
        <textarea 
          bind:value={description}
          placeholder="Detail the scientific focus of this goal..."
        ></textarea>
      </div>

      <button 
        onclick={handleSubmit}
        disabled={loading || !name}
        class="submit-btn"
      >
        {loading ? 'Initializing Goal...' : 'Launch Clinical Goal'}
      </button>
    </div>
  </div>
</div>

<style>
  .form-container {
    max-width: 800px;
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
    transition: color 0.2s;
  }

  .back-btn:hover {
    color: #0f172a;
  }

  .glass-card {
    background: white;
    border-radius: 2.5rem;
    padding: 3.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
    border: 1px solid #f1f5f9;
  }

  .card-header {
    margin-bottom: 3rem;
  }

  .card-header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .card-header p {
    color: #64748b;
    margin-top: 0.5rem;
    font-size: 1.1rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .input-group.full {
    grid-column: 1 / -1;
  }

  .input-group label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #94a3b8;
  }

  .input-group input, 
  .input-group select, 
  .input-group textarea {
    padding: 1.25rem;
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 1rem;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;
  }

  .input-group input:focus, 
  .input-group select:focus, 
  .input-group textarea:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  .input-group textarea {
    height: 150px;
    resize: none;
  }

  .submit-btn {
    grid-column: 1 / -1;
    margin-top: 1rem;
    padding: 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 1.25rem;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
  }

  .submit-btn:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.2);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
</style>
