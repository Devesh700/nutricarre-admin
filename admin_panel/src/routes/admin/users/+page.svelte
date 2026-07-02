<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { applyAction, deserialize } from '$app/forms';

  let { data, form } = $props();
  let users = $derived(data.users || []);
  let subscriptionPlans = $derived(data.subscriptionPlans || []);
  let currentUser = $state(null);

  let loading = $state(false);
  let selectedUser = $state(null);
  let showAssignModal = $state(false);
  let showDeleteModal = $state(false);
  let userToDelete = $state(null);
  let searchQuery = $state('');
  let sortBy = $state('newest');
  let filterDate = $state('');
  let showSortDropdown = $state(false);
  let showDatePicker = $state(false);

  // Calendar State
  let calDate = $state(new Date());
  let viewMonth = $derived(calDate.getMonth());
  let viewYear = $derived(calDate.getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  let calendarDays = $derived.by(() => {
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + 1, 0);
    const prevEnd = new Date(viewYear, viewMonth, 0);
    const days = [];
    
    // Padding from prev month
    for (let i = start.getDay(); i > 0; i--) {
      days.push({ day: prevEnd.getDate() - i + 1, current: false });
    }
    // Current month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({ day: i, current: true, dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
    }
    // Padding from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, current: false });
    }
    return days;
  });

  function changeMonth(delta) {
    calDate = new Date(viewYear, viewMonth + delta, 1);
  }

  function selectDate(dateStr) {
    filterDate = dateStr;
    showDatePicker = false;
  }

  let filteredUsers = $derived(
    users
      .filter(u => {
        const matchesSearch = (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDate = !filterDate || (u.joined_at && u.joined_at.startsWith(filterDate));
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.joined_at || 0);
        const dateB = new Date(b.joined_at || 0);
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      })
  );

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
  });

  async function assignPlan(userId, subscriptionPlan) {
    loading = true;
    try {
      if (subscriptionPlan === null) {
        const { error } = await supabase
          .from('profiles')
          .update({ active_plan_id: null, is_subscribed: false })
          .eq('id', userId);
        if (error) throw error;
      } else {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ is_subscribed: true })
          .eq('id', userId);
        if (profileErr) throw profileErr;

        if (subscriptionPlan.diet_template_id) {
          const { data: rpcResult, error: rpcErr } = await supabase.rpc('assign_user_diet_weeks', {
            p_user_id: userId,
            p_subscription_plan_id: subscriptionPlan.id,
            p_diet_template_id: subscriptionPlan.diet_template_id
          });
          if (rpcErr) throw rpcErr;
          if (rpcResult?.error) throw new Error(rpcResult.error);
        }
      }
      showAssignModal = false;
      await invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function toggleUserStatus(userId, currentStatus) {
    loading = true;
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('isActive', !currentStatus);
    const response = await fetch('?/toggleActive', { method: 'POST', body: formData });
    const result = deserialize(await response.text());
    if (result.type === 'success') {
      await invalidateAll();
    } else {
      alert('Error: ' + (result.data?.message || 'Unknown'));
    }
    loading = false;
  }

  async function removeUser() {
    if (!userToDelete) return;
    loading = true;
    const formData = new FormData();
    formData.append('userId', userToDelete.id);
    const response = await fetch('?/deleteUser', { method: 'POST', body: formData });
    const result = deserialize(await response.text());
    if (result.type === 'success') {
      showDeleteModal = false;
      userToDelete = null;
      await invalidateAll();
    } else {
      alert('Error: ' + (result.data?.message || 'Unknown'));
    }
    loading = false;
  }
</script>

