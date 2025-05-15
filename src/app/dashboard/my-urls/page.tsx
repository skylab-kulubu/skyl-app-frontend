// src/app/dashboard/my-urls/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
// You can potentially create a reusable UrlTable component later
// import UrlTable from '@/components/UrlTable';

// --- Reuse or import interfaces from manage-urls ---
interface User {
  id: number;
  firstName: string;
  lastName: string;
}

interface UrlData {
  id: number;
  url: string;
  alias: string;
  clickCount: number;
  createdBy: User;
  expirationDate: string | null;
}
// ---

export default function MyUrlsPage() {
  const [myUrls, setMyUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyUrls = async () => {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('authToken');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://api.skyl.app/urls/getUserUrls', { // Changed Endpoint
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
             setError('Unauthorized. Please log in again.');
          } else {
            let errorMessage = `Failed to fetch your URLs: ${response.status}`;
             try {
               const errorData = await response.json();
               errorMessage = errorData?.message || errorData?.error || errorMessage;
             } catch(e) { /* Ignore */ }
             setError(errorMessage);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UrlData[] = await response.json();
        setMyUrls(data);

      } catch (err) {
        console.error('Error fetching user URLs:', err);
         if (!error) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching your URLs.');
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyUrls();
  }, []); // Remove error from dependency array

  const someFunction = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const e = "example";
    // ...existing code...
  };

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">My URLs</h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading your URLs...</p>}
      {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Alias</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">URL</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {myUrls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        You haven't created any URLs yet.
                      </td>
                    </tr>
                  ) : (
                    myUrls.map((url) => (
                      <tr key={url.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="py-4 px-4 text-sm">
                          <Link href={`https://skyl.app/${url.alias}`} 
                                target="_blank" 
                                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            {url.alias}
                          </Link>
                          <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {url.url}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          <div className="max-w-xs truncate" title={url.url}>
                            {url.url}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {url.clickCount}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {url.expirationDate ? new Date(url.expirationDate).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}