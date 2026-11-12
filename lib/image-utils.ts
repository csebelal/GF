/**
 * Determines whether a given image src should bypass Next.js /_next/image optimization.
 * - Vector SVGs, pre-compressed local WebP profile assets, and external URLs
 *   (including YouTube CDN thumbnails) load faster and cleanly without proxying
 *   through the single-threaded Node.js image optimizer.
 * - Raw uploaded local photos (/uploads/*.jpg, *.png) still use Next optimization.
 */
export function shouldUnoptimizeImage(src: string | undefined): boolean {
  if (!src) return true;
  const clean = src.split(/[?#]/)[0].toLowerCase();
  if (!src.startsWith("/")) return true;
  if (clean.endsWith(".svg")) return true;
  if (clean.startsWith("/images/") && clean.endsWith(".webp")) return true;
  return false;
}
