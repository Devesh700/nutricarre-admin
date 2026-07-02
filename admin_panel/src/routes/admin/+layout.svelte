<script>
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let { children } = $props();
  let user = $state(null);

  let profile = $state(null);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      goto('/login');
    } else {
      user = session.user;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      profile = data;
    }
  });

  $effect(() => {
    if (profile && profile.role === 'employee') {
      const allowedPaths = ['/admin/chat'];
      const currentPath = $page.url.pathname;
      const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));
      
      if (!isAllowed) {
        goto('/admin/chat');
      }
    }
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem('mock_session');
    goto('/login');
  }

  function isActive(path) {
    if (path === '/admin/dashboard') return $page.url.pathname === '/admin/dashboard';
    return $page.url.pathname.startsWith(path);
  }

  const navItems = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/admin/dashboard' },
    { name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/admin/users' },
    { name: 'Employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/admin/employees', adminOnly: true },
    { name: 'Consultants', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/admin/consultants', adminOnly: true },
    { type: 'divider' },
    // { name: 'Diet Plans', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/admin/diets', adminOnly: true },
    { name: 'Recipes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', path: '/admin/recipes', adminOnly: true },
    { name: 'Diet Templates', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/admin/diet-templates', adminOnly: true },
    { name: 'Meal Library', icon: 'M4 6h16M4 12h16M4 18h16', path: '/admin/meal-library', adminOnly: true },
    { name: 'Diet Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/admin/diet-schedule', adminOnly: true },
    { name: 'Combined Import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', path: '/admin/diet-import', adminOnly: true },
    { type: 'divider' },
    { name: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', path: '/admin/videos', adminOnly: true },
    { name: 'Reels', icon: 'M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm5 12v.01', path: '/admin/reels', adminOnly: true },
    { name: 'Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/admin/banners', adminOnly: true },
    { name: 'Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', path: '/admin/chat' },
    { name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', path: '/admin/notifications', adminOnly: true },
    { type: 'divider' },
    { name: 'Subscriptions', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', path: '/admin/subscriptions', adminOnly: true },
    { name: 'Transactions', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: '/admin/transactions', adminOnly: true },
    { name: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', path: '/admin/settings', adminOnly: true },
  ];

  let filteredNavItems = $derived(
    profile?.role === 'employee' 
      ? navItems.filter(item => !item.adminOnly) 
      : navItems
  );
</script>

<div class="layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div>
        <div class="brand-name">DietWise</div>
        <div class="brand-sub">Admin</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      {#each filteredNavItems as item}
        {#if item.type === 'divider'}
          <div class="nav-divider"></div>
        {:else}
          <a
            href={item.path}
            class="nav-link"
            class:active={isActive(item.path)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
            </svg>
            <span>{item.name}</span>
          </a>
        {/if}
      {/each}
    </nav>

    <button class="logout-btn" onclick={handleLogout}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Sign Out</span>
    </button>
  </aside>

  <!-- Main -->
  <main class="main">
    <header class="topbar">
      <div class="topbar-left">
        <span class="breadcrumb">{$page.url.pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')}</span>
      </div>
      <div class="topbar-profile">
        <div class="profile-avatar">
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </div>
        <div class="profile-info">
          <span class="profile-name">{profile?.full_name || user?.email?.split('@')[0] || 'Admin'}</span>
          <span class="profile-role">{profile?.role === 'employee' ? 'Support Specialist' : 'Administrator'}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      {@render children()}
    </div>
  </main>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
    background: var(--bg);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 248px;
    background: var(--primary);
    display: flex;
    flex-direction: column;
    padding: 1.25rem 0.75rem;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 1.75rem;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--primary-accent), #818CF8);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .brand-icon svg {
    width: 20px;
    height: 20px;
  }

  .brand-name {
    font-size: 1.0625rem;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.2;
  }
  .brand-sub {
    font-size: 0.6875rem;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Nav ── */
  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: 0.625rem 0.75rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.625rem;
    color: #94A3B8;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.15s ease;
  }
  .nav-link svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #E2E8F0;
  }
  .nav-link.active {
    background: var(--primary-accent);
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  /* ── Logout ── */
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.625rem;
    color: #F87171;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    transition: all 0.15s;
  }
  .logout-btn svg {
    width: 20px;
    height: 20px;
  }
  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
  }

  /* ── Main ── */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 2rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
  }

  .topbar-left {
    display: flex;
    align-items: center;
  }

  .breadcrumb {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .topbar-profile {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .profile-avatar {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, var(--primary-accent), #818CF8);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.8125rem;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
  }
  .profile-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.2;
  }
  .profile-role {
    font-size: 0.6875rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .page-content {
    flex: 1;
    padding: 1.5rem 2rem 2rem;
    overflow-y: auto;
  }
</style>
