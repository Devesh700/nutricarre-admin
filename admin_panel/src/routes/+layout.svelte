<script>
  import '../app.css';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { children } = $props();

  onMount(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        goto('/login');
      } else if (event === 'SIGNED_IN' && $page.url.pathname === '/login') {
        goto('/admin/dashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });
</script>

<svelte:head>
  <title>DietWise | Admin Panel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<main>
  {@render children()}
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
