import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readFile } from 'fs/promises';
import { join } from 'path';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gameover_admin')?.value;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login');
  }

  const raw = await readFile(join(process.cwd(), 'src/lib/content.json'), 'utf-8');
  const content = JSON.parse(raw);

  return <AdminDashboard initialContent={content} />;
}
