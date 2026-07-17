/**
 * Uploads a file to Cloudflare R2 via SvelteKit backend presigned URL
 * @param {File} file - The file object to upload
 * @param {string} folder - 'thumbnails' or 'videos'
 * @param {function} [onProgress] - Optional upload progress callback (0-100)
 * @returns {Promise<string>} - The public CDN URL of the uploaded file
 */
export async function uploadToR2(file, folder = 'videos', onProgress = null) {
  // 1. Fetch the presigned upload URL from our API endpoint
  const response = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      folder: folder
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to retrieve presigned URL');
  }

  const { uploadUrl, publicUrl } = await response.json();

  // 2. Perform the upload to Cloudflare R2
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}
