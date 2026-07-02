<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let { data } = $props();
  let transactions = $derived(data.transactions);

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
</script>

<div class="transactions-page">
  <div class="header">
    <div>
      <h1>Financial Transactions</h1>
      <p>Monitor your clinical revenue and successful subscription payments.</p>
    </div>
    
    <div class="stats-row">
      <div class="stat-card glass">
        <span class="label">Total Revenue</span>
        <span class="value">{formatCurrency(transactions.reduce((acc, t) => acc + (t.amount || 0), 0))}</span>
      </div>
      <div class="stat-card glass">
        <span class="label">Total Sales</span>
        <span class="value">{transactions.length}</span>
      </div>
    </div>
  </div>

  {#if data.error}
    <div class="error-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span>Database Error: {data.error}</span>
    </div>
  {/if}

  <div class="table-container glass">
    <table>
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>User</th>
          <th>Plan Name</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date & Time</th>
        </tr>
      </thead>
      <tbody>
        {#each transactions as transaction}
          <tr class="clickable-row" onclick={() => transaction.profiles?.id && goto(`/admin/users/${transaction.profiles.id}`)}>
            <td>
              <code class="payment-id">{transaction.razorpay_payment_id}</code>
            </td>
            <td>
              <div class="user-cell">
                <div class="avatar">{transaction.profiles?.full_name?.[0] || transaction.profiles?.email?.[0].toUpperCase() || 'U'}</div>
                <div class="info">
                  <span class="name">{transaction.profiles?.full_name || 'Anonymous'}</span>
                  <span class="email">{transaction.profiles?.email || 'N/A'}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="plan-badge">{transaction.plan_name}</span>
            </td>
            <td>
              <span class="amount">{formatCurrency(transaction.amount)}</span>
            </td>
            <td>
              <span class="status-badge success">
                <span class="dot"></span>
                {transaction.status}
              </span>
            </td>
            <td class="date">{formatDate(transaction.created_at)}</td>
          </tr>
        {:else}
          <tr>
            <td colspan="6" class="empty-state">No transactions recorded yet.</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .transactions-page {
    animation: fadeIn 0.3s ease;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .stats-row {
    display: flex;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    min-width: 180px;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
  }

  .stat-card .label {
    font-size: 0.6875rem;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .stat-card .value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text);
  }

  .table-container {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    background: var(--surface);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--surface);
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: var(--bg);
    color: var(--text-muted);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid var(--border);
  }

  td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-light);
    vertical-align: middle;
    font-size: 0.8125rem;
  }

  tr:hover {
    background: #F8FAFC;
  }
  .clickable-row { cursor: pointer; transition: background 0.15s; }
  .clickable-row:hover { background: #F8FAFC; }

  .payment-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--primary-accent), #818CF8);
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .user-cell .info {
    display: flex;
    flex-direction: column;
  }

  .user-cell .name {
    font-weight: 600;
    color: var(--text);
    font-size: 0.8125rem;
  }

  .user-cell .email {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .plan-badge {
    background: var(--primary-accent-light);
    color: var(--primary-accent-hover);
    padding: 0.25rem 0.625rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .amount {
    font-weight: 800;
    color: var(--text);
    font-size: 0.875rem;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 99px;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-badge.success {
    background: #DCFCE7;
    color: #166534;
  }

  .status-badge .dot {
    width: 5px;
    height: 5px;
    background: currentColor;
    border-radius: 50%;
  }

  .date {
    color: var(--text-muted);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .glass {
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #FEF2F2;
    color: #DC2626;
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
    border: 1px solid #FECACA;
    font-weight: 600;
    font-size: 0.8125rem;
  }
</style>
