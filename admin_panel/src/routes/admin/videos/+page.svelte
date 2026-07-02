<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data } = $props();
  let videos = $derived(data.videos || []);
  let seriesList = $derived(data.series || []);

  let activeTab = $state('videos'); // 'videos' or 'series'
  let viewMode = $state('grid'); // 'grid' or 'list'
  let showModal = $state(false);
  let showSeriesModal = $state(false);
  let isUploading = $state(false);
  let uploadProgress = $state(0);
  let isEditing = $state(false);
  let editingId = $state(null);

  let newVideo = $state({
    title: '',
    description: '',
    category: 'nutrition',
    is_featured: false,
    duration: '',
    thumbnail_url: '',
    video_url: '',
    series_id: null,
    episode_number: null,
    video_type: 'traditional'
  });

  let newSeries = $state({
    title: '',
    description: '',
    thumbnail_url: ''
  });

  let thumbnailFile = $state(null);
  let videoFile = $state(null);
  let seriesThumbnailFile = $state(null);

  let thumbPreview = $state(null);
  let videoPreview = $state(null);
  let seriesThumbPreview = $state(null);

  const categories = [
    { id: 'nutrition', name: 'Nutrition Essentials' },
    { id: 'meal_prep', name: 'Meal Prep & Habits' },
    { id: 'mindset', name: 'Mindset' },
    { id: 'series', name: 'Series' }
  ];

  const reelCategories = [
    { id: 'food', name: 'Food & Recipes' },
    { id: 'news', name: 'Wellness News' },
    { id: 'fitness', name: 'Fitness Clips' },
    { id: 'tips', name: 'Quick Tips' }
  ];

  function handleFileChange(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === 'thumb') {
      thumbnailFile = file;
      thumbPreview = url;
    } else if (type === 'video') {
      videoFile = file;
      videoPreview = url;
      const videoElement = document.createElement('video');
      videoElement.src = url;
      videoElement.onloadedmetadata = () => {
        const minutes = Math.floor(videoElement.duration / 60);
        const seconds = Math.floor(videoElement.duration % 60);
        newVideo.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
    } else if (type === 'series_thumb') {
      seriesThumbnailFile = file;
      seriesThumbPreview = url;
    }
  }

  async function handleFileUpload(file, bucket) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  }

  async function handleVideoSubmit(e) {
    e.preventDefault();
    isUploading = true;
    uploadProgress = 10;

    try {
      let tUrl = newVideo.thumbnail_url;
      let vUrl = newVideo.video_url;

      if (thumbnailFile) tUrl = await handleFileUpload(thumbnailFile, 'video-thumbnails');
      uploadProgress = 40;
      if (videoFile) vUrl = await handleFileUpload(videoFile, 'video-content');
      uploadProgress = 80;

      const payload = { ...newVideo, thumbnail_url: tUrl, video_url: vUrl };
      
      let error;
      if (isEditing) {
        ({ error } = await supabase.from('videos').update(payload).eq('id', editingId));
      } else {
        ({ error } = await supabase.from('videos').insert([payload]));
      }

      if (error) throw error;
      showModal = false;
      resetForm();
      invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }

  async function handleSeriesSubmit(e) {
    e.preventDefault();
    isUploading = true;
    try {
      let tUrl = newSeries.thumbnail_url;
      if (seriesThumbnailFile) tUrl = await handleFileUpload(seriesThumbnailFile, 'video-thumbnails');
      
      const { error } = await supabase.from('series').insert([{ ...newSeries, thumbnail_url: tUrl }]);
      if (error) throw error;
      showSeriesModal = false;
      newSeries = { title: '', description: '', thumbnail_url: '' };
      seriesThumbnailFile = null;
      seriesThumbPreview = null;
      invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      isUploading = false;
    }
  }

  function startEdit(video) {
    isEditing = true;
    editingId = video.id;
    newVideo = { ...video };
    thumbPreview = video.thumbnail_url;
    videoPreview = video.video_url;
    showModal = true;
  }

  function resetForm() {
    isEditing = false;
    editingId = null;
    newVideo = { title: '', description: '', category: newVideo.video_type === 'reel' ? 'food' : 'nutrition', is_featured: false, duration: '', thumbnail_url: '', video_url: '', series_id: null, episode_number: null, video_type: 'traditional' };
    thumbnailFile = null;
    videoFile = null;
    thumbPreview = null;
    videoPreview = null;
  }

  async function deleteItem(table, id, thumbUrl, videoUrl = null) {
    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) return;
    
    try {
      // 1. Delete files from storage (ignore errors if file not found)
      if (thumbUrl) {
        const thumbName = thumbUrl.split('/').pop();
        await supabase.storage.from('video-thumbnails').remove([thumbName]);
      }
      if (videoUrl) {
        const videoName = videoUrl.split('/').pop();
        await supabase.storage.from('video-content').remove([videoName]);
      }

      // 2. Delete from database
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      invalidateAll();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting item: ' + err.message);
    }
  }
