// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode, JwtPayload as DecodedJwtPayload } from 'jwt-decode'; // Renamed imported type

// Define an interface for the expected JWT payload structure
interface JwtPayload extends DecodedJwtPayload { // Extend the base type if needed
  role: string[];
  sub: string;
  // iat and exp are usually included in DecodedJwtPayload
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null); // State to hold user email

  useEffect(() => {
    const token = Cookies.get('authToken');
    let isAdminUser = false;
    let email: string | null = null;

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.role && decoded.role.includes('ROLE_ADMIN')) {
          isAdminUser = true;
        }
        email = decoded.sub; // Get email from 'sub' claim

        // Optional: Check token expiry
        // const now = Date.now() / 1000;
        // if (decoded.exp && decoded.exp < now) {
        //   console.warn('Token expired');
        //   // Trigger logout or refresh logic here
        //   handleLogout(); // Example: Force logout if expired
        //   return; // Stop further processing if logging out
        // }

      } catch (error) {
        console.error('Failed to decode token:', error);
        // Optionally clear bad token and redirect
        // Cookies.remove('authToken', { path: '/' });
        // router.push('/');
      }
    } else {
        // No token found, maybe redirect to login? Or handle gracefully.
        // For now, we just proceed, links will be limited.
        console.log("No auth token found in cookies.");
    }

    setIsAdmin(isAdminUser);
    setUserEmail(email); // Set the email state
    setIsLoading(false);
  }, [router]); // Add router to dependency array as it's used indirectly (handleLogout)

  const handleLogout = () => {
    Cookies.remove('authToken', { path: '/' }); // Ensure path matches where it was set
    // Redirect to an intermediate page first for better UX
    router.push('/logout');
    // router.push('/'); // Or redirect directly to login
  };

  const navLinks = [
    { name: 'Manage URLs', href: '/dashboard/manage-urls', adminOnly: true },
    { name: 'Manage Users', href: '/dashboard/manage-users', adminOnly: true },
    { name: 'Shorten URL', href: '/dashboard/shorten-url', adminOnly: false },
    { name: 'My URLs', href: '/dashboard/my-urls', adminOnly: false },
  ];

  const filteredLinks = isLoading
    ? []
    : navLinks.filter(link => !link.adminOnly || isAdmin);

  const isActive = (href: string) => pathname === href;

  if (isLoading) {
      return (
          <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
              {/* Loading Skeleton */}
              <div className="mb-10 text-xl font-semibold">Skylapp</div>
              <div className="space-y-2 flex-grow">
                  <div className="animate-pulse bg-gray-700 h-6 rounded w-3/4"></div>
                  <div className="animate-pulse bg-gray-700 h-6 rounded w-1/2"></div>
                  <div className="animate-pulse bg-gray-700 h-6 rounded w-3/4"></div>
                  <div className="animate-pulse bg-gray-700 h-6 rounded w-1/2"></div>
              </div>
              <div className="mt-auto animate-pulse bg-gray-700 h-8 rounded w-full"></div>
          </div>
      );
  }

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <div className="mb-10 text-xl font-semibold">Skylapp</div>
      <nav className="flex-grow">
        {filteredLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 ${
              isActive(link.href) ? 'bg-gray-700' : ''
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* User Info and Logout Button */}
      <div className="mt-auto border-t border-gray-700 pt-4">
         {userEmail && (
           <p className="text-sm text-gray-400 mb-2 truncate" title={userEmail}>
             Logged in as: {userEmail}
           </p>
         )}
         <button
           onClick={handleLogout}
           className="w-full py-2 px-4 rounded transition duration-200 bg-red-600 hover:bg-red-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
         >
           Logout
         </button>
      </div>
    </div>
  );
}