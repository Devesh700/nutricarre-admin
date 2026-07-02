<script>
  import { supabase } from '$lib/supabase';
  import { uploadToBunny } from '$lib/bunny';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let isUploading = $state(false);
  let uploadProgress = $state(0);

  let newReel = $state({
    title: '',
    description: '',
    category: 'food',
    is_featured: false,
    duration: '',
    thumbnail_url: '',
    video_url: '',
    video_type: 'reel'
  });

  let thumbnailFile = $state(null);
  let videoFile = $state(null);
  let thumbPreview = $state(null);
  let videoPreview = $state(null);

  let useExternalThumb = $state(false);
  let useExternalVideo = $state(false);

  const categories = [
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
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('File size exceeds 50MB limit. Please upload a smaller video.');
        e.target.value = '';
        return;
      }
      videoFile = file;
      videoPreview = url;
      const videoElement = document.createElement('video');
      videoElement.src = url;
      videoElement.onloadedmetadata = () => {
        const minutes = Math.floor(videoElement.duration / 60);
        const seconds = Math.floor(videoElement.duration % 60);
        newReel.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };
    }
  }

  async function handleFileUpload(file, folder) {
    return await uploadToBunny(file, folder);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!thumbnailFile || !videoFile) {
        alert('Please select both a thumbnail and a video file.');
        return;
    }
    
    isUploading = true;
    uploadProgress = 10;

    try {
      let tUrl = newReel.thumbnail_url;
      let vUrl = newReel.video_url;

      if (!useExternalThumb && thumbnailFile) {
        tUrl = await handleFileUpload(thumbnailFile, 'thumbnails');
      }
      uploadProgress = 40;
      
      if (!useExternalVideo && videoFile) {
        vUrl = await handleFileUpload(videoFile, 'videos');
      }
      uploadProgress = 80;

      const payload = { ...newReel, thumbnail_url: tUrl, video_url: vUrl };
      
      const { error } = await supabase.from('videos').insert([payload]);
      if (error) throw error;

      goto('/admin/reels');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }
</script>

