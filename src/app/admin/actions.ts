'use server';

import { writeFile, readFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const CONTENT_PATH = join(process.cwd(), 'src/lib/content.json');
const IMAGES_DIR = join(process.cwd(), 'public/images');
const AUTH_COOKIE = 'gameover_admin';

export async function loginAction(password: string): Promise<{ success: boolean; error?: string }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { success: false, error: 'ADMIN_PASSWORD no configurada en .env' };
  }
  if (password !== expected) {
    return { success: false, error: 'Contraseña incorrecta' };
  }
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

async function requireAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return token === process.env.ADMIN_PASSWORD && !!process.env.ADMIN_PASSWORD;
}

export async function getContentAction(): Promise<any> {
  if (!(await requireAuth())) throw new Error('No autorizado');
  const raw = await readFile(CONTENT_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function saveContentAction(content: any): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' };
  try {
    const pretty = JSON.stringify(content, null, 2);
    await writeFile(CONTENT_PATH, pretty, 'utf-8');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error al guardar' };
  }
}

export async function listImagesAction(): Promise<string[]> {
  if (!(await requireAuth())) return [];
  try {
    const files = await readdir(IMAGES_DIR);
    return files
      .filter((f) => /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!(await requireAuth())) return { success: false, error: 'No autorizado' };
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
