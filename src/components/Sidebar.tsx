'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { isModerator, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', auth: true },
    { name: 'Linklerim', path: '/dashboard/my-urls', auth: true },
    { name: 'Link Kısalt', path: '/dashboard/shorten-url', auth: true },
    { name: 'Tüm Linkler', path: '/dashboard/manage-urls', auth: isModerator },
  ];

  const linkClass = (path: string) => `
    block p-3 rounded-xl transition 
    ${pathname === path ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}
  `;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900 z-50
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 w-64 border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <div className="mb-10 text-xl font-bold text-white italic flex justify-between items-center">
            SKYL.APP
            <button onClick={toggleSidebar} className="lg:hidden text-gray-400 text-2xl">
              ×
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map(
              (item) =>
                item.auth && (
                  <Link key={item.path} href={item.path} className={linkClass(item.path)}>
                    {item.name}
                  </Link>
                )
            )}
            <button
              onClick={logout}
              className="w-full text-left p-3 text-red-500 hover:bg-red-500/5 rounded-xl mt-10 transition"
            >
              Çıkış Yap
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}