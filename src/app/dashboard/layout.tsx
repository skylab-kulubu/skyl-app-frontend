'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, hasAccess } = useAuth();

  // Auth guard — Keycloak yüklendikten sonra kontrol et
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !hasAccess)) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, hasAccess, router]);

  // Sayfa değişince sidebar'ı kapat
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-indigo-400 animate-pulse text-lg tracking-widest">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          {/* Mobil hamburger */}
          <div className="lg:hidden flex items-center p-4 bg-gray-900 border-b border-white/5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white text-2xl"
              aria-label="Menüyü aç"
            >
              ☰
            </button>
            <span className="ml-4 text-white font-bold italic">SKYL.APP</span>
          </div>

          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}