'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  role: string[];
  sub: string;
  iat: number;
  exp: number;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setIsAdmin(decoded.role.includes('ROLE_ADMIN'));
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false);
      }
    }
  }, []);

  const isActiveRoute = (route: string) => {
    return pathname === route;
  };

  const linkClass = (route: string) => `
    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
    ${isActiveRoute(route) 
      ? 'bg-indigo-600 text-white' 
      : 'text-gray-300 hover:bg-gray-700'
    }
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gray-800 z-30
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 min-h-screen
      `}>
        {/* Toggle Button - Mobile Only */}
        <button
          onClick={toggleSidebar}
          className="absolute right-0 translate-x-full top-4 lg:hidden bg-gray-800 p-2 rounded-r-lg text-gray-300 hover:bg-gray-700"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Sidebar Content */}
        <div className="p-5 space-y-2">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Skylapp</h1>
            <div className="h-0.5 bg-gray-700"/>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link href="/dashboard/my-urls" className={linkClass('/dashboard/my-urls')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>My URLs</span>
            </Link>

            <Link href="/dashboard/shorten-url" className={linkClass('/dashboard/shorten-url')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Shorten URL</span>
            </Link>

            {/* Only show Manage Users link if user is admin */}
            {isAdmin && (
              <Link href="/dashboard/manage-users" className={linkClass('/dashboard/manage-users')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Manage Users</span>
              </Link>
            )}

            <div className="pt-4 mt-4 border-t border-gray-700">
              <Link href="/logout" className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;