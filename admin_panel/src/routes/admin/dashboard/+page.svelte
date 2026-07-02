<script>
  import { goto } from '$app/navigation';
  let { data } = $props();

  const statCards = $derived([
    { label: 'Total Users', value: data.stats.userCount, icon: '👥', color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Active Plans', value: data.stats.planCount, icon: '📋', color: '#10B981', bg: '#ECFDF5' },
    { label: 'Calories Logged', value: data.stats.totalCalories, icon: '⚡', color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Revenue', value: '₹' + data.stats.revenue.toLocaleString('en-IN'), icon: '💰', color: '#8B5CF6', bg: '#F5F3FF' },
  ]);

  const recentUsers = $derived(data.recentUsers.map(u => ({
    id: u.id,
    name: u.full_name || 'New User',
    email: u.email,
    joined: new Date(u.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  })));

  const maxChartValue = $derived(Math.max(...data.chartData.map(d => d.value), 1));
</script>

<div class="dashboard">

  <div class="page-title">
    <h1>Dashboard</h1>
    <p>Overview of your platform activity</p>
  </div>

  <!-- Stat Cards -->
  <div class="stats-row">
    {#each statCards as stat, i}
      <div class="stat-card" style="--accent: {stat.color}; --accent-bg: {stat.bg}; animation-delay: {i * 0.08}s">
        <div class="stat-icon" style="background: {stat.bg}; color: {stat.color}">
          <span>{stat.icon}</span>
        </div>
        <div class="stat-body">
          <span class="stat-label">{stat.label}</span>
          <span class="stat-value">{stat.value}</span>
        </div>
        <div class="stat-accent-bar" style="background: {stat.color}"></div>
      </div>
    {/each}
  </div>

  <!-- Two column layout -->
  <div class="two-col">

    <!-- Chart -->
    <div class="card chart-card">
      <div class="card-head">
        <div>
          <h3>Weekly Activity</h3>
          <p class="card-sub">User engagement over the last 7 days</p>
        </div>
        <div class="chart-legend">
          <span class="legend-dot"></span>
          Activity
        </div>
      </div>
      <div class="chart">
        {#each data.chartData as day, i}
          <div class="chart-col" style="animation-delay: {i * 0.06}s">
            <div class="chart-bar-wrap">
              <div
                class="chart-bar"
                style="height: {day.value > 0 ? Math.max((day.value / maxChartValue) * 100, 8) : 4}%"
                class:empty={day.value === 0}
              >
                <span class="bar-label">{day.value}</span>
              </div>
            </div>
            <span class="day-label">{day.label}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Recent Users -->
    <div class="card">
      <div class="card-head">
        <div>
          <h3>Recent Signups</h3>
          <p class="card-sub">Latest members to join</p>
        </div>
        <span class="user-count">{recentUsers.length}</span>
      </div>
      <div class="user-list">
        {#each recentUsers as user, i}
          <div class="user-item clickable" style="animation-delay: {i * 0.05}s" onclick={() => goto(`/admin/users/${user.id}`)}>
            <div class="user-avatar">{user.name[0]}</div>
            <div class="user-info">
              <span class="user-name">{user.name}</span>
              <span class="user-email">{user.email}</span>
            </div>
            <span class="user-date">{user.joined}</span>
          </div>
        {:else}
          <p class="empty-msg">No recent signups</p>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .dashboard {
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .page-title {
    margin-bottom: 2rem;
  }
  .page-title h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
  }
  .page-title p {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  /* Stats */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.4s ease both;
    box-shadow: var(--shadow-sm);
  }
  .stat-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .stat-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.8;
  }

  .stat-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .stat-icon span {
    font-size: 1.375rem;
  }

  .stat-body {
    display: flex;
    flex-direction: column;
  }
  .stat-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text);
    line-height: 1.2;
  }

  /* Two Column */
  .two-col {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1.5rem;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }
  .card-head h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }
  .card-sub {
    font-size: 0.8125rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0 0;
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
  }
  .legend-dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, var(--primary-accent), #60A5FA);
    border-radius: 50%;
  }

  .user-count {
    background: var(--primary-accent-light);
    color: var(--primary-accent);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
  }

  /* Chart */
  .chart {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    height: 200px;
    padding-top: 1rem;
  }

  .chart-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    animation: fadeIn 0.5s ease both;
  }

  .chart-bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .chart-bar {
    width: 100%;
    max-width: 36px;
    background: linear-gradient(180deg, var(--primary-accent), #93C5FD);
    border-radius: 8px 8px 4px 4px;
    position: relative;
    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    min-height: 4px;
  }
  .chart-bar.empty {
    background: var(--border);
  }
  .chart-bar:hover {
    filter: brightness(1.08);
    transform: scaleX(1.08);
  }

  .bar-label {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--text-secondary);
    background: var(--surface);
    padding: 1px 6px;
    border-radius: 4px;
    box-shadow: var(--shadow-sm);
    opacity: 0;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .chart-bar:hover .bar-label {
    opacity: 1;
  }

  .day-label {
    margin-top: 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  /* User List */
  .user-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem;
    border-radius: 0.75rem;
    transition: background 0.15s;
    animation: fadeIn 0.3s ease both;
  }
  .user-item:hover {
    background: var(--bg);
  }
  .user-item.clickable {
    cursor: pointer;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--primary-accent-light), #DBEAFE);
    color: var(--primary-accent);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }
  .user-name {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-email {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-date {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .empty-msg {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    padding: 2rem 0;
  }

  @media (max-width: 1100px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .two-col { grid-template-columns: 1fr; }
  }
</style>
