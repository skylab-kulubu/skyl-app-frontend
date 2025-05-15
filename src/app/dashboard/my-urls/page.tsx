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
// --- ---

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
  }, [error]); // Run once on mount

  const someFunction = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const e = "example";
    // ...existing code...
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">My URLs</h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading your URLs...</p>}

      {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
               <tr>
                 <th scope="col" className="py-3 px-6">Alias</th>
                 <th scope="col" className="py-3 px-6">Original URL</th>
                 <th scope="col" className="py-3 px-6">Clicks</th>
                 <th scope="col" className="py-3 px-6">Expires</th>
                  {/* Removed 'Created By' as it's always the current user */}
                  {/* Add actions like Delete/Edit if needed */}
               </tr>
             </thead>
             <tbody>
              {myUrls.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                       You haven't created any URLs yet.
                    </td>
                 </tr>
               ) : (
                  myUrls.map((url) => (
                    <tr key={url.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                       <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                         <Link href={`https://skyl.app/${url.alias}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                           skyl.app/{url.alias}
                         </Link>
                       </td>
                       <td className="py-4 px-6 max-w-xs truncate" title={url.url}>
                         <a href={url.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{url.url}</a>
                       </td>
                       <td className="py-4 px-6">
                         {url.clickCount}
                       </td>
                       <td className="py-4 px-6">
                         {url.expirationDate ? new Date(url.expirationDate).toLocaleDateString() : 'Never'}
                       </td>
                    </tr>
                  ))
               )}
             </tbody>
          </table>
        </div>
      )}
      {/* Escaped single quote */}
      <p>It&apos;s an example.</p>
    </div>
  );
}