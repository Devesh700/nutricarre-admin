<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      goto('/admin/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="loading-screen">
  <div class="spinner"></div>
</div>

<style>
  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--bg);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(79, 70, 229, 0.1);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
