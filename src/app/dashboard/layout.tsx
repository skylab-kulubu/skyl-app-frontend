// src/app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar'; // Adjust path if needed

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-screen overflow-hidden">
      {/* Include shared UI here e.g. a sidebar */}
      <Sidebar />

      {/* Main content area that scrolls */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </section>
  );
}