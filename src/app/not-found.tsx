
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground mb-6">Lo sentimos, no hemos podido encontrar la página que buscas.</p>
      <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
        Volver al inicio
      </Link>
    </div>
  );
}
