'use client';

import { usePathname } from 'next/navigation';
import { SidebarAdmin } from '@/components/sidebar-admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarAdmin />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}