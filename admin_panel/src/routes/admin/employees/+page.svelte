<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    let { data, form } = $props();
    let employees = $derived(data.employees);
    
    let showAddModal = $state(false);
    let loading = $state(false);
    let errorMessage = $state('');

    $effect(() => {
        if (form?.success) {
            showAddModal = false;
            invalidateAll();
        }
        if (form?.message) {
            errorMessage = form.message;
        }
    });
</script>

<div class="employees-page">
    <div class="page-header">
        <div>
            <h1>Employee Management</h1>
            <p>Create and manage support staff credentials</p>
        </div>
        <button class="btn-primary" onclick={() => showAddModal = true}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Employee
        </button>
    </div>

    <div class="employee-grid">
        {#each employees as emp}
            <div class="employee-card">
                <div class="emp-avatar">
                    {emp.full_name?.[0] || emp.email[0].toUpperCase()}
                </div>
                <div class="emp-info">
                    <h3>{emp.full_name || 'Unnamed Employee'}</h3>
                    <p class="email">{emp.email}</p>
                    <div class="status-badge">Support Specialist</div>
                </div>
                <div class="emp-actions">
                    <form method="POST" action="?/delete" use:enhance={() => {
                        loading = true;
                        return async ({ update }) => {
                            loading = false;
                            update();
                        };
                    }}>
                        <input type="hidden" name="id" value={emp.id} />
                        <button class="btn-delete" type="submit" disabled={loading} onclick={(e) => !confirm('Delete this employee?') && e.preventDefault()}>
                            Delete
                        </button>
                    </form>
                </div>
            </div>
        {:else}
            <div class="empty-state">
                <p>No employees found. Start by adding one!</p>
            </div>
        {/each}
    </div>
</div>

{#if showAddModal}
    <div class="modal-overlay" onclick={() => showAddModal = false}>
        <div class="modal" onclick={e => e.stopPropagation()}>
            <div class="modal-header">
                <h2>Add New Employee</h2>
                <button class="close" onclick={() => showAddModal = false}>&times;</button>
            </div>
            <form method="POST" action="?/create" use:enhance={() => {
                loading = true;
                errorMessage = '';
                return async ({ update }) => {
                    loading = false;
                    update();
                };
            }}>
                <div class="modal-body">
                    {#if errorMessage}
                        <div class="error-box">{errorMessage}</div>
                    {/if}
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" placeholder="John Doe" required />
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" placeholder="john@example.com" required />
                    </div>
                    <div class="form-group">
                        <label for="password">Login Password</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required />
                        <p class="hint">Minimum 6 characters</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-outline" onclick={() => showAddModal = false}>Cancel</button>
                    <button type="submit" class="btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Employee Account'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .employees-page { animation: fadeIn 0.3s ease; }
    
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin: 0; }
    p { color: var(--text-muted); font-size: 0.875rem; }

    .employee-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .employee-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s;
    }
    .employee-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

    .emp-avatar {
        width: 56px; height: 56px;
        background: linear-gradient(135deg, var(--primary-accent), #818CF8);
        color: white; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.25rem; font-weight: 800;
    }

    .emp-info { flex: 1; min-width: 0; }
    .emp-info h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
    .emp-info .email { font-size: 0.8125rem; color: var(--text-muted); margin: 0.125rem 0 0.5rem; }
    .status-badge {
        display: inline-block; font-size: 0.625rem; font-weight: 800;
        background: #EFF6FF; color: #3B82F6; padding: 2px 8px; border-radius: 4px;
        text-transform: uppercase; letter-spacing: 0.04em;
    }

    .btn-delete {
        background: none; border: none; color: #EF4444; font-size: 0.75rem;
        font-weight: 700; cursor: pointer; padding: 0.5rem; border-radius: 6px;
    }
    .btn-delete:hover { background: #FEF2F2; }

    /* Modal */
    .modal-overlay {
        position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(6px); z-index: 1000;
        display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    }
    .modal {
        background: var(--surface); border-radius: var(--radius-lg);
        width: 100%; max-width: 440px; box-shadow: var(--shadow-lg);
    }
    .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 1.125rem; font-weight: 800; margin: 0; }
    .close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .error-box { background: #FEF2F2; color: #DC2626; padding: 0.75rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; border: 1px solid #FEE2E2; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    input { padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg); font-weight: 600; }
    input:focus { border-color: var(--primary-accent); outline: none; background: white; }
    .hint { font-size: 0.6875rem; color: var(--text-muted); }

    .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-light); display: flex; gap: 0.75rem; }
    .btn-outline { flex: 1; padding: 0.75rem; border: 1.5px solid var(--border); border-radius: 10px; font-weight: 700; cursor: pointer; background: white; }
    .btn-primary { 
        background: var(--primary-accent); color: white; border: none; 
        padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer;
        display: inline-flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary:hover { background: var(--primary-accent-hover); }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); font-style: italic; }
</style>
