import Link from 'next/link';

export const metadata = {
  title: 'Admin - Gameover',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