<div class="edit-reel-page animate-in">
  <div class="page-header">
    <div class="back-link">
      <button onclick={() => goto('/admin/reels')} class="btn-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Reels
      </button>
    </div>
    <h1>Create New Wellness Reel</h1>
    <p>Upload clinical short clips and wellness masterclasses for mobile users.</p>
  </div>

  <div class="content-card card shadow-lg">
    <form onsubmit={handleSubmit}>
      <div class="form-grid">
        <div class="input-group full">
          <label>Reel Title</label>
          <input type="text" bind:value={newReel.title} class="input-field" placeholder="e.g. 5 Mins Healthy Breakfast" required />
        </div>
        <div class="input-group full">
          <label>Category</label>
          <select bind:value={newReel.category} class="input-field">
            {#each categories as cat}<option value={cat.id}>{cat.name}</option>{/each}
          </select>
        </div>
        <div class="input-group full">
          <label>Description</label>
          <textarea bind:value={newReel.description} class="input-field" rows="4" placeholder="Provide a brief clinical overview..."></textarea>
        </div>
        
        <div class="upload-section full">
          <div class="upload-box">
            <div class="box-header">
              <label>Thumbnail</label>
              <button type="button" class="toggle-btn" onclick={() => useExternalThumb = !useExternalThumb}>
                {useExternalThumb ? 'Switch to Upload' : 'Use External URL'}
              </button>
            </div>
            
            {#if useExternalThumb}
              <input type="text" bind:value={newReel.thumbnail_url} class="input-field" placeholder="Paste thumbnail URL (e.g. Bunny.net link)" />
            {:else}
              <div class="preview-area {thumbPreview ? 'has-file' : ''}">
                {#if thumbPreview}<img src={thumbPreview} alt="" />{/if}
                <div class="upload-prompt {thumbPreview ? 'overlay' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>{thumbPreview ? 'Change Image' : 'Upload to Bunny.net'}</span>
                </div>
                <input type="file" accept="image/*" onchange={e => handleFileChange(e, 'thumb')} />
              </div>
            {/if}
          </div>

          <div class="upload-box">
            <div class="box-header">
              <label>Video Source</label>
              <button type="button" class="toggle-btn" onclick={() => useExternalVideo = !useExternalVideo}>
                {useExternalVideo ? 'Switch to Upload' : 'Use External URL'}
              </button>
            </div>

            {#if useExternalVideo}
              <input type="text" bind:value={newReel.video_url} class="input-field" placeholder="Paste video URL (Bunny.net/Cloudflare)" />
            {:else}
              <div class="preview-area {videoPreview ? 'has-file' : ''}">
                {#if videoPreview}<video src={videoPreview} class="mini-player"></video>{/if}
                <div class="upload-prompt {videoPreview ? 'overlay' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  <span>{videoPreview ? 'Change Video' : 'Upload to Bunny.net'}</span>
                  <span class="limit-hint">Optimized Streaming</span>
                </div>
                <input type="file" accept="video/*" onchange={e => handleFileChange(e, 'video')} />
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="form-footer">
        {#if isUploading}
          <div class="upload-status">
            <div class="spinner"></div>
            <span>Uploading to Bunny.net CDN ({uploadProgress}%)</span>
          </div>
        {/if}
        <button type="button" class="btn text" onclick={() => goto('/admin/reels')}>Cancel</button>
        <button type="submit" class="btn btn-primary" disabled={isUploading}>
          Publish Reel
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .edit-reel-page { padding: 2rem; max-width: 900px; margin: 0 auto; }
  .page-header { margin-bottom: 3rem; }
  .back-link { margin-bottom: 1.5rem; }
  .btn-text { background: none; border: none; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; padding: 0; }
  .btn-text:hover { color: var(--accent); }
  
  h1 { font-size: 2.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
  .page-header p { color: var(--text-muted); font-size: 1.1rem; margin-top: 0.5rem; }

  .content-card { background: white; border-radius: 32px; padding: 0; overflow: hidden; border: 1px solid #f1f5f9; }
  form { padding: 3rem; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .full { grid-column: span 2; }
  
  label { display: block; font-size: 0.875rem; font-weight: 800; color: var(--text-muted); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .input-field { width: 100%; padding: 1rem 1.25rem; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 1rem; transition: 0.2s; }
  .input-field:focus { border-color: var(--accent); background: white; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
  
  .box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .toggle-btn { background: #eff6ff; color: var(--accent); border: none; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; cursor: pointer; text-transform: uppercase; }
  .toggle-btn:hover { background: var(--accent); color: white; }

  .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem; }
  .preview-area { height: 240px; border: 2px dashed #e2e8f0; border-radius: 24px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f8fafc; transition: 0.3s; }
  .preview-area.has-file { border-style: solid; border-color: var(--accent); }
  .preview-area img, .preview-area video { width: 100%; height: 100%; object-fit: cover; }
  
  .upload-prompt span { font-weight: 700; }
  .limit-hint { font-size: 0.75rem; font-weight: 600; color: var(--accent); opacity: 0.8; margin-top: -0.25rem; }
  .upload-prompt.overlay { opacity: 0; background: rgba(15, 23, 42, 0.7); color: white; backdrop-filter: blur(4px); }
  .preview-area:hover .upload-prompt.overlay { opacity: 1; }
  .preview-area:hover:not(.has-file) { border-color: var(--accent); background: #eff6ff; }
  
  .preview-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  
  .form-footer { padding: 2rem 3rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; align-items: center; gap: 1.5rem; }
  .btn { padding: 1rem 2rem; border-radius: 14px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
  .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(30, 41, 59, 0.3); }
  .btn.text { background: transparent; color: var(--text-muted); }
  .btn.text:hover { background: #e2e8f0; color: var(--text); }
  
  .upload-status { margin-right: auto; display: flex; align-items: center; gap: 1rem; color: var(--accent); font-weight: 700; }
  .spinner { width: 24px; height: 24px; border: 3px solid #eff6ff; border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .animate-in { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
