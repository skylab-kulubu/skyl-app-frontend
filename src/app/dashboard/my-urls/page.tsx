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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAlias, setEditAlias] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationTimeout, setNotificationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Bildirim gösterme fonksiyonu
  const showNotification = (msg: string) => {
    setNotification(msg);
    if (notificationTimeout) clearTimeout(notificationTimeout);
    const timeout = setTimeout(() => setNotification(null), 4000);
    setNotificationTimeout(timeout);
  };

  useEffect(() => {
    const fetchMyUrls = async () => {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('authToken');

      if (!token) {
        showNotification('Authentication token not found. Please log in again.');
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
            showNotification('Unauthorized. Please log in again.');
          } else {
            let errorMessage = `Failed to fetch your URLs: ${response.status}`;
             try {
               const errorData = await response.json();
               errorMessage = errorData?.message || errorData?.error || errorMessage;
             } catch(e) { /* Ignore */ }
             showNotification(errorMessage);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UrlData[] = await response.json();
        setMyUrls(data);

      } catch (err) {
        console.error('Error fetching user URLs:', err);
         if (!error) {
             showNotification(err instanceof Error ? err.message : 'An unknown error occurred while fetching your URLs.');
         }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyUrls();
  }, []); // Remove error from dependency array

  // Silme fonksiyonu
  const handleDelete = async (id: number) => {
    if (!confirm('Bu URL silinsin mi?')) return;
    setDeleteLoadingId(id);
    setError(null);
    const token = Cookies.get('authToken');
    try {
      const response = await fetch(`https://api.skyl.app/urls/deleteUrl/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        let errorMessage = `Silinemedi: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch(e) {}
        showNotification(errorMessage);
        return;
      }
      setMyUrls(urls => urls.filter(u => u.id !== id));
    } catch (err) {
      showNotification('Silme sırasında hata oluştu.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // Düzenleme başlat
  const startEdit = (url: UrlData) => {
    setEditingId(url.id);
    setEditAlias(url.alias);
    setEditUrl(url.url);
    setError(null);
  };

  // Düzenlemeyi iptal et
  const cancelEdit = () => {
    setEditingId(null);
    setEditAlias('');
    setEditUrl('');
  };

  // Kaydet (güncelle)
  const handleEditSave = async (id: number) => {
    setEditLoading(true);
    setError(null);
    const token = Cookies.get('authToken');
    try {
      const response = await fetch(`https://api.skyl.app/urls/updateUrl/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alias: editAlias, url: editUrl }),
      });
      if (!response.ok) {
        let errorMessage = `Güncellenemedi: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch(e) {}
        showNotification(errorMessage);
        return;
      }
      // Başarıyla güncellendi, listedeki veriyi güncelle
      setMyUrls(urls => urls.map(u => u.id === id ? { ...u, alias: editAlias, url: editUrl } : u));
      cancelEdit();
    } catch (err) {
      showNotification('Güncelleme sırasında hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  const someFunction = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const e = "example";
    // ...existing code...
  };

  return (
    <div className="p-2 sm:p-4">
      {/* Bildirim kutusu */}
      {notification && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 text-white font-bold">×</button>
        </div>
      )}
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">My URLs</h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading your URLs...</p>}

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
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {myUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                        You haven't created any URLs yet.
                      </td>
                    </tr>
                  ) : (
                    myUrls.map((url) => (
                      <tr key={url.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        {editingId === url.id ? (
                          <>
                            <td className="py-4 px-4 text-sm">
                              <input
                                className="border rounded px-2 py-1 w-full"
                                value={editAlias}
                                onChange={e => setEditAlias(e.target.value)}
                                disabled={editLoading}
                              />
                              <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                <input
                                  className="border rounded px-2 py-1 w-full mt-1"
                                  value={editUrl}
                                  onChange={e => setEditUrl(e.target.value)}
                                  disabled={editLoading}
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                              <input
                                className="border rounded px-2 py-1 w-full"
                                value={editUrl}
                                onChange={e => setEditUrl(e.target.value)}
                                disabled={editLoading}
                              />
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{url.clickCount}</td>
                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                              {url.expirationDate ? new Date(url.expirationDate).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="py-4 px-4 text-sm flex gap-2">
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleEditSave(url.id)}
                                disabled={editLoading}
                              >Kaydet</button>
                              <button
                                className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
                                onClick={cancelEdit}
                                disabled={editLoading}
                              >İptal</button>
                            </td>
                          </>
                        ) : (
                          <>
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
                            <td className="py-4 px-4 text-sm flex gap-2">
                              <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                onClick={() => startEdit(url)}
                                disabled={editLoading || deleteLoadingId === url.id}
                              >Düzenle</button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                onClick={() => handleDelete(url.id)}
                                disabled={deleteLoadingId === url.id || editLoading}
                              >{deleteLoadingId === url.id ? 'Siliniyor...' : 'Sil'}</button>
                            </td>
                          </>
                        )}
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