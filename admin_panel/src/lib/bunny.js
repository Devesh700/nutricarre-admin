const STORAGE_ZONE_NAME = 'nutricare';
const ACCESS_KEY = '73e4f16e-f345-4cd7-a3212ca4f067-b1ed-4c85';
const PULL_ZONE_URL = 'https://nutricare.b-cdn.net';
const BASE_URL = 'https://storage.bunnycdn.com';

/**
 * Uploads a file to Bunny.net Storage
 * @param {File} file - The file object to upload
 * @param {string} folder - 'thumbnails' or 'videos'
 * @returns {Promise<string>} - The public CDN URL of the uploaded file
 */
export async function uploadToBunny(file, folder = 'videos') {
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const url = `${BASE_URL}/${STORAGE_ZONE_NAME}/${folder}/${fileName}`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'AccessKey': ACCESS_KEY,
            'Content-Type': 'application/octet-stream'
        },
        body: file
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.Message || 'Failed to upload to Bunny.net');
    }

    // Return the public CDN URL
    return `${PULL_ZONE_URL}/${folder}/${fileName}`;
}
