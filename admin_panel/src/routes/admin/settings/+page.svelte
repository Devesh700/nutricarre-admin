<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';

  let profile = $state({
    full_name: '',
    email: '',
  });
  let loading = $state(true);
  let saving = $state(false);
  let message = $state({ type: '', text: '' });

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        profile = {
          full_name: data.full_name || '',
          email: user.email || '',
        };
      } else {
        profile.email = user.email;
      }
    }
    loading = false;
  });

  async function handleSave() {
    saving = true;
    message = { type: '', text: '' };
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      updated_at: new Date()
    });

    if (error) {
      message = { type: 'error', text: error.message };
    } else {
      message = { type: 'success', text: 'Profile updated successfully!' };
    }
    saving = false;
  }
</script>

<div class="page" style="animation: fadeIn 0.3s ease">
  <div class="page-header">
    <h1>Settings</h1>
    <p>Manage your account and application preferences.</p>
  </div>

  <div class="grid">
    <!-- Profile Card -->
    <div class="card">
      <div class="card-title">
        <span class="card-icon">👤</span>
        <div>
          <h3>Admin Profile</h3>
          <p class="sub">Update your personal information</p>
        </div>
      </div>
      
      {#if loading}
        <div class="loading"><div class="spinner"></div> Loading profile...</div>
      {:else}
        <form onsubmit={handleSave}>
          {#if message.text}
            <div class="msg" class:success={message.type === 'success'} class:error={message.type === 'error'}>
              {message.text}
            </div>
          {/if}

          <div class="field">
            <label for="full-name">Full Name</label>
            <input type="text" id="full-name" bind:value={profile.full_name} placeholder="Enter your name" />
          </div>

          <div class="field">
            <label for="email">Email Address</label>
            <input type="email" id="email" bind:value={profile.email} disabled />
            <span class="hint">Email cannot be changed from here.</span>
          </div>

          <button type="submit" class="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      {/if}
    </div>

    <!-- Preferences Card -->
    <div class="card">
      <div class="card-title">
        <span class="card-icon">⚙️</span>
        <div>
          <h3>System Preferences</h3>
          <p class="sub">General application settings</p>
        </div>
      </div>
      
      <div class="pref">
        <div>
          <span class="pref-name">Email Notifications</span>
          <span class="pref-desc">Receive alerts for new user registrations</span>
        </div>
        <button class="toggle" aria-label="Toggle notifications"></button>
      </div>

      <div class="pref">
        <div>
          <span class="pref-name">Maintenance Mode</span>
          <span class="pref-desc">Temporarily disable user access</span>
        </div>
        <button class="toggle" aria-label="Toggle maintenance"></button>
      </div>

      <div class="pref">
        <div>
          <span class="pref-name">Dark Mode</span>
          <span class="pref-desc">Switch to dark interface (coming soon)</span>
        </div>
        <button class="toggle" disabled aria-label="Toggle dark mode"></button>
      </div>
    </div>
  </div>
</div>

<style>
  .page-header { margin-bottom: 1.5rem; }
  .page-header h1 { font-size: 1.75rem; font-weight: 800; margin: 0; }
  .page-header p { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .card {
    background: white;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-light);
  }
  .card-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    background: var(--bg);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-title h3 { font-size: 1rem; margin: 0; }
  .sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

  .field { margin-bottom: 1.25rem; }
  .field input:disabled {
    background: var(--bg);
    color: var(--text-muted);
    cursor: not-allowed;
  }
  .hint { font-size: 0.6875rem; color: var(--text-muted); margin-top: 0.375rem; display: block; }

  .msg {
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }
  .msg.success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
  .msg.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

  .loading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 0;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  /* Preferences */
  .pref {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-light);
  }
  .pref:last-child { border-bottom: none; }

  .pref-name { display: block; font-weight: 600; font-size: 0.875rem; color: var(--text); }
  .pref-desc { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
