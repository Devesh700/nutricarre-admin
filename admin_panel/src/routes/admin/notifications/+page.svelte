<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';

  let broadcast = $state({
    title: '',
    description: '',
    type: 'alert',
    url: '',
    image_url: ''
  });

  let automation = $state({
    water: { enabled: false, interval_hours: 2 },
    steps: { enabled: false, interval_hours: 4 }
  });

  let loading = $state(false);
  let message = $state({ type: '', text: '' });
  let stats = $state({ total: 0, read: 0 });

  // Achievements state
  let achievements = $state([]);
  let newAchievement = $state({
    title: '',
    description: '',
    metric_type: 'diet_consistency',
    target_value: 7
  });
  let achievementMessage = $state({ type: '', text: '' });
  let isAchievementLoading = $state(false);

  onMount(async () => {
    fetchStats();
    fetchSettings();
    fetchAchievements();
  });

  async function fetchSettings() {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      const water = data.find(s => s.key === 'water_automation');
      const steps = data.find(s => s.key === 'steps_automation');
      if (water) automation.water = water.value;
      if (steps) automation.steps = steps.value;
    }
  }

  async function saveAutomation(type) {
    loading = true;
    const key = type === 'water' ? 'water_automation' : 'steps_automation';
    const value = type === 'water' ? automation.water : automation.steps;
    
    const { error } = await supabase.from('system_settings').upsert({
      key,
      value,
      updated_at: new Date()
    });

    if (error) {
      message = { type: 'error', text: error.message };
    } else {
      message = { type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} automation updated!` };
    }
    loading = false;
  }

  async function fetchStats() {
    const { count: total } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    const { count: read } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', true);
    stats = { total: total || 0, read: read || 0 };
  }

  async function handleBroadcast(e) {
    if (e) e.preventDefault();
    if (!broadcast.title || !broadcast.description) return;
    
    loading = true;
    message = { type: '', text: '' };

    try {
      const { data: users, error: userError } = await supabase.from('profiles').select('id');
      if (userError) throw userError;

      const notifications = users.map(user => ({
        user_id: user.id,
        title: broadcast.title,
        description: broadcast.description,
        type: broadcast.type,
        url: broadcast.type === 'social' ? (broadcast.url || null) : null,
        image_url: broadcast.type === 'social' ? (broadcast.image_url || null) : null
      }));

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      message = { type: 'success', text: `Broadcast sent to ${users.length} users successfully!` };
      broadcast = { title: '', description: '', type: 'alert', url: '', image_url: '' };
      fetchStats();
    } catch (e) {
      message = { type: 'error', text: e.message };
    } finally {
      loading = false;
    }
  }

  async function triggerReminder(type) {
    loading = true;
    message = { type: '', text: '' };

    let title = '';
    let desc = '';
    let nType = 'reminder';

    if (type === 'water') {
      title = '💧 Hydration Check';
      desc = "You're doing great! Don't forget to log your next glass of water to keep your streak alive.";
    } else if (type === 'steps') {
      title = '🏃 Step Goal Update';
      desc = "How are your steps looking? A short walk can help you reach your daily goal!";
    }

    try {
      const { data: users } = await supabase.from('profiles').select('id');
      const notifications = users.map(user => ({
        user_id: user.id,
        title,
        description: desc,
        type: nType,
      }));

      await supabase.from('notifications').insert(notifications);
      message = { type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} reminders sent to all users!` };
      fetchStats();
    } catch (e) {
      message = { type: 'error', text: e.message };
    } finally {
      loading = false;
    }
  }

  // Achievements methods
  async function fetchAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      achievements = data;
    }
  }

  async function handleAddAchievement(e) {
    if (e) e.preventDefault();
    if (!newAchievement.title || !newAchievement.description || newAchievement.target_value <= 0) return;
    
    isAchievementLoading = true;
    achievementMessage = { type: '', text: '' };

    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          title: newAchievement.title,
          description: newAchievement.description,
          metric_type: newAchievement.metric_type,
          target_value: newAchievement.target_value,
          is_active: true
        });

      if (error) throw error;

      achievementMessage = { type: 'success', text: 'Achievement goal created successfully!' };
      newAchievement = { title: '', description: '', metric_type: 'diet_consistency', target_value: 7 };
      await fetchAchievements();
    } catch (err) {
      achievementMessage = { type: 'error', text: err.message };
    } finally {
      isAchievementLoading = false;
    }
  }

  async function toggleAchievement(id, currentStatus) {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchAchievements();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  }

  async function deleteAchievement(id) {
    if (!confirm('Are you sure you want to delete this achievement goal?')) return;
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAchievements();
    } catch (err) {
      alert('Error deleting achievement: ' + err.message);
    }
  }
