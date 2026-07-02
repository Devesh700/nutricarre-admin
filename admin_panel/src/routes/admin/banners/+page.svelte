<script>
  import { supabase } from '$lib/supabase';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();
  let banners = $derived(data.banners || []);

  // Modal and Form States
  let showModal = $state(false);
  let isEditing = $state(false);
  let editingId = $state(null);

  // Banner details
  let title = $state('');
  let subtitle = $state('');
  let imageUrl = $state('');
  let linkUrl = $state('');
  let displayOrder = $state(1);
  let isActive = $state(true);

  // File upload states
  let useExternalUrl = $state(false);
  let selectedFile = $state(null);
  let imagePreview = $state('');
  let isUploading = $state(false);
  let uploadProgress = $state(0);
  let loading = $state(false);

  function resetForm() {
    title = '';
    subtitle = '';
    imageUrl = '';
    linkUrl = '';
    displayOrder = banners.length + 1;
    isActive = true;
    isEditing = false;
    editingId = null;
    selectedFile = null;
    imagePreview = '';
    useExternalUrl = false;
    uploadProgress = 0;
    isUploading = false;
  }

  function openCreateModal() {
    resetForm();
    showModal = true;
  }

  function openEditModal(banner) {
    title = banner.title || '';
    subtitle = banner.subtitle || '';
    imageUrl = banner.image_url || '';
    linkUrl = banner.link_url || '';
    displayOrder = banner.display_order || 0;
    isActive = banner.is_active !== false;
    isEditing = true;
    editingId = banner.id;
    
    selectedFile = null;
    imagePreview = banner.image_url || '';
    useExternalUrl = true; // For editing, show current URL by default
    showModal = true;
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    selectedFile = file;
    imagePreview = URL.createObjectURL(file);
  }

  async function saveBanner(e) {
    e.preventDefault();
    
    if (!useExternalUrl && !selectedFile && !isEditing) {
      alert('Please select an image file to upload.');
      return;
    }
    if (useExternalUrl && !imageUrl) {
      alert('Please enter an image URL.');
      return;
    }

    loading = true;
    isUploading = true;
    uploadProgress = 10;

    try {
      let finalImageUrl = imageUrl;

      // Handle file upload to Supabase Storage if local file is selected
      if (!useExternalUrl && selectedFile) {
        uploadProgress = 30;
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        
        uploadProgress = 50;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('banner-images')
          .upload(fileName, selectedFile);
          
        if (uploadErr) {
          throw new Error('Supabase Storage upload failed: ' + uploadErr.message);
        }

        uploadProgress = 85;
        const { data: { publicUrl } } = supabase.storage
          .from('banner-images')
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrl;
      }

      uploadProgress = 95;

      const bannerData = {
        title,
        subtitle,
        image_url: finalImageUrl,
        link_url: linkUrl,
        display_order: parseInt(displayOrder) || 0,
        is_active: isActive
      };

      if (isEditing) {
        const { error } = await supabase
          .from('homepage_banners')
          .update(bannerData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_banners')
          .insert(bannerData);
        if (error) throw error;
      }

      uploadProgress = 100;
      showModal = false;
      resetForm();
      invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      loading = false;
      isUploading = false;
    }
  }

  async function deleteBanner(banner) {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      // 1. Delete image from Supabase Storage if it was uploaded there
      if (banner.image_url && banner.image_url.includes('/banner-images/')) {
        try {
          const filePart = banner.image_url.split('/banner-images/').pop();
          if (filePart) {
            await supabase.storage.from('banner-images').remove([filePart]);
          }
        } catch (storageErr) {
          console.warn('Failed to clean up storage image:', storageErr);
        }
      }

      // 2. Delete banner row
      const { error } = await supabase
        .from('homepage_banners')
        .delete()
        .eq('id', banner.id);
      if (error) throw error;
      invalidateAll();
    } catch (err) {
      alert('Error deleting banner: ' + err.message);
    }
  }

  async function toggleStatus(banner) {
    try {
      const { error } = await supabase
        .from('homepage_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);
      if (error) throw error;
      invalidateAll();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
</script>

<div class="banners-page">
  <div class="header animate-in">
    <div class="title-section">
      <h1>Homepage Banners</h1>
      <p>Upload, configure, and manage premium homepage banners stored securely in Supabase.</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary shadow" onclick={openCreateModal}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Banner
      </button>
    </div>
  </div>

  <!-- Realtime Preview & Banners Listing -->
  <div class="banners-grid">
    {#each banners as banner}
      <div class="banner-card card animate-in" class:inactive={!banner.is_active}>
        <div class="banner-image-wrapper">
          <img src={banner.image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop'} alt={banner.title} />
          <div class="banner-overlay">
            <div class="banner-badge" class:active-badge={banner.is_active}>
              {banner.is_active ? 'Active' : 'Inactive'}
            </div>
            <div class="order-badge">Order: {banner.display_order}</div>
          </div>
          <div class="banner-text">
            <h3>{banner.title || 'Untitled Banner'}</h3>
            <p>{banner.subtitle || 'No subtitle provided.'}</p>
          </div>
        </div>
        <div class="card-actions">
          <button class="action-btn toggle" onclick={() => toggleStatus(banner)} title={banner.is_active ? 'Deactivate' : 'Activate'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
            <span>{banner.is_active ? 'Deactivate' : 'Activate'}</span>
          </button>
          <div class="action-buttons-right">
            <button class="action-btn edit" onclick={() => openEditModal(banner)} title="Edit Banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete" onclick={() => deleteBanner(banner)} title="Delete Banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="empty-state full animate-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <h2>No banners configured yet</h2>
        <p>Promotional banners can guide mobile app users to specific wellness resources, diet trackers, or articles.</p>
        <button class="btn btn-primary" onclick={openCreateModal}>Configure First Banner</button>
      </div>
    {/each}
  </div>
</div>

<!-- Modal Dialog -->
{#if showModal}
  <div class="modal-overlay" onclick={() => showModal = false}>
    <div class="glass-modal banner-modal animate-in" onclick={e => e.stopPropagation()}>
      <div class="modal-header">
        <div>
          <h2>{isEditing ? 'Edit Homepage Banner' : 'Create Homepage Banner'}</h2>
          <p>Banners display at the very top of the mobile home screen.</p>
        </div>
        <button class="close-btn" onclick={() => showModal = false}>&times;</button>
      </div>

      <!-- Realtime preview inside modal -->
      <div class="live-preview-section">
        <label>LIVE MOBILE APP PREVIEW</label>
        <div class="mobile-preview-container">
          <div class="mobile-banner-preview">
            <img src={imagePreview || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop'} alt="Live Preview" />
            <div class="mobile-banner-text">
              <h4>{title || 'Sip Your Way to Vitality'}</h4>
              <p>{subtitle || 'Hydration is key to healthy energy levels and metabolism.'}</p>
            </div>
            <div class="mobile-indicators">
              <div class="dot active"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <form onsubmit={saveBanner}>
        <div class="form-grid">
          <div class="full">
            <label for="title">Banner Title</label>
            <input type="text" id="title" class="input-field" placeholder="e.g., Delicious Clean Eating" bind:value={title} required />
          </div>

          <div class="full">
            <label for="subtitle">Subtitle / Call to Action Description</label>
            <input type="text" id="subtitle" class="input-field" placeholder="e.g., Explore doctor-approved recipes now" bind:value={subtitle} />
          </div>

          <div class="full">
            <div class="box-header">
              <label>Banner Image Resource</label>
              <button type="button" class="toggle-btn" onclick={() => useExternalUrl = !useExternalUrl}>
                {useExternalUrl ? 'Switch to Supabase Upload' : 'Use External URL'}
              </button>
            </div>

            {#if useExternalUrl}
              <input type="url" id="imageUrl" class="input-field" placeholder="Paste image URL (e.g. https://images.unsplash.com/...)" bind:value={imageUrl} required />
            {:else}
              <div class="preview-area {imagePreview ? 'has-file' : ''}">
                {#if imagePreview}<img src={imagePreview} alt="Uploaded Banner" />{/if}
                <div class="upload-prompt {imagePreview ? 'overlay' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>{imagePreview ? 'Replace Image' : 'Select Banner to Upload to Supabase'}</span>
                  <span class="limit-hint">Optimized Web formats (.png, .jpg, .webp)</span>
                </div>
                <input type="file" accept="image/*" onchange={handleFileChange} />
              </div>
            {/if}
          </div>

          <div class="full">
            <label for="linkUrl">Destination Deep-Link (Optional)</label>
            <input type="text" id="linkUrl" class="input-field" placeholder="e.g., /recipes or /support" bind:value={linkUrl} />
          </div>

          <div>
            <label for="displayOrder">Display Order (Sorting)</label>
            <input type="number" id="displayOrder" class="input-field" min="1" bind:value={displayOrder} required />
          </div>

          <div class="toggle-container">
            <label>Banner Status</label>
            <div class="flex-align">
              <label class="switch">
                <input type="checkbox" bind:checked={isActive} />
                <span class="slider"></span>
              </label>
              <span class="toggle-label">{isActive ? 'Active and visible to app users' : 'Inactive / Hidden'}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          {#if isUploading}
            <div class="upload-status">
              <div class="spinner"></div>
              <span>Uploading to Supabase Storage ({uploadProgress}%)</span>
            </div>
          {/if}
          <button type="button" class="btn text" onclick={() => showModal = false}>Cancel</button>
          <button type="submit" class="btn btn-primary shadow" disabled={loading}>
            {#if loading}
              Saving...
            {:else}
              Save Banner Configuration
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .banners-page {
    max-width: 1400px;
    margin: 0 auto;
    animation: fadeIn 0.3s ease;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .title-section h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
  }
  .title-section p {
    color: var(--text-muted);
    margin-top: 0.25rem;
    font-size: 0.875rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: var(--radius);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 0.8125rem;
  }
  .btn-primary {
    background: var(--primary);
    color: white;
  }
  .btn-primary:hover {
    background: #1E293B;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .banners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 1.5rem;
  }

  .banner-card {
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--surface);
    border: 1px solid var(--border);
    transition: all 0.2s ease-in-out;
  }
  .banner-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .banner-card.inactive {
    opacity: 0.7;
    filter: grayscale(40%);
  }

  .banner-image-wrapper {
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  .banner-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale 0.5s ease;
  }
  .banner-card:hover img {
    scale: 1.05;
  }

  .banner-overlay {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }
  .banner-badge {
    background: rgba(15, 23, 42, 0.75);
    color: #cbd5e1;
    backdrop-filter: blur(8px);
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 700;
  }
  .banner-badge.active-badge {
    background: rgba(16, 185, 129, 0.85);
    color: white;
  }
  .order-badge {
    background: rgba(30, 41, 59, 0.85);
    color: white;
    backdrop-filter: blur(8px);
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .banner-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem 1.25rem 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0) 100%);
    color: white;
  }
  .banner-text h3 {
    font-size: 1.125rem;
    font-weight: 800;
    margin-bottom: 2px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
  .banner-text p {
    font-size: 0.8125rem;
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: var(--surface);
    border-top: 1px solid var(--border-light);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    transition: all 0.15s;
  }
  .action-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: var(--text);
  }
  .action-btn.toggle:hover {
    color: var(--primary-accent);
    border-color: var(--primary-accent-light);
    background: var(--primary-accent-light);
  }

  .action-buttons-right {
    display: flex;
    gap: 8px;
  }
  .action-btn.delete:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #ef4444;
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: 5rem 2rem;
    text-align: center;
    background: var(--surface);
    border: 2px dashed var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .empty-state svg {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
  .empty-state h2 {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text);
  }
  .empty-state p {
    font-size: 0.9rem;
    color: var(--text-muted);
    max-width: 500px;
  }

  /* Modal styling */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    animation: fadeIn 0.2s ease-out;
  }
  .glass-modal {
    background: var(--surface);
    width: 100%;
    max-width: 650px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
  }
  .modal-header {
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text);
  }
  .modal-header p {
    font-size: 0.8125rem;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: #f1f5f9;
    border: none;
    cursor: pointer;
    transition: 0.2s;
  }
  .close-btn:hover {
    background: #e2e8f0;
    transform: rotate(90deg);
  }

  .live-preview-section {
    background: #f8fafc;
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-light);
  }
  .live-preview-section label {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    display: block;
    margin-bottom: 8px;
  }
  .mobile-preview-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .mobile-banner-preview {
    width: 100%;
    max-width: 480px;
    height: 160px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .mobile-banner-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mobile-banner-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.25rem 1.25rem 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%);
    color: white;
  }
  .mobile-banner-text h4 {
    font-size: 1.05rem;
    font-weight: 800;
    margin-bottom: 2px;
  }
  .mobile-banner-text p {
    font-size: 0.75rem;
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mobile-indicators {
    position: absolute;
    bottom: 10px;
    right: 14px;
    display: flex;
    gap: 4px;
  }
  .mobile-indicators .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
  }
  .mobile-indicators .dot.active {
    background: white;
    width: 12px;
    border-radius: 99px;
  }

  form {
    padding: 2rem;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  .full {
    grid-column: span 2;
  }

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    transition: all 0.2s;
    font-size: 0.9rem;
    color: var(--text);
  }
  .input-field:focus {
    border-color: var(--primary-accent);
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .toggle-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .flex-align {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }
  .toggle-label {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #cbd5e1;
    transition: .3s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #10b981;
  }
  input:checked + .slider:before {
    transform: translateX(20px);
  }

  .modal-footer {
    padding-top: 1.5rem;
    margin-top: 1rem;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
  }
  .btn.text {
    background: transparent;
    color: var(--text-muted);
  }
  .btn.text:hover {
    color: var(--text);
    background: #f1f5f9;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .animate-in {
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* File upload elements */
  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .toggle-btn {
    background: #eff6ff;
    color: var(--primary-accent);
    border: none;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 800;
    cursor: pointer;
    text-transform: uppercase;
  }
  .toggle-btn:hover {
    background: var(--primary-accent);
    color: white;
  }

  .preview-area {
    height: 180px;
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    transition: 0.3s;
  }
  .preview-area.has-file {
    border-style: solid;
    border-color: var(--primary-accent);
  }
  .preview-area img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .upload-prompt {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--text-muted);
    pointer-events: none;
    transition: 0.3s;
    background: rgba(248, 250, 252, 0.85);
    text-align: center;
    padding: 1rem;
  }
  .upload-prompt span {
    font-weight: 700;
    font-size: 0.85rem;
  }
  .limit-hint {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--primary-accent);
    opacity: 0.8;
  }
  .upload-prompt.overlay {
    opacity: 0;
    background: rgba(15, 23, 42, 0.7);
    color: white;
    backdrop-filter: blur(4px);
  }
  .preview-area:hover .upload-prompt.overlay {
    opacity: 1;
  }
  .preview-area:hover:not(.has-file) {
    border-color: var(--primary-accent);
    background: #eff6ff;
  }
  
  .preview-area input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .upload-status {
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary-accent);
    font-weight: 700;
    font-size: 0.8125rem;
  }
</style>
