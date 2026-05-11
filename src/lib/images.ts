
/**
 * Utility to resolve image paths.
 * Since images are now in /public/images, we return the absolute path.
 */
export function getImage(path: string | undefined): string {
  if (!path) return '';
  
  // If it's already a full URL, return it
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }

  // If it starts with /images/, it's already correct for the public folder
  if (path.startsWith('/images/')) {
    return path;
  }

  // If it's just a filename, prepend /images/
  if (!path.includes('/')) {
    return `/images/${path}`;
  }

  // Otherwise, ensure it starts with /
  return path.startsWith('/') ? path : `/${path}`;
}
