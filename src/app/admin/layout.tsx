import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAction } from './actions';

export const metadata = {
  title: 'Admin - Gameover',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('gameover_admin')?.value;
  const authed = !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-lg" data-testid="admin-title">
            Gameover Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline" data-testid="admin-to-site">
              Ver sitio →
            </Link>
            {authed && (
              <form
                action={async () => {
                  'use server';
                  await logoutAction();
                  redirect('/admin/login');
                }}
              >
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                  data-testid="admin-logout-btn"
                >
                  Salir
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
