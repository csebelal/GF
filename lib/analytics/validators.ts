/**
 * Validates whether the given string is a standard Google Analytics or Google Tag Manager ID:
 * - Google Analytics 4 (GA4): G-XXXXXXXXXX
 * - Google Tag Manager (GTM): GTM-XXXXXXXX
 * - Legacy Universal Analytics (UA): UA-XXXXX-Y
 */
export function isValidGoogleAnalyticsId(id?: string): boolean {
  if (!id) return false;
  const clean = id.trim().toUpperCase();
  return /^(G-[A-Z0-9]+|GTM-[A-Z0-9]+|UA-\d+-\d+)$/i.test(clean);
}
