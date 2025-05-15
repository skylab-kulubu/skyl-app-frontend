// src/app/dashboard/shorten-url/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface ShortenResponse {
  id: number;
  url: string;
  alias: string;
  clickCount: number;
  createdBy: { id: number; firstName: string; lastName: string; /* ... */ };
  expirationDate: string | null;
}

export default function ShortenUrlPage() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newUrlAlias, setNewUrlAlias] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setNewUrlAlias(null);
    const token = Cookies.get('authToken');

    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    const aliasToSend = customAlias.trim() === '' ? null : customAlias.trim();

    try {
      const response = await fetch('https://api.skyl.app/shorten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: originalUrl,
          alias: aliasToSend,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to shorten URL: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message && typeof errorData.message === 'string' && errorData.message.includes('Alias already exists')) {
            errorMessage = `Error: The alias "${aliasToSend}" is already taken. Please choose another one or leave it blank for a random alias.`;
          } else {
            errorMessage = errorData?.message || errorData?.error || errorMessage;
          }
        } catch (e) { /* Ignore if body isn't JSON */ }
        throw new Error(errorMessage);
      }

      const data: ShortenResponse = await response.json();

      setSuccessMessage(`URL shortened successfully!`);
      setNewUrlAlias(data.alias);
      setOriginalUrl('');
      setCustomAlias('');

    } catch (err) {
      console.error('Error shortening URL:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Shorten a New URL</h1>

      {/* ADDED mx-auto HERE */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <div>
          <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Original URL <span className="text-red-500">*</span>
          </label>
          <input
            id="originalUrl"
            name="originalUrl"
            type="url"
            required
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            placeholder="https://example.com/very/long/url/to/shorten"
          />
        </div>

        <div>
          <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Alias (Optional)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
             <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">
               skyl.app/
             </span>
             <input
                id="customAlias"
                name="customAlias"
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/\s+/g, ''))}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="my-custom-link"
             />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave blank for a random alias. No spaces allowed.</p>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 p-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && newUrlAlias && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-3 rounded-md">
            {successMessage} Your new link is:
            <Link href={`https://skyl.app/${newUrlAlias}`} target="_blank" rel="noopener noreferrer" className="font-medium underline ml-1 hover:text-green-700 dark:hover:text-green-300">
              skyl.app/{newUrlAlias}
            </Link>
          </div>
        )}
         {successMessage && !newUrlAlias && (
           <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 p-3 rounded-md">
               {successMessage}
           </div>
         )}


        <div>
          <button
            type="submit"
            disabled={isLoading || !originalUrl}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>
      </form>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const e = "example";