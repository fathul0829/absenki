import Sidebar from '@/components/Sidebar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto min-h-screen">
        {children}
      </div>
    </div>
  );
}
