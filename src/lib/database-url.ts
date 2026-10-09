// pg already treats sslmode=require as verify-full; making it explicit silences its deprecation warning.
function withExplicitSsl(url: string) {
  return url.replace(/sslmode=(prefer|require|verify-ca)\b/, 'sslmode=verify-full');
}

export function getAppDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  return url ? withExplicitSsl(url) : undefined;
}

// Migrations need a direct connection. On Neon the direct host is the pooled one without "-pooler".
export function getMigrationDatabaseUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL?.replace('-pooler.', '.');
  return url ? withExplicitSsl(url) : undefined;
}
