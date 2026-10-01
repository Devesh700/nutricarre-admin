<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      goto('/admin/dashboard');
    } else {
      goto('/admin/login');
    }
  });
</script>

<div class="redirecting-screen">
  <div class="spinner"></div>
  <p>Connecting to Admin Portal...</p>
</div>

<style>
  .redirecting-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    gap: 1rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: var(--primary-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