</script>

<div class="notifications-page">
  <div class="header">
    <h1>App Notifications</h1>
    <p>Manage and broadcast alerts to your users' activity feeds.</p>
  </div>

  <div class="stats-row">
    <div class="stat-card glass">
      <span class="label">Total Notifications Sent</span>
      <span class="value">{stats.total}</span>
    </div>
    <div class="stat-card glass">
      <span class="label">Read Rate</span>
      <span class="value">{stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%</span>
    </div>
    <div class="stat-card glass">
      <span class="label">Active Users</span>
      <span class="value">Direct Broadcast</span>
    </div>
  </div>

  <div class="grid">
    <div class="card glass broadcast-section">
      <h3>Broadcast New Alert</h3>
      <p class="subtitle">This message will appear in the activity feed of all users.</p>

      <form onsubmit={handleBroadcast}>
        {#if message.text}
          <div class="message {message.type}">{message.text}</div>
        {/if}

        <div class="input-group">
          <label for="title">Title</label>
          <input type="text" id="title" bind:value={broadcast.title} placeholder="e.g. System Maintenance" required />
        </div>

        <div class="input-group">
          <label for="desc">Message Content</label>
          <textarea id="desc" bind:value={broadcast.description} placeholder="Enter the details of your notification..." rows="4" required></textarea>
        </div>

        <div class="input-group">
          <label for="type">Notification Type</label>
          <select id="type" bind:value={broadcast.type}>
            <option value="alert">General Alert</option>
            <option value="achievement">Achievement/Motivation</option>
            <option value="social">Social/Community</option>
          </select>
        </div>

        {#if broadcast.type === 'social'}
          <div class="input-group">
            <label for="url">Social Redirect URL</label>
            <input type="url" id="url" bind:value={broadcast.url} placeholder="e.g. https://instagram.com/p/..." required />
          </div>
          <div class="input-group">
            <label for="image_url">Optional Image URL</label>
            <input type="url" id="image_url" bind:value={broadcast.image_url} placeholder="e.g. https://domain.com/photo.jpg" />
          </div>
        {/if}

        <button type="submit" class="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send Broadcast'}
        </button>
      </form>
    </div>

    <div class="quick-actions">
      <div class="card glass">
        <h3>Smart Reminders</h3>
        <p class="subtitle">Trigger predefined prompts to boost engagement.</p>

        <div class="action-buttons">
          <button class="action-btn water" onclick={() => triggerReminder('water')} disabled={loading}>
            <div class="icon">💧</div>
            <div class="text">
              <span class="btn-title">Water Reminder</span>
              <span class="btn-desc">Prompt users to log hydration</span>
            </div>
          </button>

          <button class="action-btn steps" onclick={() => triggerReminder('steps')} disabled={loading}>
            <div class="icon">🏃</div>
            <div class="text">
              <span class="btn-title">Step Progress</span>
              <span class="btn-desc">Encourage daily activity goals</span>
            </div>
          </button>
        </div>
      </div>

      <div class="card glass automation-settings">
        <h3>Automation Schedule</h3>
        <p class="subtitle">Set duration intervals for auto-broadcasting.</p>

        <div class="setting-row">
          <div class="setting-info">
            <div class="title-with-toggle">
              <span class="p-title">Water Reminders</span>
              <input type="checkbox" bind:checked={automation.water.enabled} onchange={() => saveAutomation('water')} />
            </div>
            <div class="interval-input">
              <span>Every</span>
              <input type="number" bind:value={automation.water.interval_hours} min="1" max="24" />
              <span>hours</span>
            </div>
          </div>
          <button class="save-small" onclick={() => saveAutomation('water')}>Update</button>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="title-with-toggle">
              <span class="p-title">Step Progress</span>
              <input type="checkbox" bind:checked={automation.steps.enabled} onchange={() => saveAutomation('steps')} />
            </div>
            <div class="interval-input">
              <span>Every</span>
              <input type="number" bind:value={automation.steps.interval_hours} min="1" max="24" />
              <span>hours</span>
            </div>
          </div>
          <button class="save-small" onclick={() => saveAutomation('steps')}>Update</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Manage Achievement Goals -->
  <div class="achievements-section-container card glass" style="margin-top: 2rem;">
    <h3>Manage Achievement Goals</h3>
    <p class="subtitle">Define rules that automatically trigger achievement notifications when users meet consistency or target weight goals.</p>

    {#if achievementMessage.text}
      <div class="message {achievementMessage.type}">{achievementMessage.text}</div>
    {/if}

    <div class="achievements-grid">
      <div class="achievements-list-container">
        <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">Active Achievement Rules</h4>
        <div class="achievements-list" style="margin-top: 1rem;">
          {#each achievements as achievement}
            <div class="achievement-card">
              <div class="achievement-info-details">
                <span class="achievement-name">{achievement.title}</span>
                <span class="achievement-desc">{achievement.description}</span>
                <span class="achievement-tag">
                  {#if achievement.metric_type === 'diet_consistency'}
                    Diet Consistency: {achievement.target_value} days
                  {:else if achievement.metric_type === 'hydration_streak'}
                    Hydration Streak: {achievement.target_value} days
                  {:else if achievement.metric_type === 'step_streak'}
                    Step Streak: {achievement.target_value} days
                  {:else if achievement.metric_type === 'weight_goal'}
                    Weight Goal Reached
                  {:else}
                    Metric: {achievement.metric_type} ({achievement.target_value})
                  {/if}
                </span>
              </div>
              <div class="achievement-actions">
                <div class="toggle-switch">
                  <span>{achievement.is_active ? 'Active' : 'Inactive'}</span>
                  <input type="checkbox" checked={achievement.is_active} onchange={() => toggleAchievement(achievement.id, achievement.is_active)} aria-label="Toggle achievement active state" />
                </div>
                <button class="delete-btn" onclick={() => deleteAchievement(achievement.id)} aria-label="Delete achievement rule">
                  Delete
                </button>
              </div>
            </div>
          {:else}
            <div class="empty" style="text-align: center; color: var(--text-muted); padding: 2rem; border: 1px dashed var(--border); border-radius: var(--radius);">
              No achievement goals created yet. Use the form to add one!
            </div>
          {/each}
        </div>
      </div>

      <div class="create-achievement-form">
        <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">Create New Achievement Rule</h4>
        <form onsubmit={handleAddAchievement} style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
          <div class="input-group" style="margin-bottom: 0;">
            <label for="ach-title">Title</label>
            <input type="text" id="ach-title" bind:value={newAchievement.title} placeholder="e.g. 🏆 2-Week Diet Streak" required />
          </div>

          <div class="input-group" style="margin-bottom: 0;">
            <label for="ach-desc">Description (Alert Text)</label>
            <textarea id="ach-desc" bind:value={newAchievement.description} placeholder="e.g. Congratulations! You completed 14 days of diet plans in a row!" rows="3" required></textarea>
          </div>

          <div class="input-group" style="margin-bottom: 0;">
            <label for="ach-metric">Evaluation Metric</label>
            <select id="ach-metric" bind:value={newAchievement.metric_type}>
              <option value="diet_consistency">Diet Consistency (Consecutive Days Logged)</option>
              <option value="hydration_streak">Hydration Consistency (Consecutive Days Logged)</option>
              <option value="step_streak">Step Goal Streak (Consecutive Days Completed)</option>
              <option value="weight_goal">Weight Target Reached (Current Weight Meets Target)</option>
            </select>
          </div>

          {#if newAchievement.metric_type !== 'weight_goal'}
            <div class="input-group" style="margin-bottom: 0;">
              <label for="ach-val">Target Value (Days)</label>
              <input type="number" id="ach-val" bind:value={newAchievement.target_value} min="1" required />
            </div>
          {/if}

          <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;" disabled={isAchievementLoading}>
            {isAchievementLoading ? 'Creating...' : 'Create Achievement'}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  .notifications-page { animation: fadeIn 0.3s ease; }
  .header { margin-bottom: 2rem; }
  h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
  p { color: var(--text-muted); font-size: 0.875rem; }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1.25rem;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }

  .stat-card .label { display: block; font-size: 0.6875rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.375rem; }
  .stat-card .value { font-size: 1.5rem; font-weight: 800; color: var(--text); }

  .grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 1.5rem;
  }

  .card {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }

  h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
  .subtitle { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.5rem; }

  .input-group { margin-bottom: 1.25rem; }
  .input-group label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
  
  input, textarea, select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius);
    border: 1.5px solid var(--border);
    background: var(--surface);
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s;
  }

  input:focus, textarea:focus, select:focus {
    border-color: var(--primary-accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .message {
    padding: 0.625rem 0.875rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }
  .message.success { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
  .message.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-accent);
  }

  .action-btn .icon { font-size: 1.25rem; }
  .btn-title { display: block; font-weight: 700; font-size: 0.8125rem; margin-bottom: 0.125rem; color: var(--text); }
  .btn-desc { font-size: 0.6875rem; color: var(--text-muted); }

  .automation-settings { margin-top: 1.5rem; }
  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 0;
    border-bottom: 1px solid var(--border-light);
  }
  .setting-row:last-child { border-bottom: none; }
  .setting-info .p-title { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text); }
  .title-with-toggle { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.375rem; }
  .title-with-toggle input[type="checkbox"] { width: auto; cursor: pointer; }
  .interval-input { display: flex; align-items: center; gap: 0.375rem; font-size: 0.6875rem; color: var(--text-muted); }
  .interval-input input { width: 56px; padding: 0.25rem 0.375rem; text-align: center; }

  .save-small {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    font-size: 0.6875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .save-small:hover { transform: translateY(-1px); background: #1E293B; }

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.8125rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover:not(:disabled) { background: #1E293B; transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .quick-actions { display: flex; flex-direction: column; gap: 1.5rem; }

  /* Achievements styles */
  .achievements-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
  }
  .achievements-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .achievement-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border);
    transition: all 0.2s;
  }
  .achievement-card:hover {
    border-color: var(--primary-accent);
    background: rgba(255, 255, 255, 0.04);
  }
  .achievement-info-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .achievement-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text);
  }
  .achievement-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .achievement-tag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 9999px;
    background: rgba(59, 130, 246, 0.10);
    color: var(--primary-accent);
    width: fit-content;
    margin-top: 0.25rem;
  }
  .achievement-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .delete-btn {
    background: none;
    border: none;
    color: #EF4444;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.375rem 0.5rem;
    border-radius: var(--radius);
    transition: all 0.2s;
  }
  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  .toggle-switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--text-muted);
  }
  .toggle-switch input[type="checkbox"] {
    width: auto;
    cursor: pointer;
  }
</style>
