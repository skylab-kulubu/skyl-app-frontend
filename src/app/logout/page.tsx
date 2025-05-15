// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Make sure Cookies is imported if not already

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear the cookie on the client side immediately
    Cookies.remove('authToken', { path: '/' }); // Ensure path matches setting

    // Set a timeout to redirect after 1 second (1000 milliseconds)
    const timer = setTimeout(() => {
      router.replace('/'); // Redirect to the login page
    }, 1000); // 1 second delay

    // Cleanup the timer if the component unmounts before the timeout
    return () => clearTimeout(timer);
  }, [router]); // Dependency array includes router

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          You have been successfully logged out.
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to the login page...
        </p>
        {/* Optional: Add a small spinner or progress indicator */}
      </div>
    </div>
  );
}