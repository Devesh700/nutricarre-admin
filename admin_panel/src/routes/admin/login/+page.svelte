<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state(/** @type {string | null} */ (null));

  /**
   * Handle admin authentication
   * @param {Event} e
   */
  async function handleLogin(e) {
    e.preventDefault();
    loading = true;
    error = null;

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      
      if (err) {
        error = err.message;
        loading = false;
      } else {
        if (data.session && data.session.access_token === 'mock-token') {
          localStorage.setItem('mock_session', JSON.stringify(data.session));
        }
        goto('/admin/dashboard');
      }
    } catch (/** @type {any} */ err) {
      error = err.message || 'An unexpected authentication error occurred.';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Admin Portal Login | DietWise</title>
  <meta name="description" content="DietWise Administrator Portal Authentication" />
</svelte:head>

<div class="login-container">
  <div class="login-card glass">
    <div class="header">
      <div class="logo">
        <img src="/logo_transparent.png" alt="DietWise Logo" class="brand-logo" />
        <h1>DietWise</h1>
      </div>
      <p>Administrative Portal Access</p>
    </div>

    <form onsubmit={handleLogin}>
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <div class="input-group">
        <label for="admin-email">Email Address</label>
        <input 
          type="email" 
          id="admin-email" 
          bind:value={email} 
          placeholder="admin@nutricare.com" 
          required
        />
      </div>

      <div class="input-group">
        <label for="admin-password">Password</label>
        <input 
          type="password" 
          id="admin-password" 
          bind:value={password} 
          placeholder="••••••••" 
          required
        />
      </div>

      <button type="submit" class="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
      </button>
    </form>

    <div class="login-footer-links">
      <a href="/">← Back to Home</a>
      <span class="dot-sep">•</span>
      <a href="/terms">Terms</a>
      <span class="dot-sep">•</span>
      <a href="/privacy">Privacy</a>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.75rem 2.5rem;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .brand-logo {
    height: 44px;
    width: auto;
    object-fit: contain;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 900;
    color: #0F172A;
    letter-spacing: -0.02em;
  }

  .header > p {
    color: #64748B;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #334155;
    margin-bottom: 0.375rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #F8FAFC;
    border: 1.5px solid #E2E8F0;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    color: #0F172A;
    outline: none;
    transition: all 0.2s;
  }

  input:focus {
    background: white;
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }

  .error-msg {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #991B1B;
    padding: 0.75rem;
    border-radius: 0.75rem;
    margin-bottom: 1.25rem;
    font-size: 0.8125rem;
    text-align: center;
    font-weight: 600;
  }

  .btn-primary {
    width: 100%;
    padding: 0.85rem;
    background: #0F172A;
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1E293B;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-footer-links {
    margin-top: 2rem;
    padding-top: 1.25rem;
    border-top: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    font-size: 0.8125rem;
  }

  .login-footer-links a {
    color: #64748B;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s;
  }

  .login-footer-links a:hover {
    color: #2563EB;
  }

  .dot-sep {
    color: #CBD5E1;
  }
</style>
