'use server';

import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

const CONTENT_PATH = join(process.cwd(), 'src/lib/content.json');
const IMAGES_DIR = join(process.cwd(), 'public/images');

export async function loginAction(_password: string): Promise<{ success: boolean; error?: string }> {
  // Auth removed - direct admin access
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  // Auth removed - no-op
}

export async function getContentAction(): Promise<any> {
  const raw = await readFile(CONTENT_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function saveContentAction(content: any): Promise<{ success: boolean; error?: string }> {
  try {
    // Sync featured product into homePage.productSection.product so the home/gallery
    // and the product page stay consistent. The source of truth is `products[]`
    // (what the admin edits); we just mirror it to the legacy homepage block.
    // Note: actual data lives under `siteContent` in the JSON wrapper.
    try {
      const sc = content?.siteContent || content;
      const slug: string | undefined = sc?.featuredProductSlug;
      const products: any[] = Array.isArray(sc?.products) ? sc.products : [];
      const featured = slug ? products.find((p) => p?.slug === slug) : products[0];
      if (featured && sc?.homePage?.productSection) {
        // Preserve the existing `id` of the homepage block (some downstream code may rely on it)
        const existingId = sc.homePage.productSection.product?.id;
        // Deep clone the featured product to avoid mutating the source
        const cloned = JSON.parse(JSON.stringify(featured));
        if (existingId) cloned.id = existingId;
        sc.homePage.productSection.product = cloned;
      }
    } catch (syncErr) {
      console.warn('Featured product sync skipped:', syncErr);
    }

    const pretty = JSON.stringify(content, null, 2);
    await writeFile(CONTENT_PATH, pretty, 'utf-8');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error al guardar' };
  }
}

export async function listImagesAction(): Promise<string[]> {
  try {
    const files = await readdir(IMAGES_DIR);
    return files
      .filter((f) => /\.(png|jpe?g|webp|gif|avif|svg|mp4|webm|mov|m4v)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'Sin archivo' };
    const rawName = (formData.get('name') as string | null) || file.name;
    const safe = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    await mkdir(IMAGES_DIR, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    const target = join(IMAGES_DIR, safe);
    await writeFile(target, buf);
    return { success: true, path: `/images/${safe}` };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error al subir' };
  }
}