</script>

<div class="videos-page">
  <div class="header">
    <div class="title-section">
      <h1>Wellness Media Hub</h1>
      <p>Curate clinical wellness content and masterclasses for your users.</p>
    </div>
    <div class="actions">
      <div class="view-toggle">
        <button class="v-btn" class:active={viewMode === 'grid'} onclick={() => viewMode = 'grid'} title="Grid View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button class="v-btn" class:active={viewMode === 'list'} onclick={() => viewMode = 'list'} title="List View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>
      <button class="btn btn-secondary glass" onclick={() => showSeriesModal = true}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        New Series
      </button>
      <button class="btn btn-primary shadow" onclick={() => { resetForm(); showModal = true; }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        Upload Video
      </button>
    </div>
  </div>

  <div class="tabs">
    <button class="tab {activeTab === 'videos' ? 'active' : ''}" onclick={() => activeTab = 'videos'}>
      <span class="dot"></span> All Content
    </button>
    <button class="tab {activeTab === 'series' ? 'active' : ''}" onclick={() => activeTab = 'series'}>
      <span class="dot"></span> Series Library
    </button>
  </div>

  {#if activeTab === 'videos'}
    {#if viewMode === 'grid'}
      <div class="video-grid">
        {#each videos as video}
          <div class="video-card card animate-in">
            <div class="thumbnail">
              <img src={video.thumbnail_url || '/placeholder.png'} alt="" />
              <div class="duration-badge">{video.duration}</div>
              <div class="actions-overlay">
                <button class="action-btn edit" onclick={() => startEdit(video)} title="Edit Video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn delete" onclick={() => deleteItem('videos', video.id, video.thumbnail_url, video.video_url)} title="Delete Video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
              {#if video.is_featured}
                <div class="featured-badge">FEATURED</div>
              {/if}
            </div>
            <div class="content">
              <div class="meta">
                <span class="category-tag">{video.category}</span>
                <span class="views"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> {video.views_count}</span>
              </div>
              <h3>{video.title}</h3>
              {#if video.series_id}
                <div class="series-info">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Part of: {seriesList.find(s => s.id === video.series_id)?.title}
                  <span class="episode">Ep {video.episode_number || '1'}</span>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Video List Mode -->
      <div class="list-mode card">
        <table>
          <thead>
            <tr>
              <th>Video</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each videos as video}
              <tr>
                <td>
                  <div class="list-item-main">
                    <img src={video.thumbnail_url} alt="" class="list-thumb" />
                    <div>
                      <span class="list-title">{video.title}</span>
                      {#if video.series_id}
                        <span class="list-sub">Ep {video.episode_number} of {seriesList.find(s => s.id === video.series_id)?.title}</span>
                      {/if}
                    </div>
                  </div>
                </td>
                <td><span class="category-tag">{video.category}</span></td>
                <td>{video.duration}</td>
                <td>{video.views_count}</td>
                <td>
                  <div class="list-actions">
                    <button class="act-btn" onclick={() => startEdit(video)}>Edit</button>
                    <button class="act-btn danger" onclick={() => deleteItem('videos', video.id, video.thumbnail_url, video.video_url)}>Delete</button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:else}
    {#if viewMode === 'grid'}
      <div class="series-grid">
        {#each seriesList as series}
          <div class="series-card card animate-in">
            <div class="series-thumb">
              <img src={series.thumbnail_url} alt="" />
              <div class="video-count">{videos.filter(v => v.series_id === series.id).length} Videos</div>
            </div>
            <div class="series-details">
              <h3>{series.title}</h3>
              <p>{series.description || 'No description provided.'}</p>
              <div class="series-actions">
                <button class="text-btn delete" onclick={() => deleteItem('series', series.id, series.thumbnail_url)}>
                  Delete Series
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Series List Mode -->
      <div class="list-mode card">
        <table>
          <thead>
            <tr>
              <th>Series Library</th>
              <th>Content Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each seriesList as series}
              <tr>
                <td>
                  <div class="list-item-main">
                    <img src={series.thumbnail_url} alt="" class="list-thumb" />
                    <div>
                      <span class="list-title">{series.title}</span>
                      <span class="list-sub">{series.description?.substring(0, 60)}...</span>
                    </div>
                  </div>
                </td>
                <td><strong>{videos.filter(v => v.series_id === series.id).length}</strong> videos</td>
                <td>
                  <button class="act-btn danger" onclick={() => deleteItem('series', series.id, series.thumbnail_url)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}

  <!-- Modals remain mostly the same but with enhanced CSS -->
  {#if showModal}
    <div class="modal-overlay" onclick={() => !isUploading && (showModal = false)}>
      <div class="modal card glass-modal" onclick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h2>{isEditing ? 'Edit Wellness Content' : 'New Clinical Video'}</h2>
          <button class="close-btn" onclick={() => showModal = false}>&times;</button>
        </div>
        <form onsubmit={handleVideoSubmit}>
          <div class="form-grid">
            <div class="input-group full">
              <label>Video Title</label>
              <input type="text" bind:value={newVideo.title} class="input-field" placeholder="e.g. Clinical Nutrition Masterclass" required />
            </div>
            <div class="input-group">
              <label>Category</label>
              <select bind:value={newVideo.category} class="input-field">
                {#each categories as cat}<option value={cat.id}>{cat.name}</option>{/each}
              </select>
            </div>
            <div class="input-group">
              <label>Series Assignment</label>
              <select bind:value={newVideo.series_id} class="input-field">
                <option value={null}>Standalone Content</option>
                {#each seriesList as s}<option value={s.id}>{s.title}</option>{/each}
              </select>
            </div>
            <div class="input-group full">
              <label>Description</label>
              <textarea bind:value={newVideo.description} class="input-field" rows="3" placeholder="Provide a clinical overview..."></textarea>
            </div>
            
            <div class="upload-section full">
              <div class="upload-box">
                <label>Thumbnail Preview</label>
                <div class="preview-area {thumbPreview ? 'has-file' : ''}">
                  {#if thumbPreview}<img src={thumbPreview} alt="" />{/if}
                  <div class="upload-prompt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>Click to change image</span>
                  </div>
                  <input type="file" accept="image/*" onchange={e => handleFileChange(e, 'thumb')} />
                </div>
              </div>
              <div class="upload-box">
                <label>Video Source {newVideo.duration ? `(${newVideo.duration})` : ''}</label>
                <div class="preview-area {videoPreview ? 'has-file' : ''}">
                  {#if videoPreview}<video src={videoPreview} class="mini-player"></video>{/if}
                  <div class="upload-prompt">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    <span>Click to change video</span>
                  </div>
                  <input type="file" accept="video/*" onchange={e => handleFileChange(e, 'video')} />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            {#if isUploading}
              <div class="upload-status">
                <div class="spinner"></div>
                <span>Uploading to Clinical Storage ({uploadProgress}%)</span>
              </div>
            {/if}
            <button type="button" class="btn text" onclick={() => showModal = false}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={isUploading}>
              {isEditing ? 'Update Content' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Series Modal remains similar but styled -->
  {#if showSeriesModal}
    <div class="modal-overlay" onclick={() => showSeriesModal = false}>
      <div class="modal card glass-modal narrow" onclick={e => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Create New Series</h2>
          <button class="close-btn" onclick={() => showSeriesModal = false}>&times;</button>
        </div>
        <form onsubmit={handleSeriesSubmit}>
          <div class="input-group"><label>Series Title</label><input type="text" bind:value={newSeries.title} class="input-field" required /></div>
          <div class="input-group"><label>Series Description</label><textarea bind:value={newSeries.description} class="input-field" rows="3"></textarea></div>
          <div class="input-group">
            <label>Cover Image</label>
            <div class="preview-area {seriesThumbPreview ? 'has-file' : ''}">
              {#if seriesThumbPreview}<img src={seriesThumbPreview} alt="" />{/if}
              <input type="file" accept="image/*" onchange={e => handleFileChange(e, 'series_thumb')} />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn text" onclick={() => showSeriesModal = false}>Cancel</button>
            <button type="submit" class="btn btn-primary" disabled={isUploading}>Initialize Series</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .videos-page { max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease; }
  
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .title-section h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.025em; }
  .title-section p { color: var(--text-muted); margin-top: 0.25rem; font-size: 0.875rem; }
  
  .actions { display: flex; gap: 0.75rem; }
  .btn { padding: 0.625rem 1.25rem; border-radius: var(--radius); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; border: none; font-size: 0.8125rem; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: #1E293B; transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .btn-secondary { background: var(--surface); border: 1.5px solid var(--border); color: var(--text); }
  .btn-secondary:hover { background: var(--bg); }
  .btn.glass { background: var(--surface); border: 1.5px solid var(--border); }

  .tabs { display: flex; gap: 0.25rem; background: var(--border-light); border-radius: var(--radius); padding: 0.25rem; width: fit-content; margin-bottom: 2rem; }
  .tab { background: none; border: none; padding: 0.5rem 1.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.15s; border-radius: calc(var(--radius) - 2px); }
  .tab .dot { width: 6px; height: 6px; border-radius: 50%; background: transparent; transition: 0.2s; }
  .tab.active { background: var(--surface); color: var(--primary-accent); box-shadow: var(--shadow-sm); }
  .tab.active .dot { background: var(--primary-accent); }

  .view-toggle { display: flex; background: var(--surface); border: 1px solid var(--border); padding: 0.25rem; border-radius: 10px; gap: 0.125rem; margin-right: 0.5rem; }
  .v-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .v-btn.active { background: white; color: var(--primary-accent); box-shadow: var(--shadow-sm); }

  /* List Mode */
  .list-mode { padding: 0 !important; overflow: hidden; }
  .list-mode table { width: 100%; border-collapse: collapse; }
  .list-mode th { text-align: left; padding: 0.875rem 1.25rem; background: var(--bg); font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-light); }
  .list-mode td { padding: 0.75rem 1.25rem; font-size: 0.8125rem; border-bottom: 1px solid var(--border-light); }
  
  .list-item-main { display: flex; align-items: center; gap: 1rem; }
  .list-thumb { width: 80px; height: 45px; border-radius: 6px; object-fit: cover; background: var(--bg); }
  .list-title { display: block; font-weight: 700; color: var(--text); }
  .list-sub { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

  .list-actions { display: flex; gap: 1rem; }
  .act-btn { background: none; border: none; font-size: 0.75rem; font-weight: 700; color: var(--primary-accent); cursor: pointer; padding: 0; }
  .act-btn.danger { color: var(--danger); }
  .act-btn:hover { text-decoration: underline; }

  /* Video Grid & Cards */
  .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  .video-card { overflow: hidden; transition: all 0.2s; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-sm); }
  .video-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  
  .thumbnail { position: relative; height: 200px; }
  .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
  
  .actions-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; gap: 1rem; opacity: 0; transition: 0.3s; }
  .thumbnail:hover .actions-overlay { opacity: 1; }
  
  .action-btn { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
  .action-btn:hover { background: white; transform: scale(1.1); }
  .action-btn.edit:hover svg { stroke: var(--primary-accent); }
  .action-btn.delete:hover { background: var(--danger); border-color: var(--danger); }

  .duration-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; }
  .featured-badge { position: absolute; top: 10px; left: 10px; background: var(--primary-accent); color: white; padding: 3px 10px; border-radius: 6px; font-size: 0.625rem; font-weight: 800; letter-spacing: 0.03em; }

  .content { padding: 1.25rem; }
  .meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .category-tag { font-size: 0.625rem; font-weight: 700; color: var(--primary-accent); text-transform: uppercase; background: var(--primary-accent-light); padding: 3px 8px; border-radius: 6px; letter-spacing: 0.03em; }
  .views { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
  
  h3 { font-size: 1rem; font-weight: 700; color: var(--text); line-height: 1.4; margin-bottom: 0.5rem; }
  .series-info { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; padding-top: 0.625rem; border-top: 1px solid var(--border-light); }
  .episode { margin-left: auto; font-weight: 700; color: var(--text); }

  /* Series Grid */
  .series-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
  .series-card { overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--surface); box-shadow: var(--shadow-sm); }
  .series-thumb { position: relative; height: 180px; }
  .series-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .video-count { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 3px 10px; border-radius: 6px; font-size: 0.6875rem; font-weight: 700; }
  .series-details { padding: 1.25rem; }
  .series-details h3 { margin-bottom: 0.375rem; }
  .series-details p { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem; }
  .series-actions { display: flex; gap: 0.5rem; }
  .text-btn { background: none; border: none; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.375rem 0; }
  .text-btn.delete { color: var(--danger); }
  .text-btn.delete:hover { text-decoration: underline; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(6px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
  .glass-modal { background: var(--surface); width: 100%; max-width: 700px; padding: 0; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); }
  .glass-modal.narrow { max-width: 480px; }
  .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
  .modal-header h2 { font-size: 1.125rem; }
  .close-btn { font-size: 1.75rem; background: none; border: none; color: var(--text-muted); cursor: pointer; line-height: 1; }
  .close-btn:hover { color: var(--text); }
  
  form { padding: 1.5rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .full { grid-column: span 2; }
  
  .input-field { width: 100%; padding: 0.625rem 0.875rem; border-radius: var(--radius); border: 1.5px solid var(--border); background: var(--bg); transition: all 0.2s; font-size: 0.875rem; }
  .input-field:focus { border-color: var(--primary-accent); outline: none; background: var(--surface); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  
  .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 0.75rem; }
  .preview-area { height: 150px; border: 2px dashed var(--border); border-radius: var(--radius-lg); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--bg); }
  .preview-area.has-file { border-style: solid; border-color: var(--primary-accent); }
  .preview-area img, .preview-area video { width: 100%; height: 100%; object-fit: cover; }
  .upload-prompt { position: absolute; pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 0.375rem; color: var(--text-muted); font-size: 0.8125rem; }
  .preview-area:hover .upload-prompt { color: var(--primary-accent); }
  .preview-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

  .modal-footer { padding: 1rem 1.5rem; background: var(--bg); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; }
  .btn.text { background: transparent; color: var(--text-muted); border: none; }
  .btn.text:hover { color: var(--text); }
  .upload-status { margin-right: auto; display: flex; align-items: center; gap: 0.5rem; color: var(--primary-accent); font-weight: 600; font-size: 0.8125rem; }
  
  .spinner { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--primary-accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .animate-in { animation: fadeInUp 0.4s ease-out both; }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .shadow { box-shadow: var(--shadow-md); }
</style>
