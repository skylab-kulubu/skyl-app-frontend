'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login, logout, hasAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && hasAccess) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasAccess, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-indigo-400 animate-pulse text-lg tracking-widest">Yükleniyor...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6 text-white">
      <div className="w-full max-w-md text-center space-y-10">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic">
            SKYL<span className="text-indigo-500">.APP</span>
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            E-Skylab Link Management
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl">
            <button
              onClick={login}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              e-skylab ile Giriş Yap
            </button>
          </div>
        ) : !hasAccess ? (
          <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/50">
            <p className="text-red-400">
              Giriş yetkiniz bulunmuyor.{' '}
              <span className="font-mono text-sm">skylapp:access</span> rolü eksik.
            </p>
            <button
              onClick={logout}
              className="mt-4 text-sm text-gray-400 hover:text-white underline"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="animate-pulse text-indigo-400">Yönlendiriliyorsunuz...</div>
        )}
      </div>
    </main>
  );
}