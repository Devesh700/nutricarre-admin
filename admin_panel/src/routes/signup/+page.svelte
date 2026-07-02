<script>
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';

  let fullName = $state('');
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state(null);
  let showPassword = $state(false);

  async function handleSignup() {
    loading = true;
    error = null;
    
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (err) throw err;

      // Create admin profile
      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'admin'
          });
        
        if (profileErr) throw profileErr;
      }

      goto('/login?message=Account created. Please sign in.');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="signup-container">
  <div class="signup-card">
    <div class="header">
      <div class="logo">
        <span class="dot"></span>
        <h1>DietWise</h1>
      </div>
      <p>Create Administrative Account</p>
    </div>

    <form onsubmit={handleSignup}>
      {#if error}
        <div class="error-msg">{error}</div>
      {/if}

      <div class="input-group">
        <label for="name">Full Name</label>
        <div class="input-wrapper">
          <span class="icon">👤</span>
          <input 
            type="text" 
            id="name" 
            bind:value={fullName} 
            placeholder="Dr. Julian Pierce" 
            required
          />
        </div>
      </div>

      <div class="input-group">
        <label for="email">Work Email</label>
        <div class="input-wrapper">
          <span class="icon">✉️</span>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            placeholder="admin@nutricare.com" 
            required
          />
        </div>
      </div>

      <div class="input-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <span class="icon">🔒</span>
          <input 
            type={showPassword ? "text" : "password"} 
            id="password" 
            bind:value={password} 
            placeholder="Create a strong password" 
            required
          />
          <button type="button" class="toggle-pass" onclick={() => showPassword = !showPassword}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Initialize Admin Portal'}
      </button>

      <div class="footer-link">
        Already have an account? <a href="/login">Sign In</a>
      </div>
    </form>
  </div>
</div>

<style>
  .signup-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1.5rem;
    background: var(--bg);
  }

  .signup-card {
    width: 100%;
    max-width: 480px;
    padding: 3.5rem;
    border-radius: 3rem;
    background: white;
    box-shadow: 0 30px 60px rgba(0, 64, 161, 0.08);
    border: 1px solid var(--border-light);
  }

  .header {
    text-align: center;
    margin-bottom: 3.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .dot {
    width: 14px;
    height: 14px;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 64, 161, 0.3);
  }

  h1 {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text);
  }

  p {
    color: var(--text-muted);
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .input-group {
    margin-bottom: 1.75rem;
  }

  label {
    display: block;
    margin-bottom: 0.625rem;
    font-size: 0.8125rem;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .icon {
    position: absolute;
    left: 1.25rem;
    font-size: 1.125rem;
    opacity: 0.5;
  }

  input {
    width: 100%;
    padding: 1.125rem 1.25rem 1.125rem 3.25rem;
    border-radius: 1.25rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-family: inherit;
    font-weight: 600;
    color: var(--text);
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    background: white;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(0, 64, 161, 0.05);
  }

  .toggle-pass {
    position: absolute;
    right: 1.25rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .toggle-pass:hover {
    opacity: 1;
  }

  .error-msg {
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid var(--danger);
    color: var(--danger);
    padding: 1rem;
    border-radius: 1rem;
    margin-bottom: 2rem;
    font-size: 0.875rem;
    text-align: center;
    font-weight: 600;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 1.125rem;
    font-size: 1.0625rem;
    font-weight: 800;
    border-radius: 1.25rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(0, 64, 161, 0.2);
    transition: all 0.2s ease;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(0, 64, 161, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .footer-link {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.9375rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .footer-link a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 800;
  }

  .footer-link a:hover {
    text-decoration: underline;
  }

  .w-full {
    width: 100%;
  }
</style>
