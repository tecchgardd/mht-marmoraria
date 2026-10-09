// Env vars without which the portal cannot work at all.
export function missingPortalConfig() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if ((process.env.AUTH_SECRET || '').length < 32) missing.push('AUTH_SECRET (mín. 32 caracteres)');
  return missing;
}

export function missingCloudinaryConfig() {
  return ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((name) => !process.env[name]);
}
