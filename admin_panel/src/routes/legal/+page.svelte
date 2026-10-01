<script>
  import TermsPage from '../terms/+page.svelte';
  import PrivacyPage from '../privacy/+page.svelte';

  let currentTab = $state('terms');
</script>

<svelte:head>
  <title>Public Legal Center | DietWise</title>
</svelte:head>

<div class="legal-portal-header-bar">
  <div class="container portal-flex">
    <div class="portal-title">
      <span class="dot"></span>
      <span>DietWise Legal & Compliance Portal</span>
    </div>
    <div class="tab-buttons">
      <button 
        class="tab-btn {currentTab === 'terms' ? 'active' : ''}" 
        onclick={() => currentTab = 'terms'}
      >
        📄 Terms & Conditions
      </button>
      <button 
        class="tab-btn {currentTab === 'privacy' ? 'active' : ''}" 
        onclick={() => currentTab = 'privacy'}
      >
        🔒 Privacy Policy
      </button>
    </div>
  </div>
</div>

{#if currentTab === 'terms'}
  <TermsPage />
{:else}
  <PrivacyPage />
{/if}

<style>
  .legal-portal-header-bar {
    background: #0F172A;
    color: white;
    padding: 0.75rem 0;
    border-bottom: 1px solid #1E293B;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .portal-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .portal-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #3B82F6;
    border-radius: 50%;
  }

  .tab-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .tab-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #CBD5E1;
    padding: 0.4rem 0.85rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .tab-btn.active {
    background: #2563EB;
    color: white;
    border-color: #3B82F6;
  }
</style>
