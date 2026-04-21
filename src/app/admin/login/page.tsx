'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginAction(password);
    setLoading(false);
    if (res.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(res.error || 'Error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-8 w-full max-w-md space-y-4"
        data-testid="admin-login-form"
      >
        <h1 className="text-2xl font-bold">Acceso Admin</h1>
        <p className="text-sm text-slate-500">
          Introduce la contraseña para gestionar el contenido del sitio.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full border rounded px-3 py-2"
          required
          autoFocus
          data-testid="admin-password-input"
        />
        {error && (
          <p className="text-red-600 text-sm" data-testid="admin-login-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded py-2 font-semibold hover:bg-slate-800 disabled:opacity-50"
          data-testid="admin-login-submit"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
