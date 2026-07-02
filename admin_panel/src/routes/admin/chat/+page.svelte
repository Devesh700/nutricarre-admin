<script>
  import { supabase } from '$lib/supabase';
  import { onMount, onDestroy } from 'svelte';

  let loading = $state(true);
  let tickets = $state([]);
  let selectedTicketId = $state(null);
  let messageText = $state('');
  let messages = $state([]);
  
  let subscription;
  let messageSubscription;

  onMount(async () => {
    await fetchTickets();
    setupTicketsRealtime();
  });

  onDestroy(() => {
    if (subscription) supabase.removeChannel(subscription);
    if (messageSubscription) supabase.removeChannel(messageSubscription);
  });

  async function fetchTickets() {
    loading = true;
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      tickets = data || [];
      
      // If we have a selected ticket, refresh it too
      if (selectedTicketId) {
        await fetchMessages(selectedTicketId);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      loading = false;
    }
  }

  async function fetchMessages(ticketId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      messages = data || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }

  function setupTicketsRealtime() {
    subscription = supabase
      .channel('support_tickets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();
  }

  function setupMessagesRealtime(ticketId) {
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
    }

    messageSubscription = supabase
      .channel(`ticket_messages_${ticketId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, payload => {
        messages = [...messages, payload.new];
      })
      .subscribe();
  }

  async function selectTicket(ticketId) {
    selectedTicketId = ticketId;
    await fetchMessages(ticketId);
    setupMessagesRealtime(ticketId);
    
    // Update status to in_progress if it was open
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.status === 'open') {
      await updateTicketStatus(ticketId, 'in_progress');
    }
  }

  async function updateTicketStatus(ticketId, status) {
    const action = status === 'closed' ? 'close' : 'reopen';
    if (!confirm(`Are you sure you want to ${action} this ticket?`)) return;

    // Optimistic update for immediate feedback
    tickets = tickets.map(t => t.id === ticketId ? { ...t, status, updated_at: new Date().toISOString() } : t);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) {
        await fetchTickets(); // Rollback on error
        throw error;
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedTicketId) return;

    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (!ticket) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        ticket_id: selectedTicketId,
        user_id: ticket.user_id,
        sender_type: 'admin',
        message: messageText.trim()
      });

      if (error) throw error;
      messageText = '';
      
      // Also update the ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedTicketId);
        
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  }

  let selectedTicket = $derived(
    tickets.find(t => t.id === selectedTicketId)
  );

  function getStatusColor(status) {
    switch (status) {
      case 'open': return 'var(--error)';
      case 'in_progress': return 'var(--warning)';
      case 'closed': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  }
</script>

<div class="chat-page">
  <div class="sidebar">
    <div class="header">
      <h2>Support Tickets</h2>
      <p>Manage user inquiries</p>
    </div>

    <div class="user-list">
      {#if loading && tickets.length === 0}
        <div class="loading">Loading tickets...</div>
      {:else if tickets.length === 0}
        <div class="empty-state">No tickets found</div>
      {:else}
        {#each tickets as ticket}
          <div 
            class="user-item {selectedTicketId === ticket.id ? 'active' : ''}"
            onclick={() => selectTicket(ticket.id)}
          >
            <div class="avatar" style="background: {ticket.status === 'closed' ? '#94A3B8' : ''}">
              {ticket.profiles?.full_name?.[0].toUpperCase() || '?'}
            </div>
            <div class="user-info">
              <div class="top-row">
                <span class="name">{ticket.profiles?.full_name || 'Unknown User'}</span>
                <span class="status-badge" style="background: {getStatusColor(ticket.status)}">
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <span class="last-msg">{ticket.subject}</span>
              <span class="time">{new Date(ticket.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="chat-area">
    {#if selectedTicketId}
      <div class="chat-header">
        <div class="header-main">
          <div class="avatar">{selectedTicket?.profiles?.full_name?.[0].toUpperCase()}</div>
          <div>
            <h3>{selectedTicket?.subject}</h3>
            <span class="email">{selectedTicket?.profiles?.full_name} • {selectedTicket?.profiles?.email}</span>
          </div>
        </div>
        <div class="header-actions">
          {#if selectedTicket?.status !== 'closed'}
            <button class="close-btn" onclick={() => updateTicketStatus(selectedTicketId, 'closed')}>
              Close Ticket
            </button>
          {:else}
            <button class="reopen-btn" onclick={() => updateTicketStatus(selectedTicketId, 'in_progress')}>
              Reopen Ticket
            </button>
          {/if}
        </div>
      </div>

      <div class="messages">
        {#each messages as msg}
          <div class="message {msg.sender_type === 'admin' ? 'admin' : 'user'}">
            <div class="bubble">
              {#if msg.image_url}
                <img src={msg.image_url} alt="Uploaded file" />
              {/if}
              {#if msg.message}
                <p>{msg.message}</p>
              {/if}
            </div>
            <span class="msg-time">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        {/each}
      </div>

      {#if selectedTicket?.status !== 'closed'}
        <div class="input-area">
          <input 
            type="text" 
            bind:value={messageText} 
            placeholder="Type your reply..." 
            onkeydown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onclick={sendMessage} disabled={!messageText.trim()}>Send</button>
        </div>
      {:else}
        <div class="closed-notice">
          This ticket is closed. Reopen it to continue the conversation.
        </div>
      {/if}
    {:else}
      <div class="no-selection">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <h3>Select a ticket</h3>
        <p>Choose a ticket from the left to view details</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    height: calc(100vh - 120px);
    background: var(--surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    animation: slideUp 0.4s cubic-bezier(0, 0, 0.2, 1);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sidebar {
    width: 320px;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }

  .header h2 {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
  }

  .header p {
    font-size: 0.8125rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0 0;
  }

  .user-list {
    flex: 1;
    overflow-y: auto;
  }

  .user-item {
    display: flex;
    padding: 1rem 1.5rem;
    gap: 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-light);
    transition: all 0.2s ease;
  }

  .user-item:hover {
    background: var(--border-light);
  }

  .user-item.active {
    background: var(--primary-accent-light);
    border-left: 4px solid var(--primary-accent);
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-accent), #818CF8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .name {
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-badge {
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 99px;
    color: white;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .time {
    font-size: 0.75rem;
    color: var(--text-muted);
    display: block;
    margin-top: 4px;
  }

  .last-msg {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    font-weight: 500;
  }

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--surface);
  }

  .chat-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--surface);
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .header-main {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .chat-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text);
    font-weight: 800;
  }

  .chat-header .email {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .close-btn {
    background: #EF4444;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 99px;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #DC2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .reopen-btn {
    background: #10B981;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 99px;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    background: #F8FAFC;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 75%;
    animation: messageIn 0.3s ease-out;
  }

  @keyframes messageIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message.user {
    align-self: flex-start;
  }

  .message.admin {
    align-self: flex-end;
    align-items: flex-end;
  }

  .bubble {
    padding: 1rem 1.25rem;
    border-radius: 1.25rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .message.user .bubble {
    background: white;
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    color: var(--text);
  }

  .message.admin .bubble {
    background: var(--primary-accent);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .bubble p {
    margin: 0;
    line-height: 1.6;
    font-size: 0.9375rem;
  }

  .msg-time {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.375rem;
    padding: 0 0.5rem;
    font-weight: 500;
  }

  .input-area {
    padding: 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 1rem;
    background: var(--surface);
  }

  .closed-notice {
    padding: 2rem;
    text-align: center;
    background: #F1F5F9;
    color: #64748B;
    font-weight: 600;
    font-size: 0.9375rem;
    border-top: 1px solid var(--border);
  }

  .input-area input {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 99px;
    border: 1.5px solid var(--border);
    background: var(--bg);
    outline: none;
    font-size: 0.9375rem;
    transition: all 0.2s;
  }

  .input-area input:focus {
    border-color: var(--primary-accent);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .input-area button {
    padding: 0.875rem 1.75rem;
    border-radius: 99px;
    background: var(--primary-accent);
    color: white;
    border: none;
    font-weight: 700;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .input-area button:hover:not(:disabled) {
    background: #4F46E5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  .no-selection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    background: #F8FAFC;
  }

  .no-selection h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--text-secondary);
    font-weight: 800;
  }

  .loading, .empty-state {
    padding: 3rem;
    text-align: center;
    color: var(--text-muted);
    font-weight: 600;
  }
</style>