<div class="page" style="animation: fadeIn 0.3s ease">
  <div class="page-head">
    <div>
      <h1>Users</h1>
      <p>Manage all registered members</p>
    </div>
  </div>

  {#if data.error}
    <div class="error-bar">{data.error}</div>
  {/if}

  <!-- Search & Filters -->
  <div class="search-row">
    <div class="filters-left">
      <div class="search-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search users..." bind:value={searchQuery} />
      </div>
      
      <div class="filter-group">
        <label for="joined-on-btn">Joined On</label>
        <div class="custom-select-wrap">
          <button id="joined-on-btn" class="custom-select-btn" onclick={() => showDatePicker = !showDatePicker}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {filterDate ? new Date(filterDate).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : 'All Dates'}
          </button>
          
          {#if showDatePicker}
            <div class="custom-dropdown calendar-pop">
              <div class="cal-header">
                <button class="cal-nav" onclick={() => changeMonth(-1)}>&lsaquo;</button>
                <span class="cal-title">{monthNames[viewMonth]} {viewYear}</span>
                <button class="cal-nav" onclick={() => changeMonth(1)}>&rsaquo;</button>
              </div>
              <div class="cal-grid">
                {#each daysShort as day}
                  <span class="cal-day-head">{day}</span>
                {/each}
                {#each calendarDays as d}
                  <button 
                    class="cal-day" 
                    class:other={!d.current} 
                    class:active={filterDate === d.dateStr}
                    onclick={() => d.current && selectDate(d.dateStr)}
                  >
                    {d.day}
                  </button>
                {/each}
              </div>
              <div class="cal-footer">
                <button class="cal-foot-btn" onclick={() => { filterDate = ''; showDatePicker = false; }}>Clear</button>
                <button class="cal-foot-btn" onclick={() => selectDate(new Date().toISOString().split('T')[0])}>Today</button>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="filter-group">
        <label for="sort-by-btn">Sort By</label>
        <div class="custom-select-wrap">
          <button id="sort-by-btn" class="custom-select-btn" onclick={() => showSortDropdown = !showSortDropdown}>
            {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          {#if showSortDropdown}
            <div class="custom-dropdown">
              <button class="drop-opt" class:active={sortBy === 'newest'} onclick={() => { sortBy = 'newest'; showSortDropdown = false; }}>Newest First</button>
              <button class="drop-opt" class:active={sortBy === 'oldest'} onclick={() => { sortBy = 'oldest'; showSortDropdown = false; }}>Oldest First</button>
            </div>
          {/if}
        </div>
      </div>

      {#if filterDate || searchQuery}
        <button class="btn-clear" onclick={() => { filterDate = ''; searchQuery = ''; }}>Reset All</button>
      {/if}
    </div>
    <span class="count">{filteredUsers.length} members</span>
  </div>

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Member</th>
          <th>Email</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Blood</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredUsers as user}
          <tr class="clickable-row" onclick={() => goto(`/admin/users/${user.id}`)}>
            <td>
              <div class="member">
                <div class="avatar">{user.full_name?.[0] || user.email[0].toUpperCase()}</div>
                <div>
                  <span class="name">{user.full_name || 'Unnamed'}</span>
                  <span class="date">{user.joined_at ? new Date(user.joined_at).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '—'}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="email">{user.email}</span>
              {#if user.id === currentUser?.id}
                <span class="you-badge">YOU</span>
              {/if}
            </td>
            <td>
              {#if user.diet_plans}
                <span class="badge badge-primary">{user.diet_plans.name}</span>
              {:else}
                <span class="no-plan">None</span>
              {/if}
            </td>
            <td>
              <button
                class="status-btn" class:active={user.is_active !== false}
                onclick={(e) => { e.stopPropagation(); toggleUserStatus(user.id, user.is_active !== false); }}
                disabled={loading || user.id === currentUser?.id}
              >
                <span class="status-dot"></span>
                {user.is_active !== false ? 'Active' : 'Inactive'}
              </button>
            </td>
            <td><span class="blood">{user.blood_group || '—'}</span></td>
            <td>
              <div class="actions" onclick={e => e.stopPropagation()} onkeydown={e => e.stopPropagation()} role="presentation">
                <button class="act-btn" title="View Details" onclick={() => goto(`/admin/users/${user.id}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="act-btn" title="Assign Plan" onclick={() => { selectedUser = user; showAssignModal = true; }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </button>
                {#if user.role !== 'admin' && user.id !== currentUser?.id}
                  <button class="act-btn danger" title="Delete" onclick={() => { userToDelete = user; showDeleteModal = true; }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- Assign Modal -->
{#if showAssignModal}
  <div class="overlay" onclick={() => showAssignModal = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showAssignModal = false; }} role="button" tabindex="0">
    <div class="modal" onclick={e => e.stopPropagation()} onkeydown={e => e.stopPropagation()} role="presentation">
      <h3>Assign Plan</h3>
      <p class="modal-sub">Select a plan for <strong>{selectedUser.full_name || selectedUser.email}</strong></p>

      <div class="plan-list">
        <button class="plan-opt" class:selected={selectedUser.is_subscribed === false} onclick={() => assignPlan(selectedUser.id, null)} disabled={loading}>
          <span>None (General)</span>
          {#if selectedUser.is_subscribed === false}<span class="check">✓</span>{/if}
        </button>
        {#each subscriptionPlans as plan}
          <button class="plan-opt" onclick={() => assignPlan(selectedUser.id, plan)} disabled={loading}>
            <span>{plan.name} — {plan.target_goal}</span>
          </button>
        {/each}
      </div>

      <button class="btn-outline" style="width:100%;margin-top:1rem" onclick={() => showAssignModal = false}>Cancel</button>
    </div>
  </div>
{/if}

<!-- Delete Modal -->
{#if showDeleteModal}
  <div class="overlay" onclick={() => showDeleteModal = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') showDeleteModal = false; }} role="button" tabindex="0">
    <div class="modal" onclick={e => e.stopPropagation()} onkeydown={e => e.stopPropagation()} role="presentation">
      <h3>Delete User?</h3>
      <p class="modal-sub">This will permanently remove <strong>{userToDelete?.full_name || userToDelete?.email}</strong>.</p>
      <div style="display:flex;gap:0.75rem;margin-top:1.5rem">
        <button class="btn-outline" style="flex:1" onclick={() => { showDeleteModal = false; userToDelete = null; }}>Cancel</button>
        <button class="btn-danger" style="flex:1" onclick={removeUser} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .page-head { margin-bottom: 1.5rem; }
  .page-head h1 { font-size: 1.75rem; font-weight: 800; margin: 0; }
  .page-head p { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.25rem; }

  .error-bar {
    background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA;
    padding: 0.75rem 1rem; border-radius: var(--radius); margin-bottom: 1rem;
    font-size: 0.8125rem; font-weight: 500;
  }

  /* Search & Filters */
  .search-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
    background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 0.75rem 1rem;
  }
  .filters-left { display: flex; align-items: center; gap: 1.25rem; }
  
  .search-wrap {
    display: flex; align-items: center; gap: 0.5rem;
    background: var(--bg); border: 1.5px solid var(--border-light); border-radius: var(--radius);
    padding: 0.5rem 0.75rem; width: 240px;
    color: var(--text-muted); transition: all 0.2s;
  }
  .search-wrap:focus-within { border-color: var(--primary-accent); background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .search-wrap input { border: none; background: none; outline: none; flex: 1; font-size: 0.8125rem; color: var(--text); }
  
  .filter-group { display: flex; align-items: center; gap: 0.5rem; }
  .filter-group label { font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0; }
  
  .custom-select-wrap { position: relative; }
  .custom-select-btn {
    display: flex; align-items: center; gap: 0.625rem;
    padding: 0.5rem 0.875rem; border-radius: var(--radius);
    border: 1.5px solid var(--border-light); background: var(--bg);
    font-size: 0.75rem; font-weight: 700; color: var(--text);
    cursor: pointer; transition: all 0.2s;
  }
  .custom-select-btn:hover { border-color: var(--primary-accent); background: white; }
  
  .custom-dropdown {
    position: absolute; top: calc(100% + 0.5rem); left: 0;
    background: white; border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; min-width: 160px;
    padding: 0.375rem; overflow: hidden; animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .drop-opt {
    width: 100%; text-align: left; padding: 0.5rem 0.75rem;
    border-radius: 6px; border: none; background: none;
    font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; transition: all 0.15s;
  }
  .drop-opt:hover { background: var(--bg); color: var(--primary-accent); }
  .drop-opt.active { background: var(--primary); color: white; }
  
  /* Calendar */
  .calendar-pop { padding: 1.25rem; width: 280px; }
  .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .cal-title { font-size: 0.875rem; font-weight: 800; color: var(--text); }
  .cal-nav { background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer; padding: 0 0.5rem; }
  .cal-nav:hover { color: var(--primary-accent); }
  
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .cal-day-head { text-align: center; font-size: 0.625rem; font-weight: 700; color: var(--text-muted); padding: 0.5rem 0; text-transform: uppercase; }
  .cal-day {
    aspect-ratio: 1; border: none; background: none; border-radius: 6px;
    font-size: 0.75rem; font-weight: 600; color: var(--text); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .cal-day:hover:not(.other) { background: var(--bg); color: var(--primary-accent); }
  .cal-day.other { color: var(--border); cursor: default; }
  .cal-day.active { background: var(--primary-accent) !important; color: white !important; font-weight: 800; }
  
  .cal-footer { display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-light); }
  .cal-foot-btn { background: none; border: none; font-size: 0.75rem; font-weight: 700; color: var(--primary-accent); cursor: pointer; }
  .cal-foot-btn:hover { text-decoration: underline; }
  
  .btn-clear {
    background: none; border: none; color: var(--primary-accent);
    font-size: 0.75rem; font-weight: 700; cursor: pointer;
    padding: 0.25rem 0.5rem;
  }
  .btn-clear:hover { text-decoration: underline; }

  .count { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }

  /* Table */
  .table-wrap {
    background: white; border: 1px solid var(--border-light);
    border-radius: var(--radius-lg); overflow: hidden;
  }
  .clickable-row { cursor: pointer; transition: background 0.15s; }
  .clickable-row:hover { background: #F8FAFC; }

  .member { display: flex; align-items: center; gap: 0.75rem; }
  .avatar {
    width: 32px; height: 32px; background: #EFF6FF; color: #3B82F6;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.8125rem; flex-shrink: 0;
  }
  .name { display: block; font-weight: 600; font-size: 0.8125rem; color: var(--text); }
  .date { display: block; font-size: 0.6875rem; color: var(--text-muted); }
  .email { font-size: 0.8125rem; color: var(--text-secondary); }
  .you-badge {
    display: inline-block; background: var(--primary); color: white;
    font-size: 0.5625rem; font-weight: 700; padding: 1px 5px; border-radius: 3px;
    margin-left: 0.375rem; vertical-align: middle;
  }
  .no-plan { font-size: 0.75rem; color: var(--text-muted); }
  .blood { font-weight: 700; font-size: 0.875rem; }

  /* Status */
  .status-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 0.3125rem 0.75rem; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; border: none; cursor: pointer;
    background: #FEF2F2; color: #DC2626; transition: all 0.15s;
  }
  .status-btn.active { background: #F0FDF4; color: #16A34A; }
  .status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
  .status-btn:hover:not(:disabled) { filter: brightness(0.95); }
  .status-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Actions */
  .actions { display: flex; gap: 0.375rem; }
  .act-btn {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg); border: 1px solid var(--border-light);
    color: var(--text-muted); cursor: pointer; transition: all 0.15s;
  }
  .act-btn:hover { background: var(--primary); color: white; border-color: var(--primary); }
  .act-btn.danger:hover { background: var(--danger); border-color: var(--danger); }

  /* Modal */
  .overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,0.4);
    backdrop-filter: blur(4px); z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: white; border-radius: var(--radius-lg); padding: 1.5rem;
    width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    animation: fadeIn 0.2s ease;
  }
  .modal h3 { font-size: 1.125rem; margin-bottom: 0.25rem; }
  .modal-sub { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem; }

  .plan-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .plan-opt {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.75rem 1rem; border-radius: var(--radius); border: 1.5px solid var(--border-light);
    background: white; cursor: pointer; font-size: 0.8125rem; font-weight: 600;
    color: var(--text); text-align: left; transition: all 0.15s;
  }
  .plan-opt:hover { border-color: var(--primary-accent); background: #F8FAFF; }
  .plan-opt.selected { border-color: var(--primary-accent); background: #EFF6FF; }
  .check { color: var(--primary-accent); font-weight: 800; }
</style>
