<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  import { goto } from '$app/navigation';

  let { data } = $props();
  let reels = $derived(data.reels || []);

  const categories = [
    { id: 'food', name: 'Food & Recipes' },
    { id: 'news', name: 'Wellness News' },
    { id: 'fitness', name: 'Fitness Clips' },
    { id: 'tips', name: 'Quick Tips' }
  ];

  async function deleteReel(id, thumbUrl, videoUrl) {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    try {
      if (thumbUrl) await supabase.storage.from('video-thumbnails').remove([thumbUrl.split('/').pop()]);
      if (videoUrl) await supabase.storage.from('video-content').remove([videoUrl.split('/').pop()]);
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  let selectedAnalyticsReel = $state(null);
  let analyticsData = $state({ likes: [], comments: [] });
  let loadingAnalytics = $state(false);

  async function openAnalytics(reel) {
    selectedAnalyticsReel = reel;
    loadingAnalytics = true;
    try {
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from('video_likes').select('profiles(full_name, email)').eq('video_id', reel.id),
        supabase.from('video_comments').select('*, profiles(full_name, email)').eq('video_id', reel.id).order('created_at', { ascending: false })
      ]);
      analyticsData = { 
        likes: likesRes.data || [], 
        comments: commentsRes.data || [] 
      };
    } catch (err) {
      console.error(err);
    } finally {
      loadingAnalytics = false;
    }
  }
</script>

