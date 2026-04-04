'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UrlData {
  id: number;
  url: string;
  alias: string;
  clickCount: number;
  createdByUserId: string | null;
  expirationDate: string | null;
}

interface UserProfile {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string;
  university?: string;
  department?: string;
  skyNumber?: string;
  [key: string]: any;
}

export default function ManageUrlsPage() {
  const { token, isModerator } = useAuth();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Kullanıcı Modalı State'leri
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // İşlem State'leri
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAlias, setEditAlias] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  
  // QR Modal State'leri
  const [qrModalUrl, setQrModalUrl] = useState<UrlData | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImgUrl, setQrImgUrl] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

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

  const handleUserClick = async (userId: string) => {
    setIsUserModalOpen(true);
    setIsUserLoading(true);
    setUserError(null);
    setSelectedUser(null);

    try {
      const res = await fetch(`https://api.yildizskylab.com/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Kullanıcı bilgileri alınamadı (Hata: ${res.status})`);
      const responseData = await res.json();
      
      if (responseData.success && responseData.data) {
        setSelectedUser(responseData.data);
      } else {
        throw new Error("Kullanıcı verisi formatı geçersiz.");
      }
    } catch (err: any) {
      setUserError(err.message);
    } finally {
      setIsUserLoading(false);
    }
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
    setUserError(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu URL sistemden tamamen silinsin mi?')) return;
    setDeleteLoadingId(id);
    try {
      const res = await fetch(`https://api.skyl.app/urls/deleteUrl/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      showNotification('URL başarıyla silindi.');
    } catch (err) {
      showNotification('Silme sırasında hata oluştu.');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const startEdit = (url: UrlData) => {
    setEditingId(url.id);
    setEditAlias(url.alias);
    setEditUrl(url.url);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAlias('');
    setEditUrl('');
  };

  const handleEditSave = async (id: number) => {
    setEditLoading(true);
    try {
      const res = await fetch(`https://api.skyl.app/urls/updateUrl/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ alias: editAlias, url: editUrl }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUrls((prev) =>
        prev.map((u) => (u.id === id ? { ...u, alias: editAlias, url: editUrl } : u))
      );
      showNotification('URL başarıyla güncellendi.');
      cancelEdit();
    } catch (err) {
      showNotification('Güncelleme sırasında hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  const openQrModal = async (url: UrlData) => {
    setQrModalUrl(url);
    setQrLoading(true);
    setQrImgUrl(null);
    try {
      const qrApiUrl = `https://api.skyl.app/api/qrCodes/generateQRCodeWithLogo?url=${encodeURIComponent(`https://skyl.app/${url.alias}`)}&width=500&height=500`;
      const res = await fetch(qrApiUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'image/png' },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setQrImgUrl(URL.createObjectURL(blob));
    } catch {
      showNotification('QR kod alınamadı.');
    } finally {
      setQrLoading(false);
    }
  };

  const closeQrModal = () => {
    setQrModalUrl(null);
    setQrImgUrl(null);
  };

  const downloadQr = () => {
    if (!qrImgUrl) return;
    const link = document.createElement('a');
    link.href = qrImgUrl;
    link.download = `${qrModalUrl?.alias || 'qr'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-2 sm:p-4 relative">
      {/* Bildirim */}
      {notification && (
        <div className="fixed top-4 left-1/2 z-[60] -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="ml-2 font-bold text-xl hover:text-gray-200">×</button>
        </div>
      )}

      {/* KULLANICI DETAY MODALI */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
            <button onClick={closeUserModal} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">×</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Kullanıcı Profili</h2>
            
            {isUserLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : userError ? (
              <div className="text-red-500 bg-red-100 p-3 rounded-lg text-sm">{userError}</div>
            ) : selectedUser ? (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ad Soyad</p>
                  <p className="font-semibold text-base">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                {selectedUser.email && (<div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">E-posta</p><p className="font-medium break-all">{selectedUser.email}</p></div>)}
                {selectedUser.skyNumber && (<div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sky Numarası</p><p className="font-mono text-indigo-500 font-bold">{selectedUser.skyNumber}</p></div>)}
                {selectedUser.university && (<div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Üniversite</p><p>{selectedUser.university}</p></div>)}
                {selectedUser.department && (<div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bölüm</p><p>{selectedUser.department}</p></div>)}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* QR MODALI */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
            <button onClick={closeQrModal} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">×</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">QR Kod</h2>
            {qrLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {qrImgUrl && <img src={qrImgUrl} alt="QR Kod" className="mx-auto mb-4 w-48 h-48 sm:w-64 sm:h-64 bg-white p-2 rounded-xl shadow-inner" />}
                <div className="mb-4 text-sm text-gray-700 dark:text-gray-200 space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg overflow-hidden">
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Alias:</span> {qrModalUrl.alias}</div>
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">URL:</span> <a href={qrModalUrl.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline break-all">{qrModalUrl.url}</a></div>
                </div>
                <button onClick={downloadQr} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-xl w-full transition-colors shadow-md">
                  QR Kodunu İndir
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Tüm Linkler</h1>
        {isModerator && (
          <span className="self-start sm:self-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-indigo-900 dark:text-indigo-300 border border-indigo-400">
            Moderatör Modu
          </span>
        )}
      </div>

      {isLoading && <p className="text-gray-600 dark:text-gray-400 animate-pulse text-sm sm:text-base">Linkler yükleniyor...</p>}
      {error && <p className="text-red-600 dark:text-red-400 bg-red-100 p-3 rounded text-sm sm:text-base">Hata: {error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto relative shadow-md rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="py-3 px-3 sm:px-6">Alias</th>
                <th className="py-3 px-6 hidden sm:table-cell">Orijinal URL</th>
                <th className="py-3 px-3 sm:px-6">Tıklama</th>
                <th className="py-3 px-3 sm:px-6">Oluşturan</th>
                <th className="py-3 px-6 hidden md:table-cell">Son Kullanma</th>
                {isModerator && <th className="py-3 px-3 sm:px-6">İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {urls.length === 0 ? (
                <tr>
                  <td colSpan={isModerator ? 6 : 5} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                    Hiç URL bulunamadı.
                  </td>
                </tr>
              ) : (
                urls.map((url) => 
                  editingId === url.id ? (
                    // DÜZENLEME MODU
                    <tr key={url.id} className="bg-indigo-50/50 dark:bg-indigo-900/20 border-b dark:border-gray-700">
                      <td className="py-3 px-3 sm:px-6">
                        <input
                          className="border rounded px-2 py-1.5 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm"
                          value={editAlias}
                          onChange={(e) => setEditAlias(e.target.value)}
                          disabled={editLoading}
                        />
                      </td>
                      <td className="py-3 px-6 hidden sm:table-cell">
                        <input
                          className="border rounded px-2 py-1.5 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          disabled={editLoading}
                        />
                      </td>
                      <td className="py-3 px-3 sm:px-6 font-semibold">{url.clickCount}</td>
                      <td className="py-3 px-3 sm:px-6 text-xs sm:text-sm">
                        {url.createdByUserId ? 'Kayıtlı Kullanıcı' : 'N/A'}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        {url.expirationDate ? new Date(url.expirationDate).toLocaleDateString() : 'Süresiz'}
                      </td>
                      {isModerator && (
                        <td className="py-3 px-3 sm:px-6 flex flex-wrap gap-1 sm:gap-2">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors w-full sm:w-auto"
                            onClick={() => handleEditSave(url.id)}
                            disabled={editLoading}
                          >
                            Kaydet
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium transition-colors w-full sm:w-auto"
                            onClick={cancelEdit}
                            disabled={editLoading}
                          >
                            İptal
                          </button>
                        </td>
                      )}
                    </tr>
                  ) : (
                    // NORMAL GÖRÜNÜM MODU
                    <tr
                      key={url.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-6 font-medium text-gray-900 dark:text-white">
                        <a
                          href={`https://skyl.app/${url.alias}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline font-mono text-sm"
                        >
                          skyl.app/{url.alias}
                        </a>
                        {/* Mobilde görünecek mini orijinal URL */}
                        <div className="sm:hidden text-[10px] text-gray-400 mt-1 truncate max-w-[120px]">
                          {url.url}
                        </div>
                      </td>
                      <td className="py-3 px-6 hidden sm:table-cell max-w-xs truncate" title={url.url}>
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-gray-600 dark:text-gray-300 text-sm"
                        >
                          {url.url}
                        </a>
                      </td>
                      <td className="py-3 px-3 sm:px-6 font-semibold">{url.clickCount}</td>
                      <td className="py-3 px-3 sm:px-6">
                        {url.createdByUserId ? (
                          <button
                            onClick={() => handleUserClick(url.createdByUserId as string)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-none bg-blue-50 dark:bg-blue-900/30 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs flex items-center justify-center whitespace-nowrap"
                          >
                            👤 Profili Gör
                          </button>
                        ) : (
                          <span className="text-gray-400 italic text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-6 hidden md:table-cell">
                        {url.expirationDate
                          ? new Date(url.expirationDate).toLocaleDateString()
                          : <span className="text-gray-400">Süresiz</span>}
                      </td>
                      {isModerator && (
                        <td className="py-3 px-3 sm:px-6">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors shadow-sm flex-1 sm:flex-none text-center"
                              onClick={() => startEdit(url)}
                              disabled={editLoading || deleteLoadingId === url.id}
                            >
                              Düzenle
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors shadow-sm flex-1 sm:flex-none text-center"
                              onClick={() => handleDelete(url.id)}
                              disabled={deleteLoadingId === url.id || editLoading}
                            >
                              {deleteLoadingId === url.id ? '...' : 'Sil'}
                            </button>
                            <button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors shadow-sm w-full sm:w-auto text-center"
                              onClick={() => openQrModal(url)}
                              disabled={editLoading || deleteLoadingId === url.id}
                            >
                              QR
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}