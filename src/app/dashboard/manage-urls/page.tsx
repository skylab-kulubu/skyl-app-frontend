// src/app/dashboard/manage-urls/page.tsx
'use client'; // Required for useState, useEffect, Cookies

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// Define interfaces for the data structure
interface User {
  id: number;
  firstName: string;
  lastName: string;
  // Add other user fields if needed
}

interface UrlData {
  id: number;
  url: string;
  alias: string;
  clickCount: number;
  createdBy: User;
  expirationDate: string | null; // Assuming it can be a string or null
}

export default function ManageUrlsPage() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('authToken');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        // Optionally redirect to login
        // import { useRouter } from 'next/navigation';
        // const router = useRouter(); router.push('/');
        return;
      }

      try {
        const response = await fetch('https://api.skyl.app/urls/getAllUrls', {
          method: 'GET', // GET is default, but good to be explicit
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // Usually not needed for GET, but doesn't hurt
            'Accept': 'application/json', // Tell the server we expect JSON
          },
        });

        if (!response.ok) {
          // Handle specific errors like 401 Unauthorized or 403 Forbidden
          if (response.status === 401 || response.status === 403) {
             setError('Unauthorized or Forbidden. You might not have permission or need to log in again.');
          } else {
            // Try to get error message from response body
            let errorMessage = `Failed to fetch URLs: ${response.status}`;
             try {
               const errorData = await response.json();
               errorMessage = errorData?.message || errorData?.error || errorMessage;
             } catch(e) { /* Ignore if body isn't JSON */ }
             setError(errorMessage);
          }
          throw new Error(`HTTP error! status: ${response.status}`); // Still throw to stop execution
        }

        const data: UrlData[] = await response.json();
        setUrls(data);

      } catch (err) {
        console.error('Error fetching URLs:', err);
        // Error state might already be set from response check
         if (!error) { // Set a generic error if none was set previously
             setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching URLs.');
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, [error]); // Re-run effect only if the `error` state changes (prevents potential infinite loop if error state is updated inside) - or keep empty [] if you only want it to run once on mount.

  const someFunction = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const e = "example";
    // ...existing code...
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Manage All URLs</h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading URLs...</p>}

      {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="py-3 px-6">Alias</th>
                <th scope="col" className="py-3 px-6">Original URL</th>
                <th scope="col" className="py-3 px-6">Clicks</th>
                <th scope="col" className="py-3 px-6">Created By</th>
                <th scope="col" className="py-3 px-6">Expires</th>
                 {/* Add more columns like Actions if needed */}
              </tr>
            </thead>
            <tbody>
              {urls.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                      No URLs found.
                   </td>
                </tr>
              ) : (
                 urls.map((url) => (
                    <tr key={url.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                         {/* Optional: Link to the shortened URL if desired */}
                         {/* <a href={`https://your-domain.com/${url.alias}`} target="_blank" rel="noopener noreferrer">{url.alias}</a> */}
                         {url.alias}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={url.url}>
                        <a href={url.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{url.url}</a>
                      </td>
                      <td className="py-4 px-6">
                        {url.clickCount}
                      </td>
                      <td className="py-4 px-6">
                        {url.createdBy ? `${url.createdBy.firstName} ${url.createdBy.lastName}` : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        {url.expirationDate ? new Date(url.expirationDate).toLocaleDateString() : 'Never'}
                      </td>
                       {/* Add Action buttons cell if needed */}
                    </tr>
                 ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}