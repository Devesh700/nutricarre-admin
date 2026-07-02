<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    let { data, form } = $props();
    let consultants = $derived(data.consultants);
    let loading = $state(false);

    $effect(() => {
        if (form?.success) {
            invalidateAll();
        }
    });

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'approved': return 'badge-approved';
            case 'rejected': return 'badge-rejected';
            default: return 'badge-pending';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
</script>

<div class="consultants-page">
    <div class="page-header">
        <div>
            <h1>Registered Consultants</h1>
            <p>Manage consultant applications from nutrition experts</p>
        </div>
    </div>

    <div class="consultants-table-container">
        <table class="consultants-table">
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each consultants as c}
                    <tr>
                        <td class="email-cell">{c.email}</td>
                        <td>{c.phone || '-'}</td>
                        <td>
                            {#if c.resume_url}
                                <a href={c.resume_url} target="_blank" class="resume-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                                    View Resume
                                </a>
                            {:else}
                                <span class="no-resume">No file</span>
                            {/if}
                        </td>
                        <td>
                            <span class="status-badge {getStatusBadgeClass(c.status)}">
                                {c.status}
                            </span>
                        </td>
                        <td class="date-cell">{formatDate(c.created_at)}</td>
                        <td class="actions-cell">
                            <div class="action-buttons">
                                {#if c.status === 'pending'}
                                    <form method="POST" action="?/updateStatus" use:enhance>
                                        <input type="hidden" name="id" value={c.id} />
                                        <input type="hidden" name="status" value="approved" />
                                        <button class="btn-approve" type="submit">Approve</button>
                                    </form>
                                    <form method="POST" action="?/updateStatus" use:enhance>
                                        <input type="hidden" name="id" value={c.id} />
                                        <input type="hidden" name="status" value="rejected" />
                                        <button class="btn-reject" type="submit">Reject</button>
                                    </form>
                                {:else}
                                    <form method="POST" action="?/updateStatus" use:enhance>
                                        <input type="hidden" name="id" value={c.id} />
                                        <input type="hidden" name="status" value="pending" />
                                        <button class="btn-reset" type="submit">Reset</button>
                                    </form>
                                {/if}
                                <form method="POST" action="?/delete" use:enhance>
                                    <input type="hidden" name="id" value={c.id} />
                                    <input type="hidden" name="user_id" value={c.user_id || ''} />
                                    <button class="btn-delete" type="submit" onclick={(e) => !confirm('Delete this consultant record?') && e.preventDefault()}>
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="6" class="empty-row">No consultant registrations yet.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .consultants-page { animation: fadeIn 0.3s ease; }
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); margin: 0; }
    p { color: var(--text-muted); font-size: 0.875rem; }

    .consultants-table-container {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
    }

    .consultants-table {
        width: 100%;
        border-collapse: collapse;
    }

    .consultants-table th {
        background: var(--bg);
        font-size: 0.6875rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 0.875rem 1.25rem;
        text-align: left;
        border-bottom: 1px solid var(--border);
    }

    .consultants-table td {
        padding: 1rem 1.25rem;
        font-size: 0.875rem;
        border-bottom: 1px solid var(--border-light);
        color: var(--text);
    }

    .consultants-table tr:last-child td {
        border-bottom: none;
    }
    .consultants-table tr:hover td {
        background: var(--bg);
    }

    .email-cell { font-weight: 600; }
    .date-cell { font-size: 0.8125rem; color: var(--text-muted); white-space: nowrap; }

    .resume-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--primary-accent);
        font-weight: 600;
        font-size: 0.8125rem;
        text-decoration: none;
    }
    .resume-link:hover { text-decoration: underline; }

    .no-resume { color: var(--text-muted); font-style: italic; font-size: 0.8125rem; }

    .status-badge {
        display: inline-block;
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 0.25rem 0.625rem;
        border-radius: 6px;
        text-transform: capitalize;
    }
    .badge-pending { background: #FEF3C7; color: #D97706; }
    .badge-approved { background: #D1FAE5; color: #059669; }
    .badge-rejected { background: #FEE2E2; color: #DC2626; }

    .actions-cell { white-space: nowrap; }
    .action-buttons {
        display: flex;
        gap: 0.375rem;
        align-items: center;
    }
    .action-buttons form { margin: 0; }

    .btn-approve, .btn-reject, .btn-reset, .btn-delete {
        border: none;
        padding: 0.375rem 0.75rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
    }
    .btn-approve { background: #D1FAE5; color: #059669; }
    .btn-approve:hover { background: #A7F3D0; }
    .btn-reject { background: #FEE2E2; color: #DC2626; }
    .btn-reject:hover { background: #FECACA; }
    .btn-reset { background: #FEF3C7; color: #D97706; }
    .btn-reset:hover { background: #FDE68A; }
    .btn-delete { background: #FEE2E2; color: #DC2626; }
    .btn-delete:hover { background: #FECACA; }

    .empty-row {
        text-align: center;
        padding: 3rem !important;
        color: var(--text-muted);
        font-style: italic;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
