import { createHash } from 'node:crypto';

export const cloudinaryFolder = 'mht-marmoraria';

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

// Cloudinary signature: sorted "key=value" pairs joined by "&", followed by the API secret, hashed with SHA-1.
export function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export function createUploadSignature() {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: cloudinaryFolder, timestamp };
  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder: cloudinaryFolder,
    timestamp,
    signature: signCloudinaryParams(params, config.apiSecret),
  };
}

// Server-side upload of a generated image (data URL). Returns null when Cloudinary is not configured.
export async function uploadDataUrl(dataUrl: string, subfolder: string) {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const folder = `${cloudinaryFolder}/${subfolder}`;
  const timestamp = Math.round(Date.now() / 1000);
  const body = new URLSearchParams({
    file: dataUrl,
    folder,
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: signCloudinaryParams({ folder, timestamp }, config.apiSecret),
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Falha ao enviar imagem para o Cloudinary.');
  return data.secure_url as string;
}

export function isAllowedImageUrl(url: string) {
  if (url.startsWith('/assets/')) return true;
  const config = getCloudinaryConfig();
  return Boolean(config && url.startsWith(`https://res.cloudinary.com/${config.cloudName}/`));
}

// Best effort: a failure here must not block saving or deleting content.
export async function deleteCloudinaryMedia(media: Array<{ publicId: string; type?: 'image' | 'video' }>) {
  const config = getCloudinaryConfig();
  if (!config) return;

  await Promise.all(
    media
      .filter(({ publicId }) => publicId.startsWith(`${cloudinaryFolder}/`))
      .map(async ({ publicId, type }) => {
        const timestamp = Math.round(Date.now() / 1000);
        const body = new URLSearchParams({
          public_id: publicId,
          timestamp: String(timestamp),
          api_key: config.apiKey,
          signature: signCloudinaryParams({ public_id: publicId, timestamp }, config.apiSecret),
        });
        try {
          await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/${type === 'video' ? 'video' : 'image'}/destroy`, { method: 'POST', body });
        } catch (error) {
          console.error('Falha ao remover imagem do Cloudinary:', publicId, error);
        }
      }),
  );
}
