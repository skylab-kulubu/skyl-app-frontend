'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

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

export default function ManageUrlsPage() {
  const { token } = useAuth();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    fetch('https://api.skyl.app/urls/getAllUrls', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const err = await res.json();
            msg = err?.message || err?.error || msg;
          } catch { /* ignore */ }
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data: UrlData[]) => setUrls(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Tüm Linkler</h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>}
      {error && <p className="text-red-600 dark:text-red-400">Hata: {error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="py-3 px-6">Alias</th>
                <th className="py-3 px-6">Orijinal URL</th>
                <th className="py-3 px-6">Tıklama</th>
                <th className="py-3 px-6">Oluşturan</th>
                <th className="py-3 px-6">Son Kullanma</th>
              </tr>
            </thead>
            <tbody>
              {urls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    Hiç URL bulunamadı.
                  </td>
                </tr>
              ) : (
                urls.map((url) => (
                  <tr
                    key={url.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <a
                        href={`https://skyl.app/${url.alias}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline font-mono"
                      >
                        skyl.app/{url.alias}
                      </a>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate" title={url.url}>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {url.url}
                      </a>
                    </td>
                    <td className="py-4 px-6">{url.clickCount}</td>
                    <td className="py-4 px-6">
                      {url.createdBy
                        ? `${url.createdBy.firstName} ${url.createdBy.lastName}`
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      {url.expirationDate
                        ? new Date(url.expirationDate).toLocaleDateString()
                        : 'Hiçbir zaman'}
                    </td>
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