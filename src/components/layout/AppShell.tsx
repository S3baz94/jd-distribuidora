"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingCartBar } from "@/components/layout/FloatingCartBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastContainer } from "@/components/common/ToastContainer";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isOperacion =
    pathname?.startsWith("/operacion") ||
    pathname?.startsWith("/domiciliario") ||
    pathname?.startsWith("/reparto");

  if (isAdmin || isOperacion) {
    return (
      <>
        <ToastContainer />
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-28 md:pb-12">
        {children}
      </main>
      <FloatingCartBar />
      <CartDrawer />
      <BottomNav />
    </>
  );
};
