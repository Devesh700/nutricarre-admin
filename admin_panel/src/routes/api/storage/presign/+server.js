import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '$lib/server/r2';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    const { fileName, contentType, folder } = await request.json();

    if (!fileName || !contentType || !folder) {
      return json({ error: 'Missing required fields: fileName, contentType, folder' }, { status: 400 });
    }

    // Generate a unique filename to avoid collision, cleaning up characters
    const fileExtension = fileName.split('.').pop();
    const sanitizedOriginalName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/\s+/g, '_');
    
    const uniqueFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}_${sanitizedOriginalName}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned PUT URL that expires in 10 minutes
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    
    // Construct public CDN URL using the public R2 domain or custom domain
    let publicBaseUrl = env.CLOUDFLARE_PUBLIC_DEVELOPMENT_URL || env.PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || env.CLOUDFLARE_R2_PUBLIC_URL || `https://${bucketName}.r2.cloudflarestorage.com`;
    // Strip quotes from environment variable if present
    publicBaseUrl = publicBaseUrl.replace(/^["']|["']$/g, '');
    const publicUrl = `${publicBaseUrl}/${key}`;

    return json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return json({ error: err.message || 'Failed to generate presigned URL' }, { status: 500 });
  }
}
