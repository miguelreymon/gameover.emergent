import { readFile } from 'fs/promises';
import { join } from 'path';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const raw = await readFile(join(process.cwd(), 'src/lib/content.json'), 'utf-8');
  const content = JSON.parse(raw);

  return <AdminDashboard initialContent={content} />;
}
