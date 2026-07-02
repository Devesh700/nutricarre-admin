<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state(null);

  async function handleLogin() {
    loading = true;
    error = null;
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      console.log("supabase login error",err);
      error = err.message;
      loading = false;
    } else {
      // For mock mode, we manually set a session in localStorage
      if (data.session && data.session.access_token === 'mock-token') {
        localStorage.setItem('mock_session', JSON.stringify(data.session));
      }
      goto('/admin/dashboard');
    }
  }
</script>

<div class="login-container">
  <div class="login-card glass">
    <div class="header">
      <div class="logo">
        <span class="dot"></span>
        <h1>DietWise</h1>
      </div>
      <p>Admin Portal Login</p>
    </div>

    <form onsubmit={handleLogin}>
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <div class="input-group">
        <label for="email">Email Address</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          class="input-field" 
          placeholder="admin@stitchcalorie.com" 
          required
        />
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          class="input-field" 
          placeholder="••••••••" 
          required
        />
      </div>

      <div class="demo-hint">
        <p><strong>Demo Access:</strong> admin@test.com / admin123</p>
      </div>

      <button type="submit" class="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
    background: var(--bg);
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    border-radius: 1.25rem;
    background: white;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
    border: 1px solid var(--border-light);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    margin-bottom: 0.5rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    background: var(--primary);
    border-radius: 50%;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text);
  }

  .header > p {
    color: var(--text-muted);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .error-msg {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #991B1B;
    padding: 0.75rem;
    border-radius: var(--radius);
    margin-bottom: 1.25rem;
    font-size: 0.8125rem;
    text-align: center;
  }

  .demo-hint {
    background: var(--bg);
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    padding: 0.75rem;
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
    font-size: 0.75rem;
    text-align: center;
  }

  .demo-hint strong {
    color: var(--text);
  }

  button[type="submit"] {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
  }
  button[type="submit"]:hover {
    background: #1E293B;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  }
  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
</style>
