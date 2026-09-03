"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#051424] text-slate-100 flex flex-col font-sans selection:bg-[#4edea3] selection:text-[#051424]">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
