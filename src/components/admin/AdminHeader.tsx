"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AdminAuthService, AdminUserProfile } from "@/services/authService";
import {
  ShieldAlert,
  RefreshCw,
  Truck,
  UserCheck,
  Menu,
  Receipt,
  Download,
  LogOut,
  User,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { resetAllDemoData, allOrders, showToast } = useApp();
  const [currentUser, setCurrentUser] = useState<AdminUserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(AdminAuthService.getCurrentSession());
  }, []);

  const handleLogout = () => {
    AdminAuthService.logout();
    showToast("Sesión administrativa cerrada", "info");
    window.location.reload();
  };

  const pendingOrdersCount = allOrders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing"
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-lg tracking-tighter shadow-lg shadow-amber-950/40">
                JD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                    ADMINISTRACIÓN
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                    COMMAND CENTER
                  </span>
                </div>
                <p className="text-[11px] text-amber-400/90 font-bold hidden sm:block">
                  JD Distribuidora & Gourmet Ahumados • Planta Central
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active User Profile Badge */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-sm">{currentUser.avatar}</span>
                <div className="text-left">
                  <p className="font-bold text-white leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono leading-tight">{currentUser.username}</p>
                </div>
              </div>
            )}

            {/* Pending orders quick badge */}
            {pendingOrdersCount > 0 && (
              <Link
                href="/admin/pedidos"
                className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition-colors"
                title="Pedidos pendientes de atención"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{pendingOrdersCount} en curso</span>
              </Link>
            )}

            {/* POS Facturación shortcut */}
            <Link
              href="/admin/facturacion"
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Módulo de Facturación & POS"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Facturación POS</span>
              <span className="lg:hidden">POS</span>
            </Link>

            {/* Install Desktop App Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.__triggerPWAInstall) {
                  window.__triggerPWAInstall();
                }
              }}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-md shadow-brand-950/40"
              title="Instalar como software nativo de escritorio en Windows"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xl:inline">Instalar en Computador</span>
              <span className="xl:hidden">Instalar</span>
            </button>

            {/* Reset Demo button */}
            <button
              onClick={resetAllDemoData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Reiniciar datos de prueba"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              title="Cerrar sesión administrativa"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