<div class="reels-page">
  <div class="header">
    <div class="title-section">
      <h1>Wellness Reels</h1>
      <p>Manage clinical short clips and wellness reels for mobile users.</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary shadow" onclick={() => goto('/admin/reels/create')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        New Reel
      </button>
    </div>
  </div>

  <div class="video-grid reels-grid">
    {#each reels as reel}
      <div class="video-card reel-card card animate-in">
        <div class="thumbnail reel-thumb">
          <img src={reel.thumbnail_url || '/placeholder.png'} alt="" />
          <div class="duration-badge">{reel.duration}</div>
          <div class="actions-overlay">
            <button class="action-btn analytics" onclick={() => openAnalytics(reel)} title="View Analytics">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </button>
            <button class="action-btn edit" onclick={() => goto(`/admin/reels/${reel.id}`)} title="Edit Reel">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete" onclick={() => deleteReel(reel.id, reel.thumbnail_url, reel.video_url)} title="Delete Reel">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="content">
          <div class="meta">
            <span class="category-tag">{categories.find(c => c.id === reel.category)?.name || reel.category}</span>
            <div class="stats-row">
              <span class="views"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> {reel.views_count}</span>
              <span class="views"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> {reel.likes_count || 0}</span>
              <span class="views"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> {reel.comments_count || 0}</span>
            </div>
          </div>
          <h3>{reel.title}</h3>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if selectedAnalyticsReel}
  <div class="modal-overlay" onclick={() => selectedAnalyticsReel = null}>
    <div class="glass-modal analytics-modal" onclick={e => e.stopPropagation()}>
      <div class="modal-header">
        <div>
          <h2>Engagement Details</h2>
          <p>{selectedAnalyticsReel.title}</p>
        </div>
        <button class="close-btn" onclick={() => selectedAnalyticsReel = null}>&times;</button>
      </div>

      <div class="analytics-content">
        {#if loadingAnalytics}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Syncing clinical metrics...</p>
          </div>
        {:else}
          <div class="analytics-tabs">
            <div class="analytics-section">
              <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Likes ({analyticsData.likes.length})</h3>
              <div class="users-list">
                {#each analyticsData.likes as like}
                  <div class="user-row">
                    <div class="user-avatar">{like.profiles?.full_name?.[0] || 'U'}</div>
                    <div class="user-info">
                      <span class="name">{like.profiles?.full_name || 'Anonymous'}</span>
                      <span class="email">{like.profiles?.email || ''}</span>
                    </div>
                  </div>
                {:else}
                  <p class="empty">No likes yet.</p>
                {/each}
              </div>
            </div>

            <div class="divider-v"></div>

            <div class="analytics-section">
              <h3><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Comments ({analyticsData.comments.length})</h3>
              <div class="comments-list">
                {#each analyticsData.comments as comment}
                  <div class="comment-item">
                    <div class="comment-meta">
                      <strong>{comment.profiles?.full_name || 'Anonymous'}</strong>
                      <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                {:else}
                  <p class="empty">No comments yet.</p>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .reels-page { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .title-section h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); }
  .title-section p { color: var(--text-muted); margin-top: 0.25rem; font-size: 0.875rem; }
  
  .btn { padding: 0.625rem 1.25rem; border-radius: var(--radius); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.8125rem; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: #1E293B; transform: translateY(-1px); box-shadow: var(--shadow-md); }

  .reels-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1.5rem; }
  .reel-card { overflow: hidden; transition: all 0.2s; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-sm); }
  .reel-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .reel-thumb { position: relative; height: 420px; border-radius: 20px; overflow: hidden; }
  .reel-thumb img { width: 100%; height: 100%; object-fit: cover; }
  
  .actions-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; gap: 1.5rem; opacity: 0; transition: 0.3s; }
  .reel-thumb:hover .actions-overlay { opacity: 1; }
  
  .action-btn { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .action-btn:hover { background: white; transform: scale(1.1); }

  .duration-badge { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; }

  .content { padding: 1.5rem; }
  .meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .category-tag { font-size: 0.625rem; font-weight: 700; color: var(--primary-accent); text-transform: uppercase; background: var(--primary-accent-light); padding: 3px 8px; border-radius: 6px; letter-spacing: 0.03em; }
  .stats-row { display: flex; align-items: center; gap: 12px; }
  .views { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
  h3 { font-size: 1rem; font-weight: 700; color: var(--text); }

  /* Modal Styles copied for consistency */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(6px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .glass-modal { background: var(--surface); width: 100%; max-width: 700px; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); }
  .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
  .modal-header h2 { font-size: 1.125rem; font-weight: 800; color: var(--text); }
  .close-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: #f1f5f9; border: none; cursor: pointer; transition: 0.2s; }
  .close-btn:hover { background: #e2e8f0; transform: rotate(90deg); }
  
  form { padding: 2.5rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .full { grid-column: span 2; }
  
  label { display: block; font-size: 0.875rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .input-field { width: 100%; padding: 0.875rem 1.25rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; transition: all 0.2s; font-size: 1rem; }
  .input-field:focus { border-color: var(--accent); background: white; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
  
  .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
  .preview-area { height: 180px; border: 2px dashed #e2e8f0; border-radius: 20px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: 0.3s; }
  .preview-area.has-file { border-style: solid; border-color: var(--accent); }
  .preview-area img, .preview-area video { width: 100%; height: 100%; object-fit: cover; }
  
  .upload-prompt { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-muted); pointer-events: none; transition: 0.3s; background: rgba(248, 250, 252, 0.8); }
  .upload-prompt.overlay { opacity: 0; background: rgba(15, 23, 42, 0.6); color: white; }
  .preview-area:hover .upload-prompt.overlay { opacity: 1; }
  .preview-area:hover:not(.has-file) { border-color: var(--accent); background: #eff6ff; }
  .preview-area:hover:not(.has-file) .upload-prompt { color: var(--accent); }

  .preview-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  
  .modal-footer { padding: 1.5rem 2.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; align-items: center; gap: 1rem; }
  .btn.text { background: transparent; color: var(--text-muted); }
  .btn.text:hover { color: var(--text); background: #f1f5f9; }
  
  .upload-status { margin-right: auto; display: flex; align-items: center; gap: 0.75rem; color: var(--accent); font-weight: 700; }
  .spinner { width: 20px; height: 20px; border: 3px solid #eff6ff; border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .animate-in { animation: fadeInUp 0.5s ease-out forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  .analytics-modal { max-width: 900px; }
  .modal-header p { font-size: 0.9rem; color: var(--text-muted); margin-top: 4px; }
  .analytics-content { padding: 2rem; min-height: 400px; max-height: 70vh; overflow-y: auto; }
  
  .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 1rem; color: var(--text-muted); }
  
  .analytics-tabs { display: grid; grid-template-columns: 1fr auto 1.5fr; gap: 2rem; }
  .divider-v { width: 1px; background: #f1f5f9; }
  
  .analytics-section h3 { display: flex; align-items: center; gap: 10px; font-size: 1rem; font-weight: 800; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text); }
  
  .users-list, .comments-list { display: flex; flex-direction: column; gap: 1rem; }
  
  .user-row { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 12px; transition: 0.2s; }
  .user-avatar { width: 36px; height: 36px; background: #eff6ff; color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
  .user-info { display: flex; flex-direction: column; }
  .user-info .name { font-weight: 700; font-size: 0.9rem; }
  .user-info .email { font-size: 0.75rem; color: var(--text-muted); }
  
  .comment-item { background: #f8fafc; padding: 1.25rem; border-radius: 16px; border: 1px solid #f1f5f9; }
  .comment-meta { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; }
  .comment-meta strong { color: var(--text); }
  .comment-meta span { color: var(--text-muted); }
  .comment-item p { font-size: 0.95rem; color: #475569; line-height: 1.5; }
  
  .empty { text-align: center; color: var(--text-muted); padding: 2rem; font-style: italic; font-size: 0.9rem; }
</style>
